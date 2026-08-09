/* =========================================================
   /api/pfp — Smol Tod PFP generator (fal.ai + nano-banana)

   POST /api/pfp   { prompt }        -> { requestId }
   GET  /api/pfp?id=<requestId>      -> { status, image?, error? }

   The fal key never reaches the browser. We use fal's QUEUE api
   rather than the synchronous one so every function call returns in
   well under a second — image edits take 5-20s, which would blow
   past the serverless timeout if we waited inline.
   ========================================================= */

// queue namespace is the app id WITHOUT the trailing route segment
const FAL_APP = 'fal-ai/nano-banana';
const FAL_ENDPOINT = 'fal-ai/nano-banana/edit';

const MAX_PROMPT = 200;

/* How many candidates to ask fal for per generation. The client scores them
   against the original and keeps the one that drifted least, which is the
   real defence against the model redrawing the face. 2 is a good balance —
   set PFP_CANDIDATES=1 to halve the cost and lose that safety net. */
const CANDIDATES = Math.min(4, Math.max(1, parseInt(process.env.PFP_CANDIDATES, 10) || 2));

/* Locks the character down so ONLY accessories change.
   Every clause here is a failure we actually saw: nano-banana likes to
   thicken the mouth into a filled band, round off the half-lidded eyes,
   and generally "improve" the drawing. Naming each feature explicitly is
   what stops it. If it ever starts drifting again, tighten these two
   strings — they are the knob. */
const STYLE_LOCK = [
  'You are placing accessories on top of an existing cartoon drawing. You are NOT redrawing it.',
  'Treat the supplied image as a locked background layer that must be reproduced exactly, pixel for pixel.',
  '',
  'The character must come out IDENTICAL to the input in every respect:',
  '- the same wide, low, flat green toad head that sits directly on the body with no neck,',
  '  overlapping the top of the blue garment along the same curve;',
  '- the same two large almond-shaped white eyes with heavy drooping upper eyelids,',
  '  giving the same half-closed, smug, sleepy look, with the same big black pupils',
  '  looking in the same direction and the same small white highlight dot in each;',
  '- the mouth is a SINGLE THIN DARK LINE, a subtle closed smirk curving upward at one end.',
  '  It must stay a thin line of the exact same weight, length, curve and colour.',
  '  Never thicken it, never fill it in, never make it a brown or dark band, never widen it,',
  '  never open it, never add lips, teeth or a tongue, never turn it into a frown or a grin;',
  '- the same plain blue oversized garment with the same rounded-square shape,',
  '  the same single sleeve on the left ending in the same small green three-fingered hand,',
  '  the same small green sliver at the right edge, and the same thin curved crease line;',
  '- the same two orange-brown oval feet in the same positions;',
  '- the same flat cel-shaded colours with no gradients or shading, the same bold black outlines',
  '  of the same weight, the same character size and position on the canvas,',
  '  and the same plain off-white background.',
  '',
  'Do not move, rotate, mirror, crop, zoom, rescale, restyle, re-illustrate, re-shade,',
  'clean up or otherwise "improve" any part of the character. Do not change its proportions.',
  '',
  'The ONLY thing you may add is this, drawn over the artwork like a sticker:'
].join(' ');

const STYLE_TAIL = [
  'Draw the new items in the same flat cartoon style, with the same bold black outlines and',
  'the same flat colours, so they look like they were part of the original drawing.',
  'They may overlap the character where such an item naturally sits — a hat covers the top of',
  'the head, glasses sit over the eyes, a chain hangs over the garment.',
  'Every pixel that is not covered by one of these new items must remain exactly as it was',
  'in the input image. The face underneath, and especially the thin line mouth, stays untouched.'
].join(' ');

/* ---------- crude best-effort rate limit -----------------
   In-memory, so it only sees traffic that lands on the same warm
   instance. It stops one person hammering the button; it is NOT a
   real abuse defence. See the README before going loud.
   -------------------------------------------------------- */
const WINDOW_MS = 5 * 60 * 1000;
const MAX_PER_WINDOW = 8;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);

  // keep the map from growing forever on a long-lived instance
  if (hits.size > 500) {
    for (const [k, v] of hits) {
      if (!v.length || now - v[v.length - 1] > WINDOW_MS) hits.delete(k);
    }
  }
  return false;
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function baseImageUrl(req) {
  if (process.env.PFP_BASE_IMAGE) return process.env.PFP_BASE_IMAGE;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${host}/assets/smol-tod.jpg`;
}

function falHeaders(key) {
  return { Authorization: `Key ${key}`, 'Content-Type': 'application/json' };
}

module.exports = async function handler(req, res) {
  const key = process.env.FAL_KEY;
  if (!key) {
    return res.status(500).json({
      error: 'The generator is not configured yet — FAL_KEY is missing on the server.'
    });
  }

  try {
    if (req.method === 'POST') return await submit(req, res, key);
    if (req.method === 'GET') return await poll(req, res, key);
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (err) {
    console.error('[pfp]', err);
    return res.status(502).json({ error: 'The toad stylist is unreachable. Try again in a moment.' });
  }
};

/* ---------------------------------------------------------
   POST — hand the job to fal, return the request id
   --------------------------------------------------------- */
async function submit(req, res, key) {
  if (rateLimited(clientIp(req))) {
    return res.status(429).json({
      error: 'Easy there. Tod needs a minute between outfits — try again in a few.'
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const raw = typeof body?.prompt === 'string' ? body.prompt : '';
  const prompt = raw.replace(/\s+/g, ' ').trim();

  if (!prompt) return res.status(400).json({ error: 'Tell him what to wear first.' });
  if (prompt.length > MAX_PROMPT) {
    return res.status(400).json({ error: `Keep it under ${MAX_PROMPT} characters.` });
  }

  const falRes = await fetch(`https://queue.fal.run/${FAL_ENDPOINT}`, {
    method: 'POST',
    headers: falHeaders(key),
    body: JSON.stringify({
      prompt: `${STYLE_LOCK} ${prompt}. ${STYLE_TAIL}`,
      image_urls: [baseImageUrl(req)],
      num_images: CANDIDATES,
      output_format: 'jpeg'
    })
  });

  const data = await falRes.json().catch(() => ({}));

  if (!falRes.ok) {
    console.error('[pfp] submit failed', falRes.status, data);
    const msg = falRes.status === 401 || falRes.status === 403
      ? 'The generator key was rejected.'
      : 'The stylist refused that one. Try different wording.';
    return res.status(502).json({ error: msg });
  }

  if (!data.request_id) {
    console.error('[pfp] no request_id', data);
    return res.status(502).json({ error: 'Got an unexpected answer from the stylist.' });
  }

  return res.status(202).json({ requestId: data.request_id });
}

/* ---------------------------------------------------------
   GET — check the job; when it is done, inline the image so the
   browser never has to talk to fal's CDN (no CORS, and the
   download button just works)
   --------------------------------------------------------- */
async function poll(req, res, key) {
  const id = typeof req.query?.id === 'string' ? req.query.id.trim() : '';
  if (!/^[A-Za-z0-9-]{6,80}$/.test(id)) {
    return res.status(400).json({ error: 'Bad request id.' });
  }

  const statusRes = await fetch(
    `https://queue.fal.run/${FAL_APP}/requests/${id}/status`,
    { headers: falHeaders(key) }
  );

  if (statusRes.status === 404) {
    return res.status(404).json({ status: 'ERROR', error: 'That job has expired.' });
  }
  if (!statusRes.ok) {
    console.error('[pfp] status failed', statusRes.status);
    return res.status(502).json({ status: 'ERROR', error: 'Lost track of that one. Try again.' });
  }

  const status = await statusRes.json();

  if (status.status === 'IN_QUEUE' || status.status === 'IN_PROGRESS') {
    return res.status(200).json({ status: status.status });
  }

  if (status.status !== 'COMPLETED') {
    return res.status(200).json({ status: 'ERROR', error: 'That outfit did not survive. Try again.' });
  }

  const resultRes = await fetch(
    `https://queue.fal.run/${FAL_APP}/requests/${id}`,
    { headers: falHeaders(key) }
  );
  const result = await resultRes.json().catch(() => ({}));

  const urls = (result?.images || []).map((i) => i && i.url).filter(Boolean);
  if (!resultRes.ok || !urls.length) {
    console.error('[pfp] result missing image', resultRes.status, result);
    return res.status(502).json({ status: 'ERROR', error: 'He came back without a picture. Try again.' });
  }

  // Inline every candidate so the browser can score them without a
  // cross-origin fetch, and so the save button works off a data URL.
  const images = await Promise.all(urls.map(async (url) => {
    try {
      const imgRes = await fetch(url);
      if (!imgRes.ok) return url;
      const buf = Buffer.from(await imgRes.arrayBuffer());
      const mime = imgRes.headers.get('content-type') || 'image/jpeg';
      return `data:${mime};base64,${buf.toString('base64')}`;
    } catch (e) {
      return url;
    }
  }));

  return res.status(200).json({ status: 'COMPLETED', images: images });
}

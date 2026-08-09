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

// Locks the character down so only the accessories change. Everything
// here is deliberate: nano-banana drifts on pose and framing unless you
// spell out what must stay identical.
const STYLE_LOCK = [
  'Edit this cartoon character image.',
  'Keep the character itself EXACTLY as it is: identical pose, identical body position and angle,',
  'identical facial expression and eye direction, identical proportions, identical size and framing',
  'within the canvas, identical flat cartoon vector style with bold black outlines,',
  'and the identical plain off-white background.',
  'Do not move, rotate, crop, zoom, resize or redraw the character.',
  'Only add or change the clothing and accessories described here:'
].join(' ');

const STYLE_TAIL = [
  'Any new item must be drawn in the same flat cartoon style with the same bold black outlines',
  'and must sit naturally on the character without covering the eyes unless explicitly asked.',
  'Every other pixel of the image stays as it was.'
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
      num_images: 1,
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

  const url = result?.images?.[0]?.url;
  if (!resultRes.ok || !url) {
    console.error('[pfp] result missing image', resultRes.status, result);
    return res.status(502).json({ status: 'ERROR', error: 'He came back without a picture. Try again.' });
  }

  const imgRes = await fetch(url);
  if (!imgRes.ok) {
    return res.status(200).json({ status: 'COMPLETED', image: url });
  }

  const buf = Buffer.from(await imgRes.arrayBuffer());
  const mime = imgRes.headers.get('content-type') || 'image/jpeg';

  return res.status(200).json({
    status: 'COMPLETED',
    image: `data:${mime};base64,${buf.toString('base64')}`
  });
}

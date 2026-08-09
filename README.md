# SMOL TOD ($TOD)

Static site for the Smol Tod memecoin on Solana. Plain HTML/CSS/JS — no build step, no
dependencies. Vercel serves it as-is.

```
index.html           the whole page
css/style.css        styling (palette taken from the logo)
js/main.js           interactions, meme data, lightbox, PFP lab, easter eggs
api/pfp.js           serverless function behind the PFP generator
vercel.json          gives the function a 30s ceiling
assets/smol-tod.jpg  logo / OG image / PFP base image
assets/favicon.svg   simplified toad favicon
assets/meme-*.jpg    the nine memes, web-sized (900px, ~975 KB total)
assets/meme-*.png    full-res originals — gitignored, kept locally as masters
```

## The memes

All nine live in one array at the top of `js/main.js` (`MEMES`), and that single
array feeds everything: the scrolling Tod Tape under the hero, the Meme Vault grid,
the lightbox, the toad rain and the floating toads in the final CTA. To add a meme,
drop the file in `assets/` and add one entry:

```js
{ file: 'meme-whatever.jpg', title: 'TOP LINE', sub: 'the caption underneath',
  alt: 'described for screen readers', stamp: 'corner label' }
```

The lore panels and the roadmap markers reference their images directly in
`index.html` instead, since each one is paired to a specific bit of the story.

The originals were 1080×1080 PNGs totalling ~10 MB, which would have made the page
crawl on mobile. They're resized to 900px and saved as quality-82 JPEG (~975 KB for
all nine). If you add more, compress them the same way before shipping.

## Config

Both values live at the top of `js/main.js`:

```js
var CA    = '9w2nokGrjFACQaJaEJGafZgsxBePfDWdUav6ofSJpump';
var X_URL = 'https://x.com/smoltod';
```

- **CA** — injected into the hero bar and the "How to buy" block, and used by both copy
  buttons. If it ever changes, update it here *and* in the two `<code>` blocks in
  `index.html` (those are what render before JS runs).
- **X_URL** — drives the nav, final CTA and footer X buttons. Leave it empty and they fall
  back to a "dropping soon" toast instead of navigating.

## The PFP Lab

Visitors describe an outfit, and `assets/smol-tod.jpg` comes back wearing it. It runs on
fal.ai's **nano-banana** image edit model through `api/pfp.js`, so the API key stays on the
server and never reaches the browser.

**Required setup — the feature is dead without this:**

1. Grab a key at [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys).
2. In Vercel → your project → Settings → Environment Variables, add
   `FAL_KEY` = your key, for Production (and Preview if you want it there too).
3. Redeploy. Env vars are baked in at deploy time — an existing deployment won't pick it up.

Optional: `PFP_BASE_IMAGE` overrides the base image URL. You only need it if the default
(`https://<your-domain>/assets/smol-tod.jpg`) isn't publicly reachable — see the gotcha below.

### How it works

`POST /api/pfp` hands the job to fal's **queue** and returns a request id straight away;
the browser then polls `GET /api/pfp?id=…` every 1.5s until it's done. Edits take 5–20s,
which would blow past a serverless timeout if the function waited inline. When the image is
ready the function inlines it as a data URL, so there's no CORS dance and the save button
just works.

The pose lock lives in `STYLE_LOCK` / `STYLE_TAIL` at the top of `api/pfp.js`. It spells out
that the pose, framing, expression, art style and background must stay identical and that
only the described clothing may change — nano-banana drifts badly without that. If you find
it still wandering, tighten those strings; that's the single knob worth turning.

The quick-pick chips are the `CHIPS` array in `js/main.js`.

### Two things to know before you launch it

- **Deployment Protection.** fal.ai fetches the base image from your public URL. If the
  deployment sits behind Vercel Authentication (default on Preview deployments for some
  plans), fal gets a login page instead of a toad and every generation fails. Use the
  production domain, turn protection off, or point `PFP_BASE_IMAGE` at a public URL.
- **It costs money per image, on an open endpoint.** `api/pfp.js` has a best-effort limit of
  8 generations per IP per 5 minutes, but it's in-memory — it only sees traffic hitting the
  same warm instance, so it stops one impatient person, not a determined one. If the site
  gets real traffic, move that to Vercel KV / Upstash or put Cloudflare Turnstile in front.

## Local preview

All paths are relative, so double-clicking `index.html` works. Two things behave differently
outside a real deployment:

- The clipboard API needs a secure context, so the copy buttons fall back to the old
  `execCommand` path. They still work.
- The PFP Lab needs `/api/pfp`, which only exists on Vercel. It fails gracefully with a
  "only runs on the deployed site" message. To exercise it locally, run `vercel dev` with
  `FAL_KEY` in a local `.env`.

## Deploy

Push to GitHub, import the repo on Vercel, framework preset **Other**, no build command,
output directory = repo root. Vercel picks up `api/pfp.js` as a Node serverless function on
its own — there is nothing to install and no build step.

Set `FAL_KEY` in the project's environment variables before you rely on the PFP Lab (see
above), then redeploy.

## Easter eggs

- Poke the toad 10× → rave mode (rains actual memes)
- Type `tod` anywhere on the page
- Click the 🐸 in the footer
- Sound toggle in the nav (off by default, synthesised — no audio files)
- Right-hand meter fills with scroll depth
- Any meme opens in a lightbox: arrow keys to browse, Esc to close, button to save

## Notes

- Fonts come from Google Fonts (Luckiest Guy + Fredoka); everything else is self-hosted.
- `prefers-reduced-motion` is respected — animations, toad rain and the cursor trail all
  switch off for users who ask for it.

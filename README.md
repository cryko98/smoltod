# SMOL TOD ($TOD)

Static site for the Smol Tod memecoin on Solana. Plain HTML/CSS/JS — no build step, no
dependencies. Vercel serves it as-is.

```
index.html          the whole page
css/style.css       styling (palette taken from the logo)
js/main.js          interactions, meme vault, easter eggs
assets/smol-tod.jpg logo / OG image
assets/favicon.svg  simplified toad favicon
```

## Two things to fill in

Both live at the top of `js/main.js`:

```js
var CA    = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx';  // real contract address
var X_URL = '';                               // https://x.com/yourhandle
```

- **CA** — injected into both the hero bar and the "How to buy" block, and used by the copy
  buttons. Update it in this one place only. The placeholder in `index.html` is just what
  shows before JS runs.
- **X_URL** — while it's empty, every X button shows a "dropping soon" toast instead of
  navigating. Paste the URL and all of them (nav, final CTA, footer) go live at once.

## Local preview

All paths are relative, so double-clicking `index.html` works. The only thing that behaves
differently over `file://` is the clipboard API — the copy buttons silently fall back to the
old `execCommand` path, so they still work.

## Deploy

Push to GitHub, import the repo on Vercel, framework preset **Other**, no build command,
output directory = repo root. Done.

## Easter eggs

- Poke the toad 10× → rave mode
- Type `tod` anywhere on the page
- Click the 🐸 in the footer
- Sound toggle in the nav (off by default, synthesised — no audio files)
- Right-hand meter fills with scroll depth

## Notes

- Fonts come from Google Fonts (Luckiest Guy + Fredoka); everything else is self-hosted.
- `prefers-reduced-motion` is respected — animations, toad rain and the cursor trail all
  switch off for users who ask for it.

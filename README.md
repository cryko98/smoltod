# SMOL TOD ($TOD)

Static site for the Smol Tod memecoin on Solana. Plain HTML/CSS/JS — no build step, no
dependencies. Vercel serves it as-is.

```
index.html           the whole page
css/style.css        styling (palette taken from the logo)
js/main.js           interactions, meme data, lightbox, easter eggs
assets/smol-tod.jpg  logo / OG image
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

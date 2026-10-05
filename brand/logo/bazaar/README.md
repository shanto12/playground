# Curry District — Logo system · Direction A · BAZAAR

## Concept
A steaming bowl of curry rises like the morning sun through a cusped bazaar gate: the gate is the doorway into "the District", and the sun is the food. Below it, **CURRY** is set in chunky Bowlby One sticker lettering, and **DISTRICT** sits on a real street-sign plate, so the name reads like a neighbourhood you can walk into. The emblem uses four flat festival colours (saffron gate, rani sky, marigold sun, cream steam and rim) inside a thick indigo outline, with a row of block-print bunting along the bowl and one hard offset "sticker" shadow under the whole mark. It holds up as a 16px favicon and as a 3m wall mural, and every letter is converted to vector outlines, so no file depends on an installed font.

## Files
| File | Use |
|---|---|
| `wordmark-stacked.svg` | **Primary logo.** Emblem over CURRY over the DISTRICT sign. |
| `wordmark-horizontal.svg` | Wide spaces: web header, signage fascia, menus. |
| `wordmark-text-only.svg` | Where the emblem already appears nearby, or space is very tight vertically. |
| `lockup-tagline.svg`, `lockup-tagline-horizontal.svg` | With the line "INDIAN KITCHEN · LITTLE ELM, TX". |
| `emblem.svg` | Emblem on its own, 64px and up (stickers, cups, murals, social posts). |
| `emblem-small.svg` | Small-size cut for 24–64px: plain gate, two steam wisps, fewer teeth. |
| `favicon.svg` (+ `favicon.ico`) | 16–32px. Adds a cream keyline automatically in dark-mode browsers. |
| `app-icon-512.svg`, `app-icon-512-night.svg` | Rounded-square app icons (sunburst and night versions). |
| `app-icon-maskable-512.svg` | Full-bleed square for PWA/Android maskable and Apple touch icons. |
| `social-avatar-1080.svg`, `social-avatar-1080-sunburst.svg` | Profile pictures. All key art sits inside the circle crop. |
| `stamp-district-seal.svg` | "District stamp" sticker/seal, with CURRY DISTRICT · LITTLE ELM TEXAS · around the ring. |
| `colourways/<asset>--<colourway>.svg` | Every asset in `full-colour`, `reversed`, `mono-indigo`, `mono-cream`, `mono-saffron`. |
| `png/` | Transparent PNG exports: logos at 1024–2000px, favicons 16–64, icons 180/192/512, avatars 1080. |
| `preview.html`, `preview.png` | The full sheet: every colourway on cream, indigo, saffron, rani and photo backgrounds, plus 24/48px tests. |

## Colourways: which file on which background
- **Cream or white backgrounds:** full-colour, mono-indigo or mono-saffron.
- **Indigo or other dark backgrounds:** reversed (adds a cream die-cut keyline around the emblem and a rani shadow), mono-cream or mono-saffron.
- **Saffron backgrounds:** mono-indigo or mono-cream. Do not use reversed or mono-saffron on saffron.
- **Rani backgrounds:** mono-cream works best. Full-colour and reversed are usable.
- **Photography:** reversed or mono-cream, placed over the darker, calmer part of the image.
- **One-colour versions** (for embroidery, stamping, etching and vinyl) are each a single compound path with knock-outs, not tints. The street sign and letters keep their shadow, separated from the letters by a knocked-out gap.

## Clear space
**X = the cap height of "CURRY".** The DISTRICT street sign is almost exactly the same height, so either can be used to measure.
- Keep at least **1X** clear on every side of any lockup.
- For the **emblem** on its own, X = ¼ of the emblem's width.
- For the **stamp**, X = ⅛ of its diameter.
- No text, image edge or other graphic may enter the clear-space zone. The hard shadow counts as part of the logo.

## Minimum sizes
| Asset | Digital | Print |
|---|---|---|
| Stacked lockup | 120px wide | 30mm wide |
| Horizontal lockup | 160px wide | 40mm wide |
| Wordmark (text only) | 100px wide | 25mm wide |
| Tagline lockups | 240px wide | 60mm wide |
| Emblem, full | 64px | 15mm |
| Emblem, small cut | 24–64px | 8–15mm |
| Favicon | 16–32px | — |
| District stamp | 120px | 30mm |

Below these sizes, step down to the next simpler asset (stacked → emblem → emblem-small → favicon).

## Don'ts
Don't recolour parts of the mark outside the five colourways. Don't remove the outline and keep the shadow. Don't add a second shadow, a gradient or a glow. Don't re-type the name in a live font. Don't stretch the mark or rotate the lockups. Don't put full-colour on indigo.

## Palette (from `brand/tokens.css`)
Indigo `#1D1147` · Cream `#FFF4DC` · Saffron `#FF6A13` · Rani `#E4147E` · Marigold `#FFB000` · Peacock `#00A8A0` (street sign only).
The type is Bowlby One (CURRY, DISTRICT, stamp ring) and DM Sans 800 (tagline). Both are SIL OFL and both are converted to outlines in every file.

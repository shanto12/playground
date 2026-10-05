# Curry District · Direction B · ROYAL — "The District Gate" logo system

## Concept
A Mughal four-centred arch, the gateway into the neighbourhood's flavour quarter, frames a brass handi with three ribbons of steam rising to a small lamp-glint lozenge at the apex.
The cusped inner arch, the pearl beading and the little arcade of arches engraved round the pot echo jali screens and brasswork, so the mark reads as carved and gilded rather than clip-art.
"Curry" is set in Fraunces (wght 590, kerned by eye) over a widely spaced **DISTRICT** (Fraunces 620), with the gate's lozenge repeated at each end.
Every glyph is converted to outlines and the art is built for saffron-gold foil on midnight. It also works as a one-colour stamp, a ruby wax seal and a 24px favicon.

## Files (all SVG, text outlined, no fonts needed)
| File | Use |
|---|---|
| `emblem.svg` | Detailed emblem, gold foil (primary) |
| `emblem-small.svg` | Simplified emblem for 16–48 px (heavier arch, solid pot, one steam curl) |
| `wordmark-stacked.svg` | Emblem over Curry / DISTRICT (primary lockup) |
| `wordmark-horizontal.svg` | Emblem beside Curry / DISTRICT (headers, signage bands) |
| `wordmark-text-only.svg` | Curry / DISTRICT, no emblem |
| `lockup-tagline-stacked.svg`, `lockup-tagline-horizontal.svg` | With the tagline **INDIAN KITCHEN · LITTLE ELM, TX** (Hanken Grotesk 600) |
| `favicon.svg` | 32-unit tile, plum-to-midnight background |
| `app-icon-512.svg` | Rounded square with jali lattice, candle glow and foil emblem |
| `social-avatar-1080.svg` | Full-bleed square; all artwork sits inside the circle crop |
| `seal.svg` | Ring text "CURRY DISTRICT · LITTLE ELM TEXAS ·" around the emblem: sticker seals, stamps |
| `seal-wax.svg` | Ruby wax-seal rendering (uses an SVG drop-shadow filter; for print use `colourways/seal--*.svg`) |
| `colourways/<mark>--<colourway>.svg` | Every mark × 6 colourways (transparent; seals in foil/emerald/ivory include their sticker disc) |
| `preview.html`, `preview.png` | Full specimen sheet: 5 grounds, colourways, marks, 24/48 px tests, usage |

**Colourways:** `foil` (gold-foil gradient, use on midnight) · `emerald` (ivory + gold, use on emerald) · `ivory` (midnight + antique gold #B7791F, use on ivory) · `mono-gold` · `mono-ivory` · `mono-ink`. The foil gradient matches `--grad-foil` (135°, #B7791F → #F7D98A → #E9A63A → #B7791F) and sweeps across each whole lockup.

## Clear space
- **Lockups:** X = cap height of DISTRICT. Keep **2X** clear on every side.
- **Emblem, seal, app icon art:** keep **¼ of the mark's width** clear.
- Don't put anything inside the arch, and don't crop the plinth.

## Minimum sizes
| Mark | Screen | Print |
|---|---|---|
| Emblem, detailed | 64 px tall | 20 mm tall (≥ 25 mm for foil or emboss) |
| Emblem, small / favicon | 16 px | 6 mm |
| Stacked lockup | 110 px wide | 30 mm wide |
| Horizontal lockup | 160 px wide | 40 mm wide |
| Text-only wordmark | 90 px wide | 24 mm wide |
| Tagline lockups | 220 px wide | 55 mm wide |
| Seal | 120 px Ø | 30 mm Ø |

Below 48 px, always switch to `emblem-small.svg` or `favicon.svg`, because the detailed emblem's beading and hairlines blur together at that size.

## Don'ts
Don't recolour outside the six colourways, stretch or rotate the mark, or set midnight art on mid-tone grounds such as peacock or plum (use `mono-ivory` or `foil` there). Don't add effects to the foil, which is already a gradient.

## Notes for the orchestrator
- BRAND.md mentions a "CD" monogram. I tested overlapping Fraunces C and D on purpose and dropped it, because it closely resembles a famous fashion-house CD monogram. The initials-free arch-and-handi emblem is the monogram instead.
- Fonts used for outlining: Fraunces (variable wght, instanced at 590 and 620; 640 on the seal ring) and Hanken Grotesk 600 for the tagline. `fonts/` holds copies used only by `preview.html`.
- Regenerate everything with `python3 _build/build.py && python3 _build/build_marks.py && python3 _build/preview.py` (needs `fonttools brotli uharfbuzz`). `_build/` is source tooling and doesn't need to be deployed.

# Curry District · ROYAL icon set (v1)

42 line icons for Direction B · Royal. They are saffron-gold hairlines on a 64-grid, with small jewel-tone "enamel" fills and arch and jali details.
The brief asked for 40, but its own list names 42, so all 42 are drawn.
Open `index.html` to see the contact sheet. It shows the set large, at 48/32/24 px, on midnight and on ivory, and with recolour examples. Tap an icon to copy its snippet.

## Files

| Path | What |
|---|---|
| `*.svg` | Full colour with gold `#E9A63A` lines, for **dark grounds** (midnight, plum, emerald). |
| `on-ivory/*.svg` | The same drawings with gold-dark `#B7791F` lines, for **light grounds**. On ivory `#FBF3E4` the contrast is 3.3:1. Bright gold there only reaches 1.9:1. |
| `mono/*.svg` | Single colour via `currentColor`. Lines and solid marks are 100% colour. Jewel fills become a 30% tint. Diet marks, spice gems and the maps pin stay solid. |
| `sprite.svg` | `<symbol id="icon-NAME">` holds the colour version, themeable with CSS variables. `<symbol id="icon-NAME-mono">` holds the mono version. |
| `icons.json` | Manifest with name, label and group. |
| `index.html` + `fonts/` | The contact sheet. The sprite is inlined so it works from `file://`. Fonts are Fraunces and Hanken Grotesk, self-hosted. |
| `_src/` | Generator and QA scripts. `node _src/build.mjs` rebuilds every SVG, the sprite, `icons.json` and `index.html`. All drawings live in `_src/icons.mjs`. |
| `_qa/` | QA renders. Strip these before deploy. |

## Spec
- **Grid:** 64 × 64 artboard with a live area of 6–58. Keylines are a 52 square, a 52 circle and a 44 inner square.
- **Stroke:** 1.75, with round caps and round joins. Every outline in the set uses this weight. The diet-mark squares are the one exception at 3.25, so they match the legal mark proportions.
- **Jali detail:** dot bands are made with `stroke-dasharray="0 4"`, which gives round 1.75 dots. They fade out gracefully at small sizes.
- **Colour roles:** gold line `#E9A63A` (ivory: `#B7791F`) · emerald `#0F4D3F` · ruby `#A3173F` · peacock `#117C86` · ivory plate `#FBF3E4`.
  The diet marks deliberately sit outside the jewel palette so people recognise them instantly. Veg green is `#17834A` and non-veg brown is `#7A3317`.
- Accent fills always sit *under* the gold line, like enamel set in brass. Overlaps are pre-clipped, so mono tints never double up.

## The icons
- **Spice scale:** `chili-1` … `chili-5` = Mild · Medium · Hot · Extra-Hot · District Hot. Each level is shown two ways: the chili fills with ruby from stem to tip, and five gems light up underneath. That way the level still reads in mono, in print and at 24 px. Always pair it with the text label in menus.
- **Diet:** `veg-mark` is a green dot in a green square. `nonveg-mark` is a brown triangle in a brown square, following the FSSAI marks. In colour they sit on an ivory plate with a gold frame. In mono the plate and frame are dropped, leaving the bare standard mark.
- **Food:** curry-bowl, biryani-pot-handi, naan, samosa, kebab-skewer, tandoor-oven, chai-cup, lassi-glass, gulab-jamun, thali-plate, chaat-plate (pani-puri style), chili, lime, cilantro, spoon-fork, rice-bowl.
- **Utility:** phone, map-pin, clock, shopping-bag, delivery-scooter, star, heart, share, qr-code (decorative and not scannable), gift-card, calendar, party-tray, menu-book, check, arrow-right, quote.
- **Social:** instagram-glyph, facebook-glyph, google-pin-glyph. These are generic shapes redrawn in our line style, not the platforms' official logos. Where a platform's brand rules require its official mark (for example in ads), use that mark instead. `google-pin-glyph` is a plain solid map pin.

## Usage
```html
<!-- plain file -->
<img src="/brand/icons/royal/chai-cup.svg" width="32" height="32" alt="Chai">         <!-- dark ground -->
<img src="/brand/icons/royal/on-ivory/chai-cup.svg" width="32" height="32" alt="Chai"> <!-- light ground -->

<!-- sprite: needs same-origin http(s); for file:// inline the sprite's symbols in the page -->
<svg class="icon" aria-hidden="true"><use href="/brand/icons/royal/sprite.svg#icon-chili-3"/></svg>
<svg class="icon" style="color:#0F4D3F" aria-hidden="true"><use href="/brand/icons/royal/sprite.svg#icon-phone-mono"/></svg>
```
```css
.icon          { width: 32px; height: 32px; }
.on-ivory      { --icon-line: #B7791F; }   /* colour symbols on light grounds */
.icon--small   { --icon-stroke: 2.25; }    /* optical weight at ≤ 24 px */
/* also: --icon-emerald --icon-ruby --icon-peacock --icon-veg --icon-nonveg --icon-plate --icon-accent-opacity */
/* mono files via CSS mask (same-origin): */
.i-mask { width:24px; height:24px; background: currentColor;
          -webkit-mask: url(mono/heart.svg) center/contain no-repeat; mask: url(mono/heart.svg) center/contain no-repeat; }
```
- **Accessibility:** decorative icons get `aria-hidden="true"`. An icon that carries meaning on its own gets `role="img"` with an `aria-label` (or `alt` on `<img>`). Spice and diet marks must always sit next to a text label.
- **Sizes:** the icons are designed for 32 px and up. At 24 px or less, set `--icon-stroke: 2.25` on sprite icons, or use the mono version a step darker.

## Known limits
- At 24 px on 1× screens the hairline gets soft, and the thali plate and chaat plate are the busiest. Both are fine at 32 px and up, and on phone (2–3×) screens.
- Bright gold `#E9A63A` lines are **not** for ivory or white grounds. Use `on-ivory/` or the `--icon-line` variable instead.

# Curry District · BAZAAR icon set (v1)

There are 43 original icons in the **BAZAAR** direction: chunky 3px indigo outlines, flat festival fills, round caps and joins, and a little bit of play. Every icon also comes as a **mono** version that uses `currentColor`, so you can recolour it with CSS.

Open `index.html` to see the contact sheet: the large icons, each icon at 48, 32 and 24px, filters, a mono recolour picker and usage notes.

## Files

| Path | What |
|---|---|
| `<name>.svg` | Colour icon, 64×64 viewBox, standalone, with a `<title>` |
| `mono/<name>.svg` | Mono version: `stroke="currentColor"`, 3px stroke, solid accents in `currentColor` |
| `sprite.svg` | Every symbol in one file: `icon-<name>` (colour) and `icon-<name>-mono` (mono) |
| `index.html` | Contact sheet, mobile first, with the sprite inlined and self-hosted fonts in `fonts/` |
| `_build/` | Generator source (`icons.js` holds the shapes; `build.js`, `page.js` and `qa.js` are the scripts). Not needed at runtime. |

## The set (43)

- **Spice scale (5):** `chili-1` Mild · `chili-2` Medium · `chili-3` Hot · `chili-4` Extra hot · `chili-5` District hot. Each step shows that many separate chilies, so you can count them at 24px. The District hot step adds a fire underneath.
- **Diet (3):** `veg-mark` · `nonveg-mark` · `egg-mark` (optional)
- **Food (16):** `curry-bowl` · `biryani-pot-handi` · `naan` · `samosa` · `kebab-skewer` · `tandoor-oven` · `chai-cup` (kulhad) · `lassi-glass` · `gulab-jamun` · `thali-plate` (brass) · `chili` · `lime` · `cilantro` · `spoon-fork` · `rice-bowl` · `chaat-plate`
- **Utility (19):** `phone` · `map-pin` · `clock` · `shopping-bag` · `delivery-scooter` · `star` · `heart` · `share` · `qr-code` · `gift-card` · `calendar` · `party-tray` · `instagram-glyph` · `facebook-glyph` · `google-pin-glyph` · `menu-book` · `check` · `arrow-right` · `quote`

## Usage

```html
<!-- single file -->
<img src="/brand/icons/bazaar/naan.svg" width="32" height="32" alt="Naan">

<!-- sprite: inline the contents of sprite.svg once per page, then -->
<svg class="icon" aria-hidden="true"><use href="#icon-chili-3"/></svg> Hot

<!-- mono, coloured by CSS -->
<svg class="icon" style="color: var(--bz-rani)" aria-hidden="true"><use href="#icon-heart-mono"/></svg>
```

```css
.icon { width: 32px; height: 32px; flex: none; }
```

- An external sprite (`<use href="sprite.svg#icon-x">`) works over http(s) from the same origin. It does **not** work from `file://`, so inline the sprite for local previews.
- The symbols contain no ids, masks, clip-paths or gradients, so they cannot clash when several sprites share a page.
- **Accessibility:** put `aria-hidden="true"` on an icon that sits next to a text label. Give a lone icon button an `aria-label`. Always show the diet and spice marks together with their words ("Veg", "Hot").

## Spec

- **Grid:** 64×64 with roughly 3px of safe margin. All artwork stays inside 1.5–62.5, checked automatically by the build. Optical centring is done per icon.
- **Line:** 3px `#1D1147` (ink) with round caps and joins. Scaled groups compensate their stroke so the line is always 3px. A few tiny details (bubbles, grains, crimps) use 2.2–2.5px.
- **Fills:** marigold `#FFB000`, saffron `#FF6A13`, rani `#E4147E`, chili `#D62839`, peacock `#00A8A0`, cilantro `#3FA34D`, cream `#FFF4DC` and white. Shine highlights are white strokes with no outline, and they appear in the colour version only.
- **Off-palette extra:** "tandoor brown" `#8A3A1E` is used only where the standard requires brown (the non-veg mark) and where real food is brown (gulab jamun, chai, char spots).
- **Minimum size:** 24px. At 20px and below, use the mono version.
- **Dark surfaces:** the ink outline disappears on ink backgrounds. On dark backgrounds, use the mono icons in cream or marigold, or put colour icons on a cream "sticker" disc, as the contact sheet's hero does.

## Diet marks: what the standard says

They follow the Indian (FSSAI) label symbols. **Veg** is a green-outlined square with a filled green circle. **Non-veg** is a brown-outlined square with a filled brown **triangle**, the current symbol from the FSSAI Labelling & Display Regulations 2020; older packs used a brown circle. Indian labelling treats egg as non-veg, so `egg-mark` (brown square with a yolk-yellow egg) is an **optional menu helper** to use alongside the words "Contains egg". It is not an official symbol.

## Social glyphs: important

`instagram-glyph`, `facebook-glyph` and `google-pin-glyph` are **generic, original stand-ins**: a camera, an "f" in a speech bubble, and a map pin with a star. They are deliberately **not** the platforms' trademarked logos. If the live site needs the official marks, download them from each platform's brand resources and use them unmodified. Do not restyle the official marks into this set.

## How the mono versions are made

`_build/build.js` imports each icon into paper.js running in headless Chromium. It then subtracts every filled shape from the outlines drawn behind it. As a result, a line hidden in the colour version (a steam wisp behind a bowl, a skewer behind meat) stays hidden in the single-colour outline version. No masks are needed: the output is plain `<path>` elements.

## Rebuild

```bash
# needs Playwright (/opt/node-tools) and paper.js:  npm pack paper && tar xzf paper-*.tgz
PAPER_JS=/path/to/package/dist/paper-core.min.js node _build/build.js   # svgs + mono + sprite + bounds audit
node _build/page.js                                                     # index.html
node _build/qa.js big|small|page                                        # QA renders → _qa/
```

Edit the shapes in `_build/icons.js`. The custom attributes are documented at the top of that file.

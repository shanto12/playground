# Curry District · Royal (Direction B) pattern library

Eight seamless repeat patterns for the **Royal** direction, with 27 colourways in total. Every tile is a square SVG that repeats in both directions. Open `index.html` to see all of them as tiled swatches with a full-screen scale viewer, plus two feature-wall room demos.

| # | Pattern | Tile | Colourways | Motif | Best uses |
|---|---------|------|------------|-------|-----------|
| 01 | **Jali Lattice** | 240 | midnight · emerald · ivory | 8-fold star lattice (Hankin construction on a 4.8.8 grid) drawn as a double gold band, with rosettes in the star centres | Wallpaper, menu covers, web hero backgrounds, gift-box lids |
| 02 | **Mehrab Trellis** | 240 | midnight · emerald · ivory | Half-drop arcade of cusped palace arches on brass columns, each niche holding a flowering spray | Feature walls, takeaway bag wraps, catering boxes, event backdrops |
| 03 | **Paisley Vine** | 320 | midnight · emerald · ivory · ruby | Damask boteh (paisley) with pearl fringe, mirrored half-drop between undulating vines and small buti | Tissue paper, napkins, sweet boxes, social backgrounds |
| 04 | **Marigold Damask** | 320 | midnight · emerald · ivory · ruby | Genda (marigold) medallions in an ogee lattice, champa (plumeria) at every node | Wallpaper, festive packaging, gift cards, table runners |
| 05 | **Peacock Eye** | 240 | midnight · emerald · ivory · peacock | Overlapping feather-eye scales with fine radiating barbs | Accent walls, upholstery and cushions, cup sleeves, app splash screens |
| 06 | **Star Tile** | 240 | midnight · emerald · ivory | Eight-point star and cross tessellation with chamfered (carved) edges and inlaid centres | Bar and counter fronts, coasters, floor graphics, web section dividers |
| 07 | **Spice Botanical** | 320 | midnight · emerald · ivory | Fine-line curry leaf, green cardamom (whole and split), star anise, saffron threads, cumin and pepper, tossed on a shifted 3×3 grid | Menus, spice and sauce labels, napkins, delivery-bag stickers |
| 08 | **Brass Dots & Diamonds** | 240 | midnight · emerald · ivory | Quilted dotted lattice with foil diamonds and brass studs. Quiet enough to sit behind type | Menu backgrounds, business cards, website body, receipt folders |

**Colourway key:** `-midnight` is gold on aubergine (#160B26). `-emerald` is gold and ivory on emerald (#0F4D3F). `-ivory` is ruby, emerald and gold on ivory (#FBF3E4). The bonus `-ruby` is gold on ruby and `-peacock` is gold on peacock.

## Files
```
01-jali-lattice-midnight.svg … 08-brass-dots-diamonds-ivory.svg   27 master tiles (3–26 KB each, all < 50 KB)
png/<same-name>.png              1024×1024 previews, tile repeated 4×4 (256 px per repeat)
png/feature-wall-a.png           1600×900 room demo: Marigold Damask, Midnight
png/feature-wall-b.png           1600×900 room demo: Jali Lattice, Emerald
index.html                       mobile-first gallery: tiled swatches, full-screen viewer with scale slider, feature walls
feature-wall.html, scene.js      the live vector room scene (?scene=a|b; &export=1 freezes motion for stills)
fonts/                           Fraunces + Hanken Grotesk woff2, copied from brand/fonts
src/build-patterns.js            generator for every tile and colourway (node src/build-patterns.js)
src/render.js                    QA and export: sheets | seams | png | wall (Playwright)
src/qa-page.js                   index.html screenshots at 390 / 768 / 1280
_qa/                             QA renders only. Strip before deploy.
```

## Using the tiles
- **Web:** `background: url(04-marigold-damask-midnight.svg) 0 0 / 320px repeat;`. Native size is crisp, and any size works because the tiles are vector. On busy repeats, put text on a solid or blurred panel. Brass Dots is the only one meant to sit directly behind body copy.
- **Wallpaper (standard 53 cm repeat):** set 320-tiles to 53 cm, or 26.5 cm for a finer read. Set 240-tiles to 26.5 cm (two repeats per drop). Mehrab Trellis and Paisley Vine are half-drop internally, but each SVG is already a straight (full) repeat, so printers can use it as-is.
- **Tissue, napkins and flexo print:** the thinnest hairlines are 0.4–0.6 units. To keep them at or above about 0.25 mm, use a repeat of at least 15 cm for 240-tiles and 20 cm for 320-tiles. For small napkins, Brass Dots, Spice Botanical and Paisley Vine work best.
- **Packaging wraps:** Mehrab Trellis, Paisley Vine and Marigold Damask (any colourway). The ivory colourways suit white or cream stock.
- **Gradients:** the gold "foil" and brass gradients are inside each motif (objectBoundingBox), so every duplicated edge copy renders identically and the seam stays invisible. For single-pantone foil stamping, swap `url(#foil)` for #E9A63A.

## Palette
Every colour comes from `brand/tokens.css` as an explicit hex: #160B26, #2A1240, #4B1D52, #0F4D3F, #117C86, #A3173F, #E9A63A, #F7D98A, #B7791F, #FBF3E4, #F3E4C8, #F4C9BB, #FFFFFF. Tints are those same hexes with `fill-opacity`, not new colours.

## How seamlessness was verified
1. **By construction.** Lattice patterns (jali, star tile, peacock scales, brass dots, ogee lines, vines) are generated over an extended grid whose period divides the tile, then clipped by the viewBox. Free motifs go through `wrapUse()`, which places a duplicate on the opposite edge for every element that crosses one.
2. **Numerically.** `node src/render.js seams` draws a 2×2 tiling on a canvas and flags pixels with a large jump across the seam but smooth neighbours. The few flags left were each inspected at 16× zoom. They are anti-aliasing where a shape edge runs parallel to the seam, not breaks.
3. **Visually.** A 3×3 tiled sheet was made per pattern (`_qa/sheet-*.png`), along with a magnified four-tile corner junction for every file (`_qa/seam-*.png`, `_qa/montage-seams-*.png`).

## Cultural notes
The motifs are secular and decorative: jali screens, palace arcades, boteh/paisley, marigold and champa flowers, peacock feathers, carved geometric stone, and kitchen spices. There are no deities, religious symbols, inscriptions or script. The arch pattern is a palace arcade with a flowering spray, with no domes, minarets or lamps. The geometric stars appear only as a continuous tessellation, never as a standalone emblem.

*Independent design concept prepared as a proposal — not the official Curry District website.*

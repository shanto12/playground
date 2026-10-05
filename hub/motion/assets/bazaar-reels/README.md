# Bazaar motion pack (Direction A)

All motion uses the brand files in place: the emblem and wordmark from `brand/logo/bazaar`, the dish SVGs (including their `.steam` and `.sparkle` groups), icons, patterns and fonts. Menu text comes from `data/menu.json`, with no prices and no `unconfirmed` items.

## How it's rendered (deterministic)
`_src/render.js` builds one page per piece. The page exposes `window.renderAt(t)`, which sets every property from pure timeline functions. The only randomness is a seeded PRNG. Playwright captures each frame at 1080×1920, 1080×1080 or 1920×1080 (DPR 1, 30 fps). ffmpeg then encodes it as H.264 yuv420p with `+faststart`, and CRF is raised until the file is ≤ 3 MB. The `frames-*` folders are deleted afterwards. Re-render one piece with `node _src/render.js video <id>`, or get still frames with `node _src/render.js preview <id> 1.0,2.5`.

## Stickers with transparency (production)
The MP4s sit on a flat colour so they preview anywhere. For real use, render the same page with a transparent background (`ALPHA=1 node _src/render.js video sticker-bowl-steam` captures with `omitBackground`), then encode:
- **WebM with alpha** (web, IG/Giphy): `ffmpeg -framerate 30 -i frames/%05d.png -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 34 sticker.webm`
- **ProRes 4444 with alpha** (editors: Premiere, Final Cut, CapCut): `ffmpeg -framerate 30 -i frames/%05d.png -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le sticker.mov`
- **GIF/APNG** for GIPHY uploads: export from the PNG sequence at 15 fps.

The die-cut white border and the indigo hard shadow are part of the artwork, so they survive keying.

## Timing and sound (the reels are silent; the designer adds licensed audio)
- **District Opening (15 s):** an upbeat dhol-pop or Bollywood-funk bed at **118–124 BPM**. Cues:
  - 0.0 s: dhol roll.
  - 1.97 s: CURRY slams in. Hit a kick or dhol "dhin" with a cymbal choke.
  - 3.6 s: whoosh on the iris wipe.
  - 3.9–9.0 s: a tumbi or "pop" pluck on each of the 6 dish landings, one every 0.97 s (about 2 beats at 124 BPM).
  - 9.5 s: shutter rattle.
  - 10.45–11.65 s: rising sizzle or riser. One chili pop per step, then a "fire" whoosh plus camera shake on District Hot.
  - 12.3 s: swell.
  - 14.25 s: UI tap click on Order online.
- **Logo sting (4 s):** a short tabla or dhol flourish. Shimmer as the sun rises (0.3–1.1 s), then a hit and wood-block "clack" at 1.52 s (CURRY lands) and a bell tail.
- **Story loops (6 s):** sizzle ASMR or a 120 BPM loop cut to 6 s. Tap click at 3.9 s (Order now) or 3.7 s (Party trays), and soft pops on each tray drop (0.54–1.89 s).
- **Menu boards:** keep them silent in the restaurant, or use quiet ambient music. Nothing should be timed to the loop.
- **Stickers:** silent by design.

Use only original audio, licensed library music or the platform's own commercial-safe sound library. Business accounts have limited music rights.

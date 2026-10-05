# Pitch Hub — component guide

Everything here is plain HTML + `assets/hub.css` + `assets/hub.js` (no build, no CDN). Copy `hub/_template/index.html` into `hub/<area>/index.html` and keep only the blocks you need.

## 0. Page setup (do these 4 things)

1. Copy `_template/index.html` → `hub/<area>/index.html`. All asset paths are `../assets/…` already.
2. Set `<title>`, meta description, `og:title`, `og:description`, and `og:url` (`…/AREA/`).
3. On `<body class="hub" data-root="../" data-area="AREA">`, set `data-area` to your folder id: `brand packaging interiors menu-design social signage merch loyalty motion gbp thali calendar audit benchmarks ideas`. This highlights the nav.
4. Keep the `<div data-hub-nav></div>`, the `<footer class="site-foot">` (it carries the concept disclaimer) and the `<aside class="next-cta">` as the **last child of `<main>`**.

Put your page-only CSS, JS and images **inside your own folder**, for example `hub/packaging/page.css` or `hub/packaging/img/…`. Don't edit `assets/`. If you need something global, ask the hub owner.

**Hub chrome vs brand previews.** The hub chrome uses `--hub-*` variables: dark canvas `#120C1E`, cream text, Fraunces and DM Sans. Brand artwork goes inside a **preview container** carrying `data-theme="bazaar|royal"`. There, `tokens.css` variables (`--c-bg`, `--c-primary`, `--font-display`, `--grad-hero`, …) and all six brand fonts are available.

QA tip: open pages via `file://`. Fonts load fine as long as you don't add `<link rel=preload>` (that breaks under `file://`).

---

## 1. Layout primitives

| Class | What it does |
|---|---|
| `.wrap` / `.wrap--narrow` | Centred container: max 1160px (820px when narrow) with a responsive gutter (16–40px). |
| `.section` / `.section--tight` | Vertical rhythm of 56–112px (36–64px when tight). |
| `.grid.grid--2/3/4` | Responsive card grid: 1 column on phones, 2 at 600px or wider, 3–4 at 960px or wider. |
| `.stack`, `.cluster` | Vertical or wrapping-horizontal gap (`--gap`). |
| `.card`, `.card--glow` (`--card-g`) | 24px-radius glass card. The glow variant adds a gradient border. |
| `.eyebrow` (`--gold`, `--plain`) | Small uppercase kicker with a gradient tick. |
| `.lede`, `.prose`, `.muted`, `.soft` | Text styles. |
| `.grad-text` (`--a`, `--b`, `--live`) | Gradient-filled display words. `--live` adds a slow shimmer. |
| `.btn` + `--primary` (marigold CTA), `--gold`, `--cream`, `--ghost`, `--sm`, `--block`, `--icon` | Buttons. All are at least 44px tall. |
| `.link-arrow` | Text link with an animated →. |
| `.callout` | Tinted note box: `<div class="callout"><svg…/><p>…</p></div>`. |
| `.print-only`, `.no-print`, `.sr-only` | Visibility helpers. |

## 2. Page header (with back link)
```html
<header class="page-head wrap" style="--head-glow:rgba(228,20,126,.22)">
  <a class="backlink" href="../#tour"><svg …/>All samples</a>
  <p class="eyebrow">Sample 04 · Packaging</p>
  <h1 class="page-title">Bags worth <em>keeping</em></h1>
  <p class="lede">…</p>
  <div class="page-head__meta"><span class="chip" data-tone="a">A · Bazaar</span> … <button class="btn btn--ghost btn--sm" data-share>Open on your phone</button></div>
</header>
```

## 3. Section header
```html
<div class="sec-head sec-head--split">           <!-- --split puts the action on the right ≥768px -->
  <p class="sec-head__num">01</p>
  <h2 class="sec-head__title" id="x">Title <em>italic flair</em></h2>
  <p class="sec-head__desc">One line.</p>
  <a class="sec-head__action link-arrow" href="…">See all</a>   <!-- or <div class="sec-head__action" data-dir-switch="full"></div> -->
</div>
```

## 4. Hero (home-style)
`.hero > .hero__orbs(4 × <span>) + .wrap > .hero__kicker.eyebrow, h1.hero__title (use <em>), p.hero__sub, .hero__actions`. Add `.anim-rise` with `style="--i:n"` for an entrance stagger.

## 5. Stat / finding card
```html
<article class="stat" style="--stat-g:var(--g-royal)">
  <p class="stat__source">Google</p>
  <p class="stat__value"><span data-count="4.2" data-decimals="1">4.2</span><small>★</small></p>
  <p class="stat__label">~1,000 reviews</p>
  <p class="stat__note">As listed publicly, Oct 2026</p>
  <div class="chips"><span class="chip" data-tone="gold">likely</span></div>
</article>
```
`data-count` counts up when the card scrolls into view. Always put the final value as text too, so print and no-JS still show it. Options: `data-decimals`, `data-prefix`, `data-suffix`.

## 6. Idea card
```html
<article class="idea" id="3" style="--idea-g:linear-gradient(135deg,#FF6A13,#E4147E)">
  <div class="idea__thumb"><span class="idea__num">03</span><img src="img/idea3.jpg" alt="…" loading="lazy" onerror="this.hidden=true"></div>
  <div class="idea__body">
    <h3 class="idea__title">Takeout packaging system</h3>
    <div class="chips"><span class="chip chip--dot" data-tone="emerald">Effort: Low</span><span class="chip chip--dot" data-tone="rani">Impact: High</span></div>
    <p class="idea__desc">…</p>
    <p class="idea__why"><b>Why it works:</b> every bag is a billboard that rides home with a customer.</p>
  </div>
</article>
```
The thumbnail slot shows `--idea-g` when there is no image. Use `<a class="idea">` to make the whole card a link. `.idea--row` is the compact list version used on home: `<a class="idea idea--row"><span class="idea__num">1</span><span class="idea__body">…</span><svg class="idea__go"/></a>`. `:target` highlights a card when someone lands on `ideas/#3`.

## 7. Chips
`<span class="chip" data-tone="marigold|a|rani|peacock|gold|b|emerald|violet|solid">`. Add `.chip--dot` for a leading dot. `button.chip` / `a.chip` get a 44px tap height. Use `aria-pressed="true"` for a selected filter. Wrap groups in `.chips`.

## 8. Gallery + fullscreen lightbox
```html
<div class="gallery gallery--4" data-stagger>             <!-- 2 cols phone · 3 at ≥768 · 4 at ≥1100 (--4) ; also --1, --2 -->
  <a class="gallery__item" href="img/full.jpg" data-lightbox="packaging" data-caption="Kraft bag, A · Bazaar" style="--ar:1/1">
    <img src="img/thumb.jpg" alt="Kraft takeout bag with marigold band" loading="lazy" decoding="async">
    <span class="gallery__cap">Kraft bag</span>
  </a>
  …
</div>
```
- Every element with the same `data-lightbox` value forms one swipeable set. Items hidden by the A/B switch are skipped automatically.
- The full-size source is `data-src`, then `href`, then the inner `<img>`. `--ar` sets tile aspect (default 4/5). Use `.gallery__item--wide` for a full-row 16:9 tile and `--span2` to span two columns.
- Viewer controls: swipe (touch, pen or mouse drag); pinch (native); double-tap or double-click to zoom and pan; ← → keys; Esc or the close button. Focus moves to Close and the rest of the page is `inert` while open.
- From JS: `Hub.openLightbox([{src, alt, caption}], startIndex)`.

## 8b. Manifest-driven gallery ★ (drop assets in, no HTML edits)
```html
<section class="section" aria-labelledby="g1"><div class="wrap">
  <div class="sec-head"><h2 class="sec-head__title" id="g1">Boxes &amp; bags</h2></div>
  <div data-gallery
       data-manifests="assets/boxes/manifest.json,assets/bags/manifest.json"
       data-filter="direction,type,tags"></div>
</div></section>
```
**Manifest** (`hub/<area>/assets/boxes/manifest.json`). **All paths are relative to the AREA folder** (the folder holding the page), not to the manifest:
```json
{ "helper": "boxes",
  "items": [
    { "id": "pail-bazaar", "title": "Takeout pail — Bazaar", "direction": "bazaar",
      "type": "image", "src": "assets/boxes/pail-bazaar.png", "thumb": "assets/boxes/pail-bazaar-thumb.jpg",
      "w": 1600, "h": 1200, "caption": "One-line why it works", "tags": ["box", "takeout"],
      "download": "assets/boxes/pail-bazaar.svg" },
    { "id": "reel-1", "title": "Biryani reel", "direction": "royal", "type": "video",
      "src": "assets/reels/biryani.mp4", "poster": "assets/reels/biryani.jpg", "w": 1080, "h": 1920 },
    { "id": "box-3d", "title": "Spin the box", "direction": "both", "type": "interactive",
      "src": "assets/boxes/box-3d-thumb.jpg", "thumb": "assets/boxes/box-3d-thumb.jpg", "href": "viewer/index.html" },
    { "id": "spec", "title": "Print spec", "direction": "both", "type": "pdf",
      "src": "assets/boxes/spec.pdf", "thumb": "assets/boxes/spec-thumb.jpg" }
  ] }
```
- **Fields.** `direction` is `bazaar`, `royal` or `both` (default both). `type` is `image` (default), `video`, `interactive` or `pdf`. Only `src` is required. Give `w` and `h` so the masonry tile has the right shape before loading (default 4:5). `thumb` falls back to `src` for images and to `poster` for video.
- **Rendering.** Lazy-loaded masonry: 2, 3 or 4 columns at 0, 768 and 1100px. Each tile shows its title, plus a ▶ badge on video and an "Interactive" or "PDF" pill.
- **Filter chips.** `data-filter` lists which facets to offer.
  - Direction chips appear only if the items include both Bazaar and Royal. They drive the **global** A/B switch, and the gallery always respects the global switch.
  - Type chips appear only if there is more than one type.
  - Tag chips appear only if there is more than one tag, showing the 14 most common.
- **Clicking.**
  - `image` and `video` open the lightbox. Video plays there with `controls playsinline muted loop`. A **Download** button appears when the item has `download`. Swiping moves through the currently filtered images and videos.
  - `interactive` opens `href` in a full-screen iframe sheet, with close (also Esc) and open-in-new-tab.
  - `pdf` opens in a new tab.
- **Missing files.** Missing or 404 manifests and broken thumbnails are skipped silently, and a broken thumbnail shows a gradient placeholder. Duplicate `id`s are merged.
- **Testing.** `fetch()` is blocked on `file://`. Serve with `npx http-server /home/user/playground/hub -p 8080 -s` and open `http://127.0.0.1:8080/<area>/`. For a quick `file://` check you can also add an inline manifest inside the element: `<script type="application/json" data-gallery-items>{"items":[…]}</script>`.
- **JS.** `Hub.renderGallery(el, items)` renders manifest-style items directly (no fetch). `Hub.openFrame(href, title)` opens the iframe sheet.

## 9. Before / after slider
```html
<div class="ba" style="--ar:4/3">
  <div class="ba__layer ba__before"><img src="before.jpg" alt="Today: plain white box"></div>
  <div class="ba__layer ba__after"><img src="after.jpg" alt="Concept: printed box"></div>
  <span class="ba__label ba__label--before">Today</span><span class="ba__label ba__label--after">Glow-up</span>
  <input class="ba__range" type="range" min="0" max="100" value="50" aria-label="Drag to compare before and after">
  <span class="ba__handle" aria-hidden="true"></span>
</div>
```
Layers can hold any HTML or SVG, not just images. Keep `input` before `.ba__handle`, because the focus ring depends on that order.

## 10. Device frames
```html
<div class="phone" style="--w:300px">                       <!-- .phone--sm = 220px -->
  <div class="phone__screen" style="--screen-g:var(--g-bazaar)">
    <img src="shot.jpg" alt="…" onerror="this.hidden=true">   <!-- or: <iframe src="https://…" data-w="390" title="…" loading="lazy"></iframe> -->
    <div class="screen-ph" aria-hidden="true"><b>Bazaar</b><span>Screenshot coming</span></div> <!-- optional; put BEFORE the img so the img covers it -->
  </div>
  <span class="phone__glare" aria-hidden="true"></span>
</div>

<div class="browser">
  <div class="browser__bar"><span class="browser__dots"><i></i><i></i><i></i></span><span class="browser__url">curry-district-royal.netlify.app</span></div>
  <div class="browser__screen" style="--ar:16/10"><img src="desk.jpg" alt="…"></div>   <!-- iframe: data-w="1280" -->
</div>
```
Iframes are scaled to fit automatically (`data-w` is the virtual width). If an image is missing, it hides itself and the gradient (`--screen-g`) or placeholder shows.

## 11. Tabs / segmented control
```html
<div data-tabs>
  <div class="seg tabs__list" role="tablist" aria-label="Item">
    <button role="tab" aria-controls="p-bag" aria-selected="true">Bag</button>
    <button role="tab" aria-controls="p-box">Box</button>
  </div>
  <div class="tabs__panel" id="p-bag" role="tabpanel">…</div>
  <div class="tabs__panel" id="p-box" role="tabpanel" hidden>…</div>
</div>
```
Arrow, Home and End keys are wired. The control dispatches `hub:tab` (bubbles).

## 12. Accordion
`<div class="acc"><details><summary>Question</summary><div class="acc__body">…</div></details>…</div>`. It is native, so it works without JS, and it opens fully when printed.

## 13. Direction switch & preview containers ★
- **Global switch:** the top bar has one. Drop `<div data-dir-switch></div>` (compact) or `<div data-dir-switch="full"></div>` (with names) anywhere and it renders a synced copy. The choice is saved to `localStorage` (`cd-hub-dir`) and restored before first paint by the inline head script.
- `data-preview="bazaar"` or `"royal"`: hidden when the other direction is picked. hub.js also sets `data-theme` to match, so writing it yourself just avoids a flash.
- `data-preview="follow"`: one container whose `data-theme` follows the switch. With **Both** selected it uses `data-both="bazaar|royal"` (default bazaar).
- `.dir-pair`: wrapper that shows its two previews side by side (≥768px) when Both is selected, and stacked or single otherwise.
- `.preview` (optional): styled brand surface (`--c-bg`, `--c-text`, `--font-body`, 24px radius). `data-label="A · Bazaar"` adds a corner badge.
- `.dir-tag.dir-tag--a / --b`: small coloured label for the dark hub canvas.
- JS: `Hub.setDirection('royal')`, `Hub.getDirection()`, and `document.addEventListener('hub:direction', e => e.detail.dir)`.

## 14. Area tiles (auto)
`<div data-area-tiles="kit|more|tour|all" data-exclude="current" data-limit="4" data-only="brand,packaging"></div>` renders gradient tiles from `Hub.AREAS`, the single list of names, blurbs, icons and gradients. Use it for "Keep exploring" footers.

## 15. QR block
```html
<figure class="qr" style="--qr:132px;margin:0"><img src="../assets/qr/bazaar.svg" alt="QR code for the Bazaar concept site"><figcaption class="qr__label">Scan to open</figcaption><span class="qr__url">curry-district-bazaar.netlify.app</span></figure>
```
Available codes: `assets/qr/hub.svg`, `bazaar.svg`, `royal.svg`. They are ink on cream, with the quiet zone built in.

## 16. Share / copy / print
- `<button data-share>`: uses `navigator.share`, falling back to copying the link and showing a toast. Optional `data-share-url` and `data-share-title`. On `file://` it shares the live hub URL for this area.
- `<button data-copy="text">`: copies the text. `<a href="#" data-print>`: opens print / Save as PDF.
- `Hub.toast('Saved!')`.

## 17. Sticky "Next steps" CTA
`<aside class="next-cta">` as the **last child of `<main>`**. It floats above the tab bar while the page scrolls, then settles at the end of the page (pure CSS sticky).

## 18. Config-driven contact (`assets/config.js`)
`window.HUB_CONFIG = { studio, phone, email, whatsapp, calendarLink }`. Empty fields stay hidden.
- `data-config="phone"` on an `<a>` is shown only when set, and its `href` becomes `tel:` / `https://wa.me/` / `mailto:` / the link.
- `data-config="phone,email"` on a wrapper is shown if any of those fields is set.
- `data-config-text="studio"` fills in the text.
- `data-config-none` is shown only when **no** contact field is set. Use it for the "Ask your designer for the next step" fallback.

## 19. Motion utilities (all honour `prefers-reduced-motion`)
- `data-reveal` (`""`, `"fade"`, `"scale"`): fade-up when the element scrolls into view.
- `data-stagger` on a parent: reveals its children in sequence.
- `.anim-rise` + `--i`: entrance animation on load.
- `data-tilt="6"`: 3D tilt on hover, desktop with a fine pointer only.
- `data-count`: count-up (see §5).
- Only `transform` and `opacity` are animated.

## 20. Print → PDF handout
Built in, no work needed:
- Nav, CTA, switches and iframes are hidden.
- The canvas turns white with dark text.
- **Both** directions are shown.
- Reveals are forced visible and accordions open.
- External link URLs are printed after the link.
- A header with the page URL is added.

Use `.no-print` / `.print-only` for anything extra.

## Tokens cheat-sheet
`--hub-bg #120C1E` · `--hub-text #FFF4DC` · `--hub-soft` · `--hub-muted` · `--hub-line` · `--hub-card` · accents `--hub-marigold/saffron/rani/peacock/teal/emerald/gold/gold-lt/ruby/plum/violet` · small-text-safe tints `--hub-t-marigold/rani/peacock/gold/emerald/violet` · gradients `--g-bazaar`, `--g-royal`, `--g-royal-2`, `--g-both`, `--g-text`, `--g-cta`, `--g-gold` · `--hub-radius 24px` · `--hub-ease` · `--hub-font-display` (Fraunces) · `--hub-font-body` (DM Sans).

Contrast: cream on the canvas is 17:1. On coloured fills use `--hub-ink` text (marigold, gold or cream fills) or cream text over the darkened bottom of a tile. Never put cream text on bare marigold or saffron.

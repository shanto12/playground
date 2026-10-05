# Curry District · B · ROYAL — site style guide (for sibling page builders)

Concept: **"The Palace in Chapters"**. Every section is a *room* of a palace in its own jewel tone (ivory, plum, emerald, ruby, blush), joined by gold hairlines, arch windows and jali screens. Copy uses the `royal` voice in `data/copy.json` (warm, sensory, US spelling, no Hindi).

Everything lives in `sites/royal/` and must stay self-contained (no paths outside the folder, no CDNs). Pages use **relative** URLs (`css/site.css`, `img/...`), except `404.html` which uses root-absolute URLs.

---

## 1. Files

| Path | What |
|---|---|
| `css/site.css` | All shared styles: tokens, rooms, type, buttons, header, action bar, hero, arches, cards, rail, ratings, visit, footer. Add page-only CSS in a `<style>` block or `css/<page>.css`; don't fork site.css. |
| `css/motion.css`, `js/motion.min.js` | Brand motion kit (copied from `brand/motion/`). Data-attribute driven. |
| `js/config.js` | `window.CD_CONFIG`: the ONE place for phone, address, hours, links, ratings. |
| `js/site.js` | Binds config, open-now status, concept banner, mobile nav, action bar, hero parallax, rails, `Motion.init()`. Exposes `window.CD.status()` and `CD.refresh()`. |
| `fonts/` | `fraunces.woff2`, `fraunces-italic.woff2`, `hanken-grotesk.woff2` (variable `wght` 100–900, Latin subset). |
| `img/logo/` | All Royal marks; `colourways/` for every colourway (`--ivory` on light grounds, `--foil` on dark). |
| `img/dishes/*.svg` | Dish art (800×800, transparent). `.steam` and `.glint` animate inside the file, and the animation stops under reduced motion. Keys: biryani, butter-chicken, garlic-naan, tandoori-platter, paneer-tikka, samosa-chutney, chilli-chicken, dal-saag, gulab-jamun, thali, mango-lassi-chai, chaat. |
| `img/hero/` | Hero planes `{portrait,landscape}-{back,mid,front}.svg` + full/static scenes. |
| `img/patterns/` | 27 Royal pattern tiles (`NN-name-{ivory,midnight,emerald,ruby,peacock}.svg`). |
| `img/icons/sprite.svg` | 42 Royal icons. `#icon-NAME` = colour (gold line, for dark grounds), `#icon-NAME-mono` = `currentColor`. Single files in `img/icons/`, `on-ivory/`, `mono/`. |
| `img/arch-window.svg`, `img/arch-window-trim.svg` | Arch mask/trim (from `brand/illustrations/royal/hero/arch-frame*.svg`, viewBox widened so the cusped lobes are complete). |
| `data/menu.json` | Sanitised copy of `data/menu.json`: **no prices**, no research fields. Has `meta.zones`, items, collections, offers (all unverified). |
| `data/copy-royal.json` | `shared` + `royal` blocks of `data/copy.json`. |
| `_qa/` | Screenshots + build scripts. Stripped before deploy. `_qa/build/build_assets.py` re-copies brand finals. `_qa/build/pages.py` regenerates **stub** pages only; it skips any page without the `STUB:` marker. |

## 2. Page skeleton (copy from `menu.html`; it is a stub built from the shared chrome)

```html
<!doctype html>
<html lang="en" data-theme="royal">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>… — Indian Restaurant Little Elm TX</title>            <!-- copy.json royal.seo.<page>.title -->
<meta name="description" content="…">
<meta name="robots" content="noindex,nofollow">                <!-- required on every page -->
<link rel="canonical" href="https://curry-district-royal.netlify.app/<page>.html">
<meta name="theme-color" content="#160B26">
<link rel="icon" href="favicon.ico" sizes="32x32"><link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png"><link rel="manifest" href="site.webmanifest">
<!-- og:* + twitter:* (absolute og:image = https://curry-district-royal.netlify.app/og-image.jpg) -->
<link rel="preload" href="fonts/fraunces.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/hanken-grotesk.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="css/motion.css">
<link rel="stylesheet" href="css/site.css">
<script>(function(h){h.className+=' js m-js';try{if(localStorage.getItem('cd-royal-concept-dismissed')==='1')h.className+=' concept-dismissed'}catch(e){}setTimeout(function(){if(!window.Motion)h.classList.remove('m-js')},3000)})(document.documentElement);</script>
</head>
<body id="top">
  <!-- skip link · concept banner · header · mobile nav  (copy verbatim; set aria-current="page" on your nav links) -->
  <main id="main"> … </main>
  <!-- footer (with the exact disclaimer) · action bar -->
  <script src="js/config.js"></script>
  <script src="js/motion.min.js" data-manual></script>
  <script src="js/site.js"></script>
</body>
</html>
```

The header overlays the first section (it is `position: sticky` with a negative bottom margin), so **every page must start with a dark section**: `.hero` (home) or `.page-hero` (inner pages). The header turns solid midnight after 24px of scroll (`data-header="24"`, motion kit).

## 3. Tokens (`:root`, see top of site.css)

* Palette: `--ry-ink #160B26` · `--ry-aubergine #2A1240` · `--ry-plum #4B1D52` · `--ry-emerald #0F4D3F` · `--ry-peacock #117C86` · `--ry-ruby #A3173F` · `--ry-gold #E9A63A` · `--ry-gold-lt #F7D98A` · `--ry-gold-dk #B7791F` · `--ry-gold-deep #8A5A14` · `--ry-ivory #FBF3E4` · `--ry-ivory-2 #F3E4C8` · `--ry-blush #F4C9BB`.
* Gradients: `--grad-foil` (bright, for dark grounds) · `--grad-foil-deep` (antique, for light grounds) · `--grad-night`.
* Type: `--font-display` Fraunces (600 headings; italic 400–500 for accent words) · `--font-body` Hanken Grotesk. Scale: `--fs-hero`, `--fs-h2`, `--fs-h3`, `--fs-lede`, `--fs-body` (17px), `--fs-small`, `--fs-eyebrow`.
* Radius `--radius-l: 28px` for cards; pills `999px`. Gutter 16px on phones (`--pad-x` grows to 28/40px).
* **Contrast rules (checked):** never set gold `#E9A63A` text on ivory (1.9:1). On light rooms use ink, ruby `#A3173F` (6.9:1), `--ry-gold-deep` (5.3:1), or `.foil` (it switches to the deep foil automatically, ≥3:1, large text only). On dark rooms gold-lt/gold/ivory are all ≥8:1. Body copy on ivory: ink or `--c-muted #6B5A73` (5.9:1).

## 4. Rooms (sections)

```html
<section class="room room--ivory room--fade" id="…" aria-labelledby="…-title">
  <div class="wrap"> … </div>
</section>
```
Add `room--valance` to give a room a carved top edge (a row of small gold-rimmed arches rising into the room above; the room overlaps the previous one by 13px). Use it on jewel rooms that follow another room.
Modifiers: `room--ivory` (jali wash), `room--blush` (brass dots), `room--paper` (plain), `room--midnight`, `room--plum`, `room--emerald`, `room--ruby`, `room--peacock`.
Each sets `--room-ink`, `--room-muted`, `--room-accent` (eyebrows, links), `--room-foil`, plus `--pattern`/`--pattern-o`. `room--inlay` adds the gold double hairline at the top edge, and `room--fade` fades the pattern in and out. For a **parallax jali** add `room--has-layer` and `<div class="room__pattern" data-parallax=".16" aria-hidden="true"></div>` as the first child.
Containers: `.wrap` (1180px), `.wrap--narrow` (760px), `.wrap--wide` (1360px).

## 5. Type helpers & chapter heading

```html
<header class="chapter-head" data-reveal>
  <p class="chapter-head__num">Chapter <b>II</b></p>
  <span class="ornament" aria-hidden="true"></span>
  <h2 class="chapter-head__title" id="x-title">The menu, <span class="foil">in courses</span></h2>
  <p class="chapter-head__lede">…</p>
</header>
```
`chapter-head--left` + `ornament--left` for left-aligned. Other helpers: `.eyebrow` (+`--lozenge`), `.display-1`, `.display-2`, `.title-3`, `.lede`, `.muted`, `.small`, `.fine`, `.italic`.
Foil: `<span class="foil">word</span>` (italic accent). `foil--upright` keeps roman, `foil--bright` forces the bright foil, and `foil--sweep` adds the slow light sweep (one per screen). Put **one** foil word per headline.

## 6. Buttons & links

```html
<a class="btn btn--foil" href="…" data-cd-href="order" target="_blank" rel="noopener">
  <svg class="icon" aria-hidden="true"><use href="img/icons/sprite.svg#icon-shopping-bag-mono"/></svg>Order online</a>
<a class="btn btn--line" href="menu.html">View the menu</a>          <!-- hairline; auto ruby-on-ivory in light rooms -->
<a class="btn btn--line on-light" …>…</a>                           <!-- force light variant -->
<a class="text-link" href="…">Enter the Tandoor Quarter<svg class="icon" viewBox="0 0 64 64" aria-hidden="true"><use href="img/icons/sprite.svg#icon-arrow-right-mono"/></svg></a>
```
Sizes: `btn--sm` (44px), `btn--block`. Row: `.btn-row` / `.btn-row--center`. All buttons are ≥48px tall.
**Primary action = Order on Clover** (`data-cd-href="order"`). Never offer reservations (unknown). Uber Eats/DoorDash stay secondary (footer).

## 7. Config binding (keep facts in `js/config.js` only)

```html
<a href="tel:+14692005856" data-cd-href="tel"><span data-cd="phone">(469) 200-5856</span></a>
<a href="https://…" data-cd-href="directions">Directions</a>   <!-- keys: order uberEats doorDash directions appleMaps google yelp restaurantji instagram facebook hub -->
<span data-cd="address">…</span> <span data-cd="cityLine">…</span> <span data-cd="hoursCaveat">…</span>
```
Always write the real value in the HTML too (no-JS fallback). The phone status is *likely*, and the owner must confirm it.

## 8. Open-now chip & hours

```html
<a class="status-chip" href="#hours" data-open-status data-state="unknown">
  <span class="status-chip__dot" aria-hidden="true"></span><span data-open-text>Today’s hours</span></a>
<!-- on light rooms add status-chip--light -->
<table class="hours" id="hours"><caption>Hours</caption><tbody>
  <tr data-days="1,2,3,4"><th scope="row">Mon–Thu</th><td><span>11:00 AM – 2:30 PM</span><span>4:30 PM – 10:00 PM</span></td></tr>
  <tr data-days="5,6"><th scope="row">Fri–Sat</th><td><span>11:00 AM – 3:00 PM</span><span>4:30 PM – 10:30 PM</span></td></tr>
  <tr data-days="0"><th scope="row">Sun</th><td><span>11:00 AM – 3:00 PM</span><span>4:30 PM – 10:00 PM</span></td></tr>
</tbody></table>
<p class="fine" data-cd="hoursCaveat">Hours as listed publicly; please call to confirm on holidays.</p>
```
site.js computes the state in **America/Chicago** (open · soon · between · closed) with copy.json wording. It also marks today's row `.is-today`. Always show the caveat next to the chip.

## 9. Arch windows (dish art)

```html
<div class="arch arch--emerald arch--glow">
  <div class="arch__glass">
    <img class="arch__art" src="img/dishes/butter-chicken.svg" alt="Illustration of butter chicken in a brass karahi" width="800" height="800" loading="lazy" decoding="async">
  </div>
</div>
```
Jewels: `arch--emerald | plum | ruby | peacock | midnight | saffron`. `arch--glow` adds a drop shadow, and `arch--plain` removes the gold trim. Tune the art with `--art-w` (default 100%) and `--art-b` (default 3%), or with `.arch__art--wide` (92%) for wide dishes (karahi, thali, platter). Aspect ratio = 504 / 644.9. Alt text starts with "Illustration of…" and never names an ingredient the dish wouldn't contain. A dish with `art: null` gets no illustration: use a typographic tile or an icon, and never borrow another dish's art.

## 10. Components

**Dish card** (stretched link, staggered grid):
```html
<ul class="dish-grid" data-stagger="140">
  <li><article class="dish-card">
    <div class="arch arch--ruby arch--glow"><div class="arch__glass"><img class="arch__art" …></div></div>
    <span class="dish-card__zone">Bread Bazaar</span>
    <h3 class="dish-card__name"><a href="menu.html#bread">Garlic Naan</a></h3>
    <p class="dish-card__desc">desc_royal from menu.json</p>
  </article></li>
</ul>
```
**Horizontal arch rail** (scroll-snap with buttons; no autoplay):
```html
<div class="rail" data-rail>
  <ul class="rail__track" data-rail-track tabindex="0" aria-label="…">
    <li class="rail__item" data-rail-item><a class="zone-card" href="menu.html#starters"><div class="arch arch--midnight"><div class="arch__glass">
      <svg class="zone-card__icon" viewBox="0 0 64 64" aria-hidden="true"><use href="img/icons/sprite.svg#icon-samosa"/></svg>
      <span class="zone-card__num">I</span><h3 class="zone-card__name">Starters Square</h3><p class="zone-card__tag">…</p>
      <span class="zone-card__go">Enter<svg aria-hidden="true"><use href="img/icons/sprite.svg#icon-arrow-right-mono"/></svg></span>
    </div></div></a></li>
  </ul>
  <div class="wrap"><div class="rail__controls">
    <button class="rail__btn rail__btn--prev" type="button" data-rail-prev aria-label="Previous">…</button>
    <span class="rail__count" data-rail-count aria-hidden="true">01 / 08</span>
    <button class="rail__btn rail__btn--next" type="button" data-rail-next aria-label="Next">…</button>
  </div><div class="rail__progress" aria-hidden="true"><i data-rail-progress></i></div></div>
</div>
```
**Technique panel**: `.technique > article.tech-panel` (arch + `.tech-panel__kicker` + h3 + p + `ul.fact-list` + `.text-link`). **Pull line**: `<p class="pull-line"><span>…</span> <span class="foil">…</span></p>`.
**Check list**: `<ul class="check-list"><li>…</li></ul>` (gold ring ticks; ruby on light rooms).
**Card**: `.card` (white, 28px, hairline), `.card--dark` (glass on jewel rooms), `.card--inset` (inner gold hairline).
**Ratings badge** (arch-topped; always keep the label, never add quotes):
```html
<ul class="ratings"><li><a class="rating" href="…" data-cd-href="yelp" target="_blank" rel="noopener">
  <span class="rating__platform">Yelp</span><span class="rating__score" aria-hidden="true">4.0</span>
  <span class="rating__stars" style="--pct:80%" aria-hidden="true"></span><span class="sr-only">Yelp: 4.0 out of 5,</span>
  <span class="rating__count">120 reviews</span><span class="rating__label">as listed publicly, Oct&nbsp;2026</span></a></li></ul>
```
**Review themes** (paraphrases, never styled as quotes): `ul.themes > li` with `.themes__k`, h3 and p, followed by the "not direct quotes" note.
**Map**: `.map-frame` (arched top) with `.map-frame__fallback` and a lazy `<iframe … loading="lazy" title="…">`.
**Inner-page hero**: `<section class="page-hero"><div class="wrap wrap--narrow"><p class="eyebrow eyebrow--lozenge">…</p><span class="ornament" aria-hidden="true"></span><h1 class="page-hero__title">… <span class="foil">…</span></h1><p class="page-hero__lede">…</p></div></section>`.

## 11. Motion (motion kit + site.js)

* Reveal: `data-reveal` (up · `left` · `right` · `zoom` · `fade` · `pop`). Stagger children: `data-stagger="120"` on the parent. Royal reveals are slow (1.25s).
* Parallax: `data-parallax=".16"` (scroll). Embers: `<div data-particles="embers" data-density=".5">`. Steam on any box: `data-steam="3"`.
* Hero planes: `[data-plane=".42"]` (scroll lag) + `data-drift` (pointer drift on desktop).
* Everything stops under `prefers-reduced-motion`. Animate only `transform` and `opacity`.

## 12. Menu page contract (for the menu builder)

* Section ids = zone ids, in this order: `#starters #tandoor #curry #biryani #indochinese #bread #sweets #chai` (home links to them). Names and taglines are in `meta.zones[].name` / `.tagline_royal`.
* Hide items with `status: "unconfirmed"`. Never render prices (`meta.showPrices` is false). Instead, link "See today's prices on Clover" (`data-cd-href="order"`).
* Show `meta.disclaimer`, `meta.allergenNote`, `meta.spiceNote` and `meta.dietNote`. Spice uses `#icon-chili-1…5` **plus** the text label. Diet uses `#icon-veg-mark` / `#icon-nonveg-mark` **plus** the text label.
* The "Fan favourite" style badge appears only where `popular: true`. `availability` (Goat Dum Biryani, "Weekends only") renders as a small badge.

## 13. Required on every page

`<meta name="robots" content="noindex,nofollow">` · concept banner · footer disclaimer, exactly: **"Independent design concept prepared as a proposal — not the official Curry District website."** · skip link + `<main id="main">` · action bar (on pages without a `[data-bar-sentinel]` it shows immediately) · no invented quotes, prices, awards, halal/vegan/gluten-free, "authentic" or family-recipe claims · no reservations.

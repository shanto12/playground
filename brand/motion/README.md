# Curry District · Motion Kit v1.0

This is a small, dependency-free motion layer shared by both websites and the pitch hub. It's driven entirely by `data-*` attributes and `--m-*` CSS variables, so the same markup re-skins for **Bazaar** (springy, saturated, petals) and **Royal** (slow, jewel-toned, gold foil and embers). To switch, flip `data-theme` on `<html>` or on any section.

| File | Size | Use |
|---|---|---|
| `motion.min.js` | 13.99 KB (≈6.4 KB gzip) | ship this |
| `motion.js` | readable source | edit this, then re-minify (command at the bottom) |
| `motion.css` | 9.95 KB | ship this (load **after** `tokens.css`) |
| `demo.html` | demo | every component, Bazaar ⇄ Royal toggle |

## 1. Install (copy-paste)

```html
<head>
  <!-- 1. pre-paint flags: avoids a flash of un-revealed content + powers the page curtain -->
  <script>
  (function(h){try{if(sessionStorage.getItem('m-curtain'))h.classList.add('m-arrive')}catch(e){}
  h.classList.add('m-js');setTimeout(function(){if(!window.Motion)h.classList.remove('m-js','m-arrive')},3000)})(document.documentElement);
  </script>
  <link rel="stylesheet" href="tokens.css">
  <link rel="stylesheet" href="motion.css">
  <script src="motion.min.js" defer></script>   <!-- auto-inits on DOMContentLoaded -->
</head>
<html data-theme="bazaar">  <!-- or "royal" -->
```

* The inline snippet is optional but recommended. If `motion.min.js` fails to load, it un-hides everything after 3 s.
* For manual start, use `<script src="motion.min.js" defer data-manual></script>` and then call `Motion.init()`.
* Without JS, everything is visible and every link works. The hidden "before reveal" state only exists under `html.m-js` **and** `prefers-reduced-motion: no-preference`.

## 2. Components

### 1 · Scroll reveal
```html
<div data-reveal>…</div>                           <!-- up (default) -->
<div data-reveal="left|right|zoom|pop|fade" data-delay="120">…</div>
<ul data-stagger="pop 70">                          <!-- effect + step(ms); children without data-reveal get it -->
  <li>…</li><li>…</li>
</ul>
```
This uses IntersectionObserver and is one-shot. The stagger counts only items that enter together, so long grids don't lag.

### 2 · Marquee / ticker
```html
<div class="ticker" data-marquee="60" aria-label="Menu districts">   <!-- px/second -->
  <span>Tandoor Quarter</span><span aria-hidden="true">✺</span><span>Curry Quarter</span>…
</div>
<div data-marquee="55 right">…</div>                                  <!-- reverse -->
```
It clones content to fill any width, and the clones are `aria-hidden` + `inert`. It pauses on hover (mouse), on keyboard focus-within, and on tap (WCAG 2.2.2), and also pauses offscreen. With reduced motion it becomes a static strip you can swipe. Set the spacing with `--m-gap: 1.5em`. **Don't put `id`s inside** (they get cloned).

### 3 · Steam wisps
```html
<div data-steam="4"><img src="bowl.svg" alt=""></div>     <!-- 1–8 wisps -->
<script>Motion.steam(el, 5)</script>                      <!-- or programmatically -->
```
Hooks: `--m-steam-c` (colour, e.g. `rgba(29,17,71,.35)` on light backgrounds) and `--m-steam-y` (where they start, default `70%` of the host's height). The default colour is white/ivory, which reads best on dark or photographic backgrounds.

### 4 · Particle canvas
```html
<section data-particles="petals">…</section>   <!-- petals | spice | embers | auto -->
<section data-particles="auto">…</section>     <!-- Bazaar → petals, Royal → embers -->
<section data-particles="spice" data-density="1.5">…</section>
```
There is one canvas per host, inserted behind the content (`z-index:-1` inside an isolated host; set `--m-pz: 2` to put it in front). It is `aria-hidden` and pointer-transparent. It is sized to the parent with ResizeObserver, DPR-aware (capped at 2×), and its particle count is capped by area *and* viewport (petals 16/38, spice 45/110, embers 26/60 on phones/desktop). It pauses offscreen and in hidden tabs, and isn't created at all under reduced motion. Colours come from `--m-p1…--m-p4` and refresh live when `data-theme` changes.

### 5 · Tap burst
```html
<button data-burst>Order up!</button>          <!-- default 14 (phone) / 22 pieces -->
<button data-burst="30">Celebrate</button>
<script>Motion.burst(x, y, sourceEl)</script>
```
Bazaar bursts into marigold petals and Royal into gold-leaf flakes (`--m-petal-r`). Keyboard activation bursts from the button's centre. It uses Web Animations and is skipped silently where WAAPI is missing or motion is reduced.

### 6 · Tilt / depth cards
```html
<div data-reveal>                               <!-- wrapper: see "transform ownership" -->
  <article class="card" data-tilt="10">         <!-- max degrees; default 12 Bazaar / 7 Royal -->
    <svg data-depth="1">…</svg>                 <!-- 1 = 10px, 2 = 20px, 3 = 32px, or style="--m-depth:40px" -->
    <h3 data-depth="2">Tandoor Quarter</h3>
  </article>
</div>
```
Tilt follows the pointer on mouse/pen and tilts toward the finger while pressed on touch. A soft glare follows it (`--m-glare-c`). Reads and writes are batched in one rAF. **deviceorientation is intentionally OFF**, because iOS would show a permission prompt.

### 7 · Magnetic / pressable / ripple
```html
<button data-magnetic=".35" data-press data-ripple>Order now</button>
```
These use the individual `translate` / `scale` properties, so they compose with your own `transform` (e.g. a −2° sticker tilt). Ripple colour is `--m-ripple-c` (default `currentColor`).

### 8 · Count-up
```html
<b data-count>11851</b>                       <!-- write the REAL value; it's the no-JS fallback -->
<b data-count data-duration="2400">1,200+</b>  <!-- prefix/suffix/commas/decimals are kept -->
```
Screen readers only get the final value (hidden copy). Width is reserved, so neighbours don't reflow. Reduced motion shows the final value immediately.

### 9 · Sticky header shrink + progress
```html
<header data-header="60">                     <!-- shrink after 60px of scroll -->
  <a data-shrink href="/">Logo</a> …
  <div class="bar" data-progress aria-hidden="true"></div>   <!-- style it: height, background -->
</header>
```
This is transform-only: the header lifts `--m-header-shift` (−10px), `[data-shrink]` scales to `--m-shrink` (.84), and a backdrop (`--m-header-bg`, `--m-header-sh`) fades in. The progress bar uses `scaleX`. Set `scroll-padding-top` on `html` to your header height so anchors land below it.

### 10 · Text effects
```html
<h2 data-wave>Chai-lo</h2>                     <!-- letters rise in on reveal, wave again on hover -->
<h2 data-wave="loop">Bas, ek aur naan.</h2>    <!-- keeps waving -->
<span class="shimmer foil-text">in motion.</span>   <!-- foil text (tokens.css) + glint sweep -->
<a class="btn shimmer">Book a table</a>       <!-- glint works on any box too -->
<span class="draw-underline">its own zip code</span> <!-- highlighter draws in on reveal -->
```
* `data-wave` is for **plain text only**. Inner markup is replaced; the accessible name is preserved.
* `.shimmer` sweeps a soft overlay glint (transform + opacity only). On dark backgrounds it also lifts the backdrop slightly, like light passing over foil. Colour hook: `--m-glint`.
* `.draw-underline` is `inline-block`, so use it on **short phrases**. Bazaar draws a chunky marigold highlighter; Royal draws a 2px gold rule. Hooks: `--m-ul-c`, `--m-ul-h`, `--m-ul-y`, `--m-ul-rot`, `--m-ul-r`.

### 11 · Curtain / arch-wipe transitions
```html
<a href="menu.html" data-transition>Menu</a>            <!-- theme default: Bazaar curtain, Royal arch -->
<a href="#catering" data-transition="arch">Catering</a> <!-- in-page: cover → jump → lift -->
<nav data-transition="curtain"> …every link inside… </nav>
<script>Motion.go('menu.html', 'arch'); Motion.curtain('arch', () => swapContent());</script>
```
This is progressive enhancement. It only touches same-origin, left-button, unmodified, non-`_blank`, non-`download` clicks that nobody else `preventDefault`-ed. Cmd/Ctrl/Shift/middle-click behave normally. The destination page needs the kit (plus the inline head snippet for a flash-free cover). There are several safety nets: a CSS-only 2.5 s failsafe on arrival, a 5 s un-cover if navigation stalls, a bfcache `pageshow` reset (iOS back button), and an 8 s expiry on the session flag. Colours: `--m-curtain-a` (accent panel), `--m-curtain-b` (main panel), `--m-curtain-line`, `--m-curtain-r` (edge shape), `--m-curtain-ms`.

### 12 · Smooth anchors
Automatic for every same-page `<a href="#id">` (and `#top`). It scrolls smoothly (instantly under reduced motion), updates the URL hash, and moves keyboard focus to the target with `preventScroll`. Set `html { scroll-padding-top: 84px }` for sticky headers. Links whose click handler already called `preventDefault()` (tabs, etc.) are left alone.

### 13 · API
```js
Motion.init(opts?)   // idempotent; call again after injecting markup to wire up new elements
Motion.destroy()     // removes every listener/observer/canvas/injected node, restores original markup
Motion.burst(x, y, el?)   Motion.steam(el, n?)   Motion.particles(el, type?)
Motion.curtain(shape?, fn?)   Motion.go(url, shape?)
```
If the user flips their OS reduced-motion setting, the kit rebuilds itself automatically.

## 3. Keyframe utilities (CSS only)
```html
<span class="sticker m-wobble">District Hot</span>
<img class="m-float" …>   <button class="m-pulse-ring">…</button>   <span class="m-bounce-in">New</span>
<svg class="m-spin-slow">rangoli</svg>   <span class="neon m-flicker">CHAI</span>
<svg class="m-sway" style="--m-origin:50% 0">garland</svg>   <svg class="m-twinkle">✦</svg>
```
They pause offscreen when the JS is loaded, and stop under reduced motion. Set `animation-delay` / `animation-duration` inline to desync repeated items. `--m-ring-c` colours the pulse ring.

## 4. Theme hooks (override per page or section)
`--m-ease --m-ease-out --m-dur --m-dist --m-pop --m-ch-from --m-wave --m-tilt --m-particles --m-p1…--m-p4 --m-petal-r --m-steam-c --m-steam-y --m-glint --m-glare-c --m-ul-* --m-curtain-* --m-header-* --m-shrink --m-gap --m-pz --m-persp --m-depth --m-ripple-c --m-ring-c --m-origin`.
Both themes are defined at the top of `motion.css` and reference `tokens.css` colours (`--bz-*`, `--ry-*`).

## 5. Rules & gotchas
* **Transform ownership.** `[data-reveal]`, `[data-tilt]`, `[data-depth]`, `[data-shrink]` and the `.m-*` utilities set `transform`. Don't stack two of them on one element; wrap it instead (e.g. `data-reveal` on a wrapper around a `data-tilt` card). `data-reveal` also sets `transition`, so don't put it on the same element as `data-magnetic`/`data-press`, and don't put `data-stagger` directly on a row of magnetic buttons; wrap each one in a `<span>`. Your own `rotate:`/`translate:`/`scale:` properties are safe.
* **Accessibility.** Every decorative node (canvas, steam, glare, burst, curtain, marquee clones) is `aria-hidden` and `pointer-events:none`. Nothing traps or steals focus. Smooth anchors *move* focus to the target on purpose.
* **Performance.** Only transform/opacity are animated (the canvas draws pre-rendered sprites). DOM reads are batched before writes in rAF. All scroll/pointer listeners are passive. Particle loops stop offscreen and in hidden tabs.
* **Hub overlap.** `hub/assets` ships its own `data-reveal` / `data-count` / `data-tilt` (with `.is-in`). Don't run both scripts on one page: either port the hub to this kit or don't include it there.
* **Support.** Modern evergreen browsers and iOS Safari 12.2+ are fine. If IntersectionObserver is missing, everything reveals immediately. If ResizeObserver is missing, it falls back to `resize`. If WAAPI is missing, there's no burst. Without `sessionStorage` (private mode), cross-page curtains are skipped and in-page ones still work. `translate`/`scale` (magnetic/press) need iOS 14.5+; older iOS just doesn't move them.

## 6. QA (Playwright / Chromium, `_qa/`)
* Screenshots at 390×844 and 1280×800 in both themes (top + full page), plus two timed hero frames 700 ms apart (`timed-1/2`) that differ, a theme switch, the arch-wipe midpoint and arrival, a burst, a tilt and reduced motion.
* 53/53 behavioural checks pass for **both** `motion.min.js` and `motion.js`, with zero console errors or warnings. Fallbacks were checked with IO, RO, WAAPI, matchMedia and sessionStorage all removed, plus the kit failing to load.
* Animating causes 0 layouts while idle, 1 across 60 tilt pointer moves, and 1 across 40 scroll steps. The hero holds ≈60 fps with 4× CPU throttling (≈0.4 ms script/frame).

Re-minify after editing `motion.js`:
```sh
npx terser motion.js --ecma 2016 -c ecma=2016,passes=3 -m --mangle-props 'regex=/^(_m\w*|ps|spr|want|ph|vp|vx|vy|vr|cv|ctx)$/' --comments '/^!/' -o motion.min.js
```

*Independent design concept prepared as a proposal — not the official Curry District website.*

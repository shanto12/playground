/*! Curry District Motion Kit 1.0 */
/*
 * Everything is driven by data-attributes + CSS custom properties, so it re-skins when
 * <html data-theme="bazaar|royal"> (or a section's data-theme) changes. Auto-inits on
 * DOMContentLoaded; put data-manual on the <script> tag to opt out and call Motion.init().
 * Rules kept throughout: animate transform/opacity only, batch DOM reads before writes,
 * pause work offscreen / in hidden tabs, honour prefers-reduced-motion, decorative nodes are aria-hidden.
 * Deliberately NOT included: deviceorientation tilt (iOS permission prompt) — tilt is pointer/touch only.
 */
((w, d) => {
  'use strict';
  if (w.Motion) return;

  const de = d.documentElement;
  const { sin, cos, min, max, abs, round, random, ceil } = Math;
  const RM = w.matchMedia ? w.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const KEY = 'm-curtain';
  const LIVE = '[data-steam],[data-marquee],[data-wave],[data-particles],.shimmer' + ' wobble float pulse-ring bounce-in spin-slow flicker sway twinkle'.replace(/ /g, ',.m-');
  const FOC = 'a[href],button,input,select,textarea,[tabindex]';
  const CLS = 'm-in m-off m-shrunk m-paused m-tilt m-active';
  const VARS = ['--m-delay', '--m-rx', '--m-ry', '--m-px', '--m-py', '--m-mx', '--m-my'];
  const PT = { petals: [9000, 16, 38], spice: [2600, 45, 110], embers: [4500, 26, 60] }; // px² per particle, cap <640px, cap ≥640px

  let C = [], booted = false, opts = {};
  let enterIO, liveIO, ro, mo;
  let P = [], tid = 0, last = 0;                 // particle systems + shared ticker
  let heads = [], bars = [], maxS = 0, sid = 0;  // header / progress
  let tilt = null, mag = null, px = 0, py = 0, pid = 0;
  let veilEl = null, layer = null;

  /* ───────── helpers ───────── */
  const reduced = () => RM.matches;
  const $$ = (s, r) => Array.from((r || d).querySelectorAll(s));
  const num = (v, f) => (v = parseFloat(v), isNaN(v) ? f : v);
  const rnd = (a, b) => a + random() * (b - a);
  const clamp = v => v < -1 ? -1 : v > 1 ? 1 : v;
  const css = (el, k, v) => el.style.setProperty(k, v);
  const cvar = (el, k) => getComputedStyle(el).getPropertyValue(k).trim();
  const attr = (el, k) => el.getAttribute(k);
  const data = (el, k) => el.getAttribute('data-' + k);
  const cl = (el, c, add) => el.classList[add ? 'add' : 'remove'](...c.split(' '));
  const has = (el, c) => el.classList.contains(c);
  const rect = el => el.getBoundingClientRect();
  const raf = f => requestAnimationFrame(f);
  const caf = i => cancelAnimationFrame(i);
  const words = v => (v || '').trim().split(/\s+/);
  const esc = s => s.replace(/[&<>"]/g, c => '&#' + c.charCodeAt(0) + ';');
  const later = f => C.push(f);
  const on = (t, ev, f, o) => { t.addEventListener(ev, f, o); later(() => t.removeEventListener(ev, f, o)); };
  const pal = el => [1, 2, 3, 4].map(i => cvar(el, '--m-p' + i)).filter(Boolean);
  function mk(tag, c, parent, first) {
    const e = d.createElement(tag);
    e.className = c;
    e.setAttribute('aria-hidden', 'true');
    if (parent) parent.insertBefore(e, first ? parent.firstChild : null);
    return e;
  }
  // first-time marker per element + feature, so init()/refresh() are idempotent
  function once(el, k) {
    let m = el._m;
    if (!m) { m = el._m = {}; later(() => delete el._m); }
    return m[k] ? false : (m[k] = 1);
  }
  const live = el => liveIO && once(el, 'lv') && liveIO.observe(el);

  /* ───────── 1 · scroll reveal (also triggers wave / underline / count) ───────── */
  function enter(el, delay) {
    if (delay) css(el, '--m-delay', delay + 'ms');
    cl(el, 'm-in', 1);
    if (el._mCount) el._mCount(delay);
  }
  function onEnter(entries) {
    const seen = new Map();   // stagger counter per [data-stagger] parent, within this batch
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, p = el.parentNode;
      let delay = num(data(el, 'delay'), 0);
      enterIO.unobserve(el);
      if (p && p._mStep != null) { const n = seen.get(p) || 0; seen.set(p, n + 1); delay += n * p._mStep; }
      enter(el, delay);
    });
  }
  const watch = el => enterIO ? enterIO.observe(el) : enter(el, 0);
  function stagger(p) {
    let fx = 'up', step = 80;
    words(data(p, 'stagger')).forEach(t => { if (/^\d/.test(t)) step = +t; else if (t) fx = t; });
    p._mStep = step;
    later(() => delete p._mStep);
    Array.from(p.children).forEach(c => {
      if (c.hasAttribute('data-reveal')) return;
      c.setAttribute('data-reveal', fx);
      later(() => c.removeAttribute('data-reveal'));
    });
  }

  /* ───────── 8 · count-up ───────── */
  function counter(el) {
    const orig = el.innerHTML;
    const m = el.textContent.trim().match(/^(\D*?)(-?[\d,]*\.?\d+)(.*)$/) || ['', '', '0', ''];
    const src = data(el, 'count') || m[2], end = num(src.replace(/,/g, ''), 0);
    const dec = (src.split('.')[1] || '').length;
    const fmt = v => m[1] + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: /,/.test(src) }) + m[3];
    el.innerHTML = `<span class="m-sr">${esc(fmt(end))}</span><span class="m-num" aria-hidden="true"></span>`;
    const v = el.lastChild;
    v.style.minWidth = fmt(end).length + 'ch';   // no reflow of neighbours while digits grow
    v.textContent = fmt(reduced() ? end : 0);
    el._mCount = delay => {
      if (reduced()) return (v.textContent = fmt(end));
      const dur = num(data(el, 'duration'), 1800);
      let t0 = 0;
      const f = t => {
        const k = min((t - (t0 = t0 || t)) / dur, 1);
        v.textContent = fmt(end * (1 - (1 - k) ** 4));
        if (k < 1) el._mRaf = raf(f);
      };
      setTimeout(() => (el._mRaf = raf(f)), delay || 0);
    };
    later(() => { caf(el._mRaf); el.innerHTML = orig; delete el._mCount; });
    watch(el);
  }

  /* ───────── 10a · split-letter wave ───────── */
  function wave(el) {
    const txt = el.textContent.replace(/\s+/g, ' ').trim(), orig = el.innerHTML;
    let i = 0;
    el.innerHTML = `<span class="m-sr">${esc(txt)}</span><span aria-hidden="true">` + txt.split(' ').map(wd =>
      '<span class="m-w">' + Array.from(wd).map(ch => `<span class="m-ch" style="--i:${i++}">${esc(ch)}</span>`).join('') + '</span>'
    ).join(' ') + '</span>';
    later(() => (el.innerHTML = orig));
    watch(el);
  }

  /* ───────── 2 · marquee / ticker ───────── */
  function marquee(el) {
    let speed = 60, rev = 0, gw = 0, cw = 0;
    words(data(el, 'marquee')).forEach(t => {
      if (/^-?\d/.test(t)) speed = abs(t) || 60; else if (/^(right|rev)/.test(t)) rev = 1;
    });
    const kids = Array.from(el.childNodes), track = d.createElement('div'), g = d.createElement('div');
    track.className = 'm-track' + (rev ? ' m-rev' : '');
    g.className = 'm-group';
    kids.forEach(n => g.appendChild(n));
    track.appendChild(g);
    el.appendChild(track);
    const fill = () => {
      const a = rect(g).width, b = el.clientWidth;     // reads first
      if (!a || (a === gw && b === cw)) return;
      gw = a; cw = b;
      while (track.children.length > 1) track.lastChild.remove();
      for (let n = max(1, ceil(b / a)); n--;) {
        const c = g.cloneNode(true);                   // decorative copies: hidden from AT + unfocusable
        c.setAttribute('aria-hidden', 'true');
        c.setAttribute('inert', '');
        $$(FOC, c).forEach(f => f.setAttribute('tabindex', '-1'));
        track.appendChild(c);
      }
      css(track, '--m-shift', -a + 'px');
      css(track, '--m-mdur', (a / speed).toFixed(2) + 's');
    };
    el._mFill = g._mFill = fill;
    if (ro) { ro.observe(el); ro.observe(g); } else { fill(); on(w, 'resize', fill); }
    later(() => { if (ro) { ro.unobserve(el); ro.unobserve(g); } kids.forEach(n => el.appendChild(n)); track.remove(); delete el._mFill; });
  }

  /* ───────── 3 · steam wisps ───────── */
  function steam(el, n) {
    if (!el || !once(el, 'st')) return;
    n = min(max(n || num(data(el, 'steam'), 4), 1), 8);
    const s = mk('span', 'm-steam', el);
    for (let i = 0; i < n; i++) {
      const t = rnd(2.8, 4.4), wi = d.createElement('i');
      wi.style.cssText = `left:${8 + 84 * (i + .5) / n + rnd(-5, 5)}%;--t:${t.toFixed(2)}s;--d:${(-t * i / n - rnd(0, .6)).toFixed(2)}s`;
      s.appendChild(wi);
    }
    live(el);
    later(() => s.remove());
    return s;
  }

  /* ───────── 4 · particle canvas: petals | spice | embers | auto (theme default) ───────── */
  function sprite(type, c) {   // pre-rendered once per colour, then drawImage'd (fast on iOS)
    const cv = d.createElement('canvas'), x = cv.getContext('2d');
    const dot = (r, col, blur) => { x.shadowBlur = blur; x.shadowColor = x.fillStyle = col; x.beginPath(); x.arc(32, 32, r, 0, 7); x.fill(); };
    cv.width = cv.height = 64;
    if (type === 'petals') {           // marigold petal: teardrop + soft light/shade
      x.translate(32, 32);
      x.beginPath();
      x.moveTo(0, -28);
      x.bezierCurveTo(30, -24, 24, 18, 0, 28);
      x.bezierCurveTo(-24, 18, -30, -24, 0, -28);
      x.fillStyle = c;
      x.fill();
      x.globalCompositeOperation = 'source-atop';
      const g = x.createRadialGradient(-8, -12, 2, -4, -6, 30);
      g.addColorStop(0, 'rgba(255,255,255,.55)');
      g.addColorStop(1, 'rgba(0,0,0,.2)');
      x.fillStyle = g;
      x.fillRect(-32, -32, 64, 64);
    } else if (type === 'embers') {    // white-hot core inside a coloured glow
      dot(7, c, 22);
      dot(3.5, '#fffaec', 6);
    } else dot(12, c, 14);             // spice dust
    return cv;
  }
  function skin(s) {   // (re)read type + palette from CSS vars — runs again when data-theme flips
    let t = s.want;
    if (!PT[t]) t = cvar(s.el, '--m-particles');
    if (!PT[t]) t = 'petals';
    const cols = pal(s.el), key = t + cols;
    if (key === s.key) return;
    if (t !== s.type) s.ps = [];
    s.key = key; s.type = t;
    s.spr = (cols.length ? cols : ['#FFB000']).map(c => sprite(t, c));
    populate(s);
  }
  function spawn(s, init) {
    const t = s.type, H = s.h, p = { c: random() * 4 | 0, ph: rnd(0, 6.28), x: rnd(0, s.w), r: 0, vr: 0 };
    if (t === 'petals') {
      Object.assign(p, { z: rnd(12, 22), y: init ? rnd(-20, H) : -24, vy: rnd(.35, .9), vx: rnd(-.25, .25), r: rnd(0, 6.28), vr: rnd(-.03, .03), vp: rnd(.02, .05) });
    } else {
      const sp = t === 'spice';
      Object.assign(p, { z: sp ? rnd(2.5, 6) : rnd(10, 26), y: init ? rnd(0, H) : H + 12, vy: sp ? rnd(.12, .45) : rnd(.35, 1), vx: rnd(-.2, .2), vp: sp ? rnd(.02, .06) : rnd(.04, .1) });
    }
    return p;
  }
  function populate(s) {
    const T = PT[s.type];
    if (!s.w || !T) return;
    const n = min(w.innerWidth < 640 ? T[1] : T[2], round(s.w * s.h / T[0] * num(data(s.el, 'density'), 1)));
    while (s.ps.length < n) s.ps.push(spawn(s, 1));
    s.ps.length = n;
  }
  function size(s) {
    const W = s.el.clientWidth, H = s.el.clientHeight, r = min(w.devicePixelRatio || 1, 2);
    if (!W || !H || (W === s.w && H === s.h && r === s.r)) return;
    s.w = W; s.h = H; s.r = r;
    s.cv.width = round(W * r);
    s.cv.height = round(H * r);
    populate(s);
  }
  function step(s, f) {
    const x = s.ctx, r = s.r, W = s.w, H = s.h, t = s.type, sp = t === 'spice';
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.clearRect(0, 0, s.cv.width, s.cv.height);
    x.globalCompositeOperation = t === 'embers' ? 'lighter' : 'source-over';
    s.ps.forEach((p, i) => {
      let a = 1, sx = 1;
      p.ph += p.vp * f;
      if (t === 'petals') {       // drift down, sway, 3D flutter (scaleX = cos)
        p.y += p.vy * f;
        p.x += (p.vx + sin(p.ph) * .5) * f;
        p.r += p.vr * f;
        sx = cos(p.ph * 1.7);
        if (p.y > H + 24) s.ps[i] = spawn(s);
      } else {                    // rise; spice twinkles, embers fade out near the top
        p.y -= p.vy * f;
        p.x += (p.vx + sin(p.ph) * (sp ? .25 : .45)) * f;
        a = sp ? .35 + .65 * abs(sin(p.ph * 1.3)) : min(1, p.y / H * 1.4) * (.7 + .3 * sin(p.ph * 3));
        if (p.y < -24) s.ps[i] = spawn(s);
      }
      if (p.x < -24) p.x = W + 20; else if (p.x > W + 24) p.x = -20;
      if (a <= 0) return;
      const co = cos(p.r) * r, sn = sin(p.r) * r;
      x.globalAlpha = a;
      x.setTransform(co * sx, sn * sx, -sn, co, p.x * r, p.y * r);
      x.drawImage(s.spr[p.c % s.spr.length], -p.z / 2, -p.z / 2, p.z, p.z);
    });
  }
  function run() {
    if (!tid && !d.hidden && P.some(s => s.on)) { last = 0; tid = raf(tick); }
  }
  function tick(t) {
    const f = last ? min((t - last) / 16.667, 3) : 1;   // frame-rate independent
    let any = 0;
    tid = 0; last = t;
    P.forEach(s => { if (s.on && s.w) { any = 1; step(s, f); } });
    if (any && !d.hidden) tid = raf(tick);
  }
  function particles(el, type) {
    if (!el || reduced() || !once(el, 'pt')) return;
    const cv = mk('canvas', 'm-particles', el, 1), ctx = cv.getContext && cv.getContext('2d');
    later(() => { cv.remove(); delete el._mp; });
    if (!ctx) return;
    const s = el._mp = { el, cv, ctx, want: type || data(el, 'particles'), ps: [], on: !liveIO, w: 0, h: 0, r: 1 };
    P.push(s);
    size(s);
    skin(s);
    if (ro) ro.observe(el); else on(w, 'resize', () => size(s));
    live(el);
    run();
    return s;
  }

  /* ───────── 5 · tap burst: marigold petals (bazaar) / foil flakes (royal) ───────── */
  function burst(x, y, src) {
    if (reduced() || !de.animate) return;
    if (!layer || !layer.isConnected) { layer = mk('div', 'm-burst', d.body); later(() => { layer.remove(); layer = null; }); }
    const cols = pal(src || de), rad = cvar(src || de, '--m-petal-r');
    const n = min(num(src && data(src, 'burst'), 0) || (w.innerWidth < 640 ? 14 : 22), 40);
    for (let i = 0; i < n; i++) {
      const p = d.createElement('i'), z = rnd(8, 15), a = rnd(0, 6.283), v = rnd(70, 190);
      const dx = cos(a) * v, dy = sin(a) * v * .8 - 70, rt = rnd(-320, 320);
      p.style.cssText = `left:${x - z / 2}px;top:${y - z / 2}px;width:${z}px;height:${z * 1.25}px;background:${cols[i % cols.length]};border-radius:${rad || '50%'}`;
      layer.appendChild(p);
      p.animate([
        { transform: 'translate3d(0,0,0) rotate(0deg) scale(.3)', opacity: 1 },
        { transform: `translate3d(${dx}px,${dy}px,0) rotate(${rt / 2}deg) scale(1)`, opacity: 1, offset: .35 },
        { transform: `translate3d(${dx * 1.25}px,${dy + 160}px,0) rotate(${rt}deg) scale(.7)`, opacity: 0 }
      ], { duration: rnd(1000, 1500), easing: 'cubic-bezier(.2,.65,.35,1)', fill: 'forwards' }).onfinish = () => p.remove();
    }
  }

  /* ───────── 7 · ripple ───────── */
  function ripple(el, x, y) {
    if (reduced()) return;
    const r = rect(el), s = max(r.width, r.height) * 2.2, sp = mk('span', 'm-ripple', el);
    sp.style.cssText = `width:${s}px;height:${s}px;left:${(x == null ? r.width / 2 : x - r.left) - s / 2}px;top:${(y == null ? r.height / 2 : y - r.top) - s / 2}px`;
    setTimeout(() => sp.remove(), 800);
  }

  /* ───────── 6 + 7 · tilt (+ [data-depth] parallax + glare) and magnetic — pointer, rAF-batched ───────── */
  function arm(el) {
    if (once(el, 'tl')) {
      el._mMax = num(data(el, 'tilt'), num(cvar(el, '--m-tilt'), 10));
      const gl = mk('span', 'm-glare', el);
      later(() => gl.remove());
    }
    cl(el, 'm-tilt', 1);
  }
  function rest(el) {
    if (!el) return;
    cl(el, 'm-tilt m-active', 0);
    VARS.forEach(k => el.style.removeProperty(k));
    el._mx = el._my = 0;
  }
  function frame() {
    pid = 0;
    const a = tilt && rect(tilt), b = mag && rect(mag);   // all reads …
    if (a && a.width) {                                   // … then all writes
      const nx = clamp((px - a.left) / a.width * 2 - 1), ny = clamp((py - a.top) / a.height * 2 - 1), m = tilt._mMax;
      css(tilt, '--m-rx', (-ny * m).toFixed(2) + 'deg');
      css(tilt, '--m-ry', (nx * m).toFixed(2) + 'deg');
      css(tilt, '--m-px', nx.toFixed(3));
      css(tilt, '--m-py', ny.toFixed(3));
    }
    if (b && b.width) {
      const k = num(data(mag, 'magnetic'), .35);
      mag._mx = (px - (b.left - (mag._mx || 0) + b.width / 2)) * k;   // offset from the *untranslated* centre
      mag._my = (py - (b.top - (mag._my || 0) + b.height / 2)) * k;
      css(mag, '--m-mx', mag._mx.toFixed(1) + 'px');
      css(mag, '--m-my', mag._my.toFixed(1) + 'px');
    }
  }
  const queue = () => { if (!pid && (tilt || mag)) pid = raf(frame); };
  function onMove(e) {
    const t = e.target;
    if (reduced() || e.pointerType === 'touch' || !t.closest) return;
    const tl = t.closest('[data-tilt]'), mg = t.closest('[data-magnetic]');
    if (tl !== tilt) { rest(tilt); tilt = tl; if (tl) arm(tl); }
    if (mg !== mag) { rest(mag); mag = mg; if (mg) cl(mg, 'm-active', 1); }
    px = e.clientX; py = e.clientY;
    queue();
  }
  function onDown(e) {
    const t = e.target;
    if (!t.closest) return;
    const rp = t.closest('[data-ripple]');
    if (rp) ripple(rp, e.clientX, e.clientY);
    if (e.pointerType === 'touch' && !reduced()) {        // touch: tilt toward the finger while pressed
      const tl = t.closest('[data-tilt]');
      if (tl !== tilt) rest(tilt);
      tilt = tl;
      if (tl) { arm(tl); px = e.clientX; py = e.clientY; queue(); }
    }
  }
  const onUp = e => { if (e.pointerType === 'touch') { rest(tilt); tilt = null; } };

  /* ───────── 9 · sticky header shrink + progress bar ───────── */
  const measure = () => { maxS = max(de.scrollHeight - w.innerHeight, 0); onScroll(); };
  const onScroll = () => { if (!sid) sid = raf(scrolled); };
  function scrolled() {
    const y = w.pageYOffset;
    sid = 0;
    heads.forEach(h => { const s = y > h._mT; if (s !== has(h, 'm-shrunk')) cl(h, 'm-shrunk', s); });
    bars.forEach(b => (b.style.transform = `scaleX(${(maxS ? min(y / maxS, 1) : 0).toFixed(4)})`));
  }

  /* ───────── 11 · curtain / arch-wipe transitions (progressive enhancement) ───────── */
  function veil(shape) {
    if (!veilEl) { veilEl = mk('div', 'm-curtain', d.body); later(() => { veilEl.remove(); veilEl = null; }); }
    veilEl.setAttribute('data-shape', shape || '');
    return veilEl;
  }
  const vms = () => num(cvar(de, '--m-curtain-ms'), 700) + 140;
  function cover(shape, cb) {
    const c = veil(shape);
    cl(c, 'm-lift m-now', 0);
    void c.offsetWidth;            // commit start state (one-off, on click)
    cl(c, 'm-cover', 1);
    setTimeout(cb, vms());
  }
  function lift() {
    const c = veilEl;
    if (!c || !has(c, 'm-cover')) return;
    cl(c, 'm-lift', 1);
    setTimeout(() => { cl(c, 'm-now', 1); cl(c, 'm-cover m-lift', 0); }, vms());
  }
  function arrive() {
    let v = '';
    try { v = sessionStorage.getItem(KEY) || ''; sessionStorage.removeItem(KEY); } catch (x) {}
    const p = v.split('|');
    if (Date.now() - num(p[0], 0) < 8000 && !reduced()) {
      const c = veil(p[1]);
      cl(c, 'm-now m-cover', 1);
      void c.offsetWidth;
      cl(c, 'm-now', 0);
      setTimeout(lift, 120);
    }
    cl(de, 'm-arrive', 0);
  }
  function go(url, shape) {
    if (reduced()) return (location.href = url);
    cover(shape, () => {
      try { sessionStorage.setItem(KEY, Date.now() + '|' + (shape || '')); } catch (x) {}
      location.href = url;
      setTimeout(lift, 5000);   // safety: never leave a page covered if navigation stalls
    });
  }

  /* ───────── 12 · smooth anchors + all delegated clicks ───────── */
  function onClick(e) {
    const t = e.target, L = location;
    if (!t.closest) return;
    const b = t.closest('[data-burst]');
    if (b) {
      if (e.detail && (e.clientX || e.clientY)) burst(e.clientX, e.clientY, b);
      else { const r = rect(b); burst(r.left + r.width / 2, r.top + r.height / 2, b); }
    }
    const rp = !e.detail && t.closest('[data-ripple]');     // keyboard activation → centred ripple
    if (rp) ripple(rp);
    const mq = t.closest('[data-marquee]');
    if (mq && !t.closest('a,button')) mq.classList.toggle('m-paused');   // tap to pause (WCAG 2.2.2)
    const a = t.closest('a[href]');
    if (!a || typeof a.href !== 'string' || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ||
      (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    const u = new URL(a.href, L.href);
    if (u.protocol + u.host !== L.protocol + L.host) return;
    const tr = a.closest('[data-transition]'), shape = tr && data(tr, 'transition'), fx = tr && !reduced();
    if (u.pathname === L.pathname && u.search === L.search && u.hash) {
      const id = decodeURIComponent(u.hash.slice(1)), tg = id && d.getElementById(id);
      if (!tg && id && id !== 'top') return;
      e.preventDefault();
      const jump = smooth => {
        const behavior = smooth ? 'smooth' : 'auto';
        if (tg) tg.scrollIntoView({ behavior }); else w.scrollTo({ top: 0, behavior });
        try { if (L.hash !== u.hash) history.pushState(null, '', u.hash); } catch (x) {}
        if (!tg) return;
        if (!tg.matches(FOC)) tg.setAttribute('tabindex', '-1');
        try { tg.focus({ preventScroll: true }); } catch (x) {}   // move keyboard focus with the scroll
      };
      if (fx) cover(shape, () => { jump(); lift(); }); else jump(!reduced());
    } else if (fx) {
      e.preventDefault();
      go(a.href, shape);
    }
  }

  /* ───────── boot / scan / destroy ───────── */
  function boot() {
    booted = true;
    cl(de, 'm-js', 1);
    if ('IntersectionObserver' in w) {
      enterIO = new IntersectionObserver(onEnter, { rootMargin: '0px 0px -6%', threshold: .1 });
      liveIO = new IntersectionObserver(es => {   // pause CSS loops + canvases when offscreen
        es.forEach(e => { const t = e.target; cl(t, 'm-off', !e.isIntersecting); if (t._mp) t._mp.on = e.isIntersecting; });
        run();
      }, { rootMargin: '60px' });
    }
    if ('ResizeObserver' in w) {
      ro = new ResizeObserver(es => es.forEach(({ target: t }) => {
        if (t._mp) size(t._mp);
        if (t._mFill) t._mFill();
        if (t === d.body) measure();
      }));
      ro.observe(d.body);
    } else on(w, 'resize', measure);
    if (w.MutationObserver) {
      mo = new MutationObserver(() => P.forEach(skin));
      mo.observe(de, { attributes: true, subtree: true, attributeFilter: ['data-theme'] });
    }
    later(() => {
      [enterIO, liveIO, ro, mo].forEach(o => o && o.disconnect());
      caf(tid); caf(sid); caf(pid);
      bars.forEach(b => (b.style.transform = ''));
      $$('.' + CLS.replace(/ /g, ',.')).forEach(e => cl(e, CLS, 0));
      $$('[style*="--m-"]').forEach(e => VARS.forEach(k => e.style.removeProperty(k)));
      tid = sid = pid = 0;
      enterIO = liveIO = ro = mo = tilt = mag = null;
      P = []; heads = []; bars = [];
      booted = false;
      cl(de, 'm-js m-arrive', 0);
      RM.onchange = null;
    });
    on(d, 'click', onClick);
    const pas = { passive: true };
    on(d, 'pointerdown', onDown, pas);
    on(d, 'pointermove', onMove, pas);
    on(d, 'pointerup', onUp, pas);
    on(d, 'pointercancel', onUp, pas);
    on(w, 'scroll', onScroll, pas);
    on(d, 'visibilitychange', () => { if (d.hidden) { caf(tid); tid = 0; } else run(); });
    on(w, 'pageshow', e => {        // back/forward cache: never return to a covered page
      if (e.persisted && veilEl) { cl(veilEl, 'm-now', 1); cl(veilEl, 'm-cover m-lift', 0); }
    });
    RM.onchange = () => { const o = opts; destroy(); init(o); };   // user flips reduced-motion → rebuild
    arrive();
  }
  function scan(r) {
    r = r || d;
    const each = (sel, k, f) => $$(sel, r).forEach(el => once(el, k) && f(el));
    each('[data-stagger]', 'sg', stagger);
    each('[data-reveal],.draw-underline', 'rv', watch);
    each('[data-wave]', 'wv', wave);
    each('[data-count]', 'ct', counter);
    each('[data-marquee]', 'mq', marquee);
    $$('[data-steam]', r).forEach(el => steam(el));
    $$('[data-particles]', r).forEach(el => particles(el));
    each('[data-header]', 'hd', el => { el._mT = num(data(el, 'header'), 40); heads.push(el); });
    each('[data-progress]', 'pg', el => bars.push(el));
    $$(LIVE, r).forEach(live);
    measure();
  }
  function init(o) {
    if (o) opts = o;
    if (!booted) boot();
    scan();
    return api;
  }
  function destroy() {
    const c = C;
    C = [];
    c.reverse().forEach(f => { try { f(); } catch (x) {} });
    return api;
  }

  const api = {
    init,
    destroy,
    burst,
    steam,
    particles,
    curtain: (shape, cb) => reduced() ? cb && cb() : cover(shape, () => { if (cb) cb(); lift(); }),
    go
  };
  w.Motion = api;

  const me = d.currentScript;
  if (!(me && me.hasAttribute('data-manual'))) {
    cl(de, 'm-js', 1);
    if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', () => init()); else init();
  }
})(window, document);

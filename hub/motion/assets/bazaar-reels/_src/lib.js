/* Curry District · Bazaar reels — deterministic motion runtime.
 * Every animated property is a pure function of t (seconds). No CSS animations, no Math.random:
 * randomness comes from a seeded PRNG at build time only. Scenes expose window.renderAt(t).
 */
(function (w) {
  'use strict';
  const TAU = Math.PI * 2;
  const C = {
    ink: '#1D1147', cream: '#FFF4DC', marigold: '#FFB000', saffron: '#FF6A13', rani: '#E4147E',
    chili: '#D62839', peacock: '#00A8A0', cilantro: '#3FA34D', violet: '#7B5CFF', sand: '#FFE7B8',
    white: '#FFFFFF', plum: '#3A1B7A', brown: '#8A3A1E'
  };
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const lerp = (a, b, p) => a + (b - a) * p;
  const mod = (a, n) => ((a % n) + n) % n;
  const E = {
    lin: x => x,
    inQuad: x => x * x,
    outQuad: x => 1 - (1 - x) * (1 - x),
    inOutQuad: x => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2),
    inCubic: x => x * x * x,
    outCubic: x => 1 - Math.pow(1 - x, 3),
    inOutCubic: x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    outQuart: x => 1 - Math.pow(1 - x, 4),
    outExpo: x => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
    inOutSine: x => -(Math.cos(Math.PI * x) - 1) / 2,
    outBack: x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
    outBackBig: x => { const c1 = 2.8, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
    inBack: x => { const c1 = 1.70158; return (c1 + 1) * x * x * x - c1 * x * x; },
    // damped spring that lands (≈1) at x = 1
    spring: x => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-6.2 * x) * Math.cos(TAU * 1.55 * x)),
    springSoft: x => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-5 * x) * Math.cos(TAU * 1.1 * x)),
    // 0 → 1 → 0 bump
    bump: x => Math.sin(Math.PI * clamp(x))
  };
  // keyframes: [[t, v], [t, v, ease], ...]; ease = easing INTO that key
  function K(t, keys) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const k = keys[i];
      if (t <= k[0]) {
        const p = keys[i - 1];
        const u = (t - p[0]) / (k[0] - p[0] || 1);
        return p[1] + (k[1] - p[1]) * (k[2] || E.inOutCubic)(u);
      }
    }
    return keys[keys.length - 1][1];
  }
  // seeded PRNG (mulberry32)
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // colour mix (hex)
  function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function mix(a, b, p) {
    const A = hex2rgb(a), B = hex2rgb(b);
    return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * clamp(p))).join(',') + ')';
  }

  /* ── DOM ── */
  const NS = 'http://www.w3.org/2000/svg';
  function h(tag, attrs, parent, html) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'style' && typeof attrs[k] === 'object') Object.assign(e.style, attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  }
  function s(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  // absolute-positioned layer box centred at (cx, cy) with size (w, h)
  function box(parent, cx, cy, wd, ht, cls, html) {
    return h('div', { class: 'abs ' + (cls || ''), style: { left: (cx - wd / 2) + 'px', top: (cy - ht / 2) + 'px', width: wd + 'px', height: ht + 'px' } }, parent, html);
  }
  // transform setter for HTML (px) or SVG-with-CSS (user units)
  function T(e, o) {
    const sc = o.s == null ? 1 : o.s;
    const sx = (o.sx == null ? 1 : o.sx) * sc, sy = (o.sy == null ? 1 : o.sy) * sc;
    e.style.transform = 'translate(' + (o.x || 0).toFixed(2) + 'px,' + (o.y || 0).toFixed(2) + 'px) rotate(' + (o.r || 0).toFixed(3) + 'deg) scale(' + sx.toFixed(4) + ',' + sy.toFixed(4) + ')';
    if (o.o != null) e.style.opacity = clamp(o.o).toFixed(3);
  }
  // SVG attribute transform around a pivot
  function ST(e, o, px, py) {
    const sc = o.s == null ? 1 : o.s;
    const sx = (o.sx == null ? 1 : o.sx) * sc, sy = (o.sy == null ? 1 : o.sy) * sc;
    e.setAttribute('transform', 'translate(' + ((o.x || 0) + px) + ' ' + ((o.y || 0) + py) + ') rotate(' + (o.r || 0) + ') scale(' + sx + ' ' + sy + ') translate(' + (-px) + ' ' + (-py) + ')');
    if (o.o != null) e.setAttribute('opacity', clamp(o.o));
  }

  /* ── shapes ── */
  function sunburstSVG(n, c1, c2, r, extra) {
    let p = '';
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * TAU, a1 = ((i + 1) / n) * TAU;
      p += '<path d="M0 0L' + (Math.cos(a0) * r).toFixed(1) + ' ' + (Math.sin(a0) * r).toFixed(1) + 'L' + (Math.cos(a1) * r).toFixed(1) + ' ' + (Math.sin(a1) * r).toFixed(1) + 'Z" fill="' + (i % 2 ? c2 : c1) + '"/>';
    }
    return '<svg viewBox="' + (-r) + ' ' + (-r) + ' ' + 2 * r + ' ' + 2 * r + '" width="100%" height="100%" aria-hidden="true">' + p + (extra || '') + '</svg>';
  }
  const STAR4 = 'M0 -1Q0.18 -0.18 1 0Q0.18 0.18 0 1Q-0.18 0.18 -1 0Q-0.18 -0.18 0 -1Z';
  const PETAL = 'M0 -1C0.55 -0.75 0.62 0.35 0 1C-0.62 0.35 -0.55 -0.75 0 -1Z';

  /* ── steam & sparkles inside an inlined dish SVG ── */
  function steamOf(root, opt) {
    opt = opt || {};
    return Array.prototype.map.call(root.querySelectorAll('.steam path'), (p, i) => {
      const L = p.getTotalLength();
      const a = p.getPointAtLength(0), b = p.getPointAtLength(L);
      if (opt.stroke) p.setAttribute('stroke', opt.stroke);
      return { p, L, rev: a.y < b.y, i };
    });
  }
  // period seconds per rise; dash fraction of path length
  function steamAt(items, t, period, frac, fade) {
    period = period || 1.6; frac = frac || 0.55;
    items.forEach(it => {
      const ph = mod(t / period + it.i * 0.37, 1);
      const d = it.L * frac;
      it.p.setAttribute('stroke-dasharray', d.toFixed(1) + ' ' + (it.L * 2 + d).toFixed(1));
      const off = it.rev ? ph * (it.L + d) - it.L : d - ph * (it.L + d);
      it.p.setAttribute('stroke-dashoffset', off.toFixed(1));
      it.p.setAttribute('opacity', ((fade == null ? 1 : fade) * (0.25 + 0.75 * Math.sin(Math.PI * ph))).toFixed(3));
    });
  }
  function sparklesOf(root) {
    return Array.prototype.map.call(root.querySelectorAll('.sparkle'), (g, i) => {
      const b = g.getBBox();
      return { g, cx: b.x + b.width / 2, cy: b.y + b.height / 2, ph: (i * 0.618) % 1 };
    });
  }
  function sparkleAt(items, t, period, gain) {
    period = period || 1.2; gain = gain == null ? 1 : gain;
    items.forEach(it => {
      const ph = mod(t / period + it.ph, 1);
      const sc = gain * (0.45 + 0.75 * Math.pow(Math.sin(Math.PI * ph), 2));
      it.g.setAttribute('transform', 'translate(' + it.cx + ' ' + it.cy + ') rotate(' + (ph * 90).toFixed(2) + ') scale(' + sc.toFixed(3) + ') translate(' + (-it.cx) + ' ' + (-it.cy) + ')');
    });
  }

  /* ── Dish: inlined illustration with steam + sparkle drivers ── */
  function Dish(parent, key, cx, cy, size, opt) {
    opt = opt || {};
    const wrap = box(parent, cx, cy, size, size, 'dish');
    wrap.innerHTML = A.dish[key];
    const svg = wrap.querySelector('svg');
    svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    svg.setAttribute('aria-hidden', 'true');
    const steam = steamOf(svg, opt);
    if (opt.steamWidth) svg.querySelectorAll('.steam').forEach(g => g.setAttribute('stroke-width', opt.steamWidth));
    const sp = sparklesOf(svg);
    return {
      el: wrap, svg,
      at(t, fade) { steamAt(steam, t, opt.steamPeriod || 1.6, 0.55, fade); sparkleAt(sp, t, opt.sparklePeriod || 1.2, opt.sparkleGain); }
    };
  }

  /* ── sparkle burst (4-point stars flying out) ── */
  function Burst(parent, cx, cy, n, seed, opt) {
    opt = opt || {};
    const R = rng(seed);
    const cols = opt.colors || [C.marigold, C.rani, C.peacock, C.cream];
    const svg = s('svg', { viewBox: '-540 -540 1080 1080', width: 1080, height: 1080, class: 'abs', style: 'left:' + (cx - 540) + 'px;top:' + (cy - 540) + 'px;overflow:visible', 'aria-hidden': 'true' }, parent);
    const parts = [];
    for (let i = 0; i < n; i++) {
      const g = s('path', { d: STAR4, fill: cols[i % cols.length], stroke: C.ink, 'stroke-width': 0.09, 'stroke-linejoin': 'round' }, svg);
      const a = (i / n) * TAU + (R() - 0.5) * 0.5;
      parts.push({ g, a, d: (opt.dist || 330) * (0.65 + R() * 0.55), sz: (opt.size || 30) * (0.6 + R() * 0.7), rot: (R() - 0.5) * 180 });
    }
    return {
      at(t) { // t = local time since burst (s)
        const dur = opt.dur || 0.7;
        parts.forEach((p, i) => {
          const u = clamp(t / dur);
          if (t < 0 || u >= 1) { p.g.setAttribute('opacity', 0); return; }
          const e = E.outCubic(u), r0 = opt.r0 || 60;
          const rr = r0 + p.d * e;
          const sc = p.sz * (u < 0.25 ? E.outBack(u / 0.25) : 1 - E.inQuad((u - 0.25) / 0.75));
          p.g.setAttribute('opacity', 1);
          p.g.setAttribute('transform', 'translate(' + (Math.cos(p.a) * rr).toFixed(1) + ' ' + (Math.sin(p.a) * rr).toFixed(1) + ') rotate(' + (p.rot * u) + ') scale(' + Math.max(0.001, sc).toFixed(2) + ')');
        });
      }
    };
  }

  /* ── marigold petal confetti: ballistic burst or looping fall ── */
  function Petals(parent, W, H, n, seed, opt) {
    opt = opt || {};
    const R = rng(seed);
    const cols = opt.colors || [C.marigold, C.saffron, C.rani, C.marigold, C.cream, C.peacock];
    const svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, class: 'abs', style: 'left:0;top:0;overflow:visible', 'aria-hidden': 'true' }, parent);
    const P = [];
    for (let i = 0; i < n; i++) {
      const g = s('path', { d: PETAL, fill: cols[i % cols.length], stroke: C.ink, 'stroke-width': 0.12 }, svg);
      P.push({ g, x0: R() * W, y0: R() * H, vx: (R() - 0.5), vy: R(), sz: (opt.size || 18) * (0.6 + R() * 0.8), spin: (R() - 0.5) * 720, ph: R(), sway: 20 + R() * 40 });
    }
    return {
      svg,
      burstAt(t, ox, oy) { // ballistic from (ox, oy), t local
        P.forEach(p => {
          if (t < 0 || t > 2.6) { p.g.setAttribute('opacity', 0); return; }
          const sp = 900 + p.vy * 900, a = -Math.PI / 2 + p.vx * 2.6;
          const r0 = (opt.spread || 90) * p.ph;
          const x = ox + Math.cos(a) * (sp * t * 0.9 + r0) + Math.sin((t + p.ph) * 6) * p.sway * 0.5;
          const y = oy + Math.sin(a) * (sp * t + r0) + 0.5 * 2600 * t * t * 0.55;
          const drag = Math.min(1, t * 1.2);
          p.g.setAttribute('opacity', t > 2.1 ? 1 - (t - 2.1) / 0.5 : 1);
          p.g.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + (p.spin * t + p.ph * 360).toFixed(1) + ') scale(' + (p.sz * (0.85 + 0.15 * Math.cos(t * 9 + p.ph * 6))).toFixed(2) + ',' + (p.sz * (0.6 + 0.4 * Math.cos(t * 7 + p.ph * 9) * (1 - drag * 0.3))).toFixed(2) + ')');
        });
      },
      fallAt(t, period) { // seamless loop: each petal falls through the frame once per period
        P.forEach(p => {
          const ph = mod(t / period + p.ph, 1);
          const y = -60 + ph * (H + 120);
          const x = p.x0 + Math.sin(TAU * (ph * 2 + p.ph)) * p.sway;
          p.g.setAttribute('opacity', 1);
          p.g.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + (360 * Math.round(p.spin / 360 || 1) * ph + p.ph * 360).toFixed(1) + ') scale(' + p.sz.toFixed(2) + ',' + (p.sz * (0.55 + 0.45 * Math.abs(Math.cos(TAU * 2 * ph + p.ph)))).toFixed(2) + ')');
        });
      }
    };
  }

  /* ── bunting string with flags that unfurl left→right ── */
  function Bunting(parent, W, y0, sag, n, opt) {
    opt = opt || {};
    const cols = opt.colors || [C.rani, C.marigold, C.peacock, C.saffron, C.cream, C.cilantro];
    const fw = opt.flagW || 70, fh = opt.flagH || 92;
    const svg = s('svg', { viewBox: '0 0 ' + W + ' ' + (y0 + sag + fh + 40), width: W, height: y0 + sag + fh + 40, class: 'abs', style: 'left:0;top:0;overflow:visible', 'aria-hidden': 'true' }, parent);
    const x0 = -20, x1 = W + 20;
    const pt = u => { const x = lerp(x0, x1, u); const y = y0 + sag * 4 * u * (1 - u); return [x, y]; };
    const line = s('path', { d: 'M' + x0 + ' ' + y0 + 'Q' + W / 2 + ' ' + (y0 + 2 * sag) + ' ' + x1 + ' ' + y0, fill: 'none', stroke: C.ink, 'stroke-width': opt.lineW || 6, 'stroke-linecap': 'round' }, svg);
    const L = line.getTotalLength();
    line.setAttribute('stroke-dasharray', L + ' ' + L);
    const flags = [];
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n;
      const [x, y] = pt(u);
      const [xa, ya] = pt(u - 0.01), [xb, yb] = pt(u + 0.01);
      const ang = Math.atan2(yb - ya, xb - xa) * 180 / Math.PI;
      const g = s('g', {}, svg);
      const c = cols[i % cols.length];
      s('path', { d: 'M' + (-fw / 2) + ' 0L' + (fw / 2) + ' 0L0 ' + fh + 'Z', fill: c, stroke: C.ink, 'stroke-width': opt.flagStroke || 5, 'stroke-linejoin': 'round' }, g);
      s('circle', { cx: 0, cy: fh * 0.32, r: fw * 0.11, fill: c === C.cream ? C.rani : C.cream, stroke: C.ink, 'stroke-width': 3 }, g);
      flags.push({ g, x, y, ang, u, i });
    }
    return {
      svg,
      at(t, t0, dur) { // unfurl from t0 over dur seconds, then a gentle sway forever
        const p = seg(t, t0, t0 + dur);
        line.setAttribute('stroke-dashoffset', (L * (1 - E.outCubic(p))).toFixed(1));
        flags.forEach(f => {
          const ft = t - (t0 + f.u * dur * 0.9);
          const vis = ft > 0;
          const sp = vis ? E.spring(clamp(ft / 0.7)) : 0;
          const sway = Math.sin(t * 2.4 + f.i * 0.9) * 4;
          const rot = f.ang + (1 - sp) * -100 + sway * (vis ? 1 : 0);
          f.g.setAttribute('opacity', vis ? 1 : 0);
          f.g.setAttribute('transform', 'translate(' + f.x.toFixed(1) + ' ' + f.y.toFixed(1) + ') rotate(' + rot.toFixed(2) + ') scale(' + Math.max(0.01, Math.min(1, sp * 1.1)).toFixed(3) + ')');
        });
      },
      loopAt(t, period) { // seamless sway for loops (fully unfurled)
        line.setAttribute('stroke-dashoffset', 0);
        flags.forEach(f => {
          const sway = Math.sin(TAU * t / period * 2 + f.i * 0.9) * 5;
          f.g.setAttribute('opacity', 1);
          f.g.setAttribute('transform', 'translate(' + f.x.toFixed(1) + ' ' + f.y.toFixed(1) + ') rotate(' + (f.ang + sway).toFixed(2) + ')');
        });
      }
    };
  }

  /* ── Logo: emblem (gate · sun · steam · bowl) + CURRY + DISTRICT sign, rebuilt from brand/logo/bazaar ── */
  function pathsOf(svgText) {
    const d = document.createElement('div'); d.innerHTML = svgText;
    return Array.prototype.slice.call(d.querySelectorAll('path')).map(p => ({ fill: p.getAttribute('fill'), d: p.getAttribute('d') }));
  }
  function pathMarkup(list) { return list.map(p => '<path fill="' + p.fill + '" d="' + p.d + '"/>').join(''); }
  let uid = 0;
  function Logo(parent, opt) {
    // opt: {layout:'stacked'|'horizontal'|'emblem', cx, cy, scale}
    opt = opt || {};
    const id = 'lg' + (++uid);
    const ep = pathsOf(A.emblem);       // 10 paths
    const wp = pathsOf(A.wordText);     // 5 paths: CURRY(2) + DISTRICT(3)
    const root = h('div', { class: 'abs logo', style: { left: '0px', top: '0px', width: '0px', height: '0px' } }, parent);
    // emblem svg: viewBox -4 -4 218 249.11 → we use 0..218 coordinates (shifted)
    const em = h('div', { class: 'abs', style: { width: '218px', height: '249px', transformOrigin: '50% 50%' } }, root);
    em.innerHTML = '<svg viewBox="-4 -4 218 249.11" width="218" height="249" overflow="visible" aria-hidden="true">' +
      '<defs><clipPath id="' + id + 'sky"><path d="' + ep[2].d + '"/></clipPath>' +
      '<clipPath id="' + id + 'st"><rect class="stc" x="-10" y="110" width="240" height="0"/></clipPath>' +
      '<clipPath id="' + id + 'bt"><rect class="btc" x="0" y="170" width="0" height="40"/></clipPath></defs>' +
      '<g class="gate">' + pathMarkup(ep.slice(0, 4)) + '</g>' +
      '<g clip-path="url(#' + id + 'sky)"><g class="sun">' + pathMarkup(ep.slice(4, 6)) + '</g></g>' +
      '<g clip-path="url(#' + id + 'st)"><g class="steamg">' + pathMarkup(ep.slice(6, 7)) + '</g></g>' +
      '<g class="bowl">' + pathMarkup(ep.slice(7, 9)) + '<g clip-path="url(#' + id + 'bt)">' + pathMarkup(ep.slice(9, 10)) + '</g></g>' +
      '</svg>';
    const curry = h('div', { class: 'abs', style: { width: '579px', height: '150px', transformOrigin: '50% 100%' } }, root);
    curry.innerHTML = '<svg viewBox="-284.57 -12 579.14 150" width="579" height="150" overflow="visible" aria-hidden="true">' + pathMarkup(wp.slice(0, 2)) + '</svg>';
    const dist = h('div', { class: 'abs', style: { width: '579px', height: '124px', transformOrigin: '50% 0%' } }, root);
    dist.innerHTML = '<svg viewBox="-284.57 136 579.14 124" width="579" height="124" overflow="visible" aria-hidden="true">' + pathMarkup(wp.slice(2, 5)) + '</svg>';
    const q = sel => em.querySelector(sel);
    const sun = q('.sun'), stc = q('.stc'), btc = q('.btc'), steamg = q('.steamg');
    // positions measured from brand/logo/bazaar/wordmark-stacked.svg & wordmark-horizontal.svg
    const lay = {};
    const sc = opt.scale || 1;
    let anchor;
    if (opt.layout === 'horizontal') {
      lay.em = { x: 107.1, y: 123.0, s: 1.02 }; lay.cu = { x: 531.74, y: 63, s: 1 }; lay.di = { x: 460.04, y: 198, s: 1 };
      anchor = [404.6, 123];
    } else {
      lay.em = { x: 7.4, y: 178.4, s: 1.48 }; lay.cu = { x: 5, y: 427.04, s: 1 }; lay.di = { x: 5, y: 562.04, s: 1 };
      anchor = [0, 305];
    }
    root.style.left = (opt.cx - anchor[0] * sc) + 'px'; root.style.top = (opt.cy - anchor[1] * sc) + 'px';
    root.style.transform = 'scale(' + sc + ')';
    root.style.transformOrigin = '0 0';
    function place(e, ww, hh, L, o) {
      // centre box at L.x, L.y (in logo units) then apply animated transform o
      e.style.left = (L.x - ww / 2) + 'px'; e.style.top = (L.y - hh / 2) + 'px';
      T(e, Object.assign({}, o, { s: (o.s == null ? 1 : o.s) * L.s }));
    }
    const rl = opt.cx - anchor[0] * sc, rt = opt.cy - anchor[1] * sc;
    return {
      root,
      // page coords of a point in emblem units (e.g. sun centre = 100,160)
      emPt(x, y) { return [rl + (lay.em.x + (x - 105) * lay.em.s) * sc, rt + (lay.em.y + (y - 120.55) * lay.em.s) * sc]; },
      at(t, k) { // k: timing table (seconds, local)
        k = Object.assign({ gate: 0, sun: 0.35, steam: 0.9, bunt: 0.95, curry: 1.55, dist: 1.85 }, k || {});
        // emblem pop
        const gp = seg(t, k.gate, k.gate + 0.55);
        place(em, 218, 249, lay.em, { s: Math.max(0.001, E.spring(gp)), r: (1 - E.outCubic(gp)) * -10, o: gp > 0 ? 1 : 0 });
        // sun rise (overshoots slightly, settles)
        const sp = seg(t, k.sun, k.sun + 0.85);
        const sy = K(sp, [[0, 125], [0.75, -8, E.outCubic], [1, 0, E.inOutSine]]);
        sun.setAttribute('transform', 'translate(0 ' + sy.toFixed(2) + ')');
        // steam reveal upward, then breathe
        const st = seg(t, k.steam, k.steam + 0.6);
        const top = lerp(110, -6, E.outCubic(st));
        stc.setAttribute('y', top); stc.setAttribute('height', 110 - top);
        const br = t > k.steam ? Math.sin((t - k.steam) * 3.2) : 0;
        steamg.setAttribute('transform', 'translate(100 100) skewX(' + (br * 3).toFixed(2) + ') translate(-100 -100) translate(0 ' + (-1.5 * Math.abs(br)).toFixed(2) + ')');
        // bowl bunting wipe
        const bp = E.outCubic(seg(t, k.bunt, k.bunt + 0.5));
        btc.setAttribute('width', (210 * bp).toFixed(1));
        // CURRY slam with squash & stretch (origin bottom-centre)
        const c0 = k.curry, imp = c0 + 0.22;
        let cy = 0, csx = 1, csy = 1, co = 1;
        if (t < c0) { co = 0; }
        else if (t < imp) { const u = (t - c0) / 0.22; cy = lerp(-900, 0, E.inQuad(u)); csy = lerp(1.35, 1.25, u); csx = lerp(0.8, 0.86, u); }
        else {
          const u = t - imp;
          csy = K(u, [[0, 0.62], [0.09, 1.12, E.outQuad], [0.2, 0.95, E.inOutSine], [0.32, 1.02, E.inOutSine], [0.45, 1, E.inOutSine]]);
          csx = K(u, [[0, 1.3], [0.09, 0.93, E.outQuad], [0.2, 1.04, E.inOutSine], [0.32, 0.99, E.inOutSine], [0.45, 1, E.inOutSine]]);
        }
        place(curry, 579, 150, lay.cu, { y: cy, sx: csx, sy: csy, o: co });
        // DISTRICT sign: drops & swings from its top edge
        const dp = seg(t, k.dist, k.dist + 0.9);
        const dr = t < k.dist ? 0 : K(dp, [[0, -16], [0.22, 9, E.outQuad], [0.45, -4.5, E.inOutSine], [0.68, 2, E.inOutSine], [1, 0, E.inOutSine]]);
        const dy = t < k.dist ? -60 : lerp(-60, 0, E.outBack(seg(t, k.dist, k.dist + 0.3)));
        place(dist, 579, 124, lay.di, { y: dy, r: dr, s: t < k.dist ? 0.001 : Math.max(0.001, E.outBack(seg(t, k.dist, k.dist + 0.28))), o: t < k.dist ? 0 : 1 });
        return { impact: imp };
      },
      impactAt(k) { return (k && k.curry != null ? k.curry : 1.55) + 0.22; }
    };
  }

  /* ── helpers for loops ── */
  const osc = (t, period, phase) => Math.sin(TAU * (t / period + (phase || 0)));
  // shrink an element's font-size until its width fits maxW (layout-time only)
  function fit(e, maxW) {
    let fs = parseFloat(getComputedStyle(e).fontSize);
    for (let i = 0; i < 40 && e.scrollWidth > maxW; i++) { fs *= 0.96; e.style.fontSize = fs.toFixed(1) + 'px'; }
    return fs;
  }
  // scalloped "rangoli plate" disc
  function scallopSVG(R, n, bump, fillOuter, fillInner, ring, sw) {
    let sc = '';
    for (let k = 0; k < n; k++) { const a = k / n * TAU; sc += '<circle cx="' + (Math.cos(a) * R).toFixed(1) + '" cy="' + (Math.sin(a) * R).toFixed(1) + '" r="' + bump + '"/>'; }
    const S = R + bump + 30;
    sw = sw || 7;
    return '<svg viewBox="' + (-S) + ' ' + (-S) + ' ' + 2 * S + ' ' + 2 * S + '" width="100%" height="100%" aria-hidden="true">' +
      '<g transform="translate(14 14)" fill="#1D1147">' + sc + '<circle r="' + R + '"/></g>' +
      '<g fill="' + fillOuter + '" stroke="#1D1147" stroke-width="' + sw + '">' + sc + '</g><circle r="' + (R + 2) + '" fill="' + fillOuter + '"/>' +
      '<circle r="' + (R - bump * 0.6) + '" fill="' + fillInner + '" stroke="#1D1147" stroke-width="' + sw + '"/>' +
      (ring ? '<circle r="' + (R - bump * 1.15) + '" fill="none" stroke="' + ring + '" stroke-width="6" stroke-dasharray="2 22" stroke-linecap="round"/>' : '') + '</svg>';
  }

  w.M = { TAU, C, clamp, seg, lerp, mod, E, K, rng, mix, h, s, box, T, ST, sunburstSVG, STAR4, PETAL, steamOf, steamAt, sparklesOf, sparkleAt, Dish, Burst, Petals, Bunting, Logo, osc, pathsOf, pathMarkup, fit, scallopSVG };
})(window);

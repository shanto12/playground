/*!
 * Curry District · Motion Kit v1.0.0
 * Vanilla JS, no dependencies. Pair with motion.css (and tokens.css for theming).
 * Everything is driven by data-attributes + CSS custom properties, so it re-skins
 * when <html data-theme="bazaar|royal"> (or any section's data-theme) changes.
 * Auto-inits on DOMContentLoaded. Add data-manual to the <script> tag to opt out,
 * then call Motion.init(). API: window.Motion = { init, destroy, refresh, burst,
 * steam, particles, curtain, go, reduced, version }.
 */
(function (w, d) {
  'use strict';
  if (w.Motion) return;

  var de = d.documentElement;
  var mm = function (q) { return w.matchMedia ? w.matchMedia(q) : { matches: false }; };
  var RM = mm('(prefers-reduced-motion: reduce)');
  var hasIO = 'IntersectionObserver' in w;
  var hasRO = 'ResizeObserver' in w;
  var KEY = 'm-curtain';
  var LIVE = '[data-steam],[data-marquee],[data-wave],.shimmer,.m-wobble,.m-float,.m-pulse-ring,.m-bounce-in,.m-spin-slow,.m-flicker,.m-sway,.m-twinkle';

  var C = [];                 // cleanup stack (run by destroy)
  var booted = false, opts = {};
  var enterIO, liveIO, visIO, parIO, ro, mo;
  var P = [], raf = 0, last = 0;               // particle systems + shared ticker
  var heads = [], bars = [], pars = [], maxS = 0, sraf = 0;
  var tilt = null, mag = null, px = 0, py = 0, praf = 0;
  var veilEl = null, layer = null;

  /* ───────── helpers ───────── */
  var reduced = function () { return RM.matches; };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var num = function (v, f) { v = parseFloat(v); return isNaN(v) ? f : v; };
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var clamp = function (v) { return v < -1 ? -1 : v > 1 ? 1 : v; };
  var css = function (el, k, v) { el.style.setProperty(k, v); };
  var cvar = function (el, k) { return getComputedStyle(el).getPropertyValue(k).trim(); };
  var attr = function (el, k) { return el.getAttribute(k); };
  var words = function (v) { return (v || '').trim().split(/\s+/); };
  var esc = function (s) { return s.replace(/[&<>"]/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); };
  var later = function (fn) { C.push(fn); };
  function on(t, ev, fn, o) {
    o = o || false;
    t.addEventListener(ev, fn, o);
    later(function () { t.removeEventListener(ev, fn, o); });
  }
  function mk(tag, cls, parent, first) {
    var e = d.createElement(tag);
    e.className = cls;
    e.setAttribute('aria-hidden', 'true');
    if (parent) parent.insertBefore(e, first ? parent.firstChild : null);
    return e;
  }
  // first-time marker per element+feature (so init/refresh are idempotent)
  function once(el, k) {
    var m = el._m;
    if (!m) { m = el._m = {}; later(function () { delete el._m; }); }
    if (m[k]) return false;
    return (m[k] = 1);
  }
  function live(el) {
    if (liveIO && once(el, 'lv')) {
      liveIO.observe(el);
      later(function () { el.classList.remove('m-off'); });
    }
  }

  /* ───────── 1 · scroll reveal (+ triggers for wave / underline / count) ───────── */
  function enter(el, delay) {
    if (delay) css(el, '--m-delay', delay + 'ms');
    el.classList.add('m-in');
    if (el._mCount) el._mCount(delay);
  }
  function onEnter(entries) {
    var batch = [];   // stagger counters per parent within this batch
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, p = el.parentNode, delay = num(attr(el, 'data-delay'), 0), i;
      enterIO.unobserve(el);
      if (p && p._mStep != null) {
        i = batch.indexOf(p);
        if (i < 0) { batch.push(p, 0); i = batch.length - 2; }
        delay += batch[i + 1]++ * p._mStep;
      }
      enter(el, delay);
    });
  }
  function watch(el) {
    later(function () { el.classList.remove('m-in'); el.style.removeProperty('--m-delay'); });
    if (enterIO) enterIO.observe(el); else enter(el, 0);
  }
  function stagger(p) {
    var fx = 'up', step = 80;
    words(attr(p, 'data-stagger')).forEach(function (t) { if (/^\d/.test(t)) step = +t; else if (t) fx = t; });
    p._mStep = step;
    later(function () { delete p._mStep; });
    Array.prototype.forEach.call(p.children, function (c) {
      if (!c.hasAttribute('data-reveal')) {
        c.setAttribute('data-reveal', fx);
        later(function () { c.removeAttribute('data-reveal'); });
      }
    });
  }

  /* ───────── 8 · count-up ───────── */
  function counter(el) {
    var txt = el.textContent.trim(), orig = el.innerHTML;
    var m = txt.match(/^(\D*?)(-?[\d,]*\.?\d+)(.*)$/) || ['', '', '0', ''];
    var src = attr(el, 'data-count') || m[2];
    var end = num(src.replace(/,/g, ''), 0);
    var dec = num(attr(el, 'data-decimals'), (src.split('.')[1] || '').length);
    var pre = attr(el, 'data-prefix'), suf = attr(el, 'data-suffix');
    if (pre == null) pre = m[1];
    if (suf == null) suf = m[3];
    var fmt = function (v) {
      return pre + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: /,/.test(src) }) + suf;
    };
    el.innerHTML = '<span class="m-sr">' + esc(fmt(end)) + '</span><span class="m-num" aria-hidden="true"></span>';
    var v = el.lastChild;
    v.style.minWidth = fmt(end).length + 'ch';
    v.textContent = fmt(reduced() ? end : 0);
    el._mCount = function (delay) {
      if (reduced()) { v.textContent = fmt(end); return; }
      var dur = num(attr(el, 'data-duration'), 1800), t0 = 0;
      var f = function (t) {
        t0 = t0 || t;
        var k = Math.min((t - t0) / dur, 1);
        v.textContent = fmt(end * (1 - Math.pow(1 - k, 4)));
        if (k < 1) el._mRaf = requestAnimationFrame(f);
      };
      setTimeout(function () { el._mRaf = requestAnimationFrame(f); }, delay || 0);
    };
    later(function () { cancelAnimationFrame(el._mRaf); el.innerHTML = orig; delete el._mCount; });
    watch(el);
  }

  /* ───────── 10a · split-letter wave ───────── */
  function wave(el) {
    var txt = el.textContent.replace(/\s+/g, ' ').trim(), orig = el.innerHTML, i = 0;
    el.innerHTML = '<span class="m-sr">' + esc(txt) + '</span><span aria-hidden="true">' +
      txt.split(' ').map(function (wd) {
        return '<span class="m-w">' + Array.from(wd).map(function (ch) {
          return '<span class="m-ch" style="--i:' + i++ + '">' + esc(ch) + '</span>';
        }).join('') + '</span>';
      }).join(' ') + '</span>';
    later(function () { el.innerHTML = orig; });
    watch(el);
  }

  /* ───────── 2 · marquee / ticker ───────── */
  function marquee(el) {
    var speed = 60, rev = false, gw = 0, cw = 0;
    words(attr(el, 'data-marquee')).forEach(function (t) {
      if (/^-?\d/.test(t)) speed = Math.abs(+t) || 60;
      else if (/^(right|rev)/.test(t)) rev = true;
    });
    var kids = Array.prototype.slice.call(el.childNodes);
    var track = d.createElement('div'), g = d.createElement('div');
    track.className = 'm-track' + (rev ? ' m-rev' : '');
    g.className = 'm-group';
    kids.forEach(function (n) { g.appendChild(n); });
    track.appendChild(g);
    el.appendChild(track);
    var fill = function () {
      var a = g.getBoundingClientRect().width, b = el.clientWidth;   // reads first
      if (!a || (a === gw && b === cw)) return;
      gw = a; cw = b;
      while (track.children.length > 1) track.removeChild(track.lastChild);
      for (var n = Math.max(1, Math.ceil(b / a)); n > 0; n--) {
        var c = g.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        c.setAttribute('inert', '');
        $$('a,button,input,select,textarea,[tabindex]', c).forEach(function (f) { f.setAttribute('tabindex', '-1'); });
        track.appendChild(c);
      }
      css(track, '--m-shift', -a + 'px');
      css(track, '--m-mdur', (a / speed).toFixed(2) + 's');
    };
    el._mFill = g._mFill = fill;
    if (ro) { ro.observe(el); ro.observe(g); } else { fill(); on(w, 'resize', fill); }
    later(function () {
      if (ro) { ro.unobserve(el); ro.unobserve(g); }
      kids.forEach(function (n) { el.appendChild(n); });
      track.remove();
      el.classList.remove('m-paused');
      delete el._mFill;
    });
  }

  /* ───────── 3 · steam wisps ───────── */
  function steam(el, n) {
    if (!el || !once(el, 'st')) return;
    n = Math.min(Math.max(n || num(attr(el, 'data-steam'), 4), 1), 8);
    var s = mk('span', 'm-steam', el);
    for (var i = 0; i < n; i++) {
      var t = rnd(2.8, 4.4), wi = d.createElement('i');
      wi.style.cssText = 'left:' + (8 + 84 * (i + 0.5) / n + rnd(-5, 5)).toFixed(1) + '%;animation-duration:' +
        t.toFixed(2) + 's;animation-delay:' + (-t * i / n - rnd(0, 0.6)).toFixed(2) + 's';
      s.appendChild(wi);
    }
    live(el);
    later(function () { s.remove(); });
    return s;
  }

  /* ───────── 4 · particle canvas (petals | spice | embers | auto) ───────── */
  // [px² per particle, cap on phones, cap on larger screens]
  var PT = { petals: [9000, 16, 38], spice: [2600, 45, 110], embers: [6000, 22, 56] };
  var px2d;
  function rgb(c) {   // any CSS colour → "r,g,b"
    px2d = px2d || d.createElement('canvas').getContext('2d');
    px2d.fillStyle = '#000';
    px2d.fillStyle = c;
    c = px2d.fillStyle;
    return (c.charAt(0) === '#' ? [1, 3, 5].map(function (i) { return parseInt(c.substr(i, 2), 16); }) : c.match(/[\d.]+/g).slice(0, 3)).join(',');
  }
  function sprite(type, c) {
    var S = 64, h = 32, cv = d.createElement('canvas'), x, g;
    cv.width = cv.height = S;
    x = cv.getContext('2d');
    if (type === 'petals') {
      x.translate(h, h);
      x.beginPath();
      x.moveTo(0, -28);
      x.bezierCurveTo(30, -24, 24, 18, 0, 28);
      x.bezierCurveTo(-24, 18, -30, -24, 0, -28);
      x.fillStyle = 'rgb(' + c + ')';
      x.fill();
      x.globalCompositeOperation = 'source-atop';
      g = x.createRadialGradient(-8, -12, 2, -4, -6, 30);
      g.addColorStop(0, 'rgba(255,255,255,.55)');
      g.addColorStop(1, 'rgba(0,0,0,.18)');
      x.fillStyle = g;
      x.fillRect(-h, -h, S, S);
      x.strokeStyle = 'rgba(0,0,0,.16)';
      x.lineWidth = 2;
      x.beginPath(); x.moveTo(0, -20); x.quadraticCurveTo(3, 0, 0, 22); x.stroke();
    } else {
      g = x.createRadialGradient(h, h, 0, h, h, h);
      if (type === 'embers') {
        g.addColorStop(0, 'rgba(255,250,236,1)');
        g.addColorStop(0.16, 'rgba(' + c + ',1)');
        g.addColorStop(0.42, 'rgba(' + c + ',.32)');
      } else {
        g.addColorStop(0, 'rgba(' + c + ',1)');
        g.addColorStop(0.5, 'rgba(' + c + ',.85)');
      }
      g.addColorStop(1, 'rgba(' + c + ',0)');
      x.fillStyle = g;
      x.fillRect(0, 0, S, S);
    }
    return cv;
  }
  function skin(s) {
    var cs = getComputedStyle(s.el), t = s.want;
    if (!PT[t]) t = cs.getPropertyValue('--m-particles').trim();
    if (!PT[t]) t = 'petals';
    var cols = [1, 2, 3, 4].map(function (i) { return cs.getPropertyValue('--m-p' + i).trim(); }).filter(Boolean);
    var key = t + cols.join();
    if (key === s.key) return;
    if (t !== s.type) s.ps = [];
    s.key = key; s.type = t;
    s.spr = (cols.length ? cols : ['#FFB000']).map(function (c) { return sprite(t, rgb(c)); });
    populate(s);
  }
  function spawn(s, init) {
    var t = s.type, H = s.h, p = { c: (Math.random() * 4) | 0, ph: rnd(0, 6.28), x: rnd(0, s.w), r: 0, vr: 0 };
    if (t === 'petals') {
      p.z = rnd(10, 18); p.y = init ? rnd(-20, H) : -24; p.vy = rnd(0.35, 0.9); p.vx = rnd(-0.25, 0.25);
      p.r = rnd(0, 6.28); p.vr = rnd(-0.03, 0.03); p.vp = rnd(0.02, 0.05);
    } else if (t === 'spice') {
      p.z = rnd(2, 5.5); p.y = init ? rnd(0, H) : H + 8; p.vy = rnd(0.12, 0.45); p.vx = rnd(-0.15, 0.15); p.vp = rnd(0.02, 0.06);
    } else {
      p.z = rnd(8, 22); p.y = init ? rnd(0, H) : H + 12; p.vy = rnd(0.35, 1); p.vx = rnd(-0.2, 0.2); p.vp = rnd(0.04, 0.1);
    }
    return p;
  }
  function populate(s) {
    var T = PT[s.type], cap;
    if (!s.w || !T) return;
    cap = w.innerWidth < 640 ? T[1] : T[2];
    var n = Math.min(cap, Math.round(s.w * s.h / T[0] * num(attr(s.el, 'data-density'), 1)));
    while (s.ps.length < n) s.ps.push(spawn(s, true));
    s.ps.length = n;
  }
  function size(s) {
    var W = s.el.clientWidth, H = s.el.clientHeight, r = Math.min(w.devicePixelRatio || 1, 2);
    if (!W || !H || (W === s.w && H === s.h && r === s.r)) return;
    s.w = W; s.h = H; s.r = r;
    s.cv.width = Math.round(W * r);
    s.cv.height = Math.round(H * r);
    populate(s);
  }
  function step(s, f) {
    var x = s.ctx, r = s.r, W = s.w, H = s.h, t = s.type;
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.clearRect(0, 0, s.cv.width, s.cv.height);
    x.globalCompositeOperation = t === 'embers' ? 'lighter' : 'source-over';
    s.ps.forEach(function (p, i) {
      var a = 1, sx = 1, co, sn;
      p.ph += p.vp * f;
      if (t === 'petals') {
        p.y += p.vy * f;
        p.x += (p.vx + Math.sin(p.ph) * 0.5) * f;
        p.r += p.vr * f;
        sx = Math.cos(p.ph * 1.7);
        if (p.y > H + 24) s.ps[i] = spawn(s);
      } else {
        p.y -= p.vy * f;
        p.x += (p.vx + Math.sin(p.ph) * (t === 'spice' ? 0.25 : 0.45)) * f;
        a = t === 'spice' ? 0.35 + 0.65 * Math.abs(Math.sin(p.ph * 1.3)) : Math.min(1, p.y / H * 1.4) * (0.7 + 0.3 * Math.sin(p.ph * 3));
        if (p.y < -24) s.ps[i] = spawn(s);
      }
      if (p.x < -24) p.x = W + 20; else if (p.x > W + 24) p.x = -20;
      if (a <= 0) return;
      co = Math.cos(p.r) * r; sn = Math.sin(p.r) * r;
      x.globalAlpha = a;
      x.setTransform(co * sx, sn * sx, -sn, co, p.x * r, p.y * r);
      x.drawImage(s.spr[p.c % s.spr.length], -p.z / 2, -p.z / 2, p.z, p.z);
    });
  }
  function run() {
    if (!raf && !d.hidden && P.some(function (s) { return s.on; })) { last = 0; raf = requestAnimationFrame(tick); }
  }
  function tick(t) {
    var f = last ? Math.min((t - last) / 16.667, 3) : 1, any = false;
    raf = 0; last = t;
    P.forEach(function (s) { if (s.on && s.w) { any = true; step(s, f); } });
    if (any && !d.hidden) raf = requestAnimationFrame(tick);
  }
  function particles(el, type) {
    if (!el || reduced() || !once(el, 'pt')) return;
    var cv = mk('canvas', 'm-particles', el, true), ctx = cv.getContext && cv.getContext('2d');
    cv.setAttribute('role', 'presentation');
    later(function () { cv.remove(); delete el._mp; P = P.filter(function (q) { return q.el !== el; }); });
    if (!ctx) return;
    var s = { el: el, cv: cv, ctx: ctx, want: type || attr(el, 'data-particles'), ps: [], on: !visIO, w: 0, h: 0, r: 1 };
    el._mp = s;
    P.push(s);
    size(s);
    skin(s);
    if (ro) ro.observe(el); else on(w, 'resize', function () { size(s); });
    if (visIO) visIO.observe(el);
    run();
    return s;
  }

  /* ───────── 5 · tap burst of petals / foil flakes ───────── */
  function burst(x, y, src) {
    if (reduced() || !de.animate) return;
    if (!layer || !layer.isConnected) {
      layer = mk('div', 'm-burst', d.body);
      later(function () { if (layer) layer.remove(); layer = null; });
    }
    var cs = getComputedStyle(src || de);
    var cols = [1, 2, 3, 4].map(function (i) { return cs.getPropertyValue('--m-p' + i).trim(); }).filter(Boolean);
    var rad = cs.getPropertyValue('--m-petal-r').trim();
    var n = Math.min(num(src && attr(src, 'data-burst'), 0) || (w.innerWidth < 640 ? 14 : 22), 40);
    for (var i = 0; i < n; i++) piece(x, y, cols[i % cols.length] || '#FFB000', rad);
  }
  function piece(x, y, col, rad) {
    var p = d.createElement('i'), z = rnd(8, 15), a = rnd(0, 6.283), v = rnd(70, 190);
    var dx = Math.cos(a) * v, dy = Math.sin(a) * v * 0.8 - 70, rt = rnd(-320, 320);
    p.style.cssText = 'left:' + (x - z / 2) + 'px;top:' + (y - z / 2) + 'px;width:' + z + 'px;height:' + (z * 1.25) +
      'px;background:' + col + (rad ? ';border-radius:' + rad : '');
    layer.appendChild(p);
    p.animate([
      { transform: 'translate3d(0,0,0) rotate(0deg) scale(.3)', opacity: 1 },
      { transform: 'translate3d(' + dx + 'px,' + dy + 'px,0) rotate(' + rt / 2 + 'deg) scale(1)', opacity: 1, offset: 0.35 },
      { transform: 'translate3d(' + dx * 1.25 + 'px,' + (dy + 160) + 'px,0) rotate(' + rt + 'deg) scale(.7)', opacity: 0 }
    ], { duration: rnd(1000, 1500), easing: 'cubic-bezier(.2,.65,.35,1)', fill: 'forwards' }).onfinish = function () { p.remove(); };
  }

  /* ───────── 7 · ripple ───────── */
  function ripple(el, x, y) {
    if (reduced()) return;
    var r = el.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2.2, sp = mk('span', 'm-ripple', el);
    sp.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + ((x == null ? r.width / 2 : x - r.left - el.clientLeft) - s / 2) +
      'px;top:' + ((y == null ? r.height / 2 : y - r.top - el.clientTop) - s / 2) + 'px';
    setTimeout(function () { sp.remove(); }, 800);
  }

  /* ───────── 6 + 7 · tilt / parallax depth + magnetic (pointer, rAF-batched) ───────── */
  function arm(el) {
    if (once(el, 'tl')) {
      el._mMax = num(attr(el, 'data-tilt'), num(cvar(el, '--m-tilt'), 10));
      var gl = mk('span', 'm-glare', el);
      later(function () { gl.remove(); rest(el); });
    }
    el.classList.add('m-tilting');
  }
  function rest(el) {
    if (!el) return;
    el.classList.remove('m-tilting', 'm-active');
    ['--m-rx', '--m-ry', '--m-px', '--m-py', '--m-mx', '--m-my'].forEach(function (k) { el.style.removeProperty(k); });
    el._mx = el._my = 0;
  }
  function frame() {
    var a, b, nx, ny, k, cx, cy;
    praf = 0;
    if (tilt) a = tilt.getBoundingClientRect();      // all reads …
    if (mag) b = mag.getBoundingClientRect();
    if (tilt && a.width) {                           // … then all writes
      nx = clamp((px - a.left) / a.width * 2 - 1);
      ny = clamp((py - a.top) / a.height * 2 - 1);
      css(tilt, '--m-rx', (-ny * tilt._mMax).toFixed(2) + 'deg');
      css(tilt, '--m-ry', (nx * tilt._mMax).toFixed(2) + 'deg');
      css(tilt, '--m-px', nx.toFixed(3));
      css(tilt, '--m-py', ny.toFixed(3));
    }
    if (mag && b.width) {
      k = num(attr(mag, 'data-magnetic'), 0.35);
      cx = b.left - (mag._mx || 0) + b.width / 2;    // untranslated centre
      cy = b.top - (mag._my || 0) + b.height / 2;
      mag._mx = (px - cx) * k;
      mag._my = (py - cy) * k;
      css(mag, '--m-mx', mag._mx.toFixed(1) + 'px');
      css(mag, '--m-my', mag._my.toFixed(1) + 'px');
    }
  }
  function queue() { if (!praf && (tilt || mag)) praf = requestAnimationFrame(frame); }
  function onMove(e) {
    var t = e.target, tl = null, mg = null;
    if (reduced() || e.pointerType === 'touch' || !t.closest) return;
    tl = t.closest('[data-tilt]');
    mg = t.closest('[data-magnetic]');
    if (tl !== tilt) { rest(tilt); tilt = tl; if (tl) arm(tl); }
    if (mg !== mag) { rest(mag); mag = mg; if (mg) mg.classList.add('m-active'); }
    px = e.clientX; py = e.clientY;
    queue();
  }
  function onDown(e) {
    var t = e.target, rp, tl;
    if (!t.closest) return;
    rp = t.closest('[data-ripple]');
    if (rp) ripple(rp, e.clientX, e.clientY);
    if (e.pointerType === 'touch' && !reduced()) {        // touch: press-tilt toward the finger
      tl = t.closest('[data-tilt]');
      if (tl !== tilt) rest(tilt);
      tilt = tl;
      if (tl) { arm(tl); px = e.clientX; py = e.clientY; queue(); }
    }
  }
  function onUp(e) { if (e.pointerType === 'touch') { rest(tilt); tilt = null; } }
  function onOut(e) { if (!e.relatedTarget) { rest(tilt); rest(mag); tilt = mag = null; } }
  // Optional gyro tilt — OFF by default (iOS asks for permission). Motion.init({ gyro: true }) to enable.
  function gyroOn() {
    var D = w.DeviceOrientationEvent, gx = 0, gy = 0, g = 0, els;
    if (!D) return;
    var apply = function () {
      g = 0;
      els.forEach(function (el) {
        if (el === tilt) return;
        el._mMax = el._mMax || num(attr(el, 'data-tilt'), num(cvar(el, '--m-tilt'), 10));
        css(el, '--m-rx', (-gy * el._mMax).toFixed(2) + 'deg');
        css(el, '--m-ry', (gx * el._mMax).toFixed(2) + 'deg');
        css(el, '--m-px', gx.toFixed(3));
        css(el, '--m-py', gy.toFixed(3));
      });
    };
    var go = function () {
      els = $$('[data-tilt]');
      on(w, 'deviceorientation', function (e) {
        if (e.gamma == null || reduced()) return;
        gx = clamp(e.gamma / 25); gy = clamp((e.beta - 45) / 25);
        if (!g) g = requestAnimationFrame(apply);
      });
    };
    if (D.requestPermission) {
      on(d, 'click', function ask() {
        d.removeEventListener('click', ask);
        D.requestPermission().then(function (r) { if (r === 'granted') go(); }, function () {});
      });
    } else go();
  }

  /* ───────── 9 · sticky header shrink + progress, scroll parallax ───────── */
  function measure() { maxS = Math.max(de.scrollHeight - w.innerHeight, 0); onScroll(); }
  function onScroll() { if (!sraf) sraf = requestAnimationFrame(scrolled); }
  function scrolled() {
    var y = w.pageYOffset, vh = w.innerHeight;
    var rects = pars.map(function (p) { return p._mOn ? p.getBoundingClientRect() : null; });   // reads
    sraf = 0;
    heads.forEach(function (h) {
      var s = y > h._mT;
      if (s !== h._mS) { h._mS = s; h.classList.toggle('m-shrunk', s); }
    });
    bars.forEach(function (b) { b.style.transform = 'scaleX(' + (maxS ? Math.min(y / maxS, 1) : 0).toFixed(4) + ')'; });
    pars.forEach(function (p, i) {
      var r = rects[i], off;
      if (!r) return;
      off = (r.top - (p._mY || 0) + r.height / 2 - vh / 2) * -p._mK;
      p._mY = off;
      p.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
    });
  }

  /* ───────── 11 · curtain / arch-wipe transitions ───────── */
  function veil(shape) {
    if (!veilEl) {
      veilEl = mk('div', 'm-curtain', d.body);
      later(function () { veilEl.remove(); veilEl = null; });
    }
    veilEl.setAttribute('data-shape', shape || '');
    return veilEl;
  }
  var vms = function () { return num(cvar(de, '--m-curtain-ms'), 700) + 140; };
  function cover(shape, cb) {
    var c = veil(shape);
    c.classList.remove('m-lift', 'm-now');
    void c.offsetWidth;                // commit the start state (one-off, on click)
    c.classList.add('m-cover');
    setTimeout(cb, vms());
  }
  function lift() {
    var c = veilEl;
    if (!c || !c.classList.contains('m-cover')) return;
    c.classList.add('m-lift');
    setTimeout(function () { c.classList.add('m-now'); c.classList.remove('m-cover', 'm-lift'); }, vms());
  }
  function arrive() {
    var v = '', p, c;
    try { v = sessionStorage.getItem(KEY) || ''; sessionStorage.removeItem(KEY); } catch (x) {}
    p = v.split('|');
    if (Date.now() - num(p[0], 0) < 8000 && !reduced()) {
      c = veil(p[1]);
      c.classList.add('m-now', 'm-cover');
      void c.offsetWidth;
      c.classList.remove('m-now');
      setTimeout(lift, 120);
    }
    de.classList.remove('m-arrive');
  }
  function go(url, shape) {
    if (reduced()) { location.href = url; return; }
    cover(shape, function () {
      try { sessionStorage.setItem(KEY, Date.now() + '|' + (shape || '')); } catch (x) {}
      location.href = url;
      setTimeout(lift, 5000);   // safety: never leave the page covered if navigation stalls
    });
  }

  /* ───────── 12 · smooth anchors + delegated clicks ───────── */
  function focusTo(el) {
    if (!el) return;
    if (!el.matches('a[href],button,input,select,textarea,[tabindex]')) el.setAttribute('tabindex', '-1');
    try { el.focus({ preventScroll: true }); } catch (x) {}
  }
  function onClick(e) {
    var t = e.target, b, r, rp, mq, a, u, L = location, tr, shape, fx, id, tg, jump;
    if (!t.closest) return;
    b = t.closest('[data-burst]');
    if (b) {
      if (e.detail && (e.clientX || e.clientY)) burst(e.clientX, e.clientY, b);
      else { r = b.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, b); }
    }
    if (!e.detail) { rp = t.closest('[data-ripple]'); if (rp) ripple(rp); }   // keyboard activation
    mq = t.closest('[data-marquee]');
    if (mq && !t.closest('a,button')) mq.classList.toggle('m-paused');      // tap to pause (touch a11y)
    a = t.closest('a[href]');
    if (!a || typeof a.href !== 'string' || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ||
      (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    u = new URL(a.href, L.href);
    if (u.protocol + u.host !== L.protocol + L.host) return;
    tr = a.closest('[data-transition]');
    shape = tr && attr(tr, 'data-transition');
    fx = tr && !reduced();
    if (u.pathname === L.pathname && u.search === L.search && u.hash) {
      id = decodeURIComponent(u.hash.slice(1));
      tg = id && d.getElementById(id);
      if (!tg && id && id !== 'top') return;
      e.preventDefault();
      jump = function (smooth) {
        var bh = smooth ? 'smooth' : 'auto';
        if (tg) tg.scrollIntoView({ behavior: bh, block: 'start' }); else w.scrollTo({ top: 0, behavior: bh });
        try { if (L.hash !== u.hash) history.pushState(null, '', u.hash); } catch (x) {}
        focusTo(tg);
      };
      if (fx) cover(shape, function () { jump(false); lift(); }); else jump(!reduced());
    } else if (fx) {
      e.preventDefault();
      go(a.href, shape);
    }
  }

  /* ───────── boot / scan / destroy ───────── */
  function onRO(entries) {
    entries.forEach(function (e) {
      var t = e.target;
      if (t._mp) size(t._mp);
      if (t._mFill) t._mFill();
      if (t === d.body) measure();
    });
  }
  function rmChange() { var o = opts; destroy(); init(o); }
  function boot() {
    booted = true;
    de.classList.add('m-js');
    if (hasIO) {
      enterIO = new IntersectionObserver(onEnter, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });
      liveIO = new IntersectionObserver(function (es) {
        es.forEach(function (e) { e.target.classList.toggle('m-off', !e.isIntersecting); });
      }, { rootMargin: '80px' });
      visIO = new IntersectionObserver(function (es) {
        es.forEach(function (e) { var s = e.target._mp; if (s) s.on = e.isIntersecting; });
        run();
      }, { rootMargin: '40px' });
      parIO = new IntersectionObserver(function (es) {
        es.forEach(function (e) { e.target._mOn = e.isIntersecting; });
      }, { rootMargin: '120px' });
    }
    if (hasRO) { ro = new ResizeObserver(onRO); ro.observe(d.body); } else on(w, 'resize', measure);
    if (w.MutationObserver) {
      mo = new MutationObserver(function () { P.forEach(skin); });
      mo.observe(de, { attributes: true, subtree: true, attributeFilter: ['data-theme'] });
    }
    later(function () {
      [enterIO, liveIO, visIO, parIO, ro, mo].forEach(function (o) { if (o) o.disconnect(); });
      cancelAnimationFrame(raf); cancelAnimationFrame(sraf); cancelAnimationFrame(praf);
      raf = sraf = praf = 0;
      enterIO = liveIO = visIO = parIO = ro = mo = tilt = mag = null;
      P = []; heads = []; bars = []; pars = [];
      booted = false;
      de.classList.remove('m-js', 'm-arrive');
    });
    on(d, 'click', onClick);
    on(d, 'pointerdown', onDown, { passive: true });
    on(d, 'pointermove', onMove, { passive: true });
    on(d, 'pointerup', onUp, { passive: true });
    on(d, 'pointercancel', onUp, { passive: true });
    on(d, 'pointerout', onOut, { passive: true });
    on(w, 'scroll', onScroll, { passive: true });
    on(d, 'visibilitychange', function () { if (d.hidden) { cancelAnimationFrame(raf); raf = 0; } else run(); });
    on(w, 'pageshow', function (e) {          // back/forward cache: never come back to a covered page
      if (e.persisted && veilEl) { veilEl.classList.add('m-now'); veilEl.classList.remove('m-cover', 'm-lift'); }
    });
    if (RM.addEventListener) on(RM, 'change', rmChange);
    else if (RM.addListener) { RM.addListener(rmChange); later(function () { RM.removeListener(rmChange); }); }
    if (opts.gyro) gyroOn();
    arrive();
  }
  function scan(r) {
    r = r || d;
    $$('[data-stagger]', r).forEach(function (el) { if (once(el, 'sg')) stagger(el); });
    $$('[data-reveal],.draw-underline', r).forEach(function (el) { if (once(el, 'rv')) watch(el); });
    $$('[data-wave]', r).forEach(function (el) { if (once(el, 'wv')) wave(el); });
    $$('[data-count]', r).forEach(function (el) { if (once(el, 'ct')) counter(el); });
    $$('[data-marquee]', r).forEach(function (el) { if (once(el, 'mq')) marquee(el); });
    $$('[data-steam]', r).forEach(function (el) { steam(el); });
    $$('[data-particles]', r).forEach(function (el) { particles(el); });
    $$('[data-header]', r).forEach(function (el) {
      if (!once(el, 'hd')) return;
      el._mT = num(attr(el, 'data-header'), 40);
      heads.push(el);
      later(function () { el.classList.remove('m-shrunk'); delete el._mS; });
    });
    $$('[data-progress]', r).forEach(function (el) {
      if (!once(el, 'pg')) return;
      bars.push(el);
      later(function () { el.style.removeProperty('transform'); });
    });
    if (!reduced()) $$('[data-parallax]', r).forEach(function (el) {
      if (!once(el, 'px')) return;
      el._mK = num(attr(el, 'data-parallax'), 0.15);
      pars.push(el);
      if (parIO) parIO.observe(el); else el._mOn = 1;
      later(function () { el.style.removeProperty('transform'); delete el._mY; });
    });
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
    var c = C;
    C = [];
    c.reverse().forEach(function (f) { try { f(); } catch (x) {} });
    return api;
  }

  var api = {
    version: '1.0.0',
    init: init,
    destroy: destroy,
    refresh: function (root) { if (booted) scan(root); else init(); return api; },
    burst: burst,
    steam: steam,
    particles: particles,
    curtain: function (shape, cb) { if (reduced()) { if (cb) cb(); return; } cover(shape, function () { if (cb) cb(); lift(); }); },
    go: go,
    get reduced() { return reduced(); }
  };
  w.Motion = api;

  var me = d.currentScript;
  if (!(me && me.hasAttribute('data-manual'))) {
    de.classList.add('m-js');
    if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', function () { init(); }); else init();
  }
})(window, document);

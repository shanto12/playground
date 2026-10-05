/* Curry District · packaging spin viewer
   A lightweight CSS-3D cuboid viewer: pointer drag / swipe, keyboard, view presets. No dependencies.
   CDSpin.mount(el, { base: '' | '../', full: true|false, initial: 'bag', dir: 'bazaar'|'royal' })
   Artwork comes from assets/<helper>/art/manifest.json (bags, boxes, cups). Missing manifests are skipped. */
(function () {
  'use strict';

  var RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var KRAFT = '#B9875A';

  /* ───────── helpers ───────── */
  function L(n, px) { return 'calc(var(--u) * ' + n + (px ? ' + ' + px + 'px' : '') + ')'; }
  function mk(tag, cls, css) { var e = document.createElement(tag); if (cls) e.className = cls; if (css) e.style.cssText = css; return e; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function getJSON(u) {
    if (!window.fetch) return Promise.resolve(null);
    return fetch(u, { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  function globalDir() {
    try {
      if (window.Hub && window.Hub.getDirection) { var g = window.Hub.getDirection(); if (g === 'bazaar' || g === 'royal') return g; return null; }
      var s = localStorage.getItem('cd-hub-dir'); if (s === 'bazaar' || s === 'royal') return s;
    } catch (e) { /* storage blocked */ }
    return null;
  }

  /* ───────── cuboid geometry (object centre = origin, CSS y points down) ───────── */
  function faceGeo(w, h, d) {
    return {
      front:  { fw: w, fh: h, tf: 'translateZ(' + L(d / 2) + ')', n: [0, 0, 1] },
      back:   { fw: w, fh: h, tf: 'rotateY(180deg) translateZ(' + L(d / 2) + ')', n: [0, 0, -1] },
      right:  { fw: d, fh: h, tf: 'rotateY(90deg) translateZ(' + L(w / 2) + ')', n: [1, 0, 0] },
      left:   { fw: d, fh: h, tf: 'rotateY(-90deg) translateZ(' + L(w / 2) + ')', n: [-1, 0, 0] },
      top:    { fw: w, fh: d, tf: 'rotateX(90deg) translateZ(' + L(h / 2) + ')', n: [0, -1, 0] },
      bottom: { fw: w, fh: d, tf: 'rotateX(-90deg) translateZ(' + L(h / 2) + ')', n: [0, 1, 0] }
    };
  }

  function faceEl(g, spec, inner) {
    var e = mk('div', 'sp-f');
    var tf = g.tf + (inner ? ' rotateY(180deg) translateZ(2px)' : '');
    var css = 'width:' + L(g.fw) + ';height:' + L(g.fh) + ';margin:' + L(-g.fh / 2) + ' 0 0 ' + L(-g.fw / 2) + ';transform:' + tf + ';';
    if (spec.bg) css += 'background:' + spec.bg + ';';
    e.style.cssText = css;
    if (spec.img) e.style.backgroundImage = 'url("' + spec.img + '")';
    e.style.backgroundSize = '100% 100%'; e.style.backgroundRepeat = 'no-repeat'; e.style.backgroundPosition = 'center';
    if (spec.art) {
      var a = spec.art;
      e.appendChild(mk('i', 'sp-a', 'width:' + L(a.w) + ';height:' + L(a.h) + ';margin:' + L(-a.h / 2) + ' 0 0 ' + L(-a.w / 2) + ';background-image:url("' + a.src + '")' +
        (a.bgSize ? ';background-size:' + a.bgSize : '') + (a.bgPos ? ';background-position:' + a.bgPos : '') + (a.rot ? ';transform:rotate(180deg)' : '')));
    }
    var sh = mk('b', 'sp-sh'); e.appendChild(sh);
    return { el: e, sh: sh, n: inner ? [-g.n[0], -g.n[1], -g.n[2]] : g.n };
  }

  function handleEl(def, s) {
    var hd = def.handles, dia = hd.dia, W = hd.span + dia * 2, H = hd.rise + 1.2 + dia / 2;
    var e = mk('div', 'sp-h', 'width:' + L(W) + ';height:' + L(H) + ';margin:' + L(-(def.h / 2 + hd.rise) - dia / 2) + ' 0 0 ' + L(-W / 2) +
      ';transform:translateZ(' + L(s * (def.d / 2 - 0.3)) + ')');
    var x0 = dia * 100, x1 = (dia + hd.span) * 100, top = dia * 50, yb = H * 100 - dia * 50, r = Math.min(150, hd.span * 100 * 0.3);
    var p = 'M' + x0 + ' ' + yb + 'V' + (top + r) + 'Q' + x0 + ' ' + top + ' ' + (x0 + r) + ' ' + top + 'H' + (x1 - r) + 'Q' + x1 + ' ' + top + ' ' + x1 + ' ' + (top + r) + 'V' + yb;
    e.innerHTML = '<svg viewBox="0 0 ' + (W * 100) + ' ' + (H * 100) + '" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
      '<path d="' + p + '" fill="none" stroke="' + hd.colour + '" stroke-width="' + (dia * 100) + '" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="' + p + '" fill="none" stroke="rgba(255,255,255,.34)" stroke-width="' + (dia * 100 * 0.3) + '" stroke-dasharray="7 12"/>' +
      '<path d="' + p + '" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="' + (dia * 100 * 0.3) + '" stroke-dasharray="7 12" stroke-dashoffset="9"/></svg>';
    return e;
  }

  /* a cone / cylinder wrapped from N flat slices; u = 0.5 faces the viewer, seam at the back */
  function frustum(fr, spin, faces) {
    var N = fr.N || 40, slant = Math.hypot(fr.h, fr.rt - fr.rb), rm = (fr.rt + fr.rb) / 2;
    var alpha = Math.atan2(fr.rt - fr.rb, fr.h), ca = Math.cos(alpha), sa = Math.sin(alpha), chord = 2 * rm * Math.sin(Math.PI / N) * 1.06;
    for (var i = 0; i < N; i++) {
      var phi = -Math.PI + (i + 0.5) * 2 * Math.PI / N;
      var e = mk('div', 'sp-f', 'width:' + L(chord) + ';height:' + L(slant) + ';margin:' + L(fr.y - slant / 2) + ' 0 0 ' + L(-chord / 2) +
        ';transform:rotateY(' + (phi * 180 / Math.PI).toFixed(3) + 'deg) translateZ(' + L(rm) + ') rotateX(' + (-alpha * 180 / Math.PI).toFixed(3) + 'deg)');
      if (fr.img) { e.style.backgroundImage = 'url("' + fr.img + '")'; e.style.backgroundSize = (N * 100) + '% 100%'; e.style.backgroundPosition = (i / (N - 1) * 100).toFixed(3) + '% 0'; }
      else e.style.background = fr.bg;
      if (fr.bg && fr.img) e.style.backgroundColor = fr.bg;
      if (fr.glass) { e.style.backfaceVisibility = 'visible'; e.style.webkitBackfaceVisibility = 'visible'; }
      spin.appendChild(e);
      if (!fr.glass) {
        var sh = mk('b', 'sp-sh'); e.appendChild(sh);
        faces.push({ el: e, sh: sh, n: [Math.sin(phi) * ca, -sa, Math.cos(phi) * ca] });
      }
    }
  }
  function disc(dc, spin, faces) {
    var e = mk('div', 'sp-f', 'width:' + L(dc.r * 2) + ';height:' + L(dc.r * 2) + ';margin:' + L(-dc.r) + ' 0 0 ' + L(-dc.r) + ';border-radius:50%;background:' + dc.bg + ';transform:' +
      (dc.down ? 'rotateX(-90deg) translateZ(' + L(dc.y) + ')' : 'rotateX(90deg) translateZ(' + L(-dc.y) + ')'));
    if (dc.art) e.appendChild(mk('i', 'sp-a', 'width:' + L(dc.art.d) + ';height:' + L(dc.art.d) + ';margin:' + L(-dc.art.d / 2) + ' 0 0 ' + L(-dc.art.d / 2) + ';border-radius:50%;background-image:url("' + dc.art.src + '")'));
    var sh = mk('b', 'sp-sh', 'border-radius:50%'); e.appendChild(sh);
    spin.appendChild(e); faces.push({ el: e, sh: sh, n: dc.down ? [0, 1, 0] : [0, -1, 0] });
  }

  function build(def) {
    var g = faceGeo(def.w, def.h, def.d);
    var spin = mk('div', 'sp-spin'), faces = [];
    Object.keys(g).forEach(function (k) {
      var spec = def.faces[k]; if (!spec) return;
      var f = faceEl(g[k], spec, false); spin.appendChild(f.el); faces.push(f);
    });
    if (def.open) {
      var o = def.open;
      ['front', 'back', 'left', 'right'].forEach(function (k) {
        var f = faceEl(g[k], { bg: 'linear-gradient(180deg,' + o.cuff + ' 0,' + o.cuff + ' ' + L(o.cuffH) + ',' + o.inner + ' ' + L(o.cuffH) + ',' + o.inner + ' 100%)' }, true);
        spin.appendChild(f.el); faces.push(f);
      });
      var fl = faceEl(g.bottom, { bg: o.inner }, true); spin.appendChild(fl.el); faces.push(fl);
    }
    (def.frusta || []).forEach(function (fr) { frustum(fr, spin, faces); });
    (def.discs || []).forEach(function (dc) { disc(dc, spin, faces); });
    if (def.handles) [1, -1].forEach(function (s) { spin.appendChild(handleEl(def, s)); });
    var size = Math.hypot(def.w, def.d) * 1.35;
    var ground = mk('div', 'sp-ground', 'width:' + L(size) + ';height:' + L(size) + ';margin:' + L(-size / 2) + ' 0 0 ' + L(-size / 2) + ';transform:rotateX(-90deg) translateZ(' + L(def.h / 2, 1) + ')');
    return { spin: spin, ground: ground, faces: faces };
  }

  /* ───────── object definitions from art manifests ───────── */
  function bagObject(man, base) {
    var s = man.size, hd = man.handles || {};
    return {
      id: 'bag', label: 'Handled bag',
      def: function (dir) {
        var f = man.faces[dir] || man.faces.bazaar;
        return {
          w: s.width, h: s.height, d: s.depth,
          faces: {
            front: { img: base + f.front.texture }, back: { img: base + f.back.texture },
            left: { img: base + f.side.texture }, right: { img: base + f.side.texture },
            bottom: { bg: man.bottom[dir] }
          },
          open: { inner: man.inside[dir], cuff: man.cuffColor[dir], cuffH: man.insideCuff_in || 1.75 },
          handles: { span: hd.span_in || 4.5, rise: hd.riseAboveTop_in || 3.6, dia: hd.diameter_in || 0.3, colour: (hd.colour || {})[dir] || '#E4147E' },
          views: [{ k: 'Front', ry: 0, rx: -8 }, { k: 'Side', ry: -90, rx: -8 }, { k: 'Back', ry: 180, rx: -8 }, { k: 'Inside', ry: -18, rx: -60 }],
          title: 'Handled paper bag', dims: '10 × 5 × 13 in',
          info: 'Twisted paper-rope handles and an accent-colour cuff inside. Three print faces: front, back and one gusset design used on both sides.'
        };
      }
    };
  }

  function boxObjects(man, base) {
    var out = [], by = {};
    (man.containers || []).forEach(function (c) { (by[c.container] = by[c.container] || {})[c.direction] = c; });
    function art(c, name) {
      var f = null; (c.faces || []).forEach(function (x) { if (x.face === name) f = x; });
      return f ? { src: base + f.file, w: f.w_mm, h: f.h_mm } : null;
    }
    var boxViews = [{ k: 'Lid', ry: 0, rx: -68 }, { k: 'Front', ry: 0, rx: -8 }, { k: 'End', ry: -90, rx: -8 }, { k: 'Back', ry: 180, rx: -8 }];
    if (by.clamshell) out.push({
      id: 'clamshell', label: 'Clamshell',
      def: function (dir) {
        var c = by.clamshell[dir] || by.clamshell.bazaar, G = c.geometry, bc = G.board_colour || KRAFT;
        return {
          w: G.lid[0], d: G.lid[1], h: G.height,
          faces: {
            top: { bg: bc, art: art(c, 'lid') }, front: { bg: bc, art: art(c, 'front') }, back: { bg: bc, art: art(c, 'back') },
            left: { bg: bc, art: art(c, 'side') }, right: { bg: bc, art: art(c, 'side') }, bottom: { bg: bc, art: art(c, 'bottom') }
          },
          views: boxViews, title: 'Clamshell with belly band', dims: '231 × 154 × 76 mm (9 × 6 in)',
          info: 'Plain board box with one printed belly band over the lid. Artwork stays on the outside faces.'
        };
      }
    });
    if (by.tray) out.push({
      id: 'tray', label: 'Drawer tray',
      def: function (dir) {
        var c = by.tray[dir] || by.tray.bazaar, G = c.geometry, sl = G.sleeve, end = dir === 'royal' ? '#EFE6D6' : '#F4EAD6';
        return {
          w: sl[0], d: sl[1], h: sl[2],
          faces: {
            top: { bg: end, img: art(c, 'lid') && art(c, 'lid').src }, front: { bg: end, img: art(c, 'front') && art(c, 'front').src }, back: { bg: end, img: art(c, 'back') && art(c, 'back').src },
            left: { bg: end, art: art(c, 'side') }, right: { bg: end, art: art(c, 'side') }, bottom: { bg: end }
          },
          views: boxViews, title: 'Two-compartment drawer tray', dims: '256 × 180 × 66 mm sleeve',
          info: 'A printed sleeve with a sliding tray. The drawer end faces the short sides.'
        };
      }
    });
    if (by.tub) out.push({
      id: 'tub', label: 'Deli tub',
      def: function (dir) {
        var c = by.tub[dir] || by.tub.bazaar, G = c.geometry, Rt = G.top_d / 2, Rb = G.base_d / 2, H = G.height, y0 = G.sleeve_y[0], y1 = G.sleeve_y[1], side = art(c, 'side'), lid = art(c, 'lid');
        function r(y) { return Rt + (Rb - Rt) * y / H; }
        return {
          w: G.lid_d, d: G.lid_d, h: H + 6,
          frusta: [{ rt: Rt, rb: Rb, h: H, y: 0, bg: '#E9E6EF' }, { rt: r(y0) + 0.4, rb: r(y1) + 0.4, h: y1 - y0, y: (y0 + y1) / 2 - H / 2, img: side && side.src }],
          discs: [{ r: G.lid_d / 2, y: -H / 2 - 3, bg: '#EDEAF3', art: lid && { src: lid.src, d: lid.w } }, { r: Rb, y: H / 2, bg: '#CFCBD8', down: true }],
          views: [{ k: 'Front', ry: 0, rx: -8 }, { k: 'Side', ry: -90, rx: -8 }, { k: 'Back', ry: 180, rx: -8 }, { k: 'Lid', ry: 0, rx: -62 }],
          title: 'Deli tub with wrap label and lid medallion', dims: '16 oz · 114 mm top · 76 mm tall', info: 'Plain stock tub, so the print lives on a wrap label and a round lid sticker.'
        };
      }
    });
    return out;
  }

  function cupObjects(man, base) {
    var out = [], idx = {};
    (man.faces || []).forEach(function (f) { idx[f.id] = f; });
    function fileOf(id) { return idx[id] ? base + 'assets/cups/' + idx[id].file : null; }
    function pick(name, dir) { return idx[name + '-' + dir] ? name + '-' + dir : name + '-bazaar'; }
    var cupViews = [{ k: 'Front', ry: 0, rx: -8 }, { k: 'Side', ry: -90, rx: -8 }, { k: 'Back', ry: 180, rx: -8 }, { k: 'Top', ry: 0, rx: -62 }];
    if (idx['chai-cup-wrap-bazaar']) out.push({
      id: 'chai', label: 'Chai cup',
      def: function (dir) {
        var w = idx[pick('chai-cup-wrap', dir)], sl = idx[pick('chai-sleeve', dir)], F = w.frustum, S = sl.frustum;
        return {
          w: F.topDiameter, d: F.topDiameter, h: F.height,
          frusta: [{ rt: F.topDiameter / 2, rb: F.bottomDiameter / 2, h: F.height, y: 0, img: fileOf(pick('chai-cup-wrap', dir)) },
                   { rt: S.topDiameter / 2, rb: S.bottomDiameter / 2, h: S.height, y: (S.coversFromTop + S.coversToTop) / 2 - F.height / 2, img: fileOf(pick('chai-sleeve', dir)) }],
          discs: [{ r: F.topDiameter / 2 + 1.5, y: -F.height / 2, bg: '#FBF3E4' }, { r: F.bottomDiameter / 2, y: F.height / 2, bg: '#1D1147', down: true }],
          views: cupViews, title: 'Chai cup with sleeve', dims: w.object ? w.object : '12 oz hot paper cup', info: 'The sleeve is the free billboard: it can carry a chai ticket, a fun fact or a QR.'
        };
      }
    });
    if (idx['lassi-band-bazaar']) out.push({
      id: 'lassi', label: 'Lassi cup',
      def: function (dir) {
        var b = idx[pick('lassi-band', dir)], F = b.frustum;
        return {
          w: 98, d: 98, h: 120,
          frusta: [{ rt: 49, rb: 30, h: 120, y: 0, bg: 'rgba(255,255,255,.14)', glass: true },
                   { rt: F.topDiameter / 2, rb: F.bottomDiameter / 2, h: F.height, y: (F.coversFromTop + F.coversToTop) / 2 - 60, img: fileOf(pick('lassi-band', dir)) }],
          discs: [{ r: 30, y: 60, bg: 'rgba(255,255,255,.3)', down: true }],
          views: cupViews, title: 'Lassi cup with printed band', dims: '16 oz clear cup · 98 mm top · 120 mm tall', info: 'A clear cup with one printed band, so the drink stays the star.'
        };
      }
    });
    if (idx['lunchbox-sleeve-bazaar']) out.push({
      id: 'lunchbox', label: 'Lunchbox',
      def: function (dir) {
        var b = idx[pick('lunchbox-sleeve', dir)], X = b.box, P = b.panels, sw = b.face.w, sh = b.face.h, src = fileOf(pick('lunchbox-sleeve', dir));
        function crop(p, rot) { return { src: src, w: sw, h: p.h, bgSize: '100% ' + (sh / p.h * 100).toFixed(3) + '%', bgPos: '0 ' + (p.y / (sh - p.h) * 100).toFixed(3) + '%', rot: rot }; }
        return {
          w: X.length, d: X.depth, h: X.height,
          faces: { top: { bg: KRAFT, art: crop(P.top) }, front: { bg: KRAFT, art: crop(P.front) }, back: { bg: KRAFT, art: crop(P.back, P.back.rotated180) },
                   bottom: { bg: KRAFT, art: crop(P.bottom) }, left: { bg: KRAFT }, right: { bg: KRAFT } },
          views: [{ k: 'Lid', ry: 0, rx: -68 }, { k: 'Front', ry: 0, rx: -8 }, { k: 'End', ry: -90, rx: -8 }, { k: 'Back', ry: 180, rx: -8 }],
          title: 'Lunchbox with printed sleeve', dims: '228 × 152 × 57 mm (9 × 6 × 2¼ in)', info: 'A plain carton wrapped by one printed sleeve that runs over the top, front and bottom.'
        };
      }
    });
    return out;
  }

  /* ───────── mount ───────── */
  var TPL =
    '<div class="sp__stage" tabindex="0" role="group" aria-label="3D viewer. Drag or swipe to spin the object. Left and right arrow keys rotate it, up and down tilt it, Home resets the view.">' +
      '<div class="sp__scene"><div class="sp__tilt"></div></div>' +
      '<p class="sp__hint" aria-hidden="true"><span>Drag to spin</span></p>' +
      '<p class="sp__load">Loading artwork…</p>' +
    '</div>' +
    '<div class="sp__ui">' +
      '<div class="sp__meta"><p class="sp__title" data-r="title"></p><p class="sp__dims" data-r="dims"></p><p class="sp__info" data-r="info"></p></div>' +
      '<div class="sp__row" data-r="objwrap"><span class="sp__lbl" id="sp-lbl-obj">Object</span><div class="seg" role="group" aria-labelledby="sp-lbl-obj" data-r="obj"></div></div>' +
      '<div class="sp__row"><span class="sp__lbl" id="sp-lbl-dir">Direction</span><div class="seg" role="group" aria-labelledby="sp-lbl-dir">' +
        '<button type="button" data-d="bazaar" aria-pressed="false">A · Bazaar</button><button type="button" data-d="royal" aria-pressed="false">B · Royal</button></div></div>' +
      '<div class="sp__row"><span class="sp__lbl" id="sp-lbl-view">View</span><div class="seg" role="group" aria-labelledby="sp-lbl-view" data-r="views"></div></div>' +
      '<div class="sp__row sp__row--tools">' +
        '<button type="button" class="btn btn--ghost btn--sm" data-a="left" aria-label="Rotate left">‹ Turn</button>' +
        '<button type="button" class="btn btn--ghost btn--sm" data-a="right" aria-label="Rotate right">Turn ›</button>' +
        '<button type="button" class="btn btn--ghost btn--sm" data-a="auto" aria-pressed="false">Auto-spin</button>' +
        '<button type="button" class="btn btn--ghost btn--sm" data-a="full" hidden>Full screen</button>' +
      '</div>' +
      '<p class="sp__keys">Drag or swipe · ← → turn · ↑ ↓ tilt · Home reset · Double-tap resets</p>' +
    '</div>' +
    '<p class="sr-only" aria-live="polite" data-r="live"></p>';

  function mount(root, opt) {
    opt = opt || {};
    var base = opt.base || '';
    root.classList.add('sp');
    root.innerHTML = TPL;
    function q(s) { return root.querySelector(s); }
    var stage = q('.sp__stage'), scene = q('.sp__scene'), tilt = q('.sp__tilt'), loadMsg = q('.sp__load'), hint = q('.sp__hint');
    var rObj = q('[data-r="obj"]'), rViews = q('[data-r="views"]'), live = q('[data-r="live"]');
    var autoBtn = q('[data-a="auto"]'), fullBtn = q('[data-a="full"]');

    var objects = [], cur = null, curDef = null, built = null, dir = opt.dir || globalDir() || 'bazaar';
    var st = { rx: -14, ry: -28, vx: 0, auto: !RM };
    var tw = null, drag = null, raf = 0, last = 0, onScreen = true, inited = false;

    /* ---- rendering ---- */
    var LIGHT = [-0.35, -0.55, 0.76];
    function render() {
      var rx = st.rx * Math.PI / 180, ry = st.ry * Math.PI / 180;
      tilt.style.transform = 'rotateX(' + st.rx.toFixed(2) + 'deg)';
      if (!built) return;
      built.spin.style.transform = 'rotateY(' + st.ry.toFixed(2) + 'deg)';
      var cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry);
      for (var i = 0; i < built.faces.length; i++) {
        var f = built.faces[i], n = f.n;
        var x1 = n[0] * cy + n[2] * sy, z1 = -n[0] * sy + n[2] * cy, y1 = n[1];
        var y2 = y1 * cx - z1 * sx, z2 = y1 * sx + z1 * cx;
        var b = x1 * LIGHT[0] + y2 * LIGHT[1] + z2 * LIGHT[2];
        f.sh.style.opacity = clamp((0.8 - b) * 0.38, 0, 0.42).toFixed(3);
      }
    }
    function tick(t) {
      raf = 0;
      var dt = last ? Math.min(50, t - last) : 16; last = t;
      var moving = false;
      if (tw) {
        var p = clamp((t - tw.t0) / tw.dur, 0, 1), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        st.ry = tw.ry0 + (tw.ry1 - tw.ry0) * e; st.rx = tw.rx0 + (tw.rx1 - tw.rx0) * e;
        if (p >= 1) tw = null; else moving = true;
      }
      if (!drag && !tw) {
        if (st.auto && onScreen && !document.hidden) { st.ry += dt * 0.012; moving = true; }
        if (Math.abs(st.vx) > 0.02) { st.ry += st.vx; st.vx *= 0.94; moving = true; } else st.vx = 0;
      }
      render();
      if (moving || drag) raf = requestAnimationFrame(tick); else last = 0;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }

    function go(ry, rx, label) {
      st.auto = false; syncAuto(); st.vx = 0;
      if (label) live.textContent = label + ' view';
      if (RM) { st.ry = ry; st.rx = rx; render(); return; }
      var diff = ((ry - st.ry) % 360 + 540) % 360 - 180;
      tw = { t0: performance.now(), dur: 650, ry0: st.ry, ry1: st.ry + diff, rx0: st.rx, rx1: rx };
      kick();
    }
    function syncAuto() { autoBtn.setAttribute('aria-pressed', String(!!st.auto)); }
    function touched() { st.auto = false; syncAuto(); root.classList.add('is-touched'); }

    /* ---- build / fit ---- */
    function fit() {
      if (!curDef) return;
      var W = stage.clientWidth, H = stage.clientHeight; if (!W || !H) return;
      var totalH = curDef.h + (curDef.handles ? curDef.handles.rise : 0), diag = Math.hypot(curDef.w, curDef.d);
      var u = Math.min(W * 0.78 / diag, H * 0.74 / totalH);
      stage.style.setProperty('--u', u.toFixed(3) + 'px');
      var big = Math.max(curDef.w, curDef.h, curDef.d) * u;
      scene.style.perspective = Math.round(big * 3.6) + 'px';
      scene.style.transform = 'translateY(' + ((curDef.handles ? curDef.handles.rise / 2 : 0) * u).toFixed(1) + 'px)';
    }
    function rebuild() {
      if (!cur) return;
      curDef = cur.def(dir); if (!curDef) return;
      built = build(curDef);
      tilt.textContent = '';
      tilt.appendChild(built.ground); tilt.appendChild(built.spin);
      root.setAttribute('data-dir', dir);
      Array.prototype.forEach.call(root.querySelectorAll('[data-d]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-d') === dir)); });
      q('[data-r="title"]').textContent = curDef.title; q('[data-r="dims"]').textContent = curDef.dims + ' · indicative'; q('[data-r="info"]').textContent = curDef.info;
      rViews.textContent = '';
      curDef.views.forEach(function (v) {
        var b = mk('button'); b.type = 'button'; b.textContent = v.k;
        b.addEventListener('click', function () { go(v.ry, v.rx, v.k); });
        rViews.appendChild(b);
      });
      fit(); render();
    }
    function setObject(id) {
      var found = null; objects.forEach(function (o) { if (o.id === id) found = o; });
      cur = found || objects[0];
      Array.prototype.forEach.call(rObj.children, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-o') === cur.id)); });
      rebuild();
    }
    function setDir(d) { if (d !== 'bazaar' && d !== 'royal') return; if (d === dir && built) return; dir = d; rebuild(); }

    /* ---- input ---- */
    stage.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; st.vx = 0; tw = null; touched();
      try { stage.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      stage.classList.add('is-drag'); kick();
    });
    stage.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
      st.ry += dx * 0.55; st.rx = clamp(st.rx - dy * 0.4, -88, 18); st.vx = clamp(dx * 0.3, -12, 12);
    });
    function up(e) {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      drag = null; stage.classList.remove('is-drag'); if (RM) st.vx = 0; kick();
    }
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up); stage.addEventListener('lostpointercapture', up);
    stage.addEventListener('dblclick', function () { go(-28, -14, 'Default'); });
    stage.addEventListener('keydown', function (e) {
      var k = e.key, used = true;
      if (k === 'ArrowLeft') st.ry -= 15; else if (k === 'ArrowRight') st.ry += 15;
      else if (k === 'ArrowUp') st.rx = clamp(st.rx + 8, -88, 18); else if (k === 'ArrowDown') st.rx = clamp(st.rx - 8, -88, 18);
      else if (k === 'Home') { go(-28, -14, 'Default'); e.preventDefault(); return; } else used = false;
      if (used) { e.preventDefault(); tw = null; touched(); render(); }
    });
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a],[data-d],[data-o]'); if (!b || !root.contains(b)) return;
      var a = b.getAttribute('data-a');
      if (a === 'left' || a === 'right') { touched(); tw = null; st.ry += a === 'left' ? -30 : 30; render(); live.textContent = 'Rotated'; }
      else if (a === 'auto') { st.auto = !st.auto; syncAuto(); if (st.auto) { last = 0; kick(); } }
      else if (a === 'full') { if (window.Hub && window.Hub.openFrame) window.Hub.openFrame(base + 'viewer/index.html?obj=' + cur.id + '&dir=' + dir, 'Spin the ' + cur.label.toLowerCase(), b); }
      else if (b.hasAttribute('data-d')) {
        var d = b.getAttribute('data-d');
        if (window.Hub && window.Hub.setDirection) window.Hub.setDirection(d); else { try { localStorage.setItem('cd-hub-dir', d); } catch (err) { /* ignore */ } }
        setDir(d);
      } else if (b.hasAttribute('data-o')) setObject(b.getAttribute('data-o'));
    });
    document.addEventListener('hub:direction', function (e) { var d = e.detail && e.detail.dir; if (d === 'bazaar' || d === 'royal') setDir(d); });
    if (window.ResizeObserver) new ResizeObserver(function () { fit(); }).observe(stage); else window.addEventListener('resize', fit);
    if (window.IntersectionObserver) new IntersectionObserver(function (en) { onScreen = en[0].isIntersecting; if (onScreen) { last = 0; kick(); } }).observe(stage);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) { last = 0; kick(); } });
    syncAuto();

    /* ---- load art manifests, then show ---- */
    function init() {
      if (inited) return; inited = true;
      Promise.all([getJSON(base + 'assets/bags/art/manifest.json'), getJSON(base + 'assets/boxes/art/manifest.json'), getJSON(base + 'assets/cups/art/manifest.json')]).then(function (m) {
        if (m[0] && m[0].faces) objects.push(bagObject(m[0], base));
        if (m[1] && m[1].containers) objects = objects.concat(boxObjects(m[1], base));
        if (m[2] && m[2].faces) objects = objects.concat(cupObjects(m[2], base));
        if (!objects.length) { loadMsg.textContent = 'The viewer could not load the artwork. Please try again.'; return; }
        loadMsg.hidden = true;
        rObj.textContent = '';
        objects.forEach(function (o) {
          var b = mk('button'); b.type = 'button'; b.setAttribute('data-o', o.id); b.textContent = o.label; b.setAttribute('aria-pressed', 'false'); rObj.appendChild(b);
        });
        q('[data-r="objwrap"]').hidden = objects.length < 2;
        if (!window.Hub || !window.Hub.openFrame || opt.full === false) fullBtn.hidden = true; else fullBtn.hidden = false;
        setObject(opt.initial || objects[0].id);
        kick();
      });
    }
    if (window.IntersectionObserver && !opt.immediate) {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); init(); } }, { rootMargin: '400px' });
      io.observe(root);
    } else init();

    return { setObject: setObject, setDir: setDir, go: go };
  }

  window.CDSpin = { mount: mount };
})();

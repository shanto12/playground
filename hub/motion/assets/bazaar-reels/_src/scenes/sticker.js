/* ANIMATED STICKERS — 4 s seamless loops, 1080×1080, die-cut white border + hard indigo shadow.
 * Rendered on a solid colour for the MP4; the same page renders with a transparent background for the alpha WebM. */
(function () {
  const { C, E, K, seg, clamp, lerp, mod, h, s, box, T, Dish, Burst, osc, TAU } = M;
  const W = 1080, H = 1080, P = 4;
  const { kind, bg } = JOB.params;
  const st = document.getElementById('stage');
  if (!JOB.transparent) st.style.background = bg;
  // die-cut filter (CSS px of the filtered element)
  const defs = s('svg', { width: 0, height: 0, style: 'position:absolute', 'aria-hidden': 'true' }, st);
  defs.innerHTML = '<defs><filter id="dc" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">' +
    '<feMorphology in="SourceAlpha" operator="dilate" radius="17" result="a1"/>' +
    '<feFlood flood-color="#FFFFFF"/><feComposite in2="a1" operator="in" result="wb"/>' +
    '<feMorphology in="SourceAlpha" operator="dilate" radius="23" result="a2"/>' +
    '<feFlood flood-color="#1D1147"/><feComposite in2="a2" operator="in" result="ol"/>' +
    '<feOffset in="ol" dx="16" dy="16" result="sh"/>' +
    '<feMerge><feMergeNode in="sh"/><feMergeNode in="ol"/><feMergeNode in="wb"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
  // scale every stroke-width in an icon so big icons keep a sticker-weight line
  const thin = (svg, k) => svg.replace(/stroke-width="([\d.]+)"/g, (m, v) => 'stroke-width="' + (parseFloat(v) * k).toFixed(2) + '"');
  // crop an inline svg's viewBox to its content bbox (+pad)
  function crop(svgEl, pad) {
    const b = svgEl.getBBox();
    svgEl.setAttribute('viewBox', (b.x - pad) + ' ' + (b.y - pad) + ' ' + (b.width + 2 * pad) + ' ' + (b.height + 2 * pad));
    return b;
  }

  /* ════════ bowl with steam ════════ */
  if (kind === 'bowl') {
    const D = Dish(st, 'butter-chicken', 540, 560, 860, { steamPeriod: 4 / 3, sparklePeriod: 1, steamWidth: 17 });
    // pull steam + sparkles out of the die-cut layer into an overlay with the same viewBox
    const ov = D.svg.cloneNode(false);
    ov.removeAttribute('aria-labelledby');
    D.el.appendChild(ov);
    const art = h('div', { class: 'fill', style: { filter: 'url(#dc)' } }, D.el);
    art.appendChild(D.svg);
    D.el.appendChild(ov);
    D.svg.querySelectorAll('.steam,.sparkle').forEach(n => ov.appendChild(n));
    ov.querySelectorAll('.steam').forEach(g => { g.setAttribute('stroke', '#FFFFFF'); g.setAttribute('opacity', '1'); });
    window.renderAt = function (t) {
      const ph = mod(t / 2, 1);
      const sq = Math.pow(Math.max(0, Math.cos(TAU * ph)), 8); // squash pulse at ph=0
      D.el.style.transformOrigin = '50% 82%';
      T(D.el, { y: -26 * Math.sin(Math.PI * ph), sx: 1 + 0.06 * sq, sy: 1 - 0.07 * sq, r: osc(t, 4) * 3 });
      D.at(t, 1);
    };
  }

  /* ════════ spinning chili ════════ */
  if (kind === 'chili') {
    const wrap = box(st, 540, 540, 760, 760, 'ctr');
    const art = h('div', { class: 'fill', style: { filter: 'url(#dc)' } }, wrap, thin(A.icon['chili'], 0.42).replace('<svg ', '<svg width="100%" height="100%" '));
    const sv = art.querySelector('svg');
    sv.querySelector('title') && sv.querySelector('title').remove();
    crop(sv, 4);
    // motion lines + heat sparks (not die-cut)
    const fx = s('svg', { viewBox: '-540 -540 1080 1080', width: 1080, height: 1080, class: 'abs', style: 'left:0;top:0;overflow:visible', 'aria-hidden': 'true' }, st);
    const arcs = [0, 1, 2].map(i => s('path', { d: 'M0 0', fill: 'none', stroke: i === 1 ? C.rani : C.cream, 'stroke-width': 18, 'stroke-linecap': 'round' }, fx));
    const sparks = Burst(st, 540, 540, 10, 12, { dist: 230, r0: 330, size: 34, dur: 0.6, colors: [C.chili, C.saffron, C.cream, C.rani] });
    const sparks2 = Burst(st, 540, 540, 10, 13, { dist: 230, r0: 330, size: 34, dur: 0.6, colors: [C.chili, C.saffron, C.cream, C.rani] });
    window.renderAt = function (t) {
      // two spins per loop, each eased (wind-up → whip → settle)
      const u = mod(t, 2) / 2;
      const spin = K(u, [[0, 0], [0.12, -14, E.inOutSine], [0.62, 372, E.inOutCubic], [0.8, 360, E.inOutSine], [1, 360]]);
      const vel = Math.abs(K(u + 0.01, [[0, 0], [0.12, -14, E.inOutSine], [0.62, 372, E.inOutCubic], [0.8, 360, E.inOutSine], [1, 360]]) - spin);
      const stretch = clamp(vel / 9, 0, 1);
      wrap.style.transformOrigin = '50% 50%';
      T(wrap, { r: -18 + spin, sx: 1 + 0.08 * stretch, sy: 1 - 0.1 * stretch, y: osc(t, 2, 0.25) * 10 });
      // speed arcs trail the spin
      arcs.forEach((a, i) => {
        const R = 380 + i * 34;
        const a1 = (-18 + spin - 70 - i * 10) * Math.PI / 180, len = (0.5 + 0.9 * stretch) * (1 - i * 0.2);
        const a0 = a1 - len;
        a.setAttribute('d', 'M' + (Math.cos(a0) * R).toFixed(1) + ' ' + (Math.sin(a0) * R).toFixed(1) + ' A ' + R + ' ' + R + ' 0 0 1 ' + (Math.cos(a1) * R).toFixed(1) + ' ' + (Math.sin(a1) * R).toFixed(1));
        a.setAttribute('opacity', (stretch > 0.15 ? stretch : 0).toFixed(2));
      });
      sparks.at(t - 1.3); sparks2.at(t - 3.3 > -2 ? t - 3.3 : t + 0.7);
    };
  }

  /* ════════ bouncing naan ════════ */
  if (kind === 'naan') {
    const shadow = h('div', { class: 'abs', style: { left: '340px', top: '900px', width: '400px', height: '56px', borderRadius: '50%', background: 'rgba(29,17,71,.35)' } }, st);
    const wrap = box(st, 540, 560, 540, 540, 'ctr');
    const art = h('div', { class: 'fill', style: { filter: 'url(#dc)' } }, wrap, thin(A.icon['naan'], 0.4).replace('<svg ', '<svg width="100%" height="100%" '));
    const sv = art.querySelector('svg');
    sv.querySelector('title') && sv.querySelector('title').remove();
    crop(sv, 3);
    const bursts = [Burst(st, 540, 880, 9, 21, { dist: 170, r0: 220, size: 26, dur: 0.5 }), Burst(st, 540, 880, 9, 22, { dist: 170, r0: 220, size: 26, dur: 0.5 })];
    const GROUND = 640, PEAK = 300; // naan centre y at contact / at the top of the hop
    window.renderAt = function (t) {
      const u = mod(t, 2) / 2;              // one hop per 2 s; contact at u = 0
      const air = 0.14;                       // ground contact window on each side
      let y, sx = 1, sy = 1, r;
      if (u < air || u > 1 - air) {           // squash on the ground
        const k = u < air ? u / air : (1 - u) / air; // 0 at impact → 1 at take-off/landing edge
        const sq = 1 - k;
        y = 0; sx = 1 + 0.22 * Math.sin(Math.PI * 0.5 * sq) * (u < air ? 1 : 1); sy = 1 - 0.2 * Math.sin(Math.PI * 0.5 * sq);
      } else {
        const v = (u - air) / (1 - 2 * air);  // 0..1 airtime
        y = -4 * PEAK * v * (1 - v);
        const sp = Math.abs(1 - 2 * v);       // fast near ground → stretch
        sy = 1 + 0.12 * sp; sx = 1 - 0.08 * sp;
      }
      const v2 = clamp((u - air) / (1 - 2 * air));
      r = -8 + 360 * E.inOutCubic(v2);         // one flip per hop
      wrap.style.transformOrigin = '50% 50%';
      T(wrap, { y: y + (GROUND - 560), sx, sy, r });
      const hgt = -y / PEAK;
      T(shadow, { s: 1 - 0.45 * hgt, o: 1 - 0.55 * hgt });
      const tt = mod(t, 2);
      bursts[0].at(tt < 1 ? tt : tt - 2); // landing sparkles at each contact
      bursts[1].at(t - 2 >= 0 ? t - 2 : t + 2);
    };
  }

  /* ════════ District stamp — stamp-down ════════ */
  if (kind === 'stamp') {
    const ring = h('div', { class: 'abs', style: { left: '0', top: '0', borderRadius: '50%', border: '14px solid ' + C.rani, opacity: 0 } }, st);
    const ring2 = h('div', { class: 'abs', style: { left: '0', top: '0', borderRadius: '50%', border: '10px solid ' + C.marigold, opacity: 0 } }, st);
    const wrap = box(st, 540, 540, 780, 780, '');
    const art = h('div', { class: 'fill', style: { filter: 'url(#dc)' } }, wrap, A.stamp.replace('<svg ', '<svg width="100%" height="100%" '));
    const sv = art.querySelector('svg'); sv.querySelector('title') && sv.querySelector('title').remove();
    const burst = Burst(st, 540, 540, 14, 31, { dist: 210, r0: 420, size: 34, dur: 0.6 });
    const IMP = 0.52;
    window.renderAt = function (t) {
      let sc, r, o, y = 0;
      if (t < IMP) {          // hover in & wind up
        const u = seg(t, 0.05, IMP);
        sc = lerp(1.7, 1.0, E.inCubic(u)); r = lerp(-26, -6, E.inCubic(u)); o = seg(t, 0.05, 0.2); y = lerp(-120, 0, E.inCubic(u));
      } else if (t < 3.35) {   // slam: squash → overshoot → settle, then a gentle wobble
        const v = t - IMP;
        sc = K(v, [[0, 0.86], [0.1, 1.06, E.outQuad], [0.22, 0.98], [0.36, 1.0]]);
        r = -6 + K(v, [[0, 0], [0.12, 3, E.outQuad], [0.3, -1], [0.5, 0]]) + Math.sin(v * 2.4) * 1.5 * seg(v, 0.5, 1.2);
        o = 1;
      } else {                 // peel off
        const u = seg(t, 3.35, 3.85);
        sc = lerp(1.0, 1.35, E.inBack(u)); r = -6 + Math.sin((3.35 - IMP) * 2.4) * 1.5 + 18 * E.inCubic(u); o = 1 - E.inCubic(u); y = -120 * E.inCubic(u);
      }
      T(wrap, { s: sc, r, o, y });
      // ink ring + shake on impact
      const rp = seg(t, IMP, IMP + 0.55);
      const R = 330 + 220 * E.outCubic(rp);
      ring.style.opacity = rp > 0 && rp < 1 ? (1 - rp) : 0;
      ring.style.width = ring.style.height = 2 * R + 'px'; ring.style.left = (540 - R) + 'px'; ring.style.top = (540 - R) + 'px';
      const rp2 = seg(t, IMP + 0.08, IMP + 0.7); const R2 = 330 + 300 * E.outCubic(rp2);
      ring2.style.opacity = rp2 > 0 && rp2 < 1 ? (1 - rp2) : 0;
      ring2.style.width = ring2.style.height = 2 * R2 + 'px'; ring2.style.left = (540 - R2) + 'px'; ring2.style.top = (540 - R2) + 'px';
      burst.at(t - IMP);
      const sh = t > IMP && t < IMP + 0.25 ? Math.sin((t - IMP) * 80) * 12 * (1 - (t - IMP) / 0.25) : 0;
      st.style.transform = 'translate(' + sh.toFixed(1) + 'px,' + (sh * 0.4).toFixed(1) + 'px)';
    };
  }
})();

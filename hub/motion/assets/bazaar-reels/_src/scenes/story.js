/* STORY-AD loops — 6 s, 1080×1920, seamless (state at t=6 equals t=0). kinds: order · party · chai */
(function () {
  const { C, E, K, seg, clamp, lerp, mod, h, s, box, T, Dish, Burst, Petals, Bunting, sunburstSVG, scallopSVG, fit, osc, TAU } = M;
  const W = 1080, H = 1920, P = 6;
  const kind = JOB.params.kind;
  const st = document.getElementById('stage');
  const S = h('div', { class: 'fill' }, st);
  const show = (e, v) => { e.style.display = v ? 'block' : 'none'; };
  // rays rotate exactly one wedge-pair per loop → seamless
  const RAYS = 28, RAY_STEP = 720 / RAYS;
  function cta(parent, y, label, bg, fg, size) {
    const wrap = h('div', { class: 'abs', style: { left: '0', top: y + 'px', width: W + 'px', display: 'flex', justifyContent: 'center' } }, parent,
      '<div class="pill disp" style="background:' + bg + ';color:' + fg + ';font-size:' + (size || 66) + 'px;padding:26px 62px 30px;-webkit-text-stroke:0;text-shadow:none;display:flex;align-items:center;gap:22px">' + label +
      ' <svg width="58" height="58" viewBox="0 0 64 64" fill="none" stroke="' + fg + '" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 32H50M34 16L50 32L34 48"/></svg></div>');
    return wrap.firstChild;
  }
  function tapper(parent) {
    const ring = h('div', { class: 'abs', style: { left: '0', top: '0', borderRadius: '50%', border: '8px solid #FFF4DC', opacity: 0 } }, parent);
    const dot = h('div', { class: 'abs', style: { left: '0', top: '0', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,244,220,.9)', border: '5px solid #1D1147', opacity: 0 } }, parent);
    return function (t, t0, btn, bx, by) { // tap the button at t0
      const press = E.bump(seg(t, t0 - 0.03, t0 + 0.23));
      btn.style.transform = 'translate(' + (press * 9) + 'px,' + (press * 9) + 'px)';
      btn.style.boxShadow = (10 - press * 9) + 'px ' + (10 - press * 9) + 'px 0 #1D1147';
      const tr = seg(t, t0, t0 + 0.5);
      ring.style.opacity = tr > 0 && tr < 1 ? (1 - tr) : 0;
      const rr = 30 + tr * 130;
      ring.style.width = ring.style.height = 2 * rr + 'px'; ring.style.left = (bx - rr) + 'px'; ring.style.top = (by - rr) + 'px';
      const dIn = seg(t, t0 - 0.35, t0 - 0.03), dOut = seg(t, t0 + 0.3, t0 + 0.55);
      dot.style.opacity = dIn > 0 && dOut < 1 ? (1 - dOut) : 0;
      T(dot, { x: lerp(bx + 240, bx, E.outCubic(dIn)) - 32 + E.inCubic(dOut) * 200, y: lerp(by + 280, by, E.outCubic(dIn)) - 32 + E.inCubic(dOut) * 240, s: 1 - press * 0.2 });
    };
  }

  /* ════════ ORDER NOW ════════ */
  if (kind === 'order') {
    S.style.background = C.saffron;
    const rays = box(S, 540, 1000, 3000, 3000, '', sunburstSVG(RAYS, 'rgba(255,255,255,0)', 'rgba(255,176,0,.38)', 1500));
    const petals = Petals(S, W, H, 26, 31, { size: 22, colors: [C.marigold, C.cream, C.rani, C.marigold] });
    const hi = h('div', { class: 'abs hand', style: { left: '0', top: '168px', width: W + 'px', textAlign: 'center', fontSize: '92px', color: C.ink } }, S, '<span style="display:inline-block;transform:rotate(-3deg)" lang="hi-Latn">Bhookh lagi hai?</span>');
    const bigW = h('div', { class: 'abs', style: { left: '0', top: '272px', width: W + 'px', textAlign: 'center' } }, S);
    const big = h('span', { class: 'disp', style: { display: 'inline-block', fontSize: '190px', color: C.cream } }, bigW, 'Hungry?');
    big.style.setProperty('--sw', '18px'); big.style.setProperty('--sh', '12px');
    fit(big, 960);
    const disc = box(S, 540, 975, 760, 760, '', scallopSVG(330, 26, 46, C.sand, C.cream, C.saffron));
    const sats = [['biryani', 0], ['garlic-naan', 1 / 3], ['samosa-chutney', 2 / 3]].map(([k, ph]) => ({ d: Dish(S, k, 540, 990, 290, { steamPeriod: 1.5 }), ph }));
    const main = Dish(S, 'butter-chicken', 540, 960, 600, { steamPeriod: 1.5 });
    const label = h('div', { class: 'abs', style: { left: '0', top: '1318px', width: W + 'px', display: 'flex', justifyContent: 'center' } }, S,
      '<div class="plate" style="background:#FFF4DC;padding:4px 28px 10px;border-radius:16px;transform:rotate(-2deg)"><span class="hand" style="font-size:60px">Butter Chicken, coming right up</span></div>');
    const btn = cta(S, 1420, 'Order now', C.cream, C.ink, 76);
    const sub = h('div', { class: 'abs hand', style: { left: '0', top: '1575px', width: W + 'px', textAlign: 'center', fontSize: '54px', color: C.ink } }, S, 'pickup · delivery · dine-in');
    const tap = tapper(S);
    window.renderAt = function (t) {
      T(rays, { r: (t / P) * RAY_STEP });
      petals.fallAt(t, P);
      T(hi.firstChild, { r: -3 + osc(t, 3) * 1.5 });
      T(big, { s: 1 + 0.035 * Math.max(0, osc(t, 1.5)), r: osc(t, 3, 0.25) * 1.6 });
      T(disc, { r: (t / P) * (360 / 26) });
      // orbit: satellites travel an ellipse; depth via scale + z-order
      sats.forEach(o => {
        const a = TAU * (t / P + o.ph) + Math.PI / 2;
        const x = Math.cos(a) * 450, y = Math.sin(a) * 190 - 10;
        const depth = (Math.sin(a) + 1) / 2; // 0 back … 1 front
        T(o.d.el, { x, y, s: 0.7 + 0.35 * depth, r: Math.cos(a) * 8 });
        o.d.el.style.zIndex = depth > 0.5 ? 3 : 1;
        o.d.at(t);
      });
      main.el.style.zIndex = 2;
      T(main.el, { y: osc(t, 1.5) * 10, r: osc(t, 3) * 1.5 });
      main.at(t);
      [label, btn.parentNode, sub].forEach(e => (e.style.zIndex = 4));
      T(label.firstChild, { r: -2 + osc(t, 2) * 1 });
      tap(t, 3.9, btn, 540 + 220, 1420 + 66);
      T(sub, { o: 1 });
    };
  }

  /* ════════ PARTY TRAYS ════════ */
  if (kind === 'party') {
    S.style.background = C.peacock;
    const rays = box(S, 540, 960, 3000, 3000, '', sunburstSVG(RAYS, 'rgba(255,255,255,0)', 'rgba(255,244,220,.16)', 1500));
    const bunt = Bunting(S, W, 20, 60, 10, { flagW: 72, flagH: 90 });
    const mkLine = (y, txt, col) => {
      const wr = h('div', { class: 'abs', style: { left: '0', top: y + 'px', width: W + 'px', textAlign: 'center' } }, S);
      const sp = h('span', { class: 'disp', style: { display: 'inline-block', fontSize: '112px', color: col } }, wr, txt);
      sp.style.setProperty('--sw', '16px'); sp.style.setProperty('--sh', '10px');
      fit(sp, 960);
      return sp;
    };
    const l1 = mkLine(190, 'Your party.', C.cream), l2 = mkLine(330, 'Our platters.', C.marigold);
    // the tray
    const TX = 80, TY = 560, TW = 920, TH = 700;
    const tray = h('div', { class: 'abs', style: { left: TX + 'px', top: TY + 'px', width: TW + 'px', height: TH + 'px', background: C.saffron, border: '8px solid #1D1147', borderRadius: '44px', boxShadow: '16px 16px 0 #1D1147' } }, S);
    const cells = [];
    const cw = (TW - 16 - 4 * 22) / 3, ch = (TH - 16 - 3 * 22) / 2;
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
      const x = 22 + c * (cw + 22), y = 22 + r * (ch + 22);
      h('div', { class: 'abs', style: { left: x + 'px', top: y + 'px', width: cw + 'px', height: ch + 'px', background: C.cream, border: '6px solid #1D1147', borderRadius: '26px', boxShadow: 'inset 0 -14px 0 ' + C.sand } }, tray);
      cells.push([TX + 8 + x + cw / 2, TY + 8 + y + ch / 2]);
    }
    const keys = ['biryani', 'tandoori-platter', 'paneer-tikka', 'samosa-chutney', 'garlic-naan', 'gulab-jamun'];
    const dishes = keys.map((k, i) => Dish(S, k, cells[i][0], cells[i][1] - 6, 330, { steamPeriod: 1.5, sparkleGain: 0.8 }));
    const bursts = cells.map((c, i) => Burst(S, c[0], c[1], 8, 40 + i, { dist: 150, r0: 110, size: 22, dur: 0.55 }));
    const conf = Petals(S, W, H, 60, 7, { size: 24, colors: [C.marigold, C.rani, C.cream, C.saffron, C.cilantro] });
    const occW = h('div', { class: 'abs', style: { left: '0', top: '1296px', width: W + 'px', textAlign: 'center' } }, S);
    const occ = h('span', { class: 'hand', style: { display: 'inline-block', fontSize: '60px', color: C.cream } }, occW, 'birthdays · office lunches · housewarmings');
    fit(occ, 990);
    const btn = cta(S, 1392, 'Plan my party', C.marigold, C.ink, 70);
    const call = h('div', { class: 'abs body', style: { left: '0', top: '1556px', width: W + 'px', textAlign: 'center', fontSize: '38px', fontWeight: 700, color: C.cream } }, S, 'Call us to plan your spread.');
    const tap = tapper(S);
    const DROP0 = 0.3, GAP = 0.27;
    window.renderAt = function (t) {
      T(rays, { r: (t / P) * RAY_STEP });
      bunt.loopAt(t, P);
      T(l1, { r: osc(t, 3) * 1.2 });
      T(l2, { r: osc(t, 3, 0.5) * 1.2 });
      T(tray, { y: 0 });
      dishes.forEach((d, i) => {
        const t0 = DROP0 + i * GAP, land = t0 + 0.24;
        const out0 = 5.05 + (5 - i) * 0.08;
        d.el.style.transformOrigin = '50% 80%';
        let y = 0, sx = 1, sy = 1, o = 1, sc = 1;
        if (t < t0) { o = 0; }
        else if (t < land) { const u = (t - t0) / 0.24; y = lerp(-160, 0, E.inQuad(u)); sc = lerp(0.2, 1.05, E.outQuad(u)); sx = 0.9; sy = 1.12; }
        else { const v = t - land; sy = K(v, [[0, 0.8], [0.08, 1.08, E.outQuad], [0.18, 0.97], [0.3, 1]]); sx = K(v, [[0, 1.18], [0.08, 0.95, E.outQuad], [0.18, 1.02], [0.3, 1]]); }
        if (t > out0) { const u = seg(t, out0, out0 + 0.32); sc = Math.max(0.001, 1 - E.inBack(u)); o = u >= 1 ? 0 : 1; }
        T(d.el, { y, sx: sx * sc, sy: sy * sc, o, r: osc(t, 2, i * 0.17) * 2 * (t > land + 0.3 ? 1 : 0) });
        d.at(t, t < land ? 0 : 1);
        bursts[i].at(t - land);
      });
      conf.burstAt(t - (DROP0 + 5 * GAP + 0.3), 540, 900);
      T(btn, {});
      tap(t, 3.7, btn, 540 + 240, 1392 + 64);
    };
  }

  /* ════════ CHAI TIME ════════ */
  if (kind === 'chai') {
    S.style.background = C.ink;
    const rays = box(S, 540, 1060, 3000, 3000, '', sunburstSVG(RAYS, 'rgba(255,255,255,0)', 'rgba(123,92,255,.16)', 1500));
    const hi = h('div', { class: 'abs hand', style: { left: '0', top: '146px', width: W + 'px', textAlign: 'center', fontSize: '214px', color: C.marigold } }, S, '<span style="display:inline-block;transform:rotate(-4deg)" lang="hi-Latn">Chai lo.</span>');
    const gl = h('div', { class: 'abs body', style: { left: '0', top: '376px', width: W + 'px', textAlign: 'center', fontSize: '44px', fontWeight: 700, color: C.cream } }, S, '(translation: have some chai)');
    const sun = box(S, 540, 1060, 860, 860, '', '<svg viewBox="-430 -430 860 860" width="860" height="860" aria-hidden="true"><circle r="400" fill="#FFB000" stroke="#1D1147" stroke-width="8"/><circle r="340" fill="none" stroke="#FF6A13" stroke-width="10" stroke-dasharray="3 30" stroke-linecap="round"/></svg>');
    // one SVG for kettle + stream + cups so the stream can be computed in world coords
    const sv = s('svg', { viewBox: '0 0 1080 1920', width: 1080, height: 1920, class: 'abs', style: 'left:0;top:0;overflow:visible', 'aria-hidden': 'true' }, S);
    const CUPX = 540, CUPY = 1010; // rim centre
    const GL = 'M-170 0 L-128 340 C-126 352 -116 360 -102 360 H102 C116 360 126 352 128 340 L170 0 Z';
    const cupMarkup = (id) =>
      '<defs><clipPath id="' + id + 'c"><path d="' + GL + '"/></clipPath></defs>' +
      '<path d="' + GL + '" transform="translate(14 14)" fill="#1D1147"/>' +
      '<path d="' + GL + '" fill="#FFF4DC"/>' +
      '<g clip-path="url(#' + id + 'c)"><rect class="tea" x="-200" y="370" width="400" height="420" fill="#8A3A1E"/>' +
      '<rect x="-200" y="300" width="400" height="80" fill="#FFE7B8" opacity=".55"/>' +
      [-120, -72, -24, 24, 72, 120].map(x => '<path d="M' + x + ' 26 L' + (x * 0.76) + ' 300" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" opacity=".38"/>').join('') + '</g>' +
      '<path d="' + GL + '" fill="none" stroke="#1D1147" stroke-width="8" stroke-linejoin="round"/>' +
      '<path d="M-140 50 L-110 290" fill="none" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" opacity=".9"/>' +
      '<ellipse cx="0" cy="0" rx="170" ry="34" fill="#FFF4DC" stroke="#1D1147" stroke-width="8"/>' +
      '<ellipse class="surf" cx="0" cy="8" rx="146" ry="24" fill="#8A3A1E" stroke="#1D1147" stroke-width="5"/>' +
      '<path class="foam" d="M-70 8 C-30 -6 10 22 60 4" fill="none" stroke="#FFE7B8" stroke-width="9" stroke-linecap="round"/>';
    const mkCup = (id) => { const g = s('g', {}, sv); g.innerHTML = cupMarkup(id); return { g, tea: g.querySelector('.tea'), surf: g.querySelector('.surf'), foam: g.querySelector('.foam') }; };
    const stream = s('path', { fill: 'none', stroke: '#8A3A1E', 'stroke-width': 30, 'stroke-linecap': 'round' }, sv);
    const streamOL = s('path', { fill: 'none', stroke: '#1D1147', 'stroke-width': 44, 'stroke-linecap': 'round' }, sv);
    sv.insertBefore(streamOL, stream);
    const streamHi = s('path', { fill: 'none', stroke: '#C46A35', 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-dasharray': '40 70' }, sv);
    const cupA = mkCup('ca'), cupB = mkCup('cb');
    // ketli (kettle): spout on the left, handle on the right; local origin = body centre
    const ket = s('g', {}, sv);
    ket.innerHTML =
      '<path d="M150 -70 C 270 -80 290 110 150 100" fill="none" stroke="#1D1147" stroke-width="34" stroke-linecap="round"/><path d="M150 -70 C 270 -80 290 110 150 100" fill="none" stroke="#FFB000" stroke-width="14" stroke-linecap="round"/>' +
      '<path d="M-135 30 C -205 30 -250 -10 -296 -72 L -318 -52 C -268 30 -220 80 -140 86 Z" fill="#00A8A0" stroke="#1D1147" stroke-width="8" stroke-linejoin="round"/>' +
      '<path d="M-160 -50 C -160 -170 160 -170 160 -50 L 140 110 C 130 160 -130 160 -140 110 Z" fill="#00A8A0" stroke="#1D1147" stroke-width="8" stroke-linejoin="round"/>' +
      '<path d="M-156 10 L 154 10 L 150 46 L -151 46 Z" fill="#FFB000" stroke="#1D1147" stroke-width="6" stroke-linejoin="round"/>' +
      [-110, -55, 0, 55, 110].map(x => '<circle cx="' + x + '" cy="28" r="8" fill="#E4147E" stroke="#1D1147" stroke-width="4"/>').join('') +
      '<ellipse cx="0" cy="-128" rx="100" ry="24" fill="#FFB000" stroke="#1D1147" stroke-width="8"/>' +
      '<circle cx="0" cy="-160" r="22" fill="#E4147E" stroke="#1D1147" stroke-width="7"/>' +
      '<path d="M-120 -70 C -116 -20 -108 30 -96 70" fill="none" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" opacity=".7"/>';
    const TIP = [-306, -62];
    // steam above the cup (cream wisps)
    const steamG = s('g', { fill: 'none', stroke: '#FFF4DC', 'stroke-width': 16, 'stroke-linecap': 'round' }, sv);
    const wisps = [-70, 0, 70].map((x, i) => {
      const p = s('path', { d: 'M' + (CUPX + x) + ' ' + (CUPY - 40) + ' c 30 -50 -30 -90 0 -140 c 30 -50 -30 -90 0 -140 c 30 -50 -30 -90 0 -140', opacity: 0 }, steamG);
      return { p, L: p.getTotalLength(), i, rev: false };
    });
    const sparks = Burst(S, CUPX, CUPY - 60, 10, 3, { dist: 260, r0: 200, size: 30, dur: 0.7 });
    const sign = h('div', { class: 'abs', style: { left: '0', top: '1440px', width: W + 'px', display: 'flex', justifyContent: 'center' } }, S,
      '<div class="sign"><div class="in"><div class="t" style="font-size:64px">Chai &amp; Coolers</div></div></div>');
    const sub = h('div', { class: 'abs hand', style: { left: '0', top: '1590px', width: W + 'px', textAlign: 'center', fontSize: '58px', color: C.cream } }, S, 'sip slowly, ideally with pakora');
    const pour0 = 0.75, pour1 = 3.0;
    window.renderAt = function (t) {
      T(rays, { r: (t / P) * RAY_STEP });
      T(hi.firstChild, { r: -4 + osc(t, 3) * 2, s: 1 + 0.02 * osc(t, 1.5) });
      T(sun, { s: 1 + 0.015 * osc(t, 3) });
      // kettle path: enters from top-right, tilts to pour, tilts back, leaves
      const enter = E.outBack(seg(t, 0.0, 0.6)), leave = E.inBack(seg(t, 3.25, 3.85));
      const kx = lerp(1720, 840, enter) + leave * 900, ky = lerp(180, 668, enter) - leave * 820;
      const tilt = K(t, [[0.35, 0], [0.8, -40, E.outBack], [2.95, -44, E.inOutSine], [3.35, 0, E.inOutCubic]]);
      ket.setAttribute('transform', 'translate(' + kx.toFixed(1) + ' ' + ky.toFixed(1) + ') rotate(' + tilt.toFixed(2) + ')');
      const a = tilt * Math.PI / 180;
      const tx = kx + TIP[0] * Math.cos(a) - TIP[1] * Math.sin(a), ty = ky + TIP[0] * Math.sin(a) + TIP[1] * Math.cos(a);
      // cup A (pouring) and cup B (arrives at the end so the loop is seamless)
      const exitA = E.inBack(seg(t, 5.0, 5.55)), inB = E.outBack(seg(t, 5.3, 6.0));
      const ax = CUPX - exitA * 900, bx = CUPX + (1 - inB) * 900;
      const bob = t > 3.2 && t < 5.0 ? Math.sin((t - 3.2) * 9) * 8 * Math.exp(-(t - 3.2) * 2) : 0;
      cupA.g.setAttribute('transform', 'translate(' + ax.toFixed(1) + ' ' + (CUPY + bob).toFixed(1) + ') rotate(' + (-exitA * 14).toFixed(2) + ')');
      cupB.g.setAttribute('transform', 'translate(' + bx.toFixed(1) + ' ' + CUPY + ') rotate(' + ((1 - inB) * 10).toFixed(2) + ')');
      cupB.g.setAttribute('opacity', t > 5.3 ? 1 : 0);
      // fill level: 0 → 0.86 of cup depth while pouring
      const lvl = E.inOutSine(seg(t, pour0 + 0.15, pour1 + 0.1));
      const topY = lerp(360, 30, lvl);
      cupA.tea.setAttribute('y', topY.toFixed(1));
      const show2 = lvl > 0.02;
      // the chai surface ellipse sits at the rim once nearly full; below that the tea's top edge is hidden inside the cup
      cupA.surf.setAttribute('opacity', lvl > 0.9 ? 1 : 0);
      cupA.foam.setAttribute('opacity', seg(lvl, 0.9, 1));
      cupB.surf.setAttribute('opacity', 0); cupB.foam.setAttribute('opacity', 0); cupB.tea.setAttribute('y', 370);
      // stream: from spout tip down into the cup
      const sOn = seg(t, pour0, pour0 + 0.18) * (1 - seg(t, pour1, pour1 + 0.25));
      const head = clamp(seg(t, pour0, pour0 + 0.22));
      const tail = seg(t, pour1, pour1 + 0.28);
      const ex = CUPX - 10, ey = CUPY + lerp(340, 24, lvl);
      const sx0 = lerp(tx, ex, E.inQuad(tail)), sy0 = lerp(ty, ey, E.inQuad(tail));
      const hx = lerp(tx, ex, E.inQuad(head)), hy = lerp(ty, ey, E.inQuad(head));
      const d = 'M' + sx0.toFixed(1) + ' ' + sy0.toFixed(1) + ' Q ' + ((sx0 + hx) / 2 - 30).toFixed(1) + ' ' + ((sy0 + hy) / 2 - 10).toFixed(1) + ' ' + hx.toFixed(1) + ' ' + hy.toFixed(1);
      [stream, streamOL, streamHi].forEach(p => { p.setAttribute('d', d); p.setAttribute('opacity', sOn > 0.001 && head > 0 && tail < 1 ? 1 : 0); });
      streamHi.setAttribute('stroke-dashoffset', (-t * 520).toFixed(1));
      stream.setAttribute('stroke-width', (30 * (0.6 + 0.4 * sOn)).toFixed(1));
      streamOL.setAttribute('stroke-width', (44 * (0.6 + 0.4 * sOn)).toFixed(1));
      // steam rises once the cup is full
      const sf = seg(t, 2.6, 3.2) * (1 - seg(t, 4.9, 5.2));
      wisps.forEach(w => {
        const ph = mod(t / 1.0 + w.i * 0.33, 1);
        const dl = w.L * 0.45;
        w.p.setAttribute('stroke-dasharray', dl + ' ' + (w.L * 2 + dl));
        w.p.setAttribute('stroke-dashoffset', (dl - ph * (w.L + dl)).toFixed(1));
        w.p.setAttribute('opacity', (sf * Math.sin(Math.PI * ph)).toFixed(3));
      });
      steamG.setAttribute('transform', 'translate(' + (ax - CUPX) + ' 0)');
      sparks.at(t - 3.25);
      T(sign.firstChild, { r: osc(t, 3) * 1.6 });
      T(sub, { r: 0 });
    };
  }
})();

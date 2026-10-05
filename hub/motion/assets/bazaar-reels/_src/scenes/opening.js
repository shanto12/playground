/* DISTRICT OPENING — 15 s, 1080×1920. Logo reveal → 6-dish parade → spice meter → end card. */
(function () {
  const { C, E, K, seg, clamp, lerp, mod, h, box, T, Dish, Burst, Petals, Bunting, Logo, sunburstSVG, mix } = M;
  const W = 1080, H = 1920;
  const st = document.getElementById('stage');

  /* ───────── Scene A · logo reveal (0 – 3.75 s) ───────── */
  const A1 = h('div', { class: 'fill' }, st);
  A1.style.background = C.cream;
  const raysA = box(A1, 540, 760, 2600, 2600, '', sunburstSVG(32, C.cream, C.sand, 1300));
  const petalsA = Petals(A1, W, H, 64, 11, { size: 26 });
  const bunt = Bunting(A1, W, 372, 46, 11, { flagW: 74, flagH: 92 });
  const logoA = Logo(A1, { layout: 'stacked', cx: 540, cy: 990, scale: 1.42 });
  const hookA = h('div', { class: 'abs', style: { left: '0', top: '150px', width: W + 'px', textAlign: 'center' } }, A1,
    '<div class="hand" style="font-size:84px;color:#E4147E;transform:rotate(-3deg)">Bhookh lagi hai?</div>' +
    '<div class="disp" style="font-size:66px;color:#FFB000;--sw:13px;--sh:7px;margin-top:4px">Follow the steam.</div>');
  const hk1 = hookA.children[0], hk2 = hookA.children[1];
  const tagA = h('div', { class: 'abs body', style: { left: '0', top: '1478px', width: W + 'px', textAlign: 'center', fontWeight: 800, fontSize: '38px', letterSpacing: '.18em', color: C.ink } }, A1, 'INDIAN KITCHEN · LITTLE ELM, TX');
  const LK = { gate: 0.05, sun: 0.4, steam: 1.0, bunt: 1.05, curry: 1.75, dist: 2.05 };
  const sunPt = logoA.emPt(100, 150);

  /* ───────── Scene B · dish parade (3.6 – 9.75 s) ───────── */
  const B = h('div', { class: 'fill' }, st);
  const DISHES = [
    { zone: 'starters', art: 'samosa-chutney', item: 'Veg Samosa', bg: C.saffron, sign: C.peacock },
    { zone: 'tandoor', art: 'tandoori-platter', item: 'Tandoori Chicken', bg: C.rani, sign: C.peacock },
    { zone: 'curry', art: 'butter-chicken', item: 'Butter Chicken', bg: C.peacock, sign: C.rani },
    { zone: 'biryani', art: 'biryani', item: 'Chicken Dum Biryani', bg: C.marigold, sign: C.peacock },
    { zone: 'bread', art: 'garlic-naan', item: 'Garlic Naan', bg: C.cilantro, sign: C.rani },
    { zone: 'indochinese', art: 'chilli-chicken', item: 'Chilli Chicken', bg: C.ink, sign: C.saffron }
  ];
  const zname = id => A.menu.zones.find(z => z.id === id).name;
  const pop = name => { const it = A.menu.items.find(i => i.name === name); return it && it.popular; };
  const T0 = 3.82, P = 0.97;
  const slots = DISHES.map((d, i) => {
    const sl = h('div', { class: 'fill' }, B);
    sl.style.background = d.bg;
    const rays = box(sl, 540, 900, 2800, 2800, '', sunburstSVG(28, 'rgba(255,255,255,0)', d.bg === C.ink ? 'rgba(228,20,126,.22)' : 'rgba(255,244,220,.2)', 1400));
    // scalloped cream disc (rangoli plate) behind the dish
    let sc = '';
    const n = 28, R = 390;
    for (let k = 0; k < n; k++) { const a = k / n * M.TAU; sc += '<circle cx="' + (Math.cos(a) * R).toFixed(1) + '" cy="' + (Math.sin(a) * R).toFixed(1) + '" r="52"/>'; }
    const disc = box(sl, 540, 900, 1000, 1000, '', '<svg viewBox="-500 -500 1000 1000" width="1000" height="1000" aria-hidden="true">' +
      '<g transform="translate(16 16)" fill="#1D1147">' + sc + '<circle r="' + R + '"/></g>' +
      '<g fill="' + C.sand + '" stroke="#1D1147" stroke-width="7">' + sc + '</g><circle r="' + (R + 2) + '" fill="' + C.sand + '"/>' +
      '<circle r="' + (R - 30) + '" fill="' + C.cream + '" stroke="#1D1147" stroke-width="7"/>' +
      '<circle r="' + (R - 58) + '" fill="none" stroke="' + d.bg + '" stroke-width="6" stroke-dasharray="2 22" stroke-linecap="round" opacity=".9"/></svg>');
    const dish = Dish(sl, d.art, 540, 880, 860, {});
    const burst = Burst(sl, 540, 880, 14, 100 + i, { dist: 420, r0: 300, size: 34 });
    const signW = 940;
    const sign = h('div', { class: 'abs', style: { left: (540 - signW / 2) + 'px', top: '1330px', width: signW + 'px', display: 'flex', justifyContent: 'center' } }, sl,
      '<div class="sign" style="background:' + d.sign + '"><div class="in"><div class="t" style="font-size:60px">' + zname(d.zone) + '</div></div></div>');
    const tag = h('div', { class: 'abs', style: { left: '0', top: '1500px', width: W + 'px', display: 'flex', justifyContent: 'center' } }, sl,
      '<div class="plate" style="background:#FFF4DC;padding:6px 30px 12px;border-radius:16px;display:flex;align-items:center;gap:16px">' +
      '<span class="hand" style="font-size:62px;color:#1D1147">' + d.item + '</span>' +
      (pop(d.item) ? '<span class="body" style="font-weight:800;font-size:24px;letter-spacing:.08em;background:#E4147E;color:#FFF4DC;border:4px solid #1D1147;border-radius:999px;padding:6px 14px 5px">FAN FAVE</span>' : '') + '</div>');
    return { sl, rays, disc, dish, burst, sign: sign.firstChild, tag: tag.firstChild, d, t0: T0 + i * P };
  });
  // route map header (persistent through the parade)
  const route = h('div', { class: 'abs plate', style: { left: '120px', top: '168px', width: '840px', height: '128px', background: C.cream, borderRadius: '64px' } }, B);
  h('div', { class: 'abs disp', style: { left: '0', top: '14px', width: '100%', textAlign: 'center', fontSize: '30px', color: C.ink, WebkitTextStroke: '0', textShadow: 'none', letterSpacing: '.06em' } }, route, 'The District tour');
  const rl = h('div', { class: 'abs', style: { left: '70px', top: '74px', width: '688px', height: '0', borderTop: '6px dashed #1D1147' } }, route);
  const stops = DISHES.map((d, i) => h('div', { class: 'abs', style: { left: (70 + i * 137.6 - 17) + 'px', top: '60px', width: '34px', height: '34px', borderRadius: '50%', border: '6px solid #1D1147', background: C.cream } }, route));

  /* ───────── Scene C · spice meter (9.6 – 12.4 s) ───────── */
  const Cc = h('div', { class: 'fill' }, st);
  const raysC = box(Cc, 540, 1060, 2800, 2800, '', sunburstSVG(36, 'rgba(255,255,255,0)', 'rgba(255,244,220,.16)', 1400));
  const titleC = h('div', { class: 'abs', style: { left: '0', top: '175px', width: W + 'px', textAlign: 'center' } }, Cc,
    '<div class="hand" style="font-size:132px;color:#1D1147;display:inline-block;transform:rotate(-3deg)">How hot are you?</div>');
  const titleClip = titleC.firstChild;
  const subC = h('div', { class: 'abs body', style: { left: '0', top: '360px', width: W + 'px', textAlign: 'center', fontSize: '40px', fontWeight: 700, color: C.ink } }, Cc,
    '<i style="font-style:normal" lang="hi-Latn">Thoda teekha</i> (a little spicy) or full fire?');
  const LV = ['Mild', 'Medium', 'Hot', 'Extra Hot', 'District Hot'];
  const tube = h('div', { class: 'abs', style: { left: '96px', top: '560px', width: '72px', height: '1010px' } }, Cc,
    '<div class="abs" style="left:0;top:0;width:72px;height:950px;border:7px solid #1D1147;border-radius:36px;background:#FFF4DC;box-shadow:8px 8px 0 #1D1147;overflow:hidden"><div class="fillbar abs" style="left:0;bottom:0;width:100%;height:0;background:#D62839"></div></div>' +
    '<div class="abs" style="left:-24px;top:890px;width:120px;height:120px;border-radius:50%;border:7px solid #1D1147;background:#D62839;box-shadow:8px 8px 0 #1D1147"></div>');
  const fillbar = tube.querySelector('.fillbar');
  const rows = LV.map((name, i) => {
    const y = 1440 - i * 205;
    const disc = box(Cc, 330, y, 176, 176, 'ctr', '<div style="width:176px;height:176px;border-radius:50%;background:#FFF4DC;border:7px solid #1D1147;box-shadow:9px 9px 0 #1D1147" class="ctr">' + A.icon['chili-' + (i + 1)].replace('<svg ', '<svg width="132" height="132" ') + '</div>');
    const lab = h('div', { class: 'abs', style: { left: '450px', top: (y - 52) + 'px' } }, Cc,
      '<div class="disp" style="font-size:' + (i === 4 ? 74 : 66) + 'px;color:' + (i === 4 ? C.cream : C.cream) + ';--sw:12px;--sh:7px">' + name + '</div>');
    const num = h('div', { class: 'abs hand', style: { left: '452px', top: (y + 30) + 'px', fontSize: '44px', color: C.ink } }, Cc, ['easy-going', 'a little kick', 'proper heat', 'brave territory', 'you were warned'][i]);
    return { disc, lab, num, y };
  });
  const flameBurst = Petals(Cc, W, H, 40, 77, { size: 24, colors: [C.chili, C.saffron, C.marigold, C.chili, C.cream] });

  /* ───────── Scene D · end card (12.2 – 15 s) ───────── */
  const D = h('div', { class: 'fill' }, st);
  D.style.background = C.rani;
  const raysD = box(D, 540, 780, 2800, 2800, '', sunburstSVG(32, 'rgba(255,255,255,0)', 'rgba(255,176,0,.22)', 1400));
  const petalsD = Petals(D, W, H, 30, 23, { size: 18, colors: [C.marigold, C.saffron, C.cream, C.marigold] });
  const logoD = Logo(D, { layout: 'stacked', cx: 540, cy: 760, scale: 1.12 });
  const tagD = h('div', { class: 'abs body', style: { left: '0', top: '1150px', width: W + 'px', textAlign: 'center', fontWeight: 800, fontSize: '40px', letterSpacing: '.16em', color: C.cream } }, D, 'INDIAN KITCHEN · LITTLE ELM, TX');
  const btnW = h('div', { class: 'abs', style: { left: '0', top: '1250px', width: W + 'px', display: 'flex', justifyContent: 'center' } }, D,
    '<div class="pill disp" style="background:#FFB000;color:#1D1147;font-size:64px;padding:26px 64px 30px;-webkit-text-stroke:0;text-shadow:none;display:flex;align-items:center;gap:22px">Order online <svg width="60" height="60" viewBox="0 0 64 64" fill="none" stroke="#1D1147" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 32H50M34 16L50 32L34 48"/></svg></div>');
  const btn = btnW.firstChild;
  const tap = h('div', { class: 'abs', style: { left: '0', top: '0', width: '120px', height: '120px', borderRadius: '50%', border: '8px solid #FFF4DC', opacity: 0 } }, D);
  const tapDot = h('div', { class: 'abs', style: { left: '0', top: '0', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,244,220,.85)', border: '5px solid #1D1147', opacity: 0 } }, D);
  const handle = h('div', { class: 'abs', style: { left: '0', top: '1452px', width: W + 'px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '18px' } }, D,
    A.icon['instagram-glyph'].replace('<svg ', '<svg width="78" height="78" ') + '<span class="hand" style="font-size:72px;color:#FFF4DC">@yourhandle</span>');

  /* ───────── transitions ───────── */
  const iris = h('div', { class: 'abs', style: { left: '0', top: '0', width: '100px', height: '100px', borderRadius: '50%' } }, st);
  const bars = [C.rani, C.marigold, C.peacock, C.saffron, C.cilantro, C.marigold].map((c, i) => h('div', { class: 'abs', style: { left: (i * 180) + 'px', top: '0', width: '181px', height: H + 'px', background: c, borderLeft: i ? '6px solid #1D1147' : '0' } }, st));
  function irisAt(p, x, y, col) {
    const R = 2300 * E.inOutCubic(p);
    iris.style.display = p > 0 && p < 1 ? 'block' : 'none';
    iris.style.background = col;
    iris.style.width = iris.style.height = (2 * R) + 'px';
    iris.style.left = (x - R) + 'px'; iris.style.top = (y - R) + 'px';
  }
  const show = (e, v) => { e.style.display = v ? 'block' : 'none'; };

  window.renderAt = function (t) {
    /* Scene A */
    const inA = t < 3.85;
    show(A1, inA);
    if (inA) {
      T(raysA, { r: t * 6 });
      // hook (first 1.5 s)
      const hp = seg(t, 0.05, 0.45), hp2 = seg(t, 0.3, 0.7);
      T(hk1, { s: Math.max(0.001, E.outBackBig(hp)), r: -3, o: hp > 0 ? 1 : 0 });
      T(hk2, { y: (1 - E.outCubic(hp2)) * 60, o: hp2 });
      bunt.at(t, LK.bunt - 0.2, 0.9);
      const r = logoA.at(t, LK);
      const imp = r.impact;
      // impact shake
      const sh = t > imp && t < imp + 0.3 ? Math.sin((t - imp) * 70) * 14 * (1 - (t - imp) / 0.3) : 0;
      A1.style.transform = 'translate(' + sh.toFixed(1) + 'px,' + (sh * 0.6).toFixed(1) + 'px)';
      petalsA.burstAt(t - imp, 540, 1140);
      const tp = seg(t, 2.5, 2.95);
      T(tagA, { y: (1 - E.outCubic(tp)) * 40, o: tp });
    }

    /* Scene B */
    const inB = t >= 3.75 && t < 9.95;
    show(B, inB);
    if (inB) {
      slots.forEach((s, i) => {
        const u = t - s.t0;
        const next = slots[i + 1];
        const covered = next && t > next.t0 + 0.32;
        const vis = (i === 0 ? true : u > -0.15) && !covered;
        show(s.sl, vis);
        if (!vis) return;
        // circular reveal of this slot (except first: revealed by the scene iris)
        if (i > 0) {
          const ip = E.inOutCubic(seg(u, -0.15, 0.2));
          s.sl.style.clipPath = ip >= 1 ? 'none' : 'circle(' + (ip * 1250).toFixed(1) + 'px at 540px 880px)';
        }
        T(s.rays, { r: t * 9 * (i % 2 ? -1 : 1) });
        const dp = seg(u, -0.05, 0.4);
        T(s.disc, { s: Math.max(0.001, E.spring(dp)), r: t * 14 });
        const fp = seg(u, 0.02, 0.42);
        // dish: drop + squash on landing
        const land = 0.2;
        let dy = 0, dsx = 1, dsy = 1;
        if (u < land) { const v = seg(u, 0.02, land); dy = lerp(-520, 0, E.inQuad(v)); dsx = 0.88; dsy = 1.14; }
        else { const v = u - land; dsy = K(v, [[0, 0.82], [0.08, 1.07, E.outQuad], [0.18, 0.98], [0.3, 1]]); dsx = K(v, [[0, 1.16], [0.08, 0.96, E.outQuad], [0.18, 1.01], [0.3, 1]]); }
        const exit = seg(u, 0.86, 1.05);
        s.dish.el.style.transformOrigin = '50% 75%';
        T(s.dish.el, { y: dy - E.inCubic(exit) * 60, sx: dsx * (1 + exit * 0.25), sy: dsy * (1 + exit * 0.25), r: (1 - E.outCubic(fp)) * -10, o: u > 0.02 ? 1 : 0 });
        s.dish.at(t, 1);
        s.burst.at(u - land);
        // sign slides in from alternating sides, overshoots, settles with a small tilt
        const sp = seg(u, 0.12, 0.5);
        const side = i % 2 ? 1 : -1;
        T(s.sign, { x: side * 1100 * (1 - E.outBack(sp)), r: lerp(side * 12, side * -1.6, E.outBack(sp)) });
        const gp = seg(u, 0.3, 0.56);
        T(s.tag, { s: Math.max(0.001, E.outBackBig(gp)), r: (i % 2 ? 2.5 : -2.5) * E.outCubic(gp), o: gp > 0 ? 1 : 0 });
      });
      // route stops
      const cur = Math.floor(clamp((t - T0 + 0.1) / P, 0, 5.999));
      stops.forEach((sd, i) => {
        const a = t - (T0 + i * P) + 0.1;
        const on = a > 0;
        sd.style.background = on ? (i === cur ? DISHES[i].bg : C.ink) : C.cream;
        T(sd, { s: on ? (i === cur ? 1 + 0.45 * E.bump(seg(a, 0, 0.35)) + 0.12 : 0.8) : 0.8 });
      });
      const rp = seg(t, 3.85, 4.2);
      T(route, { y: (1 - E.outBack(rp)) * -260 + E.inBack(seg(t, 9.5, 9.75)) * -300 });
    }
    // shutter wipe B → C
    bars.forEach((b, i) => {
      const a = seg(t, 9.5 + i * 0.035, 9.75 + i * 0.035), d = seg(t, 9.9 + i * 0.035, 10.2 + i * 0.035);
      b.style.display = a > 0 && d < 1 ? 'block' : 'none';
      T(b, { y: (-1 + E.outCubic(a)) * H + E.inCubic(d) * H });
    });

    /* Scene C */
    const inC = t >= 9.9 && t < 12.65;
    show(Cc, inC);
    if (inC) {
      // heat level 0..5 → background marigold → saffron → chili
      const lvT = [10.45, 10.75, 11.05, 11.35, 11.65];
      const lvl = lvT.reduce((a, tt) => a + E.outCubic(seg(t, tt, tt + 0.25)), 0);
      Cc.style.background = lvl < 2.5 ? mix(C.marigold, C.saffron, lvl / 2.5) : mix(C.saffron, C.chili, (lvl - 2.5) / 2.5);
      T(raysC, { r: -t * 10 });
      const wp = E.inOutQuad(seg(t, 10.0, 10.5));
      titleClip.style.clipPath = 'inset(-40px ' + ((1 - wp) * 100).toFixed(1) + '% -40px -40px)';
      const sp = seg(t, 10.3, 10.6);
      T(subC, { y: (1 - E.outCubic(sp)) * 30, o: sp });
      const fl = lvl / 5;
      fillbar.style.height = (lerp(0.03, 1, fl) * 100).toFixed(1) + '%';
      T(tube, { o: 1 });
      rows.forEach((r, i) => {
        const u = t - lvT[i];
        const on = u > 0;
        T(r.disc, { s: on ? Math.max(0.001, E.spring(clamp(u / 0.5))) : 0.001, r: on ? Math.sin(u * 18) * 10 * Math.exp(-u * 5) : 0 });
        const lp = seg(u, 0.05, 0.35);
        T(r.lab, { x: (1 - E.outBack(lp)) * 700, o: lp > 0 ? 1 : 0 });
        T(r.num, { o: seg(u, 0.2, 0.4), y: (1 - E.outCubic(seg(u, 0.2, 0.4))) * 16 });
        if (i === 4) {
          const fk = on ? 1 + 0.06 * Math.sin(u * 40) * Math.exp(-u * 2) : 1;
          T(r.lab.firstChild, { s: fk });
        }
      });
      const u5 = t - lvT[4];
      const shk = u5 > 0 && u5 < 0.45 ? Math.sin(u5 * 85) * 18 * (1 - u5 / 0.45) : 0;
      Cc.style.transform = 'translate(' + shk.toFixed(1) + 'px,' + (-shk * 0.5).toFixed(1) + 'px)';
      flameBurst.burstAt(u5, 330, rows[4].y);
    }
    // iris C → D from the District Hot disc
    irisAt(t < 9 ? seg(t, 3.55, 3.9) : seg(t, 12.22, 12.6), t < 9 ? sunPt[0] : 330, t < 9 ? sunPt[1] : rows[4].y, t < 9 ? DISHES[0].bg : C.rani);

    /* Scene D */
    const inD = t >= 12.5;
    show(D, inD);
    if (inD) {
      const u = t - 12.5;
      T(raysD, { r: t * 6 });
      petalsD.fallAt(t, 3.2);
      logoD.at(u, { gate: 0.0, sun: 0.12, steam: 0.45, bunt: 0.4, curry: 0.4, dist: 0.6 });
      const tp = seg(u, 0.85, 1.2);
      T(tagD, { y: (1 - E.outCubic(tp)) * 40, o: tp });
      const bp = seg(u, 1.0, 1.45);
      // tap at u = 1.75
      const press = E.bump(seg(u, 1.72, 1.98));
      btn.style.transform = 'translate(' + (press * 9) + 'px,' + (press * 9) + 'px) scale(' + Math.max(0.001, E.outBackBig(bp)) + ')';
      btn.style.boxShadow = (10 - press * 9) + 'px ' + (10 - press * 9) + 'px 0 #1D1147';
      btn.style.opacity = bp > 0 ? 1 : 0;
      const tr = seg(u, 1.75, 2.25);
      const bx = 540 + 250, by = 1250 + 62;
      tap.style.opacity = tr > 0 && tr < 1 ? (1 - tr) : 0;
      const rr = 30 + tr * 120;
      tap.style.width = tap.style.height = 2 * rr + 'px'; tap.style.left = (bx - rr) + 'px'; tap.style.top = (by - rr) + 'px';
      const dot = seg(u, 1.45, 1.75), dotOut = seg(u, 2.0, 2.2);
      tapDot.style.opacity = dot > 0 && dotOut < 1 ? (1 - dotOut) : 0;
      T(tapDot, { x: lerp(bx + 220, bx, E.outCubic(dot)) - 32, y: lerp(by + 260, by, E.outCubic(dot)) - 32, s: 1 - press * 0.2 });
      const hp = seg(u, 1.25, 1.6);
      T(handle, { y: (1 - E.outBack(hp)) * 50, o: hp });
    }
  };
})();

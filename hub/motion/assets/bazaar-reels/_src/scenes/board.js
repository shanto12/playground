/* DIGITAL MENU-BOARD loops — 8 s, 1920×1080 (TV), seamless. Item names come from data/menu.json (no prices,
 * 'unconfirmed' items already filtered out by the renderer). Boards: 0 Starters+Tandoor · 1 Curry+Biryani · 2 Sweets+Chai */
(function () {
  const { C, E, seg, clamp, lerp, mod, h, box, T, Dish, Logo, sunburstSVG, scallopSVG, fit, osc, STAR4 } = M;
  const W = 1920, H = 1080, P = 8;
  const b = JOB.params.board;
  const st = document.getElementById('stage');
  const Z = id => A.menu.zones.find(z => z.id === id);
  const itemsOf = (zone, pick) => {
    const all = A.menu.items.filter(i => i.zone === zone);
    const list = pick ? pick.map(n => all.find(i => i.name === n)).filter(Boolean) : all;
    return list;
  };
  const BOARDS = [
    { cols: [{ zone: 'starters', sub: 2 }, { zone: 'tandoor', sub: 1, legend: true }], head: 'Welcome to the District. Bring your appetite.', panel: C.saffron,
      art: [['samosa-chutney', 'Veg Samosa', 'starters'], ['tandoori-platter', 'Tandoori Chicken', 'tandoor']],
      ticker: ['Tell us your heat level', 'Ask us about allergies', 'Order online for pickup'] },
    { cols: [{ zone: 'curry', sub: 2, pick: ['Butter Chicken', 'Chicken Tikka Masala', 'Chicken Vindaloo', 'Chettinad Chicken', 'Kadai Chicken', 'Saag Chicken', 'Andhra Goat Curry', 'Goat Curry', 'Lamb Vindaloo', 'Dal Makhani', 'Palak Paneer', 'Paneer Butter Masala', 'Channa Masala', 'Malai Kofta'], more: true },
            { zone: 'biryani', sub: 1, pick: ['Chicken Dum Biryani', 'Chicken 65 Biryani', 'Goat Dum Biryani', 'Boneless Chicken Biryani', 'Shrimp Biryani', 'Egg Biryani', 'Paneer Biryani', 'Gongura Veg Biryani', 'Veg Biryani', 'Gongura Mutton Pulav'], more: true }],
      head: 'Biryani, naan, repeat.', panel: C.rani,
      art: [['butter-chicken', 'Butter Chicken', 'curry'], ['biryani', 'Chicken Dum Biryani', 'biryani']],
      ticker: ['Pick your gravy, pick your heat', 'Order online for pickup', 'Ask us about allergies'] },
    { cols: [{ zone: 'sweets', sub: 1 }, { zone: 'chai', sub: 1 }], head: 'Come hungry. Leave happy. Bring a friend.', panel: C.peacock,
      art: [['gulab-jamun', 'Gulab Jamun', 'sweets'], ['mango-lassi-chai', 'Mango Lassi + Chai', 'chai']],
      ticker: ['Save room. Seriously.', 'A proper cup of chai', 'Order online for pickup'] }
  ];
  const B = BOARDS[b];

  /* background */
  const bg = h('div', { class: 'fill' }, st);
  bg.style.background = C.cream;
  const pat = A.pattern['06-spice-confetti-sunset'];
  h('div', { class: 'fill', style: { backgroundImage: 'url("data:image/svg+xml;utf8,' + encodeURIComponent(pat) + '")', backgroundSize: '320px 320px', opacity: 0.14 } }, bg);

  /* header */
  const logo = Logo(st, { layout: 'horizontal', cx: 250, cy: 98, scale: 0.4 });
  logo.at(10);
  const head = h('div', { class: 'abs hand', style: { left: '470px', top: '58px', fontSize: '62px', color: C.rani, transformOrigin: '0 50%' } }, st, B.head);
  fit(head, 760);

  /* menu columns */
  const MX = 60, MW = 1180, MY = 178;
  const totalSub = B.cols.reduce((a, c) => a + c.sub, 0);
  const gap = 46;
  const unitW = (MW - gap * (B.cols.length - 1)) / totalSub;
  let x = MX;
  const signs = [], stars = [];
  B.cols.forEach((col, ci) => {
    const zw = unitW * col.sub + (col.sub > 1 ? 0 : 0);
    const zone = Z(col.zone);
    const items = itemsOf(col.zone, col.pick);
    const signC = [C.peacock, C.rani, C.saffron][(b + ci) % 3];
    const sign = h('div', { class: 'abs', style: { left: x + 'px', top: MY + 'px', transformOrigin: '30% 0%' } }, st,
      '<div class="sign" style="background:' + signC + ';padding:8px;border-width:6px;box-shadow:9px 9px 0 #1D1147"><div class="in" style="padding:6px 22px 10px;border-width:4px"><div class="t" style="font-size:40px">' + zone.name.replace('&', '&amp;') + '</div></div></div>');
    signs.push(sign);
    { const tt = sign.querySelector('.t'); let f = 40; while (sign.firstChild.offsetWidth > zw - 6 && f > 22) { f -= 1; tt.style.fontSize = f + 'px'; } }
    const tl = h('span', { class: 'abs hand', style: { left: (x + 4) + 'px', top: (MY + 98) + 'px', fontSize: '40px', color: C.ink, opacity: 0.85 } }, st, zone.tagline_bazaar);
    fit(tl, zw);
    const perSub = Math.ceil(items.length / col.sub);
    const rows = Math.max(perSub, 1);
    const top = MY + 152;
    const avail = 888 - top - (col.more ? 46 : 0);
    const lh = Math.min(64, avail / rows);
    const fs = Math.min(36, lh * 0.6);
    const rowEls = [];
    items.forEach((it, k) => {
      const sx = x + Math.floor(k / perSub) * unitW, sy = top + (k % perSub) * lh;
      const row = h('div', { class: 'abs body', style: { left: sx + 'px', top: sy + 'px', width: (unitW - 30) + 'px', height: lh + 'px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: fs + 'px', fontWeight: 700, color: C.ink, whiteSpace: 'nowrap' } }, st);
      const mk = it.diet === 'veg' ? 'veg-mark' : it.diet === 'egg' ? 'egg-mark' : 'nonveg-mark';
      h('span', { style: { width: (fs * 0.85) + 'px', height: (fs * 0.85) + 'px', flex: 'none', display: 'block' } }, row, A.icon[mk].replace('<svg ', '<svg width="100%" height="100%" '));
      const nm = h('span', {}, row, it.name);
      if (it.popular) {
        const st2 = h('span', { style: { flex: 'none', width: (fs * 1.05) + 'px', height: (fs * 1.05) + 'px', display: 'block' } }, row,
          '<svg viewBox="-12 -12 24 24" width="100%" height="100%"><circle r="11" fill="#E4147E" stroke="#1D1147" stroke-width="2"/><path d="M0 -6.5L1.9 -2.1L6.6 -1.9L3 1.2L4.1 5.8L0 3.3L-4.1 5.8L-3 1.2L-6.6 -1.9L-1.9 -2.1Z" fill="#FFF4DC"/></svg>');
        stars.push(st2.firstChild);
      }
      rowEls.push(row);
    });
    // one font size per column, so long names don't look different from short ones
    const worst = Math.max.apply(null, rowEls.map(r => r.scrollWidth / (unitW - 30)));
    if (worst > 1) rowEls.forEach(r => { r.style.fontSize = (fs / worst * 0.98).toFixed(1) + 'px'; r.firstChild.style.width = r.firstChild.style.height = (fs / worst * 0.85).toFixed(1) + 'px'; });
    if (col.more) h('div', { class: 'abs hand', style: { left: (x + 4) + 'px', top: (top + rows * lh + 2) + 'px', fontSize: '36px', color: C.rani } }, st, '+ more on the full menu');
    if (col.legend) {
      const ly = top + rows * lh + 24;
      const lg = h('div', { class: 'abs plate', style: { left: x + 'px', top: ly + 'px', width: (zw - 10) + 'px', background: '#FFFFFF', padding: '16px 22px 18px', borderRadius: '22px' } }, st);
      h('div', { class: 'hand', style: { fontSize: '40px', color: C.ink, marginBottom: '8px' } }, lg, 'Pick your heat:');
      const rowL = h('div', { style: { display: 'flex', gap: '10px', alignItems: 'flex-end' } }, lg);
      ['Mild', 'Medium', 'Hot', 'District Hot'].forEach((n, i) => {
        const c = h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flex: '1' } }, rowL);
        h('div', { style: { width: '62px', height: '62px' } }, c, A.icon['chili-' + [1, 2, 3, 5][i]].replace('<svg ', '<svg width="62" height="62" '));
        h('div', { class: 'body', style: { fontSize: '19px', fontWeight: 800, letterSpacing: '.02em', textTransform: 'uppercase' } }, c, n);
      });
    }
    x += zw + gap;
  });
  // legend line (diet + popular)
  const leg = h('div', { class: 'abs body', style: { left: MX + 'px', top: '902px', display: 'flex', gap: '26px', alignItems: 'center', fontSize: '24px', fontWeight: 700, color: C.ink, opacity: 0.85 } }, st,
    '<span style="display:flex;gap:8px;align-items:center">' + A.icon['veg-mark'].replace('<svg ', '<svg width="26" height="26" ') + 'Veg</span>' +
    '<span style="display:flex;gap:8px;align-items:center">' + A.icon['nonveg-mark'].replace('<svg ', '<svg width="26" height="26" ') + 'Non-veg</span>' +
    '<span style="display:flex;gap:8px;align-items:center"><svg viewBox="-12 -12 24 24" width="28" height="28"><circle r="11" fill="#E4147E" stroke="#1D1147" stroke-width="2"/><path d="M0 -6.5L1.9 -2.1L6.6 -1.9L3 1.2L4.1 5.8L0 3.3L-4.1 5.8L-3 1.2L-6.6 -1.9L-1.9 -2.1Z" fill="#FFF4DC"/></svg>Popular</span>' +
    '<span>Diet marks are estimates · tell us about allergies when you order</span>');
  fit(leg, MW);

  /* art panel */
  const PX = 1290, PY = 40, PW = 590, PH = 880;
  const panel = h('div', { class: 'abs', style: { left: PX + 'px', top: PY + 'px', width: PW + 'px', height: PH + 'px', background: B.panel, border: '8px solid #1D1147', borderRadius: '44px', boxShadow: '14px 14px 0 #1D1147', overflow: 'hidden' } }, st);
  const rays = box(panel, PW / 2 - 8, 390, 2000, 2000, '', sunburstSVG(28, 'rgba(255,255,255,0)', 'rgba(255,244,220,.2)', 1000));
  const disc = box(panel, PW / 2 - 8, 390, 570, 570, '', scallopSVG(250, 22, 36, C.sand, C.cream, B.panel, 6));
  const arts = B.art.map(([key, name, zone]) => {
    const d = Dish(panel, key, PW / 2 - 8, 382, 510, { steamPeriod: 1.6, sparklePeriod: 1.6 });
    const tag = h('div', { class: 'abs', style: { left: '0', top: '690px', width: (PW - 16) + 'px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' } }, panel,
      '<div class="plate" style="background:#FFF4DC;padding:2px 26px 8px;border-radius:14px;border-width:5px;box-shadow:8px 8px 0 #1D1147"><span class="hand" style="font-size:56px">' + name + '</span></div>' +
      '<div class="body" style="font-size:26px;font-weight:800;letter-spacing:.14em;color:#FFF4DC;text-transform:uppercase;text-shadow:3px 3px 0 #1D1147">' + Z(zone).name.replace('&', '&amp;') + '</div>');
    return { d, tag };
  });

  /* marquee ticker — moves exactly one unit per loop */
  const band = h('div', { class: 'abs', style: { left: '0', top: '958px', width: W + 'px', height: '122px', background: C.ink, borderTop: '8px solid ' + C.marigold, overflow: 'hidden' } }, st);
  const star = '<svg width="34" height="34" viewBox="-1.2 -1.2 2.4 2.4" style="flex:none"><path d="' + STAR4 + '" fill="#FFB000"/></svg>';
  const unitHTML = B.ticker.map(s => '<span>' + s + '</span>' + star).join('');
  const track = h('div', { class: 'abs disp', style: { left: '0', top: '30px', display: 'flex', alignItems: 'center', gap: '36px', fontSize: '44px', color: C.cream, WebkitTextStroke: '0', textShadow: 'none', paddingLeft: '36px' } }, band, unitHTML);
  const unit = track.scrollWidth + 36;
  track.innerHTML = unitHTML + unitHTML + unitHTML + unitHTML;

  window.renderAt = function (t) {
    T(rays, { r: (t / P) * (720 / 28) });
    T(disc, { r: -(t / P) * (360 / 22) });
    track.style.transform = 'translateX(' + (-(t / P) * unit).toFixed(2) + 'px)';
    signs.forEach((s, i) => T(s, { r: osc(t, 4, i * 0.25) * 1.1 }));
    stars.forEach((s, i) => { s.style.transformOrigin = '50% 50%'; T(s, { s: 1 + 0.18 * Math.pow(Math.max(0, osc(t, 2, i * 0.13)), 6), r: osc(t, 4, i * 0.1) * 8 }); });
    // two dishes swap every 4 s
    arts.forEach((a, k) => {
      const u = mod(t - k * 4 + 0.35, P); // u in [0,8): in at 0–0.45, hold, out at 4.0–4.35
      const inP = seg(u, 0, 0.5), outP = seg(u, 4.0, 4.35);
      const vis = u < 4.35;
      a.d.el.style.display = a.tag.style.display = vis ? 'block' : 'none';
      if (!vis) return;
      const sc = Math.max(0.001, E.spring(inP) * (1 - E.inBack(outP)));
      T(a.d.el, { s: sc, r: (1 - E.outCubic(inP)) * -14 + outP * 20, y: osc(t, 2) * 6 });
      a.d.at(t, 1);
      a.tag.style.display = 'flex';
      T(a.tag, { y: (1 - E.outBack(seg(u, 0.12, 0.5))) * 260 + E.inBack(outP) * 260 });
    });
  };
})();

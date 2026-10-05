/* Curry District · rooms — information boards (paint flat-lay, swatch book, spec sheet, cost infographics, scale study).
   All numbers come from research/interiors_signage_brief.md; (S) = sourced via search summary, (E) = estimate → flagged on the art. */
'use strict';
const L = require('./lib');
const { BZ, RY, n, h, esc, shade, mix, lum, contrast, rng } = L;

/* ── text helpers ── */
const CW = { body: 0.52, display: 0.6, bowlby: 0.74, serif: 0.5 };
function wrap(str, width, size, k = CW.body) {
  const max = Math.max(4, Math.floor(width / (size * k)));
  const words = String(str).split(/\s+/); const lines = []; let cur = '';
  words.forEach((w) => { if ((cur + ' ' + w).trim().length > max) { if (cur) lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); });
  if (cur) lines.push(cur);
  return lines;
}
function T(x, y, str, o = {}) {
  return h('text', { x: n(x), y: n(y), 'font-family': o.f, 'font-size': o.s || 24, 'font-weight': o.w || 400, 'font-style': o.i ? 'italic' : undefined,
    fill: o.c || '#1D1147', 'text-anchor': o.a, 'letter-spacing': o.ls, opacity: o.op, 'text-transform': undefined }, esc(str));
}
function P(x, y, str, width, o = {}) {   // paragraph → returns {svg, h}
  const s = o.s || 22, lh = o.lh || s * 1.38;
  const lines = wrap(str, width, s, o.k || CW.body);
  const t = lines.map((l, i) => `<tspan x="${n(x)}" y="${n(y + i * lh)}">${esc(l)}</tspan>`).join('');
  return { svg: `<text font-family="${o.f}" font-size="${s}" font-weight="${o.w || 400}"${o.i ? ' font-style="italic"' : ''} fill="${o.c || '#1D1147'}"${o.op ? ` opacity="${o.op}"` : ''}>${t}</text>`, h: lines.length * lh };
}
const FB = L.FONTS.bazaar, FR = L.FONTS.royal;
function theme(dir) {
  return dir === 'bazaar'
    ? { dir, bg: BZ.cream, ink: BZ.ink, muted: '#5B4F85', ac: BZ.marigold, ac2: BZ.saffron, ac3: BZ.rani, card: '#FFFFFF', disp: FB.display, body: FB.body, acc: FB.accent, upper: true, fonts: 'bazaar',
      shadow: (x, y, w, hh, r) => h('rect', { x: x + 6, y: y + 6, width: w, height: hh, rx: r, fill: BZ.ink }), stroke: BZ.ink, sw: 3, badge: 'A · BAZAAR' }
    : { dir, bg: RY.ivory, ink: RY.ink, muted: '#6B5A73', ac: RY.gold, ac2: RY.ruby, ac3: RY.emerald, card: '#FFFFFF', disp: FR.display, body: FR.body, acc: FR.accent, upper: false, fonts: 'royal',
      shadow: (x, y, w, hh, r) => h('rect', { x: x, y: y + 10, width: w, height: hh, rx: r, fill: RY.ink, opacity: 0.16, filter: 'url(#bBlur)' }), stroke: 'rgba(183,121,31,.7)', sw: 1.4, badge: 'B · ROYAL' };
}
const BDEFS = `<filter id="bBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>` +
  `<filter id="bPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="5"/><feColorMatrix type="matrix" values="0 0 0 0 .4  0 0 0 0 .3  0 0 0 0 .2  0 0 0 -1.6 .9"/></filter>` +
  `<linearGradient id="bFoil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B7791F"/><stop offset=".38" stop-color="#F7D98A"/><stop offset=".58" stop-color="#E9A63A"/><stop offset="1" stop-color="#B7791F"/></linearGradient>` +
  `<linearGradient id="bBrass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8E5A16"/><stop offset=".3" stop-color="#F7D98A"/><stop offset=".55" stop-color="#E9A63A"/><stop offset="1" stop-color="#7A4C12"/></linearGradient>`;

function header(th, W, kicker, title, sub) {
  const s = [];
  if (th.dir === 'bazaar') {
    s.push(h('rect', { x: 0, y: 0, width: W, height: 14, fill: BZ.saffron }));
    s.push(h('rect', { x: 0, y: 14, width: W, height: 6, fill: BZ.rani }));
    s.push(h('rect', { x: 60, y: 62, width: kicker.length * 13.2 + 40, height: 42, rx: 21, fill: BZ.ink }));
    s.push(T(80, 90, kicker, { f: th.body, s: 19, w: 700, c: BZ.marigold, ls: 1.5 }));
    s.push(T(60, 180, title.toUpperCase(), { f: th.disp, s: 64, c: BZ.ink, ls: 0.5 }));
    if (sub) s.push(P(62, 226, sub, W - 140, { f: th.body, s: 25, c: '#3A2E6B' }).svg);
  } else {
    s.push(h('rect', { x: 0, y: 0, width: W, height: 10, fill: 'url(#bFoil)' }));
    s.push(T(60, 84, kicker, { f: th.body, s: 18, w: 600, c: RY.goldDk, ls: 3 }));
    s.push(h('path', { d: `M60 100H${60 + kicker.length * 12.5}`, stroke: 'url(#bFoil)', 'stroke-width': 1.5 }));
    s.push(T(58, 172, title, { f: th.disp, s: 66, w: 600, i: true, c: RY.ink }));
    if (sub) s.push(P(62, 220, sub, W - 140, { f: th.body, s: 25, c: '#4A3A55' }).svg);
  }
  return s.join('');
}
function footer(th, W, H, note) {
  const s = [];
  s.push(h('path', { d: `M60 ${H - 74}H${W - 60}`, stroke: th.dir === 'bazaar' ? BZ.ink : 'url(#bFoil)', 'stroke-width': th.dir === 'bazaar' ? 2 : 1, opacity: 0.6 }));
  s.push(T(60, H - 40, note || 'Concept board · Curry District Brand Glow-Up proposal · all prices approximate, not quotes', { f: th.body, s: 18, c: th.muted }));
  s.push(T(W - 60, H - 40, th.badge, { f: th.body, s: 18, w: 700, c: th.dir === 'bazaar' ? BZ.saffron : RY.goldDk, a: 'end', ls: 1.5 }));
  return s.join('');
}

/* ═════════ 1 · PAINT THE ROOM — swatch flat-lay ═════════ */
const PAINTS = {
  bazaar: [
    ['Ink Indigo', BZ.ink, 'Trim, rails, pilasters', 'semi-gloss'],
    ['Chai Cream', BZ.cream, 'Ceiling & frieze', 'flat (ceiling)'],
    ['Genda Marigold', BZ.marigold, 'Accent bay, menu wall', 'washable matte'],
    ['Tandoor Saffron', BZ.saffron, 'Wainscot band', 'satin'],
    ['Rani Pink', BZ.rani, 'Accent bay / wainscot', 'satin'],
    ['Chili Red', BZ.chili, 'Host stand, door, tiny doses', 'semi-gloss'],
    ['Peacock Teal', BZ.peacock, 'Colour-drench hero', 'washable matte'],
    ['Cilantro Green', BZ.cilantro, 'Planters, shelving', 'satin'],
  ],
  royal: [
    ['Midnight Aubergine', RY.ink, 'Wainscot, ceiling (drama)', 'satin / flat'],
    ['Plum Velvet', RY.plum, 'Accent bay', 'washable matte'],
    ['Deep Emerald', RY.emerald, 'Wainscot · colour-drench', 'satin'],
    ['Peacock Jewel', RY.peacock, 'Doors, restroom accent', 'semi-gloss'],
    ['Ruby', RY.ruby, 'Accent bay, frieze', 'washable matte'],
    ['Saffron Gold', RY.gold, 'Rails & trim (or real brass)', 'semi-gloss'],
    ['Palace Ivory', RY.ivory, 'Ceiling, upper walls', 'flat (ceiling)'],
    ['Rose Blush', RY.blush, 'Accent bay, banquette wall', 'washable matte'],
  ],
};
function paintBoard(dir) {
  const th = theme(dir); const W = 1200, H = 1640; const s = [];
  s.push(h('rect', { width: W, height: H, fill: th.bg }));
  s.push(header(th, W, `${th.badge} · PAINT THE ROOM`, 'Paint the room', 'Eight named colours lifted from the brand palette — a starter set for walls, wainscot, trim and ceiling.'));
  // flat-lay surface
  const sx = 40, sy = 290, sw = W - 80, sh = 840;
  s.push(h('rect', { x: sx, y: sy, width: sw, height: sh, rx: 26, fill: dir === 'bazaar' ? '#F3E3BF' : '#2A1240' }));
  s.push(h('rect', { x: sx, y: sy, width: sw, height: sh, rx: 26, fill: '#000', filter: 'url(#bPaper)', opacity: dir === 'bazaar' ? 0.5 : 0.35 }));
  // swatch cards (fanned 2 × 4)
  const R = rng(dir === 'bazaar' ? 5 : 9);
  const cw = 240, ch = 340;
  PAINTS[dir].forEach((p, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const cx = sx + 52 + col * 268 + (row ? 18 : 0), cy = sy + 46 + row * 392;
    const rot = (R() - 0.5) * 6;
    const g = [];
    if (dir === 'bazaar') g.push(h('rect', { x: 7, y: 7, width: cw, height: ch, rx: 12, fill: BZ.ink }));
    else g.push(h('rect', { x: 0, y: 12, width: cw, height: ch, rx: 10, fill: '#000', opacity: 0.45, filter: 'url(#bBlur)' }));
    g.push(h('rect', { x: 0, y: 0, width: cw, height: ch, rx: dir === 'bazaar' ? 12 : 10, fill: '#FFFFFF', stroke: dir === 'bazaar' ? BZ.ink : 'none', 'stroke-width': 3 }));
    g.push(h('rect', { x: 12, y: 12, width: cw - 24, height: 196, rx: 6, fill: p[1], stroke: lum(p[1]) > 0.8 ? '#E2D3B0' : 'none', 'stroke-width': 2 }));
    g.push(h('rect', { x: 12, y: 12, width: cw - 24, height: 196, rx: 6, fill: '#000', filter: 'url(#bPaper)', opacity: 0.12 }));
    g.push(T(16, 242, p[0], { f: dir === 'bazaar' ? th.body : th.disp, s: dir === 'bazaar' ? 24 : 25, w: 700, c: th.ink, i: dir !== 'bazaar' }));
    g.push(T(16, 270, p[1].toUpperCase(), { f: th.body, s: 17, w: 600, c: th.muted, ls: 1 }));
    g.push(T(16, 300, p[2], { f: th.body, s: 16, c: '#3A3048' }));
    g.push(h('rect', { x: 16, y: 312, width: p[3].length * 9 + 22, height: 22, rx: 11, fill: dir === 'bazaar' ? '#FFE7B8' : '#F3E4C8' }));
    g.push(T(27, 328, p[3], { f: th.body, s: 14, w: 700, c: th.ink }));
    s.push(`<g transform="translate(${n(cx)} ${n(cy)}) rotate(${n(rot)} ${cw / 2} ${ch / 2})">${g.join('')}</g>`);
  });
  // props: brush
  const bx = sx + sw - 250, by = sy + sh - 34;
  s.push(`<g transform="translate(${bx} ${by}) rotate(-8)">${h('rect', { x: 0, y: -14, width: 150, height: 18, rx: 9, fill: dir === 'bazaar' ? BZ.rani : RY.emerald })}${h('rect', { x: 146, y: -18, width: 34, height: 26, rx: 3, fill: 'url(#bBrass)' })}${h('path', { d: 'M180 -20H220Q232 -5 220 10H180Z', fill: dir === 'bazaar' ? BZ.peacock : RY.ruby })}</g>`);
  // label strip: physical swatch caveat
  const ly = sy + sh + 34;
  s.push(h('rect', { x: 40, y: ly, width: W - 80, height: 64, rx: 32, fill: dir === 'bazaar' ? BZ.ink : RY.ink }));
  s.push(T(W / 2, ly + 41, 'Closest paint match to be confirmed with a physical swatch — screen colours are approximate', { f: th.body, s: 20, w: 700, c: dir === 'bazaar' ? BZ.marigold : RY.goldLt, a: 'middle' }));
  // finish notes + colour drench
  const ny = ly + 100;
  const colW = (W - 80 - 30) / 2;
  const box = (x, y, w, hh, title, body, padR = 0) => {
    const g = [];
    g.push(th.shadow(x, y, w, hh, 20));
    g.push(h('rect', { x, y, width: w, height: hh, rx: 20, fill: '#FFFFFF', stroke: th.stroke, 'stroke-width': th.sw }));
    g.push(T(x + 26, y + 46, title, { f: dir === 'bazaar' ? th.disp : th.disp, s: dir === 'bazaar' ? 24 : 30, w: 600, i: dir !== 'bazaar', c: th.ink }));
    let yy = y + 84;
    body.forEach((b, bi) => { const p = P(x + 26, yy, b, w - 52 - (bi === 0 ? padR : 0), { f: th.body, s: 18.5, c: '#2E2540', lh: 25 }); g.push(p.svg); yy += p.h + 8; });
    return g.join('');
  };
  s.push(box(40, ny, colW, 300, dir === 'bazaar' ? 'FINISH NOTES' : 'Finish notes', [
    'Upper walls: washable matte / low-sheen.',
    'Wainscot & high-touch zones: satin or semi-gloss. Trim & rails: semi-gloss. Ceiling: flat.',
    'Dark, saturated colours show scuffs and touch-up flashing — keep a labelled can for touch-ups.',
  ]));
  const dx = 40 + colW + 30;
  const drench = dir === 'bazaar' ? BZ.peacock : RY.emerald;
  s.push(box(dx, ny, colW, 300, dir === 'bazaar' ? 'COLOUR-DRENCH IDEA' : 'The colour-drench idea', [
    `Walls, ceiling and trim all in one hue — e.g. ${dir === 'bazaar' ? 'Peacock Teal' : 'Deep Emerald'}. The paint-only move with the biggest change.`,
    'Approx. ~$500 DIY for one wall → ~$8,000 pro incl. ceiling (estimate, needs a quote).',
  ], 140));
  // mini drench room icon
  const mx = dx + colW - 136, my = ny + 70;
  s.push(`<g transform="translate(${mx} ${my})">${h('path', { d: 'M0 0H110L86 20H24Z', fill: shade(drench, -0.15) })}${h('path', { d: 'M0 0L24 20V70L0 90Z', fill: shade(drench, -0.08) })}${h('path', { d: 'M110 0L86 20V70L110 90Z', fill: shade(drench, -0.08) })}${h('rect', { x: 24, y: 20, width: 62, height: 50, fill: drench })}${h('path', { d: 'M0 90L24 70H86L110 90Z', fill: dir === 'bazaar' ? BZ.cream : RY.ivory })}${h('rect', { x: 24, y: 52, width: 62, height: 2.5, fill: shade(drench, -0.3) })}</g>`);
  s.push(footer(th, W, H, 'Concept board · hex values from brand tokens · no paint-brand codes implied'));
  return L.doc(W, H, BDEFS, s.join(''), { fonts: th.dir === 'bazaar' ? FB.keys : FR.keys, title: `Paint the room — ${th.badge}` });
}

/* ═════════ 2 · WALLPAPER SWATCH BOOK (tiles at 1:1 file scale, repeat markers) ═════════ */
const REPEAT_IN = {
  bazaar: { '01': 24, '02': 21, '03': 21, '04': 24, '05': 24, '06': 18, '07': 27, '08': 21 },
  royal: { '01': 24, '02': 27, '03': 27, '04': 27, '05': 18, '06': 21, '07': 27, '08': 18 },
};
const titleCase = (s) => s.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
function patternGroups(dir) {
  const files = L.listTiles(dir); const g = {};
  files.forEach((f) => { const m = /^(\d\d)-(.+)-([a-z]+)\.svg$/.exec(f); if (!m) return; const k = m[1]; (g[k] = g[k] || { num: k, name: titleCase(m[2]), ways: [] }).ways.push({ file: f, way: titleCase(m[3]) }); });
  return Object.values(g).sort((a, b) => a.num.localeCompare(b.num));
}
function swatchBook(dir, page) {
  const th = theme(dir); const groups = patternGroups(dir);
  const sel = groups.slice(page * 4, page * 4 + 4);
  const W = 1500; const cols = 4, gap = 24, box = 330, x0 = (W - (cols * box + (cols - 1) * gap)) / 2;
  const defs = [BDEFS]; const s = [];
  let y = 300;
  const rows = [];
  sel.forEach((gp) => {
    const nRows = Math.ceil(gp.ways.length / cols);
    rows.push({ gp, y, nRows });
    y += 64 + nRows * (box + 58) + 18;
  });
  const H = y + 110;
  s.push(h('rect', { width: W, height: H, fill: th.bg }));
  s.push(header(th, W, `${th.badge} · WALLPAPER SWATCH BOOK ${page + 1}/${Math.ceil(groups.length / 4)}`, 'Wallpaper swatch book', 'Every colourway, drawn at 1:1 file scale (one tile = one dashed box). Printed repeat = the size each box becomes on your wall.'));
  rows.forEach(({ gp, y: ry }) => {
    const rep = REPEAT_IN[dir][gp.num];
    s.push(T(x0, ry + 36, `${gp.num} · ${gp.name}`, { f: th.disp, s: dir === 'bazaar' ? 30 : 36, w: 600, i: dir !== 'bazaar', c: th.ink }));
    s.push(T(W - x0, ry + 36, `recommended printed repeat ≈ ${rep} in`, { f: th.body, s: 20, w: 600, c: dir === 'bazaar' ? BZ.saffron : RY.goldDk, a: 'end' }));
    gp.ways.forEach((wy, i) => {
      const t = L.tile(dir, wy.file);
      const bx = x0 + (i % cols) * (box + gap), by = ry + 58 + Math.floor(i / cols) * (box + 58);
      const id = `sw${gp.num}${i}`;
      defs.push(`<clipPath id="${id}"><rect x="${bx}" y="${by}" width="${box}" height="${box}" rx="${dir === 'bazaar' ? 14 : 8}"/></clipPath>`);
      if (!defs.some((d) => d.includes(`id="tl${dir}${gp.num}${i}"`))) defs.push(`<image id="tl${dir}${gp.num}${i}" href="${t.uri}" width="${t.px + 0.5}" height="${t.px + 0.5}" preserveAspectRatio="none"/>`);
      if (dir === 'bazaar') s.push(h('rect', { x: bx + 6, y: by + 6, width: box, height: box, rx: 14, fill: BZ.ink }));
      else s.push(h('rect', { x: bx, y: by + 10, width: box, height: box, rx: 8, fill: RY.ink, opacity: 0.18, filter: 'url(#bBlur)' }));
      const ox = bx + 12, oy = by + 12;   // tile origin (repeat marker start)
      let u = '';
      for (let jy = -1; jy < Math.ceil(box / t.px) + 1; jy++) for (let jx = -1; jx < Math.ceil(box / t.px) + 1; jx++) u += `<use href="#tl${dir}${gp.num}${i}" x="${ox + jx * t.px}" y="${oy + jy * t.px}"/>`;
      s.push(`<g clip-path="url(#${id})">${u}</g>`);
      // repeat marker: dashed box for one tile + crop ticks
      const mk = lum(t.bg) > 0.5 ? BZ.ink : '#FFFFFF';
      const pw = Math.min(t.px, box - 14);
      s.push(h('rect', { x: ox, y: oy, width: pw, height: pw, fill: 'none', stroke: mk, 'stroke-width': 2, 'stroke-dasharray': '8 6', opacity: 0.9 }));
      s.push(h('rect', { x: ox, y: oy, width: pw, height: pw, fill: 'none', stroke: lum(t.bg) > 0.5 ? '#FFFFFF' : BZ.ink, 'stroke-width': 0.8, 'stroke-dasharray': '8 6', 'stroke-dashoffset': 8, opacity: 0.6 }));
      [[ox, oy, 1, 1], [ox + pw, oy, -1, 1], [ox, oy + pw, 1, -1], [ox + pw, oy + pw, -1, -1]].forEach(([cx, cy, dx, dy]) => s.push(h('path', { d: `M${cx} ${cy + dy * 18}V${cy}H${cx + dx * 18}`, fill: 'none', stroke: mk, 'stroke-width': 3.5 })));
      if (t.px <= box - 14) {
        s.push(h('rect', { x: ox + 8, y: oy + pw - 34, width: 112, height: 26, rx: 13, fill: mk, opacity: 0.92 }));
        s.push(T(ox + 64, oy + pw - 16, `1 repeat · ${rep}″`, { f: th.body, s: 14, w: 700, c: lum(t.bg) > 0.5 ? '#FFFFFF' : BZ.ink, a: 'middle' }));
      }
      s.push(h('rect', { x: bx, y: by, width: box, height: box, rx: dir === 'bazaar' ? 14 : 8, fill: 'none', stroke: dir === 'bazaar' ? BZ.ink : 'rgba(183,121,31,.6)', 'stroke-width': dir === 'bazaar' ? 3 : 1.4 }));
      s.push(T(bx + 2, by + box + 32, wy.way, { f: th.body, s: 21, w: 700, c: th.ink }));
      s.push(T(bx + box - 2, by + box + 32, `${t.px}px tile · ground ${t.bg}`, { f: th.body, s: 15, c: th.muted, a: 'end' }));
    });
  });
  s.push(footer(th, W, H, 'Tiles read live from brand/patterns · repeat sizes are our print recommendation — confirm with the printer'));
  return L.doc(W, H, defs.join(''), s.join(''), { fonts: th.dir === 'bazaar' ? FB.keys : FR.keys, title: `Wallpaper swatch book ${page + 1} — ${th.badge}` });
}

/* ═════════ 3 · SPEC SHEET (one page per direction) ═════════ */
function specSheet(dir, combos) {
  const th = theme(dir); const W = 1200, H = 1980; const s = []; const defs = [BDEFS];
  s.push(h('rect', { width: W, height: H, fill: th.bg }));
  s.push(header(th, W, `${th.badge} · FEATURE-WALL SPEC`, 'Feature-wall spec', 'What to order, how it is hung, and what it should cost. Planning assumption from research: a ~150 sq ft feature wall.'));
  // ── wall section diagram (left)
  const dx = 60, dy = 300, dw = 300, dh = 640;
  const k = dh / 120; // px per inch (10 ft)
  const yAt = (inch) => dy + dh - inch * k;
  const c0 = combos[0];
  const tile = L.tile(c0.wallpaper.dir, c0.wallpaper.file);
  const P2 = Math.round(c0.wallpaper.repeat * k);
  defs.push(`<image id="spT" href="${tile.uri}" width="${P2 + 0.6}" height="${P2 + 0.6}" preserveAspectRatio="none"/><clipPath id="spC"><rect x="${dx}" y="${yAt(108)}" width="${dw}" height="${n(yAt(40) - yAt(108))}"/></clipPath>`);
  s.push(h('rect', { x: dx, y: yAt(120), width: dw, height: n(yAt(108) - yAt(120)), fill: c0.paint.frieze }));
  let u = ''; for (let yy = yAt(108); yy < yAt(40); yy += P2) for (let xx = dx; xx < dx + dw; xx += P2) u += `<use href="#spT" x="${n(xx)}" y="${n(yy)}"/>`;
  s.push(`<g clip-path="url(#spC)">${u}</g>`);
  s.push(h('rect', { x: dx, y: yAt(40), width: dw, height: n(yAt(0) - yAt(40)), fill: c0.paint.wainscot }));
  const trim = c0.wall.railBrass ? 'url(#bBrass)' : c0.paint.trim;
  s.push(h('rect', { x: dx, y: yAt(108) - 2, width: dw, height: 5, fill: trim }));
  s.push(h('rect', { x: dx, y: yAt(40) - 3, width: dw, height: 7, fill: trim }));
  s.push(h('rect', { x: dx, y: yAt(6), width: dw, height: n(6 * k), fill: c0.wall.base || c0.paint.trim }));
  s.push(h('rect', { x: dx, y: yAt(120), width: dw, height: dh, fill: 'none', stroke: th.ink, 'stroke-width': 2 }));
  // dimension callouts
  const dim = (inch, label, sub) => {
    const yy = yAt(inch);
    s.push(h('path', { d: `M${dx + dw + 8} ${n(yy)}H${dx + dw + 40}`, stroke: th.ink, 'stroke-width': 1.5 }));
    s.push(h('circle', { cx: dx + dw + 8, cy: n(yy), r: 4, fill: dir === 'bazaar' ? BZ.saffron : RY.goldDk }));
    s.push(T(dx + dw + 48, yy + 7, label, { f: th.body, s: 19, w: 700, c: th.ink }));
    if (sub) s.push(T(dx + dw + 48, yy + 30, sub, { f: th.body, s: 16, c: th.muted }));
  };
  dim(120, "Ceiling ~10′ (assumed)", 'paint: flat');
  dim(108, "Picture rail 9′0″", 'trim: semi-gloss');
  dim(74, 'Wallcovering zone', `${c0.wallpaper.repeat}″ repeat · Type II`);
  dim(40, "Dado rail 3′4″", 'just above a 38″ banquette back');
  dim(20, 'Wainscot paint', 'satin / semi-gloss');
  dim(6, 'Baseboard 6″', 'semi-gloss');
  s.push(T(dx, dy + dh + 40, 'Section through the feature wall (illustrative)', { f: th.body, s: 16, c: th.muted, i: true }));

  // ── spec rows (right column)
  const rx = 640, rw = W - rx - 60; let ry = 300;
  const row = (label, text, tag) => {
    s.push(T(rx, ry + 4, label.toUpperCase(), { f: th.body, s: 15, w: 700, c: dir === 'bazaar' ? BZ.saffron : RY.goldDk, ls: 1.6 }));
    if (tag) { const tw = tag.length * 8.6 + 20; s.push(h('rect', { x: rx + rw - tw, y: ry - 14, width: tw, height: 24, rx: 12, fill: tag.startsWith('est') ? '#EDE7FF' : (dir === 'bazaar' ? '#FFE7B8' : '#F3E4C8') })); s.push(T(rx + rw - tw / 2, ry + 3, tag, { f: th.body, s: 13, w: 700, c: tag.startsWith('est') ? '#4B2FB8' : th.ink, a: 'middle' })); }
    const p = P(rx, ry + 34, text, rw, { f: th.body, s: 18.5, c: '#271F36', lh: 25 });
    s.push(p.svg); ry += 34 + p.h + 22;
  };
  row('Wallcovering', 'Type II commercial vinyl — about 20 oz per 54-in linear yard, Class A (ASTM E84), scrubbable. The restaurant standard.', 'sourced');
  row('Peel-and-stick', 'Some peel-and-stick lines are Type I paper marketed for short-term, low-traffic use even when Class A rated; at least one maker describes its peel-and-stick as approved for restaurants. Verify the fire certificate before ordering.', 'sourced');
  row('Material cost', 'Stock rolls ≈ $2–9 per sq ft (one listing: $29.99 per linear yard, 54-in bolt). Custom prints ≈ $3.65–6.50 per sq ft — fire rating unconfirmed.', 'approx');
  row('Installation (Dallas)', '≈ $3–5 per sq ft for general jobs; ≈ $5.50–16 per sq ft for commercial or large-format work.', 'approx');
  row('Quantity', '150 sq ft ÷ 13.5 sq ft per linear yard (54-in goods) ≈ 11 linear yards, plus ~15% for pattern match → order ~13. Re-measure on site.', 'approx');

  // ── budget band
  let by = Math.max(ry + 10, dy + dh + 80);
  s.push(T(60, by + 10, dir === 'bazaar' ? 'BUDGET FOR ONE FEATURE WALL (≈150 SQ FT)' : 'Budget for one feature wall (≈150 sq ft)', { f: th.disp, s: dir === 'bazaar' ? 24 : 32, w: 600, i: dir !== 'bazaar', c: th.ink }));
  const tiers = [['Low', '~$800', 'peel-and-stick, DIY'], ['Mid', '~$2,100', 'Type II + pro install'], ['High', '~$4,500', 'custom print + commercial installer']];
  const tw = (W - 120 - 40) / 3;
  tiers.forEach((t, i) => {
    const x = 60 + i * (tw + 20), y = by + 36;
    s.push(th.shadow(x, y, tw, 132, 18));
    s.push(h('rect', { x, y, width: tw, height: 132, rx: 18, fill: i === 1 ? (dir === 'bazaar' ? BZ.marigold : RY.ink) : '#FFFFFF', stroke: th.stroke, 'stroke-width': th.sw }));
    const fg = i === 1 && dir === 'royal' ? RY.ivory : th.ink;
    s.push(T(x + 22, y + 36, t[0].toUpperCase(), { f: th.body, s: 15, w: 700, c: i === 1 && dir === 'royal' ? RY.goldLt : th.muted, ls: 2 }));
    s.push(T(x + 22, y + 84, t[1], { f: dir === 'bazaar' ? th.disp : th.disp, s: dir === 'bazaar' ? 40 : 46, w: 700, c: fg }));
    s.push(T(x + 22, y + 114, t[2], { f: th.body, s: 16.5, c: fg, op: 0.85 }));
  });
  s.push(T(60, by + 200, 'Approx. ranges from web research (Oct 2026) — budgeting figures, not quotes.', { f: th.body, s: 16, c: th.muted, i: true }));

  // ── paint schedule + options
  let py = by + 250;
  const cols2 = (W - 120 - 30) / 2;
  const card = (x, y, w, hh, title, lines) => {
    s.push(th.shadow(x, y, w, hh, 20));
    s.push(h('rect', { x, y, width: w, height: hh, rx: 20, fill: '#FFFFFF', stroke: th.stroke, 'stroke-width': th.sw }));
    s.push(T(x + 24, y + 44, title, { f: th.disp, s: dir === 'bazaar' ? 22 : 28, w: 600, i: dir !== 'bazaar', c: th.ink }));
    let yy = y + 80;
    lines.forEach((l) => { if (l.sw) { s.push(h('rect', { x: x + 24, y: yy - 18, width: 22, height: 22, rx: 5, fill: l.sw, stroke: '#00000022' })); } const p = P(x + (l.sw ? 56 : 24), yy, l.t, w - (l.sw ? 80 : 48), { f: th.body, s: 17.5, c: '#271F36', lh: 23 }); s.push(p.svg); yy += p.h + 10; });
  };
  const PA = PAINTS[dir];
  card(60, py, cols2, 470, dir === 'bazaar' ? 'PAINT SCHEDULE' : 'Paint schedule', [
    { sw: c0.paint.wainscot, t: 'Wainscot & high-touch: satin or semi-gloss (scrubs clean).' },
    { sw: c0.paint.upper, t: 'Upper painted walls: washable matte / low-sheen.' },
    { sw: c0.wall.railBrass ? '#C8892A' : c0.paint.trim, t: 'Trim, rails, pilasters: semi-gloss.' },
    { sw: c0.paint.ceiling, t: 'Ceiling: flat.' },
    { t: 'Scuff-resistant commercial lines exist (research cites e.g. BM Scuff-X, SW Scuff Tuff). Commercial paint ≈ $60–100/gal (estimate).' },
    { t: 'Closest paint match to be confirmed with a physical swatch.' },
  ]);
  card(60 + cols2 + 30, py, cols2, 470, dir === 'bazaar' ? 'BEFORE YOU ORDER' : 'Before you order', [
    { t: '☐ Class A (ASTM E84) certificate for the exact product and colourway.' },
    { t: '☐ Ask the Little Elm fire marshal which interior-finish class applies.' },
    { t: '☐ Hang a physical sample under the room’s 2700–3000K, CRI 90+ lighting.' },
    { t: '☐ Pendants 28–34 in above the table top, on a dimmer.' },
    { t: '☐ Check lease terms for interior alterations (general advice).' },
  ]);
  // ── the four combos strip
  let cy = py + 510;
  s.push(T(60, cy + 6, dir === 'bazaar' ? 'THE FOUR WALL OPTIONS' : 'The four wall options', { f: th.disp, s: dir === 'bazaar' ? 22 : 28, w: 600, i: dir !== 'bazaar', c: th.ink }));
  const cwid = (W - 120 - 3 * 20) / 4;
  combos.forEach((cb, i) => {
    const x = 60 + i * (cwid + 20), y = cy + 30;
    const t = L.tile(cb.wallpaper.dir, cb.wallpaper.file);
    const id = `cbT${i}`, cl = `cbC${i}`;
    defs.push(`<image id="${id}" href="${t.uri}" width="${t.px * 0.55 + 0.5}" height="${t.px * 0.55 + 0.5}" preserveAspectRatio="none"/><clipPath id="${cl}"><rect x="${n(x)}" y="${y}" width="${n(cwid)}" height="120" rx="12"/></clipPath>`);
    let uu = ''; const ps = t.px * 0.55; for (let yy = y; yy < y + 120; yy += ps) for (let xx = x; xx < x + cwid; xx += ps) uu += `<use href="#${id}" x="${n(xx)}" y="${n(yy)}"/>`;
    s.push(`<g clip-path="url(#${cl})">${uu}${h('rect', { x: n(x), y: y + 92, width: n(cwid), height: 28, fill: cb.paint.wainscot })}${h('rect', { x: n(x), y: y + 89, width: n(cwid), height: 4, fill: cb.wall.railBrass ? 'url(#bBrass)' : cb.paint.trim })}</g>`);
    s.push(h('rect', { x: n(x), y, width: n(cwid), height: 120, rx: 12, fill: 'none', stroke: th.ink, 'stroke-width': dir === 'bazaar' ? 2.5 : 1 }));
    const nm = wrap(cb.label, cwid, 17, 0.55);
    nm.forEach((l, j) => s.push(T(x + 2, y + 146 + j * 21, l, { f: th.body, s: 17, w: 700, c: th.ink })));
    s.push(T(x + 2, y + 146 + nm.length * 21, `${cb.wallpaper.repeat}″ repeat`, { f: th.body, s: 15, c: th.muted }));
  });
  s.push(footer(th, W, H, 'Spec notes from project research · (S) sourced via search summaries, (E) estimates — verify before purchase'));
  return L.doc(W, H, defs.join(''), s.join(''), { fonts: th.dir === 'bazaar' ? FB.keys : FR.keys, title: `Feature-wall spec — ${th.badge}` });
}

/* ═════════ 4 · WHAT IT COSTS — phased plans ═════════ */
const SOURCED = '#E0560C', ESTIMATE = '#7B5CFF';   // validated pair (scripts/validate_palette.js, light, surface #FFF8EC: all checks pass)
function hatchDefs() {
  return `<pattern id="hatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)"><rect width="8" height="8" fill="${mix(ESTIMATE, '#FFFFFF', 0.55)}"/><rect width="3.2" height="8" fill="${ESTIMATE}"/></pattern>`;
}
const PHASES = [
  { amt: '$500', name: 'DIY weekend', blurb: 'Nothing landlord-sensitive.', items: [
    ['Accent wall or nook in washable paint', 120, 'E'], ['10–12 faux marigold garlands', 120, 'E'], ['Chalkboard A-frame (check 12 sq ft cap)', 110, 'S'], ['2700K, CRI 90+ LED bulb swap', 80, 'E'], ['QR “tell us how we did” cards', 60, 'E']], total: '≈ $490' },
  { amt: '$2,500', name: 'Photo-wall upgrade', blurb: 'Everything in $500, plus:', items: [
    ['100 sq ft Type II photo wall + install', 1150, 'S'], ['36-in custom LED neon', 600, 'S'], ['Window hours / logo decals', 260, 'S'], ['The $500 plan', 490, 'E']], total: '≈ $2,500' },
  { amt: '$10,000', name: 'Room glow-up', blurb: 'The full room. Channel-letter sign is a separate phase ($3,000–7,000, sourced).', items: [
    ['Mural, 120 sq ft at ~$22', 2640, 'S'], ['5 booths reupholstered', 1750, 'S'], ['8 pendants + electrician', 1300, 'E'], ['Restroom wallpaper', 1000, 'S'], ['48-in neon', 900, 'S'], ['Permits & contingency', 900, 'E'], ['Perforated window film', 800, 'S'], ['Marigolds / plants', 400, 'E'], ['A-frame, menus & QR', 300, 'E']], total: '≈ $10,000' },
];
function costsPhased() {
  const W = 1200; const F = L.FONTS.both; const s = []; const BG = '#FFF8EC', INK = '#1D1147';
  const cardH = PHASES.map((p) => 170 + p.items.length * 58 + 40);
  const H = 330 + cardH.reduce((a, b) => a + b + 36, 0) + 170;
  s.push(h('rect', { width: W, height: H, fill: BG }));
  s.push(h('rect', { width: W, height: 12, fill: 'url(#bFoil)' }));
  s.push(T(60, 84, 'WHAT IT COSTS · THREE WAYS IN', { f: F.body, s: 18, w: 700, c: '#B7791F', ls: 3 }));
  s.push(T(58, 164, 'Start at $500.', { f: F.display, s: 64, w: 600, c: INK }));
  s.push(T(58, 232, 'Grow to the full glow-up.', { f: F.display, s: 64, w: 600, i: true, c: SOURCED }));
  // legend
  const lg = (x, sw, label) => { s.push(h('rect', { x, y: 262, width: 40, height: 16, rx: 4, fill: sw })); s.push(T(x + 52, 277, label, { f: F.body, s: 18, c: INK })); };
  lg(60, SOURCED, 'approx. — sourced (web research)');
  lg(470, 'url(#hatch)', 'estimate — needs a real quote');
  let y = 320;
  PHASES.forEach((p, pi) => {
    const hh = cardH[pi];
    s.push(h('rect', { x: 60, y: y + 10, width: W - 120, height: hh, rx: 28, fill: INK, opacity: 0.1, filter: 'url(#bBlur)' }));
    s.push(h('rect', { x: 60, y, width: W - 120, height: hh, rx: 28, fill: '#FFFFFF', stroke: '#E9D9B4', 'stroke-width': 1.5 }));
    s.push(h('rect', { x: 60, y, width: 14, height: hh, rx: 7, fill: ['#FFB000', '#E4147E', '#0F4D3F'][pi] }));
    s.push(T(100, y + 86, p.amt, { f: F.display, s: 72, w: 800, c: INK }));
    s.push(T(100 + p.amt.length * 47 + 24, y + 62, p.name, { f: F.display, s: 30, w: 600, i: true, c: INK }));
    s.push(P(100 + p.amt.length * 47 + 24, y + 92, p.blurb, W - 260 - p.amt.length * 47, { f: F.body, s: 18, c: '#4A3F66', lh: 23 }).svg);
    const max = Math.max(...p.items.map((it) => it[1]));
    const barX = 640, barW = W - 120 - (barX - 60) - 210;
    p.items.forEach((it, i) => {
      const iy = y + 168 + i * 58;
      s.push(T(100, iy, it[0], { f: F.body, s: 20, c: INK }));
      const bw = Math.max(6, it[1] / max * barW);
      s.push(h('rect', { x: barX, y: iy - 18, width: n(bw), height: 18, rx: 4, fill: it[2] === 'S' ? SOURCED : 'url(#hatch)' }));
      s.push(T(barX + bw + 12, iy - 2, `~$${it[1].toLocaleString('en-US')}`, { f: F.body, s: 19, w: 700, c: INK }));
      s.push(T(W - 86, iy - 2, it[2] === 'S' ? 'approx' : 'est.', { f: F.body, s: 14, w: 700, c: it[2] === 'S' ? '#A33D06' : '#4B2FB8', a: 'end' }));
      s.push(h('path', { d: `M100 ${iy + 18}H${W - 86}`, stroke: '#EFE4CC', 'stroke-width': 1 }));
    });
    s.push(T(W - 86, y + hh - 24, `Total ${p.total}`, { f: F.display, s: 26, w: 700, i: true, c: INK, a: 'end' }));
    y += hh + 36;
  });
  s.push(P(60, y + 10, 'USD. Budgeting ranges from project web research (Oct 2026): approx. figures, not quotes. Items marked est. are placeholders until a contractor quotes them. Sign and window items need landlord approval and may need a Little Elm permit.', W - 120, { f: F.body, s: 17, c: '#5B4F85', lh: 24 }).svg);
  return L.doc(W, H, BDEFS + hatchDefs(), s.join(''), { fonts: F.keys, title: 'What it costs — three ways in' });
}

/* ═════════ 5 · WHAT IT COSTS — low / mid / high ranges ═════════ */
const RANGES = [
  ['Table tops, 15 × 30″', 1000, 4000, 10000, 'S', 'laminate → wood → terrazzo'],
  ['Hand-painted mural, 150 sq ft', 1800, 3500, 9000, 'S', '$12 → $23 → $60 per sq ft'],
  ['Wall paint, dining room', 500, 3000, 8000, 'E', 'DIY → pro → colour-drench incl. ceiling'],
  ['Pendant lighting, 8–12', 600, 2000, 6000, 'E', 'plus electrician'],
  ['Acoustic panels, 150–250 sq ft', 1000, 2500, 5000, 'E', 'ask for Class A'],
  ['Feature wall, Type II, 150 sq ft', 800, 2100, 4500, 'S', 'peel-and-stick DIY → pro → custom'],
  ['Jaali screen, per 4×8 panel', 300, 900, 2500, 'E', 'painted MDF → powder-coated metal'],
  ['Cement-tile accent, 30 sq ft', 250, 900, 1800, 'E', 'cement-look porcelain → real cement'],
  ['Marigold garlands / plants', 150, 500, 1500, 'E', 'faux → fresh weekly'],
  ['Booth reupholstery, per booth', 200, 350, 600, 'S', 'performance fabric +$50–100'],
];
function costsRanges() {
  const W = 1200; const F = L.FONTS.both; const s = []; const BG = '#FFF8EC', INK = '#1D1147';
  const top = 360, rowH = 112; const H = top + RANGES.length * rowH + 210;
  s.push(h('rect', { width: W, height: H, fill: BG }));
  s.push(h('rect', { width: W, height: 12, fill: 'url(#bFoil)' }));
  s.push(T(60, 84, 'WHAT IT COSTS · LOW / MID / HIGH', { f: F.body, s: 18, w: 700, c: '#B7791F', ls: 3 }));
  s.push(T(58, 160, 'Every upgrade has', { f: F.display, s: 58, w: 600, c: INK }));
  s.push(T(58, 222, 'a cheap way in.', { f: F.display, s: 58, w: 600, i: true, c: SOURCED }));
  s.push(P(60, 262, 'Line = low → high budgeting range; dot = typical mid. USD, approximate, from project research — not quotes.', W - 120, { f: F.body, s: 19, c: '#4A3F66', lh: 25 }).svg);
  const lg = (x, sw, label) => { s.push(h('rect', { x, y: 308, width: 40, height: 14, rx: 4, fill: sw })); s.push(T(x + 52, 321, label, { f: F.body, s: 17, c: INK })); };
  lg(60, SOURCED, 'approx. — sourced');
  lg(360, 'url(#hatch)', 'estimate — needs a quote');
  const ax0 = 470, ax1 = W - 80, max = 10000; const X = (v) => ax0 + (ax1 - ax0) * v / max;
  // grid (recessive)
  [0, 2500, 5000, 7500, 10000].forEach((v) => {
    s.push(h('path', { d: `M${n(X(v))} ${top - 10}V${top + RANGES.length * rowH - 20}`, stroke: '#E9DCC0', 'stroke-width': 1 }));
    s.push(T(X(v), top + RANGES.length * rowH + 10, v === 0 ? '$0' : `$${(v / 1000).toLocaleString('en-US')}k`, { f: F.body, s: 16, c: '#5B4F85', a: 'middle' }));
  });
  RANGES.forEach((r, i) => {
    const y = top + i * rowH + 40;
    const col = r[4] === 'S' ? SOURCED : ESTIMATE;
    s.push(T(60, y - 4, r[0], { f: F.body, s: 20, w: 700, c: INK }));
    s.push(T(60, y + 22, r[5], { f: F.body, s: 15.5, c: '#5B4F85' }));
    s.push(T(60, y + 44, r[4] === 'S' ? 'approx' : 'estimate', { f: F.body, s: 13.5, w: 700, c: r[4] === 'S' ? '#A33D06' : '#4B2FB8', ls: 1 }));
    // range bar
    s.push(h('rect', { x: n(X(r[1])), y: y - 9, width: n(Math.max(8, X(r[3]) - X(r[1]))), height: 14, rx: 4, fill: r[4] === 'S' ? SOURCED : 'url(#hatch)', opacity: r[4] === 'S' ? 0.9 : 1 }));
    // mid dot (surface ring)
    s.push(h('circle', { cx: n(X(r[2])), cy: y - 2, r: 11, fill: BG }));
    s.push(h('circle', { cx: n(X(r[2])), cy: y - 2, r: 8, fill: col, stroke: INK, 'stroke-width': 1.5 }));
    const lo = `$${r[1].toLocaleString('en-US')}`, hi = `$${r[3].toLocaleString('en-US')}${r[0].startsWith('Hand') ? '+' : ''}`, mid = `~$${r[2].toLocaleString('en-US')}`;
    s.push(T(X(r[2]), y - 22, mid, { f: F.body, s: 17, w: 700, c: INK, a: 'middle' }));
    const loX = X(r[1]), hiX = X(r[3]);
    s.push(T(loX, y + 28, lo, { f: F.body, s: 14.5, c: '#5B4F85', a: hiX - loX < 120 ? 'end' : 'start' }));
    s.push(T(hiX, y + 28, hi, { f: F.body, s: 14.5, c: '#5B4F85', a: hiX - loX < 120 ? 'start' : 'end' }));
    s.push(h('path', { d: `M60 ${y + 58}H${W - 60}`, stroke: '#EFE4CC', 'stroke-width': 1 }));
  });
  s.push(P(60, H - 130, 'Source: research/interiors_signage_brief.md (Oct 2026). “Approx” = taken from web-search summaries; “estimate” = industry estimate, placeholder until a quote arrives. Planning assumes 2,000–3,500 sq ft casual dining and a ~150 sq ft feature wall.', W - 120, { f: F.body, s: 16, c: '#5B4F85', lh: 23 }).svg);
  return L.doc(W, H, BDEFS + hatchDefs(), s.join(''), { fonts: F.keys, title: 'What it costs — low / mid / high' });
}

/* ═════════ 6 · embed a room render inside a board (namespaced ids) ═════════ */
function embed(svg, prefix, x, y, w, hh) {
  const i0 = svg.indexOf('>', svg.indexOf('<svg')) + 1, i1 = svg.lastIndexOf('</svg>');
  const vb = /viewBox="([^"]+)"/.exec(svg)[1];
  let inner = svg.slice(i0, i1).replace(/<title>[\s\S]*?<\/title>/, '').replace(/<desc>[\s\S]*?<\/desc>/, '').replace(/<style>[\s\S]*?<\/style>/, '');
  const ids = new Set(); inner.replace(/\sid="([^"]+)"/g, (m, a) => ids.add(a));
  inner = inner.replace(/(\sid="|url\(#|href="#)([A-Za-z][\w-]*)/g, (m, a, b) => ids.has(b) ? a + prefix + b : m);
  return `<svg x="${x}" y="${y}" width="${w}" height="${hh}" viewBox="${vb}" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;
}
function scaleBoard(dir, panels) {   // panels: [{svg, rep, verdict, note, good}]
  const th = theme(dir); const W = 1920, H = 1080; const s = [];
  s.push(h('rect', { width: W, height: H, fill: dir === 'bazaar' ? BZ.cream : RY.ink }));
  const ink = dir === 'bazaar' ? BZ.ink : RY.ivory;
  s.push(T(60, 78, `${th.badge} · PATTERN SCALE`, { f: th.body, s: 20, w: 700, c: dir === 'bazaar' ? BZ.saffron : RY.gold, ls: 2.5 }));
  s.push(T(60, 138, dir === 'bazaar' ? 'SAME PAPER. THREE SIZES.' : 'Same paper. Three sizes.', { f: th.disp, s: dir === 'bazaar' ? 46 : 54, w: 600, i: dir !== 'bazaar', c: ink }));
  const pw = 560, ph = 720, gap = (W - 120 - 3 * pw) / 2;
  panels.forEach((p, i) => {
    const x = 60 + i * (pw + gap), y = 176;
    if (p.good) s.push(h('rect', { x: x - 8, y: y - 8, width: pw + 16, height: ph + 16, rx: 22, fill: 'none', stroke: dir === 'bazaar' ? BZ.saffron : RY.gold, 'stroke-width': 6 }));
    s.push(`<clipPath id="scC${i}"><rect x="${x}" y="${y}" width="${pw}" height="${ph}" rx="16"/></clipPath>`);
    s.push(`<g clip-path="url(#scC${i})">${embed(p.svg, `p${i}_`, x, y, pw, ph)}</g>`);
    s.push(h('rect', { x: x + 18, y: y + 18, width: 150, height: 44, rx: 22, fill: dir === 'bazaar' ? BZ.ink : RY.ink, opacity: 0.92 }));
    s.push(T(x + 93, y + 48, `${p.rep}″ repeat`, { f: th.body, s: 20, w: 700, c: dir === 'bazaar' ? BZ.marigold : RY.goldLt, a: 'middle' }));
    s.push(T(x, y + ph + 50, p.verdict, { f: th.disp, s: dir === 'bazaar' ? 28 : 34, w: 600, i: dir !== 'bazaar', c: p.good ? (dir === 'bazaar' ? BZ.saffron : RY.gold) : ink }));
    s.push(P(x, y + ph + 86, p.note, pw, { f: th.body, s: 19, c: ink, op: 0.85, lh: 25 }).svg);
  });
  s.push(T(W - 60, 138, 'Illustrative room — not your actual dining room · figure = 6 ft for scale', { f: th.body, s: 18, c: ink, op: 0.7, a: 'end' }));
  return L.doc(W, H, BDEFS, s.join(''), { fonts: th.dir === 'bazaar' ? FB.keys : FR.keys, title: `Pattern scale — ${th.badge}` });
}

module.exports = { paintBoard, swatchBook, specSheet, costsPhased, costsRanges, scaleBoard, embed, patternGroups, REPEAT_IN, PAINTS };

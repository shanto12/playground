// Party-tray lid + zone labels, District Lunchbox sleeve, box-lunch carton, tray tent, van magnet. Units: mm.
import { BZ, RY, FONT, T, f, esc, place, placeC, patternDef, stickerText, foilDef, scallopBand, ZONES, ZONE_COLOURS, ZONE_ICON } from './lib.mjs';
import { archPath, diamond, marigold, leaf } from './art-chai.mjs';

const ICON = (dir, name, bg = 'dark') => dir === 'bazaar' ? `icons/bazaar/${name}.svg` : (bg === 'ivory' ? `icons/royal/on-ivory/${name}.svg` : `icons/royal/${name}.svg`);
const PEN = '#1F3A93';          // ballpoint/marker ink for write-ins shown in mockups
const PEN_R = '#0F4D3F';
const SPICE_LABELS = ['Mild', 'Medium', 'Hot', 'Extra-hot', 'District hot'];
function words(name) { const w = name.split(' '); if (w.length <= 2) return w; return [w.slice(0, w.length - 1).join(' '), w[w.length - 1]]; }
const box = (x, y, s, col, sw, r = .8) => `<rect x="${f(x)}" y="${f(y)}" width="${f(s)}" height="${f(s)}" rx="${f(r)}" fill="none" stroke="${col}" stroke-width="${f(sw)}"/>`;
const tickMark = (x, y, s, col) => `<path d="M${f(x + s * .15)} ${f(y + s * .55)}L${f(x + s * .42)} ${f(y + s * .85)}L${f(x + s * 1.05)} ${f(y - s * .15)}" fill="none" stroke="${col}" stroke-width="${f(s * .22)}" stroke-linecap="round" stroke-linejoin="round"/>`;
const ring = (cx, cy, r, col, sw) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="none" stroke="${col}" stroke-width="${f(sw)}"/>`;
const scrib = (cx, cy, r, col) => `<path d="M${f(cx - r * 1.3)} ${f(cy + r * .2)}C${f(cx - r * .6)} ${f(cy - r * 1.6)} ${f(cx + r * 1.5)} ${f(cy - r * 1.1)} ${f(cx + r * 1.2)} ${f(cy + r * .5)}C${f(cx + r * .8)} ${f(cy + r * 1.6)} ${f(cx - r * 1.4)} ${f(cy + r * 1.3)} ${f(cx - r * 1.1)} ${f(cy - r * .3)}" fill="none" stroke="${col}" stroke-width="${f(r * .32)}" stroke-linecap="round"/>`;

/* ═════════════ PARTY-TRAY ZONE LABEL · 6 × 4 in ═════════════ */
export const LABEL = { W: 152.4, H: 101.6 };
/** fill = { dish, serves, diet:'veg'|'nonveg', spice:1..5 } handwritten (mockups) */
export function zoneLabel(dir, zoneId, fill) {
  const { W, H } = LABEL, z = ZONES[zoneId], col = ZONE_COLOURS[dir][zoneId];
  let b = '', defs = '';
  if (dir === 'bazaar') {
    const c = BZ, bw = 44, x0 = bw + 7, x1 = W - 7;
    defs += `<clipPath id="lbClip${zoneId}"><rect x="0" y="0" width="${W}" height="${H}" rx="5"/></clipPath>`;
    b += `<rect width="${W}" height="${H}" rx="5" fill="${c.cream}"/>`;
    b += `<g clip-path="url(#lbClip${zoneId})"><rect width="${bw}" height="${H}" fill="${col}"/>`;
    for (let i = 0; i < 9; i++) b += `<path d="M${bw} ${f(i * H / 9)}l3.2 ${f(H / 18)}l-3.2 ${f(H / 18)}Z" fill="${col}"/>`;
    b += `</g>`;
    b += `<circle cx="${f(bw / 2 + 1)}" cy="29" r="16.5" fill="${c.ink}"/><circle cx="${f(bw / 2)}" cy="28" r="16.5" fill="${c.cream}" stroke="${c.ink}" stroke-width="1"/>`;
    b += placeC(ICON(dir, ZONE_ICON[zoneId]), bw / 2, 28, { h: 22 });
    const ws = words(z.name.toUpperCase()); const longest = Math.max(...ws.map(w => w.length));
    const sz = Math.min(7.6, (bw - 7) / (longest * .74));
    ws.forEach((w, i) => b += stickerText(bw / 2, 60 + i * (sz * 1.18), w, { size: sz, fill: c.cream, shadow: c.ink, stroke: c.ink, sw: sz * .16, dx: .5, dy: .6 }));
    b += T(bw / 2, H - 7, 'CURRY DISTRICT', { font: FONT.dm(700), size: 2.7, fill: c.ink === col ? c.cream : c.ink, ls: .5 });
    // DISH
    b += T(x0, 14, 'DISH', { font: FONT.dm(700), size: 3.4, fill: c.muted, anchor: 'start', ls: .6 });
    b += `<path d="M${x0} 28.5H${x1}" stroke="${c.ink}" stroke-width=".55"/>`;
    if (fill?.dish) b += T(x0 + 2, 26.4, fill.dish, { font: FONT.caveat(700), size: 10.5, fill: PEN, anchor: 'start' });
    // SERVES + diet
    b += T(x0, 40, 'SERVES', { font: FONT.dm(700), size: 3.4, fill: c.muted, anchor: 'start', ls: .6 });
    b += `<path d="M${x0 + 16} 41H${x0 + 34}" stroke="${c.ink}" stroke-width=".55"/>`;
    if (fill?.serves) b += T(x0 + 25, 39.6, fill.serves, { font: FONT.caveat(700), size: 8, fill: PEN });
    const dx = x0 + 42;
    [['veg', 'VEG'], ['nonveg', 'NON-VEG']].forEach(([k, lab], i) => {
      const xx = dx + i * 27;
      b += box(xx, 35.6, 4.6, c.ink, .55) + place(ICON(dir, k + '-mark'), { x: xx + 6, y: 34.6, w: 6.6, h: 6.6 }) + T(xx + 13.6, 40, lab, { font: FONT.dm(700), size: 3, fill: c.ink, anchor: 'start', ls: .2 });
      if (fill?.diet === k) b += tickMark(xx, 36, 4.6, PEN);
    });
    // SPICE
    b += T(x0, 53, 'SPICE', { font: FONT.dm(700), size: 3.4, fill: c.muted, anchor: 'start', ls: .6 });
    for (let i = 0; i < 5; i++) {
      const cx = x0 + 25 + i * 15.5;
      b += placeC(ICON(dir, `chili-${i + 1}`), cx, 52, { h: 10 }) + ring(cx, 62.2, 1.9, c.ink, .5);
      if (fill?.spice === i + 1) b += scrib(cx, 52, 6.2, PEN);
    }
    // HEAT & SERVE
    b += `<rect x="${x0 + .9}" y="${f(70.9)}" width="${f(x1 - x0)}" height="22" rx="4" fill="${c.ink}"/><rect x="${x0}" y="70" width="${f(x1 - x0)}" height="22" rx="4" fill="${c.sand}" stroke="${c.ink}" stroke-width=".7"/>`;
    b += `<g transform="translate(${x0 + 9} 81)">${[-3, 0, 3].map(k => `<path d="M${k} 5c-1.3 -1.7 1.3 -2.8 0 -4.6s1.3 -2.8 0 -4.6" fill="none" stroke="${c.saffron}" stroke-width="1" stroke-linecap="round"/>`).join('')}</g>`;
    b += T(x0 + 17, 79.2, 'HEAT & SERVE', { font: FONT.bowlby, size: 4.1, fill: c.rani, anchor: 'start', ls: .3 });
    b += T(x0 + 17, 86.6, 'Reheat gently; stir before serving.', { font: FONT.dm(500), size: 3.9, fill: c.ink, anchor: 'start' });
    b += `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="4.6" fill="none" stroke="${c.ink}" stroke-width="1.1"/>`;
    return { W, H, defs, body: b };
  }
  // ROYAL
  const c = RY, x0 = 12, x1 = W - 12, bandH = 25;
  defs += foilDef('lbFoil' + zoneId, 0, 0, 1, 1) + `<clipPath id="lrClip${zoneId}"><rect width="${W}" height="${H}" rx="5"/></clipPath>`;
  b += `<rect width="${W}" height="${H}" rx="5" fill="${c.ivory}"/>`;
  b += `<g clip-path="url(#lrClip${zoneId})"><rect width="${W}" height="${bandH}" fill="${col}"/>`;
  for (let i = 0; i < 16; i++) b += `<path d="${archPath(4.8 + i * 9.5, bandH, 6, 8)}" fill="${c.ink}" opacity=".18"/>`;
  b += `<rect y="${bandH}" width="${W}" height=".8" fill="url(#lbFoil${zoneId})"/></g>`;
  const light = zoneId === 'sweets';
  b += T(W / 2, 13.4, z.name, { font: FONT.fr(600), size: 9.2, fill: light ? c.ink : c.ivory });
  b += T(W / 2, 20.4, 'CURRY DISTRICT · PARTY TRAY', { font: FONT.hk(600), size: 2.5, fill: light ? c.plum : c.goldLt, ls: .9 });
  b += placeC(ICON(dir, ZONE_ICON[zoneId], light ? 'ivory' : 'dark'), 15, bandH / 2, { h: 15 });
  b += placeC(ICON(dir, ZONE_ICON[zoneId], light ? 'ivory' : 'dark'), W - 15, bandH / 2, { h: 15 });
  b += `<rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="3" fill="none" stroke="${c.goldDk}" stroke-width=".35"/>`;
  // dish
  b += T(x0, 36.5, 'Dish', { font: FONT.fr(500, true), size: 4.6, fill: c.muted, anchor: 'start' });
  b += `<path d="M${x0 + 12} 39H${x1}" stroke="${c.goldDk}" stroke-width=".4"/>`;
  if (fill?.dish) b += T(x0 + 15, 37.2, fill.dish, { font: FONT.caveat(700), size: 10, fill: PEN_R, anchor: 'start' });
  // serves + diet
  b += T(x0, 50, 'Serves', { font: FONT.fr(500, true), size: 4.6, fill: c.muted, anchor: 'start' });
  b += `<path d="M${x0 + 15} 51H${x0 + 34}" stroke="${c.goldDk}" stroke-width=".4"/>`;
  if (fill?.serves) b += T(x0 + 24.5, 49.6, fill.serves, { font: FONT.caveat(700), size: 8, fill: PEN_R });
  [['veg', 'Veg'], ['nonveg', 'Non-veg']].forEach(([k, lab], i) => {
    const xx = x0 + 46 + i * 28;
    b += box(xx, 46.2, 4.4, c.goldDk, .45) + place(ICON(dir, k + '-mark', 'ivory'), { x: xx + 5.8, y: 45.2, w: 6.4, h: 6.4 }) + T(xx + 13.4, 50.4, lab, { font: FONT.hk(600), size: 3.4, fill: c.ink, anchor: 'start' });
    if (fill?.diet === k) b += tickMark(xx, 46.6, 4.4, PEN_R);
  });
  // spice
  b += T(x0, 63.4, 'Spice', { font: FONT.fr(500, true), size: 4.6, fill: c.muted, anchor: 'start' });
  for (let i = 0; i < 5; i++) {
    const cx = x0 + 28 + i * 21;
    b += placeC(ICON(dir, `chili-${i + 1}`, 'ivory'), cx, 61.5, { h: 11 }) + diamond(cx + 8, 64.5, 1.6, 'none').replace('fill="none"', `fill="none" stroke="${c.goldDk}" stroke-width=".4"`);
    if (fill?.spice === i + 1) b += scrib(cx, 61.5, 6.5, PEN_R);
  }
  // heat & serve
  b += `<rect x="${x0}" y="72" width="${x1 - x0}" height="19" rx="9.5" fill="${c.ink}"/>`;
  b += `<rect x="${x0 + 1.2}" y="73.2" width="${x1 - x0 - 2.4}" height="16.6" rx="8.3" fill="none" stroke="url(#lbFoil${zoneId})" stroke-width=".4"/>`;
  b += T(x0 + 10, 80, 'Heat & serve', { font: FONT.fr(600, true), size: 4.6, fill: c.goldLt, anchor: 'start' });
  b += T(x0 + 10, 86.4, 'Reheat gently; stir before serving.', { font: FONT.hk(500), size: 3.7, fill: c.ivory, anchor: 'start' });
  b += placeC('logo/royal/emblem.svg', x1 - 10, 81.5, { h: 13 });
  return { W, H, defs, body: b };
}

/* ═════════════ PARTY-TRAY BOARD LID (sits in a half-size foil pan) ═════════════ */
export const LID_T = { W: 314, H: 254 };
export function trayLid(dir, { showLabelZone = false } = {}) {
  const { W, H } = LID_T; let b = '', defs = '';
  const lx = (W - LABEL.W) / 2, ly = 82;
  if (dir === 'bazaar') {
    const c = BZ;
    defs += patternDef('patterns/bazaar/01-marigold-garland-fresh.svg', 'pGar', { size: 58, x: 0, y: -6 }) + patternDef('patterns/bazaar/03-block-print-booti-fresh.svg', 'pBoo', { size: 44 });
    b += `<rect width="${W}" height="${H}" fill="url(#pGar)"/>`;
    b += `<rect x="20" y="24" width="${W - 40}" height="${H - 44}" rx="10" fill="${c.ink}" transform="translate(2.4 2.4)"/>`;
    b += `<rect x="20" y="24" width="${W - 40}" height="${H - 44}" rx="10" fill="${c.cream}" stroke="${c.ink}" stroke-width="1.6"/>`;
    b += `<rect x="20" y="24" width="${W - 40}" height="${H - 44}" rx="10" fill="url(#pBoo)" opacity=".28"/>`;
    b += placeC('logo/bazaar/emblem.svg', 50, 54, { h: 34 });
    b += placeC('logo/bazaar/emblem.svg', W - 50, 54, { h: 34 });
    b += stickerText(W / 2, 58, 'PARTY TRAY', { size: 19, fill: c.marigold, shadow: c.rani, stroke: c.ink, sw: 1.8, dx: 1.4, dy: 1.5 });
    b += T(W / 2, 71, 'CURRY DISTRICT · LITTLE ELM, TX', { font: FONT.dm(700), size: 4.6, fill: c.ink, ls: 1 });
    b += T(W / 2, 205, 'Party at yours? We’ll bring the biryani.', { font: FONT.caveat(700), size: 11.5, fill: c.rani });
    b += T(W / 2, 217, 'LIFT FROM THE BASE · KEEP LEVEL', { font: FONT.dm(700), size: 3.6, fill: c.muted, ls: .8 });
  } else {
    const c = RY;
    defs += patternDef('patterns/royal/01-jali-lattice-midnight.svg', 'pJal', { size: 46 }) + foilDef('lidFoil', 0, 0, 1, 1);
    b += `<rect width="${W}" height="${H}" fill="url(#pJal)"/>`;
    b += `<rect width="${W}" height="${H}" fill="${c.ink}" opacity=".35"/>`;
    b += `<rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="6" fill="${c.ink}"/>`;
    b += `<rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="6" fill="none" stroke="url(#lidFoil)" stroke-width="1.1"/>`;
    b += `<rect x="21" y="21" width="${W - 42}" height="${H - 42}" rx="4" fill="none" stroke="${c.gold}" stroke-width=".35"/>`;
    for (const [x, y] of [[21, 21], [W - 21, 21], [21, H - 21], [W - 21, H - 21]]) b += diamond(x, y, 2.6, c.gold);
    b += placeC('logo/royal/wordmark-horizontal.svg', W / 2, 50, { w: 96 });
    b += `<path d="M${W / 2 - 40} 72H${W / 2 + 40}" stroke="${c.gold}" stroke-width=".35"/>` + diamond(W / 2, 72, 1.6, c.gold);
    b += T(W / 2, 205, 'Celebrations, catered.', { font: FONT.fr(500, true), size: 12, fill: c.goldLt });
    b += T(W / 2, 217, 'PARTY TRAY · LITTLE ELM, TX', { font: FONT.hk(600), size: 3.6, fill: c.gold, ls: 1.4 });
  }
  if (showLabelZone) b += `<rect x="${lx}" y="${ly}" width="${LABEL.W}" height="${LABEL.H}" rx="5" fill="none" stroke="${dir === 'bazaar' ? BZ.muted : RY.gold}" stroke-width=".6" stroke-dasharray="3 2"/>` + T(W / 2, ly + LABEL.H / 2 + 2, '6 × 4 in zone label goes here', { font: FONT.dm(500), size: 5, fill: dir === 'bazaar' ? BZ.muted : RY.gold });
  return { W, H, defs, body: b, label: { x: lx, y: ly } };
}

/* ═════════════ DISTRICT LUNCHBOX SLEEVE ═════════════ */
export const LBOX = { L: 228.6, D: 152.4, Hh: 57.2, band: 108, glue: 12.7 };
const LB = LBOX;
/** top panel: band(108) wide × D tall, viewer stands at the bottom edge (front) */
export function lunchTop(dir, fill) {
  const W = LB.band, H = LB.D; let b = '', defs = '';
  const bz = dir === 'bazaar', c = bz ? BZ : RY;
  const ink = c.ink, pen = bz ? PEN : PEN_R;
  if (bz) {
    defs += patternDef('patterns/bazaar/02-chili-lime-sunset.svg', 'pChl', { size: 40 });
    b += `<rect width="${W}" height="${H}" fill="${c.saffron}"/><rect width="${W}" height="${H}" fill="url(#pChl)" opacity=".18"/>`;
    b += stickerText(W / 2, 13.5, 'WHICH DISH', { size: 8.6, fill: c.cream, shadow: c.ink, stroke: c.ink, sw: .9, dx: .6, dy: .7 });
    b += stickerText(W / 2, 23.5, 'IS WHICH?', { size: 8.6, fill: c.marigold, shadow: c.ink, stroke: c.ink, sw: .9, dx: .6, dy: .7 });
    b += `<rect x="6.2" y="29.6" width="${W - 11}" height="${H - 34}" rx="4" fill="${ink}"/><rect x="5" y="28.4" width="${W - 11}" height="${H - 34}" rx="4" fill="${c.cream}" stroke="${ink}" stroke-width=".8"/>`;
  } else {
    defs += patternDef('patterns/royal/04-marigold-damask-emerald.svg', 'pDam', { size: 52 }) + foilDef('ltFoil', 0, 0, 1, 1);
    b += `<rect width="${W}" height="${H}" fill="url(#pDam)"/><rect width="${W}" height="${H}" fill="${c.emerald}" opacity=".45"/>`;
    b += T(W / 2, 16.5, 'Which dish is which?', { font: FONT.fr(600, true), size: 8.2, fill: c.goldLt });
    b += `<rect x="5" y="25" width="${W - 10}" height="${H - 30}" rx="4" fill="${c.ivory}" stroke="url(#ltFoil)" stroke-width=".9"/>`;
    b += `<rect x="7.4" y="27.4" width="${W - 14.8}" height="${H - 34.8}" rx="2.6" fill="none" stroke="${c.goldDk}" stroke-width=".3"/>`;
  }
  const lab = (x, y, t) => T(x, y, bz ? t.toUpperCase() : t, bz ? { font: FONT.dm(700), size: 3.1, fill: BZ.muted, anchor: 'start', ls: .5 } : { font: FONT.fr(500, true), size: 3.9, fill: RY.muted, anchor: 'start' });
  const line = (x0, x1, y) => `<path d="M${f(x0)} ${f(y)}H${f(x1)}" stroke="${bz ? ink : RY.goldDk}" stroke-width="${bz ? .5 : .35}"/>`;
  const y0 = bz ? 38 : 36;
  b += lab(11, y0, 'For') + line(23, W - 11, y0 + .8);
  if (fill?.for) b += T(25, y0 - .6, fill.for, { font: FONT.caveat(700), size: 7.4, fill: pen, anchor: 'start' });
  // compartment map
  const mw = 46, mh = 30.7, mx = (W - mw) / 2, my = y0 + 6;
  const badge = (x, y, n) => bz ? `<circle cx="${f(x)}" cy="${f(y)}" r="3.3" fill="${BZ.rani}" stroke="${ink}" stroke-width=".5"/>` + T(x, y + 1.55, String(n), { font: FONT.bowlby, size: 4.2, fill: BZ.cream })
    : `<circle cx="${f(x)}" cy="${f(y)}" r="3.3" fill="${RY.ink}"/><circle cx="${f(x)}" cy="${f(y)}" r="2.8" fill="none" stroke="${RY.gold}" stroke-width=".3"/>` + T(x, y + 1.5, String(n), { font: FONT.fr(600), size: 4.2, fill: RY.goldLt });
  b += `<rect x="${f(mx)}" y="${f(my)}" width="${mw}" height="${f(mh)}" rx="3" fill="${bz ? '#fff' : '#fff'}" stroke="${bz ? ink : RY.goldDk}" stroke-width="${bz ? .7 : .45}"/>`;
  b += `<path d="M${f(mx + mw / 2)} ${f(my)}V${f(my + mh)}M${f(mx + mw / 2)} ${f(my + mh / 2)}H${f(mx + mw)}" stroke="${bz ? ink : RY.goldDk}" stroke-width="${bz ? .7 : .45}"/>`;
  b += badge(mx + mw / 4, my + mh / 2, 1) + badge(mx + mw * .75, my + mh / 4, 2) + badge(mx + mw * .75, my + mh * .75, 3);
  b += T(mx + mw + 2.5, my + mh + .2, 'front', { font: bz ? FONT.caveat(700) : FONT.fr(400, true), size: 3.4, fill: bz ? BZ.muted : RY.muted, anchor: 'start' });
  // rows
  const ry0 = my + mh + 9;
  for (let i = 0; i < 3; i++) {
    const y = ry0 + i * 10.2;
    b += badge(13, y - 1.2, i + 1) + line(19, 58, y + .8);
    const fr = fill?.rows?.[i];
    if (fr) b += T(20, y - .3, fr.dish, { font: FONT.caveat(700), size: 6.2, fill: pen, anchor: 'start' });
    b += place(ICON(dir, 'veg-mark', 'ivory'), { x: 61, y: y - 4.3, w: 5.4, h: 5.4 }) + place(ICON(dir, 'nonveg-mark', 'ivory'), { x: 67.6, y: y - 4.3, w: 5.4, h: 5.4 });
    if (fr) b += ring(fr.diet === 'veg' ? 63.7 : 70.3, y - 1.6, 3.9, pen, .55);
    for (let k = 0; k < 5; k++) { const cx = 77.5 + k * 4.6; b += ring(cx, y - 1.6, 1.5, bz ? ink : RY.goldDk, .4); if (fr && fr.spice === k + 1) b += `<circle cx="${f(cx)}" cy="${f(y - 1.6)}" r="1.25" fill="${pen}"/>`; }
  }
  b += T(87, ry0 - 7.4, bz ? 'SPICE' : 'spice', bz ? { font: FONT.dm(700), size: 2.6, fill: BZ.muted, ls: .4 } : { font: FONT.fr(400, true), size: 3.2, fill: RY.muted });
  b += T(67.3, ry0 - 7.4, bz ? 'DIET' : 'diet', bz ? { font: FONT.dm(700), size: 2.6, fill: BZ.muted, ls: .4 } : { font: FONT.fr(400, true), size: 3.2, fill: RY.muted });
  // key
  const ky = ry0 + 27;
  b += `<path d="M10 ${f(ky - 4)}H${W - 10}" stroke="${bz ? ink : RY.goldDk}" stroke-width=".3" stroke-dasharray="${bz ? '1.2 1' : '0'}"/>`;
  b += lab(11, ky + 1.6, 'Key');
  b += place(ICON(dir, 'veg-mark', 'ivory'), { x: 24, y: ky - 2.6, w: 5.6, h: 5.6 }) + T(30.6, ky + 1.4, 'Vegetarian', { font: bz ? FONT.dm(500) : FONT.hk(500), size: 3.2, fill: ink, anchor: 'start' });
  b += place(ICON(dir, 'nonveg-mark', 'ivory'), { x: 58, y: ky - 2.6, w: 5.6, h: 5.6 }) + T(64.6, ky + 1.4, 'Non-vegetarian', { font: bz ? FONT.dm(500) : FONT.hk(500), size: 3.2, fill: ink, anchor: 'start' });
  for (let k = 0; k < 5; k++) {
    const cx = 17 + k * 18.5;
    b += placeC(ICON(dir, `chili-${k + 1}`, 'ivory'), cx, ky + 10.4, { h: 8.4 });
    b += T(cx, ky + 18, SPICE_LABELS[k], { font: bz ? FONT.dm(700) : FONT.hk(600), size: 2.55, fill: ink });
  }
  return { W, H, defs, body: b };
}
export function lunchFront(dir) {
  const W = LB.band, H = LB.Hh; let b = '', defs = '';
  if (dir === 'bazaar') {
    const c = BZ;
    defs += patternDef('patterns/bazaar/02-chili-lime-sunset.svg', 'pChlF', { size: 40, x: 8 });
    b += `<rect width="${W}" height="${H}" fill="${c.saffron}"/><rect width="${W}" height="${H}" fill="url(#pChlF)" opacity=".18"/>`;
    b += stickerText(W / 2, 22, 'DISTRICT', { size: 13, fill: c.cream, shadow: c.ink, stroke: c.ink, sw: 1.3, dx: .9, dy: 1 });
    b += stickerText(W / 2, 37, 'LUNCHBOX', { size: 13, fill: c.marigold, shadow: c.ink, stroke: c.ink, sw: 1.3, dx: .9, dy: 1 });
    b += T(W / 2, 49.5, 'Lunch, boxed and sorted.', { font: FONT.caveat(700), size: 6.6, fill: c.ink });
  } else {
    const c = RY;
    defs += foilDef('lfFoil', 0, 0, 1, 1) + patternDef('patterns/royal/04-marigold-damask-emerald.svg', 'pDamF', { size: 52, y: 10 });
    b += `<rect width="${W}" height="${H}" fill="url(#pDamF)"/><rect width="${W}" height="${H}" fill="${c.emerald}" opacity=".45"/>`;
    b += `<rect x="9" y="6" width="${W - 18}" height="${H - 12}" rx="4" fill="${c.ink}" stroke="url(#lfFoil)" stroke-width=".9"/>`;
    b += T(W / 2, 17.5, 'DISTRICT', { font: FONT.hk(600), size: 3.4, fill: c.gold, ls: 2.2 });
    b += T(W / 2, 32, 'Lunchbox', { font: FONT.fr(600, true), size: 15, fill: c.goldLt });
    b += T(W / 2, 43.5, 'Lunch, neatly boxed.', { font: FONT.hk(500), size: 3.6, fill: c.ivory });
  }
  return { W, H, defs, body: b };
}
export function lunchBack(dir) {
  const W = LB.band, H = LB.Hh; let b = '';
  const bz = dir === 'bazaar', c = bz ? BZ : RY;
  b += `<rect width="${W}" height="${H}" fill="${bz ? c.cream : c.ivory}"/>`;
  b += placeC(bz ? 'logo/bazaar/wordmark-horizontal.svg' : 'logo/royal/colourways/wordmark-horizontal--ivory.svg', W / 2, 16, { w: 62 });
  const note = ['Allergies? Tell us when you order —', 'our kitchen handles nuts, dairy, gluten,', 'shellfish and eggs.'];
  note.forEach((s, i) => b += T(W / 2, 35 + i * 5, s, { font: bz ? FONT.dm(500) : FONT.hk(500), size: 3.3, fill: c.ink }));
  b += T(W / 2, 52, 'CURRY DISTRICT · LITTLE ELM, TX', { font: bz ? FONT.dm(700) : FONT.hk(600), size: 2.6, fill: bz ? BZ.muted : RY.goldDk, ls: .7 });
  return { W, H, defs: '', body: b };
}
export function lunchBottom(dir) {
  const W = LB.band, H = LB.D; let b = '', defs = '';
  if (dir === 'bazaar') { defs = patternDef('patterns/bazaar/02-chili-lime-sunset.svg', 'pChlB', { size: 40 }); b += `<rect width="${W}" height="${H}" fill="url(#pChlB)"/>`; }
  else { defs = patternDef('patterns/royal/04-marigold-damask-emerald.svg', 'pDamB', { size: 52 }); b += `<rect width="${W}" height="${H}" fill="url(#pDamB)"/>`; }
  return { W, H, defs, body: b };
}
/** full sleeve strip (vertical): glue | back(180°) | top | front | bottom */
export function lunchStrip(dir, fill) {
  const W = LB.band, parts = [['glue', LB.glue], ['back', LB.Hh], ['top', LB.D], ['front', LB.Hh], ['bottom', LB.D]];
  const H = parts.reduce((a, p) => a + p[1], 0);
  let y = 0, b = '', defs = '';
  const art = { back: lunchBack(dir), top: lunchTop(dir, fill), front: lunchFront(dir), bottom: lunchBottom(dir) };
  const ys = {};
  for (const [k, h] of parts) {
    ys[k] = y;
    if (k === 'glue') b += `<rect y="0" width="${W}" height="${h}" fill="${dir === 'bazaar' ? BZ.saffron : RY.emerald}"/>`;
    else {
      const a = art[k]; defs += a.defs;
      const tr = k === 'back' ? `translate(${W} ${f(y + h)}) rotate(180)` : `translate(0 ${f(y)})`;
      b += `<g transform="${tr}">${a.body}</g>`;
    }
    y += h;
  }
  return { W, H, defs, body: b, ys, parts };
}

/* ═════════════ BOX-LUNCH CARTON WITH HANDLE ═════════════ */
export const CARTON = { L: 203, D: 140, Hb: 89, rise: 50, handle: 50 };
export function cartonSide(dir) {
  const W = CARTON.L, H = CARTON.Hb; let b = '', defs = '';
  if (dir === 'bazaar') {
    const c = BZ;
    defs += patternDef('patterns/bazaar/04-truck-art-rangoli-fresh.svg', 'pRan', { size: 46 });
    b += `<rect width="${W}" height="${H}" fill="url(#pRan)"/>`;
    // chevron frame
    b += `<rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="6" fill="${c.marigold}" stroke="${c.ink}" stroke-width="1.2"/>`;
    b += placeC('logo/bazaar/emblem.svg', 38, H / 2, { h: 50 });
    b += stickerText(122, 40, 'BOX LUNCH', { size: 17, fill: c.cream, shadow: c.rani, stroke: c.ink, sw: 1.6, dx: 1.2, dy: 1.3 });
    b += T(122, 53, 'CURRY DISTRICT', { font: FONT.dm(700), size: 5, fill: c.ink, ls: 1.6 });
    b += T(122, 67, 'Grab it by the handle.', { font: FONT.caveat(700), size: 8.6, fill: c.rani });
  } else {
    const c = RY;
    defs += patternDef('patterns/royal/04-marigold-damask-emerald.svg', 'pDamC', { size: 56, x: 6 }) + foilDef('cFoil', 0, 0, 1, 1);
    b += `<rect width="${W}" height="${H}" fill="url(#pDamC)"/><rect width="${W}" height="${H}" fill="${c.emerald}" opacity=".3"/>`;
    b += `<path d="${archPath(W / 2, H - 7, 116, 76)}" fill="${c.ink}" stroke="url(#cFoil)" stroke-width="1.2"/>`;
    b += `<path d="${archPath(W / 2, H - 10, 108, 70)}" fill="none" stroke="${c.gold}" stroke-width=".35"/>`;
    b += placeC('logo/royal/emblem.svg', W / 2, 30, { h: 20 });
    b += T(W / 2, 55, 'Box Lunch', { font: FONT.fr(600, true), size: 13.5, fill: c.goldLt });
    b += T(W / 2, 64.5, 'A LUNCH WORTH CARRYING', { font: FONT.hk(600), size: 3.3, fill: c.ivory, ls: 1.2 });
    b += T(W / 2, 73, 'Curry District', { font: FONT.fr(500, true), size: 4.6, fill: c.gold });
  }
  return { W, H, defs, body: b };
}
export function cartonEnd(dir, fill) { // end face: D wide × (Hb + rise) tall, gable on top
  const W = CARTON.D, H = CARTON.Hb + CARTON.rise, g = CARTON.rise; let b = '', defs = '';
  const bz = dir === 'bazaar', c = bz ? BZ : RY, pen = bz ? PEN : PEN_R;
  if (bz) { defs += patternDef('patterns/bazaar/04-truck-art-rangoli-fresh.svg', 'pRanE', { size: 46 }); b += `<rect width="${W}" height="${H}" fill="url(#pRanE)"/>`; }
  else { defs += patternDef('patterns/royal/04-marigold-damask-emerald.svg', 'pDamE', { size: 56 }); b += `<rect width="${W}" height="${H}" fill="url(#pDamE)"/><rect width="${W}" height="${H}" fill="${c.emerald}" opacity=".3"/>`; }
  const cx = 12, cy = g + 8, cw = W - 24, ch = CARTON.Hb - 16;
  b += bz ? `<rect x="${cx + 1.2}" y="${cy + 1.2}" width="${cw}" height="${ch}" rx="4" fill="${c.ink}"/><rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="4" fill="${c.cream}" stroke="${c.ink}" stroke-width=".9"/>`
    : `<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="4" fill="${c.ivory}"/><rect x="${cx + 2}" y="${cy + 2}" width="${cw - 4}" height="${ch - 4}" rx="2.6" fill="none" stroke="${c.goldDk}" stroke-width=".35"/>`;
  const lab = (x, y, t) => T(x, y, bz ? t.toUpperCase() : t, bz ? { font: FONT.dm(700), size: 3.6, fill: BZ.muted, anchor: 'start', ls: .5 } : { font: FONT.fr(500, true), size: 4.4, fill: RY.muted, anchor: 'start' });
  const ln = y => `<path d="M${cx + 22} ${y}H${cx + cw - 7}" stroke="${bz ? c.ink : c.goldDk}" stroke-width=".45"/>`;
  b += lab(cx + 7, cy + 14, 'For') + ln(cy + 15);
  if (fill?.for) b += T(cx + 24, cy + 13.2, fill.for, { font: FONT.caveat(700), size: 8.4, fill: pen, anchor: 'start' });
  b += lab(cx + 7, cy + 27, 'Dish') + ln(cy + 28);
  if (fill?.dish) b += T(cx + 24, cy + 26.2, fill.dish, { font: FONT.caveat(700), size: 8.4, fill: pen, anchor: 'start' });
  [['veg', bz ? 'VEG' : 'Veg'], ['nonveg', bz ? 'NON-VEG' : 'Non-veg']].forEach(([k, l], i) => {
    const xx = cx + 7 + i * 30;
    b += box(xx, cy + 36, 4.6, bz ? c.ink : c.goldDk, .5) + place(ICON(dir, k + '-mark', 'ivory'), { x: xx + 6, y: cy + 35, w: 6.6, h: 6.6 }) + T(xx + 14, cy + 39.8, l, { font: bz ? FONT.dm(700) : FONT.hk(600), size: 3.2, fill: c.ink, anchor: 'start' });
    if (fill?.diet === k) b += tickMark(xx, cy + 36.3, 4.6, pen);
  });
  for (let k = 0; k < 5; k++) { const x = cx + 13 + k * 20; b += placeC(ICON(dir, `chili-${k + 1}`, 'ivory'), x, cy + 52, { h: 9.5 }); if (fill?.spice === k + 1) b += scrib(x, cy + 52, 6, pen); }
  b += T(W / 2, cy + ch - 3.5, bz ? 'CURRY DISTRICT · BOX LUNCH' : 'Curry District · Box lunch', { font: bz ? FONT.dm(700) : FONT.hk(600), size: 2.8, fill: bz ? BZ.muted : RY.goldDk, ls: .5 });
  return { W, H, defs, body: b };
}
export function cartonRoof(dir) {
  const W = CARTON.L, H = Math.hypot(CARTON.D / 2, CARTON.rise); let b = '', defs = '';
  if (dir === 'bazaar') {
    const c = BZ;
    defs += patternDef('patterns/bazaar/03-block-print-booti-sunset.svg', 'pBooR', { size: 40 });
    b += `<rect width="${W}" height="${H}" fill="url(#pBooR)"/>`;
    b += `<rect x="0" y="${f(H - 16)}" width="${W}" height="16" fill="${c.rani}"/>` + `<rect x="0" y="${f(H - 16)}" width="${W}" height="1.2" fill="${c.ink}"/>`;
    b += T(W / 2, H - 5.2, 'PARTY AT YOURS? WE’LL BRING THE BIRYANI.', { font: FONT.bowlby, size: 5, fill: c.cream, ls: .3 });
  } else {
    const c = RY;
    defs += patternDef('patterns/royal/01-jali-lattice-midnight.svg', 'pJalR', { size: 40 }) + foilDef('rFoil', 0, 0, 1, 0);
    b += `<rect width="${W}" height="${H}" fill="url(#pJalR)"/>`;
    b += `<rect x="0" y="${f(H - 14)}" width="${W}" height="14" fill="${c.ink}"/><rect x="0" y="${f(H - 14)}" width="${W}" height=".8" fill="url(#rFoil)"/>`;
    b += T(W / 2, H - 4.6, 'Celebrations, catered.', { font: FONT.fr(500, true), size: 6, fill: c.goldLt });
  }
  return { W, H, defs, body: b };
}
export function cartonHandle(dir) {
  const W = CARTON.L, H = CARTON.handle; let b = '';
  if (dir === 'bazaar') {
    const c = BZ;
    b += `<rect width="${W}" height="${H}" fill="${c.marigold}"/>`;
    for (let i = 0; i < 26; i++) b += `<path d="M${f(i * W / 26)} ${H}l${f(W / 52)} -5l${f(W / 52)} 5Z" fill="${[c.rani, c.peacock, c.saffron][i % 3]}"/>`;
    b += T(40, 18, 'CURRY', { font: FONT.bowlby, size: 8, fill: c.ink }) + T(W - 40, 18, 'DISTRICT', { font: FONT.bowlby, size: 8, fill: c.ink });
  } else {
    const c = RY;
    b += `<defs>${foilDef('hFoil', 0, 0, 1, 0)}</defs><rect width="${W}" height="${H}" fill="${c.ink}"/><rect y="${H - 2}" width="${W}" height=".8" fill="url(#hFoil)"/>`;
    b += T(40, 18, 'Curry', { font: FONT.fr(600, true), size: 9, fill: c.goldLt }) + T(W - 40, 18, 'District', { font: FONT.fr(600, true), size: 9, fill: c.goldLt });
  }
  return { W, H, defs: '', body: b };
}

/* ═════════════ TRAY TENT CARD (A-frame, face 5 × 3.5 in) ═════════════ */
export const TENT = { W: 127, H: 88.9 };
export function tentFront(dir, zoneId, fill) {
  const { W, H } = TENT, z = ZONES[zoneId], col = ZONE_COLOURS[dir][zoneId]; let b = '', defs = '';
  const bz = dir === 'bazaar', c = bz ? BZ : RY, pen = bz ? PEN : PEN_R;
  if (bz) {
    b += `<rect width="${W}" height="${H}" fill="${c.cream}"/><rect width="${W}" height="25" fill="${col}"/>`;
    b += `<path d="${scallopBand(0, W, 0, 25, 22, 1.2)}" fill="${col}"/>`;
    b += `<circle cx="16" cy="13" r="9.5" fill="${c.cream}" stroke="${c.ink}" stroke-width=".8"/>` + placeC(ICON(dir, ZONE_ICON[zoneId]), 16, 13, { h: 13 });
    b += stickerText(W / 2 + 8, 17, z.name.toUpperCase(), { size: Math.min(9, 92 / (z.name.length * .74)), fill: c.cream, shadow: c.ink, stroke: c.ink, sw: .9, dx: .6, dy: .7 });
    b += `<path d="M10 52H${W - 10}" stroke="${c.ink}" stroke-width=".5"/>`;
    b += T(10, 36, 'TODAY’S DISH', { font: FONT.dm(700), size: 3.2, fill: c.muted, anchor: 'start', ls: .6 });
    if (fill?.dish) b += T(W / 2, 49.6, fill.dish, { font: FONT.caveat(700), size: 13, fill: pen });
  } else {
    defs += foilDef('tFoil' + zoneId, 0, 0, 1, 1);
    b += `<rect width="${W}" height="${H}" fill="${c.ivory}"/><rect width="${W}" height="24" fill="${col}"/><rect y="24" width="${W}" height=".8" fill="url(#tFoil${zoneId})"/>`;
    for (let i = 0; i < 14; i++) b += `<path d="${archPath(4.5 + i * 9, 24, 6, 8)}" fill="${c.ink}" opacity=".16"/>`;
    b += T(W / 2, 15.5, z.name, { font: FONT.fr(600), size: 9.4, fill: zoneId === 'sweets' ? c.ink : c.ivory });
    b += `<rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="2" fill="none" stroke="${c.goldDk}" stroke-width=".3"/>`;
    b += T(W / 2, 35, 'Today’s dish', { font: FONT.fr(500, true), size: 4.4, fill: c.muted });
    b += `<path d="M14 52H${W - 14}" stroke="${c.goldDk}" stroke-width=".4"/>` + diamond(W / 2, 52, 1.2, c.gold);
    if (fill?.dish) b += T(W / 2, 49.4, fill.dish, { font: FONT.caveat(700), size: 12.5, fill: pen });
  }
  // diet + spice + serves row
  [['veg', bz ? 'VEG' : 'Veg'], ['nonveg', bz ? 'NON-VEG' : 'Non-veg']].forEach(([k, l], i) => {
    const xx = 10 + i * 29;
    b += box(xx, 59.5, 4.4, bz ? c.ink : c.goldDk, .5) + place(ICON(dir, k + '-mark', 'ivory'), { x: xx + 5.8, y: 58.5, w: 6.4, h: 6.4 }) + T(xx + 13.4, 63.6, l, { font: bz ? FONT.dm(700) : FONT.hk(600), size: 3, fill: c.ink, anchor: 'start' });
    if (fill?.diet === k) b += tickMark(xx, 59.8, 4.4, pen);
  });
  b += T(72, 63.6, bz ? 'SERVES' : 'Serves', bz ? { font: FONT.dm(700), size: 3, fill: BZ.muted, anchor: 'start', ls: .4 } : { font: FONT.fr(500, true), size: 3.8, fill: RY.muted, anchor: 'start' });
  b += `<path d="M86 64.4H${W - 10}" stroke="${bz ? c.ink : c.goldDk}" stroke-width=".45"/>`;
  if (fill?.serves) b += T(98, 62.6, fill.serves, { font: FONT.caveat(700), size: 7.6, fill: pen });
  for (let k = 0; k < 5; k++) { const x = 18 + k * 22.5; b += placeC(ICON(dir, `chili-${k + 1}`, 'ivory'), x, 76.5, { h: 9.5 }); if (fill?.spice === k + 1) b += scrib(x, 76.5, 6, pen); }
  if (bz) b += `<rect x=".4" y=".4" width="${W - .8}" height="${H - .8}" fill="none" stroke="${c.ink}" stroke-width=".8"/>`;
  return { W, H, defs, body: b };
}
export function tentBack(dir) {
  const { W, H } = TENT; let b = '', defs = '';
  if (dir === 'bazaar') {
    const c = BZ;
    defs += patternDef('patterns/bazaar/01-marigold-garland-night.svg', 'pGarN', { size: 40, y: -4 });
    b += `<rect width="${W}" height="${H}" fill="url(#pGarN)"/>`;
    b += `<rect x="12" y="16" width="${W - 24}" height="${H - 32}" rx="6" fill="${c.cream}" stroke="${c.ink}" stroke-width=".9"/>`;
    b += placeC('logo/bazaar/wordmark-horizontal.svg', W / 2, 33, { w: 74 });
    b += T(W / 2, 57, 'Party at yours? We’ll bring the biryani.', { font: FONT.caveat(700), size: 6.6, fill: c.rani });
    b += T(W / 2, 66, 'CATERING · LITTLE ELM, TX', { font: FONT.dm(700), size: 2.8, fill: c.muted, ls: .8 });
  } else {
    const c = RY;
    defs += patternDef('patterns/royal/01-jali-lattice-midnight.svg', 'pJalT', { size: 38 }) + foilDef('tbFoil', 0, 0, 1, 1);
    b += `<rect width="${W}" height="${H}" fill="url(#pJalT)"/>`;
    b += `<path d="${archPath(W / 2, H - 9, 86, 72)}" fill="${c.ink}" stroke="url(#tbFoil)" stroke-width=".9"/>`;
    b += placeC('logo/royal/emblem.svg', W / 2, 30, { h: 22 });
    b += placeC('logo/royal/wordmark-text-only.svg', W / 2, 52, { w: 50 });
    b += T(W / 2, 70, 'Celebrations, catered.', { font: FONT.fr(500, true), size: 4.6, fill: c.goldLt });
  }
  return { W, H, defs, body: b };
}

/* ═════════════ VAN MAGNET · 24 × 12 in ═════════════ */
export const MAGNET = { W: 609.6, H: 304.8 };
export function vanMagnet(dir) {
  const { W, H } = MAGNET; let b = '', defs = '';
  if (dir === 'bazaar') {
    const c = BZ;
    defs += `<clipPath id="mgClip"><rect width="${W}" height="${H}" rx="25"/></clipPath>` + patternDef('patterns/bazaar/04-truck-art-rangoli-night.svg', 'pRanN', { size: 92 });
    b += `<g clip-path="url(#mgClip)"><rect width="${W}" height="${H}" fill="${c.marigold}"/>`;
    // truck-art chevron border
    b += `<rect width="${W}" height="${H}" fill="${c.ink}"/><rect x="12" y="12" width="${W - 24}" height="${H - 24}" rx="16" fill="${c.marigold}"/>`;
    const n = 40;
    for (let i = 0; i < n; i++) { const x = 12 + i * (W - 24) / n, w = (W - 24) / n, col = [c.rani, c.peacock, c.saffron, c.cilantro][i % 4]; b += `<path d="M${f(x)} 12l${f(w / 2)} 12l${f(w / 2)} -12Z" fill="${col}"/><path d="M${f(x)} ${H - 12}l${f(w / 2)} -12l${f(w / 2)} 12Z" fill="${col}"/>`; }
    // left: emblem medallion on rangoli night
    b += `<circle cx="150" cy="${H / 2}" r="112" fill="${c.ink}"/><circle cx="150" cy="${H / 2}" r="104" fill="url(#pRanN)"/><circle cx="150" cy="${H / 2}" r="84" fill="${c.cream}" stroke="${c.ink}" stroke-width="5"/>`;
    b += placeC('logo/bazaar/wordmark-stacked.svg', 150, H / 2 + 2, { h: 140 });
    // right copy
    const rx = 425;
    b += `<g transform="rotate(-3 ${rx} 70)"><rect x="${rx - 74 + 4}" y="${50 + 4}" width="148" height="34" rx="17" fill="${c.ink}"/><rect x="${rx - 74}" y="50" width="148" height="34" rx="17" fill="${c.rani}" stroke="${c.ink}" stroke-width="3"/>` + T(rx, 75, 'CATERING', { font: FONT.bowlby, size: 21, fill: c.cream, ls: 2 }) + `</g>`;
    b += stickerText(rx, 148, 'BIRYANI', { size: 54, fill: c.cream, shadow: c.ink, stroke: c.ink, sw: 5.5, dx: 4.5, dy: 5 });
    b += stickerText(rx, 202, 'ON BOARD!', { size: 44, fill: c.saffron, shadow: c.ink, stroke: c.ink, sw: 5, dx: 4, dy: 4.5 });
    b += T(rx, 236, 'Party trays · Lunchboxes · Celebrations', { font: FONT.dm(700), size: 14.5, fill: c.ink });
    b += T(rx, 262, 'currydistrict.net · Little Elm, TX', { font: FONT.caveat(700), size: 19, fill: c.rani });
    b += `</g><rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="24" fill="none" stroke="${c.ink}" stroke-width="3"/>`;
  } else {
    const c = RY;
    defs += `<clipPath id="mgClip"><rect width="${W}" height="${H}" rx="25"/></clipPath>` + foilDef('mFoil', 0, 0, 1, 1) + foilDef('mFoilH', 0, 0, 1, 0) + patternDef('patterns/royal/01-jali-lattice-midnight.svg', 'pJalM', { size: 70 });
    b += `<g clip-path="url(#mgClip)"><rect width="${W}" height="${H}" fill="${c.ink}"/>`;
    b += `<rect width="${W}" height="${H}" fill="url(#pJalM)" opacity=".55"/>`;
    b += `<rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="14" fill="none" stroke="url(#mFoil)" stroke-width="3"/><rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="10" fill="none" stroke="${c.gold}" stroke-width="1"/>`;
    // arch window with emblem
    b += `<path d="${archPath(150, H - 40, 190, 228)}" fill="${c.emerald}" stroke="url(#mFoil)" stroke-width="3"/>`;
    b += `<path d="${archPath(150, H - 50, 172, 210)}" fill="none" stroke="${c.gold}" stroke-width="1"/>`;
    b += placeC('logo/royal/emblem.svg', 150, H / 2 + 8, { h: 150 });
    const rx = 420;
    b += T(rx, 82, 'CATERING  ·  CELEBRATIONS', { font: FONT.hk(600), size: 13, fill: c.gold, ls: 4 });
    b += placeC('logo/royal/wordmark-text-only.svg', rx, 140, { w: 270 });
    b += T(rx, 214, 'Celebrations, catered.', { font: FONT.fr(500, true), size: 30, fill: c.ivory });
    b += `<path d="M${rx - 110} 232H${rx + 110}" stroke="url(#mFoilH)" stroke-width="1.6"/>` + diamond(rx, 232, 4, c.gold);
    b += T(rx, 258, 'currydistrict.net · Little Elm, TX', { font: FONT.hk(600), size: 15, fill: c.goldLt, ls: 1 });
    b += `</g>`;
  }
  return { W, H, defs, body: b };
}

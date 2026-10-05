// Lassi cup band + straw flag, sauce-cup lid stickers — both directions. Units: mm.
import { BZ, RY, FONT, T, f, esc, place, placeC, patternDef, stickerText, foilDef, frustum, scallopBand, scallopCircle } from './lib.mjs';
import { archPath, diamond, marigold, leaf } from './art-chai.mjs';

/* 16 oz clear PET cup */
export const LASSI = { Rtop: 49, Rbot: 30, h: 120 };
export const BAND_T = [0.3, 0.78];
export const BAND = (() => { const R = t => LASSI.Rtop + (LASSI.Rbot - LASSI.Rtop) * t; return { Rtop: R(BAND_T[0]) + .4, Rbot: R(BAND_T[1]) + .4, h: LASSI.h * (BAND_T[1] - BAND_T[0]) }; })();
export const BANDG = frustum(BAND);

export function mango(cx, cy, s, { stroke = BZ.ink, sw = .6, body = BZ.marigold, blush = BZ.saffron, leafC = BZ.cilantro } = {}) {
  // s = overall length
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(-18) scale(${f(s / 40)})">
  <path d="M-2 -17C10 -19 19 -8 18 4C17 16 6 21 -4 19C-15 17 -20 7 -19 -3C-18 -12 -10 -16 -2 -17Z" fill="${body}" stroke="${stroke}" stroke-width="${f(sw * 40 / s)}"/>
  <path d="M-4 15C-12 13 -16 6 -15 -1C-11 6 -7 11 -4 15Z" fill="${blush}" opacity=".9"/>
  <path d="M8 -9C11 -6 12 -2 12 1" stroke="#fff" stroke-width="${f(1.6 * 40 / s / 2)}" stroke-linecap="round" fill="none" opacity=".7"/>
  <path d="M-1 -17C0 -21 2 -24 5 -25" stroke="${stroke}" stroke-width="${f(1.2 * 40 / s / 2)}" fill="none" stroke-linecap="round"/>
  <path d="M3 -23C9 -30 19 -29 23 -25C17 -20 9 -20 3 -23Z" fill="${leafC}" stroke="${stroke}" stroke-width="${f(sw * 40 / s)}" stroke-linejoin="round"/></g>`;
}
function tick(x, y, s, col, sw) { return `<rect x="${f(x)}" y="${f(y)}" width="${f(s)}" height="${f(s)}" rx="${f(s * .18)}" fill="none" stroke="${col}" stroke-width="${f(sw)}"/>`; }

export function lassiBand(dir) {
  const W = BANDG.W, H = BANDG.H, mid = W / 2;
  if (dir === 'bazaar') {
    const c = BZ; let b = '';
    const defs = patternDef('patterns/bazaar/06-spice-confetti-fresh.svg', 'pConf', { size: 34 });
    b += `<rect width="${f(W)}" height="${f(H)}" fill="${c.peacock}"/>`;
    b += `<rect width="${f(W)}" height="${f(H)}" fill="url(#pConf)" opacity=".22"/>`;
    // scalloped marigold edges
    b += `<path d="${scallopBand(0, W, 0, 5, 44, 1.1)}" fill="${c.ink}"/><path d="${scallopBand(0, W, 0, 3.9, 44, 1.1)}" fill="${c.marigold}"/>`;
    b += `<g transform="translate(0 ${f(H)}) scale(1 -1)"><path d="${scallopBand(0, W, 0, 5, 44, 1.1)}" fill="${c.ink}"/><path d="${scallopBand(0, W, 0, 3.9, 44, 1.1)}" fill="${c.marigold}"/></g>`;
    // FRONT
    b += mango(mid - 30, H / 2 - 1, 22);
    b += stickerText(mid + 9, H / 2 - 4, 'MANGO', { size: 12.5, fill: c.marigold, shadow: c.rani, stroke: c.ink, sw: 1.3, dx: .9, dy: 1 });
    b += stickerText(mid + 9, H / 2 + 9, 'LASSI', { size: 12.5, fill: c.cream, shadow: c.rani, stroke: c.ink, sw: 1.3, dx: .9, dy: 1 });
    b += T(mid, H - 9.2, 'Your chilli-fire extinguisher.', { font: FONT.caveat(700), size: 6.2, fill: c.cream });
    // RIGHT: tick-a-flavour ticket
    const rx = mid + W / 3, tw = 50, th = 34;
    b += `<rect x="${f(rx - tw / 2 + 1.3)}" y="${f(H / 2 - th / 2 + 1.3)}" width="${tw}" height="${th}" rx="4" fill="${c.ink}"/><rect x="${f(rx - tw / 2)}" y="${f(H / 2 - th / 2)}" width="${tw}" height="${th}" rx="4" fill="${c.cream}" stroke="${c.ink}" stroke-width=".8"/>`;
    b += T(rx, H / 2 - th / 2 + 7.6, 'TICK ONE', { font: FONT.bowlby, size: 4.4, fill: c.rani, ls: .4 });
    [['MANGO', -7], ['SWEET', 3.4]].forEach(([w, dy], i) => { b += tick(rx - 17, H / 2 + dy - 3.6, 4.6, c.ink, .7) + T(rx - 10, H / 2 + dy + .2, w, { font: FONT.dm(700), size: 4.4, fill: c.ink, anchor: 'start', ls: .3 }); });
    b += T(rx, H / 2 + th / 2 - 4.4, 'Thandi. Creamy. Yours.', { font: FONT.caveat(700), size: 4.6, fill: c.muted });
    // LEFT: stacked wordmark
    const lx = mid - W / 3;
    b += `<rect x="${f(lx - 26 + 1.3)}" y="${f(H / 2 - 20 + 1.3)}" width="52" height="40" rx="9" fill="${c.ink}"/><rect x="${f(lx - 26)}" y="${f(H / 2 - 20)}" width="52" height="40" rx="9" fill="${c.cream}" stroke="${c.ink}" stroke-width=".8"/>`;
    b += placeC('logo/bazaar/wordmark-stacked.svg', lx, H / 2, { h: 33 });
    return { W, H, defs, body: b };
  }
  const c = RY; let b = '';
  const defs = patternDef('patterns/royal/05-peacock-eye-ivory.svg', 'pPea', { size: 22 }) + foilDef('foilL', 0, 0, 1, 0) + foilDef('foilL2', 0, 0, 1, 1);
  b += `<rect width="${f(W)}" height="${f(H)}" fill="${c.ivory}"/>`;
  // peacock-eye borders
  b += `<rect width="${f(W)}" height="9" fill="url(#pPea)"/><rect y="${f(H - 9)}" width="${f(W)}" height="9" fill="url(#pPea)"/>`;
  b += `<rect y="9" width="${f(W)}" height=".7" fill="url(#foilL)"/><rect y="${f(H - 9.7)}" width="${f(W)}" height=".7" fill="url(#foilL)"/>`;
  b += `<rect y="10.6" width="${f(W)}" height=".25" fill="${c.goldDk}"/><rect y="${f(H - 10.85)}" width="${f(W)}" height=".25" fill="${c.goldDk}"/>`;
  // FRONT
  b += `<path d="${archPath(mid, H - 13.5, 18, 22)}" fill="none" stroke="url(#foilL2)" stroke-width=".55" transform="translate(-40 0)"/>`;
  b += mango(mid - 40, H / 2 + 1.5, 13, { stroke: c.goldDk, sw: .45, body: c.gold, blush: c.ruby, leafC: c.emerald });
  b += T(mid + 8, H / 2 + 1.5, 'Mango Lassi', { font: FONT.fr(600, true), size: 10.5, fill: c.ruby });
  b += T(mid + 8, H / 2 + 9.5, 'GOLDEN · COOL · UNHURRIED', { font: FONT.hk(600), size: 2.9, fill: c.emerald, ls: .9 });
  b += `<rect x="${f(mid - 6)}" y="${f(H / 2 - 9.5)}" width="28" height=".3" fill="${c.goldDk}"/>` + diamond(mid + 8, H / 2 - 9.35, .9, c.gold);
  // RIGHT: tick a flavour
  const rx = mid + W / 3;
  b += T(rx, H / 2 - 6, 'Your lassi', { font: FONT.fr(500, true), size: 5.4, fill: c.ink });
  [['Mango', -4], ['Sweet', 8]].forEach(([w, dx]) => { b += tick(rx - 15 + dx * 1.6 + (dx < 0 ? 0 : 6), H / 2 - .5, 4, c.goldDk, .45) + T(rx - 9.8 + dx * 1.6 + (dx < 0 ? 0 : 6), H / 2 + 2.8, w, { font: FONT.hk(600), size: 3.4, fill: c.ink, anchor: 'start' }); });
  b += `<rect x="${f(rx - 16)}" y="${f(H / 2 + 7.6)}" width="32" height=".25" fill="${c.goldDk}"/>`;
  // LEFT: emerald wordmark
  b += placeC('logo/royal/colourways/wordmark-stacked--emerald.svg', mid - W / 3, H / 2, { h: 30 });
  return { W, H, defs, body: b };
}

/* straw flag: printed strip folded around the straw (front | back) */
export const FLAG = { w: 34, h: 20 };
export function strawFlag(dir) {
  const fw = FLAG.w, fh = FLAG.h, W = fw * 2 + 4, H = fh; let b = '';
  const notch = (x0, flip) => { // swallowtail flag outline, mast side at x0
    const s = flip ? -1 : 1, x1 = x0 + s * fw;
    return `M${f(x0)} 0L${f(x1)} 0L${f(x1 - s * 6)} ${f(fh / 2)}L${f(x1)} ${f(fh)}L${f(x0)} ${f(fh)}Z`;
  };
  const mid = W / 2;
  if (dir === 'bazaar') {
    const c = BZ;
    b += `<path d="${notch(mid + 2, false)}" fill="${c.rani}" stroke="${c.ink}" stroke-width=".7"/><path d="${notch(mid - 2, true)}" fill="${c.marigold}" stroke="${c.ink}" stroke-width=".7"/>`;
    b += `<rect x="${f(mid - 2)}" y="0" width="4" height="${fh}" fill="${c.cream}" stroke="${c.ink}" stroke-width=".5"/>`;
    b += stickerText(mid + 2 + fw / 2 - 2.5, fh / 2 + 2.3, 'THANDA!', { size: 6, fill: c.cream, shadow: c.ink, stroke: c.ink, sw: .7, dx: .45, dy: .5 });
    b += T(mid - 2 - fw / 2 + 2.5, fh / 2 - .6, 'CHAI &', { font: FONT.bowlby, size: 3.8, fill: c.ink, ls: .2 });
    b += T(mid - 2 - fw / 2 + 2.5, fh / 2 + 3.6, 'COOLERS', { font: FONT.bowlby, size: 3.8, fill: c.ink, ls: .2 });
  } else {
    const c = RY;
    b += `<defs>${foilDef('foilF', 0, 0, 1, 1)}</defs>`;
    b += `<path d="${notch(mid + 2, false)}" fill="${c.emerald}"/><path d="${notch(mid - 2, true)}" fill="${c.ink}"/>`;
    b += `<path d="${notch(mid + 2, false)}" fill="none" stroke="url(#foilF)" stroke-width=".5" transform="translate(${f((mid + 2) * .06)} ${f(fh * .06)}) scale(.94)"/>`;
    b += `<rect x="${f(mid - 2)}" y="0" width="4" height="${fh}" fill="url(#foilF)"/>`;
    b += T(mid + 2 + fw / 2 - 2.5, fh / 2 + 2, 'Sip slowly.', { font: FONT.fr(500, true), size: 5, fill: c.goldLt });
    b += placeC('logo/royal/emblem.svg', mid - 2 - fw / 2 + 2.5, fh / 2, { h: 13 });
  }
  return { W, H, defs: '', body: b };
}

/* ───────────── sauce / chutney cups ───────────── */
export const SAUCES = ['mint', 'tamarind', 'raita', 'gravy', 'blank'];
const SNAME = { mint: 'MINT', tamarind: 'TAMARIND', raita: 'RAITA', gravy: 'EXTRA GRAVY', blank: '' };
const SNAME_R = { mint: 'Mint', tamarind: 'Tamarind', raita: 'Raita', gravy: 'Extra gravy', blank: '' };
export const SAUCE_COL = {
  bazaar: { mint: [BZ.cilantro, BZ.cream], tamarind: [BZ.chili, BZ.cream], raita: [BZ.cream, BZ.ink], gravy: [BZ.saffron, BZ.cream], blank: [BZ.marigold, BZ.ink] },
  royal: { mint: [RY.emerald, RY.goldLt], tamarind: [RY.ruby, RY.goldLt], raita: [RY.ivory, RY.ink], gravy: [RY.gold, RY.ink], blank: [RY.plum, RY.goldLt] },
};
export const SAUCE_FILL = { mint: 0x4E8F3A, tamarind: 0x5A2414, raita: 0xF2EEDF, gravy: 0xC8501E, blank: 0xB8862A };
function glyph(kind, cx, cy, s, ink, accent) {
  switch (kind) {
    case 'mint': return leaf(cx - s * .05, cy + s * .25, s * .7, -60, accent, ink, s * .05) + leaf(cx + s * .05, cy + s * .25, s * .7, -120, accent, ink, s * .05) + leaf(cx, cy + s * .3, s * .75, -90, accent, ink, s * .05);
    case 'tamarind': return `<path d="M${f(cx - s * .45)} ${f(cy + s * .2)}C${f(cx - s * .3)} ${f(cy - s * .35)} ${f(cx + s * .25)} ${f(cy - s * .45)} ${f(cx + s * .48)} ${f(cy - s * .15)}C${f(cx + s * .5)} ${f(cy - s * .02)} ${f(cx + s * .35)} ${f(cy + .02)} ${f(cx + s * .22)} ${f(cy - s * .04)}C${f(cx)} ${f(cy - s * .12)} ${f(cx - s * .22)} ${f(cy + s * .05)} ${f(cx - s * .3)} ${f(cy + s * .32)}Z" fill="${accent}" stroke="${ink}" stroke-width="${f(s * .05)}" stroke-linejoin="round"/>` + [-.18, .04, .24].map(k => `<circle cx="${f(cx + k * s)}" cy="${f(cy - s * .12 - k * s * .2)}" r="${f(s * .05)}" fill="${ink}"/>`).join('');
    case 'raita': return `<path d="M${f(cx - s * .45)} ${f(cy - s * .05)}H${f(cx + s * .45)}C${f(cx + s * .42)} ${f(cy + s * .35)} ${f(cx + s * .2)} ${f(cy + s * .42)} ${f(cx)} ${f(cy + s * .42)}C${f(cx - s * .2)} ${f(cy + s * .42)} ${f(cx - s * .42)} ${f(cy + s * .35)} ${f(cx - s * .45)} ${f(cy - s * .05)}Z" fill="${accent}" stroke="${ink}" stroke-width="${f(s * .05)}"/><path d="M${f(cx - s * .25)} ${f(cy - s * .2)}c${f(s * .1)} ${f(-s * .12)} ${f(s * .25)} ${f(s * .1)} ${f(s * .35)} 0s${f(s * .2)} ${f(s * .1)} ${f(s * .2)} 0" fill="none" stroke="${ink}" stroke-width="${f(s * .05)}" stroke-linecap="round"/><circle cx="${f(cx - s * .1)}" cy="${f(cy + s * .12)}" r="${f(s * .06)}" fill="${ink}"/><circle cx="${f(cx + s * .14)}" cy="${f(cy + s * .16)}" r="${f(s * .06)}" fill="${ink}"/>`;
    case 'gravy': return `<path d="M${f(cx)} ${f(cy - s * .48)}C${f(cx + s * .12)} ${f(cy - s * .22)} ${f(cx + s * .36)} ${f(cy)} ${f(cx + s * .36)} ${f(cy + s * .17)}C${f(cx + s * .36)} ${f(cy + s * .38)} ${f(cx + s * .18)} ${f(cy + s * .5)} ${f(cx)} ${f(cy + s * .5)}C${f(cx - s * .18)} ${f(cy + s * .5)} ${f(cx - s * .36)} ${f(cy + s * .38)} ${f(cx - s * .36)} ${f(cy + s * .17)}C${f(cx - s * .36)} ${f(cy)} ${f(cx - s * .12)} ${f(cy - s * .22)} ${f(cx)} ${f(cy - s * .48)}Z" fill="${accent}" stroke="${ink}" stroke-width="${f(s * .05)}"/><path d="M${f(cx - s * .16)} ${f(cy + s * .12)}C${f(cx - s * .16)} ${f(cy + s * .26)} ${f(cx - s * .06)} ${f(cy + s * .33)} ${f(cx + s * .04)} ${f(cy + s * .35)}" stroke="#fff" stroke-width="${f(s * .06)}" fill="none" stroke-linecap="round" opacity=".7"/>`;
    default: return '';
  }
}
/** sticker art, square canvas D×D centred */
export function sauceSticker(dir, kind, D, { write } = {}) {
  const c = D / 2; let b = '';
  const [bgc, fg] = SAUCE_COL[dir][kind];
  if (dir === 'bazaar') {
    const ink = BZ.ink;
    b += `<path d="${scallopCircle(c, c, D * .455, 18, D * .012)}" fill="${ink}"/>`;
    b += `<circle cx="${c}" cy="${c}" r="${f(D * .43)}" fill="${bgc}"/>`;
    b += `<circle cx="${c}" cy="${c}" r="${f(D * .385)}" fill="none" stroke="${fg}" stroke-width="${f(D * .012)}" stroke-dasharray="${f(D * .02)} ${f(D * .025)}"/>`;
    const acc = { mint: BZ.cream, tamarind: '#7A2E1A', raita: BZ.peacock, gravy: BZ.marigold, blank: BZ.cream }[kind];
    if (kind === 'blank') {
      b += T(c, c - D * .12, 'DIP', { font: FONT.bowlby, size: D * .12, fill: ink, ls: D * .006 });
      b += `<path d="M${f(c - D * .28)} ${f(c + D * .1)}H${f(c + D * .28)}" stroke="${ink}" stroke-width="${f(D * .012)}"/>`;
      if (write) b += T(c, c + D * .07, write, { font: FONT.caveat(700), size: D * .15, fill: '#1F3A93' });
      b += T(c, c + D * .27, 'CURRY DISTRICT', { font: FONT.dm(700), size: D * .055, fill: ink, ls: D * .006 });
    } else {
      b += glyph(kind, c, c - D * .1, D * .3, ink, acc);
      const nm = SNAME[kind], sz = nm.length > 8 ? D * .085 : D * .115;
      b += T(c, c + D * .2, nm, { font: FONT.bowlby, size: sz, fill: fg, ls: D * .004, extra: kind === 'raita' ? '' : `stroke="${ink}" stroke-width="${f(D * .012)}" paint-order="stroke"` });
      b += T(c, c + D * .3, 'CURRY DISTRICT', { font: FONT.dm(700), size: D * .045, fill: fg, ls: D * .006 });
    }
  } else {
    const gold = 'url(#foilSt)';
    b += `<defs>${foilDef('foilSt', 0, 0, 1, 1)}</defs>`;
    b += `<circle cx="${c}" cy="${c}" r="${f(D * .45)}" fill="${gold}"/>`;
    b += `<circle cx="${c}" cy="${c}" r="${f(D * .43)}" fill="${bgc}"/>`;
    // rope ring of tiny diamonds
    for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2; b += diamond(c + Math.cos(a) * D * .395, c + Math.sin(a) * D * .395, D * .012, kind === 'raita' || kind === 'gravy' ? RY.goldDk : RY.gold); }
    b += `<circle cx="${c}" cy="${c}" r="${f(D * .36)}" fill="none" stroke="${kind === 'raita' ? RY.goldDk : RY.gold}" stroke-width="${f(D * .006)}"/>`;
    const ink = kind === 'raita' || kind === 'gravy' ? RY.ink : RY.goldLt;
    if (kind === 'blank') {
      b += T(c, c - D * .1, 'Chutney', { font: FONT.fr(500, true), size: D * .1, fill: ink });
      b += `<path d="M${f(c - D * .24)} ${f(c + D * .1)}H${f(c + D * .24)}" stroke="${RY.gold}" stroke-width="${f(D * .008)}"/>`;
      if (write) b += T(c, c + D * .07, write, { font: FONT.caveat(700), size: D * .14, fill: RY.goldLt });
      b += T(c, c + D * .23, 'CURRY DISTRICT', { font: FONT.hk(600), size: D * .045, fill: RY.gold, ls: D * .012 });
    } else {
      b += `<path d="${archPath(c, c + D * .05, D * .26, D * .3)}" fill="none" stroke="${kind === 'raita' || kind === 'gravy' ? RY.goldDk : RY.gold}" stroke-width="${f(D * .008)}"/>`;
      b += glyph(kind, c, c - D * .07, D * .2, kind === 'raita' || kind === 'gravy' ? RY.ink : RY.goldDk, { mint: '#3E8A5C', tamarind: '#6E2516', raita: RY.peacock, gravy: RY.ruby }[kind]);
      b += T(c, c + D * .16, SNAME_R[kind], { font: FONT.fr(600, true), size: SNAME_R[kind].length > 8 ? D * .085 : D * .105, fill: ink });
      b += T(c, c + D * .25, 'CURRY DISTRICT', { font: FONT.hk(600), size: D * .04, fill: kind === 'raita' || kind === 'gravy' ? RY.goldDk : RY.gold, ls: D * .012 });
    }
  }
  return { W: D, H: D, defs: '', body: b };
}

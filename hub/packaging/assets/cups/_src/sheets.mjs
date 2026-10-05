// Presentation boards + dieline sheet helpers (units: mm)
import { BZ, RY, FONT, T, f, esc, placeC, place, DISCLAIMER, sectorWarp, sectorPath, rad } from './lib.mjs';

export const dirName = d => d === 'bazaar' ? 'A · Bazaar' : 'B · Royal';

/** flat-artwork presentation board */
export function board({ w, h, dir, title, sub, body, defs = '', bg }) {
  const bz = dir === 'bazaar';
  const ink = bz ? BZ.ink : RY.ink, acc = bz ? BZ.saffron : RY.goldDk;
  let b = `<rect width="${f(w)}" height="${f(h)}" fill="${bg || (bz ? '#F4EEE2' : '#EFE9DF')}"/>`;
  b += T(16, 20, title, bz ? { font: FONT.bowlby, size: 9, fill: ink, anchor: 'start', ls: .2 } : { font: FONT.fr(600), size: 11, fill: ink, anchor: 'start' });
  b += T(16, 28.5, sub, { font: bz ? FONT.dm(500) : FONT.hk(500), size: 4.2, fill: bz ? BZ.muted : RY.muted, anchor: 'start' });
  b += `<rect x="${f(w - 16 - 44)}" y="11" width="44" height="12" rx="6" fill="${acc}"/>` + T(w - 16 - 22, 19.1, dirName(dir).toUpperCase(), { font: bz ? FONT.dm(700) : FONT.hk(700), size: 4.1, fill: bz ? BZ.ink : '#fff', ls: .5 });
  b += body;
  b += `<rect x="16" y="${f(h - 13)}" width="${f(w - 32)}" height=".3" fill="${ink}" opacity=".25"/>`;
  b += T(16, h - 7, 'Curry District · Drinks & Catering packaging concepts · flat artwork (vector, fonts embedded)', { font: FONT.dm(500), size: 3.2, fill: ink, anchor: 'start', extra: 'opacity=".7"' });
  b += T(w - 16, h - 7, DISCLAIMER, { font: FONT.dm(500), size: 3.2, fill: ink, anchor: 'end', extra: 'opacity=".7"' });
  return { b, defs };
}
export function caption(x, y, text, dir, anchor = 'start', size = 3.8) {
  return T(x, y, text, { font: dir === 'bazaar' ? FONT.dm(700) : FONT.hk(600), size, fill: dir === 'bazaar' ? BZ.ink : RY.ink, anchor, ls: .15 });
}
export function note(x, y, text, anchor = 'start', size = 3.2, fill = '#5b5b66') {
  return T(x, y, text, { font: FONT.dm(500), size, fill, anchor });
}

/* ── dieline vocabulary ── */
export const DL = { cut: '#111111', bleed: '#E5007E', safe: '#00A0E3', fold: '#2E9E4A', glue: '#8B8B8B' };
export const STROKES = {
  cut: `fill="none" stroke="${DL.cut}" stroke-width=".35"`,
  bleed: `fill="none" stroke="${DL.bleed}" stroke-width=".3" stroke-dasharray="2 1.2"`,
  safe: `fill="none" stroke="${DL.safe}" stroke-width=".3" stroke-dasharray="1 1"`,
  fold: `fill="none" stroke="${DL.fold}" stroke-width=".4" stroke-dasharray="3 1.5"`,
};
export function legend(x, y, extra = []) {
  const rows = [['cut', 'Cut / trim line'], ['bleed', 'Bleed 3 mm (0.125 in)'], ['safe', 'Safe zone 3 mm inside trim'], ['fold', 'Fold / score'], ...extra];
  let s = `<rect x="${f(x)}" y="${f(y)}" width="68" height="${f(10 + rows.length * 6.4)}" rx="2" fill="#fff" stroke="#c9c4ba" stroke-width=".3"/>`;
  s += T(x + 4, y + 6.4, 'DIELINE KEY', { font: FONT.dm(700), size: 3.3, fill: '#222', anchor: 'start', ls: .4 });
  rows.forEach(([k, label], i) => {
    const yy = y + 12 + i * 6.4;
    s += k === 'glue' ? `<rect x="${f(x + 4)}" y="${f(yy - 2.4)}" width="10" height="3.6" fill="url(#hatch)" stroke="${DL.glue}" stroke-width=".25"/>` : `<path d="M${f(x + 4)} ${f(yy - .6)}H${f(x + 14)}" ${STROKES[k]}/>`;
    s += T(x + 17, yy + .5, label, { font: FONT.dm(500), size: 3, fill: '#333', anchor: 'start' });
  });
  return s;
}
export const hatchDef = `<pattern id="hatch" patternUnits="userSpaceOnUse" width="2" height="2" patternTransform="rotate(45)"><rect width="2" height="2" fill="#f1f1f1"/><path d="M0 0V2" stroke="#b5b5b5" stroke-width=".5"/></pattern>`;
export function stamp(x, y, w = 92) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(-3)"><rect x="0" y="0" width="${f(w)}" height="13" rx="2" fill="none" stroke="${DL.bleed}" stroke-width=".8"/>` +
    T(w / 2, 6, 'INDICATIVE — CONFIRM WITH SUPPLIER', { font: FONT.dm(700), size: 3.6, fill: DL.bleed, ls: .3 }) +
    T(w / 2, 10.6, 'Request the converter’s own dieline PDF before print', { font: FONT.dm(500), size: 2.5, fill: DL.bleed }) + `</g>`;
}
export function dimH(x0, x1, y, label) {
  return `<path d="M${f(x0)} ${f(y)}H${f(x1)}M${f(x0)} ${f(y - 2)}V${f(y + 2)}M${f(x1)} ${f(y - 2)}V${f(y + 2)}" stroke="#555" stroke-width=".25" fill="none"/>` +
    `<rect x="${f((x0 + x1) / 2 - label.length * 0.95)}" y="${f(y - 2.4)}" width="${f(label.length * 1.9)}" height="4.8" fill="#fff"/>` + T((x0 + x1) / 2, y + 1.2, label, { font: FONT.dm(500), size: 3, fill: '#333' });
}
export function dimV(x, y0, y1, label) {
  return `<path d="M${f(x)} ${f(y0)}V${f(y1)}M${f(x - 2)} ${f(y0)}H${f(x + 2)}M${f(x - 2)} ${f(y1)}H${f(x + 2)}" stroke="#555" stroke-width=".25" fill="none"/>` +
    `<g transform="translate(${f(x)} ${f((y0 + y1) / 2)}) rotate(-90)"><rect x="${f(-label.length * 0.95)}" y="-2.4" width="${f(label.length * 1.9)}" height="4.8" fill="#fff"/>` + T(0, 1.2, label, { font: FONT.dm(500), size: 3, fill: '#333' }) + `</g>`;
}

/** sector art: returns {defs, body, bbox:{w,h}} with apex placement so bbox top-left at (x,y) */
export function sectorArt({ id, art, g, x, y, N = 180, bleed = 0, baseFill }) {
  const { L1, L2, Phi } = g;
  const half = Phi / 2;
  const w = 2 * L1 * Math.sin(half), h = L1 - L2 * Math.cos(half);
  const cx = x + w / 2, cy = y + L1;
  const warp = sectorWarp({ artId: id, W: art.W, H: art.H, L1, L2, Phi, N, cx, cy });
  const a0 = -half * 180 / Math.PI, a1 = half * 180 / Math.PI;
  const trim = sectorPath(cx, cy, L2, L1, a0, a1);
  let defs = `<g id="${id}"><defs>${art.defs}</defs>${art.body}</g>` + warp.defs + `<clipPath id="${id}trim"><path d="${trim}"/></clipPath>`;
  let body = '';
  if (bleed) {
    const db = bleed / L2 * 180 / Math.PI;
    body += `<path d="${sectorPath(cx, cy, L2 - bleed, L1 + bleed, a0 - db, a1 + db)}" fill="${baseFill || '#ddd'}"/>`;
  }
  body += `<g clip-path="url(#${id}trim)">${warp.body}</g>`;
  return { defs, body, w, h, cx, cy, trim, a0, a1, L1, L2 };
}

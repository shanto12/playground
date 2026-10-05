// 02 · Chili & Lime — tossed chilies, citrus wedges & wheels, cardamom pods, curry-leaf sprigs, mustard seeds
'use strict';
const { C, f, rng, relax2, worldCircles, bestSpot, leaf, spline, latticeScatter } = require('./lib');

const CW = {
  sunset: { bg: C.cream, line: C.ink, chilis: [C.chili, C.rani, C.saff], cap: C.cil, hi: C.cream,
    wedges: [[C.saff, C.mari], [C.rani, C.mari]], wheel: [C.mari, C.saff], pith: C.white, pod: C.mari, sprig: C.rani, stem: C.ink, seed: [C.ink, C.rani] },
  night: { bg: C.ink, line: C.ink, chilis: [C.chili, C.rani, C.saff], cap: C.cil, hi: C.cream,
    wedges: [[C.cil, C.mari], [C.saff, C.mari]], wheel: [C.mari, C.saff], pith: C.cream, pod: C.cil, sprig: C.pea, stem: C.pea, seed: [C.cream, C.mari] },
  fresh: { bg: C.cream, line: C.ink, chilis: [C.cil, C.cil, C.chili], cap: C.pea, hi: C.cream,
    wedges: [[C.cil, C.cil], [C.pea, C.mari]], wheel: [C.mari, C.mari], pith: C.white, pod: C.pea, sprig: C.cil, stem: C.ink, seed: [C.ink, C.pea] },
};

// ---- chili geometry (origin at the pod's middle) ----
const P0 = [0, 0], P1 = [16, 25], P2 = [3, 54];
const q = (t) => [(1 - t) ** 2 * P0[0] + 2 * (1 - t) * t * P1[0] + t * t * P2[0], (1 - t) ** 2 * P0[1] + 2 * (1 - t) * t * P1[1] + t * t * P2[1]];
const dq = (t) => [2 * (1 - t) * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]), 2 * (1 - t) * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1])];
const w = (t) => 7.2 * Math.pow(1 - t, 0.8) * (0.8 + 0.2 * Math.min(1, t / 0.15));
const CEN = q(0.42);
function chiliDef(body, cap, line, hi) {
  const L = [], R = [], H = [];
  for (let i = 0; i < 14; i++) {
    const t = i / 14, p = q(t), d = dq(t), m = Math.hypot(d[0], d[1]), n = [-d[1] / m, d[0] / m];
    L.push([p[0] + n[0] * w(t), p[1] + n[1] * w(t)]); R.push([p[0] - n[0] * w(t), p[1] - n[1] * w(t)]);
    if (t >= 0.12 && t <= 0.5) H.push([p[0] - n[0] * w(t) * 0.45, p[1] - n[1] * w(t) * 0.45]);
  }
  const d1 = dq(1), m1 = Math.hypot(d1[0], d1[1]), tip = [P2[0] + d1[0] / m1 * 1.5 - 1.5, P2[1] + d1[1] / m1 * 1.5];
  const d0 = dq(0), m0 = Math.hypot(d0[0], d0[1]), top = [-d0[0] / m0 * 2.2, -d0[1] / m0 * 2.2];
  const outline = spline([top, ...L, tip, ...R.reverse()], true, 0.45);
  const ang = Math.atan2(d0[1], d0[0]) * 180 / Math.PI - 90;
  return `<g transform="translate(${f(-CEN[0])} ${f(-CEN[1])})">` +
    `<path d="${outline}" fill="${body}" stroke="${line}" stroke-width="2" stroke-linejoin="round"/>` +
    `<path d="${spline(H, false)}" fill="none" stroke="${hi}" stroke-width="1.9" stroke-linecap="round" opacity=".85"/>` +
    `<g transform="rotate(${f(ang)})">` +
    `<path d="M0 -3C0 -10 3 -13.5 8 -15" fill="none" stroke="${line}" stroke-width="5" stroke-linecap="round"/>` +
    `<path d="M0 -3C0 -10 3 -13.5 8 -15" fill="none" stroke="${cap}" stroke-width="2.2" stroke-linecap="round"/>` +
    `<path d="M-7.8 1Q0 -7 7.8 1L6.4 5.2L3.9 3L1.3 6.2L-1.3 3.2L-3.9 6L-6.3 3Z" fill="${cap}" stroke="${line}" stroke-width="1.7" stroke-linejoin="round"/>` +
    `</g></g>`;
}
const chiliCircles = () => [0.03, 0.3, 0.58, 0.83].map((t, i) => { const p = q(t); return [p[0] - CEN[0], p[1] - CEN[1], [8.5, 7.6, 6.2, 4.2][i]]; })
  .concat([[2 - CEN[0], -10 - CEN[1], 5]]);

function wedgeDef(rind, flesh, pith, line) {
  let sep = '';
  for (const a of [36, 72, 108, 144]) { const r = a * Math.PI / 180; sep += `M0 0L${f(11 * Math.cos(r))} ${f(11 * Math.sin(r))}`; }
  return `<g transform="translate(0 -7)">` +
    `<path d="M-15.5 0A15.5 15.5 0 0 0 15.5 0Z" fill="${rind}" stroke="${line}" stroke-width="2" stroke-linejoin="round"/>` +
    `<path d="M-12.6 0A12.6 12.6 0 0 0 12.6 0Z" fill="${pith}"/>` +
    `<path d="M-11 0A11 11 0 0 0 11 0Z" fill="${flesh}"/>` +
    `<path d="${sep}" stroke="${pith}" stroke-width="1.7" stroke-linecap="round"/>` +
    `<path d="M-15.5 0H15.5" stroke="${line}" stroke-width="2" stroke-linecap="round"/><circle cy="1.6" r="1.5" fill="${pith}"/></g>`;
}
function wheelDef(rind, flesh, pith, line) {
  let sep = '';
  for (let i = 0; i < 9; i++) { const r = (i * 40 + 10) * Math.PI / 180; sep += `M0 0L${f(10.4 * Math.cos(r))} ${f(10.4 * Math.sin(r))}`; }
  return `<circle r="14.6" fill="${rind}" stroke="${line}" stroke-width="2"/><circle r="11.9" fill="${pith}"/><circle r="10.4" fill="${flesh}"/>` +
    `<path d="${sep}" stroke="${pith}" stroke-width="1.6" stroke-linecap="round"/><circle r="1.9" fill="${pith}"/>`;
}
function podDef(fill, line) {
  return `<path d="M0 -12.5V-9.5" stroke="${line}" stroke-width="2" stroke-linecap="round"/>` +
    `<path d="M0 -10C6.2 -7.6 6.6 5.6 0 10.5C-6.6 5.6 -6.2 -7.6 0 -10Z" fill="${fill}" stroke="${line}" stroke-width="1.8" stroke-linejoin="round"/>` +
    `<path d="M0 -7.4Q2.6 0 0 7.6M-3.2 -4.2Q-4 1 -2 5.4" fill="none" stroke="${line}" stroke-width="1" stroke-linecap="round" opacity=".7"/>`;
}
function sprigDef(lf, stem, line) {
  let s = `<path d="M-1 25Q4 2 0 -22" fill="none" stroke="${stem}" stroke-width="1.8" stroke-linecap="round"/>`;
  const L = leaf(11.5, 3.9);
  [[17, 2.2], [7, 3], [-3, 2.8], [-12, 1.8]].forEach(([y, x]) => {
    for (const sg of [-1, 1]) s += `<path d="${L}" transform="translate(${f(x)} ${y}) rotate(${sg * 58})" fill="${lf}" stroke="${line}" stroke-width="1.3" stroke-linejoin="round"/>`;
  });
  s += `<path d="${leaf(12, 4.2)}" transform="translate(0.6 -19)" fill="${lf}" stroke="${line}" stroke-width="1.3" stroke-linejoin="round"/>`;
  return s;
}

module.exports = function p02(T, cwName) {
  const c = CW[cwName]; const S = 320; const R = rng(2207);
  c.chilis.forEach((b, i) => T.def('ch' + i, chiliDef(b, c.cap, c.line, c.hi)));
  c.wedges.forEach(([r, fl], i) => T.def('wd' + i, wedgeDef(r, fl, c.pith, c.line)));
  T.def('wh', wheelDef(c.wheel[0], c.wheel[1], c.pith, c.line));
  T.def('pd', podDef(c.pod, c.line));
  T.def('sp', sprigDef(c.sprig, c.stem, c.line));

  const K = 1.32;
  const kinds = {
    ch0: { circles: chiliCircles(), r: 44, z: 3, k: 1.12 }, ch1: { circles: chiliCircles(), r: 44, z: 3, k: 1.12 }, ch2: { circles: chiliCircles(), r: 44, z: 3, k: 1.12 },
    wd0: { circles: [[-7.5, -2, 8], [7.5, -2, 8], [0, 1, 8]], r: 24, z: 2, k: 1.05 }, wd1: { circles: [[-7.5, -2, 8], [7.5, -2, 8], [0, 1, 8]], r: 24, z: 2, k: 1.05 },
    wh: { circles: [[0, 0, 14.6]], r: 22, z: 2, k: 1 },
    pd: { circles: [[0, -5, 6], [0, 5, 6]], r: 18, z: 1, k: 1.05 },
    sp: { circles: [[0, -15, 9], [0, 0, 10], [0, 14, 9]], r: 36, z: 0, k: 1 },
  };
  const types = ['ch0', 'ch0', 'ch0', 'ch1', 'ch1', 'ch1', 'ch2', 'ch2', 'ch2', 'wd0', 'wd0', 'wd1', 'wd1', 'wh', 'wh', 'wh', 'pd', 'pd', 'pd', 'pd', 'sp', 'sp', 'sp', 'sp', 'pd'];
  const items = latticeScatter(S, 5, 5, types, R, 8).map((o) => ({ ...kinds[o.type], id: o.type, x: o.x, y: o.y, rot: Math.round(R() * 360), s: K * kinds[o.type].k * (0.94 + R() * 0.12) }));
  relax2(items, S, 500, 7, 0);
  items.sort((a, b) => a.z - b.z);
  for (const it of items) T.use(it.id, it.x, it.y, { rot: it.rot, s: it.s, r: it.r * it.s });

  const obst = items.flatMap(worldCircles);
  for (let i = 0; i < 26; i++) {
    const big = i % 4 === 0, rr = big ? 2.8 : 2.1;
    const p = bestSpot(obst, rr, S, R, 600, 4);
    if (!p) break;
    T.put(`<circle r="${rr}" fill="${c.seed[big ? 1 : 0]}"/>`, p.x, p.y, { r: 4 });
    obst.push({ x: p.x, y: p.y, r: rr + 3 });
  }
  return { S, bg: c.bg };
};
module.exports.colourways = Object.keys(CW);
module.exports.meta = { slug: '02-chili-lime', name: 'Chili & Lime', size: 320 };

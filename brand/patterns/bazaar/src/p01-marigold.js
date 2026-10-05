// 01 · Marigold Garland — toran swags of genda-phool heads with hanging strands + loose petals
'use strict';
const { C, f, rng, bestSpot, scallop, rpetal, leaf } = require('./lib');

const CW = {
  sunset: { bg: C.cream, line: C.ink, cord: C.ink, A: C.mari, B: C.saff, Cc: C.rani, leaf: C.rani, vein: C.cream, tassel: C.rani, petal: [C.saff, C.mari, C.rani], dot: C.rani },
  night:  { bg: C.ink, line: C.ink, cord: C.mari, A: C.mari, B: C.saff, Cc: C.rani, leaf: C.pea, vein: C.ink, tassel: C.rani, petal: [C.mari, C.saff, C.cream], dot: C.cream },
  fresh:  { bg: C.cream, line: C.ink, cord: C.ink, A: C.mari, B: C.pea, Cc: C.pea, hA: [C.mari, C.cil], hB: [C.mari, C.pea], hC: [C.pea, C.mari], leaf: C.cil, vein: C.cream, tassel: C.pea, petal: [C.mari, C.pea, C.cil], dot: C.pea },
};

function marigold(outer, inner, line, lw = 1.5) {
  return `<path d="${scallop(8.3, 13, 0)}" fill="${outer}" stroke="${line}" stroke-width="${lw}" stroke-linejoin="round"/>` +
    `<path d="${scallop(5.4, 10, 9)}" fill="${inner}"/>` +
    `<path d="${scallop(2.9, 7, 0)}" fill="${outer}"/>` +
    `<circle r="1.25" fill="${line}"/>`;
}

// parabola swag samples → equally spaced points by arc length
function swagPoints(x0, y0, W, D, n, skip) {
  const pts = []; const N = 600; let L = 0; let prev = null;
  for (let i = 0; i <= N; i++) {
    const t = i / N, x = x0 + W * t, y = y0 + D * 4 * t * (1 - t);
    if (prev) L += Math.hypot(x - prev[0], y - prev[1]);
    pts.push([x, y, L]); prev = [x, y];
  }
  const out = [];
  for (let k = 0; k < n; k++) {
    const target = skip + (L - 2 * skip) * (k / (n - 1));
    let j = 0; while (j < pts.length - 1 && pts[j + 1][2] < target) j++;
    out.push([pts[j][0], pts[j][1]]);
  }
  return out;
}

module.exports = function p01(T, cwName) {
  const c = CW[cwName]; const S = 240; const R = rng(1101);
  const obst = [];
  const hA = c.hA || [c.A, c.B], hB = c.hB || [c.B, c.A], hC = c.hC || [c.Cc, c.A];
  T.def('mA', marigold(hA[0], hA[1], c.line));
  T.def('mB', marigold(hB[0], hB[1], c.line));
  T.def('mC', marigold(hC[0], hC[1], c.line));
  T.def('lf', `<path d="${leaf(21, 5.4)}" fill="${c.leaf}" stroke="${c.line}" stroke-width="1.4" stroke-linejoin="round"/><path d="M0 -3V-17" stroke="${c.vein}" stroke-width="1.1" stroke-linecap="round"/>`);
  T.def('lfL', `<path d="${leaf(27, 6.2)}" fill="${c.leaf}" stroke="${c.line}" stroke-width="1.4" stroke-linejoin="round"/><path d="M0 -3V-22" stroke="${c.vein}" stroke-width="1.1" stroke-linecap="round"/>`);
  T.def('ts', `<path d="M0 0C5 3 6 13 0 19C-6 13 -5 3 0 0Z" fill="${c.tassel}" stroke="${c.line}" stroke-width="1.4" stroke-linejoin="round"/><path d="M0 6V16M-2.4 7V14M2.4 7V14" stroke="${c.line}" stroke-width=".8" stroke-linecap="round" opacity=".55"/><rect x="-3.2" y="-1.6" width="6.4" height="3.6" rx="1.6" fill="${c.A}" stroke="${c.line}" stroke-width="1.2"/>`);
  T.def('thr', `<path d="M0 0V54" stroke="${c.line === c.bg ? c.A : c.line}" stroke-width="1.2" stroke-linecap="round"/>`);
  T.def('pt0', `<path d="${rpetal(7, 3.6)}" fill="${c.petal[0]}" stroke="${c.line}" stroke-width="1.1" stroke-linejoin="round"/>`);
  T.def('pt1', `<path d="${rpetal(7, 3.6)}" fill="${c.petal[1]}" stroke="${c.line}" stroke-width="1.1" stroke-linejoin="round"/>`);
  T.def('pt2', `<path d="${rpetal(6, 3.2)}" fill="${c.petal[2]}" stroke="${c.line}" stroke-width="1.1" stroke-linejoin="round"/>`);

  const rows = [{ y: 22, xs: [0, 120] }, { y: 142, xs: [60, 180] }];
  const W = 120, D = 52, N = 9;
  // toran cord with hanging mango leaves (behind everything)
  rows.forEach((row) => {
    T.hband(row.y - 0.9, row.y + 0.9, c.cord);
    row.xs.forEach((x) => {
      [[38, 21, 12], [60, 27, 0], [82, 21, -12]].forEach(([dx, L, rot]) => {
        T.use(L > 24 ? 'lfL' : 'lf', x + dx, row.y, { rot: 180 + rot, r: 32 });
        const a = (180 + rot) * Math.PI / 180;
        obst.push({ x: x + dx + Math.sin(a) * L * 0.55, y: row.y - Math.cos(a) * L * 0.55, r: 8 });
      });
    });
  });
  // hanging strands (behind)
  rows.forEach((row, ri) => row.xs.forEach((x, xi) => {
    const alt = (ri + xi) % 2;
    T.use('thr', x, row.y + 6, { r: 60 });
    for (let k = 0; k < 4; k++) {
      const y = row.y + 22 + k * 12.5;
      T.use(k % 2 === alt ? 'mA' : 'mB', x, y, { s: 0.68, rot: k * 20, r: 9 });
      obst.push({ x, y, r: 7 });
    }
    T.use('ts', x, row.y + 22 + 4 * 12.5 - 5, { r: 24 });
    obst.push({ x, y: row.y + 22 + 4 * 12.5 + 5, r: 8 });
  }));
  // swags
  rows.forEach((row) => row.xs.forEach((x) => {
    const P = swagPoints(x, row.y, W, D, N, 13);
    P.forEach(([px, py], i) => {
      const idx = Math.min(i, N - 1 - i);
      const id = i === (N - 1) / 2 ? 'mC' : (idx % 2 ? 'mB' : 'mA');
      T.use(id, px, py, { r: 12, rot: i * 23 });
      obst.push({ x: px, y: py, r: 10 });
    });
  }));
  // hook rosettes
  rows.forEach((row) => row.xs.forEach((x) => {
    T.use('mC', x, row.y, { s: 1.32, r: 16 });
    obst.push({ x, y: row.y, r: 14 });
  }));
  // loose marigold heads + petals tossed into the gaps (even spacing on the torus)
  const loose = [
    ['mA', 10, 1], ['mB', 10, 1], ['mA', 10, 1], ['mB', 10, 1], ['mA', 9, 0.9], ['mB', 9, 0.9],
    ['pt0', 5, 1.15], ['pt1', 5, 1.15], ['pt2', 5, 1.15], ['pt0', 5, 1.15],
    ['pt0', 5, 1], ['pt1', 5, 1], ['pt0', 5, 1], ['pt1', 5, 1], ['pt2', 4.5, 1], ['pt2', 4.5, 1], ['pt0', 5, 1], ['pt1', 5, 1],
  ];
  for (const [id, r, s] of loose) {
    const p = bestSpot(obst, r, S, R, 900, 2);
    if (!p) continue;
    T.use(id, p.x, p.y, { s, rot: Math.round(R() * 360), r: r + 4 });
    obst.push({ x: p.x, y: p.y, r });
  }
  for (let i = 0; i < 10; i++) {
    const p = bestSpot(obst, 1.6, S, R, 700, 3);
    if (!p) break;
    T.put(`<circle r="1.7" fill="${c.dot}"/>`, p.x, p.y, { r: 3 });
    obst.push({ x: p.x, y: p.y, r: 1.7 });
  }
  return { S, bg: c.bg };
};
module.exports.colourways = Object.keys(CW);
module.exports.meta = { slug: '01-marigold-garland', name: 'Marigold Garland', size: 240 };

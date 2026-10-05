// 06 · Spice Confetti — terrazzo-style chips, seeds and specks in the palette (no outlines, evenly sprinkled)
'use strict';
const { C, f, rng, bestSpot, mod } = require('./lib');

const CW = {
  sunset: { bg: C.cream, big: [C.saff, C.mari, C.rani, C.saff, C.mari, C.chili], mid: [C.saff, C.mari, C.rani, C.chili, C.ink], small: [C.rani, C.saff, C.ink, C.mari], speck: [C.ink, C.rani, C.saff] },
  night: { bg: C.ink, big: [C.mari, C.saff, C.rani, C.pea, C.mari, C.rani], mid: [C.mari, C.saff, C.rani, C.pea, C.cream], small: [C.cream, C.mari, C.rani, C.pea], speck: [C.cream, C.mari, C.pea] },
  fresh: { bg: C.cream, big: [C.pea, C.mari, C.cil, C.pea, C.mari, C.cil], mid: [C.pea, C.cil, C.mari, C.ink, C.pea], small: [C.ink, C.pea, C.mari, C.cil], speck: [C.ink, C.pea, C.cil] },
};

// a handful of chip silhouettes at unit radius 10 (angular pebbles, softened corners)
function chipShapes(R) {
  const out = [];
  for (let k = 0; k < 9; k++) {
    const n = 5 + (k % 3), P = [];
    for (let i = 0; i < n; i++) {
      const a = (i + (R() - 0.5) * 0.6) * 2 * Math.PI / n, r = 10 * (0.66 + R() * 0.44);
      P.push([r * Math.cos(a), r * Math.sin(a)]);
    }
    // straight edges, rounded joins via a same-fill stroke at use time
    out.push('M' + P.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z');
  }
  return out;
}

module.exports = function p06(T, cwName) {
  const c = CW[cwName]; const S = 320; const R = rng(6066);
  const shapes = chipShapes(R);
  shapes.forEach((d, i) => T.rawDef(`<path id="k${i}" d="${d}" stroke-linejoin="round"/>`));
  T.rawDef(`<path id="seed" d="M0 -10C4.2 -6 4.2 6 0 10C-4.2 6 -4.2 -6 0 -10Z"/>`);
  T.rawDef(`<circle id="dot" r="10"/>`);
  const obst = [];
  const tiers = [
    { n: 15, r: [14, 19.5], pal: c.big, margin: 7, shapes: true },
    { n: 26, r: [8, 11], pal: c.mid, margin: 5, shapes: true, seeds: 0.25 },
    { n: 58, r: [3.6, 5], pal: c.small, margin: 4, shapes: true, seeds: 0.3 },
    { n: 90, r: [1.4, 2], pal: c.speck, margin: 3, dots: true },
  ];
  let ci = 0;
  for (const t of tiers) {
    for (let i = 0; i < t.n; i++) {
      const r = t.r[0] + R() * (t.r[1] - t.r[0]);
      const p = bestSpot(obst, r, S, R, 500, t.margin);
      if (!p) break;
      obst.push({ x: p.x, y: p.y, r });
      const col = t.pal[(ci++) % t.pal.length];
      const s = r / 10, rot = Math.round(R() * 360);
      if (t.dots) T.use('dot', p.x, p.y, { s, r: r + 1, attrs: `fill="${col}"` });
      else if (t.seeds && R() < t.seeds) T.use('seed', p.x, p.y, { s: s * 1.05, rot, r: r + 2, attrs: `fill="${col}"` });
      else T.use('k' + Math.floor(R() * shapes.length), p.x, p.y, { s, rot, r: r + 2, attrs: `fill="${col}" stroke="${col}" stroke-width="${f(2.2 / s)}"` });
    }
  }
  return { S, bg: c.bg };
};
module.exports.colourways = Object.keys(CW);
module.exports.meta = { slug: '06-spice-confetti', name: 'Spice Confetti', size: 320 };

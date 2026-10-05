// 07 · Jaipur Arches — brick-stacked scalloped arches filled with sunset-gradient stripe bands
'use strict';
const { C, f, rpetal, ring, dots } = require('./lib');

const CW = {
  sunset: { bg: C.cream, line: C.ink, A: [C.rani, C.saff, C.mari], Acen: C.cream, B: [C.saff, C.mari, C.rani], Bcen: C.cream,
    sun: [C.mari, C.rani], sill: C.ink, orn: C.rani, orn2: C.mari, dot: C.saff },
  night: { bg: C.ink, line: C.ink, A: [C.rani, C.saff, C.mari], Acen: C.dusk, B: [C.saff, C.mari, C.cream], Bcen: C.dusk,
    sun: [C.mari, C.rani], sill: C.mari, orn: C.mari, orn2: C.rani, dot: C.cream },
  fresh: { bg: C.cream, line: C.ink, A: [C.pea, C.cil, C.mari], Acen: C.cream, B: [C.cil, C.mari, C.pea], Bcen: C.cream,
    sun: [C.mari, C.pea], sill: C.ink, orn: C.pea, orn2: C.mari, dot: C.cil },
};

const HW = 33, BASE = 44, SPRING = -4, TOP = -54, LOBES = 7;
function archPath(extend = 0) {
  const P = [];
  for (let k = 0; k <= LOBES; k++) {
    const th = Math.PI - k * Math.PI / LOBES;
    P.push([HW * Math.cos(th), SPRING - (SPRING - TOP) * Math.pow(Math.sin(th), 0.85)]);
  }
  let d = `M${-HW} ${BASE + extend}L${f(P[0][0])} ${f(P[0][1])}`;
  for (let k = 1; k <= LOBES; k++) {
    const a = P[k - 1], b = P[k], ch = Math.hypot(b[0] - a[0], b[1] - a[1]), r = ch / 2 * 1.08;
    d += `A${f(r)} ${f(r)} 0 0 1 ${f(b[0])} ${f(b[1])}`;
  }
  return d + `L${HW} ${BASE + extend}Z`;
}
const ARCH = archPath(0), ARCH_X = archPath(40);

function arch(bands, cen, c, id) {
  const W = [6.5, 6.5, 6.5];
  let s = `<g clip-path="url(#ac)"><path d="${ARCH}" fill="${cen}"/>`;
  // widest stroke first (innermost band) → outermost last
  for (let i = bands.length - 1; i >= 0; i--) {
    const cum = W.slice(0, i + 1).reduce((a, b) => a + b, 0);
    s += `<path d="${ARCH_X}" fill="none" stroke="${bands[i]}" stroke-width="${f(cum * 2)}" stroke-linejoin="round"/>`;
  }
  s += `</g><path d="${ARCH}" fill="none" stroke="${c.line}" stroke-width="2.6" stroke-linejoin="round"/>`;
  // window ornament: little four-petal flower + drop
  s += ring(rpetal(7.5, 3.8), 4, 45, `fill="${c.sun[0]}" stroke="${c.line}" stroke-width="1.4" stroke-linejoin="round"`).replace(/<path /g, '<path transform-origin="0 0" ').replace(/transform-origin="0 0" /g, '');
  s += `<circle cx="0" cy="0" r="2.2" fill="${c.sun[1]}"/><circle cy="14" r="2" fill="${c.sun[1]}"/><circle cy="-14" r="2" fill="${c.sun[1]}"/>`;
  // sill
  s += `<rect x="${-HW - 4}" y="${BASE - 1}" width="${2 * HW + 8}" height="6" rx="3" fill="${c.sill}" stroke="${c.line}" stroke-width="1.6"/>`;
  // finial dot on the apex
  s += `<circle cy="${TOP - 5.5}" r="3.4" fill="${c.orn2}" stroke="${c.line}" stroke-width="1.8"/>`;
  return s;
}
function spandrel(c) {
  return ring(rpetal(9, 4.4), 6, 0, `fill="${c.orn}" stroke="${c.line}" stroke-width="1.5" stroke-linejoin="round"`) +
    `<circle r="2.6" fill="${c.orn2}" stroke="${c.line}" stroke-width="1.2"/>` + dots(6, 13.5, 1.5, 30, c.dot);
}

module.exports = function p07(T, cwName) {
  const c = CW[cwName]; const S = 240;
  T.rawDef(`<clipPath id="ac"><path d="${ARCH}"/></clipPath>`);
  T.def('aA', arch(c.A, c.Acen, c));
  T.def('aB', arch(c.B, c.Bcen, c));
  T.def('sp', spandrel(c));
  for (let row = 0; row < 2; row++) {
    for (let k = 0; k < 3; k++) {
      const x = k * 80 + row * 40, y = row * 120 + 60;
      T.use(row ? 'aB' : 'aA', x, y, { r: 72 });
      T.use('sp', x + 40, y - 51, { r: 18, s: 0.9 });
    }
  }
  return { S, bg: c.bg };
};
module.exports.colourways = Object.keys(CW);
module.exports.meta = { slug: '07-jaipur-arches', name: 'Jaipur Arches', size: 240 };

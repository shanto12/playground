// 04 · Truck-Art Rangoli — bold layered flower medallions, dotted rings, painted "shine" strokes
'use strict';
const { C, f, petal, rpetal, ring, dots, scallop } = require('./lib');

const CW = {
  sunset: { bg: C.cream, line: C.ink, shine: C.cream,
    A: { p1: C.saff, p2: C.mari, disc: C.rani, cf: C.mari, cc: C.ink, dot: C.rani, ring: C.cream },
    B: { p1: C.rani, p2: C.mari, disc: C.saff, cf: C.mari, cc: C.ink, dot: C.saff, ring: C.cream },
    s: { p: C.mari, p2: C.saff, c: C.rani, dot: C.ink }, gap: [C.saff, C.rani] },
  night: { bg: C.ink, line: C.ink, shine: C.cream,
    A: { p1: C.rani, p2: C.mari, disc: C.pea, cf: C.mari, cc: C.ink, dot: C.cream, ring: C.cream },
    B: { p1: C.saff, p2: C.rani, disc: C.mari, cf: C.cream, cc: C.ink, dot: C.mari, ring: C.ink },
    s: { p: C.pea, p2: C.mari, c: C.rani, dot: C.cream }, gap: [C.mari, C.cream] },
  fresh: { bg: C.cream, line: C.ink, shine: C.cream,
    A: { p1: C.pea, p2: C.mari, disc: C.cil, cf: C.mari, cc: C.ink, dot: C.pea, ring: C.cream },
    B: { p1: C.cil, p2: C.mari, disc: C.pea, cf: C.mari, cc: C.ink, dot: C.cil, ring: C.cream },
    s: { p: C.mari, p2: C.pea, c: C.cil, dot: C.ink }, gap: [C.pea, C.cil] },
};

function medallion(m, line, shine) {
  const L = `stroke="${line}" stroke-width="2.4" stroke-linejoin="round"`;
  let s = dots(24, 64.5, 2.5, 7.5, m.dot);
  // 12 pointed outer petals
  s += ring(petal(60, 14, 0.66), 12, 0, `fill="${m.p1}" ${L}`);
  // 12 rounded inner petals offset by 15°
  s += ring(rpetal(39, 10.5), 12, 15, `fill="${m.p2}" ${L}`);
  // painted shine stroke down each outer petal
  let sh = '';
  for (let i = 0; i < 12; i++) sh += `<path d="M0 -41Q2.4 -47 0 -53" transform="rotate(${i * 30})"/><path d="M-2 -27Q-4.2 -31 -2.6 -35" transform="rotate(${i * 30 + 15})"/>`;
  s += `<g fill="none" stroke="${shine}" stroke-width="2.2" stroke-linecap="round">${sh}</g>`;
  s += dots(12, 31.5, 1.9, 15, line);
  // disc with dotted ring
  s += `<circle r="24" fill="${m.disc}" ${L}/>`;
  s += dots(16, 19.5, 1.7, 0, m.ring);
  // centre flower
  s += ring(rpetal(14.5, 5.6), 8, 22.5, `fill="${m.cf}" stroke="${line}" stroke-width="1.8" stroke-linejoin="round"`);
  s += `<circle r="5" fill="${m.cc}"/><circle r="1.8" fill="${shine}"/>`;
  return s;
}
function small(m, line, shine) {
  const L = `stroke="${line}" stroke-width="2.2" stroke-linejoin="round"`;
  let s = ring(rpetal(31, 9), 8, 0, `fill="${m.p}" ${L}`);
  s += ring(petal(22, 5), 8, 22.5, `fill="${m.p2}" ${L}`);
  let sh = '';
  for (let i = 0; i < 8; i++) sh += `<path d="M0 -15Q2 -21 0 -26" transform="rotate(${i * 45})"/>`;
  s += `<g fill="none" stroke="${shine}" stroke-width="1.9" stroke-linecap="round">${sh}</g>`;
  s += `<path d="${scallop(9, 10)}" fill="${m.c}" ${L}/>`;
  s += `<circle r="3.4" fill="${line}"/><circle r="1.3" fill="${shine}"/>`;
  s += dots(8, 35.5, 2.2, 22.5, m.dot);
  return s;
}

module.exports = function p04(T, cwName) {
  const c = CW[cwName]; const S = 240;
  T.def('mA', medallion(c.A, c.line, c.shine));
  T.def('mB', medallion(c.B, c.line, c.shine));
  T.def('sm', small(c.s, c.line, c.shine));
  T.def('tri', `<circle cy="-5" r="2.6" fill="${c.gap[0]}"/><circle cx="-4.6" cy="3" r="2.6" fill="${c.gap[1]}"/><circle cx="4.6" cy="3" r="2.6" fill="${c.gap[1]}"/>`);
  T.use('mA', 0, 0, { r: 70 });
  T.use('mB', 120, 120, { r: 70, rot: 15 });
  T.use('sm', 120, 0, { r: 50, s: 1.2 });
  T.use('sm', 0, 120, { r: 50, s: 1.2, rot: 22.5 });
  for (const [x, y, r] of [[60, 60, 45], [180, 60, 135], [60, 180, -45], [180, 180, 45]]) T.use('tri', x, y, { r: 10, rot: r });
  return { S, bg: c.bg };
};
module.exports.colourways = Object.keys(CW);
module.exports.meta = { slug: '04-truck-art-rangoli', name: 'Truck-Art Rangoli', size: 240 };

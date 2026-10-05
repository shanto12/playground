// 05 · Chai Time — cutting-chai glasses, kulhads, a little ketli, steam curls, star anise, cinnamon, cardamom
'use strict';
const { C, f, rng, relax2, worldCircles, bestSpot, latticeScatter, rpetal } = require('./lib');

const CW = {
  sunset: { bg: C.cream, line: C.ink, glass: C.white, chai: C.saff, foam: C.paper2, kul: C.saff, kulband: C.rani, kulchai: C.mari,
    ket: C.rani, ketlid: C.mari, anise: C.chili, seed: C.mari, cin: C.saff, cinend: C.mari, tie: C.rani, pod: C.mari, steam: C.rani, dot: [C.ink, C.rani] },
  night: { bg: C.ink, line: C.ink, glass: C.cream, chai: C.saff, foam: C.paper2, kul: C.saff, kulband: C.mari, kulchai: C.chili,
    ket: C.pea, ketlid: C.mari, anise: C.rani, seed: C.mari, cin: C.mari, cinend: C.saff, tie: C.rani, pod: C.cil, steam: C.cream, dot: [C.cream, C.mari] },
  fresh: { bg: C.cream, line: C.ink, glass: C.white, chai: C.mari, foam: C.paper2, kul: C.mari, kulband: C.pea, kulchai: C.cil,
    ket: C.pea, ketlid: C.mari, anise: C.cil, seed: C.mari, cin: C.mari, cinend: C.pea, tie: C.cil, pod: C.cil, steam: C.pea, dot: [C.ink, C.pea] },
};
const LJ = 'stroke-linejoin="round" stroke-linecap="round"';

const steam = (c, x, y, h = 18) => `<path d="M${x} ${y}c-4 -4 4 -7 0 -${h / 2}s4 -7 0 -${h / 2}" fill="none" stroke="${c.steam}" stroke-width="2.3" ${LJ}/>`;
function glass(c) {
  const O = 'M-12.5 -13L12.5 -13L9.6 14.5Q0 16.2 -9.6 14.5Z';
  let fl = '';
  for (const x of [-8.4, -4.2, 0, 4.2, 8.4]) fl += `M${x} -12V${f(13.6 - Math.abs(x) * 0.05)}`;
  return steam(c, -4, -18, 16) + steam(c, 4.5, -20, 18) +
    `<path d="${O}" fill="${c.glass}"/>` +
    `<path d="M-12 -8L12 -8L9.6 14.5Q0 16.2 -9.6 14.5Z" fill="${c.chai}"/>` +
    `<path d="M-12 -8.2H12" stroke="${c.foam}" stroke-width="2.6"/>` +
    `<path d="${fl}" stroke="${c.foam}" stroke-width="1.1"/>` +
    `<path d="M-10 10.4Q0 12 10 10.4" fill="none" stroke="${c.line}" stroke-width="1.1"/>` +
    `<path d="${O}" fill="none" stroke="${c.line}" stroke-width="2.1" ${LJ}/>`;
}
function kulhad(c) {
  return steam(c, 0, -18, 18) +
    `<path d="M-13.5 -13C-13 0 -10.5 13 -7 15.5L7 15.5C10.5 13 13 0 13.5 -13Z" fill="${c.kul}" stroke="${c.line}" stroke-width="2.1" ${LJ}/>` +
    `<path d="M-12.6 -3.6Q0 -1.4 12.6 -3.6" fill="none" stroke="${c.kulband}" stroke-width="2.6"/>` +
    `<path d="M-11.6 3.4Q0 5.4 11.6 3.4" fill="none" stroke="${c.kulband}" stroke-width="1.4"/>` +
    `<ellipse cy="-13" rx="13.5" ry="3.6" fill="${c.kulchai}" stroke="${c.line}" stroke-width="2.1"/>` +
    `<path d="M-8 -6Q-8.6 2 -6.4 9" fill="none" stroke="${c.glass}" stroke-width="1.8" ${LJ}/>`;
}
function ketli(c) {
  return `<path d="M13 2C20 0 21 -8 26 -11" fill="none" stroke="${c.line}" stroke-width="6" ${LJ}/>` +
    `<path d="M13 2C20 0 21 -8 26 -11" fill="none" stroke="${c.ket}" stroke-width="2.6" ${LJ}/>` +
    `<path d="M-12 -8C-20 -26 20 -26 12 -8" fill="none" stroke="${c.line}" stroke-width="2.2" ${LJ}/>` +
    `<path d="M-16 0C-16 -10 -9 -13 0 -13C9 -13 16 -10 16 0C16 9 10 13 0 13C-10 13 -16 9 -16 0Z" fill="${c.ket}" stroke="${c.line}" stroke-width="2.1" ${LJ}/>` +
    `<path d="M-9 -12.4Q0 -17 9 -12.4Z" fill="${c.ketlid}" stroke="${c.line}" stroke-width="1.8" ${LJ}/><circle cy="-16.4" r="2.4" fill="${c.ketlid}" stroke="${c.line}" stroke-width="1.6"/>` +
    `<path d="M-15.6 2.6H15.6" stroke="${c.ketlid}" stroke-width="2.6"/>` +
    `<path d="M-10 -5Q-11 0 -9.4 4" fill="none" stroke="${c.glass}" stroke-width="2" ${LJ}/>`;
}
function anise(c) {
  const P = 'M0 -2C4 -5 5 -10 0 -13.5C-5 -10 -4 -5 0 -2Z';
  let s = '';
  for (let i = 0; i < 8; i++) s += `<g transform="rotate(${i * 45})"><path d="${P}" fill="${c.anise}" stroke="${c.line}" stroke-width="1.6" ${LJ}/><ellipse cy="-8" rx="1.5" ry="2.4" fill="${c.seed}"/></g>`;
  return s + `<circle r="2.4" fill="${c.line}"/>`;
}
function cinnamon(c) {
  const stick = (dx) => `<g transform="translate(${dx} 0)"><rect x="-4" y="-21" width="8" height="42" rx="3.4" fill="${c.cin}" stroke="${c.line}" stroke-width="1.9"/>` +
    `<path d="M-1.4 -17V17" stroke="${c.line}" stroke-width=".7"/>` +
    `<ellipse cy="-21" rx="4" ry="2.4" fill="${c.cinend}" stroke="${c.line}" stroke-width="1.5"/><path d="M-1.6 -21.4a1.6 1.2 0 1 1 1.6 1.4" fill="none" stroke="${c.line}" stroke-width="1"/></g>`;
  return `<g transform="rotate(-8)">${stick(-4.6)}</g><g transform="rotate(8)">${stick(4.6)}</g>` +
    `<path d="M-10 1.5Q0 5 10 1.5" fill="none" stroke="${c.tie}" stroke-width="3.2" ${LJ}/><path d="M0 3.4l-4 7M0 3.4l4.4 6.4" stroke="${c.tie}" stroke-width="2" ${LJ}/>`;
}
function pod(c) {
  return `<path d="M0 -12.5V-9.5" stroke="${c.line}" stroke-width="2" stroke-linecap="round"/>` +
    `<path d="M0 -10C6.2 -7.6 6.6 5.6 0 10.5C-6.6 5.6 -6.2 -7.6 0 -10Z" fill="${c.pod}" stroke="${c.line}" stroke-width="1.8" ${LJ}/>` +
    `<path d="M0 -7.4Q2.6 0 0 7.6M-3.2 -4.2Q-4 1 -2 5.4" fill="none" stroke="${c.line}" stroke-width=".8" stroke-linecap="round"/>`;
}

module.exports = function p05(T, cwName) {
  const c = CW[cwName]; const S = 320; const R = rng(5150);
  T.def('gl', glass(c)); T.def('ku', kulhad(c)); T.def('ke', ketli(c));
  T.def('an', anise(c)); T.def('ci', cinnamon(c)); T.def('pd', pod(c));
  const kinds = {
    gl: { circles: [[0, 2, 13], [0, -22, 8]], r: 42, z: 2, k: 1.3, upright: true },
    ku: { circles: [[0, 2, 14], [0, -22, 7]], r: 42, z: 2, k: 1.3, upright: true },
    ke: { circles: [[0, -2, 17], [21, -7, 6]], r: 46, z: 2, k: 1.25, upright: true },
    an: { circles: [[0, 0, 13.5]], r: 24, z: 1, k: 1.2 },
    ci: { circles: [[0, -13, 8], [0, 0, 9], [0, 13, 8]], r: 36, z: 1, k: 1.15 },
    pd: { circles: [[0, -4, 6], [0, 5, 6]], r: 20, z: 0, k: 1.15 },
  };
  const types = ['gl', 'gl', 'gl', 'gl', 'ku', 'ku', 'ku', 'ku', 'ke', 'ke', 'an', 'an', 'an', 'an', 'ci', 'ci', 'ci', 'ci', 'pd', 'pd', 'pd', 'pd', 'pd', 'an', 'pd'];
  const items = latticeScatter(S, 5, 5, types, R, 7).map((o) => {
    const k = kinds[o.type];
    return { ...k, id: o.type, x: o.x, y: o.y, s: k.k * (0.95 + R() * 0.1), rot: k.upright ? Math.round((R() - 0.5) * 24) : Math.round(R() * 360) };
  });
  relax2(items, S, 500, 7, 0);
  items.sort((a, b) => a.z - b.z);
  for (const it of items) T.use(it.id, it.x, it.y, { rot: it.rot, s: it.s, r: it.r * it.s });
  const obst = items.flatMap(worldCircles);
  for (let i = 0; i < 24; i++) {
    const big = i % 3 === 0, rr = big ? 2.6 : 1.9;
    const p = bestSpot(obst, rr, S, R, 600, 4);
    if (!p) break;
    T.put(big ? `<ellipse rx="3.2" ry="1.9" transform="rotate(${Math.round(R() * 180)})" fill="${c.dot[1]}"/>` : `<circle r="${rr}" fill="${c.dot[0]}"/>`, p.x, p.y, { r: 5 });
    obst.push({ x: p.x, y: p.y, r: rr + 3 });
  }
  return { S, bg: c.bg };
};
module.exports.colourways = Object.keys(CW);
module.exports.meta = { slug: '05-chai-time', name: 'Chai Time', size: 320 };

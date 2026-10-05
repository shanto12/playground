// 03 · Block-Print Booti — Sanganeri-style paisley (kairi) + flower booti on a half-drop grid.
// Fills ("datta") sit slightly off-register from the outline block ("rekh"), like real hand block printing.
'use strict';
const { C, f, rpetal, leaf, spline, sampleSpline, dotsAlongOffset } = require('./lib');
const K = 1.22;

const CW = {
  sunset: { bg: C.cream, rekh: C.ink, pa: C.rani, pin: C.mari, pfl: C.saff, fl: C.saff, flc: C.mari, lf: C.rani, dot: C.saff, dot2: C.rani },
  night:  { bg: C.ink, rekh: C.cream, pa: C.saff, pin: C.rani, pfl: C.mari, fl: C.rani, flc: C.mari, lf: C.pea, dot: C.mari, dot2: C.cream },
  fresh:  { bg: C.cream, rekh: C.ink, pa: C.pea, pin: C.mari, pfl: C.cil, fl: C.mari, flc: C.pea, lf: C.cil, dot: C.pea, dot2: C.cil },
};

// paisley body, upright: round bulb at the bottom, tail curling to the right
const PPTS = [[0, 21], [-9.5, 17.5], [-13.5, 8.5], [-12.8, -2], [-8.8, -12], [-2.5, -20], [5, -26.2], [12, -29.2], [16.6, -27.4], [14.6, -24.2], [8.6, -19.6], [5.2, -12], [6.8, -2.5], [11.4, 5], [12, 13.5], [7, 19.4]];
const PAI = spline(PPTS, true, 0.5);
const HALO = dotsAlongOffset(sampleSpline(PPTS, true, 10), 5.4, 4.7);
const REG = 'translate(1.3 1)'; // off-register shift of the colour block

function paisley(c) {
  const P = rpetal(4.8, 2.7);
  let pet = '', pr = '';
  for (let i = 0; i < 5; i++) { pet += `<path d="${P}" transform="rotate(${i * 72})" fill="${c.pfl}"/>`; pr += `<path d="${P}" transform="rotate(${i * 72})"/>`; }
  const fills = `<g transform="${REG}"><path d="${PAI}" fill="${c.bg}" stroke="${c.pa}" stroke-width="10" clip-path="url(#paiclip)"/>` +
    `<g transform="translate(0.4 8.6)">${pet}</g><circle cx="3.2" cy="-7.6" r="1.8" fill="${c.pin}"/><circle cx="6.6" cy="-14" r="1.4" fill="${c.pin}"/><circle cx="-1" cy="-2.2" r="1.5" fill="${c.pin}"/></g>`;
  const rekh = `<g fill="none" stroke="${c.rekh}" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="${PAI}" stroke-width="2"/>` +
    `<g transform="translate(0.4 8.6)" stroke-width="0.9">${pr}</g></g>` +
    `<circle cx="0.4" cy="8.6" r="1.2" fill="${c.rekh}"/>` +
    HALO.map(([x, y]) => `<circle cx="${f(x)}" cy="${f(y)}" r="1.15"/>`).join('').replace(/<circle /g, `<circle fill="${c.rekh}" `);
  return `<g transform="translate(-1 3)">${fills}${rekh}</g>`;
}
function flower(c) {
  const P = rpetal(10, 5.4);
  let pet = '', pr = '';
  for (let i = 0; i < 5; i++) {
    pet += `<path d="${P}" transform="rotate(${i * 72})" fill="${c.fl}"/>`;
    pr += `<path d="${P}" transform="rotate(${i * 72})"/>`;
  }
  const L = leaf(13, 4.6);
  const fills = `<g transform="${REG}"><path d="${L}" transform="translate(-1 16) rotate(-62)" fill="${c.lf}"/><path d="${L}" transform="translate(0.5 21) rotate(58)" fill="${c.lf}"/>` +
    `<g transform="translate(0 -6)">${pet}<circle r="3.6" fill="${c.flc}"/></g></g>`;
  const rekh = `<g fill="none" stroke="${c.rekh}" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="M0 3C-1.5 12 2 18 0.5 26" stroke-width="1.8"/>` +
    `<path d="${L}" transform="translate(-1 16) rotate(-62)" stroke-width="1.5"/><path d="${L}" transform="translate(0.5 21) rotate(58)" stroke-width="1.5"/>` +
    `<path d="M-1 16l-9.5 -5M0.5 21l9.8 -5.6" stroke-width="0.9"/>` +
    `<g transform="translate(0 -6)" stroke-width="1.6">${pr}<circle r="3.6" stroke-width="1.3"/></g></g>` +
    `<g transform="translate(0 -6)">${[0, 1, 2, 3, 4].map((i) => { const a = (i * 72 - 90) * Math.PI / 180; return `<circle cx="${f(Math.cos(a) * 6.4)}" cy="${f(Math.sin(a) * 6.4)}" r=".95" fill="${c.rekh}"/>`; }).join('')}</g>`;
  return `<g transform="translate(0 -4)">${fills}${rekh}</g>`;
}
function dotCluster(c) {
  return `<circle r="1.9" fill="${c.dot}"/>` + [[0, -5], [5, 0], [0, 5], [-5, 0]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.5" fill="${c.dot2}"/>`).join('');
}

module.exports = function p03(T, cwName) {
  const c = CW[cwName]; const S = 240;
  T.rawDef(`<clipPath id="paiclip"><path d="${PAI}"/></clipPath>`);
  T.def('pa', paisley(c));
  T.def('fl', flower(c));
  T.def('dc', dotCluster(c));
  // half-drop grid: 4 columns × 3 rows
  for (let col = 0; col < 4; col++) {
    for (let k = 0; k < 3; k++) {
      const x = col * 60, y = k * 80 + (col % 2) * 40;
      if (col % 2 === 0) T.use('pa', x, y, { rot: col === 0 ? -14 : 14, sx: col === 0 ? 1.02 : -1.02, s: 1.02, r: 40 });
      else T.use('fl', x, y, { rot: (k % 2 ? 8 : -8), s: 1.2, r: 40 });
    }
  }
  // dot clusters in the open diamonds between booti
  for (let col = 0; col < 4; col++) for (let k = 0; k < 3; k++) {
    T.use('dc', col * 60 + 30, k * 80 + (col % 2) * 40 + 20, { r: 9, s: 0.9 });
  }
  return { S, bg: c.bg };
};
module.exports.colourways = Object.keys(CW);
module.exports.meta = { slug: '03-block-print-booti', name: 'Block-Print Booti', size: 240 };

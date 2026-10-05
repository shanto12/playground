// 08 · Tiffin Stripes — awning-bold stripe bands with rows of stacked tiffin carriers and twinkly stars
'use strict';
const { C, f, star } = require('./lib');

const CW = {
  sunset: { bg: C.cream, line: C.ink,
    fields: [C.cream, C.mari], band: C.rani, thin: C.saff,
    tif: [[C.saff, C.mari], [C.rani, C.mari], [C.mari, C.saff]], tif2: [[C.rani, C.cream], [C.saff, C.cream], [C.cream, C.rani]],
    rail: C.paper2, stars: [[C.rani, C.saff], [C.cream, C.rani]] },
  night: { bg: C.ink, line: C.ink,
    fields: [C.ink, C.rani], band: C.mari, thin: C.saff,
    tif: [[C.rani, C.mari], [C.pea, C.mari], [C.saff, C.cream]], tif2: [[C.mari, C.cream], [C.pea, C.mari], [C.cream, C.saff]],
    rail: C.cream, rail2: C.ink, stars: [[C.mari, C.cream], [C.cream, C.mari]] },
  fresh: { bg: C.cream, line: C.ink,
    fields: [C.cream, C.pea], band: C.cil, thin: C.mari,
    tif: [[C.pea, C.mari], [C.mari, C.cil], [C.cil, C.mari]], tif2: [[C.mari, C.cream], [C.cream, C.pea], [C.cil, C.mari]],
    rail: C.paper2, stars: [[C.pea, C.mari], [C.mari, C.cream]] },
};

function tiffin([body, rim], line, rail) {
  const LJ = `stroke="${line}" stroke-width="2" stroke-linejoin="round"`;
  let s = '';
  // carrier handle + side rails (behind)
  s += `<path d="M-19 26V-27M19 26V-27" stroke="${line}" stroke-width="5" stroke-linecap="round"/>`;
  s += `<path d="M-19 26V-27M19 26V-27" stroke="${rail}" stroke-width="2.2" stroke-linecap="round"/>`;
  s += `<path d="M-19 -27C-19 -41 19 -41 19 -27" fill="none" stroke="${line}" stroke-width="5" stroke-linecap="round"/>`;
  s += `<path d="M-19 -27C-19 -41 19 -41 19 -27" fill="none" stroke="${rail}" stroke-width="2.2" stroke-linecap="round"/>`;
  // three tiers, bottom → top
  for (const y of [14, -1, -16]) {
    s += `<rect x="-16" y="${y - 7}" width="32" height="15" rx="4" fill="${body}" ${LJ}/>`;
    s += `<rect x="-17.5" y="${y - 8.5}" width="35" height="4.6" rx="2.3" fill="${rim}" ${LJ}/>`;
    s += `<path d="M-11 ${y + 0.5}V${y + 4.5}" stroke="${C.cream}" stroke-width="2" stroke-linecap="round"/>`;
  }
  // lid dome + knob
  s += `<path d="M-14 -24.6C-12 -31 12 -31 14 -24.6Z" fill="${rim}" ${LJ}/>`;
  s += `<rect x="-4.5" y="-34" width="9" height="5" rx="2" fill="${body}" ${LJ}/>`;
  // rail clips
  s += `<rect x="-22" y="-20.5" width="6" height="5" rx="1.5" fill="${rim}" stroke="${line}" stroke-width="1.5"/><rect x="16" y="-20.5" width="6" height="5" rx="1.5" fill="${rim}" stroke="${line}" stroke-width="1.5"/>`;
  return s;
}

module.exports = function p08(T, cwName) {
  const c = CW[cwName]; const S = 240;
  c.tif.forEach((p, i) => T.def('t' + i, tiffin(p, c.line, c.rail)));
  c.tif2.forEach((p, i) => T.def('u' + i, tiffin(p, c.line, c.rail2 || c.rail)));
  T.def('s4', `<path d="${star(4, 7.5, 2.4, -90)}" stroke-linejoin="round"/>`);
  T.def('s5', `<path d="${star(5, 5.2, 2.3, -90)}" stroke-linejoin="round"/>`);
  // stripe unit, 120 tall: band 14 · gap 4 · thin 4 · field 90 · thin 4 · gap 4
  for (let u = 0; u < 2; u++) {
    const y0 = u * 120;
    T.hband(y0, y0 + 14, c.band);
    T.hband(y0 + 18, y0 + 22, c.thin);
    T.hband(y0 + 22, y0 + 112, c.fields[u]);
    T.hband(y0 + 112, y0 + 116, c.thin);
    // ink pin-lines on the bold band
    T.hband(y0 + 2.5, y0 + 3.7, c.line === c.bg ? c.fields[1] : c.line);
    T.hband(y0 + 10.3, y0 + 11.5, c.line === c.bg ? c.fields[1] : c.line);
    const cy = y0 + 67, off = u * 40;
    for (let k = 0; k < 3; k++) {
      T.use((u ? 'u' : 't') + k, k * 80 + off, cy + 1, { r: 46 });
      const sx = k * 80 + off + 40, st = c.stars[u];
      T.use('s4', sx, cy - 14, { r: 10, s: 1.15, attrs: `fill="${st[0]}"` });
      T.use('s5', sx - 7, cy + 16, { r: 8, attrs: `fill="${st[1]}"` });
      T.use('s4', sx + 9, cy + 26, { r: 8, s: 0.6, attrs: `fill="${st[0]}"` });
    }
  }
  return { S, bg: c.bg };
};
module.exports.colourways = Object.keys(CW);
module.exports.meta = { slug: '08-tiffin-stripes', name: 'Tiffin Stripes', size: 240 };

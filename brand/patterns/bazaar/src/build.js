// node src/build.js [patternNumber...]  → writes NN-slug-colourway.svg into the bazaar folder
// (and un-clipped 3×3 reference SVGs for seam QA into $REF_DIR if set)
'use strict';
const fs = require('fs');
const path = require('path');
const { Tile } = require('./lib');

const OUT = path.resolve(__dirname, '..');
const REF = process.env.REF_DIR || null;
const ALL = ['p01-marigold', 'p02-chili-lime', 'p03-booti', 'p04-rangoli', 'p05-chai', 'p06-confetti', 'p07-arches', 'p08-tiffin'];
const want = process.argv.slice(2);
const list = ALL.filter((m, i) => !want.length || want.includes(String(i + 1)))
  .filter((m) => fs.existsSync(path.join(__dirname, m + '.js')));

const manifest = [];
for (const modName of list) {
  const P = require('./' + modName);
  for (const cw of P.colourways) {
    const name = `${P.meta.slug}-${cw}`;
    const title = `Curry District · Bazaar pattern · ${P.meta.name} (${cw})`;
    const t = new Tile(P.meta.size, 'tile');
    const { bg } = P(t, cw);
    const svg = t.svg(title, bg);
    fs.writeFileSync(path.join(OUT, name + '.svg'), svg);
    if (REF) {
      const r = new Tile(P.meta.size, 'ref');
      P(r, cw);
      fs.writeFileSync(path.join(REF, name + '.svg'), r.svg(title, bg));
    }
    manifest.push({ file: name + '.svg', bytes: Buffer.byteLength(svg), size: P.meta.size });
    console.log(name.padEnd(36), (Buffer.byteLength(svg) / 1024).toFixed(1) + ' KB');
  }
}

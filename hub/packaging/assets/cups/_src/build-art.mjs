// Build all flat artwork, dielines, transparent art faces and 3D textures.
// usage: node build-art.mjs [filter]
import fs from 'fs';
import { OUT, SCR, svgDoc, writeSvg, f, DISCLAIMER } from './lib.mjs';
import { rasterize } from './raster.mjs';
import { PIECES } from './pieces.mjs';

const filter = process.argv[2] || '';
const TEX = SCR + '/tex';
fs.mkdirSync(TEX, { recursive: true });
fs.mkdirSync(OUT + '/art', { recursive: true });

const jobs = [];
for (const piece of PIECES) {
  if (filter && !piece.id.includes(filter)) continue;
  // textures (bare faces, used by the 3D mockups)
  for (const t of piece.textures || []) {
    const a = t.art();
    const svg = svgDoc({ w: a.W, h: a.H, defs: a.defs, body: a.body, title: t.name });
    const file = `${TEX}/${t.name}.svg`;
    await writeSvg(file, svg);
    jobs.push({ svg: file, png: `${TEX}/${t.name}.png`, wmm: a.W, hmm: a.H, pxPerMm: t.ppm || 12, transparent: !!t.transparent });
  }
  // deliverable SVGs (flat artwork boards, dielines, art faces)
  for (const d of piece.files || []) {
    const doc = d.doc();
    const n = await writeSvg(`${OUT}/${d.file}`, doc.svg);
    console.log(`${d.file}  ${(n / 1024).toFixed(0)} KB`);
    if (d.preview) jobs.push({ svg: `${OUT}/${d.file}`, png: `${OUT}/_qa/flat-${d.file.replace(/\//g, '_').replace('.svg', '')}.png`, wmm: doc.w, hmm: doc.h, pxPerMm: d.preview, transparent: false });
  }
}
// brand pattern tiles → repeatable textures for props (cloths, napkins)
const TILES = { 'pat-bz-booti-sunset': 'patterns/bazaar/03-block-print-booti-sunset.svg', 'pat-bz-garland-fresh': 'patterns/bazaar/01-marigold-garland-fresh.svg', 'pat-bz-rangoli-fresh': 'patterns/bazaar/04-truck-art-rangoli-fresh.svg', 'pat-bz-chili-sunset': 'patterns/bazaar/02-chili-lime-sunset.svg', 'pat-ry-jali-ivory': 'patterns/royal/01-jali-lattice-ivory.svg', 'pat-ry-damask-emerald': 'patterns/royal/04-marigold-damask-emerald.svg', 'pat-ry-star-ivory': 'patterns/royal/06-star-tile-ivory.svg', 'pat-ry-paisley-ruby': 'patterns/royal/03-paisley-vine-ruby.svg', 'pat-ry-botanical-ivory': 'patterns/royal/07-spice-botanical-ivory.svg' };
if (!filter || filter === 'tiles') for (const [n, rel] of Object.entries(TILES)) jobs.push({ svg: '/home/user/playground/brand/' + rel, png: `${TEX}/${n}.png`, px: [512, 512] });
console.log('rasterising', jobs.length);
await rasterize(jobs);
console.log('done');

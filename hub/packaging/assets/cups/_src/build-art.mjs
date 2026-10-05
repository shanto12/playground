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
console.log('rasterising', jobs.length);
await rasterize(jobs);
console.log('done');

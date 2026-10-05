// Registry of every piece: textures for 3D mockups + deliverable SVG files
import { BZ, RY, FONT, T, f, svgDoc, sectorPath, place, placeC } from './lib.mjs';
import { board, caption, note, sectorArt, legend, hatchDef, stamp, dimH, dimV, STROKES, DL } from './sheets.mjs';
import { chaiWrap, chaiSleeve, chaiLid, CUPG, SLVG, CUP, SLEEVE } from './art-chai.mjs';

const DIRS = ['bazaar', 'royal'];
const faceDoc = (a, title) => ({ svg: svgDoc({ w: a.W, h: a.H, defs: a.defs, body: a.body, title }), w: a.W, h: a.H });
const inch = mm => (mm / 25.4).toFixed(2);

/* ───────────── CHAI ───────────── */
function chaiBoard(dir) {
  const w = 420, h = 297;
  const wrap = chaiWrap(dir), slv = chaiSleeve(dir), lid = chaiLid(dir);
  const A = sectorArt({ id: 'wrapA', art: wrap, g: CUPG, x: 22, y: 44 });
  const S = sectorArt({ id: 'slvA', art: slv, g: SLVG, x: 30, y: 196 });
  let body = A.body + `<path d="${A.trim}" ${STROKES.cut}/>` + S.body + `<path d="${S.trim}" ${STROKES.cut}/>`;
  body += caption(22, 40, '1 · CUP PRINT (kulhad-inspired) — 12 oz hot cup, flat as printed', dir);
  body += caption(30, 192, '2 · SLEEVE — flat as die-cut', dir);
  const lx = 352, ly = 120;
  body += caption(lx, 66, '3 · LID — top view', dir, 'middle');
  body += `<clipPath id="lidClip"><circle cx="${lx}" cy="${ly}" r="46.5"/></clipPath><g clip-path="url(#lidClip)"><svg x="${lx - 50}" y="${ly - 50}" width="100" height="100" viewBox="0 0 100 100">${lid.body}</svg></g><circle cx="${lx}" cy="${ly}" r="46.5" ${STROKES.cut}/>`;
  body += note(lx, ly + 56, 'Debossed steam cue points to the sip slot.', 'middle');
  body += note(lx, ly + 61, 'No ink on any food-contact side.', 'middle');
  const specs = [`Cup: Ø${CUP.Rtop * 2} mm rim · Ø${CUP.Rbot * 2} mm base · ${CUP.h} mm tall (12 oz)`, `Sleeve band ≈ ${inch(2 * Math.PI * SLEEVE.Rtop)} × ${inch(SLVG.H)} in on the cup`, 'Print sizes indicative — confirm with supplier'];
  specs.forEach((s, i) => body += note(lx, 214 + i * 6, s, 'middle'));
  const { b, defs } = board({ w, h, dir, title: dir === 'bazaar' ? 'CHAI CUP · SLEEVE · LID' : 'Chai cup, sleeve & lid', sub: 'Drinks · kulhad-inspired 12 oz paper cup with printed sleeve and debossed lid', body });
  return { svg: svgDoc({ w, h, defs: A.defs + S.defs + defs, body: b, title: `Chai cup set — ${dir}` }), w, h };
}
function chaiSleeveDieline(dir) {
  const w = 360, h = 205;
  const slv = chaiSleeve(dir);
  const x0 = 50, y0 = 58;
  const S = sectorArt({ id: 'slvD', art: slv, g: SLVG, x: x0, y: y0, bleed: 3, baseFill: dir === 'bazaar' ? BZ.cream : RY.emerald });
  const rm = (S.L1 + S.L2) / 2, flapDeg = 12 / rm * 180 / Math.PI;
  const bleedDeg = 3 / S.L2 * 180 / Math.PI, safeDeg = 3 / rm * 180 / Math.PI;
  let body = '';
  // glue flap (unprinted)
  body += `<path d="${sectorPath(S.cx, S.cy, S.L2, S.L1, S.a0 - flapDeg, S.a0)}" fill="url(#hatch)"/>`;
  body += S.body;
  body += `<path d="${sectorPath(S.cx, S.cy, S.L2 - 3, S.L1 + 3, S.a0 - bleedDeg, S.a1 + bleedDeg)}" ${STROKES.bleed}/>`;
  body += `<path d="${sectorPath(S.cx, S.cy, S.L2 + 3, S.L1 - 3, S.a0 + safeDeg, S.a1 - safeDeg)}" ${STROKES.safe}/>`;
  body += `<path d="${sectorPath(S.cx, S.cy, S.L2, S.L1, S.a0 - flapDeg, S.a1)}" ${STROKES.cut}/>`;
  const p = (r, a) => [S.cx + r * Math.sin(a * Math.PI / 180), S.cy - r * Math.cos(a * Math.PI / 180)];
  const [fx0, fy0] = p(S.L2, S.a0), [fx1, fy1] = p(S.L1, S.a0);
  body += `<path d="M${f(fx0)} ${f(fy0)}L${f(fx1)} ${f(fy1)}" ${STROKES.fold}/>`;
  const [gx, gy] = p(rm, S.a0 - flapDeg / 2);
  body += `<text transform="translate(${f(gx)} ${f(gy)}) rotate(${f(S.a0 - flapDeg / 2 - 90)})" ${FONT.dm(700)} font-size="3" fill="#666" text-anchor="middle">GLUE</text>`;
  const topArc = (S.L1 * (S.a1 - S.a0) * Math.PI / 180), botArc = (S.L2 * (S.a1 - S.a0) * Math.PI / 180);
  body += dimH(S.cx - S.w / 2, S.cx + S.w / 2, y0 - 10, `${f(S.w)} mm (${inch(S.w)} in) printed width`);
  body += dimV(x0 - 18, y0, y0 + S.h, `${f(S.h)} mm flat height`);
  const ny = y0 + S.h + 16;
  [`Top arc ${topArc.toFixed(0)} mm · bottom arc ${botArc.toFixed(0)} mm · band ${SLVG.H.toFixed(1)} mm deep · arc radii ${S.L1.toFixed(1)} / ${S.L2.toFixed(1)} mm`,
    `Fits a 12 oz, 90 mm-rim hot cup. Glue flap 12 mm, left end. Art shown at 1:1 in mm.`,
    `Artwork lives outside the cup only; ask for low-migration inks and the converter’s food-contact statement.`].forEach((s, i) => body += note(x0, ny + i * 5.6, s));
  body += legend(w - 86, h - 66, [['glue', 'Glue area — keep unprinted']]);
  body += stamp(w - 112, 12);
  body += T(16, 20, `Chai sleeve dieline · ${dir === 'bazaar' ? 'A · Bazaar' : 'B · Royal'}`, { font: FONT.dm(700), size: 7, fill: '#1d1d24', anchor: 'start' });
  body += note(16, 27, 'Curry District · drinks packaging concept · units mm');
  return { svg: svgDoc({ w, h, defs: S.defs + hatchDef, body: `<rect width="${w}" height="${h}" fill="#fff"/>` + body, title: `Chai sleeve dieline — ${dir}` }), w, h };
}

export const PIECES = [];
for (const dir of DIRS) {
  PIECES.push({
    id: `chai-${dir}`,
    textures: [
      { name: `chai-wrap-${dir}`, art: () => chaiWrap(dir), ppm: 14 },
      { name: `chai-sleeve-${dir}`, art: () => chaiSleeve(dir), ppm: 16 },
      { name: `chai-lid-${dir}`, art: () => chaiLid(dir), ppm: 12 },
    ],
    files: [
      { file: `chai-cup-${dir}.svg`, doc: () => chaiBoard(dir), preview: 4 },
      { file: `dieline-chai-sleeve-${dir}.svg`, doc: () => chaiSleeveDieline(dir), preview: 4.5 },
      { file: `art/chai-cup-wrap-${dir}.svg`, doc: () => faceDoc(chaiWrap(dir), `Chai cup wrap (unrolled, UV-ready) — ${dir}`) },
      { file: `art/chai-sleeve-${dir}.svg`, doc: () => faceDoc(chaiSleeve(dir), `Chai sleeve face (unrolled, UV-ready) — ${dir}`) },
    ],
  });
}

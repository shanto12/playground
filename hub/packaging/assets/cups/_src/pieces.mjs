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

/* ───────────── LASSI ───────────── */
import { lassiBand, strawFlag, BANDG, LASSI, BAND, FLAG, sauceSticker, SAUCES } from './art-drinks.mjs';
import { zoneLabel, LABEL, trayLid, LID_T, lunchTop, lunchFront, lunchBack, lunchStrip, LBOX, cartonSide, cartonEnd, cartonRoof, cartonHandle, CARTON, tentFront, tentBack, TENT, vanMagnet, MAGNET } from './art-catering.mjs';
import { curry, biryani, rice, naan, lunchInterior } from './art-food.mjs';
import { ZONES } from './lib.mjs';

const nest = (a, x, y, s = 1, extra = '') => `<svg x="${f(x)}" y="${f(y)}" width="${f(a.W * s)}" height="${f(a.H * s)}" viewBox="0 0 ${f(a.W)} ${f(a.H)}" overflow="hidden" ${extra}><defs>${a.defs}</defs>${a.body}</svg>`;

function lassiBoard(dir) {
  const w = 420, h = 230;
  const band = lassiBand(dir), flag = strawFlag(dir);
  const A = sectorArt({ id: 'lbA', art: band, g: BANDG, x: 22, y: 46 });
  let body = A.body + `<path d="${A.trim}" ${STROKES.cut}/>`;
  body += caption(22, 42, '1 · CUP WRAP BAND — 16 oz clear PET cup, flat as printed', dir);
  const fx = 356, fs = 1.25;
  body += caption(fx, 66, '2 · STRAW FLAG', dir, 'middle');
  body += nest(flag, fx - flag.W * fs / 2, 74, fs);
  body += `<path d="M${fx} 70V${f(78 + flag.H * fs)}" stroke="${DL.fold}" stroke-width=".4" stroke-dasharray="3 1.5"/>`;
  body += note(fx, 74 + flag.H * fs + 9, 'Shown at 125%. Folds around the straw', 'middle');
  body += note(fx, 74 + flag.H * fs + 14.5, `on the dashed line · flat ${f(flag.W)} × ${f(flag.H)} mm`, 'middle');
  [`Cup: Ø${LASSI.Rtop * 2} mm rim · Ø${LASSI.Rbot * 2} mm base · ${LASSI.h} mm tall (16 oz)`, `Band ≈ ${inch(Math.PI * 2 * BAND.Rtop)} in around × ${inch(BANDG.H)} in deep`, 'Domed lid with straw slot', 'Sizes indicative — confirm with supplier'].forEach((s, i) => body += note(fx, 150 + i * 6, s, 'middle'));
  const { b, defs } = board({ w, h, dir, title: dir === 'bazaar' ? 'MANGO LASSI CUP' : 'Mango lassi cup', sub: 'Drinks · clear PET cup with printed wrap band, domed lid and a straw flag', body });
  return { svg: svgDoc({ w, h, defs: A.defs + defs, body: b, title: `Lassi cup set — ${dir}` }), w, h };
}
function sauceBoard(dir) {
  const w = 420, h = 200; let body = '';
  const D4 = 57.15, D2 = 44.45;
  body += caption(22, 46, '4 oz cup lid sticker — Ø2.25 in', dir);
  body += caption(22, 128, '2 oz cup lid sticker — Ø1.75 in', dir);
  SAUCES.forEach((k, i) => {
    const s4 = sauceSticker(dir, k, D4), s2 = sauceSticker(dir, k, D2);
    body += nest(s4, 22 + i * 76, 52) + `<circle cx="${f(22 + i * 76 + D4 / 2)}" cy="${f(52 + D4 / 2)}" r="${f(D4 * .45)}" ${STROKES.cut}/>`;
    body += nest(s2, 22 + i * 76 + (D4 - D2) / 2, 134) + `<circle cx="${f(22 + i * 76 + D4 / 2)}" cy="${f(134 + D2 / 2)}" r="${f(D2 * .45)}" ${STROKES.cut}/>`;
  });
  body += note(400, 186, 'Round roll labels on PP portion-cup lids · write-in “DIP” sticker for anything else', 'end');
  const { b, defs } = board({ w, h, dir, title: dir === 'bazaar' ? 'SAUCE & CHUTNEY CUPS' : 'Sauce & chutney cups', sub: 'Drinks & sides · lid stickers for 2 oz and 4 oz portion cups', body });
  return { svg: svgDoc({ w, h, defs, body: b, title: `Sauce cup stickers — ${dir}` }), w, h };
}
const TRAY_ZONES = ['starters', 'tandoor', 'curry', 'biryani', 'indochinese', 'bread', 'sweets'];
function trayBoard(dir) {
  const w = 720, h = 560; let body = '';
  const lid = trayLid(dir, { showLabelZone: true });
  body += caption(24, 50, `1 · PRINTED BOARD LID — half-size foil pan · ${f(LID_T.W)} × ${f(LID_T.H)} mm`, dir);
  body += nest(lid, 24, 56) + `<rect x="24" y="56" width="${LID_T.W}" height="${LID_T.H}" ${STROKES.cut}/>`;
  body += caption(370, 50, '2 · ZONE LABELS — 6 × 4 in, colour-coded by menu district', dir);
  TRAY_ZONES.forEach((z, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 370 + col * 166, y = 56 + row * 116;
    body += nest(zoneLabel(dir, z), x, y);
  });
  body += caption(370 + 166, 56 + 3 * 116 + 14, 'Write-in: dish · serves · diet · spice', dir);
  [['Lid: printed outside face only; foil laminate faces the food.', 0], ['Label goes on the lid, never on food contact surfaces.', 1], ['Heat-and-serve copy is generic by design:', 2], ['“Reheat gently; stir before serving.”', 3], ['Foil pans are not microwave-safe.', 4]].forEach(([s, i]) => body += note(24, 340 + i * 6.5, s));
  const { b, defs } = board({ w, h, dir, title: dir === 'bazaar' ? 'PARTY TRAY LID + ZONE LABELS' : 'Party tray lid & zone labels', sub: 'Catering · board lid for half-size foil pans with a colour-coded 6 × 4 in label per menu zone', body });
  return { svg: svgDoc({ w, h, defs, body: b, title: `Party tray system — ${dir}` }), w, h };
}
function trayLabelDieline(dir) {
  const w = 330, h = 200; let body = '';
  const L = zoneLabel(dir, 'curry'), x0 = 40, y0 = 52, B = 3;
  body += `<rect x="${x0 - B}" y="${y0 - B}" width="${L.W + 2 * B}" height="${L.H + 2 * B}" rx="${5 + B}" fill="${dir === 'bazaar' ? '#FFF4DC' : '#FBF3E4'}"/>`;
  body += nest(L, x0, y0);
  body += `<rect x="${x0 - B}" y="${y0 - B}" width="${L.W + 2 * B}" height="${L.H + 2 * B}" rx="${5 + B}" ${STROKES.bleed}/>`;
  body += `<rect x="${x0}" y="${y0}" width="${L.W}" height="${L.H}" rx="5" ${STROKES.cut}/>`;
  body += `<rect x="${x0 + B}" y="${y0 + B}" width="${L.W - 2 * B}" height="${L.H - 2 * B}" rx="2.5" ${STROKES.safe}/>`;
  body += dimH(x0, x0 + L.W, y0 - 12, '152.4 mm (6 in)') + dimV(x0 - 14, y0, y0 + L.H, '101.6 mm (4 in)');
  body += note(x0, y0 + L.H + 14, 'Corner radius 5 mm (0.2 in). Roll label, permanent adhesive on board lid; matte or soft-touch stock takes ballpoint.');
  body += note(x0, y0 + L.H + 19.5, 'Zone band colour swaps per district; everything else stays put. Lid itself is not die-cut here.');
  // zone colour key
  const kx = 214, ky = 52;
  body += T(kx, ky + 2, 'ZONE COLOUR KEY', { font: FONT.dm(700), size: 3.4, fill: '#222', anchor: 'start', ls: .4 });
  TRAY_ZONES.forEach((z, i) => { const col = (dir === 'bazaar' ? { starters: BZ.rani, tandoor: BZ.chili, curry: BZ.saffron, biryani: BZ.peacock, indochinese: BZ.cilantro, bread: BZ.marigold, sweets: BZ.violet } : { starters: RY.peacock, tandoor: RY.ruby, curry: RY.goldDk, biryani: RY.emerald, indochinese: RY.ink, bread: RY.plum, sweets: '#C9787A' })[z]; body += `<rect x="${kx}" y="${ky + 6 + i * 7}" width="9" height="5" rx="1" fill="${col}"/>` + T(kx + 12, ky + 10 + i * 7, ZONES[z].name, { font: FONT.dm(500), size: 3.3, fill: '#222', anchor: 'start' }); });
  body += legend(w - 86, h - 60);
  body += stamp(w - 112, 12);
  body += T(16, 20, `Party-tray lid label dieline · ${dir === 'bazaar' ? 'A · Bazaar' : 'B · Royal'}`, { font: FONT.dm(700), size: 7, fill: '#1d1d24', anchor: 'start' });
  body += note(16, 27, 'Curry District · catering packaging concept · units mm');
  return { svg: svgDoc({ w, h, defs: hatchDef, body: `<rect width="${w}" height="${h}" fill="#fff"/>` + body, title: `Tray label dieline — ${dir}` }), w, h };
}
const LUNCH_FILL = { for: 'Team lunch · Fri', rows: [{ dish: 'Butter Chicken', diet: 'nonveg', spice: 1 }, { dish: 'Plain Rice', diet: 'veg', spice: 0 }, { dish: 'Garlic Naan', diet: 'veg', spice: 0 }] };
function lunchBoard(dir) {
  const S = lunchStrip(dir); const w = 300, h = 500; let body = '';
  const x0 = 30, y0 = 52;
  body += caption(x0, 46, 'SLEEVE — flat, outside face', dir);
  body += nest(S, x0, y0) + `<rect x="${x0}" y="${y0}" width="${S.W}" height="${f(S.H)}" ${STROKES.cut}/>`;
  let y = y0;
  for (const [k, hh] of S.parts) { if (y > y0) body += `<path d="M${x0} ${f(y)}h${S.W}" ${STROKES.fold}/>`; body += note(x0 + S.W + 6, y + hh / 2 + 1, { glue: 'glue flap', back: 'BACK (reads upright on the box)', top: 'TOP · “which dish is which” legend', front: 'FRONT', bottom: 'BOTTOM' }[k]); y += hh; }
  body += note(x0 + S.W + 6, y0 + S.H + 10, `Fits a 9 × 6 × 2.25 in meal-prep box · band ${inch(LBOX.band)} in wide`);
  const { b, defs } = board({ w, h, dir, title: dir === 'bazaar' ? 'DISTRICT LUNCHBOX' : 'District Lunchbox', sub: 'Corporate catering · printed sleeve with a which-dish-is-which legend', body });
  return { svg: svgDoc({ w, h, defs: defs + S.defs, body: b, title: `District Lunchbox sleeve — ${dir}` }), w, h };
}
function lunchDieline(dir) {
  const S = lunchStrip(dir); const w = 330, h = 520, B = 3; let body = '';
  const x0 = 70, y0 = 50;
  body += `<rect x="${x0 - B}" y="${y0 - B}" width="${S.W + 2 * B}" height="${f(S.H + 2 * B)}" fill="${dir === 'bazaar' ? BZ.saffron : RY.emerald}"/>`;
  body += nest(S, x0, y0);
  body += `<rect x="${x0}" y="${y0}" width="${S.W}" height="${LBOX.glue}" fill="url(#hatch)"/>`;
  body += `<rect x="${x0 - B}" y="${y0 - B}" width="${S.W + 2 * B}" height="${f(S.H + 2 * B)}" ${STROKES.bleed}/>`;
  body += `<rect x="${x0}" y="${y0}" width="${S.W}" height="${f(S.H)}" ${STROKES.cut}/>`;
  let y = y0;
  for (const [k, hh] of S.parts) {
    if (y > y0) body += `<path d="M${x0 - 8} ${f(y)}h${S.W + 16}" ${STROKES.fold}/>`;
    if (k !== 'glue') body += `<rect x="${x0 + B}" y="${f(y + B)}" width="${S.W - 2 * B}" height="${f(hh - 2 * B)}" ${STROKES.safe}/>`;
    body += dimV(x0 - 16, y, y + hh, `${f(hh)}`);
    body += note(x0 + S.W + 8, y + hh / 2 + 1, `${k.toUpperCase()}${k === 'glue' ? ' — unprinted' : ''}`);
    y += hh;
  }
  body += dimH(x0, x0 + S.W, y0 - 12, `${f(LBOX.band)} mm (${inch(LBOX.band)} in)`);
  body += note(x0 + S.W + 8, y0 + S.H + 2, `Flat ${f(S.W)} × ${f(S.H)} mm`);
  body += note(x0 + S.W + 8, y0 + S.H + 7.5, `(${inch(S.W)} × ${inch(S.H)} in)`);
  [`Wraps a 9 × 6 × 2.25 in (229 × 152 × 57 mm) box across its 6 in depth.`, `Score all four folds; glue flap tucks under the back panel.`, `Paperboard sleeve only — never touches food.`].forEach((s, i) => body += note(16, h - 34 + i * 5.5, s));
  body += legend(w - 86, 52, [['glue', 'Glue area — keep unprinted']]);
  body += stamp(w - 112, 12);
  body += T(16, 20, `Lunchbox sleeve dieline · ${dir === 'bazaar' ? 'A · Bazaar' : 'B · Royal'}`, { font: FONT.dm(700), size: 7, fill: '#1d1d24', anchor: 'start' });
  body += note(16, 27, 'Curry District · catering packaging concept · units mm');
  return { svg: svgDoc({ w, h, defs: hatchDef + S.defs, body: `<rect width="${w}" height="${h}" fill="#fff"/>` + body, title: `Lunchbox sleeve dieline — ${dir}` }), w, h };
}
function cartonBoard(dir) {
  const C = CARTON, roof = cartonRoof(dir), side = cartonSide(dir), end = cartonEnd(dir), hand = cartonHandle(dir);
  const w = 780, h = 420; let body = '';
  const x0 = 30, yS = 60 + C.handle + roof.H + 4; // side panel top
  let x = x0;
  body += `<rect x="${x}" y="${yS}" width="12" height="${C.Hb}" fill="url(#hatch)"/>`; x += 12;
  const panels = [['end', C.D], ['side', C.L], ['end', C.D], ['side', C.L]];
  for (const [k, pw] of panels) {
    if (k === 'side') {
      body += nest(side, x, yS) + nest(roof, x, yS - roof.H) + nest(hand, x, yS - roof.H - C.handle);
      body += `<rect x="${f(x + pw / 2 - 38)}" y="${f(yS - roof.H - C.handle + 18)}" width="76" height="20" rx="10" fill="#EFE9DF" stroke="${DL.cut}" stroke-width=".35"/>`;
      body += `<path d="M${x} ${f(yS)}h${pw}M${x} ${f(yS - roof.H)}h${pw}" ${STROKES.fold}/>`;
    } else {
      body += nest(end, x, yS - C.rise);
    }
    body += `<rect x="${x}" y="${f(yS + C.Hb)}" width="${pw}" height="${f(k === 'side' ? C.D / 2 : C.D / 2.6)}" fill="#e9e3d7" stroke="${DL.cut}" stroke-width=".3"/>`;
    body += `<path d="M${x} ${f(yS + C.Hb)}h${pw}" ${STROKES.fold}/>`;
    x += pw;
    body += `<path d="M${x} ${f(yS - (k === 'side' ? 0 : 0))}v${C.Hb}" ${STROKES.fold}/>`;
  }
  body += caption(x0, 52, 'CARTON NET (simplified) — 8 × 5.5 × 3.5 in body, gable handle', dir);
  body += note(x0, h - 30, 'Hand-hole die-cut in the handle panels; end panel carries the write-in card. Crash-lock base flaps shown unprinted. Net is indicative — confirm with supplier.');
  const { b, defs } = board({ w, h, dir, title: dir === 'bazaar' ? 'BOX-LUNCH CARTON' : 'Box-lunch carton', sub: 'Catering · handled carton for individual lunches', body });
  return { svg: svgDoc({ w, h, defs: defs + hatchDef, body: b, title: `Box-lunch carton — ${dir}` }), w, h };
}
function tentBoard(dir) {
  const w = 420, h = 260; let body = '';
  const back = tentBack(dir);
  const zs = ['curry', 'biryani', 'bread'];
  body += caption(22, 46, 'FLAT — back face (upside down) / score / front face · 5 × 7 in flat, 5 × 3.5 in per face', dir);
  zs.forEach((z, i) => {
    const x = 22 + i * 134, y = 54, fr = tentFront(dir, z);
    body += nest(back, x, y, 1, '') .replace('<svg ', `<svg transform="rotate(180 ${f(x + TENT.W / 2)} ${f(y + TENT.H / 2)})" `);
    body += nest(fr, x, y + TENT.H);
    body += `<rect x="${x}" y="${y}" width="${TENT.W}" height="${f(TENT.H * 2)}" ${STROKES.cut}/><path d="M${x} ${f(y + TENT.H)}h${TENT.W}" ${STROKES.fold}/>`;
  });
  const { b, defs } = board({ w, h, dir, title: dir === 'bazaar' ? 'TRAY TENT CARDS' : 'Tray tent cards', sub: 'Catering · buffet tent card per tray, zone colour-coded, write-in dish', body });
  return { svg: svgDoc({ w, h, defs, body: b, title: `Tray tent cards — ${dir}` }), w, h };
}
function magnetBoard(dir) {
  const M = vanMagnet(dir), w = 660, h = 380; let body = '';
  body += nest(M, 25, 50) + `<rect x="25" y="50" width="${M.W}" height="${M.H}" rx="25" ${STROKES.cut}/>`;
  body += note(25, 50 + M.H + 10, 'Vehicle magnet 24 × 12 in (610 × 305 mm), 1 in corner radius · 30 mil magnetic sheet · one per front door.');
  body += note(25, 50 + M.H + 16, 'Web address from the restaurant’s listed site; confirm phone and copy with the owners before print.');
  const { b, defs } = board({ w, h, dir, title: dir === 'bazaar' ? 'CATERING VAN MAGNET' : 'Catering vehicle magnet', sub: 'Catering runs · door magnet for any car — no wrap needed', body });
  return { svg: svgDoc({ w, h, defs: defs + M.defs, body: b, title: `Van magnet — ${dir}` }), w, h };
}

const FILLS = {
  curry: { dish: 'Butter Chicken', serves: '10–12', diet: 'nonveg', spice: 1 },
  biryani: { dish: 'Chicken Dum Biryani', serves: '10–12', diet: 'nonveg', spice: 2 },
  rice: { dish: 'Plain Rice', serves: '12', diet: 'veg' },
  bread: { dish: 'Garlic Naan', serves: '24 pcs', diet: 'veg' },
};
for (const dir of DIRS) {
  PIECES.push({
    id: `lassi-${dir}`,
    textures: [{ name: `lassi-band-${dir}`, art: () => lassiBand(dir), ppm: 16 }, { name: `flag-${dir}`, art: () => strawFlag(dir), ppm: 20, transparent: true }],
    files: [
      { file: `lassi-cup-${dir}.svg`, doc: () => lassiBoard(dir), preview: 4 },
      { file: `art/lassi-band-${dir}.svg`, doc: () => faceDoc(lassiBand(dir), `Lassi cup wrap band (unrolled, UV-ready) — ${dir}`) },
    ],
  });
  PIECES.push({
    id: `sauce-${dir}`,
    textures: SAUCES.map(k => ({ name: `sticker-${dir}-${k}`, art: () => sauceSticker(dir, k, 57.15, { write: k === 'blank' ? (dir === 'bazaar' ? 'Achaar?' : 'Onion') : undefined }), ppm: 16, transparent: true })),
    files: [{ file: `sauce-cups-${dir}.svg`, doc: () => sauceBoard(dir), preview: 4 }],
  });
  PIECES.push({
    id: `tray-${dir}`,
    textures: [
      { name: `traylid-${dir}`, art: () => trayLid(dir), ppm: 8 },
      { name: `label-${dir}-curry`, art: () => zoneLabel(dir, 'curry', FILLS.curry), ppm: 12, transparent: true },
      { name: `label-${dir}-biryani`, art: () => zoneLabel(dir, 'biryani', FILLS.biryani), ppm: 12, transparent: true },
      { name: `label-${dir}-rice`, art: () => zoneLabel(dir, 'biryani', FILLS.rice), ppm: 12, transparent: true },
      { name: `label-${dir}-bread`, art: () => zoneLabel(dir, 'bread', FILLS.bread), ppm: 12, transparent: true },
      { name: `tentf-${dir}-curry`, art: () => tentFront(dir, 'curry', FILLS.curry), ppm: 12 },
      { name: `tentf-${dir}-biryani`, art: () => tentFront(dir, 'biryani', FILLS.biryani), ppm: 12 },
      { name: `tentf-${dir}-bread`, art: () => tentFront(dir, 'bread', FILLS.bread), ppm: 12 },
      { name: `tentb-${dir}`, art: () => tentBack(dir), ppm: 12 },
    ],
    files: [
      { file: `party-tray-${dir}.svg`, doc: () => trayBoard(dir), preview: 2.4 },
      { file: `dieline-tray-label-${dir}.svg`, doc: () => trayLabelDieline(dir), preview: 5 },
      { file: `tray-tent-${dir}.svg`, doc: () => tentBoard(dir), preview: 4 },
    ],
  });
  PIECES.push({
    id: `lunch-${dir}`,
    textures: [
      { name: `lunch-top-${dir}`, art: () => lunchTop(dir, LUNCH_FILL), ppm: 14 },
      { name: `lunch-front-${dir}`, art: () => lunchFront(dir), ppm: 14 },
      { name: `lunch-back-${dir}`, art: () => lunchBack(dir), ppm: 10 },
      { name: `carton-side-${dir}`, art: () => cartonSide(dir), ppm: 10 },
      { name: `carton-end-${dir}`, art: () => cartonEnd(dir, { for: 'Sam · HR team', dish: 'Paneer Butter Masala', diet: 'veg', spice: 1 }), ppm: 10 },
      { name: `carton-roof-${dir}`, art: () => cartonRoof(dir), ppm: 8 },
      { name: `carton-handle-${dir}`, art: () => cartonHandle(dir), ppm: 8 },
      { name: `magnet-${dir}`, art: () => vanMagnet(dir), ppm: 4 },
    ],
    files: [
      { file: `district-lunchbox-${dir}.svg`, doc: () => lunchBoard(dir), preview: 3 },
      { file: `dieline-lunchbox-sleeve-${dir}.svg`, doc: () => lunchDieline(dir), preview: 3.2 },
      { file: `art/lunchbox-sleeve-${dir}.svg`, doc: () => { const s = lunchStrip(dir); return faceDoc(s, `District Lunchbox sleeve strip (flat) — ${dir}`); } },
      { file: `box-lunch-carton-${dir}.svg`, doc: () => cartonBoard(dir), preview: 2 },
      { file: `van-magnet-${dir}.svg`, doc: () => magnetBoard(dir), preview: 2 },
    ],
  });
}
PIECES.push({
  id: 'food',
  textures: [
    { name: 'food-curry', art: () => curry(270, 215, 3), ppm: 6 },
    { name: 'food-biryani', art: () => biryani(270, 215, 5), ppm: 6 },
    { name: 'food-rice', art: () => rice(270, 215, 9), ppm: 6 },
    { name: 'food-naan', art: () => naan(270, 215, 13), ppm: 6 },
    { name: 'lunch-interior', art: () => lunchInterior(222, 146), ppm: 8 },
  ],
});

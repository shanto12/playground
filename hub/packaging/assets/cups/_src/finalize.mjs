// PNG renders of dielines/flat boards, thumbs ≤100 KB, hub manifest + art/manifest.json
import fs from 'fs';
import { execFileSync } from 'child_process';
import { OUT } from './lib.mjs';
import { rasterize } from './raster.mjs';
import { CUP, SLEEVE, CUPG, SLVG, SLEEVE_T } from './art-chai.mjs';
import { LASSI, BAND, BANDG, BAND_T } from './art-drinks.mjs';
import { LBOX, lunchStrip } from './art-catering.mjs';

const dims = f => { const s = fs.readFileSync(`${OUT}/${f}`, 'utf8').slice(0, 600); const m = s.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/); return [+m[1], +m[2]]; };
const flats = ['dieline-chai-sleeve', 'dieline-lunchbox-sleeve', 'dieline-tray-label', 'sauce-cups', 'tray-tent', 'van-magnet'];
const jobs = [];
for (const b of flats) for (const d of ['bazaar', 'royal']) {
  const [w, h] = dims(`${b}-${d}.svg`);
  jobs.push({ svg: `${OUT}/${b}-${d}.svg`, png: `${OUT}/${b}-${d}.png`, px: [1600, Math.round(1600 * h / w)] });
}
if (!process.argv.includes('--skip-raster')) await rasterize(jobs);
const size = png => execFileSync('identify', ['-format', '%w %h', png]).toString().split(' ').map(Number);
function thumb(name) {
  const png = `${OUT}/${name}.png`, t = `${OUT}/${name}-thumb.jpg`;
  execFileSync('convert', [png, '-strip', '-define', 'png:compression-level=9', png]);
  for (const q of [80, 72, 64, 56, 48]) { execFileSync('convert', [png, '-background', '#fff', '-flatten', '-resize', '600x', '-strip', '-interlace', 'Plane', '-quality', String(q), t]); if (fs.statSync(t).size <= 98 * 1024) break; }
}
const DIRS = ['bazaar', 'royal'];
const C = {
  'chai-cup-hero': ['Chai cup, sleeve & lid', { bazaar: 'Kulhad-clay print + “Chai-lo!” sticker sleeve makes a takeaway cup look like a street-stall moment.', royal: 'Terracotta kulhad body under an emerald, gold-arched sleeve: takeaway chai that feels like dine-in.' }, 'chai-cup', ['drinks', 'chai', 'cup', 'sleeve', 'lid']],
  'lassi-cup-hero': ['Mango lassi cup + straw flag', { bazaar: 'Clear cup shows the mango gold; the teal wrap and “Thanda!” flag are pure Bazaar fun.', royal: 'Ivory peacock-eye band and a “Sip slowly.” flag keep the cold drink premium.' }, 'lassi-cup', ['drinks', 'lassi', 'cold cup', 'straw flag']],
  'party-trays-hero': ['Party trays: board lids + zone labels', { bazaar: 'Printed lids stack like a parade; the zone-coloured label says what, how many and how hot at a glance.', royal: 'Midnight-and-gold lids turn foil pans into a celebration spread, labels colour-coded by menu district.' }, 'party-tray', ['catering', 'party tray', 'labels', 'zones']],
  'district-lunchbox-hero': ['District Lunchbox', { bazaar: 'A sleeve with a “which dish is which?” key ends the office-lunch guessing game.', royal: 'Emerald sleeve, ivory legend card: corporate lunches that look considered.' }, 'district-lunchbox', ['catering', 'corporate', 'lunchbox', 'legend']],
  'box-lunch-carton-hero': ['Box-lunch carton with handle', { bazaar: 'Truck-art carton with a write-in end panel — easy to carry, easy to sort.', royal: 'Damask-and-arch carton with a write-in card: a lunch worth carrying.' }, 'box-lunch-carton', ['catering', 'carton', 'box lunch']],
  'party-table-flatlay': ['Party-table flat-lay', { bazaar: 'The whole family on one table: trays, labels, chai, lassi, sauces and napkins all speak Bazaar.', royal: 'One jewel-toned spread — lids, labels, cups and stickers read as a single premium system.' }, 'party-tray', ['catering', 'flat-lay', 'system']],
  'dieline-chai-sleeve': ['Chai sleeve dieline', { bazaar: 'Print-ready layout with bleed, safe zone and glue flap — indicative, confirm with supplier.', royal: 'Print-ready layout with bleed, safe zone and glue flap — indicative, confirm with supplier.' }, 'dieline-chai-sleeve', ['dieline', 'print', 'chai']],
  'dieline-lunchbox-sleeve': ['Lunchbox sleeve dieline', { bazaar: 'Four scored panels around a 9×6 in box, glue flap unprinted — indicative, confirm with supplier.', royal: 'Four scored panels around a 9×6 in box, glue flap unprinted — indicative, confirm with supplier.' }, 'dieline-lunchbox-sleeve', ['dieline', 'print', 'lunchbox']],
  'dieline-tray-label': ['Party-tray label dieline', { bazaar: '6×4 in roll label with zone colour key; only the band colour changes per district.', royal: '6×4 in roll label with zone colour key; only the band colour changes per district.' }, 'dieline-tray-label', ['dieline', 'print', 'labels']],
  'sauce-cups': ['Sauce & chutney cup stickers', { bazaar: 'Scalloped lid stickers for 2 oz and 4 oz cups, plus a write-in “DIP” for everything else.', royal: 'Gold-rope medallions for 2 oz and 4 oz lids, with a write-in chutney sticker.' }, 'sauce-cups', ['drinks', 'sauce', 'stickers']],
  'tray-tent': ['Buffet tray tent cards', { bazaar: 'Zone-coloured tent per tray: dish, serves, diet and spice — written in seconds.', royal: 'Ivory tents with jewel zone bands so a buffet reads like a menu.' }, 'tray-tent', ['catering', 'tent card', 'buffet']],
  'van-magnet': ['Catering car magnet', { bazaar: '“Biryani on board!” turns any delivery car into a rolling billboard.', royal: 'Midnight-and-gold door magnet: celebrations, catered, on the move.' }, 'van-magnet', ['catering', 'vehicle', 'magnet']],
};
const items = [];
for (const [key, [title, caps, dl, tags]] of Object.entries(C)) for (const d of DIRS) {
  const name = `${key}-${d}`;
  if (!fs.existsSync(`${OUT}/${name}.png`)) continue;
  thumb(name);
  const [w, h] = size(`${OUT}/${name}.png`);
  items.push({ id: `cups-${name}`, title: `${title} · ${d === 'bazaar' ? 'A · Bazaar' : 'B · Royal'}`, direction: d, type: 'image', src: `assets/cups/${name}.png`, thumb: `assets/cups/${name}-thumb.jpg`, w, h, caption: caps[d], tags, download: `assets/cups/${dl}-${d}.svg` });
}
fs.writeFileSync(`${OUT}/manifest.json`, JSON.stringify({ helper: 'cups', items }, null, 2));
// 3D-viewer faces
const r2 = n => Math.round(n * 100) / 100;
const art = { helper: 'cups-art', units: 'mm', note: 'Unrolled UV-ready faces: u runs around the cup (u = 0.5 faces the viewer, seam at u = 0/1), v runs down the slant height (v = 1 at the top edge). Frustum sizes are the surface the face covers.', faces: [] };
for (const d of DIRS) {
  art.faces.push({ id: `chai-cup-wrap-${d}`, file: `art/chai-cup-wrap-${d}.svg`, direction: d, kind: 'frustum-wrap', face: { w: r2(CUPG.W), h: r2(CUPG.H) }, frustum: { topDiameter: CUP.Rtop * 2, bottomDiameter: CUP.Rbot * 2, height: CUP.h, coversFromTop: 0, coversToTop: CUP.h }, object: '12 oz hot paper cup', sector: { outerRadius: r2(CUPG.L1), innerRadius: r2(CUPG.L2), angleDeg: r2(CUPG.Phi * 180 / Math.PI) } });
  art.faces.push({ id: `chai-sleeve-${d}`, file: `art/chai-sleeve-${d}.svg`, direction: d, kind: 'frustum-wrap', face: { w: r2(SLVG.W), h: r2(SLVG.H) }, frustum: { topDiameter: r2(SLEEVE.Rtop * 2), bottomDiameter: r2(SLEEVE.Rbot * 2), height: r2(SLEEVE.h), coversFromTop: r2(CUP.h * SLEEVE_T[0]), coversToTop: r2(CUP.h * SLEEVE_T[1]) }, object: 'sleeve on the 12 oz cup', sector: { outerRadius: r2(SLVG.L1), innerRadius: r2(SLVG.L2), angleDeg: r2(SLVG.Phi * 180 / Math.PI) } });
  art.faces.push({ id: `lassi-band-${d}`, file: `art/lassi-band-${d}.svg`, direction: d, kind: 'frustum-wrap', face: { w: r2(BANDG.W), h: r2(BANDG.H) }, frustum: { topDiameter: r2(BAND.Rtop * 2), bottomDiameter: r2(BAND.Rbot * 2), height: r2(BAND.h), coversFromTop: r2(LASSI.h * BAND_T[0]), coversToTop: r2(LASSI.h * BAND_T[1]) }, object: `16 oz clear PET cup Ø${LASSI.Rtop * 2}/${LASSI.Rbot * 2} × ${LASSI.h}` });
  const S = lunchStrip(d); let y = 0; const panels = {};
  for (const [k, hh] of S.parts) { panels[k] = { y: r2(y), h: r2(hh), rotated180: k === 'back' }; y += hh; }
  art.faces.push({ id: `lunchbox-sleeve-${d}`, file: `art/lunchbox-sleeve-${d}.svg`, direction: d, kind: 'band-strip', face: { w: r2(S.W), h: r2(S.H) }, box: { length: LBOX.L, depth: LBOX.D, height: LBOX.Hh }, panels, wraps: 'around the 6 in depth, centred on the 9 in length; top panel reads from the front edge' });
}
fs.writeFileSync(`${OUT}/art/manifest.json`, JSON.stringify(art, null, 2));
console.log('items', items.length);

/* Curry District · room presets: themes (paint + furniture + light) and layouts (camera + items).
   A scene = layout(theme) → cfg for renderRoom(). Change a theme field and every layout re-skins. */
'use strict';
const { BZ, RY, shade, mix } = require('./lib');

/* ───────────── THEMES ───────────── */
const BEFORE = {
  key: 'before', fonts: 'bazaar', label: 'Before',
  room: { ceiling: 'grid', rail: 0 },
  wall: { wainscot: 'none', pilasters: [{ x: 12.6, w: 0.5, color: '#E2D5BC' }], base: '#3A3530' },
  wallpaper: null,
  paint: { upper: '#D9CDB6', wainscot: '#D9CDB6', trim: '#ECE5D6', frieze: '#D9CDB6', ceiling: '#EEEAE0', side: '#D2C5AC', sideWainscot: '#D2C5AC' },
  uph: { color: '#2E2622', piping: '#2E2622', style: 'plain', apron: '#2A221E', kick: '#1A1512' },
  lamp: null,
  floor: { kind: 'plain', colors: ['#C9BBA0', '#C1B297'], size: 1, grout: '#AFA186', groutW: 1.4 },
  table: { top: 'laminate', colors: ['#4E3626'], edge: '#2A2420', base: '#1E1C1A', baseStyle: 'x' },
  chair: { style: 'basic', color: '#3E2A1E' },
  window: { treatment: 'blinds', sky: ['#C9D7DD', '#E9ECE6'], fabric: '#E7DFCD', ground: '#8E8C88', trees: '#7D8E7A' },
  light: { mood: 'flat', pool: 0, grade: '#3A3F3A', gradeTop: 0.1, gradeBottom: 0.12, vignette: 0.16, cast: '#DDE6DE', castOp: 0.12, sun: 0.5, sunColor: '#F4F6EE' },
  props: { plate: '#FFFFFF', rim: '#EEEEEE', vase: false, tent: { color: '#FFFFFF', stroke: '#777777' } },
};

const bz = (o) => Object.assign({ fonts: 'bazaar', room: { ceiling: 'paint', rail: 9 } }, o);
const ry = (o) => Object.assign({ fonts: 'royal', room: { ceiling: 'paint', rail: 9 } }, o);

const TH = {
  /* A · BAZAAR */
  'bz-marigold': bz({
    key: 'bz-marigold', dir: 'bazaar', label: 'Marigold Garland on Saffron',
    wallpaper: { dir: 'bazaar', file: '01-marigold-garland-sunset.svg', repeat: 24 },
    wp: 'Marigold Garland · Sunset', paintName: 'Tandoor Saffron wainscot · Peacock Teal bay',
    wall: { wainscot: 'panels', pilasters: [{ x: 12.6, w: 0.5, color: BZ.ink }], base: BZ.ink },
    paint: { upper: BZ.peacock, wainscot: BZ.saffron, trim: BZ.ink, frieze: BZ.cream, ceiling: '#FFD9A8', side: BZ.cream2, sideWainscot: BZ.saffron },
    uph: { color: BZ.rani, piping: BZ.marigold, style: 'channel', kick: BZ.ink },
    lamp: { style: 'dome', color: BZ.peacock, metal: 'brass', outline: BZ.ink, band: BZ.marigold },
    floor: { kind: 'flower', colors: [BZ.cream, mix(BZ.peacock, BZ.cream, 0.3), mix(BZ.saffron, BZ.cream, 0.12), BZ.ink], size: 8 / 12, grout: '#E8D9B8' },
    table: { top: 'terrazzo', colors: ['#FFF1D6', BZ.rani, BZ.marigold, BZ.peacock, '#FFFFFF', BZ.saffron], edge: 'brass', base: BZ.ink },
    chair: { style: 'cafe', color: BZ.ink, seat: BZ.marigold },
    window: { treatment: 'cafe', sky: ['#FFB27A', '#FFE2B0'], fabric: BZ.cream, fabric2: BZ.rani, ground: '#7B5A6B', trees: '#3E6B4E' },
    light: { mood: 'evening', wallDim: 0.2, warm: '#FFD08A', pool: 0.5, grade: BZ.ink, gradeTop: 0.16, gradeBottom: 0.22, vignette: 0.3, sun: 0.4 },
    print: { art: 'chai', frame: BZ.ink, mat: BZ.cream }, menu: 'bazaar', plant: { pot: BZ.saffron, potBand: BZ.ink, potBand2: BZ.cream },
    props: { plate: '#FFFFFF', rim: BZ.cream, food: '#E07A1F', food2: '#3FA34D', vase: BZ.marigold, tent: { color: BZ.marigold, stroke: BZ.ink } },
  }),
  'bz-arches': bz({
    key: 'bz-arches', dir: 'bazaar', label: 'Jaipur Arches on Peacock',
    wallpaper: { dir: 'bazaar', file: '07-jaipur-arches-fresh.svg', repeat: 27 },
    wp: 'Jaipur Arches · Fresh', paintName: 'Peacock Teal wainscot · Genda Marigold bay',
    wall: { wainscot: 'beadboard', pilasters: [{ x: 12.6, w: 0.5, color: BZ.marigold }], base: BZ.ink },
    paint: { upper: BZ.marigold, wainscot: BZ.peacock, trim: BZ.cream, frieze: BZ.cream, ceiling: BZ.cream, side: BZ.cream2, sideWainscot: BZ.peacock },
    uph: { color: BZ.saffron, piping: BZ.ink, style: 'panel', kick: BZ.ink },
    lamp: { style: 'rattan', color: '#C98B4A', metal: 'black' },
    floor: { kind: 'diamond', colors: [BZ.cream, BZ.peacock, BZ.marigold], size: 8 / 12, grout: '#E3D3AE' },
    table: { top: 'terrazzo', colors: ['#FFF4DC', BZ.peacock, BZ.saffron, BZ.cilantro, BZ.marigold], edge: 'brass', base: BZ.ink },
    chair: { style: 'cane', color: BZ.ink, cane: '#E9C98A' },
    window: { treatment: 'cafe', sky: ['#FFB27A', '#FFE2B0'], fabric: BZ.cream, fabric2: BZ.peacock, ground: '#7B5A6B', trees: '#3E6B4E' },
    light: { mood: 'evening', wallDim: 0.2, warm: '#FFD08A', pool: 0.48, grade: BZ.ink, gradeTop: 0.16, gradeBottom: 0.22, vignette: 0.3, sun: 0.4 },
    print: { art: 'chai', frame: BZ.ink, mat: BZ.cream }, menu: 'bazaar', plant: { pot: BZ.rani, potBand: BZ.marigold, potBand2: BZ.ink },
    props: { plate: '#FFFFFF', rim: BZ.cream, food: '#E07A1F', food2: '#3FA34D', vase: BZ.rani, tent: { color: BZ.peacock, stroke: BZ.ink } },
  }),
  'bz-booti': bz({
    key: 'bz-booti', dir: 'bazaar', label: 'Block-Print Booti on Indigo',
    wallpaper: { dir: 'bazaar', file: '03-block-print-booti-night.svg', repeat: 21 },
    wp: 'Block-Print Booti · Night', paintName: 'Ink Indigo wainscot · Rani Pink bay',
    wall: { wainscot: 'panels', pilasters: [{ x: 12.6, w: 0.5, color: BZ.ink }], base: BZ.ink, railBrass: true },
    paint: { upper: BZ.rani, wainscot: BZ.ink, trim: BZ.marigold, frieze: BZ.ink, ceiling: '#2A1A5E', side: '#2A1A5E', sideWainscot: BZ.ink },
    uph: { color: BZ.peacock, piping: BZ.marigold, style: 'tufted', kick: '#120A2E', button: BZ.marigold },
    lamp: { style: 'scallop', color: BZ.marigold, metal: 'brass', band: BZ.rani, outline: BZ.ink },
    floor: { kind: 'flower', colors: [BZ.cream, mix(BZ.ink, BZ.cream, 0.15), mix(BZ.rani, BZ.cream, 0.15), BZ.marigold], size: 8 / 12, grout: '#E3D3AE' },
    table: { top: 'terrazzo', colors: ['#FFF4DC', BZ.ink, BZ.rani, BZ.peacock, BZ.marigold], edge: 'brass', base: BZ.ink },
    chair: { style: 'cafe', color: BZ.marigold, seat: BZ.rani },
    window: { treatment: 'cafe', sky: ['#5A3C8C', '#FF9A6B'], fabric: BZ.cream, fabric2: BZ.marigold, ground: '#3A2E5A', trees: '#22324A' },
    light: { mood: 'evening', wallDim: 0.25, warm: '#FFC978', pool: 0.62, grade: '#0E0828', gradeTop: 0.3, gradeBottom: 0.25, vignette: 0.36, sun: 0.25, sunColor: '#FFB98A' },
    print: { art: 'chai', frame: BZ.marigold, mat: BZ.cream }, menu: 'bazaar', plant: { pot: BZ.peacock, potBand: BZ.marigold, potBand2: BZ.cream },
    props: { plate: '#FFFFFF', rim: BZ.cream, food: '#E07A1F', food2: '#3FA34D', vase: BZ.marigold, tent: { color: BZ.rani, stroke: BZ.ink } },
  }),
  'bz-chai': bz({
    key: 'bz-chai', dir: 'bazaar', label: 'Chai Time on Rani',
    wallpaper: { dir: 'bazaar', file: '05-chai-time-sunset.svg', repeat: 24 },
    wp: 'Chai Time · Sunset', paintName: 'Rani Pink wainscot · Genda Marigold bay',
    wall: { wainscot: 'panels', pilasters: [{ x: 12.6, w: 0.5, color: BZ.peacock }], base: BZ.ink },
    paint: { upper: BZ.marigold, wainscot: BZ.rani, trim: BZ.peacock, frieze: BZ.cream, ceiling: BZ.cream, side: BZ.cream2, sideWainscot: BZ.rani },
    uph: { color: BZ.peacock, piping: BZ.cream, style: 'channel', kick: BZ.ink },
    lamp: { style: 'dome', color: BZ.marigold, metal: 'brass', outline: BZ.ink, band: BZ.rani },
    floor: { kind: 'flower', colors: [BZ.cream, mix(BZ.peacock, BZ.cream, 0.3), mix(BZ.rani, BZ.cream, 0.2), BZ.ink], size: 8 / 12, grout: '#E8D9B8' },
    table: { top: 'terrazzo', colors: ['#FFF1D6', BZ.peacock, BZ.rani, BZ.marigold, BZ.ink], edge: 'brass', base: BZ.ink },
    chair: { style: 'cafe', color: BZ.ink, seat: BZ.peacock },
    window: { treatment: 'cafe', sky: ['#FFB27A', '#FFE2B0'], fabric: BZ.cream, fabric2: BZ.peacock, ground: '#7B5A6B', trees: '#3E6B4E' },
    light: { mood: 'evening', wallDim: 0.2, warm: '#FFD08A', pool: 0.5, grade: BZ.ink, gradeTop: 0.16, gradeBottom: 0.22, vignette: 0.3, sun: 0.4 },
    print: { art: 'chai', frame: BZ.ink, mat: BZ.cream }, menu: 'bazaar', plant: { pot: BZ.ink, potBand: BZ.marigold, potBand2: BZ.rani },
    props: { plate: '#FFFFFF', rim: BZ.cream, food: '#E07A1F', food2: '#3FA34D', vase: BZ.ink, tent: { color: BZ.marigold, stroke: BZ.ink } },
  }),

  /* B · ROYAL */
  'ry-jali': ry({
    key: 'ry-jali', dir: 'royal', label: 'Jali Lattice on Midnight',
    wallpaper: { dir: 'royal', file: '01-jali-lattice-midnight.svg', repeat: 24 },
    wp: 'Jali Lattice · Midnight', paintName: 'Midnight Aubergine wainscot · Plum Velvet bay',
    wall: { wainscot: 'panels', pilasters: [{ x: 12.6, w: 0.5, color: RY.ink }], base: RY.ink, railBrass: true },
    paint: { upper: RY.plum, wainscot: RY.ink, trim: RY.gold, frieze: RY.ink, ceiling: '#1E1030', side: '#2A1240', sideWainscot: RY.plum },
    uph: { color: RY.emerald, piping: RY.gold, style: 'channel', kick: '#0B0614', kickBrass: true },
    lamp: { style: 'lantern', color: RY.plum, metal: 'brass' },
    floor: { kind: 'star', colors: [RY.ivory, RY.emerald, RY.gold, mix(RY.plum, RY.ivory, 0.15)], size: 8 / 12, grout: '#D8CBB0' },
    table: { top: 'terrazzo', colors: ['#F6EEDF', RY.emerald, RY.gold, '#FFFFFF', RY.ruby, '#CFC3AE'], edge: 'brass', base: 'brass' },
    chair: { style: 'upholstered', color: RY.ruby, leg: 'brass', piping: RY.gold },
    window: { treatment: 'drape', sky: ['#2A1A4E', '#B4628A'], fabric: RY.ruby, ground: '#2A2040', trees: '#1A2A30' },
    light: { mood: 'evening', wallDim: 0.3, warm: '#FFC978', pool: 0.75, grade: '#0B0614', gradeTop: 0.32, gradeBottom: 0.28, vignette: 0.42, sun: 0.18, sunColor: '#E8A0B0' },
    print: { art: 'arch', frame: 'brass', mat: RY.ivory }, menu: 'royal', plant: { potStyle: 'brass' },
    props: { plate: RY.ivory, rim: '#EFE3CC', food: '#B5451B', food2: '#2F7D3A', vase: 'url(#gBrass)', candle: true, tent: null },
  }),
  'ry-mehrab': ry({
    key: 'ry-mehrab', dir: 'royal', label: 'Mehrab Trellis on Emerald',
    wallpaper: { dir: 'royal', file: '02-mehrab-trellis-emerald.svg', repeat: 27 },
    wp: 'Mehrab Trellis · Emerald', paintName: 'Deep Emerald wainscot · Ivory bay',
    wall: { wainscot: 'panels', pilasters: [{ x: 12.6, w: 0.5, color: RY.emerald }], base: RY.ink, railBrass: true },
    paint: { upper: RY.ivory, wainscot: RY.emerald, trim: RY.gold, frieze: RY.emerald, ceiling: '#0C3A30', side: RY.sand, sideWainscot: RY.emerald },
    uph: { color: RY.ruby, piping: RY.gold, style: 'tufted', kick: '#0B0614', button: RY.gold },
    lamp: { style: 'bell', metal: 'brass' },
    floor: { kind: 'star', colors: [RY.emerald, RY.ivory, RY.gold, RY.gold], size: 8 / 12, grout: '#0A3329' },
    table: { top: 'marble', colors: ['#F5EFE4', '#B8AE9C'], edge: 'brass', base: 'brass' },
    chair: { style: 'upholstered', color: RY.plum, leg: 'brass', piping: RY.gold },
    window: { treatment: 'drape', sky: ['#2A1A4E', '#E7A07A'], fabric: RY.emerald, ground: '#2A2040', trees: '#1A2A30' },
    light: { mood: 'evening', wallDim: 0.28, warm: '#FFC978', pool: 0.66, grade: '#0B0614', gradeTop: 0.3, gradeBottom: 0.26, vignette: 0.4, sun: 0.2, sunColor: '#F2B48A' },
    print: { art: 'arch', frame: 'brass', mat: RY.ivory }, menu: 'royal', plant: { potStyle: 'brass' },
    props: { plate: RY.ivory, rim: '#EFE3CC', food: '#B5451B', food2: '#2F7D3A', vase: 'url(#gBrass)', candle: true, tent: null },
  }),
  'ry-paisley': ry({
    key: 'ry-paisley', dir: 'royal', label: 'Paisley Vine on Ruby',
    wallpaper: { dir: 'royal', file: '03-paisley-vine-ruby.svg', repeat: 27 },
    wp: 'Paisley Vine · Ruby', paintName: 'Plum Velvet wainscot · Blush bay',
    wall: { wainscot: 'panels', pilasters: [{ x: 12.6, w: 0.5, color: RY.plum }], base: RY.ink, railBrass: true },
    paint: { upper: RY.blush, wainscot: RY.plum, trim: RY.gold, frieze: RY.ruby, ceiling: '#5A1630', side: '#E9B9AA', sideWainscot: RY.plum },
    uph: { color: RY.emerald, piping: RY.gold, style: 'panel', kick: '#0B0614', kickBrass: true },
    lamp: { style: 'globe', metal: 'brass' },
    floor: { kind: 'check', colors: [RY.ivory, '#2A1240'], size: 1, grout: '#BFB09A', groutW: 0.8 },
    table: { top: 'terrazzo', colors: ['#F7EFE6', RY.ruby, RY.gold, RY.emerald, '#FFFFFF', RY.blush], edge: 'brass', base: RY.ink },
    chair: { style: 'upholstered', color: RY.blush, leg: 'brass', piping: RY.gold },
    window: { treatment: 'drape', sky: ['#3A1E5A', '#F0A882'], fabric: RY.plum, ground: '#2A2040', trees: '#1A2A30' },
    light: { mood: 'evening', wallDim: 0.28, warm: '#FFC978', pool: 0.6, grade: '#1A0716', gradeTop: 0.28, gradeBottom: 0.26, vignette: 0.38, sun: 0.22, sunColor: '#F2B48A' },
    print: { art: 'arch', frame: 'brass', mat: RY.ivory }, menu: 'royal', plant: { potStyle: 'brass' },
    props: { plate: RY.ivory, rim: '#EFE3CC', food: '#B5451B', food2: '#2F7D3A', vase: 'url(#gBrass)', candle: true, tent: null },
  }),
  'ry-botanical': ry({
    key: 'ry-botanical', dir: 'royal', label: 'Spice Botanical on Aubergine',
    wallpaper: { dir: 'royal', file: '07-spice-botanical-emerald.svg', repeat: 27 },
    wp: 'Spice Botanical · Emerald', paintName: 'Midnight Aubergine wainscot · Saffron Gold bay',
    wall: { wainscot: 'panels', pilasters: [{ x: 12.6, w: 0.5, color: RY.ink }], base: RY.ink, railBrass: true },
    paint: { upper: RY.gold, wainscot: '#2A1240', trim: RY.gold, frieze: RY.emerald, ceiling: '#0C3A30', side: RY.sand, sideWainscot: '#2A1240' },
    uph: { color: RY.blush, piping: RY.ruby, style: 'channel', kick: '#0B0614', kickBrass: true },
    lamp: { style: 'lantern', color: RY.emerald, metal: 'brass' },
    floor: { kind: 'star', colors: [RY.ivory, '#2A1240', RY.gold, RY.emerald], size: 8 / 12, grout: '#D8CBB0' },
    table: { top: 'terrazzo', colors: ['#2A1240', RY.gold, '#FFFFFF', RY.blush, RY.peacock], edge: 'brass', base: 'brass' },
    chair: { style: 'upholstered', color: RY.emerald, leg: 'brass', piping: RY.gold },
    window: { treatment: 'drape', sky: ['#2A1A4E', '#E7A07A'], fabric: RY.emerald, ground: '#2A2040', trees: '#1A2A30' },
    light: { mood: 'evening', wallDim: 0.28, warm: '#FFC978', pool: 0.66, grade: '#0B0614', gradeTop: 0.3, gradeBottom: 0.26, vignette: 0.4, sun: 0.2, sunColor: '#F2B48A' },
    print: { art: 'arch', frame: 'brass', mat: RY.ivory }, menu: 'royal', plant: { potStyle: 'brass' },
    props: { plate: RY.ivory, rim: '#EFE3CC', food: '#B5451B', food2: '#2F7D3A', vase: 'url(#gBrass)', candle: true, tent: null },
  }),
};

/* colour-drench variants: walls + ceiling + trim in one hue, no wallpaper (the cheapest big move) */
TH['bz-drench'] = Object.assign({}, TH['bz-marigold'], {
  key: 'bz-drench', label: 'Peacock colour-drench', wallpaper: null, wp: 'No wallpaper — paint only', paintName: 'Peacock Teal everywhere · Marigold accents',
  wall: { zones: [{ x0: 0, x1: 12.6, upper: 'paint' }, { x0: 13.1, x1: 40, upper: 'paint' }], wainscot: 'panels', pilasters: [{ x: 12.6, w: 0.5, color: '#00968F' }], base: '#00807A' },
  paint: { upper: BZ.peacock, wainscot: '#00968F', trim: '#00968F', frieze: BZ.peacock, ceiling: '#00968F', side: '#00A39B', sideWainscot: '#008F88' },
  uph: { color: BZ.rani, piping: BZ.marigold, style: 'channel', kick: BZ.ink },
  lamp: { style: 'dome', color: BZ.marigold, metal: 'brass', outline: BZ.ink, band: BZ.rani },
  chair: { style: 'cafe', color: BZ.marigold, seat: BZ.rani },
  floor: { kind: 'flower', colors: [BZ.cream, BZ.saffron, BZ.marigold, BZ.ink], size: 8 / 12, grout: '#E8D9B8' },
  print: { art: 'chai', frame: BZ.marigold, mat: BZ.cream },
});
TH['ry-drench'] = Object.assign({}, TH['ry-mehrab'], {
  key: 'ry-drench', label: 'Emerald colour-drench', wallpaper: null, wp: 'No wallpaper — paint only', paintName: 'Deep Emerald everywhere · brass & ruby accents',
  wall: { zones: [{ x0: 0, x1: 12.6, upper: 'paint' }, { x0: 13.1, x1: 40, upper: 'paint' }], wainscot: 'panels', pilasters: [{ x: 12.6, w: 0.5, color: '#0D4438' }], base: '#0A3A30', railBrass: true },
  paint: { upper: RY.emerald, wainscot: '#0D4438', trim: '#0D4438', frieze: RY.emerald, ceiling: '#0D4438', side: '#115545', sideWainscot: '#0D4438' },
  uph: { color: RY.ruby, piping: RY.gold, style: 'channel', kick: '#0B0614', kickBrass: true },
  floor: { kind: 'star', colors: [RY.ivory, RY.emerald, RY.gold, mix(RY.plum, RY.ivory, 0.15)], size: 8 / 12, grout: '#D8CBB0' },
  chair: { style: 'upholstered', color: RY.blush, leg: 'brass', piping: RY.gold },
  lamp: { style: 'globe', metal: 'brass' },
});

/* ───────────── LAYOUTS ───────────── */
function tableProps(t, variant = 0) {
  const p = t.props || {};
  const a = [
    { t: 'plate', dx: -0.45, dz: -0.35, color: p.plate, rim: p.rim, food: p.food, food2: p.food2 },
    { t: 'plate', dx: 0.45, dz: 0.35, color: p.plate, rim: p.rim, food: variant ? '#F2C14E' : p.food, food2: p.food2 },
    { t: 'katori', dx: 0.35, dz: -0.55, food: '#C0471B' },
    { t: 'glass', dx: -0.8, dz: 0.5 },
    { t: 'glass', dx: 0.85, dz: -0.2 },
  ];
  if (p.vase) a.push({ t: 'vase', dx: 0, dz: -0.85, color: p.vase, flower: '#FFB000', flower2: '#FF6A13' });
  if (p.candle) a.push({ t: 'candle', dx: -0.15, dz: 0.1 });
  if (p.tent) a.push({ t: 'tent', dx: 0.05, dz: -0.95, color: p.tent.color, stroke: p.tent.stroke });
  return a;
}

/* MAIN: 16:9 corner — window return wall, wallpapered banquette bay, painted bay with menu board */
function main(t, extra = {}) {
  const isBefore = t.key === 'before';
  const items = [
    { type: 'banquette', x0: 0.25, x1: 11.8, z: 0.3 },
    { type: 'table', x: 3.25, z: 3.15, props: tableProps(t) },
    { type: 'table', x: 8.15, z: 3.15, props: tableProps(t, 1) },
    { type: 'chair', x: 3.0, z: 5.15, view: 'back' },
    { type: 'chair', x: 8.45, z: 5.15, view: 'back' },
    { type: 'table', x: 16.8, z: 3.0, props: tableProps(t, 1).slice(0, 4) },
    { type: 'chair', x: 15.25, z: 2.98, view: 'profile', dir: 1 },
    { type: 'chair', x: 18.35, z: 2.98, view: 'profile', dir: -1 },
  ];
  if (isBefore) {
    items.push({ wall: true, type: 'tv', x: 5.0, y: 8.0, w: 3.6, h: 2.1, screen: '#4A5A6C' });
    items.push({ wall: true, type: 'tv', x: 15.3, y: 8.1, w: 3.2, h: 1.85, screen: '#5A6A7A' });
    items.push({ wall: true, type: 'print', x: 19.4, y: 6.9, w: 1.3, h: 1.0, art: 'beige', frame: '#2A2420', mat: '#EFE7D6', frameW: 1 });
    items.push({ type: 'plant', x: 20.6, z: 0.9, kind: 'snake', h: 2.4, pot: '#3A3530', potH: 11, potW: 11, greens: ['#6E8B5A', '#7C9866', '#5F7A4E'], edge: '#A9B48A', seed: 5 });
  } else {
    items.push({ type: 'pendant', x: 3.25, z: 3.15, y: 5.0 });
    items.push({ type: 'pendant', x: 8.15, z: 3.15, y: 5.0 });
    items.push({ type: 'pendant', x: 16.8, z: 3.0, y: 5.0 });
    items.push(Object.assign({ wall: true, type: 'print', x: 4.75, y: 7.95, w: 2.0, h: 2.6 }, t.print));
    items.push(t.menu === 'royal' ? { wall: true, type: 'menu', style: 'royal', x: 15.45, y: 8.45, w: 2.7, h: 2.45 } : { wall: true, type: 'menu', style: t.menu, x: 15.2, y: 8.3, w: 3.3, h: 2.3 });
    items.push(Object.assign({ type: 'plant', x: 20.5, z: 1.1, kind: 'fig', h: 6.2, seed: 3, potH: 17, potW: 15 }, t.plant));
    items.push(Object.assign({ type: 'plant', x: 12.15, z: 0.8, kind: 'snake', h: 2.6, seed: 8, potH: 12, potW: 11 }, t.plant, { greens: ['#2F6B3A', '#3E8A4A', '#255A30'] }));
    if (t.dir === 'bazaar') items.push({ wall: true, type: 'garland', x: 14.75, y: 8.86, w: 4.2, swags: 3, sag: 3.4, drops: false });
  }
  return Object.assign({
    fonts: t.fonts, room: t.room, wall: t.wall, wallpaper: t.wallpaper, paint: t.paint, uph: t.uph, lamp: t.lamp || {}, floor: t.floor, table: t.table, chair: t.chair, window: t.window, light: t.light,
    items, seed: 7,
  }, extra);
}

module.exports = { TH, BEFORE, main, tableProps };

function base(t, extra) {
  return Object.assign({ fonts: t.fonts, room: t.room, wall: t.wall, wallpaper: t.wallpaper, paint: t.paint, uph: t.uph, lamp: t.lamp || {}, floor: t.floor, table: t.table, chair: t.chair, window: t.window, light: t.light, seed: 7 }, extra);
}
const zonesAll = (wall) => Object.assign({}, wall, { zones: [{ x0: -10, x1: 60, upper: 'wallpaper' }], pilasters: [] });

/* VIGNETTE · booth + table close-up (seated eye level, no floor) */
function boothClose(t, extra = {}) {
  const items = [
    { type: 'banquette', x0: -2, x1: 16, z: 0.3 },
    { type: 'table', x: 4.3, z: 2.95, props: tableProps(t), chips: 160 },
    { type: 'table', x: 10.4, z: 2.95, props: tableProps(t, 1), chips: 160 },
    { type: 'pendant', x: 4.3, z: 2.95, y: 5.0, poolR: 3.0, poolRy: 2.4 },
    { type: 'pendant', x: 10.4, z: 2.95, y: 5.0, poolR: 3.0, poolRy: 2.4 },
  ];
  return base(t, Object.assign({
    cam: { k: 170, D: 10, E: 4.35, hY: 372, camX: 6.6 },
    room: Object.assign({}, t.room, { side: false }),
    wall: zonesAll(t.wall),
    items,
  }, extra));
}

/* VIGNETTE · feature wall + neon slot (photo corner) — neon art left to the murals team */
function neonWall(t, extra = {}) {
  const isB = t.dir === 'bazaar';
  const items = [
    { type: 'bench', x: 3.4, w: 9.2, z: 1.0, uph: t.benchUph || {}, cushions: isB ?
      [{ x: 0.5, w: 1.5, color: '#E4147E', pattern: '#FFB000', h: 13 }, { x: 2.3, w: 1.2, color: '#FFB000', h: 11 }, { x: 5.6, w: 1.3, color: '#00A8A0', pattern: '#FFF4DC', h: 12 }, { x: 7.2, w: 1.5, color: '#FF6A13', h: 13 }] :
      [{ x: 0.6, w: 1.5, color: '#A3173F', pattern: '#E9A63A', h: 13 }, { x: 2.4, w: 1.2, color: '#E9A63A', h: 11 }, { x: 5.5, w: 1.3, color: '#117C86', pattern: '#F7D98A', h: 12 }, { x: 7.1, w: 1.5, color: '#4B1D52', pattern: '#E9A63A', h: 13 }] },
    { wall: true, type: 'neonSlot', x: 5.15, y: 7.75, w: 5.7, h: 3.0, shape: isB ? 'rect' : 'arch', color: isB ? '#FF3D9A' : '#F7D98A',
      font: isB ? "'Bowlby One',sans-serif" : "'Fraunces',serif", font2: isB ? "'DM Sans',sans-serif" : "'Hanken Grotesk',sans-serif", fs: isB ? 3.4 : 3.8,
      label: isB ? 'NEON ARTWORK HERE' : 'Neon artwork here', label2: 'placeholder · artwork by the murals & neon team' },
    { wall: true, type: 'sconce', x: 3.1, y: 6.2, metal: isB ? 'black' : 'brass', shade: isB ? 'tulip' : 'drum', color: isB ? '#FFB000' : '#FBF3E4' },
    { wall: true, type: 'sconce', x: 12.4, y: 6.2, metal: isB ? 'black' : 'brass', shade: isB ? 'tulip' : 'drum', color: isB ? '#FFB000' : '#FBF3E4' },
    Object.assign({ type: 'plant', x: 1.6, z: 1.2, kind: 'fig', h: 6.0, seed: 4, potH: 17, potW: 15 }, t.plant),
    Object.assign({ type: 'plant', x: 14.4, z: 1.0, kind: 'snake', h: 3.2, seed: 9, potH: 13, potW: 12 }, t.plant),
  ];
  if (isB) items.push({ wall: true, type: 'garland', x: 4.2, y: 8.55, w: 7.6, swags: 4, sag: 4 });
  return base(t, Object.assign({
    cam: { k: 108, D: 13, E: 4.9, hY: 418, camX: 8.0 },
    room: Object.assign({}, t.room, { side: false }),
    wall: zonesAll(t.wall),
    light: Object.assign({}, t.light, { pool: t.light.pool * 0.8 }),
    items,
  }, extra));
}

/* VIGNETTE · Bazaar chai corner */
function chaiCorner(t, extra = {}) {
  const items = [
    { type: 'counter', x: 2.6, w: 6.2, z: 1.15, d: 2.0, h: 3.1, top: '#FFF4DC', topChips: '#E4147E', front: '#E4147E', panel: '#1D1147', accent: '#FFB000', accent2: '#00A8A0',
      props: [{ t: 'kettle', u: 0.22 }, { t: 'chaiglass', u: 0.42, dz: 0.2 }, { t: 'chaiglass', u: 0.5, dz: 0.3 }, { t: 'chaiglass', u: 0.58, dz: 0.15 }, { t: 'vase', u: 0.8, dz: -0.2, color: '#00A8A0', flower: '#FFB000', flower2: '#FF6A13' }] },
    { wall: true, type: 'shelf', x: 3.0, y: 6.0, w: 5.4 },
    { wall: true, type: 'sign', x: 3.7, y: 8.45, w: 4.0, h: 1.7, text: 'CHAI', sub: 'pull up a stool', bg: '#E4147E' },
    { wall: true, type: 'garland', x: 0.6, y: 8.95, w: 11.2, swags: 5, sag: 4 },
    { type: 'stool', x: 4.1, z: 3.3, color: '#1D1147', seat: '#FFB000' },
    { type: 'stool', x: 7.2, z: 3.3, color: '#1D1147', seat: '#00A8A0' },
    { type: 'pendant', x: 5.7, z: 1.3, y: 6.4, lamp: { style: 'dome', color: '#FFB000', outline: '#1D1147', band: '#E4147E' }, poolR: 2.8, poolRy: 2.2 },
    { type: 'table', x: 12.2, z: 2.8, w: 24, d: 24, props: [{ t: 'chaiglass', dx: -0.2 }, { t: 'chaiglass', dx: 0.25, dz: 0.1 }, { t: 'plate', dx: 0, dz: -0.2, food: '#E8A23A', food2: '#3FA34D' }], chips: 60 },
    { type: 'chair', x: 10.9, z: 2.78, view: 'profile', dir: 1 },
    { type: 'pendant', x: 12.2, z: 2.8, y: 5.2, lamp: { style: 'dome', color: '#00A8A0', outline: '#1D1147', band: '#FFB000' }, poolR: 2.6, poolRy: 2.2 },
    Object.assign({ type: 'plant', x: 14.3, z: 1.0, kind: 'fig', h: 5.6, seed: 12, potH: 16, potW: 14 }, t.plant),
  ];
  return base(t, Object.assign({
    cam: { k: 112, D: 13, E: 4.8, hY: 470, camX: 7.4 },
    room: Object.assign({}, t.room, { side: true }),
    wall: Object.assign({}, t.wall, { zones: [{ x0: 0, x1: 60, upper: 'wallpaper' }], pilasters: [], wainscot: 'tile' }),
    window: Object.assign({}, t.window, { z0: 1.0, z1: 4.0 }),
    items,
  }, extra));
}

/* VIGNETTE · Royal jali-screen room divider */
function jaliDivider(t, extra = {}) {
  const items = [
    { type: 'banquette', x0: 0.25, x1: 20.5, z: 0.3 },
    { type: 'table', x: 3.0, z: 3.0, props: tableProps(t) },
    { type: 'table', x: 7.6, z: 3.0, props: tableProps(t, 1) },
    { type: 'table', x: 14.2, z: 2.9, props: tableProps(t) },
    { type: 'chair', x: 2.7, z: 5.0, view: 'back' },
    { type: 'chair', x: 7.9, z: 5.0, view: 'back' },
    { type: 'pendant', x: 3.0, z: 3.0, y: 5.0 },
    { type: 'pendant', x: 7.6, z: 3.0, y: 5.0 },
    { type: 'pendant', x: 14.2, z: 2.9, y: 5.0 },
    { type: 'jali', x: 10.6, z: 4.7, panels: 3, pw: 3.1, ph: 7.6, color: t.jaliColor || '#E9A63A', plinth: '#160B26', cell: 5.2 },
    Object.assign({ type: 'plant', x: 10.0, z: 5.2, kind: 'palm', h: 4.8, seed: 21, potH: 16, potW: 14 }, t.plant),
    Object.assign({ wall: true, type: 'print', x: 4.45, y: 7.95, w: 2.0, h: 2.6 }, t.print),
  ];
  return base(t, Object.assign({
    cam: { k: 80, D: 20, E: 5.0, hY: 440, camX: 9.6 },
    room: Object.assign({}, t.room, { side: true }),
    wall: Object.assign({}, t.wall, { zones: [{ x0: 0, x1: 60, upper: 'wallpaper' }], pilasters: [] }),
    items,
  }, extra));
}

/* PANEL · wallpaper scale study (narrow frame, one booth + a 6-ft figure for scale) */
function scalePanel(t, repeat, extra = {}) {
  const items = [
    { type: 'banquette', x0: 0.4, x1: 7.6, z: 0.3 },
    { type: 'table', x: 4.0, z: 3.0, props: tableProps(t) },
    { type: 'pendant', x: 4.0, z: 3.0, y: 5.0 },
    { type: 'figure', x: 8.6, z: 3.2, color: t.dir === 'royal' ? '#160B26' : '#1D1147' },
  ];
  return base(t, Object.assign({
    W: 620, H: 900,
    cam: { k: 62, D: 20, E: 5.2, hY: 360, camX: 4.9 },
    room: Object.assign({}, t.room, { side: false }),
    wall: Object.assign({}, zonesAll(t.wall)),
    wallpaper: Object.assign({}, t.wallpaper, { repeat }),
    items,
  }, extra));
}

module.exports.boothClose = boothClose;
module.exports.neonWall = neonWall;
module.exports.chaiCorner = chaiCorner;
module.exports.jaliDivider = jaliDivider;
module.exports.scalePanel = scalePanel;
module.exports.base = base;

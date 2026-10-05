/* Curry District · parametric room-scene generator.
   renderRoom(cfg) → standalone SVG string (16:9 flat-perspective elevation of a casual-dining corner).
   Every surface is a parameter: wallpaper tile + repeat (inches) + colourway, paints, upholstery, lamps, floor tile, table tops …
   Units: world = feet (X along back wall from left corner, Y up, Z toward viewer). Billboards draw in INCHES (+y down). */
'use strict';
const L = require('./lib');
const { n, h, poly, pathFrom, esc, rng, Cam, mix, shade, lum } = L;

const DEF = {
  W: 1920, H: 1080,
  cam: { k: 76, D: 20, E: 5.2, hY: 453, camX: 8.68 },
  room: { H: 10, dado: 40 / 12, rail: 9, side: true, ceiling: 'paint' },
  wall: { zones: [{ x0: 0, x1: 12.6, upper: 'wallpaper' }, { x0: 13.1, x1: 40, upper: 'paint' }], pilasters: [{ x: 12.6, w: 0.5 }], wainscot: 'panels' },
  wallpaper: null,
  paint: { upper: '#E9DCC4', wainscot: '#D8C8AA', trim: '#FFFFFF', frieze: '#F2EBDD', ceiling: '#F4EFE6', side: '#E9DCC4', sideWainscot: '#D8C8AA' },
  uph: { color: '#2B2B2B', piping: '#2B2B2B', style: 'plain', base: '#1C1C1C' },
  lamp: { style: 'dome', color: '#FFB000', metal: '#B7791F', glow: '#FFD48A' },
  floor: { kind: 'plain', colors: ['#CFC2AA', '#BFB298'], size: 1, grout: '#B5A88E' },
  table: { top: 'laminate', colors: ['#5A3E2B'], edge: '#2A2A2A', base: '#1E1E1E' },
  chair: { style: 'basic', color: '#4A3222', seat: '#4A3222' },
  window: { treatment: 'blinds', sky: ['#CFE0EA', '#EEF2EE'], fabric: '#E8E1D2', fabric2: null },
  light: { mood: 'flat', warm: '#FFD48A', pool: 0, grade: '#1E1A16', gradeTop: 0.12, gradeBottom: 0.1, vignette: 0.18, cast: null, sun: 0.35 },
  outline: { color: '#000000', w: 0, op: 0.35 },
  items: [],
  caption: null,
  fonts: 'bazaar',
  seed: 7,
};

function merge(a, b) { const o = Array.isArray(a) ? a.slice() : Object.assign({}, a); for (const k in b) { const v = b[k]; o[k] = (v && typeof v === 'object' && !Array.isArray(v) && a && typeof a[k] === 'object' && !Array.isArray(a[k])) ? merge(a[k], v) : v; } return o; }

function renderRoom(cfgIn) {
  const c = merge(DEF, cfgIn);
  const cam = new Cam(Object.assign({ W: c.W, H: c.H }, c.cam));
  const R = rng(c.seed);
  const W = c.W, Hh = c.H;
  const RH = c.room.H, dadoIn = c.room.dado * 12, railIn = c.room.rail * 12, HIn = RH * 12;
  const defs = [];
  const out = [];
  const objs = [];      // {z, s}
  const fx = [];        // lighting/glow layer after objects
  const ol = c.outline; const OL = ol.w ? `stroke="${ol.color}" stroke-opacity="${ol.op}" stroke-width="${ol.w}" stroke-linejoin="round"` : '';
  const uid = (() => { let i = 0; return (p) => p + (++i); })();
  const pendants = c.items.filter((it) => it.type === 'pendant');

  /* ───────── defs: gradients, filters ───────── */
  const warm = c.light.warm;
  defs.push(`<radialGradient id="gPool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${warm}" stop-opacity="1"/><stop offset=".55" stop-color="${warm}" stop-opacity=".35"/><stop offset="1" stop-color="${warm}" stop-opacity="0"/></radialGradient>`);
  defs.push(`<radialGradient id="gGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF6DF" stop-opacity=".95"/><stop offset=".18" stop-color="${warm}" stop-opacity=".55"/><stop offset=".5" stop-color="${warm}" stop-opacity=".14"/><stop offset="1" stop-color="${warm}" stop-opacity="0"/></radialGradient>`);
  defs.push(`<linearGradient id="gCone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${warm}" stop-opacity=".30"/><stop offset="1" stop-color="${warm}" stop-opacity="0"/></linearGradient>`);
  defs.push(`<linearGradient id="gAOdown" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".32"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>`);
  defs.push(`<linearGradient id="gAOup" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".30"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>`);
  defs.push(`<linearGradient id="gAOright" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>`);
  defs.push(`<linearGradient id="gBrass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8E5A16"/><stop offset=".28" stop-color="#F7D98A"/><stop offset=".5" stop-color="#E9A63A"/><stop offset=".78" stop-color="#B7791F"/><stop offset="1" stop-color="#7A4C12"/></linearGradient>`);
  defs.push(`<linearGradient id="gBrassD" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6E4410"/><stop offset=".3" stop-color="#C98A2E"/><stop offset=".42" stop-color="#F3CF7E"/><stop offset=".6" stop-color="#B7791F"/><stop offset="1" stop-color="#5E3A0E"/></linearGradient>`);
  defs.push(`<linearGradient id="gBrassV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7D98A"/><stop offset=".45" stop-color="#E9A63A"/><stop offset="1" stop-color="#8E5A16"/></linearGradient>`);
  defs.push(`<linearGradient id="gGlass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".55"/><stop offset=".3" stop-color="#FFFFFF" stop-opacity=".12"/><stop offset=".8" stop-color="#FFFFFF" stop-opacity=".25"/><stop offset="1" stop-color="#FFFFFF" stop-opacity=".5"/></linearGradient>`);
  defs.push(`<filter id="fBlur6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>`);
  defs.push(`<filter id="fBlur14" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>`);
  defs.push(`<filter id="fBlur3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5"/></filter>`);
  // paint texture (fine stipple) & wallcovering texture (horizontal fibres, like a woven/grasscloth Type II emboss)
  defs.push(`<filter id="fPaint" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  1.6 0 0 0 -.62"/></filter>`);
  defs.push(`<filter id="fFabric" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".015 .9" numOctaves="2" seed="9" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.9 1.05"/></filter>`);
  defs.push(`<filter id="fWeave" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9 .06" numOctaves="1" seed="2" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.7 .95"/></filter>`);

  /* wallpaper pattern (repeat in inches, aligned to picture rail & left corner = how a paperhanger would set out) */
  let wpFill = null, WP = null;
  if (c.wallpaper) {
    const t = L.tile(c.wallpaper.dir, c.wallpaper.file);
    const rep = c.wallpaper.repeat || 24;
    const P = Math.round(rep * cam.k / 12);           // whole screen px per repeat
    defs.push(`<image id="wpT" href="${t.uri}" width="${P + 0.8}" height="${P + 0.8}" preserveAspectRatio="none"/>`);
    WP = { P, off: (c.wallpaper.offset || 0) };
    wpFill = 'WP';
    c._wpBg = t.bg;
  }
  /* lay wallpaper tiles in screen space, snapped to whole pixels and overlapped 0.8px → seamless like a real hang */
  function wallpaperTiles(sx0, sx1, sy0, sy1, ox, oy) {
    const P = WP.P; const id = uid('wc');
    defs.push(`<clipPath id="${id}"><rect x="${n(sx0)}" y="${n(sy0)}" width="${n(sx1 - sx0)}" height="${n(sy1 - sy0)}"/></clipPath>`);
    ox = Math.round(ox); oy = Math.round(oy);
    const i0 = Math.floor((sx0 - ox) / P), i1 = Math.ceil((sx1 - ox) / P), j0 = Math.floor((sy0 - oy) / P), j1 = Math.ceil((sy1 - oy) / P);
    let u = '';
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) u += `<use href="#wpT" x="${ox + i * P}" y="${oy + j * P}"/>`;
    return `<g clip-path="url(#${id})">${u}</g>`;
  }

  /* ───────── CEILING ───────── */
  {
    const q = [cam.p(-6, RH, 0), cam.p(60, RH, 0), cam.p(60, RH, 16), cam.p(-6, RH, 16)];
    const gce = uid('ce'); const cy0 = cam.p(0, RH, 0)[1];
    defs.push(`<linearGradient id="${gce}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${n(cy0)}"><stop offset="0" stop-color="${shade(c.paint.ceiling, -0.16)}"/><stop offset="1" stop-color="${c.paint.ceiling}"/></linearGradient>`);
    out.push(poly(q, { fill: `url(#${gce})` }));
    if (c.room.ceiling === 'grid') {          // suspended acoustic-tile ceiling (the "before" room)
      let d = '';
      for (let z = 0; z <= 16; z += 2) { const a = cam.p(-6, RH, z), b = cam.p(60, RH, z); d += `M${n(a[0])} ${n(a[1])}L${n(b[0])} ${n(b[1])}`; }
      for (let x = -6; x <= 60; x += 2) { const a = cam.p(x, RH, 0), b = cam.p(x, RH, 16); d += `M${n(a[0])} ${n(a[1])}L${n(b[0])} ${n(b[1])}`; }
      out.push(h('path', { d, stroke: '#BDB6A8', 'stroke-width': 2.2, fill: 'none' }));
      // fluorescent troffers
      [[4, 6], [14, 16]].forEach(([x0, x1]) => { out.push(poly(cam.quadY(x0, x1, 0.6, 3.4, RH), { fill: '#F4F8F6', stroke: '#A9A398', 'stroke-width': 2 })); });
    }
    // ceiling falls off into shadow toward the viewer
    out.push(h('rect', { x: 0, y: 0, width: W, height: n(cam.p(0, RH, 0)[1]), fill: c.light.grade, opacity: c.room.ceiling === 'grid' ? 0.03 : 0.06 }));
  }

  /* ───────── BACK WALL (inches, origin = floor at left corner) ───────── */
  {
    const o = cam.p(0, 0, 0);
    const g = [];      // painted base
    const g2 = [];     // textures, wainscot detail, rails, items (over the paper)
    const wpLayers = [];
    const T = c.paint.trim;
    const zones = c.wall.zones;
    const kk = cam.k / 12;
    zones.forEach((zn) => {
      const x0 = zn.x0 * 12, w = (zn.x1 - zn.x0) * 12;
      const isWP = zn.upper === 'wallpaper' && wpFill;
      const up = isWP ? (c._wpBg || '#888') : (zn.paint || c.paint.upper);
      const fr = zn.frieze || c.paint.frieze;
      const ws = zn.wainscot || c.paint.wainscot;
      g.push(h('rect', { x: n(x0), y: n(-HIn), width: n(w), height: n(HIn - railIn), fill: fr }));
      g.push(h('rect', { x: n(x0), y: n(-railIn), width: n(w), height: n(railIn - dadoIn), fill: up }));
      if (isWP) {
        const sx0 = o[0] + x0 * kk, sx1 = o[0] + (x0 + w) * kk, sy0 = o[1] - railIn * kk, sy1 = o[1] - dadoIn * kk;
        wpLayers.push(wallpaperTiles(sx0, sx1, sy0, sy1, o[0] + WP.off * kk, sy0));
        // Type II wallcovering emboss + faint 54-in drop seams
        g2.push(h('rect', { x: n(x0), y: n(-railIn), width: n(w), height: n(railIn - dadoIn), filter: 'url(#fFabric)', opacity: c.wallpaper && c.wallpaper.tex !== undefined ? c.wallpaper.tex : 0.06 }));
        let sd = ''; for (let sx = x0 + 54; sx < x0 + w; sx += 54) sd += `M${n(sx)} ${n(-railIn)}V${n(-dadoIn)}`;
        if (sd) g2.push(h('path', { d: sd, stroke: '#000', 'stroke-opacity': 0.05, 'stroke-width': 0.25 }));
      } else {
        g2.push(h('rect', { x: n(x0), y: n(-railIn), width: n(w), height: n(railIn - dadoIn), filter: 'url(#fPaint)', opacity: 0.05 }));
      }
      if (c.wall.wainscot !== 'none') g.push(h('rect', { x: n(x0), y: n(-dadoIn), width: n(w), height: n(dadoIn), fill: ws }));
      else g.push(h('rect', { x: n(x0), y: n(-dadoIn), width: n(w), height: n(dadoIn), fill: up }));
      // wainscot detailing
      if (c.wall.wainscot === 'panels') {
        const pw = 30, top = -dadoIn + 6, bot = -9;
        for (let px = x0 + 4; px + pw <= x0 + w - 2; px += pw + 4) {
          g2.push(h('rect', { x: n(px), y: n(top), width: pw, height: n(bot - top), fill: 'none', stroke: shade(ws, -0.22), 'stroke-width': 0.7 }));
          g2.push(h('path', { d: `M${n(px + 0.7)} ${n(bot - 0.7)}V${n(top + 0.7)}H${n(px + pw - 0.7)}`, fill: 'none', stroke: shade(ws, 0.25), 'stroke-width': 0.6 }));
        }
      } else if (c.wall.wainscot === 'beadboard') {
        let d = ''; for (let px = x0 + 3.5; px < x0 + w; px += 3.5) d += `M${n(px)} ${n(-dadoIn)}V-6`;
        g2.push(h('path', { d, stroke: shade(ws, -0.18), 'stroke-width': 0.35 }));
      } else if (c.wall.wainscot === 'tile') {   // glazed brick tile (chai corner)
        let d = ''; let row = 0;
        for (let y = -6; y > -dadoIn; y -= 3, row++) { d += `M${n(x0)} ${n(y)}H${n(x0 + w)}`; for (let px = x0 + (row % 2 ? 3 : 0); px < x0 + w; px += 6) d += `M${n(px)} ${n(y)}V${n(Math.max(y - 3, -dadoIn))}`; }
        g2.push(h('path', { d, stroke: shade(ws, 0.45), 'stroke-width': 0.35 }));
      }
      if (c.wall.wainscot !== 'none') g2.push(h('rect', { x: n(x0), y: n(-dadoIn), width: n(w), height: n(dadoIn), filter: 'url(#fPaint)', opacity: 0.05 }));
    });
    const gT = `translate(${n(o[0])} ${n(o[1])}) scale(${kk.toFixed(4)})`;
    out.push(`<g transform="${gT}">${g.join('')}</g>`);
    out.push(wpLayers.join(''));
    g.length = 0; g.push(...g2);
    // ceiling-line AO + crown
    g.push(h('rect', { x: -24, y: n(-HIn + 3), width: 900, height: 10, fill: 'url(#gAOdown)' }));
    g.push(h('rect', { x: -24, y: n(-HIn), width: 900, height: 3, fill: T }));
    g.push(h('rect', { x: -24, y: n(-HIn + 3), width: 900, height: 0.5, fill: shade(T, -0.3) }));
    if (c.room.rail) {       // picture rail
      g.push(h('rect', { x: -24, y: n(-railIn + 1.6), width: 900, height: 4, fill: 'url(#gAOdown)', opacity: 0.8 }));
      g.push(h('rect', { x: -24, y: n(-railIn - 0.4), width: 900, height: 2, fill: c.wall.railBrass ? 'url(#gBrassV)' : T }));
      g.push(h('rect', { x: -24, y: n(-railIn - 0.4), width: 900, height: 0.45, fill: shade(c.wall.railBrass ? '#F7D98A' : T, 0.35) }));
    }
    if (c.wall.wainscot !== 'none') {   // dado / chair rail
      g.push(h('rect', { x: -24, y: n(-dadoIn + 2.4), width: 900, height: 5, fill: 'url(#gAOdown)', opacity: 0.7 }));
      g.push(h('rect', { x: -24, y: n(-dadoIn - 0.6), width: 900, height: 3, fill: c.wall.railBrass ? 'url(#gBrassV)' : T }));
      g.push(h('rect', { x: -24, y: n(-dadoIn - 0.6), width: 900, height: 0.6, fill: shade(c.wall.railBrass ? '#F7D98A' : T, 0.4) }));
      g.push(h('rect', { x: -24, y: n(-dadoIn + 2.0), width: 900, height: 0.5, fill: shade(T, -0.35), opacity: 0.6 }));
    }
    // baseboard
    g.push(h('rect', { x: -24, y: -6, width: 900, height: 6, fill: c.wall.base || T }));
    g.push(h('rect', { x: -24, y: -6, width: 900, height: 0.6, fill: shade(c.wall.base || T, 0.3) }));
    // wall-mounted items that live ON the wall plane
    c.items.filter((it) => it.wall).forEach((it) => g.push(wallItem(it)));
    out.push(`<g transform="${gT}">${g.join('')}</g>`);
    // pilasters (proud of the wall by 4in): side face + front face
    (c.wall.pilasters || []).forEach((pl) => {
      const d = 0.34, x = pl.x, w = pl.w, col = pl.color || c.paint.trim;
      const side = x > cam.camX ? [cam.p(x, 0, 0), cam.p(x, RH, 0), cam.p(x, RH, d), cam.p(x, 0, d)] : [cam.p(x + w, 0, 0), cam.p(x + w, RH, 0), cam.p(x + w, RH, d), cam.p(x + w, 0, d)];
      out.push(poly(side, { fill: shade(col, -0.18) }));
      const f = [cam.p(x, 0, d), cam.p(x + w, 0, d), cam.p(x + w, RH, d), cam.p(x, RH, d)];
      out.push(poly(f, { fill: col }));
      const b = [cam.p(x, 0, d), cam.p(x + w, 0, d), cam.p(x + w, 0.5, d), cam.p(x, 0.5, d)];
      out.push(poly(b, { fill: shade(col, -0.08) }));
      // soft shadow cast to the right
      const sh = [cam.p(x + w, 0, 0), cam.p(x + w + 0.7, 0, 0), cam.p(x + w + 0.7, RH, 0), cam.p(x + w, RH, 0)];
      out.push(poly(sh, { fill: '#000', opacity: 0.12, filter: 'url(#fBlur6)' }));
    });
    // evening: the wall falls off toward the ceiling so the lamp pools read
    if (c.light.wallDim) {
      const gw = uid('wd'); const yT = cam.p(0, RH, 0)[1], yB = cam.p(0, 0, 0)[1];
      defs.push(`<linearGradient id="${gw}" gradientUnits="userSpaceOnUse" x1="0" y1="${n(yT)}" x2="0" y2="${n(yB)}"><stop offset="0" stop-color="${c.light.grade}" stop-opacity="${c.light.wallDim}"/><stop offset=".55" stop-color="${c.light.grade}" stop-opacity="${c.light.wallDim * 0.25}"/><stop offset="1" stop-color="${c.light.grade}" stop-opacity="${c.light.wallDim * 0.5}"/></linearGradient>`);
      out.push(h('rect', { x: 0, y: n(yT), width: W, height: n(yB - yT), fill: `url(#${gw})` }));
    }
    // light pools from the pendants on the wall (behind furniture)
    if (c.light.pool > 0) pendants.forEach((p) => {
      if (p.noPool) return;
      const q = cam.p(p.x, (p.y || 5) - 0.6, 0);
      const rx = cam.k * (p.poolR || 3.4), ry = cam.k * (p.poolRy || 2.7);
      out.push(h('ellipse', { cx: n(q[0]), cy: n(q[1]), rx: n(rx), ry: n(ry), fill: 'url(#gPool)', opacity: c.light.pool, style: 'mix-blend-mode:screen' }));
    });
    // floor-line AO
    const fl = cam.p(0, 0, 0)[1];
    out.push(h('rect', { x: 0, y: n(fl - 26), width: W, height: 26, fill: 'url(#gAOup)', opacity: 0.6 }));
  }

  /* ───────── SIDE (RETURN) WALL with window ───────── */
  if (c.room.side) {
    const Zf = 14, d = c.room.dado, rl = c.room.rail;
    const P = (Y, Z) => cam.p(0, Y, Z);
    const quad = (Y0, Y1, Z0, Z1) => [P(Y0, Z0), P(Y1, Z0), P(Y1, Z1), P(Y0, Z1)];
    out.push(poly(quad(d, RH, 0, Zf), { fill: c.paint.side }));
    out.push(poly(quad(0, d, 0, Zf), { fill: c.wall.wainscot !== 'none' ? c.paint.sideWainscot : c.paint.side }));
    if (c.wall.wainscot !== 'none') out.push(poly(quad(d - 0.02, d + 0.25, 0, Zf), { fill: c.wall.railBrass ? '#C8892A' : c.paint.trim }));
    if (c.room.rail) out.push(poly(quad(rl - 0.03, rl + 0.15, 0, Zf), { fill: c.wall.railBrass ? '#C8892A' : c.paint.trim }));
    out.push(poly(quad(RH - 0.25, RH, 0, Zf), { fill: c.paint.trim }));
    out.push(poly(quad(0, 0.5, 0, Zf), { fill: c.wall.base || c.paint.trim }));
    // window
    const wz0 = c.window.z0 || 1.0, wz1 = c.window.z1 || 5.2, wy0 = c.window.y0 || 3.7, wy1 = c.window.y1 || 8.5;
    const gsk = uid('sky');
    const a = P(wy1, wz0), b = P(wy0, wz0);
    defs.push(`<linearGradient id="${gsk}" gradientUnits="userSpaceOnUse" x1="0" y1="${n(a[1])}" x2="0" y2="${n(b[1] + 60)}"><stop offset="0" stop-color="${c.window.sky[0]}"/><stop offset="1" stop-color="${c.window.sky[1]}"/></linearGradient>`);
    out.push(poly(quad(wy0 - 0.18, wy1 + 0.18, wz0 - 0.18, wz1 + 0.18), { fill: c.paint.trim }));
    out.push(poly(quad(wy0, wy1, wz0, wz1), { fill: `url(#${gsk})` }));
    // dusk/day exterior hint: soft horizon band of a parking lot & far trees
    out.push(poly(quad(wy0, wy0 + 0.9, wz0, wz1), { fill: c.window.ground || '#8C8A86', opacity: 0.35 }));
    out.push(poly(quad(wy0 + 0.9, wy0 + 1.5, wz0, wz1), { fill: c.window.trees || '#5E7A62', opacity: 0.3 }));
    // reflections
    out.push(poly([P(wy1, wz0 + 0.6), P(wy1, wz0 + 1.3), P(wy0, wz0 + 2.6), P(wy0, wz0 + 1.9)], { fill: '#fff', opacity: 0.12 }));
    // mullions
    const mz = (wz0 + wz1) / 2, ty = wy1 - 1.2;
    out.push(poly(quad(wy0, wy1, mz - 0.07, mz + 0.07), { fill: c.paint.trim }));
    out.push(poly(quad(ty - 0.06, ty + 0.06, wz0, wz1), { fill: c.paint.trim }));
    out.push(poly(quad(wy0 - 0.22, wy0 - 0.06, wz0 - 0.3, wz1 + 0.3), { fill: shade(c.paint.trim, -0.12) }));
    // window treatment
    const tr = c.window.treatment;
    if (tr === 'blinds') {
      for (let z = wz0; z < wz1 - 0.05; z += 0.32) out.push(poly(quad(wy0 + 0.1, wy1 - 0.05, z + 0.04, z + 0.27), { fill: c.window.fabric, opacity: 0.93 }));
      out.push(poly(quad(wy1 - 0.12, wy1 + 0.05, wz0 - 0.1, wz1 + 0.1), { fill: shade(c.window.fabric, -0.2) }));
    } else if (tr === 'cafe') {
      const cy1 = wy0 + 2.2;
      out.push(poly(quad(cy1 + 0.02, cy1 + 0.1, wz0 - 0.25, wz1 + 0.25), { fill: '#C8892A' }));
      out.push(poly(quad(wy0, cy1, wz0, wz1), { fill: c.window.fabric }));
      // ticking stripes in perspective
      for (let z = wz0 + 0.12; z < wz1; z += 0.36) out.push(poly(quad(wy0, cy1, z, z + 0.12), { fill: c.window.fabric2, opacity: 0.95 }));
      for (let z = wz0 + 0.18; z < wz1; z += 0.36) out.push(poly([P(cy1, z), P(cy1 - 0.15, z + 0.06), P(cy1, z + 0.12)], { fill: '#C8892A' }));
      // scalloped hem
      const hem = []; for (let z = wz0; z <= wz1 + 1e-6; z += 0.09) hem.push(P(wy0 - 0.12 * Math.abs(Math.sin((z - wz0) / 0.36 * Math.PI)), z));
      out.push(poly([P(wy0, wz1), P(wy0, wz0)].concat(hem), { fill: c.window.fabric2 }));
    } else if (tr === 'drape') {
      const dw = 1.1;
      [[wz0 - 0.5, wz0 - 0.5 + dw], [wz1 + 0.5 - dw, wz1 + 0.5]].forEach(([z0, z1]) => {
        out.push(poly(quad(0.2, wy1 + 0.45, z0, z1), { fill: c.window.fabric }));
        for (let i = 1; i < 5; i++) { const z = z0 + (z1 - z0) * i / 5; out.push(poly(quad(0.25, wy1 + 0.4, z - 0.03, z + 0.05), { fill: shade(c.window.fabric, -0.3), opacity: 0.6 })); }
        out.push(poly(quad(3.6, 3.85, z0 - 0.02, z1 + 0.02), { fill: '#D9A441' }));
      });
      out.push(poly(quad(wy1 + 0.45, wy1 + 0.58, wz0 - 0.8, wz1 + 0.8), { fill: '#C8892A' }));
    }
    // ceiling/side junction + corner AO
    const cn = [cam.p(0, 0, 0), cam.p(0, RH, 0)];
    out.push(h('rect', { x: n(cn[0][0]), y: n(cn[1][1]), width: 22, height: n(cn[0][1] - cn[1][1]), fill: 'url(#gAOright)', opacity: 0.8 }));
    // sunlight from the window onto the floor
    if (c.light.sun > 0) {
      const Ld = c.light.sunDir || [1.05, -1, -0.22];
      const fh = (Y, Z) => { const t = Y / -Ld[1]; return cam.p(Ld[0] * t, 0, Z + Ld[2] * t); };
      const patch = [fh(wy1, wz0), fh(wy1, wz1), fh(wy0, wz1), fh(wy0, wz0)];
      c._sunPatch = patch;
      const beam = [P(wy1, wz0), P(wy1, wz1), fh(wy1, wz1), fh(wy0, wz1), fh(wy0, wz0)];
      const gb = uid('beam');
      defs.push(`<linearGradient id="${gb}" gradientUnits="userSpaceOnUse" x1="${n(P(wy1, wz0)[0])}" y1="0" x2="${n(fh(wy0, wz1)[0])}" y2="0"><stop offset="0" stop-color="${c.light.sunColor || '#FFE2B0'}" stop-opacity=".22"/><stop offset="1" stop-color="${c.light.sunColor || '#FFE2B0'}" stop-opacity="0"/></linearGradient>`);
      c._sunBeam = '';
      const wc = P((wy0 + wy1) / 2, (wz0 + wz1) / 2);
      out.push(h('ellipse', { cx: n(wc[0]), cy: n(wc[1]), rx: 260, ry: 330, fill: c.light.sunColor || '#FFE2B0', opacity: 0.16 * c.light.sun * 2.5, filter: 'url(#fBlur14)', style: 'mix-blend-mode:screen' }));
    }
  }

  /* ───────── FLOOR ───────── */
  {
    const F = c.floor, T = F.size || 8 / 12;
    out.push(poly([cam.p(c.room.side ? 0 : -30, 0, 0), cam.p(60, 0, 0), cam.p(60, 0, 16), cam.p(c.room.side ? 0 : -30, 0, 16)], { fill: F.colors[0] }));
    const layers = {}; const add = (col, arr) => { (layers[col] = layers[col] || []).push(pathFrom(arr.map((p) => [Math.round(p[0] * 2) / 2, Math.round(p[1] * 2) / 2]))); };
    const zMax = (() => { for (let z = 0; z < 16; z += 0.1) if (cam.p(0, 0, z)[1] > Hh + 30) return z; return 16; })();
    const visX = (z) => [cam.camX - (W / 2 + 40) / cam.s(z), cam.camX + (W / 2 + 40) / cam.s(z)];
    const xr0 = c.room.side ? 0 : Math.floor(visX(zMax)[0] / T) * T, xr1 = visX(0)[1];
    const TP = (x0, z0) => (u, v) => cam.p(x0 + u * T, 0, z0 + v * T);
    const circ = (pf, cu, cv, r, seg) => { const a = []; for (let i = 0; i < seg; i++) { const t = i / seg * Math.PI * 2; a.push(pf(cu + Math.cos(t) * r, cv + Math.sin(t) * r)); } return a; };
    for (let z0 = 0; z0 < zMax; z0 += T) {
      const lod = cam.s(z0) * T > 60 ? 1 : 0;
      for (let x0 = xr0; x0 < xr1; x0 += T) {
        const pf = TP(x0, z0);
        const ix = Math.round(x0 / T), iz = Math.round(z0 / T);
        if (F.kind === 'plain') {
          const v = R();
          if (v > 0.55) add(F.colors[1], [pf(0, 0), pf(1, 0), pf(1, 1), pf(0, 1)]);
        } else if (F.kind === 'check') {
          if ((ix + iz) % 2) add(F.colors[1], [pf(0, 0), pf(1, 0), pf(1, 1), pf(0, 1)]);
        } else if (F.kind === 'flower') {      // Bazaar cement tile: 4-petal bloom, corner circles, edge dots
          const seg = lod ? 22 : 12;
          const fl = []; for (let i = 0; i < seg * 2; i++) { const t = i / (seg * 2) * Math.PI * 2; const r = 0.13 + 0.25 * Math.pow(Math.abs(Math.cos(2 * t)), 1.6); fl.push(pf(0.5 + Math.cos(t + Math.PI / 4) * r, 0.5 + Math.sin(t + Math.PI / 4) * r)); }
          add(F.colors[2], fl);
          add(F.colors[3], circ(pf, 0.5, 0.5, 0.075, lod ? 12 : 8));
          add(F.colors[1], circ(pf, 0, 0, 0.2, lod ? 18 : 10));
          add(F.colors[3], circ(pf, 0.5, 0, 0.055, 8));
          add(F.colors[3], circ(pf, 0, 0.5, 0.055, 8));
          if (F.colors[4]) add(F.colors[4], circ(pf, 0, 0, 0.09, 8));
        } else if (F.kind === 'star') {        // Royal cement tile: 8-point star, corner diamonds
          const st = []; for (let i = 0; i < 16; i++) { const t = i / 16 * Math.PI * 2 + Math.PI / 16 * 0; const r = i % 2 ? 0.24 : 0.4; st.push(pf(0.5 + Math.cos(t) * r, 0.5 + Math.sin(t) * r)); }
          add(F.colors[1], st);
          const oc = []; for (let i = 0; i < 8; i++) { const t = i / 8 * Math.PI * 2 + Math.PI / 8; oc.push(pf(0.5 + Math.cos(t) * 0.17, 0.5 + Math.sin(t) * 0.17)); }
          add(F.colors[2], oc);
          add(F.colors[3], [pf(-0.17, 0), pf(0, -0.17), pf(0.17, 0), pf(0, 0.17)]);
          if (F.colors[4]) add(F.colors[4], circ(pf, 0.5, 0.5, 0.06, 8));
        } else if (F.kind === 'diamond') {
          add(F.colors[1], [pf(0.5, 0.05), pf(0.95, 0.5), pf(0.5, 0.95), pf(0.05, 0.5)]);
          add(F.colors[2], [pf(0.5, 0.3), pf(0.7, 0.5), pf(0.5, 0.7), pf(0.3, 0.5)]);
        }
      }
    }
    Object.keys(layers).forEach((col) => out.push(h('path', { d: layers[col].join(''), fill: col })));
    // grout grid
    let gd = '';
    for (let z0 = 0; z0 <= zMax + T; z0 += T) { const a = cam.p(xr0, 0, z0), b = cam.p(xr1 + 2, 0, z0); gd += `M${n(a[0])} ${n(a[1])}L${n(b[0])} ${n(b[1])}`; }
    for (let x0 = xr0; x0 <= xr1 + T; x0 += T) { const a = cam.p(x0, 0, 0), b = cam.p(x0, 0, zMax + T); gd += `M${n(a[0])} ${n(a[1])}L${n(b[0])} ${n(b[1])}`; }
    out.push(h('path', { d: gd, stroke: F.grout, 'stroke-width': F.groutW || 1.2, 'stroke-opacity': 0.8, fill: 'none' }));
    // floor sheen + far-wall falloff
    const fy = cam.p(0, 0, 0)[1];
    const gfl = uid('fl');
    defs.push(`<linearGradient id="${gfl}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset=".35" stop-color="#000" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>`);
    out.push(h('rect', { x: 0, y: n(fy), width: W, height: n(Hh - fy), fill: `url(#${gfl})` }));
    if (c._sunPatch) out.push(poly(c._sunPatch, { fill: c.light.sunColor || '#FFE2B0', opacity: 0.22 * c.light.sun * 2, filter: 'url(#fBlur6)', style: 'mix-blend-mode:screen' }));
    if (c._sunBeam) out.push(c._sunBeam);
  }

  /* ───────── OBJECTS ───────── */
  c.items.filter((it) => !it.wall).forEach((it) => {
    const fn = OBJ[it.type];
    if (!fn) return;
    const r = fn(it, { cam, c, R, defs, uid, OL, fx });
    if (r) objs.push({ z: (it.z || 0) + (it.zBias || 0), s: r });
  });
  objs.sort((a, b) => a.z - b.z).forEach((o) => out.push(o.s));
  out.push(fx.join(''));

  /* ───────── GRADE: ambient falloff + vignette ───────── */
  {
    const gg = uid('gr');
    defs.push(`<linearGradient id="${gg}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.light.grade}" stop-opacity="${c.light.gradeTop}"/><stop offset=".42" stop-color="${c.light.grade}" stop-opacity="0"/><stop offset=".78" stop-color="${c.light.grade}" stop-opacity="0"/><stop offset="1" stop-color="${c.light.grade}" stop-opacity="${c.light.gradeBottom}"/></linearGradient>`);
    out.push(h('rect', { width: W, height: Hh, fill: `url(#${gg})` }));
    const gv = uid('vg');
    defs.push(`<radialGradient id="${gv}" cx=".5" cy=".48" r=".72"><stop offset=".55" stop-color="${c.light.grade}" stop-opacity="0"/><stop offset="1" stop-color="${c.light.grade}" stop-opacity="${c.light.vignette}"/></radialGradient>`);
    out.push(h('rect', { width: W, height: Hh, fill: `url(#${gv})` }));
    if (c.light.cast) out.push(h('rect', { width: W, height: Hh, fill: c.light.cast, opacity: c.light.castOp || 0.06, style: 'mix-blend-mode:multiply' }));
  }

  /* ───────── CAPTION ───────── */
  if (c.caption) out.push(caption(c, W, Hh));

  const fontKeys = L.FONTS[c.fonts] ? L.FONTS[c.fonts].keys : L.FONTS.both.keys;
  return L.doc(W, Hh, defs.join(''), out.join(''), { fonts: fontKeys, title: c.title || 'Curry District · illustrative room' });

  /* ── wall items (inches on the wall plane) ── */
  function wallItem(it) {
    const x = it.x * 12, y = -(it.y * 12), w = (it.w || 2) * 12, hh = (it.h || 2) * 12;
    const fn = WALL[it.type];
    return fn ? fn(it, { x, y, w, h: hh, c, defs, uid }) : '';
  }
}

/* ═════════════ caption block ═════════════ */
function caption(c, W, H) {
  const cap = c.caption; const F = L.FONTS[c.fonts] || L.FONTS.royal;
  const isB = c.fonts === 'bazaar';
  const bg = cap.bg || (isB ? '#1D1147' : '#160B26'), fg = cap.fg || (isB ? '#FFF4DC' : '#FBF3E4'), ac = cap.accent || (isB ? '#FFB000' : '#E9A63A');
  const x = 36, y = H - 36;
  const t1 = esc(cap.title || ''), t2 = esc(cap.sub || 'Illustrative room — not your actual dining room');
  const badge = esc(cap.badge || '');
  const w1 = cap.width || Math.max(560, Math.min(W - 72, 26 + t1.length * (isB ? 19.5 : 18.5) + (badge ? badge.length * 15 + 40 : 0)));
  const hh = 106;
  const s = [];
  s.push(`<g>`);
  s.push(h('rect', { x, y: y - hh, width: n(w1), height: hh, rx: isB ? 18 : 16, fill: bg, opacity: 0.9 }));
  if (isB) s.push(h('rect', { x: x + 6, y: y - hh + 6, width: n(w1), height: hh, rx: 18, fill: 'none', stroke: ac, 'stroke-width': 3, opacity: 0.0 }));
  else s.push(h('rect', { x: x + 6, y: y - hh + 6, width: n(w1 - 12), height: hh - 12, rx: 11, fill: 'none', stroke: ac, 'stroke-width': 1.2, opacity: 0.7 }));
  let tx = x + 24;
  if (badge) {
    const bw = badge.length * (isB ? 15.5 : 13.5) + 30;
    s.push(h('rect', { x: tx, y: y - hh + 18, width: n(bw), height: 38, rx: 19, fill: ac }));
    s.push(h('text', { x: n(tx + bw / 2), y: y - hh + 44, 'text-anchor': 'middle', 'font-family': isB ? F.display : F.body, 'font-weight': 700, 'font-size': isB ? 20 : 19, 'letter-spacing': isB ? 0.5 : 1.5, fill: bg }, badge));
    tx += bw + 16;
  }
  s.push(h('text', { x: tx, y: y - hh + 47, 'font-family': isB ? F.body : F.display, 'font-weight': isB ? 700 : 600, 'font-size': isB ? 31 : 33, fill: fg, 'font-style': isB ? 'normal' : 'italic' }, t1));
  s.push(h('text', { x: x + 24, y: y - 22, 'font-family': F.body, 'font-weight': 500, 'font-size': 23, fill: fg, opacity: 0.88, 'letter-spacing': 0.3 }, t2));
  s.push(`</g>`);
  return s.join('');
}

/* ═════════════ WALL ITEMS (draw in inches; x,y = left/top-left in wall coords; y negative up) ═════════════ */
const WALL = {
  print(it, { x, y, w, h: hh, defs, uid }) {
    const fr = it.frame || '#1D1147', fw = it.frameW || 1.6, mat = it.mat || '#FFF4DC';
    const s = [];
    s.push(h('rect', { x: n(x + 1.5), y: n(y + 2.5), width: n(w), height: n(hh), fill: '#000', opacity: 0.28, filter: 'url(#fBlur3)' }));
    s.push(h('rect', { x: n(x), y: n(y), width: n(w), height: n(hh), fill: fr === 'brass' ? 'url(#gBrass)' : fr }));
    s.push(h('rect', { x: n(x + fw), y: n(y + fw), width: n(w - 2 * fw), height: n(hh - 2 * fw), fill: mat }));
    const ax = x + fw + 2.4, ay = y + fw + 2.4, aw = w - 2 * fw - 4.8, ah = hh - 2 * fw - 4.8;
    s.push(`<g transform="translate(${n(ax)} ${n(ay)})">${ART[it.art || 'chai'](aw, ah, it, defs, uid)}</g>`);
    return s.join('');
  },
  menu(it, { x, y, w, h: hh, c }) {
    const s = []; const st = it.style || 'bazaar';
    s.push(h('rect', { x: n(x + 1.5), y: n(y + 3), width: n(w), height: n(hh), fill: '#000', opacity: 0.3, filter: 'url(#fBlur3)' }));
    if (st === 'bazaar') {
      s.push(h('rect', { x: n(x), y: n(y), width: n(w), height: n(hh), rx: 2.5, fill: '#1D1147', stroke: '#FFB000', 'stroke-width': 1.2 }));
      // scalloped header
      const hy = y + 9; let d = `M${n(x)} ${n(y + 2)}Q${n(x)} ${n(y)} ${n(x + 2)} ${n(y)}H${n(x + w - 2)}Q${n(x + w)} ${n(y)} ${n(x + w)} ${n(y + 2)}V${n(hy)}`;
      const nS = 9, sw = w / nS; for (let i = nS - 1; i >= 0; i--) d += `A${n(sw / 2)} ${n(sw / 2.4)} 0 0 1 ${n(x + i * sw)} ${n(hy)}`;
      s.push(h('path', { d: d + 'Z', fill: '#FFB000' }));
      s.push(h('text', { x: n(x + w / 2), y: n(y + 6.6), 'text-anchor': 'middle', 'font-family': "'Bowlby One',sans-serif", 'font-size': n(Math.min(4.4, (w - 5) / ((it.title || 'WHAT’S COOKING').length * 0.74))), fill: '#1D1147', 'letter-spacing': 0.2 }, esc(it.title || 'WHAT’S COOKING')));
      const cols = [x + 3.5, x + w / 2 + 1.5]; const cw = w / 2 - 5;
      const top0 = y + 13, avail = hh - 13 - 7, pitch = avail / 11.2;
      cols.forEach((cx, ci) => {
        let yy = top0;
        ['#FF6A13', '#00A8A0', '#E4147E'].forEach((col, gi) => {
          if (ci === 1) col = ['#3FA34D', '#FFB000', '#FF6A13'][gi];
          s.push(h('rect', { x: n(cx), y: n(yy), width: n(cw * 0.55), height: n(pitch * 0.5), rx: n(pitch * 0.25), fill: col })); yy += pitch * 1.25;
          for (let r = 0; r < 2; r++) { s.push(h('rect', { x: n(cx), y: n(yy), width: n(cw * (0.62 + ((r * 7 + gi * 3 + ci) % 4) * 0.09)), height: n(pitch * 0.3), rx: n(pitch * 0.15), fill: '#FFF4DC', opacity: 0.85 })); yy += pitch * 0.85; }
          yy += pitch * 0.75;
        });
      });
      s.push(h('text', { x: n(x + w / 2), y: n(y + hh - 2.6), 'text-anchor': 'middle', 'font-family': "'Caveat',cursive", 'font-weight': 700, 'font-size': 3.6, fill: '#FFB000' }, esc(it.foot || 'ask us what we’d order →')));
    } else {
      const ar = w / 2;
      const d = `M${n(x)} ${n(y + hh)}V${n(y + ar)}A${n(ar)} ${n(ar * 0.9)} 0 0 1 ${n(x + w)} ${n(y + ar)}V${n(y + hh)}Z`;
      s.push(h('path', { d, fill: '#160B26', stroke: 'url(#gBrass)', 'stroke-width': 1.4 }));
      const i = 2.2; const d2 = `M${n(x + i)} ${n(y + hh - i)}V${n(y + ar)}A${n(ar - i)} ${n((ar - i) * 0.9)} 0 0 1 ${n(x + w - i)} ${n(y + ar)}V${n(y + hh - i)}Z`;
      s.push(h('path', { d: d2, fill: 'none', stroke: '#E9A63A', 'stroke-width': 0.3, opacity: 0.8 }));
      s.push(h('text', { x: n(x + w / 2), y: n(y + ar * 0.62), 'text-anchor': 'middle', 'font-family': "'Fraunces',serif", 'font-style': 'italic', 'font-weight': 600, 'font-size': n(Math.min(4.2, w * 0.082)), fill: '#E9A63A' }, esc(it.title || 'Tonight’s Table')));
      s.push(h('path', { d: `M${n(x + w / 2 - 7)} ${n(y + ar * 0.62 + 2.4)}H${n(x + w / 2 + 7)}`, stroke: '#B7791F', 'stroke-width': 0.3 }));
      let yy = y + ar * 0.62 + 5.5; const pitch = (y + hh - 3 - yy) / 11;
      for (let gi = 0; gi < 3; gi++) {
        s.push(h('rect', { x: n(x + w / 2 - 6), y: n(yy), width: 12, height: n(pitch * 0.42), rx: n(pitch * 0.21), fill: '#E9A63A' })); yy += pitch * 1.2;
        for (let r = 0; r < 2; r++) { const ww = w * (0.5 + ((r * 5 + gi) % 3) * 0.08); s.push(h('rect', { x: n(x + w / 2 - ww / 2), y: n(yy), width: n(ww), height: n(pitch * 0.28), rx: n(pitch * 0.14), fill: '#FBF3E4', opacity: 0.8 })); yy += pitch * 0.85; }
        yy += pitch * 0.8;
      }
    }
    return s.join('');
  },
  tv(it, { x, y, w, h: hh }) {
    return [h('rect', { x: n(x + 1), y: n(y + 2), width: n(w), height: n(hh), fill: '#000', opacity: 0.25, filter: 'url(#fBlur3)' }),
      h('rect', { x: n(x), y: n(y), width: n(w), height: n(hh), rx: 0.8, fill: '#151515' }),
      h('rect', { x: n(x + 0.8), y: n(y + 0.8), width: n(w - 1.6), height: n(hh - 2.2), fill: it.screen || '#3B4A5A' }),
      h('path', { d: `M${n(x + 0.8)} ${n(y + 0.8)}h${n(w * 0.35)}l${n(-w * 0.2)} ${n(hh - 2.2)}h${n(-w * 0.15)}Z`, fill: '#fff', opacity: 0.07 }),
      h('rect', { x: n(x + w * 0.08), y: n(y + hh * 0.66), width: n(w * 0.5), height: n(hh * 0.12), fill: '#7A8896', opacity: 0.5 })].join('');
  },
  sconce(it, { x, y, c }) {
    const m = it.metal === 'black' ? '#1D1147' : 'url(#gBrass)';
    const s = [];
    s.push(h('rect', { x: n(x - 1.6), y: n(y + 3), width: 3.2, height: 6, rx: 1.4, fill: m }));
    s.push(h('path', { d: `M${n(x)} ${n(y + 5)}c0 -3 3 -4 6 -4`, stroke: it.metal === 'black' ? '#1D1147' : '#B7791F', 'stroke-width': 0.7, fill: 'none' }));
    const sx = x + 6.2;
    if (it.shade === 'tulip') s.push(h('path', { d: `M${n(sx - 3.4)} ${n(y - 3.5)}Q${n(sx)} ${n(y + 3)} ${n(sx + 3.4)} ${n(y - 3.5)}Q${n(sx)} ${n(y - 1.6)} ${n(sx - 3.4)} ${n(y - 3.5)}Z`, fill: it.color || '#FFE7B8' }));
    else s.push(h('path', { d: `M${n(sx - 2.6)} ${n(y - 6)}H${n(sx + 2.6)}L${n(sx + 3.6)} ${n(y + 0.5)}H${n(sx - 3.6)}Z`, fill: it.color || '#FFE7B8', stroke: it.metal === 'black' ? '#1D1147' : '#B7791F', 'stroke-width': 0.4 }));
    s.push(h('ellipse', { cx: n(sx), cy: n(y - 1), rx: 22, ry: 26, fill: 'url(#gGlow)', opacity: 0.55, style: 'mix-blend-mode:screen' }));
    return s.join('');
  },
  neonSlot(it, { x, y, w, h: hh, c }) {
    const col = it.color || '#FF6A13'; const s = [];
    s.push(h('ellipse', { cx: n(x + w / 2), cy: n(y + hh / 2), rx: n(w * 0.75), ry: n(hh * 0.8), fill: col, opacity: 0.16, filter: 'url(#fBlur14)', style: 'mix-blend-mode:screen' }));
    const d = it.shape === 'arch' ? `M${n(x)} ${n(y + hh)}V${n(y + w / 2)}A${n(w / 2)} ${n(w / 2)} 0 0 1 ${n(x + w)} ${n(y + w / 2)}V${n(y + hh)}Z` : `M${n(x + 4)} ${n(y)}H${n(x + w - 4)}Q${n(x + w)} ${n(y)} ${n(x + w)} ${n(y + 4)}V${n(y + hh - 4)}Q${n(x + w)} ${n(y + hh)} ${n(x + w - 4)} ${n(y + hh)}H${n(x + 4)}Q${n(x)} ${n(y + hh)} ${n(x)} ${n(y + hh - 4)}V${n(y + 4)}Q${n(x)} ${n(y)} ${n(x + 4)} ${n(y)}Z`;
    s.push(h('path', { d, fill: 'none', stroke: col, 'stroke-width': 0.9, 'stroke-dasharray': '3 2.2', opacity: 0.95 }));
    s.push(h('path', { d, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 0.3, 'stroke-dasharray': '3 2.2', opacity: 0.8 }));
    const fy = y + hh / 2;
    s.push(h('text', { x: n(x + w / 2), y: n(fy - 1), 'text-anchor': 'middle', 'font-family': it.font || "'DM Sans',sans-serif", 'font-weight': 700, 'font-size': it.fs || 3.4, 'letter-spacing': 0.5, fill: it.labelColor || '#FFFFFF' }, esc(it.label || 'NEON ARTWORK HERE')));
    s.push(h('text', { x: n(x + w / 2), y: n(fy + 4), 'text-anchor': 'middle', 'font-family': it.font2 || "'DM Sans',sans-serif", 'font-weight': 500, 'font-size': (it.fs || 3.4) * 0.72, fill: it.labelColor || '#FFFFFF', opacity: 0.85 }, esc(it.label2 || 'placeholder · see Murals & Neon')));
    return s.join('');
  },
  garland(it, { x, y, w }) {      // real marigold swag strung along a rail
    const s = []; const nSw = it.swags || 3; const sw = w / nSw; const sag = it.sag || 7;
    const cols = it.colors || ['#FFB000', '#FF6A13', '#FFB000', '#FFC93C'];
    for (let i = 0; i < nSw; i++) {
      const x0 = x + i * sw;
      for (let t = 0; t <= 1.0001; t += 1 / 16) {
        const px = x0 + t * sw, py = y + sag * 4 * t * (1 - t);
        const col = cols[Math.round(t * 16 + i) % cols.length];
        if (Math.round(t * 16) % 5 === 2) s.push(h('ellipse', { cx: n(px), cy: n(py + 1.4), rx: 1.1, ry: 0.6, fill: '#3FA34D' }));
        s.push(h('circle', { cx: n(px), cy: n(py), r: 1.25, fill: col, stroke: '#B34A00', 'stroke-width': 0.18 }));
      }
      // tassel drop
      if (it.drops !== false) for (let d = 0; d < 5; d++) s.push(h('circle', { cx: n(x0), cy: n(y + d * 2.2), r: 1.1, fill: cols[d % 2], stroke: '#B34A00', 'stroke-width': 0.18 }));
    }
    return s.join('');
  },
  shelf(it, { x, y, w, c }) {     // chai-corner open shelf with glasses & jars
    const s = []; const wood = it.wood || '#A0522D';
    s.push(h('rect', { x: n(x + 0.5), y: n(y + 1.6), width: n(w), height: 2, fill: '#000', opacity: 0.25, filter: 'url(#fBlur3)' }));
    s.push(h('rect', { x: n(x), y: n(y), width: n(w), height: 1.5, fill: wood }));
    s.push(h('path', { d: `M${n(x + 4)} ${n(y + 1.5)}l2 4h1.2l-2 -4zM${n(x + w - 4)} ${n(y + 1.5)}l-2 4h-1.2l2 -4z`, fill: '#1D1147' }));
    const items = it.items || ['glass', 'glass', 'jar', 'kettle', 'glass', 'glass', 'jar', 'glass'];
    let cx = x + 2.5; const R2 = rng(11);
    items.forEach((t) => {
      if (t === 'glass') { s.push(h('path', { d: `M${n(cx)} ${n(y)}l-0.5 -4.2h3.4l-0.5 4.2z`, fill: '#FFE7B8', opacity: 0.55, stroke: '#1D1147', 'stroke-width': 0.2 })); s.push(h('rect', { x: n(cx - 0.2), y: n(y - 2.2), width: 2.4, height: 2.2, fill: '#C46A1B', opacity: 0.85 })); cx += 3.6; }
      else if (t === 'jar') { const col = ['#E4147E', '#00A8A0', '#FFB000'][Math.floor(R2() * 3)]; s.push(h('rect', { x: n(cx), y: n(y - 5.2), width: 3.4, height: 5.2, rx: 0.8, fill: '#FFF4DC', opacity: 0.6, stroke: '#1D1147', 'stroke-width': 0.2 })); s.push(h('rect', { x: n(cx), y: n(y - 3.4), width: 3.4, height: 3.4, rx: 0.6, fill: col, opacity: 0.8 })); s.push(h('rect', { x: n(cx - 0.2), y: n(y - 6), width: 3.8, height: 1, rx: 0.4, fill: '#1D1147' })); cx += 4.6; }
      else if (t === 'kettle') { s.push(h('path', { d: `M${n(cx)} ${n(y)}q-0.8 -4 1.6 -5.6h3.2q2.4 1.6 1.6 5.6z`, fill: 'url(#gBrass)', stroke: '#7A4C12', 'stroke-width': 0.2 })); s.push(h('path', { d: `M${n(cx + 6.2)} ${n(y - 3.4)}l2.4 -2`, stroke: '#B7791F', 'stroke-width': 0.6 })); s.push(h('path', { d: `M${n(cx + 1.4)} ${n(y - 5.6)}q2 -2.6 4 0`, stroke: '#7A4C12', 'stroke-width': 0.4, fill: 'none' })); cx += 9; }
    });
    return s.join('');
  },
  sign(it, { x, y, w, h: hh }) {   // hand-painted sign board (chai corner)
    const s = []; const bg = it.bg || '#E4147E', fg = it.fg || '#FFF4DC', ac = it.accent || '#FFB000';
    s.push(h('rect', { x: n(x + 1), y: n(y + 2), width: n(w), height: n(hh), rx: 2, fill: '#000', opacity: 0.25, filter: 'url(#fBlur3)' }));
    s.push(h('rect', { x: n(x), y: n(y), width: n(w), height: n(hh), rx: 2, fill: bg, stroke: '#1D1147', 'stroke-width': 0.8 }));
    s.push(h('rect', { x: n(x + 1.4), y: n(y + 1.4), width: n(w - 2.8), height: n(hh - 2.8), rx: 1.2, fill: 'none', stroke: ac, 'stroke-width': 0.4, 'stroke-dasharray': '1.2 0.9' }));
    s.push(h('text', { x: n(x + w / 2), y: n(y + hh * 0.56), 'text-anchor': 'middle', 'font-family': "'Bowlby One',sans-serif", 'font-size': n(hh * 0.42), fill: fg, stroke: '#1D1147', 'stroke-width': 0.5, 'paint-order': 'stroke' }, esc(it.text || 'CHAI')));
    s.push(h('text', { x: n(x + w / 2), y: n(y + hh * 0.84), 'text-anchor': 'middle', 'font-family': "'Caveat',cursive", 'font-weight': 700, 'font-size': n(hh * 0.2), fill: ac }, esc(it.sub || 'pull up a stool')));
    return s.join('');
  },
  mirror(it, { x, y, w, h: hh }) {   // arched brass mirror (royal)
    const ar = w / 2; const s = [];
    const d = (i) => `M${n(x + i)} ${n(y + hh - i)}V${n(y + ar)}A${n(ar - i)} ${n(ar - i)} 0 0 1 ${n(x + w - i)} ${n(y + ar)}V${n(y + hh - i)}Z`;
    s.push(h('path', { d: d(0), fill: '#000', opacity: 0.3, filter: 'url(#fBlur3)', transform: 'translate(1 2.5)' }));
    s.push(h('path', { d: d(0), fill: 'url(#gBrass)' }));
    s.push(h('path', { d: d(1.6), fill: it.glass || '#2A1240' }));
    s.push(h('path', { d: `M${n(x + w * 0.25)} ${n(y + hh)}L${n(x + w * 0.62)} ${n(y + ar * 0.4)}L${n(x + w * 0.78)} ${n(y + ar * 0.55)}L${n(x + w * 0.45)} ${n(y + hh)}Z`, fill: '#FFF', opacity: 0.07 }));
    return s.join('');
  },
};

/* framed-print artworks (original, abstract — no marks, no people, no sacred symbols) */
const ART = {
  chai(w, hh) {   // Bazaar: sunrise over a cutting-chai glass, block-print border
    const s = [];
    s.push(h('rect', { width: n(w), height: n(hh), fill: '#FF6A13' }));
    s.push(h('circle', { cx: n(w / 2), cy: n(hh * 0.42), r: n(w * 0.32), fill: '#FFB000' }));
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; s.push(h('path', { d: `M${n(w / 2 + Math.cos(a) * w * 0.36)} ${n(hh * 0.42 + Math.sin(a) * w * 0.36)}L${n(w / 2 + Math.cos(a + 0.12) * w * 0.44)} ${n(hh * 0.42 + Math.sin(a + 0.12) * w * 0.44)}L${n(w / 2 + Math.cos(a - 0.12) * w * 0.44)} ${n(hh * 0.42 + Math.sin(a - 0.12) * w * 0.44)}Z`, fill: '#FFF4DC' })); }
    s.push(h('rect', { y: n(hh * 0.66), width: n(w), height: n(hh * 0.34), fill: '#E4147E' }));
    const gx = w / 2, gy = hh * 0.86, gw = w * 0.2;
    s.push(h('path', { d: `M${n(gx - gw)} ${n(gy - gw * 2)}L${n(gx + gw)} ${n(gy - gw * 2)}L${n(gx + gw * 0.78)} ${n(gy)}L${n(gx - gw * 0.78)} ${n(gy)}Z`, fill: '#FFF4DC', stroke: '#1D1147', 'stroke-width': 0.5 }));
    s.push(h('path', { d: `M${n(gx - gw * 0.92)} ${n(gy - gw * 1.3)}L${n(gx + gw * 0.92)} ${n(gy - gw * 1.3)}L${n(gx + gw * 0.78)} ${n(gy)}L${n(gx - gw * 0.78)} ${n(gy)}Z`, fill: '#C46A1B' }));
    s.push(h('path', { d: `M${n(gx - 1)} ${n(gy - gw * 2.3)}q-1.4 -2 0 -4q1.4 -2 0 -4M${n(gx + 1.6)} ${n(gy - gw * 2.3)}q-1.4 -2 0 -4`, stroke: '#FFF4DC', 'stroke-width': 0.6, fill: 'none', 'stroke-linecap': 'round' }));
    let d = ''; for (let x = 1.5; x < w; x += 3) d += `M${n(x)} 1.2a0.9 0.9 0 1 0 0.01 0M${n(x)} ${n(hh - 1.2)}a0.9 0.9 0 1 0 0.01 0`;
    s.push(h('path', { d, fill: '#1D1147', opacity: 0.8 }));
    return s.join('');
  },
  arch(w, hh) {   // Royal: botanical sprig under a mihrab arch, gold on plum
    const s = []; s.push(h('rect', { width: n(w), height: n(hh), fill: '#4B1D52' }));
    const ar = w * 0.36, cx = w / 2, top = hh * 0.12, bot = hh * 0.9;
    s.push(h('path', { d: `M${n(cx - ar)} ${n(bot)}V${n(top + ar)}A${n(ar)} ${n(ar)} 0 0 1 ${n(cx + ar)} ${n(top + ar)}V${n(bot)}Z`, fill: '#160B26', stroke: '#E9A63A', 'stroke-width': 0.5 }));
    s.push(h('path', { d: `M${n(cx)} ${n(bot - 1)}C${n(cx - 1)} ${n(hh * 0.6)} ${n(cx + 1)} ${n(hh * 0.4)} ${n(cx)} ${n(top + ar * 0.5)}`, stroke: '#E9A63A', 'stroke-width': 0.45, fill: 'none' }));
    for (let i = 0; i < 6; i++) {
      const yy = bot - 4 - i * (bot - top - ar) / 6.5, sgn = i % 2 ? 1 : -1, L2 = ar * (0.75 - i * 0.07);
      s.push(h('path', { d: `M${n(cx)} ${n(yy)}q${n(sgn * L2 * 0.5)} ${n(-L2 * 0.5)} ${n(sgn * L2)} ${n(-L2 * 0.25)}q${n(-sgn * L2 * 0.5)} ${n(L2 * 0.35)} ${n(-sgn * L2)} ${n(L2 * 0.25)}Z`, fill: i % 2 ? '#0F4D3F' : '#117C86', stroke: '#E9A63A', 'stroke-width': 0.25 }));
    }
    s.push(h('circle', { cx: n(cx), cy: n(top + ar * 0.45), r: n(ar * 0.2), fill: '#A3173F', stroke: '#F7D98A', 'stroke-width': 0.3 }));
    return s.join('');
  },
  beige(w, hh) {  // generic "before" print
    return [h('rect', { width: n(w), height: n(hh), fill: '#D9CDB8' }), h('path', { d: `M0 ${n(hh * 0.7)}Q${n(w * 0.3)} ${n(hh * 0.5)} ${n(w * 0.55)} ${n(hh * 0.68)}T${n(w)} ${n(hh * 0.62)}V${n(hh)}H0Z`, fill: '#B9AB93' }), h('circle', { cx: n(w * 0.7), cy: n(hh * 0.3), r: n(w * 0.1), fill: '#E8DFCF' })].join('');
  },
};

/* ═════════════ FREE-STANDING OBJECTS ═════════════ */
const OBJ = {
  banquette(it, { cam, c, defs, uid, OL }) {
    const u = Object.assign({}, c.uph, it.uph || {});
    const x0 = it.x0, x1 = it.x1, Lin = (x1 - x0) * 12;
    const s = [];
    const gC = uid('ch');
    defs.push(`<linearGradient id="${gC}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(u.color, -0.32)}"/><stop offset=".22" stop-color="${shade(u.color, 0.02)}"/><stop offset=".5" stop-color="${shade(u.color, 0.14)}"/><stop offset=".8" stop-color="${shade(u.color, -0.04)}"/><stop offset="1" stop-color="${shade(u.color, -0.36)}"/></linearGradient>`);
    const gV = uid('cv');
    defs.push(`<linearGradient id="${gV}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>`);
    const backTop = it.backH || 38, seatY = 18;
    // AO on the wall above the backrest
    {
      const q = cam.p(x0, backTop / 12, 0);
      s.push(`<g transform="${cam.bb(x0, 0.02)}">${h('rect', { x: -1, y: -backTop - 5, width: n(Lin + 2), height: 7, fill: '#000', opacity: 0.22, filter: 'url(#fBlur3)' })}</g>`);
    }
    // backrest (billboard at Z = 0.3)
    {
      const g = [];
      g.push(h('rect', { x: 0, y: -backTop, width: n(Lin), height: n(backTop - 10), rx: 3, fill: u.color }));
      if (u.style === 'channel') {
        const nC = Math.max(2, Math.round(Lin / (u.channel || 7.5))); const cw = Lin / nC;
        for (let i = 0; i < nC; i++) g.push(h('rect', { x: n(i * cw + 0.25), y: -backTop + 3.6, width: n(cw - 0.5), height: n(backTop - 14), rx: n(Math.min(cw / 2.2, 3)), fill: `url(#${gC})` }));
        let d = ''; for (let i = 1; i < nC; i++) d += `M${n(i * cw)} ${-backTop + 4}V${-10}`;
        g.push(h('path', { d, stroke: u.piping, 'stroke-width': 0.45, opacity: 0.95 }));
      } else if (u.style === 'tufted') {
        const sp = 7, rows = [-backTop + 8, -backTop + 15, -backTop + 22];
        let d = '';
        for (let xx = -sp; xx < Lin + sp; xx += sp) { d += `M${n(xx)} ${rows[0] - 3.5}L${n(xx + sp * 1.5)} ${rows[2] + 3.5}M${n(xx + sp * 1.5)} ${rows[0] - 3.5}L${n(xx)} ${rows[2] + 3.5}`; }
        g.push(`<clipPath id="${gC}c"><rect x="0" y="${-backTop + 3}" width="${n(Lin)}" height="${backTop - 13}"/></clipPath>`);
        g.push(h('rect', { x: 0, y: -backTop + 3, width: n(Lin), height: backTop - 13, fill: `url(#${gV})` }));
        g.push(h('path', { d, stroke: shade(u.color, -0.45), 'stroke-width': 0.5, 'clip-path': `url(#${gC}c)`, opacity: 0.8 }));
        g.push(h('path', { d, stroke: shade(u.color, 0.25), 'stroke-width': 0.25, transform: 'translate(0.5 0)', 'clip-path': `url(#${gC}c)`, opacity: 0.6 }));
        rows.forEach((ry, ri) => { for (let xx = (ri % 2 ? sp * 0.75 : 0); xx < Lin; xx += sp * 1.5) if (xx > 1 && xx < Lin - 1) g.push(h('circle', { cx: n(xx), cy: ry, r: 0.75, fill: u.button || shade(u.color, -0.4) })); });
      } else if (u.style === 'panel') {
        const nP = Math.max(1, Math.round(Lin / 26)); const pw = Lin / nP;
        for (let i = 0; i < nP; i++) {
          g.push(h('rect', { x: n(i * pw + 0.9), y: -backTop + 3.4, width: n(pw - 1.8), height: backTop - 14, rx: 2.4, fill: `url(#${gV})`, stroke: u.piping, 'stroke-width': 0.55 }));
        }
      } else {
        g.push(h('rect', { x: 0, y: -backTop, width: n(Lin), height: n(backTop - 10), rx: 3, fill: `url(#${gV})` }));
        let d = ''; for (let xx = 48; xx < Lin; xx += 48) d += `M${n(xx)} ${-backTop}V-10`;
        g.push(h('path', { d, stroke: shade(u.color, -0.5), 'stroke-width': 0.4 }));
        g.push(h('rect', { x: 2, y: -backTop + 4, width: n(Lin - 4), height: 1.2, rx: 0.6, fill: '#fff', opacity: 0.12 }));
      }
      // top roll + piping
      g.push(h('rect', { x: -0.4, y: -backTop - 0.6, width: n(Lin + 0.8), height: 4.2, rx: 2.1, fill: shade(u.color, 0.06) }));
      g.push(h('rect', { x: -0.4, y: -backTop - 0.6, width: n(Lin + 0.8), height: 4.2, rx: 2.1, fill: `url(#${gV})` }));
      g.push(h('path', { d: `M0 ${-backTop + 3.6}H${n(Lin)}`, stroke: u.piping, 'stroke-width': 0.55 }));
      g.push(h('path', { d: `M1 ${-backTop - 0.5}H${n(Lin - 1)}`, stroke: u.piping, 'stroke-width': 0.4, opacity: 0.8 }));
      s.push(`<g transform="${cam.bb(x0, 0.3)}">${g.join('')}</g>`);
    }
    // seat top (projected) — catches the pendant light
    {
      const q = cam.quadY(x0, x1, 0.45, 1.95, seatY / 12);
      s.push(poly(q, { fill: shade(u.color, 0.1) }));
      const gS = uid('st');
      defs.push(`<linearGradient id="${gS}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".12"/></linearGradient>`);
      s.push(poly(q, { fill: `url(#${gS})` }));
      const segs = Math.max(1, Math.round(Lin / (u.seatSeg || 30)));
      let d = ''; for (let i = 1; i < segs; i++) { const xx = x0 + (x1 - x0) * i / segs; const a = cam.p(xx, seatY / 12, 0.5), b = cam.p(xx, seatY / 12, 1.93); d += `M${n(a[0])} ${n(a[1])}L${n(b[0])} ${n(b[1])}`; }
      if (d) s.push(h('path', { d, stroke: shade(u.color, -0.45), 'stroke-width': 1.4, opacity: 0.7 }));
    }
    // seat front (billboard at Z = 1.95)
    {
      const g = [];
      g.push(h('rect', { x: 0, y: -seatY, width: n((x1 - x0) * 12), height: 5.5, rx: 1.6, fill: shade(u.color, -0.08) }));
      g.push(h('rect', { x: 0, y: -seatY, width: n((x1 - x0) * 12), height: 5.5, rx: 1.6, fill: `url(#${gV})` }));
      g.push(h('path', { d: `M0.6 ${-seatY + 0.3}H${n((x1 - x0) * 12 - 0.6)}M0.6 ${-seatY + 5.3}H${n((x1 - x0) * 12 - 0.6)}`, stroke: u.piping, 'stroke-width': 0.55 }));
      const segs = Math.max(1, Math.round(Lin / (u.seatSeg || 30)));
      let d = ''; for (let i = 1; i < segs; i++) { const xx = (x1 - x0) * 12 * i / segs; d += `M${n(xx)} ${-seatY}v5.5`; }
      if (d) g.push(h('path', { d, stroke: shade(u.color, -0.5), 'stroke-width': 0.5 }));
      g.push(h('rect', { x: 0.5, y: -seatY + 5.5, width: n((x1 - x0) * 12 - 1), height: 8.5, fill: u.base === 'brass' ? 'url(#gBrassV)' : (u.apron || shade(u.color, -0.22)) }));
      if (u.base !== 'brass' && u.apronStyle === 'slats') { let dd = ''; for (let xx = 3; xx < (x1 - x0) * 12; xx += 3) dd += `M${n(xx)} ${-seatY + 5.8}v8`; g.push(h('path', { d: dd, stroke: '#000', 'stroke-opacity': 0.22, 'stroke-width': 0.35 })); }
      g.push(h('rect', { x: 0.5, y: -seatY + 5.5, width: n((x1 - x0) * 12 - 1), height: 1.1, fill: '#000', opacity: 0.25 }));
      g.push(h('rect', { x: 2, y: -4, width: n((x1 - x0) * 12 - 4), height: 4, fill: u.kick || '#120A1E' }));
      if (u.base === 'brass' || u.kickBrass) g.push(h('rect', { x: 2, y: -4.2, width: n((x1 - x0) * 12 - 4), height: 0.8, fill: 'url(#gBrass)' }));
      s.push(`<g transform="${cam.bb(x0, 1.95)}">${g.join('')}</g>`);
    }
    // floor contact shadow
    s.push(poly(cam.quadY(x0, x1, 1.6, 2.35, 0), { fill: '#000', opacity: 0.32, filter: 'url(#fBlur6)' }));
    return s.join('');
  },

  table(it, ctx) {
    const { cam, c, defs, uid, R, fx } = ctx;
    const T = Object.assign({}, c.table, it.table || {});
    const X = it.x, Z = it.z, hw = (it.w || 30) / 24, hd = (it.d || 30) / 24, top = (it.h || 30) / 12;
    const s = [];
    // shadow
    s.push(poly(cam.ellY(X, Z, hw * 1.15, hd * 0.95, 0), { fill: '#000', opacity: 0.35, filter: 'url(#fBlur6)' }));
    // base
    {
      const g = [];
      const bc = T.base === 'brass' ? 'url(#gBrass)' : T.base;
      if (T.baseStyle === 'x') {
        g.push(h('path', { d: 'M-12 0L-1.2 -3H1.2L12 0Z', fill: bc }));
        g.push(h('rect', { x: -1.3, y: -28.6, width: 2.6, height: 26, fill: bc }));
      } else {
        g.push(h('rect', { x: -1.5, y: -28.6, width: 3, height: 27.4, fill: bc }));
        g.push(h('rect', { x: -1.5, y: -28.6, width: 3, height: 27.4, fill: '#000', opacity: 0.18 }));
      }
      s.push(`<g transform="${cam.bb(X, Z)}">${g.join('')}</g>`);
      if (T.baseStyle !== 'x') s.push(poly(cam.ellY(X, Z, 0.6, 0.6, 0.04, 28), { fill: bc }));
      if (T.baseStyle !== 'x') s.push(poly(cam.ellY(X, Z, 0.6, 0.6, 0.02, 28).slice(0, 15), { fill: '#fff', opacity: 0.12 }));
    }
    // top surface
    const q = cam.quadY(X - hw, X + hw, Z - hd, Z + hd, top);
    const tc = T.colors;
    s.push(poly(q, { fill: tc[0] }));
    if (T.top === 'terrazzo') {
      let layers = {};
      const nChips = it.chips || 90;
      for (let i = 0; i < nChips; i++) {
        const u = R() * 2 - 1, v = R() * 2 - 1, r = 0.025 + R() * 0.05, col = tc[1 + Math.floor(R() * (tc.length - 1))];
        const sides = 5 + Math.floor(R() * 3), rot = R() * 6;
        const ptsA = [];
        for (let k = 0; k < sides; k++) { const a = rot + k / sides * Math.PI * 2, rr = r * (0.6 + R() * 0.5); ptsA.push(cam.p(X + u * (hw - 0.05) + Math.cos(a) * rr, top, Z + v * (hd - 0.05) + Math.sin(a) * rr)); }
        (layers[col] = layers[col] || []).push(pathFrom(ptsA));
      }
      Object.keys(layers).forEach((col) => s.push(h('path', { d: layers[col].join(''), fill: col })));
    } else if (T.top === 'marble') {
      for (let i = 0; i < 6; i++) { const a = []; let u = -1, v = R() * 2 - 1; for (let k = 0; k <= 10; k++) { a.push(cam.p(X + u * hw, top, Z + v * hd)); u += 0.2; v += (R() - 0.5) * 0.3; v = Math.max(-1, Math.min(1, v)); } s.push(h('path', { d: pathFrom(a, false), stroke: tc[1], 'stroke-width': 1, fill: 'none', opacity: 0.5 })); }
    } else if (T.top === 'laminate') {
      s.push(poly(q, { fill: '#fff', opacity: 0.05 }));
    }
    // light pool on top (pendant)
    if (c.light.pool > 0) {
      const e = cam.ellY(X, Z - 0.1, hw * 0.8, hd * 0.75, top + 0.001, 30);
      s.push(poly(e, { fill: c.light.warm, opacity: 0.32, filter: 'url(#fBlur6)', style: 'mix-blend-mode:screen' }));
    }
    // edge band (front face)
    {
      const ed = T.edge === 'brass' ? 'url(#gBrass)' : T.edge;
      const g = h('rect', { x: n(-hw * 12), y: n(-top * 12), width: n(hw * 24), height: 1.4, fill: ed }) + (T.edge === 'brass' ? h('rect', { x: n(-hw * 12), y: n(-top * 12), width: n(hw * 24), height: 0.3, fill: '#FFF3CF', opacity: 0.8 }) : '');
      s.push(`<g transform="${cam.bb(X, Z + hd)}">${g}</g>`);
      // side-edge sliver (perspective)
      const side = X + hw < cam.camX ? [cam.p(X + hw, top, Z - hd), cam.p(X + hw, top, Z + hd), cam.p(X + hw, top - 0.117, Z + hd), cam.p(X + hw, top - 0.117, Z - hd)] : [cam.p(X - hw, top, Z - hd), cam.p(X - hw, top, Z + hd), cam.p(X - hw, top - 0.117, Z + hd), cam.p(X - hw, top - 0.117, Z - hd)];
      s.push(poly(side, { fill: T.edge === 'brass' ? '#B7791F' : shade(T.edge, -0.2) }));
    }
    // tabletop props
    (it.props || []).forEach((p) => s.push(prop(p, X, Z, top, ctx)));
    return s.join('');
  },

  chair(it, { cam, c, defs, uid }) {
    const ch = Object.assign({}, c.chair, it.chair || {});
    const g = [];
    const col = ch.color, ol = ch.outline || 'none', ow = ch.outline ? 0.45 : 0;
    const view = it.view || 'back';
    const ink = shade(col, -0.35);
    if (view === 'back') {
      if (ch.style === 'cafe') {
        g.push(h('path', { d: 'M-6.6 0L-6 -17.2M6.6 0L6 -17.2', stroke: shade(col, -0.45), 'stroke-width': 1.1, 'stroke-linecap': 'round' }));
        g.push(h('path', { d: 'M-8.8 -17.2H8.8', stroke: col, 'stroke-width': 1.8, 'stroke-linecap': 'round' }));
        g.push(h('path', { d: 'M-8.6 0.2L-7.6 -33M8.6 0.2L7.6 -33', stroke: col, 'stroke-width': 1.3, 'stroke-linecap': 'round' }));
        g.push(h('path', { d: 'M-8.2 -31Q0 -35.6 8.2 -31', stroke: col, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }));
        g.push(h('path', { d: 'M-8 -24.5Q0 -27 8 -24.5', stroke: col, 'stroke-width': 1.3, fill: 'none' }));
        g.push(h('circle', { cx: 0, cy: -28.4, r: 2.2, stroke: col, 'stroke-width': 1, fill: 'none' }));
        g.push(h('path', { d: 'M-8.2 -31.6Q0 -36 8.2 -31.6', stroke: '#fff', 'stroke-opacity': 0.35, 'stroke-width': 0.5, fill: 'none' }));
        if (ch.seat) g.push(h('rect', { x: -8.6, y: -19.4, width: 17.2, height: 2.4, rx: 1.2, fill: ch.seat }));
      } else if (ch.style === 'upholstered') {
        g.push(h('path', { d: 'M-6 0L-6.6 -15M6 0L6.6 -15', stroke: ch.leg === 'brass' ? '#B7791F' : '#1A1020', 'stroke-width': 1.1, 'stroke-linecap': 'round' }));
        g.push(h('path', { d: 'M-8.4 0.2L-7.8 -16M8.4 0.2L7.8 -16', stroke: ch.leg === 'brass' ? '#E9A63A' : '#1A1020', 'stroke-width': 1.3, 'stroke-linecap': 'round' }));
        g.push(h('rect', { x: -9.4, y: -19, width: 18.8, height: 4, rx: 1.6, fill: shade(col, -0.18) }));
        const d = 'M-9 -16.5V-29Q-9 -36.5 0 -37Q9 -36.5 9 -29V-16.5Z';
        g.push(h('path', { d, fill: col }));
        const gid = uid('cb');
        defs.push(`<linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".3"/><stop offset=".45" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>`);
        g.push(h('path', { d, fill: `url(#${gid})` }));
        g.push(h('path', { d, fill: 'none', stroke: ch.piping || shade(col, 0.3), 'stroke-width': 0.5 }));
        if (ch.ring) g.push(h('circle', { cx: 0, cy: -31, r: 1.3, fill: 'none', stroke: '#E9A63A', 'stroke-width': 0.5 }));
      } else if (ch.style === 'cane') {
        g.push(h('path', { d: 'M-6.4 0L-6 -17M6.4 0L6 -17', stroke: shade(col, -0.4), 'stroke-width': 1.2 }));
        g.push(h('rect', { x: -9, y: -19, width: 18, height: 2.4, rx: 1, fill: col }));
        g.push(h('path', { d: 'M-8.6 0.2L-7.8 -34M8.6 0.2L7.8 -34', stroke: col, 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
        g.push(h('rect', { x: -7.6, y: -33.5, width: 15.2, height: 11, rx: 2, fill: ch.cane || '#E9C98A', stroke: col, 'stroke-width': 1.2 }));
        let d = ''; for (let xx = -7; xx < 7.6; xx += 1.3) d += `M${n(xx)} -33V-23`; for (let yy = -32.6; yy < -22.5; yy += 1.3) d += `M-7.2 ${n(yy)}H7.2`;
        g.push(h('path', { d, stroke: shade(ch.cane || '#E9C98A', -0.3), 'stroke-width': 0.22 }));
      } else {   // basic dark wood (before)
        g.push(h('path', { d: 'M-6.4 0V-17M6.4 0V-17', stroke: shade(col, -0.3), 'stroke-width': 1.3 }));
        g.push(h('rect', { x: -8.8, y: -19, width: 17.6, height: 2.2, fill: col }));
        g.push(h('path', { d: 'M-8.2 0V-34M8.2 0V-34', stroke: col, 'stroke-width': 1.6 }));
        g.push(h('rect', { x: -8.6, y: -34, width: 17.2, height: 3, fill: col }));
        g.push(h('rect', { x: -8.6, y: -27, width: 17.2, height: 1.8, fill: col }));
      }
    } else {   // profile, facing +x (dir 1) or -x (dir -1)
      const d = it.dir || 1;
      const gg = [];
      if (ch.style === 'cafe') {
        gg.push(h('path', { d: 'M-7 0.2L-7.4 -18M7 0.2L6.4 -18', stroke: col, 'stroke-width': 1.2, 'stroke-linecap': 'round' }));
        gg.push(h('path', { d: 'M-8 -18H8', stroke: col, 'stroke-width': 2, 'stroke-linecap': 'round' }));
        gg.push(h('path', { d: 'M-7.4 -18Q-8.6 -26 -9.6 -33.5', stroke: col, 'stroke-width': 1.4, fill: 'none', 'stroke-linecap': 'round' }));
        gg.push(h('path', { d: 'M-9.8 -33.5Q-8.6 -31 -8.3 -24', stroke: col, 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' }));
        gg.push(h('path', { d: 'M-6 -9H5.6', stroke: col, 'stroke-width': 0.6 }));
        if (ch.seat) gg.push(h('rect', { x: -8.2, y: -20.2, width: 16, height: 2.2, rx: 1.1, fill: ch.seat }));
      } else if (ch.style === 'upholstered') {
        const lg = ch.leg === 'brass' ? '#E9A63A' : '#1A1020';
        gg.push(h('path', { d: 'M-7 0.2L-6.4 -15M7 0.2L6.2 -15', stroke: lg, 'stroke-width': 1.2, 'stroke-linecap': 'round' }));
        gg.push(h('rect', { x: -8.4, y: -19.5, width: 17, height: 4.6, rx: 2, fill: shade(col, 0.04) }));
        gg.push(h('path', { d: 'M-8.6 -17L-10.4 -36Q-8 -38 -5.8 -36L-5 -18Z', fill: shade(col, -0.12) }));
        gg.push(h('path', { d: 'M-8.6 -17L-10.4 -36Q-8 -38 -5.8 -36L-5 -18Z', fill: 'none', stroke: ch.piping || shade(col, 0.3), 'stroke-width': 0.45 }));
      } else {
        gg.push(h('path', { d: 'M-7 0V-18M7 0V-18', stroke: col, 'stroke-width': 1.4 }));
        gg.push(h('rect', { x: -8.4, y: -19.6, width: 16.8, height: 2, fill: col }));
        gg.push(h('path', { d: 'M-7.6 -18L-8.6 -34', stroke: col, 'stroke-width': 1.8 }));
        gg.push(h('rect', { x: -9.8, y: -33.6, width: 3, height: 9, fill: col }));
      }
      g.push(`<g transform="scale(${d} 1)">${gg.join('')}</g>`);
    }
    const sh = poly(cam.ellY(it.x, it.z, 0.8, 0.6, 0), { fill: '#000', opacity: 0.3, filter: 'url(#fBlur6)' });
    return sh + `<g transform="${cam.bb(it.x, it.z)}">${g.join('')}</g>`;
  },

  stool(it, { cam, c }) {
    const col = it.color || '#1D1147', seat = it.seat || '#E4147E';
    const g = [h('path', { d: 'M-6 0L-4 -26M6 0L4 -26M-5.4 -6H5.4M-4.6 -16H4.6', stroke: col, 'stroke-width': 1.2, 'stroke-linecap': 'round' }),
      h('rect', { x: -7.6, y: -29, width: 15.2, height: 3.4, rx: 1.7, fill: seat, stroke: col, 'stroke-width': 0.5 }),
      h('rect', { x: -6.6, y: -28.6, width: 9, height: 0.8, rx: 0.4, fill: '#fff', opacity: 0.35 })];
    return poly(cam.ellY(it.x, it.z, 0.65, 0.5, 0), { fill: '#000', opacity: 0.28, filter: 'url(#fBlur6)' }) + `<g transform="${cam.bb(it.x, it.z)}">${g.join('')}</g>`;
  },

  pendant(it, { cam, c, uid, defs, fx }) {
    const lp = Object.assign({}, c.lamp, it.lamp || {});
    const X = it.x, Z = it.z, Yb = it.y || 5;      // shade bottom height (ft)
    const base = cam.p(X, Yb, Z);
    const ceil = cam.p(X, c.room.H, Z);
    const sc = cam.s(Z) / 12;
    const s = [];
    const shadeH = { dome: 9, bell: 11, lantern: 16, globe: 11, scallop: 10, rattan: 12, cone: 12 }[lp.style] || 10;
    s.push(h('path', { d: `M${n(base[0])} ${n(Math.max(ceil[1], -5))}V${n(base[1] - shadeH * sc)}`, stroke: lp.cord || '#1A1020', 'stroke-width': n(Math.max(1.2, 0.35 * sc)) }));
    if (ceil[1] > 0) s.push(h('rect', { x: n(base[0] - 3 * sc), y: n(ceil[1]), width: n(6 * sc), height: n(1.2 * sc), fill: lp.metal === 'black' ? '#1A1020' : 'url(#gBrass)' }));
    const g = [];
    const met = lp.metal === 'black' ? '#1A1020' : 'url(#gBrass)';
    const OLs = lp.outline ? { stroke: lp.outline, 'stroke-width': 0.5 } : {};
    if (lp.style === 'dome') {
      g.push(h('rect', { x: -1.3, y: -11.2, width: 2.6, height: 2.6, rx: 0.5, fill: met }));
      g.push(h('path', Object.assign({ d: 'M-9 0C-9 -5 -5.5 -9.2 0 -9.2C5.5 -9.2 9 -5 9 0Z', fill: lp.color }, OLs)));
      g.push(h('path', { d: 'M-6.8 -2.2C-6.4 -5.6 -4 -7.6 -0.6 -7.9', stroke: '#fff', 'stroke-opacity': 0.45, 'stroke-width': 0.8, fill: 'none', 'stroke-linecap': 'round' }));
      if (lp.band) g.push(h('path', { d: 'M-8.4 -2.6H8.4', stroke: lp.band, 'stroke-width': 1.2 }));
      g.push(h('ellipse', { cx: 0, cy: 0, rx: 9, ry: 1.3, fill: '#FFF4D6' }));
    } else if (lp.style === 'scallop') {
      g.push(h('rect', { x: -1.2, y: -12, width: 2.4, height: 2.4, fill: met }));
      let d = 'M-7 -9.6H7L9 -1'; for (let i = 5; i >= 0; i--) d += `A1.5 1.4 0 0 1 ${n(-9 + i * 3)} -1`; d += 'Z';
      g.push(h('path', Object.assign({ d, fill: lp.color }, OLs)));
      g.push(h('path', { d: 'M-7.6 -7.2H7.6', stroke: lp.band || '#FFB000', 'stroke-width': 1 }));
      g.push(h('ellipse', { cx: 0, cy: -1, rx: 8.4, ry: 1.1, fill: '#FFF4D6' }));
    } else if (lp.style === 'rattan') {
      g.push(h('path', { d: 'M-2 -12H2L10 0H-10Z', fill: lp.color || '#C98B4A' }));
      let d = ''; for (let i = -9; i <= 9; i += 1.5) d += `M${n(i * 0.2)} -12L${n(i)} 0`; for (let y = -10; y < 0; y += 1.6) { const w2 = 2 + (y + 12) / 12 * 8; d += `M${n(-w2)} ${n(y)}H${n(w2)}`; }
      g.push(h('path', { d, stroke: shade(lp.color || '#C98B4A', -0.35), 'stroke-width': 0.3 }));
      g.push(h('ellipse', { cx: 0, cy: 0, rx: 10, ry: 1.3, fill: '#FFF0C8' }));
    } else if (lp.style === 'bell') {
      g.push(h('rect', { x: -1.1, y: -13, width: 2.2, height: 2.5, fill: met }));
      g.push(h('path', { d: 'M-2.4 -10.8C-3 -6 -8 -4.6 -8.6 0H8.6C8 -4.6 3 -6 2.4 -10.8Z', fill: lp.color || 'url(#gBrassD)' }));
      g.push(h('path', { d: 'M-1.4 -10C-2 -6 -6 -4.4 -6.8 -1', stroke: '#FFF3CF', 'stroke-opacity': 0.55, 'stroke-width': 0.6, fill: 'none' }));
      g.push(h('ellipse', { cx: 0, cy: 0, rx: 8.6, ry: 1.2, fill: '#FFF4D6' }));
    } else if (lp.style === 'globe') {
      g.push(h('rect', { x: -2.2, y: -12.2, width: 4.4, height: 2.2, rx: 0.6, fill: met }));
      g.push(h('circle', { cx: 0, cy: -5, r: 5.6, fill: '#FFF2D2' }));
      g.push(h('circle', { cx: 0, cy: -5, r: 5.6, fill: 'url(#gGlow)', opacity: 0.8 }));
    } else if (lp.style === 'lantern') {     // faceted brass lantern with jali cut-outs (glowing)
      g.push(h('path', { d: 'M0 -17L-4.6 -12.6H4.6Z', fill: 'url(#gBrassD)' }));
      g.push(h('rect', { x: -5.2, y: -12.8, width: 10.4, height: 1.2, fill: '#B7791F' }));
      g.push(h('path', { d: 'M-5 -11.6H5L5.6 -2.2L0 0.4L-5.6 -2.2Z', fill: lp.color || '#4B1D52' }));
      g.push(h('path', { d: 'M-5 -11.6H5L5.6 -2.2L0 0.4L-5.6 -2.2Z', fill: 'none', stroke: 'url(#gBrass)', 'stroke-width': 0.6 }));
      let d = '';
      [-3, 0, 3].forEach((cx) => { for (let r = 0; r < 3; r++) { const cy = -10 + r * 2.9; d += `M${n(cx - 0.8)} ${n(cy + 1.6)}V${n(cy + 0.4)}A0.8 0.8 0 0 1 ${n(cx + 0.8)} ${n(cy + 0.4)}V${n(cy + 1.6)}Z`; } });
      g.push(h('path', { d, fill: '#FFE7A8' }));
      g.push(h('path', { d: 'M-1.8 -11.6V-1M1.8 -11.6V-1', stroke: '#B7791F', 'stroke-width': 0.35 }));
      g.push(h('path', { d: 'M0 0.4V2.4', stroke: '#E9A63A', 'stroke-width': 0.6 }));
      g.push(h('circle', { cx: 0, cy: 2.8, r: 0.7, fill: '#E9A63A' }));
    } else if (lp.style === 'cone') {
      g.push(h('path', { d: 'M-1.6 -12H1.6L7.4 0H-7.4Z', fill: lp.color || '#111' }));
      g.push(h('ellipse', { cx: 0, cy: 0, rx: 7.4, ry: 1.1, fill: '#FFF4D6' }));
    }
    s.push(`<g transform="translate(${n(base[0])} ${n(base[1])}) scale(${sc.toFixed(4)})">${g.join('')}</g>`);
    // glow + light cone (in fx layer so it sits over furniture)
    if (c.light.pool > 0) {
      const tableY = cam.p(X, 2.5, Z)[1];
      const r1 = 8 * sc, r2 = 24 * sc;
      fx.push(h('path', { d: `M${n(base[0] - r1)} ${n(base[1])}L${n(base[0] + r1)} ${n(base[1])}L${n(base[0] + r2)} ${n(tableY)}L${n(base[0] - r2)} ${n(tableY)}Z`, fill: 'url(#gCone)', opacity: (it.cone || 0.55) * c.light.pool / 0.6, filter: 'url(#fBlur3)', style: 'mix-blend-mode:screen' }));
      fx.push(h('ellipse', { cx: n(base[0]), cy: n(base[1] - (lp.style === 'globe' ? 5 * sc : 0)), rx: n(30 * sc), ry: n(22 * sc), fill: 'url(#gGlow)', opacity: 0.9, style: 'mix-blend-mode:screen' }));
    }
    return s.join('');
  },

  plant(it, { cam, c }) {
    const R2 = rng(it.seed || 3);
    const g = [];
    const potH = it.potH || 16, potW = it.potW || 15, kind = it.kind || 'fig';
    const potCol = it.pot || '#C8693A';
    const height = (it.h || 5.5) * 12;
    const greens = it.greens || ['#2F7D3A', '#3FA34D', '#1F5E2C', '#4FB35A'];
    if (kind === 'fig') {
      g.push(h('path', { d: `M0 ${-potH}C1 ${n(-height * 0.5)} -2 ${n(-height * 0.75)} 0 ${n(-height)}`, stroke: '#5B3A1E', 'stroke-width': 1.2, fill: 'none' }));
      const leaves = [];
      for (let i = 0; i < 26; i++) {
        const t = 0.25 + i / 26 * 0.75; const yy = -potH - (height - potH) * t;
        const side = i % 2 ? 1 : -1; const len = 7.5 + R2() * 4 - t * 1.5; const ang = side * (35 + R2() * 35) * Math.PI / 180;
        const bx = side * (1 + R2() * 1.5);
        const tx = bx + Math.sin(ang) * len, ty = yy - Math.cos(ang) * len;
        const nx = Math.cos(ang) * len * 0.38, ny = Math.sin(ang) * len * 0.38;
        const col = greens[Math.floor(R2() * greens.length)];
        leaves.push(h('path', { d: `M${n(bx)} ${n(yy)}Q${n((bx + tx) / 2 + nx)} ${n((yy + ty) / 2 + ny)} ${n(tx)} ${n(ty)}Q${n((bx + tx) / 2 - nx)} ${n((yy + ty) / 2 - ny)} ${n(bx)} ${n(yy)}Z`, fill: col }));
        leaves.push(h('path', { d: `M${n(bx)} ${n(yy)}L${n(tx * 0.9 + bx * 0.1)} ${n(ty * 0.9 + yy * 0.1)}`, stroke: shade(col, 0.25), 'stroke-width': 0.25, opacity: 0.7 }));
      }
      g.push(leaves.join(''));
    } else if (kind === 'snake') {
      for (let i = 0; i < 11; i++) {
        const bx = (i - 5) * 1.1, hh = height * (0.55 + R2() * 0.45), lean = (i - 5) * 0.9 + (R2() - 0.5) * 2, wd = 1.3 + R2() * 0.8;
        const col = greens[i % greens.length];
        g.push(h('path', { d: `M${n(bx - wd)} ${-potH}Q${n(bx + lean * 0.4 - wd)} ${n(-potH - hh * 0.6)} ${n(bx + lean)} ${n(-potH - hh)}Q${n(bx + lean * 0.4 + wd)} ${n(-potH - hh * 0.6)} ${n(bx + wd)} ${-potH}Z`, fill: col }));
        g.push(h('path', { d: `M${n(bx)} ${-potH}Q${n(bx + lean * 0.4)} ${n(-potH - hh * 0.6)} ${n(bx + lean)} ${n(-potH - hh)}`, stroke: it.edge || '#C9D96A', 'stroke-width': 0.3, fill: 'none', opacity: 0.55 }));
      }
    } else if (kind === 'palm') {
      for (let i = 0; i < 9; i++) {
        const a = (-70 + i * 17.5) * Math.PI / 180; const L2 = height * (0.55 + R2() * 0.3);
        const ex = Math.sin(a) * L2, ey = -potH - Math.cos(a) * L2 * 0.9;
        const col = greens[i % greens.length];
        g.push(h('path', { d: `M0 ${-potH}Q${n(ex * 0.3)} ${n(ey * 0.8)} ${n(ex)} ${n(ey)}`, stroke: '#4E6B2A', 'stroke-width': 0.6, fill: 'none' }));
        for (let k = 1; k < 12; k++) {
          const t = k / 12; const px = ex * t * t * 0.7 + ex * 0.3 * t, py = -potH + (ey + potH) * (1 - (1 - t) * (1 - t));
          [-1, 1].forEach((sd) => g.push(h('path', { d: `M${n(px)} ${n(py)}l${n(sd * 4.5 * (1 - t * 0.5))} ${n(3.2 + t * 2)}`, stroke: col, 'stroke-width': 1.1, 'stroke-linecap': 'round' })));
        }
      }
    }
    // pot
    const pst = it.potStyle || 'terracotta';
    if (pst === 'brass') {
      g.push(h('path', { d: `M${-potW / 2} ${-potH}H${potW / 2}L${n(potW / 2 - 1.5)} -3H${n(-potW / 2 + 1.5)}Z`, fill: 'url(#gBrass)' }));
      g.push(h('path', { d: `M${n(-potW / 2 + 2)} -3L${n(-potW / 2 + 2.6)} 0M${n(potW / 2 - 2)} -3L${n(potW / 2 - 2.6)} 0`, stroke: '#7A4C12', 'stroke-width': 0.8 }));
      g.push(h('rect', { x: -potW / 2 - 0.4, y: -potH - 1, width: potW + 0.8, height: 1.4, fill: '#F7D98A' }));
    } else {
      g.push(h('path', { d: `M${-potW / 2} ${-potH}H${potW / 2}L${n(potW / 2 - 2)} 0H${n(-potW / 2 + 2)}Z`, fill: potCol, stroke: it.potOutline || 'none', 'stroke-width': 0.5 }));
      g.push(h('rect', { x: -potW / 2 - 0.6, y: -potH - 1.6, width: potW + 1.2, height: 2.6, rx: 0.5, fill: shade(potCol, -0.1), stroke: it.potOutline || 'none', 'stroke-width': 0.5 }));
      if (it.potBand) g.push(h('path', { d: `M${n(-potW / 2 + 0.8)} ${n(-potH * 0.55)}H${n(potW / 2 - 0.8)}`, stroke: it.potBand, 'stroke-width': 2.4 }));
      if (it.potBand2) { let d = ''; for (let xx = -potW / 2 + 2; xx < potW / 2 - 1.5; xx += 2.4) d += `M${n(xx)} ${n(-potH * 0.32)}l1.2 -1.4l1.2 1.4`; g.push(h('path', { d, stroke: it.potBand2, 'stroke-width': 0.5, fill: 'none' })); }
      g.push(h('path', { d: `M${n(-potW / 2 + 1)} ${-potH + 1}L${n(-potW / 2 + 2.4)} -1`, stroke: '#fff', 'stroke-opacity': 0.25, 'stroke-width': 1 }));
    }
    const sh = poly(cam.ellY(it.x, it.z, 0.75, 0.55, 0), { fill: '#000', opacity: 0.32, filter: 'url(#fBlur6)' });
    return sh + `<g transform="${cam.bb(it.x, it.z)}">${g.join('')}</g>`;
  },

  jali(it, { cam, c, defs, uid }) {   // free-standing jali screen: arched panels with lattice cut-outs (see-through)
    const panels = it.panels || 3, pw = (it.pw || 3) * 12, ph = (it.ph || 7.5) * 12, gap = 2;
    const col = it.color || '#E9A63A';
    const mid = uid('jm'), pid = uid('jp');
    const cell = it.cell || 6;
    // lattice holes: 8-point star + crosses between (classic Mughal geometry)
    let star = ''; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + Math.PI / 8; const r = i % 2 ? cell * 0.19 : cell * 0.34; star += (i ? 'L' : 'M') + n(cell / 2 + Math.cos(a) * r) + ' ' + n(cell / 2 + Math.sin(a) * r); }
    star += 'Z';
    const dia = `M0 ${n(-cell * 0.12)}L${n(cell * 0.12)} 0L0 ${n(cell * 0.12)}L${n(-cell * 0.12)} 0Z`;
    defs.push(`<pattern id="${pid}" patternUnits="userSpaceOnUse" width="${cell}" height="${cell}"><rect width="${cell}" height="${cell}" fill="#fff"/><path d="${star}" fill="#000"/><path d="${dia}" fill="#000"/><path d="${dia}" transform="translate(${cell} 0)" fill="#000"/><path d="${dia}" transform="translate(0 ${cell})" fill="#000"/><path d="${dia}" transform="translate(${cell} ${cell})" fill="#000"/></pattern>`);
    const totalW = panels * pw + (panels - 1) * gap;
    const g = [];
    const arch = (x, inset) => { const a = pw / 2 - inset; return `M${n(x + inset)} ${n(-6 - inset * 0.2)}V${n(-ph + pw / 2 + 6)}Q${n(x + inset)} ${n(-ph + inset)} ${n(x + pw / 2)} ${n(-ph - 4 + inset)}Q${n(x + pw - inset)} ${n(-ph + inset)} ${n(x + pw - inset)} ${n(-ph + pw / 2 + 6)}V${n(-6 - inset * 0.2)}Z`; };
    let maskInner = `<rect x="-10" y="${-ph - 20}" width="${totalW + 20}" height="${ph + 30}" fill="#000"/>`;
    for (let i = 0; i < panels; i++) {
      const x = i * (pw + gap);
      maskInner += `<path d="${arch(x, 0)}" fill="#fff"/><path d="${arch(x, 2.6)}" fill="url(#${pid})"/>`;
    }
    defs.push(`<mask id="${mid}" maskUnits="userSpaceOnUse" x="-10" y="${-ph - 20}" width="${totalW + 20}" height="${ph + 30}">${maskInner}</mask>`);
    // shadow + body
    g.push(h('rect', { x: 0, y: -ph - 4, width: n(totalW), height: ph + 4, fill: col, mask: `url(#${mid})` }));
    const gj = uid('jg');
    defs.push(`<linearGradient id="${gj}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF3CF" stop-opacity=".45"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>`);
    g.push(h('rect', { x: 0, y: -ph - 4, width: n(totalW), height: ph + 4, fill: `url(#${gj})`, mask: `url(#${mid})` }));
    for (let i = 0; i < panels; i++) { const x = i * (pw + gap); g.push(h('path', { d: arch(x, 0), fill: 'none', stroke: shade(col, -0.35), 'stroke-width': 0.4 })); }
    // plinth
    g.push(h('rect', { x: -2, y: -6, width: n(totalW + 4), height: 6, fill: it.plinth || '#160B26' }));
    g.push(h('rect', { x: -2, y: -6.4, width: n(totalW + 4), height: 1, fill: 'url(#gBrass)' }));
    const sh = poly(cam.quadY(it.x - 0.3, it.x + totalW / 12 + 0.3, it.z - 0.4, it.z + 0.5, 0), { fill: '#000', opacity: 0.35, filter: 'url(#fBlur6)' });
    return sh + `<g transform="${cam.bb(it.x, it.z)}">${g.join('')}</g>`;
  },

  counter(it, { cam, c, uid, defs }) {    // chai cart / counter: painted front, brass top edge, top surface projected
    const x0 = it.x, x1 = it.x + it.w, Z0 = it.z - (it.d || 2) / 2, Z1 = it.z + (it.d || 2) / 2, hh = it.h || 3;
    const s = [];
    s.push(poly(cam.quadY(x0 - 0.2, x1 + 0.2, Z0, Z1 + 0.3, 0), { fill: '#000', opacity: 0.35, filter: 'url(#fBlur6)' }));
    s.push(poly(cam.quadY(x0, x1, Z0, Z1, hh), { fill: it.top || '#FFF4DC' }));
    if (it.topChips) { const R3 = rng(5); let d = ''; for (let i = 0; i < 70; i++) { const X = x0 + R3() * (x1 - x0), Z = Z0 + R3() * (Z1 - Z0), r = 0.03 + R3() * 0.04; d += pathFrom(cam.ellY(X, Z, r, r, hh, 6)); } s.push(h('path', { d, fill: it.topChips })); }
    const W2 = (x1 - x0) * 12, H2 = hh * 12;
    const g = [];
    g.push(h('rect', { x: 0, y: -H2, width: n(W2), height: n(H2), fill: it.front || '#E4147E' }));
    // truck-art inspired painted panels
    const nP = Math.max(2, Math.round(W2 / 18)); const pw = (W2 - 6) / nP;
    for (let i = 0; i < nP; i++) {
      const px = 3 + i * pw;
      g.push(h('rect', { x: n(px + 1), y: n(-H2 + 5), width: n(pw - 2), height: n(H2 - 12), rx: 2, fill: it.panel || '#1D1147' }));
      g.push(h('path', { d: `M${n(px + 1 + (pw - 2) / 2)} ${n(-H2 + 9)}m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0`, fill: it.accent || '#FFB000' }));
      g.push(h('path', { d: `M${n(px + 3)} ${n(-H2 + 18)}H${n(px + pw - 3)}M${n(px + 3)} ${n(-H2 + 21)}H${n(px + pw - 3)}`, stroke: it.accent2 || '#00A8A0', 'stroke-width': 1 }));
      let d = ''; for (let xx = px + 3; xx < px + pw - 3; xx += 2.6) d += `M${n(xx)} ${n(-10)}l1.3 -2l1.3 2`;
      g.push(h('path', { d, stroke: it.accent || '#FFB000', 'stroke-width': 0.6, fill: 'none' }));
    }
    g.push(h('rect', { x: 0, y: -H2, width: n(W2), height: 1.6, fill: 'url(#gBrass)' }));
    g.push(h('rect', { x: 0, y: -4, width: n(W2), height: 4, fill: '#1D1147' }));
    s.push(`<g transform="${cam.bb(x0, Z1)}">${g.join('')}</g>`);
    (it.props || []).forEach((p) => s.push(prop(p, x0 + (x1 - x0) * (p.u || 0.5), it.z + (p.dz || 0), hh, { cam, c })));
    return s.join('');
  },

  bench(it, { cam, c }) {   // simple upholstered bench (photo corner) with bolster cushions
    const u = Object.assign({}, c.uph, it.uph || {});
    const x0 = it.x, w = it.w * 12, z = it.z;
    const g = [];
    g.push(h('rect', { x: 0, y: -18, width: n(w), height: 6, rx: 2.4, fill: u.color }));
    g.push(h('path', { d: `M1 -17.6H${n(w - 1)}M1 -12.4H${n(w - 1)}`, stroke: u.piping, 'stroke-width': 0.5 }));
    g.push(h('rect', { x: 2, y: -12, width: n(w - 4), height: 9, fill: u.apron || shade(u.color, -0.25) }));
    g.push(h('path', { d: `M4 -3V0M${n(w - 4)} -3V0`, stroke: '#B7791F', 'stroke-width': 1.6 }));
    (it.cushions || []).forEach((cu) => {
      g.push(h('rect', { x: n(cu.x * 12), y: -18 - (cu.h || 14), width: n((cu.w || 1.4) * 12), height: cu.h || 14, rx: 3, fill: cu.color }));
      if (cu.pattern) g.push(h('rect', { x: n(cu.x * 12 + 1.5), y: -18 - (cu.h || 14) + 1.5, width: n((cu.w || 1.4) * 12 - 3), height: (cu.h || 14) - 3, rx: 2, fill: 'none', stroke: cu.pattern, 'stroke-width': 0.8, 'stroke-dasharray': '1.4 1' }));
    });
    return poly(cam.quadY(x0, x0 + it.w, z - 0.6, z + 0.4, 0), { fill: '#000', opacity: 0.3, filter: 'url(#fBlur6)' }) + `<g transform="${cam.bb(x0, z)}">${g.join('')}</g>`;
  },

  figure(it, { cam }) {    // neutral 6-ft scale figure (for scale comparisons) — simple silhouette, no features
    const g = [h('circle', { cx: 0, cy: -66, r: 4.6, fill: it.color || '#1D1147', opacity: 0.85 }),
      h('path', { d: 'M-7 -59Q0 -62 7 -59L8.5 -30H5L4 0H0.8L0 -26L-0.8 0H-4L-5 -30H-8.5Z', fill: it.color || '#1D1147', opacity: 0.85 })];
    return `<g transform="${cam.bb(it.x, it.z)}">${g.join('')}</g>`;
  },
};

/* table-top props (projected/billboarded at table height) */
function prop(p, X0, Z0, top, { cam, c }) {
  const X = X0 + (p.dx || 0), Z = Z0 + (p.dz || 0);
  const s = [];
  if (p.t === 'plate') {
    s.push(poly(cam.ellY(X, Z, 0.42, 0.42, top + 0.01, 28), { fill: '#000', opacity: 0.18, filter: 'url(#fBlur3)' }));
    s.push(poly(cam.ellY(X, Z, 0.4, 0.4, top + 0.02, 28), { fill: p.color || '#FFFFFF' }));
    s.push(poly(cam.ellY(X, Z, 0.28, 0.28, top + 0.025, 24), { fill: p.rim || '#F1E9DA' }));
    if (p.food) s.push(poly(cam.ellY(X, Z - 0.02, 0.2, 0.18, top + 0.06, 20), { fill: p.food }));
    if (p.food2) s.push(poly(cam.ellY(X + 0.08, Z + 0.03, 0.07, 0.06, top + 0.08, 12), { fill: p.food2 }));
  } else if (p.t === 'katori') {
    const q = cam.p(X, top, Z); const sc = cam.s(Z) / 12;
    s.push(`<g transform="translate(${n(q[0])} ${n(q[1])}) scale(${sc.toFixed(4)})">${h('path', { d: 'M-2.6 -2.2Q-2.4 0 0 0Q2.4 0 2.6 -2.2Z', fill: 'url(#gBrass)' })}${h('ellipse', { cx: 0, cy: -2.2, rx: 2.6, ry: 0.6, fill: p.food || '#C0471B' })}</g>`);
  } else if (p.t === 'glass') {
    const q = cam.p(X, top, Z); const sc = cam.s(Z) / 12;
    s.push(`<g transform="translate(${n(q[0])} ${n(q[1])}) scale(${sc.toFixed(4)})">${h('path', { d: 'M-1.3 0L-1.6 -5H1.6L1.3 0Z', fill: p.fill || '#DCEFF2', opacity: 0.55 })}${h('path', { d: 'M-1.3 0L-1.6 -5H1.6L1.3 0Z', fill: 'url(#gGlass)' })}${h('ellipse', { cx: 0, cy: -5, rx: 1.6, ry: 0.35, fill: 'none', stroke: '#fff', 'stroke-width': 0.2, opacity: 0.8 })}</g>`);
  } else if (p.t === 'vase') {
    const q = cam.p(X, top, Z); const sc = cam.s(Z) / 12;
    const fl = p.flower || '#FFB000';
    s.push(`<g transform="translate(${n(q[0])} ${n(q[1])}) scale(${sc.toFixed(4)})">${h('path', { d: 'M-1 0Q-2 -2 -0.6 -3.6V-5H0.6V-3.6Q2 -2 1 0Z', fill: p.color || 'url(#gBrass)' })}${h('path', { d: 'M0 -5L-0.6 -8M0 -5L1 -7.4', stroke: '#2F7D3A', 'stroke-width': 0.3 })}${h('circle', { cx: -0.6, cy: -8.6, r: 1.1, fill: fl })}${h('circle', { cx: 1.1, cy: -7.9, r: 0.9, fill: p.flower2 || fl })}</g>`);
  } else if (p.t === 'candle') {
    const q = cam.p(X, top, Z); const sc = cam.s(Z) / 12;
    s.push(`<g transform="translate(${n(q[0])} ${n(q[1])}) scale(${sc.toFixed(4)})">${h('path', { d: 'M-1.4 0L-1.2 -2.4H1.2L1.4 0Z', fill: 'url(#gBrass)' })}${h('ellipse', { cx: 0, cy: -3.3, rx: 0.5, ry: 0.9, fill: '#FFE9A8' })}${h('ellipse', { cx: 0, cy: -3, rx: 6, ry: 6, fill: 'url(#gGlow)', opacity: 0.6, style: 'mix-blend-mode:screen' })}</g>`);
  } else if (p.t === 'kettle') {
    const q = cam.p(X, top, Z); const sc = cam.s(Z) / 12;
    s.push(`<g transform="translate(${n(q[0])} ${n(q[1])}) scale(${sc.toFixed(4)})">${h('path', { d: 'M-4.5 0Q-6 -5 -2.6 -7.4H2.6Q6 -5 4.5 0Z', fill: 'url(#gBrass)', stroke: '#7A4C12', 'stroke-width': 0.25 })}${h('path', { d: 'M4.8 -4.4L8.4 -7.2', stroke: '#B7791F', 'stroke-width': 0.9, 'stroke-linecap': 'round' })}${h('path', { d: 'M-2.4 -7.4Q0 -11 2.4 -7.4', stroke: '#7A4C12', 'stroke-width': 0.5, fill: 'none' })}${h('path', { d: 'M0.4 -10.6q-1.2 -1.6 0 -3.2q1.2 -1.6 0 -3.2M2.2 -10.4q-1.2 -1.6 0 -3.2', stroke: '#FFFFFF', 'stroke-opacity': 0.6, 'stroke-width': 0.35, fill: 'none', 'stroke-linecap': 'round' })}</g>`);
  } else if (p.t === 'chaiglass') {
    const q = cam.p(X, top, Z); const sc = cam.s(Z) / 12;
    s.push(`<g transform="translate(${n(q[0])} ${n(q[1])}) scale(${sc.toFixed(4)})">${h('path', { d: 'M-1.2 0L-1.5 -3.8H1.5L1.2 0Z', fill: '#F3E3C3', opacity: 0.55 })}${h('path', { d: 'M-1.25 0L-1.4 -2.6H1.4L1.25 0Z', fill: '#C46A1B' })}${h('path', { d: 'M-1.2 0L-1.5 -3.8H1.5L1.2 0Z', fill: 'url(#gGlass)' })}</g>`);
  } else if (p.t === 'tent') {
    const q = cam.p(X, top, Z); const sc = cam.s(Z) / 12;
    s.push(`<g transform="translate(${n(q[0])} ${n(q[1])}) scale(${sc.toFixed(4)})">${h('path', { d: 'M-2.4 0L-1.8 -5H1.8L2.4 0Z', fill: p.color || '#FFB000', stroke: p.stroke || '#1D1147', 'stroke-width': 0.2 })}${h('rect', { x: -1, y: -4, width: 2, height: 2, fill: p.stroke || '#1D1147', opacity: 0.8 })}</g>`);
  }
  return s.join('');
}

module.exports = { renderRoom, DEF, merge, WALL, OBJ, ART };

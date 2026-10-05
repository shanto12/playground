#!/usr/bin/env node
/* Curry District · Direction B ROYAL — seamless pattern generator.
   Writes every pattern × colourway as a square SVG repeat tile into ../ (e.g. 01-jali-lattice-midnight.svg).
   Seamlessness: periodic geometry is generated over an extended lattice and clipped by the viewBox;
   free motifs are placed with wrap() which duplicates any element that crosses an edge on the opposite side.
   Palette = brand/tokens.css hexes only. Run: node build-patterns.js */
const fs = require('fs');
const path = require('path');
const OUT = path.resolve(__dirname, '..');

const C = {
  ink: '#160B26', aub: '#2A1240', plum: '#4B1D52', emerald: '#0F4D3F', peacock: '#117C86', ruby: '#A3173F',
  gold: '#E9A63A', goldLt: '#F7D98A', goldDk: '#B7791F', ivory: '#FBF3E4', ivory2: '#F3E4C8', blush: '#F4C9BB',
};
const D = Math.PI / 180;

/* ---------- tiny geometry kit ---------- */
const n = v => { const r = Math.round(v * 100) / 100; return String(Object.is(r, -0) ? 0 : r); };
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, s) => [a[0] * s, a[1] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const len = a => Math.hypot(a[0], a[1]);
const unit = a => mul(a, 1 / len(a));
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const rot = (p, a) => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)];
const P = p => n(p[0]) + ' ' + n(p[1]);
const poly = (pts, close = true) => 'M' + pts.map(P).join('L') + (close ? 'Z' : '');
const ring = (c, r, k, a0 = 0) => [...Array(k)].map((_, i) => add(c, [r * Math.cos(a0 + i * 2 * Math.PI / k), r * Math.sin(a0 + i * 2 * Math.PI / k)]));
const range = (a, b) => { const o = []; for (let i = a; i <= b; i++) o.push(i); return o; };

/* Catmull-Rom → cubic Bézier path through points */
function smooth(pts, close = false) {
  const p = close ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  let d = 'M' + P(p[1]);
  for (let i = 1; i < p.length - 2; i++) {
    const c1 = add(p[i], mul(sub(p[i + 1], p[i - 1]), 1 / 6));
    const c2 = sub(p[i + 1], mul(sub(p[i + 2], p[i]), 1 / 6));
    d += 'C' + P(c1) + ' ' + P(c2) + ' ' + P(p[i + 1]);
  }
  return d + (close ? 'Z' : '');
}
/* cubic segments [[p0],[c1,c2,p1],...] → path + sampler */
function cubicPath(start, segs) { return 'M' + P(start) + segs.map(s => 'C' + s.map(P).join(' ')).join('') + 'Z'; }
function sampleCubic(start, segs, step = 0.5) {
  const pts = []; let p0 = start;
  for (const [c1, c2, p1] of segs) {
    for (let t = 0; t < 1; t += 0.02) {
      const u = 1 - t;
      pts.push([u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p1[0],
                u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p1[1]]);
    }
    p0 = p1;
  }
  pts.push(start);
  // resample by arc length
  const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + len(sub(pts[i], pts[i - 1])));
  return { pts, L, total: L[L.length - 1], at(s) { let i = L.findIndex(x => x >= s); if (i <= 0) i = 1; const t = (s - L[i - 1]) / ((L[i] - L[i - 1]) || 1); const p = lerp(pts[i - 1], pts[i], t); const tg = unit(sub(pts[i], pts[i - 1])); return { p, tg }; } };
}

/* wrap: every copy of a motif (bounding half-size rx, ry) that touches the W×H tile */
function copies(x, y, rx, ry, W, H) {
  const o = [];
  for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) {
    const X = x + dx, Y = y + dy;
    if (X + rx > 0 && X - rx < W && Y + ry > 0 && Y - ry < H) o.push([X, Y]);
  }
  return o;
}
function wrapUse(T, id, x, y, r, tf = '', attrs = '') {
  const rx = Array.isArray(r) ? r[0] : r, ry = Array.isArray(r) ? r[1] : r;
  return copies(x, y, rx, ry, T, T).map(([X, Y]) => `<use xlink:href="#${id}" transform="translate(${n(X)} ${n(Y)})${tf ? ' ' + tf : ''}"${attrs}/>`).join('');
}
function wrapG(T, inner, x, y, r, tf = '', attrs = '') {
  const rx = Array.isArray(r) ? r[0] : r, ry = Array.isArray(r) ? r[1] : r;
  return copies(x, y, rx, ry, T, T).map(([X, Y]) => `<g transform="translate(${n(X)} ${n(Y)})${tf ? ' ' + tf : ''}"${attrs}>${inner}</g>`).join('');
}

/* gradients (objectBoundingBox → identical on every duplicated copy, so still seamless) */
const foil = (id = 'foil') => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.goldDk}"/><stop offset=".38" stop-color="${C.goldLt}"/><stop offset=".58" stop-color="${C.gold}"/><stop offset="1" stop-color="${C.goldDk}"/></linearGradient>`;
const brass = (id = 'brass') => `<radialGradient id="${id}" cx=".36" cy=".32" r=".75"><stop offset="0" stop-color="${C.goldLt}"/><stop offset=".45" stop-color="${C.gold}"/><stop offset="1" stop-color="${C.goldDk}"/></radialGradient>`;

function doc(T, title, bg, defs, body) {
  return docRaw(T, title, bg, defs, body)
    // token hex + 2-digit alpha → plain token hex + *-opacity (Illustrator/print friendly)
    .replace(/(fill|stroke)="(#[0-9A-Fa-f]{6})([0-9A-Fa-f]{2})"/g, (_, a, hex, al) => `${a}="${hex}" ${a}-opacity="${n(parseInt(al, 16) / 255)}"`);
}
function docRaw(T, title, bg, defs, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${T}" height="${T}" viewBox="0 0 ${T} ${T}">` +
    `<title>${title}</title><desc>Curry District · Royal pattern library — seamless ${T}×${T} repeat tile. Concept artwork.</desc>` +
    `<defs>${defs}</defs><rect width="${T}" height="${T}" fill="${bg}"/>${body}</svg>`;
}

/* shared small motifs */
const lensPetal = (r, w = 0.3) => `M0 0C${n(r * w)} ${n(-r * .3)} ${n(r * w)} ${n(-r * .7)} 0 ${n(-r)}C${n(-r * w)} ${n(-r * .7)} ${n(-r * w)} ${n(-r * .3)} 0 0Z`;
function rosette(r, k, fill, center, a0 = 0, w = 0.3) {
  let d = '';
  for (let i = 0; i < k; i++) d += `<path d="${lensPetal(r, w)}" transform="rotate(${n(a0 + i * 360 / k)})"/>`;
  return `<g fill="${fill}">${d}</g>` + (center ? `<circle r="${n(r * .22)}" fill="${center}"/>` : '');
}
function scallopRing(r, k, bulge = 0.62) {
  const pts = ring([0, 0], r, k, -Math.PI / 2);
  const ch = 2 * r * Math.sin(Math.PI / k), ar = ch * bulge;
  return 'M' + P(pts[0]) + pts.map((_, i) => `A${n(ar)} ${n(ar)} 0 0 1 ${P(pts[(i + 1) % k])}`).join('') + 'Z';
}

/* =====================================================================
   01 · JALI LATTICE — 8-fold star lattice (Hankin construction on 4.8.8)
   ===================================================================== */
function hankin(polys, theta) {
  return polys.map(pg => {
    const V = pg.v, m = V.length, M = V.map((v, i) => lerp(v, V[(i + 1) % m], 0.5));
    const Pp = V.map((_, i) => {
      const j = (i + 1) % m;
      const inward = (d, toC) => { const a = rot(d, theta), b = rot(d, -theta); return dot(a, toC) > dot(b, toC) ? a : b; };
      const d1 = inward(unit(sub(V[j], M[i])), sub(pg.c, M[i]));
      const d2 = inward(unit(sub(V[j], M[j])), sub(pg.c, M[j]));
      const den = d1[0] * d2[1] - d1[1] * d2[0];
      const t = ((M[j][0] - M[i][0]) * d2[1] - (M[j][1] - M[i][1]) * d2[0]) / den;
      return add(M[i], mul(d1, t));
    });
    return { ...pg, M, P: Pp };
  });
}
function jali(cw) {
  const T = 240, a = 120, e = a / (1 + Math.SQRT2), R8 = (a / 2) / Math.cos(Math.PI / 8), R4 = e / Math.SQRT2;
  const polys = [];
  for (const i of range(-1, 2)) for (const j of range(-1, 2)) {
    polys.push({ k: 8, c: [i * a, j * a], v: ring([i * a, j * a], R8, 8, Math.PI / 8) });
    polys.push({ k: 4, c: [i * a + a / 2, j * a + a / 2], v: ring([i * a + a / 2, j * a + a / 2], R4, 4, 0) });
  }
  const vis = hankin(polys.filter(p => p.c[0] > -70 && p.c[0] < T + 70 && p.c[1] > -70 && p.c[1] < T + 70), (cw.theta || 67.5) * D);
  let f8 = '', f4 = '', lines = '', inner = '';
  for (const h of vis) {
    const star = []; h.M.forEach((m, i) => star.push(m, h.P[i]));
    if (h.k === 8) {
      f8 += poly(star);
      inner += poly(star.map(p => lerp(h.c, p, 0.62)));
    } else f4 += poly(star);
    h.M.forEach((m, i) => { lines += poly([m, h.P[i], h.M[(i + 1) % h.M.length]], false); });
  }
  const defs = foil() + `<g id="ros">${rosette(15, 8, 'url(#foil)', cw.center, 0, 0.34)}<circle r="21" fill="none" stroke="${cw.line}" stroke-width=".7" opacity=".7"/></g>` +
    `<path id="spk" d="M0 -7L1.6 -1.6 7 0 1.6 1.6 0 7 -1.6 1.6 -7 0 -1.6 -1.6Z" fill="${cw.spark}"/>`;
  let body = `<path d="${f8}" fill="${cw.tone}"/><path d="${f4}" fill="${cw.tone2}"/>` +
    `<path d="${inner}" fill="none" stroke="${cw.line}" stroke-width=".6" opacity=".55"/>` +
    `<path d="${lines}" fill="none" stroke="${cw.line}" stroke-width="3.6" stroke-linejoin="miter" stroke-linecap="round"/>` +
    `<path d="${lines}" fill="none" stroke="${cw.channel}" stroke-width="1.3" stroke-linejoin="miter" stroke-linecap="round"/>`;
  for (const h of vis) if (h.k === 8) body += wrapUse(T, 'ros', h.c[0], h.c[1], 22); else body += wrapUse(T, 'spk', h.c[0], h.c[1], 8);
  return { T, svg: doc(T, 'Jali Lattice — ' + cw.name, cw.bg, defs, body) };
}

/* =====================================================================
   02 · MEHRAB TRELLIS — cusped palace arcade, half-drop rows
   ===================================================================== */
function archGeom(s, ys, ya) { const h = ys - ya; const c = (h * h - s * s) / (2 * s); return { c, rho: s + c, ys }; }
function archPts(g, off, N) {
  const R = g.rho + off, yA = g.ys - Math.sqrt(R * R - g.c * g.c);
  const aL0 = Math.PI, aL1 = Math.atan2(yA - g.ys, -g.c) + 2 * Math.PI;
  const aR0 = Math.atan2(yA - g.ys, g.c) + 2 * Math.PI, aR1 = 2 * Math.PI;
  const pts = [];
  for (let i = 0; i <= N; i++) { const a = aL0 + (aL1 - aL0) * i / N; pts.push([g.c + R * Math.cos(a), g.ys + R * Math.sin(a)]); }
  for (let i = 1; i <= N; i++) { const a = aR0 + (aR1 - aR0) * i / N; pts.push([-g.c + R * Math.cos(a), g.ys + R * Math.sin(a)]); }
  return pts;
}
function archArc(g, off) { // smooth pointed arch from left springing to right springing
  const R = g.rho + off, yA = g.ys - Math.sqrt(R * R - g.c * g.c);
  return `M${n(g.c - R)} ${n(g.ys)}A${n(R)} ${n(R)} 0 0 1 0 ${n(yA)}A${n(R)} ${n(R)} 0 0 1 ${n(R - g.c)} ${n(g.ys)}`;
}
function mehrab(cw) {
  const T = 240, Wc = 120, Hc = 120;
  const g = archGeom(49, 70, 20);
  const cusp = archPts(g, 0, 4); // 9 lobes
  let lob = 'M' + P(cusp[0]);
  for (let i = 1; i < cusp.length; i++) { const ch = len(sub(cusp[i], cusp[i - 1])); lob += `A${n(ch * .56)} ${n(ch * .56)} 0 0 1 ${P(cusp[i])}`; }
  const niche = `M-53.5 ${g.ys}L` + lob.slice(1) + `L53.5 ${g.ys}L53.5 112L-53.5 112Z`;
  const ext = archArc(g, 6.5), ext2 = archArc(g, 10);
  // flowering plant (secular Mughal "guldasta" spray) — fine line + foil buds
  const leaf = (x, y, a, s = 1) => `<path d="M0 0C${n(4 * s)} ${n(-4 * s)} ${n(4 * s)} ${n(-11 * s)} 0 ${n(-16 * s)}C${n(-4 * s)} ${n(-11 * s)} ${n(-4 * s)} ${n(-4 * s)} 0 0Z" transform="translate(${n(x)} ${n(y)}) rotate(${a})"/>`;
  const tulip = (x, y, s, a = 0) => `<g transform="translate(${n(x)} ${n(y)}) rotate(${a}) scale(${s})"><path d="M0 0C-7 -2 -9 -10 -7 -17C-4 -14 -2 -14 0 -19C2 -14 4 -14 7 -17C9 -10 7 -2 0 0Z" fill="url(#foil)"/><path d="M0 -2V-14" stroke="${cw.cellTone}" stroke-width=".8"/></g>`;
  const plant =
    `<path d="M0 110C0 96 -1 80 0 54M0 94C-6 88 -14 84 -18 74M0 94C6 88 14 84 18 74" fill="none" stroke="${cw.line}" stroke-width="1" stroke-linecap="round"/>` +
    `<g fill="${cw.leaf}">${leaf(0, 102, -60, 1)}${leaf(0, 102, 60, 1)}${leaf(0, 82, -38, .8)}${leaf(0, 82, 38, .8)}${leaf(0, 68, -28, .62)}${leaf(0, 68, 28, .62)}</g>` +
    tulip(0, 54, 1.1) + tulip(-18, 75, .78, -24) + tulip(18, 75, .78, 24) +
    `<path d="M-14 112H14" stroke="${cw.line}" stroke-width="1.2" stroke-linecap="round"/><path d="M-8 112C-8 106 8 106 8 112Z" fill="${cw.line}"/>`;
  // column at local x = -60 (shared by neighbouring arches)
  const col = `<g transform="translate(-60 0)">` +
    `<path d="M-8 66H8L5.5 71H-5.5ZM-4.5 72.5H4.5V75H-4.5Z" fill="url(#foil)"/>` +
    `<path d="M-2.2 75H2.2V104H-2.2Z" fill="${cw.line}"/>` +
    `<path d="M-.9 78V101" stroke="${cw.colHi}" stroke-width=".6"/>` +
    `<path d="M-3.5 104H3.5L5 109C5 112 7 114 7 116H-7C-7 114 -5 112 -5 109Z" fill="url(#foil)"/>` +
    `<path d="M-8 117.5H8" stroke="${cw.line}" stroke-width="1.6"/></g>`;
  const spandrel = `<g transform="translate(-60 30)">${rosette(8, 6, 'url(#foil)', cw.center, 0, .36)}</g><path d="M-60 46l2 -3 -2 -3 -2 3Z" fill="${cw.line}"/>`;
  const cell = `<g id="cell"><path d="${niche}" fill="${cw.cellTone}"/>` +
    `<path d="${lob}" fill="none" stroke="${cw.line}" stroke-width="1.3" stroke-linejoin="round"/>` +
    `<path d="${ext}" fill="none" stroke="${cw.line}" stroke-width="1.1"/><path d="${ext2}" fill="none" stroke="${cw.line}" stroke-width=".6" opacity=".7"/>` +
    plant + col + spandrel +
    `<path d="M-60 2.5H60M-60 7H60" stroke="${cw.line}" stroke-width=".8"/>` +
    `<path d="M-50 4.75h0M-40 4.75h0M-30 4.75h0M-20 4.75h0M-10 4.75h0M0 4.75h0M10 4.75h0M20 4.75h0M30 4.75h0M40 4.75h0M50 4.75h0M-60 4.75h0" stroke="${cw.line}" stroke-width="2" stroke-linecap="round"/>` +
    `</g>`;
  const defs = foil() + cell;
  let body = '';
  for (const r of [0, 1]) for (const cx of [0, 1, 2]) {
    const x = cx * Wc + (r ? 0 : Wc / 2), y = r * Hc;
    body += wrapUse(T, 'cell', x, y + Hc / 2, [70, 62], 'translate(0 -60)');
  }
  return { T, svg: doc(T, 'Mehrab Trellis — ' + cw.name, cw.bg, defs, body) };
}

/* =====================================================================
   03 · PAISLEY VINE — damask boteh, half-drop, between undulating vines
   ===================================================================== */
const BOTEH = { start: [0, 50], segs: [
  [[-27, 50], [-44, 30], [-42, 4]],
  [[-40, -24], [-20, -46], [8, -58]],
  [[20, -63], [28, -68], [33, -76]],
  [[32, -62], [20, -52], [17, -40]],
  [[14, -26], [42, -18], [42, 10]],
  [[42, 34], [24, 50], [0, 50]]] };
const scaleSegs = (b, s, c) => ({ start: lerp(c, b.start, s), segs: b.segs.map(sg => sg.map(p => lerp(c, p, s))) });
function botehMarkup(cw) {
  const c = [2, 10];
  const outer = cubicPath(BOTEH.start, BOTEH.segs);
  const i1 = scaleSegs(BOTEH, .8, c), i2 = scaleSegs(BOTEH, .62, c);
  // pearl fringe outside the outline
  const S = sampleCubic(BOTEH.start, BOTEH.segs);
  let pearls = '';
  const k = 34;
  for (let i = 0; i < k; i++) { const { p, tg } = S.at(S.total * (i + .5) / k); const nrm = [tg[1], -tg[0]]; const q = add(p, mul(nrm, 5.4)); pearls += `M${P(q)}h0`; }
  const S2 = sampleCubic(i2.start, i2.segs);
  let dots = ''; const k2 = 26;
  for (let i = 0; i < k2; i++) { const { p } = S2.at(S2.total * (i + .5) / k2); dots += `M${P(p)}h0`; }
  return `<g id="boteh">` +
    `<path d="${pearls}" stroke="${cw.line}" stroke-width="2.4" stroke-linecap="round"/>` +
    `<path d="${outer}" fill="${cw.body}" stroke="${cw.line}" stroke-width="1.6"/>` +
    `<path d="${cubicPath(i1.start, i1.segs)}" fill="${cw.inner}" stroke="${cw.line}" stroke-width=".8"/>` +
    `<path d="${dots}" stroke="${cw.line}" stroke-width="2" stroke-linecap="round"/>` +
    `<g transform="translate(2 18)">${rosette(14, 8, 'url(#foil)', cw.center, 22.5, .34)}<circle r="18.5" fill="none" stroke="${cw.line}" stroke-width=".6"/></g>` +
    `<g fill="url(#foil)"><path d="${lensPetal(9, .42)}" transform="translate(-3 0) rotate(-14)"/><path d="${lensPetal(7, .42)}" transform="translate(-3 -14) rotate(14)"/><path d="${lensPetal(5.5, .42)}" transform="translate(4 -25) rotate(42)"/></g>` +
    `</g>`;
}
function paisley(cw) {
  const T = 320, A = 14;
  const vine = (x0, sgn) => { const pts = []; for (let y = -60; y <= 380; y += 20) pts.push([x0 + sgn * A * Math.sin(2 * Math.PI * y / T), y]); return pts; };
  let vines = '', leaves = '', curls = '';
  for (const [x0, sgn] of [[0, -1], [160, 1], [320, -1]]) {
    vines += smooth(vine(x0, sgn));
    for (let y = -40; y <= 360; y += 40) {
      const side = ((y / 40) % 2 === 0) ? 1 : -1;
      const x = x0 + sgn * A * Math.sin(2 * Math.PI * y / T);
      const dx = sgn * A * Math.cos(2 * Math.PI * y / T) * 2 * Math.PI / T;
      const ang = Math.atan2(1, dx) / D - 90; // tangent angle relative to vertical
      leaves += `<use xlink:href="#lf" transform="translate(${n(x)} ${n(y)}) rotate(${n(ang + side * 52)})"/>`;
    }
    for (const y of [80, 240, -80, 400]) {
      const x = x0 + sgn * A * Math.sin(2 * Math.PI * y / T);
      const dir = Math.sign(x - x0) || 1; // curl outward from the vine's bulge
      curls += `<path d="M${P([x, y])}c${n(dir * 10)} -4 ${n(dir * 18)} -14 ${n(dir * 14)} -22c${n(-dir * 3)} -5 ${n(-dir * 9)} -3 ${n(-dir * 8)} 2c1 4 ${n(dir * 5)} 4 ${n(dir * 5)} 0"/>` +
               `<use xlink:href="#bud" transform="translate(${n(x)} ${n(y)}) rotate(${dir * 120})"/>`;
    }
  }
  const lf = `<path id="lf" d="M0 0C3 -4 4 -10 0 -15C-4 -10 -3 -4 0 0Z" fill="${cw.leaf}"/>`;
  const bud = `<g id="bud"><path d="M0 0V-12" stroke="${cw.line}" stroke-width=".9"/><path d="${lensPetal(8, .45)}" transform="translate(0 -11)" fill="url(#foil)"/></g>`;
  const spray = `<g id="spray"><path d="M0 26C0 12 0 0 0 -20M0 10C-6 4 -14 2 -20 -6M0 10C6 4 14 2 20 -6" fill="none" stroke="${cw.line}" stroke-width="1" stroke-linecap="round"/>` +
    `<g transform="translate(0 -22)">${rosette(10, 6, 'url(#foil)', cw.center, 0, .38)}</g>` +
    `<path d="${lensPetal(9, .45)}" transform="translate(-20 -6) rotate(-55)" fill="url(#foil)"/><path d="${lensPetal(9, .45)}" transform="translate(20 -6) rotate(55)" fill="url(#foil)"/>` +
    `<use xlink:href="#lf" transform="translate(0 18) rotate(-50) scale(1.1)"/><use xlink:href="#lf" transform="translate(0 18) rotate(50) scale(1.1)"/>` +
    `<path d="M-5 30h0M0 32h0M5 30h0" stroke="${cw.line}" stroke-width="2" stroke-linecap="round"/></g>`;
  const defs = foil() + lf + bud + botehMarkup(cw) + spray;
  let body = `<path d="${vines}" fill="none" stroke="${cw.line}" stroke-width="1.4" stroke-linecap="round"/>` + leaves +
    `<g fill="none" stroke="${cw.line}" stroke-width="1" stroke-linecap="round">${curls}</g>`;
  body += wrapUse(T, 'boteh', 82, 108, [62, 92], 'rotate(-9) scale(1.14)');
  body += wrapUse(T, 'boteh', 238, 268, [62, 92], 'scale(-1 1) rotate(-9) scale(1.14)');
  body += wrapUse(T, 'spray', 80, 262, [30, 40]);
  body += wrapUse(T, 'spray', 240, 102, [30, 40]);
  return { T, svg: doc(T, 'Paisley Vine — ' + cw.name, cw.bg, defs, body) };
}

/* =====================================================================
   04 · MARIGOLD DAMASK — genda medallions in an ogee lattice, champa at the nodes
   ===================================================================== */
function marigold(cw) {
  const T = 320, Am = 80;
  const f = y => Am * Math.cos(2 * Math.PI * y / T);
  let og = '', ogLeaves = '';
  for (const k of range(-1, 3)) {
    const sgn = k % 2 === 0 ? 1 : -1, x0 = 160 * k;
    const pts = []; for (let y = -40; y <= 360; y += 10) pts.push([x0 + sgn * f(y), y]);
    og += smooth(pts);
    for (let y = -40; y <= 360; y += 40) {
      if (y % 160 === 0) continue; // nodes carry the champa
      const x = x0 + sgn * f(y), dx = -sgn * Am * Math.sin(2 * Math.PI * y / T) * 2 * Math.PI / T;
      const ang = Math.atan2(1, dx) / D - 90;
      for (const side of [1, -1]) ogLeaves += `<use xlink:href="#olf" transform="translate(${n(x)} ${n(y)}) rotate(${n(ang + side * 48)})"/>`;
    }
  }
  const mg = `<g id="mg">` +
    [[46, 22, cw.m1], [37, 20, cw.m2], [28, 16, cw.m3], [19, 13, cw.m4]].map(([r, k, fl], i) => `<path d="${scallopRing(r, k)}" fill="${fl}" stroke="${cw.mStroke}" stroke-width=".9" transform="rotate(${i * 7})"/>`).join('') +
    `<circle r="9" fill="${cw.mCore}"/>` + ring([0, 0], 5, 8).map(p => `<circle cx="${n(p[0])}" cy="${n(p[1])}" r="1.3" fill="${cw.m4}"/>`).join('') +
    `<circle r="1.6" fill="${cw.m4}"/></g>`;
  // acanthus-ish leaf pointing up, base at 0,0
  const big = `<g id="blf"><path d="M0 0C10 -6 18 -20 14 -34C12 -44 6 -50 0 -60C-6 -50 -12 -44 -14 -34C-18 -20 -10 -6 0 0Z" fill="${cw.leafFill}" stroke="${cw.line}" stroke-width="1.2"/>` +
    `<path d="M0 -4V-52M0 -16L8 -24M0 -16L-8 -24M0 -28L7 -35M0 -28L-7 -35M0 -40L4 -45M0 -40L-4 -45" fill="none" stroke="${cw.line}" stroke-width=".8" stroke-linecap="round"/></g>`;
  const olf = `<path id="olf" d="M0 0C3 -4 4 -9 0 -13C-4 -9 -3 -4 0 0Z" fill="${cw.olf}"/>`;
  let champaP = ''; for (let i = 0; i < 5; i++) champaP += `<path d="M0 0C7 -3 15 -10 13 -18C11 -23 5 -23 1 -19C-2 -15 -2 -6 0 0Z" transform="rotate(${i * 72})"/>`;
  const champa = `<g id="ch"><g fill="${cw.chFill}" stroke="${cw.chStroke}" stroke-width=".8">${champaP}</g><circle r="4.5" fill="url(#foil)"/>` +
    `<path d="M0 0L-3.5 -1.5" stroke="${cw.chStroke}" stroke-width=".6"/></g>`;
  const medal = `<g id="med"><circle r="56" fill="${cw.halo}"/><circle r="56" fill="none" stroke="${cw.line}" stroke-width=".7" stroke-dasharray="1 4" stroke-linecap="round"/>` +
    [0, 90, 180, 270].map(a => `<use xlink:href="#blf" transform="rotate(${a}) translate(0 -40)"/>`).join('') +
    [45, 135, 225, 315].map(a => `<g transform="rotate(${a}) translate(0 -58)"><path d="${lensPetal(12, .4)}" fill="url(#foil)"/><circle cy="2" r="2.2" fill="${cw.line}"/></g>`).join('') +
    `<use xlink:href="#mg"/></g>`;
  const defs = foil() + mg + big + olf + champa + medal;
  let body = `<path d="${og}" fill="none" stroke="${cw.line}" stroke-width="2.6"/><path d="${og}" fill="none" stroke="${cw.bg}" stroke-width=".9"/>` + ogLeaves;
  body += wrapUse(T, 'med', 80, 160, 100) + wrapUse(T, 'med', 240, 0, 100);
  body += wrapUse(T, 'ch', 80, 0, 24) + wrapUse(T, 'ch', 240, 160, 24, 'rotate(36)');
  return { T, svg: doc(T, 'Marigold Damask — ' + cw.name, cw.bg, defs, body) };
}

/* =====================================================================
   05 · PEACOCK EYE — overlapping feather-eye scales
   ===================================================================== */
function peacock(cw) {
  const T = 240, w = 80, h = 60, R = 44, E = 1.32;
  let barbs = '';
  for (let a = 0; a < 360; a += 10) { const p0 = add([0, 8], rot([0, -15 * E], a * D)), p1 = add([0, 0], rot([0, -R + 2], a * D)); barbs += `M${P(p0)}L${P(p1)}`; }
  const eye = `<g transform="translate(0 8) scale(${E})">` +
    `<path d="M0 -17C9 -11 13 -3 13 4C13 11 7 15 0 15C-7 15 -13 11 -13 4C-13 -3 -9 -11 0 -17Z" fill="url(#foil)"/>` +
    `<path d="M0 -12C6.5 -8 9.5 -2 9.5 4C9.5 9 5 12 0 12C-5 12 -9.5 9 -9.5 4C-9.5 -2 -6.5 -8 0 -12Z" fill="${cw.e1}"/>` +
    `<path d="M0 -7.5C4.5 -5 6.6 -1 6.6 3.6C6.6 7.4 3.4 9.4 0 9.4C-3.4 9.4 -6.6 7.4 -6.6 3.6C-6.6 -1 -4.5 -5 0 -7.5Z" fill="${cw.e2}"/>` +
    `<ellipse cy="4.2" rx="3.5" ry="4.4" fill="${cw.e3}"/>` +
    `<circle cx="-1.3" cy="2.4" r=".85" fill="${cw.glint}"/></g>`;
  const scale = `<g id="sc"><circle r="${R}" fill="${cw.scale}"/>` +
    `<path d="${barbs}" stroke="${cw.barb}" stroke-width=".55" opacity="${cw.barbOp}"/>` +
    `<circle r="${R - 5}" fill="none" stroke="${cw.line}" stroke-width=".6" opacity=".6"/><circle r="${R - 8}" fill="none" stroke="${cw.line}" stroke-width=".4" opacity=".4"/>` +
    eye + `<circle r="${R}" fill="none" stroke="${cw.line}" stroke-width="1.5"/></g>`;
  let body = '';
  for (let j = 5; j >= -1; j--) {
    const y = j * h, off = (((j % 2) + 2) % 2) ? w / 2 : 0;
    for (let i = -1; i <= 4; i++) { const x = i * w + off; if (x + R > 0 && x - R < T && y + R > 0 && y - R < T) body += `<use xlink:href="#sc" x="${n(x)}" y="${n(y)}"/>`; }
  }
  return { T, svg: doc(T, 'Peacock Eye — ' + cw.name, cw.bg, foil() + scale, body) };
}

/* =====================================================================
   06 · STAR TILE — carved eight-point star & cross tessellation
   ===================================================================== */
function starTile(cw) {
  const T = 240, q = 30, k2 = Math.SQRT2 - 1;
  const starV = [...Array(16)].map((_, k) => { const r = k % 2 ? q * Math.sqrt(4 - 2 * Math.SQRT2) : q * Math.SQRT2; return [r * Math.cos(k * 22.5 * D), r * Math.sin(k * 22.5 * D)]; });
  const crossV = [[-q, -q], [-k2 * q, -q], [0, -(1 - k2) * q], [k2 * q, -q], [q, -q], [q, -k2 * q], [(1 - k2) * q, 0], [q, k2 * q], [q, q], [k2 * q, q], [0, (1 - k2) * q], [-k2 * q, q], [-q, q], [-q, k2 * q], [-(1 - k2) * q, 0], [-q, -k2 * q]];
  const L = 225 * D;
  // chamfer: quads between the outline and an inset copy, shaded by each edge's outward normal (light from top-left)
  const BV = 5.2, Lv = [Math.cos(L), Math.sin(L)];
  // true inset polygon (offset every edge inward by d, re-intersect neighbours)
  const inset = (V, d) => V.map((v, i) => {
    const m = V.length, a0 = V[(i - 1 + m) % m], a1 = v, b1 = V[(i + 1) % m];
    const e1 = unit(sub(a1, a0)), e2 = unit(sub(b1, a1));
    const p1 = add(a0, mul([-e1[1], e1[0]], d)), p2 = add(a1, mul([-e2[1], e2[0]], d));
    const den = e1[0] * e2[1] - e1[1] * e2[0];
    const t = ((p2[0] - p1[0]) * e2[1] - (p2[1] - p1[1]) * e2[0]) / den;
    return add(p1, mul(e1, t));
  });
  const facets = (V, hi, sh, kHi, kSh) => { const I = inset(V, BV); return V.map((v, i) => {
    const j = (i + 1) % V.length, w = V[j], d = unit(sub(w, v)), nr = [d[1], -d[0]], b = dot(nr, Lv);
    const quad = poly([v, w, I[j], I[i]]);
    return b > 0.05 ? `<path d="${quad}" fill="${hi}" fill-opacity="${n(kHi * b)}"/>` : b < -0.05 ? `<path d="${quad}" fill="${sh}" fill-opacity="${n(-kSh * b)}"/>` : '';
  }).join(''); };
  const ridges = V => { const I = inset(V, BV); return V.map((v, i) => `M${P(v)}L${P(I[i])}`).join(''); };
  const star = `<g id="st"><path d="${poly(starV)}" fill="${cw.star}"/>${facets(starV, cw.hi, cw.sh, cw.kHi, cw.kSh)}` +
    `<path d="${ridges(starV)}" stroke="${cw.ridge}" stroke-width=".5" opacity=".6"/>` +
    `<path d="${poly(inset(starV, BV))}" fill="none" stroke="${cw.inlay}" stroke-width=".9"/>` +
    `<path d="${poly(starV.map(p => mul(p, .36)))}" fill="${cw.inlayFill}"/>` +
    `<circle r="3.4" fill="url(#foil)"/><circle r="1.3" fill="${cw.boss}"/></g>`;
  const cross = `<g id="cr"><path d="${poly(crossV)}" fill="${cw.cross}"/>${cw.crossShade ? `<path d="${poly(crossV)}" fill="${cw.crossShade}"/>` : ''}${facets(crossV, cw.hi, cw.sh, cw.kHi * .8, cw.kSh * .8)}` +
    `<path d="${ridges(crossV)}" stroke="${cw.ridge}" stroke-width=".5" opacity=".6"/>` +
    `<path d="${poly(inset(crossV, BV))}" fill="none" stroke="${cw.inlay}" stroke-width=".6" opacity=".6"/>` +
    `<path d="M0 -4.5L4.5 0 0 4.5 -4.5 0Z" fill="${cw.crossGem}"/></g>`;
  const outline = `<path id="so" d="${poly(starV)}"/><path id="co" d="${poly(crossV)}"/>`;
  let fills = '', lines = '';
  for (const m of range(-1, 4)) for (const nn of range(-1, 4)) {
    const x = 2 * q * m, y = 2 * q * nn; if (x < -50 || x > T + 50 || y < -50 || y > T + 50) continue;
    const isStar = (m + nn) % 2 === 0;
    fills += `<use xlink:href="#${isStar ? 'st' : 'cr'}" x="${x}" y="${y}"/>`;
    lines += `<use xlink:href="#${isStar ? 'so' : 'co'}" x="${x}" y="${y}"/>`;
  }
  const body = fills + `<g fill="none" stroke="${cw.grout}" stroke-width="${cw.groutW}" stroke-linejoin="round">${lines}</g>` +
    (cw.goldEdge ? `<g fill="none" stroke="${cw.goldEdge}" stroke-width=".7" stroke-linejoin="round">${lines}</g>` : '');
  return { T, svg: doc(T, 'Star Tile — ' + cw.name, cw.grout, foil() + star + cross + outline, body) };
}

/* =====================================================================
   07 · SPICE BOTANICAL — fine-line cardamom, saffron, curry leaf, star anise
   ===================================================================== */
function spice(cw) {
  const T = 320, sw = 1.15;
  const leafPath = (l, w) => `M0 0C${n(w)} ${n(-l * .22)} ${n(w * .95)} ${n(-l * .72)} 0 ${n(-l)}C${n(-w * .95)} ${n(-l * .72)} ${n(-w)} ${n(-l * .22)} 0 0Z`;
  // curry-leaf sprig — alternate leaflets on a gently arched rachis (base at 0,0, growing toward -y)
  const sx = t => 3.2 * Math.sin(Math.PI * t / 150) - t * 0.035;
  const stem = range(0, 9).map(i => [sx(i * 14), -i * 14]);
  let lv = '';
  for (let i = 0; i < 8; i++) {
    const t = 12 + i * 14, l = 30 - i * 1.5, w = 7.6 - i * .25, side = i % 2 ? 1 : -1;
    lv += `<g transform="translate(${n(sx(t))} ${-t}) rotate(${n(side * (64 - i * 3.5))})"><path d="${leafPath(l, w)}"/><path d="M0 -2V${n(-l + 4)}" fill="none" stroke-width=".55"/></g>`;
  }
  lv += `<g transform="translate(${n(sx(126))} -126) rotate(-6)"><path d="${leafPath(25, 6.6)}"/><path d="M0 -2V-21" fill="none" stroke-width=".55"/></g>`;
  const sprig = `<g id="cl" fill="${cw.leafFill}" stroke="${cw.line}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"><g transform="translate(0 63)"><path d="${smooth(stem)}" fill="none"/>${lv}</g></g>`;
  // star anise — eight boat-shaped carpels, each with a seed
  let carp = '';
  for (let i = 0; i < 8; i++) carp += `<g transform="rotate(${i * 45})"><path d="M0 -4C7 -6 11 -18 1.5 -32C.5 -33.4 -.8 -33.4 -1.6 -32C-10 -18 -7 -6 0 -4Z"/><path d="M.2 -8C1.4 -16 1.2 -24 .3 -29" fill="none" stroke-width=".55"/><ellipse cx="3.7" cy="-17" rx="2" ry="3.8" fill="${cw.seed}" stroke="none" transform="rotate(8 3.7 -17)"/></g>`;
  const anise = `<g id="sa" fill="${cw.aniseFill}" stroke="${cw.line}" stroke-width="${sw}" stroke-linejoin="round">${carp}<circle r="4.6" fill="${cw.seed}"/></g>`;
  // green cardamom — whole ribbed pod, and a split pod showing seeds
  const podO = 'M0 -25C10.5 -20.5 12.5 8 0 25C-12.5 8 -10.5 -20.5 0 -25Z';
  const stalk = `<path d="M0 25L.5 29.5M-2.2 30H3" fill="none" stroke-width="1"/><path d="M0 -25L-.5 -28" fill="none"/>`;
  const pod = `<g id="cd" fill="${cw.podFill}" stroke="${cw.line}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="${podO}"/>` +
    `<path d="M0 -23C4.5 -12 5 8 0 23M-2.5 -23.5C-8.5 -13 -9 6 -4 21.5M2.5 -23.5C8.5 -13 9 6 4 21.5" fill="none" stroke-width=".55"/>${stalk}</g>`;
  const seeds = [[-2.2, -9, 20], [2.2, -4, -15], [-2, 2, 10], [2.2, 7.5, -20], [-.4, 12.5, 0]].map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="2.1" ry="2.7" transform="rotate(${a} ${x} ${y})"/>`).join('');
  const podOpen = `<g id="cp" fill="${cw.podFill}" stroke="${cw.line}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="${podO}"/>` +
    `<path d="M0 -18C6.5 -11 7 6 0 17C-7 6 -6.5 -11 0 -18Z" fill="${cw.bg}"/><g fill="${cw.seed}" stroke="none">${seeds}</g>${stalk}</g>`;
  const pair = `<g id="c2"><use xlink:href="#cd" transform="translate(-11 3) rotate(-18)"/><use xlink:href="#cp" transform="translate(11 -3) rotate(14)"/></g>`;
  // saffron — three crimson stigma threads flaring into trumpets
  let thr = '';
  for (const a of [-19, -3, 14]) {
    const Ls = 46 - Math.abs(a) * .25, tip = rot([0, -Ls], a * D), c1 = rot([4, -Ls * .45], a * D);
    thr += `<path d="M0 0Q${P(c1)} ${P(tip)}" fill="none" stroke="${cw.saffron}" stroke-width="1.25" stroke-linecap="round"/>` +
      `<path d="M-.9 0L-4.2 -9.5C-2.4 -11.4 2.4 -11.4 4.2 -9.5L.9 0Z" transform="translate(${P(tip)}) rotate(${n(a * 1.15)})" fill="${cw.saffron}"/>`;
  }
  const saffron = `<g id="sf"><g transform="translate(0 20)">${thr}<path d="M0 0C-1.2 4 1.2 8 0 12" fill="none" stroke="${cw.saffronStem}" stroke-width="1.1" stroke-linecap="round"/></g></g>`;
  const cumin = `<g id="sd"><path d="M0 -5C2 -3 2 3 0 5C-2 3 -2 -3 0 -5Z" fill="none" stroke="${cw.line}" stroke-width=".8"/><path d="M0 -3.4V3.4" stroke="${cw.line}" stroke-width=".45"/></g>`;
  const pep = `<g id="pp"><circle r="2.7" fill="${cw.pep}"/><circle cx="-.8" cy="-.9" r=".8" fill="${cw.bg}" opacity=".35"/></g>`;
  const defs = sprig + anise + pod + podOpen + pair + saffron + cumin + pep;
  // 3×3 toss grid; every row shifts a third of a step, so the repeat never reads as a grid
  const st = T / 3, sh = st / 3;
  const slot = (r, c) => [st / 2 - 6 + c * st + r * sh, st / 2 + r * st];
  const place = [
    ['cl', ...slot(0, 0), 38, 70], ['sa', ...slot(0, 1), 8, 36], ['c2', ...slot(0, 2), -28, 34],
    ['sf', ...slot(1, 0), -12, 32], ['cl', ...slot(1, 1), 118, 70], ['sa', ...slot(1, 2), 26, 36, .78],
    ['c2', ...slot(2, 0), 32, 34], ['cp', ...slot(2, 1), -48, 30, 1.05], ['sf', ...slot(2, 2), 22, 32],
  ];
  const fill = [
    ['pp', 112, 104], ['pp', 252, 128], ['pp', 26, 206], ['pp', 172, 222], ['pp', 300, 290], ['pp', 70, 300],
    ['sd', 140, 14, 30], ['sd', 220, 112, -40], ['sd', 18, 128, 60], ['sd', 280, 228, 10], ['sd', 120, 196, -70], ['sd', 196, 300, 45],
  ];
  let body = '';
  for (const [id, x, y, a, r, s = 1] of place) body += wrapUse(T, id, x, y, r * s, `rotate(${a})${s !== 1 ? ` scale(${s})` : ''}`);
  for (const [id, x, y, a = 0] of fill) body += wrapUse(T, id, x, y, 6, a ? `rotate(${a})` : '');
  return { T, svg: doc(T, 'Spice Botanical — ' + cw.name, cw.bg, foil() + defs, body) };
}

/* =====================================================================
   08 · BRASS DOTS & DIAMONDS — quiet quilted menu ground
   ===================================================================== */
function brassDots(cw) {
  const T = 240, u = 40;
  let dots = '';
  const nodes = [];
  for (const i of range(-2, 8)) for (const j of range(-2, 8)) if ((i + j) % 2 === 0) nodes.push([i * u, j * u]);
  for (const p of nodes) for (const d of [[u, u], [u, -u]]) {
    const q = add(p, d);
    for (let k = 1; k < 9; k++) { const s = k / 9, r = lerp(p, q, s); if (r[0] > -2 && r[0] < T + 2 && r[1] > -2 && r[1] < T + 2) dots += `M${P(r)}h0`; }
  }
  const dia = `<g id="dm"><path d="M0 -8L4.6 0 0 8 -4.6 0Z" fill="url(#foil)"/><path d="M0 -3.2L1.8 0 0 3.2 -1.8 0Z" fill="${cw.dCore}"/></g>`;
  const stud = `<g id="ss"><circle r="2.6" fill="url(#brass)"/></g>`;
  let body = `<path d="${dots}" stroke="${cw.dot}" stroke-width="1.15" stroke-linecap="round" opacity="${cw.dotOp}"/>`;
  for (const i of range(-1, 6)) for (const j of range(-1, 6)) {
    const x = i * u, y = j * u; if (x < -10 || x > T + 10 || y < -10 || y > T + 10) continue;
    if ((i + j) % 2 === 0) { if ((i % 2 + 2) % 2 === 0) body += `<use xlink:href="#dm" x="${x}" y="${y}"/>`; else body += `<use xlink:href="#dm" x="${x}" y="${y}" transform="rotate(90 ${x} ${y})"/>`; }
    else body += `<use xlink:href="#ss" x="${x}" y="${y}"/>`;
  }
  return { T, svg: doc(T, 'Brass Dots &amp; Diamonds — ' + cw.name, cw.bg, foil() + brass() + dia + stud, body) };
}

/* =====================================================================
   COLOURWAYS
   ===================================================================== */
const PATTERNS = [
  { id: '01-jali-lattice', fn: jali, cws: {
    midnight: { name: 'Midnight', bg: C.ink, tone: C.plum, tone2: C.aub, line: C.gold, channel: C.ink, center: C.ruby, spark: C.goldLt, dot: C.goldDk },
    emerald:  { name: 'Emerald', bg: C.emerald, tone: C.ink + '40', tone2: C.peacock, line: C.gold, channel: C.emerald, center: C.ivory, spark: C.ivory, dot: C.ivory },
    ivory:    { name: 'Ivory', bg: C.ivory, tone: C.blush + '8C', tone2: C.ivory2, line: C.goldDk, channel: C.ivory, center: C.ruby, spark: C.emerald, dot: C.ruby },
  } },
  { id: '02-mehrab-trellis', fn: mehrab, cws: {
    midnight: { name: 'Midnight', bg: C.ink, cellTone: C.aub, line: C.gold, leaf: C.goldDk, colHi: C.goldLt, center: C.ruby },
    emerald:  { name: 'Emerald', bg: C.emerald, cellTone: C.ink + '40', line: C.gold, leaf: C.ivory, colHi: C.ivory, center: C.ivory },
    ivory:    { name: 'Ivory', bg: C.ivory, cellTone: C.ivory2, line: C.goldDk, leaf: C.emerald, colHi: C.goldLt, center: C.ruby },
  } },
  { id: '03-paisley-vine', fn: paisley, cws: {
    midnight: { name: 'Midnight', bg: C.ink, body: C.plum, inner: C.aub, line: C.gold, leaf: C.goldDk, center: C.ruby },
    emerald:  { name: 'Emerald', bg: C.emerald, body: C.ink + '40', inner: C.emerald, line: C.gold, leaf: C.ivory, center: C.ivory },
    ivory:    { name: 'Ivory', bg: C.ivory, body: C.blush, inner: C.ivory, line: C.goldDk, leaf: C.emerald, center: C.ruby },
    ruby:     { name: 'Ruby', bg: C.ruby, body: C.ink + '40', inner: C.ruby, line: C.goldLt, leaf: C.gold, center: C.ink },
  } },
  { id: '04-marigold-damask', fn: marigold, cws: {
    midnight: { name: 'Midnight', bg: C.ink, line: C.gold, halo: C.aub, leafFill: C.plum, olf: C.goldDk, m1: C.goldDk, m2: C.gold, m3: C.goldLt, m4: C.gold, mCore: C.ruby, mStroke: C.ink, chFill: C.ivory, chStroke: C.goldDk },
    emerald:  { name: 'Emerald', bg: C.emerald, line: C.gold, halo: C.ink + '33', leafFill: C.ink + '4D', olf: C.ivory, m1: C.goldDk, m2: C.gold, m3: C.goldLt, m4: C.gold, mCore: C.ruby, mStroke: C.emerald, chFill: C.ivory, chStroke: C.goldDk },
    ivory:    { name: 'Ivory', bg: C.ivory, line: C.goldDk, halo: C.ivory2, leafFill: C.emerald, olf: C.emerald, m1: C.ruby, m2: C.gold, m3: C.goldLt, m4: C.goldDk, mCore: C.ruby, mStroke: C.ivory, chFill: C.blush, chStroke: C.ruby },
    ruby:     { name: 'Ruby', bg: C.ruby, line: C.goldLt, halo: C.ink + '33', leafFill: C.ink + '4D', olf: C.gold, m1: C.goldDk, m2: C.gold, m3: C.goldLt, m4: C.gold, mCore: C.ink, mStroke: C.ruby, chFill: C.ivory, chStroke: C.goldDk },
  } },
  { id: '05-peacock-eye', fn: peacock, cws: {
    midnight: { name: 'Midnight', bg: C.ink, scale: C.aub, line: C.gold, barb: C.gold, barbOp: .35, e1: C.peacock, e2: C.emerald, e3: C.ink, glint: C.goldLt },
    emerald:  { name: 'Emerald', bg: C.emerald, scale: C.emerald, line: C.gold, barb: C.ivory, barbOp: .3, e1: C.peacock, e2: C.ink, e3: C.peacock, glint: C.goldLt },
    ivory:    { name: 'Ivory', bg: C.ivory, scale: C.ivory, line: C.goldDk, barb: C.emerald, barbOp: .35, e1: C.emerald, e2: C.peacock, e3: C.ruby, glint: C.goldLt },
    peacock:  { name: 'Peacock', bg: C.peacock, scale: C.peacock, line: C.goldLt, barb: C.ivory, barbOp: .3, e1: C.emerald, e2: C.ink, e3: C.peacock, glint: C.goldLt },
  } },
  { id: '06-star-tile', fn: starTile, cws: {
    midnight: { name: 'Midnight', grout: C.ink, groutW: 2.6, star: C.plum, cross: C.aub, hi: C.goldLt, sh: C.ink, kHi: .32, kSh: .6, ridge: C.goldLt, inlay: C.gold, inlayFill: C.aub, crossGem: C.gold, boss: C.ruby, goldEdge: null },
    emerald:  { name: 'Emerald', grout: C.ink, groutW: 2.6, star: C.emerald, cross: C.emerald, crossShade: C.ink + '4D', hi: C.ivory, sh: C.ink, kHi: .3, kSh: .55, ridge: C.ivory, inlay: C.gold, inlayFill: C.peacock, crossGem: C.ivory, boss: C.ivory, goldEdge: null },
    ivory:    { name: 'Ivory', grout: C.ivory2, groutW: 2.6, star: C.ivory, cross: C.ivory2, hi: '#FFFFFF', sh: C.goldDk, kHi: .9, kSh: .4, ridge: C.goldDk, inlay: C.goldDk, inlayFill: C.ruby, crossGem: C.emerald, boss: C.goldLt, goldEdge: C.goldDk },
  } },
  { id: '07-spice-botanical', fn: spice, cws: {
    midnight: { name: 'Midnight', bg: C.ink, line: C.gold, leafFill: C.ink, aniseFill: C.ink, podFill: C.ink, seed: C.goldDk, saffron: C.goldLt, saffronStem: C.goldDk, pep: C.goldDk },
    emerald:  { name: 'Emerald', bg: C.emerald, line: C.gold, leafFill: C.emerald, aniseFill: C.emerald, podFill: C.emerald, seed: C.ivory, saffron: C.ivory, saffronStem: C.gold, pep: C.goldDk },
    ivory:    { name: 'Ivory', bg: C.ivory, line: C.emerald, leafFill: C.ivory, aniseFill: C.ivory, podFill: C.ivory, seed: C.goldDk, saffron: C.ruby, saffronStem: C.goldDk, pep: C.goldDk },
  } },
  { id: '08-brass-dots-diamonds', fn: brassDots, cws: {
    midnight: { name: 'Midnight', bg: C.ink, dot: C.goldDk, dotOp: .75, dCore: C.ink },
    emerald:  { name: 'Emerald', bg: C.emerald, dot: C.gold, dotOp: .55, dCore: C.emerald },
    ivory:    { name: 'Ivory', bg: C.ivory, dot: C.goldDk, dotOp: .6, dCore: C.ruby },
  } },
];

function build() {
const manifest = [];
for (const p of PATTERNS) {
  for (const [key, cw] of Object.entries(p.cws)) {
    const { T, svg } = p.fn(cw);
    const file = `${p.id}-${key}.svg`;
    fs.writeFileSync(path.join(OUT, file), svg);
    manifest.push({ pattern: p.id, colourway: key, file, tile: T, bytes: Buffer.byteLength(svg), bg: cw.bg || cw.grout });
  }
}
fs.writeFileSync(path.join(__dirname, 'manifest.json'), JSON.stringify(manifest, null, 1));
for (const m of manifest) console.log(m.file.padEnd(42), String(m.tile).padStart(4), (m.bytes / 1024).toFixed(1).padStart(6) + ' KB');
}
module.exports = { C, PATTERNS, jali, mehrab, paisley, marigold, peacock, starTile, spice, brassDots };
if (require.main === module) build();

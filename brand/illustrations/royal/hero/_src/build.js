'use strict';
/* Curry District · ROYAL hero — "The Palace Dining Room at Dusk"
   Parametric generator: one scene description → landscape / portrait / static / per-layer SVGs + arch mask.
   Run:  node _src/build.js   (from the hero folder or anywhere) */
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const OUT = path.resolve(__dirname, '..');

/* ── brand palette (brand/tokens.css · royal) ── */
const C = { ink:'#160B26', plum:'#4B1D52', emerald:'#0F4D3F', peacock:'#117C86', ruby:'#A3173F',
  gold:'#E9A63A', goldLt:'#F7D98A', goldDk:'#B7791F', ivory:'#FBF3E4', blush:'#F4C9BB' };

const n1 = v => { const r = Math.round(v * 10) / 10; return (Object.is(r, -0) ? 0 : r).toString(); };
const n2 = v => { const r = Math.round(v * 100) / 100; return (Object.is(r, -0) ? 0 : r).toString(); };
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ───────────────────────── geometry ───────────────────────── */
/* cusped (engrailed) Mughal arch in local units; returns open contour floor-left → floor-right */
function archSegs(a) {
  const { w, ys, ya, yf } = a, n = a.n || 4, lobeK = a.lobeK || 0.56, apexFrac = a.apexFrac || 0.16, tipK = a.tipK || 0.2;
  const h = ys - ya, c = (h * h - w * w) / (2 * w), R = c + w, ta = Math.acos(-c / R);
  const pt = th => [c + R * Math.cos(th), ys - R * Math.sin(th)];
  const d = (Math.PI - ta) * apexFrac, step = (Math.PI - ta - d) / n;
  const P = []; for (let k = 0; k <= n; k++) P.push(pt(Math.PI - k * step));
  const segs = [{ t: 'M', x: -w, y: yf }, { t: 'L', x: -w, y: ys }];
  for (let k = 1; k <= n; k++) { const [x0, y0] = P[k - 1], [x1, y1] = P[k];
    segs.push({ t: 'A', r: Math.hypot(x1 - x0, y1 - y0) * lobeK, sw: 1, x: x1, y: y1 }); }
  const [px, py] = P[n], ch = Math.hypot(P[1][0] - P[0][0], P[1][1] - P[0][1]);
  const T = [0, ya - ch * tipK], ca = Math.hypot(px - T[0], py - T[1]);
  segs.push({ t: 'A', r: ca * 0.62, sw: 1, x: T[0], y: T[1] });
  segs.push({ t: 'A', r: ca * 0.62, sw: 1, x: -px, y: py });
  for (let k = n; k >= 1; k--) { const [x0, y0] = P[k], [x1, y1] = P[k - 1];
    segs.push({ t: 'A', r: Math.hypot(x1 - x0, y1 - y0) * lobeK, sw: 1, x: -x1, y: y1 }); }
  segs.push({ t: 'L', x: w, y: ys }, { t: 'L', x: w, y: yf });
  return segs;
}
/* smooth two-centred pointed arch (outer frame line) */
function smoothSegs(w, ys, ya, yf, legs) {
  const h = ys - ya, c = (h * h - w * w) / (2 * w), R = c + w;
  const s = [{ t: 'M', x: -w, y: ys + (legs || 0) }, { t: 'L', x: -w, y: ys }, { t: 'A', r: R, sw: 1, x: 0, y: ya },
    { t: 'A', r: R, sw: 1, x: w, y: ys }, { t: 'L', x: w, y: ys + (legs || 0) }];
  return s;
}
/* chord of one lobe — used to keep outer frame lines clear of the cusps */
function lobeChord(a) { const { w, ys, ya } = a, n = a.n || 4, h = ys - ya, c = (h * h - w * w) / (2 * w), R = c + w, ta = Math.acos(-c / R);
  return R * ((Math.PI - ta) * (1 - (a.apexFrac || 0.16)) / n); }
function reverseSegs(segs) {
  const out = [{ t: 'M', x: segs[segs.length - 1].x, y: segs[segs.length - 1].y }];
  for (let i = segs.length - 1; i >= 1; i--) { const s = segs[i], p = segs[i - 1];
    out.push(s.t === 'A' ? { t: 'A', r: s.r, sw: 1 - s.sw, x: p.x, y: p.y } : { t: 'L', x: p.x, y: p.y }); }
  return out;
}
/* project local segs to screen: x = ox + s*X, y = oy + s*Y */
function pd(segs, s, ox, oy, skipM) {
  let d = '';
  segs.forEach((g, i) => { const x = n1(ox + s * g.x), y = n1(oy + s * g.y);
    if (g.t === 'M') { if (!skipM) d += `M${x} ${y}`; else d += `L${x} ${y}`; }
    else if (g.t === 'L') d += `L${x} ${y}`;
    else d += `A${n1(g.r * s)} ${n1(g.r * s)} 0 0 ${g.sw} ${x} ${y}`; });
  return d;
}
/* sample segs (local) into polyline points — for CSS polygon() */
function sampleSegs(segs, perArc) {
  const pts = []; let cx0 = 0, cy0 = 0;
  for (const g of segs) {
    if (g.t !== 'A') { pts.push([g.x, g.y]); cx0 = g.x; cy0 = g.y; continue; }
    const x1 = cx0, y1 = cy0, x2 = g.x, y2 = g.y; let r = g.r;
    const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2, lam = (dx * dx + dy * dy) / (r * r); if (lam > 1) r *= Math.sqrt(lam);
    const sign = g.sw === 0 ? 1 : -1; // large-arc always 0
    const num = Math.max(0, r * r * r * r - r * r * dy * dy - r * r * dx * dx), den = r * r * dy * dy + r * r * dx * dx;
    const coef = sign * Math.sqrt(num / den), cxp = coef * dy, cyp = -coef * dx;
    const cx = cxp + (x1 + x2) / 2, cy = cyp + (y1 + y2) / 2;
    const a1 = Math.atan2((dy - cyp) / r, (dx - cxp) / r); let a2 = Math.atan2((-dy - cyp) / r, (-dx - cxp) / r);
    let da = a2 - a1; if (g.sw === 1 && da < 0) da += 2 * Math.PI; if (g.sw === 0 && da > 0) da -= 2 * Math.PI;
    for (let k = 1; k <= perArc; k++) { const a = a1 + da * k / perArc; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    cx0 = x2; cy0 = y2;
  }
  return pts;
}

/* ───────────────────────── tiny PNG noise (anti-banding dither) ───────────────────────── */
function crc32(buf) { let c, crc = 0xFFFFFFFF; for (let n = 0; n < buf.length; n++) { c = (crc ^ buf[n]) & 0xFF;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; } return (crc ^ 0xFFFFFFFF) >>> 0; }
function pngChunk(type, data) { const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td)); return Buffer.concat([len, td, crc]); }
function noisePNG(size, seed) {
  const R = rng(seed), raw = Buffer.alloc((size * 2 + 1) * size);
  for (let y = 0; y < size; y++) { raw[y * (size * 2 + 1)] = 0;
    for (let x = 0; x < size; x++) { const o = y * (size * 2 + 1) + 1 + x * 2; raw[o] = R() < 0.5 ? 0 : 255; raw[o + 1] = 2 + Math.floor(R() * 8); } }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 4; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), pngChunk('IHDR', ihdr), pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })), pngChunk('IEND', Buffer.alloc(0))]);
}
const NOISE = noisePNG(96, 11).toString('base64');

/* ───────────────────────── formats ───────────────────────── */
const LAND = {
  key: 'L', name: 'landscape', W: 1600, H: 1000, vx: 800, vy: 560, lw: 1, D: 786, seed: 7,
  arch: { w: 520, ys: -170, ya: -505, yf: 440, n: 4 },
  planes: [
    { k: 'far2', s: 0.38, sb: 0.36, grp: 'arches-far', inner: '#1B8C95', outer: '#0C4E5A', rev: ['#0A3A45', '#2C5E5E'] },
    { k: 'far1', s: 0.455, sb: 0.43, grp: 'arches-far', inner: '#147A80', outer: '#0B4650', rev: ['#08313B', '#2A5552'] },
    { k: 'mid2', s: 0.56, sb: 0.525, grp: 'arches-mid', inner: '#17664F', outer: '#0A3A30', rev: ['#072C25', '#2E4F3A'] },
    { k: 'mid1', s: 0.70, sb: 0.655, grp: 'arches-mid', inner: '#5C2664', outer: '#2A1036', rev: ['#22102D', '#57283F'] },
    { k: 'near', s: 1.0, sb: 0.93, grp: 'arches-near', inner: '#2A1440', outer: '#0D0618', rev: ['#170A24', '#43203A'] } ],
  orb: { x: 800, y: 468, r: 56 },
  table: { yt: 223, xt: 170, s0: 1.85, s1: 0.44, runner: 50, rplate: 50, plateX: 104 },
  jali: { X: 600, hw: 56, top: -165, bot: 372 },
  lanternsFg: [{ x: 205, y: -6, chain: 92, k: 1.0, d: -1.3 }, { x: 1395, y: -6, chain: 92, k: 1.0, d: -4.1 }],
  lanternsDepth: [{ s: 0.82, X: 262, Y: -268, clip: 'near', d: -2.2 }],
  stars: 34, embers: 30,
};
const PORT = {
  key: 'P', name: 'portrait', W: 800, H: 1200, vx: 400, vy: 720, lw: 1.55, D: 640, seed: 21,
  arch: { w: 362, ys: -300, ya: -690, yf: 480, n: 4 },
  planes: [
    { k: 'far2', s: 0.42, sb: 0.40, grp: 'arches-far', inner: '#1B8C95', outer: '#0C4E5A', rev: ['#0A3A45', '#2C5E5E'] },
    { k: 'far1', s: 0.50, sb: 0.475, grp: 'arches-far', inner: '#147A80', outer: '#0B4650', rev: ['#08313B', '#2A5552'] },
    { k: 'mid2', s: 0.60, sb: 0.57, grp: 'arches-mid', inner: '#17664F', outer: '#0A3A30', rev: ['#072C25', '#2E4F3A'] },
    { k: 'mid1', s: 0.74, sb: 0.70, grp: 'arches-mid', inner: '#5C2664', outer: '#2A1036', rev: ['#22102D', '#57283F'] },
    { k: 'near', s: 1.0, sb: 0.94, grp: 'arches-near', inner: '#2A1440', outer: '#0D0618', rev: ['#170A24', '#43203A'] } ],
  orb: { x: 400, y: 588, r: 50 },
  table: { yt: 250, xt: 150, s0: 1.86, s1: 0.5, runner: 46, rplate: 46, plateX: 92 },
  jali: { X: 408, hw: 38, top: -215, bot: 410 },
  lanternsFg: [{ x: 86, y: -6, chain: 120, k: 0.92, d: -1.3 }, { x: 714, y: -6, chain: 120, k: 0.92, d: -4.1 }],
  lanternsDepth: [{ s: 0.86, X: 222, Y: -330, clip: 'near', d: -2.2 }],
  stars: 30, embers: 26,
};

/* ───────────────────────── scene builder ───────────────────────── */
function build(F) {
  const P = F.key + '-', D = {}; // defs registry
  const def = (id, body) => { D[P + id] = body; return `url(#${P}${id})`; };
  const ref = id => `url(#${P}${id})`;
  const { W, H, vx, vy, lw, arch } = F, M = 220;
  const plane = k => F.planes.find(p => p.k === k);
  const A = archSegs(arch), Arev = reverseSegs(A);
  const openD = (s) => pd(A, s, vx, vy);
  const openClosed = (s) => openD(s) + 'Z';
  const R = rng(F.seed);

  /* shared gradients */
  def('gold', `<linearGradient id="${P}gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.goldDk}"/><stop offset=".38" stop-color="${C.goldLt}"/><stop offset=".6" stop-color="${C.gold}"/><stop offset="1" stop-color="${C.goldDk}"/></linearGradient>`);
  def('foil', `<linearGradient id="${P}foil" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${H}"><stop offset="0" stop-color="#F6D78E"/><stop offset=".3" stop-color="#EDB65A"/><stop offset=".62" stop-color="#D9993C"/><stop offset="1" stop-color="#A86E1E"/></linearGradient>`);
  def('brassV', `<linearGradient id="${P}brassV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBE3A0"/><stop offset=".35" stop-color="${C.gold}"/><stop offset=".75" stop-color="${C.goldDk}"/><stop offset="1" stop-color="#5E3410"/></linearGradient>`);
  def('brassH', `<linearGradient id="${P}brassH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5E3410"/><stop offset=".22" stop-color="${C.goldDk}"/><stop offset=".42" stop-color="#FBE3A0"/><stop offset=".6" stop-color="${C.gold}"/><stop offset="1" stop-color="#4A280C"/></linearGradient>`);

  /* ── #sky ── */
  def('sky', `<linearGradient id="${P}sky" gradientUnits="userSpaceOnUse" x1="0" y1="${n1(vy - 300)}" x2="0" y2="${vy}"><stop offset="0" stop-color="#140A26"/><stop offset=".42" stop-color="#2C1349"/><stop offset=".7" stop-color="#5A1F58"/><stop offset=".86" stop-color="#9A2F4F"/><stop offset=".95" stop-color="#D2714A"/><stop offset="1" stop-color="#EFA557"/></linearGradient>`);
  const far2 = plane('far2'); const winHalf = arch.w * far2.sb;
  let garden = '';
  { // cypress avenue + low hedge silhouettes on the horizon
    const hedge = []; for (let i = 0; i <= 24; i++) { const x = vx - winHalf * 1.2 + i * (winHalf * 2.4 / 24); hedge.push(`${n1(x)} ${n1(vy - 3 - Math.abs(Math.sin(i * 1.7)) * 4)}`); }
    garden += `<path d="M${n1(vx - winHalf * 1.2)} ${vy + 2}L${hedge.join('L')}L${n1(vx + winHalf * 1.2)} ${vy + 2}Z" fill="#1E0F2C"/>`;
    const cy = [[0.42, 0.20], [0.6, 0.27], [0.78, 0.36], [0.98, 0.5]];
    for (const [fx, fh] of cy) for (const sg of [-1, 1]) {
      const x = vx + sg * winHalf * fx, h = winHalf * fh, wc = h * 0.17;
      garden += `<path d="M${n1(x)} ${vy}C${n1(x - wc)} ${n1(vy - h * .35)} ${n1(x - wc * .7)} ${n1(vy - h * .8)} ${n1(x)} ${n1(vy - h)}C${n1(x + wc * .7)} ${n1(vy - h * .8)} ${n1(x + wc)} ${n1(vy - h * .35)} ${n1(x)} ${vy}Z" fill="#1A0D28"/>`;
    }
  }
  const sky = `<g id="sky"><rect x="${-M}" y="${-M}" width="${W + 2 * M}" height="${vy + M + 2}" fill="${ref('sky')}"/>${garden}</g>`;

  /* ── #orb ── */
  const O = F.orb;
  def('orb', `<radialGradient id="${P}orb" cx=".46" cy=".44" r=".56"><stop offset="0" stop-color="#FFF9EA"/><stop offset=".45" stop-color="#FCE7B4"/><stop offset=".8" stop-color="#F4C474"/><stop offset="1" stop-color="#E9A35A"/></radialGradient>`);
  def('halo', `<radialGradient id="${P}halo"><stop offset="0" stop-color="${C.goldLt}" stop-opacity=".5"/><stop offset=".22" stop-color="${C.gold}" stop-opacity=".26"/><stop offset=".55" stop-color="#D2714A" stop-opacity=".09"/><stop offset="1" stop-color="#D2714A" stop-opacity="0"/></radialGradient>`);
  const orb = `<g id="orb"><circle cx="${O.x}" cy="${O.y}" r="${n1(O.r * 4.6)}" fill="${ref('halo')}"/><circle cx="${O.x}" cy="${O.y}" r="${O.r}" fill="${ref('orb')}"/><circle cx="${O.x}" cy="${O.y}" r="${n1(O.r - 1)}" fill="none" stroke="#FFF6DF" stroke-opacity=".35" stroke-width="${n1(1.2 * lw)}"/></g>`;

  /* ── #stars ── */
  def('star', `<radialGradient id="${P}star"><stop offset="0" stop-color="#FFFDF5"/><stop offset=".28" stop-color="#FCEFD0" stop-opacity=".85"/><stop offset="1" stop-color="#F7D98A" stop-opacity="0"/></radialGradient>`);
  let stars = '';
  { const top = vy + arch.ya * far2.sb, x0 = vx - winHalf * 1.05, x1 = vx + winHalf * 1.05; let placed = 0, guard = 0;
    while (placed < F.stars && guard++ < 4000) {
      const x = x0 + R() * (x1 - x0), y = top - 10 + R() * (vy - 70 - top);
      if (Math.hypot(x - O.x, y - O.y) < O.r * 1.9) continue;
      const big = R() < 0.18, r = (big ? 4.2 : 2 + R() * 1.6) * Math.sqrt(lw);
      const dl = -(R() * 6).toFixed(1), du = (3 + R() * 3.5).toFixed(1);
      stars += `<circle class="star" cx="${n1(x)}" cy="${n1(y)}" r="${n1(r)}" fill="${ref('star')}" style="animation-delay:${dl}s;animation-duration:${du}s"/>`;
      placed++;
    } }
  stars = `<g id="stars">${stars}</g>`;

  /* ── #floor ── */
  def('floor', `<linearGradient id="${P}floor" gradientUnits="userSpaceOnUse" x1="0" y1="${vy}" x2="0" y2="${H}"><stop offset="0" stop-color="#E89A55"/><stop offset=".03" stop-color="#C9664A"/><stop offset=".09" stop-color="#8E2C4E"/><stop offset=".2" stop-color="#521C55"/><stop offset=".4" stop-color="#2E1443"/><stop offset=".7" stop-color="#1D0D2D"/><stop offset="1" stop-color="#12081E"/></linearGradient>`);
  def('refl', `<linearGradient id="${P}refl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.goldLt}" stop-opacity=".55"/><stop offset=".45" stop-color="${C.gold}" stop-opacity=".18"/><stop offset="1" stop-color="${C.gold}" stop-opacity="0"/></linearGradient>`);
  def('reflJ', `<radialGradient id="${P}reflJ"><stop offset="0" stop-color="#F7C45A" stop-opacity=".3"/><stop offset=".45" stop-color="#D9782F" stop-opacity=".1"/><stop offset="1" stop-color="#D9782F" stop-opacity="0"/></radialGradient>`);
  let floor = `<rect x="${-M}" y="${vy}" width="${W + 2 * M}" height="${H - vy + M}" fill="${ref('floor')}"/>`;
  { // tile grid converging to the vanishing point
    let g = ''; const tile = arch.w * 0.27, sMax = (H + 60 - vy) / arch.yf;
    for (let k = -9; k <= 9; k++) { const X = (k + 0.5) * tile; g += `M${vx} ${vy}L${n1(vx + X * sMax)} ${n1(vy + arch.yf * sMax)}`; }
    for (let j = 0; j < 22; j++) { const z = 0.38 + j * 0.2, s = 1 / z; if (s < 0.3) break; const y = vy + arch.yf * s; if (y > H + 10) continue; g += `M${-M} ${n1(y)}H${W + M}`; }
    floor += `<path d="${g}" stroke="${C.goldDk}" stroke-opacity=".17" stroke-width="${n1(1 * lw)}" fill="none"/>`;
  }
  floor += `<ellipse cx="${O.x}" cy="${vy}" rx="${n1(O.r * 3.2)}" ry="${n1(O.r * 0.5)}" fill="${ref('halo')}"/>`;
  def('reflO', `<radialGradient id="${P}reflO"><stop offset="0" stop-color="#FFF1C9" stop-opacity=".72"/><stop offset=".3" stop-color="${C.goldLt}" stop-opacity=".34"/><stop offset=".7" stop-color="${C.gold}" stop-opacity=".08"/><stop offset="1" stop-color="${C.gold}" stop-opacity="0"/></radialGradient>`);
  floor += `<ellipse cx="${O.x}" cy="${vy}" rx="${n1(O.r * 0.95)}" ry="${n1(O.r * 3.4)}" fill="${ref('reflO')}"/>`;
  { const m1 = plane('mid1'), J = F.jali, yb = vy + arch.yf * m1.s;
    for (const sg of [-1, 1]) { const x = vx + sg * J.X * m1.s; floor += `<ellipse cx="${n1(x)}" cy="${n1(yb)}" rx="${n1(J.hw * m1.s * 1.25)}" ry="${n1((H - yb) * 1.05)}" fill="${ref('reflJ')}"/>`; } }
  floor = `<g id="floor">${floor}</g>`;

  /* ── arch planes ── */
  const term = (so, s) => [so[0], so[so.length - 1]].map(g => `<circle cx="${n1(vx + s * g.x)}" cy="${n1(vy + s * g.y)}" r="${n1(2.6 * lw * Math.sqrt(s))}" fill="${C.gold}"/>`).join('');
  const planeSvg = (p) => {
    const s = p.s, sb = p.sb, yb = vy + arch.yf * s;
    def('f-' + p.k, `<radialGradient id="${P}f-${p.k}" gradientUnits="userSpaceOnUse" cx="${vx}" cy="${n1(vy + 60 * s)}" r="${n1(arch.w * s * 1.75)}"><stop offset="0" stop-color="${p.inner}"/><stop offset=".55" stop-color="${p.inner}"/><stop offset="1" stop-color="${p.outer}"/></radialGradient>`);
    def('r-' + p.k, `<linearGradient id="${P}r-${p.k}" gradientUnits="userSpaceOnUse" x1="0" y1="${n1(vy + arch.ya * s)}" x2="0" y2="${n1(yb)}"><stop offset="0" stop-color="${p.rev[0]}"/><stop offset=".55" stop-color="${p.rev[0]}"/><stop offset="1" stop-color="${p.rev[1]}"/></linearGradient>`);
    const face = `M${-M} ${n1(yb)}V${-M}H${W + M}V${n1(yb)}` + pd(Arev, s, vx, vy, true) + 'Z';
    const reveal = openD(s) + pd(Arev, sb, vx, vy, true) + 'Z';
    const sw = n1(Math.max(0.9, 1.7 * Math.sqrt(s)) * lw), ch = lobeChord(arch);
    let g = `<path d="${face}" fill="${ref('f-' + p.k)}"/><path d="${reveal}" fill="${ref('r-' + p.k)}"/>`;
    if (p.k === 'near') {
      def('latFace', `<pattern id="${P}latFace" width="${n1(26 * lw)}" height="${n1(26 * lw)}" patternUnits="userSpaceOnUse"><g fill="none" stroke="${C.goldLt}" stroke-width="${n1(0.8 * lw)}"><circle r="${n1(13 * lw)}"/><circle cx="${n1(26 * lw)}" r="${n1(13 * lw)}"/><circle cy="${n1(26 * lw)}" r="${n1(13 * lw)}"/><circle cx="${n1(26 * lw)}" cy="${n1(26 * lw)}" r="${n1(13 * lw)}"/><circle cx="${n1(13 * lw)}" cy="${n1(13 * lw)}" r="${n1(13 * lw)}"/></g></pattern>`);
      def('vig', `<radialGradient id="${P}vig" gradientUnits="userSpaceOnUse" cx="${vx}" cy="${n1(vy - 40)}" r="${n1(Math.max(W, H) * 0.78)}"><stop offset=".55" stop-color="#0A0414" stop-opacity="0"/><stop offset="1" stop-color="#0A0414" stop-opacity=".78"/></radialGradient>`);
      g += `<path d="${face}" fill="${ref('latFace')}" opacity=".06"/><path d="${face}" fill="${ref('vig')}"/>`;
      const so = smoothSegs(arch.w + ch * 0.31 + 22, arch.ys, arch.ya - ch * 0.2 - 58, arch.yf, 40);
      g += `<path d="${pd(so, s, vx, vy)}" fill="none" stroke="${ref('foil')}" stroke-opacity=".5" stroke-width="${n1(1 * lw)}"/>` + term(so, s);
    }
    if (p.k === 'mid1') { const so = smoothSegs(arch.w + ch * 0.31 + 20, arch.ys, arch.ya - ch * 0.2 - 52, arch.yf, 30);
      g += `<path d="${pd(so, s, vx, vy)}" fill="none" stroke="${ref('foil')}" stroke-opacity=".38" stroke-width="${n1(0.9 * lw)}"/>` + term(so, s); }
    g += `<path d="${openD(s)}" fill="none" stroke="${C.goldLt}" stroke-opacity=".1" stroke-width="${n1(9 * s * lw)}"/>`;
    g += `<path d="${openD(s)}" fill="none" stroke="${ref('foil')}" stroke-width="${sw}"/>`;
    if (p.k === 'near' || p.k === 'mid1') g += `<path d="${openD(sb)}" fill="none" stroke="${C.goldDk}" stroke-opacity=".3" stroke-width="${n1(0.7 * lw)}"/>`;
    return g;
  };
  const crown = A.slice(1, -1).map((g, i) => i === 0 ? { t: 'M', x: g.x, y: g.y } : g);
  const shimmer = (s, delay, dur) => `<path class="shimmer" d="${pd(crown, s, vx, vy)}" pathLength="1000" fill="none" stroke="#FFE3A3" stroke-width="${n1(2.4 * lw * Math.sqrt(s))}" stroke-linecap="round" style="animation-delay:${delay}s;animation-duration:${dur}s"/>`;
  const groupPlanes = (grp, shimmers) => `<g id="${grp}">${F.planes.filter(p => p.grp === grp).map(planeSvg).join('')}${shimmers}</g>`;
  def('haze', `<radialGradient id="${P}haze"><stop offset="0" stop-color="#F4C474" stop-opacity=".2"/><stop offset=".5" stop-color="#D2714A" stop-opacity=".07"/><stop offset="1" stop-color="#A3173F" stop-opacity="0"/></radialGradient>`);
  const haze = `<ellipse cx="${O.x}" cy="${n1(O.y + O.r)}" rx="${n1(arch.w * plane('mid2').sb * 1.05)}" ry="${n1(-arch.ya * plane('mid2').sb * 0.95)}" fill="${ref('haze')}"/>`;
  const archesFar = groupPlanes('arches-far', haze + shimmer(far2.s, -2, 11));
  const archesMid = groupPlanes('arches-mid', shimmer(plane('mid1').s, -6.5, 13));
  const archesNear = groupPlanes('arches-near', shimmer(1, 0, 15));

  /* ── #jali ── */
  const lat = 15 * lw;
  def('lat', `<pattern id="${P}lat" width="${n1(lat)}" height="${n1(lat)}" patternUnits="userSpaceOnUse"><g fill="none" stroke="#2A0E2A" stroke-width="${n1(2.1 * lw)}"><circle r="${n1(lat / 2)}"/><circle cx="${n1(lat)}" r="${n1(lat / 2)}"/><circle cy="${n1(lat)}" r="${n1(lat / 2)}"/><circle cx="${n1(lat)}" cy="${n1(lat)}" r="${n1(lat / 2)}"/><circle cx="${n1(lat / 2)}" cy="${n1(lat / 2)}" r="${n1(lat / 2)}"/></g></pattern>`);
  def('jaliG', `<radialGradient id="${P}jaliG" cx=".5" cy=".58" r=".62"><stop offset="0" stop-color="#FFF1C4"/><stop offset=".3" stop-color="#F8C863"/><stop offset=".66" stop-color="#DC7A30"/><stop offset="1" stop-color="#8A2638"/></radialGradient>`);
  def('jHalo', `<radialGradient id="${P}jHalo"><stop offset="0" stop-color="#F2A64A" stop-opacity=".42"/><stop offset=".5" stop-color="#C8573A" stop-opacity=".14"/><stop offset="1" stop-color="#A3173F" stop-opacity="0"/></radialGradient>`);
  let jali = '';
  { const m1 = plane('mid1'), J = F.jali, s = m1.s;
    const js = archSegs({ w: J.hw, ys: J.top + J.hw * 1.15, ya: J.top, yf: J.bot, n: 2, lobeK: 0.58, tipK: 0.25 });
    const jsIn = archSegs({ w: J.hw * 0.86, ys: J.top + J.hw * 1.15 + 4, ya: J.top + J.hw * 0.16, yf: J.bot - J.hw * 0.14, n: 2, lobeK: 0.58, tipK: 0.25 });
    for (const sg of [-1, 1]) { const cx = vx + sg * J.X * s, d = pd(js, s, cx, vy) + 'Z', di = pd(jsIn, s, cx, vy) + 'Z';
      const cyc = vy + s * (J.top + J.bot) / 2;
      jali += `<ellipse cx="${n1(cx)}" cy="${n1(cyc)}" rx="${n1(J.hw * s * 2.6)}" ry="${n1((J.bot - J.top) * s * 0.78)}" fill="${ref('jHalo')}"/>`;
      jali += `<path d="${d}" fill="#2A0E2A"/><path d="${di}" fill="${ref('jaliG')}"/><path d="${di}" fill="${ref('lat')}"/>`;
      jali += `<path d="${d}" fill="none" stroke="${ref('foil')}" stroke-width="${n1(1.3 * lw)}"/><path d="${di}" fill="none" stroke="${C.goldLt}" stroke-opacity=".5" stroke-width="${n1(0.7 * lw)}"/>`;
    } }
  jali = `<g id="jali">${jali}</g>`;

  /* ── #table (+ steam emitters) ── */
  const T = F.table, tY = s => vy + T.yt * s, ratio = s => Math.min(0.62, T.yt * s / F.D);
  def('cloth', `<linearGradient id="${P}cloth" gradientUnits="userSpaceOnUse" x1="0" y1="${n1(tY(T.s1))}" x2="0" y2="${H}"><stop offset="0" stop-color="#1F6B57"/><stop offset=".35" stop-color="#145443"/><stop offset="1" stop-color="#0A3129"/></linearGradient>`);
  def('runner', `<linearGradient id="${P}runner" gradientUnits="userSpaceOnUse" x1="0" y1="${n1(tY(T.s1))}" x2="0" y2="${H}"><stop offset="0" stop-color="#D0405A"/><stop offset=".3" stop-color="${C.ruby}"/><stop offset="1" stop-color="#6A0D2C"/></linearGradient>`);
  def('warm', `<radialGradient id="${P}warm"><stop offset="0" stop-color="#F2A64A" stop-opacity=".34"/><stop offset=".5" stop-color="#C8573A" stop-opacity=".12"/><stop offset="1" stop-color="#A3173F" stop-opacity="0"/></radialGradient>`);
  def('well', `<radialGradient id="${P}well" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#E6AE55"/><stop offset=".7" stop-color="#B07424"/><stop offset="1" stop-color="#7A4614"/></radialGradient>`);
  const food = {
    ruby: def('cRuby', `<radialGradient id="${P}cRuby" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#F06A3E"/><stop offset=".5" stop-color="#C83A2E"/><stop offset="1" stop-color="#7A1228"/></radialGradient>`),
    saffron: def('cSaff', `<radialGradient id="${P}cSaff" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#FFE08E"/><stop offset=".5" stop-color="#F0A934"/><stop offset="1" stop-color="#B8641C"/></radialGradient>`),
    green: def('cGreen', `<radialGradient id="${P}cGreen" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#6DBB6A"/><stop offset=".5" stop-color="#2E7D4F"/><stop offset="1" stop-color="#124A35"/></radialGradient>`),
    ivory: def('cIvory', `<radialGradient id="${P}cIvory" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#FFFFFA"/><stop offset=".6" stop-color="#F5E8CC"/><stop offset="1" stop-color="#CDB48A"/></radialGradient>`),
    blush: def('cBlush', `<radialGradient id="${P}cBlush" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#FFE7C2"/><stop offset=".6" stop-color="#E9B27A"/><stop offset="1" stop-color="#B9733E"/></radialGradient>`),
  };
  def('flame', `<radialGradient id="${P}flame" cx=".5" cy=".72" r=".62"><stop offset="0" stop-color="#FFFDF0"/><stop offset=".35" stop-color="#FFE38E"/><stop offset=".75" stop-color="#F59A2E"/><stop offset="1" stop-color="#D2452A" stop-opacity="0"/></radialGradient>`);
  def('dglow', `<radialGradient id="${P}dglow"><stop offset="0" stop-color="#FFD98A" stop-opacity=".55"/><stop offset=".4" stop-color="#F29A3A" stop-opacity=".18"/><stop offset="1" stop-color="#F29A3A" stop-opacity="0"/></radialGradient>`);
  def('clay', `<linearGradient id="${P}clay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9773A"/><stop offset="1" stop-color="#6E2A1A"/></linearGradient>`);

  const items = []; // {s, svg}
  const thali = (X, s) => {
    const cx = vx + X * s, cy = tY(s), rx = T.rplate * s, ry = rx * ratio(s), k = T.rplate;
    const kx = rx / k, ky = ry / k, ns = 'vector-effect="non-scaling-stroke"';
    const kat = [[200, food.ruby], [244, food.saffron], [292, food.green], [338, food.ivory]].map(([a, f]) => {
      const x = Math.cos(a * Math.PI / 180) * 25, y = Math.sin(a * Math.PI / 180) * 25;
      return `<circle cx="${n1(x)}" cy="${n1(y + 3)}" r="11.5" fill="#3A1E0C" opacity=".45"/><circle cx="${n1(x)}" cy="${n1(y)}" r="11" fill="${ref('brassV')}"/><circle cx="${n1(x)}" cy="${n1(y + 0.6)}" r="8.4" fill="${f}"/>`; }).join('');
    const svg = `<g transform="translate(${n1(cx)} ${n1(cy)}) scale(${n2(kx)} ${n2(ky)})"><circle cy="7" r="${k + 3}" fill="#08140F" opacity=".5"/><circle r="${k}" fill="${ref('brassV')}"/><circle r="${k * 0.84}" fill="${ref('well')}"/>${kat}`
      + `<circle cx="-11" cy="17" r="13" fill="${food.ivory}"/><path d="M8 10C20 6 33 14 30 24C27 32 12 31 8 24C5 19 4 12 8 10Z" fill="${food.blush}"/><circle cx="18" cy="20" r="1.6" fill="#8A4A22" opacity=".6"/><circle cx="23" cy="16" r="1.2" fill="#8A4A22" opacity=".6"/>`
      + `<circle r="${k - 0.5}" fill="none" stroke="${C.goldLt}" stroke-opacity=".85" stroke-width="${n1(Math.max(0.6, s * 0.9) * lw)}" ${ns}/></g>`;
    items.push({ s, svg });
  };
  const steamAt = [];
  const bowl = (s, R0, h0, f, opts = {}) => {
    const cx = vx, cy = tY(s), rx = R0 * s, ry = rx * ratio(s) * 1.05, hh = h0 * s, rimY = cy - hh;
    let svg = `<ellipse cx="${n1(cx)}" cy="${n1(cy + ry * 0.2)}" rx="${n1(rx * 1.08)}" ry="${n1(ry * 1.15)}" fill="#06120E" opacity=".55"/>`;
    if (opts.handles) svg += `<ellipse cx="${n1(cx - rx * 1.02)}" cy="${n1(rimY + hh * 0.25)}" rx="${n1(rx * 0.14)}" ry="${n1(hh * 0.28)}" fill="none" stroke="${C.goldDk}" stroke-width="${n1(2.2 * s * lw)}"/><ellipse cx="${n1(cx + rx * 1.02)}" cy="${n1(rimY + hh * 0.25)}" rx="${n1(rx * 0.14)}" ry="${n1(hh * 0.28)}" fill="none" stroke="${C.goldDk}" stroke-width="${n1(2.2 * s * lw)}"/>`;
    svg += `<path d="M${n1(cx - rx)} ${n1(rimY)}C${n1(cx - rx)} ${n1(rimY + hh * 1.05)} ${n1(cx - rx * 0.5)} ${n1(cy + ry * 0.1)} ${n1(cx)} ${n1(cy + ry * 0.1)}C${n1(cx + rx * 0.5)} ${n1(cy + ry * 0.1)} ${n1(cx + rx)} ${n1(rimY + hh * 1.05)} ${n1(cx + rx)} ${n1(rimY)}Z" fill="${ref('brassH')}"/>`;
    svg += `<ellipse cx="${n1(cx)}" cy="${n1(rimY)}" rx="${n1(rx)}" ry="${n1(ry)}" fill="${ref('brassV')}"/>`;
    svg += `<ellipse cx="${n1(cx)}" cy="${n1(rimY + ry * 0.08)}" rx="${n1(rx * 0.86)}" ry="${n1(ry * 0.78)}" fill="${f}"/>`;
    if (opts.swirl) svg += `<path d="M${n1(cx - rx * 0.4)} ${n1(rimY)}C${n1(cx - rx * 0.15)} ${n1(rimY - ry * 0.35)} ${n1(cx + rx * 0.2)} ${n1(rimY + ry * 0.3)} ${n1(cx + rx * 0.42)} ${n1(rimY - ry * 0.05)}" fill="none" stroke="#FFF4DF" stroke-opacity=".75" stroke-width="${n1(Math.max(1, 2.4 * s) * lw)}" stroke-linecap="round"/>`;
    if (opts.leaves) for (const [a, b] of [[-0.3, -0.2], [0.1, 0.25], [0.35, -0.15], [-0.05, -0.4]]) svg += `<ellipse cx="${n1(cx + rx * a)}" cy="${n1(rimY + ry * b)}" rx="${n1(rx * 0.07)}" ry="${n1(ry * 0.11)}" fill="#3FA34D"/>`;
    svg += `<ellipse cx="${n1(cx - rx * 0.28)}" cy="${n1(rimY - ry * 0.18)}" rx="${n1(rx * 0.2)}" ry="${n1(ry * 0.16)}" fill="#FFF7E6" opacity=".28"/>`;
    svg += `<ellipse cx="${n1(cx)}" cy="${n1(rimY)}" rx="${n1(rx)}" ry="${n1(ry)}" fill="none" stroke="${C.goldLt}" stroke-width="${n1(Math.max(0.7, 1.1 * s) * lw)}"/>`;
    items.push({ s, svg });
    steamAt.push({ x: cx, y: rimY, s, rx });
  };
  const diyaAt = [];
  const diya = (X, s) => {
    const cx = vx + X * s, cy = tY(s), k = s * 0.95; diyaAt.push({ x: cx, y: cy - 30 * k, k: Math.max(0.6, s) });
    let svg = `<circle cx="${n1(cx)}" cy="${n1(cy - 22 * k)}" r="${n1(42 * k)}" fill="${ref('dglow')}"/>`;
    svg += `<path d="M${n1(cx - 15 * k)} ${n1(cy - 5 * k)}A${n1(15 * k)} ${n1(9 * k)} 0 0 0 ${n1(cx + 15 * k)} ${n1(cy - 5 * k)}Z" fill="${ref('clay')}"/>`;
    svg += `<ellipse cx="${n1(cx)}" cy="${n1(cy - 5 * k)}" rx="${n1(15 * k)}" ry="${n1(4.2 * k)}" fill="#E8924C"/><ellipse cx="${n1(cx)}" cy="${n1(cy - 4.6 * k)}" rx="${n1(11.5 * k)}" ry="${n1(2.8 * k)}" fill="#4A1E10"/>`;
    svg += `<path class="flame" d="M${n1(cx)} ${n1(cy - 34 * k)}C${n1(cx + 5.5 * k)} ${n1(cy - 22 * k)} ${n1(cx + 7 * k)} ${n1(cy - 12 * k)} ${n1(cx)} ${n1(cy - 6 * k)}C${n1(cx - 7 * k)} ${n1(cy - 12 * k)} ${n1(cx - 5.5 * k)} ${n1(cy - 22 * k)} ${n1(cx)} ${n1(cy - 34 * k)}Z" fill="${ref('flame')}" style="animation-delay:-${(R() * 2).toFixed(1)}s"/>`;
    items.push({ s, svg });
  };
  // layout along the table (equal world spacing → s = 1/z)
  const zs = (a, b, n) => Array.from({ length: n }, (_, i) => 1 / (1 / a + i * (1 / b - 1 / a) / (n - 1)));
  zs(T.s0 * 0.86, T.s1 * 1.18, 5).forEach(s => { thali(-T.plateX, s); thali(T.plateX, s); });
  zs(T.s0 * 0.97, T.s1 * 1.03, 7).forEach(s => { diya(-T.xt * 0.86, s); diya(T.xt * 0.86, s); });
  const bs = zs(T.s0 * 0.7, T.s1 * 1.25, 4);
  bowl(bs[0], 46, 26, food.ruby, { handles: true, swirl: true });
  bowl(bs[1], 40, 34, food.saffron, { leaves: true });
  bowl(bs[2], 40, 24, food.green, { swirl: true });
  bowl(bs[3], 38, 26, food.ruby, { handles: true });
  items.sort((a, b) => a.s - b.s);
  const t0 = T.s0, t1 = T.s1, tw = T.xt;
  const quad = (x0, x1, sA, sB, y) => `M${n1(vx + x0 * sA)} ${n1(y(sA))}L${n1(vx + x1 * sA)} ${n1(y(sA))}L${n1(vx + x1 * sB)} ${n1(y(sB))}L${n1(vx + x0 * sB)} ${n1(y(sB))}Z`;
  let table = `<ellipse cx="${vx}" cy="${n1(tY(1.05))}" rx="${n1(W * 0.42)}" ry="${n1((H - vy) * 0.62)}" fill="${ref('warm')}"/>`;
  table += `<path d="${quad(-tw - 4, tw + 4, t0, t1, s => tY(s) + 3 * s)}" fill="#05100C" opacity=".6"/>`;
  table += `<path d="${quad(-tw, tw, t0, t1, tY)}" fill="${ref('cloth')}"/>`;
  table += `<path d="${quad(-T.runner, T.runner, t0, t1, tY)}" fill="${ref('runner')}"/>`;
  { let g = ''; for (const X of [-tw + 8, tw - 8, -T.runner + 6, T.runner - 6]) g += `M${n1(vx + X * t0)} ${n1(tY(t0))}L${n1(vx + X * t1)} ${n1(tY(t1))}`;
    table += `<path d="${g}" stroke="${ref('foil')}" stroke-opacity=".75" stroke-width="${n1(1.1 * lw)}" fill="none"/>`;
    table += `<path d="M${n1(vx - tw * t1)} ${n1(tY(t1))}L${n1(vx + tw * t1)} ${n1(tY(t1))}" stroke="${C.goldLt}" stroke-opacity=".7" stroke-width="${n1(1 * lw)}"/>`; }
  // front drop of the cloth (we see the table's near edge)
  { const y0 = tY(t0), x0 = vx - tw * t0, x1 = vx + tw * t0;
    table += `<path d="M${n1(x0)} ${n1(y0)}H${n1(x1)}V${H + 40}H${n1(x0)}Z" fill="#0A3129"/><path d="M${n1(vx - T.runner * t0)} ${n1(y0)}H${n1(vx + T.runner * t0)}V${H + 40}H${n1(vx - T.runner * t0)}Z" fill="#5E0B28"/>`;
    table += `<path d="M${n1(x0)} ${n1(y0)}H${n1(x1)}" stroke="${C.goldLt}" stroke-width="${n1(1.6 * lw)}"/><path d="M${n1(x0)} ${n1(y0 + 7 * lw)}H${n1(x1)}" stroke="${C.goldDk}" stroke-opacity=".7" stroke-width="${n1(0.8 * lw)}"/>`; }
  table += items.map(i => i.svg).join('');
  table = `<g id="table">${table}</g>`;

  /* ── #steam ── */
  let steam = '';
  steamAt.forEach((e, i) => { if (i > 2) return; (i === 2 ? [0.05] : [-0.32, 0.05, 0.36]).forEach((o, j) => {
    const x = e.x + e.rx * o, y = e.y - 4 * e.s, h = (95 + j * 18) * e.s * Math.sqrt(lw), a = (14 + j * 4) * e.s * (j % 2 ? -1 : 1);
    const d = `M${n1(x)} ${n1(y)}C${n1(x + a)} ${n1(y - h * 0.3)} ${n1(x - a)} ${n1(y - h * 0.62)} ${n1(x + a * 0.4)} ${n1(y - h)}`;
    const dl = -((i * 1.37 + j * 1.71) % 5).toFixed(2);
    steam += `<path class="steam" d="${d}" fill="none" stroke="${C.ivory}" stroke-opacity=".09" stroke-width="${n1(16 * e.s * lw)}" stroke-linecap="round" style="animation-delay:${dl}s"/>`;
    steam += `<path class="steam" d="${d}" fill="none" stroke="${C.ivory}" stroke-opacity=".2" stroke-width="${n1(4.5 * e.s * lw)}" stroke-linecap="round" style="animation-delay:${dl}s"/>`;
  }); });
  steam = `<g id="steam">${steam}</g>`;

  /* ── #lanterns ── */
  def('lamp', `<radialGradient id="${P}lamp" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="#FFF6D6"/><stop offset=".45" stop-color="#F9C95E"/><stop offset="1" stop-color="#C4552E"/></radialGradient>`);
  def('lglow', `<radialGradient id="${P}lglow"><stop offset="0" stop-color="${C.goldLt}" stop-opacity=".5"/><stop offset=".3" stop-color="${C.gold}" stop-opacity=".17"/><stop offset="1" stop-color="${C.gold}" stop-opacity="0"/></radialGradient>`);
  const lanternBody = (Cn, delay, glowK = 1) => {
    const c = Cn; let g = `<g class="lantern" style="animation-delay:${delay}s">`;
    g += `<circle class="glow" cy="${n1(c + 102)}" r="${n1(150 * glowK)}" fill="${ref('lglow')}"/>`;
    g += `<path d="M0 0V${n1(c)}" stroke="${C.goldDk}" stroke-width="1.6" stroke-dasharray="5 2.5"/><circle cy="${n1(c + 3)}" r="3.6" fill="none" stroke="${C.gold}" stroke-width="1.6"/>`;
    g += `<path d="M0 ${n1(c + 6)}L3.5 ${n1(c + 17)}L0 ${n1(c + 22)}L-3.5 ${n1(c + 17)}Z" fill="${ref('brassV')}"/>`;
    g += `<path d="M-5 ${c + 21}C-9 ${c + 33} -33 ${c + 39} -34 ${c + 58}H34C33 ${c + 39} 9 ${c + 33} 5 ${c + 21}Z" fill="${ref('brassV')}"/>`;
    g += `<g fill="#FFE9A8">${[-20, -10, 0, 10, 20].map(x => `<circle cx="${x}" cy="${c + 50 - Math.abs(x) * 0.25}" r="1.9"/>`).join('')}</g>`;
    g += `<rect x="-38" y="${c + 57}" width="76" height="7" rx="2" fill="${ref('brassH')}"/>`;
    g += `<path d="M-30 ${c + 64}C-39 ${c + 88} -39 ${c + 114} -26 ${c + 140}H26C39 ${c + 114} 39 ${c + 88} 30 ${c + 64}Z" fill="${ref('lamp')}"/>`;
    g += `<path d="M-15 ${c + 64}C-20 ${c + 90} -20 ${c + 114} -13 ${c + 140}M0 ${c + 64}V${c + 140}M15 ${c + 64}C20 ${c + 90} 20 ${c + 114} 13 ${c + 140}M-36 ${c + 102}H36" fill="none" stroke="#7A4614" stroke-width="2.2" stroke-opacity=".85"/>`;
    g += `<path d="M-30 ${c + 64}C-39 ${c + 88} -39 ${c + 114} -26 ${c + 140}H26C39 ${c + 114} 39 ${c + 88} 30 ${c + 64}Z" fill="none" stroke="${C.goldDk}" stroke-width="2.4"/>`;
    g += `<rect x="-29" y="${c + 139}" width="58" height="7" rx="2" fill="${ref('brassH')}"/>`;
    g += `<path d="M-24 ${c + 146}C-20 ${c + 160} -6 ${c + 166} 0 ${c + 176}C6 ${c + 166} 20 ${c + 160} 24 ${c + 146}Z" fill="${ref('brassV')}"/>`;
    g += `<circle cy="${c + 181}" r="4" fill="${C.gold}"/><path d="M0 ${c + 185}V${c + 198}" stroke="${C.goldDk}" stroke-width="1.6"/>`;
    return g + '</g>';
  };
  let lanterns = '';
  F.lanternsFg.forEach(L => { lanterns += `<g transform="translate(${L.x} ${L.y}) scale(${L.k})">${lanternBody(L.chain, L.d, 1.15)}</g>`; });
  { const clips = {};
    F.lanternsDepth.forEach(L => {
      const pl = plane(L.clip); const cid = 'clip-' + L.clip;
      if (!clips[cid]) { def(cid, `<clipPath id="${P}${cid}"><path d="${openClosed(pl.sb)}"/></clipPath>`); clips[cid] = 1; }
      const k = L.s * 0.88, ceil = arch.ya - 30, chain = (L.Y - ceil) / 0.88;
      const inner = [-1, 1].map(sg => `<g transform="translate(${n1(vx + sg * L.X * L.s)} ${n1(vy + ceil * L.s)}) scale(${n2(k)})">${lanternBody(chain, L.d + (sg > 0 ? -1.7 : 0), 1)}</g>`).join('');
      lanterns += `<g clip-path="url(#${P}${cid})">${inner}</g>`;
    }); }
  // order: deeper lanterns first, foreground on top
  lanterns = `<g id="lanterns">${lanterns.replace(/^(.*?)(<g clip-path[\s\S]*)$/, '$2$1')}</g>`;

  /* ── #embers ── */
  def('ember', `<radialGradient id="${P}ember"><stop offset="0" stop-color="#FFF6D2"/><stop offset=".35" stop-color="${C.goldLt}" stop-opacity=".9"/><stop offset="1" stop-color="${C.gold}" stop-opacity="0"/></radialGradient>`);
  let embers = '';
  const src = [...diyaAt, ...F.lanternsFg.map(L => ({ x: L.x, y: L.y + (L.chain + 150) * L.k, k: 2.2 })), ...F.lanternsDepth.flatMap(L => [-1, 1].map(sg => ({ x: vx + sg * L.X * L.s, y: vy + (L.Y + 120) * L.s, k: 1.4 })))];
  const wsum = src.reduce((a, e) => a + Math.pow(e.k, 1.6), 0);
  const pick = () => { let r = R() * wsum; for (const e of src) { r -= Math.pow(e.k, 1.6); if (r <= 0) return e; } return src[0]; };
  for (let i = 0; i < F.embers; i++) {
    const e = pick(), sp = 40 * (e.k || 1);
    const x = e.x + (R() - 0.5) * sp * 2, y = e.y - R() * sp * 2.2;
    const r = (1.2 + R() * 2.2) * Math.sqrt(lw) * Math.min(1.4, 0.55 + e.k * 0.5), dx = ((R() - 0.5) * 60).toFixed(0), dy = -(120 + R() * 220).toFixed(0);
    const t = (7 + R() * 7).toFixed(1), dl = -(R() * 12).toFixed(1);
    embers += `<circle class="ember" cx="${n1(x)}" cy="${n1(y)}" r="${n1(r * 2.2)}" fill="${ref('ember')}" style="--dx:${dx}px;--dy:${dy}px;--t:${t}s;animation-delay:${dl}s"/>`;
  }
  embers = `<g id="embers">${embers}</g>`;

  /* ── grain (dither against banding) ── */
  def('grain', `<pattern id="${P}grain" width="96" height="96" patternUnits="userSpaceOnUse"><image width="96" height="96" href="data:image/png;base64,${NOISE}"/></pattern>`);
  const grain = `<rect id="grain" x="0" y="0" width="${W}" height="${H}" fill="${ref('grain')}"/>`;

  const layers = [
    { id: 'sky', svg: sky, depth: 0.02 }, { id: 'stars', svg: stars, depth: 0.03 }, { id: 'orb', svg: orb, depth: 0.04 },
    { id: 'floor', svg: floor, depth: 0.1 }, { id: 'arches-far', svg: archesFar, depth: 0.12 }, { id: 'arches-mid', svg: archesMid, depth: 0.28 },
    { id: 'jali', svg: jali, depth: 0.3 }, { id: 'arches-near', svg: archesNear, depth: 0.55 }, { id: 'table', svg: table, depth: 0.62 },
    { id: 'steam', svg: steam, depth: 0.66 }, { id: 'lanterns', svg: lanterns, depth: 0.8 }, { id: 'embers', svg: embers, depth: 1 },
  ];
  return { F, D, layers, grain };
}

/* ───────────────────────── output ───────────────────────── */
const STYLE = `<style>
.star{transform-box:fill-box;transform-origin:center;animation:cd-twinkle 4.5s ease-in-out infinite}
.lantern{transform-box:fill-box;transform-origin:50% 0;animation:cd-sway 7.5s ease-in-out infinite}
.lantern .glow{animation:cd-glow 3.4s ease-in-out infinite alternate}
.flame{transform-box:fill-box;transform-origin:50% 100%;animation:cd-flicker 1.6s ease-in-out infinite alternate}
.steam{animation:cd-rise 5.2s ease-in-out infinite;opacity:0}
.ember{animation:cd-float var(--t,9s) linear infinite;opacity:0}
.shimmer{stroke-dasharray:46 954;stroke-dashoffset:1000;animation:cd-sweep 12s cubic-bezier(.45,0,.55,1) infinite;opacity:0}
@keyframes cd-twinkle{0%,100%{opacity:.35;transform:scale(.72)}50%{opacity:1;transform:scale(1)}}
@keyframes cd-sway{0%,100%{transform:rotate(-1.1deg)}50%{transform:rotate(1.1deg)}}
@keyframes cd-glow{from{opacity:.72}to{opacity:1}}
@keyframes cd-flicker{0%{transform:scale(1,1)}40%{transform:scale(.94,1.08)}70%{transform:scale(1.05,.95)}100%{transform:scale(.97,1.04)}}
@keyframes cd-rise{0%{opacity:0;transform:translateY(10px)}30%{opacity:1}100%{opacity:0;transform:translateY(-34px)}}
@keyframes cd-float{0%{opacity:0;transform:translate(0,0)}12%{opacity:1}80%{opacity:.75}100%{opacity:0;transform:translate(var(--dx,0),var(--dy,-200px))}}
@keyframes cd-sweep{0%{stroke-dashoffset:1000;opacity:0}8%{opacity:.9}50%{opacity:.9}58%,100%{stroke-dashoffset:0;opacity:0}}
@media (prefers-reduced-motion:reduce){.star,.lantern,.lantern .glow,.flame,.steam,.ember,.shimmer{animation:none!important}.steam{opacity:.7}.ember{opacity:.6}.shimmer{opacity:0}}
</style>`;

function collectDefs(D, content) {
  const need = new Set(), queue = [content];
  while (queue.length) { const c = queue.pop(); const re = /url\(#([\w-]+)\)|href="#([\w-]+)"/g; let m;
    while ((m = re.exec(c))) { const id = m[1] || m[2]; if (!need.has(id) && D[id]) { need.add(id); queue.push(D[id]); } } }
  return [...need].map(id => D[id]).join('');
}
function svgDoc(F, D, body, opts = {}) {
  const defs = collectDefs(D, body);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${F.W} ${F.H}" width="${F.W}" height="${F.H}" aria-hidden="true" focusable="false">`
    + `<defs>${defs}</defs>${opts.animated ? STYLE.replace(/\n/g, '') : ''}${body}</svg>`;
}
const stripAnim = s => s.replace(/<path class="shimmer"[^>]*\/>/g, '').replace(/ style="[^"]*"/g, '').replace(/ class="(star|ember|steam|flame|lantern|glow)"/g, '');

const report = [];
function write(rel, content) { const p = path.join(OUT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, content);
  report.push(`${(Buffer.byteLength(content) / 1024).toFixed(1).padStart(7)} KB  ${rel}`); }

const manifest = { scene: 'Royal · The Palace Dining Room at Dusk', order: 'back-to-front', formats: {} };
for (const F of [LAND, PORT]) {
  const { D, layers, grain } = build(F);
  const body = layers.map(l => l.svg).join('') + grain;
  write(`hero-${F.name}.svg`, svgDoc(F, D, body, { animated: true }));
  if (F === LAND) write(`hero-landscape-static.svg`, svgDoc(F, D, stripAnim(body)));
  if (F === PORT) write(`hero-portrait-static.svg`, svgDoc(F, D, stripAnim(body)));
  manifest.formats[F.name] = { viewBox: `0 0 ${F.W} ${F.H}`, layers: [] };
  layers.forEach((l, i) => { const file = `layers/${F.name}/${String(i + 1).padStart(2, '0')}-${l.id}.svg`;
    write(file, svgDoc(F, D, l.svg, { animated: true })); manifest.formats[F.name].layers.push({ id: l.id, file, depth: l.depth }); });
  const gfile = `layers/${F.name}/13-grain.svg`; write(gfile, svgDoc(F, D, grain));
  manifest.formats[F.name].overlay = { id: 'grain', file: gfile, note: 'optional anti-banding dither, place on top, no parallax' };
}
manifest.parallax = 'translate each layer by depth × pointer/scroll offset (0 = static sky, 1 = foreground embers); keep max shift ≈ 1.5% of width';
write('layers/manifest.json', JSON.stringify(manifest, null, 2));

/* ── arch-frame mask (window for dish art) ── */
{
  const w = 200, Hh = 600, a = { w, ys: 250, ya: 10, yf: Hh, n: 4, lobeK: 0.56, apexFrac: 0.16, tipK: 0.2 };
  // normalise so the tip sits exactly at y = 0
  const segs = archSegs(a); const minY = Math.min(...sampleSegs(segs, 12).map(p => p[1])); const segsN = segs.map(s => ({ ...s, y: s.y - minY }));
  const d = pd(segsN, 1, w, 0) + 'Z';
  write('arch-frame.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 ${n1(Hh - minY)}" width="400" height="${n1(Hh - minY)}" preserveAspectRatio="none"><path d="${d}" fill="#fff"/></svg>`);
  const vbH = Hh - minY;
  write('arch-frame-trim.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 416 ${n1(vbH + 16)}" width="416" height="${n1(vbH + 16)}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.goldDk}"/><stop offset=".38" stop-color="${C.goldLt}"/><stop offset=".6" stop-color="${C.gold}"/><stop offset="1" stop-color="${C.goldDk}"/></linearGradient></defs><path d="${d}" fill="none" stroke="url(#g)" stroke-width="3" vector-effect="non-scaling-stroke"/><path d="${pd(archSegs({ ...a, w: w - 12, ys: a.ys + 6, ya: a.ya + 14, yf: Hh - 12 }).map(s => ({ ...s, y: s.y - minY })), 1, w, 0)}Z" fill="none" stroke="${C.goldLt}" stroke-opacity=".55" stroke-width="1.2" vector-effect="non-scaling-stroke"/></svg>`);
  const pts = sampleSegs(segsN, 10).map(([x, y]) => `${n2((w + x) / 400 * 100)}% ${n2(y / vbH * 100)}%`);
  // objectBoundingBox path (non-uniform: x/400, y/vbH) → sampled polygon, exact enough at any size
  const obb = 'M' + sampleSegs(segsN, 10).map(([x, y]) => `${n2((w + x) / 400 * 1000) / 1000} ${n2(y / vbH * 1000) / 1000}`).join('L') + 'Z';
  write('arch-frame.css', `/* Curry District · Royal — arch-window crop for dish art.
   Option A (mask image, crisp at any size):   <div class="cd-arch"><img src="dish.jpg" alt="…"></div>
   Option B (pure CSS, no extra file):          add .cd-arch--clip instead of .cd-arch
   Option C (inline SVG clipPath):              see #cd-arch-clip below — clip-path:url(#cd-arch-clip)
   Optional gold trim overlay: wrap in .cd-arch-frame (uses arch-frame-trim.svg). Aspect ratio = 400 / ${n1(vbH)}. */
.cd-arch, .cd-arch--clip { position: relative; aspect-ratio: 400 / ${n1(vbH)}; overflow: hidden; }
.cd-arch > img, .cd-arch--clip > img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cd-arch {
  -webkit-mask: url(arch-frame.svg) center / 100% 100% no-repeat;
          mask: url(arch-frame.svg) center / 100% 100% no-repeat;
}
.cd-arch--clip {
  clip-path: polygon(${pts.join(', ')});
}
/* gold trim: wrap the window — <div class="cd-arch-frame"><div class="cd-arch">…</div></div> (a mask would clip a child overlay) */
.cd-arch-frame { position: relative; }
.cd-arch-frame::after { content: ""; position: absolute; inset: -${n2(8 / vbH * 100)}% -2%; background: url(arch-frame-trim.svg) center / 100% 100% no-repeat; pointer-events: none; }

/* Option C — paste once into the page:
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><clipPath id="cd-arch-clip" clipPathUnits="objectBoundingBox"><path d="${obb}"/></clipPath></svg>
   then: .my-dish { clip-path: url(#cd-arch-clip); }
*/
`);
}

/* ── demo dish art: overhead thali (used to show the arch mask) ── */
{
  const R = rng(5); const cx = 300, cy = 505;
  const kat = [
    ['#F06A3E', '#C83A2E', '#7A1228', 'swirl'], ['#FFE08E', '#F0A934', '#B8641C', 'dots'], ['#6DBB6A', '#2E7D4F', '#124A35', 'swirl'],
    ['#FFFFFA', '#F2E6CC', '#CDB48A', 'flecks'], ['#E9A86A', '#B8642E', '#6E3214', 'dots'], ['#7A2A1E', '#4A140E', '#2A0806', 'balls']];
  let g = '';
  kat.forEach(([a, b, c, t], i) => {
    const ang = (-90 + i * 60) * Math.PI / 180, x = cx + Math.cos(ang) * 152, y = cy + Math.sin(ang) * 152;
    g += `<radialGradient id="k${i}" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>`;
    let top = `<circle cx="${n1(x + 4)}" cy="${n1(y + 7)}" r="52" fill="#2A1206" opacity=".45"/><circle cx="${n1(x)}" cy="${n1(y)}" r="52" fill="url(#br)"/><circle cx="${n1(x)}" cy="${n1(y)}" r="43" fill="url(#k${i})"/><circle cx="${n1(x)}" cy="${n1(y)}" r="51" fill="none" stroke="#F7D98A" stroke-width="1.5"/>`;
    if (t === 'swirl') top += `<path d="M${n1(x - 24)} ${n1(y + 4)}C${n1(x - 10)} ${n1(y - 20)} ${n1(x + 12)} ${n1(y + 18)} ${n1(x + 26)} ${n1(y - 6)}" fill="none" stroke="#FFF4DF" stroke-opacity=".8" stroke-width="4" stroke-linecap="round"/>`;
    if (t === 'dots') for (let k = 0; k < 9; k++) top += `<circle cx="${n1(x + (R() - .5) * 52)}" cy="${n1(y + (R() - .5) * 52)}" r="${n1(2 + R() * 2.5)}" fill="#5A1E0E" opacity=".55"/>`;
    if (t === 'flecks') for (let k = 0; k < 10; k++) top += `<ellipse cx="${n1(x + (R() - .5) * 50)}" cy="${n1(y + (R() - .5) * 50)}" rx="3" ry="1.4" fill="#3FA34D" transform="rotate(${Math.floor(R() * 180)} ${n1(x)} ${n1(y)})"/>`;
    if (t === 'balls') for (const [dx, dy] of [[-12, -10], [13, -6], [-2, 14]]) top += `<circle cx="${x + dx}" cy="${y + dy}" r="15" fill="url(#gj)"/><circle cx="${x + dx - 5}" cy="${y + dy - 6}" r="4" fill="#FFE4B0" opacity=".45"/>`;
    g += top;
  });
  let petals = ''; for (let i = 0; i < 26; i++) { const a = R() * Math.PI * 2, rr = 300 + R() * 130; const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 1.1;
    petals += `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(7 + R() * 6)}" ry="${n1(4 + R() * 3)}" fill="${R() < .5 ? '#FFB000' : '#F08A1C'}" opacity=".9" transform="rotate(${Math.floor(R() * 180)} ${n1(x)} ${n1(y)})"/>`; }
  const dish = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 860" width="600" height="860" aria-hidden="true"><defs>`
    + `<radialGradient id="bg" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#5C2664"/><stop offset=".6" stop-color="#2E1240"/><stop offset="1" stop-color="#140A22"/></radialGradient>`
    + `<radialGradient id="br" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FBE3A0"/><stop offset=".45" stop-color="${C.gold}"/><stop offset="1" stop-color="#7A4614"/></radialGradient>`
    + `<radialGradient id="wl" cx=".45" cy=".4" r=".65"><stop offset="0" stop-color="#E9B460"/><stop offset=".75" stop-color="#B07424"/><stop offset="1" stop-color="#6E3E10"/></radialGradient>`
    + `<radialGradient id="rc" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#FFFFF8"/><stop offset=".7" stop-color="#F3E3C2"/><stop offset="1" stop-color="#D0B07A"/></radialGradient>`
    + `<radialGradient id="nn" cx=".4" cy=".4" r=".7"><stop offset="0" stop-color="#FFE7BF"/><stop offset=".6" stop-color="#E5AA6C"/><stop offset="1" stop-color="#A9622C"/></radialGradient>`
    + `<radialGradient id="gj" cx=".38" cy=".35" r=".7"><stop offset="0" stop-color="#B0522A"/><stop offset="1" stop-color="#3A0E06"/></radialGradient>`
    + `<pattern id="jl" width="28" height="28" patternUnits="userSpaceOnUse"><g fill="none" stroke="${C.goldLt}" stroke-width=".8"><circle r="14"/><circle cx="28" r="14"/><circle cy="28" r="14"/><circle cx="28" cy="28" r="14"/><circle cx="14" cy="14" r="14"/></g></pattern>`
    + g.match(/<radialGradient id="k\d"[\s\S]*?<\/radialGradient>/g).join('') + `</defs>`
    + `<rect width="600" height="860" fill="url(#bg)"/><rect width="600" height="860" fill="url(#jl)" opacity=".07"/>${petals}`
    + `<circle cx="${cx + 8}" cy="${cy + 14}" r="250" fill="#0A0414" opacity=".5"/><circle cx="${cx}" cy="${cy}" r="248" fill="url(#br)"/><circle cx="${cx}" cy="${cy}" r="226" fill="url(#wl)"/><circle cx="${cx}" cy="${cy}" r="246" fill="none" stroke="#FFF1C9" stroke-opacity=".7" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="226" fill="none" stroke="#7A4614" stroke-width="2"/>`
    + g.replace(/<radialGradient id="k\d"[\s\S]*?<\/radialGradient>/g, '')
    + `<ellipse cx="${cx - 18}" cy="${cy - 8}" rx="74" ry="64" fill="url(#rc)"/>${Array.from({ length: 14 }, () => { const x = cx - 18 + (R() - .5) * 100, y = cy - 8 + (R() - .5) * 80; return `<path d="M${n1(x)} ${n1(y)}l${n1(6 + R() * 6)} ${n1((R() - .5) * 6)}" stroke="#F0A934" stroke-width="2" stroke-linecap="round"/>`; }).join('')}`
    + `<path d="M${cx + 20} ${cy + 30}C${cx + 80} ${cy + 6} ${cx + 132} ${cy + 52} ${cx + 118} ${cy + 96}C${cx + 104} ${cy + 136} ${cx + 44} ${cy + 128} ${cx + 22} ${cy + 92}C${cx + 6} ${cy + 66} ${cx + 4} ${cy + 40} ${cx + 20} ${cy + 30}Z" fill="url(#nn)"/>${[[60, 60], [86, 80], [74, 100], [44, 84], [96, 56]].map(([dx, dy]) => `<ellipse cx="${cx + dx}" cy="${cy + dy}" rx="5" ry="3.5" fill="#7A3A12" opacity=".55"/>`).join('')}`
    + `<path d="M${cx - 96} ${cy + 70}C${cx - 70} ${cy + 96} ${cx - 34} ${cy + 104} ${cx - 8} ${cy + 96}" fill="none" stroke="#2E8B3E" stroke-width="9" stroke-linecap="round"/><circle cx="${cx - 66}" cy="${cy + 112}" r="22" fill="#C9E46A"/><circle cx="${cx - 66}" cy="${cy + 112}" r="17" fill="#E8F59A"/><path d="M${cx - 66} ${cy + 95}V${cy + 129}M${cx - 83} ${cy + 112}H${cx - 49}M${cx - 78} ${cy + 100}L${cx - 54} ${cy + 124}M${cx - 54} ${cy + 100}L${cx - 78} ${cy + 124}" stroke="#C9E46A" stroke-width="1.6"/>`
    + `</svg>`;
  write('demo-dish.svg', dish);
}

console.log(report.join('\n'));

// Curry District · drinks + catering packaging — shared SVG helpers (Node, build-time only)
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
export const ROOT = '/home/user/playground';
export const BRAND = ROOT + '/brand';
export const OUT = ROOT + '/hub/packaging/assets/cups';
export const SCR = '/tmp/claude-0/-home-user-playground/daae35f2-3bb9-5abe-8c86-175861b9361b/scratchpad';
const require = createRequire(SCR + '/package.json');
const subsetFont = require('subset-font');

/* ───────── palettes ───────── */
export const BZ = { ink: '#1D1147', cream: '#FFF4DC', marigold: '#FFB000', saffron: '#FF6A13', rani: '#E4147E', chili: '#D62839', peacock: '#00A8A0', cilantro: '#3FA34D', violet: '#7B5CFF', sand: '#FFE7B8', muted: '#5B4F85', clay: '#C2552B', clayDk: '#9E3F1E', clayLt: '#D9774A' };
export const RY = { ink: '#160B26', plum: '#4B1D52', emerald: '#0F4D3F', peacock: '#117C86', ruby: '#A3173F', gold: '#E9A63A', goldLt: '#F7D98A', goldDk: '#B7791F', ivory: '#FBF3E4', blush: '#F4C9BB', parch: '#F3E4C8', muted: '#6B5A73', clay: '#9A3A24', clayDk: '#6E2516', clayLt: '#B65334' };

/* dish zones — exact names from data/menu.json meta.zones */
const menu = JSON.parse(fs.readFileSync(ROOT + '/data/menu.json', 'utf8'));
export const ZONES = Object.fromEntries(menu.meta.zones.map(z => [z.id, z]));
export const ZONE_COLOURS = {
  bazaar: { starters: BZ.rani, tandoor: BZ.chili, curry: BZ.saffron, biryani: BZ.peacock, indochinese: BZ.cilantro, bread: BZ.marigold, sweets: BZ.violet, chai: BZ.ink },
  royal: { starters: RY.peacock, tandoor: RY.ruby, curry: RY.goldDk, biryani: RY.emerald, indochinese: RY.ink, bread: RY.plum, sweets: '#C9787A', chai: RY.plum },
};
export const ZONE_ICON = { starters: 'samosa', tandoor: 'tandoor-oven', curry: 'curry-bowl', biryani: 'biryani-pot-handi', indochinese: 'chaat-plate', bread: 'naan', sweets: 'gulab-jamun', chai: 'chai-cup' };

/* ───────── brand SVG inlining ───────── */
let uid = 0;
export function readBrand(rel) { return fs.readFileSync(path.join(BRAND, rel), 'utf8'); }
function prefixIds(svg, p) {
  const ids = new Set([...svg.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
  svg = svg.replace(/\bid="([^"]+)"/g, (m, id) => `id="${p}${id}"`);
  svg = svg.replace(/url\(#([^)]+)\)/g, (m, id) => ids.has(id) ? `url(#${p}${id})` : m);
  svg = svg.replace(/(xlink:href|href)="#([^"]+)"/g, (m, a, id) => ids.has(id) ? `${a}="#${p}${id}"` : m);
  svg = svg.replace(/\saria-[a-z]+="[^"]*"/g, '').replace(/\srole="[^"]*"/g, '');
  return svg;
}
const cache = new Map();
export function parseSvg(rel) {
  if (cache.has(rel)) return cache.get(rel);
  let s = readBrand(rel).replace(/<\?xml[^>]*>/, '').replace(/<!--[\s\S]*?-->/g, '');
  const open = s.match(/<svg\b[^>]*>/)[0];
  let vb = (open.match(/viewBox="([^"]+)"/) || [])[1];
  if (!vb) vb = `0 0 ${open.match(/width="([\d.]+)/)[1]} ${open.match(/height="([\d.]+)/)[1]}`;
  let inner = s.slice(s.indexOf(open) + open.length, s.lastIndexOf('</svg>'));
  inner = inner.replace(/<title[\s\S]*?<\/title>/g, '').replace(/<desc[\s\S]*?<\/desc>/g, '');
  // carry presentation attrs from root <svg> (icons set fill/stroke defaults there)
  const carry = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin']
    .map(a => { const m = open.match(new RegExp(`\\s${a}="([^"]+)"`)); return m ? ` ${a}="${m[1]}"` : ''; }).join('');
  const r = { vb: vb.trim().split(/[\s,]+/).map(Number), inner, carry };
  cache.set(rel, r);
  return r;
}
export function aspect(rel) { const { vb } = parseSvg(rel); return vb[2] / vb[3]; }
/** place a brand SVG in a box (x,y = top-left) */
export function place(rel, { x = 0, y = 0, w, h, align = 'xMidYMid meet', opacity, extra = '' } = {}) {
  const { vb, inner, carry } = parseSvg(rel);
  const p = `b${(uid++).toString(36)}_`;
  if (w == null) w = h * vb[2] / vb[3];
  if (h == null) h = w * vb[3] / vb[2];
  return `<svg x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" viewBox="${vb.join(' ')}" preserveAspectRatio="${align}" overflow="visible"${carry}${opacity != null ? ` opacity="${opacity}"` : ''} ${extra}>${prefixIds(inner, p)}</svg>`;
}
/** place centred at (cx,cy) with width w (or height h) */
export function placeC(rel, cx, cy, { w, h, ...o } = {}) {
  const a = aspect(rel);
  if (w == null) w = h * a; if (h == null) h = w / a;
  return place(rel, { x: cx - w / 2, y: cy - h / 2, w, h, ...o });
}
/** seamless brand tile as <pattern> */
export function patternDef(rel, id, { size = 40, rotate = 0, x = 0, y = 0 } = {}) {
  const { vb, inner } = parseSvg(rel);
  const w = size, h = size * vb[3] / vb[2];
  return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${f(w)}" height="${f(h)}" x="${f(x)}" y="${f(y)}"${rotate ? ` patternTransform="rotate(${rotate})"` : ''}><svg width="${f(w)}" height="${f(h)}" viewBox="${vb.join(' ')}" overflow="hidden">${prefixIds(inner, id + '_')}</svg></pattern>`;
}

/* ───────── text ───────── */
export const f = n => (Math.round(n * 100) / 100).toString();
export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const FONT = {
  bowlby: `font-family="Bowlby One" font-weight="400"`,
  dm: w => `font-family="DM Sans" font-weight="${w || 500}"`,
  caveat: w => `font-family="Caveat" font-weight="${w || 700}"`,
  fr: (w, it) => `font-family="Fraunces" font-weight="${w || 600}"${it ? ' font-style="italic"' : ''}`,
  hk: w => `font-family="Hanken Grotesk" font-weight="${w || 500}"`,
};
/** text: opts {font, size, fill, anchor, ls (letter-spacing), extra, upper} */
export function T(x, y, str, { font = FONT.dm(), size = 10, fill = '#000', anchor = 'middle', ls, extra = '', upper, lenAdj } = {}) {
  const s = upper ? String(str).toUpperCase() : str;
  return `<text x="${f(x)}" y="${f(y)}" ${font} font-size="${f(size)}" fill="${fill}" text-anchor="${anchor}"${ls != null ? ` letter-spacing="${f(ls)}"` : ''}${lenAdj ? ` textLength="${f(lenAdj)}" lengthAdjust="spacingAndGlyphs"` : ''} ${extra}>${esc(s)}</text>`;
}
/** Bazaar sticker text: hard offset shadow + indigo outline */
export function stickerText(x, y, str, { size, fill = BZ.cream, shadow = BZ.ink, stroke = BZ.ink, sw, dx, dy, anchor = 'middle', ls = 0, lenAdj } = {}) {
  sw = sw ?? size * 0.11; dx = dx ?? size * 0.07; dy = dy ?? size * 0.07;
  const base = { font: FONT.bowlby, size, anchor, ls, lenAdj };
  return T(x + dx, y + dy, str, { ...base, fill: shadow, extra: `stroke="${shadow}" stroke-width="${f(sw)}" stroke-linejoin="round"` }) +
    T(x, y, str, { ...base, fill, extra: `stroke="${stroke}" stroke-width="${f(sw)}" stroke-linejoin="round" paint-order="stroke"` });
}
/** gold foil gradient def */
export function foilDef(id, x1 = 0, y1 = 0, x2 = 1, y2 = 1) {
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="#B7791F"/><stop offset=".38" stop-color="#F7D98A"/><stop offset=".58" stop-color="#E9A63A"/><stop offset="1" stop-color="#B7791F"/></linearGradient>`;
}

/* ───────── geometry helpers ───────── */
export const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
export function arcPath(cx, cy, r, a0, a1) { // angles in degrees, 0 = up, clockwise
  const p = a => [cx + r * Math.sin(rad(a)), cy - r * Math.cos(rad(a))];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${f(x0)} ${f(y0)}A${f(r)} ${f(r)} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${f(x1)} ${f(y1)}`;
}
export function sectorPath(cx, cy, r0, r1, a0, a1) { // annular sector, r1 outer
  const p = (r, a) => [cx + r * Math.sin(rad(a)), cy - r * Math.cos(rad(a))];
  const [ax, ay] = p(r1, a0), [bx, by] = p(r1, a1), [cx2, cy2] = p(r0, a1), [dx, dy] = p(r0, a0);
  const lg = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M${f(ax)} ${f(ay)}A${f(r1)} ${f(r1)} 0 ${lg} 1 ${f(bx)} ${f(by)}L${f(cx2)} ${f(cy2)}A${f(r0)} ${f(r0)} 0 ${lg} 0 ${f(dx)} ${f(dy)}Z`;
}
export function roundRect(x, y, w, h, r) { return `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(r)}"/>`; }
/** scalloped circle path */
export function scallopCircle(cx, cy, r, n, depth) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * 2 * Math.PI, a1 = ((i + 1) / n) * 2 * Math.PI, am = (a0 + a1) / 2;
    const p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)], p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
    const c = [cx + (r + depth * 2) * Math.cos(am), cy + (r + depth * 2) * Math.sin(am)];
    d += (i ? '' : `M${f(p0[0])} ${f(p0[1])}`) + `Q${f(c[0])} ${f(c[1])} ${f(p1[0])} ${f(p1[1])}`;
  }
  return d + 'Z';
}
/** scalloped edge along a horizontal line: returns path for a band whose bottom edge is scalloped */
export function scallopBand(x0, x1, yTop, yEdge, n, depth, down = true) {
  const w = (x1 - x0) / n; let d = `M${f(x0)} ${f(yTop)}L${f(x1)} ${f(yTop)}L${f(x1)} ${f(yEdge)}`;
  for (let i = n - 1; i >= 0; i--) { const xa = x0 + (i + 1) * w, xb = x0 + i * w; d += `Q${f((xa + xb) / 2)} ${f(yEdge + (down ? 2 : -2) * depth)} ${f(xb)} ${f(yEdge)}`; }
  return d + 'Z';
}

/* ───────── rect art → annular sector (vector strip warp; how the flat cup print really looks) ───────── */
export function sectorWarp({ artId, W, H, L1, L2, Phi, N = 180, cx = 0, cy = 0 }) {
  const dpsi = Phi / N, rm = (L1 + L2) / 2, k = (L1 - L2) / H;
  const sx = rm * dpsi / (W / N);
  const gap = (L1 - rm) * dpsi / sx; // widen clip so the fan never shows hairlines
  let defs = '', body = '';
  for (let i = 0; i < N; i++) {
    const xa = i * W / N, xb = (i + 1) * W / N, xc = (xa + xb) / 2;
    const psi = -Phi / 2 + (i + 0.5) * dpsi;
    // masks (not clip-paths): clip AA is applied per primitive in Chromium and leaks under-layers at seams
    defs += `<mask id="${artId}c${i}" maskUnits="userSpaceOnUse" x="${f(-W)}" y="${f(-H)}" width="${f(3 * W)}" height="${f(3 * H)}"><rect x="${f(xa - gap)}" y="-1" width="${f(xb - xa + 2 * gap)}" height="${f(H + 2)}" fill="#fff"/></mask>`;
    body += `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${(deg(psi)).toFixed(4)}) translate(0 ${f(-L1)}) scale(${sx.toFixed(5)} ${k.toFixed(5)}) translate(${f(-xc)} 0)"><use href="#${artId}" mask="url(#${artId}c${i})"/></g>`;
  }
  return { defs, body };
}
/** frustum geometry for a cup band: returns rect W,H and sector params */
export function frustum({ Rtop, Rbot, h }) {
  const s = Math.hypot(h, Rtop - Rbot);
  const L1 = Rtop * s / (Rtop - Rbot), L2 = Rbot * s / (Rtop - Rbot);
  const Phi = 2 * Math.PI * Rtop / L1;
  return { s, L1, L2, Phi, W: Math.PI * (Rtop + Rbot), H: s };
}

/* ───────── fonts: subset + embed so every SVG renders standalone ───────── */
const FF = BRAND + '/fonts/';
const FONTFILES = [
  { fam: 'Bowlby One', style: 'normal', w: '400', file: 'taiPGmVuC4y96PFeqp8sqomI_A.woff2' },
  { fam: 'Caveat', style: 'normal', w: '400 700', file: 'Wnz6HAc5bAfYB2Q7ZjYY.woff2' },
  { fam: 'DM Sans', style: 'normal', w: '100 1000', file: 'rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K4.woff2' },
  { fam: 'Fraunces', style: 'normal', w: '100 900', file: '6NUu8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib14c7qv8.woff2' },
  { fam: 'Fraunces', style: 'italic', w: '100 900', file: '6NUs8FyLNQOQZAnv9ZwNjucMHVn85Ni7emAe9lKqZTnbB-gzTK0K1ChJdt9vIVYX9G37lvd9mv0iQg.woff2' },
  { fam: 'Hanken Grotesk', style: 'normal', w: '100 900', file: 'ieVn2YZDLWuGJpnzaiwFXS9tYtpd59A.woff2' },
];
function decode(s) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(+d));
}
export async function embedFonts(svg) {
  const texts = decode([...svg.matchAll(/<(?:text|tspan|textPath)\b[^>]*>([^<]*)/g)].map(m => m[1]).join('')) + ' 0123456789.,';
  const chars = [...new Set(texts)].join('');
  let css = '';
  for (const ff of FONTFILES) {
    if (!svg.includes(`font-family="${ff.fam}"`)) continue;
    if (ff.style === 'italic' && !/font-style="italic"/.test(svg)) continue;
    if (ff.fam === 'Fraunces' && ff.style === 'normal' && !/font-family="Fraunces"(?![^>]*font-style="italic")/.test(svg)) continue;
    const buf = await subsetFont(fs.readFileSync(FF + ff.file), chars, { targetFormat: 'woff2' });
    css += `@font-face{font-family:'${ff.fam}';font-style:${ff.style};font-weight:${ff.w};src:url(data:font/woff2;base64,${buf.toString('base64')}) format('woff2')}`;
  }
  return svg.replace(/<defs>/, `<defs><style>${css}</style>`);
}
export function svgDoc({ w, h, units = 'mm', title, desc, defs = '', body, vb }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${f(w)}${units}" height="${f(h)}${units}" viewBox="${vb || `0 0 ${f(w)} ${f(h)}`}"><title>${esc(title || 'Curry District concept artwork')}</title>${desc ? `<desc>${esc(desc)}</desc>` : ''}<defs>${defs}</defs>${body}</svg>`;
}
export async function writeSvg(file, svg) {
  const out = await embedFonts(svg);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, out);
  return out.length;
}
export const DISCLAIMER = 'Independent design concept prepared as a proposal — not official Curry District material.';

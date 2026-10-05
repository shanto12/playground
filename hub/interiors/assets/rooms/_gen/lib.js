/* Curry District · Rooms generator — shared helpers.
   Pure Node (no deps). Brand assets are read IN PLACE from /brand so a re-run picks up sibling updates. */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../../../..');           // /home/user/playground
const BRAND = path.join(ROOT, 'brand');

/* ── palettes (hex values copied from brand/tokens.css) ── */
const BZ = { ink: '#1D1147', cream: '#FFF4DC', marigold: '#FFB000', saffron: '#FF6A13', rani: '#E4147E', chili: '#D62839',
  peacock: '#00A8A0', cilantro: '#3FA34D', violet: '#7B5CFF', cream2: '#FFE7B8', muted: '#5B4F85' };
const RY = { ink: '#160B26', aub: '#2A1240', plum: '#4B1D52', emerald: '#0F4D3F', peacock: '#117C86', ruby: '#A3173F',
  gold: '#E9A63A', goldLt: '#F7D98A', goldDk: '#B7791F', ivory: '#FBF3E4', blush: '#F4C9BB', sand: '#F3E4C8', muted: '#6B5A73' };

/* ── colour maths ── */
function rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function hex(r, g, b) { return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase(); }
function mix(a, b, t) { const A = rgb(a), B = rgb(b); return hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }
function shade(c, t) { return t < 0 ? mix(c, '#000000', -t) : mix(c, '#FFFFFF', t); }
function lum(c) { const a = rgb(c).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]; }
function contrast(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }

/* ── tiny svg helpers ── */
const n = (v) => Math.round(v * 10) / 10;
function attrs(o) { return Object.keys(o).filter((k) => o[k] !== undefined && o[k] !== null && o[k] !== false).map((k) => `${k}="${o[k]}"`).join(' '); }
function h(tag, o, inner) { return inner === undefined ? `<${tag} ${attrs(o || {})}/>` : `<${tag} ${attrs(o || {})}>${inner}</${tag}>`; }
function pts(arr) { return arr.map((p) => n(p[0]) + ',' + n(p[1])).join(' '); }
function poly(arr, o) { return h('polygon', Object.assign({ points: pts(arr) }, o)); }
function pathFrom(arr, close = true) { return 'M' + arr.map((p) => n(p[0]) + ' ' + n(p[1])).join('L') + (close ? 'Z' : ''); }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

/* seeded RNG */
function rng(seed) { let a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ── one-point "flat perspective" camera ──
   World units: feet. X along the back wall (0 = left corner), Y up from floor, Z out from the back wall toward the viewer.
   k = px per foot ON the back wall; D = camera distance from wall (ft); E = eye height (ft); hY = horizon y; camX = camera X. */
class Cam {
  constructor(o) { Object.assign(this, { W: 1920, H: 1080, k: 76, D: 20, E: 5.2, hY: 453, camX: 8.68 }, o); this.f = this.k * this.D; }
  s(Z) { return this.f / (this.D - Z); }
  p(X, Y, Z) { const s = this.s(Z); return [this.W / 2 + (X - this.camX) * s, this.hY - (Y - this.E) * s]; }
  /* billboard group transform: local units are INCHES, +y down, origin on the floor at (X, Z) */
  bb(X, Z, Y = 0) { const q = this.p(X, Y, Z); return `translate(${n(q[0])} ${n(q[1])}) scale(${(this.s(Z) / 12).toFixed(4)})`; }
  /* projected horizontal quad at height Y spanning X0..X1, Z0..Z1 */
  quadY(X0, X1, Z0, Z1, Y) { return [this.p(X0, Y, Z0), this.p(X1, Y, Z0), this.p(X1, Y, Z1), this.p(X0, Y, Z1)]; }
  /* projected horizontal ellipse (as polygon points) */
  ellY(X, Z, rx, rz, Y, seg = 36) { const o = []; for (let i = 0; i < seg; i++) { const a = i / seg * Math.PI * 2; o.push(this.p(X + Math.cos(a) * rx, Y, Z + Math.sin(a) * rz)); } return o; }
}

/* ── pattern tiles (read in place) ── */
const tileCache = {};
function tile(dir, file) {
  const key = dir + '/' + file;
  if (tileCache[key]) return tileCache[key];
  const fp = path.join(BRAND, 'patterns', dir, file);
  const src = fs.readFileSync(fp, 'utf8');
  const vb = /viewBox="([\d.\s-]+)"/.exec(src)[1].trim().split(/\s+/).map(Number);
  const bgm = /<\/defs>\s*<rect[^>]*fill="(#[0-9A-Fa-f]{3,6})"/.exec(src) || /<rect[^>]*width="(?:240|320)"[^>]*fill="(#[0-9A-Fa-f]{3,6})"/.exec(src);
  const t = { dir, file, path: fp, px: vb[2], bg: bgm ? bgm[1].toUpperCase() : '#888888',
    uri: 'data:image/svg+xml;base64,' + Buffer.from(src).toString('base64'), mtime: fs.statSync(fp).mtimeMs };
  tileCache[key] = t;
  return t;
}
function tileExists(dir, file) { return fs.existsSync(path.join(BRAND, 'patterns', dir, file)); }
function listTiles(dir) { return fs.readdirSync(path.join(BRAND, 'patterns', dir)).filter((f) => /^\d\d-.*\.svg$/.test(f)).sort(); }

/* ── fonts embedded as base64 so every downloadable SVG is self-contained ── */
const FONT_FILES = {
  bowlby: ['Bowlby One', 'normal', '400', 'taiPGmVuC4y96PFeqp8sqomI_A.woff2'],
  dmsans: ['DM Sans', 'normal', '100 900', 'rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K4.woff2'],
  caveat: ['Caveat', 'normal', '400 700', 'Wnz6HAc5bAfYB2Q7ZjYY.woff2'],
  fraunces: ['Fraunces', 'normal', '100 900', '6NUu8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib14c7qv8.woff2'],
  frauncesI: ['Fraunces', 'italic', '100 900', '6NUs8FyLNQOQZAnv9ZwNjucMHVn85Ni7emAe9lKqZTnbB-gzTK0K1ChJdt9vIVYX9G37lvd9mv0iQg.woff2'],
  hanken: ['Hanken Grotesk', 'normal', '100 900', 'ieVn2YZDLWuGJpnzaiwFXS9tYtpd59A.woff2'],
};
const fontCache = {};
function fontCSS(keys) {
  return keys.map((k) => {
    if (!fontCache[k]) {
      const f = FONT_FILES[k];
      const b64 = fs.readFileSync(path.join(BRAND, 'fonts', f[3])).toString('base64');
      fontCache[k] = `@font-face{font-family:'${f[0]}';font-style:${f[1]};font-weight:${f[2]};src:url(data:font/woff2;base64,${b64}) format('woff2');}`;
    }
    return fontCache[k];
  }).join('');
}
const FONTS = {
  bazaar: { display: "'Bowlby One','Arial Black',sans-serif", body: "'DM Sans',system-ui,sans-serif", accent: "'Caveat',cursive", keys: ['bowlby', 'dmsans', 'caveat'] },
  royal: { display: "'Fraunces',Georgia,serif", body: "'Hanken Grotesk',system-ui,sans-serif", accent: "'Fraunces',Georgia,serif", keys: ['fraunces', 'frauncesI', 'hanken'] },
  both: { display: "'Fraunces',Georgia,serif", body: "'Hanken Grotesk',system-ui,sans-serif", accent: "'Caveat',cursive", keys: ['fraunces', 'frauncesI', 'hanken', 'bowlby', 'dmsans', 'caveat'] },
};

/* svg document wrapper */
function doc(W, H, defs, body, opts = {}) {
  const fonts = opts.fonts ? `<style>${fontCSS(opts.fonts)}</style>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">` +
    (opts.title ? `<title>${esc(opts.title)}</title>` : '') +
    `<desc>Curry District · Brand Glow-Up concept artwork (original). Illustrative only — independent design concept, not the official Curry District website.</desc>` +
    `<defs>${fonts}${defs}</defs>${body}</svg>`;
}

module.exports = { ROOT, BRAND, BZ, RY, rgb, hex, mix, shade, lum, contrast, n, h, attrs, pts, poly, pathFrom, esc, rng, Cam, tile, tileExists, listTiles, fontCSS, FONTS, doc };

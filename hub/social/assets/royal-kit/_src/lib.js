// Curry District · Royal social kit — shared components.
// Everything renders from HTML/SVG; fonts are the self-hosted Fraunces + Hanken Grotesk.
const fs = require('fs');
const path = require('path');

const ROOT = '/home/user/playground';
const BR = 'file://' + ROOT + '/brand';
const SRC = __dirname;
const KIT = path.resolve(SRC, '..');

const C = {
  ink: '#160B26', plum: '#4B1D52', emerald: '#0F4D3F', peacock: '#117C86', ruby: '#A3173F',
  gold: '#E9A63A', goldLt: '#F7D98A', goldDk: '#B7791F', ivory: '#FBF3E4', blush: '#F4C9BB',
};

const art = (k) => {
  const set1 = ['biryani', 'butter-chicken', 'garlic-naan', 'paneer-tikka', 'samosa-chutney', 'tandoori-platter'];
  return `${BR}/illustrations/royal/${set1.includes(k) ? 'set1' : 'set2'}/${k}.svg`;
};
const artFile = (k) => art(k).replace('file://', '');
const icon = (k, variant = '') => `${BR}/icons/royal/${variant ? variant + '/' : ''}${k}.svg`;
const logo = (k) => `${BR}/logo/royal/${k}.svg`;
const pattern = (k) => `${BR}/patterns/royal/${k}.svg`;

// ───────── arch geometry: cusped (multifoil) Mughal arch, lobes kept inside the box ─────────
function archPoints(W, S, lobes, k) {
  let inset = 0, apexY = 0, pts = [], r = 0;
  for (let it = 0; it < 4; it++) {
    const a = W / 2 - inset, h = S - apexY;
    const R = (a * a + h * h) / (2 * a);
    const cx = inset + R, cy = S;
    const f0 = -Math.PI, f1 = Math.atan2(apexY - S, W / 2 - cx);
    pts = [];
    for (let i = 0; i <= lobes; i++) {
      const f = f0 + (f1 - f0) * (i / lobes);
      pts.push([cx + R * Math.cos(f), cy + R * Math.sin(f)]);
    }
    const c = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]);
    r = c * k;
    const s = r - Math.sqrt(r * r - c * c / 4);
    inset = s * 1.02; apexY = s * 1.02;
  }
  pts[lobes][0] = W / 2;
  return { pts, r, inset };
}
const f2 = (n) => (+n).toFixed(2);
function archPath(W, H, { spring = 0.42, lobes = 4, k = 0.62, ox = 0, oy = 0, plain = false } = {}) {
  const S = H * spring;
  if (plain) {
    // simple four-centred pointed arch
    const a = W / 2, h = S;
    const R = (a * a + h * h) / (2 * a);
    return `M${f2(ox)} ${f2(oy + H)}L${f2(ox)} ${f2(oy + S)}A${f2(R)} ${f2(R)} 0 0 1 ${f2(ox + W / 2)} ${f2(oy)}A${f2(R)} ${f2(R)} 0 0 1 ${f2(ox + W)} ${f2(oy + S)}L${f2(ox + W)} ${f2(oy + H)}Z`;
  }
  const { pts, r } = archPoints(W, S, lobes, k);
  let d = `M${f2(ox)} ${f2(oy + H)}L${f2(ox)} ${f2(oy + S)}L${f2(ox + pts[0][0])} ${f2(oy + pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) d += `A${f2(r)} ${f2(r)} 0 0 1 ${f2(ox + pts[i][0])} ${f2(oy + pts[i][1])}`;
  for (let i = pts.length - 2; i >= 0; i--) d += `A${f2(r)} ${f2(r)} 0 0 1 ${f2(ox + W - pts[i][0])} ${f2(oy + pts[i][1])}`;
  d += `L${f2(ox + W)} ${f2(oy + S)}L${f2(ox + W)} ${f2(oy + H)}Z`;
  return d;
}

let uid = 0;
// SVG defs shared by every page
const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<linearGradient id="foil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C98A2B"/><stop offset=".38" stop-color="#FBE3A0"/><stop offset=".6" stop-color="#EDB04A"/><stop offset="1" stop-color="#C08024"/></linearGradient>
<linearGradient id="foilH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B7791F"/><stop offset=".3" stop-color="#F7D98A"/><stop offset=".55" stop-color="#E9A63A"/><stop offset=".8" stop-color="#FBE3A0"/><stop offset="1" stop-color="#B7791F"/></linearGradient>
<linearGradient id="foilDk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7A4E0F"/><stop offset=".45" stop-color="#B7791F"/><stop offset=".7" stop-color="#9A6418"/><stop offset="1" stop-color="#6E450C"/></linearGradient>
<linearGradient id="brass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBE3A0"/><stop offset=".35" stop-color="#E9A63A"/><stop offset=".7" stop-color="#B7791F"/><stop offset="1" stop-color="#6E450C"/></linearGradient>
</defs></svg>`;

/** Arch window: glow + jali inside a cusped arch with foil trim, beading and finial. Returns absolutely-positioned SVG. */
function archWindow({ x, y, w, h, spring = 0.42, lobes = 4, glow = 'plum', jali = true, sill = true, beads = true, finial = true, trim = 'foil', inner = null, plain = false, id = null }) {
  const n = id || 'aw' + (++uid);
  const pad = 40; // room for trims/finial outside
  const glows = {
    plum: ['#8E3A6E', '#4B1D52', '#1C0C2C'],
    ruby: ['#C4425A', '#7A1235', '#2A0A1C'],
    emerald: ['#2E8C6E', '#0F4D3F', '#06231C'],
    peacock: ['#2AA2A8', '#117C86', '#08343B'],
    midnight: ['#5B2D6B', '#2A1240', '#120820'],
    saffron: ['#F2B64F', '#B4532A', '#3A1230'],
    ivory: ['#FFF8EA', '#F3E4C8', '#E6CFA6'],
  }[glow] || glow;
  const outer = archPath(w, h, { spring, lobes, ox: pad, oy: pad, plain });
  const innerP = archPath(w - 28, h - 14, { spring: (h * spring - 7) / (h - 14), lobes, ox: pad + 14, oy: pad + 14, plain });
  const outerT = archPath(w + 24, h + 12, { spring: (h * spring + 6) / (h + 12), lobes, ox: pad - 12, oy: pad - 12, plain });
  const stroke = trim === 'dark' ? 'url(#foilDk)' : 'url(#foil)';
  const pat = jali ? `<pattern id="${n}-p" width="240" height="240" patternUnits="userSpaceOnUse"><image href="${pattern('01-jali-lattice-midnight')}" width="240" height="240"/></pattern>` : '';
  return `<svg class="archwin" aria-hidden="true" style="position:absolute;left:${x - pad}px;top:${y - pad}px;width:${w + pad * 2}px;height:${h + pad * 2}px;overflow:visible" viewBox="0 0 ${w + pad * 2} ${h + pad * 2}">
<defs><clipPath id="${n}-c"><path d="${outer}"/></clipPath>
<radialGradient id="${n}-g" cx="50%" cy="58%" r="70%"><stop offset="0" stop-color="${glows[0]}"/><stop offset=".5" stop-color="${glows[1]}"/><stop offset="1" stop-color="${glows[2]}"/></radialGradient>
<radialGradient id="${n}-hl" cx="50%" cy="30%" r="45%"><stop offset="0" stop-color="#FBE3A0" stop-opacity=".22"/><stop offset="1" stop-color="#FBE3A0" stop-opacity="0"/></radialGradient>
<radialGradient id="${n}-cg" cx="50%" cy="${glow === 'ivory' ? 80 : 74}%" r="55%"><stop offset="0" stop-color="${glow === 'ivory' ? '#FFFFFF' : '#F2B64F'}" stop-opacity="${glow === 'ivory' ? 0.6 : 0.34}"/><stop offset="1" stop-color="#F2B64F" stop-opacity="0"/></radialGradient>
${pat}</defs>
<g clip-path="url(#${n}-c)"><rect width="100%" height="100%" fill="url(#${n}-g)"/>${jali ? `<rect width="100%" height="100%" fill="url(#${n}-p)" opacity="${glow === 'ivory' ? 0.10 : 0.16}" style="mix-blend-mode:${glow === 'ivory' ? 'multiply' : 'screen'}"/>` : ''}<rect width="100%" height="100%" fill="url(#${n}-hl)"/><rect width="100%" height="100%" fill="url(#${n}-cg)"/>${inner || ''}</g>
${beads ? `<path d="${outerT}" fill="none" stroke="#F7D98A" stroke-width="3.4" stroke-dasharray="0 13" stroke-linecap="round" opacity=".75"/>` : ''}
<path d="${outer}" fill="none" stroke="${stroke}" stroke-width="5"/>
<path d="${innerP}" fill="none" stroke="${trim === 'dark' ? '#9A6418' : '#F7D98A'}" stroke-opacity=".6" stroke-width="1.6"/>
${finial ? `<g transform="translate(${pad + w / 2} ${pad - 26})"><path d="M0 -16L9 0L0 16L-9 0Z" fill="${stroke}"/><circle cy="-26" r="4" fill="${stroke}"/></g>` : ''}
${sill ? `<rect x="${pad - 34}" y="${pad + h - 2}" width="${w + 68}" height="14" rx="3" fill="url(#brass)"/><rect x="${pad - 20}" y="${pad + h + 14}" width="${w + 40}" height="3" fill="${stroke}" opacity=".8"/>` : ''}
</svg>`;
}

/** Full-canvas hairline frame with corner lozenges. */
function frame(w, h, { tone = 'dark', inset = 34 } = {}) {
  const s = tone === 'light' ? 'url(#foilDk)' : 'url(#foil)';
  const i2 = inset + 12;
  const corners = [[inset, inset], [w - inset, inset], [inset, h - inset], [w - inset, h - inset]]
    .map(([cx, cy]) => `<path d="M${cx} ${cy - 11}L${cx + 11} ${cy}L${cx} ${cy + 11}L${cx - 11} ${cy}Z" fill="${s}"/>`).join('');
  return `<svg class="frame" aria-hidden="true" style="position:absolute;inset:0;width:${w}px;height:${h}px" viewBox="0 0 ${w} ${h}">
<rect x="${inset}" y="${inset}" width="${w - inset * 2}" height="${h - inset * 2}" fill="none" stroke="${s}" stroke-width="2" opacity=".85"/>
<rect x="${i2}" y="${i2}" width="${w - i2 * 2}" height="${h - i2 * 2}" fill="none" stroke="${tone === 'light' ? '#B7791F' : '#F7D98A'}" stroke-width="1" opacity=".35"/>
${corners}</svg>`;
}

const FIELDS = {
  midnight: { bg: 'radial-gradient(120% 80% at 50% 30%, #3A1A52 0%, #241038 38%, #160B26 70%, #0C0616 100%)', pat: '01-jali-lattice-midnight', tone: 'dark', wm: 'foil' },
  plum: { bg: 'radial-gradient(120% 85% at 50% 28%, #6A2A70 0%, #4B1D52 40%, #2A0F33 75%, #170920 100%)', pat: '01-jali-lattice-midnight', tone: 'dark', wm: 'foil' },
  emerald: { bg: 'radial-gradient(120% 85% at 50% 28%, #1C7560 0%, #0F4D3F 42%, #0A3A30 70%, #05201A 100%)', pat: '01-jali-lattice-midnight', tone: 'dark', wm: 'foil' },
  ruby: { bg: 'radial-gradient(120% 85% at 50% 26%, #C62A55 0%, #A3173F 38%, #6E0E2C 72%, #3A0719 100%)', pat: '01-jali-lattice-midnight', tone: 'dark', wm: 'foil' },
  peacock: { bg: 'radial-gradient(120% 85% at 50% 24%, #1A97A0 0%, #117C86 34%, #0B5560 64%, #06303A 100%)', pat: '01-jali-lattice-midnight', tone: 'dark', wm: 'foil' },
  ivory: { bg: 'radial-gradient(120% 90% at 50% 25%, #FFFBF2 0%, #FBF3E4 45%, #F3E4C8 100%)', pat: '01-jali-lattice-ivory', tone: 'light', wm: 'ivory' },
};

const CSS = `
@font-face{font-family:'Fraunces';src:url(file://${SRC}/fonts/fraunces.woff2) format('woff2');font-weight:100 900;font-style:normal}
@font-face{font-family:'Fraunces';src:url(file://${SRC}/fonts/fraunces-italic.woff2) format('woff2');font-weight:100 900;font-style:italic}
@font-face{font-family:'Hanken Grotesk';src:url(file://${SRC}/fonts/hanken.woff2) format('woff2');font-weight:100 900;font-style:normal}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#160B26}
body{font-family:'Hanken Grotesk',system-ui,sans-serif;color:${C.ivory};-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
.cv{position:relative;overflow:hidden}
.field{position:absolute;inset:0}
.field .pat{position:absolute;inset:0;background-size:240px 240px;opacity:.10;mix-blend-mode:screen}
.field.light .pat{opacity:.22;mix-blend-mode:multiply}
.field .vig{position:absolute;inset:0;background:radial-gradient(130% 100% at 50% 45%,transparent 55%,rgba(8,3,14,.55) 100%)}
.field.light .vig{background:radial-gradient(130% 100% at 50% 45%,transparent 60%,rgba(183,121,31,.12) 100%)}
.abs{position:absolute}
.center{left:0;right:0;text-align:center;margin:0 auto}
.eyebrow{font-family:'Hanken Grotesk';font-weight:700;font-size:28px;letter-spacing:.28em;text-transform:uppercase;color:${C.goldLt}}
.light .eyebrow,.eyebrow.dk{color:#8A5A12}
.h1{font-family:'Fraunces';font-weight:650;font-size:116px;line-height:.98;letter-spacing:-.018em;color:${C.ivory}}
.h2{font-family:'Fraunces';font-weight:620;font-size:84px;line-height:1.02;letter-spacing:-.012em;color:${C.ivory}}
.it{font-family:'Fraunces';font-style:italic;font-weight:420}
.body{font-family:'Hanken Grotesk';font-weight:450;font-size:36px;line-height:1.38;color:rgba(251,243,228,.9)}
.ink{color:${C.ink}}
.foil{background:linear-gradient(120deg,#D29433 0%,#FBE3A0 34%,#F2BC55 55%,#FFE7A8 72%,#D2932F 100%);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-box-decoration-break:clone;padding:0 .04em;filter:drop-shadow(0 2px 0 rgba(10,4,18,.35))}
.foil-dk{background:linear-gradient(120deg,#7A4E0F 0%,#B7791F 40%,#94600F 65%,#6E450C 100%);-webkit-background-clip:text;background-clip:text;color:transparent;padding:0 .04em}
.pill{display:inline-flex;align-items:center;gap:18px;height:92px;padding:0 48px;border-radius:999px;font-family:'Hanken Grotesk';font-weight:700;font-size:34px;letter-spacing:.04em}
.pill.gold{background:linear-gradient(120deg,#E9A63A,#FBE3A0 45%,#E9A63A 75%,#C98A2B);color:${C.ink};box-shadow:0 14px 30px -12px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.6)}
.pill.line{border:2px solid ${C.goldLt};color:${C.goldLt}}
.wm{position:absolute;left:50%;transform:translateX(-50%)}
.rule{height:2px;background:linear-gradient(90deg,transparent,${C.gold},transparent)}
.diamond{display:inline-block;width:14px;height:14px;transform:rotate(45deg);background:linear-gradient(135deg,#FBE3A0,#C98A2B)}
`;

function field(kind) {
  const f = FIELDS[kind];
  return `<div class="field ${f.tone === 'light' ? 'light' : ''}" style="background:${f.bg}"><div class="pat" style="background-image:url(${pattern(f.pat)})"></div><div class="vig"></div></div>`;
}

function page({ w, h, kind = 'midnight', body, css = '', frameOpts = {}, noFrame = false, head = '' }) {
  const f = FIELDS[kind] || FIELDS.midnight;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Curry District · Royal social kit</title><style>${CSS}
html,body{width:${w}px;height:${h}px}
.cv{width:${w}px;height:${h}px}
${css}</style>${head}</head><body>${DEFS}<div class="cv ${f.tone === 'light' ? 'light' : ''}">${field(kind)}${noFrame ? '' : frame(w, h, { tone: f.tone, ...frameOpts })}${body}</div></body></html>`;
}

/** Wordmark at the bottom centre (outlined logo SVG, colourway per field). */
function wordmark(kind, { y, h = 76, variant = 'wordmark-horizontal' } = {}) {
  const f = FIELDS[kind] || FIELDS.midnight;
  const cw = f.wm === 'ivory' ? 'ivory' : 'foil';
  return `<img class="wm" alt="" src="${logo('colourways/' + variant + '--' + cw)}" style="top:${y}px;height:${h}px">`;
}

/** Inline icon SVG with recoloured stroke (mono set uses currentColor). */
function iconInline(name, { size = 120, color = C.gold, stroke = null, fillOpacity = null } = {}) {
  let s = fs.readFileSync(ROOT + '/brand/icons/royal/mono/' + name + '.svg', 'utf8');
  s = s.replace('<svg ', `<svg aria-hidden="true" style="color:${color};width:${size}px;height:${size}px;display:block" `);
  if (stroke) s = s.replace('stroke-width="1.75"', `stroke-width="${stroke}"`);
  if (fillOpacity !== null) s = s.replace('opacity="0.3"', `opacity="${fillOpacity}"`);
  return s;
}

/** Five-point star with partial fill (0..1). */
function star(size, fill, { on = '#E9A63A', off = 'rgba(183,121,31,.28)', stroke = '#B7791F' } = {}) {
  const n = 'st' + (++uid);
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.42 : 1, a = -Math.PI / 2 + i * Math.PI / 5;
    pts.push([50 + 48 * r * Math.cos(a), 52 + 48 * r * Math.sin(a)]);
  }
  const d = 'M' + pts.map((p) => p.map(f2).join(' ')).join('L') + 'Z';
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="${n}"><stop offset="${fill}" stop-color="${on}"/><stop offset="${fill}" stop-color="${off}"/></linearGradient></defs><path d="${d}" fill="url(#${n})" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/></svg>`;
}

/** Deterministic PRNG */
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

/** QR lookalike: deliberately non-scannable (no timing/format info, random modules, centre badge). */
function fakeQR(size, { dark = C.ink, light = C.ivory, seed = 7 } = {}) {
  const N = 29, m = size / (N + 2), R = rng(seed);
  let rects = '';
  const inFinder = (x, y) => (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
  const inCentre = (x, y) => x > 9 && x < 19 && y > 9 && y < 19;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (inFinder(x, y) || inCentre(x, y)) continue;
    if (R() < 0.47) rects += `<rect x="${f2((x + 1) * m)}" y="${f2((y + 1) * m)}" width="${f2(m * 0.92)}" height="${f2(m * 0.92)}" rx="${f2(m * 0.22)}"/>`;
  }
  const finder = (fx, fy) => {
    const X = (fx + 1) * m, Y = (fy + 1) * m;
    return `<rect x="${f2(X)}" y="${f2(Y)}" width="${f2(7 * m)}" height="${f2(7 * m)}" rx="${f2(m * 1.6)}" fill="none" stroke="${dark}" stroke-width="${f2(m)}" transform="translate(${f2(m / 2)} ${f2(m / 2)}) scale(1)" />`
      + `<rect x="${f2(X + 2 * m)}" y="${f2(Y + 2 * m)}" width="${f2(3 * m)}" height="${f2(3 * m)}" rx="${f2(m * 0.8)}" fill="${dark}"/>`;
  };
  const cx = size / 2;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><rect width="${size}" height="${size}" rx="${f2(m * 1.2)}" fill="${light}"/><g fill="${dark}">${rects}</g>${finder(0, 0)}${finder(N - 7, 0)}${finder(0, N - 7)}
<circle cx="${cx}" cy="${cx}" r="${f2(m * 4.6)}" fill="${light}"/><circle cx="${cx}" cy="${cx}" r="${f2(m * 4)}" fill="${dark}"/>
<image href="${logo('colourways/emblem--foil')}" x="${f2(cx - m * 2.3)}" y="${f2(cx - m * 3)}" width="${f2(m * 4.6)}" height="${f2(m * 6)}"/></svg>`;
}

/** Arrow drawn as SVG (fonts lack →). */
function arrow(w = 60, color = C.goldLt, sw = 3.5) {
  return `<svg width="${w}" height="${w * 0.4}" viewBox="0 0 60 24" aria-hidden="true" style="display:inline-block;vertical-align:middle"><path d="M2 12H56M44 2L57 12L44 22" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/** Chili (gold line, optional foil fill) from the brand chili glyph. */
function chili(size, fill = 0, { stroke = 3.2, glow = false } = {}) {
  const n = 'ch' + (++uid);
  let raw = fs.readFileSync(ROOT + '/brand/icons/royal/mono/chili.svg', 'utf8');
  const inner = raw.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true" style="overflow:visible${glow ? ';filter:drop-shadow(0 0 14px rgba(251,227,160,.55))' : ''}"><defs><linearGradient id="${n}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FBE3A0"/><stop offset=".55" stop-color="#E9A63A"/><stop offset="1" stop-color="#B7791F"/></linearGradient></defs>
<g style="color:#F2C25C" stroke-width="${stroke}" fill="none" stroke-linecap="round" stroke-linejoin="round">${inner.replace(/stroke-width="[^"]*"/g, '').replace(/<g opacity="0.3">([\s\S]*?)<\/g>/, (m, g) => `<g opacity="${fill}" style="color:url(#${n})">${g.replace(/currentColor/g, `url(#${n})`)}</g>`)}</g></svg>`;
}

function bloom(cx, cy, r, color = 'rgba(233,166,58,.26)') {
  return `<div class="abs" aria-hidden="true" style="left:${cx - r}px;top:${cy - r}px;width:${r * 2}px;height:${r * 2}px;border-radius:50%;background:radial-gradient(closest-side,${color},transparent)"></div>`;
}
function write(file, html) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, html); }

module.exports = { bloom, ROOT, BR, SRC, KIT, C, art, artFile, icon, logo, pattern, archPath, archWindow, frame, field, page, wordmark, iconInline, star, rng, fakeQR, arrow, chili, write, FIELDS, CSS, DEFS };

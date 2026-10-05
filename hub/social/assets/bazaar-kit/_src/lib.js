// Curry District · Bazaar social kit — shared template helpers.
// Brand assets are read IN PLACE from /brand at build time, so re-running the
// build picks up any sibling updates (dish art, icons, patterns, logo).
const fs = require('fs');
const path = require('path');

const PG = '/home/user/playground';
const BRAND = PG + '/brand';
const KIT = PG + '/hub/social/assets/bazaar-kit';
const SRC = KIT + '/_src';
const furl = p => 'file://' + p;

const C = {
  ink: '#1D1147', cream: '#FFF4DC', marigold: '#FFB000', saffron: '#FF6A13',
  rani: '#E4147E', chili: '#D62839', peacock: '#00A8A0', cilantro: '#3FA34D',
  sky: '#7B5CFF', violet: '#3A1B7A', surface2: '#FFE7B8', muted: '#5B4F85', white: '#FFFFFF'
};

function stripProlog(s) { return s.replace(/<\?xml[^>]*>/, '').replace(/<!DOCTYPE[^>]*>/i, '').trim(); }

function readSvg(p) { return stripProlog(fs.readFileSync(p, 'utf8')); }

// prefix every id + its references so one SVG file can be inlined several times per page
function prefixIds(svg, pre) {
  const ids = new Set();
  svg.replace(/\sid="([^"]+)"/g, (_, id) => ids.add(id));
  if (!ids.size) return svg;
  let out = svg;
  for (const id of ids) {
    const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(`id="${esc}"`, 'g'), `id="${pre}${id}"`)
      .replace(new RegExp(`url\\(#${esc}\\)`, 'g'), `url(#${pre}${id})`)
      .replace(new RegExp(`href="#${esc}"`, 'g'), `href="#${pre}${id}"`)
      .replace(new RegExp(`aria-labelledby="${esc}"`, 'g'), `aria-labelledby="${pre}${id}"`);
  }
  return out;
}

const DISH_SET = {
  'butter-chicken': 'set1', biryani: 'set1', 'garlic-naan': 'set1', 'paneer-tikka': 'set1',
  'samosa-chutney': 'set1', 'tandoori-platter': 'set1', chaat: 'set2', 'chilli-chicken': 'set2',
  'dal-saag': 'set2', 'gulab-jamun': 'set2', 'mango-lassi-chai': 'set2', thali: 'set2'
};
let uid = 0;
// dish illustration, inlined so steam/sparkle classes can be styled/animated
function dish(key, { cls = '', style = '', pre } = {}) {
  const p = `${BRAND}/illustrations/bazaar/${DISH_SET[key]}/${key}.svg`;
  let svg = readSvg(p);
  svg = prefixIds(svg, (pre || ('d' + (uid++))) + '-');
  svg = svg.replace('<svg ', `<svg class="dish-svg" aria-hidden="true" `);
  return `<div class="dish ${cls}" style="${style}">${svg}</div>`;
}

function icon(name, { cls = '', style = '', mono = false } = {}) {
  const p = `${BRAND}/icons/bazaar/${mono ? 'mono/' : ''}${name}.svg`;
  let svg = readSvg(p).replace(/<title>[^<]*<\/title>/, '');
  svg = prefixIds(svg, 'i' + (uid++) + '-');
  svg = svg.replace('<svg ', `<svg aria-hidden="true" `).replace(/\swidth="64"\s+height="64"/, '');
  return `<span class="ico ${cls}" style="${style}">${svg}</span>`;
}

const logoPath = (f) => `${BRAND}/logo/bazaar/${f}`;
function logo(file, { cls = '', style = '' } = {}) {
  return `<img class="logo ${cls}" style="${style}" src="${furl(logoPath(file))}" alt="">`;
}
const patternUrl = (name) => furl(`${BRAND}/patterns/bazaar/${name}.svg`);

// alternating-ray sunburst, as a standalone SVG string
function sunburst({ w, h, cx = w / 2, cy = h / 2, n = 28, a = C.marigold, b = C.saffron, r, cls = '', style = '', patB = null, patScale = 1 }) {
  r = r || Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) + 20;
  const step = 360 / n; let rays = '';
  for (let i = 0; i < n; i += 2) {
    const a0 = (i * step - 90) * Math.PI / 180, a1 = ((i + 1) * step - 90) * Math.PI / 180;
    rays += `M${cx} ${cy}L${(cx + r * Math.cos(a0)).toFixed(1)} ${(cy + r * Math.sin(a0)).toFixed(1)}L${(cx + r * Math.cos(a1)).toFixed(1)} ${(cy + r * Math.sin(a1)).toFixed(1)}Z`;
  }
  const pid = 'sbp' + (uid++);
  const defs = patB ? `<defs><pattern id="${pid}" patternUnits="userSpaceOnUse" width="${240 * patScale}" height="${240 * patScale}"><image href="${patternUrl(patB)}" width="${240 * patScale}" height="${240 * patScale}"/></pattern></defs>` : '';
  const patLayer = patB ? `<path d="${rays}" fill="url(#${pid})"/>` : '';
  return `<svg class="burst ${cls}" style="${style}" aria-hidden="true" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice">${defs}<rect width="${w}" height="${h}" fill="${a}"/><path d="${rays}" fill="${b}"/>${patLayer}</svg>`;
}

// 4-point sparkle (matches the dish-art sparkles)
function sparkle(x, y, s, fill, { stroke = C.ink, sw = 4, cls = '', rot = 0 } = {}) {
  const k = s * 0.2;
  return `<path class="${cls}" transform="translate(${x} ${y}) rotate(${rot})" d="M0 ${-s}Q${k} ${-k} ${s} 0Q${k} ${k} 0 ${s}Q${-k} ${k} ${-s} 0Q${-k} ${-k} 0 ${-s}Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
}

// five-point star path centred on 0,0 radius r
function starPath(r) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.48 : r; const a = (i * 36 - 90) * Math.PI / 180;
    d += (i ? 'L' : 'M') + (rr * Math.cos(a)).toFixed(2) + ' ' + (rr * Math.sin(a)).toFixed(2);
  }
  return d + 'Z';
}
// rating stars, partially filled to the exact value
function stars(value, { size = 44, gap = 8, fill = C.marigold, empty = '#FFFFFF', stroke = C.ink } = {}) {
  const r = size / 2, w = 5 * size + 4 * gap; const id = 'st' + (uid++);
  let shapes = '', fills = '';
  for (let i = 0; i < 5; i++) {
    const cx = i * (size + gap) + r;
    shapes += `<path d="${starPath(r - 3)}" transform="translate(${cx} ${r + 1})" fill="${empty}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>`;
    fills += `<path d="${starPath(r - 3)}" transform="translate(${cx} ${r + 1})" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>`;
  }
  // fill width: full stars + fraction of the partial star (in its own box)
  const full = Math.floor(value), frac = value - full;
  const fw = full * (size + gap) + frac * size;
  return `<svg class="stars" aria-hidden="true" width="${w}" height="${size + 2}" viewBox="0 0 ${w} ${size + 2}"><defs><clipPath id="${id}"><rect x="0" y="0" width="${fw.toFixed(1)}" height="${size + 2}"/></clipPath></defs>${shapes}<g clip-path="url(#${id})">${fills}</g></svg>`;
}

// deterministic PRNG
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// SAMPLE QR look-alike: finder squares + random modules. It carries no data and
// cannot be scanned (no format/timing info), by design.
function sampleQR({ size = 420, n = 29, seed = 7, fg = C.ink, bg = '#FFFFFF', centre = true } = {}) {
  const m = size / (n + 2); const R = rng(seed); let d = '';
  const inFinder = (x, y) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  const inCentre = (x, y) => centre && Math.abs(x - (n - 1) / 2) < 4.5 && Math.abs(y - (n - 1) / 2) < 4.5;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    if (inFinder(x, y) || inCentre(x, y)) continue;
    if (R() < 0.47) d += `M${(x + 1) * m} ${(y + 1) * m}h${m}v${m}h${-m}Z`;
  }
  const finder = (fx, fy) => {
    const X = (fx + 1) * m, Y = (fy + 1) * m;
    return `<rect x="${X + m / 2}" y="${Y + m / 2}" width="${6 * m}" height="${6 * m}" rx="${m * 1.3}" fill="none" stroke="${fg}" stroke-width="${m}"/><rect x="${X + 2 * m}" y="${Y + 2 * m}" width="${3 * m}" height="${3 * m}" rx="${m * 0.7}" fill="${fg}"/>`;
  };
  return `<svg class="qr" aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${bg}"/><path d="${d}" fill="${fg}" shape-rendering="crispEdges"/>${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}</svg>`;
}

// hand-drawn style arrow (font subset has no →)
function arrow({ w = 160, h = 90, color = C.ink, sw = 7, flip = false, curve = 30 } = {}) {
  const t = flip ? `transform="scale(-1 1) translate(${-w} 0)"` : '';
  return `<svg class="arrow" aria-hidden="true" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><g ${t} fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M8 ${h - 14} Q${w * 0.45} ${h - 14 - curve * 2} ${w - 14} 18"/><path d="M${w - 50} 14 L${w - 12} 16 L${w - 22} 52"/></g></svg>`;
}

// straight inline arrow glyph for text runs
function inlineArrow(color = 'currentColor', size = 1) {
  return `<svg class="iarrow" aria-hidden="true" viewBox="0 0 40 24" style="width:${1.3 * size}em;height:${0.78 * size}em;vertical-align:-0.06em"><path d="M3 12H34M24 3L35 12L24 21" fill="none" stroke="${color}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

// bunting garland across the top
function bunting({ w = 1080, y = 0, sag = 60, n = 13, size = 70, colors = [C.rani, C.marigold, C.peacock, C.saffron, C.cream, C.cilantro], stroke = C.ink } = {}) {
  let tris = ''; const pts = [];
  for (let i = 0; i <= n; i++) { const t = i / n; const x = -20 + t * (w + 40); const yy = y + 4 * sag * t * (1 - t); pts.push([x, yy]); }
  for (let i = 0; i < n; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    const half = size * 0.45; const ang = Math.atan2(y1 - y0, x1 - x0);
    const ax = mx - half * Math.cos(ang), ay = my - half * Math.sin(ang), bx = mx + half * Math.cos(ang), by = my + half * Math.sin(ang);
    const tx = mx - size * Math.sin(ang) * -1 * 0 + 0, ty = my + size;
    tris += `<path d="M${ax.toFixed(1)} ${ay.toFixed(1)}L${bx.toFixed(1)} ${by.toFixed(1)}L${tx.toFixed(1)} ${ty.toFixed(1)}Z" fill="${colors[i % colors.length]}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/><circle cx="${tx.toFixed(1)}" cy="${(ty - size * 0.42).toFixed(1)}" r="${(size * 0.09).toFixed(1)}" fill="${stroke}" opacity=".85"/>`;
  }
  const line = 'M' + pts.map(p => p.map(v => v.toFixed(1)).join(' ')).join('L');
  return `<svg class="bunting" aria-hidden="true" width="${w}" height="${y + sag + size + 20}" viewBox="0 0 ${w} ${y + sag + size + 20}"><path d="${line}" fill="none" stroke="${stroke}" stroke-width="5"/>${tris}</svg>`;
}

function fontFaces() {
  return `
@font-face{font-family:'Bowlby One';src:url(${furl(SRC + '/fonts/bowlby-one.woff2')}) format('woff2');font-weight:400;font-display:block}
@font-face{font-family:'DM Sans';src:url(${furl(SRC + '/fonts/dm-sans.woff2')}) format('woff2');font-weight:100 1000;font-display:block}
@font-face{font-family:'Caveat';src:url(${furl(SRC + '/fonts/caveat.woff2')}) format('woff2');font-weight:400 700;font-display:block}`;
}

const BASE_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:transparent}
body{font-family:'DM Sans',system-ui,sans-serif;color:${C.ink};-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
.cv{position:relative;overflow:hidden}
.abs{position:absolute}
.burst{position:absolute;inset:0;width:100%;height:100%}
.dish{position:absolute}
.dish svg{width:100%;height:100%;display:block;overflow:visible}
.ico{display:inline-block;line-height:0}
.ico svg{width:100%;height:100%;display:block;overflow:visible}
.logo{display:block}
.disp{font-family:'Bowlby One','Arial Black',sans-serif;text-transform:uppercase;line-height:.92;letter-spacing:.01em;font-weight:400}
.hand{font-family:'Caveat',cursive;font-weight:700;line-height:1}
.stk{paint-order:stroke fill;-webkit-text-stroke:var(--sw,14px) ${C.ink}}
/* street-sign plate (echoes the DISTRICT plate in the logo) */
.plate{display:inline-flex;align-items:center;gap:14px;font-family:'Bowlby One',sans-serif;text-transform:uppercase;letter-spacing:.04em;
  background:${C.peacock};color:${C.cream};border:6px solid ${C.ink};border-radius:16px;padding:12px 26px 14px;box-shadow:8px 8px 0 ${C.ink};position:relative;line-height:1}
.plate::after{content:"";position:absolute;inset:6px;border:3px solid ${C.cream};border-radius:9px;pointer-events:none;opacity:.9}
.plate.mari{background:${C.marigold};color:${C.ink}} .plate.mari::after{border-color:${C.ink};opacity:.35}
.plate.cream{background:${C.cream};color:${C.ink}} .plate.cream::after{border-color:${C.ink};opacity:.3}
.plate.rani{background:${C.rani};color:${C.cream}}
.plate.saff{background:${C.saffron};color:${C.ink}} .plate.saff::after{border-color:${C.ink};opacity:.35}
.plate.ink{background:${C.ink};color:${C.cream};box-shadow:8px 8px 0 ${C.rani}}
.card{background:#fff;border:6px solid ${C.ink};border-radius:28px;box-shadow:12px 12px 0 ${C.ink}}
.pill{display:inline-flex;align-items:center;justify-content:center;gap:12px;border:5px solid ${C.ink};border-radius:999px;font-weight:800;line-height:1;white-space:nowrap}
.tilt-l{transform:rotate(-3deg)} .tilt-r{transform:rotate(3deg)}
`;

function page({ w, h, body, css = '', title = 'Curry District social kit', bg = 'transparent' }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow">
<title>${title}</title><style>${fontFaces()}${BASE_CSS}
html,body{width:${w}px;height:${h}px}
.cv{width:${w}px;height:${h}px;background:${bg}}
${css}</style></head><body><div class="cv" id="cv">${body}</div></body></html>`;
}

module.exports = { PG, BRAND, KIT, SRC, C, furl, readSvg, dish, icon, logo, logoPath, patternUrl, sunburst, sparkle, stars, starPath, sampleQR, arrow, inlineArrow, bunting, page, rng, prefixIds };

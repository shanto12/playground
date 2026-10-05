// Shared kit components: footer signature, kicker plate, headline, scalloped halo.
const { C, logo } = require('./lib');

// Footer signature chip. dark=true when the post background is dark.
function footer({ dark = false, y = 56, line = 'Indian Kitchen · Little Elm, TX', w = 1080 } = {}) {
  const lg = dark ? 'colourways/wordmark-horizontal--full-colour.svg' : 'colourways/wordmark-horizontal--reversed.svg';
  return `<div class="foot ${dark ? 'on-dark' : 'on-light'}" style="bottom:${y}px">
    ${logo(lg, { style: 'height:62px;width:auto' })}<span class="foot__rule"></span><span class="foot__txt">${line}</span></div>`;
}
const FOOT_CSS = `
.foot{position:absolute;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:20px;padding:12px 30px 12px 20px;border-radius:999px;border:5px solid ${C.ink};white-space:nowrap}
.foot.on-light{background:${C.ink};box-shadow:6px 6px 0 rgba(29,17,71,.35)}
.foot.on-dark{background:${C.cream};box-shadow:6px 6px 0 ${C.rani}}
.foot__rule{width:4px;height:44px;border-radius:4px;background:currentColor;opacity:.35}
.foot__txt{font-weight:800;font-size:27px;letter-spacing:.06em;text-transform:uppercase}
.foot.on-light{color:${C.cream}} .foot.on-dark{color:${C.ink}}
`;

function kicker(text, { cls = '', x = 72, y = 64, size = 34, rot = -2 } = {}) {
  return `<div class="plate ${cls}" style="position:absolute;left:${x}px;top:${y}px;font-size:${size}px;transform:rotate(${rot}deg)">${text}</div>`;
}

// scalloped stamp-style halo (echoes the District seal) as SVG
function halo({ w = 1080, h = 1350, cx, cy, r, bumps = 40, ring = C.rani, disc = C.cream, shadow = C.ink, sw = 8, inner = true, dots = C.ink }) {
  const br = (2 * Math.PI * r) / bumps / 2 * 1.05; let circles = '';
  for (let i = 0; i < bumps; i++) {
    const a = (i / bumps) * Math.PI * 2;
    circles += `<circle cx="${(cx + r * Math.cos(a)).toFixed(1)}" cy="${(cy + r * Math.sin(a)).toFixed(1)}" r="${br.toFixed(1)}"/>`;
  }
  let dotRing = '';
  if (inner) {
    const n = Math.round(bumps * 1.6), rr = r - br * 2.6;
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; dotRing += `<circle cx="${(cx + rr * Math.cos(a)).toFixed(1)}" cy="${(cy + rr * Math.sin(a)).toFixed(1)}" r="5" fill="${dots}" opacity=".55"/>`; }
  }
  return `<svg class="halo" aria-hidden="true" style="position:absolute;left:0;top:0" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <g transform="translate(14 14)" fill="${shadow}" stroke="${shadow}" stroke-width="${sw * 2}"><circle cx="${cx}" cy="${cy}" r="${r}"/>${circles}</g>
    <g fill="${ring}" stroke="${C.ink}" stroke-width="${sw * 2}"><circle cx="${cx}" cy="${cy}" r="${r}"/>${circles}</g>
    <g fill="${ring}"><circle cx="${cx}" cy="${cy}" r="${r}"/>${circles}</g>
    <circle cx="${cx}" cy="${cy}" r="${r - br * 1.6}" fill="${disc}" stroke="${C.ink}" stroke-width="${sw}"/>${dotRing}</svg>`;
}

module.exports = { footer, FOOT_CSS, kicker, halo };

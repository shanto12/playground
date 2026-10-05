// node src/site.js → index.html + README.md for the Bazaar pattern library
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.resolve(__dirname, '..');

const NAMES = { '#1D1147': 'ink indigo', '#FFF4DC': 'cream', '#FFB000': 'marigold', '#FF6A13': 'saffron', '#E4147E': 'rani pink', '#D62839': 'chili', '#00A8A0': 'peacock', '#3FA34D': 'cilantro', '#7B5CFF': 'violet', '#FFE7B8': 'surface-2', '#3A1B7A': 'night violet', '#FFFFFF': 'white', '#5B4F85': 'muted' };
const CWS = [
  { key: 'sunset', label: 'Sunset', note: 'saffron · marigold · rani on cream' },
  { key: 'night', label: 'Night', note: 'brights on deep indigo' },
  { key: 'fresh', label: 'Fresh', note: 'peacock · cilantro · marigold on cream' },
];
const P = [
  { n: '01', slug: 'marigold-garland', name: 'Marigold Garland', t: 240,
    blurb: 'Toran-style swags of genda-phool heads, hanging laris with tassels and a toss of loose petals — the doorway-on-a-wedding-day feeling.',
    uses: ['Feature wallpaper', 'Party-tray sleeves', 'Gift & catering wrap', 'Celebration napkins'] },
  { n: '02', slug: 'chili-lime', name: 'Chili & Lime', t: 320,
    blurb: 'Tossed chilies, citrus wedges and wheels, cardamom pods, curry-leaf sprigs and mustard seeds — the spice counter having a very good day.',
    uses: ['Takeaway bag tissue', 'Delivery wraps & stickers', 'Web backgrounds', 'Aprons & tees'] },
  { n: '03', slug: 'block-print-booti', name: 'Block-Print Booti', t: 240,
    blurb: 'Sanganeri-style kairi (paisley) and flower booti on a half-drop, the colour block printed a hair off-register like a hand-carved wooden block.',
    uses: ['Napkins & table runners', 'Menu backs', 'Quiet walls & booths', 'Tissue paper'] },
  { n: '04', slug: 'truck-art-rangoli', name: 'Truck-Art Rangoli', t: 240,
    blurb: 'Layered flower medallions with painted shine strokes and dotted rings — highway truck-art swagger, rangoli symmetry.',
    uses: ['Feature wall / mural', 'Catering boxes', 'Cup sleeves', 'Social & story backgrounds'] },
  { n: '05', slug: 'chai-time', name: 'Chai Time', t: 320,
    blurb: 'Cutting-chai glasses, kulhads and a little ketli, all steaming, with star anise, cinnamon quills and cardamom.',
    uses: ['Chai & Coolers menu', 'Cup sleeves', 'Café-corner wallpaper', 'Loyalty cards'] },
  { n: '06', slug: 'spice-confetti', name: 'Spice Confetti', t: 320,
    blurb: 'Terrazzo chips, seeds and specks in spice-jar colours: a calm texture that still feels like a party. Safest pattern to put text on.',
    uses: ['Website & app backgrounds', 'Box interiors', 'Tabletops & counters', 'Behind menus and prices'] },
  { n: '07', slug: 'jaipur-arches', name: 'Jaipur Arches', t: 240,
    blurb: 'Brick-stacked scalloped arches banded in sunset stripes, each window with a little flower and a sill — a pink-city façade in miniature.',
    uses: ['Feature wall', 'Storefront window film', 'Box lids & bags', 'Hero banners'] },
  { n: '08', slug: 'tiffin-stripes', name: 'Tiffin Stripes', t: 240,
    blurb: 'Awning-bold stripe bands lined with stacked tiffin carriers and twinkly stars — lunch, packed with love.',
    uses: ['Lunch-rush takeaway bags', 'Packaging tape & sleeves', 'Section dividers on web', 'Kids’ menu'] },
];
const WALLS = [
  { file: '07-jaipur-arches-sunset', t: 240, ws: 1.6, sign: 'Bas, ek aur naan.', tag: 'Curry District', theme: 'day',
    alt: 'Mock-up of a restaurant wall papered in Jaipur Arches, sunset colourway, above an indigo wainscot with a rani-pink banquette, two pendant lamps and a hand-lettered sign.' },
  { file: '01-marigold-garland-night', t: 240, ws: 1.45, sign: 'Chai-lo!', tag: 'the District is open late', theme: 'night',
    alt: 'Mock-up of a restaurant wall papered in Marigold Garland, night colourway, above a rani wainscot with a marigold banquette, two glowing pendant lamps and a hand-lettered sign.' },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function hexes(file) {
  const s = fs.readFileSync(path.join(DIR, file), 'utf8');
  const bg = (s.match(/<rect x="0" y="0" width="\d+" height="\d+" fill="(#[0-9A-F]{6})"/i) || [])[1];
  const cnt = {};
  for (const h of s.match(/#[0-9A-F]{6}\b/gi)) cnt[h.toUpperCase()] = (cnt[h.toUpperCase()] || 0) + 1;
  const list = Object.keys(cnt).filter((h) => h !== bg).sort((a, b) => cnt[b] - cnt[a]);
  return { bg, list };
}
const kb = (f) => (fs.statSync(path.join(DIR, f)).size / 1024).toFixed(1);

// ---------------- index.html ----------------
const sections = P.map((p) => {
  const figs = CWS.map((cw) => {
    const f = `${p.n}-${p.slug}-${cw.key}`;
    const { bg, list } = hexes(f + '.svg');
    const dots = [bg, ...list].slice(0, 6).map((h) => `<i style="background:${h}" title="${NAMES[h] || h} ${h}"></i>`).join('');
    return `<figure class="sw" data-cw="${cw.key}">
        <div class="tile" style="--src:url('${f}.svg');--t:${p.t}" role="img" aria-label="${esc(p.name)} pattern, ${cw.label} colourway"></div>
        <figcaption><span class="cw"><b>${cw.label}</b><span class="dots" aria-hidden="true">${dots}</span></span>
          <span class="dl"><a href="${f}.svg" download aria-label="Download ${esc(p.name)} ${cw.label} SVG tile">SVG</a><a href="png/${f}.png" download aria-label="Download ${esc(p.name)} ${cw.label} PNG preview">PNG</a></span></figcaption>
      </figure>`;
  }).join('\n      ');
  return `<section class="pat" id="p${p.n}" aria-labelledby="h${p.n}">
    <header class="pat-head">
      <span class="num" aria-hidden="true">${p.n}</span>
      <div><h2 id="h${p.n}">${esc(p.name)}</h2><p>${esc(p.blurb)}</p>
      <ul class="uses" aria-label="Recommended uses">${p.uses.map((u) => `<li>${esc(u)}</li>`).join('')}</ul></div>
    </header>
    <div class="swatches">
      ${figs}
    </div>
  </section>`;
}).join('\n  ');

const walls = WALLS.map((w, i) => {
  const p = P.find((x) => w.file.startsWith(x.n));
  const cw = CWS.find((c) => w.file.endsWith(c.key));
  return `<figure class="wall-fig">
      <div class="wall wall-${w.theme}" id="wall-${i + 1}" style="--src:url('${w.file}.svg');--t:${w.t};--ws:${w.ws}" role="img" aria-label="${esc(w.alt)}">
        <div class="paper"></div>
        <span class="glow" style="--x:15%"></span><span class="glow" style="--x:85%"></span>
        <span class="lamp" style="--x:15%"></span><span class="lamp" style="--x:85%"></span>
        <div class="sign"><b>${esc(w.sign)}</b><small>${esc(w.tag)}</small></div>
        <div class="wainscot"></div>
        <div class="bench"></div>
        <span class="pillow" style="--x:24%;--r:-6deg;--c:var(--p1)"></span><span class="pillow" style="--x:31%;--r:5deg;--c:var(--p2)"></span><span class="pillow" style="--x:72%;--r:-4deg;--c:var(--p2)"></span>
      </div>
      <figcaption><span><b>${p.n} ${esc(p.name)}</b> · ${cw.label} — wall mock-up, 1600 × 900, one repeat ≈ ${Math.round(w.t * w.ws / 16)}% of the wall width</span>
        <a href="png/wall-${w.file}.png" download>PNG 1600×900</a></figcaption>
    </figure>`;
}).join('\n    ');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta name="description" content="Curry District · Bazaar direction — eight seamless repeat patterns in three colourways for wallpaper, packaging wraps, bag tissue, napkins and web backgrounds.">
<title>Bazaar Patterns · Curry District</title>
<link rel="stylesheet" href="fonts/fonts.css">
<style>
:root{
  --ink:#1D1147;--cream:#FFF4DC;--mari:#FFB000;--saff:#FF6A13;--rani:#E4147E;--chili:#D62839;--pea:#00A8A0;--cil:#3FA34D;--paper2:#FFE7B8;--dusk:#3A1B7A;--muted:#5B4F85;
  --bg:var(--cream);--fg:var(--ink);--sub:var(--muted);--card:#FFFFFF;--line:var(--ink);--shadow:var(--ink);--chip:var(--paper2);
  --scale:1;--mscale:1;
  color-scheme:light dark;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:var(--ink);--fg:var(--cream);--sub:var(--paper2);--card:var(--dusk);--line:var(--cream);--shadow:#0B0620;--chip:var(--dusk)}}
:root[data-theme="dark"]{--bg:var(--ink);--fg:var(--cream);--sub:var(--paper2);--card:var(--dusk);--line:var(--cream);--shadow:#0B0620;--chip:var(--dusk)}
@media (max-width:600px){:root{--mscale:.8}}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--fg);font:400 1rem/1.55 'DM Sans',system-ui,-apple-system,'Segoe UI',sans-serif}
a{color:inherit}
.wrap{max-width:1200px;margin:0 auto;padding:0 16px}
/* hero */
.hero{position:relative;background:var(--ink) url('04-truck-art-rangoli-night.svg') 0 0/200px 200px repeat;border-bottom:3px solid var(--line);padding:56px 16px 64px}
.hero-card{max-width:760px;margin:0 auto;background:var(--cream);color:var(--ink);border:3px solid var(--ink);border-radius:28px;box-shadow:8px 8px 0 var(--rani);padding:28px 22px 26px;transform:rotate(-1.2deg)}
.eyebrow{font:700 1.45rem/1 'Caveat','Comic Sans MS',cursive;color:var(--rani);margin:0 0 6px}
h1{font:400 clamp(2.3rem,9vw,4.6rem)/.95 'Bowlby One','Arial Black',sans-serif;text-transform:uppercase;letter-spacing:.01em;margin:0 0 12px}
.hero-card p.lede{margin:0;font-size:1.06rem;max-width:56ch}
.legend{display:grid;gap:10px;margin:18px 0 0;padding:0;list-style:none}
.legend li{display:flex;gap:10px;align-items:center;font-size:.95rem}
.legend b{min-width:4.2em}
.sw-dot{display:inline-flex;border:2px solid var(--ink);border-radius:999px;overflow:hidden;flex:none}
.sw-dot i{width:14px;height:22px;display:block}
@media(min-width:700px){.legend{grid-template-columns:repeat(3,1fr)}.hero-card{padding:36px 40px 34px}}
/* toolbar */
.bar{position:sticky;top:0;z-index:5;background:var(--bg);border-bottom:3px solid var(--line)}
.bar .wrap{display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center;padding-top:10px;padding-bottom:10px}
.grp{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.grp>span{font-weight:700;font-size:.85rem;text-transform:uppercase;letter-spacing:.06em;color:var(--sub);margin-right:2px}
.pill{appearance:none;font:700 .95rem/1 'DM Sans',sans-serif;color:var(--fg);background:var(--chip);border:2.5px solid var(--line);border-radius:999px;min-height:44px;min-width:44px;padding:0 14px;cursor:pointer}
.pill[aria-pressed="true"]{background:var(--rani);color:#FFFFFF;border-color:var(--line);box-shadow:3px 3px 0 var(--line)}
.pill:focus-visible,a:focus-visible{outline:3px solid var(--pea);outline-offset:3px}
@media(max-width:600px){.bar .wrap{flex-wrap:nowrap;overflow-x:auto;gap:10px;scrollbar-width:none;padding-top:8px;padding-bottom:8px}.bar .wrap::-webkit-scrollbar{display:none}.grp{flex-wrap:nowrap}.grp+.grp{border-left:2.5px solid var(--line);padding-left:10px}.grp>span{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}.pill{flex:none;padding:0 13px}}
/* pattern sections */
main{padding:8px 0 40px}
.pat{padding:40px 0 8px;scroll-margin-top:72px}
.walls,.notes{scroll-margin-top:72px}
.pat-head{display:flex;gap:14px;align-items:flex-start;margin-bottom:18px}
.num{font:400 2.4rem/1 'Bowlby One','Arial Black',sans-serif;color:var(--rani);-webkit-text-stroke:0;min-width:2.1ch}
h2{font:400 clamp(1.55rem,5vw,2.2rem)/1.02 'Bowlby One','Arial Black',sans-serif;text-transform:uppercase;margin:2px 0 8px}
.pat-head p{margin:0 0 10px;max-width:68ch;color:var(--fg)}
.uses{display:flex;flex-wrap:wrap;gap:6px;margin:0;padding:0;list-style:none}
.uses li{font-size:.82rem;font-weight:700;background:var(--chip);border:2px solid var(--line);border-radius:999px;padding:3px 10px}
.swatches{display:grid;gap:22px;grid-template-columns:1fr}
@media(min-width:700px){.swatches{grid-template-columns:repeat(3,1fr)}}
.sw{margin:0;background:var(--card);border:3px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:6px 6px 0 var(--shadow)}
.tile{aspect-ratio:1/1;background-image:var(--src);background-repeat:repeat;background-position:0 0;background-size:calc(var(--t) * var(--scale) * var(--mscale) * 1px);border-bottom:3px solid var(--line)}
.sw figcaption{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 8px 8px 14px}
.cw{display:flex;align-items:center;gap:10px}
.dots{display:inline-flex}
.dots i{width:14px;height:14px;border-radius:50%;border:1.5px solid var(--line);margin-left:-4px;display:block}
.dots i:first-child{margin-left:0}
.dl{display:flex;gap:6px}
.dl a,.wall-fig a{display:inline-flex;align-items:center;justify-content:center;min-height:44px;min-width:52px;padding:0 12px;border:2.5px solid var(--line);border-radius:999px;font-weight:700;font-size:.85rem;text-decoration:none;background:var(--chip)}
.dl a:hover,.wall-fig a:hover{background:var(--mari);color:var(--ink)}
main[data-show]:not([data-show="all"]) .swatches{grid-template-columns:1fr}
main[data-show]:not([data-show="all"]) .tile{aspect-ratio:16/9}
main[data-show="sunset"] .sw:not([data-cw="sunset"]),main[data-show="night"] .sw:not([data-cw="night"]),main[data-show="fresh"] .sw:not([data-cw="fresh"]){display:none}
/* walls */
.walls{padding:48px 0 8px}
.walls>p{max-width:68ch;margin:0 0 20px}
.wall-fig{margin:0 0 34px}
.wall-fig figcaption{display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center;margin-top:12px;font-size:.92rem}
.wall{position:relative;container-type:inline-size;aspect-ratio:16/9;max-width:1600px;overflow:hidden;border:3px solid var(--line);border-radius:16px;box-shadow:6px 6px 0 var(--shadow);background:var(--cream)}
.wall .paper{position:absolute;inset:0;background:var(--src) 0 0/calc(var(--t) * var(--ws,1) * 100cqw / 1600) repeat}
.wall .wainscot{position:absolute;left:0;right:0;bottom:0;height:29%;background:repeating-linear-gradient(90deg,var(--w1) 0 12.2cqw,var(--w2) 12.2cqw 12.5cqw);border-top:1.1cqw solid var(--rail);box-shadow:0 -.35cqw 0 var(--ink)}
.wall-day{--w1:#1D1147;--w2:#3A1B7A;--rail:#FFB000;--bench:#E4147E;--shade:#FF6A13;--cord:#1D1147;--p1:#FFB000;--p2:#00A8A0;--glow:rgba(255,176,0,.16)}
.wall-night{--w1:#E4147E;--w2:#D62839;--rail:#FFB000;--bench:#FFB000;--shade:#00A8A0;--cord:#FFF4DC;--p1:#00A8A0;--p2:#FFF4DC;--glow:rgba(255,176,0,.42)}
.wall .lamp{position:absolute;top:0;left:var(--x);width:8cqw;height:13.5cqw;transform:translateX(-50%)}
.wall .lamp::before{content:"";position:absolute;left:50%;top:0;width:.3cqw;height:8.6cqw;background:var(--cord);transform:translateX(-50%)}
.wall .lamp::after{content:"";position:absolute;left:0;right:0;top:8.4cqw;height:4.2cqw;background:var(--shade);border:.32cqw solid #1D1147;border-radius:5cqw 5cqw .6cqw .6cqw;box-shadow:inset 0 -.9cqw 0 #FFB000}
.wall .glow{position:absolute;top:10cqw;left:var(--x);width:22cqw;height:18cqw;transform:translateX(-50%);background:radial-gradient(closest-side,var(--glow),rgba(255,176,0,0));pointer-events:none}
.wall .sign{position:absolute;left:50%;top:14%;transform:translateX(-50%) rotate(-2deg);background:#FFF4DC;color:#1D1147;border:.35cqw solid #1D1147;border-radius:1.6cqw;box-shadow:.7cqw .7cqw 0 #1D1147;padding:1.4cqw 3.2cqw 1.2cqw;text-align:center;white-space:nowrap}
.wall .sign b{display:block;font:400 3.3cqw/1 'Bowlby One','Arial Black',sans-serif;text-transform:uppercase}
.wall .sign small{display:block;font:700 2.5cqw/1.1 'Caveat','Comic Sans MS',cursive;color:#E4147E;margin-top:.5cqw}
.wall .bench{position:absolute;left:9%;right:9%;bottom:9%;height:11%;background:repeating-linear-gradient(90deg,var(--bench) 0 13.6cqw,#1D1147 13.6cqw 13.9cqw);border:.35cqw solid #1D1147;border-radius:2cqw 2cqw .8cqw .8cqw;box-shadow:inset 0 -1.6cqw 0 rgba(29,17,71,.22)}
.wall .pillow{position:absolute;bottom:17.5%;left:var(--x);width:6.6cqw;height:5.6cqw;transform:translateX(-50%) rotate(var(--r));background:var(--c);border:.35cqw solid #1D1147;border-radius:1.4cqw;box-shadow:inset 0 0 0 .9cqw rgba(255,244,220,.0),.4cqw .4cqw 0 #1D1147}
.wall .pillow::after{content:"";position:absolute;inset:1.1cqw;border:.25cqw dashed #1D1147;border-radius:.8cqw}
/* notes + footer */
.notes{border:3px solid var(--line);border-radius:16px;background:var(--card);padding:18px 18px 8px;margin:24px 0 8px;box-shadow:6px 6px 0 var(--shadow)}
.notes h2{font-size:1.3rem}
.notes code{font-size:.85rem;background:var(--chip);border-radius:6px;padding:1px 5px;word-break:break-word}
.notes li{margin-bottom:8px}
footer{border-top:3px solid var(--line);padding:22px 0 34px;font-size:.9rem;color:var(--sub)}
footer p{margin:0 0 6px}
</style>
</head>
<body>
<header class="hero">
  <div class="hero-card">
    <p class="eyebrow">Curry District · Direction A · Bazaar</p>
    <h1>Bazaar Patterns</h1>
    <p class="lede">Eight seamless repeats, three colourways each — for wallpaper, takeaway wraps, bag tissue, napkins and web backgrounds. Every tile is a tiny SVG that repeats edge-to-edge with no visible seam.</p>
    <ul class="legend">
      <li><span class="sw-dot" aria-hidden="true"><i style="background:#FF6A13"></i><i style="background:#FFB000"></i><i style="background:#E4147E"></i><i style="background:#FFF4DC"></i></span><span><b>Sunset</b> saffron · marigold · rani on cream</span></li>
      <li><span class="sw-dot" aria-hidden="true"><i style="background:#FFB000"></i><i style="background:#E4147E"></i><i style="background:#00A8A0"></i><i style="background:#1D1147"></i></span><span><b>Night</b> brights on deep indigo</span></li>
      <li><span class="sw-dot" aria-hidden="true"><i style="background:#00A8A0"></i><i style="background:#3FA34D"></i><i style="background:#FFB000"></i><i style="background:#FFF4DC"></i></span><span><b>Fresh</b> peacock · cilantro · marigold on cream</span></li>
    </ul>
  </div>
</header>
<nav class="bar" aria-label="Swatch display options">
  <div class="wrap">
    <div class="grp" role="group" aria-label="Colourway"><span>Show</span>
      <button class="pill" data-show="all" aria-pressed="true">All</button><button class="pill" data-show="sunset" aria-pressed="false">Sunset</button><button class="pill" data-show="night" aria-pressed="false">Night</button><button class="pill" data-show="fresh" aria-pressed="false">Fresh</button>
    </div>
    <div class="grp" role="group" aria-label="Repeat scale"><span>Scale</span>
      <button class="pill" data-scale=".6" aria-pressed="false">S</button><button class="pill" data-scale="1" aria-pressed="true">M</button><button class="pill" data-scale="1.5" aria-pressed="false">L</button>
    </div>
  </div>
</nav>
<main class="wrap" data-show="all">
  ${sections}
  <section class="walls" id="walls" aria-labelledby="hw">
    <h2 id="hw">On the wall</h2>
    <p>Our two favourites at room scale: Jaipur Arches for a bright daytime feature wall, Marigold Garland (night) for the evening dining room.</p>
    ${walls}
  </section>
  <section class="notes" aria-labelledby="hn">
    <h2 id="hn">Using the tiles</h2>
    <ul>
      <li><b>Web:</b> <code>background: url(07-jaipur-arches-sunset.svg) 0 0 / 240px repeat;</code> — keep the size a whole number of pixels so the repeat stays crisp.</li>
      <li><b>Print:</b> the SVGs are vector and flat-colour (no gradients or transparency), so any repeat size works. Suggested repeat: 45–60&nbsp;cm for wallpaper, 12–18&nbsp;cm for tissue &amp; wraps, 6–8&nbsp;cm for napkins.</li>
      <li><b>Files:</b> 240- or 320-unit square tiles, all under 30&nbsp;KB, colours taken straight from <code>brand/tokens.css</code>. PNG previews (1024&nbsp;px, 4×4 repeats) live in <code>png/</code>.</li>
    </ul>
  </section>
</main>
<footer>
  <div class="wrap">
    <p>Independent design concept prepared as a proposal — not the official Curry District website.</p>
    <p>Original artwork; motifs are flowers, food and everyday objects — no deities or sacred symbols.</p>
  </div>
</footer>
<script>
(function () {
  var main = document.querySelector('main'), root = document.documentElement;
  function store(k, v) { try { localStorage.setItem('bzp-' + k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem('bzp-' + k); } catch (e) { return null; } }
  function setShow(v) {
    main.setAttribute('data-show', v);
    document.querySelectorAll('[data-show].pill').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-show') === v)); });
    store('show', v);
  }
  function setScale(v) {
    root.style.setProperty('--scale', v);
    document.querySelectorAll('[data-scale]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-scale') === v)); });
    store('scale', v);
  }
  document.querySelectorAll('[data-show].pill').forEach(function (b) { b.addEventListener('click', function () { setShow(b.getAttribute('data-show')); }); });
  document.querySelectorAll('[data-scale]').forEach(function (b) { b.addEventListener('click', function () { setScale(b.getAttribute('data-scale')); }); });
  var s = read('show'), c = read('scale');
  if (s && /^(all|sunset|night|fresh)$/.test(s)) setShow(s);
  if (c && /^(\\.6|1|1\\.5)$/.test(c)) setScale(c);
})();
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(DIR, 'index.html'), html);

// ---------------- README.md ----------------
let md = `# Curry District · Bazaar surface patterns

Eight seamless repeat patterns for **Direction A · BAZAAR**, each in three colourways (24 tiles).
Open \`index.html\` for the swatch book (filters, scale toggle, two wall mock-ups).

| | Colourway | Palette (from \`brand/tokens.css\`) |
|---|---|---|
| \`-sunset\` | saffron · marigold · rani on cream | #FF6A13 · #FFB000 · #E4147E on #FFF4DC, ink #1D1147 lines |
| \`-night\` | brights on deep indigo | #FFB000 · #FF6A13 · #E4147E · #00A8A0 · #FFF4DC on #1D1147 |
| \`-fresh\` | peacock · cilantro · marigold on cream | #00A8A0 · #3FA34D · #FFB000 on #FFF4DC, ink #1D1147 lines |

Small accents: chili #D62839 (chilies, star anise, terrazzo chips), cilantro #3FA34D (chili caps, leaves), plus the semantic tokens #FFFFFF (citrus pith, glass), #FFE7B8 (chai foam, tiffin rails) and #3A1B7A (night arch windows). No gradients, no transparency — every fill is a flat palette colour, so the files separate cleanly for screen/spot printing.

## Patterns

| # | Pattern | Tile | What it is | Recommended uses |
|---|---|---|---|---|
`;
for (const p of P) {
  md += `| ${p.n} | **${p.name}** | ${p.t}×${p.t} | ${p.blurb} | ${p.uses.join(', ')} |\n`;
}
md += `
## Files

| Pattern | Sunset | Night | Fresh |
|---|---|---|---|
`;
for (const p of P) {
  md += `| ${p.n} ${p.name} | ` + CWS.map((c) => { const f = `${p.n}-${p.slug}-${c.key}`; return `[svg](${f}.svg) (${kb(f + '.svg')} KB) · [png](png/${f}.png)`; }).join(' | ') + ' |\n';
}
md += `
* \`png/\` — 1024×1024 previews, each tile repeated 4×4. Wall mock-ups: \`png/wall-07-jaipur-arches-sunset.png\`, \`png/wall-01-marigold-garland-night.png\` (1600×900).
* \`fonts/\` — Bowlby One, DM Sans, Caveat (copied from \`brand/fonts\`) for \`index.html\`.
* \`src/\` — the generator. \`node src/build.js\` rewrites all SVGs; \`node src/export-png.js\` the previews; \`node src/site.js\` this README + index.html. Colourways are plain objects at the top of each \`src/pNN-*.js\`, so a new colourway is a 3-line change.

## Using them

* **Web/CSS:** \`background: url(07-jaipur-arches-sunset.svg) 0 0 / 240px repeat;\` — use a whole-pixel size (e.g. 160/200/240/320 px). Spice Confetti and Block-Print Booti are the calmest behind text; put text on a solid card over the busier ones.
* **Print:** vector, scale freely. Suggested repeat sizes: wallpaper/murals 45–60 cm, wraps & bag tissue 12–18 cm, napkins 6–8 cm, cup sleeves 5–7 cm. Night colourways are a solid #1D1147 flood — proof on the actual stock before a run.
* **Pairing:** one pattern per surface, plus solid colour. Tiffin Stripes and Jaipur Arches are directional (keep upright); the rest can rotate.

## Seamless check (how it was verified)

Every motif is placed on a torus: anything crossing a tile edge is re-emitted on the opposite edge. \`src/qa.js\` renders each tile 3×3 on a canvas and diffs it against an un-clipped 3×3 reference built from the same placements; a single missing twin shows up as thousands of clustered bad pixels (tested), while all 24 tiles show only scattered anti-aliasing pixels (largest cluster ≤ 6 px, invisible at 8× zoom). Each tile was also eyeballed tiled with the seams moved to the middle of the frame.

## Cultural notes

Motifs are flowers (genda-phool, jasmine-white heads, booti), food and spices, chai ware, tiffin carriers and architecture (Jaipur cusped arches). No deities, no religious symbols, no lotus/diya/kalash iconography, no caricature.
`;
fs.writeFileSync(path.join(DIR, 'README.md'), md);
console.log('index.html + README.md written');

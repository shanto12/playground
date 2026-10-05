// Builds index.html — the Royal icon contact sheet (sprite inlined so it works from file:// too).
const GROUPS = [
  ['spice', 'Spice scale', 'Five levels, double-coded: the chili fills with ruby and the gems count up.'],
  ['diet', 'Diet marks', 'The Indian standard square marks — dot for veg, triangle for non-veg — on an ivory plate.'],
  ['food', 'Food', 'From the tandoor to Sweet Street: sixteen dishes drawn in one hand.'],
  ['utility', 'Utility', 'Ordering, finding, calling, celebrating.'],
  ['social', 'Social', 'Style-matched link glyphs. Generic shapes — not the platforms’ official logos.'],
];
const SPICE = ['Mild', 'Medium', 'Hot', 'Extra-Hot', 'District Hot'];
const ZONES = [
  ['samosa', 'Starters Square'], ['tandoor-oven', 'Tandoor Quarter'], ['curry-bowl', 'Curry Quarter'],
  ['biryani-pot-handi', 'Biryani Boulevard'], ['spoon-fork', 'Indo-Chinese Alley'], ['naan', 'Bread Bazaar'],
  ['gulab-jamun', 'Sweet Street'], ['chai-cup', 'Chai & Coolers'],
];

const ic = (name, cls = 'ic', extra = '') => `<svg class="${cls}" ${extra} aria-hidden="true" focusable="false"><use href="#icon-${name}"/></svg>`;

export function page({ icons, spriteInner }) {
  const byGroup = (g) => icons.filter((i) => i.group === g);
  const tiles = (surface) => GROUPS.map(([g, title, blurb]) => `
      <div class="group">
        <div class="group-head"><h3>${title}</h3><p>${blurb}</p><span class="count">${byGroup(g).length}</span></div>
        <ul class="tiles" role="list">${byGroup(g).map((i) => `
          <li><button class="tile" type="button" data-name="${i.name}" aria-label="${i.label} — copy snippet">${ic(i.name)}<span class="nm">${i.name}</span></button></li>`).join('')}
        </ul>
      </div>`).join('');
  const strip = (size) => `<div class="strip" style="--s:${size}px">${icons.map((i) => `<span title="${i.name}">${ic(i.name, 'ic')}</span>`).join('')}</div>`;
  const monoSet = ['phone', 'map-pin', 'clock', 'shopping-bag', 'delivery-scooter', 'heart', 'star', 'menu-book', 'party-tray', 'calendar', 'gift-card', 'chai-cup'];
  const recolour = [
    ['ivory on emerald', '#FBF3E4', '#0F4D3F'], ['gold-lt on plum', '#F7D98A', '#4B1D52'], ['blush on ruby', '#F4C9BB', '#A3173F'],
    ['ruby on blush', '#A3173F', '#F4C9BB'], ['peacock on ivory', '#117C86', '#FBF3E4', '#0B5F67'], ['ink on ivory (print)', '#160B26', '#FBF3E4'],
  ];

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>Royal Icons · Curry District</title>
<meta name="description" content="Curry District Royal icon set — ${icons.length} gold line icons on a 64-grid with jewel accents, sprite and mono variants.">
<link rel="icon" href="chili-3.svg" type="image/svg+xml">
<script>document.documentElement.classList.add('js')</script>
<style>
@font-face{font-family:'Fraunces';font-style:normal;font-weight:300 900;font-display:swap;src:url(fonts/fraunces.woff2) format('woff2')}
@font-face{font-family:'Fraunces';font-style:italic;font-weight:300 900;font-display:swap;src:url(fonts/fraunces-italic.woff2) format('woff2')}
@font-face{font-family:'Hanken Grotesk';font-style:normal;font-weight:300 800;font-display:swap;src:url(fonts/hanken.woff2) format('woff2')}
:root{
  --ink:#160B26;--ink-2:#1E1033;--plum:#4B1D52;--emerald:#0F4D3F;--peacock:#117C86;--ruby:#A3173F;
  --gold:#E9A63A;--gold-lt:#F7D98A;--gold-dk:#B7791F;--ivory:#FBF3E4;--ivory-2:#F3E4C8;--blush:#F4C9BB;
  --text-inv:#FBF3E4;--gold-text:#8A5A16;--muted-inv:#CDBFD8;--muted:#6B5A73;
  --hair:rgba(233,166,58,.28);--hair-ivory:rgba(183,121,31,.35);
  --foil:linear-gradient(135deg,#B7791F 0%,#F7D98A 38%,#E9A63A 58%,#B7791F 100%);
  --r-l:28px;--r-m:16px;--gutter:16px;
  --ease:cubic-bezier(.22,1,.36,1);
  --display:'Fraunces',Georgia,serif;--body:'Hanken Grotesk',system-ui,-apple-system,'Segoe UI',sans-serif;
  color-scheme:dark;
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--ink);color:var(--text-inv);font:400 16px/1.55 var(--body);overflow-x:hidden}
body::before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.07;z-index:0;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cg fill='none' stroke='%23E9A63A' stroke-width='1'%3E%3Cpath d='M28 4 52 28 28 52 4 28Z'/%3E%3Ccircle cx='28' cy='28' r='9'/%3E%3Cpath d='M0 0 8 8M56 0 48 8M0 56 8 48M56 56 48 48'/%3E%3C/g%3E%3C/svg%3E");}
main,header,footer{position:relative;z-index:1}
.wrap{max-width:1180px;margin:0 auto;padding:0 var(--gutter)}
a{color:var(--gold-lt)}
.ic{width:var(--s,48px);height:var(--s,48px);display:block;flex:none}
.foil{background:var(--foil);-webkit-background-clip:text;background-clip:text;color:transparent}
.eyebrow{font:600 12px/1.2 var(--body);letter-spacing:.16em;text-transform:uppercase;color:var(--gold)}
h1,h2,h3{font-family:var(--display);font-weight:600;letter-spacing:-.01em;line-height:1.05;margin:0}
h2{font-size:clamp(30px,6vw,46px)}
h2 em{font-style:italic;font-weight:400}
.lede{color:var(--muted-inv);max-width:60ch}

/* ── header ── */
header{padding:28px 0 8px}
.hero{display:grid;gap:28px;align-items:center}
.hero h1{font-size:clamp(44px,12vw,92px);margin:14px 0 14px;font-weight:800}
.hero h1 i{font-weight:400}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0 0;padding:0;list-style:none}
.chips li{border:1px solid var(--hair);border-radius:999px;padding:6px 12px;font-size:13px;color:var(--gold-lt)}
.arch{position:relative;border:1px solid var(--hair);border-radius:999px 999px var(--r-l) var(--r-l);padding:34px 18px 22px;
  background:radial-gradient(120% 80% at 50% 10%,rgba(233,166,58,.16),transparent 60%),linear-gradient(180deg,#24113a,#160B26);
  display:grid;grid-template-columns:repeat(3,1fr);gap:14px;justify-items:center;max-width:420px;width:100%;margin:0 auto}
.arch::after{content:"";position:absolute;inset:8px;border:1px dashed rgba(233,166,58,.18);border-radius:999px 999px 20px 20px;pointer-events:none}
.arch .ic{--s:clamp(68px,22vw,104px);filter:drop-shadow(0 0 18px rgba(233,166,58,.18))}
.arch .ic.lead{grid-column:1/-1;--s:clamp(108px,34vw,150px)}
nav.toc{position:sticky;top:0;z-index:5;background:rgba(22,11,38,.88);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-bottom:1px solid var(--hair);margin-top:28px}
nav.toc ul{display:flex;gap:4px;overflow-x:auto;list-style:none;margin:0;padding:6px var(--gutter);scrollbar-width:none;max-width:1180px;margin:0 auto}
nav.toc ul::-webkit-scrollbar{display:none}
nav.toc a{display:inline-flex;align-items:center;min-height:44px;padding:0 14px;border-radius:999px;text-decoration:none;color:var(--gold-lt);font-size:14px;white-space:nowrap}
nav.toc a:hover,nav.toc a:focus-visible{background:rgba(233,166,58,.12)}

section{padding:56px 0 8px;scroll-margin-top:60px}
.sec-head{display:grid;gap:10px;margin-bottom:26px}

/* ── spice & diet ── */
.scale{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
.scale figure{margin:0;text-align:center;border:1px solid var(--hair);border-radius:var(--r-m);padding:12px 4px 10px;background:linear-gradient(180deg,rgba(255,255,255,.03),transparent)}
.scale .ic{--s:clamp(52px,14vw,120px);margin:0 auto 6px}
.scale figcaption{font-size:12px;line-height:1.25;color:var(--muted-inv)}
.scale figcaption b{display:block;font:600 15px/1.2 var(--display);color:var(--gold-lt)}
.panel{background:var(--ivory);color:var(--ink);border-radius:var(--r-l);padding:22px 18px;margin-top:16px;--icon-line:var(--gold-dk)}
.panel h3{font-size:22px}
.legend{display:flex;flex-wrap:wrap;gap:10px 18px;margin-top:14px;font-size:14px;color:#3b2a45}
.legend span{display:inline-flex;align-items:center;gap:8px}
.legend .ic{--s:28px}
.zones{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:18px;padding:0;list-style:none}
.zones li{display:flex;align-items:center;gap:10px;border:1px solid var(--hair-ivory);border-radius:14px;padding:8px 10px;font:600 15px/1.2 var(--display);min-height:56px}
.zones .ic{--s:36px}
.diet{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px}
.diet figure{margin:0;display:flex;align-items:center;gap:12px;border:1px solid var(--hair);border-radius:var(--r-m);padding:12px}
.diet .ic{--s:56px}
.diet b{font:600 18px/1.1 var(--display);color:var(--gold-lt);display:block}
.diet small{display:block;color:var(--muted-inv);font-size:13px;line-height:1.35;margin-top:4px}

/* ── tiles ── */
.surface{border-radius:var(--r-l);padding:20px 14px 8px;border:1px solid var(--hair)}
.surface.midnight{background:linear-gradient(180deg,#1d0f30,#160B26)}
.surface.ivory{background:var(--ivory);color:var(--ink);border-color:var(--hair-ivory);--icon-line:var(--gold-dk)}
.group{margin-bottom:22px}
.group-head{display:grid;grid-template-columns:1fr auto;gap:2px 12px;align-items:baseline;margin:0 4px 12px}
.group-head h3{font-size:22px}
.group-head p{grid-column:1/-1;margin:0;font-size:13.5px;color:var(--muted-inv);order:3}
.surface.ivory .group-head p{color:var(--muted)}
.count{font:600 12px var(--body);color:var(--gold);border:1px solid var(--hair);border-radius:999px;padding:2px 9px}
.surface.ivory .count{color:var(--gold-text);border-color:var(--hair-ivory)}
.tiles{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:8px}
.tile{all:unset;box-sizing:border-box;cursor:pointer;width:100%;min-height:118px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:14px 6px 10px;border-radius:18px;
  border:1px solid rgba(233,166,58,.14);background:rgba(255,255,255,.02);transition:transform .35s var(--ease),border-color .35s var(--ease),background .35s var(--ease)}
.tile .ic{--s:56px}
.tile .nm{font-size:11.5px;letter-spacing:.01em;color:var(--muted-inv);text-align:center;line-height:1.2;word-break:break-word}
.surface.ivory .tile{border-color:rgba(183,121,31,.22);background:rgba(255,255,255,.5)}
.surface.ivory .tile .nm{color:var(--muted)}
.tile:hover{transform:translateY(-2px);border-color:rgba(233,166,58,.5);background:rgba(233,166,58,.06)}
.tile:focus-visible{outline:2px solid var(--gold);outline-offset:2px}

/* ── size ramp ── */
.ramp-ctl{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 16px}
.ramp-ctl span{font-size:13px;color:var(--muted-inv);margin-right:4px}
.seg{all:unset;cursor:pointer;min-height:44px;padding:0 16px;border-radius:999px;border:1px solid var(--hair);color:var(--gold-lt);font-size:14px;display:inline-flex;align-items:center}
.seg[aria-pressed="true"]{background:var(--gold);color:var(--ink);border-color:var(--gold);font-weight:600}
.seg:focus-visible{outline:2px solid var(--gold-lt);outline-offset:2px}
.ramp{display:grid;gap:12px}
.ramp-row{display:grid;gap:0;border-radius:var(--r-m);overflow:hidden;border:1px solid var(--hair)}
.ramp-row h3{font:600 13px/1 var(--body);letter-spacing:.12em;text-transform:uppercase;padding:12px 14px 0;color:var(--gold)}
.ramp-pair{display:grid;grid-template-columns:1fr}
.strip{display:flex;flex-wrap:wrap;gap:calc(var(--s) * .42);padding:14px}
.ramp-pair .dk{background:#160B26}
.ramp-pair .lt{background:var(--ivory);--icon-line:var(--gold-dk)}

/* ── recolour ── */
.swatches{display:grid;grid-template-columns:1fr;gap:10px}
.sw{border-radius:var(--r-m);padding:14px;display:grid;gap:10px}
.sw p{margin:0;font-size:13px;font-weight:600;letter-spacing:.02em}
.sw .row{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;justify-items:center}
.sw .ic{--s:clamp(34px,10vw,44px)}
.ui-demo{margin-top:18px;display:grid;gap:14px}
.btns{display:flex;flex-wrap:wrap;gap:10px}
.btn{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:10px;min-height:48px;padding:0 20px 0 14px;border-radius:999px;font:600 15px var(--body)}
.btn .ic{--s:26px}
.btn.gold{background:var(--foil);color:var(--ink)}
.btn.ghost{border:1px solid var(--gold);color:var(--gold-lt)}
.btn.ruby{background:var(--ruby);color:var(--ivory)}
.btn.emerald{background:var(--emerald);color:var(--ivory)}
.btn:focus-visible{outline:2px solid var(--gold-lt);outline-offset:3px}
.tabbar{display:grid;grid-template-columns:repeat(5,1fr);background:var(--ivory);border-radius:22px;padding:6px;max-width:440px}
.tabbar a{display:flex;flex-direction:column;align-items:center;gap:3px;min-height:56px;justify-content:center;border-radius:16px;text-decoration:none;color:var(--muted);font-size:11.5px;font-weight:600}
.tabbar a .ic{--s:28px}
.tabbar a[aria-current="page"]{background:var(--ink);color:var(--gold)}
.chipline{display:flex;flex-wrap:wrap;gap:8px}
.chip{display:inline-flex;align-items:center;gap:8px;border-radius:999px;padding:6px 14px 6px 8px;font-size:14px;background:rgba(255,255,255,.04);border:1px solid var(--hair);color:var(--ivory)}
.chip .ic{--s:24px}
pre{margin:0;overflow-x:auto;background:#0f0719;border:1px solid var(--hair);border-radius:var(--r-m);padding:14px 16px;font:13px/1.6 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#EADFF0}
pre .c{color:#9b86ad}pre .k{color:var(--gold-lt)}

/* ── construction ── */
.build{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.build figure:first-child{grid-column:1/-1}
.build figure{margin:0;border:1px solid var(--hair);border-radius:var(--r-m);padding:12px;background:#1a0d2c}
.build figure svg.frame{width:100%;height:auto;display:block}
.build figcaption{font-size:13px;color:var(--muted-inv);margin-top:8px}
.specs{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:14px;padding:0;list-style:none}
.specs li{border-top:1px solid var(--hair);padding-top:10px;font-size:14px;color:var(--muted-inv)}
.specs b{display:block;font:600 20px/1.2 var(--display);color:var(--gold-lt)}
.swatchdots{display:flex;gap:6px;margin-top:6px}
.swatchdots i{width:18px;height:18px;border-radius:50%;border:1px solid rgba(255,255,255,.25)}

footer{padding:56px 0 40px;color:var(--muted-inv);font-size:13px}
footer .rule{height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);opacity:.5;margin-bottom:18px}
.toast{position:fixed;left:50%;bottom:22px;transform:translate(-50%,20px);opacity:0;background:var(--ivory);color:var(--ink);padding:12px 18px;border-radius:999px;font-size:14px;font-weight:600;box-shadow:0 18px 40px -18px rgba(0,0,0,.6);transition:opacity .3s var(--ease),transform .3s var(--ease);z-index:20;max-width:calc(100vw - 32px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.toast.on{opacity:1;transform:translate(-50%,0)}
.js .reveal{opacity:0;transform:translateY(14px);transition:opacity .8s var(--ease),transform .8s var(--ease)}
.js .reveal.in{opacity:1;transform:none}

@media (min-width:640px){
  .zones{grid-template-columns:repeat(4,1fr)}
  .swatches{grid-template-columns:repeat(2,1fr)}
  .ramp-pair{grid-template-columns:1fr 1fr}
  .tiles{grid-template-columns:repeat(auto-fill,minmax(118px,1fr))}
}
@media (min-width:960px){
  :root{--gutter:28px}
  .hero{grid-template-columns:1.2fr 1fr}
  .swatches{grid-template-columns:repeat(3,1fr)}
  .build{grid-template-columns:repeat(3,1fr)}
  .build figure:first-child{grid-column:auto}
  .tile .ic{--s:64px}
  .surface{padding:28px 22px 12px}
}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}.reveal{opacity:1;transform:none}}
</style>
</head>
<body>
<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">${spriteInner}</svg>

<header>
  <div class="wrap hero">
    <div>
      <p class="eyebrow">Curry District · Direction B</p>
      <h1><span class="foil">Royal</span> <i>icons</i></h1>
      <p class="lede">${icons.length} saffron-gold line icons drawn on one 64-grid — with a little emerald, ruby and peacock enamel, and arch &amp; jali details you notice the second time you look. Tap any icon to copy its snippet.</p>
      <ul class="chips" role="list"><li>64 × 64 grid</li><li>1.75 stroke · round caps</li><li>Gold + jewel accents</li><li>Mono via currentColor</li><li>SVG files + sprite</li></ul>
    </div>
    <div class="arch" aria-hidden="true">
      ${ic('biryani-pot-handi', 'ic lead')}
      ${ic('chai-cup')}${ic('chili-5')}${ic('tandoor-oven')}
    </div>
  </div>
  <nav class="toc" aria-label="Sections"><ul role="list">
    <li><a href="#spice">Spice &amp; diet</a></li><li><a href="#midnight">On midnight</a></li><li><a href="#ivory">On ivory</a></li>
    <li><a href="#sizes">48 · 32 · 24</a></li><li><a href="#recolour">Recolour</a></li><li><a href="#grid">Grid</a></li><li><a href="#use">Use</a></li>
  </ul></nav>
</header>

<main>
  <section id="spice" class="wrap reveal">
    <div class="sec-head"><p class="eyebrow">Menu system</p><h2>How hot? <em>Read it at a glance.</em></h2>
      <p class="lede">Each level is double-coded — the chili fills with ruby from stem to tip, and the gems underneath count up — so it still reads in one colour, in print, or at 24&nbsp;px beside a dish name.</p></div>
    <div class="scale">${SPICE.map((s, i) => `<figure>${ic(`chili-${i + 1}`)}<figcaption><b>${i + 1}</b>${s}</figcaption></figure>`).join('')}</div>
    <div class="diet">
      <figure>${ic('veg-mark')}<figcaption><b>Veg</b><small>Green dot in a green square</small></figcaption></figure>
      <figure>${ic('nonveg-mark')}<figcaption><b>Non-veg</b><small>Brown triangle in a brown square</small></figcaption></figure>
    </div>
    <div class="panel">
      <p class="eyebrow" style="color:var(--gold-text)">On the menu · sample legend</p>
      <h3>Find your district</h3>
      <ul class="zones" role="list">${ZONES.map(([n, z]) => `<li>${ic(n)}${z}</li>`).join('')}</ul>
      <div class="legend">
        ${SPICE.map((s, i) => `<span>${ic(`chili-${i + 1}`)}${s}</span>`).join('')}
        <span>${ic('veg-mark')}Veg</span><span>${ic('nonveg-mark')}Non-veg</span>
      </div>
    </div>
  </section>

  <section id="midnight" class="wrap reveal">
    <div class="sec-head"><p class="eyebrow">The full set · primary surface</p><h2>On midnight <em>aubergine</em></h2>
      <p class="lede">Gold #E9A63A strokes with jewel-tone enamel. This is the home surface for the Royal direction: night menus, the website header, dark social tiles.</p></div>
    <div class="surface midnight">${tiles('dark')}</div>
  </section>

  <section id="ivory" class="wrap reveal">
    <div class="sec-head"><p class="eyebrow">The full set · light surface</p><h2>On <em>ivory</em></h2>
      <p class="lede">Bright gold fades on cream, so on light grounds the line drops to gold-dark #B7791F (≥ 3:1). Same drawings, from <code>on-ivory/</code> or one CSS variable on the sprite.</p></div>
    <div class="surface ivory">${tiles('ivory')}</div>
  </section>

  <section id="sizes" class="wrap reveal">
    <div class="sec-head"><p class="eyebrow">Real-world sizes</p><h2>48 · 32 · 24 <em>px</em></h2>
      <p class="lede">The whole set side by side at UI sizes. Below 32&nbsp;px the hairline can be thickened with one variable — try it.</p></div>
    <div class="ramp-ctl" role="group" aria-label="Stroke weight"><span>Stroke</span>
      <button class="seg" type="button" data-w="1.5" aria-pressed="false">1.5</button>
      <button class="seg" type="button" data-w="1.75" aria-pressed="true">1.75 default</button>
      <button class="seg" type="button" data-w="2.25" aria-pressed="false">2.25 small-size</button>
    </div>
    <div class="ramp" id="ramp">
      ${[48, 32, 24].map((s) => `<div class="ramp-row"><h3>${s} px</h3><div class="ramp-pair"><div class="dk">${strip(s)}</div><div class="lt">${strip(s)}</div></div></div>`).join('')}
    </div>
  </section>

  <section id="recolour" class="wrap reveal">
    <div class="sec-head"><p class="eyebrow">Mono variants</p><h2>Any colour, <em>one line of CSS</em></h2>
      <p class="lede">Every icon has a single-colour twin that paints with <code>currentColor</code>: lines solid, enamel as a 30% tint, diet marks and gems solid. Set <code>color</code> and it follows.</p></div>
    <div class="swatches">${recolour.map(([label, fg, bg, lc]) => `<div class="sw" style="background:${bg};color:${fg}"><p${lc ? ` style="color:${lc}"` : ''}>${label}</p><div class="row">${monoSet.slice(0, 6).map((n) => ic(`${n}-mono`)).join('')}</div><div class="row">${monoSet.slice(6).map((n) => ic(`${n}-mono`)).join('')}</div></div>`).join('')}</div>
    <div class="ui-demo">
      <div class="btns">
        <a class="btn gold" href="#use">${ic('phone-mono')}Call to order</a>
        <a class="btn ghost" href="#use">${ic('map-pin-mono')}Directions</a>
        <a class="btn ruby" href="#use">${ic('delivery-scooter-mono')}Delivery</a>
        <a class="btn emerald" href="#use">${ic('party-tray-mono')}Catering</a>
      </div>
      <nav class="tabbar" aria-label="Sample app tab bar">
        <a href="#use" aria-current="page">${ic('menu-book-mono')}Menu</a>
        <a href="#use">${ic('shopping-bag-mono')}Order</a>
        <a href="#use">${ic('map-pin-mono')}Visit</a>
        <a href="#use">${ic('party-tray-mono')}Catering</a>
        <a href="#use">${ic('phone-mono')}Call</a>
      </nav>
      <div class="chipline">
        <span class="chip">${ic('clock')}Hours</span><span class="chip">${ic('star')}Reviews</span><span class="chip">${ic('share')}Share</span><span class="chip">${ic('instagram-glyph')}Follow</span>
      </div>
    </div>
  </section>

  <section id="grid" class="wrap reveal">
    <div class="sec-head"><p class="eyebrow">Construction</p><h2>One grid, <em>one hand</em></h2>
      <p class="lede">64 × 64 artboard, live area 6–58 (dashed: keyline square 52, circle Ø52, inner square 44), 1.75 hairline with round caps and joins. Accents never touch the outline weight — they sit inside it like enamel in brass.</p></div>
    <div class="build">${['curry-bowl', 'chili-3', 'map-pin'].map((n) => `<figure><svg class="frame" viewBox="-4 -4 72 72" aria-hidden="true">
      <g fill="none" stroke="rgba(233,166,58,.12)" stroke-width=".12">${Array.from({ length: 65 }, (_, k) => `<path d="M${k} 0V64M0 ${k}H64"/>`).join('')}</g>
      <g fill="none" stroke="rgba(233,166,58,.28)" stroke-width=".2"><path d="M8 0V64M16 0V64M24 0V64M32 0V64M40 0V64M48 0V64M56 0V64M0 8H64M0 16H64M0 24H64M0 32H64M0 40H64M0 48H64M0 56H64"/></g>
      <g fill="none" stroke="#117C86" stroke-width=".35" stroke-dasharray="1 1"><rect x="6" y="6" width="52" height="52" rx="2"/><circle cx="32" cy="32" r="26"/><rect x="10" y="10" width="44" height="44" rx="4"/></g>
      <use href="#icon-${n}"/></svg><figcaption>${n}</figcaption></figure>`).join('')}</div>
    <ul class="specs" role="list">
      <li><b>64 × 64</b>artboard, 6 px live-area margin</li>
      <li><b>1.75</b>stroke, round caps &amp; joins</li>
      <li><b>Dots</b>jali dot-bands: 0-length dashes every 4 units</li>
      <li><b>Palette</b><span class="swatchdots"><i style="background:#E9A63A"></i><i style="background:#B7791F"></i><i style="background:#0F4D3F"></i><i style="background:#A3173F"></i><i style="background:#117C86"></i><i style="background:#FBF3E4"></i></span></li>
    </ul>
  </section>

  <section id="use" class="wrap reveal">
    <div class="sec-head"><p class="eyebrow">For the build</p><h2>Drop-in <em>usage</em></h2></div>
    <div style="display:grid;gap:12px">
<pre><span class="c">&lt;!-- 1 · plain file (gold for dark grounds; on-ivory/ for light grounds) --&gt;</span>
&lt;img src="icons/royal/chai-cup.svg" width="32" height="32" alt="Chai"&gt;

<span class="c">&lt;!-- 2 · sprite, full colour — themeable with CSS variables --&gt;</span>
&lt;svg class="icon" aria-hidden="true"&gt;&lt;use href="icons/royal/sprite.svg#icon-chili-3"/&gt;&lt;/svg&gt;

<span class="c">&lt;!-- 3 · sprite, mono — paints with currentColor --&gt;</span>
&lt;svg class="icon" style="color:#0F4D3F" aria-hidden="true"&gt;&lt;use href="icons/royal/sprite.svg#icon-phone-mono"/&gt;&lt;/svg&gt;</pre>
<pre><span class="c">/* sprite variables (defaults shown) */</span>
.icon        { <span class="k">width</span>:32px; <span class="k">height</span>:32px; }
.on-ivory    { <span class="k">--icon-line</span>:#B7791F; }   <span class="c">/* gold → gold-dark on light grounds */</span>
.icon--small { <span class="k">--icon-stroke</span>:2.25; }   <span class="c">/* optical weight at ≤ 24px */</span>
<span class="c">/* also: --icon-emerald --icon-ruby --icon-peacock --icon-veg --icon-nonveg --icon-plate --icon-accent-opacity */</span></pre>
    </div>
  </section>
</main>

<footer>
  <div class="wrap">
    <div class="rule"></div>
    <p>Curry District · Royal icon set v1 · ${icons.length} icons · SVG, sprite &amp; mono. Social glyphs are generic, style-matched link markers — follow each platform’s brand rules where official marks are required.</p>
    <p><em>Independent design concept prepared as a proposal — not the official Curry District website.</em></p>
  </div>
</footer>
<div class="toast" role="status" aria-live="polite"></div>
<script>
(() => {
  const toast = document.querySelector('.toast'); let t;
  const say = (m) => { toast.textContent = m; toast.classList.add('on'); clearTimeout(t); t = setTimeout(() => toast.classList.remove('on'), 1800); };
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('.tile'); if (!b) return;
    const n = b.dataset.name;
    const snip = '<svg class="icon" aria-hidden="true"><use href="icons/royal/sprite.svg#icon-' + n + '"/></svg>';
    try { await navigator.clipboard.writeText(snip); say('Copied  #icon-' + n); }
    catch { say('#icon-' + n + '  ·  ' + n + '.svg'); }
  });
  const ramp = document.getElementById('ramp');
  document.querySelectorAll('.seg').forEach((s) => s.addEventListener('click', () => {
    document.querySelectorAll('.seg').forEach((x) => x.setAttribute('aria-pressed', String(x === s)));
    ramp.style.setProperty('--icon-stroke', s.dataset.w);
  }));
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' }) : null;
  document.querySelectorAll('.reveal').forEach((el) => io ? io.observe(el) : el.classList.add('in'));
})();
</script>
</body>
</html>
`;
}

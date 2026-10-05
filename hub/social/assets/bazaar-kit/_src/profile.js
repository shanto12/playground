// Profile avatar, Facebook cover (+ crop guide), Google Business Profile set.
// GBP specs from research/social_gbp_playbook.md §A3 — sourced from secondary
// summaries [S, M]; Google's own Help page could not be opened, so verify in the dashboard.
const L = require('./lib');
const { ol, C, dish, icon, logo, sunburst, sparkle, page, patternUrl, inlineArrow, furl, BRAND, KIT } = L;
const { footer, FOOT_CSS, kicker, halo } = require('./parts');

const HERO_L = furl(BRAND + '/illustrations/bazaar/hero/hero-landscape-static.svg');
// blank shop sign in hero-landscape (1600×1000 space): centre (798,457), ~315×79
const signAt = (s, ox, oy) => ({ x: 798 * s + ox, y: 457 * s + oy, h: 74 * s });

function avatarBody(S) { // S = canvas size (square)
  const k = S / 1080;
  return `${sunburst({ w: S, h: S, cx: S / 2, cy: S / 2, n: 32, a: C.saffron, b: C.marigold, patB: '03-block-print-booti-sunset', patScale: .9 * k, patOpacity: .5 })}
    ${halo({ w: S, h: S, cx: S / 2, cy: S / 2, r: 462 * k, bumps: 46, ring: C.rani, disc: C.cream, sw: 8 * k, inner: true })}
    ${logo('emblem.svg', { style: `position:absolute;left:50%;top:${S / 2 + 6 * k}px;transform:translate(-50%,-50%);height:${600 * k}px;width:auto` })}`;
}

const items = [
{ id: 'avatar-profile-1080', file: 'avatar-profile-1080', w: 1080, h: 1080, type: 'image', tags: ['cover'],
  title: 'Profile avatar · 1080',
  caption: 'Built from the logo emblem: the steaming-bowl gate sits well inside the circle crop, framed by the District-seal scallop.',
  html: () => page({ w: 1080, h: 1080, bg: C.saffron, title: 'Avatar', body: avatarBody(1080) }) },

{ id: 'avatar-crop-check', file: 'avatar-crop-check', w: 1080, h: 640, type: 'image', stage: 2, tags: ['cover', 'guide'],
  title: 'Avatar · crop & size check',
  caption: 'Circle-cropped at 320, 160, 80 and 40px on light and dark: the emblem stays readable even at comment size.',
  html: () => page({ w: 1080, h: 640, bg: '#FFFFFF', title: 'Avatar crop check', css: `
    .r{position:absolute;left:0;right:0;height:320px;display:flex;align-items:center;justify-content:center;gap:56px}
    .r.d{top:320px;background:${C.ink}} .r.l{top:0}
    .r img{border-radius:50%;display:block}
    .t{position:absolute;right:28px;font-weight:800;font-size:22px;letter-spacing:.06em;text-transform:uppercase}
  `, body: ['l', 'd'].map(m => `<div class="r ${m}">${[260, 160, 80, 40].map(z => `<img src="${furl(KIT + '/avatar-profile-1080.png')}" style="width:${z}px;height:${z}px" alt="">`).join('')}<span class="t" style="bottom:20px;color:${m === 'd' ? C.cream : C.muted}">${m === 'd' ? 'dark mode' : 'light mode'}</span></div>`).join('') }) },

// Facebook cover 1640×856: desktop shows ~1640×624 (centre band), mobile ~1522×856 (centre)
{ id: 'facebook-cover-1640', file: 'facebook-cover-1640', w: 1640, h: 856, type: 'image', tags: ['cover'],
  title: 'Facebook cover · 1640×856',
  caption: 'The District street at golden hour with our wordmark on the shop sign; all key art sits inside the overlap of the desktop and mobile crops.',
  html: () => { const s = 1.025, o = signAt(s, 0, -60); return page({ w: 1640, h: 856, bg: C.saffron, title: 'Facebook cover', css: `
    .hero{position:absolute;left:0;top:-60px;width:1640px;height:1025px}
    .sg{position:absolute;left:${o.x}px;top:${o.y}px;transform:translate(-50%,-50%)}
    .tag{position:absolute;right:120px;top:612px;background:${C.cream};border:5px solid ${C.ink};border-radius:999px;padding:10px 26px;font-weight:800;font-size:26px;letter-spacing:.06em;text-transform:uppercase;box-shadow:6px 6px 0 ${C.ink};transform:rotate(-2deg)}
  `, body: `<img class="hero" src="${HERO_L}" alt="">${logo('colourways/wordmark-horizontal--reversed.svg', { cls: 'sg', style: `height:${o.h}px;width:auto` })}<div class="tag">Indian Kitchen · Little Elm, TX</div>` }); } },

{ id: 'facebook-cover-crop-guide', file: 'facebook-cover-crop-guide', w: 1640, h: 1060, type: 'image', stage: 2, tags: ['cover', 'guide'],
  title: 'Facebook cover · crop guide',
  caption: 'Shows what desktop (centre 1640×624) and mobile (centre ~1522×856) keep, plus the profile-photo corner; crops approximate, verify after upload.',
  html: () => page({ w: 1640, h: 1060, bg: C.cream, title: 'Facebook cover crop guide', css: `
    .c{position:absolute;left:0;top:0;width:1640px;height:856px}
    .c img{width:100%;height:100%;display:block}
    .dk{position:absolute;left:0;right:0;background:rgba(29,17,71,.55)}
    .mb{position:absolute;top:0;height:856px;width:59px;background:repeating-linear-gradient(135deg,rgba(214,40,57,.6) 0 10px,rgba(214,40,57,.3) 10px 20px)}
    .box{position:absolute;border:5px dashed;border-radius:6px}
    .pp{position:absolute;left:40px;top:640px;width:300px;height:300px;border-radius:50%;border:6px dashed ${C.cream};background:rgba(29,17,71,.35)}
    .lab{position:absolute;font-weight:800;font-size:26px;letter-spacing:.04em;text-transform:uppercase;padding:6px 12px;border-radius:8px}
    .lg{position:absolute;left:40px;right:40px;top:890px;display:flex;flex-wrap:wrap;gap:16px 40px;font-weight:700;font-size:28px;color:${C.ink}}
    .lg i{display:inline-block;width:46px;height:24px;margin-right:10px;vertical-align:-4px;border-radius:4px}
  `, body: `<div class="c"><img src="${furl(KIT + '/facebook-cover-1640.png')}" alt="">
      <div class="dk" style="top:0;height:116px"></div><div class="dk" style="top:740px;height:116px"></div>
      <div class="mb" style="left:0"></div><div class="mb" style="right:0"></div>
      <div class="box" style="left:59px;top:116px;width:1522px;height:624px;border-color:${C.marigold}"></div>
      <div class="pp"></div>
      <span class="lab" style="left:72px;top:126px;background:${C.marigold};color:${C.ink}">Safe on both: 1522×624</span>
      <span class="lab" style="left:1280px;top:40px;background:${C.ink};color:${C.cream}">desktop hides top/bottom</span>
      <span class="lab" style="left:360px;top:780px;background:${C.cream};color:${C.ink}">profile photo overlaps here</span></div>
    <div class="lg"><span><i style="background:rgba(29,17,71,.55)"></i>Hidden on desktop (shows ~1640×624)</span><span><i style="background:rgba(214,40,57,.6)"></i>Hidden on mobile (shows ~1522×856)</span><span><i style="border:4px dashed ${C.marigold}"></i>Keep text and logo inside</span><span style="color:${C.muted}">Crop sizes are approximate; check after upload.</span></div>` }) },

// ── Google Business Profile ──
{ id: 'gbp-logo-720', file: 'gbp-logo-720', w: 720, h: 720, type: 'image', tags: ['gbp'],
  title: 'GBP logo · 720×720',
  caption: 'Square logo at the 720×720 the playbook cites (secondary sources, medium confidence: verify in the GBP dashboard); circle-safe too.',
  html: () => page({ w: 720, h: 720, bg: C.saffron, title: 'GBP logo', body: avatarBody(720) }) },

{ id: 'gbp-cover-1600x900', file: 'gbp-cover-1600x900', w: 1600, h: 900, type: 'image', tags: ['gbp'],
  title: 'GBP cover · 16:9',
  caption: '16:9 cover exported at 1600px with the subject centred for Google’s crops (spec from secondary sources, medium confidence: verify); swap for a real exterior photo after the shoot.',
  html: () => { const o = signAt(1, 0, -50); return page({ w: 1600, h: 900, bg: C.saffron, title: 'GBP cover', css: `
    .hero{position:absolute;left:0;top:-50px;width:1600px;height:1000px}
    .sg{position:absolute;left:${o.x}px;top:${o.y}px;transform:translate(-50%,-50%)}
  `, body: `<img class="hero" src="${HERO_L}" alt="">${logo('colourways/wordmark-horizontal--reversed.svg', { cls: 'sg', style: `height:${o.h}px;width:auto` })}` }); } },

{ id: 'gbp-post-01-biryani', file: 'gbp-post-01-biryani', w: 1200, h: 900, type: 'image', tags: ['gbp'],
  title: 'GBP post · Biryani, naan, repeat',
  caption: '4:3 Update-post image at 1200×900 (playbook spec, secondary sources: verify); dish and headline kept inside the centre for Google’s crops.',
  html: () => page({ w: 1200, h: 900, bg: C.saffron, title: 'GBP post biryani', css: FOOT_CSS + `
    .hl{position:absolute;left:640px;top:180px;font-size:92px;color:${C.cream};${ol(8, C.ink, 9, 9, C.ink)}}
    .sub{position:absolute;left:646px;top:540px;width:460px;font-weight:700;font-size:34px;line-height:1.25;color:${C.ink}}
    .bb .steam{stroke:${C.ink};opacity:.5}
  `, body: `${sunburst({ w: 1200, h: 900, cx: 390, cy: 450, n: 32, a: C.saffron, b: C.marigold, patB: '06-spice-confetti-sunset', patScale: .9, patOpacity: .45 })}
    ${halo({ w: 1200, h: 900, cx: 390, cy: 450, r: 300, bumps: 36, ring: C.peacock, disc: C.cream, sw: 7 })}
    ${dish('biryani', { style: 'left:60px;top:110px;width:660px;height:660px', cls: 'bb' })}
    ${dish('garlic-naan', { style: 'left:330px;top:450px;width:380px;height:380px', cls: 'bb' })}
    ${kicker('Biryani Boulevard', { x: 646, y: 92, size: 30 })}
    <h1 class="disp hl">Biryani,<br>naan,<br>repeat.</h1>
    <p class="sub">Order pickup or dine in on FM 423, Little Elm.</p>
    ${logo('colourways/wordmark-horizontal--mono-indigo.svg', { style: 'position:absolute;left:646px;top:700px;height:84px;width:auto' })}` }) },

{ id: 'gbp-post-02-spice', file: 'gbp-post-02-spice', w: 1200, h: 900, type: 'image', tags: ['gbp'],
  title: 'GBP post · Pick your heat',
  caption: 'Answers the most-asked spice question right on the listing, with the honest note that even Mild has a kick (4:3 spec from secondary sources: verify).',
  html: () => page({ w: 1200, h: 900, bg: C.ink, title: 'GBP post spice', css: FOOT_CSS + `
    .hl{position:absolute;left:0;right:0;top:180px;text-align:center;font-size:104px;color:${C.cream};text-shadow:8px 8px 0 ${C.rani}}
    .hl span{color:${C.marigold}}
    .sub{position:absolute;left:0;right:0;top:318px;text-align:center;font-weight:600;font-size:34px;color:${C.cream}}
    .row{position:absolute;left:90px;right:90px;top:410px;display:flex;justify-content:space-between}
    .b{width:180px;display:flex;flex-direction:column;align-items:center;gap:14px}
    .sq{width:170px;height:170px;border-radius:26px;border:6px solid ${C.ink};box-shadow:0 0 0 5px ${C.cream},10px 10px 0 5px var(--c);background:var(--c);display:flex;align-items:center;justify-content:center}
    .b span{font-family:'Bowlby One';text-transform:uppercase;font-size:28px;color:${C.cream};text-align:center;line-height:1}
    .note{position:absolute;left:0;right:0;top:700px;text-align:center;font-size:46px;color:${C.marigold}}
  `, body: `${kicker('Spice scale', { cls: 'rani', x: 492, y: 70, size: 34, rot: -2 })}
    <h1 class="disp hl">Pick your <span>heat</span></h1>
    <p class="sub">Tell us mild, medium or spicy when you order.</p>
    <div class="row">${[['chili-1', 'Mild', C.marigold], ['chili-2', 'Medium', C.saffron], ['chili-3', 'Hot', C.chili], ['chili-4', 'Extra-Hot', C.rani], ['chili-5', 'District Hot', C.sky]].map(([ic, l, c]) => `<div class="b" style="--c:${c}"><div class="sq">${icon(ic, { style: 'width:120px;height:120px' })}</div><span>${l}</span></div>`).join('')}</div>
    <div class="note hand">heads-up: even Mild has a kick!</div>
    ${footer({ dark: true, y: 40 }).replace('<div class="foot on-dark" style="bottom:40px">', '<div class="foot on-dark" style="bottom:36px;transform:translateX(-50%) scale(.85)">')}` }) },
];

// GBP square photo tiles (1:1 at 1600px per the playbook's delivery note)
for (const [k, art, name, ring, n] of [['butter-chicken', 'butter-chicken', 'Butter Chicken', C.rani, '01'], ['tandoori-chicken', 'tandoori-platter', 'Tandoori Chicken', C.peacock, '02']]) {
  items.push({ id: `gbp-tile-${n}-${k}`, file: `gbp-tile-${n}-${k}`, w: 1600, h: 1600, type: 'image', tags: ['gbp'],
    title: `GBP photo tile · ${name}`,
    caption: n === '01' ? '1:1 tile at 1600px (playbook delivery spec; 720×720 is the cited minimum-recommended, secondary sources: verify). Illustrated stand-in: Google favours real photos, so replace after the shoot.' : 'Same tile system per menu favourite: dish centred for any crop, name on a District street sign (stand-in until real photos exist).',
    html: () => page({ w: 1600, h: 1600, bg: C.cream, title: name, css: `
      .d .steam{stroke:${C.ink};opacity:.5}
      .nm{position:absolute;left:50%;top:1290px;transform:translateX(-50%) rotate(-2deg);font-size:96px;padding:22px 48px 26px;white-space:nowrap;box-shadow:12px 12px 0 ${C.ink};border-width:8px}
      .em{position:absolute;right:70px;top:70px}
    `, body: `${sunburst({ w: 1600, h: 1600, cx: 800, cy: 720, n: 40, a: C.cream, b: C.surface2 })}
      ${halo({ w: 1600, h: 1600, cx: 800, cy: 720, r: 560, bumps: 52, ring, disc: '#FFFFFF', sw: 10 })}
      ${dish(art, { style: 'left:170px;top:110px;width:1260px;height:1260px', cls: 'd' })}
      <div class="plate nm">${name}</div>
      ${logo('emblem.svg', { cls: 'em', style: 'width:150px;height:auto' })}` }) });
}

module.exports = items;

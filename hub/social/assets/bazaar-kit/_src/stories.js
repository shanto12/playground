// 4 Stories (1080×1920) + safe-zone guide + 8 Highlight covers + highlight row preview.
// Story UI zones used here (approx., verify in-app): top 250px (profile + progress bar),
// bottom 340px (reply bar / link sticker), 64px side margins.
const L = require('./lib');
const { ol, C, dish, icon, logo, sunburst, sparkle, page, patternUrl, bunting, inlineArrow, furl, BRAND, KIT } = L;
const { footer, FOOT_CSS, kicker, halo } = require('./parts');

const W = 1080, H = 1920, TOP = 250, BOT = 340;
const S = (id, title, caption, body, css, bg, tags = ['story']) => ({
  id, file: id, w: W, h: H, type: 'image', tags, title, caption,
  html: () => page({ w: W, h: H, title, bg, body, css: FOOT_CSS + css })
});
const sp = (list) => `<svg class="abs" aria-hidden="true" style="left:0;top:0" width="${W}" height="${H}">${list.map(s => sparkle(...s)).join('')}</svg>`;
// decorative pattern bands live in the UI zones (never text there)
const band = (pat, top, h, scale = 200, fadeTo = 'bottom') =>
  `<div class="band" style="top:${top}px;height:${h}px;background-image:url(${patternUrl(pat)});background-size:${scale}px;-webkit-mask-image:linear-gradient(to ${fadeTo},#000 30%,transparent)"></div>`;
const BAND_CSS = `.band{position:absolute;left:0;right:0;background-repeat:repeat}`;

const stories = [
// S1 ─ spice poll
S('story-01-spice-poll', 'Story · Where do you land? (spice poll)',
  'Interactive poll frame (calendar Day 3): big, thumb-friendly options inside the safe zone; drop the native poll sticker over the cards.',
  `${band('02-chili-lime-night', 0, 300, 220)}${band('02-chili-lime-night', 1620, 300, 220, 'top')}
   ${sp([[960,380,20,C.marigold,{sw:0}],[110,1500,16,C.rani,{sw:0}],[990,1440,12,C.cream,{sw:0}]])}
   ${kicker('Spice check', { cls: 'rani', x: 72, y: 300, size: 40 })}
   <h1 class="disp hl">Where do<br><span>you land?</span></h1>
   <div class="opts">
     ${[['chili-1','Mild','easy does it',C.marigold,-2],['chili-2','Medium','the happy middle',C.saffron,1.5],['chili-3','Texas-hot','bring it on',C.chili,-1.5]].map(([ic,l,s,c,r])=>`<div class="opt" style="--c:${c};transform:rotate(${r}deg)"><span class="ob">${icon(ic,{style:'width:120px;height:120px'})}</span><span><b class="disp">${l}</b><em>${s}</em></span></div>`).join('')}
   </div>
   <p class="sub">Tell us your heat. We’ll cook it your way.</p>
   ${footer({ dark: true, y: BOT })}`,
  `${BAND_CSS}
   .hl{position:absolute;left:72px;top:400px;font-size:134px;color:${C.cream};text-shadow:10px 10px 0 ${C.rani}}
   .hl span{color:${C.marigold}}
   .opts{position:absolute;left:84px;right:84px;top:690px;display:flex;flex-direction:column;gap:36px}
   .opt{display:flex;align-items:center;gap:30px;background:${C.cream};border:6px solid ${C.ink};border-radius:30px;box-shadow:12px 12px 0 var(--c);height:190px;overflow:hidden}
   .ob{width:190px;height:100%;background:var(--c);display:flex;align-items:center;justify-content:center;border-right:6px solid ${C.ink}}
   .opt b{display:block;font-size:76px;line-height:1;color:${C.ink}}
   .opt em{display:block;font-style:normal;font-weight:700;font-size:34px;color:${C.muted};margin-top:8px}
   .sub{position:absolute;left:72px;right:72px;top:1376px;text-align:center;font-weight:800;font-size:42px;color:${C.cream}}`,
  C.ink),

// S2 ─ guest-photo repost frame (UGC, with permission)
S('story-02-guest-repost', 'Story · Guest-photo repost frame',
  'Branded frame for reposting guest photos (with permission, calendar Day 15); the guest’s photo drops into the polaroid.',
  `${sunburst({ w: W, h: H, cx: 540, cy: 1000, n: 40, a: C.saffron, b: C.marigold })}
   ${bunting({ w: W, y: -10, sag: 90, n: 11, size: 96 })}
   <h1 class="disp hl">Maza aa<br>gaya!</h1>
   <div class="gl hand">(that was so good!)</div>
   <div class="pol"><div class="slot"><div class="ph">${icon('heart',{style:'width:120px;height:120px'})}<span class="hand">guest photo goes here</span></div></div>
     <div class="cap hand">@ your handle</div></div>
   <div class="tagus">Tag us. We’ll share your plate (with your OK).</div>
   ${footer({ dark: false, y: BOT })}`,
  `.hl{position:absolute;left:0;right:0;top:268px;text-align:center;font-size:150px;color:${C.cream};${ol(11, C.ink, 12, 12, C.ink)}}
   .gl{position:absolute;right:120px;top:560px;font-size:60px;color:${C.ink};transform:rotate(-5deg)}
   .pol{position:absolute;left:160px;top:640px;width:760px;height:680px;background:${C.cream};border:7px solid ${C.ink};border-radius:20px;box-shadow:16px 16px 0 ${C.ink};transform:rotate(-2.5deg);padding:34px 34px 0}
   .slot{height:530px;border-radius:10px;background:repeating-linear-gradient(135deg,#FFE7B8 0 22px,#FFDDA0 22px 44px);border:5px dashed ${C.ink};display:flex;align-items:center;justify-content:center}
   .ph{display:flex;flex-direction:column;align-items:center;gap:16px;opacity:.75}
   .ph .hand{font-size:52px;color:${C.ink}}
   .cap{text-align:center;font-size:50px;color:${C.rani};margin-top:10px}
   .tagus{position:absolute;left:84px;right:84px;top:1366px;text-align:center;background:${C.ink};color:${C.cream};border-radius:999px;padding:18px 24px;font-weight:800;font-size:36px;box-shadow:8px 8px 0 ${C.rani};white-space:nowrap}`,
  C.saffron),

// S3 ─ visit us (hero street art, wordmark on the shop sign)
S('story-03-visit', 'Story · Swagat hai (visit us)',
  'Turns the illustrated District street into a visit card: our wordmark sits on the shop’s blank sign, address in the safe zone, no hours promised.',
  `<img class="hero" src="${furl(BRAND + '/illustrations/bazaar/hero/hero-portrait-static.svg')}" alt="">
   <div class="board">${logo('colourways/wordmark-horizontal--reversed.svg',{style:'height:124px;width:auto'})}</div>
   <div class="wel"><span class="disp">Swagat hai!</span><span class="hand">(welcome to the District)</span></div>
   <div class="addr card">${icon('map-pin',{style:'width:110px;height:110px'})}<div><b>11851 FM 423, Suite 200</b><span>Little Elm, TX 75068</span></div></div>
   <div class="dir pill">Get directions ${inlineArrow(C.ink)}</div>`,
  `.hero{position:absolute;left:-100px;top:0;width:1280px;height:1920px}
   .board{position:absolute;left:540px;top:994px;transform:translate(-50%,-50%)}
   .wel{position:absolute;left:50%;top:282px;transform:translateX(-50%) rotate(-2deg);background:${C.cream};border:7px solid ${C.ink};border-radius:26px;box-shadow:12px 12px 0 ${C.ink};padding:20px 44px 18px;text-align:center;white-space:nowrap}
   .wel .disp{display:block;font-size:104px;color:${C.rani};line-height:1}
   .wel .hand{display:block;font-size:46px;color:${C.ink};margin-top:6px}
   .addr{position:absolute;left:72px;right:72px;top:1290px;display:flex;align-items:center;gap:26px;padding:26px 34px;background:${C.cream};box-shadow:12px 12px 0 ${C.rani}}
   .addr b{display:block;font-size:44px;font-weight:800;line-height:1.1}
   .addr span{display:block;font-size:38px;font-weight:600;color:${C.muted};margin-top:6px}
   .dir{position:absolute;left:50%;top:1478px;transform:translateX(-50%);background:${C.marigold};color:${C.ink};font-size:40px;padding:16px 40px;box-shadow:8px 8px 0 ${C.ink};border-width:6px}`,
  C.ink),

// S4 ─ chai lo + question box
S('story-04-chai-ask-us', 'Story · Chai lo + ask us',
  'Question-box frame that leans on the friendly-team review theme: “Ask us what we’d order”, with the chai art doing the warm welcome.',
  `${sunburst({ w: W, h: H, cx: 540, cy: 900, n: 40, a: C.peacock, b: '#14B4AB' })}
   ${band('05-chai-time-fresh', 0, 280, 220)}
   <h1 class="disp hl">Chai lo.</h1>
   <div class="gl hand">(have some chai)</div>
   ${dish('mango-lassi-chai', { style: 'left:215px;top:535px;width:650px;height:650px', cls: 'ch' })}
   <div class="qb card"><div class="qh disp">Ask us what we’d order</div><div class="qa hand">type your question…</div></div>
   ${footer({ dark: false, y: BOT })}`,
  `${BAND_CSS}
   .hl{position:absolute;left:0;right:0;top:300px;text-align:center;font-size:176px;color:${C.cream};${ol(12, C.ink, 13, 13, C.ink)}}
   .gl{position:absolute;left:0;right:0;top:488px;text-align:center;font-size:58px;color:${C.ink}}
   .ch .steam{stroke:${C.cream};opacity:.95}
   .qb{position:absolute;left:96px;right:96px;top:1150px;padding:26px 34px 30px;text-align:center;background:${C.cream};box-shadow:14px 14px 0 ${C.rani};transform:rotate(-1.5deg)}
   .qh{font-size:54px;color:${C.ink};line-height:1}
   .qa{margin-top:18px;background:#fff;border:4px solid rgba(29,17,71,.25);border-radius:18px;padding:16px;font-size:48px;color:${C.muted}}`,
  C.peacock),
];

// ── Safe-zone guide (2×2 board of the stories with UI zones marked) ──
const g = 0.45, gw = Math.round(W * g), gh = Math.round(H * g);
const guide = {
  id: 'story-00-safe-zone-guide', file: 'story-00-safe-zone-guide', w: 1080, h: 2230, type: 'image', stage: 2, tags: ['story', 'guide'],
  title: 'Story safe-zone guide',
  caption: 'Every story keeps text out of the top 250px and bottom 340px (approx. app UI; verify in-app); decoration only lives there.',
  html: () => page({ w: 1080, h: 2230, bg: C.cream, title: 'Story safe zones', css: `
    .hd{position:absolute;left:56px;top:48px;right:56px}
    .hd h1{font-size:74px;color:${C.ink}} .hd p{font-size:30px;font-weight:600;color:${C.muted};margin-top:12px;line-height:1.3}
    .g{position:absolute;left:56px;top:250px;display:grid;grid-template-columns:${gw}px ${gw}px;gap:56px 56px}
    .s{position:relative;width:${gw}px;height:${gh}px;border:5px solid ${C.ink};border-radius:20px;overflow:hidden;box-shadow:8px 8px 0 ${C.ink}}
    .s img{width:100%;height:100%;display:block}
    .z{position:absolute;left:0;right:0;background:repeating-linear-gradient(135deg,rgba(214,40,57,.55) 0 12px,rgba(214,40,57,.25) 12px 24px);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:22px;letter-spacing:.04em;text-transform:uppercase;text-shadow:0 2px 4px rgba(0,0,0,.6);text-align:center;line-height:1.15}
    .z.t{top:0;height:${TOP * g}px} .z.b{bottom:0;height:${BOT * g}px}
    .m{position:absolute;top:${TOP * g}px;bottom:${BOT * g}px;left:${64 * g}px;right:${64 * g}px;border:3px dashed ${C.peacock};border-radius:6px}
    .lb{position:absolute;left:0;right:0;bottom:-46px;text-align:center;font-weight:800;font-size:24px;color:${C.ink}}
    .lg{position:absolute;left:56px;right:56px;top:2020px;display:flex;gap:30px;flex-wrap:wrap;font-weight:700;font-size:28px;color:${C.ink}}
    .lg i{display:inline-block;width:40px;height:26px;vertical-align:-4px;margin-right:10px;border-radius:5px}
  `, body: `
    <div class="hd"><h1 class="disp">Story safe zones</h1><p>1080×1920. Red = app UI (profile, progress bar, reply bar, link sticker): decoration only. Dashed teal = text and key art safe area. Zones are approximate; verify in the app before posting.</p></div>
    <div class="g">${stories.map(st => `<div><div class="s"><img src="${furl(KIT + '/' + st.file + '.png')}" alt=""><div class="z t">top ${TOP}px<br>profile · progress</div><div class="z b">bottom ${BOT}px<br>reply bar · link</div><div class="m"></div></div></div>`).join('')}</div>
    <div class="lg"><span><i style="background:rgba(214,40,57,.55)"></i>UI zone: no text</span><span><i style="border:3px dashed ${C.peacock}"></i>Safe area (64px sides)</span></div>`
  })
};

// ── Highlight covers ──
const HL = [
  ['menu', 'Menu', 'menu-book', C.peacock, C.marigold, '03-block-print-booti-fresh'],
  ['biryani', 'Biryani', 'biryani-pot-handi', C.saffron, C.rani, '06-spice-confetti-sunset'],
  ['tandoor', 'Tandoor', 'tandoor-oven', C.chili, C.marigold, '02-chili-lime-sunset'],
  ['curry', 'Curry', 'curry-bowl', C.marigold, C.peacock, '04-truck-art-rangoli-sunset'],
  ['sweets', 'Sweets', 'gulab-jamun', C.rani, C.marigold, '03-block-print-booti-sunset'],
  ['catering', 'Catering', 'party-tray', C.cilantro, C.rani, '01-marigold-garland-fresh'],
  ['order', 'Order', 'shopping-bag', C.sky, C.marigold, '06-spice-confetti-night'],
  ['visit', 'Visit', 'map-pin', C.ink, C.saffron, '07-jaipur-arches-night'],
];
const highlights = HL.map(([k, label, ic, bg, acc, pat], i) => ({
  id: `highlight-${String(i + 1).padStart(2, '0')}-${k}`, file: `highlight-${String(i + 1).padStart(2, '0')}-${k}`, w: W, h: H, type: 'image', tags: ['highlight'],
  title: `Highlight cover · ${label}`,
  caption: i === 0 ? 'Icon sits inside the centre circle so the profile crop is always clean; the label below shows only when the cover is opened.' : `${label}: same disc, same icon weight, its own festival colour, so the highlight row reads as one set.`,
  html: () => page({ w: W, h: H, bg, title: `Highlight · ${label}`, css: `
    .pat{position:absolute;inset:0;background-image:url(${patternUrl(pat)});background-size:240px;opacity:.22;mix-blend-mode:${bg === C.ink ? 'normal' : 'multiply'}}
    .vig{position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,${bg} 0 34%,transparent 60%)}
    .lbl{position:absolute;left:0;right:0;top:1452px;text-align:center;font-size:120px;color:${C.cream};${ol(10, C.ink, 11, 11, C.ink)}}
    .em{position:absolute;left:50%;top:300px;transform:translateX(-50%)}
  `, body: `<div class="pat"></div><div class="vig"></div>
    <svg class="abs" aria-hidden="true" style="left:0;top:0" width="${W}" height="${H}">
      <circle cx="${W / 2 + 16}" cy="${H / 2 + 16}" r="360" fill="${C.ink}"/>
      <circle cx="${W / 2}" cy="${H / 2}" r="360" fill="${acc}" stroke="${C.ink}" stroke-width="12"/>
      <circle cx="${W / 2}" cy="${H / 2}" r="312" fill="${C.cream}" stroke="${C.ink}" stroke-width="10"/>
      ${Array.from({ length: 48 }, (_, j) => { const a = j / 48 * Math.PI * 2; return `<circle cx="${(W / 2 + 336 * Math.cos(a)).toFixed(1)}" cy="${(H / 2 + 336 * Math.sin(a)).toFixed(1)}" r="6" fill="${C.ink}" opacity=".55"/>`; }).join('')}
    </svg>
    <div class="abs" style="left:${W / 2 - 215}px;top:${H / 2 - 215}px;width:430px;height:430px">${icon(ic, { style: 'width:430px;height:430px' })}</div>
    ${logo('emblem.svg', { cls: 'em', style: 'width:150px;height:auto' })}
    <div class="disp lbl">${label}</div>`
  })
}));

// ── Highlight row preview (neutral, generic app styling; no platform UI replica) ──
const hlPreview = {
  id: 'highlight-00-row-preview', file: 'highlight-00-row-preview', w: 1080, h: 860, type: 'image', stage: 2, tags: ['highlight', 'grid'],
  title: 'Highlight row · as it crops',
  caption: 'All eight covers circle-cropped at profile size: one family, eight colours, every icon readable at a glance.',
  html: () => page({ w: 1080, h: 860, bg: '#FFFFFF', title: 'Highlights preview', css: `
    .hd{position:absolute;left:60px;top:44px;font-weight:800;font-size:30px;letter-spacing:.06em;text-transform:uppercase;color:${C.muted}}
    .row{position:absolute;left:40px;right:40px;top:120px;display:grid;grid-template-columns:repeat(4,1fr);gap:46px 0;justify-items:center}
    .c{display:flex;flex-direction:column;align-items:center;gap:16px}
    .r{width:200px;height:200px;border-radius:50%;padding:7px;border:4px solid #D9D6E3}
    .r div{width:100%;height:100%;border-radius:50%;overflow:hidden}
    .r img{width:100%;height:100%;object-fit:cover;object-position:50% 50%;border-radius:50%;display:block}
    .c span{font-size:30px;font-weight:600;color:#1B1B1F}
  `, body: `<div class="hd">Highlights · profile view (circle crop)</div><div class="row">${HL.map(([k, label], i) => `<div class="c"><div class="r"><div style="background-image:url(${furl(KIT + `/highlight-${String(i + 1).padStart(2, '0')}-${k}.png`)});background-size:100% auto;background-position:50% 50%"></div></div><span>${label}</span></div>`).join('')}</div>` })
};

module.exports = [...stories, guide, ...highlights, hlPreview];

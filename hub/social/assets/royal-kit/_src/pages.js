// Page definitions for the Royal social kit. Each entry: { id, w, h, html }
const L = require('./lib');
const { C, art, archWindow, page, wordmark, iconInline, star, fakeQR, arrow, chili, logo, icon, bloom } = L;

const P = []; // registry
const add = (o) => { P.push(o); return o; };
module.exports = P;

// ──────────────────────────────── POSTS 1080×1350 ────────────────────────────────
const PW = 1080, PH = 1350;

const dishImg = (dish, { w, cx = PW / 2, sillY, base = 640, style = '' }) => {
  const top = sillY - base * (w / 800) + 6;
  return `<img class="abs dish" alt="" src="${art(dish)}" style="left:${cx - w / 2}px;top:${top}px;width:${w}px;${style}">`;
};

// P1 · hero dish ------------------------------------------------------------
add({
  id: 'post-hero-butter-chicken', w: PW, h: PH,
  html: page({
    w: PW, h: PH, kind: 'midnight', body: `
${bloom(540, 470, 520)}
${archWindow({ x: 250, y: 118, w: 580, h: 750, glow: 'plum' })}
${dishImg('butter-chicken', { w: 780, sillY: 868, base: 618 })}
<div class="abs center eyebrow" style="top:918px">From the Curry Quarter</div>
<div class="abs center h1" style="top:960px">Butter Chicken</div>
<div class="abs center it" style="top:1090px;font-size:50px;color:rgba(251,243,228,.92)">velvet-rich, slow and <span class="foil">golden</span></div>
${wordmark('midnight', { y: 1192, h: 74 })}`,
  }),
});

// P2 · zone features (street-sign plaque) -----------------------------------
function plaque({ y, no, name, foilWord, w = 880 }) {
  const named = name.replace(foilWord, `<span class="foil-dk">${foilWord}</span>`);
  return `<div class="abs plaque" style="left:${(PW - w) / 2}px;top:${y}px;width:${w}px">
  <i class="sc" style="left:18px;top:18px"></i><i class="sc" style="right:18px;top:18px"></i><i class="sc" style="left:18px;bottom:18px"></i><i class="sc" style="right:18px;bottom:18px"></i>
  <div class="eyebrow dk" style="font-size:26px;letter-spacing:.3em">The District &nbsp;·&nbsp; No. ${no}</div>
  <div class="pn">${named}</div></div>`;
}
const PLAQUE_CSS = `.plaque{background:linear-gradient(180deg,#FFFBF2,#F6EAD2);border-radius:26px;padding:34px 40px 30px;text-align:center;box-shadow:0 0 0 3px #E9A63A,0 0 0 9px rgba(251,243,228,.0),0 0 0 10px rgba(247,217,138,.65),0 26px 50px -20px rgba(0,0,0,.6)}
.plaque .pn{font-family:'Fraunces';font-weight:700;font-size:86px;white-space:nowrap;line-height:1.02;letter-spacing:-.02em;color:${C.ink};margin-top:6px}
.plaque .sc{position:absolute;width:12px;height:12px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#FBE3A0,#B7791F 70%)}`;

function zone({ id, kind, glow, no, name, foilWord, dish, dishW, base, tagline, dishes }) {
  add({
    id, w: PW, h: PH, html: page({
      w: PW, h: PH, kind, css: PLAQUE_CSS, body: `
${plaque({ y: 96, no, name, foilWord })}
${bloom(540, 660, 440)}
${archWindow({ x: 290, y: 362, w: 500, h: 566, glow, spring: 0.44 })}
${dishImg(dish, { w: dishW, sillY: 928, base })}
<div class="abs center it" style="top:974px;font-size:42px;line-height:1.18;width:900px;color:${C.ivory}">${tagline}</div>
<div class="abs center" style="top:1106px;font-size:29px;font-weight:600;letter-spacing:.02em;color:${C.goldLt}">${dishes.join('&nbsp; <span class="diamond" style="width:9px;height:9px;margin:0 8px 4px"></span> &nbsp;')}</div>
${wordmark(kind, { y: 1200, h: 70 })}`,
    }),
  });
}
zone({ id: 'post-zone-biryani-boulevard', kind: 'emerald', glow: 'midnight', no: '04', name: 'Biryani Boulevard', foilWord: 'Biryani', dish: 'biryani', dishW: 600, base: 650, tagline: 'Layered, sealed and slow-steamed<br>with whole spice.', dishes: ['Chicken Dum Biryani', 'Gongura Mutton Pulav', 'Veg Biryani'] });
zone({ id: 'post-zone-tandoor-quarter', kind: 'ruby', glow: 'emerald', no: '02', name: 'Tandoor Quarter', foilWord: 'Tandoor', dish: 'paneer-tikka', dishW: 640, base: 690, tagline: 'Fire-kissed and smoke-scented,<br>straight from the clay oven.', dishes: ['Tandoori Chicken', 'Chicken Tikka Kabab', 'Paneer Tikka Kabab'] });

// P3 · spice meter ------------------------------------------------------------
{
  const labels = ['Mild', 'Medium', 'Hot', 'Extra-Hot', 'District<br>Hot'];
  const sizes = [142, 152, 164, 176, 190];
  const gap = 26, total = sizes.reduce((a, b) => a + b, 0) + gap * 4;
  let x = (PW - total) / 2;
  const baseY = 820; // medallion bottoms sit on the brass rail
  const cols = labels.map((l, i) => {
    const sz = sizes[i], fill = [0, 0.28, 0.55, 0.8, 1][i];
    const gems = Array.from({ length: 5 }, (_, g) => `<span class="gem ${g <= i ? 'on' : ''}"></span>`).join('');
    const el = `<div class="abs sp" style="left:${x}px;top:${baseY - sz - 52}px;width:${sz}px">
  <div class="gems">${gems}</div>
  <div class="med m${i}" style="width:${sz}px;height:${sz}px">${chili(Math.round(sz * 0.74), fill, { stroke: 2.4, glow: i === 4 })}</div>
  <div class="lbl">${l}</div></div>`;
    x += sz + gap;
    return el;
  }).join('');
  add({
    id: 'post-spice-meter', w: PW, h: PH, html: page({
      w: PW, h: PH, kind: 'ruby', css: `
.sp{text-align:center}
.gems{display:flex;justify-content:center;gap:8px;height:20px;margin-bottom:30px}
.gem{width:11px;height:11px;transform:rotate(45deg);border:2px solid rgba(247,217,138,.7)}
.gem.on{background:linear-gradient(135deg,#FBE3A0,#E9A63A);border-color:#FBE3A0}
.med{margin:0 auto;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 3px #E9A63A,0 0 0 8px rgba(42,6,20,.5),0 0 0 9px rgba(247,217,138,.5),0 20px 40px -16px rgba(0,0,0,.7)}
.med.m0{background:radial-gradient(circle at 50% 40%,#4A0B22,#2A0614)}.med.m1{background:radial-gradient(circle at 50% 40%,#5A0E2A,#2E0616)}.med.m2{background:radial-gradient(circle at 50% 40%,#6A1031,#330718)}.med.m3{background:radial-gradient(circle at 50% 40%,#7E1438,#38081A)}
.med.m4{background:radial-gradient(circle at 50% 40%,#9C1C45,#3A0719);box-shadow:0 0 0 3px #FBE3A0,0 0 0 8px rgba(42,6,20,.5),0 0 0 9px rgba(247,217,138,.8),0 0 70px 8px rgba(242,182,79,.45)}
.lbl{position:absolute;left:-30px;right:-30px;top:calc(100% + 34px);font-family:'Fraunces';font-weight:620;font-size:34px;line-height:1.05;color:${C.ivory}}
.rail{position:absolute;left:118px;right:118px;top:${baseY + 16}px;height:3px;background:linear-gradient(90deg,rgba(247,217,138,.25),#FBE3A0 60%,#F2B64F);border-radius:3px}`,
      body: `
<div class="abs center eyebrow" style="top:118px">Spice, your way</div>
<div class="abs center h1" style="top:166px;font-size:128px">Choose your<br><span class="foil">heat.</span></div>
<div class="rail"></div>
${cols}
<div class="abs center body" style="top:990px;width:880px;font-size:40px">Tell us your level when you order.<br><span class="it" style="font-size:42px;color:${C.goldLt}">Fair warning: even Mild carries a gentle glow.</span></div>
${wordmark('ruby', { y: 1192, h: 74 })}`,
    }),
  });
}

// P4 · daily special (template + filled example) ------------------------------
// Template variant: dashed zones, numbered corner badges, self-describing placeholder text.
const TPL_CSS = `
.z{position:absolute;text-align:center}
.tpl .z{outline:3px dashed rgba(183,121,31,.8);outline-offset:8px;border-radius:4px}
.tpl.dark .z{outline-color:rgba(247,217,138,.75)}
.nb{position:absolute;display:none;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:#8A5A12;color:#FBF3E4;font:800 22px/1 'Hanken Grotesk';box-shadow:0 0 0 3px #FBF3E4;z-index:6}
.tpl.dark .nb{background:#FBE3A0;color:#160B26;box-shadow:0 0 0 3px #160B26}
.tpl .nb{display:flex}
.swap{position:absolute;display:none;font:700 22px/1 'Hanken Grotesk';letter-spacing:.16em;text-transform:uppercase;color:#160B26;background:#FBE3A0;padding:9px 16px;border-radius:999px;z-index:6;white-space:nowrap}
.tpl .swap{display:block}
.meta{display:flex;justify-content:center;align-items:center;gap:20px;font:600 31px/1 'Hanken Grotesk';color:#3B2A44}
.meta img{width:42px;height:42px}
.meta .sep{width:9px;height:9px;transform:rotate(45deg);background:#B7791F}
.ph{color:rgba(22,11,38,.42)}
.tpl.dark .ph{color:rgba(251,243,228,.5)}
`;
const nb = (n, x, y, h = 0) => `<span class="nb" style="left:${x - 27}px;top:${y + h / 2 - 19}px">${n}</span>`;
function dailySpecial(tpl) {
  const id = tpl ? 'post-daily-special-template' : 'post-daily-special-example';
  const v = (a, b) => (tpl ? `<span class="ph">${a}</span>` : b);
  add({
    id, w: PW, h: PH, html: page({
      w: PW, h: PH, kind: 'ivory', css: TPL_CSS, body: `<div class="${tpl ? 'tpl' : ''}" style="position:absolute;inset:0">
<div class="abs center eyebrow dk" style="top:88px">From the kitchen today</div>
<div class="z it" style="left:320px;width:440px;top:136px;height:52px;font-size:42px;line-height:52px;color:#4B1D52">${v('Day · date', 'Tuesday evening')}</div>${nb(1, 320, 136, 52)}
${bloom(540, 540, 380, 'rgba(15,77,63,.14)')}
<div class="z" style="left:262px;top:226px;width:556px;height:580px"></div>${nb(2, 262, 226, 580)}
${archWindow({ x: 300, y: 236, w: 480, h: 548, glow: 'emerald', trim: 'foil' })}
${dishImg('dal-saag', { w: 600, sillY: 784, base: 640 })}
<span class="swap" style="left:50%;transform:translateX(-50%);top:330px">Swap dish art</span>
<div class="z h1 ink" style="left:140px;width:800px;top:842px;height:104px;font-size:100px;line-height:104px">${v('Dish name', 'Dal Makhani')}</div>${nb(3, 140, 842, 104)}
<div class="z it" style="left:120px;width:840px;top:974px;height:96px;font-size:40px;line-height:48px;color:#3B2A44">${v('One sensory line, 14 words max,<br>in the Royal voice.', 'Black lentils, slow-simmered until velvet,<br>finished with butter and cream.')}</div>${nb(4, 120, 974, 96)}
<div class="z meta" style="left:180px;width:720px;top:1100px;height:44px">${tpl ? '<span class="ph">Diet mark · spice · zone</span>' : `<img src="${icon('veg-mark')}" alt="">Vegetarian<i class="sep"></i>${chili(42, 0.3, { stroke: 3 }).replace('color:#F2C25C', 'color:#8A5A12')}Mild<i class="sep"></i>Curry Quarter`}</div>${nb(5, 180, 1100, 44)}
</div>
${wordmark('ivory', { y: 1198, h: 68 })}`,
    }),
  });
}
dailySpecial(true);
dailySpecial(false);
// P5 · ratings card ------------------------------------------------------------
{
  const R = [
    { p: 'Google', s: 4.2, show: '4.2', c: 'about 1,000 reviews', approx: true },
    { p: 'Yelp', s: 4.0, show: '4.0', c: '120 reviews' },
    { p: 'Restaurantji', s: 4.5, show: '4.5', c: '479 reviews' },
    { p: 'Uber Eats', s: 4.5, show: '4.5', c: '2,000+ ratings' },
  ];
  const cards = R.map((r, i) => {
    const x = i % 2 ? 556 : 104, y = 470 + Math.floor(i / 2) * 318;
    const stars = [0, 1, 2, 3, 4].map((k) => star(42, Math.max(0, Math.min(1, r.s - k)))).join('');
    return `<div class="abs card" style="left:${x}px;top:${y}px">
<div class="pf">${r.p}${r.approx ? ' <span class="ap">approx.</span>' : ''}</div>
<div class="sc">${r.show}</div><div class="stars">${stars}</div><div class="ct">${r.c}</div></div>`;
  }).join('');
  add({
    id: 'post-ratings-card', w: PW, h: PH, html: page({
      w: PW, h: PH, kind: 'ivory', css: `
.card{width:420px;height:290px;border-radius:28px;background:linear-gradient(180deg,#FFFDF8,#FBF3E4);box-shadow:0 0 0 2px rgba(183,121,31,.55),0 22px 40px -26px rgba(75,29,82,.45);padding:30px 34px;text-align:left}
.pf{font:700 26px/1 'Hanken Grotesk';letter-spacing:.2em;text-transform:uppercase;color:${C.emerald}}
.ap{font:600 20px/1 'Hanken Grotesk';letter-spacing:.08em;color:#6B5A73;text-transform:none}
.sc{font-family:'Fraunces';font-weight:700;font-size:112px;line-height:1;letter-spacing:-.03em;color:${C.ink};margin-top:16px}
.stars{display:flex;gap:4px;margin-top:10px}
.ct{font:500 27px/1 'Hanken Grotesk';color:#5E4E66;margin-top:16px}`,
      body: `
<div class="abs center eyebrow dk" style="top:104px">As listed publicly, Oct 2026</div>
<div class="abs center h1 ink" style="top:150px;font-size:112px">Thank you,<br><span class="foil-dk">Little Elm.</span></div>
${cards}
<div class="abs center" style="top:1112px;width:860px;font:500 26px/1.35 'Hanken Grotesk';color:#5E4E66">Google figure approximate. Ratings change over time,<br>so please check each platform before posting.</div>
${wordmark('ivory', { y: 1206, h: 66 })}`,
    }),
  });
}

// P6 · order online + sample QR -------------------------------------------------
add({
  id: 'post-order-online-qr', w: PW, h: PH, html: page({
    w: PW, h: PH, kind: 'plum', css: `.qrcap{display:flex;align-items:center;justify-content:center;gap:16px;font:700 30px/1 'Hanken Grotesk';letter-spacing:.06em;color:${C.goldLt}}
.sample{position:absolute;left:50%;transform:translateX(-50%);font:800 20px/1 'Hanken Grotesk';letter-spacing:.3em;color:${C.ink};background:#FBE3A0;padding:8px 14px;border-radius:6px}`,
    body: `
<div class="abs center h1" style="top:112px;font-size:118px">Take the<br>evening <span class="foil">home.</span></div>
<div class="abs center body" style="top:378px;font-size:38px">Order online for pickup, straight from our kitchen.</div>
${bloom(540, 700, 420)}
${archWindow({ x: 320, y: 470, w: 440, h: 470, glow: 'ivory', spring: 0.4, jali: true })}
<div class="abs" style="left:395px;top:620px;width:290px;height:290px;border-radius:14px;box-shadow:0 10px 26px -10px rgba(22,11,38,.5)">${fakeQR(290, { seed: 11 })}</div>
<div class="sample" style="top:598px">Sample</div>
<div class="abs center qrcap" style="top:986px">QR ${arrow(54, C.goldLt, 4)} ordering link</div>
<div class="abs center" style="top:1052px"><span class="pill gold">Order online ${arrow(44, C.ink, 4)}</span></div>
${wordmark('plum', { y: 1196, h: 72 })}`,
  }),
});

// P7 · catering / celebrations ---------------------------------------------------
add({
  id: 'post-catering-celebrations', w: PW, h: PH, html: page({
    w: PW, h: PH, kind: 'peacock', body: `
${bloom(540, 420, 480, 'rgba(242,182,79,.22)')}
${archWindow({ x: 200, y: 112, w: 680, h: 566, glow: 'midnight', spring: 0.5, lobes: 5 })}
${dishImg('tandoori-platter', { w: 640, sillY: 678, base: 712 })}
<div class="abs center eyebrow" style="top:722px">Celebrations, beautifully fed</div>
<div class="abs center h1" style="top:768px;font-size:100px">Let us cater the<br><span class="foil">celebration.</span></div>
<div class="abs center" style="top:1000px;font:500 31px/1.3 'Hanken Grotesk';color:${C.ivory}">Birthdays · showers · housewarmings · office gatherings</div>
<div class="abs center" style="top:1064px"><span class="pill line" style="height:80px;font-size:31px">Ask about catering ${arrow(40, C.goldLt, 4)}</span></div>
${wordmark('peacock', { y: 1196, h: 72 })}`,
  }),
});

// P8 · did you know (dum / tandoor) ----------------------------------------------
function didYouKnow({ id, kind, ic, h1, body, ring = 'midnight' }) {
  add({
    id, w: PW, h: PH, html: page({
      w: PW, h: PH, kind, css: `.medal{position:absolute;left:310px;top:176px;width:460px;height:460px;border-radius:50%;display:flex;align-items:center;justify-content:center;
background:radial-gradient(circle at 50% 38%,rgba(251,227,160,.16),rgba(22,11,38,.35) 70%);box-shadow:0 0 0 4px #E9A63A,0 0 0 16px rgba(22,11,38,.25),0 0 0 17px rgba(247,217,138,.6),0 30px 60px -20px rgba(0,0,0,.6)}
.medal::before{content:'';position:absolute;inset:26px;border-radius:50%;border:1.5px dashed rgba(247,217,138,.55)}
.q{position:absolute;left:0;right:0;text-align:center;font-family:'Fraunces';font-weight:700;font-size:28px;letter-spacing:.3em;text-transform:uppercase}`,
      body: `
<div class="abs center eyebrow" style="top:110px">Did you know?</div>
${bloom(540, 406, 360)}
<div class="medal">${iconInline(ic, { size: 300, color: '#F2C25C', stroke: 1.5, fillOpacity: 0.45 })}</div>
<div class="abs center h1" style="top:700px;font-size:120px">${h1}</div>
<div class="abs center body" style="top:968px;width:880px;font-size:37px">${body}</div>
${wordmark(kind, { y: 1196, h: 72 })}`,
    }),
  });
}
didYouKnow({ id: 'post-did-you-know-dum', kind: 'emerald', ic: 'biryani-pot-handi', h1: '<span class="foil">Dum</span> means<br>breath.', body: 'For dum biryani, the pot is sealed, traditionally with a ring of dough, so rice and spices cook slowly in their own fragrant steam.' });
didYouKnow({ id: 'post-did-you-know-tandoor', kind: 'plum', ic: 'tandoor-oven', h1: 'Naan meets<br>the <span class="foil">wall.</span>', body: 'A tandoor is a clay oven fired from below. Naan is pressed onto its hot inner wall, where it blisters and puffs in moments.' });

// P9 · chef's pick (template + filled example) ------------------------------------
function ringSeal(size, text) {
  const r = size / 2, rr = r - 30, circ = 2 * Math.PI * rr;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><defs><path id="ring" d="M${r} ${r}m0 -${rr}a${rr} ${rr} 0 1 1 0 ${2 * rr}a${rr} ${rr} 0 1 1 0 -${2 * rr}"/></defs>
<circle cx="${r}" cy="${r}" r="${r - 4}" fill="#160B26" stroke="url(#foil)" stroke-width="5"/><circle cx="${r}" cy="${r}" r="${r - 50}" fill="none" stroke="#F7D98A" stroke-opacity=".6" stroke-width="1.5"/>
<text font-family="Hanken Grotesk" font-weight="700" font-size="28" fill="#F7D98A" dominant-baseline="middle"><textPath href="#ring" textLength="${(circ - 6).toFixed(1)}" lengthAdjust="spacing">${text}</textPath></text>
<g transform="translate(${r - 38} ${r - 38})">${iconInline('spoon-fork', { size: 76, color: '#F2C25C', stroke: 2 })}</g></svg>`;
}
function chefsPick(tpl) {
  const id = tpl ? 'post-chefs-pick-template' : 'post-chefs-pick-example';
  const v = (a, b) => (tpl ? `<span class="ph">${a}</span>` : b);
  add({
    id, w: PW, h: PH, html: page({
      w: PW, h: PH, kind: 'midnight', css: TPL_CSS + `.meta{color:${C.ivory}}.meta .sep{background:${C.gold}}`, body: `<div class="${tpl ? 'tpl dark' : ''}" style="position:absolute;inset:0">
${bloom(540, 470, 470, 'rgba(163,23,63,.35)')}
<div class="z" style="left:262px;top:112px;width:556px;height:660px"></div>${nb(1, 262, 112, 660)}
${archWindow({ x: 300, y: 150, w: 480, h: 600, glow: 'ruby' })}
${dishImg('chilli-chicken', { w: 620, sillY: 750, base: 640 })}
<span class="swap" style="left:50%;transform:translateX(-50%);top:250px">Swap dish art</span>
<div class="abs" style="left:52px;top:80px">${ringSeal(236, "CHEF'S PICK · THIS WEEK · ")}</div>
<div class="z h1" style="left:140px;width:800px;top:812px;height:110px;font-size:104px;line-height:110px">${v('Dish name', 'Chilli Chicken')}</div>${nb(2, 140, 812, 110)}
<div class="z it" style="left:120px;width:840px;top:952px;height:100px;font-size:42px;line-height:50px;color:${C.goldLt}">${v('Why the kitchen loves it,<br>14 words max.', 'Crisp chicken in a glossy, fiery glaze<br>with charred peppers and onion.')}</div>${nb(3, 120, 952, 100)}
<div class="z meta" style="left:180px;width:720px;top:1094px;height:46px">${tpl ? '<span class="ph">Zone · spice · diet mark</span>' : `Indo-Chinese Alley<i class="sep"></i>${chili(44, 0.6, { stroke: 3 })}Hot<i class="sep"></i><img src="${icon('nonveg-mark')}" alt="">Non-veg`}</div>${nb(4, 180, 1094, 46)}
</div>
${wordmark('midnight', { y: 1196, h: 70 })}`,
    }),
  });
}
chefsPick(true);
chefsPick(false);

// ──────────────────────────────── STORIES 1080×1920 ────────────────────────────────
// Safe zone used throughout: keep key content between y 250 and y 1580, x 64–1016 (approx.; verify in-app).
const SW = 1080, SH = 1920;
const heroScene = (w, h, { file = 'hero-portrait-static', x = 0, y = 0, width = w } = {}) => `<img class="abs" alt="" src="${L.BR}/illustrations/royal/hero/${file}.svg" style="left:${x}px;top:${y}px;width:${width}px">`;
const embers = (n, seed, box, { min = 3, max = 9, color = '#FBD27A' } = {}) => {
  const R = L.rng(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const r = min + R() * (max - min), x = box.x + R() * box.w, y = box.y + R() * box.h, o = 0.35 + R() * 0.6;
    s += `<i class="abs" style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;width:${r.toFixed(1)}px;height:${r.toFixed(1)}px;border-radius:50%;background:radial-gradient(circle,#FFF4CF 0,${color} 45%,rgba(242,182,79,0) 72%);opacity:${o.toFixed(2)}"></i>`;
  }
  return s;
};
const diya = (x, y, s = 1) => `<svg class="abs" aria-hidden="true" style="left:${x}px;top:${y}px;width:${110 * s}px;height:${110 * s}px;overflow:visible" viewBox="0 0 110 110">
<defs><radialGradient id="dg${x}" cx="50%" cy="60%" r="50%"><stop offset="0" stop-color="#FFF6D6"/><stop offset=".4" stop-color="#FBD27A"/><stop offset="1" stop-color="#F2B64F" stop-opacity="0"/></radialGradient>
<linearGradient id="dc${x}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C8622E"/><stop offset="1" stop-color="#6E2510"/></linearGradient></defs>
<circle cx="55" cy="40" r="46" fill="url(#dg${x})" opacity=".55"/>
<path d="M55 14C63 28 66 38 55 50C44 38 47 28 55 14Z" fill="#FFE7A8"/><path d="M55 26C59 33 60 39 55 46C50 39 51 33 55 26Z" fill="#FFF8E2"/>
<path d="M10 58C24 52 86 52 100 58C96 78 78 90 55 90C32 90 14 78 10 58Z" fill="url(#dc${x})"/>
<path d="M10 58C24 52 86 52 100 58" fill="none" stroke="#F7D98A" stroke-width="3"/><path d="M24 72C40 78 70 78 86 72" fill="none" stroke="#F7D98A" stroke-width="1.6" stroke-dasharray="0 7" stroke-linecap="round"/></svg>`;

add({
  id: 'story-dinner-occasion', w: SW, h: SH, html: page({
    w: SW, h: SH, kind: 'midnight', noFrame: true, body: `
${heroScene(SW, SH, { x: -100, y: 0, width: 1280 })}
<div class="abs" style="inset:0;background:linear-gradient(180deg,rgba(14,6,26,.94) 0,rgba(14,6,26,.78) 520px,rgba(14,6,26,0) 860px)"></div>
<div class="abs" style="inset:0;background:linear-gradient(0deg,rgba(14,6,26,.95) 0,rgba(14,6,26,.75) 520px,rgba(14,6,26,0) 820px)"></div>
${L.frame(SW, SH, { tone: 'dark' })}
<div class="abs center eyebrow" style="top:276px">Little Elm, TX</div>
<div class="abs center h1" style="top:326px;font-size:128px">Dinner, made<br>an <span class="foil">occasion.</span></div>
${wordmark('midnight', { y: 1282, h: 84 })}
<div class="abs center it" style="top:1404px;font-size:44px;color:${C.ivory}">Slow-simmered. Tandoor-fired.<br><span style="color:${C.goldLt}">Made for sharing.</span></div>
<div class="abs center" style="top:1532px"><span class="pill gold" style="height:84px">Order online ${arrow(44, C.ink, 4)}</span></div>`,
  }),
});

{
  const opts = [
    { l: 'Mild', s: 'A gentle glow', f: 0.0 },
    { l: 'Hot', s: 'Warm and lively', f: 0.55 },
    { l: 'District Hot', s: 'Fierce, and proud of it', f: 1 },
  ];
  const cards = opts.map((o, i) => `<div class="abs opt" style="top:${700 + i * 236}px">
<div class="om">${chili(112, o.f, { stroke: 2.4, glow: i === 2 })}</div><div><div class="ol">${o.l}</div><div class="os">${o.s}</div></div>
<div class="gm">${Array.from({ length: 3 }, (_, g) => `<span class="gem ${g <= i ? 'on' : ''}"></span>`).join('')}</div></div>`).join('');
  add({
    id: 'story-spice-poll', w: SW, h: SH, html: page({
      w: SW, h: SH, kind: 'ruby', css: `
.opt{left:110px;width:860px;height:200px;border-radius:30px;display:flex;align-items:center;gap:36px;padding:0 44px 0 34px;background:linear-gradient(135deg,rgba(42,6,20,.62),rgba(74,11,34,.5));box-shadow:0 0 0 2px rgba(247,217,138,.7),0 26px 50px -24px rgba(0,0,0,.7)}
.om{width:144px;height:144px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 40%,#7E1438,#2E0616);box-shadow:0 0 0 3px #E9A63A}
.ol{font-family:'Fraunces';font-weight:650;font-size:62px;line-height:1;color:${C.ivory}}
.os{font-family:'Fraunces';font-style:italic;font-size:36px;color:${C.goldLt};margin-top:10px}
.gm{margin-left:auto;display:flex;gap:10px}
.gem{width:16px;height:16px;transform:rotate(45deg);border:2px solid rgba(247,217,138,.7)}.gem.on{background:linear-gradient(135deg,#FBE3A0,#E9A63A);border-color:#FBE3A0}`,
      body: `
<div class="abs center eyebrow" style="top:290px">Quick question</div>
<div class="abs center h1" style="top:340px;font-size:132px">Where do<br>you <span class="foil">land?</span></div>
${cards}
<div class="abs center body" style="top:1420px;font-size:40px">Reply with your level. <span class="it" style="color:${C.goldLt}">We cook to it.</span></div>
${wordmark('ruby', { y: 1500, h: 72 })}`,
    }),
  });
}

add({
  id: 'story-garlic-naan-order', w: SW, h: SH, html: page({
    w: SW, h: SH, kind: 'emerald', body: `
<div class="abs center eyebrow" style="top:290px">From the Bread Bazaar</div>
<div class="abs center h1" style="top:340px;font-size:132px">Made for<br><span class="foil">tearing.</span></div>
${bloom(540, 930, 500)}
${archWindow({ x: 220, y: 660, w: 640, h: 580, glow: 'ruby', spring: 0.44 })}
${dishImg('garlic-naan', { w: 720, sillY: 1240, base: 700 })}
<div class="abs center it" style="top:1290px;font-size:46px;color:${C.ivory}">Garlic Naan, blistered and buttered.</div>
<div class="abs center" style="top:1376px"><span class="pill gold">Order online ${arrow(44, C.ink, 4)}</span></div>
${wordmark('emerald', { y: 1500, h: 70 })}`,
  }),
});

add({
  id: 'story-diwali-gathering', w: SW, h: SH, html: page({
    w: SW, h: SH, kind: 'midnight', body: `
${embers(70, 9, { x: 70, y: 120, w: 940, h: 1650 })}
<div class="abs center eyebrow" style="top:290px">Diwali gatherings</div>
<div class="abs center h1" style="top:340px;font-size:132px">Lamps lit,<br>plates <span class="foil">full.</span></div>
${bloom(540, 930, 520, 'rgba(242,182,79,.3)')}
${archWindow({ x: 250, y: 660, w: 580, h: 580, glow: 'plum', spring: 0.44 })}
${dishImg('gulab-jamun', { w: 660, sillY: 1240, base: 650 })}
${diya(98, 1150, 0.9)}${diya(884, 1150, 0.9)}
<div class="abs center body" style="top:1290px;font-size:42px">Planning a Diwali gathering?<br><span class="it" style="font-size:46px;color:${C.goldLt}">Call us to plan your catering.</span></div>
${wordmark('midnight', { y: 1480, h: 72 })}`,
  }),
});

// Story safe-zone guide: the four stories at 0.43× with UI-overlay bands marked.
{
  const sc = 0.43, tw = SW * sc, th = SH * sc;
  const ids = ['story-dinner-occasion', 'story-spice-poll', 'story-garlic-naan-order', 'story-diwali-gathering'];
  const tiles = ids.map((id, i) => {
    const x = 60 + (i % 2) * (tw + 40), y = 300 + Math.floor(i / 2) * (th + 110);
    return `<div class="abs tile" style="left:${x}px;top:${y}px;width:${tw}px;height:${th}px">
<img src="../../${id}.png" alt="" style="width:100%;height:100%;display:block">
<div class="band" style="top:0;height:${250 * sc}px"><span>Top ~250 px</span></div>
<div class="band" style="bottom:0;height:${340 * sc}px"><span>Bottom ~340 px</span></div>
<div class="side" style="left:0"></div><div class="side" style="right:0"></div>
<div class="safe" style="top:${250 * sc}px;bottom:${340 * sc}px;left:${64 * sc}px;right:${64 * sc}px"></div></div>
<div class="abs cap" style="left:${x}px;top:${y + th + 18}px;width:${tw}px">${['Hero scene', 'Spice poll', 'Order · garlic naan', 'Diwali gathering'][i]}</div>`;
  }).join('');
  add({
    id: 'story-safe-zone-guide', w: SW, h: 2240, html: page({
      w: SW, h: 2240, kind: 'midnight', css: `
.tile{border-radius:22px;overflow:hidden;box-shadow:0 0 0 2px rgba(247,217,138,.6),0 24px 50px -20px rgba(0,0,0,.7)}
.band{position:absolute;left:0;right:0;background:repeating-linear-gradient(135deg,rgba(244,201,187,.42) 0 10px,rgba(163,23,63,.42) 10px 20px);display:flex;align-items:center;justify-content:center}
.band span{font:800 21px/1 'Hanken Grotesk';letter-spacing:.06em;color:#160B26;background:#FBF3E4;padding:6px 10px;border-radius:6px}
.side{position:absolute;top:0;bottom:0;width:${64 * sc}px;background:rgba(244,201,187,.28)}
.safe{position:absolute;outline:3px dashed #FBE3A0}
.cap{text-align:center;font:600 28px/1 'Hanken Grotesk';color:${C.ivory}}
.leg{display:flex;gap:30px;justify-content:center;font:500 26px/1.2 'Hanken Grotesk';color:${C.ivory}}
.leg i{display:inline-block;width:30px;height:20px;vertical-align:middle;margin-right:10px;border-radius:4px}`,
      body: `
<div class="abs center eyebrow" style="top:96px">Stories · 1080 × 1920</div>
<div class="abs center h2" style="top:138px;font-size:76px">Safe-zone guide</div>
<div class="abs center leg" style="top:240px"><span><i style="background:repeating-linear-gradient(135deg,#F4C9BB 0 5px,#A3173F 5px 10px)"></i>App UI overlays</span><span><i style="outline:3px dashed #FBE3A0;outline-offset:-3px"></i>Keep key content inside</span></div>
${tiles}
<div class="abs center" style="top:2096px;width:940px;font:500 25px/1.35 'Hanken Grotesk';color:rgba(251,243,228,.8)">Overlay bands are approximate (about 250 px top, 340 px bottom and 64 px at the sides) and shift between app versions and devices. Check in the app before posting.</div>`,
    }),
  });
}

// ──────────────────────────────── HIGHLIGHT COVERS 1080×1920 ────────────────────────────────
const HL = [
  ['menu', 'Menu', 'menu-book', 'plum'], ['biryani', 'Biryani', 'biryani-pot-handi', 'emerald'], ['tandoor', 'Tandoor', 'tandoor-oven', 'ruby'], ['curry', 'Curry', 'curry-bowl', 'peacock'],
  ['sweets', 'Sweets', 'gulab-jamun', 'plum'], ['catering', 'Catering', 'party-tray', 'emerald'], ['order', 'Order', 'shopping-bag', 'ruby'], ['visit', 'Visit', 'map-pin', 'peacock'],
];
const DISC = { plum: ['#5E2466', '#2A0F33'], emerald: ['#17664F', '#06281F'], ruby: ['#8E1A40', '#3A0719'], peacock: ['#14838C', '#073A42'] };
for (const [key, label, ic, kind] of HL) {
  const d = DISC[kind];
  add({
    id: 'highlight-' + key, w: SW, h: SH, html: page({
      w: SW, h: SH, kind, noFrame: true, css: `
.disc{position:absolute;left:${540 - 370}px;top:${960 - 370}px;width:740px;height:740px;border-radius:50%;display:flex;align-items:center;justify-content:center;
background:radial-gradient(circle at 50% 36%,${d[0]},${d[1]} 78%);box-shadow:0 0 0 10px #E9A63A,0 0 0 11px #FBE3A0,0 0 0 30px rgba(10,4,18,.28),0 0 0 32px rgba(247,217,138,.55),0 40px 90px -30px rgba(0,0,0,.7)}
.disc::before{content:'';position:absolute;inset:30px;border-radius:50%;border:3px solid rgba(247,217,138,.28)}`,
      body: `${bloom(540, 960, 560, 'rgba(242,182,79,.18)')}<div class="disc">${iconInline(ic, { size: 500, color: '#F4C45E', stroke: 2.5, fillOpacity: 0.5 })}</div>
<div class="abs center eyebrow" style="top:1500px;font-size:30px;opacity:.7">${label}</div>`,
    }),
  });
}
// Highlight row preview (what the circles look like on a profile)
add({
  id: 'highlight-covers-preview', w: 1080, h: 900, html: page({
    w: 1080, h: 900, kind: 'midnight', css: `.hc{position:absolute;width:200px;text-align:center}
.hc .c{width:200px;height:200px;border-radius:50%;overflow:hidden;box-shadow:0 0 0 4px #160B26,0 0 0 7px rgba(247,217,138,.75)}
.hc img{width:200px;height:355.5px;margin-top:-77.75px;display:block}
.hc .t{margin-top:24px;font:600 30px/1 'Hanken Grotesk';color:${C.ivory}}`,
    body: `<div class="abs center eyebrow" style="top:96px">Story highlight covers</div>
<div class="abs center h2" style="top:138px;font-size:68px">Eight doors into the District</div>
${HL.map(([key, label], i) => `<div class="hc" style="left:${110 + (i % 4) * 230}px;top:${290 + Math.floor(i / 4) * 300}px"><div class="c"><img src="../../highlight-${key}.png" alt=""></div><div class="t">${label}</div></div>`).join('')}`,
  }),
});

// ──────────────────────────────── PROFILE AVATAR ────────────────────────────────
add({
  id: 'profile-avatar', w: 1080, h: 1080, html: page({ w: 1080, h: 1080, kind: 'midnight', noFrame: true, body: `<img class="abs" alt="" src="${logo('social-avatar-1080')}" style="inset:0;width:1080px;height:1080px">` }),
});
add({
  id: 'profile-avatar-sizes', w: 1080, h: 820, html: page({
    w: 1080, h: 820, kind: 'ivory', css: `.av{position:absolute;border-radius:50%;overflow:hidden;box-shadow:0 0 0 3px #FBF3E4,0 0 0 5px rgba(183,121,31,.6)}.av img{width:100%;height:100%;display:block}
.lb{position:absolute;text-align:center;font:600 26px/1.2 'Hanken Grotesk';color:#3B2A44}`,
    body: `<div class="abs center eyebrow dk" style="top:96px">Profile avatar · circle crop</div>
<div class="abs center h2 ink" style="top:140px;font-size:66px">Reads at every size</div>
<div class="av" style="left:110px;top:300px;width:320px;height:320px"><img src="../../profile-avatar.png" alt=""></div>
<div class="av" style="left:520px;top:380px;width:180px;height:180px"><img src="../../profile-avatar.png" alt=""></div>
<div class="av" style="left:780px;top:425px;width:110px;height:110px"><img src="../../profile-avatar.png" alt=""></div>
<div class="av" style="left:946px;top:452px;width:56px;height:56px"><img src="../../profile-avatar.png" alt=""></div>
<div class="lb" style="left:110px;width:320px;top:660px">Profile page<br>320 px</div><div class="lb" style="left:470px;width:280px;top:660px">Feed post<br>180 px</div><div class="lb" style="left:735px;width:200px;top:660px">Stories<br>110 px</div><div class="lb" style="left:904px;width:140px;top:660px">Comments<br>56 px</div>`,
  }),
});

// ──────────────────────────────── FACEBOOK COVER 1640×856 ────────────────────────────────
function fbCover(guide) {
  const W = 1640, H = 856;
  const g = guide ? `<div class="abs" style="left:0;right:0;top:0;height:116px" data-band></div><div class="abs" style="left:0;right:0;bottom:0;height:116px" data-band></div>
<div class="abs" style="left:0;top:0;bottom:0;width:59px" data-side></div><div class="abs" style="right:0;top:0;bottom:0;width:59px" data-side></div>
<div class="abs" style="left:59px;right:59px;top:116px;bottom:116px;outline:4px dashed #FBE3A0"></div>
<div class="abs gl" style="left:80px;top:40px">Desktop shows ~1640 × 624 (top and bottom ~116 px hidden)</div>
<div class="abs gl" style="left:80px;bottom:40px">Mobile shows ~1522 × 856 (~59 px hidden each side) · profile photo overlaps lower-left on some layouts</div>` : '';
  add({
    id: guide ? 'facebook-cover-crop-guide' : 'facebook-cover', w: W, h: H, html: page({
      w: W, h: H, kind: 'midnight', noFrame: true, css: `[data-band]{background:repeating-linear-gradient(135deg,rgba(244,201,187,.4) 0 12px,rgba(163,23,63,.4) 12px 24px)}[data-side]{background:rgba(244,201,187,.3)}
.gl{font:700 24px/1 'Hanken Grotesk';color:#160B26;background:#FBF3E4;padding:8px 12px;border-radius:6px}`,
      body: `${heroScene(W, H, { file: 'hero-landscape-static', x: 470, y: -150, width: 1600 })}
<div class="abs" style="left:0;top:0;bottom:0;width:1060px;background:linear-gradient(90deg,#160B26 0,#160B26 520px,rgba(22,11,38,.85) 700px,rgba(22,11,38,0) 1060px)"></div>
<div class="abs" style="left:0;top:0;bottom:0;width:640px;background:url(${L.pattern('01-jali-lattice-midnight')}) 0 0/240px;opacity:.12;mix-blend-mode:screen"></div>
${L.frame(W, H, { tone: 'dark', inset: 26 })}
<img class="abs" alt="" src="${logo('colourways/wordmark-horizontal--foil')}" style="left:130px;top:178px;height:118px">
<div class="abs h1" style="left:130px;top:340px;font-size:92px;line-height:1">Dinner, made<br>an <span class="foil">occasion.</span></div>
<div class="abs eyebrow" style="left:132px;top:568px;font-size:26px">Indian Kitchen · Little Elm, TX</div>
${g}`,
    }),
  });
}
fbCover(false);
fbCover(true);

// ──────────────────────────────── GOOGLE BUSINESS PROFILE ────────────────────────────────
// Specs from research/social_gbp_playbook.md (secondary sources, medium confidence — verify in the GBP dashboard):
// cover 16:9 (~1024×576; exported at 1600×900), logo 720×720, post 1200×900 (4:3), photo tiles 1:1 exported at 1600.
add({
  id: 'gbp-cover', w: 1600, h: 900, html: page({
    w: 1600, h: 900, kind: 'midnight', body: `
${bloom(800, 450, 660, 'rgba(242,182,79,.26)')}
${archWindow({ x: 150, y: 296, w: 330, h: 508, glow: 'emerald', spring: 0.46, lobes: 3, finial: false })}
${archWindow({ x: 1120, y: 296, w: 330, h: 508, glow: 'ruby', spring: 0.46, lobes: 3, finial: false })}
${archWindow({ x: 525, y: 112, w: 550, h: 692, glow: 'plum', spring: 0.44 })}
${dishImg('garlic-naan', { w: 420, cx: 315, sillY: 804, base: 700 })}
${dishImg('butter-chicken', { w: 450, cx: 1285, sillY: 804, base: 618 })}
${dishImg('biryani', { w: 660, cx: 800, sillY: 804, base: 650 })}`,
  }),
});
add({
  id: 'gbp-logo', w: 720, h: 720, html: page({
    w: 720, h: 720, kind: 'midnight', noFrame: true, body: `${bloom(360, 360, 330, 'rgba(242,182,79,.22)')}
<div class="abs" style="left:60px;top:60px;width:600px;height:600px;border-radius:50%;box-shadow:0 0 0 3px rgba(233,166,58,.85),0 0 0 14px rgba(10,4,18,.25),0 0 0 15px rgba(247,217,138,.45)"></div>
<img class="abs" alt="" src="${logo('colourways/emblem--foil')}" style="left:50%;transform:translateX(-50%);top:150px;height:420px">`,
  }),
});
function gbpPost({ id, kind, glow, dish, dishW, base, eyebrow, h, cta }) {
  add({
    id, w: 1200, h: 900, html: page({
      w: 1200, h: 900, kind, frameOpts: { inset: 28 }, body: `
${bloom(860, 440, 420)}
${archWindow({ x: 640, y: 120, w: 440, h: 600, glow, spring: 0.44 })}
${dishImg(dish, { w: dishW, cx: 860, sillY: 720, base })}
<div class="abs eyebrow" style="left:100px;top:190px">${eyebrow}</div>
<div class="abs h1" style="left:96px;top:240px;font-size:88px;line-height:1.02;width:520px">${h}</div>
<div class="abs" style="left:100px;top:${cta ? 560 : 600}px">${cta ? `<span class="pill gold" style="height:80px;font-size:30px;padding:0 38px">${cta} ${arrow(38, C.ink, 4)}</span>` : ''}</div>
<img class="abs" alt="" src="${logo('colourways/wordmark-horizontal--foil')}" style="left:100px;top:${cta ? 700 : 640}px;height:72px">`,
    }),
  });
}
gbpPost({ id: 'gbp-post-update', kind: 'emerald', glow: 'midnight', dish: 'tandoori-platter', dishW: 520, base: 712, eyebrow: 'Little Elm, TX', h: 'Fire, smoke and <span class="foil">comfort.</span>' });
gbpPost({ id: 'gbp-post-order', kind: 'plum', glow: 'emerald', dish: 'butter-chicken', dishW: 540, base: 618, eyebrow: 'Pickup from FM 423', h: 'Take the evening <span class="foil">home.</span>', cta: 'Order online' });
for (const [dish, kind, glow, dishW, base] of [['butter-chicken', 'midnight', 'plum', 1100, 618], ['biryani', 'emerald', 'midnight', 900, 650], ['garlic-naan', 'ruby', 'emerald', 1000, 700]]) {
  add({
    id: 'gbp-tile-' + dish, w: 1600, h: 1600, html: page({
      w: 1600, h: 1600, kind, frameOpts: { inset: 44 }, body: `
${bloom(800, 760, 700)}
${archWindow({ x: 330, y: 170, w: 940, h: 1110, glow, spring: 0.42, lobes: 5 })}
${dishImg(dish, { w: dishW, cx: 800, sillY: 1280, base })}
<img class="abs" alt="" src="${logo('colourways/wordmark-horizontal--foil')}" style="left:50%;transform:translateX(-50%);top:1376px;height:110px">`,
    }),
  });
}

// ──────────────────────────────── FEED GRID PREVIEW (generic phone, no app UI) ────────────────────────────────
{
  const G = ['post-hero-butter-chicken', 'post-zone-biryani-boulevard', 'post-spice-meter', 'post-ratings-card', 'post-order-online-qr', 'post-catering-celebrations',
    'post-chefs-pick-example', 'post-daily-special-example', 'post-did-you-know-dum', 'post-zone-tandoor-quarter', 'motion-foil-wordmark', 'post-did-you-know-tandoor'];
  const sw = 876, tw = (sw - 6) / 3, th = tw * 4 / 3;
  const tiles = G.map((id, i) => `<div class="gt" style="left:${(i % 3) * (tw + 3)}px;top:${Math.round(Math.floor(i / 3) * (th + 3))}px;width:${tw.toFixed(1)}px;height:${th.toFixed(1)}px"><img src="../../${id}.${id.startsWith('motion') ? 'jpg' : 'png'}" alt="">${id.startsWith('motion') ? '<svg class="play" viewBox="0 0 20 20"><path d="M6 4L16 10L6 16Z" fill="#FBF3E4"/></svg>' : ''}</div>`).join('');
  add({
    id: 'feed-grid-preview', w: 1080, h: 2200, html: page({
      w: 1080, h: 2200, kind: 'midnight', noFrame: true, css: `
.phone{position:absolute;left:80px;top:250px;width:920px;height:1900px;border-radius:110px;background:linear-gradient(145deg,#3A2A44,#120A1A);box-shadow:0 0 0 2px rgba(247,217,138,.35),0 50px 100px -30px rgba(0,0,0,.8)}
.scr{position:absolute;left:22px;top:22px;width:${sw}px;height:1856px;border-radius:90px;overflow:hidden;background:#FBF3E4}
.gt{position:absolute;overflow:hidden}.gt img{width:100%;height:100%;object-fit:cover;display:block}
.play{position:absolute;right:12px;top:12px;width:34px;height:34px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.6))}
.av{position:absolute;left:44px;top:70px;width:118px;height:118px;border-radius:50%;overflow:hidden;box-shadow:0 0 0 3px #FBF3E4,0 0 0 5px #B7791F}.av img{width:100%;height:100%}
.nm{position:absolute;left:190px;top:84px;font:700 40px/1 'Fraunces';color:#160B26}.bio{position:absolute;left:190px;top:136px;font:500 26px/1.3 'Hanken Grotesk';color:#4B3A55}`,
      body: `<div class="abs center eyebrow" style="top:90px">Feed grid · 3 × 4 preview</div>
<div class="abs center h2" style="top:132px;font-size:64px">A jewel-tone mosaic</div>
<div class="phone"><div class="scr"><div class="av"><img src="../../profile-avatar.png" alt=""></div><div class="nm">Curry District</div><div class="bio">Indian Kitchen · Little Elm, TX</div>
<div style="position:absolute;left:0;top:210px;width:100%">${tiles}</div></div></div>`,
    }),
  });
}

// ──────────────────────────────── FEED RHYTHM BOARD (4 weeks from the playbook calendar) ────────────────────────────────
{
  // Day 1 = Mon 12 Oct 2026 (research/social_gbp_playbook.md §C). k = kit asset; null = needs real footage/photo.
  const D = [
    ['IG+FB · Reel', 'Butter chicken steam pull', 'motion-steam-glints'], ['GBP · Update', 'Fresh photos, same fire', 'gbp-post-update'], ['IG · Story poll', 'Mild, hot or District Hot?', 'story-spice-poll'],
    ['TikTok · Video', 'Tandoori sizzle, sound on', null], ['IG · Carousel', 'First-timer picks', 'post-hero-butter-chicken'], ['IG+FB · Reel', 'Chef hands: dough and tadka', null], ['IG+FB · Story', 'Sunday is for sharing', 'story-dinner-occasion'],
    ['GBP · Update', 'Order online (happy-hour post held: unverified)', 'gbp-post-order'], ['IG+FB · Reel', 'Dussehra greeting + kitchen B-roll', null], ['TikTok · Video', 'Spice challenge ep. 1', 'post-spice-meter'],
    ['IG · Carousel', 'Biryani Boulevard (price post held)', 'post-zone-biryani-boulevard'], ['IG · Reel', 'Three naans, three tears', 'story-garlic-naan-order'], ['IG+FB · Photo', 'Staff feature (owner facts needed)', null], ['IG+GBP · Story', 'Review QR launch; thank-you card', 'post-ratings-card'],
    ['IG · Story', 'Customer repost (with permission)', null], ['FB+GBP · Event', 'Diwali gatherings', 'story-diwali-gathering'], ['TikTok · Video', 'Menu words, decoded', 'post-did-you-know-tandoor'], ['IG · Reel', 'Tandoor flame close-up', 'motion-ember-arch'],
    ['IG · Carousel', 'Spice cabinet 101', 'post-did-you-know-dum'], ['IG+FB · Reel', 'Trick or heat? vindaloo dare', null], ['GBP · Update', 'Diwali hours + order online', 'gbp-post-order'],
    ['IG · Collab Reel', 'Creator tasting (disclosed)', null], ['TikTok · Video', 'Something sweet (verify menu)', null], ['IG · Story series', 'Diwali countdown', 'story-diwali-gathering'], ['IG · Carousel', 'Celebrations, beautifully fed', 'post-catering-celebrations'],
    ['IG+FB · Reel', 'Lights on + wordmark end card', 'motion-foil-wordmark'], ['FB+IG · Story', 'See you tomorrow', 'story-dinner-occasion'], ['All · Reel + GBP', 'Diwali greeting (verify date)', null],
  ];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const cw = 350, ch = 300, x0 = 170, y0 = 330;
  const cells = D.map((d, i) => {
    const wk = Math.floor(i / 7), dy = i % 7, date = new Date(Date.UTC(2026, 9, 12 + i));
    const lab = `${days[dy]} ${date.getUTCDate()} ${date.getUTCMonth() === 9 ? 'Oct' : 'Nov'}`;
    const src = d[2] ? `../../${d[2]}.${d[2].startsWith('motion') ? 'jpg' : 'png'}` : '';
    const kind = d[2] ? (d[2].split('-')[0]) : 'shoot';
    return `<div class="cell k-${kind}" style="left:${x0 + wk * (cw + 16)}px;top:${y0 + dy * (ch + 14)}px">
<div class="th">${src ? `<img src="${src}" alt="">` : iconInline('spoon-fork', { size: 70, color: '#B7791F', stroke: 2 })}</div>
<div class="tx"><div class="dt">Day ${i + 1} · ${lab}</div><div class="pf">${d[0]}</div><div class="id">${d[1]}</div><div class="src">${d[2] ? 'Kit: ' + d[2].replace(/^(post|story|gbp|motion)-/, '').replace(/-/g, ' ') : 'Needs real footage'}</div></div></div>`;
  }).join('');
  add({
    id: 'feed-rhythm-board', w: 1640, h: 2600, html: page({
      w: 1640, h: 2600, kind: 'ivory', css: `
.cell{position:absolute;width:${cw}px;height:${ch}px;border-radius:22px;background:#FFFDF8;box-shadow:0 0 0 2px rgba(183,121,31,.4);display:flex;gap:16px;padding:16px;overflow:hidden}
.cell::before{content:'';position:absolute;left:0;top:0;bottom:0;width:8px}
.k-post::before{background:#0F4D3F}.k-story::before{background:#A3173F}.k-motion::before{background:#E9A63A}.k-gbp::before{background:#117C86}.k-shoot::before{background:repeating-linear-gradient(180deg,#B7791F 0 8px,transparent 8px 14px)}
.th{flex:none;width:126px;height:268px;border-radius:14px;overflow:hidden;background:#F3E4C8;display:flex;align-items:center;justify-content:center}.th img{width:100%;height:100%;object-fit:cover}
.tx{display:flex;flex-direction:column;gap:8px;padding-top:4px}
.dt{font:700 21px/1.1 'Hanken Grotesk';letter-spacing:.1em;text-transform:uppercase;color:#8A5A12}.pf{font:700 22px/1.2 'Hanken Grotesk';color:#0F4D3F}
.id{font:600 27px/1.15 'Fraunces';color:#160B26}.src{margin-top:auto;font:500 19px/1.2 'Hanken Grotesk';color:#5E4E66}
.dl{position:absolute;left:66px;width:90px;font:700 30px/1 'Fraunces';color:#4B1D52}.wl{position:absolute;width:${cw}px;text-align:center;font:700 24px/1 'Hanken Grotesk';letter-spacing:.2em;text-transform:uppercase;color:#8A5A12}
.lg{display:flex;gap:30px;justify-content:center;font:600 24px/1 'Hanken Grotesk';color:#3B2A44}.lg i{display:inline-block;width:22px;height:22px;border-radius:5px;vertical-align:-4px;margin-right:9px}`,
      body: `<div class="abs center eyebrow dk" style="top:96px">Feed rhythm · 4 weeks from 12 Oct 2026</div>
<div class="abs center h2 ink" style="top:140px;font-size:72px">What goes out, and when</div>
<div class="abs center lg" style="top:240px"><span><i style="background:#0F4D3F"></i>Kit post</span><span><i style="background:#A3173F"></i>Kit story</span><span><i style="background:#E9A63A"></i>Kit motion</span><span><i style="background:#117C86"></i>GBP</span><span><i style="background:#B7791F"></i>Real footage / photo</span></div>
${[0, 1, 2, 3].map((w) => `<div class="wl" style="left:${x0 + w * (cw + 16)}px;top:296px">Week ${w + 1}</div>`).join('')}
${days.map((d, i) => `<div class="dl" style="top:${y0 + i * (ch + 14) + 130}px">${d}</div>`).join('')}
${cells}
<div class="abs center" style="top:2546px;width:1400px;font:500 22px/1.3 'Hanken Grotesk';color:#5E4E66">From the playbook's 30-day starter calendar (days 29–30 omitted). Holiday dates, happy hour and prices are unverified, so those posts stay on hold until the owners confirm them.</div>`,
    }),
  });
}

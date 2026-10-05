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

// 9 Instagram/Facebook feed posts, 1080×1350 (4:5). Key content sits inside the
// centre 1012px so the profile grid's 3:4 crop never clips it.
const L = require('./lib');
const { ol, C, dish, icon, logo, sunburst, sparkle, stars, sampleQR, arrow, inlineArrow, bunting, page, patternUrl } = L;
const { footer, FOOT_CSS, kicker, halo } = require('./parts');

const W = 1080, H = 1350;
const P = (id, file, title, caption, body, css, bg) => ({
  id, file, w: W, h: H, type: 'image', tags: ['post'], title, caption,
  html: () => page({ w: W, h: H, title, bg, body, css: FOOT_CSS + css })
});

const sparkles = (list) => `<svg class="abs" aria-hidden="true" style="left:0;top:0" width="${W}" height="${H}">${list.map(s => sparkle(...s)).join('')}</svg>`;

module.exports = [

// 1 ─ HERO DISH on a pattern sunburst
P('post-01-hero-dish', 'post-01-hero-dish', 'Hero dish · Butter Chicken',
  'One dish, one sunburst, one big name: the scroll-stopper template for every fan favourite.',
  `${sunburst({ w: W, h: H, cx: 540, cy: 560, n: 36, a: C.saffron, b: C.marigold, patB: '03-block-print-booti-sunset', patScale: 0.9 })}
   ${halo({ cx: 540, cy: 560, r: 380, bumps: 44, ring: C.rani, disc: C.cream })}
   ${dish('butter-chicken', { style: 'left:105px;top:150px;width:870px;height:870px', cls: 'hero' })}
   ${kicker('Curry Quarter', { x: 64, y: 64 })}
   <div class="tag hand">needs its own<br>zip code!<small>(ours is 75068)</small></div>
   <h1 class="disp hl">Butter<br>Chicken</h1>
   ${footer({ dark: false })}`,
  `.hero .steam{stroke:${C.ink};opacity:.55}
   .tag{position:absolute;right:58px;top:70px;background:${C.cream};border:5px solid ${C.ink};border-radius:22px;padding:14px 24px 16px;font-size:50px;text-align:center;transform:rotate(5deg);box-shadow:8px 8px 0 ${C.ink};color:${C.ink}}
   .tag small{display:block;font-size:34px;color:${C.rani};margin-top:4px}
   .hl{position:absolute;left:0;right:0;top:905px;text-align:center;font-size:150px;color:${C.cream};${ol(10, C.ink, 10, 10, C.ink)}}`,
  C.saffron),

// 2 ─ ZONE FEATURE · Biryani Boulevard (night street sign)
P('post-02-zone-biryani-boulevard', 'post-02-zone-biryani-boulevard', 'Zone feature · Biryani Boulevard',
  'Turns the menu into a map: each zone gets its own street sign, so a series of these reads like a walk through the District.',
  `<div class="glow"></div>
   ${sparkles([[120,330,16,C.cream,{sw:0}],[960,300,12,C.marigold,{sw:0}],[90,620,10,C.peacock,{sw:0}],[1000,640,18,C.rani,{sw:0}],[170,980,12,C.marigold,{sw:0}],[930,1010,14,C.cream,{sw:0}]])}
   ${bunting({ w: W, y: -6, sag: 70, n: 12, size: 74 })}
   <div class="pole"></div>
   <div class="sign"><span class="disp">Biryani<br>Boulevard</span></div>
   <p class="tagl">Lift the lid. Inhale. Repeat.</p>
   ${dish('biryani', { style: 'left:205px;top:520px;width:670px;height:670px', cls: 'z' })}
   <div class="chips"><span>Chicken Dum</span><span>Chicken 65</span><span>Gongura Veg</span><span>Paneer</span></div>
   ${footer({ dark: true })}`,
  `.glow{position:absolute;left:140px;top:560px;width:800px;height:620px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,106,19,.55),rgba(228,20,126,.18) 60%,transparent)}
   .pole{position:absolute;left:526px;top:90px;width:28px;height:110px;background:${C.marigold};border:6px solid ${C.ink};border-radius:8px;box-shadow:0 0 0 4px ${C.cream}}
   .sign{position:absolute;left:96px;right:96px;top:176px;background:${C.peacock};border:8px solid ${C.cream};border-radius:22px;box-shadow:0 0 0 7px ${C.ink},14px 14px 0 7px ${C.rani};text-align:center;padding:34px 20px 36px}
   .sign::after{content:"";position:absolute;inset:12px;border:4px solid ${C.cream};border-radius:12px;opacity:.85}
   .sign .disp{font-size:112px;color:${C.cream};line-height:.98;${ol(7, C.ink, 7, 7, C.ink)}}
   .tagl{position:absolute;left:0;right:0;top:500px;text-align:center;font-weight:800;font-size:46px;color:${C.marigold};letter-spacing:.01em}
   .z .steam{stroke:${C.cream};opacity:.8}
   .chips{position:absolute;left:60px;right:60px;top:1112px;display:flex;justify-content:center;gap:14px}
   .chips span{background:${C.marigold};color:${C.ink};border:5px solid ${C.ink};border-radius:999px;padding:10px 22px;font-weight:800;font-size:30px;box-shadow:5px 5px 0 ${C.rani};white-space:nowrap}`,
  C.ink),

// 3 ─ SPICE METER (5 chillies)
P('post-03-spice-meter', 'post-03-spice-meter', 'Spice meter · Pick your heat',
  'A five-chilli scale guests can screenshot; it answers the top review theme (heat levels) with honest copy: even Mild has a kick.',
  `${sparkles([[960,120,22,C.marigold,{sw:0}],[1010,250,12,C.rani,{sw:0}],[880,330,10,C.peacock,{sw:0}]])}
   ${kicker('Spice scale', { cls: 'rani', x: 64, y: 64 })}
   <h1 class="disp hl">Pick your<br><span>heat</span></h1>
   <div class="meter"><div class="therm"></div>
   ${[['chili-1','Mild','a gentle warm-up',C.marigold],['chili-2','Medium','the happy middle',C.saffron],['chili-3','Hot','a proper kick',C.chili],['chili-4','Extra-Hot','for the brave',C.rani],['chili-5','District Hot','full Andhra fire',C.sky]].map(([ic,lab,sub,col],i)=>`
     <div class="row" style="--c:${col}"><span class="badge">${icon(ic,{style:'width:96px;height:96px'})}</span><span class="lab"><b class="disp">${lab}</b><em>${sub}</em></span><span class="lvl disp">${i+1}</span></div>`).join('')}
   </div>
   <div class="note hand">heads-up: even<br>Mild has a kick!</div>
   <p class="ask"><b>Thoda teekha</b> <i>(a little spicy)</i> or full Andhra fire? Tell us when you order.</p>
   ${footer({ dark: true })}`,
  `.hl{position:absolute;left:64px;top:170px;font-size:118px;color:${C.cream};text-shadow:8px 8px 0 ${C.rani}}
   .hl span{color:${C.marigold}}
   .meter{position:absolute;left:64px;right:64px;top:430px}
   .therm{position:absolute;left:-2px;top:20px;bottom:20px;width:0}
   .row{display:flex;align-items:center;gap:26px;background:${C.cream};border:5px solid ${C.ink};border-radius:24px;height:112px;margin-bottom:16px;box-shadow:9px 9px 0 var(--c);padding-right:26px}
   .row:nth-child(2){margin-right:150px} .row:nth-child(3){margin-right:110px} .row:nth-child(4){margin-right:70px} .row:nth-child(5){margin-right:30px}
   .badge{width:128px;height:102px;background:var(--c);border-radius:19px 0 0 19px;display:flex;align-items:center;justify-content:center;border-right:5px solid ${C.ink}}
   .lab{flex:1;display:flex;flex-direction:column;gap:2px}
   .lab b{font-size:46px;color:${C.ink};line-height:1}
   .lab em{font-style:normal;font-weight:700;font-size:28px;color:${C.muted}}
   .lvl{font-size:40px;color:${C.ink};opacity:.25}
   .note{position:absolute;right:56px;top:318px;font-size:46px;color:${C.marigold};transform:rotate(6deg);text-align:right}
   .ask{position:absolute;left:64px;right:64px;top:1062px;font-size:33px;line-height:1.3;color:${C.cream};font-weight:500;text-align:center}
   .ask b{color:${C.marigold};font-weight:800} .ask i{font-style:normal;opacity:.85}`,
  C.ink),

// 4 ─ DAILY SPECIAL template (editable zones)
P('post-04-daily-special', 'post-04-daily-special', "Daily special · template",
  'Fill-in template: swap the dish art, name, one-liner and badges each day; no prices by design, so it never goes stale.',
  `${sunburst({ w: W, h: H, cx: 540, cy: 520, n: 40, a: C.rani, b: '#D10E72', patB: '06-spice-confetti-sunset', patScale: 1.1, patOpacity: .35 })}
   <div class="tsp plate cream" style="font-size:60px">Today’s special</div>
   <div class="card sp"></div>
   ${dish('paneer-tikka', { style: 'left:250px;top:186px;width:580px;height:580px', cls: 'pt' })}
   <h2 class="disp nm" data-zone="A">Paneer Tikka<br>Kabab</h2>
   <p class="ln" data-zone="B">Paneer with char marks and a spicy attitude.</p>
   <div class="bd" data-zone="C"><span class="b1">${icon('veg-mark',{style:'width:44px;height:44px'})}Veg</span><span class="b2">${icon('chili-2',{style:'width:50px;height:50px'})}Medium</span><span class="hand mast">Ekdum mast! <small>(absolutely awesome)</small></span></div>
   ${footer({ dark: false })}`,
  `.tsp{position:absolute;left:50%;top:58px;transform:translateX(-50%) rotate(-2deg);white-space:nowrap;padding:14px 34px 18px;box-shadow:10px 10px 0 ${C.ink}}
   .sp{position:absolute;left:70px;right:70px;top:250px;height:900px;background:${C.cream}}
   .pt .steam{stroke:${C.ink};opacity:.5}
   .nm{position:absolute;left:90px;right:90px;top:752px;text-align:center;font-size:96px;color:${C.ink};line-height:.95}
   .ln{position:absolute;left:110px;right:110px;top:952px;text-align:center;font-size:37px;font-weight:600;color:${C.ink}}
   .bd{position:absolute;left:100px;right:100px;top:1030px;display:flex;justify-content:center;align-items:center;gap:18px}
   .bd>span:not(.mast){display:inline-flex;align-items:center;gap:10px;border:5px solid ${C.ink};border-radius:999px;padding:6px 20px 6px 12px;font-weight:800;font-size:30px;text-transform:uppercase;letter-spacing:.04em;background:#fff}
   .mast{font-size:44px;color:${C.rani};margin-left:6px;white-space:nowrap} .mast small{font-size:30px;color:${C.muted}}`,
  C.rani),

// 5 ─ RATINGS card (sourced public ratings only)
P('post-05-ratings', 'post-05-ratings', 'Ratings card · as listed publicly',
  'Only sourced public ratings, dated and labelled, with no invented quotes; social proof that stays true.',
  `${sunburst({ w: W, h: H, cx: 540, cy: 330, n: 44, a: C.cream, b: C.surface2 })}
   ${kicker('As listed publicly · Oct 2026', { cls: '', x: 64, y: 64, size: 30 })}
   <h1 class="disp hl">Shukriya,<br>Little Elm!</h1>
   <div class="gl hand">(shukriya = thank you)</div>
   <div class="grid">
   ${[['Google','4.2',4.2,'about 1,000 reviews',C.marigold,'approx.'],['Uber Eats','4.5',4.5,'2,000+ ratings',C.peacock,''],['Restaurantji','4.5',4.5,'479 reviews',C.rani,''],['Yelp','4.0',4.0,'120 reviews',C.saffron,'']].map(([pf,num,v,cnt,col,ap])=>`
     <div class="rc" style="--c:${col}"><div class="pf">${pf}${ap?` <i>${ap}</i>`:''}</div><div class="num disp">${num}</div>${stars(v,{size:46,gap:8})}<div class="cnt">${cnt}</div></div>`).join('')}
   </div>
   <p class="fn">Ratings as listed publicly in Oct 2026; they change over time. Google figure is approximate. No reviews quoted or paid for.</p>
   ${footer({ dark: false })}`,
  `.hl{position:absolute;left:64px;top:170px;font-size:112px;color:${C.rani};${ol(8, C.ink, 9, 9, C.ink)}}
   .gl{position:absolute;right:64px;top:300px;font-size:44px;color:${C.ink};transform:rotate(-4deg)}
   .grid{position:absolute;left:64px;right:64px;top:440px;display:grid;grid-template-columns:1fr 1fr;gap:30px 30px}
   .rc{background:#fff;border:6px solid ${C.ink};border-radius:28px;box-shadow:12px 12px 0 var(--c);padding:22px 26px 24px;height:296px;position:relative;overflow:hidden}
   .rc::before{content:"";position:absolute;left:0;top:0;right:0;height:16px;background:var(--c);border-bottom:5px solid ${C.ink}}
   .pf{font-weight:800;font-size:32px;text-transform:uppercase;letter-spacing:.06em;margin-top:12px}
   .pf i{font-style:normal;font-weight:700;font-size:22px;letter-spacing:.04em;color:${C.muted};vertical-align:3px}
   .num{font-size:112px;line-height:1;margin:6px 0 10px;color:${C.ink}}
   .cnt{font-weight:700;font-size:28px;color:${C.muted};margin-top:10px}
   .fn{position:absolute;left:84px;right:84px;top:1110px;text-align:center;font-size:24px;line-height:1.35;color:${C.muted};font-weight:600}`,
  C.cream),

// 6 ─ ORDER ONLINE CTA with SAMPLE QR
P('post-06-order-online', 'post-06-order-online', 'Order online · QR call-to-action',
  'One job, one action: a big pickup CTA and a QR slot (shown as a non-scannable sample; QR → ordering link at production).',
  `${sunburst({ w: W, h: H, cx: 540, cy: 800, n: 32, a: C.ink, b: '#28175E' })}
   ${kicker('Order online', { cls: 'saff', x: 64, y: 64 })}
   <h1 class="disp hl">Bhookh<br>lagi hai?</h1>
   <div class="gl hand">(hungry?)</div>
   <div class="qrc card">${sampleQR({ size: 380, seed: 11 })}<div class="qemb">${logo('emblem.svg',{style:'width:88px;height:auto'})}</div>
     <div class="qlab">Sample QR ${inlineArrow(C.cream)} ordering link</div></div>
   <div class="bag">${icon('shopping-bag',{style:'width:210px;height:210px'})}</div>
   <div class="cta pill">Order pickup ${inlineArrow(C.ink,1.1)}</div>
   ${footer({ dark: true })}`,
  `.hl{position:absolute;left:64px;top:168px;font-size:128px;color:${C.cream};text-shadow:9px 9px 0 ${C.rani}}
   .gl{position:absolute;left:640px;top:350px;font-size:60px;color:${C.marigold};transform:rotate(-6deg)}
   .qrc{position:absolute;left:310px;top:470px;width:460px;padding:34px 34px 20px;border-radius:30px;box-shadow:14px 14px 0 ${C.saffron};text-align:center}
   .qrc .qr{display:block;margin:0 auto}
   .qemb{position:absolute;left:50%;top:224px;transform:translate(-50%,-50%);background:#fff;padding:10px 12px;border-radius:14px}
   .qlab{display:inline-flex;align-items:center;gap:8px;margin-top:14px;background:${C.rani};color:${C.cream};font-weight:800;font-size:23px;letter-spacing:.06em;text-transform:uppercase;padding:8px 16px;border-radius:999px}
   .bag{position:absolute;left:770px;top:420px;transform:rotate(10deg)}
   .bag svg{filter:drop-shadow(8px 8px 0 ${C.rani})}
   .cta{position:absolute;left:50%;top:1046px;transform:translateX(-50%) rotate(-1.5deg);background:${C.marigold};color:${C.ink};font-family:'Bowlby One';text-transform:uppercase;font-weight:400;font-size:52px;padding:18px 44px 22px;box-shadow:9px 9px 0 ${C.rani};border-width:6px}`,
  C.ink),

// 7 ─ CATERING / party trays
P('post-07-catering', 'post-07-catering', 'Catering · party platters',
  'Sells the occasion, not a price: bunting, a loaded spread and the occasions people actually book for.',
  `${sunburst({ w: W, h: H, cx: 540, cy: 760, n: 36, a: C.peacock, b: '#13B3AA' })}
   ${bunting({ w: W, y: -6, sag: 64, n: 12, size: 70, colors: [C.rani, C.marigold, C.cream, C.saffron, C.ink] })}
   ${kicker('Catering', { cls: 'cream', x: 64, y: 150 })}
   <h1 class="disp hl">Your party.<br>Our platters.</h1>
   ${dish('samosa-chutney', { style: 'left:10px;top:600px;width:470px;height:470px', cls: 'cs' })}
   ${dish('tandoori-platter', { style: 'left:340px;top:500px;width:720px;height:720px', cls: 'ct' })}
   <div class="call hand">call us to plan!</div>
   <div class="occ"><span>Birthdays</span><span>Office lunches</span><span>Watch parties</span></div>
   ${footer({ dark: false })}`,
  `.hl{position:absolute;left:64px;top:258px;font-size:112px;color:${C.cream};${ol(9, C.ink, 10, 10, C.ink)}}
   .ct .steam,.cs .steam{stroke:${C.cream};opacity:.85}
   .call{position:absolute;left:96px;top:540px;font-size:58px;color:${C.ink};background:${C.marigold};border:5px solid ${C.ink};border-radius:18px;padding:6px 22px 12px;transform:rotate(-6deg);box-shadow:7px 7px 0 ${C.ink}}
   .occ{position:absolute;left:56px;right:56px;top:1096px;display:flex;justify-content:center;gap:14px}
   .occ span{background:${C.cream};border:5px solid ${C.ink};border-radius:999px;padding:10px 24px;font-weight:800;font-size:31px;box-shadow:6px 6px 0 ${C.ink};white-space:nowrap}`,
  C.peacock),

// 8 ─ DID YOU KNOW · menu words decoded
P('post-08-did-you-know-dum', 'post-08-did-you-know-dum', 'Did you know · what “dum” means',
  'Save-bait education post (menu words, decoded) using only generic, accurate food facts; no claims about the kitchen.',
  `<div class="night"></div>
   ${sparkles([[930,170,20,C.marigold,{sw:0}],[1000,300,12,C.cream,{sw:0}],[860,92,10,C.peacock,{sw:0}],[90,1040,12,C.marigold,{sw:0}],[1000,1010,16,C.rani,{sw:0}]])}
   ${kicker('Did you know?', { cls: 'mari', x: 64, y: 64 })}
   <div class="series">Menu words, decoded · No. 1</div>
   <h1 class="disp big">Dum</h1>
   <div class="say hand">say it like “thumb”<br>with a d</div>
   <div class="handi">${icon('biryani-pot-handi',{style:'width:330px;height:330px'})}
     <svg class="wisp" viewBox="0 0 200 160" aria-hidden="true"><g fill="none" stroke="${C.cream}" stroke-width="9" stroke-linecap="round"><path d="M50 150c-14-22 14-34 0-58s14-36 0-60"/><path d="M100 150c-14-22 14-34 0-58s14-36 0-60"/><path d="M150 150c-14-22 14-34 0-58s14-36 0-60"/></g></svg></div>
   <div class="def"><p><b>Dum</b> is slow cooking in a <b>sealed pot</b>: the lid stays on, so everything cooks gently in its own steam.</p>
   <p class="small">The word comes from Persian for <i>breath</i>.</p></div>
   <div class="try"><span class="lbl">Try it on Biryani Boulevard</span><span class="dishchip">Chicken Dum Biryani</span></div>
   ${footer({ dark: true })}`,
  `.night{position:absolute;inset:0;background:linear-gradient(165deg,${C.ink} 0%,${C.violet} 62%,#7A1670 100%)}
   .series{position:absolute;left:72px;top:160px;font-weight:800;font-size:28px;letter-spacing:.08em;text-transform:uppercase;color:${C.marigold}}
   .big{position:absolute;left:52px;top:200px;font-size:330px;color:${C.marigold};line-height:1;${ol(10, C.ink, 14, 14, C.rani)}}
   .say{position:absolute;left:76px;top:560px;font-size:46px;color:${C.cream};transform:rotate(-3deg)}
   .handi{position:absolute;left:640px;top:250px;width:330px}
   .handi .wisp{position:absolute;left:65px;top:-150px;width:200px;height:160px;opacity:.9}
   .handi svg:not(.wisp){filter:drop-shadow(10px 10px 0 ${C.rani})}
   .def{position:absolute;left:64px;right:64px;top:700px;background:${C.cream};border:6px solid ${C.ink};border-radius:28px;box-shadow:12px 12px 0 ${C.marigold};padding:30px 36px 28px}
   .def p{font-size:40px;line-height:1.28;font-weight:500;color:${C.ink}}
   .def b{font-weight:800}
   .def .small{font-size:32px;margin-top:12px;color:${C.muted};font-weight:600}
   .def i{font-style:normal;font-weight:800;color:${C.rani}}
   .try{position:absolute;left:0;right:0;top:1086px;display:flex;justify-content:center;align-items:center;gap:16px}
   .lbl{font-weight:800;font-size:28px;color:${C.cream};letter-spacing:.03em}
   .dishchip{background:${C.peacock};color:${C.ink};border:5px solid ${C.cream};border-radius:999px;padding:8px 22px;font-weight:800;font-size:30px}`,
  C.ink),

// 9 ─ STAFF PICK template
P('post-09-staff-pick', 'post-09-staff-pick', 'Staff pick · template',
  'Puts the friendly team (a top review theme) in the feed: swap in a real photo, name and role (with consent); the dish line stays brand voice, never a fake quote.',
  `${sunburst({ w: W, h: H, cx: 300, cy: 420, n: 36, a: C.marigold, b: '#FFC53D', patB: '04-truck-art-rangoli-sunset', patScale: .8, patOpacity: .22 })}
   ${kicker('Staff pick', { cls: 'rani', x: 64, y: 64 })}
   <div class="ph"><svg viewBox="0 0 300 300" aria-hidden="true"><defs><clipPath id="phc"><circle cx="150" cy="150" r="138"/></clipPath></defs><circle cx="150" cy="150" r="138" fill="${C.cream}"/><g clip-path="url(#phc)" fill="${C.ink}" opacity=".16"><circle cx="150" cy="120" r="54"/><path d="M50 300c0-70 45-108 100-108s100 38 100 108z"/></g><circle cx="150" cy="150" r="138" fill="none" stroke="${C.ink}" stroke-width="9" stroke-dasharray="20 14" stroke-linecap="round"/></svg><span class="hand">photo here</span></div>
   <div class="who"><div class="plate nmp" style="font-size:46px">[Name]</div><div class="role">[Role] · Curry District</div></div>
   ${dish('garlic-naan', { style: 'left:470px;top:150px;width:600px;height:600px', cls: 'gn' })}
   <h1 class="disp hl">Garlic<br>Naan</h1>
   <div class="bas"><b>Bas, ek aur naan.</b><span class="hand">okay, just one more naan</span></div>
   ${footer({ dark: false })}`,
  `.ph{position:absolute;left:84px;top:200px;width:330px;height:330px}
   .ph svg{width:100%;height:100%;filter:drop-shadow(10px 10px 0 ${C.ink})}
   .ph .hand{position:absolute;left:0;right:0;top:250px;text-align:center;font-size:38px;color:${C.muted}}
   .who{position:absolute;left:64px;top:570px;width:400px;text-align:left}
   .nmp{transform:rotate(-2deg)}
   .role{margin-top:22px;font-weight:800;font-size:30px;color:${C.ink};letter-spacing:.02em}
   .gn .steam{stroke:${C.ink};opacity:.5}
   .hl{position:absolute;left:64px;right:64px;top:760px;font-size:168px;color:${C.cream};${ol(10, C.ink, 11, 11, C.ink)};text-align:center}
   .bas{position:absolute;left:0;right:0;top:1100px;display:flex;justify-content:center;align-items:baseline;gap:18px}
   .bas b{font-size:40px;font-weight:800;color:${C.ink}}
   .bas .hand{font-size:42px;color:${C.rani}}`,
  C.marigold),

];

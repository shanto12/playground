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

];

// 3 looping motion posts, 1080×1350, 6 s @ 30 fps.
// Every animation period divides 6 s, so frame 180 == frame 0 (seamless loop).
// Capture: CSS animations are paused and scrubbed with the Web Animations API
// (deterministic), one PNG per frame, then ffmpeg → H.264 yuv420p MP4.
// usage: node motion.js [id-substring]   |   node motion.js --poster-only
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const L = require('./lib');
const { ol, C, dish, icon, logo, sunburst, sparkle, page, patternUrl, KIT, SRC } = L;
const { footer, FOOT_CSS, kicker, halo } = require('./parts');

const W = 1080, H = 1350, FPS = 30, DUR = 6, N = FPS * DUR;

// a cream steam wisp path, centred on x=0, rising from y=0 to y=-h
const wisp = (h = 300, amp = 26) => {
  let d = 'M0 0'; const seg = 6;
  for (let i = 1; i <= seg; i++) { const y = -h * i / seg, cx = (i % 2 ? amp : -amp); d += ` Q${cx} ${(y + h / seg / 2).toFixed(1)} 0 ${y.toFixed(1)}`; }
  return d;
};

const M = [
// M1 ─ steam rising off the dish
{ id: 'motion-01-steam', title: 'Motion · Garma-garam steam', poster: 1.6,
  caption: 'Six-second loop: steam curls off a wok of Chilli Chicken while the sunburst turns; motion stops the scroll, the dish does the selling.',
  css: `
  .rays{animation:spin 6s linear infinite}
  @keyframes spin{to{transform:rotate(22.5deg)}}
  .glow{position:absolute;left:90px;top:300px;width:900px;height:760px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,106,19,.75),rgba(228,20,126,.32) 55%,transparent);animation:pulse 3s ease-in-out infinite}
  @keyframes pulse{50%{transform:scale(1.06);opacity:.85}}
  .cc .steam{display:none}
  .wisps{position:absolute;left:0;top:0}
  .w{fill:none;stroke:${C.cream};stroke-width:20;stroke-linecap:round;opacity:0;animation:rise 2s cubic-bezier(.3,.1,.4,1) infinite}
  @keyframes rise{0%{transform:translateY(40px) scaleY(.5);opacity:0}22%{opacity:.95}70%{opacity:.6}100%{transform:translateY(-130px) scaleY(1.1);opacity:0}}
  .sp{transform-box:fill-box;transform-origin:center;animation:tw 2s ease-in-out infinite}
  @keyframes tw{0%,100%{transform:scale(.2) rotate(0deg);opacity:0}50%{transform:scale(1) rotate(45deg);opacity:1}}
  .hl{position:absolute;left:0;right:0;top:880px;text-align:center;font-size:104px;color:${C.marigold};${ol(9, C.ink, 10, 10, C.rani)};animation:wob 3s ease-in-out infinite}
  @keyframes wob{0%,100%{transform:rotate(-1.5deg)}50%{transform:rotate(1.5deg)}}
  .gl{position:absolute;left:0;right:0;top:996px;text-align:center;font-size:58px;color:${C.marigold}}
  .ln{position:absolute;left:80px;right:80px;top:1074px;text-align:center;font-weight:700;font-size:38px;color:${C.cream}}
  .cc{animation:bob 3s ease-in-out infinite} @keyframes bob{50%{transform:translateY(-10px)}}`,
  body: () => `${sunburst({ w: W, h: H, cx: 540, cy: 640, n: 32, a: C.ink, b: '#2A1862' })}
    <div class="glow"></div>
    ${dish('chilli-chicken', { style: 'left:150px;top:300px;width:780px;height:780px', cls: 'cc' })}
    <svg class="wisps" width="${W}" height="${H}" aria-hidden="true">
      ${[[420, 600, 0], [540, 585, -0.66], [660, 600, -1.33], [480, 600, -1], [600, 595, -0.33], [360, 615, -1.66]].map(([x, y, d], i) => `<g transform="translate(${x} ${y})"><path class="w" d="${wisp(i < 3 ? 210 : 170, 20)}" style="animation-delay:${d}s;stroke-width:${i < 3 ? 18 : 13}px"/></g>`).join('')}
    </svg>
    <svg class="abs" width="${W}" height="${H}" style="left:0;top:0" aria-hidden="true">
      ${[[170, 320, 26, C.marigold, 0], [910, 300, 20, C.rani, -0.7], [140, 760, 16, C.peacock, -1.3], [960, 700, 24, C.marigold, -0.4], [250, 180, 12, C.cream, -1.6], [840, 160, 14, C.cream, -1]].map(([x, y, s, c, d]) => `<g transform="translate(${x} ${y})"><path class="sp" style="animation-delay:${d}s" d="${sparkPath(s)}" fill="${c}" stroke="${C.ink}" stroke-width="4"/></g>`).join('')}
    </svg>
    ${kicker('Indo-Chinese Alley', { x: 64, y: 64 })}
    <h1 class="disp hl">Garma-garam</h1>
    <div class="gl hand">(piping hot)</div>
    <p class="ln">Chilli Chicken: wok-tossed and chilli-sticky.</p>
    ${footer({ dark: true })}` },

// M2 ─ spice sparkle burst
{ id: 'motion-02-spice-burst', title: 'Motion · Spice sparkle burst', poster: 0.62,
  caption: 'Three sparkle bursts per loop pop off a wobbling chilli: pure Bollywood-poster energy that still lands one clear line.',
  css: `
  .rays{animation:spin 6s linear infinite}
  @keyframes spin{to{transform:rotate(20deg)}}
  .disc{position:absolute;left:0;top:0;transform-origin:540px 640px;animation:pump 2s cubic-bezier(.34,1.56,.64,1) infinite}
  @keyframes pump{0%{transform:scale(.94)}12%{transform:scale(1.05)}40%,100%{transform:scale(1)}}
  .chili{position:absolute;left:340px;top:440px;width:400px;height:400px;transform-origin:50% 60%;animation:wig 1s ease-in-out infinite}
  @keyframes wig{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}
  .p{transform-box:fill-box;transform-origin:center;animation:fly 2s cubic-bezier(.15,.7,.3,1) infinite;opacity:0}
  @keyframes fly{0%{transform:translate(0,0) scale(.2) rotate(0);opacity:0}6%{opacity:1}60%{opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(var(--s)) rotate(var(--r));opacity:0}}
  .hl{position:absolute;left:0;right:0;text-align:center;font-size:132px;color:${C.cream};${ol(10, C.ink, 11, 11, C.ink)}}
  .hl.t{top:150px;animation:wob 2s ease-in-out infinite} .hl.b{top:968px;animation:wob 2s ease-in-out infinite reverse}
  @keyframes wob{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
  .ln{position:absolute;left:50%;top:1112px;transform:translateX(-50%);background:${C.cream};border:5px solid ${C.ink};border-radius:999px;padding:12px 30px;font-weight:800;font-size:33px;white-space:nowrap;box-shadow:7px 7px 0 ${C.ink}}`,
  body: () => {
    // three waves × 16 particles; each wave delayed by 2/3 s… (period 2 s ⇒ 3 bursts per loop)
    const R = L.rng(42); let parts = '';
    const cols = [C.marigold, C.cream, C.peacock, C.saffron, C.marigold, C.cilantro];
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + R() * .2, dist = 330 + R() * 170;
      const dx = Math.cos(a) * dist, dy = Math.sin(a) * dist * .92;
      const s = 0.8 + R() * 0.7, c = cols[i % cols.length];
      const shape = i % 3 === 2 ? `<circle r="${10 + R() * 8}" fill="${c}" stroke="${C.ink}" stroke-width="4"/>` : `<path d="${sparkPath(18 + R() * 12)}" fill="${c}" stroke="${C.ink}" stroke-width="4"/>`;
      parts += `<g transform="translate(540 640)"><g class="p" style="--dx:${dx.toFixed(0)}px;--dy:${dy.toFixed(0)}px;--s:${s.toFixed(2)};--r:${(R() * 180 - 90).toFixed(0)}deg">${shape}</g></g>`;
    }
    return `${sunburst({ w: W, h: H, cx: 540, cy: 640, n: 36, a: C.rani, b: '#C80E6C', patB: '06-spice-confetti-sunset', patScale: 1, patOpacity: .28 })}
    <div class="disc">${halo({ cx: 540, cy: 640, r: 300, bumps: 36, ring: C.marigold, disc: C.cream, sw: 8 })}</div>
    <svg class="abs" width="${W}" height="${H}" style="left:0;top:0" aria-hidden="true">${parts}</svg>
    <div class="chili">${icon('chili', { style: 'width:400px;height:400px' })}</div>
    <h1 class="disp hl t">Spice it up,</h1>
    <h1 class="disp hl b">Little Elm.</h1>
    <div class="ln">Mild, medium or spicy: just ask when you order.</div>
    ${footer({ dark: false })}`;
  } },

// M3 ─ price-less "special" text wipe
{ id: 'motion-03-special-wipe', title: 'Motion · Today’s special wipe', poster: 3,
  caption: 'Template loop for the daily special: festival-colour bars wipe in the dish name (no price, ever); swap the name and art per day.',
  css: `
  .pat{position:absolute;inset:0;background-image:url(${patternUrl('03-block-print-booti-night')});background-size:240px;opacity:.16}
  .bars{position:absolute;left:-200px;top:0;width:1480px;height:${H}px;pointer-events:none}
  .bar{position:absolute;left:0;width:1480px;height:${H / 4 + 2}px;border-top:7px solid ${C.ink};border-bottom:7px solid ${C.ink};transform:skewX(-14deg) translateX(0)}
  ${[0, 1, 2, 3].map(i => `.bar.b${i}{top:${i * H / 4 - 1}px;animation:bar${i} 6s linear infinite}
  @keyframes bar${i}{0%{transform:skewX(-14deg) translateX(0)}${(1.5 + i * 1.6).toFixed(1)}%{transform:skewX(-14deg) translateX(0);animation-timing-function:cubic-bezier(.7,0,.3,1)}${(9.5 + i * 1.6).toFixed(1)}%{transform:skewX(-14deg) translateX(1600px)}${(9.51 + i * 1.6).toFixed(2)}%{transform:skewX(-14deg) translateX(-1600px)}${(86 + i * 2).toFixed(1)}%{transform:skewX(-14deg) translateX(-1600px);animation-timing-function:cubic-bezier(.7,0,.3,1)}${(93 + i * 2).toFixed(1)}%,100%{transform:skewX(-14deg) translateX(0)}}`).join('\n')}
  .kp{position:absolute;left:50%;top:92px;transform:translateX(-50%) rotate(-2deg) scale(0);font-size:58px;white-space:nowrap;animation:pop 6s linear infinite}
  @keyframes pop{0%,7%{transform:translateX(-50%) rotate(-2deg) scale(0)}11%{transform:translateX(-50%) rotate(-2deg) scale(1.12)}14%,100%{transform:translateX(-50%) rotate(-2deg) scale(1)}}
  .nm{position:absolute;left:0;right:0;text-align:center;font-size:136px;color:${C.cream};text-shadow:10px 10px 0 ${C.rani};clip-path:inset(0 100% 0 0)}
  .nm.l1{top:262px;animation:wipe1 6s linear infinite} .nm.l2{top:400px;animation:wipe2 6s linear infinite;color:${C.marigold}}
  @keyframes wipe1{0%,12%{clip-path:inset(0 100% 0 0)}20%,100%{clip-path:inset(0 0 0 0)}}
  @keyframes wipe2{0%,17%{clip-path:inset(0 100% 0 0)}25%,100%{clip-path:inset(0 0 0 0)}}
  .ul{position:absolute;left:190px;top:560px}
  .ul path{stroke-dasharray:720;stroke-dashoffset:720;animation:draw 6s linear infinite}
  @keyframes draw{0%,24%{stroke-dashoffset:720}31%,100%{stroke-dashoffset:0}}
  .ask{position:absolute;right:96px;top:610px;font-size:60px;color:${C.ink};background:${C.marigold};border:5px solid ${C.ink};border-radius:18px;padding:4px 22px 10px;box-shadow:7px 7px 0 ${C.rani};transform:rotate(5deg) scale(0);animation:pop2 6s linear infinite}
  @keyframes pop2{0%,28%{transform:rotate(5deg) scale(0)}32%{transform:rotate(5deg) scale(1.15)}35%,100%{transform:rotate(5deg) scale(1)}}
  .bz{opacity:0;animation:rise 6s linear infinite}
  @keyframes rise{0%,16%{opacity:0;transform:translateY(80px)}24%{opacity:1;transform:translateY(-8px)}28%,100%{opacity:1;transform:translateY(0)}}
  .bz .dish-svg{animation:bob 2s ease-in-out infinite} @keyframes bob{50%{transform:translateY(-12px)}}
  .bz .steam{stroke:${C.cream};opacity:.85;animation:st 1s ease-in-out infinite alternate} @keyframes st{to{transform:translateY(-14px)}}
  .ft{opacity:1}`,
  body: () => `<div class="pat"></div>
    <div class="plate mari kp">Today’s special</div>
    <h1 class="disp nm l1">Chicken 65</h1>
    <h1 class="disp nm l2">Biryani</h1>
    <svg class="ul" width="700" height="60" viewBox="0 0 700 60" aria-hidden="true"><path d="M10 40 Q180 8 350 30 T690 22" fill="none" stroke="${C.peacock}" stroke-width="14" stroke-linecap="round"/></svg>
    <div class="ask hand">ask for it by name!</div>
    ${dish('biryani', { style: 'left:250px;top:640px;width:580px;height:580px', cls: 'bz' })}
    ${footer({ dark: true })}
    <div class="bars">${[C.saffron, C.rani, C.peacock, C.marigold].map((c, i) => `<div class="bar b${i}" style="background:${c}"></div>`).join('')}</div>` },
];

function sparkPath(s) { const k = s * .2; return `M0 ${-s}Q${k} ${-k} ${s} 0Q${k} ${k} 0 ${s}Q${-k} ${k} ${-s} 0Q${-k} ${-k} 0 ${-s}Z`; }

async function main() {
  const args = process.argv.slice(2);
  const posterOnly = args.includes('--poster-only');
  const ids = args.filter(a => !a.startsWith('--'));
  const list = ids.length ? M.filter(m => ids.some(i => m.id.includes(i))) : M;
  const { chromium } = require('/opt/node-tools/node_modules/playwright');
  const b = await chromium.launch();
  try {
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    for (const m of list) {
      const html = page({ w: W, h: H, title: m.title, bg: C.ink, body: m.body(), css: FOOT_CSS + m.css });
      const pg = path.join(SRC, 'pages', m.id + '.html');
      fs.writeFileSync(pg, html);
      await p.goto('file://' + pg, { waitUntil: 'load' });
      await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
      const seek = (ms) => p.evaluate((t) => { for (const a of document.getAnimations()) { a.pause(); a.currentTime = t; } }, ms);
      await seek(m.poster * 1000); await p.waitForTimeout(60);
      await p.screenshot({ path: path.join(KIT, m.id + '.jpg'), type: 'jpeg', quality: 88 });
      await p.screenshot({ path: path.join(KIT, '_qa', m.id + '-poster.png') });
      if (posterOnly) { console.log('poster', m.id); continue; }
      const fdir = path.join(SRC, 'frames-' + m.id);
      fs.rmSync(fdir, { recursive: true, force: true }); fs.mkdirSync(fdir, { recursive: true });
      for (let i = 0; i < N; i++) {
        await seek(i * 1000 / FPS);
        await p.screenshot({ path: path.join(fdir, String(i).padStart(4, '0') + '.png') });
      }
      const out = path.join(KIT, m.id + '.mp4');
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(fdir, '%04d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', '-movflags', '+faststart', out]);
      // keep a few QA stills, then drop the frame folder
      for (const f of [0, 45, 90, 135, 179]) fs.copyFileSync(path.join(fdir, String(f).padStart(4, '0') + '.png'), path.join(KIT, '_qa', `${m.id}-f${f}.png`));
      fs.rmSync(fdir, { recursive: true, force: true });
      console.log('video', m.id, (fs.statSync(out).size / 1024).toFixed(0) + ' KB');
    }
  } finally { await b.close(); }
}

module.exports = M.map(m => ({ id: m.id, file: m.id, title: m.title, caption: m.caption, w: W, h: H, type: 'video', tags: ['motion', 'post'] }));
if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });

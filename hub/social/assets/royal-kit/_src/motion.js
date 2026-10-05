// Motion posts: deterministic JS animation, frame-by-frame capture at 30 fps, encoded with ffmpeg.
// node motion.js [id ...]   → ../<id>.mp4 + ../<id>.jpg (poster)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const L = require('./lib');
const { C, art, archWindow, page, wordmark, bloom, logo, rng } = L;

const W = 1080, H = 1350, FPS = 30, DUR = 6, N = FPS * DUR;
const inlineArt = (k) => fs.readFileSync(L.artFile(k), 'utf8').replace('<svg ', '<svg class="dishsvg" ');

// ---------- M1 · steam & glints off the dish ----------
function m1() {
  const svg = inlineArt('butter-chicken');
  const dishW = 780, sillY = 868, base = 618, top = sillY - base * (dishW / 800) + 6;
  const body = `
<div id="bl">${bloom(540, 470, 520)}</div>
${archWindow({ x: 250, y: 118, w: 580, h: 750, glow: 'plum' })}
<div class="abs" style="left:${(W - dishW) / 2}px;top:${top}px;width:${dishW}px;height:${dishW}px">${svg}</div>
<div class="abs center h1" style="top:918px;font-size:104px;line-height:1.02">Let the evening<br>slow <span class="foil">down.</span></div>
${wordmark('midnight', { y: 1192, h: 74 })}`;
  const js = `
const svg=document.querySelector('.dishsvg');svg.style.width='100%';svg.style.height='100%';svg.style.overflow='visible';
const steam=svg.querySelector('.steam');const sB=steam.cloneNode(true);steam.parentNode.insertBefore(sB,steam.nextSibling);
const glints=[...svg.querySelectorAll('.glint > *')];
const pairs=[];for(let i=0;i<glints.length;i+=2)pairs.push(glints.slice(i,i+2));
pairs.forEach(p=>p.forEach(e=>{e.style.transformBox='fill-box';e.style.transformOrigin='center'}));
const bl=document.getElementById('bl').firstElementChild;
window.setT=(t)=>{
  [[steam,0],[sB,.5]].forEach(([g,ph])=>{const p=((t/3)+ph)%1;const y=-70*p;const o=Math.sin(Math.PI*p);
    const sway=Math.sin(2*Math.PI*(t/6)+ph*3)*0.05;
    g.setAttribute('transform','translate(0 '+y.toFixed(2)+') translate(410 200) skewX('+(sway*20).toFixed(2)+') scale('+(1+0.12*p).toFixed(3)+' '+(1+0.2*p).toFixed(3)+') translate(-410 -200)');
    g.style.opacity=(0.95*o).toFixed(3);});
  pairs.forEach((p,i)=>{const ph=(i*0.37)%1;let v=Math.sin(2*Math.PI*(t/2+ph));v=Math.max(0,v);v=Math.pow(v,3);
    p.forEach(e=>{e.style.opacity=(0.08+0.92*v).toFixed(3);e.style.transform='scale('+(0.6+1.3*v).toFixed(3)+') rotate('+(v*45).toFixed(1)+'deg)'});});
  bl.style.opacity=(0.82+0.18*Math.sin(2*Math.PI*t/6)).toFixed(3);
};`;
  return { id: 'motion-steam-glints', kind: 'midnight', body, js, poster: 1.4 };
}

// ---------- M2 · foil shimmer sweep across the wordmark ----------
function m2() {
  const wm = logo('colourways/wordmark-stacked--foil');
  const mask = 'data:image/svg+xml;base64,' + fs.readFileSync(L.ROOT + '/brand/logo/royal/colourways/wordmark-stacked--mono-gold.svg').toString('base64');
  const ww = 640, wh = ww * 293.75 / 287.05, wx = (W - ww) / 2, wy = 210;
  const R = rng(5); let sp = '';
  for (let i = 0; i < 7; i++) sp += `<svg class="abs spk" data-i="${i}" style="left:${(wx + 60 + R() * (ww - 120)).toFixed(0)}px;top:${(wy + 30 + R() * (wh - 60)).toFixed(0)}px;width:46px;height:46px;margin:-23px" viewBox="-10 -10 20 20"><path d="M0 -10Q1 -1 10 0Q1 1 0 10Q-1 1 -10 0Q-1 -1 0 -10Z" fill="#FFF6DA"/></svg>`;
  const body = `
${bloom(540, wy + wh / 2, 560, 'rgba(242,182,79,.22)')}
<img class="abs" alt="" src="${wm}" style="left:${wx}px;top:${wy}px;width:${ww}px;height:${wh}px">
<div id="sh" class="abs" style="left:${wx}px;top:${wy}px;width:${ww}px;height:${wh}px;-webkit-mask:url(${mask}) center/100% 100% no-repeat;mask:url(${mask}) center/100% 100% no-repeat;mix-blend-mode:screen"></div>
${sp}
<div class="abs center rule" style="top:${wy + wh + 70}px;width:420px"></div>
<div class="abs center it" style="top:${wy + wh + 110}px;font-size:62px;color:${C.ivory}">Dinner, made an <span class="foil">occasion.</span></div>
<div class="abs center eyebrow" style="top:${wy + wh + 214}px">Indian Kitchen · Little Elm, TX</div>`;
  const js = `
const sh=document.getElementById('sh');const spk=[...document.querySelectorAll('.spk')];
window.setT=(t)=>{const p=(t%3)/2.2; // sweep for 2.2 s of every 3 s
  const x=-40+p*180; const a=p<=1?1:0;
  sh.style.background='linear-gradient(105deg,rgba(255,255,255,0) '+(x-16)+'%,rgba(255,250,228,'+(0.85*a)+') '+x+'%,rgba(255,255,255,0) '+(x+16)+'%)';
  spk.forEach((e,i)=>{const ph=(i/spk.length);const q=((t/3)+ph)%1;const v=Math.pow(Math.max(0,Math.sin(Math.PI*Math.min(1,q*3))),2)*(q<1/3?1:0);
    e.style.opacity=v.toFixed(3);e.style.transform='scale('+(0.4+0.9*v).toFixed(3)+') rotate('+(q*90).toFixed(1)+'deg)'});
};`;
  return { id: 'motion-foil-wordmark', kind: 'midnight', body, js, poster: 1.1 };
}

// ---------- M3 · embers drifting past an arch ----------
function m3() {
  const dishW = 680, sillY = 860, base = 712, top = sillY - base * (dishW / 800) + 6;
  const R = rng(23), em = [];
  for (let i = 0; i < 84; i++) {
    const front = i % 3 === 0;
    em.push({ x: 120 + R() * 840, y0: R() * 900, k: 1 + Math.floor(R() * 2), m: 1 + Math.floor(R() * 3), A: 12 + R() * 40, ph: R(), n: 2 + Math.floor(R() * 4), s: front ? 12 + R() * 14 : 5 + R() * 8, front });
  }
  const dots = em.map((e, i) => `<i class="abs em${e.front ? ' fr' : ''}" id="e${i}" style="width:${e.s.toFixed(1)}px;height:${e.s.toFixed(1)}px"></i>`).join('');
  const body = `
${bloom(540, 560, 520, 'rgba(242,120,60,.28)')}
<div class="layer back">${dots}</div>
${archWindow({ x: 250, y: 150, w: 580, h: 710, glow: 'ruby' })}
<div class="abs" style="left:${(W - dishW) / 2}px;top:${top}px;width:${dishW}px"><img src="${art('tandoori-platter')}" alt="" style="width:100%"></div>
<div class="layer front"></div>
<div class="abs center eyebrow" style="top:912px">From the Tandoor Quarter</div>
<div class="abs center h1" style="top:956px;font-size:116px">Fire-<span class="foil">kissed.</span></div>
<div class="abs center it" style="top:1090px;font-size:46px;color:rgba(251,243,228,.92)">Smoke-scented, straight from the clay oven.</div>
${wordmark('midnight', { y: 1196, h: 72 })}
<script>window.EM=${JSON.stringify(em)};</script>`;
  const js = `
const front=document.querySelector('.layer.front');document.querySelectorAll('.em.fr').forEach(e=>front.appendChild(e));
const els=EM.map((e,i)=>document.getElementById('e'+i));
const RANGE=900;
window.setT=(t)=>{EM.forEach((e,i)=>{const el=els[i];
  let y=(e.y0 - (RANGE*e.k/6)*t)%RANGE; if(y<0)y+=RANGE; y=y-20;
  const x=e.x+e.A*Math.sin(2*Math.PI*(e.m*t/6+e.ph));
  const f=0.45+0.55*Math.abs(Math.sin(2*Math.PI*(e.n*t/6+e.ph)));
  const fade=Math.min(1,Math.max(0,(y+20)/200))*Math.min(1,Math.max(0,(880-y)/160));
  el.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px)';el.style.opacity=(f*fade*(e.front?0.9:0.8)).toFixed(3);});};`;
  return { id: 'motion-ember-arch', kind: 'midnight', body, js, poster: 2.0, css: `.layer{position:absolute;inset:0;pointer-events:none}.em{left:0;top:0;border-radius:50%;background:radial-gradient(circle,#FFF4CF 0,#FBD27A 35%,#F28A3C 60%,rgba(242,120,60,0) 72%)}.em.fr{filter:blur(1.5px)}` };
}

const ALL = [m1, m2, m3];
(async () => {
  const want = process.argv.slice(2);
  const { chromium } = require('/opt/node-tools/node_modules/playwright');
  const b = await chromium.launch();
  try {
    for (const make of ALL) {
      const m = make();
      if (want.length && !want.some((w) => m.id.includes(w))) continue;
      const html = page({ w: W, h: H, kind: m.kind, body: m.body, css: m.css || '' }).replace('</body>', `<script>${m.js}</script></body>`);
      const file = path.join(L.SRC, 'pages', m.id + '.html');
      L.write(file, html);
      if (process.env.QUICK) {
        const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
        await p.goto('file://' + file); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
        for (const t of [0, 0.75, 1.5, 2.25]) { await p.evaluate((t) => window.setT(t), t); await p.screenshot({ path: path.join(L.KIT, '_qa', m.id + '-t' + t + '.png') }); }
        await p.close(); console.log('quick', m.id); continue;
      }
      const frames = path.join(L.KIT, '_frames_' + m.id);
      fs.rmSync(frames, { recursive: true, force: true }); fs.mkdirSync(frames, { recursive: true });
      const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
      await p.goto('file://' + file); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
      for (let f = 0; f < N; f++) {
        await p.evaluate((t) => window.setT(t), f / FPS);
        await p.screenshot({ path: path.join(frames, String(f + 1).padStart(4, '0') + '.png') });
      }
      await p.evaluate((t) => window.setT(t), m.poster);
      await p.screenshot({ path: path.join(L.KIT, m.id + '.jpg'), type: 'jpeg', quality: 86 });
      await p.close();
      const out = path.join(L.KIT, m.id + '.mp4');
      const crf = process.env.CRF || '23';
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(frames, '%04d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', crf, '-movflags', '+faststart', out]);
      fs.rmSync(frames, { recursive: true, force: true });
      console.log(m.id, (fs.statSync(out).size / 1e6).toFixed(2) + ' MB');
    }
  } finally { await b.close(); }
})();

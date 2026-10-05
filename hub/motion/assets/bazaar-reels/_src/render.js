#!/usr/bin/env node
/* Curry District · Bazaar motion pack — deterministic frame renderer.
 * Usage:
 *   node render.js preview <job> 0.5,1.2,3     → _qa/preview/<job>-<t>.png (stills, for design iteration)
 *   node render.js video <job|all> [...]       → <job>.mp4 + -poster.jpg + -thumb.jpg (frames deleted after)
 *   node render.js qa <job|all>                → _qa/<job>/f-XX.jpg (≥6 evenly spaced frames from the MP4)
 * Brand assets are read IN PLACE from /home/user/playground/brand at build time.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('/opt/node-tools/node_modules/playwright');

const ROOT = '/home/user/playground';
const BR = ROOT + '/brand';
const OUT = path.resolve(__dirname, '..');
const SRC = __dirname;
const SCRATCH = process.env.SCRATCH || '/tmp/claude-0/-home-user-playground/daae35f2-3bb9-5abe-8c86-175861b9361b/scratchpad/reels';
const FPS = 30;

const rd = p => fs.readFileSync(p, 'utf8');
function assets() {
  const dish = {};
  for (const set of ['set1', 'set2']) {
    const dir = `${BR}/illustrations/bazaar/${set}`;
    for (const f of fs.readdirSync(dir)) if (f.endsWith('.svg')) dish[f.replace('.svg', '')] = rd(`${dir}/${f}`);
  }
  const icon = {};
  for (const f of fs.readdirSync(`${BR}/icons/bazaar`)) if (f.endsWith('.svg') && f !== 'sprite.svg') icon[f.replace('.svg', '')] = rd(`${BR}/icons/bazaar/${f}`);
  const pattern = {};
  for (const f of fs.readdirSync(`${BR}/patterns/bazaar`)) if (f.endsWith('.svg')) pattern[f.replace('.svg', '')] = rd(`${BR}/patterns/bazaar/${f}`);
  const menu = JSON.parse(rd(`${ROOT}/data/menu.json`));
  return {
    emblem: rd(`${BR}/logo/bazaar/emblem.svg`),
    wordText: rd(`${BR}/logo/bazaar/wordmark-text-only.svg`),
    stacked: rd(`${BR}/logo/bazaar/wordmark-stacked.svg`),
    stamp: rd(`${BR}/logo/bazaar/stamp-district-seal.svg`),
    dish, icon, pattern,
    menu: {
      zones: menu.meta.zones,
      items: menu.items.filter(i => i.status !== 'unconfirmed').map(i => ({ name: i.name, zone: i.zone, popular: !!i.popular, diet: i.diet, spice: i.spice, art: i.art }))
    }
  };
}

// ── job table ──────────────────────────────────────────────────────────────
const J = (id, scene, w, h, dur, params, poster, title) => ({ id, scene, w, h, dur, params: params || {}, poster, title });
const JOBS = [
  J('district-opening', 'opening', 1080, 1920, 15, {}, 2.9),
  J('logo-sting-square', 'sting', 1080, 1080, 4, { layout: 'stacked' }, 3.2),
  J('logo-sting-wide', 'sting', 1920, 1080, 4, { layout: 'horizontal' }, 3.2),
  J('story-order-now', 'story', 1080, 1920, 6, { kind: 'order' }, 2.4),
  J('story-party-trays', 'story', 1080, 1920, 6, { kind: 'party' }, 3.0),
  J('story-chai-time', 'story', 1080, 1920, 6, { kind: 'chai' }, 3.2),
  J('menu-board-starters-tandoor', 'board', 1920, 1080, 8, { board: 0 }, 1.6),
  J('menu-board-curry-biryani', 'board', 1920, 1080, 8, { board: 1 }, 1.6),
  J('menu-board-sweets-chai', 'board', 1920, 1080, 8, { board: 2 }, 1.6),
  J('sticker-bowl-steam', 'sticker', 1080, 1080, 4, { kind: 'bowl', bg: '#00A8A0' }, 1.0),
  J('sticker-spinning-chili', 'sticker', 1080, 1080, 4, { kind: 'chili', bg: '#FFB000' }, 1.45),
  J('sticker-bouncing-naan', 'sticker', 1080, 1080, 4, { kind: 'naan', bg: '#E4147E' }, 1.45),
  J('sticker-district-stamp', 'sticker', 1080, 1080, 4, { kind: 'stamp', bg: '#1D1147' }, 1.4)
];
const byId = id => { const j = JOBS.find(x => x.id === id); if (!j) throw new Error('no job ' + id); return j; };

function fontCSS() {
  const f = BR + '/fonts/';
  return `
@font-face{font-family:'Bowlby One';font-weight:400;src:url(file://${f}taiPGmVuC4y96PFeqp8sqomI_A.woff2) format('woff2')}
@font-face{font-family:'DM Sans';font-weight:100 1000;src:url(file://${f}rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K4.woff2) format('woff2')}
@font-face{font-family:'Caveat';font-weight:400 700;src:url(file://${f}Wnz6HAc5bAfYB2Q7ZjYY.woff2) format('woff2')}`;
}

function pageFor(job, A, transparent) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow">
<title>${job.id}</title>
<style>${fontCSS()}
${rd(SRC + '/base.css')}
html,body{width:${job.w}px;height:${job.h}px}
#stage{width:${job.w}px;height:${job.h}px}
${transparent ? 'html,body,#stage{background:transparent!important}' : ''}
</style></head><body><div id="stage"></div>
<script>window.A=${JSON.stringify(A).replace(/<\//g, '<\\/')};window.JOB=${JSON.stringify({ id: job.id, w: job.w, h: job.h, dur: job.dur, params: job.params, transparent: !!transparent })};</script>
<script src="file://${SRC}/lib.js"></script>
<script src="file://${SRC}/scenes/${job.scene}.js"></script>
</body></html>`;
  fs.mkdirSync(SCRATCH + '/pages', { recursive: true });
  const p = `${SCRATCH}/pages/${job.id}${transparent ? '-alpha' : ''}.html`;
  fs.writeFileSync(p, html);
  return p;
}

async function openJob(browser, job, A, transparent) {
  const page = await browser.newPage({ viewport: { width: job.w, height: job.h }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + pageFor(job, A, transparent));
  await page.evaluate(async () => {
    await Promise.all(['40px "Bowlby One"', '700 40px "DM Sans"', '400 40px "DM Sans"', '800 40px "DM Sans"', '700 40px Caveat', '600 40px Caveat'].map(f => document.fonts.load(f)));
    await document.fonts.ready;
  });
  await page.waitForFunction(() => typeof window.renderAt === 'function', null, { timeout: 15000 }).catch(() => {});
  if (errs.length) { console.error('PAGE ERRORS', job.id, errs); }
  return page;
}

const sh = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();

async function preview(browser, job, A, times) {
  const page = await openJob(browser, job, A);
  fs.mkdirSync(OUT + '/_qa/preview', { recursive: true });
  for (const t of times) {
    await page.evaluate(t => window.renderAt(t), t);
    const f = `${OUT}/_qa/preview/${job.id}-${t.toFixed(2)}.png`;
    await page.screenshot({ path: f });
    console.log(f);
  }
  await page.close();
}

async function captureFrames(browser, job, A, dir, transparent) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const page = await openJob(browser, job, A, transparent);
  const n = Math.round(job.dur * FPS);
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    await page.evaluate(t => window.renderAt(t), i / FPS);
    await page.screenshot({ path: `${dir}/${String(i).padStart(5, '0')}.png`, omitBackground: !!transparent });
  }
  await page.close();
  console.log(`  ${job.id}${transparent ? ' (alpha)' : ''}: ${n} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  return n;
}

function encode(job, dir) {
  const out = `${OUT}/${job.id}.mp4`;
  let crf = 24;
  for (;;) {
    sh('nice', ['-n', '10', 'ffmpeg', '-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', `${dir}/%05d.png`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', String(crf), '-preset', 'slow', '-tune', 'animation', '-threads', '2', '-movflags', '+faststart', out]);
    const sz = fs.statSync(out).size;
    console.log(`  encoded ${path.basename(out)} crf ${crf}: ${(sz / 1048576).toFixed(2)} MB`);
    if (sz <= 2.9 * 1048576 || crf >= 34) break;
    crf += sz > 4 * 1048576 ? 3 : 2;
  }
  // poster (full size) + thumb (540 wide) from the chosen poster frame
  const pf = `${dir}/${String(Math.min(Math.round(job.poster * FPS), Math.round(job.dur * FPS) - 1)).padStart(5, '0')}.png`;
  // poster + thumb, each kept ≤ 100 KB
  const jpg = (out, vf) => { for (let q = 3; q <= 20; q++) { sh('ffmpeg', ['-y', '-loglevel', 'error', '-i', pf, '-vf', vf, '-q:v', String(q), out]); if (fs.statSync(out).size <= 98 * 1024) break; } };
  jpg(`${OUT}/${job.id}-poster.jpg`, job.w > job.h ? 'scale=1280:-2:flags=lanczos' : 'scale=720:-2:flags=lanczos');
  jpg(`${OUT}/${job.id}-thumb.jpg`, job.w > job.h ? 'scale=640:-2:flags=lanczos' : 'scale=400:-2:flags=lanczos');
}

function encodeAlpha(job, dir) {
  // production-style transparent sticker: VP9 + alpha in WebM
  const out = `${OUT}/${job.id}-alpha.webm`;
  sh('nice', ['-n', '10', 'ffmpeg', '-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', `${dir}/%05d.png`, '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '34', '-deadline', 'good', '-cpu-used', '4', '-row-mt', '1', '-threads', '2', '-auto-alt-ref', '0', out]);
  console.log(`  encoded ${path.basename(out)}: ${(fs.statSync(out).size / 1048576).toFixed(2)} MB`);
}

function qa(job) {
  const mp4 = `${OUT}/${job.id}.mp4`;
  const dir = `${OUT}/_qa/${job.id}`;
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const n = Math.max(6, Math.round(job.dur * 2));
  // evenly spaced: fps = n/dur, offset half a step so we avoid the very first black-ish frame
  sh('ffmpeg', ['-loglevel', 'error', '-i', mp4, '-vf', `fps=${n / job.dur}:start_time=0,scale=${job.w > job.h ? 960 : 540}:-2`, '-q:v', '4', `${dir}/f-%02d.jpg`]);
  console.log(dir, fs.readdirSync(dir).length, 'frames');
}

if (require.main === module) (async () => {
  const [mode, which, extra] = process.argv.slice(2);
  const jobs = which === 'all' ? JOBS : (which || '').split(',').map(byId);
  if (mode === 'qa') { jobs.forEach(qa); return; }
  if (mode === 'jobs') { console.log(JSON.stringify(JOBS, null, 1)); return; }
  const A = assets();
  const browser = await chromium.launch();
  try {
    if (mode === 'preview') {
      const times = (extra || '0').split(',').map(Number);
      for (const j of jobs) await preview(browser, j, A, times);
    } else if (mode === 'video') {
      for (const j of jobs) {
        const dir = `${SCRATCH}/frames-${j.id}`;
        await captureFrames(browser, j, A, dir);
        encode(j, dir);
        fs.rmSync(dir, { recursive: true, force: true });
        if (j.scene === 'sticker' && process.env.ALPHA) {
          const adir = `${SCRATCH}/frames-${j.id}-alpha`;
          await captureFrames(browser, j, A, adir, true);
          encodeAlpha(j, adir);
          fs.rmSync(adir, { recursive: true, force: true });
        }
      }
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });

module.exports = { JOBS };

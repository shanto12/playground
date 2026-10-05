// Render mockup scenes (three.js + SVG layers) → PNG 1600px @2x + JPG thumbs ≤120 KB
// usage: node render.mjs [filter]
import http from 'http';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { OUT, SCR } from './lib.mjs';
import { SCENES } from './scenes.mjs';

const filter = process.argv[2] || '';
const ALLOW = ['/home/user/playground/', SCR + '/'];
const TYPES = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css', '.woff2': 'font/woff2', '.html': 'text/html', '.jpg': 'image/jpeg' };
const pages = new Map();
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (pages.has(u)) { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(pages.get(u)); }
  if (!ALLOW.some(a => u.startsWith(a)) || !fs.existsSync(u)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(u)] || 'application/octet-stream', 'access-control-allow-origin': '*' });
  fs.createReadStream(u).pipe(res);
});
await new Promise(r => server.listen(0, r));
const port = server.address().port, base = `http://localhost:${port}`;
const THREE_DIR = SCR + '/node_modules/three';

function html(sc) {
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/home/user/playground/brand/fonts/fonts.css">
<style>html,body{margin:0;background:#777}#stage{position:relative;overflow:hidden;width:${sc.w || 800}px;height:${sc.h || 1000}px}#stage>*{position:absolute;left:0;top:0;width:100%;height:100%}#grain{mix-blend-mode:overlay;pointer-events:none}</style>
<script type="importmap">{"imports":{"three":"${THREE_DIR}/build/three.module.js","three/addons/":"${THREE_DIR}/examples/jsm/"}}</script>
</head><body><div id="stage"><svg id="bg" xmlns="http://www.w3.org/2000/svg"></svg><canvas id="gl"></canvas><svg id="fg" xmlns="http://www.w3.org/2000/svg"></svg><svg id="grain" xmlns="http://www.w3.org/2000/svg"></svg></div>
<script>window.__TEX='${base}${SCR}/tex/';</script>
<script type="module">import {run} from '${OUT}/_src/scenes/${sc.module}.js?v=${Date.now()}'; document.fonts.ready.then(()=>run(${JSON.stringify(sc.params || {})})).then(()=>{window.__done=1}).catch(e=>{window.__err=String(e&&e.stack||e)});</script>
</body></html>`;
}

const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  for (const sc of SCENES) {
    if (filter && !sc.name.includes(filter)) continue;
    const w = sc.w || 800, h = sc.h || 1000;
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('  [page]', m.text().slice(0, 300)); });
    p.on('pageerror', e => console.log('  [pageerror]', e.message));
    const url = `/__scene/${sc.name}.html`;
    pages.set(url, html(sc));
    const t0 = Date.now();
    await p.goto(base + url);
    await p.waitForFunction(() => window.__done || window.__err, null, { timeout: 240000 });
    const err = await p.evaluate(() => window.__err);
    if (err) { console.log('ERROR', sc.name, err); await p.close(); continue; }
    await p.waitForTimeout(200);
    const png = `${OUT}/${sc.name}.png`;
    await p.screenshot({ path: png, clip: { x: 0, y: 0, width: w, height: h } });
    await p.close();
    // optimise: lossless recompress; thumbs ≤120 KB
    execFileSync('convert', [png, '-strip', '-define', 'png:compression-level=9', png]);
    const thumb = `${OUT}/${sc.name}-thumb.jpg`;
    for (const q of [80, 72, 64, 56, 48]) {
      execFileSync('convert', [png, '-resize', '600x', '-strip', '-interlace', 'Plane', '-sampling-factor', '4:2:0', '-quality', String(q), thumb]);
      if (fs.statSync(thumb).size <= 98 * 1024) break;
    }
    console.log(`${sc.name}  ${((Date.now() - t0) / 1000).toFixed(1)}s  png ${(fs.statSync(png).size / 1024 / 1024).toFixed(2)} MB  thumb ${(fs.statSync(thumb).size / 1024).toFixed(0)} KB`);
  }
} finally { await b.close(); server.close(); }

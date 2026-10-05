#!/usr/bin/env node
/* QA + export renderer (Playwright/Chromium, one browser, closed promptly).
   node render.js sheets [filter]   → _qa/sheet-<pattern>.png  (each colourway tiled 3×3)
   node render.js seams  [filter]   → _qa/seam-<file>.png      (4-tile corner junction, 3× zoom) + numeric seam test
   node render.js png    [filter]   → png/<file>.png           (1024×1024, tile repeated 4×4)
   node render.js wall              → png/feature-wall-*.png   (1600×900 from feature-wall.html)            */
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const ROOT = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));
const [mode = 'sheets', filter = ''] = process.argv.slice(2);
const items = manifest.filter(m => m.file.includes(filter));
const url = f => 'file://' + path.join(ROOT, f);
const b64 = f => 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(ROOT, f)).toString('base64');

(async () => {
  const browser = await chromium.launch();
  try {
    if (mode === 'sheets') {
      const groups = {};
      for (const m of items) (groups[m.pattern] ||= []).push(m);
      const page = await browser.newPage({ viewport: { width: 100, height: 100 } });
      for (const [pid, ms] of Object.entries(groups)) {
        const S = 180; // tile size px → 3×3 = 540
        const html = `<body style="margin:0;background:#888;display:flex;gap:12px;padding:12px">` +
          ms.map(m => `<div><div style="width:${S * 3}px;height:${S * 3}px;background:url('${b64(m.file)}') 0 0/${S}px ${S}px repeat"></div><div style="font:14px sans-serif;color:#fff;padding-top:4px">${m.file}</div></div>`).join('') + `</body>`;
        await page.setViewportSize({ width: ms.length * (S * 3 + 12) + 12, height: S * 3 + 44 });
        await page.setContent(html); await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(ROOT, '_qa', `sheet-${pid}.png`) });
        console.log('sheet', pid);
      }
    }
    if (mode === 'seams') {
      const page = await browser.newPage({ viewport: { width: 640, height: 640 } });
      // numeric test: draw 2×2 tiles on canvas at integer scale, compare the pixel step ACROSS the seam
      // with the steps right beside it. A broken seam produces many large isolated jumps.
      await page.setContent('<canvas id=c></canvas>');
      for (const m of items) {
        const res = await page.evaluate(async ({ src, T }) => {
          const img = new Image(); img.src = src; await img.decode();
          const s = 2, S = T * s, cv = document.getElementById('c'); cv.width = S * 2; cv.height = S * 2;
          const g = cv.getContext('2d');
          for (const [x, y] of [[0, 0], [S, 0], [0, S], [S, S]]) g.drawImage(img, x, y, S, S);
          const d = g.getImageData(0, 0, S * 2, S * 2).data, W = S * 2;
          const px = (x, y) => { const i = (y * W + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
          const diff = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
          let bad = 0, n = 0, seamSum = 0, nearSum = 0;
          for (let k = 2; k < W - 2; k++) {
            // vertical seam at x=S, horizontal seam at y=S
            const v = [diff(px(S - 1, k), px(S, k)), diff(px(S - 2, k), px(S - 1, k)), diff(px(S, k), px(S + 1, k))];
            const h = [diff(px(k, S - 1), px(k, S)), diff(px(k, S - 2), px(k, S - 1)), diff(px(k, S), px(k, S + 1))];
            for (const [a, b, c] of [v, h]) { n++; seamSum += a; nearSum += (b + c) / 2; if (a > 90 && b < 20 && c < 20) bad++; }
          }
          return { bad, seamAvg: +(seamSum / n).toFixed(2), nearAvg: +(nearSum / n).toFixed(2) };
        }, { src: b64(m.file), T: m.tile });
        console.log(m.file.padEnd(42), JSON.stringify(res), res.bad > 3 ? '  <-- CHECK' : '  ok');
      }
      // visual: the 4-corner junction, magnified
      for (const m of items) {
        const S = 720; // one tile = 720px, seam crossing centred
        await page.setViewportSize({ width: 640, height: 640 });
        await page.setContent(`<body style="margin:0"><div style="width:640px;height:640px;background:url('${b64(m.file)}') 320px 320px/${S}px ${S}px repeat"></div>` +
          `<div style="position:fixed;left:0;top:0;width:640px;height:640px;pointer-events:none;background:linear-gradient(90deg,transparent 319px,rgba(255,0,255,.0) 319px)"></div></body>`);
        await page.waitForTimeout(250);
        await page.screenshot({ path: path.join(ROOT, '_qa', `seam-${m.file.replace('.svg', '')}.png`) });
      }
    }
    if (mode === 'png') {
      const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
      fs.mkdirSync(path.join(ROOT, 'png'), { recursive: true });
      for (const m of items) {
        await page.setContent(`<body style="margin:0"><div style="width:1024px;height:1024px;background:url('${b64(m.file)}') 0 0/256px 256px repeat"></div></body>`);
        await page.waitForTimeout(250);
        await page.screenshot({ path: path.join(ROOT, 'png', m.file.replace('.svg', '.png')) });
        console.log('png', m.file);
      }
    }
    if (mode === 'wall') {
      const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
      for (const id of ['a', 'b']) {
        await page.goto(url(`feature-wall.html?scene=${id}&export=1`)); await page.waitForTimeout(900);
        const el = await page.$(`#scene`);
        await el.screenshot({ path: path.join(ROOT, 'png', `feature-wall-${id}.png`) });
        console.log('wall', id);
      }
    }
  } finally { await browser.close(); }
})();

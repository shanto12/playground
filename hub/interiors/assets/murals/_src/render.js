// Render SVG files to PNG with one Chromium instance (sequential, closed promptly).
// usage: node render.js jobs.json   where jobs = [{svg, png, w, h, scale?}]
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
(async () => {
  const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const b = await chromium.launch();
  try {
    for (const j of jobs) {
      const t0 = Date.now();
      const p = await b.newPage({ viewport: { width: j.w, height: j.h }, deviceScaleFactor: j.scale || 1 });
      await p.goto('file://' + j.svg, { waitUntil: 'load' });
      await p.waitForTimeout(150);
      await p.screenshot({ path: j.png, clip: { x: 0, y: 0, width: j.w, height: j.h } });
      await p.close();
      console.log('ok', j.png.split('/').pop(), Date.now() - t0, 'ms');
    }
  } finally { await b.close(); }
})();

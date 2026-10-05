// Batch screenshot helper. Usage: node shoot.js jobs.json
// jobs: [{ html: "/abs/file.html", w, h, out: "/abs/out.png", scale?:1, wait?:ms }]
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
(async () => {
  const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const b = await chromium.launch();
  try {
    for (const j of jobs) {
      const p = await b.newPage({ viewport: { width: j.w, height: j.h }, deviceScaleFactor: j.scale || 1 });
      await p.goto('file://' + j.html);
      await p.evaluate(() => document.fonts.ready);
      await p.waitForTimeout(j.wait || 250);
      await p.screenshot({ path: j.out, clip: { x: 0, y: 0, width: j.w, height: j.h }, type: j.out.endsWith('.jpg') ? 'jpeg' : 'png', ...(j.out.endsWith('.jpg') ? { quality: 88 } : {}) });
      await p.close();
      process.stdout.write('.');
    }
  } finally { await b.close(); }
  console.log(' done', jobs.length);
})();

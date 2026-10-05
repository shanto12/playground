// node src/export-png.js → png/<name>.png at 1024×1024 (tile repeated 4×4)
'use strict';
const fs = require('fs'); const path = require('path');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const DIR = path.resolve(__dirname, '..');
const only = process.argv.slice(2);
(async () => {
  const files = fs.readdirSync(DIR).filter((f) => /^\d\d-.*\.svg$/.test(f) && (!only.length || only.some((o) => f.startsWith(o))));
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });
  for (const f of files) {
    const u = 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(DIR, f)).toString('base64');
    await p.setContent(`<html><body style="margin:0"><div style="width:1024px;height:1024px;background:url('${u}') 0 0/256px 256px repeat"></div></body></html>`);
    await p.waitForTimeout(120);
    await p.screenshot({ path: path.join(DIR, 'png', f.replace('.svg', '.png')) });
    console.log('png', f);
  }
  await b.close();
})();

/* QA screenshots of index.html at phone / tablet / desktop widths → _qa/ */
const path = require('path');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const ROOT = path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch();
  try {
    for (const [w, h, dsf] of [[390, 844, 1], [768, 1024, 1], [1280, 800, 1]]) {
      const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dsf });
      await p.goto('file://' + path.join(ROOT, 'index.html')); await p.waitForTimeout(1200);
      const sw = await p.evaluate(() => document.documentElement.scrollWidth);
      console.log(w, 'scrollWidth', sw, sw > w ? 'HORIZONTAL SCROLL!' : 'ok');
      await p.screenshot({ path: path.join(ROOT, '_qa', `index-${w}.png`), fullPage: true });
      if (w === 390) {
        await p.screenshot({ path: path.join(ROOT, '_qa', `index-390-top.png`) });
        await p.click('#\\30 4-marigold-damask .tile'); await p.waitForTimeout(600);
        await p.screenshot({ path: path.join(ROOT, '_qa', `index-390-viewer.png`) });
      }
      await p.close();
    }
  } finally { await b.close(); }
})();

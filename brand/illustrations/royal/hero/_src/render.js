'use strict';
/* QA + preview renderer. usage: node _src/render.js [tag] [--frames] [--previews] [--demo] */
const path = require('path');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const DIR = path.resolve(__dirname, '..');
const args = process.argv.slice(2), tag = (args.find(a => !a.startsWith('--')) || 'it');
const has = f => args.includes(f);

(async () => {
  const b = await chromium.launch();
  try {
    const shot = async (file, w, h, out, opts = {}) => {
      const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: opts.dpr || 1, reducedMotion: opts.reduced ? 'reduce' : 'no-preference' });
      await p.goto('file://' + path.join(DIR, file)); await p.waitForTimeout(opts.wait || 600);
      await p.screenshot({ path: path.join(DIR, out), fullPage: !!opts.full });
      if (opts.frame2) { await p.waitForTimeout(1500); await p.screenshot({ path: path.join(DIR, opts.frame2) }); }
      await p.close();
    };
    if (!has('--demo')) {
      await shot('hero-landscape-static.svg', 1600, 1000, `_qa/${tag}-landscape.png`);
      await shot('hero-portrait.svg', 800, 1200, `_qa/${tag}-portrait.png`, { wait: 2500 });
    }
    if (has('--frames')) {
      await shot('hero-landscape.svg', 1600, 1000, `_qa/${tag}-anim-f1.png`, { wait: 2000, frame2: `_qa/${tag}-anim-f2.png` });
    }
    if (has('--previews')) {
      await shot('hero-landscape.svg', 1600, 1000, 'png/hero-landscape.png', { reduced: true });
      await shot('hero-landscape-static.svg', 1600, 1000, 'png/hero-landscape-static.png');
      await shot('hero-portrait.svg', 800, 1200, 'png/hero-portrait.png', { reduced: true });
      await shot('arch-frame-demo-crop.html', 600, 400, '_qa/mask.png').catch(() => {});
    }
    if (has('--demo')) {
      await shot('index.html', 390, 844, `_qa/${tag}-demo-mobile.png`, { dpr: 2, wait: 1200, full: true });
      await shot('index.html', 1280, 800, `_qa/${tag}-demo-desktop.png`, { wait: 1200, full: true });
    }
  } finally { await b.close(); }
})();

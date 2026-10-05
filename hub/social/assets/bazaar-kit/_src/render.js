// Render kit pages to PNG with ONE Chromium instance, sequentially.
// usage: node render.js [id-substring ...]   (no args = everything)
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const { KIT, SRC } = require('./lib');

const groups = ['./posts', './stories', './profile', './composites'];
let assets = [];
for (const g of groups) { try { assets = assets.concat(require(g)); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND' || !String(e.message).includes(g.slice(2))) throw e; } }

const only = process.argv.slice(2);
const list = only.length ? assets.filter(a => only.some(o => a.id.includes(o))) : assets;
// composites depend on rendered PNGs: render them last
list.sort((a, b) => (a.stage || 0) - (b.stage || 0));

(async () => {
  const b = await chromium.launch();
  try {
    const ctx = await b.newContext({ deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    for (const a of list) {
      if (a.type === 'video') continue; // motion handled by motion.js
      const html = a.html();
      const pg = path.join(SRC, 'pages', a.id + '.html');
      fs.writeFileSync(pg, html);
      await p.setViewportSize({ width: a.w, height: a.h });
      await p.goto('file://' + pg, { waitUntil: 'load' });
      await p.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
      });
      await p.waitForTimeout(120);
      const out = path.join(a.outDir || KIT, a.file + '.png');
      await p.screenshot({ path: out, clip: { x: 0, y: 0, width: a.w, height: a.h } });
      console.log('rendered', a.id, a.w + 'x' + a.h);
    }
  } finally { await b.close(); }
})();

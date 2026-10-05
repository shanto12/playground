// QA screenshots of index.html: per-section captures at mobile (390) and desktop (1280).
// node _src/shoot.mjs [mobile|desktop|both] [sectionIds,comma]
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const which = process.argv[2] || 'both';
const only = process.argv[3] ? process.argv[3].split(',') : null;
const views = { mobile: { width: 390, height: 844, dpr: 2 }, desktop: { width: 1280, height: 900, dpr: 1 } };
const b = await chromium.launch();
try {
  for (const [name, v] of Object.entries(views)) {
    if (which !== 'both' && which !== name) continue;
    const p = await b.newPage({ viewport: { width: v.width, height: v.height }, deviceScaleFactor: v.dpr });
    await p.goto('file://' + path.join(OUT, 'index.html'));
    await p.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('in')));
    await p.waitForTimeout(900);
    const m = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, h: document.documentElement.scrollHeight }));
    console.log(name, JSON.stringify(m));
    const ids = only || ['top', 'spice', 'midnight', 'ivory', 'sizes', 'recolour', 'grid', 'use'];
    for (const id of ids) {
      const sel = id === 'top' ? 'header' : `#${id}`;
      const el = await p.$(sel);
      if (!el) continue;
      const box = await el.boundingBox();
      const clipH = Math.min(box.height, name === 'mobile' ? 2600 : 2400);
      await p.screenshot({ path: path.join(OUT, '_qa', `${name}-${id}.png`), clip: { x: 0, y: box.y, width: v.width, height: clipH }, fullPage: true });
    }
    await p.close();
  }
} finally { await b.close(); }

// QA screenshots of index.html + 1600×900 wall PNG exports
'use strict';
const path = require('path'); const { chromium } = require('/opt/node-tools/node_modules/playwright');
const DIR = path.resolve(__dirname, '..'); const URL = 'file://' + path.join(DIR, 'index.html');
const mode = process.argv[2] || 'all';
(async () => {
  const b = await chromium.launch();
  if (mode === 'all' || mode === 'walls') {
    const p = await b.newPage({ viewport: { width: 1700, height: 1000 }, deviceScaleFactor: 1 });
    await p.goto(URL); await p.waitForTimeout(600);
    await p.addStyleTag({ content: '.bar{display:none!important}' });
    for (const [i, f] of [[1, '07-jaipur-arches-sunset'], [2, '01-marigold-garland-night']]) {
      const el = await p.$('#wall-' + i);
      await el.evaluate((e) => { e.style.border = '0'; e.style.borderRadius = '0'; e.style.boxShadow = 'none'; e.style.width = '1600px'; });
      await p.waitForTimeout(150);
      await el.screenshot({ path: path.join(DIR, 'png', `wall-${f}.png`) });
    }
    await p.close();
  }
  if (mode === 'all' || mode === 'qa') {
    for (const [w, h, name, scheme] of [[390, 844, 'mobile', 'light'], [390, 844, 'mobile-dark', 'dark'], [1280, 900, 'desktop', 'light']]) {
      const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 2 : 1, colorScheme: scheme });
      const p = await ctx.newPage(); await p.goto(URL); await p.waitForTimeout(700);
      await p.screenshot({ path: path.join(DIR, '_qa', `page-${name}-top.png`) });
      const H = await p.evaluate(() => document.documentElement.scrollHeight);
      const sw = await p.evaluate(() => document.documentElement.scrollWidth);
      console.log(name, 'scrollHeight', H, 'scrollWidth', sw);
      await p.evaluate(() => document.querySelector('#p04').scrollIntoView());
      await p.waitForTimeout(200);
      await p.screenshot({ path: path.join(DIR, '_qa', `page-${name}-mid.png`) });
      await p.evaluate(() => document.querySelector('#walls').scrollIntoView());
      await p.waitForTimeout(200);
      await p.screenshot({ path: path.join(DIR, '_qa', `page-${name}-walls.png`) });
      await ctx.close();
    }
  }
  await b.close();
})();

// quick look: node test.js <themeKey> [layout]
'use strict';
const fs = require('fs'); const path = require('path');
const { renderRoom } = require('./room');
const S = require('./scenes');
const { withBrowser, svgToPng } = require('./render');
const QA = path.resolve(__dirname, '../_qa'); fs.mkdirSync(QA, { recursive: true });
const keys = process.argv.slice(2);
(async () => {
  await withBrowser(async (b) => {
    for (const k of keys) {
      const [tk, lay] = k.split(':');
      const t = tk === 'before' ? S.BEFORE : S.TH[tk];
      const L = lay ? S[lay] : S.main;
      const cfg = L(t, { caption: { badge: t.dir === 'royal' ? 'B · ROYAL' : 'A · BAZAAR', title: t.label || 'Before' } });
      const svg = renderRoom(cfg);
      fs.writeFileSync(path.join(QA, `t-${tk}${lay ? '-' + lay : ''}.svg`), svg);
      const t0 = Date.now();
      await svgToPng(b, svg, path.join(QA, `t-${tk}${lay ? '-' + lay : ''}.png`), 1920, 1080);
      console.log(k, (svg.length / 1024).toFixed(0) + 'KB svg', Date.now() - t0 + 'ms');
    }
  });
})();

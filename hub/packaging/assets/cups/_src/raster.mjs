// Rasterise SVG files to PNG with Playwright (one browser, sequential). Fonts are embedded in each SVG.
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
/** jobs: [{svg, png, wmm, hmm, pxPerMm, transparent}] */
export async function rasterize(jobs) {
  const b = await chromium.launch();
  try {
    for (const j of jobs) {
      const cssW = Math.ceil(j.wmm * 3.7795275591), cssH = Math.ceil(j.hmm * 3.7795275591);
      const dpr = j.pxPerMm / 3.7795275591;
      const p = await b.newPage({ viewport: { width: cssW, height: cssH }, deviceScaleFactor: dpr });
      const html = `<!doctype html><html><head><style>html,body{margin:0;background:transparent}img{display:block;width:${cssW}px;height:${cssH}px}</style></head><body>${fs.readFileSync(j.svg, 'utf8').replace(/<svg /, `<svg style="display:block;width:${cssW}px;height:${cssH}px" `)}</body></html>`;
      await p.setContent(html, { waitUntil: 'load' });
      await p.evaluate(() => document.fonts.ready);
      await p.waitForTimeout(150);
      await p.screenshot({ path: j.png, omitBackground: !!j.transparent, clip: { x: 0, y: 0, width: cssW, height: cssH } });
      await p.close();
    }
  } finally { await b.close(); }
}

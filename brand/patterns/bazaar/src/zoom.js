// node src/zoom.js file.svg out.png [scale] [tilesAcross]
const fs = require('fs'); const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const [file, out, sc = '2', n = '1'] = process.argv.slice(2);
  const svg = fs.readFileSync(file, 'utf8'); const S = +svg.match(/width="(\d+)"/)[1];
  const u = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: S * +n, height: S * +n }, deviceScaleFactor: +sc });
  await p.setContent(`<body style="margin:0"><div style="width:${S * n}px;height:${S * n}px;background:url('${u}') 0 0/${S}px ${S}px"></div></body>`);
  await p.waitForTimeout(150); await p.screenshot({ path: out }); await b.close();
})();

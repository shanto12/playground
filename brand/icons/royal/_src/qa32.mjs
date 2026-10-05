// 32px legibility check at DPR 1 (worst case), on midnight & ivory, then upscaled 3× for inspection.
import fs from 'node:fs'; import path from 'node:path';
import { createRequire } from 'node:module'; import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const icons = JSON.parse(fs.readFileSync(path.join(OUT, 'icons.json'), 'utf8'));
const sprite = fs.readFileSync(path.join(OUT, 'sprite.svg'), 'utf8');
const size = +(process.argv[2] || 32);
const cell = (n, suf = '') => `<div class="c"><svg width="${size}" height="${size}"><use href="#icon-${n}${suf}"/></svg></div>`;
const html = `<!doctype html><meta charset=utf-8><style>body{margin:0;font:9px system-ui}.r{display:flex;flex-wrap:wrap;width:${14 * (size + 12)}px;padding:6px}.c{width:${size + 12}px;height:${size + 12}px;display:grid;place-items:center}
.d{background:#160B26}.l{background:#FBF3E4;--icon-line:#B7791F}.m{background:#FBF3E4;color:#4B1D52}</style>${sprite}
<div class="r d">${icons.map((i) => cell(i.name)).join('')}</div><div class="r l">${icons.map((i) => cell(i.name)).join('')}</div><div class="r m">${icons.map((i) => cell(i.name, '-mono')).join('')}</div>`;
const f = path.join(OUT, '_qa', `s${size}.html`); fs.writeFileSync(f, html);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 14 * (size + 12) + 12, height: 300 }, deviceScaleFactor: 1 });
await p.goto('file://' + f); await p.waitForTimeout(200);
await p.screenshot({ path: path.join(OUT, '_qa', `s${size}.png`), fullPage: true }); await b.close();

// QA: build a dense proof sheet and screenshot it with Playwright.
// node _src/qa.mjs [filter] [outName]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, '..');
const icons = JSON.parse(fs.readFileSync(path.join(OUT, 'icons.json'), 'utf8'));
const sprite = fs.readFileSync(path.join(OUT, 'sprite.svg'), 'utf8');
const filter = process.argv[2] && process.argv[2] !== 'all' ? new RegExp(process.argv[2]) : null;
const outName = process.argv[3] || 'proof';
const list = icons.filter((i) => !filter || filter.test(i.name));
const use = (n, s, extra = '') => `<svg width="${s}" height="${s}" ${extra}><use href="#icon-${n}"/></svg>`;
const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:#160B26;font:11px system-ui;color:#F7D98A}
.row{display:grid;grid-template-columns:repeat(${Math.min(6, list.length)},1fr);gap:0}
.cell{padding:8px;border:1px solid #2a1a40}
.big{background:#160B26;display:flex;justify-content:center;position:relative}
.big .grid{position:absolute;inset:8px auto auto auto;width:128px;height:128px;background-image:linear-gradient(#ffffff10 1px,transparent 1px),linear-gradient(90deg,#ffffff10 1px,transparent 1px);background-size:16px 16px;outline:1px dashed #ffffff22}
.sm{display:flex;gap:6px;align-items:center;padding:6px;justify-content:center}
.dark{background:#160B26}.ivory{background:#FBF3E4;--icon-line:#B7791F}
.mono{background:#FBF3E4;color:#4B1D52}
</style>${sprite}<div class="row">${list.map((i) => `<div class="cell"><div class="big"><div class="grid"></div>${use(i.name, 128)}</div>
<div class="sm dark">${use(i.name, 48)}${use(i.name, 32)}${use(i.name, 24)}</div>
<div class="sm ivory">${use(i.name, 48)}${use(i.name, 32)}${use(i.name, 24)}</div>
<div class="sm mono">${use(i.name + '-mono', 48)}${use(i.name + '-mono', 32)}${use(i.name + '-mono', 24)}</div>
<div style="text-align:center">${i.name}</div></div>`).join('')}</div>`;
const file = path.join(OUT, '_qa', `${outName}.html`);
fs.writeFileSync(file, html);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 400 }, deviceScaleFactor: 1 });
await p.goto('file://' + file);
await p.waitForTimeout(200);
await p.screenshot({ path: path.join(OUT, '_qa', `${outName}.png`), fullPage: true });
await b.close();
console.log('ok', list.length);

import fs from 'node:fs'; import path from 'node:path';
import { createRequire } from 'node:module'; import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const icons = JSON.parse(fs.readFileSync(path.join(OUT, 'icons.json'), 'utf8'));
const sprite = fs.readFileSync(path.join(OUT, 'sprite.svg'), 'utf8');
const [from, to, bg = 'd'] = [+(process.argv[2] || 0), +(process.argv[3] || 21), process.argv[4]];
const list = icons.slice(from, to);
const html = `<!doctype html><meta charset=utf-8><style>body{margin:0;font:12px system-ui;background:${bg === 'd' ? '#160B26' : '#FBF3E4'};color:#b9a;--icon-line:${bg === 'd' ? '#E9A63A' : '#B7791F'}}
.r{display:grid;grid-template-columns:repeat(7,160px);gap:4px;padding:8px}.c{display:grid;justify-items:center;gap:2px;outline:1px solid #ffffff10}</style>${sprite}
<div class="r">${list.map((i) => `<div class="c"><svg width="150" height="150"><use href="#icon-${i.name}"/></svg>${i.name}</div>`).join('')}</div>`;
const f = path.join(OUT, '_qa', 'big.html'); fs.writeFileSync(f, html);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 7 * 164 + 16, height: 300 }, deviceScaleFactor: 1 });
await p.goto('file://' + f); await p.waitForTimeout(200);
await p.screenshot({ path: path.join(OUT, '_qa', `big-${from}-${bg}.png`), fullPage: true }); await b.close();

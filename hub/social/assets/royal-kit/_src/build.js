// Build: write every page to _src/pages/<id>.html and shoot it to ../<id>.png
// node build.js [filter-substring ...]   (QA copies at phone width go to ../_qa/phone/)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const L = require('./lib');
const pages = require('./pages');

const filters = process.argv.slice(2);
const sel = pages.filter((p) => !filters.length || filters.some((f) => p.id.includes(f)));
const jobs = [];
for (const p of sel) {
  const html = path.join(L.SRC, 'pages', p.id + '.html');
  L.write(html, p.html);
  jobs.push({ html, w: p.w, h: p.h, out: path.join(L.KIT, p.id + '.png'), wait: p.wait || 300 });
}
const jf = path.join(L.SRC, 'pages', '_jobs.json');
fs.writeFileSync(jf, JSON.stringify(jobs));
execFileSync('node', [path.join(L.SRC, 'shoot.js'), jf], { stdio: 'inherit' });
console.log(sel.map((p) => p.id).join('\n'));

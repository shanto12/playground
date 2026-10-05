// Seam QA + contact sheets.  REF_DIR=<dir with reference svgs> node src/qa.js 01 02 ...
// 1) tiles each SVG 3×3 on a canvas and diffs it against an un-clipped reference render
//    (any motif missing its wrap-around twin shows up as a cluster of bad pixels on a seam)
// 2) writes _qa/NN-contact.png (all colourways, 3×3 tiles) for eyeballing
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node-tools/node_modules/playwright');

const DIR = path.resolve(__dirname, '..');
const REF = process.env.REF_DIR;
const want = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const detail = process.argv.includes('--detail');
const files = fs.readdirSync(DIR).filter((f) => /^\d\d-.*\.svg$/.test(f)).sort();
const groups = {};
for (const f of files) { const k = f.slice(0, 2); if (!want.length || want.includes(k)) (groups[k] = groups[k] || []).push(f); }
const order = ['sunset', 'night', 'fresh'];
const rank = (f) => { const i = order.findIndex((o) => f.includes('-' + o + '.')); return i < 0 ? 9 : i; };

const durl = (s) => 'data:image/svg+xml;base64,' + Buffer.from(s).toString('base64');

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1500, height: 900 } });
  await p.setContent('<html><body style="margin:0"></body></html>');
  for (const [k, list] of Object.entries(groups)) {
    list.sort((a, c) => rank(a) - rank(c));
    for (const f of list) {
      const svg = fs.readFileSync(path.join(DIR, f), 'utf8');
      const S = +svg.match(/width="(\d+)"/)[1];
      let res = { note: 'no ref' };
      if (REF && fs.existsSync(path.join(REF, f))) {
        const ref = fs.readFileSync(path.join(REF, f), 'utf8');
        res = await p.evaluate(async ({ a, r, S }) => {
          const load = (u) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = u; });
          const [ia, ir] = await Promise.all([load(a), load(r)]);
          const W = 3 * S;
          const ca = new OffscreenCanvas(W, W), cr = new OffscreenCanvas(W, W);
          const xa = ca.getContext('2d'), xr = cr.getContext('2d');
          for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) xa.drawImage(ia, i * S, j * S, S, S);
          xr.drawImage(ir, 0, 0, W, W);
          const A = xa.getImageData(0, 0, W, W).data, R = xr.getImageData(0, 0, W, W).data;
          let bad = 0, seamBad = 0, maxd = 0; const M = new Uint8Array(W * W);
          for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
            const o = (y * W + x) * 4;
            const d = Math.max(Math.abs(A[o] - R[o]), Math.abs(A[o + 1] - R[o + 1]), Math.abs(A[o + 2] - R[o + 2]));
            if (d > maxd) maxd = d;
            if (d > 60) { M[y * W + x] = 1; bad++; if (bad <= 24) (window.__bp = window.__bp || []).push([x, y, d]); const nx = Math.min(x % S, S - x % S), ny = Math.min(y % S, S - y % S); if (nx < 3 || ny < 3) seamBad++; }
          }
          let clustered = 0;
          for (let y = 1; y < W - 1; y++) for (let x = 1; x < W - 1; x++) if (M[y * W + x]) {
            let nb = 0; for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) if ((i || j) && M[(y + j) * W + x + i]) nb++;
            if (nb >= 2) clustered++;
          }
          const bp = window.__bp || []; window.__bp = []; return { clustered, bad, seamBad, maxd, bp: bp.map((a) => a.join(":")).join(" ") };
        }, { a: durl(svg), r: durl(ref), S });
      }
      const kb = (Buffer.byteLength(svg) / 1024).toFixed(1);
      console.log(f.padEnd(40), kb.padStart(5) + 'KB', JSON.stringify(res));
    }
    // contact sheet
    const n = list.length, cell = 460, tile = 153;
    const html = `<html><body style="margin:0;display:flex;gap:10px;background:#888;padding:10px;width:max-content">` +
      list.map((f) => `<div style="width:${cell}px;height:${cell}px;background:url('${durl(fs.readFileSync(path.join(DIR, f), 'utf8'))}') 0 0/${tile}px ${tile}px repeat"></div>`).join('') + `</body></html>`;
    await p.setViewportSize({ width: n * (cell + 10) + 10, height: cell + 20 });
    await p.setContent(html); await p.waitForTimeout(200);
    await p.screenshot({ path: path.join(DIR, '_qa', `${k}-contact.png`) });
    if (detail) {
      const f = list[0]; const S = +fs.readFileSync(path.join(DIR, f), 'utf8').match(/width="(\d+)"/)[1];
      await p.setViewportSize({ width: 2 * S, height: 2 * S });
      await p.setContent(`<html><body style="margin:0"><div style="width:${2 * S}px;height:${2 * S}px;background:url('${durl(fs.readFileSync(path.join(DIR, f), 'utf8'))}') ${S / 2}px ${S / 2}px/${S}px ${S}px repeat"></div></body></html>`);
      await p.waitForTimeout(100);
      await p.screenshot({ path: path.join(DIR, '_qa', `${k}-detail.png`), scale: 'device' });
    }
  }
  await b.close();
})();

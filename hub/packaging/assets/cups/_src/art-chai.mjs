// Chai cup (12 oz, kulhad-inspired print) + sleeve + lid — both directions. Units: mm.
import { BZ, RY, FONT, T, f, place, placeC, patternDef, stickerText, foilDef, frustum, scallopBand } from './lib.mjs';

export const CUP = { Rtop: 45, Rbot: 30, h: 110 };              // 12 oz hot cup, 90 mm rim
export const SLEEVE_T = [0.27, 0.835];                          // sleeve spans this fraction of cup height
const gapR = 0.8;                                               // sleeve stands off the cup wall
export const SLEEVE = (() => {
  const R = t => CUP.Rtop + (CUP.Rbot - CUP.Rtop) * t;
  return { Rtop: R(SLEEVE_T[0]) + gapR, Rbot: R(SLEEVE_T[1]) + gapR, h: CUP.h * (SLEEVE_T[1] - SLEEVE_T[0]) };
})();
export const CUPG = frustum(CUP), SLVG = frustum(SLEEVE);

/* deterministic random */
export function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** kulhad clay body: base colour + throwing rings + speckle */
function clay(W, H, c, seed = 7) {
  const r = rng(seed); let s = `<rect width="${f(W)}" height="${f(H)}" fill="${c.clay}"/>`;
  // soft vertical tonal drift (hand-thrown feel)
  s += `<rect width="${f(W)}" height="${f(H)}" fill="url(#clayGrad)" opacity=".55"/>`;
  for (let y = 2; y < H; y += 1.6 + r() * 3.2) {
    const lt = r() > 0.5; const op = 0.08 + r() * 0.14;
    s += `<path d="M0 ${f(y)}C${f(W * 0.3)} ${f(y + (r() - 0.5) * 0.9)} ${f(W * 0.6)} ${f(y + (r() - 0.5) * 0.9)} ${f(W)} ${f(y)}" stroke="${lt ? c.clayLt : c.clayDk}" stroke-width="${f(0.25 + r() * 0.55)}" fill="none" opacity="${op.toFixed(2)}"/>`;
  }
  for (let i = 0; i < 420; i++) s += `<circle cx="${f(r() * W)}" cy="${f(r() * H)}" r="${f(0.12 + r() * 0.28)}" fill="${r() > 0.5 ? c.clayDk : c.clayLt}" opacity="${(0.25 + r() * 0.4).toFixed(2)}"/>`;
  return s;
}
const clayGradDef = c => `<linearGradient id="clayGrad" x1="0" y1="0" x2="1" y2="0">${[0, .17, .33, .5, .67, .83, 1].map((o, i) => `<stop offset="${o}" stop-color="${i % 2 ? c.clayLt : c.clayDk}" stop-opacity="${i % 2 ? .35 : .25}"/>`).join('')}</linearGradient>`;

/* marigold flower glyph (Bazaar) */
export function marigold(cx, cy, r, { petal = BZ.marigold, inner = BZ.saffron, stroke = BZ.ink, sw } = {}) {
  sw = sw ?? r * 0.14; let p = '';
  const n = 10;
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; p += `<circle cx="${f(cx + Math.cos(a) * r * 0.62)}" cy="${f(cy + Math.sin(a) * r * 0.62)}" r="${f(r * 0.42)}"/>`; }
  return `<g fill="${petal}" stroke="${stroke}" stroke-width="${f(sw)}">${p}</g><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.55)}" fill="${inner}" stroke="${stroke}" stroke-width="${f(sw)}"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.2)}" fill="${stroke}"/>`;
}
export function leaf(cx, cy, len, rot, fill = BZ.cilantro, stroke = BZ.ink, sw = 0.5) {
  return `<path transform="translate(${f(cx)} ${f(cy)}) rotate(${f(rot)})" d="M0 0C${f(len * .35)} ${f(-len * .32)} ${f(len * .75)} ${f(-len * .25)} ${f(len)} 0C${f(len * .75)} ${f(len * .25)} ${f(len * .35)} ${f(len * .32)} 0 0Z" fill="${fill}" stroke="${stroke}" stroke-width="${f(sw)}" stroke-linejoin="round"/>`;
}
/* Royal: mehrab arch path (pointed), base at y, width w, height h */
export function archPath(cx, yBase, w, h) {
  const hw = w / 2, sh = h - hw * 1.05;
  return `M${f(cx - hw)} ${f(yBase)}V${f(yBase - sh)}C${f(cx - hw)} ${f(yBase - sh - hw * 0.75)} ${f(cx - hw * 0.25)} ${f(yBase - h + hw * 0.18)} ${f(cx)} ${f(yBase - h)}C${f(cx + hw * 0.25)} ${f(yBase - h + hw * 0.18)} ${f(cx + hw)} ${f(yBase - sh - hw * 0.75)} ${f(cx + hw)} ${f(yBase - sh)}V${f(yBase)}Z`;
}
export function diamond(cx, cy, s, fill) { return `<path d="M${f(cx)} ${f(cy - s)}L${f(cx + s * .7)} ${f(cy)}L${f(cx)} ${f(cy + s)}L${f(cx - s * .7)} ${f(cy)}Z" fill="${fill}"/>`; }

/* ───────────────────────── CUP WRAP ───────────────────────── */
export function chaiWrap(dir) {
  const W = CUPG.W, H = CUPG.H, mid = W / 2;
  const yS0 = SLEEVE_T[0] * H, yS1 = SLEEVE_T[1] * H;
  if (dir === 'bazaar') {
    const c = BZ; let b = '';
    let defs = clayGradDef(c);
    b += clay(W, H, c, 11);
    // cream kulhad lip band, scalloped indigo edge
    b += `<path d="${scallopBand(0, W, 0, 11, 40, 1.2)}" fill="${c.ink}"/>`;
    b += `<path d="${scallopBand(0, W, 0, 9.6, 40, 1.2)}" fill="${c.cream}"/>`;
    for (let i = 0; i < 40; i++) b += `<circle cx="${f((i + .5) * W / 40)}" cy="5.6" r=".9" fill="${i % 2 ? c.rani : c.saffron}"/>`;
    // marigold + leaf row just above the sleeve
    for (let i = 0; i < 14; i++) {
      const x = (i + .5) * W / 14, y = 20;
      b += leaf(x - 2.5, y + .5, 6, 200, c.cilantro, c.ink, .45) + leaf(x + 2.5, y + .5, 6, -20, c.cilantro, c.ink, .45) + marigold(x, y, 3.6);
    }
    // front emblem under the sleeve (seen when the sleeve comes off)
    b += placeC('logo/bazaar/emblem.svg', mid, 61, { h: 30 });
    b += T(mid, 86, 'CHAI-LO!', { font: FONT.bowlby, size: 6.4, fill: c.cream, ls: .3 });
    // bottom truck-art border: indigo stripe + triangles
    const yb = 96;
    b += `<rect x="0" y="${yb}" width="${f(W)}" height="${f(H - yb)}" fill="${c.ink}"/>`;
    const n = 48;
    for (let i = 0; i < n; i++) {
      const x0 = i * W / n, x1 = (i + 1) * W / n, col = [c.marigold, c.rani, c.peacock, c.saffron][i % 4];
      b += `<path d="M${f(x0)} ${f(yb + 1)}L${f((x0 + x1) / 2)} ${f(yb + 6.5)}L${f(x1)} ${f(yb + 1)}Z" fill="${col}"/>`;
    }
    for (let i = 0; i < 64; i++) b += `<circle cx="${f((i + .5) * W / 64)}" cy="${f(yb + 10.5)}" r=".75" fill="${c.cream}"/>`;
    b += `<rect x="0" y="${f(yb)}" width="${f(W)}" height=".8" fill="${c.marigold}"/>`;
    return { W, H, defs, body: b };
  }
  // ROYAL
  const c = RY; let b = ''; let defs = clayGradDef(c) + foilDef('foilW', 0, 0, 1, 0);
  b += clay(W, H, c, 23);
  // midnight lip band with gold lattice
  b += `<rect width="${f(W)}" height="12" fill="${c.ink}"/>`;
  b += `<rect y="11.4" width="${f(W)}" height=".6" fill="url(#foilW)"/><rect y="1.6" width="${f(W)}" height=".35" fill="url(#foilW)"/>`;
  const n = 52;
  for (let i = 0; i < n; i++) {
    const x = (i + .5) * W / n;
    b += `<path d="M${f(x)} 3.2L${f(x + 1.9)} 6.6L${f(x)} 10L${f(x - 1.9)} 6.6Z" fill="none" stroke="url(#foilW)" stroke-width=".35"/>`;
    b += diamond(x + W / n / 2, 6.6, .55, c.goldLt);
  }
  // gold arch frieze above sleeve
  const na = 18;
  for (let i = 0; i < na; i++) {
    const x = (i + .5) * W / na;
    b += `<path d="${archPath(x, 28.5, 7.2, 11.5)}" fill="none" stroke="${c.gold}" stroke-width=".45"/>`;
    b += diamond(x, 22.5, .9, c.goldLt);
  }
  b += `<rect y="28.4" width="${f(W)}" height=".4" fill="url(#foilW)"/>`;
  // under-sleeve emblem
  b += placeC('logo/royal/emblem.svg', mid, 60, { h: 34 });
  // emerald foot with arch row
  const yb = 95.5;
  b += `<rect x="0" y="${yb}" width="${f(W)}" height="${f(H - yb)}" fill="${c.emerald}"/>`;
  b += `<rect y="${yb}" width="${f(W)}" height=".6" fill="url(#foilW)"/><rect y="${f(yb + 1.6)}" width="${f(W)}" height=".3" fill="url(#foilW)"/>`;
  for (let i = 0; i < 30; i++) { const x = (i + .5) * W / 30; b += `<path d="${archPath(x, H - 2, 4.6, 9.5)}" fill="none" stroke="${c.gold}" stroke-width=".4"/>` + `<circle cx="${f(x)}" cy="${f(H - 6)}" r=".55" fill="${c.goldLt}"/>`; }
  return { W, H, defs, body: b };
}

/* ───────────────────────── SLEEVE ───────────────────────── */
export function chaiSleeve(dir) {
  const W = SLVG.W, H = SLVG.H, mid = W / 2;
  if (dir === 'bazaar') {
    const c = BZ; let b = '';
    const defs = patternDef('patterns/bazaar/05-chai-time-fresh.svg', 'pChai', { size: 30, x: 4, y: 3 });
    b += `<rect width="${f(W)}" height="${f(H)}" fill="url(#pChai)"/>`;
    // top & bottom indigo rails with cream stitch dots
    for (const y of [0, H - 4.2]) {
      b += `<rect y="${f(y)}" width="${f(W)}" height="4.2" fill="${c.ink}"/>`;
      for (let i = 0; i < 70; i++) b += `<circle cx="${f((i + .5) * W / 70)}" cy="${f(y + 2.1)}" r=".55" fill="${i % 3 === 0 ? c.marigold : c.cream}"/>`;
    }
    // FRONT sticker panel
    const pw = 78, ph = 41, px = mid - pw / 2, py = H / 2 - ph / 2 - .5;
    b += `<rect x="${f(px + 1.8)}" y="${f(py + 1.8)}" width="${pw}" height="${ph}" rx="7" fill="${c.ink}"/>`;
    b += `<rect x="${f(px)}" y="${f(py)}" width="${pw}" height="${ph}" rx="7" fill="${c.rani}" stroke="${c.ink}" stroke-width="1.1"/>`;
    b += T(mid, py + 9.3, 'CURRY DISTRICT · CHAI & COOLERS', { font: FONT.dm(700), size: 3.1, fill: c.cream, ls: .45 });
    b += stickerText(mid, py + 25.5, 'CHAI-LO!', { size: 15.5, fill: c.marigold, shadow: c.ink, stroke: c.ink, sw: 1.5, dx: 1, dy: 1.1 });
    b += T(mid, py + 35.6, 'Garam chai. Zero rush.', { font: FONT.caveat(700), size: 7.2, fill: c.cream });
    // left: emblem on a marigold badge
    const lx = mid - 66;
    b += `<circle cx="${f(lx + 1.2)}" cy="${f(H / 2 + 1.2)}" r="17" fill="${c.ink}"/><circle cx="${f(lx)}" cy="${f(H / 2)}" r="17" fill="${c.marigold}" stroke="${c.ink}" stroke-width="1"/>`;
    b += placeC('logo/bazaar/emblem.svg', lx, H / 2 - .5, { h: 24 });
    // right: chai ticket (back-right)
    const tx = mid + 52, tw = 50, th = 40, ty = H / 2 - th / 2;
    const notch = (x, y) => `<circle cx="${f(x)}" cy="${f(y)}" r="3.2" fill="url(#pChai)"/>`;
    b += `<rect x="${f(tx + 1.4)}" y="${f(ty + 1.4)}" width="${tw}" height="${th}" rx="2.5" fill="${c.ink}"/>`;
    b += `<rect x="${f(tx)}" y="${f(ty)}" width="${tw}" height="${th}" rx="2.5" fill="${c.cream}" stroke="${c.ink}" stroke-width=".9"/>`;
    b += `<path d="M${f(tx + 11)} ${f(ty + 2)}V${f(ty + th - 2)}" stroke="${c.ink}" stroke-width=".55" stroke-dasharray="1.3 1.1"/>`;
    b += `<text transform="translate(${f(tx + 6.8)} ${f(ty + th / 2)}) rotate(-90)" ${FONT.bowlby} font-size="4.3" fill="${c.saffron}" text-anchor="middle" letter-spacing=".3">TICKET</text>`;
    b += T(tx + 31, ty + 9, 'CHAI FACT', { font: FONT.bowlby, size: 4.6, fill: c.rani, ls: .3 });
    b += T(tx + 31, ty + 17.5, '“Chai” just', { font: FONT.caveat(700), size: 6, fill: c.ink });
    b += T(tx + 31, ty + 23.5, 'means tea.', { font: FONT.caveat(700), size: 6, fill: c.ink });
    b += T(tx + 31, ty + 30.5, 'So “chai tea”', { font: FONT.caveat(600), size: 4.9, fill: c.muted });
    b += T(tx + 31, ty + 35.5, 'is tea tea.', { font: FONT.caveat(600), size: 4.9, fill: c.muted });
    // back-left: wordmark on cream pill
    const wx = 40;
    b += `<rect x="${f(wx - 31 + 1.2)}" y="${f(H / 2 - 13 + 1.2)}" width="62" height="26" rx="13" fill="${c.ink}"/><rect x="${f(wx - 31)}" y="${f(H / 2 - 13)}" width="62" height="26" rx="13" fill="${c.cream}" stroke="${c.ink}" stroke-width=".9"/>`;
    b += placeC('logo/bazaar/wordmark-stacked.svg', wx, H / 2, { h: 21 });
    return { W, H, defs, body: b };
  }
  // ROYAL
  const c = RY; let b = '';
  const defs = patternDef('patterns/royal/03-paisley-vine-emerald.svg', 'pPais', { size: 34, x: 2, y: -6 }) + foilDef('foilS', 0, 0, 1, 1) + foilDef('foilH', 0, 0, 1, 0);
  b += `<rect width="${f(W)}" height="${f(H)}" fill="url(#pPais)"/>`;
  b += `<rect width="${f(W)}" height="${f(H)}" fill="${c.emerald}" opacity=".35"/>`;
  // gold rails
  for (const y of [2.2, H - 2.2]) { b += `<rect y="${f(y - .35)}" width="${f(W)}" height=".7" fill="url(#foilH)"/>`; }
  for (const y of [4.1, H - 4.1]) { b += `<rect y="${f(y - .15)}" width="${f(W)}" height=".3" fill="${c.gold}" opacity=".8"/>`; }
  for (let i = 0; i < 60; i++) { b += diamond((i + .5) * W / 60, 0.9, .5, c.goldLt) + diamond((i + .5) * W / 60, H - .9, .5, c.goldLt); }
  // FRONT: midnight mehrab window
  const aw = 46, ah = 52, ab = H - 5.6;
  b += `<path d="${archPath(mid, ab + .2, aw + 3.2, ah + 2.8)}" fill="url(#foilS)"/>`;
  b += `<path d="${archPath(mid, ab, aw, ah)}" fill="${c.ink}"/>`;
  b += `<path d="${archPath(mid, ab - 1.8, aw - 4, ah - 4)}" fill="none" stroke="${c.gold}" stroke-width=".3"/>`;
  b += placeC('logo/royal/emblem.svg', mid, ab - ah + 17, { h: 15 });
  b += T(mid, ab - 21.2, 'A slow cup', { font: FONT.fr(500, true), size: 6.6, fill: c.ivory });
  b += T(mid, ab - 13.6, 'of chai.', { font: FONT.fr(500, true), size: 6.6, fill: c.goldLt });
  b += `<rect x="${f(mid - 8)}" y="${f(ab - 9.6)}" width="16" height=".3" fill="${c.gold}"/>`;
  b += T(mid, ab - 4.6, 'CURRY DISTRICT', { font: FONT.hk(600), size: 2.5, fill: c.gold, ls: .9 });
  // left: seal medallion
  b += placeC('logo/royal/seal.svg', mid - 64, H / 2, { h: 38 });
  // right: chai note on ivory card with arch top
  const nx = mid + 64;
  b += `<path d="${archPath(nx, H / 2 + 18, 46, 40)}" fill="${c.ivory}"/>`;
  b += `<path d="${archPath(nx, H / 2 + 16.6, 42.6, 37)}" fill="none" stroke="${c.goldDk}" stroke-width=".35"/>`;
  b += T(nx, H / 2 - 7.5, 'A NOTE ON CHAI', { font: FONT.hk(700), size: 2.6, fill: c.ruby, ls: .7 });
  b += T(nx, H / 2 + 1, '“Chai” simply', { font: FONT.fr(500, true), size: 5.4, fill: c.ink });
  b += T(nx, H / 2 + 7.4, 'means tea.', { font: FONT.fr(500, true), size: 5.4, fill: c.ink });
  b += T(nx, H / 2 + 13.6, 'Take your time with it.', { font: FONT.hk(500), size: 2.9, fill: c.muted });
  // back: foil wordmark on midnight cartouche
  const wx = 40;
  b += `<rect x="${f(wx - 32)}" y="${f(H / 2 - 14)}" width="64" height="28" rx="14" fill="${c.ink}" stroke="url(#foilS)" stroke-width=".8"/>`;
  b += placeC('logo/royal/wordmark-horizontal.svg', wx, H / 2, { w: 52 });
  return { W, H, defs, body: b };
}

/* ───────────────────────── LID (top view texture) ───────────────────────── */
export const LID = { R: 46.5 };
export function chaiLid(dir) {
  const S = 100, cx = 50, cy = 50; let b = '';
  const base = dir === 'bazaar' ? '#FBF6EA' : '#1E1530';
  const hi = dir === 'bazaar' ? '#FFFFFF' : '#3C2D52', lo = dir === 'bazaar' ? '#D9CFBB' : '#0B0612';
  const emb = (d, sw) => `<path d="${d}" fill="none" stroke="${lo}" stroke-width="${sw}" stroke-linecap="round" transform="translate(.35 .35)"/><path d="${d}" fill="none" stroke="${hi}" stroke-width="${sw}" stroke-linecap="round" transform="translate(-.3 -.3)"/><path d="${d}" fill="none" stroke="${base}" stroke-width="${sw}" stroke-linecap="round"/>`;
  b += `<rect width="${S}" height="${S}" fill="${base}"/>`;
  // concentric ridges
  for (const [r, w] of [[44.5, .9], [41, .6], [27, .5]]) b += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${lo}" stroke-width="${w}" opacity=".7"/><circle cx="${cx - .35}" cy="${cy - .35}" r="${r}" fill="none" stroke="${hi}" stroke-width="${w * .7}" opacity=".9"/>`;
  // sip slot near the front edge (bottom of texture = towards the viewer)
  const sy = cy + 34;
  b += `<rect x="${cx - 7}" y="${sy - 2.2}" width="14" height="4.4" rx="2.2" fill="${dir === 'bazaar' ? '#2A2340' : '#000'}"/>`;
  b += `<rect x="${cx - 7}" y="${sy - 2.2}" width="14" height="1.4" rx=".7" fill="#000" opacity=".5"/>`;
  // embossed steam cue pointing at the sip hole
  const st = (x, ph) => `M${x} ${sy - 7}c-1.6 -2.2 1.6 -3.6 0 -5.8s1.6 -3.6 0 -5.8`;
  b += emb(st(cx - 4.2), 1.05) + emb(st(cx), 1.05) + emb(st(cx + 4.2), 1.05);
  // embossed word around the ring
  b += `<path id="lidArc" d="M${cx - 34} ${cy}A34 34 0 0 1 ${cx + 34} ${cy}" fill="none"/>`;
  const word = dir === 'bazaar' ? 'CURRY DISTRICT · CHAI-LO' : 'CURRY DISTRICT · CHAI';
  const tp = (dx, col) => `<text ${dir === 'bazaar' ? FONT.bowlby : FONT.hk(700)} font-size="3.6" letter-spacing="${dir === 'bazaar' ? .5 : 1.2}" fill="${col}" text-anchor="middle" transform="translate(${dx} ${dx})"><textPath href="#lidArc" startOffset="50%">${word}</textPath></text>`;
  b += tp(.3, lo) + tp(-.25, hi) + tp(0, base);
  // tiny “sip” cue
  b += `<text x="${cx + 12}" y="${sy + 1.3}" ${FONT.dm(700)} font-size="2.6" fill="${lo}" text-anchor="start">sip</text>`;
  return { W: S, H: S, defs: '', body: b };
}

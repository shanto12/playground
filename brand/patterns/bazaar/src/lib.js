// Curry District · BAZAAR surface patterns — shared helpers.
// Every motif is placed on a torus: anything that crosses a tile edge is
// re-emitted on the opposite edge, so the tile repeats with no seams.
'use strict';

// Palette — copied verbatim from brand/tokens.css (Direction A · BAZAAR)
const C = {
  ink: '#1D1147', cream: '#FFF4DC', mari: '#FFB000', saff: '#FF6A13',
  rani: '#E4147E', chili: '#D62839', pea: '#00A8A0', cil: '#3FA34D',
  vio: '#7B5CFF',
  paper2: '#FFE7B8',   // --c-surface-2
  dusk: '#3A1B7A',     // --grad-night mid stop
  muted: '#5B4F85',    // --c-muted
  white: '#FFFFFF',    // --c-surface
};

const f = (n) => {
  const v = Math.round(n * 100) / 100;
  return Object.is(v, -0) ? '0' : String(v);
};
const mod = (a, n) => ((a % n) + n) % n;

function rng(seed) { // mulberry32
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class Tile {
  // mode 'tile' → viewBox 0..S ; mode 'ref' → 3×3 un-clipped reference (-S..2S) used only for seam QA
  constructor(S, mode = 'tile') {
    this.S = S; this.mode = mode;
    this.lo = mode === 'ref' ? -S : 0;
    this.hi = mode === 'ref' ? 2 * S : S;
    this.defs = []; this.body = []; this.ids = new Set();
  }
  def(id, content) {
    if (this.ids.has(id)) return id;
    this.ids.add(id); this.defs.push(`<g id="${id}">${content}</g>`);
    return id;
  }
  rawDef(content) { this.defs.push(content); }
  _offsets(x, y, r) {
    const { S, lo, hi } = this;
    x = mod(x, S); y = mod(y, S);
    const K = this.mode === 'ref' ? [-2, -1, 0, 1, 2] : [-1, 0, 1];
    const out = [];
    for (const dy of K) for (const dx of K) {
      const X = x + dx * S, Y = y + dy * S;
      if (this.mode === 'ref' || (X + r > lo && X - r < hi && Y + r > lo && Y - r < hi)) out.push([X, Y]);
    }
    return out;
  }
  tf(X, Y, rot, s, sx) {
    let t = `translate(${f(X)} ${f(Y)})`;
    if (rot) t += ` rotate(${f(rot)})`;
    if (sx !== undefined && sx !== null) t += ` scale(${f(sx)} ${f(s)})`;
    else if (s !== 1) t += ` scale(${f(s)})`;
    return t;
  }
  // place a <defs> motif at (x,y). r = bounding radius (generous!) used for edge wrapping.
  use(id, x, y, o = {}) {
    const { rot = 0, s = 1, r = 30, sx = null, attrs = '' } = o;
    for (const [X, Y] of this._offsets(x, y, r)) {
      this.body.push(`<use xlink:href="#${id}" transform="${this.tf(X, Y, rot, s, sx)}"${attrs ? ' ' + attrs : ''}/>`);
    }
  }
  // place inline markup at (x,y)
  put(markup, x, y, o = {}) {
    const { rot = 0, s = 1, r = 30 } = o;
    for (const [X, Y] of this._offsets(x, y, r)) {
      this.body.push(`<g transform="${this.tf(X, Y, rot, s)}">${markup}</g>`);
    }
  }
  // full-width horizontal band y1..y2 (wraps vertically)
  hband(y1, y2, fill, extra = '') {
    const { S, lo, hi } = this;
    const K = this.mode === 'ref' ? [-2, -1, 0, 1, 2] : [-1, 0, 1];
    for (const dy of K) {
      const a = y1 + dy * S, b = y2 + dy * S;
      if (b > lo && a < hi) this.body.push(`<rect x="${lo - 2}" y="${f(a)}" width="${hi - lo + 4}" height="${f(b - a)}" fill="${fill}"${extra}/>`);
    }
  }
  raw(markup) { this.body.push(markup); }
  svg(title, bg) {
    const { S, lo, hi } = this;
    const W = hi - lo;
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${lo} ${lo} ${W} ${W}" width="${W}" height="${W}">` +
      `<title>${title.replace(/&/g, "&amp;")}</title>` +
      `<defs>${this.defs.join('')}</defs>` +
      `<rect x="${lo}" y="${lo}" width="${W}" height="${W}" fill="${bg}"/>` +
      this.body.join('') + `</svg>`;
  }
}

// ---------- torus helpers for even scatter ----------
function tdist(ax, ay, bx, by, S) {
  let dx = Math.abs(ax - bx) % S; dx = Math.min(dx, S - dx);
  let dy = Math.abs(ay - by) % S; dy = Math.min(dy, S - dy);
  return Math.hypot(dx, dy);
}
// best-candidate placement: returns {x,y} with the largest clearance, or null
function bestSpot(obst, r, S, R, tries = 500, margin = 0) {
  let best = null;
  for (let t = 0; t < tries; t++) {
    const x = R() * S, y = R() * S;
    let clear = Infinity;
    for (const o of obst) {
      const c = tdist(x, y, o.x, o.y, S) - o.r - r;
      if (c < clear) clear = c;
    }
    if (!best || clear > best.clear) best = { x, y, clear };
  }
  return best && best.clear >= margin ? best : null;
}
// relax a set of discs on the torus so they spread evenly (soft repulsion)
function relax(items, S, iters = 200, gap = 4) {
  for (let it = 0; it < iters; it++) {
    for (let i = 0; i < items.length; i++) {
      const a = items[i];
      if (a.fixed) continue;
      let fx = 0, fy = 0;
      for (let j = 0; j < items.length; j++) {
        if (i === j) continue;
        const b = items[j];
        let dx = a.x - b.x; dx -= S * Math.round(dx / S);
        let dy = a.y - b.y; dy -= S * Math.round(dy / S);
        const d = Math.hypot(dx, dy) || 0.01;
        const want = a.r + b.r + gap;
        const k = d < want ? (want - d) / d * 0.5 : (1 / (d * d)) * 30; // overlap push + gentle spread
        fx += dx * k; fy += dy * k;
      }
      const m = Math.hypot(fx, fy), cap = 3;
      if (m > cap) { fx *= cap / m; fy *= cap / m; }
      a.x = mod(a.x + fx, S); a.y = mod(a.y + fy, S);
    }
  }
  return items;
}

// ---------- geometry ----------
// scalloped circle: n outward lobes on radius rr
function scallop(rr, n, rot = 0, k = 1) {
  const P = [];
  for (let i = 0; i < n; i++) {
    const a = rot * Math.PI / 180 + i * 2 * Math.PI / n;
    P.push([rr * Math.cos(a), rr * Math.sin(a)]);
  }
  const c = 2 * rr * Math.sin(Math.PI / n), ar = (c / 2) * k;
  let d = `M${f(P[0][0])} ${f(P[0][1])}`;
  for (let i = 1; i <= n; i++) {
    const p = P[i % n];
    d += `A${f(ar)} ${f(ar)} 0 0 1 ${f(p[0])} ${f(p[1])}`;
  }
  return d + 'Z';
}
// petal pointing up (−y) from origin, length L, half-width W, roundness
function petal(L, W, tip = 0.75) {
  return `M0 0C${f(W)} ${f(-L * 0.25)} ${f(W)} ${f(-L * tip)} 0 ${f(-L)}C${f(-W)} ${f(-L * tip)} ${f(-W)} ${f(-L * 0.25)} 0 0Z`;
}
// rounded petal (teardrop with round end) pointing up
function rpetal(L, W) {
  return `M0 0C${f(W * 0.6)} ${f(-L * 0.15)} ${f(W * 1.15)} ${f(-L * 0.55)} ${f(W * 0.8)} ${f(-L * 0.82)}C${f(W * 0.5)} ${f(-L * 1.05)} ${f(-W * 0.5)} ${f(-L * 1.05)} ${f(-W * 0.8)} ${f(-L * 0.82)}C${f(-W * 1.15)} ${f(-L * 0.55)} ${f(-W * 0.6)} ${f(-L * 0.15)} 0 0Z`;
}
// leaf pointing up, length L, half-width W
function leaf(L, W) {
  return `M0 0C${f(W * 1.1)} ${f(-L * 0.2)} ${f(W * 1.0)} ${f(-L * 0.7)} 0 ${f(-L)}C${f(-W * 1.0)} ${f(-L * 0.7)} ${f(-W * 1.1)} ${f(-L * 0.2)} 0 0Z`;
}
// n-point star
function star(n, ro, ri, rot = -90) {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? ri : ro;
    const a = (rot + i * 180 / n) * Math.PI / 180;
    d += (i ? 'L' : 'M') + f(r * Math.cos(a)) + ' ' + f(r * Math.sin(a));
  }
  return d + 'Z';
}
// smooth closed blob through points (quadratic through midpoints)
function blob(P) {
  const n = P.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let m = mid(P[n - 1], P[0]);
  let d = `M${f(m[0])} ${f(m[1])}`;
  for (let i = 0; i < n; i++) {
    const p = P[i], q = mid(P[i], P[(i + 1) % n]);
    d += `Q${f(p[0])} ${f(p[1])} ${f(q[0])} ${f(q[1])}`;
  }
  return d + 'Z';
}
// ring of n copies of a path around origin
function ring(d, n, rot0, attrs) {
  let s = '';
  for (let i = 0; i < n; i++) s += `<path d="${d}" transform="rotate(${f(rot0 + i * 360 / n)})" ${attrs}/>`;
  return s;
}
function dots(n, r, dr, rot0, fill) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = (rot0 + i * 360 / n) * Math.PI / 180;
    s += `<circle cx="${f(r * Math.cos(a))}" cy="${f(r * Math.sin(a))}" r="${f(dr)}" fill="${fill}"/>`;
  }
  return s;
}

module.exports = { C, f, mod, rng, Tile, tdist, bestSpot, relax, scallop, petal, rpetal, leaf, star, blob, ring, dots };

// ---------- compound-disc scatter (for elongated motifs) ----------
function worldCircles(it) {
  const a = (it.rot || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), k = it.s || 1;
  return it.circles.map(([lx, ly, r]) => ({ x: it.x + (lx * c - ly * s) * k, y: it.y + (lx * s + ly * c) * k, r: r * k }));
}
function relax2(items, S, iters = 300, gap = 5, spread = 40) {
  const md = (d) => d - S * Math.round(d / S);
  for (let it = 0; it < iters; it++) {
    const W = items.map(worldCircles);
    const F = items.map(() => [0, 0]);
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      // contact push
      for (const a of W[i]) for (const b of W[j]) {
        const dx = md(a.x - b.x), dy = md(a.y - b.y);
        const d = Math.hypot(dx, dy) || 0.01, want = a.r + b.r + gap;
        if (d < want) { const k = (want - d) / d * 0.25; F[i][0] += dx * k; F[i][1] += dy * k; F[j][0] -= dx * k; F[j][1] -= dy * k; }
      }
      // gentle long-range spread between centres
      const dx = md(items[i].x - items[j].x), dy = md(items[i].y - items[j].y);
      const d2 = Math.max(dx * dx + dy * dy, 1), k = spread / d2 / Math.sqrt(d2);
      F[i][0] += dx * k; F[i][1] += dy * k; F[j][0] -= dx * k; F[j][1] -= dy * k;
    }
    items.forEach((o, i) => {
      if (o.fixed) return;
      let [fx, fy] = F[i]; const m = Math.hypot(fx, fy), cap = 2.5;
      if (m > cap) { fx *= cap / m; fy *= cap / m; }
      o.x = mod(o.x + fx, S); o.y = mod(o.y + fy, S);
    });
  }
  return items;
}
// min clearance of each item to its neighbours (QA aid)
function clearances(items, S) {
  const W = items.map(worldCircles);
  return items.map((_, i) => {
    let m = Infinity;
    for (let j = 0; j < items.length; j++) if (j !== i) for (const a of W[i]) for (const b of W[j]) m = Math.min(m, tdist(a.x, a.y, b.x, b.y, S) - a.r - b.r);
    return m;
  });
}
// open/closed Catmull-Rom → cubic Bézier path
function spline(P, closed = true, t = 0.5) {
  const n = P.length, g = (i) => closed ? P[(i + n) % n] : P[Math.max(0, Math.min(n - 1, i))];
  let d = `M${f(P[0][0])} ${f(P[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) * t / 3, p1[1] + (p2[1] - p0[1]) * t / 3];
    const c2 = [p2[0] - (p3[0] - p1[0]) * t / 3, p2[1] - (p3[1] - p1[1]) * t / 3];
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + (closed ? 'Z' : '');
}
Object.assign(module.exports, { worldCircles, relax2, clearances, spline });

// jittered hex-ish lattice with type assignment that keeps same types far apart (torus)
// types: array of keys (length = cols*rows). Returns [{x,y,type}]
function latticeScatter(S, cols, rows, types, R, jitter = 6, swaps = 6000) {
  const slots = [];
  const dx = S / cols, dy = S / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) slots.push({ x: (c + 0.5 + (r % 2) * 0.5) * dx, y: (r + 0.5) * dy });
  const n = slots.length, T = types.slice(0, n);
  while (T.length < n) T.push(types[T.length % types.length]);
  // shuffle
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [T[i], T[j]] = [T[j], T[i]]; }
  const D = slots.map((a) => slots.map((b) => tdist(a.x, a.y, b.x, b.y, S)));
  const cost = (i) => { let s = 0; for (let j = 0; j < n; j++) if (j !== i && T[j] === T[i]) s += 1 / (D[i][j] * D[i][j]); return s; };
  for (let k = 0; k < swaps; k++) {
    const i = Math.floor(R() * n), j = Math.floor(R() * n);
    if (T[i] === T[j]) continue;
    const before = cost(i) + cost(j);
    [T[i], T[j]] = [T[j], T[i]];
    if (cost(i) + cost(j) > before) [T[i], T[j]] = [T[j], T[i]];
  }
  return slots.map((s, i) => ({ x: mod(s.x + (R() - 0.5) * 2 * jitter, S), y: mod(s.y + (R() - 0.5) * 2 * jitter, S), type: T[i] }));
}
Object.assign(module.exports, { latticeScatter });

// dense samples of a Catmull-Rom spline (same parametrisation as spline())
function sampleSpline(P, closed = true, per = 12, t = 0.5) {
  const n = P.length, g = (i) => closed ? P[(i + n) % n] : P[Math.max(0, Math.min(n - 1, i))];
  const out = []; const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) * t / 3, p1[1] + (p2[1] - p0[1]) * t / 3];
    const c2 = [p2[0] - (p3[0] - p1[0]) * t / 3, p2[1] - (p3[1] - p1[1]) * t / 3];
    for (let k = 0; k < per; k++) {
      const u = k / per, v = 1 - u;
      out.push([v * v * v * p1[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * p2[0],
        v * v * v * p1[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * p2[1]]);
    }
  }
  return out;
}
// points every `gap` units along a closed polyline offset by d (positive = to the left of travel)
function dotsAlongOffset(pts, d, gap) {
  const n = pts.length, off = [];
  for (let i = 0; i < n; i++) {
    const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
    const tx = b[0] - a[0], ty = b[1] - a[1], m = Math.hypot(tx, ty) || 1;
    off.push([pts[i][0] + (ty / m) * d, pts[i][1] - (tx / m) * d]);
  }
  let L = 0; const seg = [];
  for (let i = 0; i < n; i++) { const a = off[i], b = off[(i + 1) % n]; const l = Math.hypot(b[0] - a[0], b[1] - a[1]); seg.push(l); L += l; }
  const k = Math.max(1, Math.round(L / gap)), step = L / k, out = [];
  let acc = 0, i = 0, pos = 0;
  for (let j = 0; j < k; j++) {
    const target = j * step;
    while (acc + seg[i] < target) { acc += seg[i]; i++; }
    const u = (target - acc) / seg[i], a = off[i], b = off[(i + 1) % n];
    out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
  }
  return out;
}
Object.assign(module.exports, { sampleSpline, dotsAlongOffset });

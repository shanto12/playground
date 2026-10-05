// Tiny geometry kit for drawing on the 64-grid.
// Element = { tag, a:{...geometry, transform?}, s:'line'|role|null, f:role|null, dots?, sw?, rule? }
const r2 = (v) => +(+v).toFixed(2);

function el(tag, a, o = {}) {
  return {
    tag, a: { ...a, ...(o.transform ? { transform: o.transform } : {}) },
    s: o.s === undefined ? 'line' : o.s,
    f: o.f || null, dots: o.dots, sw: o.sw, rule: o.rule, mono: o.mono,
  };
}
export const P = (d, o) => el('path', { d }, o);
export const C = (cx, cy, r, o) => el('circle', { cx, cy, r }, o);
export const E = (cx, cy, rx, ry, o) => el('ellipse', { cx, cy, rx, ry }, o);
export const R = (x, y, w, h, rx, o) => el('rect', { x, y, width: w, height: h, rx }, o);
export const L = (x1, y1, x2, y2, o) => P(`M${r2(x1)} ${r2(y1)}L${r2(x2)} ${r2(y2)}`, o);
export const fillOnly = (f, extra = {}) => ({ s: null, f, ...extra });

// apply a transform to a list of elements (prepends to existing transform)
export function T(transform, els) {
  return els.map((e) => ({ ...e, a: { ...e.a, transform: e.a.transform ? `${transform} ${e.a.transform}` : transform } }));
}

// ── path sampling (absolute M L H V C Q Z only) ──
export function samplePath(d, steps = 24) {
  const tok = d.match(/[MLHVCQZ]|-?\d*\.?\d+(?:e-?\d+)?/gi);
  const pts = []; let i = 0, cmd = null, x = 0, y = 0, sx = 0, sy = 0;
  const num = () => parseFloat(tok[i++]);
  while (i < tok.length) {
    if (/[A-Za-z]/.test(tok[i])) cmd = tok[i++];
    switch (cmd) {
      case 'M': x = num(); y = num(); sx = x; sy = y; pts.push([x, y]); cmd = 'L'; break;
      case 'L': x = num(); y = num(); pts.push([x, y]); break;
      case 'H': x = num(); pts.push([x, y]); break;
      case 'V': y = num(); pts.push([x, y]); break;
      case 'C': {
        const x1 = num(), y1 = num(), x2 = num(), y2 = num(), x3 = num(), y3 = num();
        for (let k = 1; k <= steps; k++) {
          const t = k / steps, u = 1 - t;
          pts.push([u*u*u*x + 3*u*u*t*x1 + 3*u*t*t*x2 + t*t*t*x3, u*u*u*y + 3*u*u*t*y1 + 3*u*t*t*y2 + t*t*t*y3]);
        }
        x = x3; y = y3; break;
      }
      case 'Q': {
        const x1 = num(), y1 = num(), x2 = num(), y2 = num();
        for (let k = 1; k <= steps; k++) {
          const t = k / steps, u = 1 - t;
          pts.push([u*u*x + 2*u*t*x1 + t*t*x2, u*u*y + 2*u*t*y1 + t*t*y2]);
        }
        x = x2; y = y2; break;
      }
      case 'Z': case 'z': x = sx; y = sy; pts.push([x, y]); cmd = null; break;
      default: i++;
    }
  }
  return pts;
}
export function inPoly([px, py], poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
export const insideCircle = (cx, cy, r) => ([x, y]) => Math.hypot(x - cx, y - cy) < r;
export const insidePath = (d) => { const poly = samplePath(d); return (p) => inPoly(p, poly); };
export const below = (yLine) => ([, y]) => y > yLine;

// Visible arcs of an ellipse (or circle) not covered by any occluder → path d made of A commands.
export function visibleArcs(cx, cy, rx, ry, occluders, { N = 1440 } = {}) {
  const pt = (t) => [cx + rx * Math.cos(t), cy + ry * Math.sin(t)];
  const hidden = (t) => occluders.some((f) => f(pt(t)));
  const step = (2 * Math.PI) / N;
  const vis = []; for (let k = 0; k < N; k++) vis.push(!hidden(k * step));
  if (vis.every(Boolean)) return `M${r2(cx - rx)} ${r2(cy)}A${r2(rx)} ${r2(ry)} 0 1 1 ${r2(cx + rx)} ${r2(cy)}A${r2(rx)} ${r2(ry)} 0 1 1 ${r2(cx - rx)} ${r2(cy)}`;
  if (!vis.some(Boolean)) return '';
  const start = vis.findIndex((v) => !v);
  const refine = (tVis, tHid) => { for (let k = 0; k < 30; k++) { const m = (tVis + tHid) / 2; if (hidden(m)) tHid = m; else tVis = m; } return tVis; };
  let d = '';
  let k = 0;
  while (k < N) {
    const idx = (start + k) % N;
    if (vis[idx]) {
      let j = k; while (j < N && vis[(start + j) % N]) j++;
      const tA = refine((start + k) * step, (start + k - 1) * step);
      const tB = refine((start + j - 1) * step, (start + j) * step);
      const span = tB - tA;
      const [ax, ay] = pt(tA), [bx, by] = pt(tB);
      d += `M${r2(ax)} ${r2(ay)}A${r2(rx)} ${r2(ry)} 0 ${span > Math.PI ? 1 : 0} 1 ${r2(bx)} ${r2(by)}`;
      k = j;
    } else k++;
  }
  return d;
}

// Clip a polyline/bezier path: keep only parts outside occluders → polyline path (used sparingly)
export function visiblePath(d, occluders, steps = 40) {
  const pts = samplePath(d, steps);
  let out = '', pen = false;
  for (const p of pts) {
    const h = occluders.some((f) => f(p));
    if (h) { pen = false; continue; }
    out += `${pen ? 'L' : 'M'}${r2(p[0])} ${r2(p[1])}`; pen = true;
  }
  return out;
}

// Point on cubic bezier
export function bez([x0, y0], [x1, y1], [x2, y2], [x3, y3], t) {
  const u = 1 - t;
  return [u*u*u*x0 + 3*u*u*t*x1 + 3*u*t*t*x2 + t*t*t*x3, u*u*u*y0 + 3*u*u*t*y1 + 3*u*t*t*y2 + t*t*t*y3];
}
export const polar = (cx, cy, r, deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
export const fmt = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${r2(x)} ${r2(y)}`).join('');
export { r2 };

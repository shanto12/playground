// Vector food fills (top view) for open trays + lunchbox compartments. Units: mm.
import { f } from './lib.mjs';
import { rng } from './art-chai.mjs';

function blobPath(cx, cy, r, r2, n, rnd, rot = 0) {
  const pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + rot; const rr = (i % 2 ? r2 : r) * (0.82 + rnd() * .3); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .85]); }
  let d = `M${f((pts[0][0] + pts[n - 1][0]) / 2)} ${f((pts[0][1] + pts[n - 1][1]) / 2)}`;
  for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; d += `Q${f(p[0])} ${f(p[1])} ${f((p[0] + q[0]) / 2)} ${f((p[1] + q[1]) / 2)}`; }
  return d + 'Z';
}
export function curry(W, H, seed = 3, { base = '#D9631E', lite = '#F08A3C', chunk = '#B24A17', cream = true } = {}) {
  const r = rng(seed); let b = '';
  const id = 'cg' + seed;
  let defs = `<radialGradient id="${id}" cx=".45" cy=".42" r=".7"><stop offset="0" stop-color="${lite}"/><stop offset="1" stop-color="${base}"/></radialGradient>`;
  b += `<rect width="${f(W)}" height="${f(H)}" fill="url(#${id})"/>`;
  // oil sheen rings
  for (let i = 0; i < 70; i++) b += `<ellipse cx="${f(r() * W)}" cy="${f(r() * H)}" rx="${f(1 + r() * 4)}" ry="${f(.6 + r() * 2.4)}" fill="#F7B05A" opacity="${(.25 + r() * .35).toFixed(2)}"/>`;
  // chunks
  const n = Math.round(W * H / 900);
  for (let i = 0; i < n; i++) {
    const cx = 8 + r() * (W - 16), cy = 8 + r() * (H - 16), rr = 6 + r() * 7;
    b += `<path d="${blobPath(cx + 1, cy + 1.6, rr, rr * .8, 8, r)}" fill="#7A2E0C" opacity=".35"/>`;
    b += `<path d="${blobPath(cx, cy, rr, rr * .8, 8, r, r())}" fill="${chunk}"/>`;
    b += `<path d="${blobPath(cx - rr * .2, cy - rr * .25, rr * .5, rr * .35, 6, r)}" fill="${lite}" opacity=".55"/>`;
  }
  if (cream) for (let i = 0; i < 3; i++) {
    const cx = W * (.25 + r() * .5), cy = H * (.25 + r() * .5), s = 14 + r() * 14;
    b += `<path d="M${f(cx - s)} ${f(cy)}C${f(cx - s * .5)} ${f(cy - s * .7)} ${f(cx + s * .2)} ${f(cy + s * .6)} ${f(cx + s)} ${f(cy - s * .1)}" stroke="#FFF1DC" stroke-width="${f(2.4 + r() * 1.5)}" fill="none" stroke-linecap="round" opacity=".92"/>`;
  }
  // cilantro bits
  for (let i = 0; i < W * H / 260; i++) { const x = r() * W, y = r() * H, s = 1.2 + r() * 1.8; b += `<path d="M${f(x)} ${f(y)}c${f(s)} ${f(-s)} ${f(s * 2)} 0 ${f(s)} ${f(s)}s${f(-2 * s)} 0 ${f(-s)} ${f(-s)}Z" fill="${r() > .5 ? '#3C8A2E' : '#2E6E22'}"/>`; }
  return { W, H, defs, body: b };
}
function grains(W, H, r, n, cols, len = 5.2, wid = 1.25, ox = 0, oy = 0) {
  let b = '';
  for (let i = 0; i < n; i++) {
    const x = ox + r() * W, y = oy + r() * H, a = r() * 180, c = cols[Math.floor(r() * cols.length)];
    b += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(len / 2 * (.8 + r() * .35))}" ry="${f(wid / 2)}" transform="rotate(${f(a)} ${f(x)} ${f(y)})" fill="${c}"/>`;
  }
  return b;
}
export function biryani(W, H, seed = 5) {
  const r = rng(seed); let b = `<rect width="${f(W)}" height="${f(H)}" fill="#E9D3A2"/>`;
  b += grains(W, H, r, Math.round(W * H / 3.2), ['#FBF3DF', '#F6E8C8', '#FFFFFF', '#F4DFAE']);
  // saffron patches
  for (let i = 0; i < W * H / 2400; i++) { const cx = r() * W, cy = r() * H; b += grains(20, 15, r, 34, ['#F2A51D', '#E9861B', '#F7C34A'], 5.2, 1.25, cx - 10, cy - 7.5); }
  // chicken pieces
  for (let i = 0; i < W * H / 2600; i++) { const cx = 10 + r() * (W - 20), cy = 10 + r() * (H - 20), rr = 6 + r() * 5; b += `<path d="${blobPath(cx + .8, cy + 1.4, rr, rr * .75, 8, r)}" fill="#5B2A10" opacity=".35"/><path d="${blobPath(cx, cy, rr, rr * .75, 8, r)}" fill="#A8541E"/><path d="${blobPath(cx - 1, cy - 1.5, rr * .5, rr * .35, 6, r)}" fill="#D07A33" opacity=".7"/>`; }
  // fried onions
  for (let i = 0; i < W * H / 160; i++) { const x = r() * W, y = r() * H, s = 2 + r() * 3; b += `<path d="M${f(x)} ${f(y)}q${f(s)} ${f(-s)} ${f(s * 2)} 0" stroke="${r() > .5 ? '#7A3A12' : '#9C5220'}" stroke-width=".9" fill="none" stroke-linecap="round"/>`; }
  // mint leaves
  for (let i = 0; i < W * H / 1300; i++) { const x = r() * W, y = r() * H, s = 3 + r() * 2, a = r() * 360; b += `<path transform="rotate(${f(a)} ${f(x)} ${f(y)})" d="M${f(x)} ${f(y)}c${f(s)} ${f(-s * .9)} ${f(s * 2.2)} ${f(-s * .4)} ${f(s * 2.6)} 0c${f(-s * .5)} ${f(s * .8)} ${f(-1.8 * s)} ${f(s * .8)} ${f(-s * 2.6)} 0Z" fill="#3E8B3A"/>`; }
  return { W, H, defs: '', body: b };
}
export function rice(W, H, seed = 9) {
  const r = rng(seed); let b = `<rect width="${f(W)}" height="${f(H)}" fill="#EFE6D2"/>`;
  b += grains(W, H, r, Math.round(W * H / 3.0), ['#FFFFFF', '#FBF6EA', '#F3EBD8', '#FFFDF7']);
  for (let i = 0; i < W * H / 90; i++) { const x = r() * W, y = r() * H, a = r() * 180; b += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="1.3" ry=".45" transform="rotate(${f(a)} ${f(x)} ${f(y)})" fill="#6B4A22"/>`; }
  return { W, H, defs: '', body: b };
}
export function naan(W, H, seed = 13) {
  const r = rng(seed); let b = `<rect width="${f(W)}" height="${f(H)}" fill="#E8C98E"/>`;
  const pieces = [];
  const n = Math.max(3, Math.round(W * H / 5200));
  for (let i = 0; i < n * 2; i++) pieces.push([8 + r() * (W - 16), 8 + r() * (H - 16), 26 + r() * 18, r() * 180]);
  for (const [cx, cy, s, a] of pieces) {
    const d = `M${f(-s)} 0C${f(-s)} ${f(-s * .55)} ${f(s * .2)} ${f(-s * .6)} ${f(s * .9)} ${f(-s * .15)}C${f(s * 1.05)} 0 ${f(s * .9)} ${f(s * .25)} ${f(s * .4)} ${f(s * .45)}C${f(-s * .2)} ${f(s * .65)} ${f(-s)} ${f(s * .5)} ${f(-s)} 0Z`;
    b += `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${f(a)})"><path d="${d}" fill="#8A5A22" opacity=".4" transform="translate(1.2 2)"/><path d="${d}" fill="#EDC27A"/><path d="${d}" fill="none" stroke="#C98F45" stroke-width="1.2"/>`;
    for (let k = 0; k < 14; k++) { const x = (r() - .5) * s * 1.4, y = (r() - .5) * s * .7, rr = .8 + r() * 2.4; b += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rr * 1.4)}" ry="${f(rr)}" fill="${r() > .6 ? '#5A2E10' : '#9B5B23'}" opacity="${(.55 + r() * .4).toFixed(2)}"/>`; }
    for (let k = 0; k < 10; k++) { const x = (r() - .5) * s * 1.3, y = (r() - .5) * s * .6; b += `<circle cx="${f(x)}" cy="${f(y)}" r=".7" fill="#3E8B3A"/>`; }
    b += `<ellipse cx="${f(-s * .2)}" cy="${f(-s * .12)}" rx="${f(s * .45)}" ry="${f(s * .18)}" fill="#FFF3D6" opacity=".35"/></g>`;
  }
  return { W, H, defs: '', body: b };
}
/** lunchbox interior (top view): black PP base with 3 compartments */
export function lunchInterior(W = 222, H = 146) {
  const L = curry(W * .5, H - 8, 21), R1 = rice(W * .44, H * .48, 22), R2 = naan(W * .44, H * .44, 23);
  let b = `<rect width="${f(W)}" height="${f(H)}" rx="10" fill="#151216"/>`;
  const comp = (x, y, w, h, art, id) => `<clipPath id="${id}"><rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="7"/></clipPath><g clip-path="url(#${id})"><svg x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" viewBox="0 0 ${f(art.W)} ${f(art.H)}" preserveAspectRatio="xMidYMid slice"><defs>${art.defs}</defs>${art.body}</svg></g><rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="7" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="2.4"/>`;
  b += comp(5, 5, W * .5, H - 10, L, 'lc1') + comp(W * .5 + 10, 5, W * .5 - 15, H * .5 - 7.5, R1, 'lc2') + comp(W * .5 + 10, H * .5 + 2.5, W * .5 - 15, H * .5 - 7.5, R2, 'lc3');
  return { W, H, defs: '', body: b };
}

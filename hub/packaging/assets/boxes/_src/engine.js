// Curry District packaging mockup engine — three.js scene from flat face art (SVG, mm units).
import * as THREE from './vendor/three.module.min.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
let CFG = null;

// ───────────────────────── noise / grain ─────────────────────────
function noiseCanvas(n = 256, amp = 1, seed = 7) {
  const c = document.createElement('canvas'); c.width = c.height = n;
  const g = c.getContext('2d'); const id = g.createImageData(n, n);
  let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n * n; i++) { const v = 128 + (rnd() - .5) * 255 * amp; id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; }
  g.putImageData(id, 0, 0);
  return c;
}
let NOISE = null, FIBRE = null;
function fibreCanvas(n = 512) {
  const c = document.createElement('canvas'); c.width = c.height = n; const g = c.getContext('2d');
  g.fillStyle = '#808080'; g.fillRect(0, 0, n, n);
  let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 2600; i++) {
    const x = rnd() * n, y = rnd() * n, l = 4 + rnd() * 18, a = rnd() * Math.PI;
    g.strokeStyle = rnd() > .5 ? `rgba(255,255,255,${.08 + rnd() * .18})` : `rgba(0,0,0,${.08 + rnd() * .2})`;
    g.lineWidth = .6 + rnd() * .9; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(60,35,10,${.15 + rnd() * .25})`; g.beginPath(); g.arc(rnd() * n, rnd() * n, .5 + rnd() * 1.4, 0, 7); g.fill(); }
  return c;
}

// ───────────────────────── textures ─────────────────────────
const texCache = new Map();
async function loadImg(url) {
  const img = new Image(); img.src = url; await img.decode(); return img;
}
async function faceTex(url, wmm, hmm, o = {}) {
  const key = url + '|' + JSON.stringify(o);
  if (texCache.has(key)) return texCache.get(key);
  const ppm = o.ppm || CFG.ppm || 8, maxPx = o.maxPx || 4096;
  let W = Math.round(wmm * ppm), H = Math.round(hmm * ppm);
  const s = Math.min(1, maxPx / Math.max(W, H)); W = Math.max(8, Math.round(W * s)); H = Math.max(8, Math.round(H * s));
  const img = await loadImg(url);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0, W, H);
  let mr = null;
  if (o.metal) mr = metalMap(g, W, H, o);
  // paper tooth / kraft fibre
  const grain = o.grain ?? .10;
  if (grain) {
    g.globalCompositeOperation = 'overlay'; g.globalAlpha = grain;
    g.fillStyle = g.createPattern(NOISE, 'repeat'); g.fillRect(0, 0, W, H);
    if (o.kraft) { g.globalAlpha = .55; g.fillStyle = g.createPattern(FIBRE, 'repeat'); g.fillRect(0, 0, W, H); }
    g.globalAlpha = 1; g.globalCompositeOperation = 'destination-in'; g.drawImage(img, 0, 0, W, H);
    g.globalCompositeOperation = 'source-over';
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const out = { map: t, mr, W, H, canvas: c };
  texCache.set(key, out);
  return out;
}
function metalMap(g, W, H, o) {
  // gold-foil detector: warm hue, saturated, bright → metallic + low roughness
  const id = g.getImageData(0, 0, W, H), d = id.data;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g2 = c.getContext('2d');
  const od = g2.createImageData(W, H), q = od.data;
  const base = o.rough ?? .78;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i] / 255, gg = d[i + 1] / 255, b = d[i + 2] / 255;
    const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), dl = mx - mn;
    let h = 0; if (dl > 1e-4) { if (mx === r) h = ((gg - b) / dl) % 6; else if (mx === gg) h = (b - r) / dl + 2; else h = (r - gg) / dl + 4; h *= 60; if (h < 0) h += 360; }
    const sat = mx > 0 ? dl / mx : 0;
    let m = (h > 22 && h < 58 && sat > .33 && mx > .42) ? 1 : 0;
    if (m && sat < .42) m = (sat - .33) / .09;
    q[i] = 0; q[i + 1] = Math.round((base * (1 - m) + .26 * m) * 255); q[i + 2] = Math.round(m * 255); q[i + 3] = 255;
  }
  g2.putImageData(od, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 8;
  return t;
}
function bumpTex(repeatX, repeatY) {
  const t = new THREE.CanvasTexture(NOISE); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeatX, repeatY); return t;
}
async function printMat(url, wmm, hmm, o = {}) {
  const T = await faceTex(url, wmm, hmm, o);
  const p = { map: T.map, side: o.side ?? THREE.DoubleSide, transparent: !!o.transparent, alphaTest: o.alphaTest ?? 0.0 };
  let m;
  if (T.mr) {
    m = new THREE.MeshStandardMaterial({ ...p, metalness: 1, roughness: 1, metalnessMap: T.mr, roughnessMap: T.mr, envMapIntensity: o.env ?? 1.15 });
  } else {
    m = new THREE.MeshStandardMaterial({ ...p, metalness: 0, roughness: o.rough ?? .62, envMapIntensity: o.env ?? .9 });
  }
  m.bumpMap = bumpTex(wmm / 18, hmm / 18); m.bumpScale = o.bump ?? .35;
  return m;
}
function plainMat(color, o = {}) {
  const m = new THREE.MeshStandardMaterial({ color, roughness: o.rough ?? .8, metalness: o.metal ?? 0, side: o.side ?? THREE.FrontSide, envMapIntensity: o.env ?? .8 });
  if (o.kraft) { const t = new THREE.CanvasTexture(FIBRE); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); m.bumpMap = t; m.bumpScale = .5; }
  return m;
}

// ───────────────────────── geometry helpers ─────────────────────────
// quad with explicit corners (tl,tr,br,bl) and uvs (art coords normalised, y down) → mapped
function quadGeo(P, UV) {
  // P: [tl,tr,br,bl] Vector3 ; UV: [[u,v]...] with v measured top-down (0 at top)
  const g = new THREE.BufferGeometry();
  const pos = [], uv = [];
  const tri = [0, 3, 1, 1, 3, 2];
  for (const i of tri) { pos.push(P[i].x, P[i].y, P[i].z); uv.push(UV[i][0], 1 - UV[i][1]); }
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}
function triGeo(P, UV) {
  const g = new THREE.BufferGeometry(); const pos = [], uv = [];
  for (let i = 0; i < 3; i++) { pos.push(P[i].x, P[i].y, P[i].z); uv.push(UV[i][0], 1 - UV[i][1]); }
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals(); return g;
}
function mesh(geo, mat, cast = true, recv = true) { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = recv; return m; }

// lathe with arc-length v (0 at first point = bottom) and phiStart = π so u=.5 faces +z
function latheGeo(pts, segs = 160, vTopIsOne = true) {
  const n = pts.length; const L = [0];
  for (let i = 1; i < n; i++) L.push(L[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const tot = L[n - 1];
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= segs; i++) {
    const u = i / segs, phi = Math.PI + u * Math.PI * 2;
    const s = Math.sin(phi), c = Math.cos(phi);
    for (let j = 0; j < n; j++) { pos.push(pts[j].x * s, pts[j].y, pts[j].x * c); uv.push(u, vTopIsOne ? L[j] / tot : 1 - L[j] / tot); }
  }
  for (let i = 0; i < segs; i++) for (let j = 0; j < n - 1; j++) {
    const a = i * n + j, b = (i + 1) * n + j, c2 = (i + 1) * n + j + 1, d = i * n + j + 1;
    idx.push(a, b, d, b, c2, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}
function smoothProfile(pts, samples = 60) {
  const curve = new THREE.CatmullRomCurve3(pts.map(p => V3(p[0], p[1], 0)), false, 'centripetal');
  return curve.getPoints(samples).map(p => new THREE.Vector2(p.x, p.y));
}
function planarUV(geo, R) { // top-down projection uv for domes/lids: art bottom = +z (front)
  const p = geo.attributes.position, uv = [];
  for (let i = 0; i < p.count; i++) uv.push(.5 + p.getX(i) / (2 * R), .5 - p.getZ(i) / (2 * R));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
}

// ───────────────────────── contact shadow ─────────────────────────
function contactShadow(w, d, o = {}) {
  const N = 512, pad = o.pad ?? .35;
  const c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, N, N);
  const sx = N / (w * (1 + 2 * pad)), sz = N / (d * (1 + 2 * pad));
  g.filter = `blur(${o.blur ?? 18}px)`; g.fillStyle = '#fff';
  const ww = w * sx * (o.shrink ?? .96), dd = d * sz * (o.shrink ?? .96);
  g.beginPath();
  if (o.round) g.ellipse(N / 2, N / 2, ww / 2, dd / 2, 0, 0, 7);
  else g.roundRect(N / 2 - ww / 2, N / 2 - dd / 2, ww, dd, Math.min(ww, dd) * .08);
  g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace;
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(o.color || '#000'), alphaMap: t, transparent: true, depthWrite: false, opacity: o.opacity ?? .55, toneMapped: false });
  const geo = new THREE.PlaneGeometry(w * (1 + 2 * pad), d * (1 + 2 * pad)); geo.rotateX(-Math.PI / 2);
  const me = new THREE.Mesh(geo, m); me.position.y = .25; me.renderOrder = 1; return me;
}

// ───────────────────────── containers ─────────────────────────
const A = (name) => `${CFG.tex}/${name}.svg`;

async function buildPail(o) {
  const D = CFG.dims.pail, dr = o.dir;
  const g = new THREE.Group();
  const bw = D.base / 2, tw = D.top_w / 2, td = D.top_d / 2, h = D.h, rh = h + D.ridge;
  const metal = dr === 'royal';
  const mo = { metal, rough: metal ? .7 : .55 };
  const front = await printMat(A(`pail-${dr}-front`), D.top_w, D.slant_f, mo);
  const back = await printMat(A(`pail-${dr}-back`), D.top_w, D.slant_f, mo);
  const side = await printMat(A(`pail-${dr}-side`), D.top_d, D.slant_s, mo);
  const ff = await printMat(A(`pail-${dr}-flapfront`), D.top_w, D.flap, mo);
  const fb = await printMat(A(`pail-${dr}-flapback`), D.top_w, D.flap, mo);
  const gab = await printMat(A(`pail-${dr}-gable`), D.top_d, D.gable, mo);
  const i1 = (D.top_w - D.base) / 2 / D.top_w, i2 = (D.top_d - D.base) / 2 / D.top_d;
  const UVf = [[0, 0], [1, 0], [1 - i1, 1], [i1, 1]], UVs = [[0, 0], [1, 0], [1 - i2, 1], [i2, 1]];
  g.add(mesh(quadGeo([V3(-tw, h, td), V3(tw, h, td), V3(bw, 0, bw), V3(-bw, 0, bw)], UVf), front));
  g.add(mesh(quadGeo([V3(tw, h, -td), V3(-tw, h, -td), V3(-bw, 0, -bw), V3(bw, 0, -bw)], UVf), back));
  g.add(mesh(quadGeo([V3(tw, h, td), V3(tw, h, -td), V3(bw, 0, -bw), V3(bw, 0, bw)], UVs), side));
  g.add(mesh(quadGeo([V3(-tw, h, -td), V3(-tw, h, td), V3(-bw, 0, bw), V3(-bw, 0, -bw)], UVs), side));
  // flaps: art top = ridge
  const ins = 4 / D.top_w, rw = tw - 4;
  g.add(mesh(quadGeo([V3(-rw, rh + .4, .6), V3(rw, rh + .4, .6), V3(tw + .3, h, td + .3), V3(-tw - .3, h, td + .3)], [[ins, 0], [1 - ins, 0], [1, 1], [0, 1]]), ff));
  g.add(mesh(quadGeo([V3(rw, rh, -.6), V3(-rw, rh, -.6), V3(-tw - .2, h, -td - .2), V3(tw + .2, h, -td - .2)], [[ins, 0], [1 - ins, 0], [1, 1], [0, 1]]), fb));
  g.add(mesh(triGeo([V3(rw, rh - .5, 0), V3(tw, h, td), V3(tw, h, -td)], [[.5, 0], [0, 1], [1, 1]]), gab));
  g.add(mesh(triGeo([V3(-rw, rh - .5, 0), V3(-tw, h, -td), V3(-tw, h, td)], [[.5, 0], [0, 1], [1, 1]]), gab));
  // underside of flaps (visible at the open gable) dark
  const under = plainMat(dr === 'royal' ? '#120a1c' : '#efe6d6', { side: THREE.BackSide });
  g.add(mesh(quadGeo([V3(-rw, rh + .4, .6), V3(rw, rh + .4, .6), V3(tw, h, td), V3(-tw, h, td)], [[0, 0], [1, 0], [1, 1], [0, 1]]), under, false));
  // wire handle
  const wire = new THREE.MeshStandardMaterial({ color: '#C9CCD2', metalness: 1, roughness: .28, envMapIntensity: 1.2 });
  const ay = h - 12, H2 = o.handleUp === false ? null : 1;
  let pts;
  if (o.handleUp === false) { // handle folded down to the back
    pts = [V3(tw + 1.8, ay, 0), V3(tw + 9, ay + 4, -18), V3(tw * .7, ay + 10, -td - 22), V3(0, ay + 12, -td - 30), V3(-tw * .7, ay + 10, -td - 22), V3(-tw - 9, ay + 4, -18), V3(-tw - 1.8, ay, 0)];
  } else {
    pts = [V3(tw + 1.6, ay, 0), V3(tw + 7, ay + 22, 0), V3(tw * .92, ay + 62, 0), V3(tw * .5, ay + 88, 0), V3(0, ay + 96, 0), V3(-tw * .5, ay + 88, 0), V3(-tw * .92, ay + 62, 0), V3(-tw - 7, ay + 22, 0), V3(-tw - 1.6, ay, 0)];
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  g.add(mesh(new THREE.TubeGeometry(curve, 120, .85, 10, false), wire));
  for (const sx of [1, -1]) {
    const tor = new THREE.TorusGeometry(2.6, .8, 8, 24); const t = mesh(tor, wire);
    t.rotation.y = Math.PI / 2; t.position.set(sx * (tw - 1.2 + 1.2), ay, 0); t.rotation.z = .3; g.add(t);
  }
  g.add(contactShadow(D.base + 6, D.base + 6, { opacity: .55, blur: 14, color: o.shadowColor }));
  return g;
}

async function buildClam(o) {
  const D = CFG.dims.clam, dr = o.dir;
  const g = new THREE.Group();
  const kraft = dr === 'bazaar';
  const metal = dr === 'royal';
  const boxMat = (face, w, h, side = THREE.FrontSide) => printMat(A(`clam-${dr}-${face}`), w, h, { kraft, rough: kraft ? .88 : .72, side, grain: kraft ? .18 : .12, bump: kraft ? .6 : .3, metal: false });
  const lidTop = await boxMat('lidtop', D.lidL, D.lidD);
  const sideM = await boxMat('side', D.lidD, D.H);
  const frontM = await boxMat('front', D.L, D.H);
  const insideLid = await printMat(A(`clam-${dr}-inside_lid`), D.lidL, D.lidD, { rough: .7, grain: .1, side: THREE.FrontSide });
  const insideBase = await printMat(A(`clam-${dr}-inside_base`), D.Lb, D.Db, { rough: .8, grain: .1 });
  const innerWall = plainMat(kraft ? '#E9DDC6' : '#E6DCCB', { rough: .85, side: THREE.BackSide });
  const L2 = D.L / 2, Lb = D.Lb / 2, Db = D.Db / 2, H = D.H, s = D.seam;
  const lerp = (a, b, t) => a + (b - a) * t;
  const Ls = lerp(Lb, L2, s / H), Ds = lerp(Db, D.D / 2, s / H);
  const body = new THREE.Group();
  const U = [[0, 0], [1, 0], [1, 1], [0, 1]];
  // body walls (tapered) — art front face covers full height H; we map lower s/H part
  const vS = 1 - s / H; // art v at seam (top of body wall)
  const Uw = [[0, 1 - (s / H)], [1, 1 - s / H], [1, 1], [0, 1]];
  const UwF = [[(L2 - Ls) / (2 * L2), vS], [1 - (L2 - Ls) / (2 * L2), vS], [1 - (L2 - Lb) / (2 * L2), 1], [(L2 - Lb) / (2 * L2), 1]];
  body.add(mesh(quadGeo([V3(-Ls, s, Ds), V3(Ls, s, Ds), V3(Lb, 0, Db), V3(-Lb, 0, Db)], UwF), frontM));
  body.add(mesh(quadGeo([V3(Ls, s, -Ds), V3(-Ls, s, -Ds), V3(-Lb, 0, -Db), V3(Lb, 0, -Db)], UwF), frontM));
  const UwS = [[(D.lidD / 2 - Ds) / D.lidD, vS], [1 - (D.lidD / 2 - Ds) / D.lidD, vS], [1 - (D.lidD / 2 - Db) / D.lidD, 1], [(D.lidD / 2 - Db) / D.lidD, 1]];
  body.add(mesh(quadGeo([V3(Ls, s, Ds), V3(Ls, s, -Ds), V3(Lb, 0, -Db), V3(Lb, 0, Db)], UwS), sideM));
  body.add(mesh(quadGeo([V3(-Ls, s, -Ds), V3(-Ls, s, Ds), V3(-Lb, 0, Db), V3(-Lb, 0, -Db)], UwS), sideM));
  // inner walls
  for (const q of [[V3(-Ls, s, Ds), V3(Ls, s, Ds), V3(Lb, 0, Db), V3(-Lb, 0, Db)], [V3(Ls, s, -Ds), V3(-Ls, s, -Ds), V3(-Lb, 0, -Db), V3(Lb, 0, -Db)], [V3(Ls, s, Ds), V3(Ls, s, -Ds), V3(Lb, 0, -Db), V3(Lb, 0, Db)], [V3(-Ls, s, -Ds), V3(-Ls, s, Ds), V3(-Lb, 0, Db), V3(-Lb, 0, -Db)]])
    body.add(mesh(quadGeo(q, U), innerWall, false));
  const floor = mesh(new THREE.PlaneGeometry(D.Lb, D.Db), insideBase, false); floor.rotation.x = -Math.PI / 2; floor.position.y = .6; body.add(floor);
  // rim lip of body
  const lipM = plainMat(kraft ? '#A87A4F' : '#1d1328', { rough: .85, kraft });
  g.add(body);
  // lid group pivoting at back hinge (y=s, z=-Ds)
  const lid = new THREE.Group(); const lidL = D.lidL / 2, lidD = D.lidD / 2;
  const lidInner = new THREE.Group();
  const top = mesh(new THREE.PlaneGeometry(D.lidL, D.lidD), lidTop); top.rotation.x = -Math.PI / 2; top.position.y = H; lidInner.add(top);
  const topIn = mesh(new THREE.PlaneGeometry(D.lidL, D.lidD), insideLid, false); topIn.rotation.x = Math.PI / 2; topIn.position.y = H - .5; topIn.rotation.z = Math.PI; lidInner.add(topIn);
  // fix inside-lid orientation: when lid opens backwards, text must read upright to the viewer
  topIn.rotation.set(Math.PI / 2, 0, 0);
  const vL = 1 - (H - s) / H;
  const Ul = [[0, 0], [1, 0], [1, (H - s) / H], [0, (H - s) / H]];
  lidInner.add(mesh(quadGeo([V3(-lidL, H, lidD), V3(lidL, H, lidD), V3(lidL, s, lidD), V3(-lidL, s, lidD)], [[(lidL - L2) / D.lidL + 0, 0], [1, 0], [1, (H - s) / H], [0, (H - s) / H]]), frontM));
  lidInner.add(mesh(quadGeo([V3(lidL, H, -lidD), V3(-lidL, H, -lidD), V3(-lidL, s, -lidD), V3(lidL, s, -lidD)], Ul), frontM));
  lidInner.add(mesh(quadGeo([V3(lidL, H, lidD), V3(lidL, H, -lidD), V3(lidL, s, -lidD), V3(lidL, s, lidD)], Ul), sideM));
  lidInner.add(mesh(quadGeo([V3(-lidL, H, -lidD), V3(-lidL, H, lidD), V3(-lidL, s, lidD), V3(-lidL, s, -lidD)], Ul), sideM));
  for (const q of [[V3(-lidL, H, lidD), V3(lidL, H, lidD), V3(lidL, s, lidD), V3(-lidL, s, lidD)], [V3(lidL, H, -lidD), V3(-lidL, H, -lidD), V3(-lidL, s, -lidD), V3(lidL, s, -lidD)], [V3(lidL, H, lidD), V3(lidL, H, -lidD), V3(lidL, s, -lidD), V3(lidL, s, lidD)], [V3(-lidL, H, -lidD), V3(-lidL, H, lidD), V3(-lidL, s, lidD), V3(-lidL, s, -lidD)]])
    lidInner.add(mesh(quadGeo(q, U), innerWall, false));
  // front locking tab
  const tab = new THREE.Shape(); tab.moveTo(-22, 0); tab.lineTo(22, 0); tab.lineTo(18, -13); tab.quadraticCurveTo(0, -17, -18, -13); tab.lineTo(-22, 0);
  const tabG = new THREE.ShapeGeometry(tab, 12); const tabM = mesh(tabG, plainMat(kraft ? '#B48356' : '#1B1226', { rough: .85, kraft, side: THREE.DoubleSide }));
  tabM.position.set(0, s, lidD + .4); tabM.rotation.x = -.06; if (o.open || o.band === false) lidInner.add(tabM);
  const edgeM = plainMat(kraft ? '#D3AE82' : '#3a2c45', { rough: .9 });
  for (const [w, d, x, z] of [[D.lidL + 1, 1.1, 0, lidD], [D.lidL + 1, 1.1, 0, -lidD], [1.1, D.lidD, lidL, 0], [1.1, D.lidD, -lidL, 0]]) {
    const e = mesh(new THREE.BoxGeometry(w, 1.1, d), edgeM, false); e.position.set(x, H - .2, z); lidInner.add(e);
  }
  lidInner.position.set(0, -s, Ds); lid.add(lidInner); lid.position.set(0, s, -Ds);
  lid.rotation.x = -(o.open || 0) * Math.PI / 180;
  g.add(lid);
  // belly band (closed only)
  if (!o.open && o.band !== false) {
    const bw = D.band / 2, bt = H + .7, zf = lidD + .7, zb = Db + .6;
    const opt = { metal, rough: metal ? .72 : .5 };
    const bTop = await printMat(A(`clam-${dr}-bandtop`), D.band, D.lidD, opt);
    const bFront = await printMat(A(`clam-${dr}-bandfront`), D.band, D.band_front, opt);
    const bBack = await printMat(A(`clam-${dr}-bandback`), D.band, D.band_front, opt);
    const ox = o.bandX || 0;
    const bg = new THREE.Group();
    bg.add(mesh(quadGeo([V3(-bw, bt, -zf), V3(bw, bt, -zf), V3(bw, bt, zf), V3(-bw, bt, zf)], U), bTop));
    bg.add(mesh(quadGeo([V3(-bw, bt, zf), V3(bw, bt, zf), V3(bw, -.3, zb), V3(-bw, -.3, zb)], U), bFront));
    bg.add(mesh(quadGeo([V3(bw, bt, -zf), V3(-bw, bt, -zf), V3(-bw, -.3, -zb), V3(bw, -.3, -zb)], U), bBack));
    // band edges (thin) to give paper thickness
    bg.position.x = ox; g.add(bg);
  }
  g.add(contactShadow(D.Lb + 8, D.Db + 8, { opacity: .6, blur: 16, color: o.shadowColor }));
  return g;
}

async function buildTub(o) {
  const D = CFG.dims.tub, dr = o.dir;
  const g = new THREE.Group();
  const metal = dr === 'royal';
  const r = y => D.rb + (D.rt - D.rb) * y / D.h;
  // body: frosted PP with curry inside
  const curry = new THREE.MeshPhysicalMaterial({ color: o.fill || '#E6A574', roughness: .38, clearcoat: .8, clearcoatRoughness: .25, sheen: .3, envMapIntensity: .8 });
  const body = mesh(new THREE.CylinderGeometry(D.rt, D.rb, D.h, 128, 1, true), curry); body.position.y = D.h / 2; g.add(body);
  const bottom = mesh(new THREE.CircleGeometry(D.rb, 64), curry); bottom.rotation.x = Math.PI / 2; bottom.position.y = .3; g.add(bottom);
  const rim = mesh(new THREE.TorusGeometry(D.rt + .8, 1.6, 12, 128), new THREE.MeshPhysicalMaterial({ color: '#F1ECE3', roughness: .3, clearcoat: 1, transmission: 0 }));
  rim.rotation.x = Math.PI / 2; rim.position.y = D.h - .5; g.add(rim);
  // lid
  const lidMat = new THREE.MeshPhysicalMaterial({ color: '#F4F0E8', roughness: .28, clearcoat: 1, clearcoatRoughness: .15, envMapIntensity: 1 });
  const lp = [V3(D.rt - 1, D.h - 2, 0), V3(D.lid_r, D.h - 1.5, 0), V3(D.lid_r + .6, D.h + 3, 0), V3(D.lid_r, D.h + D.lid_h - 1, 0), V3(D.lid_r - 2, D.h + D.lid_h, 0), V3(D.lid_r - 5, D.h + D.lid_h - .2, 0), V3(D.lid_r - 6.5, D.h + D.lid_h - 1.6, 0), V3(D.lid_r - 8, D.h + D.lid_h - 1.8, 0), V3(0, D.h + D.lid_h - 1.8, 0)];
  const lidG = new THREE.LatheGeometry(lp.map(p => new THREE.Vector2(p.x, p.y)), 128);
  g.add(mesh(lidG, lidMat));
  // lid label
  const lab = await printMat(A(`tub-${dr}-lid`), D.label, D.label, { metal, rough: metal ? .7 : .45, transparent: true, alphaTest: .5 });
  const lg = new THREE.CircleGeometry(D.label / 2, 128); planarUV(lg.rotateX(-Math.PI / 2), D.label / 2);
  const lm = mesh(lg, lab); lm.position.y = D.h + D.lid_h - 1.7; g.add(lm);
  // sleeve
  const sl = await printMat(A(`tub-${dr}-side`), CFG.dims.tub.sleeve_rect_w, CFG.dims.tub.sleeve_slant, { metal, rough: metal ? .72 : .5 });
  const sg = new THREE.CylinderGeometry(r(D.s1) + .7, r(D.s0) + .7, D.s1 - D.s0, 160, 1, true, Math.PI, Math.PI * 2);
  const sm = mesh(sg, sl); sm.position.y = (D.s0 + D.s1) / 2; g.add(sm);
  g.add(contactShadow(D.rb * 2 + 6, D.rb * 2 + 6, { round: true, opacity: .55, blur: 14, color: o.shadowColor }));
  return g;
}

async function buildHandi(o) {
  const D = CFG.dims.handi, dr = o.dir;
  const g = new THREE.Group();
  const metal = dr === 'royal';
  const mo = { metal, rough: metal ? .72 : .5 };
  const bodyM = await printMat(A(`handi-${dr}-side`), D.body_w, D.body_len, { ...mo, maxPx: 4096 });
  const prof = smoothProfile(D.prof.slice(1), 80);
  const body = mesh(latheGeo(prof, 200), bodyM); g.add(body);
  const base = mesh(new THREE.CircleGeometry(D.prof[1][0], 64), plainMat(dr === 'royal' ? '#140b20' : '#1D1147')); base.rotation.x = Math.PI / 2; base.position.y = .2; g.add(base);
  // rim band (lid skirt)
  const bandM = await printMat(A(`handi-${dr}-band`), D.band_w, D.band_h, mo);
  const bg = new THREE.CylinderGeometry(D.band_r, D.band_r + .3, D.band_h, 200, 1, true, Math.PI, Math.PI * 2);
  const bm = mesh(bg, bandM); bm.position.y = D.band_y0 + D.band_h / 2; g.add(bm);
  const lipMat = metal ? new THREE.MeshStandardMaterial({ color: '#D9A04A', metalness: 1, roughness: .3 }) : plainMat('#1D1147', { rough: .5 });
  const lip = mesh(new THREE.TorusGeometry(D.band_r, 1.3, 10, 160), lipMat); lip.rotation.x = Math.PI / 2; lip.position.y = D.band_y0 + D.band_h; g.add(lip);
  const lip2 = mesh(new THREE.TorusGeometry(D.band_r + .2, .9, 10, 160), lipMat); lip2.rotation.x = Math.PI / 2; lip2.position.y = D.band_y0; g.add(lip2);
  // dome
  const R = D.dome_d / 2, y0 = D.dome_y0 + 1.2, dh = D.dome_h;
  const dp = [];
  for (let i = 0; i <= 48; i++) { const t = i / 48; const a = t * Math.PI / 2; dp.push(new THREE.Vector2((D.band_r + .2) * Math.cos(a) ** .82, y0 + dh * Math.sin(a) ** 1.15)); }
  dp[dp.length - 1].x = 0;
  const domeG = new THREE.LatheGeometry(dp.reverse(), 200); planarUV(domeG, R);
  domeG.index && domeG.computeVertexNormals();
  const domeM = await printMat(A(`handi-${dr}-lid`), D.dome_d, D.dome_d, mo);
  domeM.side = THREE.DoubleSide;
  g.add(mesh(domeG, domeM));
  // knob
  const kp = [[0, 0], [6, 0], [9.5, 2.5], [10.5, 6], [8, 9.5], [4, 11], [5.5, 12.5], [3, 14.5], [0, 15]].map(p => new THREE.Vector2(p[0], p[1]));
  const knobM = metal ? new THREE.MeshStandardMaterial({ color: '#E2A94B', metalness: 1, roughness: .25 }) : new THREE.MeshPhysicalMaterial({ color: '#E4147E', roughness: .35, clearcoat: .8 });
  const knob = mesh(new THREE.LatheGeometry(kp, 64), knobM); knob.position.y = y0 + dh - 1; g.add(knob);
  if (!metal) { const ring = mesh(new THREE.TorusGeometry(9.6, 1.1, 8, 48), plainMat('#1D1147', { rough: .4 })); ring.rotation.x = Math.PI / 2; ring.position.y = y0 + dh + .4; g.add(ring); }
  g.add(contactShadow(D.prof[1][0] * 2 + 30, D.prof[1][0] * 2 + 30, { round: true, opacity: .5, blur: 16, color: o.shadowColor }));
  return g;
}

async function buildTray(o) {
  const D = CFG.dims.tray, dr = o.dir;
  const g = new THREE.Group();
  const metal = dr === 'royal';
  const mo = { metal, rough: metal ? .72 : .5 };
  const lidM = await printMat(A(`tray-${dr}-lid`), D.L, D.D, mo);
  const frontM = await printMat(A(`tray-${dr}-front`), D.L, D.H, mo);
  const backM = await printMat(A(`tray-${dr}-back`), D.L, D.H, mo);
  const endM = await printMat(A(`tray-${dr}-side`), D.tD, D.tH, mo);
  const wallM = await printMat(A(`tray-${dr}-traywall`), D.tL, D.tH, mo);
  const floorM = await printMat(A(`tray-${dr}-trayfloor`), D.tL, D.tD, { rough: .85 });
  const inner = plainMat(dr === 'royal' ? '#EFE6D6' : '#F6EEDD', { rough: .85 });
  const edge = plainMat(dr === 'royal' ? '#2a2033' : '#E9DCC4', { rough: .9 });
  const t = 1.2, L = D.L, H = D.H, Dd = D.D;
  const sleeve = new THREE.Group();
  const box = (w, h, d, mats) => mesh(new THREE.BoxGeometry(w, h, d), mats);
  // materials order: px nx py ny pz nz
  const topW = box(L, t, Dd, [edge, edge, lidM, inner, edge, edge]); topW.position.y = H - t / 2; sleeve.add(topW);
  const botW = box(L, t, Dd, [edge, edge, inner, plainMat(dr === 'royal' ? '#160B26' : '#FF6A13'), edge, edge]); botW.position.y = t / 2; sleeve.add(botW);
  const fW = box(L, H - 2 * t, t, [edge, edge, edge, edge, frontM, inner]); fW.position.set(0, H / 2, Dd / 2 - t / 2); sleeve.add(fW);
  const bW = box(L, H - 2 * t, t, [edge, edge, edge, edge, inner, backM]); bW.position.set(0, H / 2, -Dd / 2 + t / 2); sleeve.add(bW);
  // front face uv for frontM spans full H though the box is H-2t: fine.
  g.add(sleeve);
  // tray (drawer)
  const tr = new THREE.Group(); const tL = D.tL, tD = D.tD, tH = D.tH, tt = 1.0;
  const fl = box(tL, tt, tD, [edge, edge, floorM, inner, edge, edge]); fl.position.y = tt / 2; tr.add(fl);
  const w1 = box(tL, tH, tt, [edge, edge, edge, edge, wallM, inner]); w1.position.set(0, tH / 2, tD / 2 - tt / 2); tr.add(w1);
  const w2 = box(tL, tH, tt, [edge, edge, edge, edge, inner, wallM]); w2.position.set(0, tH / 2, -tD / 2 + tt / 2); tr.add(w2);
  const e1 = box(tt, tH, tD, [endM, inner, edge, edge, edge, edge]); e1.position.set(tL / 2 - tt / 2, tH / 2, 0); tr.add(e1);
  const e2 = box(tt, tH, tD, [inner, endM, edge, edge, edge, edge]); e2.position.set(-tL / 2 + tt / 2, tH / 2, 0); tr.add(e2);
  const dv = box(tt, tH * .82, tD - 2 * tt, [inner, inner, edge, edge, edge, edge]); dv.position.set(tL * .5 - tL * .36, tH * .41, 0); tr.add(dv);
  // food
  if (o.food) {
    for (const f of o.food) {
      const m = await printMat(`${CFG.tex}/${f.tex}.svg`, f.w, f.d, { rough: f.rough ?? .5, grain: .04, transparent: true, alphaTest: .4, bump: .1 });
      const p = new THREE.PlaneGeometry(f.w, f.d); p.rotateX(-Math.PI / 2);
      const pm = mesh(p, m, false, true); pm.position.set(f.x, f.y, f.z || 0); tr.add(pm);
    }
  }
  // pull ribbon
  if (o.ribbon !== false) {
    const rib = new THREE.Shape(); rib.moveTo(-6, 0); rib.lineTo(6, 0); rib.lineTo(6, -16); rib.lineTo(0, -12); rib.lineTo(-6, -16); rib.lineTo(-6, 0);
    const rm = mesh(new THREE.ShapeGeometry(rib), new THREE.MeshStandardMaterial({ color: metal ? '#E2A94B' : '#E4147E', metalness: metal ? 1 : 0, roughness: metal ? .3 : .5, side: THREE.DoubleSide }));
    rm.position.set(tL / 2 + .6, tH * .55, 0); rm.rotation.y = Math.PI / 2; rm.rotation.x = 0; tr.add(rm);
  }
  tr.position.set(o.pull || 0, t + .2, 0);
  g.add(tr);
  g.add(contactShadow(L + 6 + (o.pull || 0), Dd + 6, { opacity: .6, blur: 16, color: o.shadowColor }));
  g.children[g.children.length - 1].position.x = (o.pull || 0) / 2;
  return g;
}

// generic flat textured plane lying on the floor (props, cutlery sleeve, food)
async function buildDecal(o) {
  const m = await printMat(`${CFG.tex}/${o.tex}.svg`, o.w, o.d, { rough: o.rough ?? .6, grain: o.grain ?? .05, transparent: true, alphaTest: .02, bump: .15, metal: !!o.metal, ppm: o.ppm });
  m.depthWrite = o.depthWrite ?? true;
  const p = new THREE.PlaneGeometry(o.w, o.d); p.rotateX(-Math.PI / 2);
  const me = mesh(p, m, !!o.cast, true); me.position.y = o.y ?? .4; me.renderOrder = o.renderOrder ?? 2;
  return me;
}
// upright billboard (illustrations peeking out of boxes)
async function buildBillboard(o) {
  const img = await loadImg(o.url);
  const W = o.w, Hh = o.w * img.height / img.width;
  const c = document.createElement('canvas'); const s = Math.min(4096 / img.width, o.ppm || 6) ; c.width = Math.round(o.w * (o.ppm || 6)); c.height = Math.round(Hh * (o.ppm || 6));
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: .05, side: THREE.DoubleSide, toneMapped: false });
  const me = new THREE.Mesh(new THREE.PlaneGeometry(W, Hh), m); me.position.y = Hh / 2;
  const grp = new THREE.Group(); grp.add(me); return grp;
}

// 3D props: chili, lime, marigold
function buildChili(o) {
  const g = new THREE.Group(); const L = o.len || 70, R0 = o.r || 5.5, bend = o.bend ?? 1;
  const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push(V3(t * L, 0, Math.sin(t * Math.PI * .9) * L * .13 * bend + t * t * L * .1 * bend)); }
  const curve = new THREE.CatmullRomCurve3(pts);
  const TS = 120, RS = 18;
  const geo = new THREE.TubeGeometry(curve, TS, 1, RS, false);
  const pos = geo.attributes.position; const tmp = V3(0, 0, 0);
  for (let i = 0; i < pos.count; i++) {
    const seg = Math.floor(i / (RS + 1)); const t = seg / TS;
    const c = curve.getPointAt(t); tmp.set(pos.getX(i), pos.getY(i), pos.getZ(i)).sub(c);
    let rr = t < .08 ? R0 * (.55 + .45 * Math.sin(t / .08 * Math.PI / 2)) : R0 * Math.pow(Math.max(0, 1 - (t - .08) / .92), .55);
    rr = Math.max(rr, .35);
    tmp.multiplyScalar(rr); tmp.y *= .92; pos.setXYZ(i, c.x + tmp.x, c.y + tmp.y, c.z + tmp.z);
  }
  geo.computeVertexNormals();
  g.add(mesh(geo, new THREE.MeshPhysicalMaterial({ color: o.color || '#C8102E', roughness: .2, clearcoat: 1, clearcoatRoughness: .08 })));
  const calyx = new THREE.SphereGeometry(R0 * 1.05, 20, 12); calyx.scale(.55, 1, 1);
  const cm = mesh(calyx, new THREE.MeshStandardMaterial({ color: '#4E8B2B', roughness: .5 })); cm.position.copy(curve.getPointAt(0)).add(V3(-.5, 0, 0)); g.add(cm);
  const sc = new THREE.CatmullRomCurve3([V3(-1, 0, 0), V3(-6, .6, -1), V3(-11, 1.8, 1.5), V3(-14, 3.2, 4)]);
  const st = mesh(new THREE.TubeGeometry(sc, 20, 1.05, 8, false), new THREE.MeshStandardMaterial({ color: '#5C9A33', roughness: .55 }));
  st.position.copy(curve.getPointAt(0)); g.add(st);
  g.position.y = R0 * .9;
  const outer = new THREE.Group(); outer.add(g); return outer;
}
async function buildLime(o) {
  const g = new THREE.Group(); const R = o.r || 24;
  const peel = new THREE.MeshPhysicalMaterial({ color: '#6FA82B', roughness: .45, clearcoat: .6, clearcoatRoughness: .3 });
  const half = mesh(new THREE.SphereGeometry(R, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), peel); half.rotation.x = Math.PI; half.position.y = R * .98; g.add(half);
  const capM = await printMat(`${CFG.tex}/prop-lime-cut.svg`, 2 * R, 2 * R, { rough: .25, grain: .03 });
  const cg = new THREE.CircleGeometry(R, 64); planarUV(cg.rotateX(-Math.PI / 2), R);
  const cap = mesh(cg, capM); cap.position.y = R * .98 + .05; g.add(cap);
  if (o.tilt) { g.rotation.x = o.tilt; }
  return g;
}
function buildMarigold(o) {
  const g = new THREE.Group(); const R = o.r || 22;
  const cols = o.colors || ['#FF7A00', '#FF8A00', '#F26500', '#FF9E00'];
  const petal = new THREE.SphereGeometry(1, 10, 6); petal.scale(R * .22, R * .05, R * .16);
  let s = (o.seed || 3) * 1000 + 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const mats = cols.map(c => new THREE.MeshStandardMaterial({ color: c, roughness: .5, envMapIntensity: .5, side: THREE.DoubleSide }));
  const N = o.n || 420;
  for (let i = 0; i < N; i++) {
    const u = rnd(), th = rnd() * Math.PI * 2;
    const phi = Math.acos(1 - u * 1.15); // dome-biased
    const rr = R * (.82 + rnd() * .2);
    const p = V3(Math.sin(phi) * Math.cos(th) * rr, Math.cos(phi) * rr * .78, Math.sin(phi) * Math.sin(th) * rr);
    const m = new THREE.Mesh(petal, mats[Math.floor(rnd() * mats.length)]);
    m.position.copy(p); m.lookAt(p.clone().multiplyScalar(2)); m.rotateX(Math.PI / 2 + (rnd() - .5) * .9); m.rotateZ((rnd() - .5) * 1.4);
    m.castShadow = true; m.receiveShadow = true; g.add(m);
  }
  const core = mesh(new THREE.SphereGeometry(R * .8, 24, 16), new THREE.MeshStandardMaterial({ color: '#B84400', roughness: .8 })); core.scale.y = .72; g.add(core);
  g.position.y = R * .25;
  return g;
}


// studio sweep (floor curving into a back wall) — avoids a horizon line
function sweepGeo(back = 900, R = 700, W = 9000, front = 6000, top = 6000) {
  const prof = [];
  prof.push([front, 0]);
  for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI / 2; prof.push([-back - Math.sin(a) * R, R - Math.cos(a) * R]); }
  prof.push([-back - R, top]);
  const L = [0]; for (let i = 1; i < prof.length; i++) L.push(L[i - 1] + Math.hypot(prof[i][0] - prof[i - 1][0], prof[i][1] - prof[i - 1][1]));
  const pos = [], uv = [], idx = [];
  for (let i = 0; i < prof.length; i++) for (const x of [-W / 2, W / 2]) { pos.push(x, prof[i][1], prof[i][0]); uv.push(x / 1000, L[i] / 1000); }
  for (let i = 0; i < prof.length - 1; i++) { const a = i * 2, b = a + 1, c = a + 2, d = a + 3; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}

function buildCutlery(o) {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: '#E2C38E', roughness: .62 });
  const woodB = bumpTex(2, 2); wood.bumpMap = woodB; wood.bumpScale = .3;
  const spoon = new THREE.Shape();
  spoon.moveTo(-3.2, 0); spoon.lineTo(-2.4, 52); spoon.bezierCurveTo(-2.4, 58, -15, 60, -15, 78); spoon.bezierCurveTo(-15, 96, -6, 103, 0, 103);
  spoon.bezierCurveTo(6, 103, 15, 96, 15, 78); spoon.bezierCurveTo(15, 60, 2.4, 58, 2.4, 52); spoon.lineTo(3.2, 0); spoon.lineTo(-3.2, 0);
  const fork = new THREE.Shape();
  fork.moveTo(-3.2, 0); fork.lineTo(-2.6, 50); fork.bezierCurveTo(-3, 58, -12, 62, -12, 72); fork.lineTo(-12, 102);
  const tw = 24 / 4;
  for (let i = 0; i < 4; i++) { const x0 = -12 + i * tw; fork.lineTo(x0 + tw * .7, 102); fork.lineTo(x0 + tw * .7, 78); fork.lineTo(x0 + tw, 78); }
  fork.lineTo(12, 102); fork.lineTo(12, 72); fork.bezierCurveTo(12, 62, 3, 58, 2.6, 50); fork.lineTo(3.2, 0); fork.lineTo(-3.2, 0);
  const ex = { depth: 1.6, bevelEnabled: true, bevelThickness: .5, bevelSize: .5, bevelSegments: 2, curveSegments: 24 };
  const sp = mesh(new THREE.ExtrudeGeometry(spoon, ex), wood); sp.rotation.x = -Math.PI / 2; sp.position.set(-12, 1.6, 40); sp.rotation.z = .06;
  const fk = mesh(new THREE.ExtrudeGeometry(fork, ex), wood); fk.rotation.x = -Math.PI / 2; fk.position.set(12, 3.4, 44); fk.rotation.z = -.05;
  g.add(sp, fk);
  return g;
}
async function buildCutleryKit(o) {
  const g = new THREE.Group();
  const top = await printMat(`${CFG.tex}/prop-cutlery-${o.dir}.svg`, 58, 190, { rough: .6, metal: o.dir === 'royal' });
  const paper = plainMat(o.dir === 'royal' ? '#160B26' : '#FF6A13', { rough: .7 });
  const sl = mesh(new THREE.BoxGeometry(58, 5, 190), [paper, paper, top, paper, paper, paper]); sl.position.y = 2.5; g.add(sl);
  const c = buildCutlery(o); c.position.z = -130; g.add(c);
  g.add(contactShadow(60, 190, { opacity: .45, blur: 10, color: o.shadowColor }));
  return g;
}
function buildPetals(o) {
  const g = new THREE.Group(); let s = (o.seed || 5) * 7919; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const cols = o.colors || ['#FF7A00', '#FF8A00', '#F26500', '#FF9E00'];
  const mats = cols.map(c => new THREE.MeshStandardMaterial({ color: c, roughness: .5, envMapIntensity: .5, side: THREE.DoubleSide }));
  const pg = new THREE.SphereGeometry(1, 12, 6); pg.scale(7.5, 1.0, 5.2);
  for (let i = 0; i < (o.n || 30); i++) {
    const m = new THREE.Mesh(pg, mats[Math.floor(rnd() * mats.length)]);
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * (o.r || 120);
    m.position.set(Math.cos(a) * r * (o.sx || 1), 1.1, Math.sin(a) * r * (o.sz || 1)); m.rotation.y = rnd() * 6.28; m.rotation.x = (rnd() - .5) * .5;
    m.castShadow = true; m.receiveShadow = true; g.add(m);
  }
  return g;
}

// ───────────────────────── scene ─────────────────────────
function floorTex(color, o = {}) {
  const N = 1024; const c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d');
  g.fillStyle = color; g.fillRect(0, 0, N, N);
  // mottling
  let s = 5; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  g.globalAlpha = o.mottle ?? .025;
  for (let i = 0; i < 180; i++) { g.fillStyle = rnd() > .5 ? '#fff' : '#000'; g.filter = 'blur(40px)'; g.beginPath(); g.arc(rnd() * N, rnd() * N, 40 + rnd() * 140, 0, 7); g.fill(); }
  g.filter = 'none'; g.globalAlpha = o.grain ?? .07; g.globalCompositeOperation = 'overlay';
  g.fillStyle = g.createPattern(NOISE, 'repeat'); g.fillRect(0, 0, N, N);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(o.rep || 3, o.rep || 3); return t;
}

export async function render(cfg) {
  CFG = cfg; NOISE = noiseCanvas(256, .9); FIBRE = fibreCanvas();
  const W = cfg.w, H = cfg.h, dpr = cfg.dpr || 2;
  const canvas = document.getElementById('gl');
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.setPixelRatio(dpr); r.setSize(W, H, false);
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = cfg.exposure ?? 1.0;
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.VSMShadowMap;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = cfg.envI ?? .55;
  // floor
  const fm = new THREE.MeshStandardMaterial({ color: '#ffffff', map: floorTex(cfg.surface, cfg.floor || {}), roughness: .95, envMapIntensity: .35 });
  let floor;
  if (cfg.sweep) { floor = new THREE.Mesh(sweepGeo(cfg.sweep.back ?? 900, cfg.sweep.R ?? 700), fm); floor.rotation.y = (cfg.sweep.rot || 0) * Math.PI / 180; }
  else { floor = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), fm); floor.rotation.x = -Math.PI / 2; }
  floor.receiveShadow = true; scene.add(floor);
  // lights
  const key = new THREE.DirectionalLight(cfg.keyColor || '#fff6ea', cfg.keyI ?? 2.6);
  const kp = cfg.key || [-600, 900, 500]; key.position.set(...kp); key.target.position.set(...(cfg.target || [0, 0, 0]));
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  const sc = cfg.shadowBox || 420; Object.assign(key.shadow.camera, { left: -sc, right: sc, top: sc, bottom: -sc, near: 10, far: 4000 });
  key.shadow.radius = cfg.shadowRadius ?? 14; key.shadow.blurSamples = 20; key.shadow.bias = -0.0004;
  scene.add(key, key.target);
  const fill = new THREE.HemisphereLight('#fffaf2', cfg.bounce || '#7a6a60', cfg.fillI ?? .55); scene.add(fill);
  if (cfg.rim) { const rim = new THREE.DirectionalLight('#ffffff', cfg.rim.i || .8); rim.position.set(...cfg.rim.p); scene.add(rim); }
  // objects
  for (const o of cfg.objects) {
    let obj;
    const so = { ...o, shadowColor: o.shadowColor || cfg.shadowColor };
    if (o.type === 'pail') obj = await buildPail(so);
    else if (o.type === 'clam') obj = await buildClam(so);
    else if (o.type === 'tub') obj = await buildTub(so);
    else if (o.type === 'handi') obj = await buildHandi(so);
    else if (o.type === 'tray') obj = await buildTray(so);
    else if (o.type === 'decal') obj = await buildDecal(so);
    else if (o.type === 'billboard') obj = await buildBillboard(so);
    else if (o.type === 'chili') obj = buildChili(so);
    else if (o.type === 'lime') obj = await buildLime(so);
    else if (o.type === 'marigold') obj = buildMarigold(so);
    else if (o.type === 'cutlery') obj = await buildCutleryKit(so);
    else if (o.type === 'petals') obj = buildPetals(so);
    else continue;
    if (o.pos) obj.position.add(V3(...o.pos));
    if (o.rotY) obj.rotation.y = o.rotY * Math.PI / 180;
    if (o.rotX) obj.rotation.x = o.rotX * Math.PI / 180;
    if (o.rotZ) obj.rotation.z = o.rotZ * Math.PI / 180;
    if (o.scale) obj.scale.setScalar(o.scale);
    if (o.lookCam) obj.lookAt(V3(cfg.cam[0], obj.position.y, cfg.cam[2]));
    scene.add(obj);
  }
  // camera
  let cam;
  if (cfg.ortho) {
    const hw = cfg.ortho / 2, hh = hw * H / W;
    cam = new THREE.OrthographicCamera(-hw, hw, hh, -hh, 1, 10000);
  } else cam = new THREE.PerspectiveCamera(cfg.fov || 22, W / H, 5, 20000);
  cam.position.set(...cfg.cam); if (cfg.up) cam.up.set(...cfg.up); cam.lookAt(V3(...(cfg.target || [0, 0, 0])));
  r.render(scene, cam);
  document.body.insertAdjacentHTML('beforeend', '<i id="done"></i>');
}

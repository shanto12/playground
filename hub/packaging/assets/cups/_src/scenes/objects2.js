// Lassi cup, sauce cups, foil party tray, District Lunchbox, box-lunch carton (units mm)
import { THREE, tex, frustumGeo, lathe, discGeo, mat, add } from './common.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const clearMat = (o = {}) => new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .05, metalness: 0, transparent: true, opacity: .2, clearcoat: 1, clearcoatRoughness: .05, side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 1.8, ...o });
function stripeTex(a, b, n = 10) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 512; const g = c.getContext('2d');
  g.fillStyle = a; g.fillRect(0, 0, 64, 512); g.strokeStyle = b; g.lineWidth = 22;
  for (let i = -n; i < n * 2; i++) { g.beginPath(); g.moveTo(0, i * 512 / n); g.lineTo(64, i * 512 / n + 40); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ── LASSI ── */
export const LASSI = { Rtop: 49, Rbot: 30, h: 120 };
export async function lassiCup(parent, dir, { pos = [0, 0, 0], rotY = 0, flavour = 'mango', flagRot = 0 } = {}) {
  const g = new THREE.Group(); g.position.set(...pos); g.rotation.y = rotY; parent.add(g);
  const [tb, tf] = await Promise.all([tex(`lassi-band-${dir}`), tex(`flag-${dir}`)]);
  const L = LASSI, h = L.h, R = t => L.Rtop + (L.Rbot - L.Rtop) * t;
  const col = flavour === 'mango' ? 0xF2A31C : 0xF4EEDD;
  add(g, frustumGeo({ Rtop: L.Rtop - .9, Rbot: L.Rbot - .9, h, t0: .12, t1: 1 }), mat({ color: col, roughness: .45, emissive: flavour === 'mango' ? 0x3a1600 : 0x1a1610 }));
  add(g, discGeo(R(.12) - .9, 100), mat({ color: flavour === 'mango' ? 0xF7C25A : 0xFBF7EC, roughness: .6 }), { pos: [0, h * .88, 0] });
  add(g, frustumGeo({ ...L }), clearMat(), { cast: false });
  const band = add(g, frustumGeo({ Rtop: R(.3) + .4, Rbot: R(.78) + .4, h: h * .48 }), mat({ map: tb, roughness: .5 }), { pos: [0, h * .22, 0] });
  add(g, new THREE.TorusGeometry(L.Rtop + .6, 1.3, 12, 160).rotateX(Math.PI / 2), clearMat({ opacity: .45 }), { pos: [0, h, 0], cast: false });
  // dome lid
  const Rs = (50 * 50 + 30 * 30) / 60, th = Math.asin(50 / Rs);
  add(g, new THREE.SphereGeometry(Rs, 96, 32, 0, Math.PI * 2, 0, th), clearMat({ opacity: .16 }), { pos: [0, h + 30 - Rs + 1.5, 0], cast: false });
  add(g, new THREE.TorusGeometry(L.Rtop + 1.6, 1.8, 12, 160).rotateX(Math.PI / 2), clearMat({ opacity: .4 }), { pos: [0, h + 1.2, 0], cast: false });
  // straw + flag
  const sg = new THREE.Group(); sg.position.set(10, 0, 6); sg.rotation.z = -.07; sg.rotation.x = -.03; g.add(sg);
  add(sg, new THREE.CylinderGeometry(3.3, 3.3, 235, 24, 1, true), mat({ map: dir === 'bazaar' ? stripeTex('#FFF4DC', '#E4147E') : stripeTex('#FBF3E4', '#B7791F'), roughness: .6, side: THREE.DoubleSide }), { pos: [0, 128, 0] });
  const fw = 34, fh = 20, W = 72;
  const plane = (u0, u1) => { const p = new THREE.PlaneGeometry(fw, fh); const uv = p.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, u0 + uv.getX(i) * (u1 - u0)); return p; };
  const fg = new THREE.Group(); fg.position.set(0, 222, 0); fg.rotation.y = flagRot; sg.add(fg);
  const fm = mat({ map: tf, transparent: true, alphaTest: .5, roughness: .55 });
  add(fg, plane(38 / W, 1), fm, { pos: [fw / 2 + 3, 0, .3] });
  add(fg, plane(0, 34 / W), fm, { pos: [fw / 2 + 3, 0, -.3], rot: [0, Math.PI, 0] });
  return { group: g };
}

/* ── SAUCE CUPS ── */
const SAUCE_FILL = { mint: 0x4E8F3A, tamarind: 0x5A2414, raita: 0xF2EEDF, gravy: 0xC8501E, blank: 0xB8862A };
export async function sauceCup(parent, dir, kind, { pos = [0, 0, 0], rotY = 0, size = '4oz' } = {}) {
  const g = new THREE.Group(); g.position.set(...pos); g.rotation.y = rotY; parent.add(g);
  const S = size === '4oz' ? { Rtop: 37, Rbot: 27, h: 42, D: 57.15 } : { Rtop: 31, Rbot: 23, h: 34, D: 44.45 };
  const t = await tex(`sticker-${dir}-${kind}`);
  add(g, frustumGeo({ Rtop: S.Rtop - 1.2, Rbot: S.Rbot - 1.2, h: S.h, t0: .15, t1: 1 }), mat({ color: SAUCE_FILL[kind], roughness: .35 }));
  add(g, frustumGeo({ Rtop: S.Rtop, Rbot: S.Rbot, h: S.h }), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .35, transparent: true, opacity: .42, side: THREE.DoubleSide, depthWrite: false }), { cast: true });
  add(g, lathe([[S.Rtop + 1.6, S.h - 3], [S.Rtop + 2, S.h + 1.2], [S.Rtop + 1, S.h + 2.4], [S.Rtop - 2, S.h + 2.2], [0, S.h + 2.2]], 96), new THREE.MeshPhysicalMaterial({ color: 0xf8f8f6, roughness: .3, transparent: true, opacity: .8, side: THREE.DoubleSide }));
  add(g, discGeo(S.D * .455, S.D), mat({ map: t, transparent: true, alphaTest: .4, roughness: .45 }), { pos: [0, S.h + 2.35, 0] });
  return g;
}

/* ── FOIL HALF-PAN + BOARD LID + LABEL ── */
function rrLoop(w, d, r, n = 18) {
  const pts = [], c = [[w / 2 - r, d / 2 - r, 0], [-w / 2 + r, d / 2 - r, Math.PI / 2], [-w / 2 + r, -d / 2 + r, Math.PI], [w / 2 - r, -d / 2 + r, Math.PI * 1.5]];
  for (const [cx, cz, a0] of c) for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI / 2; pts.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); }
  return pts;
}
function rrShape(w, d, r) { const s = new THREE.Shape(); rrLoop(w, d, r).forEach(([x, z], i) => i ? s.lineTo(x, -z) : s.moveTo(x, -z)); s.closePath(); return s; }
let pleatTex;
function pleats() {
  if (pleatTex) return pleatTex;
  const c = document.createElement('canvas'); c.width = 2048; c.height = 64; const g = c.getContext('2d');
  for (let x = 0; x < 2048; x++) { const v = 128 + 70 * Math.sin(x / 2048 * Math.PI * 2 * 160) + 30 * Math.sin(x * .37) * Math.random(); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, 0, 1, 64); }
  pleatTex = new THREE.CanvasTexture(c); return pleatTex;
}
export const PAN = { top: [300, 240], base: [262, 202], flange: [324, 264], h: 64 };
export async function foilPan(parent, { pos = [0, 0, 0], rotY = 0, food, lid, label } = {}) {
  const g = new THREE.Group(); g.position.set(...pos); g.rotation.y = rotY; parent.add(g);
  const foil = new THREE.MeshStandardMaterial({ color: 0xdcdde0, metalness: 1, roughness: .3, bumpMap: pleats(), bumpScale: 1.2, side: THREE.DoubleSide });
  const P = PAN, b = rrLoop(...P.base, 22), t = rrLoop(...P.top, 28), n = b.length;
  const pos3 = [], uv = [], idx = [];
  for (let i = 0; i <= n; i++) { const k = i % n; pos3.push(b[k][0], 1, b[k][1], t[k][0], P.h, t[k][1]); uv.push(i / n, 0, i / n, 1); }
  for (let i = 0; i < n; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(pos3, 3)); wg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); wg.setIndex(idx); wg.computeVertexNormals();
  add(g, wg, foil);
  add(g, new THREE.ShapeGeometry(rrShape(...P.base, 22)).rotateX(-Math.PI / 2), foil, { pos: [0, 1, 0] });
  const fl = rrShape(...P.flange, 32); fl.holes.push(new THREE.Path(rrLoop(...P.top, 28).map(([x, z]) => new THREE.Vector2(x, -z))));
  add(g, new THREE.ExtrudeGeometry(fl, { depth: 2.2, bevelEnabled: true, bevelSize: 1.2, bevelThickness: 1, bevelSegments: 3 }).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xe2e3e6, metalness: 1, roughness: .26 }), { pos: [0, P.h - 1.5, 0] });
  if (food) {
    const ft = await tex(food); const fgeo = new THREE.ShapeGeometry(rrShape(P.top[0] - 8, P.top[1] - 8, 24)).rotateX(-Math.PI / 2);
    const p = fgeo.attributes.position, u = fgeo.attributes.uv; for (let i = 0; i < p.count; i++) u.setXY(i, (p.getX(i) + 146) / 292, (-p.getZ(i) + 116) / 232);
    add(g, fgeo, mat({ map: ft, roughness: .55 }), { pos: [0, P.h - 9, 0] });
  }
  if (lid) {
    const [lt, lb] = await Promise.all([tex(`traylid-${lid}`), label ? tex(`label-${lid}-${label}`) : null]);
    const LW = 314, LD = 254, lg = new THREE.ExtrudeGeometry(rrShape(LW, LD, 14), { depth: 1.6, bevelEnabled: false });
    const p = lg.attributes.position, u = lg.attributes.uv; for (let i = 0; i < p.count; i++) u.setXY(i, (p.getX(i) + LW / 2) / LW, (p.getY(i) + LD / 2) / LD);
    lg.rotateX(-Math.PI / 2);
    add(g, lg, [mat({ map: lt, roughness: .6 }), mat({ color: 0xeeeae2, roughness: .9 })], { pos: [0, P.h + .8, 0] });
    if (lb) {
      const pg = new THREE.PlaneGeometry(152.4, 101.6).rotateX(-Math.PI / 2);
      add(g, pg, mat({ map: lb, transparent: true, alphaTest: .4, roughness: .5, polygonOffset: true, polygonOffsetFactor: -2 }), { pos: [0, P.h + 2.6, (82 + 50.8) - 127] });
    }
  }
  return g;
}

/* ── DISTRICT LUNCHBOX ── */
export const LB = { L: 228.6, D: 152.4, H: 57.2, band: 108 };
export async function lunchBox(parent, dir, { pos = [0, 0, 0], rotY = 0, sleeve = true } = {}) {
  const g = new THREE.Group(); g.position.set(...pos); g.rotation.y = rotY; parent.add(g);
  const [ti, tt, tfr, tbk] = await Promise.all([tex('lunch-interior'), tex(`lunch-top-${dir}`), tex(`lunch-front-${dir}`), tex(`lunch-back-${dir}`)]);
  const bh = LB.H - 13;
  add(g, new RoundedBoxGeometry(LB.L, bh, LB.D, 4, 5), mat({ color: 0x141116, roughness: .32 }), { pos: [0, bh / 2, 0] });
  add(g, new THREE.PlaneGeometry(LB.L - 6, LB.D - 6).rotateX(-Math.PI / 2), mat({ map: ti, roughness: .5 }), { pos: [0, bh + .3, 0] });
  add(g, new RoundedBoxGeometry(LB.L + 1.5, 14, LB.D + 1.5, 4, 5), clearMat({ opacity: .18 }), { pos: [0, bh + 6.5, 0], cast: false });
  if (sleeve) {
    const o = .9, sm = m => mat({ map: m, roughness: .62 });
    add(g, new THREE.PlaneGeometry(LB.band, LB.D + 2 * o).rotateX(-Math.PI / 2), sm(tt), { pos: [0, LB.H + o, 0] });
    add(g, new THREE.PlaneGeometry(LB.band, LB.H + o), sm(tfr), { pos: [0, LB.H / 2 + o / 2 - .4, LB.D / 2 + o] });
    add(g, new THREE.PlaneGeometry(LB.band, LB.H + o), sm(tbk), { pos: [0, LB.H / 2 + o / 2 - .4, -LB.D / 2 - o], rot: [0, Math.PI, 0] });
    const edge = mat({ color: dir === 'bazaar' ? 0xFF6A13 : 0x0F4D3F, roughness: .7 });
    for (const sx of [-1, 1]) add(g, new THREE.PlaneGeometry(.9, LB.D + 2 * o).rotateX(-Math.PI / 2).rotateZ(0), edge, { pos: [sx * LB.band / 2, LB.H + o - .45, 0], rot: [0, 0, Math.PI / 2] });
  }
  return g;
}

/* ── BOX-LUNCH CARTON ── */
export const CT = { L: 203, D: 140, Hb: 89, rise: 50, handle: 50 };
export async function carton(parent, dir, { pos = [0, 0, 0], rotY = 0 } = {}) {
  const g = new THREE.Group(); g.position.set(...pos); g.rotation.y = rotY; parent.add(g);
  const [ts, te, tr, th] = await Promise.all(['side', 'end', 'roof', 'handle'].map(k => tex(`carton-${k}-${dir}`)));
  const C = CT, m = t => mat({ map: t, roughness: .7, side: THREE.DoubleSide });
  add(g, new THREE.PlaneGeometry(C.L, C.Hb), m(ts), { pos: [0, C.Hb / 2, C.D / 2] });
  add(g, new THREE.PlaneGeometry(C.L, C.Hb), m(ts), { pos: [0, C.Hb / 2, -C.D / 2], rot: [0, Math.PI, 0] });
  // pentagon ends
  const es = new THREE.Shape([[-C.D / 2, 0], [C.D / 2, 0], [C.D / 2, C.Hb], [0, C.Hb + C.rise], [-C.D / 2, C.Hb]].map(([x, y]) => new THREE.Vector2(x, y)));
  const eg = new THREE.ShapeGeometry(es); const ep = eg.attributes.position, eu = eg.attributes.uv;
  for (let i = 0; i < ep.count; i++) eu.setXY(i, (ep.getX(i) + C.D / 2) / C.D, ep.getY(i) / (C.Hb + C.rise));
  add(g, eg, m(te), { pos: [C.L / 2, 0, 0], rot: [0, Math.PI / 2, 0] });
  add(g, eg.clone(), m(te), { pos: [-C.L / 2, 0, 0], rot: [0, -Math.PI / 2, 0] });
  const slope = Math.hypot(C.D / 2, C.rise), ang = Math.atan2(C.rise, C.D / 2);
  for (const s of [1, -1]) {
    const rp = add(g, new THREE.PlaneGeometry(C.L, slope), m(tr), { pos: [0, C.Hb + C.rise / 2, s * C.D / 4] });
    rp.rotation.set(s * (-(Math.PI / 2 - ang)), s > 0 ? 0 : Math.PI, 0, 'YXZ');
    if (s < 0) rp.rotation.set(-(Math.PI / 2 - ang), Math.PI, 0, 'YXZ');
  }
  const hs = new THREE.Shape([[-C.L / 2, 0], [C.L / 2, 0], [C.L / 2, C.handle], [-C.L / 2, C.handle]].map(([x, y]) => new THREE.Vector2(x, y)));
  const hole = new THREE.Path(); hole.absarc(-28, 22, 10, Math.PI / 2, Math.PI * 1.5, false); hole.lineTo(28, 12); hole.absarc(28, 22, 10, -Math.PI / 2, Math.PI / 2, false); hole.lineTo(-28, 32); hs.holes.push(hole);
  const hg = new THREE.ShapeGeometry(hs, 16); const hp = hg.attributes.position, hu = hg.attributes.uv;
  for (let i = 0; i < hp.count; i++) hu.setXY(i, (hp.getX(i) + C.L / 2) / C.L, hp.getY(i) / C.handle);
  add(g, hg, m(th), { pos: [0, C.Hb + C.rise - 1, .6] });
  add(g, hg.clone(), m(th), { pos: [0, C.Hb + C.rise - 1, -.6], rot: [0, Math.PI, 0] });
  return g;
}

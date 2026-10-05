// Browser-side helpers for the mockup renders (three.js objects + SVG background/overlay layers)
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
export { THREE };
export const TEX = window.__TEX;            // texture base URL
export let W = 800, H = 1000;
const NS = 'http://www.w3.org/2000/svg';

export function setup({ w = 800, h = 1000, fov = 22, pos = [0, 300, 700], target = [0, 60, 0], exposure = 1, env = 0.9, envRot = 0 } = {}) {
  W = w; H = h;
  for (const id of ['stage', 'bg', 'gl', 'fg', 'grain']) { const e = document.getElementById(id); e.style.width = w + 'px'; e.style.height = h + 'px'; }
  const canvas = document.getElementById('gl');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(2); renderer.setSize(w, h, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = exposure;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = env;
  scene.environmentRotation = new THREE.Euler(0, envRot, 0);
  const camera = new THREE.PerspectiveCamera(fov, w / h, 5, 8000);
  camera.position.set(...pos); camera.lookAt(...target);
  camera.updateMatrixWorld();
  return { renderer, scene, camera };
}
export function keyLight(scene, { pos = [-400, 700, 400], target = [0, 0, 0], intensity = 2.4, color = 0xfff0de, size = 500, radius = 10, samples = 20, map = 2048, bias = -0.0004 } = {}) {
  const l = new THREE.DirectionalLight(color, intensity);
  l.position.set(...pos); l.target.position.set(...target); scene.add(l.target);
  l.castShadow = true; l.shadow.mapSize.set(map, map);
  Object.assign(l.shadow.camera, { left: -size, right: size, top: size, bottom: -size, near: 10, far: 4000 });
  l.shadow.radius = radius; l.shadow.blurSamples = samples; l.shadow.bias = bias; l.shadow.normalBias = 0.5;
  scene.add(l); return l;
}
export function fill(scene, { pos = [500, 300, 600], intensity = .6, color = 0xffffff } = {}) {
  const l = new THREE.DirectionalLight(color, intensity); l.position.set(...pos); scene.add(l); return l;
}
export function ground(scene, { size = 4000, opacity = .3, color = 0x000000, y = 0 } = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.ShadowMaterial({ opacity, color: new THREE.Color(color) }));
  m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = true; scene.add(m); return m;
}
/** soft contact shadow blob (fake AO) */
let blobTex;
export function blob(scene, { x = 0, z = 0, y = .2, rx = 50, rz = 50, opacity = .45, color = 0x000000, rot = 0 } = {}) {
  if (!blobTex) {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256);
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, '#fff'); gr.addColorStop(.35, 'rgb(170,170,170)'); gr.addColorStop(.62, 'rgb(60,60,60)'); gr.addColorStop(.85, 'rgb(12,12,12)'); gr.addColorStop(1, '#000');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256); blobTex = new THREE.CanvasTexture(c);
  }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(rx * 2, rz * 2), new THREE.MeshBasicMaterial({ alphaMap: blobTex, color: new THREE.Color(color), transparent: true, opacity, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.rotation.z = rot; m.position.set(x, y, z); m.renderOrder = -1; scene.add(m); return m;
}
const loader = new THREE.TextureLoader();
export function tex(name, { srgb = true, repeat, aniso = 8 } = {}) {
  return new Promise((res, rej) => loader.load(name.startsWith('http') || name.startsWith('/') ? name : TEX + name + '.png', t => {
    if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
    res(t);
  }, undefined, rej));
}
/** frustum surface with UVs: u = angle (0.5 faces +z), v = 1 at the top edge; t0..t1 fraction of full height */
export function frustumGeo({ Rtop, Rbot, h, t0 = 0, t1 = 1, seg = 160, rows = 24, inside = false }) {
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= rows; j++) {
    const tt = j / rows, t = t0 + (t1 - t0) * tt, R = Rtop + (Rbot - Rtop) * t, y = h * (1 - t);
    for (let i = 0; i <= seg; i++) { const u = i / seg, th = (u - .5) * 2 * Math.PI; pos.push(R * Math.sin(th), y, R * Math.cos(th)); uv.push(u, 1 - tt); }
  }
  for (let j = 0; j < rows; j++) for (let i = 0; i < seg; i++) {
    const a = j * (seg + 1) + i, b = a + 1, c = a + seg + 1, d = c + 1;
    if (inside) idx.push(a, b, c, b, d, c); else idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals(); return g;
}
export function lathe(points, seg = 160) { return new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), seg); }
/** disc on XZ plane at height y with planar UV mapping of a square texture of side S (mm) centred */
export function discGeo(r, S, seg = 128) {
  const g = new THREE.CircleGeometry(r, seg); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, .5 + p.getX(i) / S, .5 - p.getZ(i) / S);
  return g;
}
/** rounded-rect plane on XZ with UVs spanning w×d */
export function rrectGeo(w, d, r, seg = 10) {
  const s = new THREE.Shape(), x = -w / 2, y = -d / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ShapeGeometry(s, seg); const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - x) / w, (p.getY(i) - y) / d);
  g.rotateX(-Math.PI / 2); return g;
}
export function mat(o = {}) { return new THREE.MeshStandardMaterial({ roughness: .6, metalness: 0, ...o }); }
export function add(scene, geo, material, { pos = [0, 0, 0], rot = [0, 0, 0], cast = true, receive = true, parent } = {}) {
  const m = new THREE.Mesh(geo, material); m.position.set(...pos); m.rotation.set(...rot); m.castShadow = cast; m.receiveShadow = receive; (parent || scene).add(m); return m;
}
export function group(scene, { pos = [0, 0, 0], rot = [0, 0, 0], scale = 1 } = {}) { const g = new THREE.Group(); g.position.set(...pos); g.rotation.set(...rot); g.scale.setScalar(scale); scene.add(g); return g; }
/** project world point → CSS px */
export function project(camera, p) {
  const v = (p.isVector3 ? p.clone() : new THREE.Vector3(...p)).project(camera);
  return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H];
}

/* ───────── SVG layers ───────── */
export function el(parent, tag, attrs = {}, html) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (html != null) e.innerHTML = html; parent.appendChild(e); return e;
}
export const bg = () => document.getElementById('bg');
export const fg = () => document.getElementById('fg');
/** coloured seamless sweep with paper grain (feTurbulence), light pool and vignette */
export function surface({ top, bottom, light = [0.42, 0.42], lightColor = '#fff', lightOp = .35, vignette = .38, fibre = .12, grain = .1, pattern, patternOp = 1 } = {}) {
  const s = bg();
  s.setAttribute('viewBox', `0 0 ${W} ${H}`);
  s.innerHTML = `<defs>
  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>
  <radialGradient id="sl" cx="${light[0]}" cy="${light[1]}" r=".75"><stop offset="0" stop-color="${lightColor}" stop-opacity="${lightOp}"/><stop offset="1" stop-color="${lightColor}" stop-opacity="0"/></radialGradient>
  <radialGradient id="sv" cx=".5" cy=".46" r=".78"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${vignette}"/></radialGradient>
  <filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".0045" numOctaves="4" seed="4" result="m"/><feColorMatrix in="m" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 .62" result="mo"/><feTurbulence type="fractalNoise" baseFrequency=".55 .35" numOctaves="2" seed="11" result="f"/><feColorMatrix in="f" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 .95" result="fo"/><feMerge><feMergeNode in="mo"/><feMergeNode in="fo"/></feMerge></filter>
  <filter id="grainF" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="9"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .9"/></feComponentTransfer></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sg)"/>
  ${pattern ? `<g opacity="${patternOp}">${pattern}</g>` : ''}
  <rect width="${W}" height="${H}" fill="url(#sl)" style="mix-blend-mode:soft-light"/>
  <rect width="${W}" height="${H}" filter="url(#paper)" opacity="${fibre}" style="mix-blend-mode:multiply"/>
  <rect width="${W}" height="${H}" fill="url(#sv)"/>`;
  const g = document.getElementById('grain');
  g.setAttribute('viewBox', `0 0 ${W} ${H}`);
  g.innerHTML = `<rect width="${W}" height="${H}" filter="url(#grainF)" opacity="${grain}"/>`;
}
/** vector steam: wavy ribbons rising from (x,y) */
export function steam(x, y, { h = 220, n = 3, spread = 26, width = 9, color = '#fff', op = .55, seed = 1, sway = 22, blur = 3 } = {}) {
  const s = fg(); let r = seed;
  const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
  const id = 'st' + Math.floor(rnd() * 1e6);
  el(s, 'defs', {}, `<linearGradient id="${id}g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset=".15" stop-color="${color}" stop-opacity="${op}"/><stop offset=".55" stop-color="${color}" stop-opacity="${op * .45}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient><filter id="${id}b" x="-80%" y="-20%" width="260%" height="140%"><feGaussianBlur stdDeviation="${blur}"/></filter><filter id="${id}h" x="-80%" y="-20%" width="260%" height="140%"><feGaussianBlur stdDeviation="${blur * 3.5}"/></filter>`);
  const paths = [];
  for (let i = 0; i < n; i++) {
    const x0 = x + (i - (n - 1) / 2) * spread * (0.7 + rnd() * .5), ph = rnd() * 6, hh = h * (0.75 + rnd() * .35);
    let d = `M${x0.toFixed(1)} ${y}`; const steps = 4;
    let px = x0, py = y;
    for (let k = 1; k <= steps; k++) {
      const yy = y - hh * k / steps, xx = x0 + Math.sin(ph + k * 1.6) * sway * (0.35 + k / steps);
      const c1x = px, c1y = py - hh / steps * .55, c2x = xx, c2y = yy + hh / steps * .55;
      d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${xx.toFixed(1)} ${yy.toFixed(1)}`;
      px = xx; py = yy;
    }
    paths.push(d);
  }
  // broad haze then wisps
  for (const d of paths) el(s, 'path', { d, fill: 'none', stroke: `url(#${id}g)`, 'stroke-width': width * 3.2, 'stroke-linecap': 'round', opacity: .35, filter: `url(#${id}h)`, style: 'mix-blend-mode:screen' });
  for (const d of paths) el(s, 'path', { d, fill: 'none', stroke: `url(#${id}g)`, 'stroke-width': width * (0.8 + rnd() * .4), 'stroke-linecap': 'round', filter: `url(#${id}b)`, style: 'mix-blend-mode:screen' });
}
export function done(renderer, scene, camera) { renderer.render(scene, camera); }

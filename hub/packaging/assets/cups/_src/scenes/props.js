// Props: 3D (marigolds, brass tray, spoons) and 2D background helpers
import { THREE, el, project, W, H, add, mat } from './common.js';

const BRAND = '/home/user/playground/brand/';
export function preload(urls) { return Promise.all(urls.map(u => new Promise(r => { const i = new Image(); i.onload = i.onerror = () => r(); i.src = u; }))); }

/** 3D marigold head: instanced ruffled petals on a dome */
export function marigold3D(scene, { x = 0, z = 0, r = 18, seed = 1, palette = [0xD9480F, 0xEE5A0C, 0xF57C00, 0xF99500, 0xFBA81A], y = 0 } = {}) {
  let s = seed * 9973 + 7; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const N = 420, geo = new THREE.SphereGeometry(1, 10, 6);
  const m = new THREE.MeshStandardMaterial({ roughness: .82, metalness: 0 });
  const im = new THREE.InstancedMesh(geo, m, N); im.castShadow = true; im.receiveShadow = true;
  const dummy = new THREE.Object3D(), col = new THREE.Color();
  const cy = y + r * .62;
  for (let i = 0; i < N; i++) {
    const t = (i + .5) / N, th = Math.acos(1 - 1.55 * t), ph = i * 2.39996;
    const n = new THREE.Vector3(Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)).normalize();
    const rr = r * (0.86 + rnd() * .2);
    dummy.position.set(x + n.x * rr, cy + n.y * rr * .78, z + n.z * rr);
    const tilt = n.clone().add(new THREE.Vector3(rnd() - .5, rnd() - .5, rnd() - .5).multiplyScalar(.9)).normalize();
    dummy.lookAt(dummy.position.clone().add(tilt));
    dummy.rotateZ(rnd() * Math.PI);
    const sz = r * (.2 + rnd() * .09);
    dummy.scale.set(sz, sz * .62, sz * .16);
    dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix);
    const k = Math.max(0, Math.min(palette.length - 1, Math.floor(rnd() * palette.length * .7 + (1 - t) * palette.length * .45)));
    col.setHex(palette[k]); col.offsetHSL((rnd() - .5) * .02, 0, (rnd() - .5) * .08); im.setColorAt(i, col);
  }
  scene.add(im);
  // dark core so gaps read as depth, plus green calyx
  add(scene, new THREE.SphereGeometry(r * .8, 24, 16), mat({ color: 0x7a2a06, roughness: .9 }), { pos: [x, cy, z] }).scale.set(1, .78, 1);
  add(scene, new THREE.SphereGeometry(r * .42, 16, 10), mat({ color: 0x3f6f2a, roughness: .85 }), { pos: [x, y + r * .18, z] }).scale.set(1, .45, 1);
  return im;
}
/** brass thali tray */
export function brassTray(scene, { x = 0, z = 0, R = 170, y = 0 } = {}) {
  const brass = new THREE.MeshStandardMaterial({ color: 0xd9a441, metalness: 1, roughness: .3, side: THREE.DoubleSide });
  const prof = [[0, y + .5], [R - 14, y + .5], [R - 8, y + 1.8], [R - 3, y + 7], [R, y + 11], [R + 1.5, y + 11.6], [R + 2.2, y + 10.4], [R - .5, y + 6], [R - 5, y + 1.2], [R - 6, y]];
  const g = new THREE.LatheGeometry(prof.map(([a, b]) => new THREE.Vector2(a, b)), 200);
  const m = new THREE.Mesh(g, brass); m.position.set(x, 0, z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
  // engraved rings
  for (const rr of [R * .55, R * .78]) { const ring = new THREE.Mesh(new THREE.RingGeometry(rr, rr + 1.2, 200).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x9c6b1d, metalness: 1, roughness: .45 })); ring.position.set(x, y + .62, z); ring.receiveShadow = true; scene.add(ring); }
  return m;
}
/** steel serving spoon (3D) lying on a surface, pointing along angle a (radians, in XZ) */
export function spoon3D(scene, { x = 0, z = 0, y = 0, a = 0, L = 260, brass = false } = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = a; scene.add(g);
  const m = new THREE.MeshStandardMaterial({ color: brass ? 0xd9a441 : 0xe6e8ea, metalness: 1, roughness: brass ? .3 : .22 });
  // bowl: flattened half ellipsoid
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), m);
  bowl.scale.set(30, 11, 44); bowl.rotation.x = Math.PI; bowl.position.set(0, 11, L * .5 - 40); bowl.castShadow = true; g.add(bowl);
  // handle: tapered flat bar with a gentle lift
  const sh = new THREE.Shape(); sh.moveTo(-4, 0); sh.lineTo(4, 0); sh.lineTo(9, L * .62); sh.quadraticCurveTo(0, L * .66, -9, L * .62); sh.lineTo(-4, 0);
  const hg = new THREE.ExtrudeGeometry(sh, { depth: 2.4, bevelEnabled: true, bevelSize: .8, bevelThickness: .6, bevelSegments: 2 });
  const handle = new THREE.Mesh(hg, m); handle.rotation.x = Math.PI / 2 + .06; handle.position.set(0, 8, L * .5 - 82); handle.rotation.z = Math.PI; handle.castShadow = true;
  g.add(handle);
  return g;
}

/** printed cotton cloth lying on the table with soft wrinkles */
export async function cloth3D(scene, { x = 0, z = 0, w = 420, d = 320, rot = 0, tile, tileMM = 36, y = 0, amp = .8, seed = 3, border } = {}) {
  const t = await new Promise(r => new THREE.TextureLoader().load(window.__TEX + tile + '.png', r));
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / tileMM, d / tileMM); t.anisotropy = 8;
  const g = new THREE.PlaneGeometry(w, d, 120, 90); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const px = p.getX(i), pz = p.getZ(i);
    const wr = Math.sin(px * .045 + seed) * Math.sin(pz * .031 + seed * 2) + .6 * Math.sin((px + pz) * .07 + seed * 3) + .35 * Math.sin(px * .13 - pz * .09);
    const edge = Math.min(1, (w / 2 - Math.abs(px)) / 30, (d / 2 - Math.abs(pz)) / 30);
    p.setY(i, y + .4 + amp * (wr * .5 + .5) * (0.35 + .65 * (1 - edge)) );
  }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: t, roughness: .92, side: THREE.DoubleSide }));
  m.position.set(x, 0, z); m.rotation.y = rot; m.receiveShadow = true; scene.add(m);
  return m;
}

/* ───── 2D ───── */
/** jali light falling on the backdrop */
export function jaliGlow({ cx, cy, r, op = .18, tile = 120 }) {
  const s = document.getElementById('bg');
  el(s, 'defs', {}, `<pattern id="jp" patternUnits="userSpaceOnUse" width="${tile}" height="${tile}"><image href="${BRAND}patterns/royal/01-jali-lattice-midnight.svg" width="${tile}" height="${tile}"/></pattern><radialGradient id="jm"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><mask id="jmask"><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#jm)"/></mask><filter id="jb"><feGaussianBlur stdDeviation="1.6"/></filter>`);
  el(s, 'rect', { width: W, height: H, fill: 'url(#jp)', mask: 'url(#jmask)', opacity: op, filter: 'url(#jb)', style: 'mix-blend-mode:screen' });
}
export function sparkles(s, camera, pts) { /* reserved */ }
export function flowerHead() { /* replaced by marigold3D */ }
/** soft drop shadow filter id for vector props */
export function shadowFilter(s, id = 'dsh', { dx = 6, dy = 10, blur = 7, op = .35, color = '#000' } = {}) {
  el(s, 'defs', {}, `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="${blur}"/><feOffset dx="${dx}" dy="${dy}" result="o"/><feFlood flood-color="${color}" flood-opacity="${op}"/><feComposite in2="o" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>`);
  return id;
}

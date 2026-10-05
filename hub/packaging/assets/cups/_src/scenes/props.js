// Props: 3D (marigolds, brass tray, spoons) and 2D background helpers
import { THREE, el, project, W, H, add, mat } from './common.js';

const BRAND = '/home/user/playground/brand/';
export function preload(urls) { return Promise.all(urls.map(u => new Promise(r => { const i = new Image(); i.onload = i.onerror = () => r(); i.src = u; }))); }

/** 3D marigold head: instanced ruffled petals on a dome */
export function marigold3D(scene, { x = 0, z = 0, r = 18, seed = 1, palette = [0xFF6A13, 0xFF8A1A, 0xFFB000, 0xFFC21A], y = 0 } = {}) {
  let s = seed * 9973; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const N = 150, geo = new THREE.SphereGeometry(1, 10, 8);
  const m = new THREE.MeshStandardMaterial({ roughness: .75, metalness: 0 });
  const im = new THREE.InstancedMesh(geo, m, N); im.castShadow = true; im.receiveShadow = true;
  const dummy = new THREE.Object3D(), col = new THREE.Color();
  for (let i = 0; i < N; i++) {
    const t = (i + .5) / N, th = Math.acos(1 - t * .98), ph = i * 2.39996;
    const n = new THREE.Vector3(Math.sin(th) * Math.cos(ph), Math.cos(th) * .85, Math.sin(th) * Math.sin(ph)).normalize();
    dummy.position.set(x + n.x * r, y + r * .32 + n.y * r * .8, z + n.z * r);
    dummy.lookAt(dummy.position.clone().add(n));
    dummy.rotateZ(rnd() * Math.PI);
    const sz = r * (.26 + rnd() * .1);
    dummy.scale.set(sz, sz * .8, sz * .28);
    dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix);
    const k = Math.min(palette.length - 1, Math.floor((1 - t) * palette.length * .9 + rnd() * 1.2));
    col.setHex(palette[k]); col.offsetHSL(0, 0, (rnd() - .5) * .06); im.setColorAt(i, col);
  }
  scene.add(im);
  // green calyx peeking out
  add(scene, new THREE.SphereGeometry(r * .45, 16, 10), mat({ color: 0x3f7a2e, roughness: .8 }), { pos: [x + r * .2, y + r * .2, z + r * .1] }).scale.set(1, .5, 1);
  return im;
}
/** brass thali tray */
export function brassTray(scene, { x = 0, z = 0, R = 170, y = 0 } = {}) {
  const brass = new THREE.MeshStandardMaterial({ color: 0xd9a441, metalness: 1, roughness: .28 });
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

import { THREE, setup, keyLight, fill, ground, blob, surface, steam, project, done } from './common.js';
import { chaiCup } from './objects.js';
import { marigold3D, brassTray, jaliGlow, preload } from './props.js';

export async function run({ dir }) {
  const bz = dir === 'bazaar';
  const { renderer, scene, camera } = setup({ fov: 21, pos: [40, 250, 760], target: [8, 62, 0], exposure: bz ? 1.02 : 1.0, env: bz ? .85 : .7 });
  keyLight(scene, { pos: [-420, 620, 380], intensity: bz ? 2.3 : 2.0, color: bz ? 0xfff0dc : 0xffe2b8, size: 320, radius: 14 });
  fill(scene, { pos: [500, 200, 500], intensity: bz ? .5 : .35, color: bz ? 0xe8fffc : 0xd8c8ff });
  ground(scene, { opacity: bz ? .32 : .5, color: bz ? 0x003a36 : 0x05020a });
  if (bz) surface({ top: '#00A8A0', bottom: '#0B8F88', light: [.35, .3], lightOp: .5, vignette: .32, fibre: .16, grain: .12 });
  else {
    await preload(['/home/user/playground/brand/patterns/royal/01-jali-lattice-midnight.svg']);
    surface({ top: '#2A1240', bottom: '#160B26', light: [.4, .32], lightColor: '#F7D98A', lightOp: .28, vignette: .5, fibre: .14, grain: .12 });
    jaliGlow({ cx: 520, cy: 230, r: 320, op: .2 });
  }
  const yb = bz ? 0 : 12;
  if (!bz) brassTray(scene, { x: 0, z: -5, R: 175 });
  const A = await chaiCup(scene, dir, { pos: [-48, yb, 46], rotY: 0.18 });
  const B = await chaiCup(scene, dir, { pos: [62, yb, -58], rotY: -2.05 });
  blob(scene, { x: -48, z: 46, y: yb + .3, rx: 60, rz: 60, opacity: bz ? .35 : .5, color: bz ? 0x00302c : 0x2a1500 });
  blob(scene, { x: 62, z: -58, y: yb + .3, rx: 60, rz: 60, opacity: bz ? .35 : .5, color: bz ? 0x00302c : 0x2a1500 });
  if (bz) {
    [[-150, 150, 17, 1], [-112, 196, 13, 2], [150, 110, 16, 3], [178, 160, 11, 4], [-185, -60, 14, 5], [128, 205, 10, 6]].forEach(([x, z, r, s]) => marigold3D(scene, { x, z, r, seed: s }));
  } else {
    [[-130, 130, 12, 1], [118, 118, 10, 2]].forEach(([x, z, r, s]) => marigold3D(scene, { x, z, r, y: yb, seed: s, palette: [0xC0392B, 0xD9502B, 0xE9A63A, 0xF2B94A] }));
  }
  done(renderer, scene, camera);
  for (const [C, k] of [[A, 1], [B, 2]]) {
    const p = new THREE.Vector3(...C.sip); C.group.localToWorld(p);
    const [x, y] = project(camera, p);
    steam(x, y - 4, { h: k === 1 ? 250 : 210, n: 3, spread: 15, width: 10, op: bz ? .6 : .5, seed: k * 7, sway: 18, blur: 3.2, color: bz ? '#FFFFFF' : '#FFF3DA' });
  }
}

import { THREE, setup, keyLight, fill, ground, blob, surface, steam, project, fg, bg, el, done } from './common.js';
import { chaiCup } from './objects.js';
import { flowerHead, sparkles, jaliGlow } from './props.js';

export async function run({ dir }) {
  const bz = dir === 'bazaar';
  const { renderer, scene, camera } = setup({ fov: 21, pos: [40, 250, 760], target: [8, 62, 0], exposure: bz ? 1.02 : 1.0, env: bz ? .85 : .7 });
  keyLight(scene, { pos: [-420, 620, 380], intensity: bz ? 2.3 : 2.0, color: bz ? 0xfff0dc : 0xffe2b8, size: 300, radius: 14 });
  fill(scene, { pos: [500, 200, 500], intensity: bz ? .5 : .35, color: bz ? 0xe8fffc : 0xd8c8ff });
  ground(scene, { opacity: bz ? .32 : .5, color: bz ? 0x003a36 : 0x05020a });
  if (bz) surface({ top: '#00A8A0', bottom: '#0B8F88', light: [.35, .3], lightOp: .5, vignette: .32, fibre: .16, grain: .12 });
  else surface({ top: '#2A1240', bottom: '#160B26', light: [.4, .32], lightColor: '#F7D98A', lightOp: .28, vignette: .5, fibre: .14, grain: .12 });
  if (!bz) jaliGlow({ cx: 520, cy: 230, r: 300, op: .16 });

  const A = await chaiCup(scene, dir, { pos: [-48, 0, 46], rotY: 0.18 });
  const B = await chaiCup(scene, dir, { pos: [62, 0, -58], rotY: -2.05 });
  blob(scene, { x: -48, z: 46, rx: 62, rz: 62, opacity: bz ? .35 : .55, color: bz ? 0x00302c : 0x000000 });
  blob(scene, { x: 62, z: -58, rx: 62, rz: 62, opacity: bz ? .35 : .55, color: bz ? 0x00302c : 0x000000 });

  // table props drawn as vectors in the background layer (projected so they sit on the same floor)
  const s = bg();
  if (bz) {
    [[-150, 150, 26, 0], [-120, 205, 18, 1], [150, 120, 24, 2], [175, 170, 16, 3], [-175, -40, 20, 4], [120, 210, 14, 5]].forEach(([x, z, r, i]) => flowerHead(s, camera, x, z, r, i));
  } else {
    sparkles(s, camera, [[-160, 140], [150, 150], [170, -30], [-170, -10]]);
  }
  done(renderer, scene, camera);
  // steam from both sip slots
  for (const [C, k] of [[A, 1], [B, 2]]) {
    const p = new THREE.Vector3(...C.sip); C.group.localToWorld(p);
    const [x, y] = project(camera, p);
    steam(x, y - 4, { h: k === 1 ? 260 : 220, n: 3, spread: 16, width: 10, op: bz ? .6 : .5, seed: k * 7, sway: 18, blur: 3.2, color: bz ? '#FFFFFF' : '#FFF3DA' });
  }
}

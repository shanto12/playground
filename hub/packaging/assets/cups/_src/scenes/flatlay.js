// Party-table flat-lay (top-down): trays, labels, cups, sauces, napkins, spoons
import { THREE, setup, keyLight, fill, ground, blob, surface, steam, project, done, add, mat, tex } from './common.js';
import { lassiCup, sauceCup, foilPan } from './objects2.js';
import { chaiCup } from './objects.js';
import { marigold3D, cloth3D, spoon3D } from './props.js';

async function napkin(scene, { x, z, rot, tile, tileMM = 46, w = 150, d = 150 }) {
  const t = await tex(tile, { repeat: [w / tileMM, d / tileMM] });
  const g = new THREE.BoxGeometry(w, 3, d);
  add(scene, g, mat({ map: t, roughness: .9 }), { pos: [x, 1.5, z], rot: [0, rot, 0] });
  // folded corner flap
  const f = new THREE.Mesh(new THREE.PlaneGeometry(w * .5, d * .5).rotateX(-Math.PI / 2), mat({ map: t, roughness: .9, side: THREE.DoubleSide }));
  f.position.set(x, 3.4, z); f.rotation.y = rot; scene.add(f); f.castShadow = true;
}
export async function run({ dir }) {
  const bz = dir === 'bazaar';
  const { renderer, scene, camera } = setup({ fov: 32, pos: [0, 2050, 200], target: [0, 0, 40], env: bz ? .9 : .8 });
  keyLight(scene, { pos: [-520, 1200, -260], intensity: 2.1, color: bz ? 0xfff0dc : 0xffe6c4, size: 900, radius: 18, map: 4096 });
  fill(scene, { pos: [400, 800, 600], intensity: .45 });
  ground(scene, { opacity: .35, color: bz ? 0x00302c : 0x02100c });
  if (bz) surface({ top: '#00A8A0', bottom: '#049790', light: [.3, .25], lightOp: .4, vignette: .3, fibre: .16, grain: .1 });
  else surface({ top: '#0F4D3F', bottom: '#0A3a30', light: [.3, .25], lightOp: .25, lightColor: '#F7D98A', vignette: .45, fibre: .16, grain: .1 });
  await cloth3D(scene, { x: 0, z: -40, w: 520, d: 1300, rot: .0, tile: bz ? 'pat-bz-booti-sunset' : 'pat-ry-jali-ivory', tileMM: 70, amp: .6 });
  // trays
  await foilPan(scene, { pos: [-190, 0, -290], rotY: .06, food: 'food-biryani' });
  await foilPan(scene, { pos: [185, 0, -270], rotY: -.07, lid: dir, label: 'curry' });
  await foilPan(scene, { pos: [-180, 0, 50], rotY: -.05, food: 'food-curry' });
  await foilPan(scene, { pos: [195, 0, 70], rotY: .08, lid: dir, label: 'bread' });
  spoon3D(scene, { x: -150, z: -270, y: 52, a: 2.6, L: 250, brass: !bz });
  spoon3D(scene, { x: -150, z: 70, y: 52, a: 2.2, L: 250, brass: !bz });
  // drinks + sauces
  await napkin(scene, { x: -270, z: 360, rot: .25, tile: bz ? 'pat-bz-garland-fresh' : 'pat-ry-damask-emerald' });
  await napkin(scene, { x: 280, z: 360, rot: -.2, tile: bz ? 'pat-bz-chili-sunset' : 'pat-ry-paisley-ruby' });
  const c1 = await chaiCup(scene, dir, { pos: [-280, 3, 355], rotY: .3 });
  await chaiCup(scene, dir, { pos: [-165, 0, 405], rotY: -.8 });
  await lassiCup(scene, dir, { pos: [285, 3, 355], rotY: -.3, flagRot: -1.2 });
  await lassiCup(scene, dir, { pos: [175, 0, 410], rotY: .4, flavour: 'sweet', flagRot: -1.5 });
  const sk = ['mint', 'tamarind', 'raita', 'blank'];
  for (let i = 0; i < 4; i++) await sauceCup(scene, dir, sk[i], { pos: [-50 + (i % 2) * 85, 0, 330 + Math.floor(i / 2) * 85], rotY: i * .7, size: i === 3 ? '2oz' : '4oz' });
  for (const [x, z, r] of [[-190, -290, 190], [185, -270, 190], [-180, 50, 190], [195, 70, 190]]) blob(scene, { x, z, rx: r, rz: r * .82, opacity: .45, color: bz ? 0x00302c : 0x000000 });
  if (bz) [[-330, -120, 16, 1], [340, -90, 14, 2], [10, -470, 15, 3], [0, -90, 13, 4], [-20, 520, 13, 5], [330, 230, 12, 6], [-340, 220, 12, 7]].forEach(([x, z, r, s]) => marigold3D(scene, { x, z, r, seed: s }));
  else [[0, -90, 13, 4], [-330, 220, 12, 7], [340, -90, 12, 2], [10, -470, 12, 3]].forEach(([x, z, r, s]) => marigold3D(scene, { x, z, r, seed: s, palette: [0xC0392B, 0xD9502B, 0xE9A63A, 0xF2B94A] }));
  done(renderer, scene, camera);
  const p = new THREE.Vector3(...c1.sip); c1.group.localToWorld(p); const [sx, sy] = project(camera, p);
  steam(sx, sy, { h: 110, n: 2, spread: 10, width: 8, op: .45, sway: 10, blur: 3, seed: 3 });
}

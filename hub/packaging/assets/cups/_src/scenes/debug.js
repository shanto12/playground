import { THREE, setup, keyLight, ground, blob, surface, done } from './common.js';
export async function run() {
  const { renderer, scene, camera } = setup({ fov: 21, pos: [30, 330, 900], target: [6, 78, 0] });
  surface({ top: '#00A8A0', bottom: '#0B8F88' });
  keyLight(scene, {});
  ground(scene, {});
  blob(scene, { x: 0, z: 0, rx: 80, rz: 80, opacity: 1, color: 0xff0000 });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(100,100), new THREE.MeshBasicMaterial({color:0x0000ff}));
  m.rotation.x=-Math.PI/2; m.position.set(150,1,0); scene.add(m);
  done(renderer, scene, camera);
}

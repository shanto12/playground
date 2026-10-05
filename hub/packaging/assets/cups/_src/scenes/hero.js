// Hero shots: lassi, party trays, lunchbox, carton (both directions)
import { THREE, setup, keyLight, fill, ground, blob, surface, steam, project, done } from './common.js';
import { lassiCup, sauceCup, foilPan, lunchBox, carton, PAN } from './objects2.js';
import { marigold3D, brassTray, jaliGlow, preload, cloth3D, spoon3D } from './props.js';

const BG = {
  bazaar: {
    lassi: { top: '#E4147E', bottom: '#B80F66', light: [.38, .3], lightOp: .45, shadow: 0x4a0024 },
    trays: { top: '#FFB000', bottom: '#F09A00', light: [.35, .28], lightOp: .55, shadow: 0x6a3a00 },
    lunch: { top: '#2B1C66', bottom: '#1D1147', light: [.4, .3], lightOp: .3, shadow: 0x05020f, lightColor: '#FFB000' },
    carton: { top: '#00A8A0', bottom: '#078A84', light: [.35, .3], lightOp: .5, shadow: 0x00302c },
  },
  royal: {
    lassi: { top: '#16624F', bottom: '#0B3A2F', light: [.42, .3], lightOp: .3, shadow: 0x001a12, lightColor: '#F7D98A' },
    trays: { top: '#F7E7D4', bottom: '#EBCFBD', light: [.4, .28], lightOp: .5, shadow: 0x5a3020 },
    lunch: { top: '#4B1D52', bottom: '#2A1036', light: [.4, .3], lightOp: .28, shadow: 0x0a0210, lightColor: '#F7D98A' },
    carton: { top: '#F6EAD6', bottom: '#E8D3B4', light: [.4, .3], lightOp: .45, shadow: 0x3a2410 },
  },
};

export async function run({ dir, item }) {
  const bz = dir === 'bazaar', bg = BG[dir][item];
  const cam = { lassi: { pos: [20, 330, 760], target: [12, 108, 0] }, trays: { pos: [60, 760, 1060], target: [30, 60, 40] }, lunch: { pos: [80, 560, 900], target: [0, 50, 20] }, carton: { pos: [120, 420, 960], target: [0, 92, 0] } }[item];
  const { renderer, scene, camera } = setup({ fov: item === 'trays' ? 30 : 24, ...cam, env: bz ? .85 : .75 });
  keyLight(scene, { pos: [-480, 760, 420], intensity: 2.2, color: bz ? 0xfff0dc : 0xffe6c4, size: 520, radius: 16 });
  fill(scene, { pos: [520, 260, 520], intensity: .5 });
  ground(scene, { opacity: .32, color: bg.shadow });
  surface({ top: bg.top, bottom: bg.bottom, light: bg.light, lightOp: bg.lightOp, lightColor: bg.lightColor || '#fff', vignette: .36, fibre: .13, grain: .11 });
  const B = (x, z, rx, rz, o = .6, rot = 0) => blob(scene, { x, z, rx, rz, opacity: o, color: bg.shadow, rot });

  if (item === 'lassi') {
    await lassiCup(scene, dir, { pos: [-46, 0, 50], rotY: .12, flavour: 'mango', flagRot: -.25 });
    await lassiCup(scene, dir, { pos: [70, 0, -62], rotY: -2.0, flavour: 'sweet', flagRot: .4 });
    B(-46, 50, 58, 58, .7); B(70, -62, 58, 58, .7); B(-30, 60, 100, 100, .25); B(86, -52, 100, 100, .25);
    if (bz) { [[-150, 150, 15, 1], [140, 120, 13, 2], [-170, -40, 12, 3]].forEach(([x, z, r, s]) => marigold3D(scene, { x, z, r, seed: s })); }
    else { [[-140, 140, 12, 4], [150, 110, 10, 5]].forEach(([x, z, r, s]) => marigold3D(scene, { x, z, r, seed: s, palette: [0xC0392B, 0xD9502B, 0xE9A63A, 0xF2B94A] })); }
  }
  if (item === 'trays') {
    if (!bz) await preload([]);
    const st = [['biryani', 'food-biryani'], ['rice', 'food-rice'], ['curry', 'food-curry']];
    for (let i = 0; i < 3; i++) await foilPan(scene, { pos: [-40 + i * 6, i * (PAN.h + 2.6), -40 + i * 4], rotY: .1 - i * .05, lid: dir, label: st[i][0] });
    await foilPan(scene, { pos: [255, 0, 210], rotY: -.35, food: 'food-curry' });
    spoon3D(scene, { x: 235, z: 190, y: PAN.h - 14, a: -2.4, L: 250 });
    B(-35, -38, 230, 190, .55, .05); B(255, 210, 200, 170, .45, -.35);
    if (bz) [[-260, 200, 16, 1], [-220, 260, 12, 2], [40, 300, 13, 3]].forEach(([x, z, r, s]) => marigold3D(scene, { x, z, r, seed: s }));
    else [[-250, 220, 13, 6], [30, 300, 11, 7]].forEach(([x, z, r, s]) => marigold3D(scene, { x, z, r, seed: s, palette: [0xC0392B, 0xD9502B, 0xE9A63A, 0xF2B94A] }));
  }
  if (item === 'lunch') {
    await lunchBox(scene, dir, { pos: [-60, 0, -95], rotY: .12 });
    await lunchBox(scene, dir, { pos: [-55, 57.6 + 1.2, -92], rotY: .06 });
    await lunchBox(scene, dir, { pos: [70, 0, 140], rotY: -.18 });
    B(-60, -95, 160, 110, .6, .1); B(70, 140, 160, 110, .6, -.18);
    if (bz) [[-230, 130, 14, 1], [220, -40, 12, 2]].forEach(([x, z, r, s]) => marigold3D(scene, { x, z, r, seed: s }));
  }
  if (item === 'carton') {
    await carton(scene, dir, { pos: [-55, 0, 40], rotY: .42 });
    await carton(scene, dir, { pos: [135, 0, -120], rotY: -1.05 });
    B(-55, 40, 150, 110, .6, .42); B(135, -120, 150, 110, .55, -1.05);
    if (bz) [[-230, 170, 15, 1], [150, 180, 12, 2]].forEach(([x, z, r, s]) => marigold3D(scene, { x, z, r, seed: s }));
    else [[-220, 170, 12, 3], [160, 170, 10, 4]].forEach(([x, z, r, s]) => marigold3D(scene, { x, z, r, seed: s, palette: [0xC0392B, 0xD9502B, 0xE9A63A, 0xF2B94A] }));
  }
  done(renderer, scene, camera);
}

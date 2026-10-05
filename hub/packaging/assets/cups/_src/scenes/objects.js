// Reusable 3D packaging objects (units: mm, origin at base centre)
import { THREE, tex, frustumGeo, lathe, discGeo, mat, add, rrectGeo } from './common.js';

export const CUP = { Rtop: 45, Rbot: 30, h: 110 };
export const SLEEVE_T = [0.27, 0.835];
const Rc = t => CUP.Rtop + (CUP.Rbot - CUP.Rtop) * t;

/** 12 oz chai cup with sleeve + lid. returns {group, sip:[x,y,z] local} */
export async function chaiCup(parent, dir, { pos = [0, 0, 0], rotY = 0, sleeve = true, lidOn = true } = {}) {
  const g = new THREE.Group(); g.position.set(...pos); g.rotation.y = rotY; parent.add(g);
  const [tw, ts, tl] = await Promise.all([tex(`chai-wrap-${dir}`), tex(`chai-sleeve-${dir}`), tex(`chai-lid-${dir}`)]);
  add(g, frustumGeo({ ...CUP }), mat({ map: tw, roughness: .55 }));
  // base
  add(g, discGeo(CUP.Rbot, 100), mat({ color: 0xe9e1d2 }), { pos: [0, 0.6, 0], rot: [Math.PI, 0, 0] });
  if (sleeve) {
    const [t0, t1] = SLEEVE_T, gap = .8;
    const Rt = Rc(t0) + gap, Rb = Rc(t1) + gap, hs = CUP.h * (t1 - t0), y0 = CUP.h * (1 - t1);
    add(g, frustumGeo({ Rtop: Rt, Rbot: Rb, h: hs }), mat({ map: ts, roughness: .72 }), { pos: [0, y0, 0] });
    const edge = mat({ color: dir === 'bazaar' ? 0xf3ead6 : 0xe8dcc4, roughness: .9 });
    add(g, new THREE.RingGeometry(Rc(t0) - .1, Rt + .05, 160).rotateX(-Math.PI / 2), edge, { pos: [0, y0 + hs, 0] });
    add(g, new THREE.RingGeometry(Rc(t1) - .1, Rb + .05, 160).rotateX(Math.PI / 2), edge, { pos: [0, y0, 0] });
  }
  const h = CUP.h;
  // rolled rim bead (visible without lid)
  add(g, new THREE.TorusGeometry(CUP.Rtop + .3, 1.5, 16, 160).rotateX(Math.PI / 2), mat({ color: dir === 'bazaar' ? 0xfff4dc : 0x1a1024, roughness: .5 }), { pos: [0, h, 0] });
  let sip = [0, h + 1.5, 32];
  if (lidOn) {
    const lidCol = dir === 'bazaar' ? 0xf6efe0 : 0x1d1430;
    const lm = mat({ color: lidCol, roughness: dir === 'bazaar' ? .38 : .32, side: THREE.DoubleSide });
    const prof = [[46.6, h - 5.2], [47.2, h - 4.6], [47.5, h + .8], [47.1, h + 2.4], [46.1, h + 3.0], [45.0, h + 2.7], [44.2, h + 2.2], [43.4, h + 3.6], [42.4, h + 5.5], [41.6, h + 6.0]];
    add(g, lathe(prof), lm);
    add(g, discGeo(41.7, 100), mat({ map: tl, roughness: dir === 'bazaar' ? .38 : .32 }), { pos: [0, h + 6.0, 0] });
    sip = [0, h + 6.2, 34];
  }
  return { group: g, sip };
}

/** foil-style metal material */
export function foilMat(extra = {}) { return new THREE.MeshStandardMaterial({ color: 0xd9dadc, metalness: 1, roughness: .32, ...extra }); }

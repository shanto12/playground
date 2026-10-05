// Curry District · ROYAL icons — drawings on a 64×64 grid (keyline 6–58, stroke 1.75).
// Roles: s:'line' = gold stroke · f: 'emerald'|'ruby'|'peacock' = jewel accent fill (tinted in mono)
//        f:'gold'|'pin'|'veg'|'nonveg' = solid fill (solid in mono) · f:'plate' = ivory backing (dropped in mono)
import {
  P, C, E, R, L, T, fillOnly, visibleArcs, visiblePath, insideCircle, insidePath, below, polar, fmt, samplePath, r2,
} from './geom.mjs';

export const ICONS = [];
const add = (name, label, group, ...els) => ICONS.push({ name, label, group, els: els.flat(Infinity) });
const gold = (cx, cy, r) => C(cx, cy, r, fillOnly('gold'));
const dotGap = (r, approx = 4) => { const c = 2 * Math.PI * r; return +(c / Math.round(c / approx)).toFixed(3); };

// map every x,y pair of an absolute M/L/C/Q/Z path
function mapPath(d, f) {
  return d.replace(/([MLCQ])([^MLCQZ]*)/g, (_, cmd, args) => {
    const nums = args.trim().split(/[\s,]+|(?=-)/).filter(Boolean).map(Number);
    const out = [];
    for (let i = 0; i < nums.length; i += 2) { const [x, y] = f(nums[i], nums[i + 1]); out.push(`${r2(x)} ${r2(y)}`); }
    return cmd + out.join(' ');
  });
}
const scaled = (d, s, ox = 0) => mapPath(d, (x, y) => [(x + ox) * s, y * s]);

// ───────────────────────── SPICE SCALE · "chili gauge" ─────────────────────────
// The hero chili, laid lower, fills with ruby from stem to tip like a gauge (1/5 … 5/5),
// over a row of five gem pips (solid = lit). Double-coded: reads by colour AND by count, in colour or mono.
const CHILI = {
  body: 'M15.6 18.5C25 14 36 20 41 31C45 40 48 47 55 53.5C44.5 54.5 35 49 29 42C22.5 34.5 16 28 14.3 22.6C13.8 21 14.3 19.3 15.6 18.5Z',
  calyx: 'M12 21.5C11.5 16 16.5 11.8 23 13.5C21.8 16.2 20.2 17.6 18 18C17.8 20.4 15.6 22.2 12 21.5Z',
  outline: 'M21 16.4C29.5 16.5 37 22.5 41 31C45 40 48 47 55 53.5C44.5 54.5 35 49 29 42C22.5 34.5 17.5 28.5 14.6 21.8',
  stem: 'M17.4 13.8C16.4 9.6 13.4 7.6 9.4 8',
  shine: 'M24.5 21.5C30.5 23 35 28 38 34.5',
};
function chiliXf(deg, box) { // rotate about origin, then scale+translate to fit box [x0,y0,x1,y1]
  const a = (deg * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  const rot = (x, y) => [x * ca - y * sa, x * sa + y * ca];
  const all = [...samplePath(CHILI.body), ...samplePath(CHILI.calyx), ...samplePath(CHILI.stem)].map(([x, y]) => rot(x, y));
  const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
  const bx0 = Math.min(...xs), bx1 = Math.max(...xs), by0 = Math.min(...ys), by1 = Math.max(...ys);
  const k = Math.min((box[2] - box[0]) / (bx1 - bx0), (box[3] - box[1]) / (by1 - by0));
  const ox = box[0] + ((box[2] - box[0]) - (bx1 - bx0) * k) / 2 - bx0 * k;
  const oy = box[1] + ((box[3] - box[1]) - (by1 - by0) * k) / 2 - by0 * k;
  return (x, y) => { const [rx, ry] = rot(x, y); return [rx * k + ox, ry * k + oy]; };
}
function clipHalf(poly, inside, cut) { // Sutherland–Hodgman against a half-plane
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const ia = inside(a), ib = inside(b);
    if (ia) out.push(a);
    if (ia !== ib) out.push(cut(a, b));
  }
  return out;
}
function gauge(level) {
  const f = chiliXf(-24, [7, 6.5, 57, 41]);
  const tp = (d) => mapPath(d, f);
  // gauge axis: from calyx shoulder to tip (in transformed space)
  const A = f(16.5, 19.5), B = f(55, 53.5);
  const ax = B[0] - A[0], ay = B[1] - A[1], len = Math.hypot(ax, ay), ux = ax / len, uy = ay / len;
  const proj = (p) => (p[0] - A[0]) * ux + (p[1] - A[1]) * uy;
  const lim = level >= 5 ? 1e9 : (len * level) / 5 * 0.96;
  const poly = samplePath(CHILI.body, 14).map(([x, y]) => f(x, y));
  const fill = level >= 5 ? tp(CHILI.body) : fmt(clipHalf(poly, (p) => proj(p) <= lim, (a, b) => { const pa = proj(a), pb = proj(b), t = (lim - pa) / (pb - pa); return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]; })) + 'Z';
  const pipX = [13, 22.5, 32, 41.5, 51];
  const pips = pipX.map((x, i) => (i < level
    ? P(`M${x} 46.6L${x + 4.2} 50.8L${x} 55L${x - 4.2} 50.8Z`, { f: 'pin' })
    : C(x, 50.8, 1.5, fillOnly('gold'))));
  return [
    P(fill, fillOnly('ruby')),
    P(tp(CHILI.calyx), { f: 'emerald' }),
    P(tp(CHILI.outline)),
    P(tp(CHILI.stem)),
    pips,
  ];
}
const SPICE = ['Mild', 'Medium', 'Hot', 'Extra-Hot', 'District Hot'];
for (let i = 1; i <= 5; i++) add(`chili-${i}`, `Spice ${i} · ${SPICE[i - 1]}`, 'spice', gauge(i));

// ───────────────────────── DIET MARKS (FSSAI-style) ─────────────────────────
const plate = () => [R(8, 8, 48, 48, 8, fillOnly('plate')), R(8, 8, 48, 48, 8, { mono: false })];
add('veg-mark', 'Veg mark', 'diet',
  plate(),
  R(14, 14, 36, 36, 3.5, { s: 'veg', sw: 3.25 }),
  C(32, 32, 9, fillOnly('veg')),
);
{
  const h = 17.5, w = 20.5, cy = 32.6;
  const tri = `M32 ${r2(cy - (2 * h) / 3)}L${r2(32 + w / 2)} ${r2(cy + h / 3)}L${r2(32 - w / 2)} ${r2(cy + h / 3)}Z`;
  add('nonveg-mark', 'Non-veg mark', 'diet',
    plate(),
    R(14, 14, 36, 36, 3.5, { s: 'nonveg', sw: 3.25 }),
    P(tri, { s: 'nonveg', f: 'nonveg', sw: 2.4 }),
  );
}

// ───────────────────────── FOOD ─────────────────────────
add('curry-bowl', 'Curry bowl', 'food',
  E(32, 31, 22, 4.6, { f: 'ruby' }),
  P('M10 31C11 43.5 20 50.5 32 50.5C44 50.5 53 43.5 54 31'),
  P('M25.5 50.5L24.5 55.5H39.5L38.5 50.5'),
  P('M23.5 31.6C27.5 29.2 33 33.6 39 30.4'),
  P('M15 41C22 45 42 45 49 41', { dots: 4 }),
  P('M24 24C21.5 21 26.5 18 24 14'), P('M32 23C29.5 19.5 34.5 16 32 11'), P('M40 24C37.5 21 42.5 18 40 14'),
);

{
  const belly = 'M19.5 27C9 30.5 7 45.5 15.5 51.5C21 55.5 43 55.5 48.5 51.5C57 45.5 55 30.5 44.5 27';
  const pts = samplePath(belly, 200);
  const xs = (y) => { const hits = []; for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; if ((y0 - y) * (y1 - y) <= 0 && y0 !== y1) hits.push(x0 + ((y - y0) * (x1 - x0)) / (y1 - y0)); } return [Math.min(...hits), Math.max(...hits)]; };
  const [a1, b1] = xs(37), [a2, b2] = xs(43);
  const top = `M${r2(a1)} 37C${r2(a1 + 11)} 41 ${r2(b1 - 11)} 41 ${r2(b1)} 37`;
  const bot = `M${r2(a2)} 43C${r2(a2 + 11)} 47 ${r2(b2 - 11)} 47 ${r2(b2)} 43`;
  const band = `M${r2(a1)} 37C${r2(a1 + 11)} 41 ${r2(b1 - 11)} 41 ${r2(b1)} 37L${r2(b2)} 43C${r2(b2 - 11)} 47 ${r2(a2 + 11)} 47 ${r2(a2)} 43Z`;
  let scallop = 'M18 24.3'; for (let x = 18; x < 46; x += 4) scallop += `Q${x + 2} 26.6 ${x + 4} 24.3`;
  add('biryani-pot-handi', 'Biryani handi', 'food',
    P(band, fillOnly('peacock')),
    P(belly), P(top), P(bot),
    P('M18 21C20 15.8 25.5 13.8 32 13.8C38.5 13.8 44 15.8 46 21'),
    P('M15.5 21H48.5'),
    P(scallop),
    C(32, 11.4, 2.3, { f: 'gold' }),
  );
}

{
  // naan: two blistered teardrop flatbreads stacked, seen in perspective (thickness edges read as bread), fresh steam
  add('naan', 'Naan', 'food', T('translate(0 3)', [
    P('M7.5 31C7.5 23.6 16.6 19.4 27.6 19.4C38 19.4 48 22.4 56.6 28.6C58.2 29.8 58.2 31.4 56.6 32.6C48 38.8 38 41.6 27.6 41.6C16.6 41.6 7.5 38.4 7.5 31Z'),
    P('M7.5 31V35.6C7.5 43 16.6 46.2 27.6 46.2C38 46.2 48 43.4 56.6 37.2C57.8 36.3 58.2 35.2 57.8 34'),
    P('M9.4 41.6C11.6 47.6 19.6 50.6 28.6 50.6C38.4 50.6 47.4 47.8 55.2 42.4'),
    E(19.6, 28.4, 3.8, 1.8), E(33.4, 25.4, 3, 1.4), E(41.4, 33.2, 2.8, 1.4), E(25.6, 35.6, 2, 1),
    gold(27.4, 30.6, 1.2), gold(46.4, 28.8, 1.1), gold(14.6, 33.4, 1), gold(36.6, 37.4, 1),
    P('M25 15C22.6 12.2 27.4 9.6 25 6.4'), P('M35 15C32.6 12.2 37.4 9.6 35 6.4'),
  ]));
}

{
  add('samosa', 'Samosa', 'food',
    E(49.5, 49, 8.4, 2.6, { f: 'emerald' }),
    P('M41.1 49C41.6 54.6 57.4 54.6 57.9 49'),
    P('M24 9.6C17.2 19.6 10.2 32 7.2 41.6Q6 45.4 9.6 46.6C16 49.4 22 51.6 27.6 53Q30 53.6 32 52.4C36.4 49.2 40.2 45.6 43.4 42.4Q45.4 40.4 44 38C38.4 28.4 31.4 18 26.4 10.4Q25.2 8.8 24 9.6Z'),
    P('M25 10.6C26.8 24.6 28.6 38.6 29.8 52.4'),
    P('M28.6 15.6C32.4 23.4 36.6 31 40.6 38.6', { dots: 3.6 }),
    gold(16.6, 38.4, 1.3), gold(21.6, 29.4, 1.1), gold(22.4, 44.2, 1.2), gold(35.2, 41.4, 1.1),
  );
}
add('kebab-skewer', 'Kebab skewer', 'food',
  T('rotate(-40 32 32)', [
    R(26, 26, 5, 12, 2.5, { f: 'ruby' }),
    R(45, 26, 5, 12, 2.5, { f: 'emerald' }),
    C(7.5, 32, 3.5),
    P('M11 32H13.5M24.5 32H26M31 32H32.5M43.5 32H45M50 32H59.5'),
    R(13.5, 24.5, 11, 15, 4.5),
    R(32.5, 24.5, 11, 15, 4.5),
    P('M17 29L19.5 35M20.5 29L23 35M36 29L38.5 35M39.5 29L42 35'),
  ]),
);

add('tandoor-oven', 'Tandoor oven', 'food',
  P('M25 54V46.5Q25 41 32 37.5Q39 41 39 46.5V54', { f: 'ruby' }),
  E(32, 16, 12, 3.2),
  P('M20 16.5C14.5 27 12.5 41 13.5 54'), P('M44 16.5C49.5 27 51.5 41 50.5 54'),
  P('M8.5 54H55.5'),
  P('M32 51.6C29.4 49.8 30.2 46.8 32 44.2C33.8 46.8 34.6 49.8 32 51.6Z', fillOnly('gold')),
  P('M15.7 28.5C24 31.5 40 31.5 48.3 28.5', { dots: 4 }),
  P('M28.5 15L24.5 5M35.5 15L40 5.5'),
);

add('chai-cup', 'Chai cup', 'food',
  E(30, 26.5, 16, 3.3),
  P('M14 26.5C14.5 38 21 45.5 30 45.5C39 45.5 45.5 38 46 26.5'),
  P('M45.3 31C51.6 30 54.2 37 49.6 40C47.9 41.1 45.6 40.9 43 40.1'),
  P('M8 49.5H52'), P('M11 49.5C15 54.5 45 54.5 49 49.5'),
  P('M16.6 35C22 37.5 38 37.5 43.4 35', { dots: 4 }),
  P('M25 20C22.5 17 27.5 14 25 10'), P('M35 20C32.5 17 37.5 14 35 10'),
);

add('lassi-glass', 'Lassi glass', 'food',
  P('M23 12.6C21.2 8.6 23.4 5.4 28.2 4.6C28.6 8.8 26.6 11.6 23 12.6Z', { f: 'emerald' }),
  P('M23.4 12.2L26.8 8'),
  P('M19.5 19.5L23 54.5C23.1 55.4 23.7 56 24.6 56H39.4C40.3 56 40.9 55.4 41 54.5L44.5 19.5'),
  P('M18.5 19.5H45.5'),
  P('M19.4 19.5C17.8 15 21.4 12 25.6 13.4C27.6 9.8 33.6 9.4 36.2 12.9C39.8 10.8 45.2 13 44.6 19.5'),
  P('M40.2 11.4L47.5 4'),
  P('M24.2 48.5H39.8', { dots: 3.9 }),
);

{
  const A = [24, 30, 9], B = [40, 30, 9], Cc = [32, 19.6, 8];
  const chord = ([cx, cy, r], y) => { const dx = Math.sqrt(r * r - (y - cy) ** 2); return `M${r2(cx - dx)} ${y}A${r} ${r} 0 1 1 ${r2(cx + dx)} ${y}Z`; };
  add('gulab-jamun', 'Gulab jamun', 'food',
    C(...Cc, fillOnly('ruby')), P(chord(A, 38), fillOnly('ruby')), P(chord(B, 38), fillOnly('ruby')),
    P(visibleArcs(...Cc.slice(0, 2), Cc[2], Cc[2], [insideCircle(...A), insideCircle(...B)])),
    P(visibleArcs(A[0], A[1], A[2], A[2], [insideCircle(...B), below(38)])),
    P(visibleArcs(B[0], B[1], B[2], B[2], [below(38)])),
    P(`M${fmt([polar(24, 30, 5.4, 200)]).slice(1)}A5.4 5.4 0 0 1 ${fmt([polar(24, 30, 5.4, 248)]).slice(1)}`),
    P(`M${fmt([polar(40, 30, 5.4, 200)]).slice(1)}A5.4 5.4 0 0 1 ${fmt([polar(40, 30, 5.4, 248)]).slice(1)}`),
    P('M7.5 38H56.5'),
    P('M9.5 38C10.5 48 20 54 32 54C44 54 53.5 48 54.5 38'),
    P('M26.5 54L25.5 57.5H38.5L37.5 54'),
    P('M14.5 45.5C22 49.5 42 49.5 49.5 45.5', { dots: 4 }),
  );
}

{
  const k = [polar(32, 32, 13, -150), polar(32, 32, 13, -90), polar(32, 32, 13, -30)];
  add('thali-plate', 'Thali plate', 'food',
    C(...k[0], 6, { f: 'ruby' }), C(...k[1], 6), C(...k[1], 3.2), C(...k[2], 6, { f: 'emerald' }),
    C(32, 32, 26),
    C(32, 32, 22, { dots: dotGap(22) }),
    P('M16.5 43.5C15.5 38.5 20 35.2 25 36.6C29.5 35.2 33.6 39 32 43.5C30.5 48.5 18 48.5 16.5 43.5Z'),
    P('M20.6 40.6L22.4 39.6M25.4 42.8L27.4 42.4M21.6 44.8L23.4 45.4'),
    C(42.5, 41, 7.5),
    gold(40, 38.5, 1), gold(45, 42.5, 1), gold(41, 44.5, 0.9),
  );
}

{
  const A = [20.6, 37.4, 9.6], B = [41.8, 38.6, 8.6], Cc = [32.4, 27.8, 8];
  const plateBack = visibleArcs(32, 45, 26, 8.4, [insideCircle(...A), insideCircle(...B), insideCircle(...Cc), ([x, y]) => y > 45]);
  add('chaat-plate', 'Chaat plate', 'food',
    E(21.2, 31.6, 4.8, 2.2, { f: 'ruby', transform: 'rotate(-6 21.2 31.6)' }),
    E(42.6, 34, 4.2, 2, { f: 'emerald', transform: 'rotate(10 42.6 34)' }),
    P(visibleArcs(Cc[0], Cc[1], Cc[2], Cc[2], [insideCircle(...A), insideCircle(...B)])),
    P(visibleArcs(A[0], A[1], A[2], A[2], [])),
    P(visibleArcs(B[0], B[1], B[2], B[2], [])),
    P(plateBack),
    P('M6 45C6 49.6 17.6 53.4 32 53.4C46.4 53.4 58 49.6 58 45'),
    gold(25.6, 41.6, 1), gold(15.6, 40.6, 0.9), gold(46, 43, 1), gold(38.6, 42.6, 0.9), gold(32.4, 23.2, 0.9), gold(28.4, 28.6, 0.8), gold(36.2, 28, 0.8),
  );
}

add('chili', 'Chili', 'food',
  P(CHILI.body, fillOnly('ruby')),
  P(CHILI.calyx, { f: 'emerald' }),
  P(CHILI.outline), P(CHILI.stem), P(CHILI.shine),
);

{
  const ring = 'M10 34A20 20 0 1 0 50 34A20 20 0 1 0 10 34ZM13.5 34A16.5 16.5 0 1 1 46.5 34A16.5 16.5 0 1 1 13.5 34Z';
  const spokes = [0, 45, 90, 135, 180, 225, 270, 315].map((a) => fmt([polar(30, 34, 3.2, a), polar(30, 34, 13.4, a)])).join('');
  add('lime', 'Lime', 'food',
    P(ring, { s: null, f: 'emerald', rule: 'evenodd' }),
    C(30, 34, 20), C(30, 34, 16.5),
    P(spokes),
    P('M43.6 19.4C44 12 49.6 7.6 57 7.6C56.6 14.6 51 19.4 43.6 19.4Z', { f: 'emerald' }),
    P('M44.6 18.4L51.6 11.6'),
  );
}

{
  const leaf = (s) => [
    P(scaled('M0 0C-2 -1 -4.5 -2 -5 -3.6C-8.8 -3.4 -10 -8.6 -6.6 -10C-5.6 -10.4 -4 -10 -2.8 -9.2C-4 -13 -2 -15.6 0 -15.6C2 -15.6 4 -13 2.8 -9.2C4 -10 5.6 -10.4 6.6 -10C10 -8.6 8.8 -3.4 5 -3.6C4.5 -2 2 -1 0 0Z', s), { f: 'emerald' }),
    P(scaled('M0 -1.2L0 -11.6M0 -4L-4.6 -7.2M0 -4L4.6 -7.2', s)),
  ];
  add('cilantro', 'Cilantro', 'food',
    P('M31 58C31 48 31.5 36 33 25'),
    P('M31 44.5C28.6 40.6 26.2 37.6 23.2 35'),
    P('M31.2 48.5C35 44.6 38.4 41 41.8 38.2'),
    T('translate(33 25) rotate(4)', leaf(1.18)),
    T('translate(23.2 35) rotate(-56)', leaf(1.02)),
    T('translate(41.8 38.2) rotate(54)', leaf(1.02)),
  );
}

{
  const drop = 'M0 19C-2.6 21 -2.6 24.6 0 26.4C2.6 24.6 2.6 21 0 19Z';
  add('spoon-fork', 'Spoon & fork', 'food',
    T('translate(32 32) rotate(-30)', [
      P('M-5 -27V-17M0 -27V-15.5M5 -27V-17'),
      P('M-5 -17C-5 -11.4 5 -11.4 5 -17'),
      P('M0 -12.8V19'), P(drop),
    ]),
    T('translate(32 32) rotate(30)', [
      E(0, -18, 6.2, 8.6),
      P('M0 -9.4V19'), P(drop),
    ]),
  );
}

add('rice-bowl', 'Rice bowl', 'food',
  P('M11 34C12 23 21 17 32 17C43 17 52 23 53 34'),
  P('M8 34H56'),
  P('M9.5 34C10.5 46 20 52 32 52C44 52 53.5 46 54.5 34'),
  P('M26 52L25 56H39L38 52'),
  P('M15 41.5C22 45.5 42 45.5 49 41.5', { dots: 4 }),
  P('M20.5 28.5L22.5 26.5M27 23.5L29.6 23M35 23.8L37.4 25M41.5 28L43.4 30M25 30.5L27.4 30.8M32.5 29L34.2 31M18 32.2L20.2 31.6M45.5 32.6L47.2 31.2M38.5 31.6L40.6 31.8'),
  P('M30.5 17C30 13 32.8 10.2 37 10.2C37.2 14.2 34.6 16.8 30.5 17Z', { f: 'emerald' }),
);

// ───────────────────────── UTILITY ─────────────────────────
add('phone', 'Phone', 'utility',
  P('M16.5 9L23 15.5C24.9 17.4 24.9 20.4 23 22.3L20.6 24.7C23.6 31 33 40.4 39.3 43.4L41.7 41C43.6 39.1 46.6 39.1 48.5 41L55 47.5C56.9 49.4 56.9 52.4 55 54.3L52.4 56.9C46 61.4 31 55 20 44C9 33 2.6 18 7.1 11.6L9.7 9C11.6 7.1 14.6 7.1 16.5 9Z'),
  P('M36 8.5C45.6 9.6 54.4 18.4 55.5 28'),
  P('M36 16C41.6 17 47 22.4 48 28'),
);

add('map-pin', 'Map pin', 'utility',
  P('M26.5 33V26.5C26.5 22.6 29 20 32 18.5C35 20 37.5 22.6 37.5 26.5V33Z', { f: 'peacock' }),
  P('M32 54C32 54 14.5 39 14.5 25.5C14.5 15.8 22.3 8 32 8C41.7 8 49.5 15.8 49.5 25.5C49.5 39 32 54 32 54Z'),
  P('M24.4 52.6C19.4 53.4 19.2 57.4 32 57.4C44.8 57.4 44.6 53.4 39.6 52.6'),
);

add('clock', 'Clock', 'utility',
  C(32, 32, 23),
  C(32, 32, 18.5, { dots: dotGap(18.5, 9.7) }),
  P('M32 19.5V32L41 37.5'),
  gold(32, 32, 2.2),
);

add('shopping-bag', 'Shopping bag', 'utility',
  P('M27.5 48V42C27.5 39.6 29.6 37.6 32 36.4C34.4 37.6 36.5 39.6 36.5 42V48Z', { f: 'peacock' }),
  P('M13.5 22H50.5L53.5 56H10.5Z'),
  P('M24 28V19C24 14 27.5 10.8 32 8.5C36.5 10.8 40 14 40 19V28'),
  gold(24, 28, 1.5), gold(40, 28, 1.5),
);

add('delivery-scooter', 'Delivery scooter', 'utility',
  C(17, 47, 6.5), gold(17, 47, 1.5),
  C(49.5, 47, 6.5), gold(49.5, 47, 1.5),
  P('M8.3 43.5C6.5 37 11 33 18 33H29.5C32.5 33 34 35.5 33.6 38.5L32.8 44H26.2A9.5 9.5 0 0 0 8.3 43.5Z'),
  P('M32.8 44H40'),
  P('M40 44C40.5 37 42.5 31 45.6 26.5'),
  P('M44.6 19.5C44.6 26 46.2 32 48.4 38'),
  P('M41 19.5H48.5'),
  P('M40.6 42.6A9.2 9.2 0 0 1 58.4 42.6'),
  R(6.5, 15, 15, 13, 2.5),
  P('M6.5 19.5H21.5'),
  P('M10 28V33M18 28V33'),
);

{
  const pts = []; for (let k = 0; k < 10; k++) pts.push(polar(32, 33.5, k % 2 ? 10.4 : 24, -90 + k * 36));
  const inner = []; for (let k = 0; k < 10; k++) inner.push(polar(32, 33.5, k % 2 ? 6.2 : 14.2, -90 + k * 36));
  add('star', 'Star', 'utility',
    P(fmt(pts) + 'Z'),
    P(fmt(inner) + 'Z', { dots: 3.2 }),
  );
}

add('heart', 'Heart', 'utility',
  P('M32 52.5C22 45.5 9 36.5 9 24C9 16.5 14.5 11 21.5 11C26 11 30 13.5 32 17.5C34 13.5 38 11 42.5 11C49.5 11 55 16.5 55 24C55 36.5 42 45.5 32 52.5Z', { f: 'ruby' }),
  P('M15 23.5C15 19.8 17.6 17 21.2 17'),
);

{
  const nodes = [[46, 14], [18, 32], [46, 50]];
  const seg = (a, b, r) => { const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy); return fmt([[a[0] + (dx * r) / d, a[1] + (dy * r) / d], [b[0] - (dx * r) / d, b[1] - (dy * r) / d]]); };
  add('share', 'Share', 'utility',
    C(18, 32, 6.5, { f: 'peacock' }), C(46, 14, 6.5), C(46, 50, 6.5),
    P(seg(nodes[1], nodes[0], 8.5) + seg(nodes[1], nodes[2], 8.5)),
    gold(46, 14, 1.4), gold(46, 50, 1.4), gold(18, 32, 1.4),
  );
}

{
  const sq = (x, y, s = 4.4) => R(x, y, s, s, 1.1, fillOnly('gold'));
  const mods = [[30, 9.5], [30, 16]];
  add('qr-code', 'QR code', 'utility',
    R(9, 9, 16, 16, 4), R(39, 9, 16, 16, 4), R(9, 39, 16, 16, 4),
    R(14, 14, 6, 6, 1.6, fillOnly('gold')), R(44, 14, 6, 6, 1.6, fillOnly('gold')), R(14, 44, 6, 6, 1.6, fillOnly('gold')),
    ...mods.map(([x, y]) => sq(x, y)),
    sq(9.5, 30), sq(16, 30), sq(29.8, 29.8), sq(29.8, 36.3), sq(36.3, 29.8),
    sq(42.8, 30), sq(49.3, 30), sq(29.8, 42.8), sq(29.8, 49.3),
    sq(39.5, 39.5), sq(46, 46), sq(50.6, 39.5), sq(39.5, 50.6), sq(50.6, 50.6),
  );
}

add('gift-card', 'Gift card', 'utility',
  P('M21 26C17.5 19.5 10.5 20 12 24.5C13 27.5 17.5 27.5 21 26Z', { f: 'ruby' }),
  P('M21 26C24.5 19.5 31.5 20 30 24.5C29 27.5 24.5 27.5 21 26Z', { f: 'ruby' }),
  R(7, 15, 50, 34, 5),
  P('M21 15V21.5M21 28.5V49'),
  P('M21 26L16 32.5M21 26L26 32.5'),
  P('M36 37.5H50M36 43H45'),
  P('M45 18.5C45.6 22 46.2 22.6 49.6 23.2C46.2 23.8 45.6 24.4 45 27.9C44.4 24.4 43.8 23.8 40.4 23.2C43.8 22.6 44.4 22 45 18.5Z'),
);

{
  const xs = [19, 27.67, 36.33, 45], ys = [32.5, 40, 47.5];
  const dots = []; for (const y of ys) for (const x of xs) if (!(x === 36.33 && y === 40)) dots.push(gold(x, y, 1.6));
  add('calendar', 'Calendar', 'utility',
    C(36.33, 40, 4.4, { f: 'emerald' }),
    R(10, 13, 44, 42, 5),
    P('M10 24H54'),
    P('M22 8.5V17.5M42 8.5V17.5'),
    dots,
  );
}

{
  const s = [[9, 9], [19, 15], [45, 15], [55, 9]];
  const bez = (t) => { const u = 1 - t; return [0, 1].map((i) => u*u*u*s[0][i] + 3*u*u*t*s[1][i] + 3*u*t*t*s[2][i] + t*t*t*s[3][i]); };
  const yAt = (x) => { let best = null; for (let k = 0; k <= 400; k++) { const p = bez(k / 400); if (!best || Math.abs(p[0] - x) < Math.abs(best[0] - x)) best = p; } return best[1]; };
  const flag = (x, role) => P(`M${r2(x - 4.2)} ${r2(yAt(x - 4.2))}L${r2(x + 4.2)} ${r2(yAt(x + 4.2))}L${r2(x)} ${r2(yAt(x) + 8)}Z`, { f: role });
  add('party-tray', 'Party tray', 'utility',
    flag(19, 'ruby'), flag(32, 'emerald'), flag(45, 'peacock'),
    P('M9 9C19 15 45 15 55 9'),
    P('M10 33.5C10.5 27 17 24.5 21.5 28C24 21.5 36 20 40 26.5C44 23.5 52.5 25.5 54 33.5'),
    R(6, 33.5, 52, 5, 2.5),
    P('M9 38.5L13 52.5H51L55 38.5'),
    P('M22 42.5L23 48.5M32 42.5V48.5M42 42.5L41 48.5'),
  );
}

add('instagram-glyph', 'Instagram', 'social',
  R(10, 10, 44, 44, 13),
  C(32, 32, 10.5),
  gold(44.5, 19.5, 2.3),
);

add('facebook-glyph', 'Facebook', 'social',
  C(32, 32, 23),
  P('M37.5 19.5H34.4C31 19.5 29 21.6 29 25V54.8'),
  P('M23.5 33H37'),
);

add('google-pin-glyph', 'Maps pin', 'social',
  P('M32 57C29.5 52 14 40.5 14 26C14 16.1 22.1 8 32 8C41.9 8 50 16.1 50 26C50 40.5 34.5 52 32 57ZM38.5 26A6.5 6.5 0 1 0 25.5 26A6.5 6.5 0 1 0 38.5 26Z', { f: 'pin', rule: 'evenodd' }),
);

add('menu-book', 'Menu', 'utility',
  P('M38.5 41V32.5C38.5 28.5 41 25.6 44 24C47 25.6 49.5 28.5 49.5 32.5V41Z', { f: 'ruby' }),
  P('M32 17C26 13 17 12.5 8 13.5V50C17 49 26 49.5 32 53'),
  P('M32 17C38 13 47 12.5 56 13.5V50C47 49 38 49.5 32 53'),
  P('M32 17V53'),
  P('M13.5 22H26.5M13.5 28H23M13.5 34H26.5M13.5 40H23'),
);

add('check', 'Check', 'utility',
  P('M14.5 33.5L26.5 45.5L49.5 20.5'),
);

add('arrow-right', 'Arrow right', 'utility',
  P('M6.5 32L10.5 28L14.5 32L10.5 36Z', { f: 'gold' }),
  P('M14.5 32H52'),
  P('M40 20L52 32L40 44'),
);

{
  const q = (x) => [C(x, 38, 7.2, { f: 'gold' }), P(`M${x - 7.1} 37C${x - 7.6} 27 ${x - 3} 20 ${x + 5} 17`)];
  add('quote', 'Quote', 'utility', q(20.5), q(43.5));
}

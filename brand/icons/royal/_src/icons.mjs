// Curry District · ROYAL icons — drawings on a 64×64 grid (keyline 6–58, stroke 1.75).
// Roles: s:'line' = gold stroke · f: 'emerald'|'ruby'|'peacock' = jewel accent fill (tinted in mono)
//        f:'gold'|'pin'|'veg'|'nonveg' = solid fill (solid in mono) · f:'plate' = ivory backing (dropped in mono)
import {
  P, C, E, R, L, T, fillOnly, visibleArcs, insideCircle, below, polar, fmt, samplePath, r2,
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

// ───────────────────────── SPICE SCALE · "chili rosette" ─────────────────────────
// N chilies radiating from a gold medallion: 1 · 2 · 3 · 4 · 5 → line, bar, Y, X, star silhouettes.
function chiliPetal(s, o) {
  return [
    P(scaled('M9.4 -4.5C15 -5.2 22.5 -3.6 28.6 3.4C21 2.6 14.6 4.9 9.4 4.5Z', s, o), fillOnly('ruby')),
    P(scaled('M10.6 -4.9C8.2 -5 6.6 -2.6 6.6 0C6.6 2.6 8.2 5 10.6 4.9C9.6 2.2 9.6 -2.2 10.6 -4.9Z', s, o), { f: 'emerald' }),
    P(scaled('M10.5 -4.75C15.5 -5.2 22.5 -3.6 28.6 3.4C21 2.6 15 4.9 10.5 4.75', s, o)),
    P(scaled('M13.4 -2C17.6 -2.5 21.2 -1.6 24 0.4', s, o)),
    P(`M3.3 0L${r2((6.6 + o) * s)} 0`),
  ];
}
function rosette(n) {
  const cfg = {
    1: { angles: [42], s: 1.28, o: 0.6, hub: [17.5, 19] },
    2: { angles: [-138, 42], s: 0.98, o: 1.2, hub: [32, 32] },
    3: { angles: [-90, 30, 150], s: 0.9, o: 1.2, hub: [32, 33.5] },
    4: { angles: [-135, -45, 45, 135], s: 0.92, o: 1.2, hub: [32, 32] },
    5: { angles: [-90, -18, 54, 126, 198], s: 0.9, o: 1.4, hub: [32, 33] },
  }[n];
  const [hx, hy] = cfg.hub;
  return [
    ...cfg.angles.map((a) => T(`translate(${hx} ${hy}) rotate(${a})`, chiliPetal(cfg.s, cfg.o))),
    C(hx, hy, 3.2, n === 5 ? { f: 'ruby' } : {}),
    gold(hx, hy, 1.1),
  ];
}
const SPICE = ['Mild', 'Medium', 'Hot', 'Extra-Hot', 'District Hot'];
for (let i = 1; i <= 5; i++) add(`chili-${i}`, `Spice ${i} · ${SPICE[i - 1]}`, 'spice', rosette(i));

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

add('naan', 'Naan', 'food',
  P('M19.5 54.5C10.5 51 7.5 39.5 13.5 29C21 16 38.5 9.5 54.5 9C55 22.5 47 38.5 35 48.5C30 52.5 25 55.5 19.5 54.5Z'),
  E(23.5, 42, 3.6, 2.3, { transform: 'rotate(-38 23.5 42)' }),
  C(31, 31.5, 2.7),
  E(42, 22.5, 3, 2, { transform: 'rotate(-38 42 22.5)' }),
  C(19, 33, 1.5),
  gold(29.5, 45.5, 1.3), gold(38.5, 32, 1.5), gold(47.5, 18.5, 1.2), gold(25, 25.5, 1.2), gold(37, 40.5, 1.1),
);

add('samosa', 'Samosa', 'food',
  P('M31 8.5L8.5 46Q22.5 51.5 37.5 55Q48 49.5 55.5 44.5Z'),
  P('M31 8.5L37.5 55'),
  P('M34.6 15.5L40.4 49.5', { dots: 3.8 }),
  gold(19.5, 40, 1.3), gold(25.5, 30, 1.1), gold(28.5, 45, 1.2), gold(24.5, 38.5, 0.9),
);

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
  P('M29 25V41'),
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
  const heap = 'M13 44.5C13 35 19 28.5 25 26.8L23.5 19.5L30.6 25.4C32.8 25 35 25 37 25.4L42.5 18L41.5 27.8C46.5 30.5 51 36 51 44.5C46 49 18 49 13 44.5Z';
  add('chaat-plate', 'Chaat plate', 'food',
    P(heap),
    P('M16.5 38C20 33.5 23 41.5 27 36.5C31 31.5 33 40.5 37 35.5C41 30.5 44 39.5 47.5 35'),
    C(21, 42.4, 1.7, fillOnly('ruby')), C(31.5, 43.6, 1.7, fillOnly('ruby')), C(42, 42.2, 1.7, fillOnly('ruby')),
    gold(26, 31, 0.9), gold(35, 30, 0.9), gold(44, 33.2, 0.9),
    P('M8.5 42.6C4.6 44.2 5 48.6 13 51C24 54 40 54 51 51C59 48.6 59.4 44.2 55.5 42.6'),
    P('M17 52.6L16 56M47 52.6L48 56'),
  );
}

add('chili', 'Chili', 'food',
  P('M15.6 18.5C25 14 36 20 41 31C45 40 48 47 55 53.5C44.5 54.5 35 49 29 42C22.5 34.5 16 28 14.3 22.6C13.8 21 14.3 19.3 15.6 18.5Z', fillOnly('ruby')),
  P('M12 21.5C11.5 16 16.5 11.8 23 13.5C21.8 16.2 20.2 17.6 18 18C17.8 20.4 15.6 22.2 12 21.5Z', { f: 'emerald' }),
  P('M21 16.4C29.5 16.5 37 22.5 41 31C45 40 48 47 55 53.5C44.5 54.5 35 49 29 42C22.5 34.5 17.5 28.5 14.6 21.8'),
  P('M17.4 13.8C16.4 9.6 13.4 7.6 9.4 8'),
  P('M24.5 21.5C30.5 23 35 28 38 34.5'),
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
    P(scaled('M0 0C-3 -1 -7 -3 -7 -7C-9.5 -9 -7.5 -13.5 -4 -12.5C-3 -15.5 3 -15.5 4 -12.5C7.5 -13.5 9.5 -9 7 -7C7 -3 3 -1 0 0Z', s), { f: 'emerald' }),
    P(scaled('M0 -1.2L0 -10.5', s)),
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
  const bevel = [1, 3, 5, 7, 9].map((k) => fmt([[32, 33.5], polar(32, 33.5, 10.4 * 0.62, -90 + k * 36)])).join('');
  add('star', 'Star', 'utility',
    P(fmt(pts) + 'Z'),
    P(bevel),
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
  const mods = [[30, 9.5], [30, 16], [36.5? 0 : 0, 0]].slice(0, 2);
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

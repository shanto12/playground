/* Build every room render + board → ../<name>.svg / .png / -thumb.jpg and ../manifest.json
   node build.js            (all)      node build.js fw-bz      (ids starting with …) */
'use strict';
const fs = require('fs'); const path = require('path'); const { execFileSync } = require('child_process');
const { renderRoom } = require('./room');
const S = require('./scenes');
const B = require('./boards');
const { withBrowser, svgToPng } = require('./render');
const OUT = path.resolve(__dirname, '..');
const only = process.argv.slice(2);

const BADGE = { bazaar: 'A · BAZAAR', royal: 'B · ROYAL' };
const cap = (t, title, sub) => ({ badge: BADGE[t.dir], title, sub });
const ITEMS = [];
const add = (o) => ITEMS.push(o);

/* 1 · feature-wall options (8) */
const FW = [
  ['bz-marigold', 'fw-bazaar-1-marigold-saffron', 'Cream-ground garlands over a saffron wainscot: festival energy that still reads calm above the booth.'],
  ['bz-arches', 'fw-bazaar-2-arches-peacock', 'Jaipur arches echo a street of doorways; peacock beadboard takes the knocks below.'],
  ['bz-booti', 'fw-bazaar-3-booti-indigo', 'Indigo block-print booti makes the pink bay and marigold lamps glow like a night market.'],
  ['bz-chai', 'fw-bazaar-4-chai-rani', 'Chai-time icons tell the story on the wall; rani wainscot and teal booths keep it loud and happy.'],
  ['ry-jali', 'fw-royal-1-jali-midnight', 'Gold jali on midnight catches lantern light in pools — date-night drama with one wallcovering.'],
  ['ry-mehrab', 'fw-royal-2-mehrab-emerald', 'Mehrab arches on emerald frame each booth like an alcove; ivory bay keeps the room bright.'],
  ['ry-paisley', 'fw-royal-3-paisley-ruby', 'Ruby paisley above a plum wainscot: warm, celebratory and photographs beautifully.'],
  ['ry-botanical', 'fw-royal-4-botanical-aubergine', 'Spice botanicals on emerald with an aubergine dado and saffron-gold bay — refined, not stuffy.'],
];
FW.forEach(([k, id, why]) => {
  const t = S.TH[k];
  add({ id, title: `${t.label} — ${t.dir === 'bazaar' ? 'A · Bazaar' : 'B · Royal'}`, direction: t.dir, caption: why, tags: ['wallpaper', 'paint', 'feature-wall'],
    W: 1920, H: 1080, svg: () => renderRoom(S.main(t, { caption: cap(t, t.label, `${t.wp} · ${t.paintName} — illustrative room, not your actual dining room`) })) });
});

/* 2 · before → after pairs */
[['bazaar', 'bz-marigold'], ['royal', 'ry-jali']].forEach(([dir, k]) => {
  const t = S.TH[k];
  const pair = `pair:ba-${dir}`;
  const bef = Object.assign({}, S.BEFORE, { dir });
  add({ id: `ba-${dir}-before`, title: `Before — plain room (${dir === 'bazaar' ? 'A · Bazaar' : 'B · Royal'} pair)`, direction: dir, caption: 'Same illustrative room, typical beige finishes: flat light, loud TVs, nothing to photograph.', tags: ['before-after', pair, 'before'],
    W: 1920, H: 1080, svg: () => renderRoom(S.main(bef, { fonts: dir, caption: { badge: 'BEFORE', title: 'A typical plain dining room', sub: 'Illustrative room — not your actual dining room' } })) });
  add({ id: `ba-${dir}-after`, title: `After — ${t.label}`, direction: dir, caption: 'Same furniture plan: wallpaper, paint, pendants and upholstery do all the work.', tags: ['before-after', pair, 'after'],
    W: 1920, H: 1080, svg: () => renderRoom(S.main(t, { caption: { badge: 'AFTER', title: `${BADGE[dir]} — ${t.label}`, sub: 'Illustrative room — not your actual dining room' } })) });
});

/* 3 · paint boards + colour drench */
['bazaar', 'royal'].forEach((dir) => {
  add({ id: `paint-board-${dir}`, title: `Paint the room — ${dir === 'bazaar' ? 'A · Bazaar' : 'B · Royal'}`, direction: dir, caption: 'Eight named brand colours with finish notes; confirm each with a physical swatch.', tags: ['paint', 'board'], W: 1200, H: 1640, svg: () => B.paintBoard(dir) });
  const t = S.TH[dir === 'bazaar' ? 'bz-drench' : 'ry-drench'];
  add({ id: `drench-${dir}`, title: `${t.label} — paint only`, direction: dir, caption: 'No wallpaper at all: one hue on walls, ceiling and trim is the cheapest big change.', tags: ['paint', 'colour-drench'],
    W: 1920, H: 1080, svg: () => renderRoom(S.main(t, { caption: cap(t, t.label, `${t.paintName} — illustrative room, not your actual dining room`) })) });
});

/* 4 · vignettes */
const V = [
  ['vig-booth-bazaar', 'bz-marigold', 'boothClose', 'Booth close-up — Bazaar', 'Piped channel booth, terrazzo top and an enamel pendant against garland paper.', ['vignette', 'booth', 'wallpaper']],
  ['vig-booth-royal', 'ry-jali', 'boothClose', 'Booth close-up — Royal', 'Emerald velvet channels, brass-edged terrazzo and a jali lantern pooling gold light.', ['vignette', 'booth', 'wallpaper']],
  ['vig-chai-corner-bazaar', 'bz-chai', 'chaiCorner', 'Chai corner — Bazaar', 'A truck-art chai counter with a shelf of glasses: a self-contained photo moment.', ['vignette', 'chai-corner']],
  ['vig-jali-divider-royal', 'ry-jali', 'jaliDivider', 'Jali-screen divider — Royal', 'Brass jali panels split booth rows and break sight-lines without blocking light.', ['vignette', 'jali']],
  ['vig-neon-wall-bazaar', 'bz-chai', 'neonWall', 'Feature wall + neon slot — Bazaar', 'Photo-corner bench on a calm backer panel; the neon art itself comes from the murals team.', ['vignette', 'neon-placeholder', 'photo-corner']],
  ['vig-neon-wall-royal', 'ry-mehrab', 'neonWall', 'Feature wall + neon slot — Royal', 'Arched backer and brass sconces frame the future neon; mehrab paper does the rest.', ['vignette', 'neon-placeholder', 'photo-corner']],
];
V.forEach(([id, k, lay, title, why, tags]) => {
  const t = S.TH[k];
  add({ id, title, direction: t.dir, caption: why, tags, W: 1920, H: 1080, svg: () => renderRoom(S[lay](t, { caption: cap(t, title.split(' — ')[0], `${t.wp} — illustrative, not your actual dining room`) })) });
});

/* 5 · swatch books + spec sheets + scale studies */
['bazaar', 'royal'].forEach((dir) => {
  [0, 1].forEach((pg) => add({ id: `swatch-book-${dir}-${pg + 1}`, title: `Wallpaper swatch book ${pg + 1} — ${dir === 'bazaar' ? 'A · Bazaar' : 'B · Royal'}`, direction: dir, caption: 'Every colourway at 1:1 tile scale with repeat markers and the recommended printed repeat.', tags: ['wallpaper', 'swatch-book'], W: 1500, H: null, svg: () => B.swatchBook(dir, pg) }));
  const combos = FW.filter(([k]) => S.TH[k].dir === dir).map(([k]) => S.TH[k]);
  add({ id: `spec-${dir}`, title: `Feature-wall spec — ${dir === 'bazaar' ? 'A · Bazaar' : 'B · Royal'}`, direction: dir, caption: 'Type II / Class A wallcovering notes, paint schedule and an approx. budget — all from research.', tags: ['spec', 'wallpaper', 'paint'], W: 1200, H: 1980, svg: () => B.specSheet(dir, combos) });
  const t = S.TH[dir === 'bazaar' ? 'bz-marigold' : 'ry-jali'];
  add({ id: `scale-${dir}`, title: `Pattern scale study — ${dir === 'bazaar' ? 'A · Bazaar' : 'B · Royal'}`, direction: dir, caption: 'Same paper at three repeat sizes: why we recommend ~24 in for this room.', tags: ['wallpaper', 'scale'], W: 1920, H: 1080,
    svg: () => B.scaleBoard(dir, [
      { rep: 12, verdict: dir === 'bazaar' ? 'TOO SMALL' : 'Too small', note: 'Motifs blur into texture from across the room — busy, not festive.', svg: renderRoom(S.scalePanel(t, 12)) },
      { rep: 24, verdict: dir === 'bazaar' ? 'JUST RIGHT' : 'Just right', note: 'Motifs read from the door and still feel personal at the table.', good: true, svg: renderRoom(S.scalePanel(t, 24)) },
      { rep: 42, verdict: dir === 'bazaar' ? 'STATEMENT' : 'Statement', note: 'Bold, but booths and frames chop the motifs — best on an empty wall.', svg: renderRoom(S.scalePanel(t, 42)) },
    ]) });
});

/* 6 · costs */
add({ id: 'costs-phased', title: 'What it costs — $500 / $2,500 / $10,000', direction: 'both', caption: 'Three phased plans from research; every line flagged approx. (sourced) or est. (needs a quote).', tags: ['costs', 'budget'], W: 1200, H: null, svg: () => B.costsPhased() });
add({ id: 'costs-ranges', title: 'What it costs — low / mid / high', direction: 'both', caption: 'Low-mid-high ranges for each interior upgrade, so the owners can pick an entry point.', tags: ['costs', 'budget'], W: 1200, H: null, svg: () => B.costsRanges() });

/* ── build ── */
(async () => {
  const todo = ITEMS.filter((it) => !only.length || only.some((o) => it.id.startsWith(o)));
  await withBrowser(async (b) => {
    for (const it of todo) {
      const svg = it.svg();
      const W = +/width="(\d+)"/.exec(svg)[1], H = +/height="(\d+)"/.exec(svg)[1];
      it.w = W; it.h = H;
      fs.writeFileSync(path.join(OUT, it.id + '.svg'), svg);
      await svgToPng(b, svg, path.join(OUT, it.id + '.png'), W, H);
      console.log('ok', it.id, W + 'x' + H, (svg.length / 1024 | 0) + 'KB');
    }
  });
  execFileSync('python3', [path.join(__dirname, 'thumbs.py'), OUT, ...todo.map((t) => t.id)], { stdio: 'inherit' });
  // manifest (merge with existing so partial builds keep other entries)
  const mf = path.join(OUT, 'manifest.json');
  const prev = fs.existsSync(mf) ? JSON.parse(fs.readFileSync(mf, 'utf8')).items : [];
  const byId = {}; prev.forEach((p) => { byId[p.id] = p; });
  ITEMS.forEach((it) => {
    if (!fs.existsSync(path.join(OUT, it.id + '.png'))) return;
    const dims = byId[it.id] && !todo.includes(it) ? { w: byId[it.id].w, h: byId[it.id].h } : { w: it.w, h: it.h };
    byId[it.id] = { id: it.id, title: it.title, direction: it.direction, type: 'image', src: `assets/rooms/${it.id}.png`, thumb: `assets/rooms/${it.id}-thumb.jpg`, w: dims.w, h: dims.h, caption: it.caption, tags: it.tags, download: `assets/rooms/${it.id}.svg` };
  });
  const items = ITEMS.map((it) => byId[it.id]).filter(Boolean);
  fs.writeFileSync(mf, JSON.stringify({ helper: 'rooms', items }, null, 1));
  console.log('manifest items', items.length);
})();

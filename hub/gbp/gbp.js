/* Curry District · Pitch Hub — Google Business Profile makeover (page script)
   Renders: shot-card sketches + rail, photographer brief table, listing-mock tiles,
   checklist (localStorage), copy kit helpers, UTM builder. Vanilla, no deps.
   Sketches are original vector diagrams drawn here (camera angle + light direction). */
(function () {
  'use strict';
  var d = document, de = d.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───────── colours ───────── */
  var C = {
    indigo: '#1D1147', cream: '#FFF4DC', marigold: '#FFB000', saffron: '#FF6A13', rani: '#E4147E', chili: '#D62839',
    teal: '#00A8A0', cilantro: '#3FA34D', midnight: '#160B26', plum: '#4B1D52', emerald: '#0F4D3F', peacock: '#117C86',
    ruby: '#A3173F', gold: '#E9A63A', goldlt: '#F7D98A', ivory: '#FBF3E4', blush: '#F4C9BB',
    slate: '#2E2C36', wood: '#A0683A', steel: '#C9CED6', brass: '#D9A441', terrazzo: '#EFE6D6', iron: '#1E1C22', clay: '#B5643A', kraft: '#C89B6D'
  };
  var FOOD = { sauce: '#E8742A', red: '#C8331F', curry: '#B3261E', naan: '#EBC27C', naanD: '#B9773A', rice: '#F6E3B0', dal: '#F2B33D', saag: '#4E8B3A', lime: '#9CCB3B', onion: '#EFA3C5', cream: '#FFF8EE', skin1: '#C68A5E', skin2: '#8D5A3B', skin3: '#E0B48F', skin4: '#6B4329', jamun: '#7A2E14', syrup: '#D88A2E', lassi: '#FFD27A', chai: '#B9773A', flame: '#FF8A2A', flameY: '#FFC23D' };

  function lum(hex) {
    var n = parseInt(hex.slice(1), 16), r = (n >> 16) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
    var f = function (c) { return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); };
    return .2126 * f(r) + .7152 * f(g) + .0722 * f(b);
  }
  function inkFor(bg, dir) { return lum(bg) > .28 ? (dir === 'royal' ? '#160B26' : '#1D1147') : (dir === 'royal' ? '#FBF3E4' : '#FFF4DC'); }

  /* ───────── the 25-shot list (research/social_gbp_playbook.md §C2) ─────────
     cat = page filter; gbp = Google photo category [K, M]; play = playbook surface/props/light (verbatim-ish) */
  var SHOTS = [
    { n: 1, t: 'Feast overhead', sub: 'six dishes, one table', cat: 'food', gbp: 'Food & drink', sk: 'feast', angle: 'Overhead · 90° · 35 mm', light: 'Soft top light, diffused', play: 'Indigo board, marigold cloth; soft top light', tip: 'Cover candidate. Leave space at the edges because Google crops.',
      A: { bg: C.indigo, c1: C.steel, c2: C.marigold, c3: C.rani, w: 'Indigo board · marigold cloth · steel katoris · rani napkin' },
      B: { bg: C.emerald, c1: C.brass, c2: C.ruby, c3: C.goldlt, w: 'Emerald board · ruby runner · brass katoris · gold-thread napkin' } },
    { n: 2, t: 'Butter chicken + naan dip', sub: 'steam caught in backlight', cat: 'food', gbp: 'Food & drink', sk: 'dip', angle: '45° · 85 mm', light: 'Backlight from 10 o’clock + white bounce front-right', play: 'Dark slate, steel katori; backlight', clip: true,
      A: { bg: C.teal, c1: C.steel, c2: C.slate, c3: C.marigold, w: 'Teal backdrop · dark slate · steel katori · marigold napkin' },
      B: { bg: C.plum, c1: C.brass, c2: C.slate, c3: C.ruby, w: 'Plum backdrop · dark slate · brass katori · ruby napkin' } },
    { n: 3, t: 'Naan tear, buttery pull', sub: 'hands in frame', cat: 'food', gbp: 'Food & drink', sk: 'tear', angle: 'Close-up · macro 100 mm', light: 'Low side light from the left', play: 'Hands, wood board; side light, macro', clip: true,
      A: { bg: C.rani, c1: C.naan, c2: C.wood, c3: C.marigold, w: 'Rani-pink backdrop · wood board · marigold cloth' },
      B: { bg: C.emerald, c1: C.naan, c2: C.wood, c3: C.goldlt, w: 'Emerald backdrop · wood board · gold cloth' } },
    { n: 4, t: 'Tandoor mouth, skewers', sub: 'the fire, not the cook', cat: 'food', gbp: 'At work', sk: 'tandoor', angle: 'Eye level · tripod · 1/60 s', light: 'Flame glow only, room lights dimmed', play: 'Dim room, flame glow; tripod 1/60', flag: 'Shoot from where the kitchen says is safe',
      A: { bg: '#241238', c1: C.clay, c2: '#3A2A20', c3: C.marigold, w: 'Dim room · clay tandoor · let the flame be the colour' },
      B: { bg: C.midnight, c1: C.clay, c2: '#2A1E18', c3: C.gold, w: 'Dim room · clay tandoor · let the flame be the colour' } },
    { n: 5, t: 'Tandoori chicken, sizzling', sub: 'on the cast-iron plate', cat: 'food', gbp: 'Food & drink', sk: 'sizzle', angle: '45° · 50 mm', light: 'Rim light from behind, low', play: 'Black slate, lime; rim light', clip: true,
      A: { bg: C.marigold, c1: C.iron, c2: '#26242B', c3: C.teal, w: 'Marigold backdrop · black slate · lime · teal napkin' },
      B: { bg: C.ruby, c1: C.iron, c2: '#26242B', c3: C.emerald, w: 'Ruby backdrop · black slate · lime · emerald napkin' } },
    { n: 6, t: 'Biryani handi lid-lift', sub: 'the steam moment', cat: 'food', gbp: 'Food & drink', sk: 'handi', angle: '3/4 view · 30° · 50 mm', light: 'Backlight at 3/4 so the steam glows', play: 'Brass handi, steam; backlight 3/4', clip: true, tip: 'Cover candidate.',
      A: { bg: C.indigo, c1: C.brass, c2: C.marigold, c3: C.rani, w: 'Indigo backdrop · marigold cloth · brass handi · rani flowers' },
      B: { bg: C.plum, c1: C.brass, c2: C.emerald, c3: C.goldlt, w: 'Plum backdrop · emerald cloth · brass handi · gold flowers' } },
    { n: 7, t: 'Tikka kabab skewer', sub: 'char marks up close', cat: 'food', gbp: 'Food & drink', sk: 'skewer', angle: 'Macro · 15° · 100 mm', light: 'Hard side light from the left', play: 'Onion rings, lime; side light',
      A: { bg: C.cream, c1: C.steel, c2: C.saffron, c3: C.cilantro, w: 'Cream backdrop · saffron board · onion rings · lime' },
      B: { bg: C.ivory, c1: C.brass, c2: C.emerald, c3: C.ruby, w: 'Ivory backdrop · emerald board · onion rings · lime' } },
    { n: 8, t: 'Vindaloo, chilli garnish', sub: 'colour on colour', cat: 'food', gbp: 'Food & drink', sk: 'plate', angle: '45° · 50 mm', light: 'Side light from the left', play: 'Teal plate on cream; side light',
      A: { bg: C.marigold, c1: C.teal, c2: C.cream, c3: C.chili, w: 'Marigold backdrop · cream linen · teal plate' },
      B: { bg: C.emerald, c1: C.peacock, c2: C.ivory, c3: C.ruby, w: 'Emerald backdrop · ivory linen · peacock plate' } },
    { n: 9, t: 'Tikka masala cream swirl', sub: 'the pour shot', cat: 'food', gbp: 'Food & drink', sk: 'pour', angle: 'Low · 20° · 85 mm', light: 'Window light from the left', play: 'Pour shot; window light left',
      A: { bg: C.saffron, c1: C.steel, c2: C.cream, c3: C.teal, w: 'Saffron backdrop · cream linen · steel bowl · teal jug' },
      B: { bg: C.ruby, c1: C.brass, c2: C.ivory, c3: C.emerald, w: 'Ruby backdrop · ivory linen · brass bowl · emerald jug' } },
    { n: 10, t: 'Indo-Chinese wok toss', sub: 'Gobi Manchurian in the air', cat: 'food', gbp: 'At work', sk: 'wok', angle: 'Eye level · 1/1000 s', light: 'Backlight; fast shutter freezes the toss', play: 'Dark bg; fast shutter, back light', flag: 'Confirm the dish is on today’s menu',
      A: { bg: '#14102A', c1: C.iron, c2: '#2A2238', c3: C.teal, w: 'Dark background · black wok · teal tile edge' },
      B: { bg: C.midnight, c1: C.iron, c2: '#241A30', c3: C.emerald, w: 'Dark background · black wok · emerald tile edge' } },
    { n: 11, t: 'Dessert syrup pour', sub: 'gulab jamun glaze', cat: 'food', gbp: 'Food & drink', sk: 'syrup', angle: '45° · 85 mm', light: 'Soft side light', play: 'Pink glaze, brass spoon; soft side', flag: 'Confirm the dessert is on the menu',
      A: { bg: C.teal, c1: C.rani, c2: C.cream, c3: C.brass, w: 'Teal backdrop · rani-pink plate · brass spoon' },
      B: { bg: C.plum, c1: C.blush, c2: C.ivory, c3: C.brass, w: 'Plum backdrop · blush plate · brass spoon' } },
    { n: 12, t: 'Chai & lassi', sub: 'condensation, glow', cat: 'drink', gbp: 'Food & drink', sk: 'drinks', angle: 'Eye level · 0–15°', light: 'Backlight so the glass glows', play: 'Terrazzo; backlight',
      A: { bg: C.rani, c1: FOOD.lassi, c2: C.terrazzo, c3: C.teal, w: 'Rani backdrop · terrazzo · teal coaster' },
      B: { bg: C.emerald, c1: FOOD.lassi, c2: C.terrazzo, c3: C.gold, w: 'Emerald backdrop · terrazzo · brass coaster' } },
    { n: 13, t: 'Whole-spice flat lay', sub: 'the pantry, styled', cat: 'food', gbp: 'Food & drink', sk: 'spices', angle: 'Overhead · 90°', light: 'Soft top light', play: 'Block-print cloth; top light', flag: 'Block-print motifs only, no sacred symbols',
      A: { bg: C.cream, c1: C.rani, c2: C.steel, c3: C.teal, w: 'Cream block-print cloth (rani & teal) · steel katoris' },
      B: { bg: C.ivory, c1: C.emerald, c2: C.brass, c3: C.ruby, w: 'Ivory block-print cloth (emerald & ruby) · brass katoris' } },
    { n: 14, t: 'Chef hands rolling dough', sub: 'flour in the light', cat: 'people', gbp: 'At work', sk: 'dough', angle: '45° · 50 mm', light: 'Backlight to catch the flour dust', play: 'Flour dust; back light',
      A: { bg: C.marigold, c1: C.rani, c2: C.wood, c3: C.cream, w: 'Marigold wall · wood counter · rani apron' },
      B: { bg: C.emerald, c1: C.ruby, c2: C.wood, c3: C.ivory, w: 'Emerald wall · wood counter · ruby apron' } },
    { n: 15, t: 'Tadka sizzle', sub: 'cumin hits hot oil', cat: 'food', gbp: 'At work', sk: 'tadka', angle: 'Low angle · 10°', light: 'Low side light from the left', play: 'Pan close-up; low-angle side light', clip: true,
      A: { bg: C.indigo, c1: C.iron, c2: C.steel, c3: C.teal, w: 'Indigo backdrop · steel stovetop · black tadka pan' },
      B: { bg: C.midnight, c1: C.iron, c2: C.brass, c3: C.gold, w: 'Midnight backdrop · brass edge · black tadka pan' } },
    { n: 16, t: 'Chef portrait at the pass', sub: 'the face behind the food', cat: 'people', gbp: 'Team', sk: 'portrait', angle: 'Eye level · 35 mm', light: 'Window light from the side', play: '35 mm; window light', flag: 'Signed release',
      A: { bg: C.teal, c1: C.rani, c2: C.marigold, c3: C.cream, w: 'Teal wall · rani apron · marigold pass' },
      B: { bg: C.emerald, c1: C.ruby, c2: C.brass, c3: C.ivory, w: 'Emerald wall · ruby apron · brass pass' } },
    { n: 17, t: 'Team at the entrance', sub: 'menus in hand', cat: 'people', gbp: 'Team', sk: 'team', angle: 'Eye level · 35 mm', light: 'Open shade, no direct sun', play: 'Menu in hand; open shade, GBP “Team”', flag: 'Signed releases',
      A: { bg: C.cream, c1: C.marigold, c2: C.indigo, c3: C.rani, w: 'Cream facade · marigold awning · rani aprons' },
      B: { bg: C.ivory, c1: C.emerald, c2: C.midnight, c3: C.ruby, w: 'Ivory facade · emerald awning · ruby aprons' } },
    { n: 18, t: 'Server presenting platters', sub: 'hospitality in focus', cat: 'people', gbp: 'At work', sk: 'server', angle: 'Eye level · f/2, shallow', light: 'Ambient room light + bounce', play: 'Shallow depth; ambient + bounce', flag: 'Signed release',
      A: { bg: C.indigo, c1: C.marigold, c2: C.steel, c3: C.rani, w: 'Indigo room · marigold apron · steel platter' },
      B: { bg: C.plum, c1: C.gold, c2: C.brass, c3: C.ruby, w: 'Plum room · gold apron · brass platter' } },
    { n: 19, t: 'Exterior, golden hour', sub: 'find-us shot', cat: 'exterior', gbp: 'Exterior', sk: 'facade', angle: 'Straight-on · eye level', light: 'Low sun, golden hour', play: 'Straight-on sign, Suite 200 entrance cue',
      A: { bg: '#FFD27A', c1: C.saffron, c2: '#EADCC4', c3: C.rani, w: 'Warm sky · sign square to camera · Suite 200 door in frame' },
      B: { bg: C.blush, c1: C.gold, c2: '#EADCC4', c3: C.emerald, w: 'Blush sky · sign square to camera · Suite 200 door in frame' } },
    { n: 20, t: 'Exterior, blue hour', sub: 'sign lit, FM 423', cat: 'exterior', gbp: 'Exterior', sk: 'dusk', angle: 'Straight-on · tripod', light: 'Blue hour + the lit sign', play: 'Lit sign, FM 423 context',
      A: { bg: '#232A5C', c1: C.marigold, c2: '#2B2440', c3: C.rani, w: 'Blue-hour sky · lit sign · road context' },
      B: { bg: '#1B1440', c1: C.gold, c2: '#241A30', c3: C.ruby, w: 'Blue-hour sky · lit sign · road context' } },
    { n: 21, t: 'Dining room, wide', sub: 'shoot two angles', cat: 'interior', gbp: 'Interior', sk: 'room', angle: 'Wide · 24 mm · tripod', light: 'All room lights on + daylight', play: '24 mm, tripod, lights on', flag: 'TVs off, tables reset',
      A: { bg: C.cream, c1: C.marigold, c2: '#5B4F85', c3: C.teal, w: 'Lights on · tables set · any new colour on the walls' },
      B: { bg: C.ivory, c1: C.gold, c2: C.plum, c3: C.emerald, w: 'Lights on · tables set · any new colour on the walls' } },
    { n: 22, t: 'Table setting detail', sub: 'napkin, glass, cutlery', cat: 'interior', gbp: 'Interior', sk: 'setting', angle: '45° · 50 mm', light: 'Soft side light', play: 'Napkin, glasses; soft side',
      A: { bg: C.indigo, c1: '#FFFFFF', c2: C.cream, c3: C.teal, w: 'Indigo backdrop · cream linen · teal napkin' },
      B: { bg: C.midnight, c1: C.ivory, c2: C.ivory, c3: C.ruby, w: 'Midnight backdrop · ivory linen · ruby napkin' } },
    { n: 23, t: 'Menu pages, flat', sub: 'readable, no glare', cat: 'menu', gbp: 'Menu', sk: 'menu', angle: 'Straight-on · 90°', light: 'Two soft lights at 45°, no glare', play: 'Straight-on, no glare; GBP “Menu”',
      A: { bg: C.wood, c1: C.cream, c2: C.saffron, c3: C.marigold, w: 'Wood table · cream pages · marigold headers' },
      B: { bg: '#3A2A20', c1: C.ivory, c2: C.ruby, c3: C.gold, w: 'Dark wood · ivory pages · ruby headers' } },
    { n: 24, t: 'Family sharing', sub: 'hands reaching in', cat: 'people', gbp: 'Food & drink', sk: 'family', angle: 'Overhead or 45°', light: 'Soft window light', play: 'Real guests, signed release', flag: 'Real guests, signed releases',
      A: { bg: C.indigo, c1: C.steel, c2: C.marigold, c3: C.rani, w: 'Indigo table · marigold runner · steel katoris' },
      B: { bg: C.emerald, c1: C.brass, c2: C.ruby, c3: C.goldlt, w: 'Emerald table · ruby runner · brass katoris' } },
    { n: 25, t: 'Takeout bag on the counter', sub: 'order ready', cat: 'menu', gbp: 'Food & drink', sk: 'bag', angle: 'Eye level · 15°', light: 'Window light', play: 'Brand packaging; window light', flag: 'No third-party app logos in frame',
      A: { bg: C.teal, c1: C.kraft, c2: C.cream, c3: C.rani, w: 'Teal wall · cream counter · rani sticker on kraft' },
      B: { bg: C.plum, c1: C.kraft, c2: C.ivory, c3: C.gold, w: 'Plum wall · ivory counter · gold sticker on kraft' } }
  ];
  var CATS = [['all', 'All'], ['food', 'Food'], ['drink', 'Drink'], ['people', 'People'], ['interior', 'Interior'], ['exterior', 'Exterior'], ['menu', 'Menu & takeout']];
  var SHOT = {}; SHOTS.forEach(function (s) { SHOT[s.n] = s; });

  /* ───────── SVG sketch kit (viewBox 240×160) ───────── */
  function f(n) { return Math.round(n * 10) / 10; }
  function steam(cx, y, n, h, sp) {
    n = n || 3; h = h || 30; sp = sp || 12; var o = '<g class="stm">';
    for (var i = 0; i < n; i++) {
      var x = cx + (i - (n - 1) / 2) * sp, s = i % 2 ? -1 : 1;
      o += '<path class="k soft" d="M' + x + ' ' + y + 'c' + (-5 * s) + ' -' + (h / 4) + ' ' + (5 * s) + ' -' + (h / 2.6) + ' 0 -' + (h / 2) + 's' + (5 * s) + ' -' + (h / 3.6) + ' 0 -' + (h / 2) + '"/>';
    }
    return o + '</g>';
  }
  function table(y, cls) { y = y || 118; return '<rect class="' + (cls || 'c2') + '" x="-2" y="' + y + '" width="244" height="' + (164 - y) + '"/><path class="k" d="M-2 ' + y + 'H242"/>'; }
  function bowl(cx, base, w, h, cls, food) {
    var x0 = cx - w / 2, x1 = cx + w / 2, top = base - h;
    return '<path class="o ' + (cls || 'c1') + '" d="M' + f(x0) + ' ' + f(top) + 'C' + f(x0) + ' ' + f(base - h * .1) + ' ' + f(cx - w * .32) + ' ' + base + ' ' + f(cx - w * .2) + ' ' + base + 'H' + f(cx + w * .2) + 'C' + f(cx + w * .32) + ' ' + base + ' ' + f(x1) + ' ' + f(base - h * .1) + ' ' + f(x1) + ' ' + f(top) + 'Z"/>' +
      '<ellipse class="o" fill="' + (food || FOOD.sauce) + '" cx="' + cx + '" cy="' + f(top) + '" rx="' + f(w / 2) + '" ry="' + f(Math.max(3, w * .09)) + '"/>';
  }
  function plateTop(cx, cy, r, food, cls) {
    return '<circle class="o ' + (cls || 'c1') + '" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/><circle class="o" fill="' + food + '" cx="' + cx + '" cy="' + cy + '" r="' + f(r * .72) + '"/>';
  }
  function flower(cx, cy, r, cls) {
    var o = '<g class="' + (cls || 'c3') + '">';
    for (var i = 0; i < 6; i++) { var a = i * Math.PI / 3; o += '<circle cx="' + f(cx + Math.cos(a) * r * .55) + '" cy="' + f(cy + Math.sin(a) * r * .55) + '" r="' + f(r * .5) + '"/>'; }
    return o + '<circle class="o lt" cx="' + cx + '" cy="' + cy + '" r="' + f(r * .35) + '"/></g>';
  }
  function hand(x, y, rot, skin, flip) {
    var sx = flip ? -1 : 1;
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ') scale(' + sx + ' 1)"><path class="o" fill="' + skin + '" d="M-34 -9H-6c6 0 10 3 12 7l5 1c4 1 4 6 0 6H8c-2 3-6 5-11 5h-31z"/><path class="k soft" d="M-6 -2h9M-4 3h8"/></g>';
  }
  function cam(x, y, tx, ty, label, lx, ly) {
    var a = Math.atan2(ty - y, tx - x), deg = a * 180 / Math.PI;
    var ex = x + (tx - x) * .78, ey = y + (ty - y) * .78;
    return '<g class="ov"><path class="dash" d="M' + f(x + Math.cos(a) * 16) + ' ' + f(y + Math.sin(a) * 16) + 'L' + f(ex) + ' ' + f(ey) + '"/>' +
      '<g transform="translate(' + x + ' ' + y + ') rotate(' + f(deg) + ')"><rect class="cam" x="-13" y="-8.5" width="20" height="17" rx="3.5"/><rect class="cam" x="6" y="-6" width="9" height="12" rx="2"/><circle class="camdot" cx="-7" cy="-3.5" r="1.8"/></g>' +
      (label ? tag(lx == null ? x - 18 : lx, ly == null ? y - 18 : ly, label) : '') + '</g>';
  }
  function camTop(x, y, label) {
    return '<g class="ov"><rect class="cam" x="' + (x - 12) + '" y="' + (y - 10) + '" width="24" height="20" rx="4"/><circle class="camlens" cx="' + x + '" cy="' + y + '" r="6.5"/><circle class="camdot" cx="' + (x + 7) + '" cy="' + (y - 6) + '" r="1.6"/>' + (label ? tag(x - 50, y + 3, label) : '') + '</g>';
  }
  /* light: kind lamp|sun|window; draws a beam wedge to target */
  function light(x, y, tx, ty, kind, label, lx, ly, spread) {
    var a = Math.atan2(ty - y, tx - x), px = -Math.sin(a), py = Math.cos(a), s1 = 5, s2 = spread || 26;
    var ex = tx - Math.cos(a) * 6, ey = ty - Math.sin(a) * 6;
    var beam = '<path class="beam" d="M' + f(x + px * s1) + ' ' + f(y + py * s1) + 'L' + f(ex + px * s2) + ' ' + f(ey + py * s2) + 'L' + f(ex - px * s2) + ' ' + f(ey - py * s2) + 'L' + f(x - px * s1) + ' ' + f(y - py * s1) + 'Z"/>';
    var g = '';
    if (kind === 'sun') {
      g = '<circle class="o lt" cx="' + x + '" cy="' + y + '" r="8"/>';
      for (var i = 0; i < 8; i++) { var b = i * Math.PI / 4; g += '<path class="k" d="M' + f(x + Math.cos(b) * 11) + ' ' + f(y + Math.sin(b) * 11) + 'L' + f(x + Math.cos(b) * 15) + ' ' + f(y + Math.sin(b) * 15) + '"/>'; }
    } else if (kind === 'window') {
      g = '<rect class="o lt" x="' + (x - 11) + '" y="' + (y - 15) + '" width="22" height="30" rx="2"/><path class="k" d="M' + x + ' ' + (y - 15) + 'V' + (y + 15) + 'M' + (x - 11) + ' ' + y + 'H' + (x + 11) + '"/>';
    } else {
      g = '<g transform="translate(' + x + ' ' + y + ') rotate(' + f(a * 180 / Math.PI) + ')"><path class="o lt" d="M-9 -13L6 -7V7L-9 13Z"/><path class="k" d="M-9 -13V13"/></g>';
    }
    var arrow = '<path class="arw" d="M' + f(x + Math.cos(a) * 18) + ' ' + f(y + Math.sin(a) * 18) + 'L' + f(x + Math.cos(a) * 38) + ' ' + f(y + Math.sin(a) * 38) + '"/>' +
      '<path class="arwh" d="M' + f(x + Math.cos(a) * 42) + ' ' + f(y + Math.sin(a) * 42) + 'l' + f(Math.cos(a + 2.6) * 7) + ' ' + f(Math.sin(a + 2.6) * 7) + 'l' + f(Math.cos(a - 2.6) * 7 - Math.cos(a + 2.6) * 7) + ' ' + f(Math.sin(a - 2.6) * 7 - Math.sin(a + 2.6) * 7) + 'z"/>';
    return '<g class="ov">' + beam + g + arrow + (label ? tag(lx == null ? x - 14 : lx, ly == null ? y + 26 : ly, label) : '') + '</g>';
  }
  function beamOnly(x, y, tx, ty, spread) {
    var a = Math.atan2(ty - y, tx - x), px = -Math.sin(a), py = Math.cos(a), s2 = spread || 26;
    return '<path class="beam" d="M' + f(x + px * 5) + ' ' + f(y + py * 5) + 'L' + f(tx + px * s2) + ' ' + f(ty + py * s2) + 'L' + f(tx - px * s2) + ' ' + f(ty - py * s2) + 'L' + f(x - px * 5) + ' ' + f(y - py * 5) + 'Z"/>';
  }
  function bounce(x, y, h) { return '<g class="ov"><rect class="o bnc" x="' + x + '" y="' + (y - h) + '" width="6" height="' + h + '" rx="1.5" transform="rotate(-10 ' + x + ' ' + y + ')"/>' + tag(x - 20, y - h - 8, 'bounce') + '</g>'; }
  function tag(x, y, txt) {
    var w = Math.round(txt.length * 5.3 + 12);
    if (x + w > 236) x = 236 - w; if (x < 4) x = 4;
    return '<g class="tagg"><rect class="tagbg" x="' + f(x) + '" y="' + f(y - 9.5) + '" width="' + w + '" height="14" rx="7"/><text class="tagtx" x="' + f(x + 6) + '" y="' + f(y + 1) + '">' + txt + '</text></g>';
  }
  function dots(n, x0, y0, w, h, r, cls, seed) {
    var o = '', s = seed || 7;
    for (var i = 0; i < n; i++) { s = (s * 9301 + 49297) % 233280; var rx = s / 233280; s = (s * 9301 + 49297) % 233280; var ry = s / 233280; o += '<circle class="' + cls + '" cx="' + f(x0 + rx * w) + '" cy="' + f(y0 + ry * h) + '" r="' + r + '"/>'; }
    return o;
  }

  var SK = {
    feast: function (full) {
      var o = '<path class="c2" d="M-2 112L120 164H-2Z"/><path class="k" d="M-2 112L120 164"/>' + dots(10, 8, 128, 60, 30, 1.6, 'c3', 3);
      o += plateTop(64, 52, 21, FOOD.sauce) + plateTop(116, 42, 16, FOOD.saag) + plateTop(166, 54, 22, FOOD.rice) + dots(9, 152, 42, 28, 24, 1.3, 'c3', 11);
      o += plateTop(80, 104, 18, FOOD.dal) + plateTop(132, 96, 20, FOOD.red) + plateTop(184, 108, 15, FOOD.curry);
      o += '<path class="o" fill="' + FOOD.naan + '" d="M28 86c10-12 30-8 34 4s-8 22-22 20-20-12-12-24z"/><circle fill="' + FOOD.naanD + '" cx="42" cy="94" r="2.4"/><circle fill="' + FOOD.naanD + '" cx="50" cy="100" r="1.8"/>';
      o += flower(208, 24, 9) + flower(18, 30, 7);
      if (full) o += '<g class="ov"><rect class="beam beam--soft" x="40" y="10" width="170" height="130" rx="20"/></g>' + camTop(212, 140, '90° overhead') + tag(10, 152, 'soft top light');
      return o;
    },
    dip: function (full) {
      var o = table(118) + '<path class="c3 o" d="M150 118l40-12 30 12z"/>';
      o += bowl(104, 118, 80, 30, 'c1', FOOD.sauce) + '<path class="k soft" d="M84 89q10 4 20 0t20 0"/>';
      o += '<path class="o" fill="' + FOOD.naan + '" d="M108 84L150 40c6-6 16-2 14 6L126 92z"/><circle fill="' + FOOD.naanD + '" cx="146" cy="52" r="2.2"/><circle fill="' + FOOD.naanD + '" cx="136" cy="64" r="1.8"/>';
      o += steam(92, 80, 3, 36, 11);
      if (full) o += light(28, 30, 96, 80, 'lamp', 'backlight 10 o’clock', 6, 58) + bounce(222, 116, 34) + cam(206, 58, 120, 96, '45°', 186, 36);
      return o;
    },
    tear: function (full) {
      var o = table(126) + '<path class="c3" d="M150 126h92v38h-92z" opacity=".9"/>';
      o += '<path class="o" fill="' + FOOD.naan + '" d="M44 70c14-14 50-10 60 2l-6 34c-18 8-48 6-58-6z"/><path class="o" fill="' + FOOD.naan + '" d="M200 66c-14-12-46-8-58 4l6 34c18 8 44 6 54-6z"/>';
      o += '<path class="k soft" d="M104 80q20 6 40-2M104 90q20 8 42 0M102 100q22 6 44-2"/>';
      o += '<circle fill="' + FOOD.naanD + '" cx="62" cy="80" r="2.4"/><circle fill="' + FOOD.naanD + '" cx="78" cy="96" r="2"/><circle fill="' + FOOD.naanD + '" cx="176" cy="84" r="2.2"/><path fill="' + FOOD.lassi + '" class="o" d="M120 104q3 8 0 12q-3-4 0-12z"/>';
      o += hand(60, 86, -8, FOOD.skin1) + hand(184, 82, 8, FOOD.skin3, true);
      if (full) o += light(14, 108, 70, 92, 'lamp', 'low side light', 4, 146) + tag(150, 22, 'macro · 100 mm');
      return o;
    },
    tandoor: function (full) {
      var o = '<rect class="c2" x="-2" y="138" width="244" height="26"/><circle fill="' + FOOD.flameY + '" opacity=".22" cx="110" cy="64" r="64"/><circle fill="' + FOOD.flame + '" opacity=".22" cx="110" cy="64" r="40"/>';
      o += '<path class="o c1" d="M62 66h96v62c0 8-6 12-14 12H76c-8 0-14-4-14-12z"/><path class="k soft" d="M66 92h88M66 112h88"/>';
      o += '<ellipse class="o" fill="#3A1A0E" cx="110" cy="66" rx="48" ry="11"/><path fill="' + FOOD.flame + '" d="M80 68c4-14 10-8 12-18 4 10 10 6 10 18zM104 68c2-16 10-12 12-24 4 12 12 10 10 24zM128 68c4-10 8-8 10-16 4 8 8 8 6 16z"/><path fill="' + FOOD.flameY + '" d="M92 68c2-6 4-4 6-10 2 6 4 4 4 10zM114 68c2-8 6-6 6-12 2 6 6 6 4 12z"/>';
      o += '<path class="k" d="M96 60L150 14M112 60L172 22M128 62L190 34"/>';
      [[134, 39, 0], [148, 27, 1], [154, 43, 0], [170, 33, 1], [176, 48, 0]].forEach(function (p) { o += '<circle class="o" fill="' + (p[2] ? FOOD.red : FOOD.sauce) + '" cx="' + p[0] + '" cy="' + p[1] + '" r="5"/>'; });
      if (full) {
        o += '<g class="ov"><path class="k" d="M214 86l-12 52M214 86l12 52M214 86v52"/></g>' + cam(214, 76, 120, 70, 'tripod · 1/60 s', 168, 104);
        o += tag(8, 22, 'flame glow only');
      }
      return o;
    },
    sizzle: function (full) {
      var o = table(120) + '<ellipse class="o" fill="#5A3A22" cx="112" cy="118" rx="70" ry="10"/><ellipse class="o c1" cx="112" cy="112" rx="62" ry="12"/>';
      o += '<path class="o" fill="' + FOOD.red + '" d="M70 108c2-14 22-16 30-6s-2 14-14 14-16-2-16-8z"/><path class="o" fill="' + FOOD.sauce + '" d="M104 106c4-12 26-12 30-2 2 8-8 12-18 12s-14-4-12-10z"/><path class="o" fill="' + FOOD.red + '" d="M136 108c4-8 18-8 20 0 0 6-6 8-12 8s-8-2-8-8z"/>';
      o += '<path class="o" fill="' + FOOD.lime + '" d="M156 112a10 10 0 0 1 18-4z"/><ellipse class="k" cx="90" cy="112" rx="8" ry="3"/><path class="c3 o" d="M190 120l30-10 20 10z"/>';
      o += steam(112, 96, 4, 44, 14);
      if (full) o += light(30, 82, 92, 104, 'lamp', 'rim light', 6, 60, 18) + cam(208, 54, 128, 104, '45°', 188, 32);
      return o;
    },
    handi: function (full) {
      var o = table(124) + flower(186, 132, 8) + flower(206, 140, 7) + flower(30, 138, 7);
      o += '<path class="o c1" d="M70 82h76c2 8 18 14 18 30 0 10-12 14-56 14s-56-4-56-14c0-16 16-22 18-30z"/><path class="k soft" d="M64 104h88"/><ellipse class="o c1" cx="108" cy="82" rx="40" ry="7"/><ellipse class="o" fill="' + FOOD.rice + '" cx="108" cy="82" rx="34" ry="5"/>';
      o += '<g transform="rotate(-22 168 44)"><ellipse class="o c1" cx="150" cy="48" rx="36" ry="7"/><path class="o c1" d="M140 42h20v-6h-20z"/></g>';
      o += hand(214, 34, 160, FOOD.skin2);
      o += steam(104, 74, 4, 52, 12);
      if (full) o += light(24, 34, 98, 70, 'lamp', 'backlight 3/4', 4, 62) + cam(212, 98, 130, 92, '30°', 196, 120);
      return o;
    },
    skewer: function (full) {
      var o = table(124) + '<path class="k" d="M30 116L214 56" stroke-width="3"/>';
      [[66, 102, FOOD.red], [96, 92, FOOD.sauce], [126, 82, FOOD.red], [156, 72, FOOD.sauce], [184, 63, FOOD.red]].forEach(function (p) {
        o += '<rect class="o" fill="' + p[2] + '" x="' + (p[0] - 12) + '" y="' + (p[1] - 11) + '" width="24" height="22" rx="7" transform="rotate(-18 ' + p[0] + ' ' + p[1] + ')"/><path class="k soft" d="M' + (p[0] - 6) + ' ' + (p[1] - 2) + 'l6 -6M' + (p[0] - 2) + ' ' + (p[1] + 4) + 'l6 -6"/>';
      });
      o += '<ellipse class="k" stroke="' + FOOD.onion + '" cx="58" cy="132" rx="16" ry="5"/><ellipse class="k" cx="58" cy="132" rx="9" ry="3"/><path class="o" fill="' + FOOD.lime + '" d="M180 132a12 12 0 0 1 22-6z"/>';
      if (full) o += '<g class="ov"><circle class="k" cx="126" cy="82" r="30" stroke-dasharray="4 4"/></g>' + light(14, 40, 80, 92, 'lamp', 'hard side light', 6, 18) + cam(220, 104, 156, 86, 'macro 15°', 168, 146);
      return o;
    },
    plate: function (full) {
      var o = table(120);
      o += '<path class="o c1" d="M44 108h132c-4 10-20 14-66 14s-62-4-66-14z"/><ellipse class="o c1" cx="110" cy="108" rx="66" ry="10"/><ellipse class="o" fill="' + FOOD.curry + '" cx="110" cy="106" rx="44" ry="7"/>';
      o += '<path class="o" fill="' + FOOD.lime + '" d="M96 100c8-8 20-10 24-6-8 0-16 4-22 9z"/><path class="o c3" d="M118 102c10-10 24-10 26-4-8-2-16 2-24 6z"/><circle class="o" fill="' + FOOD.cream + '" cx="104" cy="106" r="3"/><circle class="o" fill="' + FOOD.cream + '" cx="126" cy="107" r="2.4"/>';
      o += steam(110, 92, 3, 30, 12);
      if (full) o += light(18, 72, 70, 102, 'lamp', 'side light', 4, 52) + cam(206, 50, 128, 100, '45°', 186, 28);
      return o;
    },
    pour: function (full) {
      var o = table(124) + bowl(112, 124, 86, 30, 'c1', FOOD.sauce);
      o += '<path class="k" stroke="' + FOOD.cream + '" stroke-width="3" d="M90 93c10 4 26 4 34-2-6-2-16-2-20 2"/>';
      o += '<g transform="rotate(38 150 40)"><path class="o c3" d="M134 22h30l-4 34h-22z"/><path class="o c3" d="M164 28c8 0 10 12 0 14"/><path class="o c3" d="M130 22l-6 -4h12z"/></g>';
      o += '<path fill="' + FOOD.cream + '" class="o" d="M122 50c-2 10-6 24-8 42h4c2-16 6-30 8-40z"/>';
      if (full) o += light(20, 70, 86, 96, 'window', 'window light', 4, 104) + cam(214, 102, 150, 98, 'low 20°', 176, 146);
      return o;
    },
    wok: function (full) {
      var o = table(132) + '<path fill="' + FOOD.flame + '" d="M80 132c4-10 8-6 10-14 4 8 8 6 8 14zM112 132c2-12 8-10 10-18 4 10 10 8 8 18zM140 132c4-8 6-6 8-12 4 6 6 6 6 12z"/>';
      o += '<path class="o c1" d="M64 104h104c-4 18-24 26-52 26s-48-8-52-26z"/><path class="k" d="M168 106l44-12" stroke-width="5"/>';
      [[90, 70, FOOD.dal], [110, 52, FOOD.red], [132, 44, FOOD.dal], [154, 56, FOOD.red], [102, 86, FOOD.red], [140, 76, FOOD.dal]].forEach(function (p) { o += '<circle class="o" fill="' + p[2] + '" cx="' + p[0] + '" cy="' + p[1] + '" r="6"/>'; });
      o += '<path class="dash" d="M78 96c4-40 70-60 96-20"/><path class="o" fill="' + FOOD.saag + '" d="M120 64c6-6 14-4 14 0-6 0-10 2-14 4z"/>';
      if (full) o += light(30, 26, 108, 62, 'lamp', 'backlight', 6, 54) + cam(214, 50, 150, 64, '1/1000 s', 176, 30);
      return o;
    },
    syrup: function (full) {
      var o = table(122) + '<ellipse class="o c1" cx="110" cy="116" rx="64" ry="12"/>';
      o += '<circle class="o" fill="' + FOOD.jamun + '" cx="88" cy="104" r="13"/><circle class="o" fill="' + FOOD.jamun + '" cx="116" cy="100" r="14"/><circle class="o" fill="' + FOOD.jamun + '" cx="140" cy="106" r="12"/>';
      o += '<path fill="#fff" opacity=".6" d="M84 98a5 3 0 0 1 8-2M112 93a5 3 0 0 1 8-2"/><ellipse fill="' + FOOD.syrup + '" opacity=".8" cx="112" cy="114" rx="44" ry="5"/>';
      o += '<g transform="rotate(-24 150 40)"><ellipse class="o c3" cx="130" cy="42" rx="16" ry="8"/><path class="o c3" d="M144 40h56v5h-56z"/></g>';
      o += '<path class="o" fill="' + FOOD.syrup + '" d="M118 52c2 12-2 26 0 36 2 0 4-1 4-2-2-12 2-22 0-34z"/>';
      if (full) o += light(16, 64, 78, 98, 'lamp', 'soft side', 4, 44, 32) + cam(212, 70, 146, 102, '45°', 190, 50);
      return o;
    },
    drinks: function (full) {
      var o = table(122) + dots(26, 0, 126, 240, 34, 1.6, 'k-f', 5) + '<ellipse class="o c3" cx="84" cy="122" rx="28" ry="5"/>';
      o += '<path class="o glass" d="M66 44h36l-4 78H70z"/><path class="o" fill="' + FOOD.lassi + '" d="M68 58h32l-3 62H71z"/>' + dots(10, 72, 64, 24, 50, 1.6, 'wht', 21) + '<path class="k" d="M98 40l14 -22" stroke-width="3"/>';
      o += '<path class="o" fill="#FFFFFF" d="M136 96h46c0 18-10 26-23 26s-23-8-23-26z"/><path class="o" fill="' + FOOD.chai + '" d="M138 98h42c0 2-1 6-2 8h-38c-1-2-2-6-2-8z"/><path class="k" d="M182 102c10 0 10 12-2 12"/><ellipse class="o" fill="#FFFFFF" cx="159" cy="122" rx="34" ry="4"/>';
      o += steam(159, 90, 2, 30, 12);
      if (full) o += light(34, 26, 84, 62, 'lamp', 'backlight', 2, 58) + cam(218, 78, 150, 92, 'eye level', 180, 56);
      return o;
    },
    spices: function (full) {
      var o = '';
      for (var y = 14; y < 160; y += 26) for (var x = 14 + ((y / 26) % 2) * 13; x < 240; x += 26) o += '<g class="c1" opacity=".5"><circle cx="' + x + '" cy="' + (y - 4) + '" r="2.6"/><circle cx="' + x + '" cy="' + (y + 4) + '" r="2.6"/><circle cx="' + (x - 4) + '" cy="' + y + '" r="2.6"/><circle cx="' + (x + 4) + '" cy="' + y + '" r="2.6"/></g>';
      o += plateTop(70, 54, 22, FOOD.dal, 'c2') + plateTop(132, 46, 20, FOOD.red, 'c2') + plateTop(184, 76, 22, '#8A6A3A', 'c2') + plateTop(96, 112, 20, FOOD.saag, 'c2');
      o += dots(14, 170, 64, 28, 24, 1.4, 'k-f', 9);
      o += '<g transform="translate(150 118)">' + [0, 45, 90, 135].map(function (a) { return '<ellipse class="o" fill="#6B3A1E" rx="11" ry="3.2" transform="rotate(' + a + ')"/>'; }).join('') + '</g>';
      o += '<rect class="o" fill="#8A4A24" x="26" y="96" width="40" height="7" rx="3.5" transform="rotate(-24 46 100)"/><rect class="o" fill="#8A4A24" x="28" y="106" width="40" height="7" rx="3.5" transform="rotate(-24 48 110)"/>';
      o += '<ellipse class="o" fill="' + FOOD.saag + '" cx="196" cy="128" rx="6" ry="3.6"/><ellipse class="o" fill="' + FOOD.saag + '" cx="208" cy="136" rx="6" ry="3.6"/><ellipse class="o" fill="' + FOOD.saag + '" cx="190" cy="140" rx="6" ry="3.6"/>';
      if (full) o += camTop(214, 24, '90° flat lay') + tag(8, 152, 'soft top light');
      return o;
    },
    dough: function (full) {
      var o = '<path class="o c1" d="M70 -4h100l-6 66H76z"/><path class="k soft" d="M96 -4v26M144 -4v26"/>' + table(104);
      o += '<ellipse class="o" fill="#F5E6C8" cx="120" cy="122" rx="62" ry="16"/><rect class="o" fill="#D9B38C" x="44" y="100" width="152" height="12" rx="6"/>';
      o += hand(72, 98, 0, FOOD.skin2) + hand(170, 98, 0, FOOD.skin2, true);
      o += dots(30, 40, 50, 160, 50, 1.5, 'wht', 13);
      if (full) o += light(214, 18, 150, 66, 'lamp', 'backlight', 170, 52) + cam(26, 40, 96, 104, '45°', 8, 20);
      return o;
    },
    tadka: function (full) {
      var o = table(124) + '<path class="o c1" d="M70 102h96c-2 14-18 22-48 22s-46-8-48-22z"/><path class="k" d="M166 104l50 -6" stroke-width="5"/><ellipse class="o" fill="#E0A23A" cx="118" cy="102" rx="46" ry="6"/>';
      o += dots(18, 82, 60, 74, 38, 2, 'seed', 4) + '<path class="o" fill="' + FOOD.saag + '" d="M96 96c6-10 18-10 20-4-8 0-14 2-20 6zM130 98c4-10 16-12 20-6-8 0-14 2-20 8z"/>';
      o += '<path class="k soft" d="M88 84l-6 -8M150 82l6 -8M118 74v-10"/>';
      if (full) o += light(14, 112, 76, 100, 'lamp', 'low side', 4, 92, 18) + cam(220, 116, 150, 100, 'low 10°', 170, 148);
      return o;
    },
    portrait: function (full) {
      var o = '<rect class="c2" x="-2" y="132" width="244" height="32"/><path class="k" d="M-2 132H242"/>';
      o += '<path class="o shirt" d="M66 160c0-34 20-50 54-50s54 16 54 50z"/><path class="o c1" d="M92 118h56l6 42H86z"/><path class="k" d="M100 118l10-10M140 118l-10-10"/>';
      o += '<rect class="o" fill="' + FOOD.skin2 + '" x="110" y="96" width="20" height="16" rx="6"/><ellipse class="o" fill="' + FOOD.skin2 + '" cx="120" cy="74" rx="24" ry="28"/><path class="inkf" d="M96 70c0-22 12-32 24-32s26 8 24 32c-6-10-14-14-24-14s-18 4-24 14z"/>';
      o += '<path class="k soft" d="M110 86q10 6 20 0"/>';
      if (full) o += light(16, 50, 92, 74, 'window', 'window light', 4, 92) + tag(170, 22, '35 mm · eye level');
      return o;
    },
    team: function (full) {
      var o = '<path class="o c1" d="M-2 10h244v20H-2z"/>' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (i) { return '<path class="o bgf" d="M' + (i * 24 + 2) + ' 30q10 12 20 0z"/>'; }).join('');
      o += '<path class="o c2" d="M92 140V70a28 28 0 0 1 56 0v70z"/><path class="k soft" d="M120 46v94"/>' + table(140, 'pave');
      [[54, FOOD.skin1, 'c3', 1], [120, FOOD.skin4, 'c1', 0], [186, FOOD.skin3, 'c3', 0]].forEach(function (p, i) {
        var x = p[0], h = i === 1 ? 0 : 6;
        o += '<path class="o shirt" d="M' + (x - 22) + ' 140c0-32 8-46 22-46s22 14 22 46z"/><path class="o ' + p[2] + '" d="M' + (x - 13) + ' 104h26l4 36h-34z"/><circle class="o" fill="' + p[1] + '" cx="' + x + '" cy="' + (78 + h) + '" r="14"/><path class="inkf" d="M' + (x - 14) + ' ' + (76 + h) + 'c0-12 6-16 14-16s14 4 14 16c-4-6-8-8-14-8s-10 2-14 8z"/>';
        if (p[3]) o += '<rect class="o menuf" x="' + (x + 6) + '" y="108" width="16" height="22" rx="2" transform="rotate(10 ' + (x + 14) + ' 118)"/>';
      });
      if (full) o += tag(8, 152, 'open shade') + tag(150, 152, '35 mm · eye level');
      return o;
    },
    server: function (full) {
      var o = '<g class="bokeh"><circle class="c1" cx="30" cy="30" r="16"/><circle class="c3" cx="206" cy="40" r="20"/><circle class="c1" cx="190" cy="120" r="12"/><circle class="lt" cx="44" cy="110" r="14"/><circle class="c3" cx="70" cy="18" r="8"/></g>';
      o += '<path class="o shirt" d="M70 164c0-44 20-66 50-66s50 22 50 66z"/><path class="o c1" d="M96 112h48l8 52H88z"/>';
      o += '<ellipse class="o" fill="' + FOOD.skin1 + '" cx="120" cy="70" rx="20" ry="24"/><path class="inkf" d="M100 66c0-18 10-26 20-26s22 6 20 26c-6-8-12-12-20-12s-14 4-20 12z"/>';
      o += '<path class="o shirt" d="M84 126c10 8 30 10 36 4"/><ellipse class="o c2" cx="120" cy="128" rx="58" ry="10"/><ellipse class="o" fill="' + FOOD.red + '" cx="102" cy="122" rx="14" ry="5"/><ellipse class="o" fill="' + FOOD.rice + '" cx="134" cy="122" rx="16" ry="5"/>';
      if (full) o += tag(8, 152, 'f/2 · shallow depth') + bounce(222, 150, 30);
      return o;
    },
    facade: function (full) {
      var o = '<circle class="lt" cx="34" cy="96" r="18"/><circle fill="#fff" opacity=".35" cx="34" cy="96" r="28"/>';
      o += '<path class="o c2" d="M50 40h160v102H50z"/><path class="o c1" d="M62 50h136v22H62z"/><path class="sign" d="M78 61h104" stroke-width="4" stroke-linecap="round"/>';
      o += '<path class="o glassw" d="M64 84h48v58H64zM150 84h48v58h-48z"/><path class="o c3" d="M118 84h28v58h-28z"/><text class="tagtx2" x="132" y="80" text-anchor="middle">SUITE 200</text>';
      o += table(142, 'pave') + '<path class="shadow" d="M210 142l30 10v12h-60zM50 142l60 22H50z"/>';
      if (full) o += tag(8, 22, 'golden hour') + tag(150, 156, 'straight-on');
      return o;
    },
    dusk: function (full) {
      var o = dots(18, 6, 6, 228, 40, 1.2, 'wht', 31) + '<circle fill="#fff" opacity=".85" cx="206" cy="22" r="9"/><circle class="bgf" cx="210" cy="19" r="8"/>';
      o += '<path class="o c2" d="M40 46h160v82H40z"/><circle class="c1" opacity=".28" cx="120" cy="64" r="44"/><path class="o c1" d="M54 54h132v20H54z"/><path class="sign2" d="M70 64h100" stroke-width="4" stroke-linecap="round"/>';
      o += '<path class="o lt" d="M54 84h40v44H54zM146 84h40v44h-40z"/><path class="o lt" d="M104 84h32v44h-32z" opacity=".9"/>';
      o += '<rect class="road" x="-2" y="128" width="244" height="36"/><path class="trail1" d="M-2 146c60-6 180-6 244 0"/><path class="trail2" d="M-2 154c70-4 170-4 244 0"/>';
      if (full) o += tag(8, 22, 'blue hour · tripod') + tag(170, 142, 'road in frame');
      return o;
    },
    room: function (full) {
      var o = '<path class="c2" d="M-2 164L70 104H170L242 164Z"/><path class="o bgf" d="M70 30H170V104H70Z"/><path class="k" d="M-2 -2L70 30M242 -2L170 30M-2 164L70 104M242 164L170 104"/>';
      o += '<path class="c3" d="M78 40h84v40H78z" opacity=".85"/>' + [0, 1, 2, 3].map(function (i) { return '<circle class="c1" cx="' + (90 + i * 20) + '" cy="60" r="7"/>'; }).join('');
      o += '<path class="k" d="M100 0v20M140 0v20"/><circle class="lt o" cx="100" cy="24" r="5"/><circle class="lt o" cx="140" cy="24" r="5"/>';
      o += '<path class="o tbl" d="M48 128h56l-6 14H40z"/><path class="o tbl" d="M136 128h56l8 14h-70z"/><path class="o tbl" d="M90 110h60l-2 8H92z"/><circle class="c1 o" cx="58" cy="124" r="4"/><circle class="c1 o" cx="180" cy="124" r="4"/>';
      if (full) o += '<g class="ov"><path class="k" d="M216 120l-10 40M216 120l10 40M216 120v40"/></g>' + cam(216, 110, 120, 70, '24 mm · tripod', 150, 92);
      return o;
    },
    setting: function (full) {
      var o = table(116) + '<ellipse class="o c1" cx="104" cy="122" rx="54" ry="11"/><ellipse class="k soft" cx="104" cy="122" rx="38" ry="7"/>';
      o += '<path class="o c3" d="M84 110l20 -12 22 12-20 10z"/><path class="k" d="M58 108v20M52 108v8M64 108v8M150 106v22"/>';
      o += '<path class="o glass" d="M170 70h30l-3 50h-24z"/><path class="k soft" d="M172 94h26"/><path class="o glass" d="M196 84h20l-2 36h-16z"/>';
      if (full) o += light(16, 60, 84, 108, 'lamp', 'soft side', 4, 42, 30) + cam(218, 44, 136, 110, '45°', 160, 24);
      return o;
    },
    menu: function (full) {
      var o = '<path class="o c1" d="M44 30h74v108H44z"/><path class="o c1" d="M122 30h74v108h-74z"/><path class="c2" d="M50 38h62v12H50zM128 38h62v12h-62z"/>';
      for (var i = 0; i < 6; i++) o += '<path class="k soft" d="M52 ' + (62 + i * 12) + 'h' + (i % 2 ? 40 : 52) + 'M130 ' + (62 + i * 12) + 'h' + (i % 2 ? 46 : 54) + '"/>';
      o += '<circle class="c3" cx="104" cy="126" r="5"/><circle class="c3" cx="182" cy="126" r="5"/>';
      if (full) o += light(16, 16, 60, 60, 'lamp', '45°', 6, 40, 20) + light(224, 16, 180, 60, 'lamp', '45°', 206, 40, 20) + camTop(120, 150, '') + tag(150, 156, 'no glare');
      return o;
    },
    family: function (full) {
      var o = '<rect class="o c2" x="40" y="24" width="160" height="112" rx="10"/>' + plateTop(96, 64, 20, FOOD.sauce) + plateTop(146, 62, 18, FOOD.rice) + plateTop(120, 104, 22, FOOD.red) + plateTop(78, 108, 14, FOOD.saag);
      o += '<path class="o" fill="' + FOOD.naan + '" d="M160 96c10-6 24 0 22 10s-16 12-24 6-6-12 2-16z"/>';
      [[-2, 40, 20, FOOD.skin1], [242, 70, 180 - 18, FOOD.skin4], [30, 164, -48, FOOD.skin3], [214, 164, 226, FOOD.skin2], [130, -6, 92, FOOD.skin3]].forEach(function (p) {
        o += '<g transform="translate(' + p[0] + ' ' + p[1] + ') rotate(' + p[2] + ')"><rect class="o sleeve" x="-10" y="-8" width="40" height="16" rx="6"/><path class="o" fill="' + p[3] + '" d="M28 -7h14c6 0 10 4 10 7s-4 7-10 7H28z"/></g>';
      });
      if (full) o += tag(150, 152, 'real guests · release') + tag(8, 14, 'soft window light');
      return o;
    },
    bag: function (full) {
      var o = table(126) + '<path class="o c1" d="M70 52h64l6 74H64z"/><path class="o c1" d="M70 52l6 -10h52l6 10z"/><path class="k" d="M88 52c0-18 28-18 28 0" stroke-width="3"/>';
      o += '<circle class="o c3" cx="102" cy="88" r="13"/><path class="k" d="M96 88h12M102 82v12" stroke="#fff"/>';
      o += '<rect class="o receipt" x="128" y="62" width="18" height="34" rx="1" transform="rotate(8 137 79)"/><path class="k soft" d="M132 72h10M131 78h10M130 84h8"/>';
      o += '<path class="o receipt" d="M150 104h52l-4 22h-44z"/><path class="o c3" d="M148 98h56v8h-56z"/>';
      if (full) o += light(220, 34, 156, 80, 'window', 'window light', 168, 18) + cam(24, 96, 90, 96, '15°', 6, 76);
      return o;
    }
  };

  function sketchSVG(shot, full, title) {
    var body = (SK[shot.sk] || SK.feast)(!!full);
    return '<svg class="sk" viewBox="0 0 240 160" preserveAspectRatio="xMidYMid slice" ' + (title ? 'role="img" aria-label="' + esc(title) + '"' : 'aria-hidden="true" focusable="false"') + '><rect class="bgf" x="-4" y="-4" width="248" height="168"/>' + body + '</svg>';
  }
  function palVars(s) {
    var a = s.A, b = s.B;
    var ai = inkFor(a.bg, 'bazaar'), bi = inkFor(b.bg, 'royal');
    return '--a-bg:' + a.bg + ';--a-c1:' + a.c1 + ';--a-c2:' + a.c2 + ';--a-c3:' + a.c3 + ';--a-ink:' + ai + ';--a-anti:' + (lum(ai) > .5 ? '#1D1147' : '#FFF4DC') + ';' +
      '--b-bg:' + b.bg + ';--b-c1:' + b.c1 + ';--b-c2:' + b.c2 + ';--b-c3:' + b.c3 + ';--b-ink:' + bi + ';--b-anti:' + (lum(bi) > .5 ? '#160B26' : '#FBF3E4');
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ───────── voice (A/B) state: follows global hub switch; 'both' → bazaar ───────── */
  function currentVoice() { var v = de.getAttribute('data-dir'); return v === 'royal' ? 'royal' : 'bazaar'; }
  function applyVoice() {
    var v = currentVoice();
    d.querySelectorAll('[data-voice-root]').forEach(function (r) { r.setAttribute('data-voice-current', v); });
    d.querySelectorAll('[data-voice-theme]').forEach(function (el) { el.setAttribute('data-theme', v); });
    d.querySelectorAll('[data-voice-set]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-voice-set') === v)); });
    d.querySelectorAll('[data-voice-label]').forEach(function (el) { el.textContent = v === 'royal' ? 'B · Royal' : 'A · Bazaar'; });
    updateCounters();
  }
  function setVoice(v) { if (window.Hub && Hub.setDirection) Hub.setDirection(v); else { de.setAttribute('data-dir', v); applyVoice(); } }

  /* ───────── copy helper ───────── */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      var ta = d.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      d.body.appendChild(ta); ta.select();
      try { d.execCommand('copy') ? res() : rej(); } catch (e) { rej(e); } ta.remove();
    });
  }
  function toast(m) { if (window.Hub && Hub.toast) Hub.toast(m); }
  function cleanText(el) {
    var c = el.cloneNode(true);
    c.querySelectorAll('.no-copy').forEach(function (x) { x.remove(); });
    c.querySelectorAll('p,li').forEach(function (x) { x.append('\n'); });
    return c.textContent.replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
  }
  function flashBtn(b, label) {
    var lab = b.querySelector('.cp-lab'); if (!lab) return;
    var old = lab.getAttribute('data-l') || lab.textContent; lab.setAttribute('data-l', old);
    lab.textContent = label || 'Copied'; b.classList.add('is-done');
    clearTimeout(b.__t); b.__t = setTimeout(function () { lab.textContent = old; b.classList.remove('is-done'); }, 1600);
  }
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy-from]'); if (!b) return;
    e.preventDefault();
    var sel = b.getAttribute('data-copy-from'), scope = b.closest('[data-copy-scope]') || d;
    var parts = [];
    if (sel === '@utm') parts = [d.getElementById('utmOut').getAttribute('data-url') || ''];
    else (sel.charAt(0) === '#' ? [d.querySelector(sel)] : Array.prototype.slice.call(scope.querySelectorAll(sel))).forEach(function (el) {
      if (!el) return;
      var vroot = el.closest('[data-voice]'); if (vroot && vroot.getAttribute('data-voice') !== currentVoice()) return;
      parts.push(cleanText(el));
    });
    var text = parts.filter(Boolean).join('\n\n');
    if (!text) return;
    copyText(text).then(function () { flashBtn(b); toast('Copied — paste it into your profile'); }, function () { toast('Couldn’t copy — long-press the text instead'); });
  });

  /* ───────── shot cards + rail ───────── */
  function shotCard(s) {
    var flags = '';
    if (s.clip) flags += '<span class="tg tg--clip">+ 10–15 s vertical clip</span>';
    if (s.flag) flags += '<span class="tg tg--confirm">' + esc(s.flag) + '</span>';
    if (s.tip) flags += '<span class="tg tg--tip">' + esc(s.tip) + '</span>';
    var sw = function (p, dir) {
      return '<div class="shot__dir" data-voice="' + dir + '"><span class="shot__sw" aria-hidden="true"><i style="background:' + p.bg + '"></i><i style="background:' + p.c2 + '"></i><i style="background:' + p.c1 + '"></i><i style="background:' + p.c3 + '"></i></span><span><b>' + (dir === 'royal' ? 'B · Royal' : 'A · Bazaar') + '</b> ' + esc(p.w) + '</span></div>';
    };
    return '<article class="shot pal" data-cat="' + s.cat + '" id="shot-' + s.n + '" style="' + palVars(s) + '" aria-labelledby="shot-t-' + s.n + '">' +
      '<div class="shot__frame">' + sketchSVG(s, true, 'Sketch: ' + s.t + ', ' + s.angle + ', ' + s.light) +
      '</div>' +
      '<div class="shot__body"><div class="shot__head"><span class="shot__num" aria-hidden="true">' + pad(s.n) + '<small>/25</small></span><h3 class="shot__title" id="shot-t-' + s.n + '"><span class="sr-only">Shot ' + s.n + ': </span>' + esc(s.t) + '<small>' + esc(s.sub) + '</small></h3></div>' +
      '<dl class="shot__spec"><div><dt>Angle</dt><dd>' + esc(s.angle) + '</dd></div><div><dt>Light</dt><dd>' + esc(s.light) + '</dd></div><div><dt>Brief</dt><dd>' + esc(s.play) + '</dd></div><div><dt>Google</dt><dd>Tag as “' + esc(s.gbp) + '”</dd></div></dl>' +
      sw(s.A, 'bazaar') + sw(s.B, 'royal') + (flags ? '<div class="shot__flags">' + flags + '</div>' : '') + '</div></article>';
  }
  function initShots() {
    var rail = d.getElementById('shotRail'); if (!rail) return;
    rail.innerHTML = SHOTS.map(shotCard).join('');
    var bar = d.getElementById('shotFilters'), counter = d.getElementById('shotCount'), prog = d.getElementById('shotProg');
    var counts = { all: SHOTS.length }; SHOTS.forEach(function (s) { counts[s.cat] = (counts[s.cat] || 0) + 1; });
    bar.innerHTML = CATS.map(function (c, i) { return '<button type="button" class="chip" data-cat="' + c[0] + '" aria-pressed="' + (i === 0) + '">' + c[1] + ' <span class="chip__n">' + counts[c[0]] + '</span></button>'; }).join('');
    var cur = 'all';
    function visibleCards() { return Array.prototype.filter.call(rail.children, function (c) { return !c.hidden; }); }
    function update() {
      var vis = visibleCards(); if (!vis.length) return;
      var x = rail.scrollLeft, w = vis[0].offsetWidth + 14, idx = Math.min(vis.length - 1, Math.round(x / w));
      var maxS = rail.scrollWidth - rail.clientWidth;
      if (maxS > 0 && x >= maxS - 4) idx = vis.length - 1;
      counter.textContent = pad(idx + 1) + ' / ' + pad(vis.length);
      prog.style.transform = 'scaleX(' + (maxS > 0 ? Math.max(.06, x / maxS) : 1) + ')';
      d.getElementById('shotPrev').disabled = x <= 2; d.getElementById('shotNext').disabled = x >= maxS - 2;
    }
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cat]'); if (!b) return;
      cur = b.getAttribute('data-cat');
      bar.querySelectorAll('[data-cat]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      Array.prototype.forEach.call(rail.children, function (c) { c.hidden = cur !== 'all' && c.getAttribute('data-cat') !== cur; });
      rail.scrollTo({ left: 0, behavior: 'auto' });
      d.getElementById('shotLive').textContent = visibleCards().length + ' shots shown';
      update();
    });
    function step(dir) { var vis = visibleCards(); if (!vis.length) return; var w = vis[0].offsetWidth + 14; rail.scrollBy({ left: dir * w * (rail.clientWidth > 900 ? 2 : 1), behavior: reduce ? 'auto' : 'smooth' }); }
    d.getElementById('shotPrev').addEventListener('click', function () { step(-1); });
    d.getElementById('shotNext').addEventListener('click', function () { step(1); });
    var raf; rail.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
    /* steam only animates while the rail is on screen */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { en.forEach(function (x) { x.target.classList.toggle('is-live', x.isIntersecting); }); }, { threshold: .05 }).observe(rail);
    }
  }

  /* brief table (print-ready) */
  function initBrief() {
    var t = d.getElementById('briefShots'); if (!t) return;
    t.innerHTML = SHOTS.map(function (s) {
      return '<li><b>' + pad(s.n) + '</b><span><strong>' + esc(s.t) + '</strong> — ' + esc(s.angle) + '. ' + esc(s.light) + '. <em>' + esc(s.play) + '</em>' + (s.flag ? ' <u>' + esc(s.flag) + '.</u>' : '') + '</span><i>' + esc(s.gbp) + '</i></li>';
    }).join('');
  }

  /* ───────── listing mock: photo tiles, post image, hero tiles ───────── */
  function initTiles() {
    d.querySelectorAll('[data-shot-tile]').forEach(function (el) {
      var s = SHOT[+el.getAttribute('data-shot-tile')]; if (!s) return;
      el.classList.add('pal'); el.setAttribute('style', (el.getAttribute('style') || '') + ';' + palVars(s));
      el.insertAdjacentHTML('afterbegin', sketchSVG(s, false));
    });
  }

  /* listing annotations → scroll the phone screen to the spot and flash it */
  function initSpots() {
    var screen = d.getElementById('lstScroll'); if (!screen) return;
    d.querySelectorAll('[data-spot-go]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-spot-go'), target = screen.querySelector('[data-spot="' + id + '"]'); if (!target) return;
        var phone = d.getElementById('gbpPhone'), r = phone.getBoundingClientRect();
        if (r.top < -40 || r.bottom > innerHeight + 40) phone.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
        var top = target.offsetTop - 64;
        screen.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
        screen.querySelectorAll('.is-flash').forEach(function (x) { x.classList.remove('is-flash'); });
        void target.offsetWidth; target.classList.add('is-flash');
        d.querySelectorAll('[data-spot-go]').forEach(function (x) { x.setAttribute('aria-current', String(x === b)); });
      });
    });
  }

  /* ───────── checklist ───────── */
  var CHECK = [
    { id: 'cat', name: 'Categories', icon: 'kit', items: [
      ['cat1', 'Primary category: <b>Indian restaurant</b>', 'Pick the exact wording from the dashboard dropdown; names change.', 'S · H'],
      ['cat2', 'Add 3–5 <b>true</b> secondary categories', 'Candidates: North Indian restaurant, Biryani restaurant [S]; Tandoori restaurant, Takeout restaurant [K]. Chinese restaurant only if Indo-Chinese counts; Caterer only if you cater.', 'S/K · M'],
      ['cat3', 'No “Halal” or diet categories unless you confirm them', 'Nothing in public listings confirms it, so we leave it out until you say so.', 'rule'] ] },
    { id: 'pho', name: 'Logo, cover & photos', icon: 'zoom', items: [
      ['pho1', 'Logo: square, 720 × 720', 'The steaming-bowl emblem reads at thumbnail size.', 'S · M'],
      ['pho2', 'Cover: 16:9, about 1024 × 576', 'Keep the subject centred; Google crops differently on phones.', 'S · M'],
      ['pho3', 'Launch set: 25–30 photos, each tagged to the right category', 'Food & drink, Interior, Exterior, Menu, Team, At work.', 'S · L–M'],
      ['pho4', 'Then 4–8 new photos a month + one short video', 'Video ≤ 30 s, ≤ 75 MB.', 'K · M'] ] },
    { id: 'att', name: 'Attributes', icon: 'info', items: [
      ['att1', 'Service options: Dine-in · Takeout · Delivery', 'All three appear in public listings.', 'likely'],
      ['att2', 'Meals served: Lunch · Dinner (Dessert if it’s on the menu)', 'Hours show lunch and dinner service.', 'likely'],
      ['att3', 'Family-friendly · Good for groups', 'Tick only what’s true. Highlights are generated from these, not typed in.', 'confirm'],
      ['att4', 'Payments · parking · wheelchair access', 'Parking is listed as ample in public listings.', 'confirm'],
      ['att5', 'Vegetarian options', 'Safe candidate. Your catering page mentions vegetarian dishes, but confirm before ticking it.', 'confirm'] ] },
    { id: 'hrs', name: 'Hours & special hours', icon: 'cal', items: [
      ['hrs1', 'Regular hours: Mon–Thu 11–2:30 & 4:30–10 · Fri–Sat 11–3 & 4:30–10:30 · Sun 11–3 & 4:30–10', 'These are the hours listed publicly. Yelp shows small differences, so confirm them.', 'likely'],
      ['hrs2', '“More hours”: Takeout, Delivery, Kitchen', 'Wrong hours are the top cause of bad reviews.', 'K · M'],
      ['hrs3', 'Happy hour: add it only once you confirm it', 'No public source confirms a happy hour.', 'confirm'],
      ['hrs4', 'Special hours a month ahead: Diwali (Sun Nov 8, 2026), Thanksgiving (Nov 26), Christmas, New Year', 'Festival dates need checking.', 'K · M'] ] },
    { id: 'men', name: 'Menu & products', icon: 'menu', items: [
      ['men1', 'Fill the in-profile Menu, section by District zone', 'Starters Square, Tandoor Quarter, Curry Quarter, Biryani Boulevard, Indo-Chinese Alley, Bread Bazaar, Sweet Street, Chai & Coolers.', 'K · M'],
      ['men2', 'Item descriptions + item photos; diet tags only when true', 'Use the shot list for the hero dishes.', 'K · M'],
      ['men3', 'Prices only after you confirm them', 'The prices online are old third-party snapshots.', 'rule'],
      ['men4', 'Products: family packs or festival boxes, once confirmed', 'Good for Diwali or a party-tray push.', 'K · M'] ] },
    { id: 'svc', name: 'Services, phone & links', icon: 'bag', items: [
      ['svc1', 'Services: dine-in, takeout, delivery, catering', 'Catering appears on your site; confirm what you offer.', 'likely'],
      ['svc2', 'One phone everywhere: (469) 200-5856', 'Three numbers circulate online. This one is most consistent. Confirm it, then retire the others.', 'likely'],
      ['svc3', 'Order button → your direct Clover page, with tracking', 'Uber Eats as the secondary link. Build the link in section 05.', 'confirm'],
      ['svc4', 'Website button → currydistrict.net, with tracking', 'Same builder, medium “profile”.', 'H'] ] },
    { id: 'des', name: 'Description', icon: 'file', items: [
      ['des1', 'Paste the new description (≤ 750 characters)', 'Two ready versions in the Copy kit.', 'M'],
      ['des2', 'Lead with “Indian restaurant in Little Elm, TX”', 'Only the first ~250 characters show before “More”.', 'M'],
      ['des3', 'Keywords in the description, never in the business name', 'The name stays exactly “Curry District”.', 'rule'] ] },
    { id: 'pst', name: 'Posts', icon: 'reel', items: [
      ['pst1', 'One post a week: Update, Event or Offer', 'Six templates in the Copy kit.', 'K · M'],
      ['pst2', 'Add a button to each: Order online, Call or Learn more', 'Tag the link with medium “post”.', 'K · M'],
      ['pst3', 'Offers only with real terms and dates, and never tied to reviews', 'Offer posts need a title and dates.', 'rule'] ] },
    { id: 'qna', name: 'Q&A', icon: 'chat', items: [
      ['qna1', 'Check whether the Q&A box still shows on your listing', 'Google has been replacing it with AI answers.', 'K · L'],
      ['qna2', 'If it does: post and answer 6–8 real questions', 'Eight safe seeds are in the Copy kit.', 'K · M'],
      ['qna3', 'If not: put the same answers in the description, menu and website', 'Same answers, different home.', 'K · M'] ] },
    { id: 'rev', name: 'Reviews', icon: 'stamp', items: [
      ['rev1', 'Copy your review link: Dashboard → “Get more reviews”', 'It looks like g.page/r/…/review.', 'S · H'],
      ['rev2', 'Review QR on receipts, bag stickers and table tents', 'It opens on the guest’s own phone. No shared tablet.', 'S · M–H'],
      ['rev3', 'Ask every guest the same way: no incentives, no gating, no staff quotas', 'Google is removing reviews that break these rules.', 'rule'],
      ['rev4', 'Reply to every review within 48 hours', 'Templates in the Copy kit. Keep personal details out.', 'K · M'] ] },
    { id: 'msg', name: 'Messaging', icon: 'phone', items: [
      ['msg1', 'Chat on the profile was retired in 2024, so make Call and Website the easy paths', 'Check that both buttons work from a phone.', 'K · M'] ] }
  ];
  var CK_KEY = 'cd-gbp-checklist-v1';
  function loadDone() { try { return JSON.parse(localStorage.getItem(CK_KEY) || '{}') || {}; } catch (e) { return {}; } }
  function saveDone(o) { try { localStorage.setItem(CK_KEY, JSON.stringify(o)); } catch (e) { /* private mode: still works for this visit */ } }
  function tagChip(t) {
    var map = { likely: ['likely', 'Repeated in public listings; not certain'], confirm: ['owner to confirm', 'Needs your decision or confirmation'], rule: ['policy', 'Google rule or truthfulness rule'] };
    if (map[t]) return '<span class="tg tg--' + t + '" title="' + map[t][1] + '">' + map[t][0] + '</span>';
    return '<span class="tg tg--src" title="S = seen in a search summary · K = working knowledge, check in the dashboard · H/M/L = confidence">' + t + '</span>';
  }
  function initChecklist() {
    var host = d.getElementById('ckGroups'); if (!host) return;
    var done = loadDone(), total = 0, wide = window.matchMedia && matchMedia('(min-width: 900px)').matches;
    host.innerHTML = CHECK.map(function (g, gi) {
      total += g.items.length;
      return '<details class="ckg" data-g="' + g.id + '"' + (wide || gi === 0 ? ' open' : '') + '><summary><span class="ckg__ic">' + (window.Hub && Hub.icon ? Hub.icon(g.icon) : '') + '</span><span class="ckg__name">' + g.name + '</span><span class="ckg__count" data-gcount>0/' + g.items.length + '</span></summary><ul class="ckg__list" role="list">' +
        g.items.map(function (it) {
          return '<li><label class="ck"><input type="checkbox" data-ck="' + it[0] + '"' + (done[it[0]] ? ' checked' : '') + '><span class="ck__box" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><span class="ck__txt"><span class="ck__t">' + it[1] + '</span><span class="ck__n">' + it[2] + ' ' + tagChip(it[3]) + '</span></span></label></li>';
        }).join('') + '</ul></details>';
    }).join('');
    var ring = d.getElementById('ckRing'), num = d.getElementById('ckNum'), lbl = d.getElementById('ckLbl'), bar = d.getElementById('ckBar');
    var C0 = 2 * Math.PI * 26;
    ring.style.strokeDasharray = C0;
    function refresh(fromUser) {
      var n = 0;
      host.querySelectorAll('.ckg').forEach(function (g) {
        var boxes = g.querySelectorAll('input'), c = 0; boxes.forEach(function (b) { if (b.checked) c++; });
        n += c; g.querySelector('[data-gcount]').textContent = c + '/' + boxes.length; g.classList.toggle('is-done', c === boxes.length);
      });
      var p = n / total;
      ring.style.strokeDashoffset = C0 * (1 - p);
      num.textContent = Math.round(p * 100) + '%';
      lbl.textContent = n + ' of ' + total + ' done';
      bar.style.transform = 'scaleX(' + Math.max(.0001, p) + ')';
      if (fromUser && n === total) { burst(); toast('Profile complete — that’s a glow-up'); }
    }
    host.addEventListener('change', function (e) {
      var cb = e.target.closest('[data-ck]'); if (!cb) return;
      var o = loadDone(); if (cb.checked) o[cb.getAttribute('data-ck')] = 1; else delete o[cb.getAttribute('data-ck')];
      saveDone(o); refresh(true);
      if (cb.checked) { var g = cb.closest('.ckg'); if (g && g.classList.contains('is-done')) pop(g); }
    });
    d.getElementById('ckReset').addEventListener('click', function () {
      if (!confirm('Clear all ticks on this device?')) return;
      saveDone({}); host.querySelectorAll('input').forEach(function (b) { b.checked = false; }); refresh();
    });
    d.getElementById('ckCopy').addEventListener('click', function () {
      var lines = ['Curry District — Google profile to-do'];
      host.querySelectorAll('.ckg').forEach(function (g) {
        var left = Array.prototype.filter.call(g.querySelectorAll('input'), function (b) { return !b.checked; });
        if (!left.length) return;
        lines.push('', g.querySelector('.ckg__name').textContent.toUpperCase());
        left.forEach(function (b) { lines.push('[ ] ' + b.closest('label').querySelector('.ck__t').textContent); });
      });
      if (lines.length === 1) lines.push('', 'All done!');
      copyText(lines.join('\n')).then(function () { toast('To-do list copied'); }, function () { toast('Couldn’t copy'); });
    });
    refresh();
  }
  function pop(el) { if (reduce) return; el.classList.remove('is-pop'); void el.offsetWidth; el.classList.add('is-pop'); }
  function burst() {
    if (reduce) return;
    var host = d.getElementById('ckMeter'); if (!host) return;
    var cols = ['#FFB000', '#FF6A13', '#E4147E', '#00A8A0', '#F7D98A'];
    for (var i = 0; i < 22; i++) {
      var p = d.createElement('i'); p.className = 'petal';
      var a = Math.random() * Math.PI * 2, r = 60 + Math.random() * 90;
      p.style.background = cols[i % cols.length];
      host.appendChild(p);
      p.animate([{ transform: 'translate(0,0) rotate(0) scale(1)', opacity: 1 }, { transform: 'translate(' + (Math.cos(a) * r) + 'px,' + (Math.sin(a) * r - 30) + 'px) rotate(' + (Math.random() * 540) + 'deg) scale(.6)', opacity: 0 }], { duration: 1100 + Math.random() * 500, easing: 'cubic-bezier(.22,1,.36,1)' }).onfinish = (function (el) { return function () { el.remove(); }; })(p);
    }
  }

  /* ───────── description counters ───────── */
  function updateCounters() {
    d.querySelectorAll('[data-desc]').forEach(function (el) {
      if (!el.__raw) el.__raw = el.textContent.replace(/\s+/g, ' ').trim();
      var t = el.__raw, n = t.length, cut = 250;
      if (!el.__split) {
        var i = t.lastIndexOf(' ', cut); if (i < 200) i = cut;
        el.innerHTML = '<span class="fold-a">' + esc(t.slice(0, i)) + '</span><span class="fold-mk no-copy" aria-hidden="true">More ▾</span><span class="fold-b"> ' + esc(t.slice(i + 1)) + '</span>';
        el.__split = true;
      }
      var cnt = d.querySelector('[data-desc-count="' + el.getAttribute('data-desc') + '"]');
      if (cnt) { cnt.querySelector('b').textContent = n; cnt.querySelector('.meter i').style.transform = 'scaleX(' + Math.min(1, n / 750) + ')'; cnt.classList.toggle('is-over', n > 750); }
    });
  }

  /* ───────── UTM builder ───────── */
  var BASES = { order: 'https://curry-district-little-elm.cloveronline.com/', site: 'https://currydistrict.net/' };
  var PRESETS = { profile: ['order_button', 'website_button', 'menu_link'], post: ['weekly_update', 'new_dish', 'diwali_2026', 'catering', 'event'] };
  function slug(s) { return String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60); }
  function buildUTM(base, medium, campaign, content) {
    var u; try { u = new URL(base); } catch (e) { return null; }
    if (!/^https?:$/.test(u.protocol)) return null;
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(function (k) { u.searchParams.delete(k); });
    u.searchParams.set('utm_source', 'google_business');
    u.searchParams.set('utm_medium', medium);
    u.searchParams.set('utm_campaign', slug(campaign) || (medium === 'post' ? 'weekly_update' : 'order_button'));
    if (slug(content)) u.searchParams.set('utm_content', slug(content));
    return u.toString();
  }
  function prettyURL(url) {
    var i = url.indexOf('?'); if (i < 0) return esc(url);
    return '<span class="u-base">' + esc(url.slice(0, i)) + '</span>' + url.slice(i).split('&').map(function (p, k) {
      var eq = p.indexOf('='), key = p.slice(0, eq).replace(/^\?/, ''), val = p.slice(eq + 1);
      return '<span class="u-sep">' + (k === 0 ? '?' : '&amp;') + '</span><span class="u-k">' + esc(key) + '</span>=<span class="u-v">' + esc(decodeURIComponent(val)) + '</span>';
    }).join('');
  }
  function initUTM() {
    var form = d.getElementById('utmForm'); if (!form) return;
    var out = d.getElementById('utmOut'), err = d.getElementById('utmErr'), custom = d.getElementById('utmCustomWrap'), camp = d.getElementById('utmCampaign'), dl = d.getElementById('utmPresets'), open = d.getElementById('utmOpen');
    function val(name) { var el = form.querySelector('[name="' + name + '"]:checked') || form.querySelector('[name="' + name + '"]'); return el ? el.value : ''; }
    function render() {
      var dest = val('dest'), medium = val('medium');
      custom.hidden = dest !== 'custom';
      dl.innerHTML = PRESETS[medium].map(function (p) { return '<button type="button" class="chip" data-preset="' + p + '">' + p + '</button>'; }).join('');
      var base = dest === 'custom' ? (d.getElementById('utmCustom').value.trim() || '') : BASES[dest];
      if (dest === 'custom' && base && !/^https?:\/\//i.test(base)) base = 'https://' + base;
      var url = base ? buildUTM(base, medium, camp.value, d.getElementById('utmContent').value) : null;
      if (!url) { err.hidden = false; out.innerHTML = '<span class="u-base">Paste a full web address to tag it</span>'; out.setAttribute('data-url', ''); open.setAttribute('aria-disabled', 'true'); open.removeAttribute('href'); return; }
      err.hidden = true; out.innerHTML = prettyURL(url); out.setAttribute('data-url', url); open.setAttribute('href', url); open.removeAttribute('aria-disabled');
      d.getElementById('utmWhere').textContent = medium === 'post' ? 'Paste into a post’s button link (Add update → Add a button → Link).' : (dest === 'order' ? 'Paste as the Order online link (Edit profile → ordering link).' : 'Paste as the Website link (Edit profile → Contact → Website).');
    }
    form.addEventListener('input', render); form.addEventListener('change', function (e) {
      if (e.target.name === 'medium') { camp.value = PRESETS[e.target.value][0]; }
      if (e.target.name === 'dest' && val('medium') === 'profile') { camp.value = e.target.value === 'site' ? 'website_button' : e.target.value === 'order' ? 'order_button' : 'menu_link'; }
      render();
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    dl.addEventListener('click', function (e) { var b = e.target.closest('[data-preset]'); if (!b) return; camp.value = b.getAttribute('data-preset'); render(); });
    render();
    /* ready-made links */
    d.querySelectorAll('[data-utm-ready]').forEach(function (el) {
      var p = el.getAttribute('data-utm-ready').split('|');
      var url = buildUTM(BASES[p[0]], p[1], p[2], p[3] || '');
      el.querySelector('code').innerHTML = prettyURL(url);
      el.querySelector('[data-copy-url]').setAttribute('data-copy-url', url);
    });
    d.addEventListener('click', function (e) {
      var b = e.target.closest('[data-copy-url]'); if (!b) return;
      copyText(b.getAttribute('data-copy-url')).then(function () { flashBtn(b); toast('Tracked link copied'); });
    });
  }

  /* ───────── print just the brief ───────── */
  function initPrintBrief() {
    d.querySelectorAll('[data-print-brief]').forEach(function (b) {
      b.addEventListener('click', function () {
        de.classList.add('print-brief');
        var done = function () { de.classList.remove('print-brief'); window.removeEventListener('afterprint', done); };
        window.addEventListener('afterprint', done);
        setTimeout(function () { window.print(); setTimeout(done, 1500); }, 60);
      });
    });
  }

  /* ───────── boot ───────── */
  function boot() {
    initShots(); initBrief(); initTiles(); initSpots(); initChecklist(); initUTM(); initPrintBrief();
    d.addEventListener('click', function (e) { var b = e.target.closest('[data-voice-set]'); if (b) setVoice(b.getAttribute('data-voice-set')); });
    d.addEventListener('hub:direction', applyVoice);
    applyVoice();
    if (window.Hub && Hub.refresh) Hub.refresh(d.getElementById('main'));
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
})();

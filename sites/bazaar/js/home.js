/* Curry District · Bazaar — HOME: "Pick your fire" spice slider. Needs js/menu-data.js (window.CD_MENU). */
(function () {
  'use strict';
  var d = document, w = window;
  var M = w.CD_MENU; if (!M) return;
  var dial = d.querySelector('.fire__dial'), range = d.querySelector('[data-fire-range]'), out = d.querySelector('[data-fire-results]');
  if (!dial || !range || !out) return;
  var sec = dial.closest('.fire-sec');
  var LABEL = ['Not spicy', 'Mild', 'Medium', 'Hot', 'District Hot'];
  var BLURB = [
    'Zero heat, all flavor. Cool as a lassi.',
    'A gentle glow. Easy-going, still exciting.',
    'Warm, friendly and full of flavor.',
    'Now we’re talking. Keep the lassi close.',
    'Andhra fire. Brave souls only.'
  ];
  var DIET = { veg: ['diet--veg', 'Veg'], nonveg: ['diet--nonveg', 'Non-veg'], egg: ['diet--egg', 'Egg'] };
  var ZN = {}; M.meta.zones.forEach(function (z) { ZN[z.id] = z.name; });
  var ART = {}; (M.meta.artAvailable || []).forEach(function (k) { ART[k] = 1; });
  var TITLES = {
    'biryani': 'biryani heaped in a copper handi with a cup of raita', 'butter-chicken': 'butter chicken in a brass-rimmed terracotta bowl',
    'garlic-naan': 'garlic naan torn into pieces in a woven basket', 'paneer-tikka': 'paneer tikka skewers with peppers and onion on a sizzling platter',
    'samosa-chutney': 'two golden samosas with chutney dips', 'tandoori-platter': 'tandoori chicken and tikka on a platter with onion rings and lime',
    'chilli-chicken': 'chilli chicken in a wok', 'dal-saag': 'dal and saag in two bowls', 'gulab-jamun': 'gulab jamun in a bowl',
    'mango-lassi-chai': 'a mango lassi and a cup of chai', 'thali': 'a thali platter', 'chaat': 'papdi chaat'
  };
  var pool = [[], [], [], [], []];
  M.items.forEach(function (it) {
    if (it.status !== 'listed' || it.zone === 'bread' && it.spice === 0 && it.id !== 'garlic-naan') return;
    if (it.id === 'plain-rice') return;
    pool[it.spice].push(it);
  });
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); };
  var reduced = function () { return !!(w.Motion && w.Motion.reduced) || (w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches); };

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(level) {
    var p = shuffle(pool[level]);
    // favour illustrated + popular dishes, and keep at least one veg plate in the mix
    p.sort(function (a, b) { return ((b.art && ART[b.art] ? 2 : 0) + (b.popular ? 1 : 0) + Math.random() * 1.6) - ((a.art && ART[a.art] ? 2 : 0) + (a.popular ? 1 : 0) + Math.random() * 1.6); });
    var res = p.slice(0, 3);
    if (!res.some(function (x) { return x.diet === 'veg'; })) {
      var v = p.filter(function (x) { return x.diet === 'veg'; })[0];
      if (v) res[2] = v;
    }
    return res;
  }
  function card(it, n) {
    var art = it.art && ART[it.art]
      ? '<div class="card__art art-bg-' + (n % 6 + 1) + '"><picture><source media="(prefers-reduced-motion: reduce)" srcset="assets/art/static/' + it.art + '.svg">' +
        '<img src="assets/art/' + it.art + '.svg" width="800" height="800" decoding="async" alt="Illustration of ' + esc(TITLES[it.art] || it.name) + '"></picture></div>'
      : '<div class="card__art"><div class="art-tile" style="--art-bg:' + ['var(--bz-rani-text)', 'var(--bz-chili)', 'var(--bz-violet-deep)'][n % 3] + '"><span class="art-tile__word">' + esc(it.name) + '</span></div></div>';
    var dt = DIET[it.diet] || DIET.veg;
    return '<article class="card">' + art + '<div class="card__body"><h3 class="card__title">' + esc(it.name) + '</h3>' +
      '<p class="card__text">' + esc(it.desc_bazaar) + '</p><div class="card__meta"><span class="diet ' + dt[0] + '">' + dt[1] + '</span>' +
      '<a href="menu.html#' + it.zone + '">' + esc(ZN[it.zone] || '') + '</a></div></div></article>';
  }
  var current = +range.value, chilis = dial.querySelectorAll('.fire__chili');
  function render(level) { out.innerHTML = pick(level).map(card).join(''); }
  function set(level, fromUser) {
    level = Math.max(0, Math.min(4, level | 0));
    var up = level > current;
    current = level;
    range.value = String(level);
    range.setAttribute('aria-valuetext', LABEL[level]);
    dial.setAttribute('data-level', String(level));
    d.querySelector('[data-fire-label]').textContent = LABEL[level];
    d.querySelector('[data-fire-blurb]').textContent = BLURB[level];
    Array.prototype.forEach.call(chilis, function (c, i) { c.classList.toggle('is-on', i < level); });
    Array.prototype.forEach.call(d.querySelectorAll('[data-fire-set]'), function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-fire-set') === level ? 'true' : 'false'); });
    if (sec) sec.style.setProperty('--heat', String(0.12 + level * 0.22));
    if (fromUser) render(level);
    if (fromUser && up && level === 4 && !reduced() && w.Motion && w.Motion.burst) {
      var r = dial.querySelector('.fire__meter').getBoundingClientRect();
      w.Motion.burst(r.left + r.width / 2, r.top + r.height / 2, dial);
    }
  }
  range.addEventListener('input', function () { set(+range.value, true); });
  Array.prototype.forEach.call(d.querySelectorAll('[data-fire-set]'), function (b) {
    b.addEventListener('click', function () { set(+b.getAttribute('data-fire-set'), true); });
  });
  var sh = d.querySelector('[data-fire-shuffle]');
  if (sh) sh.addEventListener('click', function () { render(current); });
  set(current, false);
})();

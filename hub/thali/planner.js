/* ══════════════════════════════════════════════════════════════════════════
   Curry District · Plan your table — planner.js (page-local, no dependencies)
   A transparent, rule-based, deterministic meal planner over data.js
   (built from data/menu.json by _build/build-data.js).
   · generate(state) is pure: same answers + same seed + same pins = same table
   · status "unconfirmed" items never ship and are filtered again here
   · prices are never read or shown
   QA hook: window.CDPlanner
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var DATA = window.CD_PLANNER_DATA;
  var root = document.getElementById('planner');
  if (!DATA || !root) return;

  /* ───────── single config object (Clover link + phone) ───────── */
  var CONFIG = DATA.config;
  var META = DATA.meta;
  var COLL = DATA.collections;
  var ITEMS = DATA.items.filter(function (i) { return i.status === 'listed'; });
  var BY_ID = {};
  var ZONES = {};
  META.zones.forEach(function (z) { ZONES[z.id] = z; });
  var COURSE_ORDER = ['starters', 'indochinese', 'tandoor', 'curry', 'biryani', 'bread', 'sweets', 'chai'];
  var SAVOURY = { starters: 1, indochinese: 1, tandoor: 1, curry: 1, biryani: 1 };
  var SPICE = META.spiceScale.map(function (s) { return s.label; }); // Not spicy · Mild · Medium · Hot · District Hot
  var DIETS = {
    veg:    { allow: ['veg'],                  label: 'Veg only',    short: 'Veg only' },
    vegegg: { allow: ['veg', 'egg'],           label: 'Veg + eggs',  short: 'Veg + eggs' },
    mixed:  { allow: ['veg', 'egg', 'nonveg'], label: 'Mixed table', short: 'Mixed' },
    nonveg: { allow: ['veg', 'egg', 'nonveg'], label: 'Meat lovers', short: 'Meat lovers' }
  };
  function inColl(c, id) { return (COLL[c] || []).indexOf(id) > -1; }

  /* derived, rule-friendly attributes (from names/ids/our own copy only) */
  ITEMS.forEach(function (it, idx) {
    BY_ID[it.id] = it;
    it.idx = idx;
    var s = (it.id + ' ' + it.name).toLowerCase();
    it.group = /paneer/.test(s) ? 'paneer' : /chicken|kodi|karampodi/.test(s) ? 'chicken' : /goat|mutton/.test(s) ? 'goat' :
      /lamb/.test(s) ? 'lamb' : /fish/.test(s) ? 'fish' : /shrimp/.test(s) ? 'shrimp' : /egg/.test(s) ? 'egg' :
      /dal/.test(s) ? 'dal' : /gobi/.test(s) ? 'gobi' : 'veg';
    var m = s.match(/vindaloo|kadai|andhra|chettinad|kurma|korma|afghani|malai|tikka masala|butter|manchurian|chilli|gongura|65|555|fry|kabab/);
    it.style = m ? m[0].replace('korma', 'kurma') : '';
    it.soup = /soup/.test(it.id);
    it.wokMain = /noodles|fried-rice/.test(it.id);
    it.plainRice = it.id === 'plain-rice';
    it.creamy = /creamy|cream|butter|malai|makhani|kurma|korma/i.test(it.name + ' ' + it.desc_neutral);
    it.fried = (it.tags || []).indexOf('fried') > -1 || /65|555|pakora|samosa|manchurian|apollo|spring|fry|vepudu/.test(it.id);
  });

  /* ───────── seeded hash (FNV-1a) → [0,1) ───────── */
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rnd(seed, a, b) { return hash(seed + '|' + a + '|' + b) / 4294967296; }

  /* ═════════ GENERATOR (pure) ═════════ */
  function normalize(st) {
    st = st || {};
    var g = Math.round(+st.guests); if (!(g >= 1)) g = 4; if (g > 12) g = 12;
    var L = Math.round(+st.spice); if (!(L >= 0)) L = 2; if (L > 4) L = 4;
    return {
      guests: g, kids: !!st.kids, spice: L, diet: DIETS[st.diet] ? st.diet : 'mixed',
      seed: Math.max(0, Math.floor(+st.seed || 0)),
      pins: Object.assign({}, st.pins || {}), fixed: Object.assign({}, st.fixed || {})
    };
  }

  // course shape for the headcount (the transparent "balance" rules)
  function slotPlan(st) {
    var g = st.guests, L = st.spice, S = [];
    function add(id, zones, x) { S.push(Object.assign({ id: id, zones: zones, savoury: !!SAVOURY[zones[0]] }, x || {})); }
    if (g >= 2) add('starter-1', ['starters'], { tie: 'veg', role: st.kids ? 'gentle' : null });
    if (g >= 4) add('starter-2', ['indochinese', 'starters'], { tie: 'nonveg', wok: true });
    if (g >= 3) add('tandoor', ['tandoor'], { tie: 'nonveg' });
    var nC = g === 1 ? 1 : g <= 5 ? 2 : 3;
    for (var i = 1; i <= nC; i++) add('curry-' + i, ['curry'], { tie: i === 1 ? 'nonveg' : 'veg' });
    var cur = S.filter(function (s) { return s.zones[0] === 'curry'; });
    if (st.kids) cur[cur.length - 1].role = 'gentle';
    if (L >= 3) {
      if (!cur[0].role) cur[0].role = 'fire';
      if (cur.length > 1 && !cur[cur.length - 1].role) cur[cur.length - 1].role = 'cooler';
    }
    add('rice', ['biryani'], { tie: 'nonveg' });
    var nB = g >= 4 ? 2 : 1; for (i = 1; i <= nB; i++) add('bread-' + i, ['bread']);
    add('sweet', ['sweets']);
    var nD = g >= 5 ? 2 : 1; for (i = 1; i <= nD; i++) add('drink-' + i, ['chai']);
    return S;
  }
  // the order slots are filled in (mains get first pick of the favourites)
  var PRIORITY = ['curry-1', 'rice', 'tandoor', 'curry-2', 'curry-3', 'starter-1', 'starter-2', 'bread-1', 'bread-2', 'sweet', 'drink-1', 'drink-2'];

  function heatFor(slot, L) {
    if (!slot.savoury) return { cap: 4, target: null };
    if (slot.role === 'gentle') return { cap: Math.min(L, 1), target: Math.min(L, 1) };
    if (slot.role === 'cooler') return { cap: L, target: Math.min(L, 1) };
    if (slot.role === 'fire') return { cap: L, target: L };
    return { cap: L, target: Math.max(0, L - 1) };          // aim a notch under the line
  }

  function pool(slot, st) {
    var allow = DIETS[st.diet].allow;
    return ITEMS.filter(function (it) {
      return slot.zones.indexOf(it.zone) > -1 && allow.indexOf(it.diet) > -1 && !it.wokMain;
    });
  }

  function newCtx() { return { used: {}, groups: {}, styles: {}, veg: 0, nonveg: 0 }; }
  function ctxAdd(ctx, it, slot) {
    ctx.used[it.id] = 1;
    if (slot.savoury) {
      ctx.groups[it.group] = (ctx.groups[it.group] || 0) + 1;
      if (it.style) ctx.styles[it.style] = (ctx.styles[it.style] || 0) + 1;
      if (it.diet === 'veg') ctx.veg++; else ctx.nonveg++;
    }
  }

  function score(it, slot, st, ctx, target) {
    var s = 0, L = st.spice, g = st.guests, shuffled = st.seed > 0;
    var w = shuffled ? 0.5 : 1;
    if (it.popular) s += 0.9 * w;
    if (slot.savoury) {
      if (L <= 2 && inColl('first-timers', it.id)) s += 0.5 * w;
      if (L >= 3 && inColl('fire-lovers', it.id)) s += 0.5 * w;
      if (target != null) s -= it.spice < target ? 0.15 * (target - it.spice) : 0.35 * (it.spice - target);
      if (slot.role === 'fire' && it.spice >= 3) s += 0.4;
      if (st.diet === 'mixed') {
        var want = ctx.veg === ctx.nonveg ? slot.tie : (ctx.veg < ctx.nonveg ? 'veg' : 'nonveg');
        if ((it.diet === 'veg' ? 'veg' : 'nonveg') === want) s += 2.0;
      }
      if (st.diet === 'nonveg' && it.diet === 'nonveg') s += 2.5;
      s -= 0.6 * (ctx.groups[it.group] || 0);
      if (it.style) s -= 0.8 * (ctx.styles[it.style] || 0);
    } else if (inColl('first-timers', it.id)) s += 0.4 * w;
    if ((st.diet === 'veg' || st.diet === 'vegegg') && inColl('veg-heaven', it.id)) s += 0.3 * w;
    if (g >= 4 && inColl('share-the-table', it.id)) s += 0.3 * w;
    if ((it.zone === 'sweets' || it.zone === 'chai') && inColl('sweet-finish', it.id)) s += 0.3 * w;
    if (st.diet === 'vegegg' && it.diet === 'egg') s += 0.6;
    if (it.soup) s -= 0.8;
    if (it.plainRice) s -= 2.5;
    if (slot.wok && it.zone === 'indochinese') s += 0.5;
    if ((it.tags || []).indexOf('single-source') > -1) s -= 0.2;
    if (st.kids && it.zone === 'chai' && /mango/.test(it.id)) s += 0.5;
    if (st.kids && it.zone === 'sweets' && /gulab|ice-cream/.test(it.id)) s += 0.3;
    if (L >= 3 && it.zone === 'chai' && /lassi|butter-milk/.test(it.id)) s += 0.4;
    if (shuffled) s += 1.6 * rnd(st.seed, slot.id, it.id);
    return s;
  }

  // ranked candidates for a slot; falls back to the mildest when nothing fits the heat line
  function rank(slot, st, ctx) {
    var h = heatFor(slot, st.spice), cands = pool(slot, st);
    var within = cands.filter(function (it) { return it.spice <= h.cap; }), fallback = false;
    if (!within.length && cands.length) {
      var min = Math.min.apply(null, cands.map(function (i) { return i.spice; }));
      within = cands.filter(function (i) { return i.spice === min; }); fallback = true;
    }
    var list = within.map(function (it) { return { it: it, s: score(it, slot, st, ctx, h.target) }; })
      .sort(function (a, b) { return b.s - a.s || a.it.idx - b.it.idx; })
      .map(function (x) { return x.it; });
    return { list: list, cap: h.cap, fallback: fallback };
  }

  function qtyFor(slot, st, counts) {
    var g = st.guests, z = slot.zones[0], n;
    if (z === 'starters' || z === 'indochinese') return Math.ceil(g / 4);
    if (z === 'tandoor') return Math.ceil(g / 6);
    if (z === 'curry') return Math.max(1, Math.round(g / (2 * counts.curry)));
    if (z === 'biryani') return Math.max(1, Math.round(g / 4));
    if (z === 'bread') { n = counts.bread; return slot.id === 'bread-1' ? Math.ceil(g / n) : Math.max(1, Math.floor(g / n)); }
    if (z === 'sweets') return Math.max(1, Math.round(g / 2));
    if (z === 'chai') { var t = Math.max(1, Math.ceil(g / 2.5)); n = counts.chai; return slot.id === 'drink-1' ? Math.ceil(t / n) : Math.max(1, Math.floor(t / n)); }
    return 1;
  }

  function generate(input) {
    var st = normalize(input), slots = slotPlan(st), ctx = newCtx(), chosen = {}, dropped = [];
    var byId = {}; slots.forEach(function (s) { byId[s.id] = s; });
    function take(slot, it, src) { chosen[slot.id] = { slot: slot, item: it, src: src }; ctxAdd(ctx, it, slot); }
    // 1 · pinned (hard) then swapped (soft) dishes, if they still fit the answers
    ['pins', 'fixed'].forEach(function (src) {
      slots.forEach(function (slot) {
        var id = st[src][slot.id]; if (!id || chosen[slot.id]) return;
        var r = rank(slot, st, ctx), it = r.list.filter(function (x) { return x.id === id; })[0];
        if (!it || ctx.used[id]) { if (src === 'pins') dropped.push(id); return; }
        take(slot, it, src);
      });
    });
    Object.keys(st.pins).forEach(function (k) { if (!byId[k] && dropped.indexOf(st.pins[k]) < 0) dropped.push(st.pins[k]); });
    // 2 · everything else, best score first
    PRIORITY.forEach(function (sid) {
      var slot = byId[sid]; if (!slot || chosen[sid]) return;
      var r = rank(slot, st, ctx), it = r.list.filter(function (x) { return !ctx.used[x.id]; })[0];
      if (it) take(slot, it, 'rank');
    });
    // 3 · lines in course order, quantities, flags
    var counts = { curry: 0, bread: 0, chai: 0 };
    slots.forEach(function (s) { if (counts[s.zones[0]] != null) counts[s.zones[0]]++; });
    var lines = slots.filter(function (s) { return chosen[s.id]; }).map(function (s) {
      var c = chosen[s.id], h = heatFor(s, st.spice);
      return {
        slotId: s.id, slot: s, item: c.item, qty: qtyFor(s, st, counts), pinned: c.src === 'pins', swapped: c.src === 'fixed',
        askMild: c.item.spice > h.cap, gentle: s.role === 'gentle' && c.item.spice <= 1
      };
    });
    lines.sort(function (a, b) {
      return COURSE_ORDER.indexOf(a.item.zone) - COURSE_ORDER.indexOf(b.item.zone) || slots.indexOf(a.slot) - slots.indexOf(b.slot);
    });
    lines.forEach(function (l, i) { l.n = i + 1; });
    // safety net: the diet filter is strict, unconfirmed never ships
    var allow = DIETS[st.diet].allow;
    lines.forEach(function (l) {
      if (allow.indexOf(l.item.diet) < 0 || l.item.status !== 'listed') throw new Error('planner rule broken: ' + l.item.id);
    });
    return { state: st, slots: slots, lines: lines, dropped: dropped, balance: balance(lines), totals: totals(lines) };
  }

  function totals(lines) { var q = 0; lines.forEach(function (l) { q += l.qty; }); return { dishes: lines.length, items: q }; }

  function richness(it) {
    switch (it.zone) {
      case 'starters': return it.soup ? 0.15 : it.fried ? 0.75 : 0.5;
      case 'indochinese': return 0.7;
      case 'tandoor': return /malai/.test(it.id) ? 0.5 : 0.3;
      case 'curry': return it.creamy ? 0.85 : it.group === 'dal' ? 0.45 : 0.6;
      case 'biryani': return it.plainRice ? 0.2 : 0.65;
      case 'bread': return /butter|garlic/.test(it.id) ? 0.5 : 0.3;
      case 'sweets': return 0.9;
      default: return /shake|lassi|badam/.test(it.id) ? 0.6 : 0.25;
    }
  }
  function balance(lines) {
    var sq = 0, sp = 0, nv = 0, rq = 0, rr = 0;
    lines.forEach(function (l) {
      if (SAVOURY[l.item.zone]) { sq += l.qty; sp += l.item.spice * l.qty; nv += (l.item.diet === 'nonveg' ? 1 : l.item.diet === 'egg' ? 0.5 : 0) * l.qty; }
      rq += l.qty; rr += richness(l.item) * l.qty;
    });
    var heat = sq ? sp / sq / 4 : 0, meat = sq ? nv / sq : 0, rich = rq ? Math.min(1, Math.max(0, (rr / rq - 0.3) / 0.45)) : 0.5;
    return { heat: heat, meat: meat, rich: rich };
  }

  /* ═════════ STATE ═════════ */
  var KEY = 'cd-thali-planner-v1';
  var state = { step: 1, guests: 4, kids: false, spice: 2, diet: 'mixed', seed: 0, pins: {}, fixed: {} };
  try { var saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (saved && typeof saved === 'object') { var n = normalize(saved); n.step = Math.min(4, Math.max(1, +saved.step || 1)); state = n; } } catch (e) { /* storage blocked: defaults */ }
  var saveT = 0;
  function save() { clearTimeout(saveT); saveT = setTimeout(function () { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }, 120); }

  var result = null;
  function regen() { result = generate(state); prune(); return result; }
  function prune() {
    var keep = {}, gone = [];
    Object.keys(state.pins).forEach(function (k) {
      var l = result.lines.filter(function (x) { return x.slotId === k; })[0];
      if (l && l.item.id === state.pins[k]) keep[k] = state.pins[k]; else gone.push(BY_ID[state.pins[k]] ? BY_ID[state.pins[k]].name : state.pins[k]);
    });
    state.pins = keep;
    if (gone.length) say('Unpinned ' + gone.join(', ') + ': no longer fits your answers.');
  }

  /* ═════════ VOICE ═════════ */
  var VOICE = {
    bazaar: {
      s1: 'Count everyone. Yes, the cousin who “isn’t hungry”.',
      s2: 'Slide it. Every dish we pick stays at or below your line.',
      s3: 'Pick your table’s style. We’ll do the rest.',
      s4: 'Order big, pass plates, fight over the last bite.',
      kids: 'We’ll add a gentle starter and a mild curry, plus a mango-drink nudge.',
      spice: ['Zero fire. All flavor.', 'Just a little warmth.', 'Medium. The crowd-pleaser.', 'Hot! Keep the lassi close.', 'District Hot. Buttermilk recommended.'],
      shuffle: 'Shuffle', tip: 'Tip: pin the dishes you love, then shuffle the rest.',
      people: ['person', 'people'], copied: 'Copied! Paste it in your group chat.', shuffled: 'Fresh table, coming up!'
    },
    royal: {
      s1: 'Tell us how many you’re hosting.',
      s2: 'Set the heat; every dish stays at or below it.',
      s3: 'Choose the table’s style, and we’ll compose the spread.',
      s4: 'Composed for sharing, course by course.',
      kids: 'We’ll include a gentle starter, a mild curry and a mango drink.',
      spice: ['Gentle and fragrant.', 'A soft, warming glow.', 'Medium, nicely balanced.', 'Hot, for the bold.', 'District Hot. Fierce, by design.'],
      shuffle: 'Recompose', tip: 'Pin the dishes you love, then recompose the rest.',
      people: ['guest', 'guests'], copied: 'Copied. Paste it into your group chat.', shuffled: 'A new table, composed.'
    }
  };

  /* ═════════ DOM helpers ═════════ */
  var $ = function (s, r) { return (r || root).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || root).querySelectorAll(s)); };
  var RM = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  function reduced() { return RM.matches; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function theme() { return root.getAttribute('data-theme') === 'royal' ? 'royal' : 'bazaar'; }
  function V(k) { return VOICE[theme()][k]; }
  var live = $('#pl-live');
  function say(msg) { if (!live) return; live.textContent = ''; setTimeout(function () { live.textContent = msg; }, 60); }
  function toast(msg) { if (window.Hub && Hub.toast) Hub.toast(msg); say(msg); }
  function use(id, cls) { return '<svg' + (cls ? ' class="' + cls + '"' : '') + ' aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  function people(g) { return g + ' ' + V('people')[g === 1 ? 0 : 1]; }

  /* static copy from the data (single source) */
  $$('[data-meta]').forEach(function (el) { var k = el.getAttribute('data-meta'); if (META[k]) el.textContent = META[k]; });
  $$('[data-config-text-pl]').forEach(function (el) { var k = el.getAttribute('data-config-text-pl'); if (CONFIG[k]) el.textContent = CONFIG[k]; });
  var hiddenEl = document.getElementById('pl-hidden-list');
  if (hiddenEl && META.hiddenUnconfirmed.length) {
    var h = META.hiddenUnconfirmed;
    hiddenEl.textContent = h.slice(0, -1).join(', ') + ' and ' + h[h.length - 1] + ' appear only on older or uncertain listings, so the planner never shows them.';
  }
  var orderA = $('#pl-order'), callA = $('#pl-call');
  orderA.href = CONFIG.orderUrl;
  callA.href = 'tel:' + CONFIG.phone.tel;
  $('#pl-phone').textContent = CONFIG.phone.display;
  var flag = $('.pl-flag', callA); flag.textContent = CONFIG.phone.status; flag.title = CONFIG.phone.note;
  callA.setAttribute('aria-label', 'Call ' + CONFIG.phone.display + ' (' + CONFIG.phone.status + ' number, to be confirmed)');

  /* ═════════ STEP 1 · guests ═════════ */
  var countEl = $('#pl-count'), countN = $('.pl-count__n'), mt = $('.pl-mt'), seatsEl = $('.pl-mt__seats');
  var SEAT_C = ['#E4147E', '#00A8A0', '#FF6A13', '#7B5CFF', '#3FA34D', '#FFB000'];
  for (var si = 0; si < 12; si++) { var seat = document.createElement('span'); seat.className = 'pl-seat'; seat.style.setProperty('--c', SEAT_C[si % 6]); seat.innerHTML = '<i></i>'; seatsEl.appendChild(seat); }
  var seats = $$('.pl-seat', seatsEl);
  function renderGuests(bump) {
    var g = state.guests;
    countN.textContent = g;
    $('.pl-count__l').textContent = V('people')[g === 1 ? 0 : 1];
    countEl.setAttribute('aria-valuenow', g);
    countEl.setAttribute('aria-valuetext', people(g));
    seats.forEach(function (s, i) {
      var on = i < g;
      s.classList.toggle('is-on', on);
      s.style.setProperty('--a', (on ? (360 / g) * i : (360 / Math.max(g, 1)) * (g - 1)) + 'deg');
    });
    $$('[data-guests]').forEach(function (b) {
      var d = +b.getAttribute('data-guests'), off = (d < 0 && g <= 1) || (d > 0 && g >= 12);
      b.setAttribute('aria-disabled', String(off));
    });
    mt.classList.toggle('has-kids', state.kids);
    var k = $('#pl-kids'); k.setAttribute('aria-checked', String(state.kids));
    if (bump && !reduced()) { countN.classList.remove('is-bump'); void countN.offsetWidth; countN.classList.add('is-bump'); }
  }
  function setGuests(v) {
    v = Math.max(1, Math.min(12, v));
    if (v === state.guests) return;
    state.guests = v; state.fixed = {}; save(); renderGuests(true); dirty();
  }
  $$('[data-guests]').forEach(function (b) {
    b.addEventListener('click', function () { setGuests(state.guests + (+b.getAttribute('data-guests'))); });
  });
  countEl.addEventListener('keydown', function (e) {
    var k = e.key, g = state.guests, v = null;
    if (k === 'ArrowUp' || k === 'ArrowRight') v = g + 1; else if (k === 'ArrowDown' || k === 'ArrowLeft') v = g - 1;
    else if (k === 'PageUp') v = g + 3; else if (k === 'PageDown') v = g - 3; else if (k === 'Home') v = 1; else if (k === 'End') v = 12;
    if (v != null) { e.preventDefault(); setGuests(v); }
  });
  $('#pl-kids').addEventListener('click', function () { state.kids = !state.kids; state.fixed = {}; save(); renderGuests(); dirty(); say(state.kids ? 'Kids at the table: on' : 'Kids at the table: off'); });

  /* ═════════ STEP 2 · fire ═════════ */
  var range = $('#pl-spice'), fire = $('.pl-fire'), ticks = $('.pl-range__ticks');
  SPICE.forEach(function (lab, i) {
    var t = document.createElement('span'); t.className = 'pl-tick'; t.style.left = (i * 25) + '%'; t.textContent = lab;
    t.addEventListener('click', function () { setSpice(i); range.focus(); }); ticks.appendChild(t);
  });
  function renderFire(prev) {
    var L = state.spice;
    range.value = L;
    range.setAttribute('aria-valuetext', SPICE[L] + ', level ' + L + ' of 4');
    $('#pl-level-name').textContent = SPICE[L];
    $('[data-voice="spice"]').textContent = V('spice')[L];
    fire.setAttribute('data-level', L);
    fire.style.setProperty('--heat', L);
    $$('.pl-chili', fire).forEach(function (c, i) {
      var on = i < L; c.classList.toggle('is-on', on);
      if (on && prev != null && i >= prev && !reduced()) { c.classList.remove('is-pop'); void c.offsetWidth; c.style.animationDelay = ((i - prev) * 70) + 'ms'; c.classList.add('is-pop'); }
    });
    $$('.pl-tick', ticks).forEach(function (t, i) { t.classList.toggle('is-on', i === L); });
  }
  $$('.pl-chili', fire).forEach(function (c) { c.addEventListener('animationend', function (e) { if (e.animationName.indexOf('pop') > -1 || e.animationName.indexOf('glow') > -1) { c.classList.remove('is-pop'); c.style.animationDelay = ''; } }); });
  function setSpice(v) {
    v = Math.max(0, Math.min(4, v)); var prev = state.spice; if (v === prev) return;
    state.spice = v; state.fixed = {}; save(); renderFire(prev); dirty();
  }
  range.addEventListener('input', function () { setSpice(+range.value); });

  /* ═════════ STEP 3 · diet (radiogroup) ═════════ */
  var radios = $$('[role="radio"][data-diet]');
  function renderDiet() {
    radios.forEach(function (r) { var on = r.getAttribute('data-diet') === state.diet; r.setAttribute('aria-checked', String(on)); r.tabIndex = on ? 0 : -1; });
  }
  function setDiet(d, focus) {
    if (!DIETS[d]) return; var changed = d !== state.diet;
    state.diet = d; if (changed) { state.fixed = {}; save(); dirty(); }
    renderDiet(); if (focus) radios.filter(function (r) { return r.getAttribute('data-diet') === d; })[0].focus();
  }
  radios.forEach(function (r, i) {
    r.addEventListener('click', function () { setDiet(r.getAttribute('data-diet')); });
    r.addEventListener('keydown', function (e) {
      var k = e.key, j = null;
      if (k === 'ArrowRight' || k === 'ArrowDown') j = (i + 1) % radios.length; else if (k === 'ArrowLeft' || k === 'ArrowUp') j = (i + radios.length - 1) % radios.length;
      else if (k === 'Home') j = 0; else if (k === 'End') j = radios.length - 1;
      if (j != null) { e.preventDefault(); setDiet(radios[j].getAttribute('data-diet'), true); }
    });
  });

  /* ═════════ STEPS ═════════ */
  var stage = $('#pl-stage'), stepEls = $$('.pl-step', stage), needDeal = true;
  function dirty() { needDeal = true; renderRules(); if (state.step === 4) { regen(); renderResult(true); } }
  function setStep(n, opt) {
    opt = opt || {};
    n = Math.max(1, Math.min(4, n)); var prev = state.step; state.step = n; save();
    stage.classList.toggle('is-result', n === 4);
    stepEls.forEach(function (el) {
      var on = +el.getAttribute('data-step') === n;
      el.classList.toggle('is-active', on);
      if (on) el.removeAttribute('inert'); else el.setAttribute('inert', '');
      el.setAttribute('aria-hidden', String(!on));
    });
    $$('.pl-steps button').forEach(function (b) {
      var s = +b.getAttribute('data-go');
      if (s === n) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      b.classList.toggle('is-done', s < n);
    });
    var cur = stepEls[n - 1];
    if (opt.animate !== false && !reduced() && prev !== n) { cur.classList.remove('is-enter'); void cur.offsetWidth; cur.classList.add('is-enter'); }
    if (n === 4) { regen(); renderResult(!opt.deal); if (opt.deal) { needDeal = false; deal(true); } }
    if (opt.focus) {
      var r = root.getBoundingClientRect();
      if (r.top < 0 || r.top > innerHeight * 0.5) root.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
      var hd = cur.querySelector('.pl-title'); if (hd) hd.focus({ preventScroll: true });
    }
    renderRules();
  }
  stepEls.forEach(function (el) { el.addEventListener('animationend', function (e) { if (e.target === el) el.classList.remove('is-enter'); }); });
  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]'); if (!b || !root.contains(b)) return;
    var n = +b.getAttribute('data-go');
    setStep(n, { focus: true, deal: n === 4 && (b.hasAttribute('data-plan') || needDeal) });
  });

  /* ═════════ STEP 4 · the table ═════════ */
  var tableEl = $('#pl-table'), listEl = $('#pl-list'), metersEl = $('#pl-meters');
  var ZC = {
    bazaar: { starters: ['#FF6A13', '#1D1147'], indochinese: ['#B5A4FF', '#1D1147'], tandoor: ['#F4737F', '#1D1147'], curry: ['#FFB000', '#1D1147'], biryani: ['#F27AB8', '#1D1147'], bread: ['#FFD27A', '#1D1147'], sweets: ['#F7A1C9', '#1D1147'], chai: ['#00A8A0', '#1D1147'] },
    royal: { starters: ['#4B1D52', '#F7D98A'], indochinese: ['#0E6A73', '#FBF3E4'], tandoor: ['#A3173F', '#FBF3E4'], curry: ['#0F4D3F', '#F7D98A'], biryani: ['#8C5A16', '#FBF3E4'], bread: ['#6E4212', '#F7D98A'], sweets: ['#7A1E4F', '#FBF3E4'], chai: ['#0E6A73', '#F7D98A'] }
  };
  var LIVE_ART = { biryani: 1, 'butter-chicken': 1, 'tandoori-platter': 1 };
  function monogram(name) {
    var w = name.replace(/[()]/g, '').split(/[\s\/&-]+/).filter(function (x) { return x && !/^(and|with|of|the)$/i.test(x); });
    var num = w.filter(function (x) { return /^\d+$/.test(x); })[0];
    if (num) return w[0][0].toUpperCase() + num;
    if (w.length === 1) return w[0].slice(0, 2);
    return (w[0][0] + w[1][0]).toUpperCase();
  }
  function artSrc(key, live) { return 'art/' + theme() + '/' + key + (live ? '-live' : '') + '.svg'; }
  function dishVisual(it, live) {
    if (it.art) return '<span class="pl-plate__dish"><img data-art="' + it.art + '"' + (live ? ' data-live="1"' : '') + ' src="' + artSrc(it.art, live) + '" alt="" width="120" height="120" decoding="async"></span>';
    var c = ZC[theme()][it.zone] || ['#ccc', '#000'];
    return '<span class="pl-plate__dish"><span class="pl-mono" data-zone="' + it.zone + '" style="--zc:' + c[0] + ';--zt:' + c[1] + '"><b>' + esc(monogram(it.name)) + '</b>' + use('pi-' + it.diet) + '</span></span>';
  }
  function heatHTML(sp) {
    if (!sp) return '<span class="pl-heat">' + esc(SPICE[0]) + '</span>';
    var s = ''; for (var i = 0; i < sp; i++) s += use('pi-chili');
    return '<span class="pl-heat" title="Estimate">' + s + ' ' + esc(SPICE[sp]) + '</span>';
  }
  function dietLabel(d) { return d === 'veg' ? 'Veg' : d === 'egg' ? 'Egg' : 'Non-veg'; }

  function layout(lines) {
    var center = lines.filter(function (l) { return l.item.zone === 'biryani'; })[0] || null;
    var ring = lines.filter(function (l) { return l !== center; }), n = Math.max(ring.length, 1);
    var s = 22, R = 34;
    for (var k = 0; k < 5; k++) { s = Math.min(n <= 6 ? 21 : 23, 0.86 * 2 * Math.PI * R / n); R = 44 - s / 2 - 1.5; }
    var cs = Math.min(33, (R - s / 2) * 2 - 5);
    var pos = {};
    if (center) pos[center.slotId] = { x: 50, y: 50, s: cs, c: true };
    ring.forEach(function (l, i) {
      var a = (-90 + 180 / n + i * 360 / n) * Math.PI / 180;
      pos[l.slotId] = { x: 50 + R * Math.cos(a), y: 50 + R * Math.sin(a), s: s };
    });
    return pos;
  }

  function renderResult(quiet) {
    if (!result) regen();
    var st = state, L = result.lines, t = theme(), pos = layout(L);
    // summary chips (tap to edit)
    $('.pl-summary').innerHTML =
      '<button type="button" class="pl-chip" data-go="1">' + esc(people(st.guests)) + (st.kids ? ' + kids' : '') + '</button>' +
      '<button type="button" class="pl-chip" data-go="2">' + use('pi-chili') + esc(SPICE[st.spice]) + '</button>' +
      '<button type="button" class="pl-chip" data-go="3">' + esc(DIETS[st.diet].label) + '</button>';
    // the round table
    var plates = L.map(function (l) {
      var p = pos[l.slotId], tilt = t === 'bazaar' ? ((hash(l.item.id) % 13) - 6) : 0;
      return '<div class="pl-plate' + (p.c ? ' pl-plate--center' : '') + '" data-slot="' + l.slotId + '" style="--x:' + p.x.toFixed(2) + ';--y:' + p.y.toFixed(2) + ';--s:' + p.s.toFixed(2) + ';--tilt:' + tilt + 'deg">' +
        '<div class="pl-plate__in">' + dishVisual(l.item, p.c && LIVE_ART[l.item.art]) +
        '<span class="pl-plate__n">' + l.n + '</span>' + (l.qty > 1 ? '<span class="pl-plate__q">×' + l.qty + '</span>' : '') +
        (l.pinned ? '<span class="pl-plate__pin">' + use('pi-pin') + '</span>' : '') + '</div></div>';
    }).join('');
    tableEl.innerHTML = '<div class="pl-cloth" aria-hidden="true"></div>' + plates;
    tableEl.setAttribute('aria-label', 'Your table for ' + people(st.guests) + ': ' + L.map(function (l) { return l.qty + ' ' + l.item.name; }).join(', ') + '.');
    $('#pl-seed').textContent = st.seed ? String(st.seed).padStart(2, '0') : 'Chef’s pick';
    $('.pl-plaque__k').hidden = !st.seed;
    $('#pl-chef').hidden = !st.seed;
    $('#pl-countline').innerHTML = '<b>' + result.totals.dishes + ' dishes</b> · ' + result.totals.items + ' items for ' + esc(people(st.guests));
    // balance meters ("a fun guide")
    var b = result.balance;
    function lab(v, arr) { return arr[Math.min(arr.length - 1, Math.floor(v * arr.length))]; }
    var M = [
      ['heat', 'Creamy', 'Fiery', b.heat, lab(b.heat, ['Creamy and mild', 'Gently warm', 'Nicely spiced', 'Properly hot', 'District hot']), 'Creamy to fiery'],
      ['diet', 'Veg', 'Non-veg', b.meat, b.meat === 0 ? 'All veg' : b.meat === 1 ? 'All non-veg' : lab(b.meat, ['Mostly veg', 'Leans veg', 'Half and half', 'Leans non-veg', 'Mostly non-veg']), 'Veg to non-veg'],
      ['rich', 'Light', 'Rich', b.rich, lab(b.rich, ['Light', 'Fresh', 'Balanced', 'Rich', 'Feast mode']), 'Light to rich']
    ];
    metersEl.innerHTML = M.map(function (m) {
      var v = Math.round(m[3] * 100);
      return '<div class="pl-meter pl-meter--' + m[0] + '" role="meter" aria-label="' + m[5] + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + v + '" aria-valuetext="' + esc(m[4]) + '">' +
        '<span class="pl-meter__l" aria-hidden="true">' + m[1] + '</span><span class="pl-meter__track" aria-hidden="true"><span class="pl-meter__pos" style="--v:' + (quiet ? m[3].toFixed(3) : 0.5) + '" data-v="' + m[3].toFixed(3) + '"><span class="pl-meter__dot"></span></span></span>' +
        '<span class="pl-meter__r" aria-hidden="true">' + m[2] + '</span><span class="pl-meter__v" aria-hidden="true">' + esc(m[4]) + '</span></div>';
    }).join('');
    if (!quiet) requestAnimationFrame(function () { requestAnimationFrame(function () { $$('.pl-meter__pos', metersEl).forEach(function (p) { p.style.setProperty('--v', p.getAttribute('data-v')); }); }); });
    // course list
    var groups = [];
    L.forEach(function (l) { var g = groups[groups.length - 1]; if (!g || g.zone !== l.item.zone) groups.push(g = { zone: l.item.zone, lines: [] }); g.lines.push(l); });
    listEl.innerHTML = groups.map(function (g) {
      var z = ZONES[g.zone];
      return '<section class="pl-course" aria-label="' + esc(z.name) + '"><h4 class="pl-course__name">' + esc(z.name) + '<span class="pl-course__tag">' + esc(z['tagline_' + t]) + '</span></h4><ul>' +
        g.lines.map(function (l) {
          var it = l.item, tags = [];
          if (it.popular) tags.push('<span class="pl-tag pl-tag--fav">Fan favorite</span>');
          if (it.availability) tags.push('<span class="pl-tag pl-tag--warn">' + esc(it.availability) + '</span>');
          if (l.askMild) tags.push('<span class="pl-tag pl-tag--warn">Ask for it milder</span>');
          if (l.gentle) tags.push('<span class="pl-tag pl-tag--kid">Gentle pick</span>');
          return '<li class="pl-dish' + (l.pinned ? ' is-pinned' : '') + '" data-slot="' + l.slotId + '">' +
            '<span class="pl-dish__art" aria-hidden="true">' + dishVisual(it, false) + '<span class="pl-plate__n">' + l.n + '</span></span>' +
            '<div class="pl-dish__body"><p class="pl-dish__name">' + esc(it.name) + ' <span class="pl-qty"><span aria-hidden="true">×</span><span class="sr-only">quantity </span>' + l.qty + '</span></p>' +
            '<p class="pl-dish__meta"><span class="pl-diet">' + use('pi-' + it.diet) + esc(dietLabel(it.diet)) + '</span>' + heatHTML(it.spice) + (it.portion ? '<span>' + esc(it.portion) + '</span>' : '') + '</p>' +
            '<p class="pl-dish__desc">' + esc(it['desc_' + t] || it.desc_neutral) + '</p>' +
            (tags.length ? '<p class="pl-tags">' + tags.join('') + '</p>' : '') + '</div>' +
            '<div class="pl-dish__acts">' +
            '<button type="button" class="pl-ib" data-act="pin" aria-pressed="' + l.pinned + '" aria-label="Pin ' + esc(it.name) + '" title="' + (l.pinned ? 'Pinned: stays when you shuffle' : 'Pin: keep when shuffling') + '">' + use('pi-pin') + '</button>' +
            '<button type="button" class="pl-ib" data-act="swap" aria-disabled="' + l.pinned + '" aria-label="Swap ' + esc(it.name) + ' for another ' + esc(z.name) + ' dish" title="' + (l.pinned ? 'Unpin to swap' : 'Swap within ' + esc(z.name)) + '">' + use('pi-swap') + '</button>' +
            '</div></li>';
        }).join('') + '</ul></section>';
    }).join('');
    // voice-dependent bits
    $('[data-voice="shuffle"]').textContent = V('shuffle');
  }

  /* deal the plates onto the table (Bazaar: bouncy fling · Royal: slow gold reveal) */
  function deal(all, onlySlots) {
    if (reduced()) return;
    var plates = $$('.pl-plate', tableEl), W = tableEl.getBoundingClientRect().width || 340, t = theme();
    plates.sort(function (a, b) { return (b.classList.contains('pl-plate--center') ? 1 : 0) - (a.classList.contains('pl-plate--center') ? 1 : 0); });
    var k = 0, last = 0;
    plates.forEach(function (p) {
      var sid = p.getAttribute('data-slot');
      if (onlySlots && onlySlots.indexOf(sid) < 0) {
        if (t === 'bazaar' && p.animate) p.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-8deg) scale(1.06)' }, { transform: 'rotate(0)' }], { duration: 420, delay: 120 });
        return;
      }
      var x = parseFloat(p.style.getPropertyValue('--x')), y = parseFloat(p.style.getPropertyValue('--y'));
      var dx = (50 - x) / 100 * W, dy = (122 - y) / 100 * W, i = k++;
      if (!p.animate) return;
      if (t === 'bazaar') {
        var dl = 70 + i * 85; last = Math.max(last, dl + 620);
        p.animate([
          { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(' + (-40 + (i % 4) * 25) + 'deg) scale(.5)', opacity: 0 },
          { opacity: 1, offset: 0.2 },
          { transform: 'translate(0,0) rotate(0) scale(1)', opacity: 1 }
        ], { duration: 620, delay: dl, easing: 'cubic-bezier(.34,1.42,.64,1)', fill: 'backwards' });
      } else {
        var dr = 120 + i * 120; last = Math.max(last, dr + 1000);
        p.animate([{ transform: 'translateY(10px) scale(.88)', opacity: 0 }, { transform: 'none', opacity: 1 }],
          { duration: 1000, delay: dr, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
        var ring = document.createElement('span'); ring.className = 'pl-plate__ring'; ring.setAttribute('aria-hidden', 'true');
        p.appendChild(ring);
        var a = ring.animate([{ transform: 'scale(.85)', opacity: 0 }, { transform: 'scale(1)', opacity: 0.9, offset: 0.35 }, { transform: 'scale(1.3)', opacity: 0 }],
          { duration: 1300, delay: dr + 250, easing: 'ease-out', fill: 'both' });
        a.onfinish = function () { ring.remove(); };
      }
    });
    if (all) setTimeout(function () { burst(); }, t === 'bazaar' ? Math.min(last, 1200) : Math.min(last * 0.6, 1500));
  }

  /* ═════════ interactions on the result ═════════ */
  listEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var li = b.closest('.pl-dish'), sid = li.getAttribute('data-slot'), act = b.getAttribute('data-act');
    var line = result.lines.filter(function (l) { return l.slotId === sid; })[0]; if (!line) return;
    if (act === 'pin') {
      if (state.pins[sid]) { delete state.pins[sid]; say('Unpinned ' + line.item.name); }
      else { state.pins[sid] = line.item.id; say('Pinned ' + line.item.name + '. It stays when you shuffle.'); }
      save(); regen(); renderResult(true); renderRules(); refocus(sid, 'pin');
    } else if (act === 'swap') {
      if (b.getAttribute('aria-disabled') === 'true') { toast('Unpin ' + line.item.name + ' to swap it.'); return; }
      swap(sid);
    }
  });
  function refocus(sid, act) { var b = listEl.querySelector('.pl-dish[data-slot="' + sid + '"] [data-act="' + act + '"]'); if (b) b.focus({ preventScroll: true }); }
  function swap(sid) {
    var line = result.lines.filter(function (l) { return l.slotId === sid; })[0];
    var others = result.lines.filter(function (l) { return l !== line; });
    var ctx = newCtx(); others.forEach(function (l) { ctxAdd(ctx, l.item, l.slot); });
    var r = rank(line.slot, normalize(state), ctx);
    var list = r.list.filter(function (it) { return it.zone === line.item.zone; });
    var used = {}; others.forEach(function (l) { used[l.item.id] = 1; });
    var i = list.indexOf(line.item), next = null;
    for (var k = 1; k <= list.length; k++) { var c = list[(i + k + list.length) % list.length]; if (c && c !== line.item && !used[c.id]) { next = c; break; } }
    if (!next) { toast('That’s the only ' + ZONES[line.item.zone].name + ' dish that fits your answers.'); return; }
    state.fixed = {}; result.lines.forEach(function (l) { state.fixed[l.slotId] = l.item.id; });
    state.fixed[sid] = next.id;
    save(); regen(); renderResult(true); renderRules();
    var row = listEl.querySelector('.pl-dish[data-slot="' + sid + '"]');
    if (row && !reduced()) row.classList.add('is-swapped');
    var plate = tableEl.querySelector('.pl-plate[data-slot="' + sid + '"]');
    if (plate && plate.animate && !reduced()) {
      plate.animate(theme() === 'bazaar'
        ? [{ transform: 'scale(.4) rotate(-90deg)', opacity: 0 }, { transform: 'scale(1.12) rotate(6deg)', opacity: 1, offset: 0.6 }, { transform: 'none' }]
        : [{ transform: 'scale(.9)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: theme() === 'bazaar' ? 520 : 900, easing: 'cubic-bezier(.22,1,.36,1)' });
    }
    say('Swapped ' + line.item.name + ' for ' + next.name + '.');
    refocus(sid, 'swap');
  }
  $('#pl-shuffle').addEventListener('click', function () {
    var before = result ? result.lines.map(function (l) { return l.slotId + ':' + l.item.id; }) : [];
    state.seed += 1; state.fixed = {}; save(); regen(); renderResult(false); renderRules();
    var changed = result.lines.filter(function (l) { return before.indexOf(l.slotId + ':' + l.item.id) < 0; }).map(function (l) { return l.slotId; });
    deal(false, changed.length ? changed : null);
    if (!reduced()) burst(true);
    say('Table number ' + state.seed + ': ' + result.totals.dishes + ' dishes. ' + (changed.length ? changed.length + ' changed.' : ''));
  });
  $('#pl-chef').addEventListener('click', function () {
    state.seed = 0; state.fixed = {}; save(); regen(); renderResult(false); renderRules(); deal(false);
    say('Back to the chef’s pick.'); $('#pl-shuffle').focus();
  });
  $('#pl-restart').addEventListener('click', function () {
    state = { step: 1, guests: 4, kids: false, spice: 2, diet: 'mixed', seed: 0, pins: {}, fixed: {} };
    save(); renderGuests(); renderFire(); renderDiet(); needDeal = true; setStep(1, { focus: true });
  });

  /* ═════════ share: group chat ═════════ */
  function shareText() {
    if (!result) regen();
    var st = state, out = [], groups = {};
    out.push('Our Curry District table · ' + people(st.guests) + (st.kids ? ' + kids' : '') + ' · ' + SPICE[st.spice] + ' heat · ' + DIETS[st.diet].label);
    result.lines.forEach(function (l) { (groups[l.item.zone] = groups[l.item.zone] || []).push(l.qty + '× ' + l.item.name); });
    COURSE_ORDER.forEach(function (z) { if (groups[z]) out.push(ZONES[z].name + ': ' + groups[z].join(', ')); });
    out.push(result.totals.dishes + ' dishes, ' + result.totals.items + ' items.');
    out.push('Order online: ' + CONFIG.orderUrl);
    out.push('(Planned with a concept demo. Please check availability and spice with the restaurant.)');
    return out.join('\n');
  }
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy') ? res() : rej(); } catch (e) { rej(e); } ta.remove();
    });
  }
  $('#pl-send').addEventListener('click', function () {
    var text = shareText();
    function fallback() { copy(text).then(function () { toast(V('copied')); }, function () { toast('Couldn’t copy. Long-press the list to select it.'); }); }
    if (navigator.share) {
      navigator.share({ title: 'Our Curry District table', text: text }).catch(function (e) { if (!e || e.name !== 'AbortError') fallback(); });
    } else fallback();
  });

  /* ═════════ live "how it picks" panel ═════════ */
  var rulesEl = document.getElementById('pl-rules-list');
  function renderRules() {
    if (!rulesEl) return;
    var r = result && result.state.guests === state.guests && result.state.spice === state.spice && result.state.diet === state.diet && result.state.kids === state.kids ? result : generate(state);
    var st = state, c = {};
    r.slots.forEach(function (s) { var z = s.zones[0]; c[z] = (c[z] || 0) + 1; });
    var shape = [];
    var SH = [['starters', 'starter'], ['tandoor', 'tandoor share'], ['curry', 'curry', 'curries'], ['biryani', 'biryani or rice'], ['bread', 'bread'], ['sweets', 'sweet'], ['chai', 'drink']];
    SH.forEach(function (x) { var n = c[x[0]]; if (n) shape.push(n + ' ' + (n > 1 ? (x[2] || x[1] + 's') : x[1])); });
    var mild = r.lines.filter(function (l) { return l.askMild; }).length;
    var dietTxt = {
      veg: 'only green veg marks can appear. Nothing else, ever.',
      vegegg: 'veg marks plus egg dishes; no meat or fish.',
      mixed: 'veg and non-veg, balanced course by course.',
      nonveg: 'mains lean non-veg; breads, sweets and drinks stay veg.'
    }[st.diet];
    var items = [
      '<b>Menu:</b> only dishes seen on public listings, ' + META.listedItems + ' of ' + META.totalItems + '. ' + META.hiddenUnconfirmed.length + ' uncertain ones never appear.',
      '<b>Diet:</b> <span class="is-live">' + esc(DIETS[st.diet].label) + '</span>: ' + dietTxt,
      '<b>Heat line:</b> <span class="is-live">' + esc(SPICE[st.spice]) + '</span> (our estimates). Nothing above it' + (mild ? '; ' + mild + (mild > 1 ? ' courses' : ' course') + ' had nothing that gentle, so it takes the mildest and says “ask for it milder”.' : '.') +
        (st.spice >= 3 && c.curry > 1 ? ' One curry stays cooler so the table has somewhere to rest.' : ''),
      '<b>Shape for ' + esc(people(st.guests)) + ':</b> <span class="is-live">' + shape.join(' · ') + '</span>.',
      '<b>Variety:</b> repeats of the same protein or style score lower.',
      '<b>Nudges:</b> fan favorites and the menu’s own collections (First Time Here?, Fire Lovers, Veg Heaven, Share the Table, Sweet Finish) score higher.',
      '<b>Kids:</b> <span class="is-live">' + (st.kids ? 'on' : 'off') + '</span>' + (st.kids ? ': a gentle starter and curry (Mild or less) plus a mango-drink nudge.' : '. Turn it on for a gentle starter and curry.'),
      '<b>Quantities:</b> about one bread per person, one curry order per two guests, a drink per two or three.',
      '<b>Table no. <span class="is-live">' + (st.seed ? st.seed : '0 · chef’s pick') + '</span>:</b> Shuffle moves to the next number. Pinned dishes stay put.'
    ];
    rulesEl.innerHTML = items.map(function (x) { return '<li><span>' + x + '</span></li>'; }).join('');
  }

  /* ═════════ FX: Bazaar confetti petals · Royal embers ═════════ */
  var cv = null, cx = null, parts = [], raf = 0, glow = null;
  function ensureCanvas() {
    if (cv) return;
    cv = document.createElement('canvas'); cv.className = 'pl-fxlayer'; cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:120';
    document.body.appendChild(cv); cx = cv.getContext('2d');
  }
  function burst(small) {
    if (reduced()) return;
    ensureCanvas();
    var dpr = Math.min(2, window.devicePixelRatio || 1), W = innerWidth, H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var rect = tableEl.getBoundingClientRect(), ox = rect.left + rect.width / 2, oy = rect.top + rect.height * 0.45;
    if (rect.bottom < 0 || rect.top > H) { ox = W / 2; oy = H * 0.4; }
    var t = theme(), now = performance.now();
    var N = t === 'bazaar' ? (small ? 26 : (W < 640 ? 54 : 80)) : (small ? 18 : (W < 640 ? 34 : 50));
    for (var i = 0; i < N; i++) {
      if (t === 'bazaar') {
        var ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, sp = 5 + Math.random() * 8;
        parts.push({ k: 'p', x: ox, y: oy, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3,
          w: 6 + Math.random() * 6, h: 3 + Math.random() * 3, c: ['#FFB000', '#FF6A13', '#E4147E', '#00A8A0', '#FFF4DC', '#FFB000'][i % 6], t0: now, life: 1500 + Math.random() * 600 });
      } else {
        parts.push({ k: 'e', x: ox + (Math.random() - 0.5) * rect.width * 0.8, y: oy + rect.height * (0.15 + Math.random() * 0.3), vx: 0, vy: -(0.5 + Math.random() * 1.3),
          ph: Math.random() * 6.28, r: 1.6 + Math.random() * 2.6, t0: now + Math.random() * 500, life: 2000 + Math.random() * 900 });
      }
    }
    if (!glow) {
      glow = document.createElement('canvas'); glow.width = glow.height = 32; var g = glow.getContext('2d');
      var rg = g.createRadialGradient(16, 16, 0, 16, 16, 16); rg.addColorStop(0, 'rgba(255,241,198,1)'); rg.addColorStop(0.25, 'rgba(247,217,138,.9)'); rg.addColorStop(0.6, 'rgba(233,166,58,.35)'); rg.addColorStop(1, 'rgba(233,166,58,0)');
      g.fillStyle = rg; g.fillRect(0, 0, 32, 32);
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick(now) {
    cx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(function (p) { return now - p.t0 < p.life; });
    parts.forEach(function (p) {
      var age = now - p.t0; if (age < 0) return;
      var k = age / p.life, a = k > 0.75 ? (1 - k) / 0.25 : 1;
      if (p.k === 'p') {
        p.vy += 0.28; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        cx.save(); cx.globalAlpha = a; cx.translate(p.x, p.y); cx.rotate(p.r); cx.scale(1, Math.cos(age / 120 + p.w));
        cx.beginPath(); cx.ellipse(0, 0, p.w, p.h, 0, 0, 6.283); cx.fillStyle = p.c; cx.fill(); cx.lineWidth = 1.5; cx.strokeStyle = '#1D1147'; cx.stroke(); cx.restore();
      } else {
        p.y += p.vy; p.x += Math.sin(age / 400 + p.ph) * 0.45;
        var fl = 0.65 + 0.35 * Math.sin(age / 90 + p.ph), s = p.r * 6;
        cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = a * fl * Math.min(1, age / 300);
        cx.drawImage(glow, p.x - s / 2, p.y - s / 2, s, s); cx.globalCompositeOperation = 'source-over'; cx.globalAlpha = 1;
      }
    });
    if (parts.length) raf = requestAnimationFrame(tick); else { raf = 0; cx.clearRect(0, 0, innerWidth, innerHeight); cv.width = cv.height = 0; }
  }

  /* ═════════ THEME (A · Bazaar / B · Royal) ═════════ */
  var themeBtns = $$('[data-pl-theme]'), lastTheme = theme();
  function applyVoice() {
    $$('[data-voice]').forEach(function (el) { var v = V(el.getAttribute('data-voice')); if (typeof v === 'string') el.textContent = v; });
    themeBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-pl-theme') === theme())); });
    $$('img[data-art]').forEach(function (img) { img.src = artSrc(img.getAttribute('data-art'), img.hasAttribute('data-live')); });
  }
  function onTheme() {
    var t = theme(); if (t === lastTheme) return; lastTheme = t;
    applyVoice(); renderGuests(); renderFire(); if (state.step === 4) renderResult(true);
    if (!reduced()) {
      root.classList.remove('is-reskin'); void root.offsetWidth; root.classList.add('is-reskin');
      if (t === 'royal') { var sh = $('.pl-sheen'); sh.classList.remove('is-run'); void sh.offsetWidth; sh.classList.add('is-run'); }
      burst(true);
    }
    say((t === 'royal' ? 'B · Royal' : 'A · Bazaar') + ' style');
  }
  root.addEventListener('animationend', function (e) { if (e.target === root) root.classList.remove('is-reskin'); });
  themeBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.getAttribute('data-pl-theme');
      if (window.Hub && Hub.setDirection) Hub.setDirection(t); else root.setAttribute('data-theme', t);
      onTheme();
    });
  });
  if (window.MutationObserver) new MutationObserver(onTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  document.addEventListener('hub:direction', onTheme);

  /* ═════════ boot ═════════ */
  applyVoice(); renderGuests(); renderFire(); renderDiet();
  setStep(state.step, { animate: false, deal: state.step === 4 });
  renderRules();

  window.CDPlanner = {
    generate: generate, normalize: normalize, items: ITEMS, config: CONFIG,
    getState: function () { return JSON.parse(JSON.stringify(state)); },
    getResult: function () { return result; },
    shareText: shareText, setStep: setStep
  };
})();

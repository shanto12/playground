/* Curry District · A · BAZAAR — THE DISTRICT MENU (menu.html only).
   Progressive enhancement over the pre-rendered menu (scripts/build-menu.js): filters (diet, heat,
   guest favourites, shortcuts), live search with highlights, live counts, URL state (?diet=&heat=&fav=&set=&q=),
   sticky zone navigator with scrollspy + smooth anchors. Without JS the whole menu is still there. */
(function () {
  'use strict';
  var d = document, w = window, de = d.documentElement;
  var root = d.querySelector('[data-menu]');
  if (!root) return;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var mq = w.matchMedia ? w.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduced = function () { return !!(mq && mq.matches); };

  /* ---------- text helpers ---------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  // lower-case + collapse doubled letters (chilli → chili, channa → chana); m[i] = index in the original string
  function norm(s) {
    var low = String(s).toLowerCase(), t = '', m = [], prev = '';
    for (var i = 0; i < low.length; i++) {
      var c = low.charAt(i);
      if (c === prev && /[a-z]/.test(c)) continue;
      t += c; m.push(i); prev = c;
    }
    return { s: String(s), t: t, m: m };
  }
  var SYN = { kebab: 'kabab', kebob: 'kabab', dahl: 'dal', biriyani: 'biryani', briyani: 'biryani', chickpea: 'chana', cauliflower: 'gobi' };
  function parseQuery(q) {
    return norm(q.trim()).t.split(/\s+/).filter(Boolean).map(function (t) {
      var alts = [t];
      Object.keys(SYN).forEach(function (k) { var nk = norm(k).t; if (t.indexOf(nk) === 0 || nk.indexOf(t) === 0 && t.length > 3) alts.push(norm(SYN[k]).t); });
      return alts;
    });
  }
  function ranges(f, terms) {
    var out = [];
    terms.forEach(function (alts) {
      alts.forEach(function (a) {
        var i = f.t.indexOf(a);
        while (i > -1) {
          var end = i + a.length < f.m.length ? f.m[i + a.length] : f.s.length;
          out.push([f.m[i], end]); i = f.t.indexOf(a, i + 1);
        }
      });
    });
    out.sort(function (x, y) { return x[0] - y[0]; });
    var merged = [];
    out.forEach(function (r) { var l = merged[merged.length - 1]; if (l && r[0] <= l[1]) l[1] = Math.max(l[1], r[1]); else merged.push(r.slice()); });
    return merged;
  }
  function marked(f, rs) {
    var h = '', p = 0;
    rs.forEach(function (r) { h += esc(f.s.slice(p, r[0])) + '<mark class="hit">' + esc(f.s.slice(r[0], r[1])) + '</mark>'; p = r[1]; });
    return h + esc(f.s.slice(p));
  }
  function hasTerm(f, alts) { for (var i = 0; i < alts.length; i++) if (f.t.indexOf(alts[i]) > -1) return true; return false; }

  /* ---------- items (read from the static cards) ---------- */
  var items = $$('.dish', root).map(function (el) {
    var nameEl = el.querySelector('.dish__name'), descEl = el.querySelector('.dish__desc');
    return {
      el: el, li: el.parentNode, zone: el.getAttribute('data-zone'), diet: el.getAttribute('data-diet'),
      spice: +el.getAttribute('data-spice'), pop: el.getAttribute('data-pop') === '1',
      sets: (el.getAttribute('data-sets') || '').split(' ').filter(Boolean),
      nameEl: nameEl, descEl: descEl, whyEl: el.querySelector('.dish__why'),
      fName: norm(nameEl.textContent), fDesc: norm(descEl.textContent),
      fAlias: norm(el.getAttribute('data-a') || ''), fNeutral: norm(el.getAttribute('data-n') || ''),
      shown: true, hl: false, ok: true
    };
  });
  var zones = $$('[data-zone-sec]', root).map(function (sec) {
    return { id: sec.id, sec: sec, head: sec.querySelector('.zone__title'), label: sec.querySelector('[data-zone-label]'),
      total: +(sec.querySelector('[data-zone-label]') || {}).getAttribute('data-zone-label') || 0,
      link: d.querySelector('[data-zone-link="' + sec.id + '"]'), name: sec.querySelector('.zone__title').textContent };
  });
  zones.forEach(function (z) { z.n = z.link && z.link.querySelector('[data-n]'); });
  var btns = $$('[data-f]');
  var input = d.getElementById('menu-q'), qClear = d.querySelector('[data-q-clear]');
  var status = d.getElementById('menu-status'), badge = d.querySelector('[data-filter-badge]');
  var empty = d.querySelector('[data-empty]'), emptyQ = d.querySelector('[data-empty-q]');
  var setBanner = d.querySelector('[data-set-banner]');
  var clearBtns = $$('[data-clear]');
  var HEAT = ['Not spicy', 'Mild', 'Medium', 'Hot', 'District Hot'], DIET = { veg: 'Veg', nonveg: 'Non-veg', egg: 'Egg' };
  var SETS = {};
  btns.forEach(function (b) { if (b.getAttribute('data-f') === 'set' && b.getAttribute('data-v')) SETS[b.getAttribute('data-v')] = { name: b.getAttribute('data-name'), tag: b.getAttribute('data-tag') }; });

  /* ---------- state ---------- */
  var state = { diet: 'all', heat: null, fav: false, set: '', q: '' }, terms = [];
  function fresh() { return { diet: 'all', heat: null, fav: false, set: '', q: '' }; }
  function active(s) { return (s.diet !== 'all') + (s.heat !== null) + (!!s.fav) + (!!s.set) + (!!s.q.trim()); }
  function pass(it, skip) {
    if (skip !== 'diet' && state.diet !== 'all' && it.diet !== state.diet) return false;
    if (skip !== 'heat' && state.heat !== null && it.spice !== state.heat) return false;
    if (skip !== 'fav' && state.fav && !it.pop) return false;
    if (skip !== 'set' && state.set && it.sets.indexOf(state.set) < 0) return false;
    return it.ok;
  }
  function readURL() {
    var s = fresh(), p;
    try { p = new URLSearchParams(w.location.search); } catch (e) { return s; }
    var dv = p.get('diet'); if (DIET[dv]) s.diet = dv;
    var hv = p.get('heat'); if (hv !== null && /^[0-4]$/.test(hv)) s.heat = +hv;
    s.fav = p.get('fav') === '1';
    var sv = p.get('set'); if (sv && SETS[sv]) s.set = sv;
    s.q = (p.get('q') || '').slice(0, 60);
    return s;
  }
  function writeURL() {
    var p = [];
    if (state.diet !== 'all') p.push('diet=' + state.diet);
    if (state.heat !== null) p.push('heat=' + state.heat);
    if (state.fav) p.push('fav=1');
    if (state.set) p.push('set=' + state.set);
    if (state.q.trim()) p.push('q=' + encodeURIComponent(state.q.trim()));
    try { history.replaceState(history.state, '', w.location.pathname + (p.length ? '?' + p.join('&') : '') + w.location.hash); } catch (e) { /* file:// etc. */ }
  }

  /* ---------- render ---------- */
  function setCount(b, n) {
    var c = b.querySelector('[data-c]');
    if (c) c.innerHTML = '<span class="visually-hidden">, </span>' + n + '<span class="visually-hidden"> ' + (n === 1 ? 'dish' : 'dishes') + '</span>';
    b.classList.toggle('is-zero', n === 0);
  }
  function apply(opts) {
    opts = opts || {};
    terms = parseQuery(state.q);
    items.forEach(function (it) {
      if (!terms.length) { it.ok = true; return; }
      var f = [it.fName, it.fDesc, it.fAlias, it.fNeutral];
      it.ok = terms.every(function (alts) { return f.some(function (x) { return hasTerm(x, alts); }); });
    });
    /* buttons: pressed state + live counts (each count respects every other active filter) */
    btns.forEach(function (b) {
      var f = b.getAttribute('data-f'), v = b.getAttribute('data-v'), on, n;
      if (f === 'diet') { on = state.diet === v; n = items.filter(function (it) { return pass(it, 'diet') && (v === 'all' || it.diet === v); }).length; }
      else if (f === 'heat') { on = v === '' ? state.heat === null : state.heat === +v; n = v === '' ? -1 : items.filter(function (it) { return pass(it, 'heat') && it.spice === +v; }).length; }
      else if (f === 'fav') { on = state.fav; n = items.filter(function (it) { return pass(it, 'fav') && it.pop; }).length; }
      else if (f === 'set') { on = state.set === v; n = items.filter(function (it) { return pass(it, 'set') && (!v || it.sets.indexOf(v) > -1); }).length; }
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (n > -1) setCount(b, n);
    });
    /* cards */
    var shown = 0, appeared = [], perZone = {};
    items.forEach(function (it) {
      var vis = pass(it);
      if (vis !== it.shown) { it.li.hidden = !vis; if (vis) appeared.push(it.el); it.shown = vis; }
      if (vis) { shown++; perZone[it.zone] = (perZone[it.zone] || 0) + 1; }
      highlight(it, vis);
    });
    var streets = 0;
    zones.forEach(function (z) {
      var n = perZone[z.id] || 0;
      z.sec.hidden = n === 0; if (n) streets++;
      if (z.n) z.n.textContent = n;
      if (z.link) z.link.classList.toggle('is-empty', n === 0);
      if (z.label) z.label.textContent = n === z.total ? z.total + ' dishes' : n + ' of ' + z.total + ' dishes';
    });
    /* summary + empty state */
    var a = active(state), bits = [];
    if (state.diet !== 'all') bits.push(DIET[state.diet]);
    if (state.heat !== null) bits.push(HEAT[state.heat]);
    if (state.fav) bits.push('Guest favorites');
    if (state.set) bits.push(SETS[state.set].name);
    if (state.q.trim()) bits.push('“' + state.q.trim() + '”');
    var msg = !a ? 'Showing all <b>' + shown + '</b> dishes on ' + streets + ' streets.'
      : shown ? '<b>' + shown + '</b> ' + (shown === 1 ? 'dish' : 'dishes') + ' on ' + streets + ' ' + (streets === 1 ? 'street' : 'streets') + ' · ' + esc(bits.join(' · '))
      : 'No dishes match ' + esc(bits.join(' · ')) + '.';
    if (status.innerHTML !== msg) status.innerHTML = msg;
    empty.hidden = shown > 0;
    emptyQ.hidden = !state.q.trim() || shown > 0;
    emptyQ.textContent = 'No dish on our map matches “' + state.q.trim() + '”.';
    clearBtns.forEach(function (b) { if (!b.closest('[data-empty]')) b.hidden = !a; });
    if (badge) { badge.hidden = !a; badge.innerHTML = a + '<span class="visually-hidden"> active</span>'; }
    setBanner.hidden = !state.set;
    if (state.set) {
      setBanner.querySelector('[data-set-name]').textContent = SETS[state.set].name;
      setBanner.querySelector('[data-set-tag]').textContent = SETS[state.set].tag;
      setBanner.querySelector('[data-set-plan]').hidden = state.set !== 'share-the-table';
    }
    if (input.value !== state.q && !opts.typing) input.value = state.q;
    qClear.hidden = !input.value;
    if (!opts.silent) writeURL();
    if (appeared.length && !reduced() && opts.animate !== false && w.Element && Element.prototype.animate) {
      appeared.slice(0, 18).forEach(function (el, i) {
        el.animate([{ opacity: 0, transform: 'translateY(10px) scale(.96)' }, { opacity: 1, transform: 'none' }],
          { duration: 320, delay: i * 22, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'backwards' });
      });
    }
    spyLater();
  }
  function highlight(it, vis) {
    var want = vis && terms.length > 0;
    if (!want && !it.hl) return;
    if (!want) {
      it.nameEl.textContent = it.fName.s; it.descEl.textContent = it.fDesc.s; it.whyEl.hidden = true; it.hl = false; return;
    }
    it.nameEl.innerHTML = marked(it.fName, ranges(it.fName, terms));
    it.descEl.innerHTML = marked(it.fDesc, ranges(it.fDesc, terms));
    /* a term that only matched hidden text (alias / plain-English description): show why the dish is here */
    var hidden = terms.filter(function (alts) { return !hasTerm(it.fName, alts) && !hasTerm(it.fDesc, alts); });
    if (hidden.length) {
      var f = hidden.some(function (alts) { return hasTerm(it.fNeutral, alts); }) ? it.fNeutral : it.fAlias;
      var pre = f === it.fAlias ? 'Also listed as: ' : '';
      it.whyEl.innerHTML = esc(pre) + marked(f, ranges(f, terms));
      it.whyEl.hidden = false;
    } else it.whyEl.hidden = true;
    it.hl = true;
  }

  /* ---------- controls ---------- */
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-f'), v = b.getAttribute('data-v');
      if (f === 'diet') state.diet = (state.diet === v && v !== 'all') ? 'all' : v;
      else if (f === 'heat') state.heat = v === '' ? null : (state.heat === +v ? null : +v);
      else if (f === 'fav') state.fav = !state.fav;
      else if (f === 'set') state.set = (state.set === v) ? '' : v;
      apply();
    });
  });
  var tmr = 0;
  input.addEventListener('input', function () {
    qClear.hidden = !input.value;
    clearTimeout(tmr);
    tmr = setTimeout(function () { state.q = input.value.slice(0, 60); apply({ typing: true }); }, 180);
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && input.value) { e.preventDefault(); input.value = ''; state.q = ''; apply(); }
    if (e.key === 'Enter') { e.preventDefault(); clearTimeout(tmr); state.q = input.value.slice(0, 60); apply({ typing: true }); }
  });
  qClear.addEventListener('click', function () { input.value = ''; state.q = ''; apply(); input.focus(); });
  function clearAll() { state = fresh(); input.value = ''; apply(); }
  clearBtns.forEach(function (b) {
    b.addEventListener('click', function () { clearAll(); try { status.focus({ preventScroll: true }); } catch (e) { status.focus(); } });
  });
  var showDish = d.querySelector('[data-show-dish]');
  if (showDish) showDish.addEventListener('click', function () { clearAll(); }); // motion kit then scrolls to the (now visible) dish

  /* ---------- zone navigator: smooth anchors + scrollspy ---------- */
  var rail = d.querySelector('.zn__list'), activeId = null, lockUntil = 0, spyRaf = 0, spyOff = 140;
  function measure() { spyOff = (parseFloat(getComputedStyle(de).scrollPaddingTop) || 140) + 6; }
  function centerLink(link) {
    if (!rail || rail.scrollWidth <= rail.clientWidth + 2) return;
    var x = link.parentNode.offsetLeft - (rail.clientWidth - link.offsetWidth) / 2;
    try { rail.scrollTo({ left: Math.max(0, x), behavior: reduced() ? 'auto' : 'smooth' }); } catch (e) { rail.scrollLeft = Math.max(0, x); }
  }
  function setActive(id) {
    if (id === activeId) return;
    activeId = id;
    zones.forEach(function (z) {
      if (!z.link) return;
      if (z.id === id) { z.link.setAttribute('aria-current', 'true'); centerLink(z.link); } else z.link.removeAttribute('aria-current');
    });
  }
  function spy() {
    spyRaf = 0;
    if (Date.now() < lockUntil) return;
    var cur = null;
    for (var i = 0; i < zones.length; i++) {
      var z = zones[i]; if (z.sec.hidden) continue;
      if (z.sec.getBoundingClientRect().top - spyOff <= 2) cur = z.id; else break;
    }
    setActive(cur);
  }
  function spyLater() { if (!spyRaf) spyRaf = w.requestAnimationFrame(spy); }
  w.addEventListener('scroll', spyLater, { passive: true });
  w.addEventListener('resize', function () { measure(); spyLater(); });

  function goTo(el, focusEl) {
    var smooth = !reduced();
    el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    if (focusEl) { try { focusEl.focus({ preventScroll: true }); } catch (e) { /* old browsers */ } }
  }
  zones.forEach(function (z) {
    if (!z.link) return;
    z.link.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
      e.preventDefault();
      if (z.sec.hidden) { // nothing on this street matches: clear the filters so the street exists again
        clearAll();
        status.textContent = 'Filters cleared to show ' + z.name + '. Showing all ' + items.length + ' dishes.';
      }
      lockUntil = Date.now() + (reduced() ? 50 : 900);
      setActive(z.id);
      goTo(z.sec, z.head);
      try { history.replaceState(history.state, '', w.location.pathname + w.location.search + '#' + z.id); } catch (err) { /* ignore */ }
      setTimeout(spyLater, reduced() ? 60 : 950);
    });
  });

  /* ---------- boot: restore URL state, honour deep links (#biryani, #dish-x) ---------- */
  state = readURL();
  var hadFilters = active(state) > 0;
  apply({ silent: true, animate: false });
  measure();
  var target = null, h = '';
  try { h = decodeURIComponent(w.location.hash.slice(1)); } catch (e) { h = ''; }
  if (h) target = d.getElementById(h);
  if (target && root.contains(target)) {
    var li = target.classList.contains('dish') ? target.parentNode : null;
    if ((li && li.hidden) || (target.hasAttribute('data-zone-sec') && target.hidden)) { state = fresh(); apply({ animate: false }); hadFilters = true; }
    if (hadFilters) w.requestAnimationFrame(function () { target.scrollIntoView({ block: 'start' }); });
  }
  spyLater();
  w.addEventListener('pageshow', function (e) { if (e.persisted) { state = readURL(); apply({ silent: true, animate: false }); } });
})();

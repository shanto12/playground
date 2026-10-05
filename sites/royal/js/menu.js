/*! Curry District · Royal — menu.html enhancements.
   The menu is pre-rendered static HTML (scripts/build-menu.js); this file only enhances it:
   filters (diet · heat · guest favourites · collections) + debounced search with highlight,
   state mirrored in the URL query (?diet=veg&heat=2&fav=1&set=fire-lovers&q=gongura) and restored,
   live counts, courses scrollspy + smooth scroll + deep links, slow reveal of dish art. */
(function (w, d) {
  'use strict';
  var root = d.documentElement;
  var menu = d.querySelector('[data-menu]');
  if (!menu) return;
  root.classList.add('menu-ready');

  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var reduce = !!(w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var norm = function (s) {
    s = String(s || '').toLowerCase();
    if (s.normalize) s = s.normalize('NFD').replace(/[̀-ͯ]/g, '');
    return s.replace(/[’'`]/g, '').replace(/[^a-z0-9&]+/g, ' ').trim();
  };
  var escRe = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };

  /* ── model ── */
  var items = $$('.dish', menu).map(function (el) {
    return {
      el: el, diet: el.getAttribute('data-diet'), spice: +el.getAttribute('data-spice'),
      fav: el.getAttribute('data-fav') === '1',
      sets: (el.getAttribute('data-sets') || '').split(' ').filter(Boolean),
      search: el.getAttribute('data-search') || '',
      hl: $$('[data-hl]', el).map(function (n) { return { node: n, text: n.textContent }; }),
      marked: false
    };
  });
  var total = items.length;
  var courses = $$('[data-course]', menu).map(function (sec) {
    return {
      el: sec, id: sec.id, count: $('[data-course-count]', sec), noun: $('[data-course-noun]', sec),
      title: $('.course__title', sec), tab: $('[data-course-tab="' + sec.id + '"]'),
      items: items.filter(function (it) { return sec.contains(it.el); })
    };
  });

  /* ── controls ── */
  var dietBtns = $$('[data-f-diet]'), heatBtns = $$('[data-f-heat]'), setBtns = $$('[data-f-set]');
  var favBtn = $('[data-f-fav]'), qInput = $('[data-f-q]'), qClear = $('[data-q-clear]');
  var panelClear = $('.refine__clear'), clearBtns = $$('[data-f-clear]');
  var countEl = $('[data-menu-count]'), emptyEl = $('[data-menu-empty]'), badge = $('[data-filter-badge]');
  var heatValue = $('[data-heat-value]'), setNote = $('[data-set-note]');
  var DIETS = dietBtns.map(function (b) { return b.getAttribute('data-f-diet'); });
  var HEATS = heatBtns.map(function (b) { return +b.getAttribute('data-f-heat'); });
  var HEAT_LABEL = heatBtns.map(function (b) { return ($('.heat__name', b) || b).textContent; });
  var SETS = setBtns.map(function (b) { return b.getAttribute('data-f-set'); });

  var state = { diet: 'all', heat: null, fav: false, set: null, q: '' };
  var activeCount = function () {
    return (state.diet !== 'all' ? 1 : 0) + (state.heat !== null ? 1 : 0) + (state.fav ? 1 : 0) + (state.set ? 1 : 0) + (state.q.trim() ? 1 : 0);
  };

  function matches(it, toks) {
    if (state.diet !== 'all' && it.diet !== state.diet) return false;
    if (state.heat !== null && it.spice > state.heat) return false;
    if (state.fav && !it.fav) return false;
    if (state.set && it.sets.indexOf(state.set) < 0) return false;
    for (var i = 0; i < toks.length; i++) if (it.search.indexOf(toks[i]) < 0) return false;
    return true;
  }

  function highlight(it, re) {
    if (!re && !it.marked) return;
    it.hl.forEach(function (h) {
      if (!re) { h.node.textContent = h.text; return; }
      var parts = h.text.split(re), frag = d.createDocumentFragment();
      parts.forEach(function (p, i) {
        if (!p) return;
        if (i % 2) { var m = d.createElement('mark'); m.textContent = p; frag.appendChild(m); }
        else frag.appendChild(d.createTextNode(p));
      });
      h.node.textContent = '';
      h.node.appendChild(frag);
    });
    it.marked = !!re;
  }

  function setPressed(btn, on) { btn.setAttribute('aria-pressed', on ? 'true' : 'false'); }

  function apply(opts) {
    opts = opts || {};
    var q = norm(state.q), toks = q ? q.split(' ') : [];
    var re = toks.length ? new RegExp('(' + toks.slice().sort(function (a, b) { return b.length - a.length; }).map(escRe).join('|') + ')', 'gi') : null;
    var shown = 0;
    items.forEach(function (it) {
      var ok = matches(it, toks);
      it.el.hidden = !ok;
      if (ok) shown++;
      highlight(it, ok ? re : null);
    });
    courses.forEach(function (c) {
      var n = 0;
      c.items.forEach(function (it) { if (!it.el.hidden) n++; });
      c.el.hidden = n === 0;
      if (c.count) c.count.textContent = n;
      if (c.noun) c.noun.textContent = n === 1 ? 'dish' : 'dishes';
      if (c.tab) { if (n) c.tab.removeAttribute('aria-disabled'); else c.tab.setAttribute('aria-disabled', 'true'); }
    });

    /* controls reflect state */
    dietBtns.forEach(function (b) { setPressed(b, b.getAttribute('data-f-diet') === state.diet); });
    heatBtns.forEach(function (b) {
      var v = +b.getAttribute('data-f-heat');
      setPressed(b, v === state.heat);
      b.classList.toggle('is-lit', state.heat !== null && v <= state.heat);
    });
    if (heatValue) heatValue.textContent = state.heat === null ? 'any level' : HEAT_LABEL[HEATS.indexOf(state.heat)];
    if (favBtn) setPressed(favBtn, state.fav);
    var setLabel = '';
    setBtns.forEach(function (b) {
      var on = b.getAttribute('data-f-set') === state.set;
      setPressed(b, on);
      if (on) { setLabel = b.textContent.trim(); if (setNote) setNote.textContent = b.getAttribute('data-note') || ''; }
    });
    if (setNote) setNote.hidden = !state.set;
    if (qClear) qClear.hidden = !qInput.value;

    /* counts + empty state */
    var active = activeCount();
    var txt;
    if (!active) txt = 'Showing all ' + total + ' dishes';
    else if (!shown) txt = 'No dishes match' + (state.q.trim() ? ' “' + state.q.trim() + '”' : ' these filters');
    else txt = 'Showing ' + shown + ' of ' + total + (shown === 1 ? ' dish' : ' dishes') +
      (setLabel ? ' · ' + setLabel : '') + (state.q.trim() ? ' for “' + state.q.trim() + '”' : '');
    if (countEl && countEl.textContent !== txt) countEl.textContent = txt;
    if (emptyEl) emptyEl.hidden = shown !== 0;
    if (panelClear) panelClear.hidden = !active;
    if (badge) { badge.hidden = !active; badge.textContent = active || ''; }

    if (!opts.noUrl) writeURL();
    spy();
  }

  /* ── URL state ── */
  function writeURL() {
    if (!w.history || !history.replaceState) return;
    var p = [];
    if (state.diet !== 'all') p.push('diet=' + state.diet);
    if (state.heat !== null) p.push('heat=' + state.heat);
    if (state.fav) p.push('fav=1');
    if (state.set) p.push('set=' + state.set);
    if (state.q.trim()) p.push('q=' + encodeURIComponent(state.q.trim()));
    var url = location.pathname + (p.length ? '?' + p.join('&') : '') + location.hash;
    if (url !== location.pathname + location.search + location.hash) {
      try { history.replaceState(history.state, '', url); } catch (e) { /* file:// or sandboxed */ }
    }
  }
  function readURL() {
    var sp;
    try { sp = new URLSearchParams(location.search); } catch (e) { return; }
    var diet = sp.get('diet'); if (DIETS.indexOf(diet) > -1) state.diet = diet;
    var heat = sp.get('heat'); if (heat !== null && heat !== '' && HEATS.indexOf(+heat) > -1) state.heat = +heat;
    state.fav = sp.get('fav') === '1';
    var set = sp.get('set'); if (SETS.indexOf(set) > -1) state.set = set;
    var q = sp.get('q'); if (q) { state.q = q.slice(0, 60); if (qInput) qInput.value = state.q; }
  }

  function reset() {
    state.diet = 'all'; state.heat = null; state.fav = false; state.set = null; state.q = '';
    if (qInput) qInput.value = '';
    apply();
  }

  /* ── events ── */
  dietBtns.forEach(function (b) { b.addEventListener('click', function () { state.diet = b.getAttribute('data-f-diet'); apply(); }); });
  heatBtns.forEach(function (b) {
    b.addEventListener('click', function () { var v = +b.getAttribute('data-f-heat'); state.heat = state.heat === v ? null : v; apply(); });
  });
  if (favBtn) favBtn.addEventListener('click', function () { state.fav = !state.fav; apply(); });
  setBtns.forEach(function (b) {
    b.addEventListener('click', function () { var id = b.getAttribute('data-f-set'); state.set = state.set === id ? null : id; apply(); });
  });
  var qTimer = 0;
  if (qInput) {
    qInput.addEventListener('input', function () {
      if (qClear) qClear.hidden = !qInput.value;
      clearTimeout(qTimer);
      qTimer = setTimeout(function () { state.q = qInput.value; apply(); }, 220);
    });
    qInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && qInput.value) { e.preventDefault(); clearTimeout(qTimer); qInput.value = ''; state.q = ''; apply(); }
      else if (e.key === 'Enter') { e.preventDefault(); clearTimeout(qTimer); state.q = qInput.value; apply(); }
    });
  }
  if (qClear) qClear.addEventListener('click', function () { clearTimeout(qTimer); qInput.value = ''; state.q = ''; apply(); qInput.focus(); });
  clearBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      reset();
      if (qInput) qInput.focus({ preventScroll: b === panelClear });
    });
  });

  /* ── courses: scrollspy + smooth scroll + deep links ── */
  var nav = $('[data-courses]'), list = $('[data-courses-list]'), current = null, ticking = false;
  var headerH = function () { return parseFloat(w.getComputedStyle(root).getPropertyValue('--header-h')) || 64; };
  function keepVisible(tab) {
    if (!list) return;
    var li = tab.parentNode, left = li.offsetLeft - (list.clientWidth - li.offsetWidth) / 2;
    if (list.scrollTo) list.scrollTo({ left: Math.max(0, left), behavior: reduce ? 'auto' : 'smooth' });
    else list.scrollLeft = left;
  }
  function spy() {
    ticking = false;
    var off = headerH() + (nav ? nav.offsetHeight : 0) + 28, cur = null;
    for (var i = 0; i < courses.length; i++) {
      var c = courses[i];
      if (c.el.hidden) continue;
      if (c.el.getBoundingClientRect().top - off <= 0) cur = c; else break;
    }
    if (cur === current) return;
    if (current && current.tab) current.tab.removeAttribute('aria-current');
    current = cur;
    if (cur && cur.tab) { cur.tab.setAttribute('aria-current', 'true'); keepVisible(cur.tab); }
  }
  var onScroll = function () { if (!ticking) { ticking = true; w.requestAnimationFrame(spy); } };
  w.addEventListener('scroll', onScroll, { passive: true });
  w.addEventListener('resize', onScroll, { passive: true });

  courses.forEach(function (c) {
    if (!c.tab) return;
    c.tab.addEventListener('click', function (e) {
      e.preventDefault();
      if (c.el.hidden) return;
      c.el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      try { history.replaceState(history.state, '', location.pathname + location.search + '#' + c.id); } catch (err) { /* noop */ }
      if (c.title) c.title.focus({ preventScroll: true });
    });
  });

  /* ── dish art: slow reveal once in view (motion allowed only) ── */
  if ('IntersectionObserver' in w && !reduce) {
    root.classList.add('menu-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var img = en.target, show = function () { img.classList.add('is-shown'); };
        io.unobserve(img);
        if (img.complete && img.naturalWidth) w.requestAnimationFrame(show);
        else { img.addEventListener('load', show); img.addEventListener('error', show); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });
    $$('.dish__art', menu).forEach(function (img) { io.observe(img); });
  }

  /* ── init ── */
  readURL();
  apply({ noUrl: true });
  /* deep link (#biryani): re-align once fonts settle, unless the visitor has already moved */
  var target = location.hash && d.getElementById(location.hash.slice(1));
  if (target && target.hasAttribute('data-course') && !target.hidden) {
    var y0 = w.pageYOffset;
    var realign = function () { if (Math.abs(w.pageYOffset - y0) < 4) { target.scrollIntoView({ block: 'start' }); spy(); } };
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { w.requestAnimationFrame(realign); }); else w.setTimeout(realign, 300);
  }

  w.CDMenu = { state: state, apply: apply, reset: reset };
})(window, document);

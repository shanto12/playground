/* Interiors page — page-only behaviour. Plain JS; every storage call is guarded. */
(function () {
  'use strict';
  var d = document;
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function sget(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function reduced() { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ───── 01 · wall chooser ───── */
  function initPick() {
    var root = $('[data-pick]'); if (!root) return;
    var track = $('.pick__track', root), prev = $('[data-pick-prev]', root), next = $('[data-pick-next]', root), count = $('[data-pick-count]', root);
    function cards() { return $$('.wall', track).filter(function (c) { return c.offsetParent !== null; }); }
    function update() {
      var cs = cards(), n = cs.length;
      if (!n) { count.textContent = ''; return; }
      var padL = parseFloat(getComputedStyle(track).paddingLeft) || 0, tl = track.getBoundingClientRect().left + padL, best = 0, bd = 1e9;
      cs.forEach(function (c, i) { var dd = Math.abs(c.getBoundingClientRect().left - tl); if (dd < bd) { bd = dd; best = i; } });
      var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4, atStart = track.scrollLeft <= 4;
      if (atEnd) best = n - 1; if (atStart) best = 0;
      count.textContent = (best + 1) + ' / ' + n;
      prev.disabled = atStart; next.disabled = atEnd;
    }
    function go(dir) {
      var c = cards()[0]; var w = c ? c.getBoundingClientRect().width + 14 : 300;
      track.scrollBy({ left: dir * w, behavior: reduced() ? 'auto' : 'smooth' });
    }
    var tick = false;
    track.addEventListener('scroll', function () { if (tick) return; tick = true; requestAnimationFrame(function () { tick = false; update(); }); }, { passive: true });
    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });
    d.addEventListener('hub:direction', function () { track.scrollLeft = 0; setTimeout(update, 30); });
    window.addEventListener('resize', update);
    setTimeout(update, 60); window.addEventListener('load', update);

    /* shortlist (this phone only) */
    var KEY = 'ix-wall-picks', favs = [];
    try { favs = JSON.parse(sget(KEY) || '[]'); if (!Array.isArray(favs)) favs = []; } catch (e) { favs = []; }
    var list = $('[data-shortlist-list]'), empty = $('[data-shortlist-empty]'), copyBtn = $('[data-shortlist-copy]');
    var titles = {};
    $$('.wall', track).forEach(function (w) { titles[w.getAttribute('data-wall')] = w.getAttribute('data-title'); });
    function paint() {
      $$('.wall', track).forEach(function (w) {
        var on = favs.indexOf(w.getAttribute('data-wall')) > -1, b = $('[data-fav]', w);
        b.setAttribute('aria-pressed', String(on)); $('[data-fav-t]', b).textContent = on ? 'On your shortlist' : 'Add to shortlist';
      });
      var ids = favs.filter(function (id) { return titles[id]; });
      list.innerHTML = ids.map(function (id) { return '<li>' + esc(titles[id]) + '<button type="button" data-unfav="' + esc(id) + '" aria-label="Remove ' + esc(titles[id]) + '">×</button></li>'; }).join('');
      empty.hidden = ids.length > 0; copyBtn.hidden = !ids.length;
      copyBtn.setAttribute('data-copy', 'Feature walls I like for Curry District: ' + ids.map(function (id) { return titles[id]; }).join('; ') + '.');
    }
    function toggle(id, on) {
      var i = favs.indexOf(id);
      if (on === undefined) on = i < 0;
      if (on && i < 0) favs.push(id); if (!on && i > -1) favs.splice(i, 1);
      sset(KEY, JSON.stringify(favs)); paint();
    }
    root.addEventListener('click', function (e) {
      var f = e.target.closest('[data-fav]'); if (f) { toggle(f.closest('.wall').getAttribute('data-wall')); return; }
      var u = e.target.closest('[data-unfav]'); if (u) toggle(u.getAttribute('data-unfav'), false);
    });
    paint();
  }

  /* ───── copy feedback on hex buttons (hub.js does the copying + toast) ───── */
  function initCopyFeedback() {
    d.addEventListener('click', function (e) {
      var b = e.target.closest('.sw,.hexrow'); if (!b) return;
      b.classList.add('is-copied');
      var i = $('i', b), old = i && i.textContent; if (i) i.textContent = 'Copied';
      setTimeout(function () { b.classList.remove('is-copied'); if (i) i.textContent = old; }, 1400);
    });
  }

  /* ───── 06 · price-table filter ───── */
  function initTable() {
    var chips = $$('[data-gf]'); if (!chips.length) return;
    var rows = $$('.ix-table tbody tr'), table = $('.ix-table'), more = $('[data-table-more]');
    if (more) more.addEventListener('click', function () { table.removeAttribute('data-collapsed'); });
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        var g = c.getAttribute('data-gf');
        if (g !== 'all') table.removeAttribute('data-collapsed');
        chips.forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); });
        rows.forEach(function (r) { r.hidden = !(g === 'all' || r.getAttribute('data-g') === g); });
      });
    });
  }

  /* ───── 07 · checklist (state stays in this browser) ───── */
  function initChecklist() {
    var boxes = $$('[data-ck-id]'); if (!boxes.length) return;
    var KEY = 'ix-checklist', st = {};
    try { st = JSON.parse(sget(KEY) || '{}') || {}; } catch (e) { st = {}; }
    var out = $('[data-ck-count]');
    function show() {
      var n = boxes.filter(function (b) { return b.checked; }).length;
      out.textContent = n === boxes.length ? 'All ' + n + ' checked. Ready to order a swatch.' : n + ' of ' + boxes.length + ' checked';
    }
    boxes.forEach(function (b) {
      b.checked = !!st[b.getAttribute('data-ck-id')];
      b.addEventListener('change', function () { st[b.getAttribute('data-ck-id')] = b.checked; sset(KEY, JSON.stringify(st)); show(); });
    });
    show();
  }

  /* ───── 04 · murals, neon & wall art (manifest may not exist yet) ───── */
  function initMurals() {
    var host = $('[data-murals]'); if (!host) return;
    var coming = $('[data-murals-coming]', host), grid = $('[data-murals-grid]', host), more = $('[data-murals-more]', host), retry = $('[data-murals-retry]', host);
    var rendered = false;
    function pick(items, max) { /* round-robin across first tags so the highlights show variety */
      var buckets = {}, order = [];
      items.forEach(function (it) { var k = (it.tags && it.tags[0]) || it.type || 'x'; if (!buckets[k]) { buckets[k] = []; order.push(k); } buckets[k].push(it); });
      var out = [], i = 0;
      while (out.length < max && out.length < items.length) {
        var added = false;
        order.forEach(function (k) { if (out.length < max && buckets[k][i]) { out.push(buckets[k][i]); added = true; } });
        if (!added) break; i++;
      }
      return out;
    }
    function load() {
      return fetch('assets/murals/manifest.json', { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('missing'); return r.json(); })
        .then(function (m) {
          var items = ((m && m.items) || []).filter(function (i) { return i && i.src; });
          var shown = items.filter(function (i) { return !(i.tags || []).some(function (t) { return t === 'production' || t === 'notes'; }); });
          if (!items.length) throw new Error('empty');
          if (!rendered && window.Hub && Hub.renderGallery) {
            rendered = true;
            Hub.renderGallery(grid, pick(shown, 8));
          }
          coming.hidden = true; grid.hidden = false; more.hidden = false;
          var a = $('a', more); if (a) a.textContent = 'See all ' + items.length + ' in the full gallery';
        })
        .catch(function () { if (!rendered) { coming.hidden = false; grid.hidden = true; more.hidden = true; } });
    }
    if (retry) retry.addEventListener('click', function () {
      retry.disabled = true; retry.textContent = 'Checking…';
      load().then(function () { retry.disabled = false; retry.textContent = 'Check again'; if (!rendered && window.Hub) Hub.toast('Still coming together. Try again soon.'); });
    });
    load();
  }

  /* ───── 05 · gallery preview collapse ───── */
  function initGallery() {
    var wrap = $('[data-galwrap]'), btn = $('[data-gal-more]'); if (!wrap || !btn) return;
    function open() { wrap.removeAttribute('data-collapsed'); }
    btn.addEventListener('click', open);
    wrap.addEventListener('click', function (e) { if (e.target.closest('.mg__bar .chip')) open(); });
  }

  function init() { initPick(); initCopyFeedback(); initTable(); initChecklist(); initMurals(); initGallery(); }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})();

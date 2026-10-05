/* Curry District · Pitch Hub — Top 10 ideas page
   1) "See it" thumbnails resolved at runtime from each area's manifest.json
   2) "My plan" tray + sheet (rollout order by phase, copy/share, localStorage)
   3) Sticky jump rail with active state                                    */
(function () {
  'use strict';
  var d = document, de = d.documentElement;
  var LIVE_URL = 'https://curry-district-pitch.netlify.app/ideas/';
  var KEY = 'cd-ideas-plan';

  /* ═════════ 1. Runtime sample thumbnails ═════════ */
  // idea → manifests (paths relative to this page) + optional static fallbacks
  var THUMBS = {
    1:  { m: ['../merch/assets/merch/manifest.json'], href: '../merch/' },
    2:  { s: [
            { t: '../assets/shots/bazaar-home.jpg', h: 'https://curry-district-bazaar.netlify.app/', l: 'Bazaar website concept', d: 'bazaar', x: 1 },
            { t: '../assets/shots/royal-home.jpg', h: 'https://curry-district-royal.netlify.app/', l: 'Royal website concept', d: 'royal', x: 1 },
            { t: '', h: '../thali/', l: 'Thali planner', d: 'both' }
          ] },
    3:  { m: ['../packaging/assets/boxes/manifest.json', '../packaging/assets/bags/manifest.json', '../packaging/assets/cups/manifest.json'] },
    4:  { m: ['../interiors/assets/rooms/manifest.json', '../interiors/assets/murals/manifest.json'] },
    5:  { m: ['../menu-design/assets/menus/manifest.json'] },
    6:  { s: [
            { t: '../gbp/img/cover-bazaar.jpg', h: '../gbp/', l: 'Google cover concept, Bazaar', d: 'bazaar' },
            { t: '../gbp/img/cover-royal.jpg', h: '../gbp/', l: 'Google cover concept, Royal', d: 'royal' },
            { t: '', h: '../gbp/', l: 'Photo-day shot list', d: 'both' }
          ] },
    7:  { m: ['../social/assets/bazaar-kit/manifest.json', '../social/assets/royal-kit/manifest.json', '../motion/assets/bazaar-reels/manifest.json', '../motion/assets/royal-reels/manifest.json'] },
    8:  { m: ['../signage/assets/storefront/manifest.json'] },
    9:  { m: ['../loyalty/assets/print/manifest.json'] },
    10: { m: ['../calendar/assets/calendar/manifest.json'] }
  };
  var cache = {};

  function areaBase(mPath) { var i = mPath.indexOf('/assets/'); return i > -1 ? mPath.slice(0, i + 1) : mPath.replace(/[^/]*$/, ''); }
  function resolve(base, p) { return !p ? '' : (/^(https?:|data:|\/)/.test(p) ? p : base + p.replace(/^\.\//, '')); }
  function isImg(p) { return /\.(jpe?g|png|webp|avif|gif|svg)(\?|$)/i.test(p || ''); }

  function fetchManifest(path) {
    if (!/^https?:/.test(location.protocol)) return Promise.resolve([]);
    return fetch(path, { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (!j) return [];
      var base = areaBase(path), items = Array.isArray(j) ? j : (j.items || []);
      return items.map(function (it) {
        if (!it || typeof it !== 'object') return null;
        var t = it.thumb || it.poster || ((!it.type || it.type === 'image') && isImg(it.src) ? it.src : '');
        if (!t) return null;
        return { t: resolve(base, t), h: base, l: it.title || it.caption || 'Design sample', d: (it.direction || 'both').toLowerCase(), v: it.type === 'video' };
      }).filter(Boolean);
    }).catch(function () { return []; });
  }

  // round-robin across manifests for variety, then alternate directions
  function pick(lists, n, dir) {
    var pool = [], i = 0, more = true;
    while (more) { more = false; lists.forEach(function (l) { if (l[i]) { pool.push(l[i]); more = true; } }); i++; }
    if (dir === 'bazaar' || dir === 'royal') {
      var only = pool.filter(function (x) { return x.d === dir || x.d === 'both'; });
      if (only.length) pool = only.concat(pool.filter(function (x) { return only.indexOf(x) < 0; }));
      return pool.slice(0, n);
    }
    var out = [], last = null;
    while (out.length < n && pool.length) {
      var k = pool.findIndex(function (x) { return !last || x.d !== last || x.d === 'both'; });
      if (k < 0) k = 0;
      var it = pool.splice(k, 1)[0]; out.push(it); last = it.d;
    }
    return out;
  }

  function tile(it, idea, area, title) {
    var a = d.createElement('a');
    a.className = 'ix-th';
    a.href = it ? it.h : area;
    if (it && /^https?:/.test(it.h)) { a.target = '_blank'; a.rel = 'noopener'; }
    var label = it ? it.l : 'Samples for ' + title;
    a.setAttribute('aria-label', label + (it && it.x ? ' (opens the live site)' : ' (opens the samples page)'));
    var ph = d.createElement('span'); ph.className = 'ix-th__ph';
    ph.innerHTML = '<i>Sample</i>';
    ph.appendChild(d.createTextNode(it ? it.l : 'On its way'));
    a.appendChild(ph);
    if (it && it.d && it.d !== 'both') {
      var b = d.createElement('span'); b.className = 'ix-th__dir'; b.setAttribute('data-d', it.d); b.setAttribute('aria-hidden', 'true');
      b.textContent = it.d === 'bazaar' ? 'A' : 'B'; a.appendChild(b);
    }
    if (it && it.t) {
      a.classList.add('is-loading');
      var img = new Image();
      img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
      img.onload = function () { a.classList.remove('is-loading'); img.classList.add('is-in'); };
      img.onerror = function () { a.classList.remove('is-loading'); img.remove(); };
      img.src = it.t;
      a.appendChild(img);
    }
    return a;
  }

  function renderThumbs(box, dir) {
    var idea = box.getAttribute('data-thumbs'), cfg = THUMBS[idea], area = box.getAttribute('data-area');
    var title = (box.closest('.ix').querySelector('.ix__title') || {}).textContent || '';
    var lists = cache[idea] || [];
    var chosen = pick(lists, 3, dir);
    box.textContent = '';
    for (var i = 0; i < 3; i++) box.appendChild(tile(chosen[i], idea, (cfg && cfg.href) || area, title));
    box.setAttribute('data-count', chosen.length);
  }

  function loadThumbs(box) {
    if (box.__done) return; box.__done = true;
    var idea = box.getAttribute('data-thumbs'), cfg = THUMBS[idea] || {};
    renderThumbs(box, dir());                                   // placeholders first
    var jobs = (cfg.m || []).map(fetchManifest);
    Promise.all(jobs).then(function (lists) {
      lists = lists.filter(function (l) { return l.length; });
      if (cfg.s) lists = [cfg.s.slice()].concat(lists);
      cache[idea] = lists;
      renderThumbs(box, dir());
    });
  }
  function dir() { try { return window.Hub ? Hub.getDirection() : 'both'; } catch (e) { return 'both'; } }

  var boxes = [].slice.call(d.querySelectorAll('[data-thumbs]'));
  if ('IntersectionObserver' in window) {
    var tio = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { tio.unobserve(en.target); loadThumbs(en.target); } }); }, { rootMargin: '700px 0px' });
    boxes.forEach(function (b) { tio.observe(b); });
  } else boxes.forEach(loadThumbs);
  d.addEventListener('hub:direction', function () { boxes.forEach(function (b) { if (b.__done && cache[b.getAttribute('data-thumbs')]) renderThumbs(b, dir()); }); });

  /* ═════════ 2. My plan ═════════ */
  var IDEAS = {};
  [].slice.call(d.querySelectorAll('article.ix')).forEach(function (a) {
    IDEAS[a.id] = { id: a.id, title: (a.querySelector('.ix__title') || {}).textContent || '', phase: +a.getAttribute('data-phase'), g: a.style.getPropertyValue('--idea-g') };
  });
  var PHASES = [
    { n: 1, name: 'Phase 1 · Quick wins', when: 'weeks 1–2', order: ['1', '6', '3', '7'] },
    { n: 2, name: 'Phase 2 · Online & at the table', when: 'months 1–2', order: ['2', '5', '3'] },
    { n: 3, name: 'Phase 3 · The room & the street', when: 'months 2–4', order: ['4', '8'] },
    { n: 4, name: 'Phase 4 · Bring them back', when: 'ongoing', order: ['9', '10'] }
  ];
  var NOTES = {
    '1|1': 'Pick your direction first; everything else wears it',
    '3|1': 'Start: bag-seal sticker + stuffer card',
    '3|2': 'Then: printed bags, boxes & cups',
    '6|1': 'Photo day + rebuilt profile',
    '7|1': 'Templates + first reels',
    '2|2': 'Launch the site in your direction',
    '5|2': 'Menu, spice scale & table tents',
    '4|3': 'Feature wall + photo corner',
    '8|3': 'After landlord & permit checks',
    '9|4': 'Stamp card, trays & catering menu',
    '10|4': 'Diwali first, then monthly'
  };

  var plan = load();
  function load() {
    try { var v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v.filter(function (x) { return IDEAS[x]; }) : []; } catch (e) { return []; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(plan)); } catch (e) {} }
  function has(id) { return plan.indexOf(String(id)) > -1; }

  var tray = d.querySelector('.ix-tray'), countEl = d.querySelector('[data-plan-count]'), subEl = d.querySelector('[data-plan-sub]'), live = d.querySelector('[data-plan-live]');
  var sheet = d.getElementById('planSheet'), body = sheet && sheet.querySelector('[data-plan-body]'), pre = sheet && sheet.querySelector('[data-plan-text]');

  function phasesFor(list) {
    return PHASES.map(function (p) {
      return { p: p, items: p.order.filter(function (id) { return list.indexOf(id) > -1; }) };
    }).filter(function (x) { return x.items.length; });
  }

  function planText() {
    var lines = ['My Curry District glow-up plan', '(suggested rollout order)', ''];
    var k = 0;
    phasesFor(plan).forEach(function (x) {
      lines.push(x.p.name.toUpperCase() + ' (' + x.p.when + ')');
      x.items.forEach(function (id) { k++; var note = NOTES[id + '|' + x.p.n]; lines.push(k + '. ' + IDEAS[id].title + (note ? ': ' + note.toLowerCase() : '')); });
      lines.push('');
    });
    if (!plan.length) lines.push('(No ideas picked yet)', '');
    lines.push('See every idea: ' + LIVE_URL);
    lines.push('Independent design concept. Nothing goes public without the owners’ OK.');
    return lines.join('\n');
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';

  function renderSheet() {
    if (!body) return;
    if (!plan.length) {
      body.innerHTML = '<div class="ix-empty"><p>Your plan is empty. Tap <b>Add to my plan</b> on any idea, or start with a bundle:</p><div class="cluster">' +
        '<button type="button" class="btn btn--ghost btn--sm" data-bundle="6,3" data-bundle-name="a weekend">A weekend</button>' +
        '<button type="button" class="btn btn--ghost btn--sm" data-bundle="2,5,3" data-bundle-name="a month">A month</button>' +
        '<button type="button" class="btn btn--ghost btn--sm" data-bundle="1,2,3,4,5,6,7,8,9,10" data-bundle-name="a season">A season</button></div></div>';
    } else {
      var k = 0;
      body.innerHTML = phasesFor(plan).map(function (x) {
        return '<div class="ix-phase"><p class="ix-phase__h">' + esc(x.p.name) + '<small>' + esc(x.p.when) + '</small></p><ol>' +
          x.items.map(function (id) {
            k++; var it = IDEAS[id], note = NOTES[id + '|' + x.p.n] || '';
            return '<li class="ix-prow"><span class="ix-prow__n" style="--idea-g:' + esc(it.g) + '" aria-hidden="true">' + id + '</span>' +
              '<a class="ix-prow__t" href="#' + id + '" data-plan-go>' + k + '. ' + esc(it.title) + (note ? '<small>' + esc(note) + '</small>' : '') + '</a>' +
              '<button type="button" class="ix-prow__x" data-remove="' + id + '" aria-label="Remove ' + esc(it.title) + ' from my plan">' + X + '</button></li>';
          }).join('') + '</ol></div>';
      }).join('');
    }
    if (pre) pre.textContent = planText();
    var share = sheet.querySelector('[data-plan-share]'); if (share) share.disabled = !plan.length;
  }

  function sync(bump) {
    var n = plan.length;
    d.querySelectorAll('[data-add]').forEach(function (b) {
      var on = has(b.getAttribute('data-add'));
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      var t = b.querySelector('.ix-add__txt'); if (t) t.textContent = on ? 'In my plan' : 'Add to my plan';
    });
    d.querySelectorAll('article.ix').forEach(function (a) { a.classList.toggle('is-plan', has(a.id)); });
    d.querySelectorAll('[data-rail]').forEach(function (a) { a.classList.toggle('is-plan', has(a.getAttribute('data-rail'))); });
    if (countEl) countEl.textContent = n;
    if (tray) {
      tray.classList.toggle('has-items', n > 0);
      if (bump) { tray.classList.remove('is-bump'); void tray.offsetWidth; tray.classList.add('is-bump'); }
    }
    if (subEl) {
      if (!n) subEl.textContent = 'Tap “Add to my plan” on any idea';
      else { var ph = phasesFor(plan).length; subEl.textContent = n + (n === 1 ? ' idea' : ' ideas') + ' · ' + ph + (ph === 1 ? ' phase' : ' phases') + ' · tap to see the order'; }
    }
    if (sheet && sheet.classList.contains('is-open')) renderSheet();
  }

  function toggle(id, btn) {
    id = String(id);
    var on = !has(id);
    if (on) plan.push(id); else plan = plan.filter(function (x) { return x !== id; });
    save(); sync(true);
    if (btn) { btn.classList.remove('is-pop'); void btn.offsetWidth; btn.classList.add('is-pop'); }
    var msg = (on ? 'Added: ' : 'Removed: ') + IDEAS[id].title;
    if (live) live.textContent = msg;
    toast(on ? 'Added to your plan · ' + plan.length + ' total' : 'Removed from your plan');
  }
  function addBundle(ids, name) {
    var added = 0;
    ids.forEach(function (id) { if (IDEAS[id] && !has(id)) { plan.push(id); added++; } });
    save(); sync(true);
    var msg = added ? 'Added ' + added + (added === 1 ? ' idea' : ' ideas') + ' for ' + name : 'Those ideas are already in your plan';
    if (live) live.textContent = msg; toast(msg);
  }
  function toast(m) { try { if (window.Hub && Hub.toast) Hub.toast(m); } catch (e) {} }

  /* sheet open / close (own dialog, same visual language as hub sheets) */
  var lastFocus = null, inertEls = [];
  function openSheet(trigger) {
    if (!sheet) return;
    lastFocus = trigger || d.activeElement;
    renderSheet();
    sheet.classList.add('is-open'); sheet.setAttribute('aria-hidden', 'false');
    inertEls = [].slice.call(d.body.children).filter(function (el) { return el !== sheet && !el.inert && el.tagName !== 'SCRIPT'; });
    inertEls.forEach(function (el) { el.inert = true; });
    de.classList.add('hub-locked');
    var p = sheet.querySelector('.sheet__panel'); if (p) p.focus({ preventScroll: true });
  }
  function closeSheet(restore) {
    if (!sheet || !sheet.classList.contains('is-open')) return;
    sheet.classList.remove('is-open'); sheet.setAttribute('aria-hidden', 'true');
    inertEls.forEach(function (el) { el.inert = false; }); inertEls = [];
    de.classList.remove('hub-locked');
    if (restore !== false && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      var ta = d.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      (sheet || d.body).appendChild(ta); ta.select();
      try { d.execCommand('copy') ? res() : rej(); } catch (e) { rej(e); } ta.remove();
    });
  }
  function sharePlan() {
    var text = planText();
    var coarse = window.matchMedia && matchMedia('(pointer:coarse)').matches;
    if (navigator.share && coarse) {
      navigator.share({ title: 'My Curry District glow-up plan', text: text }).catch(function (err) {
        if (!err || err.name !== 'AbortError') copy(text).then(function () { toast('Plan copied. Paste it anywhere'); }, function () {});
      });
      return;
    }
    copy(text).then(function () { toast('Plan copied. Paste it anywhere'); }, function () {
      var det = sheet.querySelector('.ix-sheet__preview'); if (det) det.open = true; toast('Select the text below to copy');
    });
  }

  d.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-add],[data-bundle],[data-plan-open],[data-plan-close],[data-plan-share],[data-plan-clear],[data-remove],[data-plan-go]');
    if (!t) return;
    if (t.hasAttribute('data-add')) { e.preventDefault(); toggle(t.getAttribute('data-add'), t); }
    else if (t.hasAttribute('data-bundle')) { e.preventDefault(); addBundle(t.getAttribute('data-bundle').split(','), t.getAttribute('data-bundle-name') || 'this bundle'); }
    else if (t.hasAttribute('data-plan-open')) { e.preventDefault(); openSheet(t); }
    else if (t.hasAttribute('data-plan-close')) { e.preventDefault(); closeSheet(); }
    else if (t.hasAttribute('data-plan-share')) { e.preventDefault(); sharePlan(); }
    else if (t.hasAttribute('data-plan-clear')) { e.preventDefault(); plan = []; save(); sync(true); renderSheet(); toast('Plan cleared'); }
    else if (t.hasAttribute('data-remove')) { e.preventDefault(); toggle(t.getAttribute('data-remove')); renderSheet(); var f = sheet.querySelector('[data-remove]') || sheet.querySelector('.sheet__close'); if (f) f.focus(); }
    else if (t.hasAttribute('data-plan-go')) {
      e.preventDefault(); var id = t.getAttribute('href').slice(1); closeSheet(false);
      var el = d.getElementById(id); if (el) { history.replaceState(null, '', '#' + id); el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); var h = el.querySelector('.ix__title'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
    }
  });
  d.addEventListener('keydown', function (e) {
    if (!sheet || !sheet.classList.contains('is-open')) return;
    if (e.key === 'Escape') { e.preventDefault(); closeSheet(); return; }
    if (e.key === 'Tab') {
      var f = [].slice.call(sheet.querySelectorAll('a[href],button:not([disabled]),summary,[tabindex="-1"].sheet__panel')).filter(function (x) { return x.offsetParent !== null || x.classList.contains('sheet__panel'); });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  sync(false);

  /* ═════════ 3. Jump rail: active idea ═════════ */
  var rail = d.querySelector('.ix-rail__in');
  var links = {}; [].slice.call(d.querySelectorAll('[data-rail]')).forEach(function (a) { links[a.getAttribute('data-rail')] = a; });
  var current = null;
  function setCurrent(id) {
    if (id === current) return; current = id;
    Object.keys(links).forEach(function (k) { links[k].setAttribute('aria-current', k === id ? 'true' : 'false'); });
    var a = links[id];
    if (a && rail) {
      var left = a.offsetLeft - (rail.clientWidth - a.offsetWidth) / 2;
      try { rail.scrollTo({ left: Math.max(0, left), behavior: 'smooth' }); } catch (e) { rail.scrollLeft = left; }
    }
  }
  if ('IntersectionObserver' in window) {
    var vis = {};
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (en) { vis[en.target.id] = en.isIntersecting ? en.intersectionRatio : 0; });
      var best = null, bv = 0; Object.keys(vis).forEach(function (k) { if (vis[k] > bv) { bv = vis[k]; best = k; } });
      if (best) setCurrent(best);
    }, { rootMargin: '-30% 0px -55% 0px', threshold: [0, .01, .25, .5, 1] });
    d.querySelectorAll('article.ix').forEach(function (a) { rio.observe(a); });
  }

  /* land precisely on #n after fonts settle (deep links from other hub pages) */
  function settle() {
    var id = decodeURIComponent((location.hash || '').slice(1));
    if (!id || !/^(10|[1-9])$/.test(id)) return;
    var el = d.getElementById(id); if (!el) return;
    try { el.scrollIntoView({ block: 'start', behavior: 'instant' }); } catch (e) { el.scrollIntoView(true); } setCurrent(id);
    var sb = el.querySelector('[data-thumbs]'); if (sb) loadThumbs(sb);
  }
  if (location.hash) {
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { requestAnimationFrame(settle); }); else window.addEventListener('load', settle);
  }
})();

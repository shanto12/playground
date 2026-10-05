/* ══════════════════════════════════════════════════════════════════════════
   Curry District · Pitch Hub — hub.js  (dependency-free, ~ES2017)
   Load with <script src="../assets/hub.js" defer></script> AFTER config.js.
   <body class="hub" data-root="../" data-area="packaging">
     data-root = relative path to the hub root ("./" on home, "../" in area pages)
     data-area = id of this page in AREAS below (highlights nav)
   Public API: window.Hub = { AREAS, URLS, setDirection, getDirection, openLightbox,
                              toast, share, refresh }
   Events: document 'hub:direction' (detail.dir = 'bazaar'|'royal'|'both')
   See assets/COMPONENTS.md for markup of every component.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var d = document, de = d.documentElement, body = d.body;
  de.classList.add('js');

  var CFG = window.HUB_CONFIG || {};
  var ROOT = (body && body.getAttribute('data-root')) || './';
  var AREA = (body && body.getAttribute('data-area')) || '';
  var DIR_KEY = 'cd-hub-dir';
  var reduceMQ = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var finePointer = window.matchMedia ? matchMedia('(hover: hover) and (pointer: fine)').matches : false;

  var URLS = {
    hub: 'https://curry-district-pitch.netlify.app/',
    bazaar: 'https://curry-district-bazaar.netlify.app/',
    royal: 'https://curry-district-royal.netlify.app/'
  };

  /* ───── Icons (24×24 line icons, stroke=currentColor) ───── */
  var P = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h5v-6h4v6h5V9.5"/>',
    web: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18"/><circle cx="6.5" cy="6.5" r=".6" fill="currentColor"/><circle cx="9" cy="6.5" r=".6" fill="currentColor"/>',
    idea: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3Z"/>',
    kit: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="3.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="3.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
    more: '<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>',
    back: '<path d="M15 5 8 12l7 7"/>',
    arrow: '<path d="M7 17 17 7M9 7h8v8"/>',
    next: '<path d="M9 5l7 7-7 7"/>',
    prev: '<path d="M15 5l-7 7 7 7"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    zoom: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2M11 8.5v5M8.5 11h5"/>',
    share: '<path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
    print: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
    chat: '<path d="M4 20l1.4-4A8 8 0 1 1 8.5 19Z"/><path d="M9 10h6M9 13.5h4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><circle cx="8.5" cy="14.5" r=".9" fill="currentColor"/><circle cx="12" cy="14.5" r=".9" fill="currentColor"/>',
    download: '<path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/>',
    cursor: '<path d="M5 3l14 7-6 2-2 6Z"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    /* area icons */
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/><path d="M8.5 11h5"/>',
    chart: '<path d="M4 20h16"/><rect x="5.5" y="11" width="3" height="6.5" rx="1"/><rect x="10.5" y="6" width="3" height="11.5" rx="1"/><rect x="15.5" y="9" width="3" height="8.5" rx="1"/>',
    nib: '<path d="M12 3 6 10l2.5 8.5h7L18 10Z"/><path d="M12 3v8"/><circle cx="12" cy="12.5" r="1.4"/><path d="M8.5 21h7"/>',
    bag: '<path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8Z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/>',
    arch: '<path d="M5 21V11a7 7 0 0 1 14 0v10"/><path d="M9 21v-8a3 3 0 0 1 6 0v8"/><path d="M3 21h18"/>',
    reel: '<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10.5 9.5v5l4-2.5Z" fill="currentColor"/>',
    menu: '<path d="M4 5.5C6.5 4 9.5 4 12 5.5v14c-2.5-1.5-5.5-1.5-8 0Z"/><path d="M20 5.5C17.5 4 14.5 4 12 5.5v14c2.5-1.5 5.5-1.5 8 0Z"/>',
    neon: '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M8 3l4 3 4-3"/><path d="M7 14.5c1.5-4 3-4 4.5 0s3 4 5.5-2"/>',
    tee: '<path d="M8.5 3.5 4 6l1.5 4 2-.8V20.5h9V9.2l2 .8L20 6l-4.5-2.5a3.5 3.5 0 0 1-7 0Z"/>',
    stamp: '<rect x="3" y="5.5" width="18" height="13" rx="3"/><circle cx="8" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="16" cy="12" r="1.6" fill="currentColor"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5Z" fill="currentColor"/>',
    pin: '<path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    thali: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.6"/><circle cx="12" cy="6.4" r="1.6"/><circle cx="17" cy="9.6" r="1.6"/><circle cx="17" cy="14.4" r="1.6"/><circle cx="12" cy="17.6" r="1.6"/><circle cx="7" cy="14.4" r="1.6"/><circle cx="7" cy="9.6" r="1.6"/>'
  };
  function icon(name, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (P[name] || '') + '</svg>';
  }

  /* ───── Areas: single source of truth for nav, sheets, and tile grids ───── */
  var AREAS = [
    { id: 'brand',       name: 'Brand & logo',       blurb: 'Wordmarks, colour, type',      icon: 'nib',    group: 'kit',  g: 'linear-gradient(140deg,#FFB000 0%,#FF6A13 55%,#E4147E 110%)' },
    { id: 'packaging',   name: 'Takeout packaging',  blurb: 'Bags, boxes, stickers',        icon: 'bag',    group: 'kit',  g: 'linear-gradient(140deg,#FF6A13 0%,#D62839 60%,#7B1E4F 110%)' },
    { id: 'interiors',   name: 'Walls & murals',     blurb: 'Feature wall, wallpaper',      icon: 'arch',   group: 'kit',  g: 'linear-gradient(140deg,#117C86 0%,#0F4D3F 60%,#160B26 115%)' },
    { id: 'menu-design', name: 'Menu & table',       blurb: 'Menus, table tents, cards',    icon: 'menu',   group: 'kit',  g: 'linear-gradient(140deg,#F7D98A 0%,#E9A63A 40%,#A3173F 110%)' },
    { id: 'social',      name: 'Social kit',         blurb: 'Posts, stories, reels',        icon: 'reel',   group: 'kit',  g: 'linear-gradient(140deg,#E4147E 0%,#7B5CFF 75%,#3A1B7A 115%)' },
    { id: 'signage',     name: 'Signage & neon',     blurb: 'Storefront, window, neon',     icon: 'neon',   group: 'kit',  g: 'linear-gradient(140deg,#7B5CFF 0%,#E4147E 55%,#FF6A13 115%)' },
    { id: 'merch',       name: 'Merch & uniforms',   blurb: 'Aprons, tees, caps, cups',     icon: 'tee',    group: 'kit',  g: 'linear-gradient(140deg,#00A8A0 0%,#117C86 45%,#1D1147 110%)' },
    { id: 'loyalty',     name: 'Loyalty & catering', blurb: 'Stamp cards, party trays',     icon: 'stamp',  group: 'kit',  g: 'linear-gradient(140deg,#E9A63A 0%,#FF6A13 50%,#A3173F 110%)' },
    { id: 'motion',      name: 'Motion & reels',     blurb: 'Logo stings, menu screens',    icon: 'play',   group: 'kit',  g: 'linear-gradient(140deg,#FF6A13 0%,#E4147E 45%,#4B1D52 110%)' },
    { id: 'gbp',         name: 'Google profile',     blurb: 'Photos, posts, listing',       icon: 'pin',    group: 'kit',  g: 'linear-gradient(140deg,#3FA34D 0%,#0F4D3F 60%,#160B26 120%)' },
    { id: 'thali',       name: 'Thali & lunch box',  blurb: 'A signature plate idea',       icon: 'thali',  group: 'kit',  g: 'linear-gradient(140deg,#FFB000 0%,#E9A63A 40%,#0F4D3F 115%)' },
    { id: 'calendar',    name: 'Festival calendar',  blurb: 'Diwali, Holi & game days',     icon: 'cal',    group: 'kit',  g: 'linear-gradient(140deg,#E4147E 0%,#A3173F 50%,#4B1D52 110%)' },
    { id: 'audit',       name: 'What we found',      blurb: 'Your presence, honestly',      icon: 'search', group: 'more', g: 'linear-gradient(140deg,#4B1D52 0%,#7B5CFF 60%,#117C86 120%)' },
    { id: 'benchmarks',  name: 'How chains do it',   blurb: 'Big-brand moves to borrow',    icon: 'chart',  group: 'more', g: 'linear-gradient(140deg,#1D1147 0%,#117C86 55%,#00A8A0 115%)' },
    { id: 'ideas',       name: 'All the ideas',      blurb: 'Top 10, effort & impact',      icon: 'idea',   group: 'ideas', g: 'linear-gradient(140deg,#FFB000 0%,#FF6A13 50%,#D62839 110%)' }
  ];
  var AREA_BY_ID = {}; AREAS.forEach(function (a) { AREA_BY_ID[a.id] = a; });
  function areaHref(id) { return ROOT + id + '/'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* ───── Storage (try/catch: private mode, blocked storage) ───── */
  function sget(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }

  /* ═════════ Direction switch ═════════ */
  var DIRS = ['bazaar', 'royal', 'both'];
  function getDirection() { var v = de.getAttribute('data-dir'); return DIRS.indexOf(v) > -1 ? v : 'both'; }
  function applyPreviews(dir) {
    d.querySelectorAll('[data-preview]').forEach(function (el) {
      var p = el.getAttribute('data-preview');
      if (p === 'bazaar' || p === 'royal') el.setAttribute('data-theme', p);
      else el.setAttribute('data-theme', dir === 'both' ? (el.getAttribute('data-both') || 'bazaar') : dir);
    });
  }
  function setDirection(dir, silent) {
    if (DIRS.indexOf(dir) < 0) dir = 'both';
    de.setAttribute('data-dir', dir);
    sset(DIR_KEY, dir);
    applyPreviews(dir);
    d.querySelectorAll('[data-dir-set]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-dir-set') === dir)); });
    if (!silent) d.dispatchEvent(new CustomEvent('hub:direction', { detail: { dir: dir } }));
  }
  function dirSwitchHTML(full) {
    var items = [['bazaar', 'A', 'A · Bazaar', 'a'], ['royal', 'B', 'B · Royal', 'b'], ['both', 'Both', 'Both', 'both']];
    return '<div class="seg dirswitch' + (full ? ' dirswitch--full' : '') + '" role="group" aria-label="Design direction">' +
      items.map(function (it) {
        var short = it[1] === 'Both' ? 'Both' : it[1];
        return '<button type="button" data-dir-set="' + it[0] + '" aria-pressed="false" title="Show ' + it[2] + '">' +
          '<span class="dirswitch__dot dirswitch__dot--' + it[3] + '" aria-hidden="true"></span>' +
          (it[1] === 'Both' ? '<span>Both</span>' : '<span class="dirswitch__short" aria-hidden="true">' + short + '</span><span class="dirswitch__long" aria-hidden="true">' + it[2].slice(1) + '</span><span class="sr-only">' + it[2] + '</span>') +
          '</button>';
      }).join('') + '</div>';
  }
  function renderDirSwitches(scope) {
    (scope || d).querySelectorAll('[data-dir-switch]').forEach(function (el) {
      if (el.getAttribute('data-rendered')) return;
      el.innerHTML = dirSwitchHTML(el.getAttribute('data-dir-switch') === 'full');
      el.setAttribute('data-rendered', '1');
    });
    setDirection(getDirection(), true);
  }

  /* ═════════ Navigation (top bar, tab bar, sheets) ═════════ */
  function logoSVG() {
    return '<svg class="brandmark__logo" viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="hubLg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFB000"/><stop offset=".5" stop-color="#E4147E"/><stop offset="1" stop-color="#117C86"/></linearGradient></defs>' +
      '<circle cx="20" cy="20" r="19" fill="url(#hubLg)"/><path d="M9 21.5h22a11 11 0 0 1-22 0Z" fill="#120C1E"/><path d="M14 17c0-2 2-2 2-4M20 16c0-2.2 2-2.2 2-4.4M26 17c0-2 2-2 2-4" stroke="#FFF4DC" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>';
  }
  function tabGroup() {
    if (!AREA || AREA === 'home') return 'home';
    if (AREA === 'websites') return 'websites';
    var a = AREA_BY_ID[AREA]; return a ? a.group : '';
  }
  function renderNav() {
    var host = d.querySelector('[data-hub-nav]');
    if (!host) return;
    var g = tabGroup();
    var cur = function (cond) { return cond ? ' aria-current="page"' : ''; };
    host.innerHTML =
      '<a class="skip" href="#main">Skip to content</a>' +
      '<header class="topbar"><div class="wrap topbar__in">' +
        '<a class="brandmark" href="' + ROOT + '" aria-label="Curry District Brand Glow-Up — home">' + logoSVG() +
          '<span class="brandmark__txt"><span class="brandmark__name">Curry District</span><span class="brandmark__sub">Brand Glow-Up</span></span></a>' +
        '<nav class="topnav" aria-label="Main">' +
          '<a href="' + ROOT + '"' + cur(g === 'home') + '>Home</a>' +
          '<a href="' + ROOT + '#websites">Websites</a>' +
          '<a href="' + areaHref('ideas') + '"' + cur(g === 'ideas') + '>Ideas</a>' +
          '<button type="button" data-sheet-open="kit" aria-haspopup="dialog"' + (g === 'kit' ? ' aria-current="page"' : '') + '>Samples</button>' +
          '<a href="' + areaHref('audit') + '"' + cur(AREA === 'audit') + '>Audit</a>' +
          '<a href="' + areaHref('benchmarks') + '"' + cur(AREA === 'benchmarks') + '>Chains</a>' +
        '</nav>' +
        '<div class="topbar__end"><div data-dir-switch></div>' +
          '<button type="button" class="btn btn--ghost btn--icon topbar__share" data-share aria-label="Share this page">' + icon('share') + '</button></div>' +
      '</div></header>' +
      '<nav class="tabbar" aria-label="Main (mobile)">' +
        '<a href="' + ROOT + '"' + cur(g === 'home') + '>' + icon('home') + '<span>Home</span></a>' +
        '<a href="' + ROOT + '#websites"' + cur(g === 'websites') + '>' + icon('web') + '<span>Websites</span></a>' +
        '<a href="' + areaHref('ideas') + '"' + cur(g === 'ideas') + '>' + icon('idea') + '<span>Ideas</span></a>' +
        '<button type="button" data-sheet-open="kit" aria-haspopup="dialog" aria-expanded="false"' + cur(g === 'kit') + '>' + icon('kit') + '<span>Kit</span></button>' +
        '<button type="button" data-sheet-open="more" aria-haspopup="dialog" aria-expanded="false"' + cur(g === 'more') + '>' + icon('more') + '<span>More</span></button>' +
      '</nav>';
  }

  function tilesHTML(list) {
    return '<ul class="tiles" role="list">' + list.map(function (a, i) {
      return '<li><a class="tile" href="' + areaHref(a.id) + '" style="--tile-g:' + a.g + ';--i:' + i + '"' + (a.id === AREA ? ' aria-current="page"' : '') + '>' +
        '<span class="tile__top">' + icon(a.icon, 'tile__icon') + icon('arrow', 'tile__arrow') + '</span>' +
        '<span><span class="tile__name">' + esc(a.name) + '</span><span class="tile__blurb">' + esc(a.blurb) + '</span></span></a></li>';
    }).join('') + '</ul>';
  }
  /* <div data-area-tiles="kit|more|all|tour" data-exclude="current"></div> */
  function renderTiles(scope) {
    (scope || d).querySelectorAll('[data-area-tiles]').forEach(function (el) {
      var mode = el.getAttribute('data-area-tiles') || 'tour';
      var list = AREAS.filter(function (a) {
        if (mode === 'kit') return a.group === 'kit';
        if (mode === 'more') return a.group === 'more';
        if (mode === 'tour') return a.group !== 'ideas';
        return true;
      });
      var only = el.getAttribute('data-only');
      if (only) { var ids = only.split(/[\s,]+/); list = ids.map(function (id) { return AREA_BY_ID[id]; }).filter(Boolean); }
      if (el.getAttribute('data-exclude') === 'current') list = list.filter(function (a) { return a.id !== AREA; });
      var lim = parseInt(el.getAttribute('data-limit'), 10); if (lim) list = list.slice(0, lim);
      el.innerHTML = tilesHTML(list);
    });
  }

  var sheet, sheetLastFocus;
  function rowLink(href, ic, title, sub, attrs) {
    return '<li><a class="sheet__row" href="' + href + '"' + (attrs || '') + '>' + icon(ic) + '<span>' + esc(title) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span></a></li>';
  }
  function sheetContent(kind) {
    if (kind === 'kit') {
      return '<div class="sheet__head"><h2 class="sheet__title" id="hubSheetTitle">The sample kit</h2>' + closeBtn() + '</div>' +
        '<p class="muted" style="margin:0 0 14px">Every piece is shown in both directions — flip A / B / Both any time.</p>' +
        tilesHTML(AREAS.filter(function (a) { return a.group === 'kit'; }));
    }
    var c = '<div class="sheet__head"><h2 class="sheet__title" id="hubSheetTitle">More</h2>' + closeBtn() + '</div>' +
      '<div class="sheet__group"><p class="sheet__label">Direction</p><div data-dir-switch="full"></div></div>' +
      '<div class="sheet__group"><p class="sheet__label">The thinking</p><ul class="sheet__list">' +
        rowLink(areaHref('audit'), 'search', 'What we found', 'Your presence today, honestly') +
        rowLink(areaHref('benchmarks'), 'chart', 'How the big chains do it', 'Moves worth borrowing') +
        rowLink(areaHref('ideas'), 'idea', 'All the ideas', 'Top 10 with effort & impact') +
        rowLink(areaHref('calendar'), 'cal', 'Festival calendar', 'A year of reasons to visit') +
      '</ul></div>' +
      '<div class="sheet__group"><p class="sheet__label">Live concept sites</p><ul class="sheet__list">' +
        rowLink(URLS.bazaar, 'web', 'A · Bazaar website', 'curry-district-bazaar.netlify.app', ' target="_blank" rel="noopener"') +
        rowLink(URLS.royal, 'web', 'B · Royal website', 'curry-district-royal.netlify.app', ' target="_blank" rel="noopener"') +
      '</ul></div>' +
      '<div class="sheet__group"><p class="sheet__label">Keep it</p><ul class="sheet__list">' +
        '<li><button type="button" class="sheet__row" data-share>' + icon('share') + '<span>Open on your phone<small>Share or copy this link</small></span></button></li>' +
        '<li><button type="button" class="sheet__row" data-print>' + icon('print') + '<span>Save as PDF handout<small>Clean, printable version of this page</small></span></button></li>' +
      '</ul></div>';
    return c;
  }
  function closeBtn() { return '<button type="button" class="sheet__close" data-sheet-close aria-label="Close">' + icon('close') + '</button>'; }
  function openSheet(kind, trigger) {
    closeSheet(true);
    sheetLastFocus = trigger || d.activeElement;
    sheet = d.createElement('div');
    sheet.className = 'sheet is-open';
    sheet.innerHTML = '<div class="sheet__scrim" data-sheet-close></div><div class="sheet__panel" role="dialog" aria-modal="true" aria-labelledby="hubSheetTitle" tabindex="-1"><div class="sheet__grip" aria-hidden="true"></div>' + sheetContent(kind) + '</div>';
    body.appendChild(sheet);
    renderDirSwitches(sheet);
    setInert(sheet, true);
    de.classList.add('hub-locked');
    d.querySelectorAll('[data-sheet-open="' + kind + '"]').forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
    var panel = sheet.querySelector('.sheet__panel'); panel.focus({ preventScroll: true });
  }
  function closeSheet(instant) {
    if (!sheet) return;
    setInert(sheet, false);
    sheet.remove(); sheet = null;
    de.classList.remove('hub-locked');
    d.querySelectorAll('[data-sheet-open]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    if (!instant && sheetLastFocus && sheetLastFocus.focus) sheetLastFocus.focus({ preventScroll: true });
  }
  /* make everything except `keep` inert while a modal is open (no focus-trap code needed) */
  function setInert(keep, on) {
    Array.prototype.forEach.call(body.children, function (el) {
      if (el === keep || el.tagName === 'SCRIPT') return;
      if (on) { if (!el.inert) { el.inert = true; el.setAttribute('data-hub-inert', ''); } }
      else if (el.hasAttribute('data-hub-inert')) { el.inert = false; el.removeAttribute('data-hub-inert'); }
    });
  }

  /* ═════════ Config-driven contact (assets/config.js) ═════════ */
  function cfgHref(key, v) {
    v = String(v).trim();
    if (key === 'phone') return 'tel:' + v.replace(/[^\d+]/g, '');
    if (key === 'whatsapp') return 'https://wa.me/' + v.replace(/\D/g, '');
    if (key === 'email') return 'mailto:' + v;
    if (key === 'calendarLink') return v;
    return null;
  }
  function applyConfig(scope) {
    var any = false;
    (scope || d).querySelectorAll('[data-config]').forEach(function (el) {
      var keys = el.getAttribute('data-config').split(/[\s,]+/);
      var set = keys.filter(function (k) { return CFG[k] && String(CFG[k]).trim(); });
      if (!set.length) { el.classList.remove('is-set'); return; }
      el.classList.add('is-set'); any = true;
      if (el.tagName === 'A' && keys.length === 1) {
        var h = cfgHref(keys[0], CFG[keys[0]]);
        if (h) { el.setAttribute('href', h); if (/^https?:/.test(h)) { el.target = '_blank'; el.rel = 'noopener'; } }
      }
    });
    (scope || d).querySelectorAll('[data-config-text]').forEach(function (el) {
      var k = el.getAttribute('data-config-text'); if (CFG[k]) el.textContent = String(CFG[k]).trim();
    });
    var contactAny = ['phone', 'whatsapp', 'email', 'calendarLink'].some(function (k) { return CFG[k] && String(CFG[k]).trim(); });
    (scope || d).querySelectorAll('[data-config-none]').forEach(function (el) { el.hidden = contactAny; });
    return any;
  }

  /* ═════════ Share / copy / print / toast ═════════ */
  var toastEl;
  function toast(msg) {
    if (toastEl) toastEl.remove();
    toastEl = d.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); toastEl.textContent = msg;
    body.appendChild(toastEl);
    var t = toastEl; setTimeout(function () { if (t.parentNode) t.remove(); }, 2700);
  }
  function publicURL(url) {
    if (url) return url;
    if (/^https?:/.test(location.protocol + '') && location.hostname && !/^(localhost|127\.|0\.0\.0\.0)/.test(location.hostname)) return location.href.split('#')[0];
    return URLS.hub + (AREA && AREA !== 'home' ? AREA + '/' : '');
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      var ta = d.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      body.appendChild(ta); ta.select();
      try { d.execCommand('copy') ? res() : rej(); } catch (e) { rej(e); } ta.remove();
    });
  }
  function share(opts) {
    opts = opts || {};
    var url = publicURL(opts.url);
    var data = { title: opts.title || d.title, text: opts.text || 'Curry District — Brand Glow-Up concepts', url: url };
    if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
      return navigator.share(data).catch(function (e) { if (e && e.name !== 'AbortError') return fallback(); });
    }
    return fallback();
    function fallback() { return copyText(url).then(function () { toast('Link copied — paste it anywhere'); }, function () { toast(url); }); }
  }

  /* ═════════ Lightbox ═════════ */
  var lb, lbItems = [], lbIndex = 0, lbLastFocus;
  function buildLightbox() {
    lb = d.createElement('div');
    lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Image viewer'); lb.hidden = true;
    lb.innerHTML =
      '<div class="lb__bar"><span class="lb__count" aria-live="polite"></span><div class="lb__tools">' +
        '<a class="lb__btn" data-lb-dl href="#" download hidden aria-label="Download this file">' + icon('download') + '</a>' +
        '<button type="button" class="lb__btn" data-lb-zoom aria-label="Zoom in">' + icon('zoom') + '</button>' +
        '<button type="button" class="lb__btn" data-lb-close aria-label="Close viewer">' + icon('close') + '</button></div></div>' +
      '<div class="lb__stage"><div class="lb__track"></div>' +
        '<button type="button" class="lb__nav lb__prev" data-lb-prev aria-label="Previous image">' + icon('prev') + '</button>' +
        '<button type="button" class="lb__nav lb__next" data-lb-next aria-label="Next image">' + icon('next') + '</button></div>' +
      '<p class="lb__cap"></p>';
    body.appendChild(lb);
    var stage = lb.querySelector('.lb__stage'), track = lb.querySelector('.lb__track');
    lb.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t) return;
      if (t.hasAttribute('data-lb-close')) closeLightbox();
      else if (t.hasAttribute('data-lb-prev')) go(lbIndex - 1);
      else if (t.hasAttribute('data-lb-next')) go(lbIndex + 1);
      else if (t.hasAttribute('data-lb-zoom')) toggleZoom(currentSlide());
    });
    track.addEventListener('dblclick', function (e) { if (e.target.tagName === 'IMG') toggleZoom(currentSlide(), e); });
    /* swipe (single pointer only — two fingers fall through to native pinch-zoom) */
    var pts = {}, startX = 0, startY = 0, dx = 0, dragging = false, startT = 0, lastTap = 0;
    stage.addEventListener('pointerdown', function (e) {
      pts[e.pointerId] = true;
      if (Object.keys(pts).length > 1) { cancelDrag(); return; }
      if (e.target.closest('button,a') || (currentSlide() && currentSlide().classList.contains('is-zoomed'))) return;
      if (e.target.tagName === 'VIDEO') { var vr = e.target.getBoundingClientRect(); if (e.clientY > vr.bottom - 64) return; }
      startX = e.clientX; startY = e.clientY; dx = 0; dragging = true; startT = Date.now();
    });
    stage.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      dx = e.clientX - startX;
      if (Math.abs(e.clientY - startY) > Math.abs(dx) * 1.2 && Math.abs(dx) < 10) return;
      track.classList.add('is-dragging');
      var edge = (lbIndex === 0 && dx > 0) || (lbIndex === lbItems.length - 1 && dx < 0) ? 0.35 : 1;
      track.style.transform = 'translateX(calc(' + (-lbIndex * 100) + '% + ' + (dx * edge) + 'px))';
    });
    function endDrag(e) {
      delete pts[e.pointerId];
      if (!dragging) return;
      dragging = false; track.classList.remove('is-dragging');
      var fast = Math.abs(dx) > 30 && Date.now() - startT < 250;
      if (dx < -60 || (fast && dx < 0)) go(lbIndex + 1);
      else if (dx > 60 || (fast && dx > 0)) go(lbIndex - 1);
      else {
        go(lbIndex);
        /* double-tap to zoom on touch */
        if (e.pointerType === 'touch' && Math.abs(dx) < 8 && e.target.tagName === 'IMG') {
          var now = Date.now(); if (now - lastTap < 320) { toggleZoom(currentSlide(), e); lastTap = 0; } else lastTap = now;
        }
      }
    }
    function cancelDrag() { if (dragging) { dragging = false; track.classList.remove('is-dragging'); go(lbIndex); } }
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', function (e) { delete pts[e.pointerId]; cancelDrag(); });
    d.addEventListener('keydown', function (e) {
      if (!lb || lb.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(lbIndex + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(lbIndex - 1); }
    });
  }
  function currentSlide() { return lb && lb.querySelectorAll('.lb__slide')[lbIndex]; }
  function toggleZoom(slide, e) {
    if (!slide) return;
    var z = !slide.classList.contains('is-zoomed');
    slide.classList.toggle('is-zoomed', z);
    lb.querySelector('[data-lb-zoom]').setAttribute('aria-label', z ? 'Zoom out' : 'Zoom in');
    if (z) {
      var img = slide.querySelector('img');
      requestAnimationFrame(function () {
        var fx = 0.5, fy = 0.5;
        if (e && img) { var r = img.getBoundingClientRect(); fx = (e.clientX - r.left) / r.width || .5; fy = (e.clientY - r.top) / r.height || .5; }
        slide.scrollLeft = slide.scrollWidth * fx - slide.clientWidth / 2;
        slide.scrollTop = slide.scrollHeight * fy - slide.clientHeight / 2;
      });
    }
  }
  function loadSlide(i) {
    var s = lb.querySelectorAll('.lb__slide')[i]; if (!s) return;
    var img = s.querySelector('img'); if (img && !img.getAttribute('src')) img.src = img.getAttribute('data-src');
    var v = s.querySelector('video'); if (v && !v.getAttribute('src')) v.src = v.getAttribute('data-src');
  }
  function go(i) {
    i = Math.max(0, Math.min(lbItems.length - 1, i));
    var prevSlide = currentSlide(); if (prevSlide && i !== lbIndex) prevSlide.classList.remove('is-zoomed');
    lbIndex = i;
    var track = lb.querySelector('.lb__track');
    track.style.transform = 'translateX(' + (-i * 100) + '%)';
    [i - 1, i, i + 1].forEach(loadSlide);
    var it = lbItems[i];
    lb.querySelector('.lb__count').textContent = (i + 1) + ' / ' + lbItems.length;
    lb.querySelector('.lb__cap').innerHTML = (it.title ? '<b class="lb__title">' + esc(it.title) + '</b>' : '') + esc(it.caption || (it.title ? '' : it.alt) || '') + (lbItems.length > 1 && i === 0 ? '<span class="lb__hint">Swipe or use ← → · double-tap to zoom</span>' : '');
    var dl = lb.querySelector('[data-lb-dl]');
    if (it.download) { dl.hidden = false; dl.setAttribute('href', it.download); } else { dl.hidden = true; dl.removeAttribute('href'); }
    lb.querySelector('[data-lb-zoom]').hidden = it.type === 'video';
    lb.querySelectorAll('.lb__slide video').forEach(function (v, k) { if (v.closest('.lb__slide') !== currentSlide()) { try { v.pause(); } catch (e) {} } });
    var cv = currentSlide() && currentSlide().querySelector('video');
    if (cv && !reduceMQ.matches) { var pr = cv.play(); if (pr && pr.catch) pr.catch(function () {}); }
    lb.querySelector('[data-lb-prev]').disabled = i === 0;
    lb.querySelector('[data-lb-next]').disabled = i === lbItems.length - 1;
    lb.querySelector('[data-lb-zoom]').setAttribute('aria-label', 'Zoom in');
    lb.querySelectorAll('.lb__slide').forEach(function (s, k) { s.setAttribute('aria-hidden', String(k !== i)); });
  }
  /* items: [{src, alt, title, caption, type:'image'|'video', poster, download}] */
  function openLightbox(items, index, trigger) {
    if (!lb) buildLightbox();
    lbItems = items; lbLastFocus = trigger || d.activeElement;
    lb.querySelector('.lb__track').innerHTML = items.map(function (it) {
      if (it.type === 'video') return '<div class="lb__slide lb__slide--video" role="group" aria-roledescription="slide"><video data-src="' + esc(it.src) + '"' + (it.poster ? ' poster="' + esc(it.poster) + '"' : '') + ' controls playsinline muted loop preload="metadata" aria-label="' + esc(it.title || it.caption || 'Video') + '"></video></div>';
      return '<div class="lb__slide" role="group" aria-roledescription="slide"><img data-src="' + esc(it.src) + '" alt="' + esc(it.alt || it.title || it.caption || '') + '" draggable="false" decoding="async"></div>';
    }).join('');
    lb.querySelector('.lb__track').style.transition = 'none';
    lb.hidden = false;
    go(index || 0);
    void lb.offsetWidth; lb.querySelector('.lb__track').style.transition = '';
    lb.classList.add('is-open');
    setInert(lb, true); de.classList.add('hub-locked');
    lb.querySelector('[data-lb-close]').focus({ preventScroll: true });
  }
  function closeLightbox() {
    if (!lb || lb.hidden) return;
    lb.classList.remove('is-open'); setInert(lb, false); de.classList.remove('hub-locked');
    lb.querySelectorAll('video').forEach(function (v) { try { v.pause(); } catch (e) {} });
    setTimeout(function () { lb.hidden = true; }, reduceMQ.matches ? 0 : 300);
    if (lbLastFocus && lbLastFocus.focus) lbLastFocus.focus({ preventScroll: true });
  }
  function itemsForGroup(trigger) {
    var g = trigger.getAttribute('data-lightbox');
    var els = g ? d.querySelectorAll('[data-lightbox="' + g.replace(/"/g, '\\"') + '"]') : [trigger];
    els = Array.prototype.filter.call(els, function (el) { return el.offsetParent !== null || el === trigger; }); /* skip hidden direction */
    return {
      items: els.map(function (el) {
        var img = el.querySelector('img');
        var cap = el.getAttribute('data-caption') || (el.querySelector('figcaption,.gallery__cap') || {}).textContent || '';
        return { src: el.getAttribute('data-src') || el.getAttribute('href') || (img && (img.currentSrc || img.src)), alt: img ? img.alt : '', caption: cap.trim() };
      }),
      index: Math.max(0, els.indexOf(trigger))
    };
  }

  /* ═════════ Tabs ═════════ */
  function initTabs(scope) {
    (scope || d).querySelectorAll('[data-tabs]').forEach(function (root) {
      if (root.__hubTabs) return; root.__hubTabs = true;
      var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
      function select(tab, focus) {
        tabs.forEach(function (t) {
          var on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
          var p = d.getElementById(t.getAttribute('aria-controls')); if (p) p.hidden = !on;
        });
        if (focus) tab.focus();
        root.dispatchEvent(new CustomEvent('hub:tab', { detail: { tab: tab }, bubbles: true }));
      }
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { select(t); });
        t.addEventListener('keydown', function (e) {
          var k = e.key, n = null;
          if (k === 'ArrowRight') n = tabs[(i + 1) % tabs.length]; else if (k === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
          else if (k === 'Home') n = tabs[0]; else if (k === 'End') n = tabs[tabs.length - 1];
          if (n) { e.preventDefault(); select(n, true); }
        });
      });
      select(tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0]);
    });
  }

  /* ═════════ Before / after ═════════ */
  function initBA(scope) {
    (scope || d).querySelectorAll('.ba').forEach(function (ba) {
      if (ba.__hubBA) return; ba.__hubBA = true;
      var r = ba.querySelector('.ba__range'); if (!r) return;
      var set = function () { ba.style.setProperty('--pos', r.value + '%'); };
      r.addEventListener('input', set); set();
    });
  }

  /* ═════════ Device frames: scale live iframes to fit ═════════ */
  function initFrames(scope) {
    var screens = (scope || d).querySelectorAll('.phone__screen, .browser__screen');
    function fit(sc) {
      var f = sc.querySelector('iframe'); if (!f) return;
      var fw = parseFloat(f.getAttribute('data-w')) || (sc.classList.contains('phone__screen') ? 390 : 1280);
      var s = sc.clientWidth / fw;
      sc.style.setProperty('--s', s); sc.style.setProperty('--fw', fw + 'px'); sc.style.setProperty('--fh', (sc.clientHeight / s) + 'px');
    }
    if ('ResizeObserver' in window) { var ro = new ResizeObserver(function (en) { en.forEach(function (x) { fit(x.target); }); }); screens.forEach(function (s) { if (s.querySelector('iframe')) ro.observe(s); }); }
    else screens.forEach(fit);
  }

  /* ═════════ Broken / missing images → reveal gradient placeholder ═════════ */
  function hideBroken(img) { img.hidden = true; if (img.parentNode) img.parentNode.classList.add('is-missing'); }
  function sweepImages() {
    d.querySelectorAll('img').forEach(function (img) { if (img.complete && img.getAttribute('src') && img.naturalWidth === 0) hideBroken(img); });
  }
  d.addEventListener('error', function (e) { if (e.target && e.target.tagName === 'IMG' && !e.target.closest('.lb')) hideBroken(e.target); }, true);

  /* ═════════ Motion: reveal, stagger, count-up, tilt ═════════ */
  function countUp(el) {
    if (el.__counted) return; el.__counted = true;
    var to = parseFloat(el.getAttribute('data-count')), dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
    var fmt = function (v) { return pre + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf; };
    if (reduceMQ.matches) { el.textContent = fmt(to); return; }
    var t0 = null, dur = 1400;
    function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur); var e = 1 - Math.pow(1 - p, 4); el.textContent = fmt(to * e); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  function initReveal(scope) {
    var sc = scope || d;
    sc.querySelectorAll('[data-stagger]').forEach(function (p) {
      Array.prototype.forEach.call(p.children, function (c, i) { if (!c.hasAttribute('data-reveal')) c.setAttribute('data-reveal', p.getAttribute('data-stagger') || ''); c.style.setProperty('--i', i % 8); });
    });
    var els = sc.querySelectorAll('[data-reveal]:not(.is-in), [data-count]');
    if (reduceMQ.matches || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-in'); if (el.hasAttribute('data-count')) countUp(el); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        if (en.target.hasAttribute('data-count')) countUp(en.target);
        en.target.querySelectorAll && en.target.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }
  function initTilt(scope) {
    if (!finePointer || reduceMQ.matches) return;
    (scope || d).querySelectorAll('[data-tilt]').forEach(function (el) {
      if (el.__tilt) return; el.__tilt = true;
      var max = parseFloat(el.getAttribute('data-tilt')) || 6;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.classList.add('is-tilting');
        el.style.transform = 'perspective(900px) rotateY(' + (x * max) + 'deg) rotateX(' + (-y * max) + 'deg) translateZ(0)';
      });
      el.addEventListener('pointerleave', function () { el.classList.remove('is-tilting'); el.style.transform = ''; });
    });
  }

  /* ═════════ Print header (adds page title + URL on the PDF) ═════════ */
  function addPrintHead() {
    var main = d.querySelector('main'); if (!main || d.querySelector('.print-head')) return;
    var ph = d.createElement('div'); ph.className = 'print-head print-only wrap';
    ph.innerHTML = '<span>Curry District · Brand Glow-Up</span><span>' + esc(publicURL().replace(/^https?:\/\//, '')) + '</span>';
    main.insertBefore(ph, main.firstChild);
  }


  /* ═════════ Interactive frame sheet (full-screen iframe) ═════════ */
  var frameSheet, frameLastFocus;
  function openFrame(href, title, trigger) {
    closeFrame(true);
    frameLastFocus = trigger || d.activeElement;
    frameSheet = d.createElement('div');
    frameSheet.className = 'frame-sheet'; frameSheet.setAttribute('role', 'dialog'); frameSheet.setAttribute('aria-modal', 'true'); frameSheet.setAttribute('aria-label', title || 'Interactive preview');
    frameSheet.innerHTML = '<div class="frame-sheet__bar"><span class="frame-sheet__title">' + esc(title || 'Interactive preview') + '</span>' +
      '<a class="lb__btn" href="' + esc(href) + '" target="_blank" rel="noopener" aria-label="Open in a new tab">' + icon('ext') + '</a>' +
      '<button type="button" class="lb__btn" data-frame-close aria-label="Close">' + icon('close') + '</button></div>' +
      '<iframe class="frame-sheet__frame" src="' + esc(href) + '" title="' + esc(title || 'Interactive preview') + '" allow="fullscreen; autoplay"></iframe>';
    body.appendChild(frameSheet);
    setInert(frameSheet, true); de.classList.add('hub-locked');
    frameSheet.querySelector('[data-frame-close]').focus({ preventScroll: true });
  }
  function closeFrame(instant) {
    if (!frameSheet) return;
    setInert(frameSheet, false); de.classList.remove('hub-locked');
    frameSheet.remove(); frameSheet = null;
    if (!instant && frameLastFocus && frameLastFocus.focus) frameLastFocus.focus({ preventScroll: true });
  }

  /* ═════════ Manifest-driven gallery ═════════
     <section data-gallery data-manifests="assets/boxes/manifest.json,assets/bags/manifest.json" data-filter="direction,type,tags">
     Paths in manifests are relative to the AREA folder (the page). Missing/404/invalid manifests are skipped silently.
     Optional inline manifest for file:// testing: <script type="application/json" data-gallery-items>{ "items":[…] }</script> */
  var TYPE_LABEL = { image: 'Images', video: 'Video', interactive: 'Interactive', pdf: 'PDF' };
  function fetchManifest(url) {
    if (!window.fetch) return Promise.resolve(null);
    return fetch(url, { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  function normItem(it, i) {
    if (!it || !it.src) return null;
    var dir = String(it.direction || 'both').toLowerCase(); if (dir !== 'bazaar' && dir !== 'royal') dir = 'both';
    var type = String(it.type || 'image').toLowerCase(); if (!TYPE_LABEL[type]) type = 'image';
    return { id: it.id || ('item-' + i), title: it.title || '', caption: it.caption || '', direction: dir, type: type, src: it.src,
      thumb: it.thumb || (type === 'video' ? it.poster : null) || (type === 'image' ? it.src : null), poster: it.poster || '', w: +it.w || 0, h: +it.h || 0,
      tags: Array.isArray(it.tags) ? it.tags.map(String) : [], download: it.download || '', href: it.href || '', alt: it.alt || it.title || '' };
  }
  function initManifestGalleries(scope) {
    (scope || d).querySelectorAll('[data-gallery]').forEach(function (root) {
      if (root.__mg) return; root.__mg = true;
      var urls = (root.getAttribute('data-manifests') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      var inline = [];
      root.querySelectorAll('script[type="application/json"][data-gallery-items]').forEach(function (sc) { try { inline.push(JSON.parse(sc.textContent)); } catch (e) { /* ignore */ } });
      Promise.all(urls.map(fetchManifest)).then(function (mans) {
        var seen = {}, items = [];
        mans.concat(inline).forEach(function (m) {
          var list = m && (Array.isArray(m) ? m : m.items); if (!Array.isArray(list)) return;
          list.forEach(function (raw) { var it = normItem(raw, items.length); if (it && !seen[it.id]) { seen[it.id] = 1; items.push(it); } });
        });
        renderManifestGallery(root, items);
      }).catch(function () { /* never throw */ });
    });
  }
  function renderManifestGallery(root, items) {
    root.__mgItems = items;
    if (!items.length) { root.classList.add('mg--empty'); return; }
    root.classList.remove('mg--empty');
    var facets = (root.getAttribute('data-filter') || 'direction').split(/[\s,]+/);
    var dirs = {}, types = {}, tags = {};
    items.forEach(function (it) { dirs[it.direction] = 1; types[it.type] = 1; it.tags.forEach(function (t) { tags[t] = (tags[t] || 0) + 1; }); });
    var state = { type: 'all', tag: 'all' };
    var host = root.querySelector('[data-gallery-mount]');
    if (!host) { host = d.createElement('div'); host.setAttribute('data-gallery-mount', ''); root.appendChild(host); }
    var bars = '';
    var hasA = dirs.bazaar, hasB = dirs.royal;
    if (facets.indexOf('direction') > -1 && hasA && hasB) {
      bars += '<div class="mg__bar" role="group" aria-label="Direction">' +
        '<button type="button" class="chip" data-mg-dir="both">All</button>' +
        '<button type="button" class="chip" data-mg-dir="bazaar"><span class="dirswitch__dot dirswitch__dot--a" aria-hidden="true"></span>Bazaar</button>' +
        '<button type="button" class="chip" data-mg-dir="royal"><span class="dirswitch__dot dirswitch__dot--b" aria-hidden="true"></span>Royal</button></div>';
    }
    var typeKeys = Object.keys(types);
    if (facets.indexOf('type') > -1 && typeKeys.length > 1) {
      bars += '<div class="mg__bar" role="group" aria-label="Type"><button type="button" class="chip" data-mg-type="all">All types</button>' +
        typeKeys.map(function (t) { return '<button type="button" class="chip" data-mg-type="' + t + '">' + TYPE_LABEL[t] + '</button>'; }).join('') + '</div>';
    }
    var tagKeys = Object.keys(tags).sort(function (a, b) { return tags[b] - tags[a]; }).slice(0, 14);
    if (facets.indexOf('tags') > -1 && tagKeys.length > 1) {
      bars += '<div class="mg__bar mg__bar--scroll" role="group" aria-label="Tags"><button type="button" class="chip" data-mg-tag="all">Everything</button>' +
        tagKeys.map(function (t) { return '<button type="button" class="chip" data-mg-tag="' + esc(t) + '">' + esc(t) + '</button>'; }).join('') + '</div>';
    }
    host.innerHTML = (bars ? '<div class="mg__filters">' + bars + '</div>' : '') +
      '<p class="mg__count muted" aria-live="polite"></p><div class="mg__grid"></div><p class="mg__empty" hidden>Nothing here for this direction yet. Try <button type="button" class="link-btn" data-dir-set="both">Both</button>.</p>';
    var grid = host.querySelector('.mg__grid');
    grid.innerHTML = items.map(function (it, i) {
      var ar = it.w && it.h ? (it.w + ' / ' + it.h) : '4 / 5';
      var badge = it.type === 'video' ? icon('play', 'mg__badge') : it.type === 'interactive' ? '<span class="mg__pill">' + icon('cursor') + 'Interactive</span>' : it.type === 'pdf' ? '<span class="mg__pill">' + icon('file') + 'PDF</span>' : '';
      var attrs = it.type === 'pdf' ? ' href="' + esc(it.src) + '" target="_blank" rel="noopener"' : it.type === 'interactive' ? ' href="' + esc(it.href || it.src) + '"' : ' href="' + esc(it.src) + '"';
      var ph = '<span class="mg__ph" aria-hidden="true">' + icon(it.type === 'video' ? 'play' : it.type === 'pdf' ? 'file' : it.type === 'interactive' ? 'cursor' : 'kit') + '</span>';
      return '<a class="gallery__item mg__item" data-mg-i="' + i + '" data-dir="' + it.direction + '" data-type="' + it.type + '"' + attrs + ' style="--ar:' + ar + '">' + ph +
        (it.thumb ? '<img src="' + esc(it.thumb) + '" alt="' + esc(it.alt) + '" loading="lazy" decoding="async"' + (it.w && it.h ? ' width="' + it.w + '" height="' + it.h + '"' : '') + '>' : '') +
        badge + (it.title ? '<span class="gallery__cap">' + esc(it.title) + '</span>' : '') + '</a>';
    }).join('');
    function visible() {
      var g = getDirection();
      return items.map(function (it, i) { return i; }).filter(function (i) {
        var it = items[i];
        if (g !== 'both' && it.direction !== 'both' && it.direction !== g) return false;
        if (state.type !== 'all' && it.type !== state.type) return false;
        if (state.tag !== 'all' && it.tags.indexOf(state.tag) < 0) return false;
        return true;
      });
    }
    function apply() {
      var vis = visible(), set = {}; vis.forEach(function (i) { set[i] = 1; });
      grid.querySelectorAll('.mg__item').forEach(function (el) { el.hidden = !set[el.getAttribute('data-mg-i')]; });
      host.querySelector('.mg__count').textContent = vis.length + (vis.length === 1 ? ' piece' : ' pieces');
      host.querySelector('.mg__empty').hidden = vis.length > 0;
      var g = getDirection();
      host.querySelectorAll('[data-mg-dir]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-mg-dir') === g)); });
      host.querySelectorAll('[data-mg-type]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-mg-type') === state.type)); });
      host.querySelectorAll('[data-mg-tag]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-mg-tag') === state.tag)); });
      root.__mgVisible = vis;
    }
    if (root.__mgOff) root.__mgOff();
    function onClick(e) {
      var b = e.target.closest('[data-mg-dir],[data-mg-type],[data-mg-tag]');
      if (b) {
        if (b.hasAttribute('data-mg-dir')) setDirection(b.getAttribute('data-mg-dir'));
        if (b.hasAttribute('data-mg-type')) state.type = b.getAttribute('data-mg-type');
        if (b.hasAttribute('data-mg-tag')) state.tag = b.getAttribute('data-mg-tag');
        apply(); return;
      }
      var a = e.target.closest('.mg__item'); if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      var it = items[+a.getAttribute('data-mg-i')];
      if (it.type === 'pdf') return; /* native new-tab link */
      e.preventDefault();
      if (it.type === 'interactive') { openFrame(it.href || it.src, it.title, a); return; }
      var lbSet = (root.__mgVisible || []).filter(function (i) { return items[i].type === 'image' || items[i].type === 'video'; });
      openLightbox(lbSet.map(function (i) { return items[i]; }), Math.max(0, lbSet.indexOf(+a.getAttribute('data-mg-i'))), a);
    }
    host.addEventListener('click', onClick);
    d.addEventListener('hub:direction', apply);
    root.__mgOff = function () { host.removeEventListener('click', onClick); d.removeEventListener('hub:direction', apply); };
    apply();
    initReveal(host);
  }

  /* ═════════ Global click delegation ═════════ */
  d.addEventListener('click', function (e) {
    var t = e.target.closest('[data-dir-set],[data-sheet-open],[data-sheet-close],[data-share],[data-print],[data-lightbox],[data-copy]');
    if (!t) { return; }
    if (t.hasAttribute('data-dir-set')) { setDirection(t.getAttribute('data-dir-set')); return; }
    if (t.hasAttribute('data-sheet-open')) { e.preventDefault(); var k = t.getAttribute('data-sheet-open'); if (sheet && t.getAttribute('aria-expanded') === 'true') closeSheet(); else openSheet(k, t); return; }
    if (t.hasAttribute('data-sheet-close')) { closeSheet(); return; }
    if (t.hasAttribute('data-share')) { e.preventDefault(); share({ url: t.getAttribute('data-share-url') || undefined, title: t.getAttribute('data-share-title') || undefined }); return; }
    if (t.hasAttribute('data-print')) { e.preventDefault(); closeSheet(true); setTimeout(function () { window.print(); }, 60); return; }
    if (t.hasAttribute('data-copy')) { e.preventDefault(); copyText(t.getAttribute('data-copy')).then(function () { toast('Copied'); }); return; }
    if (t.hasAttribute('data-lightbox')) {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault(); var g = itemsForGroup(t); openLightbox(g.items, g.index, t);
    }
  });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (frameSheet) closeFrame(); else if (sheet) closeSheet(); } });
  d.addEventListener('click', function (e) { if (e.target.closest('[data-frame-close]')) closeFrame(); });
  /* close the sheet when navigating to an in-page anchor */
  d.addEventListener('click', function (e) { var a = e.target.closest('.sheet a[href]'); if (a) setTimeout(function () { closeSheet(true); }, 0); });

  /* ═════════ Boot ═════════ */
  function refresh(scope) {
    renderTiles(scope); renderDirSwitches(scope); initManifestGalleries(scope); applyConfig(scope); initTabs(scope); initBA(scope); initFrames(scope); initReveal(scope); initTilt(scope);
  }
  function boot() {
    var saved = sget(DIR_KEY); if (saved && !de.getAttribute('data-dir')) de.setAttribute('data-dir', saved);
    renderNav();
    refresh(d);
    sweepImages();
    addPrintHead();
    window.addEventListener('beforeprint', function () { d.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); }); d.querySelectorAll('details').forEach(function (x) { x.setAttribute('data-was-open', x.open ? '1' : ''); x.open = true; }); });
    window.addEventListener('afterprint', function () { d.querySelectorAll('details[data-was-open]').forEach(function (x) { x.open = x.getAttribute('data-was-open') === '1'; x.removeAttribute('data-was-open'); }); });
  }

  window.Hub = { AREAS: AREAS, URLS: URLS, icon: icon, setDirection: setDirection, getDirection: getDirection, openLightbox: openLightbox, closeLightbox: closeLightbox, toast: toast, share: share, refresh: refresh, openSheet: openSheet, closeSheet: closeSheet, openFrame: openFrame, closeFrame: closeFrame, renderGallery: function (el, items) { el.__mg = true; renderManifestGallery(el, (items || []).map(normItem).filter(Boolean)); } };

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
})();

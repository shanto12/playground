/*! Curry District · Royal — site behaviour (vanilla, no dependencies besides the optional Motion kit).
   Load order at the end of <body>:
     <script src="js/config.js"></script>
     <script src="js/motion.min.js" data-manual></script>
     <script src="js/site.js"></script>
   Features: config binding · open-now status (America/Chicago) · concept banner · mobile nav ·
   sticky action bar · hero parallax · zone rail controls · Motion.init(). */
(function (w, d) {
  'use strict';
  var C = w.CD_CONFIG || {};
  var de = d.documentElement;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var mq = function (q) { return w.matchMedia ? w.matchMedia(q) : { matches: false }; };
  var reduced = mq('(prefers-reduced-motion: reduce)');
  var store = {
    get: function (k) { try { return w.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { w.localStorage.setItem(k, v); } catch (e) { /* private mode / blocked */ } }
  };
  de.classList.add('js');

  /* ── 1 · bind config values ─────────────────────────────────────────────
     <a data-cd-href="tel">…</a>         → href="tel:+1…"
     <a data-cd-href="order">…</a>       → href from CD_CONFIG.links.order (any key in links)
     <span data-cd="phone">…</span>      → "(469) 200-5856"   (phone | address | oneLine | hoursCaveat | disclaimer | tagline) */
  function bind() {
    var L = C.links || {};
    $$('[data-cd-href]').forEach(function (a) {
      var k = a.getAttribute('data-cd-href');
      if (k === 'tel' && C.phone) a.setAttribute('href', 'tel:' + C.phone.tel);
      else if (L[k]) a.setAttribute('href', L[k]);
    });
    var text = {
      phone: C.phone && C.phone.display,
      address: C.address && C.address.line1,
      cityLine: C.address && (C.address.city + ', ' + C.address.region + ' ' + C.address.zip),
      oneLine: C.address && C.address.oneLine,
      hoursCaveat: C.hoursCaveat,
      disclaimer: C.disclaimer,
      tagline: C.tagline
    };
    $$('[data-cd]').forEach(function (el) {
      var v = text[el.getAttribute('data-cd')];
      if (v) el.textContent = v;
    });
    $$('[data-cd-src="mapEmbed"]').forEach(function (f) { if (L.mapEmbed && f.getAttribute('src') !== L.mapEmbed) f.setAttribute('src', L.mapEmbed); });
  }

  /* ── 2 · open-now status, computed in America/Chicago (not the visitor's clock) ── */
  var DAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  function chicagoNow() {
    try {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: C.timeZone || 'America/Chicago', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
      var o = {};
      parts.forEach(function (p) { o[p.type] = p.value; });
      var h = +o.hour % 24;
      return { day: DAYS[o.weekday], min: h * 60 + (+o.minute) };
    } catch (e) { return null; }
  }
  var toMin = function (t) { var p = t.split(':'); return (+p[0]) * 60 + (+p[1]); };
  function fmt(t) {
    var m = toMin(t), h = Math.floor(m / 60) % 24, mm = m % 60, ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + (mm < 10 ? '0' : '') + mm + ' ' + ap;
  }
  function blocksFor(day) {
    var g = (C.hours || []).filter(function (x) { return x.days.indexOf(day) > -1; })[0];
    return g ? g.blocks : [];
  }
  function fill(s, time) { return s.replace('{time}', time); }
  function status() {
    var n = chicagoNow(), T = C.statusText || {};
    if (!n) return null;
    var b = blocksFor(n.day), i, o, c;
    for (i = 0; i < b.length; i++) {
      o = toMin(b[i][0]); c = toMin(b[i][1]);
      if (n.min >= o && n.min < c) {
        if (c - n.min <= (C.closingSoonMinutes || 30)) return { state: 'soon', text: fill(T.closingSoon, fmt(b[i][1])) };
        return { state: 'open', text: fill(T.openNow, fmt(b[i][1])) };
      }
    }
    if (b.length && n.min < toMin(b[0][0])) return { state: 'closed', text: fill(T.opensLaterToday, fmt(b[0][0])) };
    for (i = 0; i < b.length - 1; i++) {
      if (n.min >= toMin(b[i][1]) && n.min < toMin(b[i + 1][0])) return { state: 'between', text: fill(T.betweenServices, fmt(b[i + 1][0])) };
    }
    var next = blocksFor((n.day + 1) % 7);
    return { state: 'closed', text: fill(T.closedNow, next.length ? fmt(next[0][0]) : '11:00 AM') };
  }
  function paintStatus() {
    var s = status(), n = chicagoNow();
    if (s) $$('[data-open-status]').forEach(function (el) {
      el.setAttribute('data-state', s.state);
      var t = $('[data-open-text]', el) || el;
      t.textContent = s.text;
    });
    if (n) $$('[data-days]').forEach(function (row) {
      var days = row.getAttribute('data-days').split(',').map(Number);
      row.classList.toggle('is-today', days.indexOf(n.day) > -1);
    });
  }

  /* ── 3 · concept banner (dismissible; head script pre-hides it to avoid layout shift) ── */
  function banner() {
    var b = $('[data-concept-banner]');
    if (!b) return;
    var x = $('[data-concept-close]', b);
    if (x) x.addEventListener('click', function () {
      de.classList.add('concept-dismissed');
      store.set(C.storageKey || 'cd-royal-concept-dismissed', '1');
      var h = $('#main') || $('main');
      if (h) { h.setAttribute('tabindex', '-1'); try { h.focus({ preventScroll: true }); } catch (e) {} }
    });
  }

  /* ── 4 · mobile navigation sheet ── */
  function nav() {
    var btn = $('[data-nav-toggle]'), sheet = $('#mobile-nav');
    if (!btn || !sheet) return;
    function set(open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) { var hd = $('.site-header'); if (hd) sheet.style.setProperty('--nav-top', Math.max(0, hd.getBoundingClientRect().bottom) + 'px'); }
      sheet.hidden = !open;
      de.classList.toggle('nav-open', open);
      if (open) { var f = $('a', sheet); if (f) f.focus(); }
    }
    btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    sheet.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) { set(false); btn.focus(); } });
    var wide = mq('(min-width: 960px)');
    var onWide = function () { if (wide.matches && !sheet.hidden) set(false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);
  }

  /* ── 5 · sticky bottom action bar: appears once the hero's own CTAs scroll away ── */
  function actionBar() {
    var bar = $('[data-action-bar]'), sentinel = $('[data-bar-sentinel]');
    if (!bar) return;
    if (!sentinel) { bar.setAttribute('data-state', 'shown'); return; }
    var raf = 0, last = '';
    function check() {
      raf = 0;
      var s = sentinel.getBoundingClientRect().bottom < 0 ? 'shown' : 'hidden';
      if (s !== last) { last = s; bar.setAttribute('data-state', s); }
    }
    w.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(check); }, { passive: true });
    w.addEventListener('resize', check, { passive: true });
    check();
  }

  /* ── 6 · hero parallax (scroll on all devices, pointer drift on fine pointers) ── */
  function heroParallax() {
    var hero = $('[data-hero]');
    if (!hero || reduced.matches) return;
    var planes = $$('[data-plane]', hero).map(function (el) { return { el: el, k: parseFloat(el.getAttribute('data-plane')) || 0, x: parseFloat(el.getAttribute('data-drift')) || 0 }; });
    var content = $('[data-hero-content]', hero);
    var H = hero.offsetHeight, inView = true, raf = 0, px = 0, tx = 0;
    var fine = mq('(hover: hover) and (pointer: fine)').matches;
    function frame() {
      raf = 0;
      var y = w.pageYOffset;
      px += (tx - px) * 0.08;
      if (y > H * 1.1 && Math.abs(tx - px) < 0.001) return;
      planes.forEach(function (p) {
        p.el.style.transform = 'translate3d(' + (px * p.x).toFixed(2) + 'px,' + (Math.min(y, H) * p.k).toFixed(1) + 'px,0)';
      });
      if (content) {
        var r = Math.min(y / (H * 0.75), 1);
        content.style.transform = 'translate3d(0,' + (y * 0.18).toFixed(1) + 'px,0)';
        content.style.opacity = (1 - r * 0.9).toFixed(3);
      }
      if (Math.abs(tx - px) > 0.002) raf = requestAnimationFrame(frame);
    }
    var kick = function () { if (!raf && inView) raf = requestAnimationFrame(frame); };
    w.addEventListener('scroll', kick, { passive: true });
    w.addEventListener('resize', function () { H = hero.offsetHeight; kick(); }, { passive: true });
    if ('IntersectionObserver' in w) new IntersectionObserver(function (es) { inView = es[0].isIntersecting; if (inView) kick(); }).observe(hero);
    if (fine) hero.addEventListener('pointermove', function (e) { tx = (e.clientX / w.innerWidth - 0.5) * 2; kick(); }, { passive: true });
    kick();
  }

  /* ── 7 · horizontal rail (Chapter II): prev/next buttons, counter, progress ── */
  function rails() {
    $$('[data-rail]').forEach(function (rail) {
      var track = $('[data-rail-track]', rail), prev = $('[data-rail-prev]', rail), next = $('[data-rail-next]', rail);
      var count = $('[data-rail-count]', rail), prog = $('[data-rail-progress]', rail);
      if (!track) return;
      var items = $$('[data-rail-item]', track), n = items.length, raf = 0;
      var pad = function (v) { return (v < 10 ? '0' : '') + v; };
      function step() { return items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : track.clientWidth; }
      function update() {
        raf = 0;
        var max = track.scrollWidth - track.clientWidth, x = track.scrollLeft;
        var i = Math.min(n - 1, Math.round(x / step()));
        if (x >= max - 4) i = n - 1;
        if (count) count.textContent = pad(i + 1) + ' / ' + pad(n);
        if (prog) prog.style.setProperty('--p', ((i + 1) / n).toFixed(3));
        if (prev) prev.disabled = x <= 4;
        if (next) next.disabled = x >= max - 4;
      }
      function go(dir) { track.scrollBy({ left: dir * step(), behavior: reduced.matches ? 'auto' : 'smooth' }); }
      if (prev) prev.addEventListener('click', function () { go(-1); });
      if (next) next.addEventListener('click', function () { go(1); });
      track.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
      w.addEventListener('resize', update, { passive: true });
      update();
    });
  }

  /* ── 8 · boot ── */
  function boot() {
    bind();
    paintStatus();
    setInterval(paintStatus, 60000);
    banner();
    nav();
    actionBar();
    rails();
    heroParallax();
    if (w.Motion && typeof w.Motion.init === 'function') {
      try { w.Motion.init(); } catch (e) { de.classList.remove('m-js'); }
    }
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();

  w.CD = { config: C, status: status, refresh: function () { bind(); paintStatus(); } };
})(window, document);

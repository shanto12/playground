/* Curry District · A · BAZAAR — shared site behaviour (vanilla, no deps).
   Needs js/config.js (window.CD_CONFIG) loaded first; vendor/motion.min.js is optional.
   Hooks (all data-attributes — see STYLE_GUIDE.md):
     [data-banner-close]            dismiss the concept banner (remembered in localStorage)
     [data-nav-toggle] / [data-nav-drawer]   mobile menu
     [data-cfg-href="tel|order|directions|appleMaps|uberEats|doorDash|instagram|facebook|yelp|restaurantji|hub"]
     [data-cfg-src="mapEmbed"]      iframe src from config
     [data-cfg-text="phone.display|address.oneLine|address.line1|…"]   text from config
     [data-hours]                   <tbody> rendered from config.hours (today highlighted)
     [data-open-status]             .status-chip — state + text, America/Chicago
     [data-open-short]              short status text (e.g. hero chalkboard)
     [data-open-caveat]             hours caveat text
     body[data-bar-after="#id"]     hide the bottom bar while #id is on screen
     [data-marquee-toggle]          pause/play the closest [data-marquee]
     [data-snap-prev|next="#id"]    scroll a .snap rail
     [data-year]                    current year                                               */
(function () {
  'use strict';
  var d = document, de = d.documentElement, w = window;
  var cfg = w.CD_CONFIG || {};
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return w.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { w.localStorage.setItem(k, v); } catch (e) { /* private mode etc. */ } }
  };
  function safe(fn) { try { fn(); } catch (e) { if (w.console) console.warn('[site]', e); } }

  /* ---------- concept banner ---------- */
  var BANNER_KEY = 'cd-bz-banner-off';
  function setTheme(c) { var m = d.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', c); }
  safe(function () {
    if (de.classList.contains('banner-off')) setTheme('#FFF4DC');
    $$('[data-banner-close]').forEach(function (b) {
      b.addEventListener('click', function () {
        de.classList.add('banner-off'); store.set(BANNER_KEY, '1'); setTheme('#FFF4DC');
        var main = d.getElementById('main'); if (main) { main.setAttribute('tabindex', '-1'); main.focus({ preventScroll: true }); }
      });
    });
  });

  /* ---------- mobile nav ---------- */
  safe(function () {
    var btn = d.querySelector('[data-nav-toggle]'), dr = d.querySelector('[data-nav-drawer]');
    if (!btn || !dr) return;
    function set(open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      dr.classList.toggle('is-open', open); de.classList.toggle('nav-open', open);
      if (open) { dr.removeAttribute('inert'); var f = dr.querySelector('a'); if (f) setTimeout(function () { f.focus(); }, 60); }
      else dr.setAttribute('inert', '');
    }
    set(false);
    btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    dr.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && dr.classList.contains('is-open')) { set(false); btn.focus(); } });
    w.addEventListener('resize', function () { if (w.innerWidth >= 960 && dr.classList.contains('is-open')) set(false); });
  });

  /* ---------- config binding ---------- */
  function pick(path) { return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, cfg); }
  safe(function () {
    var L = cfg.links || {};
    var hrefs = { tel: cfg.phone && 'tel:' + cfg.phone.tel, hub: cfg.hub };
    $$('[data-cfg-href]').forEach(function (a) {
      var k = a.getAttribute('data-cfg-href'), v = hrefs[k] || L[k];
      if (v) a.setAttribute('href', v);
    });
    $$('[data-cfg-src]').forEach(function (el) {
      var v = L[el.getAttribute('data-cfg-src')];
      if (v && el.getAttribute('src') !== v && !el.hasAttribute('data-src')) el.setAttribute('src', v);
      if (v && el.hasAttribute('data-src')) el.setAttribute('data-src', v);
    });
    $$('[data-cfg-text]').forEach(function (el) {
      var v = pick(el.getAttribute('data-cfg-text'));
      if (typeof v === 'string' && v) el.textContent = v;
    });
    $$('a[target="_blank"]').forEach(function (a) { if (!/noopener/.test(a.rel)) a.rel = (a.rel + ' noopener').trim(); });
  });

  /* ---------- hours + open-now (America/Chicago) ---------- */
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function toMin(hm) { var p = hm.split(':'); return (+p[0]) * 60 + (+p[1]); }
  function fmt(min) {
    min = ((min % 1440) + 1440) % 1440;
    var h = Math.floor(min / 60), m = min % 60, ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + (m ? ':' + (m < 10 ? '0' : '') + m : '') + ' ' + ap;
  }
  function nowChicago() {
    var tz = cfg.timeZone || 'America/Chicago';
    try {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
        .formatToParts(new Date());
      var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
      return { day: DAYS.indexOf(o.weekday), min: (+o.hour % 24) * 60 + (+o.minute) };
    } catch (e) { var n = new Date(); return { day: n.getDay(), min: n.getHours() * 60 + n.getMinutes() }; }
  }
  function blocksFor(day) {
    var g = (cfg.hours || []).filter(function (x) { return x.days.indexOf(day) > -1; })[0];
    return g ? g.blocks.map(function (b) { return [toMin(b[0]), toMin(b[1])]; }) : [];
  }
  function status() {
    var n = nowChicago(), today = blocksFor(n.day), C = cfg.statusCopy || {}, soon = cfg.closingSoonMinutes || 45, i, b;
    for (i = 0; i < today.length; i++) {
      b = today[i];
      if (n.min >= b[0] && n.min < b[1]) {
        if (b[1] - n.min <= soon) return { state: 'closing', text: C.closingSoon.replace('{time}', fmt(b[1])), short: 'Last call!', sub: 'closes ' + fmt(b[1]) };
        return { state: 'open', text: C.openNow.replace('{time}', fmt(b[1])), short: 'Open now!', sub: 'till ' + fmt(b[1]) };
      }
    }
    if (today.length && n.min < today[0][0]) return { state: 'closed', text: C.opensLaterToday.replace('{time}', fmt(today[0][0])), short: 'Opens ' + fmt(today[0][0]), sub: 'today' };
    for (i = 0; i < today.length - 1; i++) {
      if (n.min >= today[i][1] && n.min < today[i + 1][0]) return { state: 'between', text: C.betweenServices.replace('{time}', fmt(today[i + 1][0])), short: 'Back ' + fmt(today[i + 1][0]), sub: 'dinner time' };
    }
    for (var k = 1; k <= 7; k++) {
      var dd = (n.day + k) % 7, nb = blocksFor(dd);
      if (nb.length) {
        var when = fmt(nb[0][0]) + (k === 1 ? ' tomorrow' : ' ' + DAYS[dd]);
        return { state: 'closed', text: C.closedNow.replace('{time}', when), short: 'Back ' + fmt(nb[0][0]), sub: k === 1 ? 'tomorrow' : DAYS[dd] };
      }
    }
    return { state: 'closed', text: 'Call us for today’s hours', short: 'Call us', sub: '' };
  }
  function paintStatus() {
    var s = status();
    $$('[data-open-status]').forEach(function (el) {
      el.setAttribute('data-state', s.state);
      var t = el.querySelector('.status-chip__text') || el;
      t.textContent = s.text;
    });
    $$('[data-open-short]').forEach(function (el) { el.textContent = s.short; el.setAttribute('data-state', s.state); });
    $$('[data-open-sub]').forEach(function (el) { el.textContent = s.sub; });
    $$('[data-open-caveat]').forEach(function (el) { el.textContent = (cfg.statusCopy || {}).caveat || ''; });
  }
  function paintHours() {
    var n = nowChicago();
    $$('[data-hours]').forEach(function (tb) {
      var html = '';
      (cfg.hours || []).forEach(function (g) {
        var today = g.days.indexOf(n.day) > -1;
        html += '<tr' + (today ? ' class="is-today"' : '') + '><th scope="row"><abbr title="' + g.long + '">' + g.label + '</abbr></th><td>' +
          g.blocks.map(function (b) { return '<span>' + fmt(toMin(b[0])) + ' – ' + fmt(toMin(b[1])) + '</span>'; }).join('') + '</td></tr>';
      });
      tb.innerHTML = html;
    });
  }
  safe(function () { paintHours(); paintStatus(); setInterval(function () { safe(paintStatus); }, 60000); });

  /* ---------- sticky bottom bar ---------- */
  safe(function () {
    var bar = d.querySelector('.bottom-bar'); if (!bar) return;
    d.body.classList.add('has-bar');
    var sel = d.body.getAttribute('data-bar-after'), t = sel && d.querySelector(sel);
    if (!t || !('IntersectionObserver' in w)) return;
    d.body.classList.add('bar-hidden');
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var past = !e.isIntersecting && e.boundingClientRect.top < 0;
        d.body.classList.toggle('bar-hidden', !past);
      });
    }, { threshold: 0 }).observe(t);
  });

  /* ---------- marquee pause/play (WCAG 2.2.2) ---------- */
  safe(function () {
    $$('[data-marquee-toggle]').forEach(function (b) {
      var host = b.closest('.marquee') || b.parentNode, mq = host.querySelector('[data-marquee]') || host;
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        var paused = !host.classList.contains('m-paused');
        host.classList.toggle('m-paused', paused); mq.classList.toggle('m-paused', paused);
        b.setAttribute('aria-pressed', paused ? 'true' : 'false');
        b.setAttribute('aria-label', paused ? 'Play the dish ticker' : 'Pause the dish ticker');
      });
    });
  });

  /* ---------- snap rails ---------- */
  safe(function () {
    $$('[data-snap-prev],[data-snap-next]').forEach(function (b) {
      var next = b.hasAttribute('data-snap-next'), rail = d.querySelector(b.getAttribute(next ? 'data-snap-next' : 'data-snap-prev'));
      if (!rail) return;
      function step() { var c = rail.firstElementChild; return c ? c.getBoundingClientRect().width + 22 : 300; }
      b.addEventListener('click', function () { rail.scrollBy({ left: next ? step() : -step(), behavior: (w.Motion && w.Motion.reduced) ? 'auto' : 'smooth' }); });
      function upd() {
        var max = rail.scrollWidth - rail.clientWidth - 4;
        b.disabled = next ? rail.scrollLeft >= max : rail.scrollLeft <= 4;
      }
      rail.addEventListener('scroll', function () { w.requestAnimationFrame(upd); }, { passive: true });
      w.addEventListener('resize', upd); upd();
    });
  });

  safe(function () { $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); }); });

  /* ---------- motion kit ---------- */
  safe(function () { if (w.Motion && w.Motion.init) w.Motion.init(); });

  w.CDSite = { status: status, fmt: fmt, nowChicago: nowChicago, store: store };
})();

/* Motion & reels — page-local behaviour
   1) phone-frame reel carousel fed by BOTH manifests (Bazaar may be absent while it is being produced)
   2) in-view autoplay (muted, looped), tap → silent full screen
   3) live kit demos follow the hub's A/B direction switch */
(function () {
  'use strict';
  var d = document;
  var MANIFESTS = ['assets/bazaar-reels/manifest.json', 'assets/royal-reels/manifest.json'];
  var RM = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); };

  function load(url) {
    if (!window.fetch) return Promise.resolve(null);
    return fetch(url, { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  function rank(it) {
    var t = it.tags || [];
    return t.indexOf('reel') > -1 ? 0 : t.indexOf('story-ad') > -1 ? 1 : 2;
  }

  function buildReels(root) {
    var track = root.querySelector('.reels__track');
    Promise.all(MANIFESTS.map(load)).then(function (ms) {
      var seen = {}, items = [];
      ms.forEach(function (m) {
        var list = m && (Array.isArray(m) ? m : m.items); if (!Array.isArray(list)) return;
        list.forEach(function (it, i) {
          if (!it || !it.src || seen[it.id]) return;
          if (String(it.type).toLowerCase() !== 'video') return;
          if (!(+it.h > +it.w)) return;                            // vertical pieces only
          seen[it.id] = 1; it.__i = items.length; items.push(it);
        });
      });
      items.sort(function (a, b) { return rank(a) - rank(b) || a.__i - b.__i; });
      if (!items.length) { root.querySelector('.reels__empty').hidden = false; return; }
      track.innerHTML = items.map(function (it, i) {
        var dir = it.direction === 'bazaar' || it.direction === 'royal' ? it.direction : '';
        var tag = dir === 'bazaar' ? '<span class="dir-tag dir-tag--a">A · Bazaar</span>' : dir === 'royal' ? '<span class="dir-tag dir-tag--b">B · Royal</span>' : '';
        var g = dir === 'bazaar' ? 'linear-gradient(160deg,#FFB000,#FF6A13 50%,#E4147E)' : 'linear-gradient(160deg,#4B1D52,#160B26 60%,#0F4D3F)';
        return '<li class="reel"' + (dir ? ' data-preview="' + dir + '"' : '') + ' data-i="' + i + '">' +
          '<button type="button" class="reel__phone" aria-label="Play ' + esc(it.title) + ' full screen">' +
            '<span class="reel__screen" style="--reel-g:' + g + '">' +
              (it.poster || it.thumb ? '<img src="' + esc(it.thumb || it.poster) + '" alt="" loading="lazy" decoding="async">' : '') +
              '<video muted loop playsinline preload="none" aria-hidden="true" tabindex="-1"' + (it.poster ? ' poster="' + esc(it.poster) + '"' : '') + ' data-src="' + esc(it.src) + '"></video>' +
              '<span class="reel__notch" aria-hidden="true"></span><span class="reel__glare" aria-hidden="true"></span>' +
              '<span class="reel__badge" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg></span>' +
            '</span></button>' +
          '<div class="reel__meta">' + tag + '<p class="reel__title">' + esc(it.title) + '</p>' + (it.caption ? '<p class="reel__cap">' + esc(it.caption) + '</p>' : '') + '</div></li>';
      }).join('');
      wire(root, track, items);
    });
  }

  function wire(root, track, items) {
    var cards = Array.prototype.slice.call(track.querySelectorAll('.reel'));
    function vid(card) { return card.querySelector('video'); }
    function play(card) {
      var v = vid(card);
      if (!v.src) v.src = v.getAttribute('data-src');
      v.muted = true;
      var p = v.play(); if (p && p.then) p.then(function () { card.classList.add('is-playing'); }).catch(function () {});
      else card.classList.add('is-playing');
    }
    function stop(card) { var v = vid(card); if (!v.paused) v.pause(); card.classList.remove('is-playing'); }
    if ('IntersectionObserver' in window && !RM.matches) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting && e.intersectionRatio >= .6) play(e.target); else stop(e.target); });
      }, { threshold: [0, .6, 1] });
      cards.forEach(function (c) { io.observe(c); });
    }
    track.addEventListener('click', function (e) {
      var b = e.target.closest('.reel__phone'); if (!b) return;
      var card = b.closest('.reel'), v = vid(card), it = items[+card.getAttribute('data-i')];
      if (!v.src) v.src = v.getAttribute('data-src');
      v.muted = true; v.loop = true;
      var fallback = function () { if (window.Hub) Hub.openLightbox(items.map(function (x) { return { src: x.src, type: 'video', poster: x.poster, title: x.title, caption: x.caption, alt: x.title, download: x.download }; }), +card.getAttribute('data-i'), b); };
      try {
        if (v.requestFullscreen) { v.play().catch(function () {}); v.requestFullscreen().catch(fallback); }
        else if (v.webkitEnterFullscreen) { v.play().catch(function () {}); v.webkitEnterFullscreen(); }
        else fallback();
      } catch (x) { fallback(); }
    });
    // pause a full-screen video's twin when leaving full screen out of view
    d.addEventListener('fullscreenchange', function () { if (!d.fullscreenElement) cards.forEach(function (c) { var r = c.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) stop(c); }); });
    // prev / next (desktop)
    var prev = root.querySelector('.reels__nav--prev'), next = root.querySelector('.reels__nav--next');
    function step(dir) { var c = cards.filter(function (x) { return x.offsetParent; })[0]; var w = c ? c.getBoundingClientRect().width + 24 : 260; track.scrollBy({ left: dir * w * 2, behavior: RM.matches ? 'auto' : 'smooth' }); }
    function sync() {
      var over = track.scrollWidth > track.clientWidth + 4;
      prev.hidden = next.hidden = !over;
      prev.disabled = track.scrollLeft < 8; next.disabled = track.scrollLeft > track.scrollWidth - track.clientWidth - 8;
    }
    prev.addEventListener('click', function () { step(-1); }); next.addEventListener('click', function () { step(1); });
    track.addEventListener('scroll', sync, { passive: true }); window.addEventListener('resize', sync);
    d.addEventListener('hub:direction', function () { setTimeout(sync, 50); });
    sync();
  }

  /* live demos follow the A/B switch (Both → each demo's own default) */
  function syncDemos() {
    var dir = window.Hub && Hub.getDirection ? Hub.getDirection() : 'both';
    d.querySelectorAll('iframe[data-demo]').forEach(function (f) {
      var theme = dir === 'bazaar' || dir === 'royal' ? dir : f.getAttribute('data-default');
      try { f.contentWindow.postMessage({ type: 'cd-theme', theme: theme }, '*'); } catch (e) { /* not ready */ }
    });
  }

  function boot() {
    var root = d.querySelector('[data-reels]'); if (root) buildReels(root);
    d.querySelectorAll('iframe[data-demo]').forEach(function (f) { f.addEventListener('load', syncDemos); });
    d.addEventListener('hub:direction', syncDemos);
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
})();

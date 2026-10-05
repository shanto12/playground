/* Social kit page · feed-tile lightbox + autoplaying motion posts */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Feed tiles: open the whole 12-tile set (images + looping videos) in the hub lightbox ── */
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-feed-tile]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || !window.Hub || !Hub.openLightbox) return;
    var grid = a.closest('[data-feed-grid]');
    if (!grid) return;
    e.preventDefault();
    var tiles = [].slice.call(grid.querySelectorAll('[data-feed-tile]'));
    var items = tiles.map(function (t) {
      var vid = t.getAttribute('data-type') === 'video';
      return {
        src: t.getAttribute('data-full'),
        type: vid ? 'video' : 'image',
        poster: t.getAttribute('data-poster') || '',
        title: t.getAttribute('data-title') || '',
        alt: t.getAttribute('data-title') || '',
        caption: t.getAttribute('data-caption') || ''
      };
    });
    Hub.openLightbox(items, Math.max(0, tiles.indexOf(a)), a);
  });

  /* ── Motion posts: muted loops that play only while on screen; every one has a pause button ── */
  var vids = [].slice.call(d.querySelectorAll('video[data-loop]'));
  function btnFor(v) { var w = v.closest('.mv'); return w && w.querySelector('.mv__btn'); }
  function syncBtn(v) {
    var b = btnFor(v); if (!b) return;
    var playing = !v.paused;
    b.classList.toggle('is-paused', !playing);
    b.setAttribute('aria-label', playing ? 'Pause this motion post' : 'Play this motion post');
  }
  function tryPlay(v) { var p = v.play(); if (p && p.catch) p.catch(function () { syncBtn(v); }); }
  vids.forEach(function (v) {
    v.muted = true; v.loop = true; v.playsInline = true;
    v.addEventListener('play', function () { syncBtn(v); });
    v.addEventListener('pause', function () { syncBtn(v); });
    v.addEventListener('error', function () { var w = v.closest('.mv'); if (w) w.setAttribute('data-failed', '1'); });
    syncBtn(v);
  });
  d.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.mv__btn');
    if (!b) return;
    var v = b.closest('.mv').querySelector('video');
    if (v.paused) { v.__held = false; tryPlay(v); } else { v.__held = true; v.pause(); }
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) { if (!reduce && !v.__held) tryPlay(v); }
        else if (!v.paused) v.pause();
      });
    }, { threshold: 0.35 });
    vids.forEach(function (v) { io.observe(v); });
  }
})();

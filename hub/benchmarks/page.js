/* Benchmarks page — carousel, live illustrations, steal-list sorting.
   Depends on nothing; hub.js handles nav, reveals and the rest. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.22,1,.36,1)';
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }

  /* ───── Illustrations animate only while on screen ───── */
  var live = $$('[data-live]');
  if (!reduce && 'IntersectionObserver' in window) {
    var lio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('is-live', e.isIntersecting && e.intersectionRatio >= 0.5); });
    }, { threshold: [0, 0.5, 1] });
    live.forEach(function (el) { lio.observe(el); });
  }

  /* ───── Chain-card carousel ───── */
  var car = $('[data-carousel]');
  if (car) {
    var track = $('.cc-track', car);
    var prev = $('[data-cc-prev]', car), next = $('[data-cc-next]', car);
    var countEl = $('[data-cc-count]', car), barEl = $('[data-cc-bar]', car), statusEl = $('[data-cc-status]', car);
    var cards = $$('.cc', track);
    var raf = 0;

    var vis = function () { return cards.filter(function (c) { return !c.hidden; }); };
    var stepPx = function (v) { return v.length > 1 ? v[1].offsetLeft - v[0].offsetLeft : track.clientWidth; };
    var perView = function (v) { var s = stepPx(v); return Math.max(1, Math.floor((track.clientWidth - 24) / s + 0.08)); };
    var indexNow = function (v) {
      var sl = track.scrollLeft, best = 0, bd = Infinity;
      v.forEach(function (c, i) { var dd = Math.abs(c.offsetLeft - v[0].offsetLeft - sl); if (dd < bd) { bd = dd; best = i; } });
      return best;
    };
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };

    var update = function () {
      raf = 0;
      var v = vis(), n = v.length; if (!n) return;
      var max = track.scrollWidth - track.clientWidth, sl = track.scrollLeft;
      var pv = Math.min(perView(v), n), i = indexNow(v);
      if (sl >= max - 4) i = Math.max(0, n - pv);
      var from = i + 1, to = Math.min(n, i + pv);
      countEl.innerHTML = pv > 1 ? '<b>' + pad(from) + '–' + pad(to) + '</b> of ' + n : '<b>' + pad(from) + '</b> / ' + pad(n);
      var p = max > 0 ? sl / max : 1;
      barEl.style.transform = 'scaleX(' + Math.min(1, (pv / n) + p * (1 - pv / n)).toFixed(4) + ')';
      prev.disabled = sl <= 4;
      next.disabled = sl >= max - 4;
    };
    var schedule = function () { if (!raf) raf = requestAnimationFrame(update); };

    var go = function (dir) {
      var v = vis(); if (!v.length) return;
      var pv = perView(v), i = indexNow(v);
      var target = Math.max(0, Math.min(v.length - 1, i + dir * pv));
      track.scrollTo({ left: v[target].offsetLeft - v[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
    };
    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });
    track.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      else if (e.key === 'Home') { e.preventDefault(); track.scrollTo({ left: 0, behavior: reduce ? 'auto' : 'smooth' }); }
      else if (e.key === 'End') { e.preventDefault(); track.scrollTo({ left: track.scrollWidth, behavior: reduce ? 'auto' : 'smooth' }); }
    });

    /* mouse drag (touch & trackpads scroll natively) */
    var down = false, moved = false, sx = 0, ss = 0;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; sx = e.clientX; ss = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add('is-drag'); }
      if (moved) track.scrollLeft = ss - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return; down = false;
      if (!moved) return;
      var v = vis(), i = indexNow(v);
      track.classList.remove('is-drag');
      track.scrollTo({ left: v[i].offsetLeft - v[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
      setTimeout(function () { moved = false; }, 0);
    });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });

    /* filters */
    var chips = $$('[data-cc-filter]', car);
    var label = function (v) { v.forEach(function (c, i) { c.setAttribute('aria-label', (i + 1) + ' of ' + v.length + ': ' + c.getAttribute('data-name')); }); };
    chips.forEach(function (ch) {
      ch.addEventListener('click', function () {
        var f = ch.getAttribute('data-cc-filter');
        chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === ch)); });
        cards.forEach(function (c) {
          var ok = f === 'all' || (f === 'indian' ? c.getAttribute('data-group') === 'indian'
            : (' ' + c.getAttribute('data-cats') + ' ').indexOf(' ' + f + ' ') > -1);
          c.hidden = !ok;
        });
        var v = vis(); label(v);
        track.scrollLeft = 0; update();
        statusEl.textContent = 'Showing ' + v.length + ' ' + (v.length === 1 ? 'brand' : 'brands') + (f === 'all' ? '' : ': ' + ch.getAttribute('data-label'));
        if (!reduce && v[0] && v[0].animate) {
          v.slice(0, 4).forEach(function (c, i) {
            c.animate([{ opacity: 0, transform: 'translateX(28px)' }, { opacity: 1, transform: 'none' }],
              { duration: 520, delay: i * 70, easing: EASE, fill: 'backwards' });
          });
        }
      });
    });
    label(vis());
    update();
    setTimeout(update, 400); /* after fonts settle */
  }

  /* ───── Steal list: re-sort with a FLIP glide ───── */
  var grid = $('[data-steal-grid]');
  var sortBtns = $$('[data-sort]');
  if (grid && sortBtns.length) {
    var sorters = {
      rank: function (a, b) { return a.rank - b.rank; },
      cost: function (a, b) { return (a.cost - b.cost) || (a.costMax - b.costMax) || (b.impact - a.impact) || (a.rank - b.rank); },
      impact: function (a, b) { return (b.impact - a.impact) || (a.cost - b.cost) || (a.rank - b.rank); }
    };
    sortBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.getAttribute('data-sort');
        sortBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        var items = $$('.steal', grid).map(function (el) {
          return { el: el, rect: el.getBoundingClientRect(), rank: +el.getAttribute('data-rank'), cost: +el.getAttribute('data-cost'),
            costMax: +el.getAttribute('data-cost-max'), impact: +el.getAttribute('data-impact') };
        });
        items.sort(sorters[mode] || sorters.rank);
        items.forEach(function (it) { grid.appendChild(it.el); it.el.classList.add('is-in'); });
        if (reduce || !grid.animate) return;
        items.forEach(function (it) {
          var r = it.el.getBoundingClientRect(), dx = it.rect.left - r.left, dy = it.rect.top - r.top;
          if (Math.abs(dx) + Math.abs(dy) < 1) return;
          it.el.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 560, easing: EASE });
        });
      });
    });
  }
})();

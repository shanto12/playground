/* Curry District · Pitch Hub — /audit/ page script
   - Top-10 quick-wins checklist: state saved per device in localStorage (wrapped in try/catch)
   - "Copy the list" button (plain-text checklist for WhatsApp / email)
   - Small marigold-petal burst on tick (skipped for prefers-reduced-motion)
   Depends on nothing; uses window.Hub.toast if hub.js is present. */
(function () {
  'use strict';
  var KEY = 'cd-audit-wins-v1';
  var d = document;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PETALS = ['#FFB000', '#FF6A13', '#E4147E', '#F7D98A', '#00A8A0'];

  function load() {
    try { var v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; }
    catch (e) { return []; }
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* private mode / blocked storage: state just won't persist */ }
  }
  function toast(msg) { if (window.Hub && Hub.toast) Hub.toast(msg); }

  function burst(host, x, y, n) {
    if (reduce || !host) return;
    for (var i = 0; i < n; i++) {
      var p = d.createElement('span');
      var a = (Math.PI * 2 * i) / n + Math.random() * 0.6;
      var r = 34 + Math.random() * 38;
      p.className = 'au-petal';
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.setProperty('--dx', Math.round(Math.cos(a) * r) + 'px');
      p.style.setProperty('--dy', Math.round(Math.sin(a) * r - 10) + 'px');
      p.style.setProperty('--rot', Math.round(Math.random() * 360 - 180) + 'deg');
      p.style.setProperty('--c', PETALS[i % PETALS.length]);
      host.appendChild(p);
      setTimeout(function (el) { return function () { if (el.parentNode) el.parentNode.removeChild(el); }; }(p), 1100);
    }
  }

  function init() {
    var root = d.querySelector('[data-wins]');
    if (!root) return;
    var boxes = Array.prototype.slice.call(root.querySelectorAll('.au-win input[type="checkbox"]'));
    var total = boxes.length;
    var doneEl = root.querySelector('[data-wins-done]');
    var fill = root.querySelector('[data-wins-fill]');
    var reset = root.querySelector('[data-wins-reset]');
    var copyBtn = d.querySelector('[data-wins-copy]');
    var saved = load();

    boxes.forEach(function (b) { b.checked = saved.indexOf(b.value) > -1; });

    function render() {
      var on = boxes.filter(function (b) { return b.checked; });
      boxes.forEach(function (b) { var l = b.closest('.au-win'); if (l) l.classList.toggle('is-done', b.checked); });
      if (doneEl) doneEl.textContent = on.length;
      if (fill) fill.style.setProperty('--p', (on.length / total).toFixed(3));
      if (reset) reset.hidden = on.length === 0;
      root.classList.toggle('is-complete', on.length === total);
      return on.length;
    }
    function persist() { save(boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.value; })); }

    render();

    root.addEventListener('change', function (e) {
      var b = e.target;
      if (!b || b.type !== 'checkbox') return;
      var n = render();
      persist();
      if (b.checked) {
        var label = b.closest('.au-win');
        burst(label, 30, 32, 7);
        if (n === total) {
          var bar = root.querySelector('.au-wins__bar');
          if (bar) burst(bar, bar.offsetWidth / 2, bar.offsetHeight / 2, 18);
          toast('Shabash! All ten ticked — the District is glowing.');
        }
      }
    });

    if (reset) reset.addEventListener('click', function () {
      boxes.forEach(function (b) { b.checked = false; });
      render(); persist();
      toast('Checklist cleared');
    });

    if (copyBtn) copyBtn.addEventListener('click', function () {
      var lines = ['Curry District — top 10 quick wins'];
      boxes.forEach(function (b, i) {
        var l = b.closest('.au-win');
        var t = l.querySelector('.au-win__title').cloneNode(true);
        var n = t.querySelector('.au-win__n'); if (n) n.remove();
        var desc = l.querySelector('.au-win__desc').textContent.trim();
        lines.push((b.checked ? '[x] ' : '[ ] ') + (i + 1) + '. ' + t.textContent.trim() + ': ' + desc);
      });
      var text = lines.join('\n');
      var ok = function () { toast('List copied, ready to paste'); };
      var fail = function () { toast('Copy not available here'); };
      try {
        if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(ok, legacy); }
        else legacy();
      } catch (e) { legacy(); }
      function legacy() {
        try {
          var ta = d.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', '');
          ta.style.position = 'fixed'; ta.style.opacity = '0'; d.body.appendChild(ta); ta.select();
          var r = d.execCommand('copy'); d.body.removeChild(ta); (r ? ok : fail)();
        } catch (e) { fail(); }
      }
    });
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})();

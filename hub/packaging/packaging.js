/* Packaging page · touchpoint filter, spin viewer mount, checklist. Needs hub.js (Hub) and viewer/spin.js (CDSpin). */
(function () {
  'use strict';
  var d = document;
  var RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* touchpoint -> how to recognise its pieces in the manifests (id + title + tags) */
  var CUP = /\b(cup|cups|chai|lassi|tray|trays|lunchbox|lunch|carton|half-pan|party)\b/;
  var TP = {
    container: { label: 'Containers', re: /\b(pail|clamshell|clam|tub|handi|container|containers|deli|takeout-box)\b|\bbox\b/, not: CUP },
    lid:       { label: 'Lid stickers', re: /\b(lid|label|labels|medallion|spice)\b/ },
    bag:       { label: 'Bags', re: /\b(bag|bags)\b/ },
    seal:      { label: 'Seals', re: /\b(seal|seals|tamper-evident|tape|stickers)\b/ },
    napkin:    { label: 'Napkins', re: /\b(napkin|napkins|tableware|cutlery)\b/ },
    stuffer:   { label: 'Stuffer cards', re: /\b(insert|stuffer|qr|review)\b/ },
    sauce:     { label: 'Sauce packets', re: /\b(sauce|sauces|packets|packet|chutney)\b/ },
    cup:       { label: 'Cups & trays', re: CUP }
  };

  function hay(it) { return (it.id + ' ' + it.title + ' ' + it.tags.join(' ')).toLowerCase(); }
  function matches(it, key) {
    var t = TP[key], h = hay(it);
    return t.re.test(h) && !(t.not && t.not.test(h));
  }
  function dirOK(it) {
    var g = (window.Hub && window.Hub.getDirection) ? window.Hub.getDirection() : 'both';
    return g === 'both' || it.direction === 'both' || it.direction === g;
  }

  function initTouchpoints() {
    var root = d.querySelector('[data-gallery]');
    var btns = [].slice.call(d.querySelectorAll('.pk-tp__btn'));
    var bar = d.getElementById('pk-filterbar'), txt = bar && bar.querySelector('.pk-filterbar__txt');
    if (!root || !btns.length) return;
    var active = null, set = null, stored = [];

    function indexSets() {
      var items = root.__mgItems || [], out = {};
      Object.keys(TP).forEach(function (k) {
        out[k] = []; items.forEach(function (it, i) { if (dirOK(it) && it.type !== 'interactive' && matches(it, k)) out[k].push(i); });
      });
      return out;
    }
    function paint() {
      var sets = indexSets();
      btns.forEach(function (b) {
        var k = b.getAttribute('data-tp'), n = sets[k].length, c = b.querySelector('[data-pk-count]');
        c.textContent = n ? n + (n === 1 ? ' piece' : ' pieces') : 'Drawing now';
        b.setAttribute('aria-disabled', String(!n));
        b.setAttribute('aria-pressed', String(active === k));
      });
      if (active) {
        var cur = sets[active]; set = {}; cur.forEach(function (i) { set[i] = 1; });
        [].forEach.call(root.querySelectorAll('.mg__item'), function (a) {
          a.setAttribute('data-pk-hide', set[+a.getAttribute('data-mg-i')] ? '0' : '1');
        });
        txt.innerHTML = 'Showing <b>' + TP[active].label + '</b> · ' + cur.length + (cur.length === 1 ? ' piece' : ' pieces');
      }
    }
    function setActive(k) {
      active = k; root.classList.toggle('pk-filtering', !!k); bar.hidden = !k;
      if (!k) { set = null; [].forEach.call(root.querySelectorAll('.mg__item'), function (a) { a.removeAttribute('data-pk-hide'); }); }
      paint();
    }

    /* keep the lightbox swipe-set in step with the filter: wrap the gallery's own visible-list */
    function hookVisible() {
      stored = root.__mgVisible || [];
      try {
        Object.defineProperty(root, '__mgVisible', {
          configurable: true,
          get: function () { return set ? stored.filter(function (i) { return set[i]; }) : stored; },
          set: function (v) { stored = v; }
        });
      } catch (e) { /* non-critical */ }
    }

    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-tp');
        if (b.getAttribute('aria-disabled') === 'true') { if (window.Hub && Hub.toast) Hub.toast('Those pieces are still being drawn. Check back soon.'); return; }
        setActive(active === k ? null : k);
        if (active) d.getElementById('gallery').scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
      });
    });
    var clr = d.querySelector('[data-pk-clear]'); if (clr) clr.addEventListener('click', function () { setActive(null); });

    d.addEventListener('hub:direction', function () { setTimeout(function () { paint(); }, 0); });
    d.addEventListener('click', function (e) { if (e.target.closest('[data-mg-tag],[data-mg-dir]') && active) setTimeout(paint, 0); });

    /* wait for the manifest gallery to render */
    var tries = 0;
    (function wait() {
      if (root.__mgItems && root.querySelector('.mg__item') || root.classList.contains('mg--empty')) { hookVisible(); paint(); return; }
      if (tries++ < 80) setTimeout(wait, 150); else paint();
    })();
  }

  function initViewer() {
    var el = d.getElementById('spin-viewer');
    if (el && window.CDSpin) CDSpin.mount(el, { base: '', initial: 'bag' });
  }

  function initNeed() {
    var list = d.getElementById('pk-need-list'); if (!list) return;
    var KEY = 'cd-pk-need', saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { saved = {}; }
    var boxes = [].slice.call(list.querySelectorAll('input[data-need]'));
    boxes.forEach(function (b) {
      b.checked = !!saved[b.getAttribute('data-need')];
      b.addEventListener('change', function () {
        saved[b.getAttribute('data-need')] = b.checked;
        try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) { /* storage blocked */ }
      });
    });
    var copy = d.getElementById('pk-copy');
    if (copy) copy.setAttribute('data-copy', 'Curry District packaging: what we need from you\n' +
      boxes.map(function (b, i) { return (i + 1) + '. ' + b.parentNode.querySelector('span').textContent; }).join('\n'));
  }

  function boot() { initTouchpoints(); initViewer(); initNeed(); }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
})();

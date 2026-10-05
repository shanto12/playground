/* Merch & uniforms — live "try the colour" recolour. Art comes from live-art.js (window.MERCH_LIVE);
   its fills are CSS variables --mk-base (fabric), --mk-trim (straps), --mk-ink (one-colour print). */
(function () {
  'use strict';
  var PAL = {
    bazaar: {
      base: [['Indigo', '#211552'], ['Cream', '#FFF4DC'], ['Marigold', '#FFB000'], ['Saffron', '#FF6A13'], ['Rani pink', '#D3166F'], ['Peacock', '#00A8A0'], ['Chili', '#C81D35']],
      ink: [['Cream', '#FFF4DC'], ['Indigo', '#1D1147'], ['Marigold', '#FFB000'], ['Rani pink', '#E4147E']],
      trim: [['Marigold', '#FFB000'], ['Indigo', '#1D1147'], ['Rani pink', '#E4147E'], ['Peacock', '#00A8A0']],
      start: { apron: [0, 0, 0], tee: [6, 0, 0], tote: [1, 1, 1] }
    },
    royal: {
      base: [['Midnight', '#1D1030'], ['Plum', '#4B1D52'], ['Emerald', '#0F4D3F'], ['Ruby', '#A3173F'], ['Peacock', '#117C86'], ['Ivory', '#FBF3E4'], ['Blush', '#F4C9BB']],
      ink: [['Saffron gold', '#E9A63A'], ['Ivory', '#FBF3E4'], ['Midnight', '#160B26'], ['Ruby', '#A3173F']],
      trim: [['Cognac', '#8A5326'], ['Gold', '#E9A63A'], ['Midnight', '#160B26'], ['Ivory', '#FBF3E4']],
      start: { apron: [0, 0, 0], tee: [5, 3, 0], tote: [2, 0, 0] }
    }
  };
  var NAMES = { apron: 'apron', tee: 'tee', tote: 'tote' };
  var st = { pal: 'bazaar', item: 'apron', base: 0, ink: 0, trim: 0 };
  var art, stage, read, con, fsTrim;

  function hex2rgb(h) { h = h.replace('#', ''); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }
  function lum(h) { var c = hex2rgb(h).map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }

  function swatches(el, list, key) {
    el.innerHTML = list.map(function (s, i) {
      return '<button type="button" class="sw__b" data-k="' + key + '" data-i="' + i + '" data-name="' + s[0] + '" aria-label="' + s[0] + '" aria-pressed="' + (st[key] === i) + '" style="--c:' + s[1] + '"><span></span></button>';
    }).join('');
  }
  function renderArt() {
    var src = window.MERCH_LIVE && window.MERCH_LIVE[st.pal] && window.MERCH_LIVE[st.pal][st.item];
    if (!src) { art.textContent = 'Preview unavailable.'; return; }
    art.innerHTML = src;
    stage.setAttribute('data-theme', st.pal);
    fsTrim.hidden = st.item === 'tee';
    apply();
  }
  function apply() {
    var P = PAL[st.pal], b = P.base[st.base], k = P.ink[st.ink], t = P.trim[st.trim];
    var svg = art.querySelector('svg'); if (!svg) return;
    svg.style.setProperty('--mk-base', b[1]); svg.style.setProperty('--mk-ink', k[1]); svg.style.setProperty('--mk-trim', t[1]);
    ['base', 'ink', 'trim'].forEach(function (key) {
      document.querySelectorAll('.sw__b[data-k="' + key + '"]').forEach(function (btn) { btn.setAttribute('aria-pressed', String(+btn.getAttribute('data-i') === st[key])); });
    });
    read.textContent = b[0] + ' ' + NAMES[st.item] + ' · ' + k[0].toLowerCase() + ' print' + (st.item === 'tee' ? '' : ' · ' + t[0].toLowerCase() + ' straps');
    var c = ratio(b[1], k[1]);
    con.innerHTML = 'Print contrast <b>' + c.toFixed(1) + ':1</b> — ' + (c >= 4.5 ? '<span class="ok">reads from across the room.</span>' : c >= 2.5 ? '<span class="warn">fine for a big logo, too soft for small text.</span>' : '<span class="warn">too low. Try a lighter or darker ink.</span>');
    art.setAttribute('aria-label', 'Live preview: ' + read.textContent);
  }
  function setPal(p) {
    if (!PAL[p]) return; st.pal = p;
    var s = PAL[p].start[st.item]; st.base = s[0]; st.ink = s[1]; st.trim = s[2];
    document.querySelectorAll('#tryPal [data-pal]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-pal') === p)); });
    swatches(document.getElementById('swBase'), PAL[p].base, 'base');
    swatches(document.getElementById('swInk'), PAL[p].ink, 'ink');
    swatches(document.getElementById('swTrim'), PAL[p].trim, 'trim');
    renderArt();
  }
  function init() {
    art = document.getElementById('tryArt'); if (!art) return;
    stage = document.getElementById('tryStage'); read = document.getElementById('tryRead'); con = document.getElementById('tryContrast'); fsTrim = document.getElementById('fsTrim');
    var root = document.getElementById('tryon');
    root.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-pal')) { setPal(b.getAttribute('data-pal')); return; }
      if (b.hasAttribute('data-item')) {
        st.item = b.getAttribute('data-item');
        var s = PAL[st.pal].start[st.item]; st.base = s[0]; st.ink = s[1]; st.trim = s[2];
        document.querySelectorAll('#tryItem [data-item]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        renderArt(); return;
      }
      if (b.hasAttribute('data-k')) { st[b.getAttribute('data-k')] = +b.getAttribute('data-i'); apply(); }
    });
    var g = window.Hub && Hub.getDirection ? Hub.getDirection() : 'both';
    setPal(g === 'royal' ? 'royal' : 'bazaar');
    document.addEventListener('hub:direction', function (e) { var d = e.detail && e.detail.dir; if ((d === 'bazaar' || d === 'royal') && d !== st.pal) setPal(d); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

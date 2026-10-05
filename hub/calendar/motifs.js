/* Curry District · festival motif library (SVG strings). Shared by the asset renderer (_build) and the page.
   Two drawing styles: 'bz' (Bazaar: flat fills, thick indigo outlines, sticker energy)
                       'ry' (Royal: saffron-gold foil, hairlines, glow).
   Cultural guardrails: generic string lights, lanterns, marigolds, rangoli-style geometry, kites, colour powder,
   8-point geometric stars. No deity imagery, no sacred symbols, no flags. */
(function (root) {
  'use strict';
  var BZ = { ink: '#1D1147', cream: '#FFF4DC', marigold: '#FFB000', saffron: '#FF6A13', rani: '#E4147E', chili: '#D62839', peacock: '#00A8A0', cilantro: '#3FA34D', violet: '#7B5CFF', white: '#FFFFFF', sand: '#FFE7B8', night: '#3A1B7A' };
  var RY = { ink: '#160B26', plum: '#4B1D52', emerald: '#0F4D3F', peacock: '#117C86', ruby: '#A3173F', gold: '#E9A63A', goldLt: '#F7D98A', goldDk: '#B7791F', ivory: '#FBF3E4', blush: '#F4C9BB' };
  var PI = Math.PI;
  function f(n) { return Math.round(n * 10) / 10; }
  function rng(seed) { var s = (seed >>> 0) || 7; return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
  function attrs(o) { var s = ''; for (var k in o) if (o[k] != null && o[k] !== false) s += ' ' + k + '="' + o[k] + '"'; return s; }
  function G(tr, inner, extra) { return '<g' + (tr ? ' transform="' + tr + '"' : '') + (extra || '') + '>' + inner + '</g>'; }
  function isRy(o) { return o && o.style === 'ry'; }
  function hexId(c) { return String(c).replace('#', ''); }

  /* ───── shared <defs>: foil, warm glows, coloured glows, soft blur ───── */
  var GLOW_COLORS = ['#FFB000', '#E4147E', '#00A8A0', '#FF6A13', '#FFF4DC', '#7B5CFF', '#F7D98A', '#E9A63A', '#3FA34D', '#D62839'];
  function defs() {
    var g = '<linearGradient id="cdFoil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B7791F"/><stop offset=".38" stop-color="#F7D98A"/><stop offset=".58" stop-color="#E9A63A"/><stop offset="1" stop-color="#B7791F"/></linearGradient>' +
      '<linearGradient id="cdFoilV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7D98A"/><stop offset=".55" stop-color="#E9A63A"/><stop offset="1" stop-color="#B7791F"/></linearGradient>' +
      '<radialGradient id="cdWarm"><stop offset="0" stop-color="#FFF1C4" stop-opacity=".95"/><stop offset=".3" stop-color="#F7D98A" stop-opacity=".55"/><stop offset="1" stop-color="#E9A63A" stop-opacity="0"/></radialGradient>' +
      '<filter id="cdPowder" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>' +
      '<filter id="cdSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>';
    GLOW_COLORS.forEach(function (c) {
      g += '<radialGradient id="cdG' + hexId(c) + '"><stop offset="0" stop-color="' + c + '" stop-opacity=".75"/><stop offset=".4" stop-color="' + c + '" stop-opacity=".28"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>';
    });
    return '<defs>' + g + '</defs>';
  }
  function glowFill(c) { return GLOW_COLORS.indexOf(c) > -1 ? 'url(#cdG' + hexId(c) + ')' : 'url(#cdWarm)'; }

  /* ───── primitives ───── */
  function scallopPath(cx, cy, r, n, bulge, rot) {
    var d = '', rr = r * Math.sin(PI / n) * (bulge || 1.15), a0 = (rot || 0) - PI / 2;
    for (var i = 0; i <= n; i++) {
      var a = a0 + i * 2 * PI / n, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
      d += (i ? 'A' + f(rr) + ' ' + f(rr) + ' 0 0 1 ' : 'M') + f(x) + ' ' + f(y);
    }
    return d + 'Z';
  }
  function petal(r0, r1, w, ang) { /* pointed petal along angle ang from r0 to r1 */
    var m = (r0 + r1) / 2;
    var d = 'M' + f(r0) + ' 0Q' + f(m) + ' ' + f(-w) + ' ' + f(r1) + ' 0Q' + f(m) + ' ' + f(w) + ' ' + f(r0) + ' 0Z';
    return '<path d="' + d + '" transform="rotate(' + f(ang) + ')"/>';
  }
  function quad(x1, y1, cx, cy, x2, y2, t) {
    var u = 1 - t; return [u * u * x1 + 2 * u * t * cx + t * t * x2, u * u * y1 + 2 * u * t * cy + t * t * y2];
  }
  function quadPoints(x1, y1, x2, y2, sag, step) {
    var cx = (x1 + x2) / 2, cy = (y1 + y2) / 2 + sag * 2, pts = [], len = 0, prev = [x1, y1], samples = [];
    for (var i = 0; i <= 200; i++) { var p = quad(x1, y1, cx, cy, x2, y2, i / 200); len += Math.hypot(p[0] - prev[0], p[1] - prev[1]); samples.push([p[0], p[1], len]); prev = p; }
    var n = Math.max(1, Math.round(len / step)), k = 0;
    for (var j = 0; j <= n; j++) { var target = j * len / n; while (k < samples.length - 1 && samples[k][2] < target) k++; pts.push([samples[k][0], samples[k][1]]); }
    return { pts: pts, d: 'M' + f(x1) + ' ' + f(y1) + 'Q' + f(cx) + ' ' + f(cy) + ' ' + f(x2) + ' ' + f(y2) };
  }

  /* ───── Marigold (genda) head ───── */
  function marigold(cx, cy, r, o) {
    o = o || {};
    if (isRy(o)) {
      return G('', '<path d="' + scallopPath(cx, cy, r, 14, 1.2) + '" fill="' + (o.c1 || 'url(#cdFoil)') + '" stroke="#8C5A16" stroke-width="' + f(Math.max(.6, r * .04)) + '"/>' +
        '<path d="' + scallopPath(cx, cy, r * .68, 11, 1.2, .2) + '" fill="' + (o.c2 || '#E9A63A') + '" stroke="#8C5A16" stroke-width="' + f(Math.max(.5, r * .03)) + '"/>' +
        '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r * .3) + '" fill="#B7791F"/><circle cx="' + f(cx - r * .08) + '" cy="' + f(cy - r * .1) + '" r="' + f(r * .1) + '" fill="#F7D98A" opacity=".8"/>');
    }
    var sw = o.sw != null ? o.sw : Math.max(1.6, r * .14);
    return G('', '<path d="' + scallopPath(cx, cy, r, 14, 1.2) + '" fill="' + (o.c1 || BZ.saffron) + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw) + '" stroke-linejoin="round"/>' +
      '<path d="' + scallopPath(cx, cy, r * .66, 11, 1.2, .2) + '" fill="' + (o.c2 || BZ.marigold) + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw * .6) + '" stroke-linejoin="round"/>' +
      '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r * .26) + '" fill="' + (o.c3 || BZ.saffron) + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw * .5) + '"/>');
  }

  /* garland swag of marigolds between two points (toran) */
  function garland(x1, y1, x2, y2, sag, r, o) {
    o = o || {};
    var q = quadPoints(x1, y1, x2, y2, sag, r * 1.62), out = '';
    var thread = isRy(o) ? '<path d="' + q.d + '" fill="none" stroke="#B7791F" stroke-width="1.4"/>' : '<path d="' + q.d + '" fill="none" stroke="' + BZ.ink + '" stroke-width="' + f(r * .16) + '" stroke-linecap="round"/>';
    var bzSets = o.colors || [[BZ.saffron, BZ.marigold, BZ.saffron], [BZ.marigold, BZ.saffron, BZ.marigold]];
    q.pts.forEach(function (p, i) {
      if (isRy(o)) out += marigold(p[0], p[1], r * (i % 3 === 1 ? .82 : 1), { style: 'ry', c1: i % 2 ? '#E9A63A' : null });
      else { var c = bzSets[i % bzSets.length]; out += marigold(p[0], p[1], r * (i % 3 === 1 ? .84 : 1), { c1: c[0], c2: c[1], c3: c[2] }); }
    });
    return thread + out;
  }
  /* vertical hanging strand (lari) ending in a tassel */
  function strand(x, y, len, r, o) {
    o = o || {};
    var out = '', n = Math.max(1, Math.floor((len - r) / (r * 1.62)));
    var line = isRy(o) ? '<line x1="' + f(x) + '" y1="' + f(y) + '" x2="' + f(x) + '" y2="' + f(y + len) + '" stroke="#B7791F" stroke-width="1.2"/>' : '<line x1="' + f(x) + '" y1="' + f(y) + '" x2="' + f(x) + '" y2="' + f(y + len) + '" stroke="' + BZ.ink + '" stroke-width="' + f(r * .16) + '"/>';
    for (var i = 0; i < n; i++) {
      var cy = y + r + i * r * 1.62;
      if (isRy(o)) out += marigold(x, cy, r * (i % 2 ? .85 : 1), { style: 'ry' });
      else out += marigold(x, cy, r * (i % 2 ? .85 : 1), i % 2 ? { c1: BZ.marigold, c2: BZ.saffron, c3: BZ.marigold } : {});
    }
    var ty = y + len;
    out += tassel(x, ty, r * 1.1, o);
    return line + out;
  }
  function tassel(x, y, s, o) {
    if (isRy(o)) return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(s * .32) + '" fill="url(#cdFoil)"/><path d="M' + f(x - s * .28) + ' ' + f(y + s * .2) + 'L' + f(x + s * .28) + ' ' + f(y + s * .2) + 'L' + f(x + s * .45) + ' ' + f(y + s * 1.3) + 'L' + f(x - s * .45) + ' ' + f(y + s * 1.3) + 'Z" fill="#A3173F" stroke="#E9A63A" stroke-width=".8"/>';
    return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(s * .34) + '" fill="' + BZ.peacock + '" stroke="' + BZ.ink + '" stroke-width="' + f(s * .12) + '"/>' +
      '<path d="M' + f(x - s * .26) + ' ' + f(y + s * .26) + 'L' + f(x + s * .26) + ' ' + f(y + s * .26) + 'L' + f(x + s * .46) + ' ' + f(y + s * 1.25) + 'L' + f(x - s * .46) + ' ' + f(y + s * 1.25) + 'Z" fill="' + BZ.rani + '" stroke="' + BZ.ink + '" stroke-width="' + f(s * .12) + '" stroke-linejoin="round"/>';
  }

  /* ───── String lights ───── */
  function stringLights(x1, y1, x2, y2, sag, n, s, o) {
    o = o || {};
    var q = quadPoints(x1, y1, x2, y2, sag, 10), pts = q.pts, glows = '', bulbs = '';
    var cols = o.colors || (isRy(o) ? ['#F7D98A'] : [BZ.marigold, BZ.rani, BZ.peacock, BZ.saffron, BZ.cream]);
    for (var i = 0; i < n; i++) {
      var p = pts[Math.round((i + .5) / n * (pts.length - 1))], c = cols[i % cols.length], x = p[0], y = p[1] + s * .2;
      var gr = s * (isRy(o) ? 4.2 : 3.4);
      glows += '<circle cx="' + f(x) + '" cy="' + f(y + s * 1.1) + '" r="' + f(gr) + '" fill="' + (isRy(o) ? 'url(#cdWarm)' : glowFill(c)) + '"/>';
      var bulb = 'M' + f(-s * .55) + ' 0C' + f(-s * .98) + ' ' + f(s * .62) + ' ' + f(-s * .78) + ' ' + f(s * 1.5) + ' 0 ' + f(s * 1.95) + 'C' + f(s * .78) + ' ' + f(s * 1.5) + ' ' + f(s * .98) + ' ' + f(s * .62) + ' ' + f(s * .55) + ' 0Z';
      var tilt = ((i % 3) - 1) * 8;
      if (isRy(o)) {
        bulbs += G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + tilt + ')', '<rect x="' + f(-s * .42) + '" y="' + f(-s * .55) + '" width="' + f(s * .84) + '" height="' + f(s * .62) + '" rx="1.5" fill="url(#cdFoil)"/><path d="' + bulb + '" fill="' + c + '"/><path d="' + bulb + '" fill="#FFFBEA" transform="scale(.55) translate(0 ' + f(s * .5) + ')" opacity=".85"/>');
      } else {
        bulbs += G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + tilt + ')', '<rect x="' + f(-s * .45) + '" y="' + f(-s * .58) + '" width="' + f(s * .9) + '" height="' + f(s * .66) + '" rx="2" fill="' + BZ.ink + '"/><path d="' + bulb + '" fill="' + c + '" stroke="' + BZ.ink + '" stroke-width="' + f(s * .2) + '" stroke-linejoin="round"/><path d="M' + f(-s * .32) + ' ' + f(s * .45) + 'Q' + f(-s * .46) + ' ' + f(s * .95) + ' ' + f(-s * .2) + ' ' + f(s * 1.35) + '" fill="none" stroke="#fff" stroke-width="' + f(s * .16) + '" stroke-linecap="round" opacity=".85"/>');
      }
    }
    var wire = '<path d="' + q.d + '" fill="none" stroke="' + (isRy(o) ? '#B7791F' : BZ.ink) + '" stroke-width="' + (isRy(o) ? 1.4 : f(s * .2)) + '" stroke-linecap="round"/>';
    return glows + wire + bulbs;
  }

  /* ───── Hanging paper lantern (geometric) ───── */
  function lantern(x, y, len, s, o) {
    o = o || {};
    var c = o.color || (isRy(o) ? '#A3173F' : BZ.rani), w = s, h = s * 1.45, top = y + len;
    var body = [[-w * .3, 0], [w * .3, 0], [w * .5, h * .3], [w * .5, h * .7], [w * .3, h], [-w * .3, h], [-w * .5, h * .7], [-w * .5, h * .3]].map(function (p) { return f(p[0]) + ',' + f(p[1]); }).join(' ');
    var inner = '';
    if (isRy(o)) {
      inner = '<circle cx="0" cy="' + f(h * .5) + '" r="' + f(s * 1.5) + '" fill="url(#cdWarm)" opacity=".8"/>' +
        '<polygon points="' + body + '" fill="' + c + '" fill-opacity=".9" stroke="url(#cdFoil)" stroke-width="1.6"/>' +
        '<path d="M0 0V' + f(h) + 'M' + f(-w * .18) + ' 0L' + f(-w * .3) + ' ' + f(h * .5) + 'L' + f(-w * .18) + ' ' + f(h) + 'M' + f(w * .18) + ' 0L' + f(w * .3) + ' ' + f(h * .5) + 'L' + f(w * .18) + ' ' + f(h) + '" fill="none" stroke="#F7D98A" stroke-width="1" opacity=".75"/>' +
        '<ellipse cx="0" cy="' + f(h * .5) + '" rx="' + f(w * .18) + '" ry="' + f(h * .22) + '" fill="#FFF1C4" opacity=".55"/>' +
        '<rect x="' + f(-w * .34) + '" y="' + f(-s * .16) + '" width="' + f(w * .68) + '" height="' + f(s * .18) + '" rx="2" fill="url(#cdFoil)"/>' +
        '<rect x="' + f(-w * .34) + '" y="' + f(h - s * .02) + '" width="' + f(w * .68) + '" height="' + f(s * .16) + '" rx="2" fill="url(#cdFoil)"/>' +
        tassel(0, h + s * .26, s * .5, o);
      return '<line x1="' + f(x) + '" y1="' + f(y) + '" x2="' + f(x) + '" y2="' + f(top) + '" stroke="#B7791F" stroke-width="1.2"/>' + G('translate(' + f(x) + ' ' + f(top) + ')', inner);
    }
    var sw = Math.max(2, s * .085);
    inner = '<circle cx="0" cy="' + f(h * .5) + '" r="' + f(s * 1.35) + '" fill="' + glowFill(o.glow || BZ.marigold) + '"/>' +
      '<polygon points="' + body + '" fill="' + c + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw) + '" stroke-linejoin="round"/>' +
      '<path d="M0 ' + f(h * .06) + 'V' + f(h * .94) + 'M' + f(-w * .2) + ' ' + f(h * .04) + 'L' + f(-w * .31) + ' ' + f(h * .5) + 'L' + f(-w * .2) + ' ' + f(h * .96) + 'M' + f(w * .2) + ' ' + f(h * .04) + 'L' + f(w * .31) + ' ' + f(h * .5) + 'L' + f(w * .2) + ' ' + f(h * .96) + '" fill="none" stroke="' + BZ.cream + '" stroke-width="' + f(sw * .55) + '" stroke-linecap="round"/>' +
      '<rect x="' + f(-w * .5) + '" y="' + f(h * .44) + '" width="' + f(w) + '" height="' + f(h * .12) + '" fill="' + (o.band || BZ.marigold) + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw * .7) + '"/>' +
      '<rect x="' + f(-w * .36) + '" y="' + f(-s * .2) + '" width="' + f(w * .72) + '" height="' + f(s * .22) + '" rx="3" fill="' + BZ.ink + '"/>' +
      '<rect x="' + f(-w * .36) + '" y="' + f(h - s * .02) + '" width="' + f(w * .72) + '" height="' + f(s * .2) + '" rx="3" fill="' + BZ.ink + '"/>' +
      tassel(0, h + s * .3, s * .5, o);
    return '<line x1="' + f(x) + '" y1="' + f(y) + '" x2="' + f(x) + '" y2="' + f(top) + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw * .7) + '"/>' + G('translate(' + f(x) + ' ' + f(top) + ')', inner);
  }

  /* ───── Rangoli-style medallion (geometric, non-figurative) ───── */
  function rangoli(cx, cy, r, o) {
    o = o || {};
    var i, out = '';
    if (isRy(o)) {
      var st = ' fill="none" stroke="' + (o.stroke || 'url(#cdFoil)') + '" stroke-width="' + f(o.sw || Math.max(1, r * .012)) + '"';
      out += '<g' + st + ' fill-opacity="0">';
      for (i = 0; i < 16; i++) out += petal(r * .66, r, r * .12, i * 22.5);
      for (i = 0; i < 8; i++) out += petal(r * .26, r * .6, r * .16, i * 45 + 22.5);
      out += '<circle r="' + f(r * .62) + '"/><circle r="' + f(r * .24) + '"/></g>';
      for (i = 0; i < 32; i++) { var a = i * PI / 16; out += '<circle cx="' + f(Math.cos(a) * r * .64) + '" cy="' + f(Math.sin(a) * r * .64) + '" r="' + f(r * .014) + '" fill="#F7D98A"/>'; }
      for (i = 0; i < 8; i++) { var b = i * PI / 4; out += '<circle cx="' + f(Math.cos(b) * r * .16) + '" cy="' + f(Math.sin(b) * r * .16) + '" r="' + f(r * .025) + '" fill="#F7D98A"/>'; }
      out += '<circle r="' + f(r * .06) + '" fill="url(#cdFoil)"/>';
      return G('translate(' + f(cx) + ' ' + f(cy) + ')', out, o.opacity ? ' opacity="' + o.opacity + '"' : '');
    }
    var sw = o.sw || Math.max(1.5, r * .022), ink = ' stroke="' + BZ.ink + '" stroke-width="' + f(sw) + '" stroke-linejoin="round"';
    var c = o.colors || [BZ.rani, BZ.saffron, BZ.peacock, BZ.marigold, BZ.cream];
    out += '<g fill="' + c[0] + '"' + ink + '>'; for (i = 0; i < 16; i++) out += petal(r * .64, r, r * .13, i * 22.5); out += '</g>';
    out += '<circle r="' + f(r * .64) + '" fill="' + c[4] + '"' + ink + '/>';
    for (i = 0; i < 24; i++) { var a2 = i * PI / 12; out += '<circle cx="' + f(Math.cos(a2) * r * .55) + '" cy="' + f(Math.sin(a2) * r * .55) + '" r="' + f(r * .035) + '" fill="' + c[0] + '"/>'; }
    out += '<g fill="' + c[1] + '"' + ink + '>'; for (i = 0; i < 8; i++) out += petal(r * .2, r * .48, r * .15, i * 45); out += '</g>';
    out += '<g fill="' + c[2] + '"' + ink + '>'; for (i = 0; i < 8; i++) out += petal(r * .24, r * .42, r * .08, i * 45 + 22.5); out += '</g>';
    out += '<circle r="' + f(r * .2) + '" fill="' + c[3] + '"' + ink + '/><circle r="' + f(r * .08) + '" fill="' + c[0] + '"' + ink + '/>';
    return G('translate(' + f(cx) + ' ' + f(cy) + ')', out);
  }

  /* ───── Patang kite (diamond with tukkal tail) ───── */
  function kite(cx, cy, s, rot, c1, c2, o) {
    o = o || {};
    var str = o.string ? (isRy(o) ? '<path d="M' + f(cx) + ' ' + f(cy + s * .2) + 'Q' + f(o.string[0] + (cx - o.string[0]) * .2) + ' ' + f(cy + (o.string[1] - cy) * .7) + ' ' + f(o.string[0]) + ' ' + f(o.string[1]) + '" fill="none" stroke="#F7D98A" stroke-width="1" opacity=".7"/>' :
      '<path d="M' + f(cx) + ' ' + f(cy + s * .2) + 'Q' + f(o.string[0] + (cx - o.string[0]) * .2) + ' ' + f(cy + (o.string[1] - cy) * .7) + ' ' + f(o.string[0]) + ' ' + f(o.string[1]) + '" fill="none" stroke="' + BZ.ink + '" stroke-width="2.5" stroke-dasharray="1 0"/>') : '';
    var top = 'M0 ' + f(-s) + 'L' + f(s) + ' 0L' + f(-s) + ' 0Z', bot = 'M' + f(-s) + ' 0L' + f(s) + ' 0L0 ' + f(s) + 'Z', all = 'M0 ' + f(-s) + 'L' + f(s) + ' 0L0 ' + f(s) + 'L' + f(-s) + ' 0Z';
    var tail = 'M0 ' + f(s * .92) + 'L' + f(-s * .26) + ' ' + f(s * 1.32) + 'L' + f(s * .26) + ' ' + f(s * 1.32) + 'Z';
    var inner;
    if (isRy(o)) {
      inner = '<path d="' + top + '" fill="' + c1 + '"/><path d="' + bot + '" fill="' + c2 + '"/>' +
        '<path d="' + tail + '" fill="' + c1 + '" stroke="url(#cdFoil)" stroke-width="1.2"/>' +
        '<path d="' + all + '" fill="none" stroke="url(#cdFoil)" stroke-width="' + f(Math.max(1.4, s * .03)) + '" stroke-linejoin="round"/>' +
        '<path d="M0 ' + f(-s) + 'V' + f(s) + 'M' + f(-s) + ' 0Q0 ' + f(-s * .7) + ' ' + f(s) + ' 0" fill="none" stroke="#F7D98A" stroke-width="' + f(Math.max(1, s * .02)) + '"/>' +
        '<circle r="' + f(s * .18) + '" fill="none" stroke="#F7D98A" stroke-width="1"/>';
    } else {
      var sw = Math.max(2, s * .07);
      inner = '<path d="' + tail + '" fill="' + c1 + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw) + '" stroke-linejoin="round"/>' +
        '<path d="' + top + '" fill="' + c1 + '"/><path d="' + bot + '" fill="' + c2 + '"/>' +
        '<circle r="' + f(s * .24) + '" fill="' + (o.dot || BZ.cream) + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw * .6) + '"/>' +
        '<path d="' + all + '" fill="none" stroke="' + BZ.ink + '" stroke-width="' + f(sw) + '" stroke-linejoin="round"/>' +
        '<path d="M0 ' + f(-s) + 'V' + f(s) + 'M' + f(-s) + ' 0Q0 ' + f(-s * .72) + ' ' + f(s) + ' 0" fill="none" stroke="' + BZ.ink + '" stroke-width="' + f(sw * .6) + '"/>' +
        '<path d="M' + f(-s * .55) + ' ' + f(-s * .2) + 'L' + f(-s * .3) + ' ' + f(-s * .5) + '" stroke="#fff" stroke-width="' + f(sw * .7) + '" stroke-linecap="round" opacity=".7"/>';
    }
    return str + G('translate(' + f(cx) + ' ' + f(cy) + ') rotate(' + f(rot) + ')', inner);
  }

  /* ───── Sunburst / sun ───── */
  function sun(cx, cy, r, o) {
    o = o || {};
    var rays = '', n = 16;
    for (var i = 0; i < n; i++) {
      var a = i * 2 * PI / n, a1 = a - PI / n * .45, a2 = a + PI / n * .45, R = r * (i % 2 ? 1.45 : 1.7);
      rays += 'M' + f(cx + Math.cos(a1) * r * 1.12) + ' ' + f(cy + Math.sin(a1) * r * 1.12) + 'L' + f(cx + Math.cos(a) * R) + ' ' + f(cy + Math.sin(a) * R) + 'L' + f(cx + Math.cos(a2) * r * 1.12) + ' ' + f(cy + Math.sin(a2) * r * 1.12) + 'Z';
    }
    if (isRy(o)) return '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r * 2.6) + '" fill="url(#cdWarm)" opacity=".6"/><path d="' + rays + '" fill="url(#cdFoil)" opacity=".9"/><circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '" fill="url(#cdFoil)"/><circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r * .78) + '" fill="none" stroke="#8C5A16" stroke-width="1"/>';
    var sw = Math.max(2, r * .07);
    return '<path d="' + rays + '" fill="' + (o.ray || BZ.saffron) + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw) + '" stroke-linejoin="round"/><circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '" fill="' + (o.fill || BZ.marigold) + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw) + '"/><path d="M' + f(cx - r * .55) + ' ' + f(cy - r * .2) + 'A' + f(r * .6) + ' ' + f(r * .6) + ' 0 0 1 ' + f(cx - r * .1) + ' ' + f(cy - r * .6) + '" fill="none" stroke="#fff" stroke-width="' + f(sw) + '" stroke-linecap="round" opacity=".7"/>';
  }

  /* ───── Autumn leaf (generic maple-ish) ───── */
  function leafPath(s) {
    var lobes = [-90, -30, -150, 25, -205], pts = [];
    for (var i = 0; i < 140; i++) {
      var th = -PI / 2 + i * 2 * PI / 140, deg = th * 180 / PI, m = 0;
      lobes.forEach(function (L, k) { var dd = ((deg - L + 540) % 360) - 180; m = Math.max(m, (k === 0 ? 1 : k < 3 ? .86 : .62) * Math.exp(-Math.pow(dd / 19, 2))); });
      var R = s * (.34 + .66 * m) + s * .05 * Math.max(0, Math.sin(i * 1.85 * PI / 4.2)) * m;
      if (deg > 60 && deg < 120) R = Math.min(R, s * .3);
      pts.push(f(Math.cos(th) * R) + ' ' + f(Math.sin(th) * R));
    }
    return 'M' + pts.join('L') + 'Z';
  }
  function leaf(cx, cy, s, rot, color, o) {
    o = o || {};
    var veins = 'M0 ' + f(s * .62) + 'L0 ' + f(-s * .8) + 'M0 ' + f(s * .1) + 'L' + f(s * .68) + ' ' + f(-s * .38) + 'M0 ' + f(s * .1) + 'L' + f(-s * .68) + ' ' + f(-s * .38) + 'M0 ' + f(s * .28) + 'L' + f(s * .5) + ' ' + f(s * .22) + 'M0 ' + f(s * .28) + 'L' + f(-s * .5) + ' ' + f(s * .22);
    if (isRy(o)) return G('translate(' + f(cx) + ' ' + f(cy) + ') rotate(' + f(rot) + ')', '<path d="' + leafPath(s) + '" fill="' + (color || 'url(#cdFoil)') + '" stroke="#8C5A16" stroke-width="1"/><path d="' + veins + '" fill="none" stroke="#7A4A12" stroke-width="1.2" opacity=".7"/><path d="M0 ' + f(s * .6) + 'q' + f(s * .05) + ' ' + f(s * .3) + ' ' + f(s * .2) + ' ' + f(s * .45) + '" fill="none" stroke="#B7791F" stroke-width="2"/>');
    var sw = Math.max(2, s * .07);
    return G('translate(' + f(cx) + ' ' + f(cy) + ') rotate(' + f(rot) + ')', '<path d="M0 ' + f(s * .5) + 'q' + f(s * .05) + ' ' + f(s * .35) + ' ' + f(s * .22) + ' ' + f(s * .5) + '" fill="none" stroke="' + BZ.ink + '" stroke-width="' + f(sw) + '" stroke-linecap="round"/><path d="' + leafPath(s) + '" fill="' + color + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw) + '" stroke-linejoin="round"/><path d="' + veins + '" fill="none" stroke="' + BZ.ink + '" stroke-width="' + f(sw * .5) + '" stroke-linecap="round" opacity=".55"/>');
  }

  /* ───── Ornament bauble + bow ───── */
  function ornament(x, y, len, s, color, o) {
    o = o || {};
    var cy = y + len + s;
    if (isRy(o)) {
      return '<line x1="' + f(x) + '" y1="' + f(y) + '" x2="' + f(x) + '" y2="' + f(cy - s) + '" stroke="#B7791F" stroke-width="1.2"/>' +
        '<circle cx="' + f(x) + '" cy="' + f(cy) + '" r="' + f(s * 2) + '" fill="url(#cdWarm)" opacity=".35"/>' +
        '<circle cx="' + f(x) + '" cy="' + f(cy) + '" r="' + f(s) + '" fill="' + color + '" stroke="url(#cdFoil)" stroke-width="1.6"/>' +
        '<path d="M' + f(x - s) + ' ' + f(cy) + 'Q' + f(x) + ' ' + f(cy + s * .35) + ' ' + f(x + s) + ' ' + f(cy) + '" fill="none" stroke="#F7D98A" stroke-width="1.4"/>' +
        '<path d="M' + f(x - s * .92) + ' ' + f(cy - s * .35) + 'Q' + f(x) + ' ' + f(cy - s * .05) + ' ' + f(x + s * .92) + ' ' + f(cy - s * .35) + '" fill="none" stroke="#F7D98A" stroke-width=".8" stroke-dasharray="2 3"/>' +
        '<rect x="' + f(x - s * .28) + '" y="' + f(cy - s * 1.18) + '" width="' + f(s * .56) + '" height="' + f(s * .26) + '" rx="2" fill="url(#cdFoil)"/>' +
        '<ellipse cx="' + f(x - s * .38) + '" cy="' + f(cy - s * .4) + '" rx="' + f(s * .18) + '" ry="' + f(s * .28) + '" fill="#fff" opacity=".35" transform="rotate(30 ' + f(x - s * .38) + ' ' + f(cy - s * .4) + ')"/>';
    }
    var sw = Math.max(2, s * .1);
    var zig = 'M' + f(x - s) + ' ' + f(cy);
    for (var i = 1; i <= 8; i++) zig += 'L' + f(x - s + i * s / 4) + ' ' + f(cy + (i % 2 ? -s * .16 : s * .16));
    return '<line x1="' + f(x) + '" y1="' + f(y) + '" x2="' + f(x) + '" y2="' + f(cy - s) + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw * .6) + '"/>' +
      '<circle cx="' + f(x) + '" cy="' + f(cy) + '" r="' + f(s) + '" fill="' + color + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw) + '"/>' +
      '<path d="' + zig + '" fill="none" stroke="' + (o.band || BZ.cream) + '" stroke-width="' + f(sw * 1.1) + '" stroke-linejoin="round"/>' +
      '<rect x="' + f(x - s * .3) + '" y="' + f(cy - s * 1.22) + '" width="' + f(s * .6) + '" height="' + f(s * .32) + '" rx="2" fill="' + BZ.marigold + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw * .6) + '"/>' +
      '<path d="M' + f(x - s * .62) + ' ' + f(cy - s * .3) + 'A' + f(s * .65) + ' ' + f(s * .65) + ' 0 0 1 ' + f(x - s * .2) + ' ' + f(cy - s * .68) + '" fill="none" stroke="#fff" stroke-width="' + f(sw) + '" stroke-linecap="round" opacity=".75"/>';
  }
  function bow(cx, cy, s, color, o) {
    o = o || {};
    var loopL = 'M0 0C' + f(-s * .5) + ' ' + f(-s * .75) + ' ' + f(-s * 1.25) + ' ' + f(-s * .55) + ' ' + f(-s * 1.1) + ' ' + f(s * .05) + 'C' + f(-s * .95) + ' ' + f(s * .45) + ' ' + f(-s * .4) + ' ' + f(s * .3) + ' 0 0Z';
    var tailL = 'M' + f(-s * .08) + ' ' + f(s * .1) + 'L' + f(-s * .55) + ' ' + f(s * 1.05) + 'L' + f(-s * .32) + ' ' + f(s * .92) + 'L' + f(-s * .22) + ' ' + f(s * 1.15) + 'L' + f(s * .08) + ' ' + f(s * .12) + 'Z';
    var st = isRy(o) ? ' fill="' + color + '" stroke="url(#cdFoil)" stroke-width="1.4" stroke-linejoin="round"' : ' fill="' + color + '" stroke="' + BZ.ink + '" stroke-width="' + f(Math.max(2, s * .09)) + '" stroke-linejoin="round"';
    return G('translate(' + f(cx) + ' ' + f(cy) + ')', '<path d="' + tailL + '"' + st + '/><path d="' + tailL + '"' + st + ' transform="scale(-1 1)"/><path d="' + loopL + '"' + st + '/><path d="' + loopL + '"' + st + ' transform="scale(-1 1)"/><circle r="' + f(s * .2) + '"' + st + '/>');
  }

  /* ───── Confetti & sparkles ───── */
  function confetti(x, y, w, h, n, seed, colors, o) {
    o = o || {};
    var r = rng(seed), out = '';
    for (var i = 0; i < n; i++) {
      var px = x + r() * w, py = y + r() * h, c = colors[Math.floor(r() * colors.length)], k = r(), rot = r() * 180, sz = (o.size || 10) * (.6 + r() * .8);
      var st = isRy(o) ? '' : ' stroke="' + BZ.ink + '" stroke-width="' + f(Math.max(1.2, sz * .16)) + '"';
      if (k < .4) out += '<rect x="' + f(px - sz * .3) + '" y="' + f(py - sz * .7) + '" width="' + f(sz * .6) + '" height="' + f(sz * 1.4) + '" rx="1.5" fill="' + c + '"' + st + ' transform="rotate(' + f(rot) + ' ' + f(px) + ' ' + f(py) + ')"/>';
      else if (k < .7) out += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(sz * .45) + '" fill="' + c + '"' + st + '/>';
      else out += '<path d="M' + f(px - sz) + ' ' + f(py) + 'q' + f(sz * .5) + ' ' + f(-sz * .7) + ' ' + f(sz) + ' 0t' + f(sz) + ' 0" fill="none" stroke="' + c + '" stroke-width="' + f(sz * .32) + '" stroke-linecap="round" transform="rotate(' + f(rot) + ' ' + f(px) + ' ' + f(py) + ')"/>';
    }
    return out;
  }
  function sparkle(x, y, s, color, o) {
    o = o || {};
    var d = 'M' + f(x) + ' ' + f(y - s) + 'Q' + f(x + s * .12) + ' ' + f(y - s * .12) + ' ' + f(x + s) + ' ' + f(y) + 'Q' + f(x + s * .12) + ' ' + f(y + s * .12) + ' ' + f(x) + ' ' + f(y + s) + 'Q' + f(x - s * .12) + ' ' + f(y + s * .12) + ' ' + f(x - s) + ' ' + f(y) + 'Q' + f(x - s * .12) + ' ' + f(y - s * .12) + ' ' + f(x) + ' ' + f(y - s) + 'Z';
    if (isRy(o)) return '<path d="' + d + '" fill="' + (color || 'url(#cdFoil)') + '"/>';
    return '<path d="' + d + '" fill="' + (color || BZ.marigold) + '"' + (o.stroke === false ? '' : ' stroke="' + BZ.ink + '" stroke-width="' + f(Math.max(1.5, s * .12)) + '" stroke-linejoin="round"') + '/>';
  }

  /* ───── Paisley (boteh) and paisley-heart ───── */
  var BOTEH = 'M0 1C-0.9 1-1.22 0.2-0.86-0.46C-0.55-1.05 0.2-1.45 0.92-1.9C0.68-1.3 1.06-0.62 0.86 0.15C0.7 0.76 0.4 1 0 1Z';
  function paisley(cx, cy, s, rot, color, o) {
    o = o || {};
    var tr = 'translate(' + f(cx) + ' ' + f(cy) + ') rotate(' + f(rot) + ')' + (o.flip ? ' scale(-1 1)' : '') + ' scale(' + f(s) + ')';
    if (isRy(o)) return G(tr, '<path d="' + BOTEH + '" fill="' + color + '" stroke="url(#cdFoil)" stroke-width="' + f(1.6 / s) + '"/><path d="' + BOTEH + '" transform="translate(-.02 .22) scale(.62)" fill="none" stroke="#F7D98A" stroke-width="' + f(1.1 / s) + '"/><circle cx="-.02" cy=".28" r=".18" fill="url(#cdFoil)"/>');
    var sw = (o.sw || Math.max(2.2, s * .07)) / s;
    return G(tr, '<path d="' + BOTEH + '" fill="' + color + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw * 100) / 100 + '" stroke-linejoin="round"/><path d="' + BOTEH + '" transform="translate(-.02 .22) scale(.6)" fill="' + (o.inner || BZ.cream) + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw * 60) / 100 + '"/><circle cx="-.02" cy=".3" r=".16" fill="' + (o.dot || BZ.marigold) + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw * 50) / 100 + '"/>');
  }
  function paisleyHeart(cx, cy, s, c1, c2, o) {
    o = o || {};
    var a = Object.assign({}, o), b = Object.assign({ flip: true }, o);
    return G('translate(' + f(cx) + ' ' + f(cy) + ')', paisley(s * .62, -s * .2, s * .78, 200, c1, a) + paisley(-s * .62, -s * .2, s * .78, 160, c2, b));
  }
  function heart(cx, cy, s, color, o) {
    o = o || {};
    var d = 'M0 ' + f(s * .9) + 'C' + f(-s * 1.45) + ' ' + f(-s * .1) + ' ' + f(-s * .72) + ' ' + f(-s * 1.08) + ' 0 ' + f(-s * .36) + 'C' + f(s * .72) + ' ' + f(-s * 1.08) + ' ' + f(s * 1.45) + ' ' + f(-s * .1) + ' 0 ' + f(s * .9) + 'Z';
    if (isRy(o)) return G('translate(' + f(cx) + ' ' + f(cy) + ') rotate(' + f(o.rot || 0) + ')', '<path d="' + d + '" fill="' + color + '" stroke="url(#cdFoil)" stroke-width="1.4"/>');
    return G('translate(' + f(cx) + ' ' + f(cy) + ') rotate(' + f(o.rot || 0) + ')', '<path d="' + d + '" fill="' + color + '" stroke="' + BZ.ink + '" stroke-width="' + f(Math.max(2, s * .12)) + '" stroke-linejoin="round"/>');
  }

  /* ───── Holi colour-powder cloud ───── */
  function colorCloud(cx, cy, r, color, seed, o) {
    o = o || {};
    var R = rng(seed), out = '', specks = '';
    for (var i = 0; i < 13; i++) {
      var a = R() * PI * 2, d = R() * r * .55, rr = r * (.32 + R() * .3);
      out += '<circle cx="' + f(cx + Math.cos(a) * d) + '" cy="' + f(cy + Math.sin(a) * d * .8) + '" r="' + f(rr) + '"/>';
    }
    for (var j = 0; j < 26; j++) {
      var a2 = R() * PI * 2, d2 = r * (.75 + R() * .7), sr = r * (.02 + R() * .05);
      specks += '<circle cx="' + f(cx + Math.cos(a2) * d2) + '" cy="' + f(cy + Math.sin(a2) * d2 * .85) + '" r="' + f(sr) + '"/>';
    }
    if (isRy(o)) return '<g fill="' + color + '" opacity="' + (o.opacity || .8) + '" filter="url(#cdPowder)">' + out + '</g><g fill="' + color + '" opacity=".75">' + specks + '</g>';
    return '<g fill="' + (o.shadow || BZ.ink) + '" opacity=".14" transform="translate(10 10)">' + out + '</g><g fill="' + color + '">' + out + '</g><g fill="' + color + '">' + specks + '</g>';
  }

  /* ───── Chili, raw mango, jasmine ───── */
  function chili(cx, cy, s, rot, color, o) {
    o = o || {};
    var body = 'M0 0C' + f(s * .3) + ' ' + f(s * .38) + ' ' + f(s * .26) + ' ' + f(s * 1.15) + ' ' + f(-s * .5) + ' ' + f(s * 1.62) + 'C' + f(-s * .12) + ' ' + f(s * 1.02) + ' ' + f(-s * .22) + ' ' + f(s * .45) + ' ' + f(-s * .26) + ' ' + f(s * .04) + 'Z';
    var cap = 'M' + f(-s * .34) + ' ' + f(s * .02) + 'Q' + f(-s * .14) + ' ' + f(-s * .18) + ' ' + f(s * .08) + ' ' + f(s * .02) + 'Q' + f(-s * .1) + ' ' + f(s * .16) + ' ' + f(-s * .34) + ' ' + f(s * .02) + 'Z';
    var stem = 'M' + f(-s * .12) + ' ' + f(-s * .06) + 'q' + f(s * .02) + ' ' + f(-s * .22) + ' ' + f(s * .2) + ' ' + f(-s * .3);
    if (isRy(o)) return G('translate(' + f(cx) + ' ' + f(cy) + ') rotate(' + f(rot) + ')', '<path d="' + body + '" fill="' + color + '" stroke="url(#cdFoil)" stroke-width="1.2"/><path d="' + stem + '" fill="none" stroke="#B7791F" stroke-width="2" stroke-linecap="round"/><path d="' + cap + '" fill="#1E6B4A" stroke="#B7791F" stroke-width="1"/>');
    var sw = Math.max(2, s * .09);
    return G('translate(' + f(cx) + ' ' + f(cy) + ') rotate(' + f(rot) + ')', '<path d="' + stem + '" fill="none" stroke="' + BZ.ink + '" stroke-width="' + f(sw * 1.4) + '" stroke-linecap="round"/><path d="' + body + '" fill="' + color + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw) + '" stroke-linejoin="round"/><path d="' + cap + '" fill="' + BZ.cilantro + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw * .8) + '" stroke-linejoin="round"/><path d="M' + f(s * .06) + ' ' + f(s * .35) + 'Q' + f(s * .1) + ' ' + f(s * .8) + ' ' + f(-s * .12) + ' ' + f(s * 1.15) + '" fill="none" stroke="#fff" stroke-width="' + f(sw * .8) + '" stroke-linecap="round" opacity=".6"/>');
  }
  function mango(cx, cy, s, rot, o) {
    o = o || {};
    var d = 'M0 ' + f(-s) + 'C' + f(s * .82) + ' ' + f(-s) + ' ' + f(s * .98) + ' 0 ' + f(s * .58) + ' ' + f(s * .7) + 'C' + f(s * .26) + ' ' + f(s * 1.16) + ' ' + f(-s * .52) + ' ' + f(s * 1.06) + ' ' + f(-s * .72) + ' ' + f(s * .38) + 'C' + f(-s * .88) + ' ' + f(-s * .14) + ' ' + f(-s * .56) + ' ' + f(-s) + ' 0 ' + f(-s) + 'Z';
    var lf = 'M' + f(s * .05) + ' ' + f(-s * .98) + 'C' + f(s * .45) + ' ' + f(-s * 1.55) + ' ' + f(s * 1.05) + ' ' + f(-s * 1.5) + ' ' + f(s * 1.25) + ' ' + f(-s * 1.32) + 'C' + f(s * .9) + ' ' + f(-s * 1.0) + ' ' + f(s * .4) + ' ' + f(-s * .92) + ' ' + f(s * .05) + ' ' + f(-s * .98) + 'Z';
    if (isRy(o)) return G('translate(' + f(cx) + ' ' + f(cy) + ') rotate(' + f(rot) + ')', '<path d="' + lf + '" fill="#1E6B4A" stroke="url(#cdFoil)" stroke-width="1"/><path d="' + d + '" fill="' + (o.color || '#7FA83A') + '" stroke="url(#cdFoil)" stroke-width="1.3"/><ellipse cx="' + f(-s * .3) + '" cy="' + f(-s * .3) + '" rx="' + f(s * .15) + '" ry="' + f(s * .3) + '" fill="#fff" opacity=".22" transform="rotate(20 ' + f(-s * .3) + ' ' + f(-s * .3) + ')"/>');
    var sw = Math.max(2, s * .08);
    return G('translate(' + f(cx) + ' ' + f(cy) + ') rotate(' + f(rot) + ')', '<path d="' + lf + '" fill="' + BZ.cilantro + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw) + '" stroke-linejoin="round"/><path d="M' + f(s * .1) + ' ' + f(-s * 1.0) + 'Q' + f(s * .7) + ' ' + f(-s * 1.32) + ' ' + f(s * 1.15) + ' ' + f(-s * 1.32) + '" fill="none" stroke="' + BZ.ink + '" stroke-width="' + f(sw * .5) + '"/><path d="' + d + '" fill="' + (o.color || '#9BCB3C') + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw) + '" stroke-linejoin="round"/><path d="M' + f(s * .25) + ' ' + f(s * .2) + 'Q' + f(s * .5) + ' ' + f(s * .55) + ' ' + f(s * .1) + ' ' + f(s * .8) + '" fill="none" stroke="' + BZ.marigold + '" stroke-width="' + f(sw * 2.2) + '" stroke-linecap="round" opacity=".8"/><path d="M' + f(-s * .45) + ' ' + f(-s * .35) + 'Q' + f(-s * .45) + ' ' + f(-s * .7) + ' ' + f(-s * .15) + ' ' + f(-s * .8) + '" fill="none" stroke="#fff" stroke-width="' + f(sw) + '" stroke-linecap="round" opacity=".7"/>');
  }
  function jasmine(cx, cy, s, rot, o) {
    o = o || {};
    var p = '';
    for (var i = 0; i < 5; i++) p += '<ellipse cx="0" cy="' + f(-s * .55) + '" rx="' + f(s * .3) + '" ry="' + f(s * .5) + '" transform="rotate(' + (i * 72) + ')"/>';
    if (isRy(o)) return G('translate(' + f(cx) + ' ' + f(cy) + ') rotate(' + f(rot || 0) + ')', '<g fill="#FFFDF6" stroke="url(#cdFoil)" stroke-width="1">' + p + '</g><circle r="' + f(s * .2) + '" fill="url(#cdFoil)"/>');
    return G('translate(' + f(cx) + ' ' + f(cy) + ') rotate(' + f(rot || 0) + ')', '<g fill="#fff" stroke="' + BZ.ink + '" stroke-width="' + f(Math.max(1.6, s * .1)) + '">' + p + '</g><circle r="' + f(s * .22) + '" fill="' + BZ.marigold + '" stroke="' + BZ.ink + '" stroke-width="' + f(Math.max(1.4, s * .08)) + '"/>');
  }

  /* ───── Firework drawn like a rangoli burst ───── */
  function firework(cx, cy, r, color, o) {
    o = o || {};
    var out = '', i, n = 18;
    var c2 = o.c2 || color;
    for (i = 0; i < n; i++) {
      var a = i * 2 * PI / n, R = r * (i % 2 ? .74 : 1), x1 = Math.cos(a) * r * .3, y1 = Math.sin(a) * r * .3, x2 = Math.cos(a) * R, y2 = Math.sin(a) * R;
      if (isRy(o)) out += '<line x1="' + f(x1) + '" y1="' + f(y1) + '" x2="' + f(x2 * .9) + '" y2="' + f(y2 * .9) + '" stroke="' + (i % 2 ? c2 : color) + '" stroke-width="' + f(Math.max(1.2, r * .018)) + '" stroke-linecap="round"/><circle cx="' + f(x2) + '" cy="' + f(y2) + '" r="' + f(r * .028) + '" fill="' + (i % 2 ? c2 : color) + '"/>';
      else out += '<line x1="' + f(x1) + '" y1="' + f(y1) + '" x2="' + f(x2 * .88) + '" y2="' + f(y2 * .88) + '" stroke="' + (i % 2 ? c2 : color) + '" stroke-width="' + f(Math.max(3, r * .05)) + '" stroke-linecap="round"/><circle cx="' + f(x2) + '" cy="' + f(y2) + '" r="' + f(r * .055) + '" fill="' + (i % 2 ? c2 : color) + '"/>';
    }
    for (i = 0; i < 8; i++) out += isRy(o) ? '<g fill="none" stroke="' + color + '" stroke-width="1">' + petal(r * .08, r * .24, r * .06, i * 45) + '</g>' : '<g fill="' + c2 + '">' + petal(r * .06, r * .24, r * .07, i * 45) + '</g>';
    out += '<circle r="' + f(r * .06) + '" fill="' + (isRy(o) ? '#FFF1C4' : BZ.cream) + '"/>';
    var glow = isRy(o) ? '<circle r="' + f(r * 1.1) + '" fill="url(#cdWarm)" opacity=".35"/>' : '';
    return G('translate(' + f(cx) + ' ' + f(cy) + ')', glow + out);
  }
  function waves(x, y, w, amp, rows, color, o) {
    o = o || {};
    var out = '', step = amp * 3.2;
    for (var r = 0; r < rows; r++) {
      var yy = y + r * amp * 1.9, d = 'M' + f(x) + ' ' + f(yy);
      for (var xx = x; xx < x + w; xx += step) d += 'q' + f(step / 4) + ' ' + f(-amp) + ' ' + f(step / 2) + ' 0t' + f(step / 2) + ' 0';
      out += '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + f(isRy(o) ? 1.4 : Math.max(3, amp * .35)) + '" stroke-linecap="round" opacity="' + (isRy(o) ? .6 : 1) + '"/>';
    }
    return out;
  }

  /* ───── Friday-night football: stadium light tower, football, pennant ───── */
  function stadium(x, y, s, o) {
    o = o || {};
    var pw = s * 1.5, ph = s * .95, out = '', i, j;
    var beam = '<path d="M' + f(x - pw * .5) + ' ' + f(y + ph) + 'L' + f(x + pw * .5) + ' ' + f(y + ph) + 'L' + f(x + (o.beamTo || 0) + s * 2.4) + ' ' + f(y + s * 9) + 'L' + f(x + (o.beamTo || 0) - s * 2.4) + ' ' + f(y + s * 9) + 'Z" fill="' + (isRy(o) ? '#F7D98A' : '#FFF4DC') + '" opacity="' + (isRy(o) ? .1 : .16) + '"/>';
    if (isRy(o)) {
      out += '<rect x="' + f(x - s * .07) + '" y="' + f(y + ph) + '" width="' + f(s * .14) + '" height="' + f(s * 6) + '" fill="url(#cdFoilV)"/>';
      out += '<rect x="' + f(x - pw / 2) + '" y="' + f(y) + '" width="' + f(pw) + '" height="' + f(ph) + '" rx="3" fill="#160B26" stroke="url(#cdFoil)" stroke-width="1.4"/>';
      for (i = 0; i < 2; i++) for (j = 0; j < 4; j++) { var lx = x - pw / 2 + pw * (j + .5) / 4, ly = y + ph * (i + .5) / 2; out += '<circle cx="' + f(lx) + '" cy="' + f(ly) + '" r="' + f(s * .5) + '" fill="url(#cdWarm)"/><circle cx="' + f(lx) + '" cy="' + f(ly) + '" r="' + f(s * .13) + '" fill="#FFF8DC"/>'; }
      return beam + out;
    }
    var sw = Math.max(2, s * .08);
    out += '<rect x="' + f(x - s * .09) + '" y="' + f(y + ph) + '" width="' + f(s * .18) + '" height="' + f(s * 6) + '" fill="' + BZ.ink + '"/>';
    for (i = 0; i < 6; i++) out += '<path d="M' + f(x - s * .09) + ' ' + f(y + ph + s * (i + .2)) + 'L' + f(x + s * .09) + ' ' + f(y + ph + s * (i + .8)) + '" stroke="' + BZ.cream + '" stroke-width="' + f(sw * .4) + '" opacity=".4"/>';
    out += '<rect x="' + f(x - pw / 2) + '" y="' + f(y) + '" width="' + f(pw) + '" height="' + f(ph) + '" rx="4" fill="' + BZ.ink + '" stroke="' + BZ.cream + '" stroke-width="' + f(sw * .6) + '"/>';
    for (i = 0; i < 2; i++) for (j = 0; j < 4; j++) { var bx = x - pw / 2 + pw * (j + .5) / 4, by = y + ph * (i + .5) / 2; out += '<circle cx="' + f(bx) + '" cy="' + f(by) + '" r="' + f(s * .55) + '" fill="url(#cdGFFF4DC)"/><circle cx="' + f(bx) + '" cy="' + f(by) + '" r="' + f(s * .14) + '" fill="#FFFBEA"/>'; }
    return beam + out;
  }
  function football(cx, cy, s, rot, o) {
    o = o || {};
    var body = 'M' + f(-s) + ' 0Q0 ' + f(-s * .78) + ' ' + f(s) + ' 0Q0 ' + f(s * .78) + ' ' + f(-s) + ' 0Z';
    var laces = 'M' + f(-s * .3) + ' 0H' + f(s * .3);
    for (var i = 0; i < 5; i++) laces += 'M' + f(-s * .24 + i * s * .12) + ' ' + f(-s * .08) + 'v' + f(s * .16);
    var stripes = 'M' + f(-s * .62) + ' ' + f(-s * .24) + 'q' + f(-s * .06) + ' ' + f(s * .24) + ' 0 ' + f(s * .48) + 'M' + f(s * .62) + ' ' + f(-s * .24) + 'q' + f(s * .06) + ' ' + f(s * .24) + ' 0 ' + f(s * .48);
    if (isRy(o)) return G('translate(' + f(cx) + ' ' + f(cy) + ') rotate(' + f(rot) + ')', '<path d="' + body + '" fill="#6E2A14" stroke="url(#cdFoil)" stroke-width="1.6"/><path d="' + laces + stripes + '" fill="none" stroke="#F7D98A" stroke-width="' + f(Math.max(1.2, s * .04)) + '" stroke-linecap="round"/>');
    var sw = Math.max(2.2, s * .08);
    return G('translate(' + f(cx) + ' ' + f(cy) + ') rotate(' + f(rot) + ')', '<path d="' + body + '" fill="' + (o.color || '#A8431E') + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw) + '" stroke-linejoin="round"/><path d="' + laces + stripes + '" fill="none" stroke="' + BZ.cream + '" stroke-width="' + f(sw * .8) + '" stroke-linecap="round"/><path d="M' + f(-s * .5) + ' ' + f(-s * .3) + 'Q0 ' + f(-s * .56) + ' ' + f(s * .4) + ' ' + f(-s * .34) + '" fill="none" stroke="#fff" stroke-width="' + f(sw * .6) + '" stroke-linecap="round" opacity=".4"/>');
  }
  function pennant(x, y, w, h, color, o) {
    o = o || {};
    var d = 'M' + f(x) + ' ' + f(y) + 'L' + f(x + w) + ' ' + f(y + h * .5) + 'L' + f(x) + ' ' + f(y + h) + 'Z';
    if (isRy(o)) return '<path d="' + d + '" fill="' + color + '" stroke="url(#cdFoil)" stroke-width="1.4"/><line x1="' + f(x) + '" y1="' + f(y - h * .3) + '" x2="' + f(x) + '" y2="' + f(y + h * 2.2) + '" stroke="url(#cdFoilV)" stroke-width="3"/>';
    var sw = Math.max(2, h * .06);
    return '<line x1="' + f(x) + '" y1="' + f(y - h * .3) + '" x2="' + f(x) + '" y2="' + f(y + h * 2.2) + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw * 1.6) + '" stroke-linecap="round"/><path d="' + d + '" fill="' + color + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw) + '" stroke-linejoin="round"/><path d="M' + f(x + w * .14) + ' ' + f(y + h * .3) + 'L' + f(x + w * .58) + ' ' + f(y + h * .5) + 'L' + f(x + w * .14) + ' ' + f(y + h * .7) + '" fill="none" stroke="' + BZ.cream + '" stroke-width="' + f(sw * .8) + '" stroke-linejoin="round"/>';
  }

  /* ───── 8-point star geometry (Eid, neutral) ───── */
  function star8Path(r, inner) {
    var d = '';
    for (var i = 0; i < 16; i++) { var a = -PI / 2 + i * PI / 8, R = i % 2 ? r * (inner || .72) : r; d += (i ? 'L' : 'M') + f(Math.cos(a) * R) + ' ' + f(Math.sin(a) * R); }
    return d + 'Z';
  }
  function star8(cx, cy, r, o) {
    o = o || {};
    if (isRy(o)) return G('translate(' + f(cx) + ' ' + f(cy) + ')', '<path d="' + star8Path(r, .76) + '" fill="' + (o.fill || 'none') + '" stroke="url(#cdFoil)" stroke-width="' + f(o.sw || 1.6) + '"/><path d="' + star8Path(r * .62, .76) + '" fill="none" stroke="#F7D98A" stroke-width="' + f((o.sw || 1.6) * .6) + '"/>' + (o.dot ? '<circle r="' + f(r * .16) + '" fill="url(#cdFoil)"/>' : ''));
    var sw = o.sw || Math.max(2, r * .07);
    return G('translate(' + f(cx) + ' ' + f(cy) + ')', '<path d="' + star8Path(r, .76) + '" fill="' + (o.fill || BZ.marigold) + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw) + '" stroke-linejoin="round"/><path d="' + star8Path(r * .58, .76) + '" fill="' + (o.inner || BZ.rani) + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw * .7) + '" stroke-linejoin="round"/><circle r="' + f(r * .17) + '" fill="' + (o.dot || BZ.cream) + '" stroke="' + BZ.ink + '" stroke-width="' + f(sw * .5) + '"/>');
  }
  /* full-bleed geometric lattice: 8-point stars with diamond crosses (Bazaar Eid background) */
  function geoLattice(x, y, w, h, cell, o) {
    o = o || {};
    var out = '', cols = Math.ceil(w / cell) + 1, rows = Math.ceil(h / cell) + 1, i, j;
    var c = o.colors || ['#2B1B66', '#00A8A0', '#FFB000', '#E4147E'];
    for (j = 0; j < rows; j++) for (i = 0; i < cols; i++) {
      var cx = x + i * cell, cy = y + j * cell;
      out += '<g transform="translate(' + f(cx) + ' ' + f(cy) + ')"><path d="' + star8Path(cell * .36, .74) + '" fill="' + c[0] + '" stroke="' + c[(i + j) % 2 ? 1 : 2] + '" stroke-width="' + f(cell * .03) + '"/><path d="' + star8Path(cell * .16, .7) + '" fill="' + c[(i + j) % 2 ? 2 : 3] + '"/></g>';
      var dx = cx + cell / 2, dy = cy + cell / 2, ds = cell * .13;
      out += '<path d="M' + f(dx) + ' ' + f(dy - ds) + 'L' + f(dx + ds) + ' ' + f(dy) + 'L' + f(dx) + ' ' + f(dy + ds) + 'L' + f(dx - ds) + ' ' + f(dy) + 'Z" fill="' + c[3] + '" opacity=".9"/>';
    }
    return out;
  }

  /* ───── Small flat icons for the page rail (48×48, currentColor + accents) ───── */
  var ICONS = {
    garland: '<path d="M4 10q20 14 40 0" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="9" cy="14.5" r="3.4" fill="#FFB000"/><circle cx="17" cy="18.5" r="3.4" fill="#FF6A13"/><circle cx="24" cy="19.6" r="3.4" fill="#FFB000"/><circle cx="31" cy="18.5" r="3.4" fill="#FF6A13"/><circle cx="39" cy="14.5" r="3.4" fill="#FFB000"/><path d="M24 23v12" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="28" r="2.6" fill="#FF6A13"/><path d="M21.5 34h5l1.5 8h-8z" fill="#E4147E"/>',
    lights: '<path d="M3 9q21 16 42 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><g><circle cx="10" cy="22" r="6" fill="#FFB000" opacity=".25"/><path d="M8 14.5h4l1.2 5.5a3.2 3.2 0 1 1-6.4 0z" fill="#FFB000"/></g><g><circle cx="24" cy="26" r="6" fill="#E4147E" opacity=".25"/><path d="M22 18h4l1.2 5.5a3.2 3.2 0 1 1-6.4 0z" fill="#E4147E"/></g><g><circle cx="38" cy="22" r="6" fill="#00A8A0" opacity=".25"/><path d="M36 14.5h4l1.2 5.5a3.2 3.2 0 1 1-6.4 0z" fill="#00A8A0"/></g><path d="M24 31v4m-3 2h6l-1 7h-4z" stroke="currentColor" stroke-width="1.6" fill="none"/>',
    leaf: '<path d="M24 6l3 7 6-3-1 8 7 1-5 6 4 4-9 1 1 6-6-4-6 4 1-6-9-1 4-4-5-6 7-1-1-8 6 3z" fill="#FF6A13" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M24 14v28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    gift: '<rect x="8" y="20" width="32" height="20" rx="3" fill="#00A8A0" stroke="currentColor" stroke-width="2"/><rect x="6" y="15" width="36" height="7" rx="2" fill="#3FA34D" stroke="currentColor" stroke-width="2"/><path d="M24 15v25" stroke="#FFB000" stroke-width="4"/><path d="M24 15c-3-7-11-7-10-2 1 3 6 2 10 2zM24 15c3-7 11-7 10-2-1 3-6 2-10 2z" fill="#E4147E" stroke="currentColor" stroke-width="1.6"/>',
    kite: '<path d="M24 5l14 14-14 14-14-14z" fill="#E4147E" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M10 19h28l-14 14z" fill="#FFB000" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M24 5v28M10 19q14-10 28 0" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M24 32l-3 5h6z" fill="#00A8A0"/><path d="M24 37q-4 6 4 10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2 2"/>',
    ball: '<path d="M8 30Q24 6 40 18Q24 42 8 30z" fill="#A8431E" stroke="currentColor" stroke-width="2"/><path d="M18 27l12-6M21 22.5l2 3.5M24.5 21l2 3.5M28 19.5l2 3.5" stroke="#FFF4DC" stroke-width="1.8" stroke-linecap="round"/>',
    heart: '<path d="M24 40C6 28 8 12 18 12c3 0 5 2 6 5 1-3 3-5 6-5 10 0 12 16-6 28z" fill="#E4147E" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M17 18c-3 0-5 3-4 6" fill="none" stroke="#FFF4DC" stroke-width="2" stroke-linecap="round" opacity=".8"/>',
    star8: '<path d="' + star8Path(17, .74).replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, function (m, a, b) { return f(+a + 24) + ' ' + f(+b + 24); }) + '" fill="#00A8A0" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="' + star8Path(8, .72).replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, function (m, a, b) { return f(+a + 24) + ' ' + f(+b + 24); }) + '" fill="#FFB000"/>',
    burst: '<circle cx="17" cy="20" r="10" fill="#E4147E" opacity=".9"/><circle cx="31" cy="18" r="9" fill="#FFB000" opacity=".9"/><circle cx="25" cy="31" r="10" fill="#00A8A0" opacity=".9"/><circle cx="8" cy="34" r="2" fill="#7B5CFF"/><circle cx="40" cy="33" r="2.4" fill="#3FA34D"/><circle cx="38" cy="8" r="1.8" fill="#E4147E"/>',
    chili: '<path d="M30 10c3 5 2 18-14 28 5-8 6-19 6-27z" fill="#D62839" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M21 11q4-4 10-1" fill="#3FA34D" stroke="currentColor" stroke-width="1.8"/><path d="M26 9q0-4 4-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    bat: '<path d="M30 6l5 3-12 22-5-3z" fill="#FFB000" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M18 28l5 3-3 5-5-3z" fill="currentColor"/><circle cx="34" cy="34" r="5" fill="#D62839" stroke="currentColor" stroke-width="2"/><path d="M30.5 31q3.5 3 7 0" fill="none" stroke="#FFF4DC" stroke-width="1.4"/>',
    flower: '<g fill="#FFF" stroke="currentColor" stroke-width="1.6"><ellipse cx="17" cy="13" rx="3.4" ry="5.5"/><ellipse cx="17" cy="13" rx="3.4" ry="5.5" transform="rotate(72 17 19)"/><ellipse cx="17" cy="13" rx="3.4" ry="5.5" transform="rotate(144 17 19)"/><ellipse cx="17" cy="13" rx="3.4" ry="5.5" transform="rotate(216 17 19)"/><ellipse cx="17" cy="13" rx="3.4" ry="5.5" transform="rotate(288 17 19)"/></g><circle cx="17" cy="19" r="2.6" fill="#FFB000"/><circle cx="33" cy="30" r="9" fill="#FF6A13" stroke="currentColor" stroke-width="2"/><circle cx="33" cy="30" r="5" fill="#FFB000"/>',
    cap: '<path d="M4 18l20-9 20 9-20 9z" fill="#7B5CFF" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 22v9c6 5 18 5 24 0v-9l-12 5z" fill="#3A1B7A" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M40 19v11" stroke="#FFB000" stroke-width="2.4"/><circle cx="40" cy="32" r="2.4" fill="#FFB000"/>',
    firework: '<g stroke="#FFB000" stroke-width="2.4" stroke-linecap="round"><path d="M24 24l0-15M24 24l0 15M24 24l15 0M24 24l-15 0"/></g><g stroke="#E4147E" stroke-width="2.4" stroke-linecap="round"><path d="M24 24l10-10M24 24l-10 10M24 24l10 10M24 24l-10-10"/></g><circle cx="24" cy="24" r="3" fill="currentColor"/><circle cx="24" cy="7" r="1.8" fill="#FFB000"/><circle cx="41" cy="24" r="1.8" fill="#FFB000"/><circle cx="36" cy="12" r="1.8" fill="#E4147E"/><circle cx="12" cy="36" r="1.8" fill="#E4147E"/>',
    tiffin: '<rect x="13" y="12" width="22" height="9" rx="2" fill="#FFB000" stroke="currentColor" stroke-width="2"/><rect x="13" y="21" width="22" height="9" rx="2" fill="#E4147E" stroke="currentColor" stroke-width="2"/><rect x="13" y="30" width="22" height="9" rx="2" fill="#00A8A0" stroke="currentColor" stroke-width="2"/><path d="M17 12V7h14v5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>',
    ribbon: '<path d="M24 22c-6-10-17-8-15-2 2 5 9 3 15 2zM24 22c6-10 17-8 15-2-2 5-9 3-15 2z" fill="#E4147E" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M22 23l-7 17 4-1 2 4 5-19zM26 23l7 17-4-1-2 4-5-19z" fill="#FFB000" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="24" cy="22" r="3.5" fill="#00A8A0" stroke="currentColor" stroke-width="1.8"/>',
    marigold: '<path d="' + scallopPath(24, 24, 17, 14, 1.2) + '" fill="#FF6A13" stroke="currentColor" stroke-width="2"/><path d="' + scallopPath(24, 24, 11.5, 11, 1.2, .2) + '" fill="#FFB000" stroke="currentColor" stroke-width="1.6"/><circle cx="24" cy="24" r="4.4" fill="#FF6A13" stroke="currentColor" stroke-width="1.4"/>',
    stadium: '<path d="M10 16h9l9 28H6z" fill="#FFF4DC" opacity=".18"/><rect x="7" y="6" width="15" height="10" rx="2" fill="currentColor"/><circle cx="11" cy="11" r="2" fill="#FFB000"/><circle cx="18" cy="11" r="2" fill="#FFB000"/><path d="M14.5 16v28" stroke="currentColor" stroke-width="2.4"/><path d="M27 34Q35 22 43 28Q35 40 27 34z" fill="#A8431E" stroke="currentColor" stroke-width="2"/><path d="M31 33l8-4" stroke="#FFF4DC" stroke-width="1.6"/>'
  };
  function icon(key, cls) { return '<svg class="' + (cls || 'cal-ico') + '" viewBox="0 0 48 48" aria-hidden="true" focusable="false">' + (ICONS[key] || ICONS.marigold) + '</svg>'; }

  var M = { BZ: BZ, RY: RY, defs: defs, glowFill: glowFill, rng: rng, f: f, scallopPath: scallopPath, petal: petal, marigold: marigold, garland: garland, strand: strand, tassel: tassel,
    stringLights: stringLights, lantern: lantern, rangoli: rangoli, kite: kite, sun: sun, leaf: leaf, ornament: ornament, bow: bow, confetti: confetti, sparkle: sparkle,
    paisley: paisley, paisleyHeart: paisleyHeart, heart: heart, colorCloud: colorCloud, chili: chili, mango: mango, jasmine: jasmine, firework: firework, waves: waves,
    stadium: stadium, football: football, pennant: pennant, star8: star8, star8Path: star8Path, geoLattice: geoLattice, icon: icon, ICONS: ICONS };
  if (typeof module !== 'undefined' && module.exports) module.exports = M; else root.CDMotifs = M;
})(this);

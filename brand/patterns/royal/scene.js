/* Curry District · Royal — "feature wall" room scene (vector, 1600×900 design space).
   RoyalScene.mount(el, { pattern, tile, panel, velvet, caption }) — the wall is a real CSS tiled
   background of the pattern SVG; furniture & lighting are an inline SVG overlay. */
(function () {
  var C = { ink: '#160B26', aub: '#2A1240', plum: '#4B1D52', emerald: '#0F4D3F', peacock: '#117C86', ruby: '#A3173F',
    gold: '#E9A63A', goldLt: '#F7D98A', goldDk: '#B7791F', ivory: '#FBF3E4' };
  var uid = 0;

  function arch(cx, s, ys, ya, bottom) {
    var h = ys - ya, c = (h * h - s * s) / (2 * s), r = s + c;
    return 'M' + (cx - s) + ' ' + bottom + 'V' + ys + 'A' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + ya +
      'A' + r + ' ' + r + ' 0 0 1 ' + (cx + s) + ' ' + ys + 'V' + bottom + 'Z';
  }
  function svg(o, id) {
    var g = function (n) { return n + id; };
    var V = o.velvet, out = [];
    out.push('<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">');
    out.push('<defs>' +
      '<linearGradient id="' + g('foil') + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + C.goldDk + '"/><stop offset=".38" stop-color="' + C.goldLt + '"/><stop offset=".58" stop-color="' + C.gold + '"/><stop offset="1" stop-color="' + C.goldDk + '"/></linearGradient>' +
      '<linearGradient id="' + g('brassH') + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + C.goldDk + '"/><stop offset=".3" stop-color="' + C.goldLt + '"/><stop offset=".55" stop-color="' + C.gold + '"/><stop offset="1" stop-color="' + C.goldDk + '"/></linearGradient>' +
      '<linearGradient id="' + g('rail') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.goldLt + '"/><stop offset=".5" stop-color="' + C.gold + '"/><stop offset="1" stop-color="' + C.goldDk + '"/></linearGradient>' +
      '<linearGradient id="' + g('ceil') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.ink + '" stop-opacity=".78"/><stop offset="1" stop-color="' + C.ink + '" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="' + g('mirror') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.aub + '"/><stop offset=".7" stop-color="' + C.ink + '"/><stop offset="1" stop-color="' + C.ink + '"/></linearGradient>' +
      '<linearGradient id="' + g('vel') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + C.ivory + '" stop-opacity=".2"/><stop offset=".35" stop-color="' + C.ivory + '" stop-opacity=".04"/><stop offset="1" stop-color="' + C.ink + '" stop-opacity=".45"/></linearGradient>' +
      '<radialGradient id="' + g('glow') + '"><stop offset="0" stop-color="' + C.goldLt + '" stop-opacity=".5"/><stop offset=".45" stop-color="' + C.gold + '" stop-opacity=".14"/><stop offset="1" stop-color="' + C.gold + '" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + g('flame') + '"><stop offset="0" stop-color="' + C.goldLt + '" stop-opacity=".9"/><stop offset="1" stop-color="' + C.gold + '" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + g('vig') + '" cx=".5" cy=".46" r=".75"><stop offset=".55" stop-color="' + C.ink + '" stop-opacity="0"/><stop offset="1" stop-color="' + C.ink + '" stop-opacity=".7"/></radialGradient>' +
      '</defs>');
    // ceiling shade + cornice
    out.push('<rect width="1600" height="260" fill="url(#' + g('ceil') + ')"/>');
    out.push('<rect width="1600" height="16" fill="' + C.ink + '"/><rect y="16" width="1600" height="4" fill="url(#' + g('rail') + ')"/>');
    // arched brass mirror with signage
    out.push('<path d="' + arch(800, 166, 330, 104, 640) + '" fill="none" stroke="' + C.goldDk + '" stroke-width="2"/>');
    out.push('<path d="' + arch(800, 152, 330, 120, 640) + '" fill="url(#' + g('mirror') + ')" stroke="url(#' + g('foil') + ')" stroke-width="14"/>');
    out.push('<path d="' + arch(800, 136, 330, 140, 640) + '" fill="none" stroke="' + C.goldLt + '" stroke-width="1.2" opacity=".75"/>');
    out.push('<path d="M700 180L742 140L900 520L858 560Z" fill="' + C.ivory + '" opacity=".05"/>');
    out.push('<g transform="translate(800 214)" fill="url(#' + g('foil') + ')">' +
      [0, 45, 90, 135, 180, 225, 270, 315].map(function (a) { return '<path d="M0 0C3 -4 3 -10 0 -14C-3 -10 -3 -4 0 0Z" transform="rotate(' + a + ')"/>'; }).join('') + '</g>');
    out.push('<text x="800" y="296" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-weight="600" font-size="60" fill="url(#' + g('foil') + ')">Curry</text>');
    out.push('<text x="800" y="358" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-weight="600" font-size="56" letter-spacing="-1" fill="url(#' + g('foil') + ')">District</text>');
    out.push('<path d="M716 384H884" stroke="' + C.goldDk + '" stroke-width="1"/><path d="M800 378l5 6 -5 6 -5 -6Z" fill="' + C.gold + '"/>');
    out.push('<text x="800" y="420" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="19" fill="' + C.goldLt + '" opacity=".9">Slow-simmered. Tandoor-fired.</text>');
    out.push('<text x="800" y="446" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="19" fill="' + C.goldLt + '" opacity=".9">Made for sharing.</text>');
    // wainscot
    out.push('<rect y="628" width="1600" height="272" fill="' + o.panel + '"/>');
    out.push('<rect y="620" width="1600" height="12" fill="url(#' + g('rail') + ')"/><rect y="638" width="1600" height="1.5" fill="' + C.goldDk + '"/>');
    for (var i = 0; i < 9; i++) {
      var x = 18 + i * 180;
      out.push('<rect x="' + x + '" y="664" width="164" height="190" fill="none" stroke="' + C.goldDk + '" stroke-width="1.4"/>' +
        '<rect x="' + (x + 9) + '" y="673" width="146" height="172" fill="none" stroke="' + C.goldDk + '" stroke-width=".7" opacity=".6"/>');
    }
    out.push('<rect y="872" width="1600" height="28" fill="' + C.ink + '"/><rect y="870" width="1600" height="3" fill="' + C.goldDk + '"/>');
    // pendant light pools on the wall (behind furniture)
    [430, 1170].forEach(function (x) {
      out.push('<ellipse cx="' + x + '" cy="420" rx="380" ry="330" fill="url(#' + g('glow') + ')" style="mix-blend-mode:screen"/>');
    });
    // channel-tufted banquette
    out.push('<rect x="104" y="546" width="1392" height="170" rx="28" fill="' + V + '"/>');
    for (var k = 0; k < 20; k++) {
      var cx = 112 + k * 68.8;
      out.push('<rect x="' + cx.toFixed(1) + '" y="552" width="64" height="160" rx="30" fill="' + V + '"/><rect x="' + cx.toFixed(1) + '" y="552" width="64" height="160" rx="30" fill="url(#' + g('vel') + ')"/>');
    }
    out.push('<rect x="84" y="702" width="1432" height="66" rx="20" fill="' + V + '"/><rect x="84" y="702" width="1432" height="66" rx="20" fill="url(#' + g('vel') + ')"/>');
    out.push('<path d="M100 712H1500" stroke="' + C.goldLt + '" stroke-width="1" opacity=".35"/>');
    out.push('<rect x="96" y="766" width="1408" height="36" fill="' + C.ink + '"/><rect x="96" y="798" width="1408" height="4" fill="url(#' + g('rail') + ')"/>');
    // tables, handi & votives
    [[430, 'handi'], [1170, 'katori']].forEach(function (t) {
      var x = t[0];
      out.push('<ellipse cx="' + x + '" cy="826" rx="128" ry="20" fill="' + C.goldDk + '"/>' +
        '<ellipse cx="' + x + '" cy="818" rx="128" ry="20" fill="url(#' + g('brassH') + ')"/>' +
        '<rect x="' + (x - 8) + '" y="834" width="16" height="48" fill="' + C.goldDk + '"/><ellipse cx="' + x + '" cy="884" rx="58" ry="7" fill="' + C.goldDk + '"/>');
      out.push('<ellipse cx="' + x + '" cy="816" rx="150" ry="34" fill="url(#' + g('glow') + ')" style="mix-blend-mode:screen"/>');
      if (t[1] === 'handi') {
        out.push('<ellipse cx="' + (x - 34) + '" cy="806" rx="38" ry="12" fill="' + C.ink + '" opacity=".35"/>' +
          '<path d="M' + (x - 70) + ' 790C' + (x - 70) + ' 812 ' + (x + 2) + ' 812 ' + (x + 2) + ' 790C' + (x + 2) + ' 774 ' + (x - 70) + ' 774 ' + (x - 70) + ' 790Z" fill="url(#' + g('foil') + ')"/>' +
          '<ellipse cx="' + (x - 34) + '" cy="780" rx="28" ry="6" fill="' + C.ink + '" stroke="' + C.goldLt + '" stroke-width="1.5"/>' +
          '<g class="steam" fill="none" stroke="' + C.ivory + '" stroke-width="2.4" stroke-linecap="round" opacity=".42">' +
          '<path d="M' + (x - 44) + ' 768c-8 -14 8 -22 0 -38s8 -22 0 -36"/><path d="M' + (x - 30) + ' 766c-8 -16 8 -24 0 -42s8 -24 0 -40"/><path d="M' + (x - 18) + ' 768c-6 -12 6 -18 0 -30"/></g>');
      } else {
        [[x - 54, 800], [x - 6, 806]].forEach(function (p) {
          out.push('<path d="M' + (p[0] - 22) + ' ' + p[1] + 'C' + (p[0] - 22) + ' ' + (p[1] + 14) + ' ' + (p[0] + 22) + ' ' + (p[1] + 14) + ' ' + (p[0] + 22) + ' ' + p[1] + 'Z" fill="url(#' + g('foil') + ')"/><ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="22" ry="5" fill="' + C.ruby + '" stroke="' + C.goldLt + '" stroke-width="1.2"/>');
        });
      }
      var vx = x + 58;
      out.push('<circle cx="' + vx + '" cy="786" r="46" fill="url(#' + g('flame') + ')" opacity=".55" style="mix-blend-mode:screen"/>' +
        '<rect x="' + (vx - 9) + '" y="790" width="18" height="22" rx="3" fill="' + C.goldLt + '" opacity=".35"/>' +
        '<path class="flame" d="M' + vx + ' 780c4 5 4 10 0 12c-4 -2 -4 -7 0 -12Z" fill="' + C.goldLt + '"/>');
    });
    // potted palms framing the wall
    [[44, 1], [1556, -1]].forEach(function (p) {
      var x = p[0], d = p[1], leaves = '';
      [[-34, 250], [-20, 300], [-8, 340], [6, 310], [20, 280], [34, 240], [48, 200]].forEach(function (l, j) {
        var a = l[0] * d, L = l[1], w = 34;
        leaves += '<g transform="translate(' + x + ' 756) rotate(' + a + ')"><path d="M0 0C' + w + ' -' + (L * .28) + ' ' + (w * .8) + ' -' + (L * .78) + ' 0 -' + L + 'C-' + (w * .8) + ' -' + (L * .78) + ' -' + w + ' -' + (L * .28) + ' 0 0Z" fill="' + (j % 2 ? C.emerald : C.ink) + '" stroke="' + C.goldDk + '" stroke-width="1.2"/><path d="M0 -6Q' + (4 * d) + ' -' + (L * .5) + ' 0 -' + (L - 12) + '" fill="none" stroke="' + C.goldDk + '" stroke-width="1"/></g>';
      });
      out.push('<g opacity=".96">' + leaves + '</g>');
      out.push('<path d="M' + (x - 62) + ' 752H' + (x + 62) + 'L' + (x + 46) + ' 880H' + (x - 46) + 'Z" fill="url(#' + g('brassH') + ')"/><rect x="' + (x - 66) + '" y="746" width="132" height="10" rx="3" fill="' + C.goldDk + '"/>');
    });
    // brass pendants
    [430, 1170].forEach(function (x) {
      out.push('<path d="M' + x + ' 20V190" stroke="' + C.goldDk + '" stroke-width="2"/>' +
        '<rect x="' + (x - 9) + '" y="184" width="18" height="12" rx="3" fill="url(#' + g('brassH') + ')"/>' +
        '<path d="M' + (x - 66) + ' 252C' + (x - 66) + ' 214 ' + (x - 34) + ' 196 ' + x + ' 196C' + (x + 34) + ' 196 ' + (x + 66) + ' 214 ' + (x + 66) + ' 252Z" fill="url(#' + g('brassH') + ')"/>' +
        '<path d="M' + (x - 58) + ' 236H' + (x + 58) + '" stroke="' + C.goldDk + '" stroke-width="1.2" opacity=".7"/>' +
        '<ellipse cx="' + x + '" cy="252" rx="66" ry="9" fill="' + C.ink + '"/><ellipse cx="' + x + '" cy="254" rx="40" ry="5" fill="' + C.goldLt + '"/>' +
        '<ellipse cx="' + x + '" cy="262" rx="110" ry="40" fill="url(#' + g('flame') + ')" opacity=".55" style="mix-blend-mode:screen"/>');
    });
    out.push('<rect width="1600" height="900" fill="url(#' + g('vig') + ')"/>');
    if (o.caption) {
      out.push('<g transform="translate(36 40)"><rect width="' + (o.caption.length * 10.4 + 48) + '" height="44" rx="22" fill="' + C.ink + '" opacity=".78"/>' +
        '<rect x=".5" y=".5" width="' + (o.caption.length * 10.4 + 47) + '" height="43" rx="21.5" fill="none" stroke="' + C.goldDk + '"/>' +
        '<text x="24" y="28" font-family="\'Hanken Grotesk\', system-ui, sans-serif" font-weight="600" font-size="15" letter-spacing="1.6" fill="' + C.goldLt + '">' + o.caption.toUpperCase() + '</text></g>');
    }
    out.push('</svg>');
    return out.join('');
  }

  function mount(el, o) {
    uid += 1;
    el.classList.add('rs-scene');
    el.style.backgroundImage = 'url("' + o.pattern + '")';
    el.style.backgroundSize = (o.tile * 100 / 1600) + '% auto';
    el.innerHTML = svg(o, 's' + uid);
  }
  window.RoyalScene = { mount: mount };
})();

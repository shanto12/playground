/* Curry District · Pitch Hub — Brand kit page (hub/brand/brand.js). Vanilla, no deps. */
(function () {
  'use strict';
  var d = document, de = d.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function sget(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function toast(m) { if (window.Hub && Hub.toast) Hub.toast(m); }
  function dir() { return de.getAttribute('data-dir') || 'both'; }
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      var ta = d.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      d.body.appendChild(ta); ta.select(); try { d.execCommand('copy') ? res() : rej(); } catch (e) { rej(e); } ta.remove();
    });
  }

  /* ───── WCAG contrast (relative luminance, WCAG 2.x) ───── */
  function lum(hex) {
    hex = hex.replace('#', '');
    var c = [0, 2, 4].map(function (i) {
      var v = parseInt(hex.substr(i, 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  window.BrandKit = { ratio: ratio };
  $$('[data-aa] tr[data-fg]').forEach(function (tr) {
    var r = ratio(tr.getAttribute('data-fg'), tr.getAttribute('data-bg'));
    var v = r >= 7 ? ['aaa', 'AAA ✓'] : r >= 4.5 ? ['aa', 'AA ✓'] : r >= 3 ? ['large', 'Large text only'] : ['avoid', 'Avoid ✕'];
    var rr = Math.floor(r * 100) / 100; /* round down so we never overstate */
    tr.querySelector('.co-aa__ratio').textContent = rr.toFixed(2) + ':1';
    var b = tr.querySelector('.co-aa__v'); b.setAttribute('data-v', v[0]); b.textContent = v[1];
  });

  /* ───── Swatches: tap to copy ───── */
  d.addEventListener('click', function (e) {
    var b = e.target.closest('.co-sw button[data-hex]'); if (!b) return;
    var hex = b.getAttribute('data-hex');
    copy(hex).then(function () { toast('Copied ' + hex); }, function () { toast(hex); });
    b.classList.add('is-copied'); setTimeout(function () { b.classList.remove('is-copied'); }, 1300);
  });

  /* ───── Chooser: scroll to the zone when switching ───── */
  var zone = $('#directions'), chooser = $('.bk-chooser');
  d.addEventListener('click', function (e) {
    var t = e.target.closest('[data-go="zone"]'); if (!t || !zone) return;
    if (t.tagName === 'A') e.preventDefault();
    setTimeout(function () {
      var top = zone.getBoundingClientRect().top + window.pageYOffset - (window.innerWidth >= 900 ? 64 : 0);
      if (Math.abs(window.pageYOffset - top) > 4) window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      onScroll();
    }, 30);
  });

  /* ───── 60-second dial ───── */
  var dialFill = $('.bk-dial__fill'), dialT = $('.bk-dial__t'), dialBox = $('[data-dial]'), chName = $('[data-chname]'), prog = $('.bk-progress');
  var lastSec = -1, ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var cur = dir(); if (cur === 'both') return;
      var st = $('#story-' + cur); if (!st) return;
      var r = st.getBoundingClientRect(), vh = window.innerHeight;
      var p = (vh * 0.35 - r.top) / Math.max(1, r.height - vh * 0.6);
      p = Math.max(0, Math.min(1, p));
      var sec = Math.round(p * 60);
      if (dialFill) dialFill.style.strokeDashoffset = (113.1 * (1 - p)).toFixed(1);
      if (prog) prog.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      if (sec !== lastSec) {
        lastSec = sec;
        if (dialT) dialT.textContent = '0:' + (sec < 10 ? '0' : '') + (sec === 60 ? '' : sec) + (sec === 60 ? '' : '');
        if (sec === 60 && dialT) dialT.textContent = '1:00';
        if (dialBox) dialBox.setAttribute('aria-label', 'Story progress: ' + sec + ' of 60 seconds');
      }
      var name = 'Intro';
      $$('.ch', st).forEach(function (c) { if (c.getBoundingClientRect().top < vh * 0.4) name = c.getAttribute('data-ch'); });
      if (chName && chName.textContent !== name) chName.textContent = name;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  d.addEventListener('hub:direction', function () { lastSec = -1; onScroll(); playVisible(); });

  /* ───── Compare quick buttons ───── */
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-ba]'); if (!b) return;
    var panel = b.closest('.tabs__panel'), r = panel && panel.querySelector('.ba__range'); if (!r) return;
    var to = +b.getAttribute('data-ba'), from = +r.value;
    if (reduce) { r.value = to; r.dispatchEvent(new Event('input')); return; }
    var t0 = null;
    (function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 450), e2 = 1 - Math.pow(1 - k, 3); r.value = from + (to - from) * e2; r.dispatchEvent(new Event('input')); if (k < 1) requestAnimationFrame(step); })(performance.now());
  });

  /* ───── Icons: show more ───── */
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-more]'); if (!b) return;
    var g = d.getElementById(b.getAttribute('data-more')); var open = !g.classList.contains('is-open');
    g.classList.toggle('is-open', open); b.setAttribute('aria-expanded', String(open));
    b.textContent = open ? 'Show fewer' : 'Show 19 more (utility & social)';
  });

  /* ───── Motion demos ───── */
  function play(stage) {
    if (!stage || reduce) return;
    stage.classList.remove('is-playing'); void stage.offsetWidth; stage.classList.add('is-playing');
  }
  d.addEventListener('click', function (e) { var b = e.target.closest('[data-play]'); if (b) play(b.closest('[data-demo]')); });
  var demoIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting && !x.target.__played) { x.target.__played = true; play(x.target); } });
  }, { threshold: 0.4 }) : null;
  function playVisible() { if (demoIO) $$('[data-demo]').forEach(function (s) { demoIO.unobserve(s); demoIO.observe(s); }); }
  playVisible();

  /* ───── Pattern viewer ───── */
  var PT = {
    bazaar: { ways: { sunset: '#FF6A13', night: '#1D1147', fresh: '#00A8A0' }, items: [
      ['01-marigold-garland', 'Marigold Garland', 240, 'Feature wallpaper · party-tray sleeves · catering wrap', ['sunset', 'night', 'fresh']],
      ['02-chili-lime', 'Chili & Lime', 320, 'Bag tissue · delivery stickers · web backgrounds · aprons', ['sunset', 'night', 'fresh']],
      ['03-block-print-booti', 'Block-Print Booti', 240, 'Napkins · menu backs · quiet walls & booths', ['sunset', 'night', 'fresh']],
      ['04-truck-art-rangoli', 'Truck-Art Rangoli', 240, 'Feature wall · catering boxes · cup sleeves · stories', ['sunset', 'night', 'fresh']],
      ['05-chai-time', 'Chai Time', 320, 'Chai & Coolers menu · cup sleeves · loyalty cards', ['sunset', 'night', 'fresh']],
      ['06-spice-confetti', 'Spice Confetti', 320, 'Web & app backgrounds · box interiors · safest behind text', ['sunset', 'night', 'fresh']],
      ['07-jaipur-arches', 'Jaipur Arches', 240, 'Feature wall · window film · box lids · hero banners', ['sunset', 'night', 'fresh']],
      ['08-tiffin-stripes', 'Tiffin Stripes', 240, 'Lunch-rush bags · packing tape · kids’ menu', ['sunset', 'night', 'fresh']]] },
    royal: { ways: { midnight: '#160B26', emerald: '#0F4D3F', ivory: '#FBF3E4', ruby: '#A3173F', peacock: '#117C86' }, items: [
      ['01-jali-lattice', 'Jali Lattice', 240, 'Wallpaper · menu covers · web hero · gift-box lids', ['midnight', 'emerald', 'ivory']],
      ['02-mehrab-trellis', 'Mehrab Trellis', 240, 'Feature walls · bag wraps · catering boxes · backdrops', ['midnight', 'emerald', 'ivory']],
      ['03-paisley-vine', 'Paisley Vine', 320, 'Tissue paper · napkins · sweet boxes · social backgrounds', ['midnight', 'emerald', 'ivory', 'ruby']],
      ['04-marigold-damask', 'Marigold Damask', 320, 'Wallpaper · festive packaging · gift cards · runners', ['midnight', 'emerald', 'ivory', 'ruby']],
      ['05-peacock-eye', 'Peacock Eye', 240, 'Accent walls · cushions · cup sleeves · splash screens', ['midnight', 'emerald', 'ivory', 'peacock']],
      ['06-star-tile', 'Star Tile', 240, 'Bar fronts · coasters · floor graphics · dividers', ['midnight', 'emerald', 'ivory']],
      ['07-spice-botanical', 'Spice Botanical', 320, 'Menus · spice labels · napkins · bag stickers', ['midnight', 'emerald', 'ivory']],
      ['08-brass-dots-diamonds', 'Brass Dots & Diamonds', 240, 'Menu backgrounds · business cards · web body', ['midnight', 'emerald', 'ivory']]] }
  };
  var pv = $('[data-pv]'), pvState = { d: 'bazaar', i: 0, way: 'sunset', s: 1 }, pvLast = null;
  function pvRender() {
    var set = PT[pvState.d], it = set.items[pvState.i];
    if (it[4].indexOf(pvState.way) < 0) pvState.way = it[4][0];
    var c = $('[data-pv-canvas]', pv);
    c.style.setProperty('--pt', 'url(assets/patterns/' + pvState.d + '/' + it[0] + '-' + pvState.way + '.svg)');
    c.style.setProperty('--pts', Math.round(it[2] * pvState.s * (window.innerWidth < 600 ? 0.75 : 1)) + 'px');
    $('[data-pv-title]', pv).textContent = it[1];
    $('[data-pv-uses]', pv).textContent = 'Best for: ' + it[3];
    $('[data-pv-count]', pv).textContent = (pvState.i + 1) + ' / ' + set.items.length;
    $('[data-pv-ways]', pv).innerHTML = it[4].map(function (w) { return '<button type="button" data-w="' + w + '" aria-pressed="' + (w === pvState.way) + '"><i style="--sw:' + set.ways[w] + '"></i>' + w + '</button>'; }).join('');
    $$('[data-pv-scale] button', pv).forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-s') === pvState.s)); });
  }
  function inertAll(on) {
    $$('body > *').forEach(function (el) { if (el === pv || el.tagName === 'SCRIPT') return; if (on) { if (!el.inert) { el.inert = true; el.setAttribute('data-bk-inert', ''); } } else if (el.hasAttribute('data-bk-inert')) { el.inert = false; el.removeAttribute('data-bk-inert'); } });
  }
  function pvOpen(dd, i, way, trigger) {
    pvState = { d: dd, i: i, way: way, s: 1 }; pvLast = trigger; pv.hidden = false; pvRender();
    inertAll(true); de.classList.add('hub-locked'); $('[data-pv-close]', pv).focus({ preventScroll: true });
  }
  function pvClose() { pv.hidden = true; inertAll(false); de.classList.remove('hub-locked'); if (pvLast) pvLast.focus({ preventScroll: true }); }
  function pvGo(k) { var n = PT[pvState.d].items.length; pvState.i = (pvState.i + k + n) % n; pvRender(); }
  d.addEventListener('click', function (e) {
    var t = e.target.closest('.pt-tile');
    if (t) { var st = t.closest('.bk-story'); pvOpen(st.getAttribute('data-theme'), +t.getAttribute('data-pt'), t.getAttribute('data-way'), t); return; }
    if (!pv || pv.hidden) return;
    if (e.target.closest('[data-pv-close]')) pvClose();
    else if (e.target.closest('[data-pv-prev]')) pvGo(-1);
    else if (e.target.closest('[data-pv-next]')) pvGo(1);
    else if (e.target.closest('[data-w]')) { pvState.way = e.target.closest('[data-w]').getAttribute('data-w'); pvRender(); }
    else if (e.target.closest('[data-s]')) { pvState.s = +e.target.closest('[data-s]').getAttribute('data-s'); pvRender(); }
  });
  d.addEventListener('keydown', function (e) {
    if (!pv || pv.hidden) return;
    if (e.key === 'Escape') pvClose(); else if (e.key === 'ArrowRight') pvGo(1); else if (e.key === 'ArrowLeft') pvGo(-1);
  });
  if (pv) {
    var sx = null;
    $('[data-pv-canvas]', pv).addEventListener('pointerdown', function (e) { sx = e.clientX; });
    $('[data-pv-canvas]', pv).addEventListener('pointerup', function (e) { if (sx == null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) pvGo(dx < 0 ? 1 : -1); });
  }

  /* ───── Quiz ───── */
  var Q = [
    { t: 'Vibe', q: 'A Friday night at Curry District should feel like…', o: [
      ['A street festival', 'Bright, loud, everyone talking at once', 'a'], ['A warm family dinner party', 'Relaxed and easygoing', 'ab'], ['A candlelit celebration', 'Rich, calm, a little bit special', 'b']] },
    { t: 'Crowd', q: 'Who do you most want to win over next?', o: [
      ['Families, teams & delivery-app regulars', 'Busy, hungry, fast decisions', 'a'], ['Honestly, everybody', 'The whole neighborhood', 'ab'], ['Date nights, birthdays & catering clients', 'Planned, special occasions', 'b']] },
    { t: 'Price feel', q: 'When guests see the bill, they should think…', o: [
      ['“What a deal for all that flavor!”', 'Generous and great value', 'a'], ['“Fair for what we got.”', 'Honest, no surprises', 'ab'], ['“Worth it. That felt special.”', 'A small treat', 'b']] },
    { t: 'Music', q: 'What’s playing in the dining room?', o: [
      ['Bollywood hits & bhangra', 'Volume up', 'a'], ['Whatever the regulars like', 'Background, friendly', 'ab'], ['Soft instrumental & lounge', 'Low and warm', 'b']] },
    { t: 'Decor', q: 'Pick a wall for the dining room.', o: [
      ['Truck-art mural & marigold garlands', 'Color everywhere', 'a'], ['Warm wood & a few framed prints', 'Simple and cozy', 'ab'], ['Jali screens, brass lamps & jewel paint', 'Moody and rich', 'b']] },
    { t: 'Personality', q: 'Pick the three words that fit you best.', o: [
      ['Playful · loud · proud', '', 'a'], ['Friendly · easygoing · local', '', 'ab'], ['Gracious · rich · polished', '', 'b']] }
  ];
  var QKEY = 'cd-brand-quiz', qz = $('[data-quiz]'), ans = [], qi = 0;
  try { var sv = JSON.parse(sget(QKEY) || 'null'); if (sv && Array.isArray(sv.a)) { ans = sv.a.slice(0, 6); qi = Math.min(ans.length, 6); } } catch (e) {}
  var ICONS = { a: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3.5"/></svg>',
    ab: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 12h16M12 4v16" opacity=".35"/><circle cx="12" cy="12" r="7"/></svg>',
    b: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V11a7 7 0 0 1 14 0v10"/><path d="M3 21h18M12 7.5c-1 1.2-1 2.2 0 3.3"/></svg>' };
  function score() {
    var a = 0, b = 0;
    ans.forEach(function (k) { if (k === 'a') a += 2; else if (k === 'b') b += 2; else { a += 1; b += 1; } });
    var rec = a - b >= 3 ? 'bazaar' : b - a >= 3 ? 'royal' : 'blend';
    return { a: a, b: b, rec: rec };
  }
  var RULE = '<details class="qz__rule"><summary>How the scoring works</summary><p>Each answer gives <b>2 points</b> to the direction it matches, or <b>1 point to each</b> if it sits in the middle. Six questions, so each side scores 0–12. If one side leads by <b>3 or more</b>, that’s our read. Closer than 3? You’re a blend. That’s the whole formula, no secret sauce.</p></details>';
  function save() { sset(QKEY, JSON.stringify({ a: ans })); }
  function renderQ() {
    if (!qz) return;
    if (qi >= Q.length) return renderResult();
    var q = Q[qi], dots = Q.map(function (_, i) { return '<i class="' + (i < qi ? 'is-done' : i === qi ? 'is-now' : '') + '"></i>'; }).join('');
    qz.innerHTML = '<div class="qz__card"><div class="qz__top"><span class="qz__count">Question ' + (qi + 1) + ' of 6 · ' + q.t + '</span><span class="qz__dots" aria-hidden="true">' + dots + '</span></div>' +
      '<div class="qz__fade"><h3 class="qz__q" tabindex="-1">' + q.q + '</h3><p class="qz__topic">Tap the answer that feels most like you.</p><ul class="qz__opts">' +
      q.o.map(function (o) { return '<li><button type="button" class="qz__opt" data-k="' + o[2] + '" aria-pressed="' + (ans[qi] === o[2]) + '"><span class="qz__ico">' + ICONS[o[2]] + '</span><span>' + o[0] + (o[1] ? '<small>' + o[1] + '</small>' : '') + '</span></button></li>'; }).join('') +
      '</ul></div><div class="qz__foot"><button type="button" class="btn btn--ghost btn--sm" data-qz-back' + (qi === 0 ? ' disabled style="opacity:.4"' : '') + '>← Back</button><span class="muted" style="font-size:.875rem">' + ans.filter(Boolean).length + ' of 6 answered</span></div>' + RULE + '</div>';
  }
  function renderResult() {
    var s = score();
    var title = s.rec === 'bazaar' ? 'A · <em>Bazaar</em>' : s.rec === 'royal' ? 'B · <em>Royal</em>' : 'A <em>blend</em>';
    var why = s.rec === 'bazaar'
      ? 'Your answers lean <strong>bright, busy and family-loud</strong>: festival energy, value you can taste, music up. That is Bazaar’s home turf. It will make the lunch rush, delivery apps and Reels pop.'
      : s.rec === 'royal'
      ? 'Your answers lean <strong>warm, rich and occasion-ready</strong>: candlelight, celebrations, “that felt special”. That is Royal’s sweet spot. It raises how premium the room and the takeout feel.'
      : 'Your answers sit <strong>right between the two</strong>. That usually means one direction should lead and the other should season it. Peek at the blend board below, then pick a leader.';
    var log = ans.map(function (k, i) { var o = Q[i].o.filter(function (x) { return x[2] === k; })[0]; var pts = k === 'a' ? '+2 A' : k === 'b' ? '+2 B' : '+1 A · +1 B'; return '<li><b>' + Q[i].t + ': ' + (o ? o[0] : '') + '</b><span>' + pts + '</span></li>'; }).join('');
    qz.innerHTML = '<div class="qz__card qz__res"><div class="qz__fade"><p class="qz__verdict"><small>Our read</small><b tabindex="-1">' + title + '</b></p>' +
      '<div class="qz__bars"><div class="qz__bar"><span style="text-align:left">A · Bazaar</span><i style="--w:' + (s.a / 12 * 100) + '%;--g:var(--g-bazaar)"></i><span>' + s.a + '</span></div>' +
      '<div class="qz__bar"><span style="text-align:left">B · Royal</span><i style="--w:' + (s.b / 12 * 100) + '%;--g:var(--g-gold)"></i><span>' + s.b + '</span></div></div>' +
      '<p class="qz__why">' + why + '</p><p class="muted" style="font-size:.875rem;margin:0 0 6px">The rule: 2 points per matching answer, 1 each for a middle answer; a lead of 3+ wins, otherwise it’s a blend. You scored ' + s.a + '–' + s.b + '.</p>' +
      '<details class="qz__rule"><summary>See every answer</summary><ul class="qz__log">' + log + '</ul></details>' +
      '<div class="qz__btns"><button type="button" class="btn btn--primary" data-qz-use>Use this as my pick</button>' + (s.rec === 'blend' ? '<a class="btn btn--ghost" href="#blend">See the blend board</a>' : '<button type="button" class="btn btn--ghost" data-dir-set="' + s.rec + '" data-go="zone">Revisit ' + (s.rec === 'bazaar' ? 'A' : 'B') + '’s story</button>') + '<button type="button" class="btn btn--ghost" data-qz-reset>Retake</button></div></div></div>';
  }
  if (qz) {
    renderQ();
    qz.addEventListener('click', function (e) {
      var o = e.target.closest('.qz__opt');
      if (o) {
        ans[qi] = o.getAttribute('data-k'); save();
        $$('.qz__opt', qz).forEach(function (x) { x.setAttribute('aria-pressed', String(x === o)); });
        setTimeout(function () { qi++; renderQ(); var h = $('.qz__q,.qz__verdict b', qz); if (h) h.focus({ preventScroll: true }); }, reduce ? 0 : 280);
        return;
      }
      if (e.target.closest('[data-qz-back]')) { if (qi > 0) { qi--; renderQ(); } return; }
      if (e.target.closest('[data-qz-reset]')) { ans = []; qi = 0; save(); renderQ(); return; }
      if (e.target.closest('[data-qz-use]')) {
        var s = score(), v = s.rec === 'bazaar' ? 'A · Bazaar' : s.rec === 'royal' ? 'B · Royal' : 'A blend';
        var r = $('input[name="pk-dir"][value="' + v + '"]'); if (r) { r.checked = true; pickSave(); }
        var p = $('#pick'); if (p) p.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
        toast('Pick set to ' + v);
      }
    });
  }

  /* ───── Your pick ───── */
  var PKEY = 'cd-brand-pick', pk = $('[data-pick]');
  function pickData() {
    var r = $('input[name="pk-dir"]:checked');
    return { dir: r ? r.value : '', name: $('#pk-name').value.trim(), love: $('#pk-love').value.trim(), change: $('#pk-change').value.trim() };
  }
  function summary() {
    var p = pickData(), s = score(), lines = ['Curry District · Brand Glow-Up — our pick', ''];
    lines.push('Direction: ' + (p.dir || '(not chosen yet)'));
    if (ans.filter(Boolean).length === 6) lines.push('Quiz said: ' + (s.rec === 'bazaar' ? 'A · Bazaar' : s.rec === 'royal' ? 'B · Royal' : 'A blend') + ' (Bazaar ' + s.a + ' · Royal ' + s.b + ')');
    if (p.love) lines.push('', 'What we love:', p.love);
    if (p.change) lines.push('', 'What we would change:', p.change);
    lines.push('', '— ' + (p.name || 'The Curry District team') + ', ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    lines.push('Brand kit: ' + (location.protocol.indexOf('http') === 0 && !/^(localhost|127\.)/.test(location.hostname) ? location.href.split('#')[0] : 'https://curry-district-pitch.netlify.app/brand/'));
    return lines.join('\n');
  }
  var saveT;
  function pickRender() {
    var out = $('[data-pk-out]'); if (!out) return; var txt = summary(); out.textContent = txt;
    var cfg = window.HUB_CONFIG || {};
    var m = $('[data-pk-mail]'); if (m && cfg.email) m.href = 'mailto:' + cfg.email + '?subject=' + encodeURIComponent('Curry District — our brand pick') + '&body=' + encodeURIComponent(txt);
    var w = $('[data-pk-wa]'); if (w && cfg.whatsapp) w.href = 'https://wa.me/' + String(cfg.whatsapp).replace(/\D/g, '') + '?text=' + encodeURIComponent(txt);
  }
  function pickSave() {
    pickRender(); clearTimeout(saveT);
    saveT = setTimeout(function () {
      var ok = sset(PKEY, JSON.stringify(pickData())), st = $('[data-pk-status]');
      if (st) st.textContent = ok ? 'Saved on this phone · ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'Couldn’t save on this browser. Copy the summary instead.';
    }, 350);
  }
  if (pk) {
    try {
      var pd = JSON.parse(sget(PKEY) || 'null');
      if (pd) { if (pd.dir) { var rr = $('input[name="pk-dir"][value="' + pd.dir + '"]'); if (rr) rr.checked = true; } $('#pk-name').value = pd.name || ''; $('#pk-love').value = pd.love || ''; $('#pk-change').value = pd.change || ''; var st0 = $('[data-pk-status]'); if (st0 && (pd.dir || pd.love)) st0.textContent = 'Restored from this phone.'; }
    } catch (e) {}
    pk.addEventListener('input', pickSave); pk.addEventListener('change', pickSave);
    pk.addEventListener('click', function (e) {
      if (e.target.closest('[data-pk-copy]')) { copy(summary()).then(function () { toast('Summary copied — paste it in a text or email'); }, function () { toast('Copy failed — select the text instead'); }); }
      else if (e.target.closest('[data-pk-share]')) {
        var data = { title: 'Curry District — our brand pick', text: summary() };
        if (navigator.share) navigator.share(data).catch(function () {}); else copy(summary()).then(function () { toast('Sharing isn’t available here, so we copied it'); });
      } else if (e.target.closest('[data-pk-clear]')) {
        $$('input[name="pk-dir"]').forEach(function (r) { r.checked = false; }); ['#pk-name', '#pk-love', '#pk-change'].forEach(function (s) { $(s).value = ''; });
        try { localStorage.removeItem(PKEY); } catch (er) {} pickRender(); var st = $('[data-pk-status]'); if (st) st.textContent = 'Cleared.';
      }
    });
    pickRender();
  }
  onScroll();
})();

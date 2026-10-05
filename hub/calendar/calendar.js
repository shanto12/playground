/* Curry District · Festival calendar page. Needs hub.js (window.Hub), moments.js (CD_CAL), motifs.js (CDMotifs). */
(function () {
  'use strict';
  var D = window.CD_CAL, MO = window.CDMotifs, H = window.Hub, doc = document, de = doc.documentElement;
  if (!D || !MO) return;
  var BY = {}; D.moments.forEach(function (m) { BY[m.id] = m; });
  var MONTH = {}; D.months.forEach(function (m) { MONTH[m.key] = m; });
  var POSTS = {}; D.posts.forEach(function (p) { POSTS[p.id] = p; });
  var A = 'assets/calendar/';
  var state = { filter: 'all' };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function svg(p, cls) { return '<svg class="' + (cls || 'i') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; }
  var I = {
    chev: '<path d="M9 5l7 7-7 7"/>', cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M12 13v5M9.5 15.5h5"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>', close: '<path d="M6 6l12 12M18 6 6 18"/>',
    ig: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r=".8" fill="currentColor"/>',
    story: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M10 6h4"/>', gbp: '<path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    store: '<path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8Z"/><path d="M9 10V6.5a3 3 0 0 1 6 0V10"/>', kpi: '<path d="M4 20h16"/><path d="M6 16l4-5 3 3 5-7"/>'
  };
  function dateBits(m) { return esc(m.dateShort) + (m.approx ? ' · approx' : ''); }
  function catLabel(m) { return (m.cat === 'indian' ? 'Indian celebration' : 'US & local') + (m.catering ? ' · Catering-led' : ''); }
  function dots(m) { return '<span class="mom__dots" aria-hidden="true"><i class="dot ' + (m.cat === 'indian' ? 'dot--in' : 'dot--us') + '"></i>' + (m.catering ? '<i class="dot dot--ca"></i>' : '') + '</span>'; }
  function momBtn(m) {
    return '<li data-cat="' + m.cat + '" data-catering="' + (m.catering ? 1 : 0) + '"><button type="button" class="mom" data-moment="' + m.id + '" aria-haspopup="dialog">' +
      '<span class="mom__ico">' + MO.icon(m.icon, 'mom__svg') + '</span><span class="mom__txt"><b>' + esc(m.short) + '</b><small>' + dateBits(m) + '</small></span>' + dots(m) + svg(I.chev, 'mom__go') + '</button></li>';
  }

  /* ───── Today → current rail month ───── */
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var tKey = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
  var keys = D.months.map(function (m) { return m.key; });
  var curKey = keys.indexOf(tKey) > -1 ? tKey : (tKey < keys[0] ? keys[0] : keys[0]);
  function toDate(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }

  /* ───── Rail ───── */
  function renderRail() {
    var track = doc.querySelector('[data-rail-track]'); if (!track) return;
    track.innerHTML = D.months.map(function (mo) {
      var list = D.moments.filter(function (m) { return m.month === mo.key; });
      return '<article class="mcard' + (mo.key === curKey ? ' is-now' : '') + '" id="m-' + mo.key + '" style="--mg:' + mo.g + ';--mry:' + mo.ry + '" aria-label="' + mo.name + ' ' + mo.year + '">' +
        '<header class="mcard__head"><span class="mcard__mon">' + mo.short + '</span><span class="mcard__yr">' + mo.year + '</span>' + (mo.key === curKey ? '<span class="mcard__now">This month</span>' : '') + '<span class="mcard__season">' + esc(mo.season) + '</span></header>' +
        '<ul class="mcard__list" role="list">' + list.map(momBtn).join('') + '</ul><p class="mcard__empty" hidden>Nothing in this filter. A quiet month for planning.</p></article>';
    }).join('');
    var jump = doc.querySelector('[data-mjump]');
    if (jump) jump.innerHTML = D.months.map(function (mo) { return '<a href="#m-' + mo.key + '" data-jump="' + mo.key + '"' + (mo.key === curKey ? ' aria-current="true"' : '') + '>' + mo.short + '</a>'; }).join('');
    var all = doc.querySelector('[data-count-all]'); if (all) all.textContent = D.moments.length;
    requestAnimationFrame(function () { scrollToMonth(curKey, true); });
  }
  function scrollToMonth(key, instant) {
    var track = doc.querySelector('[data-rail-track]'), card = doc.getElementById('m-' + key); if (!track || !card) return;
    var left = card.offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft || 0);
    track.scrollTo({ left: Math.max(0, left), behavior: instant || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  function applyFilter() {
    doc.querySelectorAll('[data-cal-filter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-cal-filter') === state.filter)); });
    doc.querySelectorAll('.mcard').forEach(function (card) {
      var vis = 0;
      card.querySelectorAll('.mcard__list > li').forEach(function (li) {
        var ok = state.filter === 'all' || (state.filter === 'catering' ? li.getAttribute('data-catering') === '1' : li.getAttribute('data-cat') === state.filter);
        li.hidden = !ok; if (ok) vis++;
      });
      card.querySelector('.mcard__empty').hidden = vis > 0;
      card.classList.toggle('is-quiet', vis === 0);
    });
  }

  /* ───── This month ───── */
  function thumbPair(postId, alt) {
    return '<div class="now__art">' + ['bazaar', 'royal'].map(function (d) {
      return '<a class="now__img" data-preview="' + d + '" href="' + A + 'post-' + postId + '-' + d + '.png" data-lightbox="now" data-caption="' + esc(alt) + ' · ' + (d === 'bazaar' ? 'A · Bazaar' : 'B · Royal') + '"><img src="' + A + 'post-' + postId + '-' + d + '-thumb.jpg" alt="' + esc(alt) + ', ' + d + ' direction Instagram post" width="600" height="750"></a>';
    }).join('') + '</div>';
  }
  function renderNow() {
    var host = doc.querySelector('[data-now]'); if (!host) return;
    var mo = MONTH[curKey], list = D.moments.filter(function (m) { return m.month === curKey; });
    var lead = list.filter(function (m) { return m.post; })[0] || list[0];
    var upcoming = D.moments.filter(function (m) { return !m.ics.marker && toDate(m.ics.start) >= today; }).sort(function (a, b) { return toDate(a.ics.start) - toDate(b.ics.start); });
    var next = upcoming[0], days = next ? Math.round((toDate(next.ics.start) - today) / 864e5) : null;
    var idx = keys.indexOf(curKey), soon = D.moments.filter(function (m) { var k = keys.indexOf(m.month); return k > idx && k <= idx + 2; }).slice(0, 4);
    var mon = +curKey.slice(5, 7), football = (mon >= 8 && mon <= 11) && BY['football-fridays'];
    host.innerHTML =
      '<div class="now__card" style="--mg:' + mo.g + ';--mry:' + mo.ry + '">' +
        '<div class="now__main"><p class="now__kick">' + mo.name + ' ' + mo.year + ' · ' + esc(mo.season) + '</p>' +
          '<ul class="now__list" role="list">' + list.map(momBtn).join('') + (football ? momBtn(football).replace('<li ', '<li class="now__live" ') : '') + '</ul>' +
          (football ? '<p class="now__note">Friday-night football is live through November, so its plan applies now too.</p>' : '') +
          (next ? '<div class="now__count"><span class="now__days">' + days + '</span><span><b>days to ' + esc(next.short) + '</b><small>' + esc(next.dateLabel) + (next.approx ? ' · approx, verify' : '') + ' · ' + esc(next.lead) + '</small></span></div>' : '') +
        '</div>' + (lead && lead.post ? thumbPair(lead.post, lead.name) : '') +
      '</div>' +
      (soon.length ? '<div class="now__soon"><p class="now__soonh">Prep next</p><ul class="now__list now__list--soon" role="list">' + soon.map(momBtn).join('') + '</ul></div>' : '');
  }

  /* ───── Detail sheet ───── */
  var sheet = doc.querySelector('[data-csheet]'), lastFocus = null;
  var CH = [['ig', 'Instagram post', I.ig], ['story', 'Instagram story', I.story], ['gbp', 'Google Business post', I.gbp], ['store', 'In-store & packaging sticker', I.store]];
  function seed(text, dir) {
    var lbl = dir === 'bz' ? 'A · Bazaar' : 'B · Royal';
    return '<div class="seed seed--' + dir + '" data-preview="' + (dir === 'bz' ? 'bazaar' : 'royal') + '"><span class="seed__lbl">' + lbl + '</span><p class="seed__txt">' + esc(text) + '</p>' +
      '<button type="button" class="seed__copy" data-copy="' + esc(text) + '" aria-label="Copy ' + lbl + ' caption">' + svg(I.copy) + '<span>Copy</span></button></div>';
  }
  function creative(m) {
    if (m.post) {
      return '<div class="cs-art">' + ['bazaar', 'royal'].map(function (d) {
        return '<a class="cs-art__img" data-preview="' + d + '" href="' + A + 'post-' + m.post + '-' + d + '.png" data-lightbox="cs-' + m.id + '" data-caption="' + esc(m.name) + ' · ' + (d === 'bazaar' ? 'A · Bazaar' : 'B · Royal') + ' · 1080×1350"><img src="' + A + 'post-' + m.post + '-' + d + '-thumb.jpg" alt="' + esc(m.name) + ' Instagram post, ' + d + ' direction" width="600" height="750"><span class="cs-art__tag">' + (d === 'bazaar' ? 'A · Bazaar' : 'B · Royal') + '</span></a>';
      }).join('') + '</div>';
    }
    if (m.kit && m.kit.indexOf('sticker') === 0) {
      var k = m.kit.replace('sticker-', '');
      return '<div class="cs-kit"><div class="cs-art cs-art--stk">' + ['bazaar', 'royal'].map(function (d) {
        return '<a class="cs-art__img" data-preview="' + d + '" href="' + A + 'sticker-' + k + '-' + d + '.png" data-lightbox="cs-' + m.id + '" data-caption="' + esc(D.kit[m.kit].title) + ' · 2 in round"><img src="' + A + 'sticker-' + k + '-' + d + '-thumb.jpg" alt="' + esc(D.kit[m.kit].title) + ', ' + d + ' direction" width="600" height="600"></a>';
      }).join('') + '</div><p class="muted cs-kit__txt"><b>Creative:</b> the ' + esc(D.kit[m.kit].title) + ' carries this moment in store. Posts follow the same system as the 12 samples.</p></div>';
    }
    return '<div class="cs-text"><div class="cs-text__card" data-preview="bazaar" data-theme="bazaar">' + MO.icon(m.icon, 'cs-text__ico') + '<p>' + esc(m.channels.store.bz) + '</p></div><div class="cs-text__card" data-preview="royal" data-theme="royal">' + MO.icon(m.icon, 'cs-text__ico') + '<p>' + esc(m.channels.store.ry) + '</p></div>' +
      '<p class="muted cs-kit__txt"><b>Creative:</b> text-led greeting card, using the ' + (m.kit === 'topper' ? 'festival bag topper on catering orders' : 'same post system') + '. No flags, deities or sacred symbols.</p></div>';
  }
  function openMoment(id, trigger) {
    var m = BY[id]; if (!m || !sheet) return;
    var mo = MONTH[m.month];
    var notes = m.notes.slice(); if ((m.id === 'eid' || m.id === 'ganesh-season') && !notes.some(function (n) { return /community members/.test(n); })) notes.unshift('Have community members review before publishing.');
    sheet.querySelector('[data-csheet-content]').innerHTML =
      '<div class="cs-head"><div><p class="cs-kick">' + mo.name + ' ' + mo.year + ' · ' + catLabel(m) + '</p><h2 class="cs-title" id="csTitle">' + esc(m.name) + '</h2></div>' +
        '<button type="button" class="sheet__close" data-cal-close aria-label="Close">' + svg(I.close) + '</button></div>' +
      '<div class="cs-date"><span class="cs-date__d">' + svg(I.cal) + esc(m.dateLabel) + '</span>' + (m.approx ? '<span class="approx-badge">approx</span>' : '<span class="fixed-badge">fixed date</span>') + '<p class="cs-date__note">' + esc(m.dateNote) + '</p>' +
        '<button type="button" class="btn btn--primary btn--sm cs-ics" data-ics="' + m.id + '">' + svg(I.cal) + 'Add to calendar (.ics)</button></div>' +
      '<p class="cs-about">' + esc(m.about) + '</p>' +
      '<div class="cs-concept"><p class="cs-label">The campaign idea</p><p class="cs-concept__txt">' + esc(m.concept) + '</p><p class="cs-lead">' + esc(m.lead) + '</p></div>' +
      creative(m) +
      '<div class="cs-dir"><p class="cs-label">Copy seeds</p><div data-dir-switch="full"></div></div>' +
      '<ol class="cs-ch" role="list">' + CH.map(function (c) {
        var ch = m.channels[c[0]];
        return '<li class="cs-ch__item"><div class="cs-ch__head">' + svg(c[2]) + '<h3>' + c[1] + '</h3></div><p class="cs-ch__act">' + esc(ch.action) + '</p>' + seed(ch.bz, 'bz') + seed(ch.ry, 'ry') + '</li>';
      }).join('') + '</ol>' +
      '<div class="cs-kpi">' + svg(I.kpi) + '<div><p class="cs-label">KPI to watch</p><p>' + esc(m.kpi) + '</p></div></div>' +
      '<div class="cs-notes"><p class="cs-label">Before publishing</p><ul>' + notes.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul></div>';
    lastFocus = trigger || doc.activeElement;
    sheet.hidden = false;
    if (H && H.refresh) H.refresh(sheet);
    Array.prototype.forEach.call(doc.body.children, function (el) { if (el !== sheet && el.tagName !== 'SCRIPT' && !el.inert) { el.inert = true; el.setAttribute('data-cal-inert', ''); } });
    de.classList.add('hub-locked');
    var panel = sheet.querySelector('.csheet__panel'); panel.scrollTop = 0;
    requestAnimationFrame(function () { sheet.classList.add('is-open'); panel.focus({ preventScroll: true }); });
    try { history.replaceState(null, '', '#' + m.id); } catch (e) { }
  }
  function closeMoment() {
    if (!sheet || sheet.hidden) return;
    sheet.classList.remove('is-open'); sheet.hidden = true;
    doc.querySelectorAll('[data-cal-inert]').forEach(function (el) { el.inert = false; el.removeAttribute('data-cal-inert'); });
    de.classList.remove('hub-locked');
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { }
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  /* swipe down on the grip/head to close (phones) */
  (function () {
    if (!sheet) return; var panel = sheet.querySelector('.csheet__panel'), y0 = null, dy = 0;
    panel.addEventListener('pointerdown', function (e) { if (panel.scrollTop > 0 || e.pointerType !== 'touch' || e.target.closest('button,a')) return; y0 = e.clientY; dy = 0; });
    panel.addEventListener('pointermove', function (e) { if (y0 == null) return; dy = Math.max(0, e.clientY - y0); panel.style.transform = dy ? 'translateY(' + dy + 'px)' : ''; });
    function end() { if (y0 == null) return; y0 = null; panel.style.transform = ''; if (dy > 110) closeMoment(); }
    panel.addEventListener('pointerup', end); panel.addEventListener('pointercancel', end);
  })();

  /* ───── .ics (client-side, all-day, approx-labelled) ───── */
  function icsEsc(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
  function fold(line) { var out = [], s = line; while (s.length > 73) { out.push(s.slice(0, 73)); s = ' ' + s.slice(73); } out.push(s); return out.join('\r\n'); }
  function ymd(d) { return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); }
  function vevent(m) {
    var st = toDate(m.ics.start), en = new Date(st); en.setDate(en.getDate() + 1);
    var now = new Date(), stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    var title = 'Curry District · ' + m.name + (m.approx ? ' (approx)' : '') + (m.ics.marker ? ' · month marker' : '');
    var desc = [m.concept, 'Date: ' + m.dateLabel + (m.approx ? ' (' + m.dateNote + ')' : ''), m.ics.marker ? 'Placed on the 1st as a planning marker. The real date varies, so verify it each year.' : '', 'Lead time: ' + m.lead, 'KPI: ' + m.kpi].filter(Boolean).join('\n');
    var L = ['BEGIN:VEVENT', 'UID:' + m.id + '-' + m.ics.start + '@curry-district-pitch', 'DTSTAMP:' + stamp, 'DTSTART;VALUE=DATE:' + ymd(st), 'DTEND;VALUE=DATE:' + ymd(en)];
    if (m.ics.rrule) L.push('RRULE:' + m.ics.rrule);
    L.push('SUMMARY:' + icsEsc(title), 'DESCRIPTION:' + icsEsc(desc), 'CATEGORIES:' + (m.cat === 'indian' ? 'Indian celebrations' : 'US & local') + (m.catering ? '\\,Catering-led' : ''), 'TRANSP:TRANSPARENT');
    if (m.ics.alarm) L.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:-P' + m.ics.alarm + 'D', 'DESCRIPTION:' + icsEsc('Start the ' + m.short + ' campaign'), 'END:VALARM');
    L.push('END:VEVENT');
    return L;
  }
  function downloadICS(list, name) {
    var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Curry District Glow-Up//Festival calendar//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Curry District festival calendar (concept)'];
    list.forEach(function (m) { L = L.concat(vevent(m)); });
    L.push('END:VCALENDAR');
    var txt = L.map(fold).join('\r\n') + '\r\n';
    var a = doc.createElement('a');
    try { a.href = URL.createObjectURL(new Blob([txt], { type: 'text/calendar;charset=utf-8' })); } catch (e) { a.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(txt); }
    a.download = name; doc.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); if (a.href.indexOf('blob:') === 0) URL.revokeObjectURL(a.href); }, 1500);
    if (H && H.toast) H.toast(list.length > 1 ? 'Calendar file ready: ' + list.length + ' events, approx dates flagged' : 'Added: ' + list[0].short + (list[0].approx ? ' (approx date)' : ''));
  }
  window.CDCalendar = { ics: function (id) { return vevent(BY[id]).join('\n'); } };

  /* ───── Events ───── */
  doc.addEventListener('click', function (e) {
    var t = e.target.closest('[data-moment],[data-cal-close],[data-cal-filter],[data-ics],[data-ics-all],[data-rail],[data-jump]');
    if (!t) return;
    if (t.hasAttribute('data-moment')) { e.preventDefault(); openMoment(t.getAttribute('data-moment'), t); }
    else if (t.hasAttribute('data-cal-close')) closeMoment();
    else if (t.hasAttribute('data-cal-filter')) { state.filter = t.getAttribute('data-cal-filter'); applyFilter(); }
    else if (t.hasAttribute('data-ics')) { var m = BY[t.getAttribute('data-ics')]; downloadICS([m], 'curry-district-' + m.id + '-' + m.ics.start.slice(0, 4) + '.ics'); }
    else if (t.hasAttribute('data-ics-all')) downloadICS(D.moments, 'curry-district-festival-year-2026-27.ics');
    else if (t.hasAttribute('data-rail')) { var tr = doc.querySelector('[data-rail-track]'); tr.scrollBy({ left: (+t.getAttribute('data-rail')) * tr.clientWidth * .85, behavior: 'smooth' }); }
    else if (t.hasAttribute('data-jump')) { e.preventDefault(); scrollToMonth(t.getAttribute('data-jump')); }
  });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheet && !sheet.hidden && !doc.querySelector('.lb:not([hidden])')) closeMoment(); });
  /* highlight the month chip for the card in view */
  function trackJump() {
    var tr = doc.querySelector('[data-rail-track]'); if (!tr) return; var raf = 0;
    function upd() { raf = 0; var cards = tr.querySelectorAll('.mcard'), k = null, x = tr.scrollLeft + 4;
      for (var i = 0; i < cards.length; i++) { if (cards[i].offsetLeft - tr.offsetLeft >= x - cards[i].offsetWidth * .4) { k = cards[i].id.slice(2); break; } }
      if (tr.scrollLeft + tr.clientWidth >= tr.scrollWidth - 4) k = k || cards[cards.length - 1].id.slice(2);
      doc.querySelectorAll('[data-jump]').forEach(function (a) { a.setAttribute('aria-current', String(a.getAttribute('data-jump') === k)); }); }
    tr.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true }); setTimeout(upd, 400);
  }
  renderRail(); renderNow(); applyFilter(); trackJump();
  if (location.hash && BY[location.hash.slice(1)]) setTimeout(function () { openMoment(location.hash.slice(1)); }, 300);
})();

/* Curry District · A · BAZAAR — page scripts for catering / story / visit / thanks.
   Vanilla, defer-loaded after js/config.js + js/site.js. Every block is guarded, so a page
   without the matching markup simply skips it, and the pages work fully without JS
   (native form POST to /thanks.html, native <details> FAQ, static hours). */
(function () {
  'use strict';
  var d = document, w = window;
  var reduced = !!(w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function safe(fn) { try { fn(); } catch (e) { if (w.console) console.warn('[pages]', e); } }
  var cfg = w.CD_CONFIG || {};
  var telHref = 'tel:' + ((cfg.phone && cfg.phone.tel) || '+14692005856');
  var telText = (cfg.phone && cfg.phone.display) || '(469) 200-5856';

  /* ---------- 1 · catering inquiry (Netlify Forms, fetch-enhanced) ---------- */
  safe(function () {
    var form = $('form[data-pg-form]');
    if (!form) return;
    var MSG = {                                   /* data/copy.json → bazaar.microcopy.fieldErrors */
      required: 'We need this one.',
      email: 'That email looks a little off.',
      phone: 'Double-check that number for us.',
      date: 'Pick a date for your event.',
      past: 'Pick a date from today onwards.',
      guests: 'Roughly how many guests? Any whole number from 1 works.'
    };
    var alertBox = $('[data-form-alert]', form);
    var btn = $('[type="submit"]', form);
    var label = $('[data-submit-label]', form);
    var idle = label ? label.textContent : '';
    var fields = $$('.pg-input', form);
    var touched = false;

    function today() {
      var n = new Date(); n.setMinutes(n.getMinutes() - n.getTimezoneOffset());
      return n.toISOString().slice(0, 10);
    }
    if (form.elements['event-date']) form.elements['event-date'].min = today();
    form.noValidate = true;                       /* JS validates; native `required` still guards no-JS */

    function check(el) {
      var v = (el.value || '').trim(), msg = '';
      if (el.required && !v) msg = el.name === 'event-date' ? MSG.date : MSG.required;
      else if (v && el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = MSG.email;
      else if (v && el.type === 'tel' && v.replace(/\D/g, '').length < 10) msg = MSG.phone;
      else if (v && el.name === 'event-date' && v < today()) msg = MSG.past;
      else if (v && el.name === 'guests' && !(/^\d+$/.test(v) && +v >= 1 && +v <= 5000)) msg = MSG.guests;
      var err = d.getElementById(el.id + '-err');
      if (err) err.textContent = msg;
      if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
      return !msg;
    }
    fields.forEach(function (el) {
      el.addEventListener('blur', function () { if (touched || el.value) check(el); });
      el.addEventListener('input', function () { if (el.getAttribute('aria-invalid')) check(el); });
    });

    function say(html) { alertBox.innerHTML = html; alertBox.hidden = false; }
    function busy(on) {
      btn.disabled = on;
      if (on) btn.setAttribute('aria-busy', 'true'); else btn.removeAttribute('aria-busy');
      if (label) label.textContent = on ? 'Stirring the pot…' : idle;
    }

    form.addEventListener('submit', function (e) {
      touched = true;
      var bad = fields.filter(function (el) { return !check(el); });
      if (bad.length) {
        e.preventDefault();
        say('<strong>Oops, that didn’t go through.</strong>Check the highlighted field' + (bad.length > 1 ? 's' : '') +
          ' and try again, or just <a href="' + telHref + '">call us at ' + telText + '</a>. Phones never time out.');
        bad[0].focus();
        return;
      }
      /* DESIGN DEMO: nothing is sent or stored anywhere. Validate, then show the demo confirmation. */
      e.preventDefault();
      alertBox.hidden = true;
      busy(true);
      setTimeout(function () { w.location.href = 'thanks.html?demo=1'; }, 450);
    });
  });

  /* ---------- 2 · reveal safety net: if the motion kit hasn't revealed an on-screen block
     within ~1.2 s (fast flings, slow devices), show it anyway so content is never stuck invisible ---------- */
  safe(function () {
    if (!('IntersectionObserver' in w)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        setTimeout(function () { if (!el.classList.contains('m-in')) el.classList.add('m-in'); }, 1200);
        io.unobserve(el);
      });
    });
    $$('main [data-reveal], main [data-stagger] > *').forEach(function (el) { io.observe(el); });
  });

  /* ---------- 3 · copy-address button (visit) ---------- */
  safe(function () {
    var status = $('[data-copy-status]');
    function legacy(t) {
      try {
        var ta = d.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', '');
        ta.style.position = 'fixed'; ta.style.opacity = '0'; d.body.appendChild(ta); ta.select();
        var ok = d.execCommand('copy'); d.body.removeChild(ta); return ok;
      } catch (e) { return false; }
    }
    $$('[data-copy]').forEach(function (b) {
      var lab = $('[data-copy-label]', b), orig = lab ? lab.textContent : '';
      b.addEventListener('click', function () {
        var text = (cfg.address && cfg.address.oneLine) || b.getAttribute('data-copy');
        function done(ok) {
          if (lab) lab.textContent = ok ? 'Copied!' : 'Copy failed';
          if (status) status.textContent = ok ? 'Address copied: ' + text : 'Could not copy. The address is ' + text;
          setTimeout(function () { if (lab) lab.textContent = orig; }, 2400);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(legacy(text)); });
        } else done(legacy(text));
      });
    });
  });

  /* ---------- 4 · confetti burst (thanks) — Web Animations, transform/opacity only ---------- */
  safe(function () {
    var host = $('[data-confetti]');
    if (!host || reduced || !host.animate) return;
    var COLORS = ['#FFB000', '#FF6A13', '#E4147E', '#00A8A0', '#FFF4DC', '#FFD56E', '#8FE3DA', '#FF8CC0'];
    function burst(x, y, n, spread) {
      for (var i = 0; i < n; i++) {
        var el = d.createElement('i'), k = i % 3;
        el.className = 'pg-bit' + (k === 0 ? ' pg-bit--petal' : k === 1 ? ' pg-bit--dot' : '');
        el.style.background = COLORS[(Math.random() * COLORS.length) | 0];
        host.appendChild(el);
        var a = Math.random() * Math.PI * 2, dist = spread * (.35 + Math.random() * .75);
        var dx = Math.cos(a) * dist, dy = Math.sin(a) * dist * .8 - spread * .35, r = (Math.random() - .5) * 900;
        var anim = el.animate([
          { transform: 'translate(' + x + 'px,' + y + 'px) rotate(0deg) scale(.4)', opacity: 1 },
          { transform: 'translate(' + (x + dx) + 'px,' + (y + dy) + 'px) rotate(' + r * .6 + 'deg) scale(1)', opacity: 1, offset: .45 },
          { transform: 'translate(' + (x + dx * 1.15) + 'px,' + (y + dy + spread * .9) + 'px) rotate(' + r + 'deg) scale(.85)', opacity: 0 }
        ], { duration: 1500 + Math.random() * 1300, delay: Math.random() * 160, easing: 'cubic-bezier(.15,.7,.35,1)', fill: 'forwards' });
        anim.onfinish = (function (node) { return function () { if (node.parentNode) node.parentNode.removeChild(node); }; })(el);
      }
    }
    function go() {
      var r = host.getBoundingClientRect(), s = Math.min(Math.max(r.width, 320), 900) * .55;
      burst(r.width * .5, r.height * .34, 64, s);
      setTimeout(function () { burst(r.width * .16, r.height * .22, 30, s * .7); burst(r.width * .84, r.height * .22, 30, s * .7); }, 420);
    }
    if (d.readyState === 'complete') setTimeout(go, 250);
    else w.addEventListener('load', function () { setTimeout(go, 250); });
    $$('[data-confetti-again]').forEach(function (b) { b.addEventListener('click', go); });
  });
})();

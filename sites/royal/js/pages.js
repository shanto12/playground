/*! Curry District · B · ROYAL — inner pages (catering · story · visit · thanks).
   Catering inquiry: accessible inline validation + fetch submit to Netlify Forms.
   Without JS the form posts natively (required/type attributes still validate) to /thanks.html. */
(function (w, d) {
  'use strict';
  var form = d.querySelector('[data-pg-form]');
  if (!form) return;

  var MSG = {
    required: 'This field is needed.',
    email: 'Please check this email address.',
    phone: 'Please check this phone number.',
    date: 'Please choose a date for your event.',
    past: 'Please choose a date from today onwards.',
    guests: 'Please enter an approximate number of guests.'
  };
  var alertBox = form.querySelector('[data-pg-alert]');
  var submit = form.querySelector('[data-pg-submit]');
  var label = submit ? submit.innerHTML : '';
  var fields = Array.prototype.slice.call(form.querySelectorAll('.pg-input'));
  var telLink = (d.querySelector('a[data-cd-href="tel"]') || {}).href || 'tel:+14692005856';
  var phoneText = (w.CD_CONFIG && w.CD_CONFIG.phone && w.CD_CONFIG.phone.display) || '(469) 200-5856';

  form.setAttribute('novalidate', '');

  // Earliest event date = today (visitor's local date).
  var dateEl = form.querySelector('input[type="date"]');
  if (dateEl) {
    var t = new Date(), pad = function (n) { return (n < 10 ? '0' : '') + n; };
    dateEl.min = t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());
  }

  function check(el) {
    var v = (el.value || '').trim();
    if (el.required && !v) return el.type === 'date' ? MSG.date : el.type === 'number' ? MSG.guests : MSG.required;
    if (!v) return '';
    if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return MSG.email;
    if (el.type === 'tel' && v.replace(/\D/g, '').length < 10) return MSG.phone;
    if (el.type === 'number' && !(+v >= 1 && +v <= 5000)) return MSG.guests;
    if (el.type === 'date' && el.min && v < el.min) return MSG.past;
    return '';
  }
  function paint(el, msg) {
    var out = d.getElementById(el.getAttribute('data-err'));
    if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    if (out) out.textContent = msg;
    return !msg;
  }
  function say(title, body) {
    if (!alertBox) return;
    alertBox.innerHTML = '<strong>' + title + '</strong>' + body;
    alertBox.hidden = false;
  }

  fields.forEach(function (el) {
    el.addEventListener('blur', function () { if (el.value || el.hasAttribute('aria-invalid')) paint(el, check(el)); });
    el.addEventListener('input', function () { if (el.hasAttribute('aria-invalid')) paint(el, check(el)); });
  });

  form.addEventListener('submit', function (e) {
    var firstBad = null;
    fields.forEach(function (el) { if (!paint(el, check(el)) && !firstBad) firstBad = el; });
    if (firstBad) {
      e.preventDefault();
      say('Please check the highlighted fields.', 'Then try again, or call us directly at <a href="' + telLink + '">' + phoneText + '</a>. We’re glad to help.');
      firstBad.focus();
      return;
    }
    /* DESIGN DEMO: nothing is sent or stored anywhere. Validate, then show the demo confirmation. */
    e.preventDefault();
    if (alertBox) alertBox.hidden = true;
    submit.setAttribute('aria-busy', 'true');
    submit.disabled = true;
    submit.textContent = 'One moment…';
    setTimeout(function () { w.location.href = 'thanks.html?demo=1'; }, 450);
  });
})(window, document);

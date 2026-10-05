/* Signage page: render the storefront manifest through the hub gallery, hiding slider-only 'pair:' tags from the filter chips. */
(function () {
  'use strict';
  var el = document.getElementById('sg-gallery');
  if (!el || !window.Hub || !window.fetch) return;
  fetch(el.getAttribute('data-manifest'), { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (m) {
      if (!m || !Array.isArray(m.items)) return;
      var items = m.items.map(function (it) {
        var c = {}; for (var k in it) c[k] = it[k];
        c.tags = (it.tags || []).filter(function (t) { return t.indexOf('pair:') !== 0; });
        return c;
      });
      window.Hub.renderGallery(el, items);
    })
    .catch(function () { /* gallery stays empty; page still works */ });
})();

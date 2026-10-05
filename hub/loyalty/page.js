/* open the demo in the hub's full-screen sheet when JS is available */
document.addEventListener('click', function (e) {
  var a = e.target.closest('[data-open-demo]');
  if (!a || !window.Hub || !Hub.openFrame || e.metaKey || e.ctrlKey) return;
  e.preventDefault(); Hub.openFrame(a.getAttribute('href'), 'Digital stamp card (concept demo)', a);
});

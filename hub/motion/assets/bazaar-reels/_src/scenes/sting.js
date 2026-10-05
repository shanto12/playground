/* LOGO STING — 4 s. Square (stacked lockup) or 16:9 (horizontal lockup). */
(function () {
  const { C, E, seg, h, box, T, Burst, Petals, Bunting, Logo, sunburstSVG } = M;
  const { w: W, h: H, params } = JOB;
  const wide = params.layout === 'horizontal';
  const st = document.getElementById('stage');
  const S = h('div', { class: 'fill' }, st);
  S.style.background = C.cream;
  const logo = Logo(S, wide ? { layout: 'horizontal', cx: 960, cy: 520, scale: 1.55 } : { layout: 'stacked', cx: 540, cy: 520, scale: 1.08 });
  const sun = logo.emPt(100, 150);
  const rays = box(S, sun[0], sun[1], 3000, 3000, '', sunburstSVG(32, C.cream, C.sand, 1500));
  S.insertBefore(rays, S.firstChild);
  const bunt = Bunting(S, W, wide ? 30 : 34, wide ? 46 : 40, wide ? 15 : 9, { flagW: wide ? 64 : 66, flagH: wide ? 78 : 80 });
  const burst = Burst(S, sun[0], sun[1], 12, 5, { dist: wide ? 300 : 260, r0: wide ? 190 : 170, size: 30 });
  const petals = Petals(S, W, H, wide ? 70 : 54, 9, { size: 24 });
  S.insertBefore(petals.svg, logo.root);
  const tag = h('div', { class: 'abs body', style: { left: '0', top: (wide ? 800 : 930) + 'px', width: W + 'px', textAlign: 'center', fontWeight: 800, fontSize: (wide ? 44 : 38) + 'px', letterSpacing: '.2em', color: C.ink } }, S, 'INDIAN KITCHEN · LITTLE ELM, TX');
  // little hand-drawn flourish under the tagline
  const line = h('div', { class: 'abs', style: { left: (W / 2 - 160) + 'px', top: (wide ? 868 : 990) + 'px', width: '320px', height: '24px' } }, S,
    '<svg viewBox="0 0 320 24" width="320" height="24" aria-hidden="true"><path class="ul" d="M6 14 C 60 4, 120 22, 170 12 S 280 6, 314 14" fill="none" stroke="#E4147E" stroke-width="7" stroke-linecap="round"/></svg>');
  const ul = line.querySelector('.ul');
  const L = ul.getTotalLength();
  ul.setAttribute('stroke-dasharray', L + ' ' + L);
  const K = { gate: 0.0, sun: 0.28, steam: 0.85, bunt: 0.7, curry: 1.3, dist: 1.6 };
  window.renderAt = function (t) {
    T(rays, { r: t * 7 });
    bunt.at(t, 0.35, 0.8);
    const r = logo.at(t, K);
    const imp = r.impact;
    const sh = t > imp && t < imp + 0.28 ? Math.sin((t - imp) * 70) * 10 * (1 - (t - imp) / 0.28) : 0;
    S.style.transform = 'translate(' + sh.toFixed(1) + 'px,' + (sh * 0.5).toFixed(1) + 'px)';
    burst.at(t - 1.0);
    petals.burstAt(t - imp, wide ? 1180 : 540, wide ? 560 : 720);
    const tp = seg(t, 2.05, 2.45);
    T(tag, { y: (1 - E.outCubic(tp)) * 30, o: tp });
    const up = seg(t, 2.3, 2.75);
    ul.setAttribute('stroke-dashoffset', (L * (1 - E.inOutCubic(up))).toFixed(1));
    ul.setAttribute('opacity', up > 0 ? 1 : 0);
  };
})();

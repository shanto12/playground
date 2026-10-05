#!/usr/bin/env node
/* Curry District · Royal — pre-renders menu.html from data/menu.json.
   Usage:  node sites/royal/scripts/build-menu.js
   Source: <repo>/data/menu.json + data/copy.json (falls back to the site's sanitised data/ copies).
   Fills every <!-- build:NAME -->…<!-- /build:NAME --> block in menu.html; everything else is hand-written.
   Rules: items with status "unconfirmed" are dropped; prices are never read or rendered. */
'use strict';
const fs = require('fs');
const path = require('path');

const SITE = path.resolve(__dirname, '..');
const REPO = path.resolve(SITE, '..', '..');
const pick = (...c) => c.find((p) => fs.existsSync(p));
const MENU_SRC = pick(path.join(REPO, 'data/menu.json'), path.join(SITE, 'data/menu.json'));
const COPY_SRC = pick(path.join(REPO, 'data/copy.json'), path.join(SITE, 'data/copy-royal.json'));
const PAGE = path.join(SITE, 'menu.html');

const menu = JSON.parse(fs.readFileSync(MENU_SRC, 'utf8'));
const copy = JSON.parse(fs.readFileSync(COPY_SRC, 'utf8')).royal;
const meta = menu.meta;

const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’'`]/g, '').replace(/[^a-z0-9&]+/g, ' ').trim();
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const SPRITE = 'img/icons/sprite.svg';

/* zone → icon + jewel (course medallion and the jali tile of dishes without art) */
const ZONE = {
  starters:    { icon: 'samosa',            jewel: 'ruby' },
  tandoor:     { icon: 'tandoor-oven',      jewel: 'midnight' },
  curry:       { icon: 'curry-bowl',        jewel: 'emerald' },
  biryani:     { icon: 'biryani-pot-handi', jewel: 'plum' },
  indochinese: { icon: 'chili',             jewel: 'peacock' },
  bread:       { icon: 'naan',              jewel: 'saffron' },
  sweets:      { icon: 'gulab-jamun',       jewel: 'ruby' },
  chai:        { icon: 'chai-cup',          jewel: 'peacock' }
};
/* art key → jewel behind the illustration (chosen for contrast with the dish colours) */
const ART_JEWEL = {
  'biryani': 'plum', 'butter-chicken': 'emerald', 'garlic-naan': 'ruby', 'tandoori-platter': 'midnight',
  'paneer-tikka': 'emerald', 'samosa-chutney': 'plum', 'chilli-chicken': 'peacock', 'dal-saag': 'ruby',
  'gulab-jamun': 'emerald', 'mango-lassi-chai': 'plum', 'chaat': 'midnight', 'thali': 'emerald'
};
const WIDE_ART = new Set(['tandoori-platter', 'thali', 'butter-chicken', 'chilli-chicken']);
const TILE_JEWELS = ['ruby', 'emerald', 'plum', 'peacock', 'midnight'];
const TILE_PATTERNS = 3; /* .tile-p0…p2 in css/menu.css (jali lattice · mehrab trellis · star tile) */
/* spice level → sprite chili (0 = none; the "District Hot" five-gem chili for 4) */
const CHILI = { 1: 'chili-1', 2: 'chili-2', 3: 'chili-3', 4: 'chili-5' };
const DIET_ICON = { veg: `${SPRITE}#icon-veg-mark`, nonveg: `${SPRITE}#icon-nonveg-mark`, egg: '#m-egg' };
const spiceLabel = (n) => (meta.spiceScale.find((s) => s.level === n) || {}).label || '';

/* ── data ── */
const visible = menu.items.filter((i) => i.status !== 'unconfirmed');
const zones = meta.zones.filter((z) => visible.some((i) => i.zone === z.id));
const setsOf = {};
Object.entries(menu.collections || {}).forEach(([cid, ids]) => ids.forEach((id) => { (setsOf[id] = setsOf[id] || []).push(cid); }));
const zoneName = Object.fromEntries(meta.zones.map((z) => [z.id, z.name]));

/* ── fragments ── */
function windowHtml(item, idx) {
  if (item.art) {
    const jewel = ART_JEWEL[item.art] || 'plum';
    return `<div class="dish__win arch arch--${jewel}"><div class="arch__glass">` +
      `<img class="arch__art dish__art${WIDE_ART.has(item.art) ? ' arch__art--wide' : ''}" src="img/dishes/${item.art}.svg" alt="" width="800" height="800" loading="lazy" decoding="async">` +
      `</div></div>`;
  }
  const z = ZONE[item.zone];
  const jewel = TILE_JEWELS[(TILE_JEWELS.indexOf(z.jewel) + idx) % TILE_JEWELS.length];
  return `<div class="dish__win arch arch--${jewel} arch--tile tile-p${idx % TILE_PATTERNS}"><div class="arch__glass">` +
    `<svg class="dish__icon" viewBox="0 0 64 64" aria-hidden="true"><use href="${SPRITE}#icon-${z.icon}"/></svg>` +
    `</div></div>`;
}

function dishHtml(item, idx) {
  const sets = setsOf[item.id] || [];
  const search = norm([item.name, (item.aliases || []).join(' '), item.desc_royal, item.desc_neutral, zoneName[item.zone],
    meta.dietLegend[item.diet], item.diet === 'veg' ? 'veg vegetarian' : item.diet === 'egg' ? 'egg' : 'non veg nonveg'].join(' '));
  const spice = item.spice;
  const spiceHtml = spice > 0
    ? `<span class="spice" title="${esc(meta.spiceNote)}"><svg class="spice__icon" viewBox="0 0 64 64" aria-hidden="true"><use href="${SPRITE}#icon-${CHILI[spice]}"/></svg>${esc(spiceLabel(spice))}<span class="sr-only"> (estimated heat)</span></span>`
    : `<span class="spice spice--none" title="${esc(meta.spiceNote)}"><span class="spice__gem" aria-hidden="true"></span>${esc(spiceLabel(0))}<span class="sr-only"> (estimated)</span></span>`;
  const tags = [];
  if (item.availability) tags.push(`<span class="tag tag--ruby">${esc(item.availability)}</span>`);
  if (item.portion) tags.push(`<span class="tag">${esc(item.portion)}</span>`);
  const served = item.served_with ? `<p class="dish__served">Served with ${esc(item.served_with)}</p>` : '';
  const seal = item.popular
    ? `<span class="seal"><svg class="seal__mark" viewBox="0 0 48 48" aria-hidden="true"><use href="#m-seal"/></svg>Guest favourite</span>` : '';
  return `      <li class="dish${item.popular ? ' dish--fav' : ''}${item.art ? ' dish--art' : ''}" id="dish-${esc(item.id)}" data-id="${esc(item.id)}" data-diet="${item.diet}" data-spice="${spice}" data-fav="${item.popular ? 1 : 0}" data-sets="${sets.join(' ')}" data-search="${esc(search)}">
        <article class="dish__card" aria-labelledby="dn-${esc(item.id)}">
          ${windowHtml(item, idx)}
          <div class="dish__body">
            ${seal}<p class="dish__diet"><svg class="dish__mark" viewBox="0 0 64 64" aria-hidden="true"><use href="${DIET_ICON[item.diet]}"/></svg>${esc(meta.dietLegend[item.diet])}</p>
            <h3 class="dish__name" id="dn-${esc(item.id)}" data-hl>${esc(item.name)}</h3>
            <p class="dish__desc" data-hl>${esc(item.desc_royal)}</p>
            ${served}<p class="dish__foot">${spiceHtml}${tags.join('')}</p>
          </div>
        </article>
      </li>`;
}

function sectionHtml(z, n) {
  const items = visible.filter((i) => i.zone === z.id);
  const zc = ZONE[z.id];
  let tileIdx = 0;
  const lis = items.map((it) => dishHtml(it, it.art ? 0 : tileIdx++)).join('\n');
  return `    <section class="course" id="${z.id}" aria-labelledby="${z.id}-title" data-course="${z.id}">
      <header class="course__head">
        <div class="course__medal arch arch--${zc.jewel === 'saffron' ? 'ruby' : zc.jewel} arch--tile" aria-hidden="true"><div class="arch__glass"><svg class="dish__icon" viewBox="0 0 64 64"><use href="${SPRITE}#icon-${zc.icon}"/></svg></div></div>
        <div class="course__text">
          <p class="course__num">Course <b>${ROMAN[n]}</b></p>
          <h2 class="course__title" id="${z.id}-title" tabindex="-1">${esc(z.name)}</h2>
          <p class="course__tag">${esc(z.tagline_royal)}</p>
        </div>
        <p class="course__count"><span data-course-count>${items.length}</span> <span data-course-noun>${items.length === 1 ? 'dish' : 'dishes'}</span></p>
      </header>
      <ul class="dish-list" role="list">
${lis}
      </ul>
    </section>`;
}

const coursesHtml = zones.map((z, n) => `      <li><a class="course-tab" href="#${z.id}" data-course-tab="${z.id}"><span class="course-tab__num">${ROMAN[n]}</span><svg class="course-tab__icon" viewBox="0 0 64 64" aria-hidden="true"><use href="${SPRITE}#icon-${ZONE[z.id].icon}-mono"/></svg><span class="course-tab__name">${esc(z.name)}</span></a></li>`).join('\n');

const heatHtml = meta.spiceScale.map((s) => `          <button class="heat__step" type="button" data-f-heat="${s.level}" aria-pressed="false"><span class="heat__glyph" aria-hidden="true"><svg viewBox="0 0 64 64"><use href="${SPRITE}#icon-${s.level === 0 ? 'cilantro' : 'chili'}-mono"/></svg></span><span class="heat__name">${esc(s.label)}</span></button>`).join('\n');

const setsHtml = meta.collections.filter((c) => (menu.collections[c.id] || []).length).map((c) => `          <button class="chip chip--set" type="button" data-f-set="${c.id}" data-note="${esc(c.tagline_royal)}" aria-pressed="false">${esc(c.name)}</button>`).join('\n');

const notesHtml = [
  ['Allergies', meta.allergenNote],
  ['Spice', meta.spiceNote],
  ['Diet marks', meta.dietNote],
  ['About this menu', meta.disclaimer]
].map(([k, v]) => `        <div class="notes-list__row"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('\n');

/* rosette seal: 16-point star around a ring */
function rosette(cx, cy, ro, ri, n) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? ri : ro; const a = (Math.PI * i) / n - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}
const spriteHtml = `<svg class="menu-sprite" width="0" height="0" aria-hidden="true" focusable="false">
  <symbol id="m-seal" viewBox="0 0 48 48"><polygon points="${rosette(24, 24, 23, 19.5, 16)}" fill="#E9A63A" stroke="#8A5A14" stroke-width="1"/><circle cx="24" cy="24" r="14.5" fill="#F7D98A" stroke="#8A5A14" stroke-width="1.2"/><circle cx="24" cy="24" r="11.5" fill="none" stroke="#B7791F" stroke-width=".8" stroke-dasharray="1.6 1.6"/><path d="M24 15.5l2.5 5.4 5.9.6-4.4 4 1.2 5.8L24 28.4l-5.2 2.9 1.2-5.8-4.4-4 5.9-.6z" fill="#8A5A14"/></symbol>
  <symbol id="m-egg" viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="48" rx="8" fill="#FBF3E4" stroke="#E9A63A" stroke-width="1.75"/><rect x="14" y="14" width="36" height="36" rx="3.5" fill="none" stroke="#9C5C0E" stroke-width="3.25"/><path d="M32 22c-5 0-8.5 7-8.5 11.5S27 42 32 42s8.5-4 8.5-8.5S37 22 32 22z" fill="#E0A021" stroke="#7A4C10" stroke-width="1.5"/></symbol>
  <symbol id="m-search" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.25" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M15.2 15.2L20.5 20.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></symbol>
  <symbol id="m-sliders" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 7h9M18 7h2M4 17h2M11 17h9"/><circle cx="15.5" cy="7" r="2.3"/><circle cx="8.5" cy="17" r="2.3"/></g></symbol>
  <symbol id="m-close" viewBox="0 0 24 24"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
</svg>`;

/* JSON-LD: Menu → MenuSection → MenuItem (name + description only; no offers, no prices) */
const ld = {
  '@context': 'https://schema.org',
  '@type': 'Menu',
  name: 'Curry District menu',
  description: 'Design concept of the Curry District menu (Little Elm, TX), built from public listings; dishes and spice levels to be confirmed with the restaurant.',
  url: 'https://curry-district-royal.netlify.app/menu.html',
  inLanguage: 'en-US',
  hasMenuSection: zones.map((z) => ({
    '@type': 'MenuSection',
    name: z.name,
    description: z.tagline_royal,
    url: `https://curry-district-royal.netlify.app/menu.html#${z.id}`,
    hasMenuItem: visible.filter((i) => i.zone === z.id).map((i) => ({ '@type': 'MenuItem', name: i.name, description: i.desc_neutral }))
  }))
};
const jsonld = `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`;

/* headline: one foil phrase after the comma */
const head = copy.sectionIntros.menu.headline;
const ci = head.indexOf(',');
const headline = ci > -1 ? `${esc(head.slice(0, ci + 1))} <span class="foil foil--sweep">${esc(head.slice(ci + 1).trim())}</span>` : esc(head);

const blocks = {
  jsonld, sprite: spriteHtml, courses: coursesHtml, heat: heatHtml, sets: setsHtml, notes: notesHtml,
  sections: zones.map(sectionHtml).join('\n\n'),
  total: String(visible.length), courseCount: String(zones.length),
  headline, lede: esc(copy.sectionIntros.menu.body),
  disclaimer: esc(meta.disclaimer),
  emptyHead: esc(copy.microcopy.empty.headline), emptyBody: esc(copy.microcopy.empty.body), emptyCta: esc(copy.microcopy.empty.cta)
};

let html = fs.readFileSync(PAGE, 'utf8');
for (const [name, body] of Object.entries(blocks)) {
  const re = new RegExp(`(<!-- build:${name} -->)[\\s\\S]*?(<!-- /build:${name} -->)`, 'g');
  if (!re.test(html)) { console.warn(`! marker missing: ${name}`); continue; }
  const multi = body.includes('\n') || name === 'jsonld' || name === 'sprite';
  html = html.replace(re, (_, a, b) => (multi && !['jsonld', 'sprite'].includes(name) ? `${a}\n${body}\n${b}` : `${a}${body}${b}`));
}
/* guard rails */
if (/\$\s?\d/.test(html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, ''))) throw new Error('price-like text found in menu.html');
menu.items.filter((i) => i.status === 'unconfirmed').forEach((i) => { if (html.includes(`data-id="${i.id}"`)) throw new Error(`unconfirmed item rendered: ${i.id}`); });
fs.writeFileSync(PAGE, html);
console.log(`menu.html: ${visible.length} dishes in ${zones.length} courses (${menu.items.length - visible.length} unconfirmed hidden), ${visible.filter((i) => i.art).length} with art · source ${path.relative(REPO, MENU_SRC)}`);

#!/usr/bin/env node
/* Curry District · A · BAZAAR — static menu builder.
   Pre-renders every visible dish from data/menu.json (+ voice copy from data/copy.json) into menu.html,
   so the page works without JS and is crawlable; js/menu.js only enhances (filters, search, scrollspy).

   Usage (from the repo root or anywhere):   node sites/bazaar/scripts/build-menu.js
   Idempotent: rewrites only the <!-- build:NAME --> … <!-- /build:NAME --> regions of menu.html.
   Rules baked in: status "unconfirmed" items are never rendered; prices are never rendered;
   spice levels are labelled as estimates; JSON-LD carries name + description only (no offers). */
'use strict';
const fs = require('fs');
const path = require('path');

const SITE = path.resolve(__dirname, '..');
const ROOT = path.resolve(SITE, '../..');
const PAGE = path.join(SITE, 'menu.html');
const SITE_URL = 'https://curry-district-bazaar.netlify.app/';
const SPRITE = 'assets/icons/sprite.svg';

function readJSON(cands) {
  for (const p of cands) if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  throw new Error('Missing data file: ' + cands.join(' | '));
}
const menu = readJSON([path.join(ROOT, 'data/menu.json'), path.join(SITE, 'data/menu.json')]);
let copy = {};
try { copy = readJSON([path.join(ROOT, 'data/copy.json')]); } catch (e) { /* fall back to defaults below */ }
const B = copy.bazaar || {};
const intro = (B.sectionIntros && B.sectionIntros.menu) || {
  headline: 'Explore the District',
  body: 'Eight flavor streets, one very hungry map. Tell us your heat level when you order.'
};

const meta = menu.meta;
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ico = (name, cls) => `<svg class="${cls || 'ico'}" aria-hidden="true" focusable="false"><use href="${SPRITE}#icon-${name}"></use></svg>`;
const pic = (key, alt, lazy) =>
  `<picture><source media="(prefers-reduced-motion: reduce)" srcset="assets/art/static/${key}.svg">` +
  `<img src="assets/art/${key}.svg" width="800" height="800"${lazy ? ' loading="lazy"' : ''} decoding="async" alt="${esc(alt)}"></picture>`;

/* zone look: icon for the zone sticker + tiles. Colours live in css/menu.css (.z-<id>). */
const ZONE_ICON = {
  starters: 'chaat-plate', tandoor: 'tandoor-oven', curry: 'curry-bowl', biryani: 'biryani-pot-handi',
  indochinese: 'rice-bowl', bread: 'naan', sweets: 'gulab-jamun', chai: 'chai-cup'
};
/* a few tiles get a better generic icon than the zone emblem (never another dish's illustration) */
const TILE_ICON = {
  'tomato-soup': 'curry-bowl', 'hot-sour-soup': 'curry-bowl', 'goat-paya-soup': 'curry-bowl',
  'plain-rice': 'rice-bowl', 'rasmalai': 'gulab-jamun', 'carrot-halwa': 'spoon-fork', 'rice-kheer': 'spoon-fork',
  'ice-cream': 'spoon-fork', 'apricot-delight': 'spoon-fork', 'chikku-shake': 'lassi-glass',
  'sitaphai-shake': 'lassi-glass', 'badam-milk': 'lassi-glass', 'butter-milk': 'lassi-glass'
};
/* alt text describes the illustration, not the specific dish (one picture serves several dishes) */
const ART_ALT = {
  'butter-chicken': 'Illustration of a creamy orange curry in a brass-rimmed bowl',
  'biryani': 'Illustration of biryani heaped in a copper handi with a cup of raita',
  'tandoori-platter': 'Illustration of tandoor-charred pieces on a platter with onion rings, lime and chutney',
  'garlic-naan': 'Illustration of naan torn into pieces in a woven basket',
  'samosa-chutney': 'Illustration of two golden samosas with chutney',
  'paneer-tikka': 'Illustration of charred paneer tikka pieces on a sizzling platter',
  'chilli-chicken': 'Illustration of a glossy wok-tossed chilli dish with chopsticks',
  'dal-saag': 'Illustration of a bowl of dal beside a bowl of green saag',
  'gulab-jamun': 'Illustration of gulab jamun in syrup in a pink bowl',
  'mango-lassi-chai': 'Illustration of a tall mango lassi beside a cup of chai',
  'thali': 'Illustration of a thali with small bowls of curry, rice and naan',
  'chaat': 'Illustration of a plate of chaat'
};
const DIET = { veg: ['Veg', 'veg-mark'], nonveg: ['Non-veg', 'nonveg-mark'], egg: ['Egg', 'egg-mark'] };
const SPICE = meta.spiceScale.reduce((o, s) => (o[s.level] = s.label, o), {});
const FIRE_ICON = ['chili-1', 'chili-1', 'chili-2', 'chili-3', 'chili-5'];
const SET_ICON = { 'first-timers': 'star', 'fire-lovers': 'chili', 'veg-heaven': 'cilantro', 'share-the-table': 'party-tray', 'sweet-finish': 'gulab-jamun' };

/* ---------- data ---------- */
const visible = menu.items.filter((i) => i.status !== 'unconfirmed');
const setsOf = {};
Object.keys(menu.collections).forEach((c) => menu.collections[c].forEach((id) => (setsOf[id] = setsOf[id] || []).push(c)));
const zones = meta.zones.map((z, n) => {
  const list = visible.filter((i) => i.zone === z.id);
  /* guest favourites lead each street, the rest keep the menu order */
  list.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
  return Object.assign({}, z, { n: n + 1, items: list });
});
const total = visible.length;
const count = (fn) => visible.filter(fn).length;
const nWord = (n) => `<span class="visually-hidden">, </span>${n}<span class="visually-hidden"> dishes</span>`;

/* ---------- renderers ---------- */
function spiceHTML(level) {
  const label = SPICE[level];
  if (!level) return `<span class="spice spice--0"><span class="visually-hidden">Spice level, estimated: </span>${label}</span>`;
  let pips = '';
  for (let k = 1; k <= 4; k++) pips += ico('chili-1', k <= level ? 'ico' : 'ico is-off');
  return `<span class="spice spice--${level}"><span class="visually-hidden">Spice level, estimated: </span><span class="spice__pips" aria-hidden="true">${pips}</span>${label}</span>`;
}

function dishHTML(it, z) {
  const d = DIET[it.diet];
  const notes = [];
  if (it.portion) notes.push(`<span class="dish__note">${esc(it.portion)}</span>`);
  if (it.served_with) notes.push(`<span class="dish__note">with ${esc(it.served_with)}</span>`);
  if (it.availability) notes.push(`<span class="badge badge--marigold dish__avail">${esc(it.availability)}</span>`);
  const art = it.art
    ? `<div class="card__art dish__art">${pic(it.art, ART_ALT[it.art] || 'Dish illustration', true)}</div>`
    : `<div class="card__art dish__art"><div class="art-tile dish__tile"><span class="dish__tile-ico">${ico(TILE_ICON[it.id] || ZONE_ICON[z.id])}</span></div></div>`;
  const attrs = [
    `class="card dish"`, `id="dish-${esc(it.id)}"`, `aria-labelledby="dn-${esc(it.id)}"`,
    `data-zone="${z.id}"`, `data-diet="${it.diet}"`, `data-spice="${it.spice}"`, `data-pop="${it.popular ? 1 : 0}"`,
    `data-sets="${(setsOf[it.id] || []).join(' ')}"`, `data-a="${esc((it.aliases || []).join(' · '))}"`,
    `data-n="${esc(it.desc_neutral)}"`, 'data-press'
  ];
  return `      <li><article ${attrs.join(' ')}>
        <div class="card__body dish__body">
          <h3 class="card__title dish__name" id="dn-${esc(it.id)}">${esc(it.name)}</h3>
          <p class="card__text dish__desc">${esc(it.desc_bazaar)}</p>
          <p class="dish__why" hidden></p>
          <div class="card__meta dish__meta"><span class="diet diet--${it.diet}">${ico(d[1])}${d[0]}</span>${spiceHTML(it.spice)}${notes.join('')}</div>
        </div>
        ${art}${it.popular ? `\n        <span class="badge dish__fav">${ico('star-mono')}Guest favorite</span>` : ''}
      </article></li>`;
}

function zoneHTML(z) {
  const nn = String(z.n).padStart(2, '0');
  return `<section class="zone z-${z.id}" id="${z.id}" aria-labelledby="zt-${z.id}" data-zone-sec>
  <header class="zone__head">
    <div class="zone__sign">
      <p class="zone__no">Street ${nn} / ${String(zones.length).padStart(2, '0')}</p>
      <h2 class="zone__title" id="zt-${z.id}" tabindex="-1">${esc(z.name)}</h2>
    </div>
    <p class="zone__tag">${esc(z.tagline_bazaar || z.tagline)}</p>
    <p class="zone__count" data-zone-label="${z.items.length}">${z.items.length} dishes</p>
    <div class="zone__art" aria-hidden="true">${pic(z.art, '', true)}</div>
  </header>
  <ul class="zone__grid" role="list" data-stagger="up 45">
${z.items.map((it) => dishHTML(it, z)).join('\n')}
  </ul>
</section>`;
}

function zoneNavHTML() {
  return `    <ul class="zn__list" role="list">
${zones.map((z) => `      <li><a class="zn__stk z-${z.id}" href="#${z.id}" data-zone-link="${z.id}">${ico(ZONE_ICON[z.id])}<span class="zn__name">${esc(z.name)}</span><span class="zn__count" data-zone-count="${z.id}"><span class="visually-hidden">, </span><span data-n>${z.items.length}</span><span class="visually-hidden"> dishes</span></span></a></li>`).join('\n')}
    </ul>`;
}

function filtersHTML() {
  const diet = [['all', 'All', 'spoon-fork', total]].concat(['veg', 'nonveg', 'egg'].map((k) => [k, DIET[k][0], DIET[k][1], count((i) => i.diet === k)]));
  const heat = [0, 1, 2, 3, 4].map((l) => [l, SPICE[l], FIRE_ICON[l], count((i) => i.spice === l)]);
  const pops = count((i) => i.popular);
  return `      <div class="mf__grid">
        <div class="mf__group mf__group--diet" role="group" aria-labelledby="mf-diet-l">
          <p class="mf__label" id="mf-diet-l">Diet</p>
          <div class="seg">
${diet.map(([v, l, ic, n]) => `            <button class="seg__btn" type="button" data-f="diet" data-v="${v}" aria-pressed="${v === 'all'}">${ico(ic)}<span class="seg__t">${l}</span><span class="seg__n" data-c>${nWord(n)}</span></button>`).join('\n')}
          </div>
          <button class="fav" type="button" data-f="fav" aria-pressed="false"><span class="fav__track" aria-hidden="true"><span class="fav__knob"></span></span>${ico('star')}<span class="fav__t">Guest favorites only</span><span class="seg__n" data-c>${nWord(pops)}</span></button>
        </div>
        <div class="mf__group mf__group--fire" role="group" aria-labelledby="mf-heat-l">
          <div class="mf__row"><p class="mf__label" id="mf-heat-l">Pick your fire</p><button class="mf__any" type="button" data-f="heat" data-v="" aria-pressed="true">Any heat</button></div>
          <div class="fire">
${heat.map(([v, l, ic, n]) => `            <button class="fire__btn fire--${v}" type="button" data-f="heat" data-v="${v}" aria-pressed="false"><span class="fire__ico">${ico(ic, v === 0 ? 'ico is-off' : 'ico')}</span><span class="fire__t">${l}</span><span class="seg__n" data-c>${nWord(n)}</span></button>`).join('\n')}
          </div>
          <p class="mf__legend">${ico('chili-1')}<span>Spice levels are a guide — ask us for milder or hotter.</span></p>
        </div>
        <div class="mf__group mf__group--sets" role="group" aria-labelledby="mf-set-l">
          <p class="mf__label" id="mf-set-l">Shortcuts</p>
          <div class="sets">
            <button class="set" type="button" data-f="set" data-v="" aria-pressed="true">${ico('menu-book')}<span class="set__t">Whole menu</span><span class="seg__n" data-c>${nWord(total)}</span></button>
${meta.collections.map((c) => `            <button class="set" type="button" data-f="set" data-v="${c.id}" data-name="${esc(c.name)}" data-tag="${esc(c.tagline_bazaar)}" aria-pressed="false">${ico(SET_ICON[c.id] || 'star')}<span class="set__t">${esc(c.name)}</span><span class="seg__n" data-c>${nWord(menu.collections[c.id].filter((id) => visible.some((i) => i.id === id)).length)}</span></button>`).join('\n')}
          </div>
        </div>
      </div>`;
}

function introHTML() {
  return `      <h1 class="h-hero mh__title" id="mh-title">${esc(intro.headline)}</h1>
      <p class="lead mh__lead">${esc(intro.body)}</p>
      <ul class="mh__stats" role="list">
        <li><b>${total}</b> dishes</li><li><b>${zones.length}</b> streets</li><li><b>${count((i) => i.diet === 'veg')}</b> veg</li><li><b>0</b> boring plates</li>
      </ul>`;
}

function notesHTML() {
  const L = meta.dietLegend;
  return `<section class="notes" aria-labelledby="notes-title">
  <h2 class="notes__title" id="notes-title">Good to know before you order</h2>
  <div class="notes__grid">
    <div class="notes__item notes__item--allergen"><h3>Allergies</h3><p>${esc(meta.allergenNote)}</p></div>
    <div class="notes__item"><h3>Spice</h3><p>${esc(meta.spiceNote)}</p>
      <p class="notes__scale">${meta.spiceScale.map((s) => `<span>${s.level ? ico(FIRE_ICON[s.level]) : ico('chili-1', 'ico is-off')}${esc(s.label)}</span>`).join('')}</p></div>
    <div class="notes__item"><h3>Diet marks</h3><p>${esc(meta.dietNote)}</p>
      <p class="notes__scale"><span>${ico('veg-mark')}${esc(L.veg)}</span><span>${ico('nonveg-mark')}${esc(L.nonveg)}</span><span>${ico('egg-mark')}${esc(L.egg)}</span></p></div>
  </div>
  <p class="notes__disclaimer">${ico('menu-book-mono')}<span>${esc(meta.disclaimer)} No prices are shown until the live menu is confirmed.</span></p>
</section>`;
}

function ldHTML() {
  const ld = {
    '@context': 'https://schema.org', '@type': 'Menu', '@id': SITE_URL + 'menu.html#menu',
    name: 'The District Menu', url: SITE_URL + 'menu.html', inLanguage: 'en-US',
    description: meta.disclaimer,
    hasMenuSection: zones.map((z) => ({
      '@type': 'MenuSection', name: z.name, description: z.tagline, url: SITE_URL + 'menu.html#' + z.id,
      hasMenuItem: z.items.map((i) => ({ '@type': 'MenuItem', name: i.name, description: i.desc_neutral }))
    }))
  };
  return '<script type="application/ld+json">' + JSON.stringify(ld).replace(/</g, '\\u003c') + '</script>';
}

/* ---------- write ---------- */
const regions = {
  ld: ldHTML(), intro: introHTML(), zonenav: zoneNavHTML(), filters: filtersHTML(),
  status: `Showing all ${total} dishes on ${zones.length} streets.`,
  zones: zones.map(zoneHTML).join('\n'), notes: notesHTML()
};
let html = fs.readFileSync(PAGE, 'utf8');
Object.keys(regions).forEach((k) => {
  const re = new RegExp(`(<!-- build:${k} -->)[\\s\\S]*?(<!-- /build:${k} -->)`);
  if (!re.test(html)) throw new Error('menu.html is missing the build region: ' + k);
  const inline = k === 'status';
  html = html.replace(re, (m, a, b) => inline ? a + regions[k] + b : `${a}\n${regions[k]}\n${b}`);
});
fs.writeFileSync(PAGE, html);
console.log(`menu.html: ${total} dishes in ${zones.length} zones (${menu.items.length - total} unconfirmed hidden), ${Math.round(html.length / 1024)} KB`);

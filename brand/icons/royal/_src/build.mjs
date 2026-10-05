// Curry District · ROYAL icon set — generator.
// Run:  node brand/icons/royal/_src/build.mjs
// Emits: <name>.svg (gold, for dark surfaces), on-ivory/<name>.svg, mono/<name>.svg (currentColor),
//        sprite.svg (themeable colour symbols + -mono symbols), icons.json (manifest).
// Grid 64×64 · stroke 1.75 · round caps/joins · keyline 6–58.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ICONS } from './icons.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, '..');

export const PALETTE = {
  line: '#E9A63A',      // saffron-gold
  lineIvory: '#B7791F', // gold-dk — ivory-safe line colour (≥3:1 on #FBF3E4)
  emerald: '#0F4D3F',
  ruby: '#A3173F',
  peacock: '#117C86',
  plate: '#FBF3E4',     // ivory backing plate (diet marks)
  veg: '#17834A',       // FSSAI-style veg green
  nonveg: '#7A3317',    // FSSAI-style non-veg brown
  pin: '#A3173F',       // solid ruby (stays solid in mono)
};
const SPRITE_VAR = { pin: 'ruby' };
const ACCENT = new Set(['emerald', 'ruby', 'peacock']);
const MONO_ACCENT_OPACITY = 0.3;

const n = (v) => (typeof v === 'number' ? +v.toFixed(2) : v);
const attrs = (a) => Object.entries(a).filter(([, v]) => v !== undefined && v !== null)
  .map(([k, v]) => `${k}="${n(v)}"`).join(' ');

function shape(el, extra) {
  return `<${el.tag} ${attrs({ ...el.a, ...extra })}/>`;
}

// colour resolvers per mode
function strokeColour(role, mode) {
  if (mode === 'mono') return 'currentColor';
  if (mode === 'sprite') {
    if (role === 'line') return null; // inherits from group var
    return null;
  }
  if (role === 'line') return mode === 'ivory' ? PALETTE.lineIvory : PALETTE.line;
  return PALETTE[role];
}

function render(icon, mode) {
  const els = icon.els;
  const plate = [], accent = [], solid = [], strokes = [];
  for (const el of els) {
    if (mode === 'mono' && el.mono === false) continue;
    if (el.f) {
      const base = { stroke: undefined };
      if (el.f === 'plate') { if (mode !== 'mono') plate.push({ el }); }
      else if (ACCENT.has(el.f)) accent.push({ el });
      else solid.push({ el });
    }
    if (el.s) strokes.push({ el });
  }
  const out = [];
  const fillAttrs = (el) => {
    const r = el.f;
    const a = {};
    if (el.a.transform) a.transform = el.a.transform;
    if (el.rule) a['fill-rule'] = el.rule;
    if (mode === 'mono') { a.fill = 'currentColor'; return a; }
    if (mode === 'sprite') {
      const v = r === 'gold' ? `var(--icon-line,${PALETTE.line})`
        : r === 'plate' ? `var(--icon-plate,${PALETTE.plate})`
        : `var(--icon-${SPRITE_VAR[r] || r},${PALETTE[r]})`;
      a.style = `fill:${v}`; return a;
    }
    a.fill = r === 'gold' ? (mode === 'ivory' ? PALETTE.lineIvory : PALETTE.line) : PALETTE[r];
    return a;
  };
  const geom = (el) => { const g = { ...el.a }; delete g.transform; return g; };
  const emit = (el, extra) => `<${el.tag} ${attrs({ ...geom(el), ...extra })}/>`;

  for (const { el } of plate) out.push(emit(el, fillAttrs(el)));
  if (accent.length) {
    const inner = accent.map(({ el }) => emit(el, fillAttrs(el))).join('');
    if (mode === 'mono') out.push(`<g opacity="${MONO_ACCENT_OPACITY}">${inner}</g>`);
    else if (mode === 'sprite') out.push(`<g style="opacity:var(--icon-accent-opacity,1)">${inner}</g>`);
    else out.push(inner);
  }
  for (const { el } of solid) out.push(emit(el, fillAttrs(el)));
  if (strokes.length) {
    const inner = strokes.map(({ el }) => {
      const a = {};
      if (el.a.transform) a.transform = el.a.transform;
      if (el.s !== 'line') {
        if (mode === 'mono') { /* inherits currentColor */ }
        else if (mode === 'sprite') a.style = `stroke:var(--icon-${el.s},${PALETTE[el.s]})`;
        else a.stroke = PALETTE[el.s];
      }
      if (el.sw) a['stroke-width'] = el.sw;
      if (el.dots) a['stroke-dasharray'] = `0 ${el.dots}`;
      if (el.dashoffset) a['stroke-dashoffset'] = el.dashoffset;
      return emit(el, a);
    }).join('');
    if (mode === 'sprite') out.push(`<g style="stroke:var(--icon-line,${PALETTE.line})">${inner}</g>`);
    else out.push(`<g stroke="${mode === 'mono' ? 'currentColor' : mode === 'ivory' ? PALETTE.lineIvory : PALETTE.line}">${inner}</g>`);
  }
  return out.join('');
}

const ROOT = 'fill="none" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"';

function fileSvg(icon, mode) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" ${ROOT}>${render(icon, mode)}</svg>\n`;
}

function build() {
  const names = [];
  for (const icon of ICONS) {
    names.push(icon.name);
    fs.writeFileSync(path.join(OUT, `${icon.name}.svg`), fileSvg(icon, 'dark'));
    fs.writeFileSync(path.join(OUT, 'on-ivory', `${icon.name}.svg`), fileSvg(icon, 'ivory'));
    fs.writeFileSync(path.join(OUT, 'mono', `${icon.name}.svg`), fileSvg(icon, 'mono'));
  }
  // Sprite: colour symbols (CSS-variable themeable) + mono symbols.
  const sym = [];
  for (const icon of ICONS) {
    sym.push(`<symbol id="icon-${icon.name}" viewBox="0 0 64 64"><g ${ROOT.replace('stroke-width="1.75"', 'style="stroke-width:var(--icon-stroke,1.75)"')}>${render(icon, 'sprite')}</g></symbol>`);
  }
  for (const icon of ICONS) {
    sym.push(`<symbol id="icon-${icon.name}-mono" viewBox="0 0 64 64"><g ${ROOT.replace('stroke-width="1.75"', 'style="stroke-width:var(--icon-stroke,1.75)"')}>${render(icon, 'mono')}</g></symbol>`);
  }
  const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n<!-- Curry District · Royal icons · ${ICONS.length} colour symbols (icon-NAME) + ${ICONS.length} mono symbols (icon-NAME-mono). 64×64 grid, 1.75 stroke. -->\n${sym.join('\n')}\n</svg>\n`;
  fs.writeFileSync(path.join(OUT, 'sprite.svg'), sprite);
  const manifest = ICONS.map(({ name, label, group }) => ({ name, label, group }));
  fs.writeFileSync(path.join(OUT, 'icons.json'), JSON.stringify(manifest, null, 2) + '\n');
  return { count: ICONS.length, spriteBytes: sprite.length };
}

console.log(build());

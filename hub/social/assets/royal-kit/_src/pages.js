// Page definitions for the Royal social kit. Each entry: { id, w, h, html }
const L = require('./lib');
const { C, art, archWindow, page, wordmark, iconInline, star, fakeQR, arrow, chili, logo, icon, BR } = L;

const P = []; // registry
const add = (o) => { P.push(o); return o; };

// ──────────────────────────────── POSTS 1080×1350 ────────────────────────────────
const PW = 1080, PH = 1350;

function dishHero({ id, kind = 'midnight', glow = 'midnight', dish, dishW = 860, dishBase = 610, eyebrow, title, line, titleSize = 116, win = { x: 240, y: 118, w: 600, h: 760 }, extra = '', wmY = 1196 }) {
  const sillY = win.y + win.h;
  const sc = dishW / 800;
  const top = sillY - dishBase * sc + 12;
  const body = `${archWindow({ ...win, glow })}
<img class="abs" alt="" src="${art(dish)}" style="left:${(PW - dishW) / 2}px;top:${top}px;width:${dishW}px">
<div class="abs center eyebrow" style="top:${sillY + 50}px">${eyebrow}</div>
<div class="abs center h1" style="top:${sillY + 92}px;font-size:${titleSize}px">${title}</div>
<div class="abs center it" style="top:${sillY + 92 + titleSize * 1.1}px;font-size:50px;color:rgba(251,243,228,.92)">${line}</div>
${extra}${wordmark(kind, { y: wmY, h: 72 })}`;
  return add({ id, w: PW, h: PH, html: page({ w: PW, h: PH, kind, body }) });
}

dishHero({
  id: 'post-hero-butter-chicken', kind: 'midnight', glow: 'plum', dish: 'butter-chicken',
  eyebrow: 'From the Curry Quarter', title: 'Butter Chicken',
  line: 'velvet-rich, slow and <span class="foil">golden</span>',
});

module.exports = P;

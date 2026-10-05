"""Dieline-style technical sheets (SVG, mm). Indicative only — confirm with supplier template."""
import math
from lib import *
from faces import *

OUT = '/home/user/playground/hub/packaging/assets/boxes'
CUT, FOLD, BLEED, SAFE, DIM = '#E4007C', '#0096D6', '#E53935', '#00A651', '#2B2B2B'
BL = 3.0


def legend_block(x, y, dr, title, sub, specs, notes, w=170):
    acc = BZ['saffron'] if dr == 'bazaar' else RY['gold']
    lab = 'A · BAZAAR' if dr == 'bazaar' else 'B · ROYAL'
    o = f'<rect x="{x}" y="{y}" width="{w}" height="6" fill="{acc}"/>'
    o += text(lab, 'hk700', 3.4, x, y + 14, 'start', DIM, .2)
    o += text(title, 'fr600', 9, x, y + 26, 'start', '#160B26', maxw=w)
    o += text(sub, 'hk500', 3.6, x, y + 33, 'start', '#555', maxw=w)
    yy = y + 44
    o += f'<rect x="{x}" y="{yy - 6}" width="{w}" height="13" fill="#FFF3CD"/>'
    o += text('INDICATIVE — CONFIRM WITH SUPPLIER TEMPLATE', 'hk700', 3.3, x + 3, yy + 2.2, 'start', '#8A4B00', .05, maxw=w - 6)
    yy += 16
    for i, (k, c, dash) in enumerate([('Cut line', CUT, ''), ('Fold / crease', FOLD, '3 2'), ('Bleed 3 mm', BLEED, '1 1'), ('Safe zone (3 mm inset)', SAFE, '0.6 1.2')]):
        o += f'<line x1="{x}" y1="{yy}" x2="{x + 14}" y2="{yy}" stroke="{c}" stroke-width=".8" stroke-dasharray="{dash}"/>'
        o += text(k, 'hk500', 3.4, x + 18, yy + 1.2, 'start', DIM)
        yy += 7
    yy += 4
    o += text('DIMENSIONS (mm)', 'hk700', 3.2, x, yy, 'start', DIM, .15); yy += 6
    for k, v in specs:
        o += text(k, 'hk500', 3.2, x, yy, 'start', '#444', maxw=w * .62)
        o += text(v, 'hk700', 3.2, x + w, yy, 'end', DIM)
        o += f'<line x1="{x}" y1="{yy + 1.8}" x2="{x + w}" y2="{yy + 1.8}" stroke="#ddd" stroke-width=".25"/>'
        yy += 6
    yy += 4
    o += text('PRINT NOTES', 'hk700', 3.2, x, yy, 'start', DIM, .15); yy += 6
    for n in notes:
        o += text('· ' + n, 'hk500', 3.0, x, yy, 'start', '#444', maxw=w); yy += 5.2
    o += text('Concept artwork for the Curry District pitch — not production files.', 'hk500', 2.8, x, yy + 4, 'start', '#888', maxw=w)
    return o


def dimline(x1, y1, x2, y2, label, off=8, size=3.4):
    ang = math.atan2(y2 - y1, x2 - x1)
    nx, ny = -math.sin(ang) * off, math.cos(ang) * off
    a1, b1, a2, b2 = x1 + nx, y1 + ny, x2 + nx, y2 + ny
    o = f'<g stroke="{DIM}" stroke-width=".3" fill="none"><line x1="{fmt(x1)}" y1="{fmt(y1)}" x2="{fmt(a1 + nx * .15)}" y2="{fmt(b1 + ny * .15)}"/><line x1="{fmt(x2)}" y1="{fmt(y2)}" x2="{fmt(a2 + nx * .15)}" y2="{fmt(b2 + ny * .15)}"/>'
    o += f'<line x1="{fmt(a1)}" y1="{fmt(b1)}" x2="{fmt(a2)}" y2="{fmt(b2)}" marker-start="url(#ar)" marker-end="url(#ar)"/></g>'
    mx, my = (a1 + a2) / 2 + nx * .35, (b1 + b2) / 2 + ny * .35
    deg = math.degrees(ang)
    if deg > 90 or deg < -90:
        deg += 180
    o += f'<g transform="translate({fmt(mx)} {fmt(my)}) rotate({fmt(deg)})"><rect x="{fmt(-len(label) * size * .32)}" y="{fmt(-size * .9)}" width="{fmt(len(label) * size * .64)}" height="{fmt(size * 1.3)}" fill="#fff"/>{text(label, "hk700", size, 0, size * .3, "middle", DIM)}</g>'
    return o


ARROW = '<marker id="ar" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L6 3L0 6Z" fill="#2B2B2B"/></marker>'


def sheet(w, h, body, title):
    return svg_doc(w, h, f'<rect width="{w}" height="{h}" fill="#FFFFFF"/>' + body, ARROW, title=title)


def apply(m, p):
    a, b, c, d, e, f = m
    return (a * p[0] + c * p[1] + e, b * p[0] + d * p[1] + f)


def rigid(p1, p2, q1, q2):
    """matrix mapping p1→q1, p2→q2 (equal lengths)."""
    a1 = math.atan2(p2[1] - p1[1], p2[0] - p1[0]); a2 = math.atan2(q2[1] - q1[1], q2[0] - q1[0])
    t = a2 - a1; c, s = math.cos(t), math.sin(t)
    e = q1[0] - (c * p1[0] - s * p1[1]); f = q1[1] - (s * p1[0] + c * p1[1])
    return (c, s, -s, c, e, f)


def mstr(m):
    return 'matrix(' + ' '.join(fmt(v) if abs(v) > 1e-9 else '0' for v in m) + ')'


def edges_svg(pts, kinds):
    o = ''
    n = len(pts)
    for i in range(n):
        a, b = pts[i], pts[(i + 1) % n]
        k = kinds[i]
        if k == 'cut':
            o += f'<line x1="{fmt(a[0])}" y1="{fmt(a[1])}" x2="{fmt(b[0])}" y2="{fmt(b[1])}" stroke="{CUT}" stroke-width=".55"/>'
        elif k == 'fold':
            o += f'<line x1="{fmt(a[0])}" y1="{fmt(a[1])}" x2="{fmt(b[0])}" y2="{fmt(b[1])}" stroke="{FOLD}" stroke-width=".55" stroke-dasharray="3 2"/>'
    return o


def bleed_lines(pts, kinds, d=BL):
    o = ''
    op = offset_poly(pts, d)
    n = len(pts)
    for i in range(n):
        if kinds[i] == 'cut':
            a, b = op[i], op[(i + 1) % n]
            o += f'<line x1="{fmt(a[0])}" y1="{fmt(a[1])}" x2="{fmt(b[0])}" y2="{fmt(b[1])}" stroke="{BLEED}" stroke-width=".3" stroke-dasharray="1 1"/>'
    return o


def safe_poly(pts, d=3):
    ip = offset_poly(pts, -d)
    return f'<path d="{poly(ip)}" fill="none" stroke="{SAFE}" stroke-width=".35" stroke-dasharray=".6 1.2"/>'


# ─────────────── pail ───────────────
def pail_dieline(dr):
    pieces = []  # (face, matrix, pts_local, edge kinds)
    front = pail_face(dr, 'front', 'print', BL); back = pail_face(dr, 'back', 'print', BL)
    sideR = pail_face(dr, 'side', 'print', BL); sideL = pail_face(dr, 'side', 'print', BL)
    order = [front, sideR, back, sideL]
    m = (1, 0, 0, 1, 0, 0)
    prev = None
    mats = []
    for f in order:
        if prev is None:
            m = (1, 0, 0, 1, 0, 0)
        else:
            pf, pm = prev
            q1 = apply(pm, pf.pts[1]); q2 = apply(pm, pf.pts[2])
            m = rigid(f.pts[0], f.pts[3], q1, q2)
        mats.append(m); prev = (f, m)
    body, lines, safes, bleeds, dims = '', '', '', '', ''
    allpts = []
    for i, (f, m) in enumerate(zip(order, mats)):
        body += f'<g transform="{mstr(m)}">{f.inner()}</g>'
        P = [apply(m, p) for p in f.pts]; allpts += P
        kinds = ['fold', 'fold' if True else 'cut', 'cut', 'fold' if i > 0 else 'cut']
        kinds = ['fold', 'fold', 'cut', 'fold' if i > 0 else 'cut']
        lines += edges_svg(P, kinds); bleeds += bleed_lines(P, kinds); safes += safe_poly(P)
        # flap / gable on top edge
        if f in (front, back):
            fl = pail_flap(dr, 'front' if f is front else 'back', 'print', BL)
        else:
            fl = pail_gable(dr, 'print', BL)
        fm = rigid((0, fl.h), (fl.w, fl.h), f.pts[0], f.pts[1])
        fm2 = _mul(m, fm)
        body += f'<g transform="{mstr(fm2)}">{fl.inner()}</g>'
        FP = [apply(fm2, p) for p in fl.pts]; allpts += FP
        fk = ['cut'] * len(FP); fk[-1] = 'none'
        lines += edges_svg(FP, fk); bleeds += bleed_lines(FP, fk); safes += safe_poly(FP)
        # hinge drawn by panel's top edge (kind 'fold' above)
    # glue tab off last panel's right edge
    f, mm = order[-1], mats[-1]
    a, b = apply(mm, f.pts[1]), apply(mm, f.pts[2])
    ang = math.atan2(b[1] - a[1], b[0] - a[0]); nx, ny = math.sin(ang) * -1, math.cos(ang)
    nx, ny = -math.sin(ang), math.cos(ang)
    # outward normal = away from panel interior (to the right of a→b when walking down)
    nx, ny = math.cos(ang - math.pi / 2), math.sin(ang - math.pi / 2)
    if (nx * (apply(mm, f.pts[0])[0] - a[0]) + ny * (apply(mm, f.pts[0])[1] - a[1])) > 0:
        nx, ny = -nx, -ny
    g = 12
    ux, uy = math.cos(ang), math.sin(ang)
    L = math.hypot(b[0] - a[0], b[1] - a[1])
    G = [a, b, (b[0] + nx * g - ux * 6, b[1] + ny * g - uy * 6), (a[0] + nx * g + ux * 6, a[1] + ny * g + uy * 6)]
    body += f'<path d="{poly(G)}" fill="#EFE7D8"/>'
    body += f'<path d="{poly(G)}" fill="url(#hatch)"/>'
    lines += edges_svg(G, ['none', 'cut', 'cut', 'cut'])
    gx, gy = (G[2][0] + G[3][0] + a[0] + b[0]) / 4, (G[2][1] + G[3][1] + a[1] + b[1]) / 4
    lines += f'<g transform="translate({fmt(gx)} {fmt(gy)}) rotate({fmt(math.degrees(ang))})">{text("GLUE 12", "hk700", 3, 0, 1, "middle", DIM)}</g>'
    # dims on front panel
    fp = front.pts
    dims += dimline(fp[0][0], fp[0][1], fp[1][0], fp[1][1], f'{P_["top_w"]:.0f}', -10 - BL - front.h * 0)
    dims += dimline(fp[3][0], fp[3][1], fp[2][0], fp[2][1], f'{P_["base"]:.0f}', 10)
    xs = [p[0] for p in allpts] + [p[0] for p in G]; ys = [p[1] for p in allpts] + [p[1] for p in G]
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    # place on sheet
    pad = 22
    W_art = maxx - minx + 2 * pad
    SW = W_art + 200; SH = max(maxy - miny + 2 * pad + 30, 330)
    tx, ty = pad - minx, pad + 18 - miny
    hatch = '<pattern id="hatch" patternUnits="userSpaceOnUse" width="3" height="3" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="3" stroke="#bbb" stroke-width=".5"/></pattern>'
    content = (f'<defs>{hatch}</defs><g transform="translate({fmt(tx)} {fmt(ty)})">{body}{bleeds}{safes}{lines}{dims}</g>'
               + text('Outside face shown · 4 body panels + closing flaps · wire handle punched through side panels', 'hk500', 3.4, pad, 14, 'start', '#555'))
    specs = [('Capacity (stock size)', '26 oz'), ('Base', '70 × 70'), ('Top opening', f'{P_["top_w"]} × {P_["top_d"]}'),
             ('Body height', f'{P_["h"]}'), ('Front/back panel slant', f'{P_["slant_f"]:.1f}'), ('Side panel slant', f'{P_["slant_s"]:.1f}'),
             ('Closing flap', f'{P_["flap"]:.1f}'), ('Glue tab', '12'), ('Bleed', '3')]
    notes = ['Print outside face only; low-migration inks.', 'Food side unprinted / PE-lined stock.',
             'Keep 8 mm clear around handle punch.', 'Bottom folds per converter blank.']
    if dr == 'royal':
        notes.insert(0, 'Single hit of saffron-gold foil on midnight.')
    else:
        notes.insert(0, 'CMYK + ink indigo outline; booti pattern full bleed.')
    content += legend_block(W_art + 15, 22, dr, 'Takeout pail wrap', '26 oz Chinese-style pail · flat dieline', specs, notes)
    return sheet(SW, SH, content, f'Curry District — pail wrap dieline ({dr})'), SW, SH


P_ = P


def _mul(m1, m2):
    a, b, c, d, e, f = m1; A_, B_, C_, D_, E_, F_ = m2
    return (a * A_ + c * B_, b * A_ + d * B_, a * C_ + c * D_, b * C_ + d * D_, a * E_ + c * F_ + e, b * E_ + d * F_ + f)


# ─────────────── clamshell belly band ───────────────
def band_dieline(dr):
    bw = C['band']
    segs = [('back', clam_band(dr, 'back', 'print', BL), 180), ('top', clam_band(dr, 'top', 'print', BL), 0),
            ('front', clam_band(dr, 'front', 'print', BL), 0), ('bottom', clam_band(dr, 'bottom', 'print', BL), 0)]
    x0, y0 = 30, 30
    y = y0
    body, lines, safes, dims = '', '', '', ''
    names = {'back': 'BACK', 'top': 'LID TOP', 'front': 'FRONT', 'bottom': 'BASE'}
    for name, f, rot in segs:
        if rot:
            body += f'<g transform="translate({fmt(x0 + f.w)} {fmt(y + f.h)}) rotate(180)">{f.inner()}</g>'
        else:
            body += f'<g transform="translate({fmt(x0)} {fmt(y)})">{f.inner()}</g>'
        safes += f'<rect x="{fmt(x0 + 3)}" y="{fmt(y + 3)}" width="{fmt(f.w - 6)}" height="{fmt(f.h - 6)}" fill="none" stroke="{SAFE}" stroke-width=".35" stroke-dasharray=".6 1.2"/>'
        dims += dimline(x0 + bw, y, x0 + bw, y + f.h, f'{f.h:.1f}', -9)
        dims += f'<g transform="translate({fmt(x0 - 6)} {fmt(y + f.h / 2)}) rotate(-90)">{text(names[name], "hk700", 3.2, 0, 0, "middle", DIM, .2)}</g>'
        y += f.h
        if name != 'bottom':
            lines += f'<line x1="{fmt(x0)}" y1="{fmt(y)}" x2="{fmt(x0 + bw)}" y2="{fmt(y)}" stroke="{FOLD}" stroke-width=".55" stroke-dasharray="3 2"/>'
    lines += f'<line x1="{fmt(x0)}" y1="{fmt(y)}" x2="{fmt(x0 + bw)}" y2="{fmt(y)}" stroke="{FOLD}" stroke-width=".55" stroke-dasharray="3 2"/>'
    # glue flap
    g = 15
    body += f'<rect x="{fmt(x0)}" y="{fmt(y)}" width="{fmt(bw)}" height="{g}" fill="#EFE7D8"/><rect x="{fmt(x0)}" y="{fmt(y)}" width="{fmt(bw)}" height="{g}" fill="url(#hatch)"/>'
    body += text('GLUE 15 — tucks under BACK', 'hk700', 3, x0 + bw / 2, y + g / 2 + 1, 'middle', DIM)
    total = y + g - y0
    # cut outline
    lines += (f'<path d="M{x0} {y0}H{fmt(x0 + bw)}V{fmt(y0 + total)}H{x0}Z" fill="none" stroke="{CUT}" stroke-width=".55"/>'
              f'<rect x="{fmt(x0 - BL)}" y="{fmt(y0 - BL)}" width="{fmt(bw + 2 * BL)}" height="{fmt(total - g + 2 * BL)}" fill="none" stroke="{BLEED}" stroke-width=".3" stroke-dasharray="1 1"/>')
    dims += dimline(x0, y0, x0 + bw, y0, f'{bw:.0f}', -9)
    dims += dimline(x0 + bw, y0, x0 + bw, y0 + total, f'{total:.1f} total', -26)
    hatch = '<pattern id="hatch" patternUnits="userSpaceOnUse" width="3" height="3" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="3" stroke="#bbb" stroke-width=".5"/></pattern>'
    SW, SH = 340, y0 + total + 30
    content = f'<defs>{hatch}</defs>{body}{safes}{lines}{dims}'
    specs = [('Box (stock clamshell)', '229 × 152 × 76'), ('Band width', f'{bw}'), ('Lid top panel', f'{C["lidD"]}'),
             ('Front / back (taut)', f'{C["band_front"]:.1f}'), ('Base panel', f'{C["Db"]}'), ('Glue flap', '15'), ('Flat length', f'{total:.1f}')]
    notes = ['Band slides on after lid closes = tamper cue.', 'District Stamp seal applied on FRONT.',
             'Inside-lid line: only with food-contact', 'certified ink/coating, else on an insert card.']
    notes.insert(0, 'Single foil hit on emerald stock.' if dr == 'royal' else 'Booti pattern full bleed, indigo selvedges.')
    content += legend_block(150, 30, dr, 'Clamshell belly band', '9 × 6 in kraft clamshell sleeve · flat dieline', specs, notes)
    return sheet(SW, SH, content, f'Curry District — clamshell belly band dieline ({dr})'), SW, SH


# ─────────────── tub lid sleeve (arc) + lid label ───────────────
def tub_dieline(dr):
    w, h = T['sleeve_rect_w'], T['sleeve_slant']
    s = T['slant'] / (T['rt'] - T['rb'])
    Rin = tub_r(T['s0']) * s; Rout = tub_r(T['s1']) * s
    Rmid = (Rin + Rout) / 2
    span = w / Rmid  # radians
    glue = 10 / Rmid
    a0, a1 = -span / 2, span / 2 + glue
    cx, cy = 25 + Rout * math.sin(span / 2) + 4, 40 + Rout
    f = Face(f'tub-{dr}-dl', w, h, 'rect', None, BL)

    def pt(r, a):
        return cx + r * math.sin(a), cy - r * math.cos(a)

    def sector(r1, r2, aa, ab):
        p1, p2, p3, p4 = pt(r2, aa), pt(r2, ab), pt(r1, ab), pt(r1, aa)
        lg = 1 if ab - aa > math.pi else 0
        return (f'M{fmt(p1[0])} {fmt(p1[1])}A{fmt(r2)} {fmt(r2)} 0 {lg} 1 {fmt(p2[0])} {fmt(p2[1])}L{fmt(p3[0])} {fmt(p3[1])}'
                f'A{fmt(r1)} {fmt(r1)} 0 {lg} 0 {fmt(p4[0])} {fmt(p4[1])}Z')

    def place(x, y, svg):
        a = (x - w / 2) / Rmid; r = Rout - y * (Rout - Rin) / h
        px, py = pt(r, a)
        return f'<g transform="translate({fmt(px)} {fmt(py)}) rotate({fmt(math.degrees(a))})">{svg}</g>'

    elems = tub_sleeve_elems(dr, w, h, 'print', f, place)
    skip = 3 if dr == 'bazaar' else 6
    clip = uid('sc')
    f.d(f'<clipPath id="{clip}"><path d="{sector(Rin - BL, Rout + BL, -span / 2 - BL / Rmid, span / 2 + BL / Rmid)}"/></clipPath>')
    if dr == 'bazaar':
        pid = uid('bzp'); f.d(bz_pattern(pid, 30))
        ground = f'<path d="{sector(Rin - BL, Rout + BL, -span, span)}" fill="url(#{pid})"/>'
        rims = (f'<path d="{sector(Rout - 7, Rout + BL, -span, span)}" fill="{BZ["ink"]}"/>'
                f'<path d="{sector(Rin - BL, Rin + 6, -span, span)}" fill="{BZ["ink"]}"/>'
                f'<path d="{sector(Rout - 9.2, Rout - 7, -span, span)}" fill="{BZ["rani"]}"/><path d="{sector(Rin + 6, Rin + 8, -span, span)}" fill="{BZ["rani"]}"/>')
        n = int(span * (Rout - 3.5) / 4.3)
        rims += ''.join(f'<circle cx="{fmt(pt(Rout - 3.5, -span / 2 + (i + .5) * span / n)[0])}" cy="{fmt(pt(Rout - 3.5, -span / 2 + (i + .5) * span / n)[1])}" r=".9" fill="{BZ["marigold"]}"/>' for i in range(n))
    else:
        foil = ry_foil(f)
        pid = uid('ryp'); f.d(ry_pattern(pid, 20))
        ground = f'<path d="{sector(Rin - BL, Rout + BL, -span, span)}" fill="{RY["emerald"]}"/>'
        rims = (f'<path d="{sector(Rout - 11, Rout + BL, -span, span)}" fill="url(#{pid})"/><path d="{sector(Rin - BL, Rin + 11, -span, span)}" fill="url(#{pid})"/>'
                f'<path d="{sector(Rout - 11.6, Rout - 11, -span, span)}" fill="{RY["gold"]}"/><path d="{sector(Rin + 11, Rin + 11.6, -span, span)}" fill="{RY["gold"]}"/>')
    art = f'<defs>{"".join(f.defs)}</defs><g clip-path="url(#{clip})">{ground}{rims}{"".join(elems[skip:])}</g>'
    glue_p = sector(Rin, Rout, span / 2, span / 2 + glue)
    hatch = '<pattern id="hatch" patternUnits="userSpaceOnUse" width="3" height="3" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="3" stroke="#bbb" stroke-width=".5"/></pattern>'
    o = f'<defs>{hatch}</defs>{art}<path d="{glue_p}" fill="#EFE7D8"/><path d="{glue_p}" fill="url(#hatch)"/>'
    o += f'<path d="{sector(Rin, Rout, -span / 2, span / 2 + glue)}" fill="none" stroke="{CUT}" stroke-width=".55"/>'
    p1, p2 = pt(Rin, span / 2), pt(Rout, span / 2)
    o += f'<line x1="{fmt(p1[0])}" y1="{fmt(p1[1])}" x2="{fmt(p2[0])}" y2="{fmt(p2[1])}" stroke="{FOLD}" stroke-width=".55" stroke-dasharray="3 2"/>'
    o += f'<path d="{sector(Rin - BL, Rout + BL, -span / 2 - BL / Rmid, span / 2)}" fill="none" stroke="{BLEED}" stroke-width=".3" stroke-dasharray="1 1"/>'
    o += f'<path d="{sector(Rin + 3, Rout - 3, -span / 2 + 3 / Rmid, span / 2 - 3 / Rmid)}" fill="none" stroke="{SAFE}" stroke-width=".35" stroke-dasharray=".6 1.2"/>'
    gp = pt(Rmid, span / 2 + glue / 2)
    o += f'<g transform="translate({fmt(gp[0])} {fmt(gp[1])}) rotate({fmt(math.degrees(span / 2 + glue / 2) - 90)})">{text("GLUE 10", "hk700", 2.6, 0, 1, "middle", DIM)}</g>'
    o += dimline(*pt(Rin, -span / 2), *pt(Rout, -span / 2), f'{h:.1f}', 8)
    top = pt(Rout, 0); o += text(f'R {Rout:.1f} outer · R {Rin:.1f} inner · {math.degrees(span):.1f}° + glue', 'hk700', 3.2, top[0], top[1] - 9, 'middle', DIM)
    # lid label
    lab = tub_lid(dr, 'print', BL)
    lx, ly = cx - lab.w / 2, cy - Rin + 30
    o += f'<g transform="translate({fmt(lx)} {fmt(ly)})">{lab.inner()}</g>'
    c = lab.w / 2
    o += f'<circle cx="{fmt(lx + c)}" cy="{fmt(ly + c)}" r="{fmt(c)}" fill="none" stroke="{CUT}" stroke-width=".55"/>'
    o += f'<circle cx="{fmt(lx + c)}" cy="{fmt(ly + c)}" r="{fmt(c + BL)}" fill="none" stroke="{BLEED}" stroke-width=".3" stroke-dasharray="1 1"/>'
    o += f'<circle cx="{fmt(lx + c)}" cy="{fmt(ly + c)}" r="{fmt(c - 3)}" fill="none" stroke="{SAFE}" stroke-width=".35" stroke-dasharray=".6 1.2"/>'
    o += dimline(lx, ly + c, lx + lab.w, ly + c, f'Ø {lab.w:.1f} lid label', lab.w / 2 + 10)
    SW = cx + Rout * math.sin(span / 2 + glue) + 200
    SH = ly + lab.w + 35
    specs = [('Tub (stock, PP)', '16 oz'), ('Top Ø / base Ø', f'{2 * T["rt"]} / {2 * T["rb"]}'), ('Tub height', f'{T["h"]}'),
             ('Sleeve band (slant)', f'{h:.1f}'), ('Sleeve outer R', f'{Rout:.1f}'), ('Sleeve inner R', f'{Rin:.1f}'),
             ('Arc + glue', f'{math.degrees(span):.1f}° + 10 mm'), ('Lid label', 'Ø 101.6 (4 in)')]
    notes = ['Sleeve + lid label are paper; tub stays stock.', 'Spice dots: staff circle one at the pass.',
             'Dish write-in line on every lid label.']
    notes.insert(0, 'Single foil hit on emerald / midnight.' if dr == 'royal' else 'Booti pattern full bleed, indigo rims.')
    o += legend_block(SW - 185, 22, dr, 'Tub lid sleeve + label', '16 oz deli tub · conical sleeve + lid label', specs, notes)
    return sheet(SW, SH, o, f'Curry District — tub lid sleeve dieline ({dr})'), SW, SH


if __name__ == '__main__':
    import json
    jobs = []
    for dr in ('bazaar', 'royal'):
        for fn, name in ((pail_dieline, 'pail-wrap'), (band_dieline, 'clamshell-band'), (tub_dieline, 'tub-lid-sleeve')):
            svg, w, h = fn(dr)
            p = f'{OUT}/dieline-{name}-{dr}.svg'
            open(p, 'w').write(svg)
            hp = f'/tmp/claude-0/-home-user-playground/daae35f2-3bb9-5abe-8c86-175861b9361b/scratchpad/boxes/shots/dl-{name}-{dr}.html'
            ph = round(1600 * h / w)
            open(hp, 'w').write(f'<!doctype html><html><body style="margin:0;background:#fff"><img src="{p}" style="width:800px;height:{ph / 2:.0f}px;display:block"><i id="done"></i></body></html>')
            jobs.append(dict(html=hp, out=f'{OUT}/dieline-{name}-{dr}.png', w=800, h=round(ph / 2), dpr=2))
            print(name, dr, round(w), round(h))
    json.dump(jobs, open('/tmp/claude-0/-home-user-playground/daae35f2-3bb9-5abe-8c86-175861b9361b/scratchpad/boxes/jobs_dl.json', 'w'))

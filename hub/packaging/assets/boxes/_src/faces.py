"""Face artwork for the Curry District takeout family — A·Bazaar and B·Royal.
Every face is drawn in millimetres at real (indicative) size. mode: 'print' (dieline art: no seal, no marker),
'art' (as-used: seal sticker applied), 'mock' (art + staff marker on the spice row)."""
import math
from lib import *

# ── indicative dimensions (mm) ────────────────────────────────────────
D = dict(
    pail=dict(base=70, top_w=102, top_d=86, h=112, ridge=34),
    clam=dict(L=229, D=152, H=76, Lb=214, Db=138, seam=58, lidL=231, lidD=154, band=90),
    tub=dict(rt=57, rb=43, h=76, lid_r=59, lid_h=9, s0=8, s1=66, label=101.6),
    handi=dict(prof=[(0, 0), (60, 0), (66, 4), (76, 16), (84, 32), (88, 48), (86, 64), (80, 80), (74, 92), (73, 96)],
               band_r=79.5, band_y0=92, band_h=17, dome_y0=109, dome_h=40, knob_r=11, knob_h=13),
    tray=dict(L=256, D=180, H=66, tL=250, tD=174, tH=60),
)
P, C, T, H, TR = D['pail'], D['clam'], D['tub'], D['handi'], D['tray']
P['slant_f'] = math.hypot(P['h'], (P['top_d'] - P['base']) / 2)
P['slant_s'] = math.hypot(P['h'], (P['top_w'] - P['base']) / 2)
P['flap'] = math.hypot(P['top_d'] / 2, P['ridge'])
P['gable'] = math.hypot(P['ridge'], 5)
C['band_front'] = math.hypot(C['H'], (C['lidD'] - C['Db']) / 2)
T['slant'] = math.hypot(T['h'], T['rt'] - T['rb'])


def tub_r(y):
    return T['rb'] + (T['rt'] - T['rb']) * y / T['h']


T['sleeve_rect_w'] = 2 * math.pi * tub_r((T['s0'] + T['s1']) / 2)
T['sleeve_slant'] = (T['s1'] - T['s0']) * T['slant'] / T['h']
_pl = 0
for a, b in zip(H['prof'], H['prof'][1:]):
    _pl += math.hypot(b[0] - a[0], b[1] - a[1])
H['body_len'] = _pl - H['prof'][1][0]  # wall profile length (excl. base disc)
H['body_w'] = 2 * math.pi * 88
H['band_w'] = 2 * math.pi * H['band_r']
H['dome_d'] = 2 * (H['band_r'] + 0.5)

ZONES = {'pail': 'Indo-Chinese Alley', 'clam': 'Tandoor Quarter', 'tub': 'Curry Quarter',
         'handi': 'Biryani Boulevard', 'tray': 'The District Combo'}
SPICE = ['MILD', 'MEDIUM', 'HOT', 'EXTRA HOT', 'DISTRICT HOT']
ADDRESS = '11851 FM 423, SUITE 200 · LITTLE ELM, TX 75068'


def poly(pts):
    return 'M' + 'L'.join(f'{fmt(x)} {fmt(y)}' for x, y in pts) + 'Z'


def offset_poly(pts, d):
    """Offset a convex polygon (clockwise in SVG coords) outward by d."""
    n = len(pts)
    lines = []
    # signed area to get orientation
    area = sum(pts[i][0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * pts[i][1] for i in range(n))
    s = 1 if area > 0 else -1
    for i in range(n):
        (x1, y1), (x2, y2) = pts[i], pts[(i + 1) % n]
        dx, dy = x2 - x1, y2 - y1
        L = math.hypot(dx, dy)
        nx, ny = s * dy / L, -s * dx / L
        lines.append(((x1 + nx * d, y1 + ny * d), (x2 + nx * d, y2 + ny * d)))
    out = []
    for i in range(n):
        (a1, a2), (b1, b2) = lines[i - 1], lines[i]
        out.append(_isect(a1, a2, b1, b2))
    return out


def _isect(p1, p2, p3, p4):
    x1, y1 = p1; x2, y2 = p2; x3, y3 = p3; x4, y4 = p4
    den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if abs(den) < 1e-9:
        return p2
    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den
    return (x1 + t * (x2 - x1), y1 + t * (y2 - y1))


class Face:
    def __init__(self, name, w, h, shape='rect', pts=None, bleed=0):
        self.name, self.w, self.h, self.shape, self.pts, self.b = name, w, h, shape, pts, bleed
        self.defs, self.body = [], []

    def d(self, s):
        self.defs.append(s); return self

    def add(self, s):
        self.body.append(s); return self

    def clip_path(self, b=None):
        b = self.b if b is None else b
        if self.shape == 'rect':
            return f'M{fmt(-b)} {fmt(-b)}H{fmt(self.w + b)}V{fmt(self.h + b)}H{fmt(-b)}Z'
        if self.shape == 'disc':
            r = self.w / 2 + b
            c = self.w / 2
            return f'M{fmt(c - r)} {fmt(c)}A{fmt(r)} {fmt(r)} 0 1 0 {fmt(c + r)} {fmt(c)}A{fmt(r)} {fmt(r)} 0 1 0 {fmt(c - r)} {fmt(c)}Z'
        return poly(offset_poly(self.pts, b) if b else self.pts)

    def inner(self):
        cid = uid('clip')
        return (f'<defs>{"".join(self.defs)}<clipPath id="{cid}"><path d="{self.clip_path()}"/></clipPath></defs>'
                f'<g clip-path="url(#{cid})">{"".join(self.body)}</g>')

    def svg(self, title=None):
        return (f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
                f'width="{fmt(self.w)}mm" height="{fmt(self.h)}mm" viewBox="0 0 {fmt(self.w)} {fmt(self.h)}">'
                + (f'<title>{title}</title>' if title else '') + self.inner() + '</svg>')

    def nested(self, x, y, rot=0, cx=0, cy=0):
        """Embed (with bleed) at x,y in a parent sheet; optional rotation about (cx,cy) in face coords."""
        b = self.b
        tr = f' transform="translate({fmt(x)} {fmt(y)})' + (f' rotate({fmt(rot)} {fmt(cx)} {fmt(cy)})' if rot else '') + '"'
        return f'<g{tr}>{self.inner()}</g>'


# ═══════════════════════════ shared component kit ═══════════════════════
def full(f, fill):
    b = f.b + 1
    return f'<rect x="{fmt(-b)}" y="{fmt(-b)}" width="{fmt(f.w + 2 * b)}" height="{fmt(f.h + 2 * b)}" fill="{fill}"/>'


def band(f, y, h, fill):
    b = f.b + 1
    return f'<rect x="{fmt(-b)}" y="{fmt(y)}" width="{fmt(f.w + 2 * b)}" height="{fmt(h)}" fill="{fill}"/>'


# ---------- Bazaar kit ----------
def bz_ground(f, tile=32, variant='saffron', ox=0, oy=0):
    pid = uid('bzp')
    f.d(bz_pattern(pid, tile, ox, oy, variant))
    return full(f, f'url(#{pid})')


def bz_shadowed(path_d, fill, sw=1.0, sh=1.3, ink=BZ['ink']):
    return (f'<path d="{path_d}" fill="{ink}" transform="translate({fmt(sh)} {fmt(sh)})"/>'
            f'<path d="{path_d}" fill="{fill}" stroke="{ink}" stroke-width="{fmt(sw)}" stroke-linejoin="round"/>')


def rrect(x, y, w, h, r):
    r = min(r, w / 2, h / 2)
    return (f'M{fmt(x + r)} {fmt(y)}H{fmt(x + w - r)}A{fmt(r)} {fmt(r)} 0 0 1 {fmt(x + w)} {fmt(y + r)}V{fmt(y + h - r)}'
            f'A{fmt(r)} {fmt(r)} 0 0 1 {fmt(x + w - r)} {fmt(y + h)}H{fmt(x + r)}A{fmt(r)} {fmt(r)} 0 0 1 {fmt(x)} {fmt(y + h - r)}'
            f'V{fmt(y + r)}A{fmt(r)} {fmt(r)} 0 0 1 {fmt(x + r)} {fmt(y)}Z')


def bz_pill(cx, cy, s, size, fill=BZ['rani'], tfill=BZ['cream'], key='bowlby', padx=None, sh=1.1, sw=.8, maxw=None, tracking=.02):
    tw = text_width(s, key, size, tracking)
    if maxw and tw + 2 * (padx or size * .9) > maxw:
        size *= (maxw - 2 * (padx or size * .9)) / tw
        tw = text_width(s, key, size, tracking)
    px = padx if padx is not None else size * .9
    w, h = tw + 2 * px, size * 1.75
    out = bz_shadowed(rrect(cx - w / 2, cy - h / 2, w, h, h / 2), fill, sw, sh)
    out += text(s, key, size, cx, cy + size * .36, 'middle', tfill, tracking)
    return out, w


def bz_rim(f, y, h, top=True, scallop_r=2.4, fill=BZ['ink'], sc_fill=BZ['rani'], dots=BZ['marigold']):
    """Ink strip with marigold dots and a rani scallop fringe (hanging away from the edge)."""
    b = f.b + 1
    out = ''
    if top:
        out += scallops(-b, y + h, f.w + 2 * b, scallop_r, sc_fill, True, BZ['ink'], .5)
        out += band(f, y - b, h + b, fill)
        out += dot_row(0, y + h / 2, f.w, h * .16, h * .62, dots)
    else:
        out += scallops(-b, y, f.w + 2 * b, scallop_r, sc_fill, False, BZ['ink'], .5)
        out += band(f, y, h + b, fill)
        out += dot_row(0, y + h / 2, f.w, h * .16, h * .62, dots)
    return out


def bz_label(x, y, w, h, fill=BZ['cream'], sh=1.4, sw=1.0):
    return bz_shadowed(arch_path(x, y, w, h, w * .55), fill, sw, sh)


def bz_spice_row(cx, cy, w, mark=None, dot=None, label=True, lsize=None, on_dark=False):
    cols = [BZ['cilantro'], BZ['marigold'], BZ['saffron'], BZ['chili'], BZ['ink']]
    n = 5
    gap = w / n
    dot = dot or gap * .62
    lsize = lsize or min(gap * .2, dot * .3)
    out = ''
    for i in range(n):
        x = cx - w / 2 + gap * (i + .5)
        ring = BZ['cream'] if i == 4 else BZ['ink']
        out += f'<circle cx="{fmt(x + dot * .09)}" cy="{fmt(cy + dot * .09)}" r="{fmt(dot / 2)}" fill="{BZ["ink"]}"/>'
        out += f'<circle cx="{fmt(x)}" cy="{fmt(cy)}" r="{fmt(dot / 2)}" fill="{cols[i]}" stroke="{BZ["ink"]}" stroke-width="{fmt(dot * .07)}"/>'
        out += chili(x, cy, dot * .62, BZ['cream'], BZ['cream'], rot=-35)
        if label:
            words = SPICE[i].split(' ')
            tc = BZ['cream'] if on_dark else BZ['ink']
            for j, wd in enumerate(words):
                out += text(wd, 'dm700', lsize, x, cy + dot / 2 + lsize * (1.35 + 1.05 * j), 'middle', tc, .04, maxw=gap * .96)
        if mark == i:
            r = dot * .78
            out += (f'<path d="M{fmt(x - r)} {fmt(cy + r * .1)}C{fmt(x - r)} {fmt(cy - r * 1.05)} {fmt(x + r * 1.1)} {fmt(cy - r * 1.0)} {fmt(x + r * 1.02)} {fmt(cy + r * .1)}'
                    f'C{fmt(x + r * .95)} {fmt(cy + r * 1.1)} {fmt(x - r * .9)} {fmt(cy + r * 1.08)} {fmt(x - r * 1.05)} {fmt(cy - r * .2)}C{fmt(x - r * 1.06)} {fmt(cy - r * .5)} {fmt(x - r * .7)} {fmt(cy - r * .8)} {fmt(x - r * .4)} {fmt(cy - r * .95)}" '
                    f'fill="none" stroke="#1B1F6B" stroke-width="{fmt(dot * .13)}" stroke-linecap="round" opacity=".92"/>')
    return out


def bz_seal(cx, cy, d, rot=0):
    return f'<g transform="rotate({rot} {fmt(cx)} {fmt(cy)})">' + brand('logo/bazaar/stamp-district-seal.svg', cx - d / 2, cy - d / 2, d, d) + '</g>'


def bz_steam_vent(cx, cy, w=10, h=26, flip=False):
    out = f'<path d="{rrect(cx - w / 2, cy - 1.2, w, 2.4, 1.2)}" fill="{BZ["ink"]}"/>'
    out += f'<path d="{rrect(cx - w / 2 + .6, cy - .5, w - 1.2, 1.0, .5)}" fill="#0D0826"/>'
    out += steam(cx - w * .18, cy - 2.4, h, 3.2, BZ['cream'], 1.5, BZ['ink'], .55, flip)
    out += steam(cx + w * .25, cy - 3.2, h * .72, 2.4, BZ['cream'], 1.2, BZ['ink'], .5, not flip)
    return out


# ---------- Royal kit ----------
def ry_foil(f):
    fid = uid('foil')
    f.d(FOIL_DEF.format(id=fid))
    return f'url(#{fid})'


def ry_jali(f, y=None, h=None, tile=26, ox=0, oy=0, which='01-jali-lattice'):
    pid = uid('ryp')
    f.d(ry_pattern(pid, tile, ox, oy, which=which))
    if y is None:
        return full(f, f'url(#{pid})')
    return band(f, y, h, f'url(#{pid})')


def ry_rule(x1, x2, y, stroke, sw=.35, double=True, gap=1.0):
    out = f'<line x1="{fmt(x1)}" y1="{fmt(y)}" x2="{fmt(x2)}" y2="{fmt(y)}" stroke="{stroke}" stroke-width="{fmt(sw)}"/>'
    if double:
        out += f'<line x1="{fmt(x1)}" y1="{fmt(y + gap)}" x2="{fmt(x2)}" y2="{fmt(y + gap)}" stroke="{stroke}" stroke-width="{fmt(sw * .6)}"/>'
    return out


def ry_diamond(cx, cy, s, fill):
    return f'<path d="M{fmt(cx)} {fmt(cy - s)}L{fmt(cx + s * .7)} {fmt(cy)}L{fmt(cx)} {fmt(cy + s)}L{fmt(cx - s * .7)} {fmt(cy)}Z" fill="{fill}"/>'


def ry_arch(x, y, w, h, stroke, sw=.4, fill='none', double=True, gap=1.3):
    out = f'<path d="{arch_path(x, y, w, h, w * .6)}" fill="{fill}" stroke="{stroke}" stroke-width="{fmt(sw)}"/>'
    if double:
        g = gap
        out += f'<path d="{arch_path(x + g, y + g * 1.8, w - 2 * g, h - g * 1.8, (w - 2 * g) * .6)}" fill="none" stroke="{stroke}" stroke-width="{fmt(sw * .6)}"/>'
    out += ry_diamond(x + w / 2, y - 2.2, 1.3, stroke)
    return out


def ry_spice_row(cx, cy, w, foil, mark=None, dot=None, lsize=None, on=RY['ink']):
    n = 5
    gap = w / n
    dot = dot or gap * .62
    lsize = lsize or min(gap * .17, dot * .26)
    out = ''
    for i in range(n):
        x = cx - w / 2 + gap * (i + .5)
        out += f'<circle cx="{fmt(x)}" cy="{fmt(cy)}" r="{fmt(dot / 2)}" fill="none" stroke="{foil}" stroke-width="{fmt(dot * .045)}"/>'
        out += f'<circle cx="{fmt(x)}" cy="{fmt(cy)}" r="{fmt(dot / 2 - dot * .1)}" fill="none" stroke="{foil}" stroke-width="{fmt(dot * .02)}"/>'
        out += chili(x, cy - dot * .06, dot * .5, foil, foil, rot=-35)
        # heat pips
        for k in range(i + 1):
            px = x + (k - i / 2) * dot * .13
            out += ry_diamond(px, cy + dot * .28, dot * .045, foil)
        words = SPICE[i].split(' ')
        for j, wd in enumerate(words):
            out += text(wd, 'hk700', lsize, x, cy + dot / 2 + lsize * (1.5 + 1.1 * j), 'middle', foil, .12, maxw=gap * .95)
        if mark == i:
            r = dot * .2
            out += (f'<circle cx="{fmt(x + dot * .34)}" cy="{fmt(cy - dot * .34)}" r="{fmt(r * 1.08)}" fill="#000" opacity=".25"/>'
                    f'<circle cx="{fmt(x + dot * .32)}" cy="{fmt(cy - dot * .36)}" r="{fmt(r)}" fill="{RY["ruby"]}"/>'
                    f'<circle cx="{fmt(x + dot * .29)}" cy="{fmt(cy - dot * .40)}" r="{fmt(r * .35)}" fill="#fff" opacity=".35"/>')
    return out


def ry_seal(cx, cy, d, rot=0, colour='emerald'):
    return f'<g transform="rotate({rot} {fmt(cx)} {fmt(cy)})">' + brand(f'logo/royal/colourways/seal--{colour}.svg', cx - d / 2, cy - d / 2, d, d) + '</g>'


def ry_steam_vent(cx, cy, foil, w=10, h=24, flip=False):
    out = f'<path d="{rrect(cx - w / 2, cy - 1.1, w, 2.2, 1.1)}" fill="#07030D" stroke="{foil}" stroke-width=".3"/>'
    out += steam(cx - w * .15, cy - 2.2, h, 2.8, foil, .45, None, 0, flip)
    out += steam(cx + w * .22, cy - 2.8, h * .7, 2.2, foil, .35, None, 0, not flip)
    return out


# ═══════════════════════════ PAIL ════════════════════════════════════
def pail_front_pts(top, bot, h):
    i = (top - bot) / 2
    return [(0, 0), (top, 0), (top - i, h), (i, h)]


def pail_face(dr, face, mode='art', bleed=1):
    top = P['top_w'] if face in ('front', 'back') else P['top_d']
    h = P['slant_f'] if face in ('front', 'back') else P['slant_s']
    pts = pail_front_pts(top, P['base'], h)
    f = Face(f'pail-{dr}-{face}', top, h, 'poly', pts, bleed)
    cx = top / 2
    if dr == 'bazaar':
        f.add(bz_ground(f, 30, ox=cx - 15))
        f.add(bz_rim(f, 0, 9, True))
        f.add(bz_rim(f, h - 7, 7, False, 2.0))
        if face == 'front':
            lw, ly, lh = 62, 17, 74
            f.add(bz_label(cx - lw / 2, ly, lw, lh))
            ww = 50; wh = ww / brand_aspect('logo/bazaar/wordmark-stacked.svg')
            f.add(brand('logo/bazaar/wordmark-stacked.svg', cx - ww / 2, ly + 13, ww, wh))
            pill, _ = bz_pill(cx, 96.5, 'INDO-CHINESE ALLEY', 3.6, BZ['rani'], BZ['cream'], maxw=66)
            f.add(pill)
        elif face == 'back':
            tw, ty, th = 64, 18, 72
            f.add(bz_shadowed(rrect(cx - tw / 2, ty, tw, th, 4), BZ['cream'], 1.0, 1.4))
            f.add(text('WELCOME', 'bowlby', 7.4, cx, ty + 13.5, 'middle', BZ['ink']))
            f.add(text('TO THE', 'bowlby', 4.2, cx, ty + 19.5, 'middle', BZ['rani']))
            f.add(text('DISTRICT.', 'bowlby', 7.4, cx, ty + 27.5, 'middle', BZ['ink']))
            f.add(text('wok-tossed swagger, to go', 'caveat', 5.4, cx, ty + 37.5, 'middle', BZ['saffron'], maxw=56))
            f.add(steam(cx + 26, ty + 36, 7, 1.4, BZ['saffron'], .7))
            f.add(f'<line x1="{fmt(cx - 24)}" y1="{fmt(ty + 43)}" x2="{fmt(cx + 24)}" y2="{fmt(ty + 43)}" stroke="{BZ["ink"]}" stroke-width=".5" stroke-dasharray="1.2 1"/>')
            f.add(text('INDO-CHINESE ALLEY', 'dm700', 2.6, cx, ty + 49, 'middle', BZ['ink'], .08))
            f.add(text('11851 FM 423, SUITE 200', 'dm500', 2.4, cx, ty + 54.5, 'middle', BZ['ink'], .03))
            f.add(text('LITTLE ELM, TX 75068', 'dm500', 2.4, cx, ty + 58.5, 'middle', BZ['ink'], .03))
            f.add(brand('logo/bazaar/emblem-small.svg', cx - 4.5, ty + 61.5, 9, 9 / brand_aspect('logo/bazaar/emblem-small.svg') * 1))
            pill, _ = bz_pill(cx, 96.5, 'HANDLE WITH APPETITE', 3.2, BZ['peacock'], BZ['cream'], maxw=64)
            f.add(pill)
        else:  # side
            rw = 19
            f.add(bz_shadowed(rrect(cx - rw / 2, 20, rw, 76, rw / 2), BZ['cream'], 1.0, 1.3))
            s = text('CURRY DISTRICT', 'bowlby', 6.4, 0, 0, 'middle', BZ['ink'], .02)
            f.add(f'<g transform="translate({fmt(cx + 2.3)} {fmt(58)}) rotate(-90)">{s}</g>')
            f.add(f'<circle cx="{fmt(cx)}" cy="12.5" r="1.7" fill="{BZ["ink"]}" opacity=".0"/>')
    else:
        foil = ry_foil(f)
        f.add(full(f, RY['ink']))
        f.add(ry_jali(f, -2, 22, 22, ox=cx - 11, oy=-2))
        f.add(ry_jali(f, h - 18, 20, 22, ox=cx - 11, oy=h - 18))
        f.add(ry_rule(-2, top + 2, 20.5, foil))
        f.add(ry_rule(-2, top + 2, h - 19.5, foil))
        if face == 'front':
            aw, ay, ah = 56, 29, 60
            f.add(band(f, 21.6, h - 42.2, RY['ink']))
            f.add(ry_arch(cx - aw / 2, ay, aw, ah, foil, .4))
            ww = 34
            f.add(brand('logo/royal/wordmark-stacked.svg', cx - ww / 2, ay + 10, ww, ww / brand_aspect('logo/royal/wordmark-stacked.svg')))
            f.add(text('Indo-Chinese Alley', 'fri400', 4.0, cx, ay + ah - 4.5, 'middle', foil))
        elif face == 'back':
            f.add(band(f, 21.6, h - 42.2, RY['ink']))
            f.add(text('Fire, wok', 'fri400', 7.2, cx, 42, 'middle', foil))
            f.add(text('and a little', 'fri400', 7.2, cx, 51, 'middle', foil))
            f.add(text('theatre.', 'fri400', 7.2, cx, 60, 'middle', foil))
            f.add(ry_diamond(cx, 67, 1.2, foil))
            f.add(text('CURRY DISTRICT · INDO-CHINESE ALLEY', 'hk600', 2.1, cx, 74, 'middle', foil, .14, maxw=70))
            f.add(text('11851 FM 423, SUITE 200', 'hk500', 2.1, cx, 79, 'middle', foil, .1))
            f.add(text('LITTLE ELM, TX 75068', 'hk500', 2.1, cx, 83, 'middle', foil, .1))
        else:
            f.add(band(f, 21.6, h - 42.2, RY['ink']))
            f.add(f'<line x1="{fmt(cx)}" y1="26" x2="{fmt(cx)}" y2="{fmt(h - 26)}" stroke="{foil}" stroke-width=".35"/>')
            ew = 20
            f.add(f'<rect x="{fmt(cx - ew / 2 - 2)}" y="44" width="{fmt(ew + 4)}" height="30" fill="{RY["ink"]}"/>')
            f.add(brand('logo/royal/emblem.svg', cx - ew / 2, 45, ew, ew / brand_aspect('logo/royal/emblem.svg')))
    return f


def pail_flap(dr, face='front', mode='art', bleed=1):
    """Front/back closing flap (hinge at bottom of art, ridge at top). Width 102 → 94 at ridge."""
    w, h = P['top_w'], P['flap']
    ins = 4
    pts = [(ins, 0), (w - ins, 0), (w, h), (0, h)]
    f = Face(f'pail-{dr}-flap{face}', w, h, 'poly', pts, bleed)
    cx = w / 2
    seal = mode in ('art', 'mock')
    mark = 2 if mode == 'mock' else None
    if dr == 'bazaar':
        f.add(bz_ground(f, 30, 'rani', ox=cx - 15))
        f.add(f'<rect x="-2" y="{fmt(h - 3.2)}" width="{fmt(w + 4)}" height="4" fill="{BZ["ink"]}"/>')
        if face == 'front':
            f.add(f'<path d="{rrect(cx - 44, 24, 88, 24.5, 4)}" fill="{BZ["cream"]}" stroke="{BZ["ink"]}" stroke-width=".8"/>')
            f.add(text('SPICE CHECK', 'dm700', 2.0, cx, 28.3, 'middle', BZ['rani'], .2))
            f.add(bz_spice_row(cx, 35.5, 82, mark, 7.0, lsize=1.85))
            if seal:
                f.add(bz_seal(cx, 6, 34, -8))
        elif seal:
            f.add(bz_seal(cx, -11, 34, 172))
    else:
        foil = ry_foil(f)
        f.add(full(f, RY['ink']))
        f.add(ry_jali(f, None, None, 22, ox=cx - 11))
        f.add(ry_rule(-2, w + 2, h - 2.5, foil))
        if face == 'front':
            f.add(f'<path d="{rrect(cx - 43, 21, 86, 27, 2)}" fill="{RY["ink"]}" stroke="{foil}" stroke-width=".35"/>')
            f.add(text('SPICE LEVEL', 'hk700', 1.8, cx, 25.2, 'middle', foil, .3))
            f.add(ry_spice_row(cx, 33, 80, foil, mark, 8.2, 1.6))
            if seal:
                f.add(ry_seal(cx, 4, 30, 0))
        elif seal:
            f.add(ry_seal(cx, -11, 30, 180))
    return f


def pail_gable(dr, mode='art', bleed=1):
    w = P['top_d']; h = P['gable']
    pts = [(w / 2 + 2.5, 0), (w, h), (0, h)]  # apex at top (slightly off-centre is irrelevant), base at bottom
    pts = [(w / 2, 0), (w, h), (0, h)]
    f = Face(f'pail-{dr}-gable', w, h, 'poly', pts, bleed)
    if dr == 'bazaar':
        f.add(bz_ground(f, 30, 'rani'))
        f.add(f'<rect x="-2" y="{fmt(h - 3.2)}" width="{fmt(w + 4)}" height="4" fill="{BZ["ink"]}"/>')
    else:
        foil = ry_foil(f)
        f.add(full(f, RY['ink'])); f.add(ry_jali(f, None, None, 22))
        f.add(ry_rule(-2, w + 2, h - 2.5, foil))
    return f


# ═══════════════════════════ CLAMSHELL ═══════════════════════════════
def clam_band(dr, panel, mode='art', bleed=1):
    """Belly-band panels (band width = art width 90). panel: top|front|back|bottom.
    Orientation: top panel → art-bottom = box front edge. front/back → art-top = lid edge."""
    bw = C['band']
    hh = {'top': C['lidD'], 'front': C['band_front'], 'back': C['band_front'], 'bottom': C['Db']}[panel]
    f = Face(f'clam-{dr}-band{panel}', bw, hh, 'rect', None, bleed)
    cx = bw / 2
    seal = mode in ('art', 'mock')
    if dr == 'bazaar':
        f.add(bz_ground(f, 30, ox=cx - 15))
        # selvedge stripes both long edges
        for x in (0, bw - 6.5):
            f.add(f'<rect x="{fmt(x - (bleed + 1 if x == 0 else 0))}" y="{fmt(-bleed - 1)}" width="{fmt(6.5 + bleed + 1)}" height="{fmt(hh + 2 * bleed + 2)}" fill="{BZ["ink"]}"/>')
        for x in (3.25, bw - 3.25):
            f.add(''.join(f'<circle cx="{fmt(x)}" cy="{fmt(yy)}" r=".9" fill="{BZ["marigold"]}"/>' for yy in [i * 4.0 + 2 for i in range(int(hh / 4) + 1)]))
        if panel == 'top':
            lw, lh = 64, 98
            ly = (hh - lh) / 2 + 4
            f.add(bz_label(cx - lw / 2, ly, lw, lh))
            ww = 52; wh = ww / brand_aspect('logo/bazaar/wordmark-stacked.svg')
            f.add(brand('logo/bazaar/wordmark-stacked.svg', cx - ww / 2, ly + lh - wh - 7, ww, wh))
            pill, _ = bz_pill(cx, ly - 9, 'TANDOOR QUARTER', 4.0, BZ['rani'], BZ['cream'], maxw=74)
            f.add(pill)
        elif panel == 'front':
            f.add(text('TEAR.', 'bowlby', 11, cx + .7, 22.7, 'middle', BZ['ink']))
            f.add(text('TEAR.', 'bowlby', 11, cx, 22, 'middle', BZ['cream']))
            f.add(text('DIP.', 'bowlby', 11, cx + .7, 36.7, 'middle', BZ['ink']))
            f.add(text('DIP.', 'bowlby', 11, cx, 36, 'middle', BZ['cream']))
            f.add(text('REPEAT.', 'bowlby', 11, cx + .7, 50.7, 'middle', BZ['ink']))
            f.add(text('REPEAT.', 'bowlby', 11, cx, 50, 'middle', BZ['cream']))
            f.add(text('(naan, mostly)', 'caveat', 6.0, cx - 12, 62, 'middle', BZ['ink']))
            if seal:
                f.add(bz_seal(cx + 27, 66, 26, 12))
        elif panel == 'back':
            tw, th = 70, 60
            ty = (hh - th) / 2
            f.add(bz_shadowed(rrect(cx - tw / 2, ty, tw, th, 3.5), BZ['cream'], .9, 1.2))
            f.add(text('PACKED WITH LOVE &', 'dm700', 2.5, cx, ty + 7.5, 'middle', BZ['rani'], .12))
            items = ['NAAN', 'RICE', 'RAITA', 'NAPKINS']
            for i, it in enumerate(items):
                x = cx - 30 + (i % 2) * 32
                y = ty + 15 + (i // 2) * 9
                f.add(f'<rect x="{fmt(x)}" y="{fmt(y - 4.2)}" width="5" height="5" rx=".8" fill="none" stroke="{BZ["ink"]}" stroke-width=".6"/>')
                f.add(text(it, 'bowlby', 4.0, x + 7.5, y, 'start', BZ['ink']))
            if mode == 'mock':
                for i in (0, 1):
                    x = cx - 30 + (i % 2) * 32; y = ty + 15
                    f.add(f'<path d="M{fmt(x + .8)} {fmt(y - 1.8)}L{fmt(x + 2.3)} {fmt(y)}L{fmt(x + 5.6)} {fmt(y - 5.4)}" fill="none" stroke="#1B1F6B" stroke-width=".8" stroke-linecap="round"/>')
            f.add(text('Packed by: ______', 'caveat', 4.6, cx, ty + 39, 'middle', BZ['ink']))
            f.add(f'<line x1="{fmt(cx - 28)}" y1="{fmt(ty + 44)}" x2="{fmt(cx + 28)}" y2="{fmt(ty + 44)}" stroke="{BZ["ink"]}" stroke-width=".4" stroke-dasharray="1 .8"/>')
            f.add(text('CURRY DISTRICT', 'bowlby', 3.4, cx, ty + 50.5, 'middle', BZ['ink']))
            f.add(text(ADDRESS, 'dm500', 1.9, cx, ty + 55, 'middle', BZ['ink'], .02, maxw=64))
        else:  # bottom
            f.add(f'<path d="{rrect(cx - 30, hh / 2 - 22, 60, 44, 3)}" fill="{BZ["cream"]}" stroke="{BZ["ink"]}" stroke-width=".8"/>')
            f.add(text('YOU FOUND', 'bowlby', 5, cx, hh / 2 - 8, 'middle', BZ['ink']))
            f.add(text('THE BOTTOM.', 'bowlby', 5, cx, hh / 2 - 1, 'middle', BZ['ink']))
            f.add(text('the best part is upstairs', 'caveat', 4.6, cx, hh / 2 + 8, 'middle', BZ['rani'], maxw=52))
            f.add(text(ADDRESS, 'dm500', 1.8, cx, hh / 2 + 15, 'middle', BZ['ink'], .02, maxw=54))
    else:
        foil = ry_foil(f)
        f.add(full(f, RY['emerald']))
        pid = uid('ryp'); f.d(ry_pattern(pid, 18, -2, 0))
        for x0 in (-bleed - 1, bw - 9):
            f.add(f'<rect x="{fmt(x0)}" y="{fmt(-bleed - 1)}" width="{fmt(10 + bleed + 1)}" height="{fmt(hh + 2 * bleed + 2)}" fill="url(#{pid})"/>')
        for x in (9.3, bw - 9.3):
            f.add(f'<line x1="{fmt(x)}" y1="{fmt(-bleed - 1)}" x2="{fmt(x)}" y2="{fmt(hh + bleed + 1)}" stroke="{foil}" stroke-width=".45"/>')
            f.add(f'<line x1="{fmt(x + (1.1 if x < cx else -1.1))}" y1="{fmt(-bleed - 1)}" x2="{fmt(x + (1.1 if x < cx else -1.1))}" y2="{fmt(hh + bleed + 1)}" stroke="{foil}" stroke-width=".25"/>')
        if panel == 'top':
            aw, ah = 58, 104
            ay = (hh - ah) / 2 + 4
            f.add(f'<path d="{arch_path(cx - aw / 2, ay, aw, ah, aw * .6)}" fill="{RY["emerald"]}"/>')
            f.add(ry_arch(cx - aw / 2, ay, aw, ah, foil, .4))
            ww = 40
            f.add(brand('logo/royal/wordmark-stacked.svg', cx - ww / 2, ay + 20, ww, ww / brand_aspect('logo/royal/wordmark-stacked.svg')))
            f.add(text('Tandoor Quarter', 'fri400', 4.6, cx, ay + ah - 9, 'middle', foil))
        elif panel == 'front':
            f.add(f'<rect x="10" y="10" width="{fmt(bw - 20)}" height="{fmt(hh - 20)}" fill="{RY["emerald"]}"/>')
            f.add(text('Tandoor', 'fri400', 10, cx, 31, 'middle', foil))
            f.add(text('Quarter', 'fri400', 10, cx, 43, 'middle', foil))
            f.add(ry_diamond(cx, 49.5, 1.2, foil))
            f.add(text('CURRY DISTRICT', 'hk700', 2.4, cx, 56, 'middle', foil, .3))
            if seal:
                f.add(ry_seal(cx + 30, 64, 24, 8))
        elif panel == 'back':
            f.add(f'<rect x="10" y="8" width="{fmt(bw - 20)}" height="{fmt(hh - 16)}" fill="{RY["emerald"]}"/>')
            f.add(text('Made for', 'fri400', 7.2, cx, 21, 'middle', foil))
            f.add(text('sharing.', 'fri400', 7.2, cx, 29.5, 'middle', foil))
            items = ['NAAN', 'RICE', 'RAITA', 'NAPKINS']
            for i, it in enumerate(items):
                x = cx - 27 + (i % 2) * 30
                y = 40 + (i // 2) * 7.5
                f.add(f'<rect x="{fmt(x)}" y="{fmt(y - 3.4)}" width="4" height="4" fill="none" stroke="{foil}" stroke-width=".35"/>')
                f.add(text(it, 'hk700', 2.6, x + 6, y, 'start', foil, .2))
            if mode == 'mock':
                for i in (0, 1):
                    x = cx - 27 + i * 30; y = 40
                    f.add(f'<path d="M{fmt(x + .6)} {fmt(y - 1.5)}L{fmt(x + 1.8)} {fmt(y)}L{fmt(x + 4.6)} {fmt(y - 4.6)}" fill="none" stroke="{RY["ivory"]}" stroke-width=".6" stroke-linecap="round"/>')
            f.add(text(ADDRESS, 'hk500', 1.8, cx, 63, 'middle', foil, .08, maxw=66))
        else:
            f.add(f'<rect x="12" y="{fmt(hh / 2 - 16)}" width="{fmt(bw - 24)}" height="32" fill="{RY["emerald"]}"/>')
            f.add(text('With our compliments,', 'fri400', 4.4, cx, hh / 2 - 4, 'middle', foil))
            f.add(text('to the very last bite.', 'fri400', 4.4, cx, hh / 2 + 2.5, 'middle', foil))
            f.add(text(ADDRESS, 'hk500', 1.7, cx, hh / 2 + 10, 'middle', foil, .06, maxw=60))
    return f


def clam_box_face(dr, face, mode='art', bleed=1):
    """Unprinted board faces + small stamp. face: lidtop|front|back|side|inside_lid|inside_base."""
    sub = BZ['kraft'] if dr == 'bazaar' else RY['board']
    dims = {'lidtop': (C['lidL'], C['lidD']), 'front': (C['L'], C['H']), 'back': (C['L'], C['H']),
            'side': (C['lidD'], C['H']), 'inside_lid': (C['lidL'], C['lidD']), 'inside_base': (C['Lb'], C['Db'])}
    w, h = dims[face]
    f = Face(f'clam-{dr}-{face}', w, h, 'rect', None, bleed)
    if face in ('inside_lid', 'inside_base'):
        f.add(full(f, '#F3E9D8' if dr == 'bazaar' else '#EDE3D2'))
    else:
        f.add(full(f, sub))
    cx, cy = w / 2, h / 2
    if face == 'side':
        if dr == 'bazaar':
            f.add(f'<g opacity=".82">{text("CURRY DISTRICT", "bowlby", 5.2, cx, cy, "middle", BZ["ink"])}'
                  f'{text("TANDOOR QUARTER · LITTLE ELM, TX", "dm700", 2.2, cx, cy + 5.2, "middle", BZ["ink"], .1)}</g>')
            f.add(f'<rect x="{fmt(cx - 34)}" y="{fmt(cy - 9)}" width="68" height="17.5" rx="2" fill="none" stroke="{BZ["ink"]}" stroke-width=".7" opacity=".82"/>')
        else:
            foil = ry_foil(f)
            ew = 14
            f.add(brand('logo/royal/emblem.svg', cx - ew / 2, cy - 10, ew, ew / brand_aspect('logo/royal/emblem.svg')))
    if face == 'inside_lid':
        # food-side print: only with converter-certified coating; shown for concept
        if dr == 'bazaar':
            f.add(bz_ground(f, 30, 'cream'))
            f.add(f'<rect x="10" y="10" width="{fmt(w - 20)}" height="{fmt(h - 20)}" rx="6" fill="{BZ["cream"]}" stroke="{BZ["ink"]}" stroke-width="1"/>')
            f.add(text('YOU EARNED', 'bowlby', 17, cx, cy - 7, 'middle', BZ['ink']))
            f.add(text('THIS NAAN.', 'bowlby', 17, cx + 1, cy + 14, 'middle', BZ['saffron'], stroke=BZ['ink'], sw=1.3))
            f.add(text('(and the next one. we checked.)', 'caveat', 8.5, cx, cy + 31, 'middle', BZ['rani']))
            f.add(steam(cx + 70, cy - 22, 18, 3, BZ['saffron'], 1.4))
            f.add(steam(cx - 72, cy - 22, 16, 3, BZ['saffron'], 1.4, flip=True))
        else:
            foil = '#B7791F'
            f.add(f'<rect x="9" y="9" width="{fmt(w - 18)}" height="{fmt(h - 18)}" fill="none" stroke="{foil}" stroke-width=".5"/>')
            f.add(f'<rect x="11" y="11" width="{fmt(w - 22)}" height="{fmt(h - 22)}" fill="none" stroke="{foil}" stroke-width=".3"/>')
            f.add(ry_arch(cx - 15, 24, 30, 36, foil, .45))
            f.add(brand('logo/royal/colourways/emblem--mono-ink.svg', cx - 9, 31, 18, 18 / brand_aspect('logo/royal/emblem.svg')))
            f.add(text('Slow-simmered.', 'fri400', 14, cx, cy + 22, 'middle', RY['ink']))
            f.add(text('Tandoor-fired.', 'fri400', 14, cx, cy + 40, 'middle', RY['ruby']))
            f.add(ry_diamond(cx, cy + 49, 1.4, foil))
    if face == 'lidtop' and dr == 'bazaar':
        pass
    return f


# ═══════════════════════════ TUB ═════════════════════════════════════
def tub_sleeve(dr, mode='art', bleed=1, w=None, h=None):
    """Rectangle form of the sleeve (u around, art-centre = front). For the arc dieline use tub_sleeve_elems."""
    w = w or T['sleeve_rect_w']; h = h or T['sleeve_slant']
    f = Face(f'tub-{dr}-side', w, h, 'rect', None, bleed)
    for e in tub_sleeve_elems(dr, w, h, mode, f):
        f.add(e)
    return f


def tub_sleeve_elems(dr, w, h, mode, f, place=None):
    """Elements expressed as callables of a placer. place(x,y,svg,rotate_ok) — default identity (rect)."""
    out = []
    cx = w / 2
    if place is None:
        def place(x, y, s):
            return f'<g transform="translate({fmt(x)} {fmt(y)})">{s}</g>'
    if dr == 'bazaar':
        out.append(bz_ground(f, 30, ox=cx - 15))
        out.append(bz_rim(f, 0, 7, True, 2.1))
        out.append(bz_rim(f, h - 6, 6, False, 1.9))
        # front medallion
        out.append(place(cx, h / 2 + .5, bz_shadowed(f'M-17 0A17 17 0 1 0 17 0A17 17 0 1 0 -17 0Z', BZ['cream'], .9, 1.1)
                         + brand('logo/bazaar/wordmark-stacked.svg', -12.5, -14.5, 25, 28)))
        for k, x in enumerate((cx - 52, cx + 52, cx - 52 - w / 2, cx + 52 + w / 2 - w)):
            pass
        for x in (cx - 50, cx + 50):
            pill, _ = bz_pill(0, 0, 'CURRY QUARTER', 4.2, BZ['rani'], BZ['cream'], maxw=60)
            out.append(place(x, h / 2, pill))
        out.append(place(cx - w / 2 + 2 if False else 0, 0, ''))
        bx = (cx + w / 2) % w  # back centre
        bx = cx + w / 2 if cx + w / 2 < w else cx - w / 2
        tag = (bz_shadowed(rrect(-40, -13, 80, 26, 4), BZ['cream'], .8, 1.0)
               + text('MOP IT UP', 'bowlby', 6.4, 0, -2.2, 'middle', BZ['ink'])
               + text('with naan. Obviously.', 'caveat', 5.4, 0, 7.4, 'middle', BZ['rani']))
        out.append(place(w * .0 + 0.001, h / 2, tag))  # sits on the seam side (back) — split across both ends
        out.append(place(w, h / 2, tag))
    else:
        foil = ry_foil(f)
        out.append(full(f, RY['emerald']))
        out.append(ry_jali(f, -2, 13, 20, ox=cx - 10, oy=-2))
        out.append(ry_jali(f, h - 11, 13, 20, ox=cx - 10, oy=h - 11))
        out.append(f'<rect x="{fmt(-f.b - 1)}" y="11.5" width="{fmt(w + 2 * f.b + 2)}" height="{fmt(h - 22.5)}" fill="{RY["emerald"]}"/>')
        out.append(ry_rule(-f.b - 1, w + f.b + 1, 10.6, foil, .4, True, .9))
        out.append(ry_rule(-f.b - 1, w + f.b + 1, h - 11.5, foil, .4, True, .9))
        med = (f'<circle r="16" fill="{RY["ink"]}" stroke="{foil}" stroke-width=".45"/><circle r="14.4" fill="none" stroke="{foil}" stroke-width=".25"/>'
               + brand('logo/royal/emblem.svg', -8, -12.3, 16, 16 / brand_aspect('logo/royal/emblem.svg')))
        out.append(place(cx, h / 2, med))
        for x in (cx - 50, cx + 50):
            out.append(place(x, h / 2, text('Curry Quarter', 'fri400', 6.2, 0, 2.1, 'middle', foil)))
        tag = (text('Best shared.', 'fri400', 6, 0, -1.5, 'middle', foil)
               + text('Rarely is.', 'fri400', 6, 0, 6, 'middle', foil))
        out.append(place(0.001, h / 2, tag))
        out.append(place(w, h / 2, tag))
    return out


def tub_lid(dr, mode='art', bleed=1):
    d = T['label']
    f = Face(f'tub-{dr}-lid', d, d, 'disc', None, bleed)
    c = d / 2
    mark = 2 if mode == 'mock' else None
    if dr == 'bazaar':
        f.add(bz_ground(f, 26, 'rani', ox=c - 13, oy=c - 13))
        f.add(f'<circle cx="{fmt(c)}" cy="{fmt(c)}" r="{fmt(c - 6.5)}" fill="{BZ["cream"]}" stroke="{BZ["ink"]}" stroke-width="1"/>')
        f.add(f'<circle cx="{fmt(c)}" cy="{fmt(c)}" r="{fmt(c - 8.6)}" fill="none" stroke="{BZ["ink"]}" stroke-width=".35" stroke-dasharray="1 1"/>')
        ww = 34
        f.add(brand('logo/bazaar/wordmark-stacked.svg', c - ww / 2, 13.5, ww, ww / brand_aspect('logo/bazaar/wordmark-stacked.svg')))
        f.add(text('CURRY QUARTER', 'dm700', 2.6, c, 56, 'middle', BZ['rani'], .18))
        f.add(text('Dish:', 'caveat', 5.2, c - 27, 64.2, 'start', BZ['ink']))
        f.add(f'<line x1="{fmt(c - 16)}" y1="64.6" x2="{fmt(c + 27)}" y2="64.6" stroke="{BZ["ink"]}" stroke-width=".45"/>')
        if mode == 'mock':
            f.add(text('Butter Chicken', 'caveat', 5.6, c + 5, 63.4, 'middle', '#1B1F6B'))
        f.add(bz_spice_row(c, 73.5, 66, mark, 6.6, lsize=1.7))
    else:
        foil = ry_foil(f)
        f.add(full(f, RY['ink']))
        f.add(ry_jali(f, None, None, 20, ox=c - 10, oy=c - 10))
        f.add(f'<circle cx="{fmt(c)}" cy="{fmt(c)}" r="{fmt(c - 6.5)}" fill="{RY["ink"]}" stroke="{foil}" stroke-width=".5"/>')
        f.add(f'<circle cx="{fmt(c)}" cy="{fmt(c)}" r="{fmt(c - 8)}" fill="none" stroke="{foil}" stroke-width=".25"/>')
        ww = 28
        f.add(brand('logo/royal/wordmark-stacked.svg', c - ww / 2, 13, ww, ww / brand_aspect('logo/royal/wordmark-stacked.svg')))
        f.add(text('Curry Quarter', 'fri400', 4.0, c, 52, 'middle', foil))
        f.add(text('DISH', 'hk700', 1.9, c - 26, 61.6, 'start', foil, .3))
        f.add(f'<line x1="{fmt(c - 18)}" y1="61.8" x2="{fmt(c + 26)}" y2="61.8" stroke="{foil}" stroke-width=".3"/>')
        if mode == 'mock':
            f.add(text('Butter Chicken', 'caveat', 5.4, c + 4, 60.8, 'middle', RY['ivory']))
        f.add(ry_spice_row(c, 71, 66, foil, mark, 7.6, 1.45))
    return f


# ═══════════════════════════ HANDI ═══════════════════════════════════
def handi_body(dr, mode='art', bleed=1):
    w, h = H['body_w'], H['body_len']
    f = Face(f'handi-{dr}-side', w, h, 'rect', None, bleed)
    cx = w / 2  # front
    # body profile length ~ 104; belly (r=88) sits ~ 50 from base → art y measured from top (neck) downward
    if dr == 'bazaar':
        f.add(bz_ground(f, 34, ox=cx - 17))
        f.add(bz_rim(f, 0, 8, True, 2.2))
        f.add(band(f, h - 12, 13, BZ['ink']))
        f.add(scallops(-f.b - 1, h - 12, w + 2 * f.b + 2, 2.3, BZ['marigold'], False, BZ['ink'], .5))
        f.add(dot_row(0, h - 6, w, .9, 4.6, BZ['marigold']))
        lw, lh = 70, 74
        ly = 13
        f.add(bz_label(cx - lw / 2, ly, lw, lh))
        ww = 50
        f.add(brand('logo/bazaar/wordmark-stacked.svg', cx - ww / 2, ly + 10, ww, ww / brand_aspect('logo/bazaar/wordmark-stacked.svg')))
        pill, _ = bz_pill(cx, ly + lh + 1, 'BIRYANI BOULEVARD', 4.0, BZ['rani'], BZ['cream'], maxw=80)
        f.add(pill)
        for sx in (cx - 138, cx + 138):
            f.add(bz_shadowed(rrect(sx - 44, 26, 88, 40, 5), BZ['cream'], .9, 1.2))
            f.add(text('GARMA-GARAM', 'bowlby', 7, sx, 41, 'middle', BZ['ink']))
            f.add(text('(that means piping hot)', 'caveat', 6, sx, 50, 'middle', BZ['rani']))
            f.add(text('LIFT THE LID SLOWLY', 'dm700', 2.6, sx, 58.5, 'middle', BZ['ink'], .14))
        bx = cx - w / 2 if cx - w / 2 > 0 else cx + w / 2
        for bxx in (0, w):
            f.add(bz_shadowed(rrect(bxx - 36, 30, 72, 30, 4), BZ['cream'], .9, 1.2))
            f.add(text('CURRY DISTRICT', 'bowlby', 4.6, bxx, 41, 'middle', BZ['ink']))
            f.add(text(ADDRESS, 'dm500', 1.9, bxx, 47, 'middle', BZ['ink'], .02, maxw=64))
            f.add(text('serves the whole crew', 'caveat', 4.6, bxx, 54, 'middle', BZ['saffron']))
    else:
        foil = ry_foil(f)
        f.add(full(f, RY['ink']))
        f.add(ry_jali(f, -2, 18, 22, ox=cx - 11, oy=-2))
        f.add(ry_jali(f, h - 16, 18, 22, ox=cx - 11, oy=h - 16))
        f.add(ry_rule(-2, w + 2, 16.4, foil))
        f.add(ry_rule(-2, w + 2, h - 17.4, foil))
        aw, ah = 52, 64
        ay = 22
        f.add(ry_arch(cx - aw / 2, ay, aw, ah, foil, .4))
        ww = 32
        f.add(brand('logo/royal/wordmark-stacked.svg', cx - ww / 2, ay + 9, ww, ww / brand_aspect('logo/royal/wordmark-stacked.svg')))
        f.add(text('Biryani Boulevard', 'fri400', 3.8, cx, ay + ah - 4.5, 'middle', foil))
        for sx in (cx - 130, cx + 130):
            f.add(text('Open slowly.', 'fri400', 8, sx, 47, 'middle', foil))
            f.add(text('Breathe in.', 'fri400', 8, sx, 58, 'middle', foil))
            f.add(ry_diamond(sx, 65, 1.2, foil))
        for bxx in (0, w):
            f.add(text('CURRY DISTRICT · BIRYANI BOULEVARD', 'hk700', 2.3, bxx, 46, 'middle', foil, .2))
            f.add(text(ADDRESS, 'hk500', 2.0, bxx, 52, 'middle', foil, .1))
    return f


def handi_band(dr, mode='art', bleed=1):
    w, h = H['band_w'], H['band_h']
    f = Face(f'handi-{dr}-band', w, h, 'rect', None, bleed)
    cx = w / 2
    mark = 2 if mode == 'mock' else None
    if dr == 'bazaar':
        f.add(full(f, BZ['rani']))
        f.add(band(f, -2, 4.2, BZ['ink']))
        f.add(band(f, h - 2.2, 4.2, BZ['ink']))
        f.add(scallops(-2, 2.2, w + 4, 2.2, BZ['cream'], True, BZ['ink'], .45))
        f.add(scallops(-2, h - 2.2, w + 4, 2.2, BZ['cream'], False, BZ['ink'], .45))
        f.add(dot_row(0, h / 2, w, 1.1, 5.0, BZ['marigold']))
        # spice plaque at the front
        pw = 84
        f.add(f'<path d="{rrect(cx - pw / 2, 1.0, pw, h - 2.0, 2.4)}" fill="{BZ["cream"]}" stroke="{BZ["ink"]}" stroke-width=".7"/>')
        f.add(bz_spice_row(cx, 6.6, pw - 6, mark, 6.6, lsize=1.6))
    else:
        foil = ry_foil(f)
        f.add(full(f, RY['emerald']))
        f.add(ry_rule(-2, w + 2, 1.4, foil, .4, True, .8))
        f.add(ry_rule(-2, w + 2, h - 2.4, foil, .4, True, .8))
        n = int(w / 6)
        g = w / n
        pw = 86
        f.add(''.join(ry_diamond(g * (i + .5), h / 2, 1.5, foil) + f'<circle cx="{fmt(g * i)}" cy="{fmt(h / 2)}" r=".55" fill="{foil}"/>'
                      for i in range(n) if abs(g * (i + .5) - cx) > pw / 2 + 2))
        f.add(f'<rect x="{fmt(cx - pw / 2)}" y="3" width="{fmt(pw)}" height="{fmt(h - 6)}" fill="{RY["ink"]}" stroke="{foil}" stroke-width=".3"/>')
        f.add(ry_spice_row(cx, 7.2, pw - 6, foil, mark, 6.6, 1.35))
    return f


def handi_dome(dr, mode='art', bleed=1):
    """Top-down projection of the domed lid (front = bottom of art). Vents sit on the front arc;
    printed steam rises toward the knob (= upward on the object as you face it)."""
    d = H['dome_d']
    f = Face(f'handi-{dr}-lid', d, d, 'disc', None, bleed)
    c = d / 2
    seal = mode in ('art', 'mock')
    vents = [(180 + a, 47) for a in (-34, 0, 34)]
    def vpos(th, R):
        t = math.radians(th)
        return c + R * math.sin(t), c - R * math.cos(t)
    if dr == 'bazaar':
        f.add(bz_ground(f, 30, ox=c - 15, oy=c - 15))
        f.add(f'<circle cx="{fmt(c)}" cy="{fmt(c)}" r="{fmt(c - 1.2)}" fill="none" stroke="{BZ["ink"]}" stroke-width="3.2"/>')
        f.add(f'<circle cx="{fmt(c)}" cy="{fmt(c)}" r="{fmt(c - 5)}" fill="none" stroke="{BZ["marigold"]}" stroke-width="1.2" stroke-dasharray="0 3.4" stroke-linecap="round"/>')
        f.add(f'<circle cx="{fmt(c + .9)}" cy="{fmt(c + .9)}" r="27" fill="{BZ["ink"]}"/>')
        f.add(f'<circle cx="{fmt(c)}" cy="{fmt(c)}" r="27" fill="{BZ["cream"]}" stroke="{BZ["ink"]}" stroke-width="1"/>')
        f.add(f'<circle cx="{fmt(c)}" cy="{fmt(c)}" r="24.6" fill="none" stroke="{BZ["rani"]}" stroke-width="1.6"/>')
        f.add(text_on_arc('STEAM HAPPENS · LET IT BREATHE · STEAM HAPPENS · LET IT BREATHE ·', 'dm700', 2.5, c, c, 19.6, 0, BZ['ink'], .12))
        f.add(f'<circle cx="{fmt(c)}" cy="{fmt(c)}" r="15.5" fill="{BZ["saffron"]}" stroke="{BZ["ink"]}" stroke-width=".8"/>')
        for th, R in vents:
            vx, vy = vpos(th, R)
            f.add(f'<g transform="rotate({th + 180} {fmt(vx)} {fmt(vy)})">{bz_steam_vent(vx, vy, 13, 15)}</g>')
        if seal:
            sx, sy = vpos(96, 54)
            f.add(bz_seal(sx, sy, 30, 96))
    else:
        foil = ry_foil(f)
        f.add(full(f, RY['ink']))
        f.add(ry_jali(f, None, None, 22, ox=c - 11, oy=c - 11))
        f.add(f'<circle cx="{fmt(c)}" cy="{fmt(c)}" r="{fmt(c - 14)}" fill="{RY["ink"]}" stroke="{foil}" stroke-width=".45"/>')
        f.add(f'<circle cx="{fmt(c)}" cy="{fmt(c)}" r="{fmt(c - 15.5)}" fill="none" stroke="{foil}" stroke-width=".25"/>')
        f.add(f'<circle cx="{fmt(c)}" cy="{fmt(c)}" r="17" fill="none" stroke="{foil}" stroke-width=".35"/>')
        f.add(text_on_arc('OPEN SLOWLY · BREATHE IN · OPEN SLOWLY · BREATHE IN ·', 'hk700', 2.3, c, c, 21, 0, foil, .3))
        for th, R in vents:
            vx, vy = vpos(th, R - 2)
            f.add(f'<g transform="rotate({th + 180} {fmt(vx)} {fmt(vy)})">{ry_steam_vent(vx, vy, foil, 13, 14)}</g>')
        if seal:
            sx, sy = vpos(96, 52)
            f.add(ry_seal(sx, sy, 28, 96))
    return f


# ═══════════════════════════ TRAY (sleeve + drawer) ══════════════════
def tray_face(dr, face, mode='art', bleed=1):
    dims = {'lid': (TR['L'], TR['D']), 'front': (TR['L'], TR['H']), 'back': (TR['L'], TR['H']),
            'bottom': (TR['L'], TR['D']), 'side': (TR['tD'], TR['tH']), 'traywall': (TR['tL'], TR['tH']),
            'trayfloor': (TR['tL'], TR['tD'])}
    w, h = dims[face]
    f = Face(f'tray-{dr}-{face}', w, h, 'rect', None, bleed)
    cx, cy = w / 2, h / 2
    mark = 2 if mode == 'mock' else None
    seal = mode in ('art', 'mock')
    if dr == 'bazaar':
        if face in ('lid', 'front', 'back', 'bottom'):
            f.add(bz_ground(f, 32, ox=cx - 16, oy=cy - 16))
        if face == 'lid':
            f.add(band(f, -2, 9, BZ['ink'])); f.add(band(f, h - 7, 9, BZ['ink']))
            f.add(dot_row(0, 3.5, w, .9, 5, BZ['marigold'])); f.add(dot_row(0, h - 3.5, w, .9, 5, BZ['marigold']))
            tw, th = 150, 112
            tx, ty = 18, (h - th) / 2 + 3
            f.add(bz_shadowed(rrect(tx, ty, tw, th, 6), BZ['cream'], 1.1, 1.8))
            ww = 132
            wa = brand_aspect('logo/bazaar/wordmark-horizontal.svg')
            f.add(brand('logo/bazaar/wordmark-horizontal.svg', tx + (tw - ww) / 2, ty + 12, ww, ww / wa))
            f.add(f'<line x1="{fmt(tx + 10)}" y1="{fmt(ty + 66)}" x2="{fmt(tx + tw - 10)}" y2="{fmt(ty + 66)}" stroke="{BZ["ink"]}" stroke-width=".6" stroke-dasharray="1.6 1.2"/>')
            f.add(text('CURRY · RICE · NAAN · NAP.', 'bowlby', 8.2, tx + tw / 2, ty + 79, 'middle', BZ['ink'], maxw=tw - 16))
            f.add(text('the District Combo, in one drawer', 'caveat', 7.4, tx + tw / 2, ty + 92, 'middle', BZ['rani']))
            # spice + dish box
            sx = 186; sw_ = 56
            f.add(bz_shadowed(rrect(sx, ty, sw_, th, 5), BZ['cream'], 1.0, 1.6))
            f.add(text('SPICE', 'bowlby', 5, sx + sw_ / 2, ty + 10, 'middle', BZ['ink']))
            f.add(text('CHECK', 'bowlby', 5, sx + sw_ / 2, ty + 16, 'middle', BZ['ink']))
            cols = [BZ['cilantro'], BZ['marigold'], BZ['saffron'], BZ['chili'], BZ['ink']]
            for i in range(5):
                yy = ty + 26 + i * 15.2
                f.add(f'<circle cx="{fmt(sx + 12.5)}" cy="{fmt(yy + .5)}" r="5.2" fill="{BZ["ink"]}"/>')
                f.add(f'<circle cx="{fmt(sx + 12)}" cy="{fmt(yy)}" r="5.2" fill="{cols[i]}" stroke="{BZ["ink"]}" stroke-width=".5"/>')
                f.add(chili(sx + 12, yy, 6.4, BZ['cream'], BZ['cream'], rot=-35))
                words = SPICE[i].split(' ')
                for j, wd in enumerate(words):
                    f.add(text(wd, 'dm700', 2.7, sx + 20, yy + 1 + (j - (len(words) - 1) / 2) * 3.2, 'start', BZ['ink'], .06))
                if mark == i:
                    f.add(f'<path d="M{fmt(sx + 4)} {fmt(yy)}C{fmt(sx + 4)} {fmt(yy - 9)} {fmt(sx + 52)} {fmt(yy - 9)} {fmt(sx + 52)} {fmt(yy)}C{fmt(sx + 52)} {fmt(yy + 8)} {fmt(sx + 6)} {fmt(yy + 9)} {fmt(sx + 3)} {fmt(yy - 2)}" fill="none" stroke="#1B1F6B" stroke-width=".9" stroke-linecap="round"/>')
            if seal:
                f.add(bz_seal(w - 9, ty + th + 1, 34, 18))
        elif face == 'front':
            f.add(band(f, -2, 7, BZ['ink'])); f.add(band(f, h - 5, 7, BZ['ink']))
            f.add(text('CURRY. RICE. NAAN. NAP.', 'bowlby', 12.5, cx - 18 + .9, cy + 5.9, 'middle', BZ['ink']))
            f.add(text('CURRY. RICE. NAAN. NAP.', 'bowlby', 12.5, cx - 18, cy + 5, 'middle', BZ['cream']))
            f.add(f'<path d="{rrect(w - 50, cy - 9, 44, 18, 9)}" fill="{BZ["cream"]}" stroke="{BZ["ink"]}" stroke-width=".7"/>')
            f.add(text('pull for the good stuff', 'caveat', 4.8, w - 28, cy + 1.6, 'middle', BZ['ink'], maxw=38))
        elif face == 'back':
            f.add(band(f, -2, 7, BZ['ink'])); f.add(band(f, h - 5, 7, BZ['ink']))
            f.add(f'<path d="{rrect(cx - 100, 12, 200, h - 24, 5)}" fill="{BZ["cream"]}" stroke="{BZ["ink"]}" stroke-width=".8"/>')
            items = ['CURRY', 'RICE', 'NAAN', 'RAITA', 'SPOON']
            for i, it in enumerate(items):
                x = cx - 92 + i * 37
                f.add(f'<rect x="{fmt(x)}" y="{fmt(cy - 7)}" width="5.6" height="5.6" rx=".8" fill="none" stroke="{BZ["ink"]}" stroke-width=".6"/>')
                f.add(text(it, 'bowlby', 4.2, x + 8, cy - 2, 'start', BZ['ink']))
            f.add(text('packed by _______   ·   ' + ADDRESS.lower().replace('suite', 'suite'), 'dm500', 2.6, cx, cy + 10, 'middle', BZ['ink'], .02, maxw=186))
        elif face == 'bottom':
            pass
        elif face == 'side':
            f.add(bz_ground(f, 30, 'rani', ox=cx - 15, oy=cy - 15))
            f.add(f'<path d="{rrect(cx - 62, cy - 19, 124, 38, 6)}" fill="{BZ["cream"]}" stroke="{BZ["ink"]}" stroke-width="1"/>')
            f.add(text('BAS, EK AUR NAAN.', 'bowlby', 8.4, cx, cy + .5, 'middle', BZ['ink'], maxw=112))
            f.add(text('(okay, just one more naan)', 'caveat', 6.4, cx, cy + 11, 'middle', BZ['rani']))
        elif face == 'traywall':
            f.add(bz_ground(f, 30, 'rani', ox=cx - 15, oy=cy - 15))
        elif face == 'trayfloor':
            f.add(full(f, '#F6EEDD'))
    else:
        foil = ry_foil(f)
        if face in ('lid', 'front', 'back', 'bottom'):
            f.add(full(f, RY['ink']))
        if face == 'lid':
            f.add(ry_jali(f, None, None, 24, ox=cx - 12, oy=cy - 12))
            f.add(f'<rect x="12" y="12" width="{fmt(w - 24)}" height="{fmt(h - 24)}" fill="{RY["ink"]}" stroke="{foil}" stroke-width=".5"/>')
            f.add(f'<rect x="14" y="14" width="{fmt(w - 28)}" height="{fmt(h - 28)}" fill="none" stroke="{foil}" stroke-width=".25"/>')
            aw, ah = 70, 116
            ax, ay = 34, (h - ah) / 2 + 6
            f.add(ry_arch(ax, ay, aw, ah, foil, .45))
            ew = 34
            f.add(brand('logo/royal/emblem.svg', ax + (aw - ew) / 2, ay + 30, ew, ew / brand_aspect('logo/royal/emblem.svg')))
            tx = 168
            f.add(brand('logo/royal/wordmark-text-only.svg', tx - 34, 40, 68, 68 / brand_aspect('logo/royal/wordmark-text-only.svg')))
            f.add(ry_diamond(tx, 82, 1.3, foil))
            f.add(text('Dinner, arranged.', 'fri400', 8.6, tx, 96, 'middle', foil))
            f.add(text('CURRY · RICE · NAAN', 'hk700', 3.0, tx, 106, 'middle', foil, .35))
            f.add(f'<path d="{rrect(tx - 42, 116, 84, 34, 2)}" fill="none" stroke="{foil}" stroke-width=".3"/>')
            f.add(ry_spice_row(tx, 125.5, 78, foil, mark, 8.0, 1.55))
            if seal:
                f.add(ry_seal(w - 10, h - 12, 32, 12))
        elif face == 'front':
            f.add(ry_jali(f, -2, 12, 20, ox=0, oy=-2))
            f.add(ry_jali(f, h - 10, 12, 20, ox=0, oy=h - 10))
            f.add(band(f, 10.4, h - 20.8, RY['ink']))
            f.add(ry_rule(-2, w + 2, 9.6, foil)); f.add(ry_rule(-2, w + 2, h - 11.2, foil))
            f.add(text('Curry · Rice · Naan', 'fri400', 10, cx - 20, cy + 3.5, 'middle', foil))
            f.add(text('SLIDE TO SERVE', 'hk700', 2.8, w - 30, cy + 1, 'middle', foil, .3))
            f.add(f'<path d="M{fmt(w - 15)} {fmt(cy)}h6m-2 -1.8l2 1.8l-2 1.8" fill="none" stroke="{foil}" stroke-width=".4"/>')
        elif face == 'back':
            f.add(band(f, 10.4, h - 20.8, RY['ink']))
            f.add(ry_rule(-2, w + 2, 9.6, foil)); f.add(ry_rule(-2, w + 2, h - 11.2, foil))
            items = ['CURRY', 'RICE', 'NAAN', 'RAITA', 'SPOON']
            for i, it in enumerate(items):
                x = cx - 88 + i * 36
                f.add(f'<rect x="{fmt(x)}" y="{fmt(cy - 6.8)}" width="4.6" height="4.6" fill="none" stroke="{foil}" stroke-width=".35"/>')
                f.add(text(it, 'hk700', 3.2, x + 7, cy - 2.6, 'start', foil, .25))
            f.add(text(ADDRESS, 'hk500', 2.4, cx, cy + 9, 'middle', foil, .1))
        elif face == 'side':
            f.add(full(f, RY['emerald']))
            f.add(f'<rect x="6" y="6" width="{fmt(w - 12)}" height="{fmt(h - 12)}" fill="none" stroke="{foil}" stroke-width=".4"/>')
            f.add(text('Slide. Lift. Linger.', 'fri400', 10, cx, cy + 1, 'middle', foil))
            f.add(text('CURRY DISTRICT', 'hk700', 2.6, cx, cy + 10, 'middle', foil, .4))
        elif face == 'traywall':
            f.add(full(f, RY['emerald']))
            f.add(ry_jali(f, None, None, 20, ox=cx - 10, oy=cy - 10))
        elif face == 'trayfloor':
            f.add(full(f, '#EFE6D6'))
    return f

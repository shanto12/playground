"""Neon/LED-flex sign toolkit: original monoline lettering (single-stroke centrelines), tube rendering
with layered glow, wall-light masks, brick & plaster walls, size annotations."""
import math
from geo import Path
from common import f, path, rect, circle, ellipse, g, txt, txtw, rrect_d, rng

# ------------------------------------------------------------------ monoline CAPS (cap height 100, y-down, baseline 0)
CAPS = {
    'A': (84, ["M0 0L42 -100L84 0", "M17 -38H67"]),
    'C': (88, ["M84 -78C76 -93 63 -101 48 -101C21 -101 2 -78 2 -50C2 -22 21 1 48 1C63 1 76 -7 84 -22"]),
    'D': (88, ["M2 0V-100H34C68 -100 88 -80 88 -50C88 -20 68 0 34 0Z"]),
    'E': (66, ["M66 -100H2V0H66", "M2 -50H54"]),
    'H': (78, ["M2 -100V0", "M76 -100V0", "M2 -50H76"]),
    'I': (4, ["M2 -100V0"]),
    'L': (62, ["M2 -100V0H62"]),
    'N': (80, ["M2 0V-100L78 0V-100"]),
    'O': (100, ["M50 -101C22 -101 1 -78 1 -50C1 -22 22 1 50 1C78 1 99 -22 99 -50C99 -78 78 -101 50 -101Z"]),
    'P': (74, ["M2 0V-100H38C60 -100 74 -88 74 -71C74 -54 60 -42 38 -42H2"]),
    'R': (76, ["M2 0V-100H38C60 -100 74 -88 74 -72C74 -56 60 -45 38 -45H2", "M40 -45L76 0"]),
    'S': (74, ["M70 -84C63 -96 51 -101 37 -101C17 -101 5 -90 5 -75C5 -59 19 -53 37 -49C57 -45 72 -38 72 -22C72 -6 57 1 39 1C22 1 9 -6 2 -18"]),
    'T': (80, ["M0 -100H80", "M40 -100V0"]),
    'U': (78, ["M2 -100V-36C2 -12 17 1 39 1C61 1 76 -12 76 -36V-100"]),
    'Y': (80, ["M0 -100L40 -50L80 -100", "M40 -50V0"]),
    'M': (96, ["M2 0V-100L48 -30L94 -100V0"]),
    'K': (72, ["M2 -100V0", "M70 -100L4 -40", "M24 -58L72 0"]),
    'W': (120, ["M0 -100L28 0L60 -84L92 0L120 -100"]),
    '&': (80, ["M78 0L22 -60C10 -72 8 -80 8 -86C8 -96 18 -102 30 -102C42 -102 50 -94 50 -84C50 -70 36 -62 22 -54C8 -46 2 -36 2 -24C2 -8 16 2 34 2C50 2 64 -6 74 -26"]),
    '·': (16, ["M8 -50L8.5 -50"]),
    '-': (40, ["M4 -50H36"]),
    '#': (84, ["M30 -100L20 0", "M64 -100L54 0", "M8 -66H82", "M2 -34H76"]),
    ' ': (44, []),
}

# ------------------------------------------------------------------ monoline SCRIPT (x-height 100, asc 195, y-down)
# drawn as separate tube pieces with entry/exit hooks, the way a neon bender would break them
SCRIPT = {
    'a': (90, ["M56 -88C48 -99 37 -103 26 -100C9 -95 2 -72 4 -46C6 -18 19 1 36 0C48 -1 54 -12 56 -26",
               "M70 -100V-20C70 -4 76 2 84 -1C88 -3 91 -8 93 -14"]),
    'd': (94, ["M56 -88C48 -99 37 -103 26 -100C9 -95 2 -72 4 -46C6 -18 19 1 36 0C48 -1 54 -12 56 -26",
               "M72 -196V-20C72 -4 78 2 86 -1C90 -3 93 -8 95 -14"]),
    'e': (78, ["M8 -46C28 -44 50 -50 62 -64C73 -78 67 -101 46 -101C22 -101 5 -77 5 -48C5 -18 21 1 43 1C57 1 67 -7 74 -18"]),
    'h': (100, ["M0 -44C18 -82 40 -140 40 -170C40 -194 22 -202 14 -186C8 -172 8 -124 8 -62V0",
                "M10 -58C18 -86 34 -102 51 -100C65 -98 71 -86 71 -66V-20C71 -4 78 2 86 -1C90 -3 94 -9 96 -15"]),
    'i': (44, ["M0 -40C7 -62 13 -86 16 -101L13 -26C12 -6 17 2 27 -1C32 -3 36 -9 39 -16", "M22 -138L24 -141"]),
    'l': (52, ["M0 -44C18 -82 38 -140 38 -170C38 -194 20 -202 12 -186C6 -172 6 -124 6 -52C6 -16 11 1 24 0C33 -1 38 -8 42 -16"]),
    'm': (136, ["M4 0V-70C4 -92 16 -102 30 -100C42 -98 47 -88 47 -70V0",
                "M49 -64C53 -89 65 -102 81 -100C94 -98 99 -88 99 -70V-20C99 -4 106 2 114 -1C118 -3 122 -9 124 -15"]),
    'n': (90, ["M4 0V-70C4 -92 17 -102 33 -100C47 -98 53 -88 53 -70V-20C53 -4 60 2 68 -1C72 -3 76 -9 78 -15"]),
    'o': (80, ["M40 -101C17 -101 4 -78 4 -50C4 -20 18 1 38 1C58 1 71 -21 71 -50C71 -79 58 -99 44 -101"]),
    'r': (66, ["M8 0V-62C12 -86 26 -100 44 -98C52 -97 57 -93 60 -87"]),
    's': (66, ["M56 -86C50 -96 40 -102 30 -100C16 -98 8 -88 10 -76C12 -62 28 -58 40 -52C54 -46 60 -36 58 -22C56 -6 40 2 26 0C14 -2 6 -8 2 -16"]),
    't': (62, ["M22 -150V-24C22 -6 28 1 38 0C46 -1 52 -8 56 -16", "M0 -96H48"]),
    'u': (90, ["M6 -100V-38C6 -13 18 0 34 0C46 0 55 -8 58 -24",
               "M72 -100V-20C72 -4 78 2 86 -1C90 -3 93 -8 95 -14"]),
    'w': (118, ["M0 -100C4 -60 10 -24 22 -4C26 4 34 4 38 -6C44 -24 48 -50 53 -72C57 -50 61 -24 67 -6C71 4 79 4 83 -6C91 -30 97 -70 99 -100C101 -104 108 -105 114 -100"]),
    'y': (88, ["M6 -100V-40C6 -14 18 0 34 0C46 0 56 -8 60 -22",
               "M72 -100V40C72 76 52 92 30 88C12 84 6 70 12 58C18 46 44 42 78 52"]),
    'C': (110, ["M100 -158C92 -184 66 -196 46 -186C18 -172 4 -132 4 -90C4 -40 26 1 60 1C80 1 94 -11 102 -28",
                "M100 -158C104 -148 100 -139 92 -142"]),
    'T': (128, ["M4 -168C30 -186 64 -160 96 -172C112 -178 124 -184 136 -178",
                "M78 -170C72 -120 64 -60 56 -22C52 -2 40 4 28 -2C20 -6 16 -14 16 -22"]),
    'S': (116, ["M116 -160C108 -184 78 -196 52 -186C28 -178 22 -152 36 -132C52 -110 92 -100 102 -70C112 -38 92 -4 58 0C32 2 12 -10 4 -28"]),
    'O': (136, ["M70 -184C30 -184 6 -142 6 -92C6 -40 30 1 66 1C104 1 128 -40 128 -92C128 -146 104 -182 74 -186C58 -188 48 -178 54 -170C60 -162 82 -164 98 -172"]),
    'N': (128, ["M0 -10C10 -60 16 -150 22 -184C40 -120 70 -40 92 -6C98 -60 104 -140 112 -186"]),
    '-': (40, ["M6 -54L32 -58"]),
    ' ': (46, []),
    "'": (20, ["M12 -190L8 -150"]),
}
KERN = {('C', 'h'): -6, ('T', 'i'): -34, ('S', 'l'): -8, ('O', 'r'): -6, ('w', '-'): -4, ('r', 'e'): -4, ('r', 'r'): -2,
        ('C', 'u'): -4, ('r', 'y'): -2}

def set_mono(text, table, size=100, x=0, y=0, tracking=10, slant=0, anchor='start', kern=True):
    """returns list of Path pieces (one per tube) and total width; size = scale of 100 units"""
    pen = 0; pieces = []; prev = None
    s = size / 100.0
    for ch in text:
        if ch not in table: ch = ch.upper() if ch.upper() in table else ' '
        adv, strokes = table[ch]
        if kern and prev and (prev, ch) in KERN: pen += KERN[(prev, ch)]
        for d in strokes:
            pieces.append(Path.parse(d).translate(pen, 0))
        pen += adv + tracking
        prev = ch
    w = (pen - tracking) * s
    k = math.tan(math.radians(slant))
    if anchor == 'middle': x0 = x - w / 2
    elif anchor == 'end': x0 = x - w
    else: x0 = x
    out = [p.transform(s, 0, -k * s, s, x0, y) for p in pieces]
    return out, w

# ------------------------------------------------------------------ colour helpers
def hex2rgb(h): h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
def rgb2hex(c): return '#' + ''.join(f'{max(0, min(255, int(round(v)))):02X}' for v in c)
def mix(a, b, t):
    A, B = hex2rgb(a), hex2rgb(b)
    return rgb2hex([A[i] + (B[i] - A[i]) * t for i in range(3)])

# real-world LED neon flex colours (slightly more luminous than print brand colours)
TUBE = {
    'marigold': '#FFB21E', 'saffron': '#FF7A1F', 'rani': '#FF2E97', 'aqua': '#21E0D3', 'warm': '#FFD9A0',
    'gold': '#FFC35A', 'ruby': '#FF3D6E', 'emerald': '#2EE6A6', 'violet': '#9C7BFF', 'ice': '#BDEBFF',
}

# ------------------------------------------------------------------ filters
def neon_filters(p, tw, W, H):
    """p: id prefix; tw: tube width in user units"""
    reg = f'filterUnits="userSpaceOnUse" x="-200" y="-200" width="{f(W+400)}" height="{f(H+400)}"'
    return (
        f'<filter id="{p}b0" {reg}><feGaussianBlur stdDeviation="{f(tw*0.18)}"/></filter>'
        f'<filter id="{p}b1" {reg}><feGaussianBlur stdDeviation="{f(tw*0.9)}"/></filter>'
        f'<filter id="{p}b2" {reg}><feGaussianBlur stdDeviation="{f(tw*2.6)}"/></filter>'
        f'<filter id="{p}b3" {reg}><feGaussianBlur stdDeviation="{f(tw*7)}"/></filter>'
        f'<filter id="{p}b4" {reg}><feGaussianBlur stdDeviation="{f(tw*16)}"/></filter>'
        f'<filter id="{p}sh" {reg}><feGaussianBlur stdDeviation="{f(tw*0.5)}"/></filter>'
    )

def tube(pieces, color, tw, p, lit=1.0, blend=True):
    """render tube pieces (list of Path or d strings) with layered glow. lit 0..1"""
    d = ''.join(x if isinstance(x, str) else x.d() for x in pieces)
    hot = mix(color, '#FFFFFF', 0.82)
    body = mix(color, '#FFFFFF', 0.30)
    sc = 'stroke-linecap="round" stroke-linejoin="round" fill="none"'
    bl = ' style="mix-blend-mode:screen"' if blend else ''
    out = []
    # shadow the tube casts on its acrylic backer / wall (offset down-right), weak when lit
    out.append(f'<path d="{d}" {sc} stroke="#000" stroke-opacity="{f(0.55 - 0.25*lit)}" stroke-width="{f(tw*1.15)}" transform="translate({f(tw*0.35)},{f(tw*0.7)})" filter="url(#{p}sh)"/>')
    if lit <= 0.02:
        # unlit tube: frosted silicone jacket, slightly coloured
        out.append(f'<path d="{d}" {sc} stroke="{mix(color, "#3A3346", 0.72)}" stroke-width="{f(tw)}"/>')
        out.append(f'<path d="{d}" {sc} stroke="#FFFFFF" stroke-opacity=".16" stroke-width="{f(tw*0.28)}" transform="translate({f(-tw*0.18)},{f(-tw*0.2)})"/>')
        return ''.join(out)
    out.append(f'<g{bl}>')
    out.append(f'<path d="{d}" {sc} stroke="{color}" stroke-opacity="{f(0.30*lit)}" stroke-width="{f(tw*7)}" filter="url(#{p}b3)"/>')
    out.append(f'<path d="{d}" {sc} stroke="{color}" stroke-opacity="{f(0.75*lit)}" stroke-width="{f(tw*3.2)}" filter="url(#{p}b2)"/>')
    out.append(f'<path d="{d}" {sc} stroke="{color}" stroke-opacity="{f(0.95*lit)}" stroke-width="{f(tw*1.7)}" filter="url(#{p}b1)"/>')
    out.append('</g>')
    # the tube itself: diffused jacket + white-hot core
    jacket = mix(mix(color, '#3A3346', 0.6), body, lit)
    out.append(f'<path d="{d}" {sc} stroke="{jacket}" stroke-width="{f(tw)}"/>')
    out.append(f'<path d="{d}" {sc} stroke="{hot}" stroke-opacity="{f(lit)}" stroke-width="{f(tw*0.48)}" filter="url(#{p}b0)"/>')
    return ''.join(out)

def wall_light_mask(p, pieces_all, tw, W, H, cx, cy, rx, ry, strength=1.0):
    d = ''.join(x if isinstance(x, str) else x.d() for x in pieces_all)
    return (f'<radialGradient id="{p}rg" cx="{f(cx)}" cy="{f(cy)}" r="1" gradientUnits="userSpaceOnUse" '
            f'gradientTransform="translate({f(cx)} {f(cy)}) scale({f(rx)} {f(ry)}) translate({f(-cx)} {f(-cy)})">'
            f'<stop offset="0" stop-color="#fff" stop-opacity="{f(0.55*strength)}"/><stop offset=".55" stop-color="#fff" stop-opacity="{f(0.22*strength)}"/>'
            f'<stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'
            f'<mask id="{p}lm" maskUnits="userSpaceOnUse" x="0" y="0" width="{f(W)}" height="{f(H)}">'
            f'<rect width="{f(W)}" height="{f(H)}" fill="#000"/>'
            f'<rect width="{f(W)}" height="{f(H)}" fill="url(#{p}rg)"/>'
            f'<path d="{d}" fill="none" stroke="#fff" stroke-opacity="{f(0.9*strength)}" stroke-width="{f(tw*10)}" stroke-linecap="round" filter="url(#{p}b4)" transform="translate(0,{f(tw*2)})"/>'
            f'<path d="{d}" fill="none" stroke="#fff" stroke-opacity="{f(0.8*strength)}" stroke-width="{f(tw*4)}" stroke-linecap="round" filter="url(#{p}b2)"/>'
            f'</mask>')

def tint_filter(fid, color, gain=4.0, lift=0.04):
    r, g_, b = [c / 255 for c in hex2rgb(color)]
    return (f'<filter id="{fid}" color-interpolation-filters="sRGB"><feColorMatrix values="'
            f'{f(gain*r)} 0 0 0 {f(lift*r)}  0 {f(gain*g_)} 0 0 {f(lift*g_)}  0 0 {f(gain*b)} 0 {f(lift*b)}  0 0 0 1 0"/></filter>')

# ------------------------------------------------------------------ walls
def brick_wall(W, H, ppi, base='#211845', mortar='#120C2C', seed=7, jitter=0.08, gid='wall', y0=0):
    """painted brick wall to true scale. ppi = svg units per inch. US modular brick 7.625 x 2.25 in, 3/8 mortar"""
    R = rng(seed)
    bw, bh, m = 7.625 * ppi, 2.25 * ppi, 0.375 * ppi
    out = [rect(0, 0, W, H, fill=mortar)]
    br = hex2rgb(base)
    row = 0; y = y0 - bh
    while y < H:
        off = -(bw + m) / 2 if row % 2 else 0
        x = off - R.random() * 2
        while x < W:
            k = 1 + (R.random() - 0.5) * 2 * jitter
            col = rgb2hex([c * k for c in br])
            out.append(f'<rect x="{f(x)}" y="{f(y)}" width="{f(bw)}" height="{f(bh)}" rx="{f(ppi*0.18)}" fill="{col}"/>')
            x += bw + m
        y += bh + m; row += 1
    # mortar shading: lit top edge of each course, shadow under
    return f'<g id="{gid}">' + ''.join(out) + '</g>'

def plaster_wall(W, H, base, gid='wall', seed=4, light='#FFFFFF', dark='#000000', amt=0.10):
    """limewash plaster: base + low-frequency mottling + fine grain (via turbulence)"""
    fid = gid + 'pf'
    return (f'<filter id="{fid}" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">'
            f'<feTurbulence type="fractalNoise" baseFrequency="0.0035 0.006" numOctaves="4" seed="{seed}" result="n"/>'
            f'<feColorMatrix in="n" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  {f(amt*3.2)} 0 0 0 {f(-amt*1.4)}" result="l"/>'
            f'<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="{seed+3}" result="gr"/>'
            f'<feColorMatrix in="gr" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 {f(amt*1.6)} {f(-amt*0.5)}" result="d"/>'
            f'<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="l"/><feMergeNode in="d"/></feMerge></filter>'
            f'<g id="{gid}"><rect width="{f(W)}" height="{f(H)}" fill="{base}" filter="url(#{fid})"/></g>')

def grain(W, H, fid='grain', opacity=0.06, seed=9):
    return (f'<filter id="{fid}" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse">'
            f'<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="{seed}"/>'
            f'<feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 {f(opacity*3)} {f(-opacity)}"/></filter>'
            f'<rect width="{f(W)}" height="{f(H)}" filter="url(#{fid})" opacity="1"/>')

# ------------------------------------------------------------------ acrylic backer + hardware
def backer(d, p, opacity=0.05):
    return (f'<path d="{d}" fill="#FFFFFF" fill-opacity="{f(opacity)}" stroke="#FFFFFF" stroke-opacity=".22" stroke-width="1.6"/>'
            f'<path d="{d}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="3" transform="translate(4,7)" filter="url(#{p}sh)"/>')

def standoff(x, y, r=7):
    return (circle(x, y + 3, r * 1.15, fill='#000', fill_opacity='.35') +
            circle(x, y, r, fill='#9C9AA6') + circle(x - r*0.25, y - r*0.25, r*0.55, fill='#E6E4EC') +
            circle(x, y, r * 0.35, fill='#6E6B7A'))

# ------------------------------------------------------------------ dimension annotations
def dim_h(x1, x2, y, label, color='#FFF4DC', key='dmsans', size=22, tick=12, wght=600, above=True):
    ty = y - 12 if above else y + size + 8
    w = txtw(label, key, size, wght)
    mx = (x1 + x2) / 2
    gap = w / 2 + 14
    out = [line(x1, y - tick, x1, y + tick, stroke=color, stroke_width=2),
           line(x2, y - tick, x2, y + tick, stroke=color, stroke_width=2),
           line(x1, y, mx - gap, y, stroke=color, stroke_width=1.6),
           line(mx + gap, y, x2, y, stroke=color, stroke_width=1.6),
           path(f'M{f(x1)} {f(y)}l14 -6v12z', fill=color), path(f'M{f(x2)} {f(y)}l-14 -6v12z', fill=color),
           txt(label, key, size, mx, y + size * 0.36, color, anchor='middle', wght=wght)]
    return ''.join(out)

def dim_v(x, y1, y2, label, color='#FFF4DC', key='dmsans', size=22, tick=12, wght=600):
    my = (y1 + y2) / 2
    w = txtw(label, key, size, wght)
    gap = w / 2 + 14
    lab = txt(label, key, size, 0, size * 0.36, color, anchor='middle', wght=wght)
    out = [line(x - tick, y1, x + tick, y1, stroke=color, stroke_width=2),
           line(x - tick, y2, x + tick, y2, stroke=color, stroke_width=2),
           line(x, y1, x, my - gap, stroke=color, stroke_width=1.6),
           line(x, my + gap, x, y2, stroke=color, stroke_width=1.6),
           path(f'M{f(x)} {f(y1)}l-6 14h12z', fill=color), path(f'M{f(x)} {f(y2)}l-6 -14h12z', fill=color),
           f'<g transform="translate({f(x)},{f(my)}) rotate(-90)">{lab}</g>']
    return ''.join(out)

def line(x1, y1, x2, y2, **kw):
    from common import line as L
    return L(x1, y1, x2, y2, **kw)

def tube_len_ft(pieces, units_per_inch):
    L = sum(p.length() for p in pieces)
    return L / units_per_inch / 12.0

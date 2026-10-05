"""Royal direction drawing kit: arches, gold line-work, beading, jali, brass vessels, spices, filigree."""
import math
from common import *
from geo import Path, Poly

GOLD = RY['gold']; GLT = RY['goldlt']; GDK = RY['golddk']; INKR = RY['ink']

def foil_grad(gid, x1=0, y1=0, x2=1, y2=1, units='objectBoundingBox'):
    return (f'<linearGradient id="{gid}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" gradientUnits="{units}">'
            f'<stop offset="0" stop-color="#B7791F"/><stop offset=".38" stop-color="#F7D98A"/>'
            f'<stop offset=".58" stop-color="#E9A63A"/><stop offset="1" stop-color="#B7791F"/></linearGradient>')

def brass_grad(gid):
    return (f'<linearGradient id="{gid}" x1="0" y1="0" x2="1" y2="0">'
            f'<stop offset="0" stop-color="#6E4510"/><stop offset=".18" stop-color="#B7791F"/><stop offset=".42" stop-color="#F7D98A"/>'
            f'<stop offset=".55" stop-color="#E9A63A"/><stop offset=".8" stop-color="#9A6216"/><stop offset="1" stop-color="#4E300A"/></linearGradient>')

def copper_grad(gid):
    return (f'<linearGradient id="{gid}" x1="0" y1="0" x2="1" y2="0">'
            f'<stop offset="0" stop-color="#4A1C0E"/><stop offset=".25" stop-color="#9A4A26"/><stop offset=".45" stop-color="#E39B6A"/>'
            f'<stop offset=".6" stop-color="#B8643A"/><stop offset="1" stop-color="#3A140A"/></linearGradient>')

def mughal_arch(cx, base, w, h, point=0.2, shoulder=0.62):
    """closed four-centred arch path (jambs to base)."""
    hw = w / 2
    top = base - h
    sy = top + hw * (1.0 + point) * 0.95
    return (f'M{f(cx-hw)} {f(base)}V{f(sy)}'
            f'C{f(cx-hw)} {f(sy - hw*shoulder)} {f(cx - hw*0.40)} {f(top + hw*0.34)} {f(cx)} {f(top)}'
            f'C{f(cx + hw*0.40)} {f(top + hw*0.34)} {f(cx+hw)} {f(sy - hw*shoulder)} {f(cx+hw)} {f(sy)}V{f(base)}Z')

def mughal_arch_open(cx, base, w, h, point=0.2, shoulder=0.62):
    return mughal_arch(cx, base, w, h, point, shoulder)[:-1]

def beading(d, step, r, fill=GLT, start=0, opacity=1):
    P = Poly(d)
    out = []
    s = start
    while s < P.L:
        x, y, a = P.at(s)
        out.append(f'M{f(x+r)} {f(y)}A{f(r)} {f(r)} 0 1 0 {f(x-r)} {f(y)}A{f(r)} {f(r)} 0 1 0 {f(x+r)} {f(y)}Z')
        s += step
    return path(''.join(out), fill=fill, opacity=f(opacity))

def cusped_arch(cx, base, w, h, n=9, depth=0.42, point=0.2):
    """multifoil (cusped) arch: sample the mughal arch head and replace with inward lobes"""
    d = mughal_arch_open(cx, base, w, h, point)
    P = Poly(d)
    hw = w / 2
    # find springing: points along head between jambs
    # jamb length = base - sy
    top = base - h; sy = top + hw * (1.0 + point) * 0.95
    jl = base - sy
    s0, s1 = jl, P.L - jl
    pts = [P.at(s0 + (s1 - s0) * i / n)[:2] for i in range(n + 1)]
    out = f'M{f(cx-hw)} {f(base)}V{f(sy)}'
    for i in range(n):
        (x1, y1), (x2, y2) = pts[i], pts[i + 1]
        ch = math.dist((x1, y1), (x2, y2)); r = ch / 2 / depth
        out += f'A{f(r)} {f(r)} 0 0 0 {f(x2)} {f(y2)}'
    out += f'V{f(base)}Z'
    return out

# ---------------- spices (drawn around origin, ~60 units) ----------------
def star_anise(s=1.0):
    out = []
    for k in range(8):
        a = k * 45
        out.append(f'<g transform="rotate({a})">'
                   f'<path d="M0 -4C8 -10 10 -26 0 -34C-10 -26 -8 -10 0 -4Z" fill="#7A3B1A" stroke="{GOLD}" stroke-width="1.6"/>'
                   f'<ellipse cx="0" cy="-20" rx="3.2" ry="5.5" fill="#D8A15A"/></g>')
    out.append(circle(0, 0, 5, fill='#5A2A10', stroke=GOLD, stroke_width=1.4))
    return f'<g transform="scale({f(s)})">' + ''.join(out) + '</g>'

def cardamom(s=1.0):
    return (f'<g transform="scale({f(s)})"><path d="M0 -26C14 -18 16 14 0 28C-16 14 -14 -18 0 -26Z" fill="#7FA04A" stroke="{GOLD}" stroke-width="1.6"/>'
            f'<path d="M0 -24C6 -10 6 12 0 26M-6 -18C-2 -4 -2 10 -6 20M6 -18C2 -4 2 10 6 20" fill="none" stroke="#4E6E2A" stroke-width="1.4"/>'
            f'<path d="M0 -26l-2 -6" stroke="#4E6E2A" stroke-width="2" stroke-linecap="round"/></g>')

def cinnamon(s=1.0):
    return (f'<g transform="scale({f(s)})"><rect x="-8" y="-40" width="16" height="80" rx="6" fill="#8B4A22" stroke="{GOLD}" stroke-width="1.6"/>'
            f'<path d="M-8 -36C-2 -40 6 -38 8 -32M-8 -36C-2 -30 4 -30 8 -32" fill="#B5683A" stroke="#5A2A10" stroke-width="1.2"/>'
            f'<path d="M-2 -30V36M3 -28V34" stroke="#6A3415" stroke-width="1.3"/></g>')

def chilli(s=1.0):
    return (f'<g transform="scale({f(s)})"><path d="M-6 -30C4 -30 10 -14 8 4C6 20 -2 34 -12 40C-6 24 -6 8 -10 -8C-12 -20 -12 -28 -6 -30Z" fill="#B3122E" stroke="{GOLD}" stroke-width="1.6"/>'
            f'<path d="M-2 -24C2 -14 2 0 0 10" fill="none" stroke="#E2545E" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>'
            f'<path d="M-8 -30C-6 -38 0 -40 4 -36M-2 -36l2 -8" fill="none" stroke="#3E6B2A" stroke-width="3" stroke-linecap="round"/></g>')

def clove(s=1.0):
    return (f'<g transform="scale({f(s)})"><path d="M-1.6 -6L-2.4 26L2.4 26L1.6 -6Z" fill="#5A2A10" stroke="{GOLD}" stroke-width="1"/>'
            f'<circle cx="0" cy="-10" r="6" fill="#6B3215" stroke="{GOLD}" stroke-width="1"/><path d="M-7 -6l7 -2l7 2" fill="none" stroke="#3A1808" stroke-width="2"/></g>')

def bay_leaf(s=1.0):
    return (f'<g transform="scale({f(s)})"><path d="M0 -40C18 -24 18 22 0 40C-18 22 -18 -24 0 -40Z" fill="#7E8F45" stroke="{GOLD}" stroke-width="1.6"/>'
            f'<path d="M0 -36V38" stroke="#C9C27A" stroke-width="1.6"/>' +
            ''.join(f'<path d="M0 {y}l{10 if k%2 else -10} -8" stroke="#C9C27A" stroke-width="1"/>' for k, y in enumerate(range(-24, 30, 9))) + '</g>')

def saffron_threads(s=1.0):
    return (f'<g transform="scale({f(s)})" fill="none" stroke-linecap="round">' +
            ''.join(f'<path d="M0 0C{a} {-10} {b} -22 {c} -34" stroke="{col}" stroke-width="2.6"/>'
                    for a, b, c, col in [(-4, -10, -6, '#D2361E'), (2, 6, 10, '#E8562A'), (-1, -2, 2, '#C42A16'), (4, 12, 18, '#E0482A')]) +
            '<circle cx="0" cy="2" r="2.5" fill="#F2C14E"/></g>')

def peppercorn(s=1.0):
    return f'<g transform="scale({f(s)})"><circle r="6" fill="#2A1A14" stroke="{GOLD}" stroke-width="1"/><circle cx="-2" cy="-2" r="1.8" fill="#6B5040"/></g>'

SPICES = [star_anise, cardamom, cinnamon, chilli, clove, bay_leaf, saffron_threads, peppercorn]

# ---------------- brass vessels (origin = base centre) ----------------
def handi(gid, s=1.0, steam=True):
    out = [ellipse(0, 0, 120, 16, fill='#000', opacity='.35'),
           path('M-54 -168C-60 -150 -48 -142 -78 -122C-136 -86 -140 -24 -96 -6C-60 8 60 8 96 -6C140 -24 136 -86 78 -122C48 -142 60 -150 54 -168Z', fill=f'url(#{gid})', stroke=GDK, stroke_width=2),
           ellipse(0, -168, 62, 12, fill='#3A2208', stroke=GLT, stroke_width=3),
           path('M-118 -70C-60 -54 60 -54 118 -70', fill='none', stroke=GLT, stroke_width=3, opacity='.9'),
           path('M-112 -58C-60 -42 60 -42 112 -58', fill='none', stroke=GDK, stroke_width=2),
           path('M-90 -112C-104 -90 -106 -60 -96 -40', fill='none', stroke='#FFF6D8', stroke_width=6, stroke_linecap='round', opacity='.55')]
    # little engraved arcade on the band
    for k in range(-5, 6):
        out.append(path(f'M{k*20-6} -66v-6a6 6 0 0 1 12 0v6', fill='none', stroke=GDK, stroke_width=1.5))
    return f'<g transform="scale({f(s)})">' + ''.join(out) + '</g>'

def kettle(gid, s=1.0):
    out = [ellipse(0, 0, 70, 10, fill='#000', opacity='.35'),
           path('M-60 -8C-74 -50 -50 -96 0 -96C50 -96 74 -50 60 -8Z', fill=f'url(#{gid})', stroke=GDK, stroke_width=2),
           path('M-30 -96C-28 -120 28 -120 30 -96Z', fill=f'url(#{gid})', stroke=GDK, stroke_width=2),
           circle(0, -122, 7, fill=GLT, stroke=GDK, stroke_width=1.5),
           path('M-48 -84C-90 -120 -100 -40 -62 -30', fill='none', stroke=GDK, stroke_width=9, stroke_linecap='round'),
           path('M-48 -84C-90 -120 -100 -40 -62 -30', fill='none', stroke=GOLD, stroke_width=5, stroke_linecap='round'),
           path('M58 -40C92 -44 92 -80 120 -104L126 -98C102 -74 104 -30 62 -24Z', fill=f'url(#{gid})', stroke=GDK, stroke_width=2),
           path('M-40 -70C-46 -52 -44 -34 -38 -22', fill='none', stroke='#FFF6D8', stroke_width=5, stroke_linecap='round', opacity='.5')]
    return f'<g transform="scale({f(s)})">' + ''.join(out) + '</g>'

def tiffin(gid, s=1.0):
    out = [ellipse(0, 0, 56, 9, fill='#000', opacity='.35')]
    y = 0
    for k in range(3):
        out.append(rect(-46, y - 52, 92, 50, rx=10, fill=f'url(#{gid})', stroke=GDK, stroke_width=2))
        out.append(rect(-48, y - 10, 96, 8, rx=3, fill=GLT, opacity='.7'))
        y -= 54
    out.append(path(f'M-30 {y}C-30 {y-70} 30 {y-70} 30 {y}', fill='none', stroke=GOLD, stroke_width=6))
    out.append(path(f'M-50 -150V-6M50 -150V-6', stroke=GDK, stroke_width=4))
    out.append(path('M-30 -150C-36 -110 -36 -60 -30 -20', fill='none', stroke='#FFF6D8', stroke_width=5, opacity='.45', stroke_linecap='round'))
    return f'<g transform="scale({f(s)})">' + ''.join(out) + '</g>'

def katori_stack(gid, s=1.0):
    out = [ellipse(0, 0, 60, 9, fill='#000', opacity='.35')]
    for k in range(4):
        y = -k * 18
        out.append(path(f'M{-50+k*3} {y-20}C{-46+k*3} {y} {46-k*3} {y} {50-k*3} {y-20}Z', fill=f'url(#{gid})', stroke=GDK, stroke_width=1.6))
        out.append(ellipse(0, y - 20, 50 - k * 3, 6, fill='#4E300A', stroke=GLT, stroke_width=1.6))
    return f'<g transform="scale({f(s)})">' + ''.join(out) + '</g>'

def spice_box(gid, s=1.0):
    """masala dabba, seen at 3/4: round tin with seven little bowls of colour"""
    out = [ellipse(0, 0, 84, 14, fill='#000', opacity='.35'),
           path('M-80 -30V-6C-80 6 80 6 80 -6V-30Z', fill=f'url(#{gid})', stroke=GDK, stroke_width=2),
           ellipse(0, -30, 80, 24, fill='#B7791F', stroke=GLT, stroke_width=2),
           ellipse(0, -31, 74, 20, fill='#5A3A0E')]
    cols = ['#E9B23A', '#B3122E', '#C9662A', '#E3C88A', '#5A2A10', '#7FA04A', '#E8562A']
    pos = [(0, -31), (-44, -33), (44, -33), (-24, -43), (24, -43), (-24, -21), (24, -21)]
    for (x, y), c in zip(pos, cols):
        out.append(ellipse(x, y, 16, 7, fill=GOLD, stroke=GDK, stroke_width=1))
        out.append(ellipse(x, y - 1, 12, 5, fill=c))
    return f'<g transform="scale({f(s)})">' + ''.join(out) + '</g>'

def lantern(gid, glow_id, s=1.0):
    out = [circle(0, 40, 90, fill=GLT, opacity='.35', filter=f'url(#{glow_id})'),
           path('M0 -40V0', stroke=GOLD, stroke_width=2),
           path('M-26 0H26L34 30C34 64 18 84 0 92C-18 84 -34 64 -34 30Z', fill=f'url(#{gid})', stroke=GDK, stroke_width=2),
           path('M-18 22L0 12L18 22L18 60L0 76L-18 60Z', fill='#FFE7A8', stroke=GDK, stroke_width=1.5)]
    for k in range(3):
        for j in range(4):
            out.append(circle(-12 + k * 12, 26 + j * 12, 2.4, fill='#FFF6D8'))
    out.append(path('M0 92V108', stroke=GOLD, stroke_width=3))
    out.append(circle(0, 112, 5, fill=GOLD))
    return f'<g transform="scale({f(s)})">' + ''.join(out) + '</g>'

def scroll_vine(x, y, s, flip=False, col=GOLD, sw=2.2):
    """fine-line filigree: two spirals with leaves (secular floral scroll)"""
    d = ('M0 0C40 -10 70 -40 70 -80C70 -110 40 -120 26 -100C16 -86 28 -70 42 -76'
         'M0 0C50 10 100 0 130 -30C150 -50 150 -80 128 -86C112 -90 104 -74 116 -66'
         'M60 -6C70 20 100 30 120 20')
    leaves = ''.join(f'<path d="M{lx} {ly}c6 -10 18 -12 22 -6c-6 8 -16 10 -22 6Z" transform="rotate({rot} {lx} {ly})" fill="none" stroke="{col}" stroke-width="{f(sw*0.8)}"/>'
                     for lx, ly, rot in [(70, -40, -20), (100, -8, 10), (40, -20, -60), (120, 20, 30), (140, -50, -40)])
    buds = ''.join(circle(bx, by, 3.5, fill=col) for bx, by in [(42, -76), (116, -66), (120, 20)])
    tr = f'translate({f(x)},{f(y)}) scale({f(-s if flip else s)},{f(s)})'
    return f'<g transform="{tr}"><path d="{d}" fill="none" stroke="{col}" stroke-width="{f(sw)}" stroke-linecap="round"/>{leaves}{buds}</g>'

def jali_mask(mid, x, y, w, h, cell=44, hole=0.36, shape_d=None):
    """mask: white panel with star/quatrefoil holes (holes = black) -> openings show what's behind"""
    holes = []
    rows = int(h / cell) + 2; cols = int(w / cell) + 2
    for j in range(rows):
        for i in range(cols):
            cx = x + i * cell + (cell / 2 if j % 2 else 0); cy = y + j * cell * 0.87
            r = cell * hole
            # eight-point star opening
            pts = []
            for k in range(16):
                rr = r if k % 2 == 0 else r * 0.55
                a = math.pi * k / 8
                pts.append(f'{f(cx + rr*math.cos(a))} {f(cy + rr*math.sin(a))}')
            holes.append('M' + 'L'.join(pts) + 'Z')
            # small diamond between stars
            dx, dy = cx + cell / 2, cy + cell * 0.435
            q = cell * 0.09
            holes.append(f'M{f(dx)} {f(dy-q)}L{f(dx+q)} {f(dy)}L{f(dx)} {f(dy+q)}L{f(dx-q)} {f(dy)}Z')
    sd = shape_d or rrect_d(x, y, w, h, 0)
    return (f'<mask id="{mid}" maskUnits="userSpaceOnUse"><path d="{sd}" fill="#fff"/>'
            f'<path d="{"".join(holes)}" fill="#000"/></mask>')

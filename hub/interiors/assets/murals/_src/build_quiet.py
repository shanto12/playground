"""Second, quieter murals: Bazaar 'Marigold & Chai' garland wall; Royal 'Spice Botanical' fine-line frieze."""
import math
from common import *
from royalkit import GOLD, GLT, GDK, scroll_vine, beading
INK = BZ['ink']

# ------------------------------------------------------------------ Bazaar: marigold & chai
def bloom(x, y, r, col, R, ink=INK, sw=2.4):
    """marigold seen side-on in a garland: ruffled disc with inner ring"""
    n = 11
    d = ''
    for k in range(n + 1):
        a = 2 * math.pi * k / n
        rr = r * (1 + 0.12 * (k % 2))
        px, py = x + rr * math.cos(a), y + rr * math.sin(a)
        d += ('M' if k == 0 else 'L') + f'{f(px)} {f(py)}'
    inner = mix_hex(col, '#000000', 0.18)
    return (path(rrect_like_ruffle(x, y, r), fill=col, stroke=ink, stroke_width=sw, stroke_linejoin='round') +
            circle(x, y, r * 0.55, fill=inner) +
            path(f'M{f(x - r*0.5)} {f(y - r*0.2)}q{f(r*0.5)} {f(-r*0.35)} {f(r)} 0', fill='none', stroke='#FFFFFF', stroke_width=sw * 0.8, stroke_linecap='round', opacity='.45'))

def rrect_like_ruffle(x, y, r, n=12):
    d = ''
    for k in range(n):
        a1 = 2 * math.pi * k / n; a2 = 2 * math.pi * (k + 1) / n
        p1 = (x + r * math.cos(a1), y + r * math.sin(a1)); p2 = (x + r * math.cos(a2), y + r * math.sin(a2))
        if k == 0: d += f'M{f(p1[0])} {f(p1[1])}'
        d += f'A{f(r*0.28)} {f(r*0.28)} 0 0 1 {f(p2[0])} {f(p2[1])}'
    return d + 'Z'

def mix_hex(a, b, t):
    A = [int(a[i:i+2], 16) for i in (1, 3, 5)]; B = [int(b[i:i+2], 16) for i in (1, 3, 5)]
    return '#' + ''.join(f'{int(A[i] + (B[i]-A[i])*t):02X}' for i in range(3))

def strand(x, y0, y1, r, R, ink=INK):
    out = [line(x, y0, x, y1, stroke=ink, stroke_width=2.5)]
    y = y0 + r
    k = 0
    while y < y1:
        if k % 7 == 6:
            out.append(path(f'M{f(x)} {f(y)}c{f(-r*1.2)} {f(-r*0.3)} {f(-r*1.6)} {f(r*0.5)} {f(-r*1.5)} {f(r*0.7)}c{f(r*0.5)} {f(r*0.3)} {f(r*1.2)} {f(0)} {f(r*1.5)} {f(-r*0.7)}Z', fill=BZ['cilantro'], stroke=ink, stroke_width=2))
            out.append(path(f'M{f(x)} {f(y)}c{f(r*1.2)} {f(-r*0.3)} {f(r*1.6)} {f(r*0.5)} {f(r*1.5)} {f(r*0.7)}c{f(-r*0.5)} {f(r*0.3)} {f(-r*1.2)} {f(0)} {f(-r*1.5)} {f(-r*0.7)}Z', fill=BZ['cilantro'], stroke=ink, stroke_width=2))
            y += r * 1.2
        else:
            col = BZ['saffron'] if (k // 3) % 2 == 0 else BZ['marigold']
            if R.random() < 0.05: col = BZ['rani']
            out.append(bloom(x + R.uniform(-1.5, 1.5), y, r, col, R))
            y += r * 1.55
        k += 1
    # tassel
    out.append(path(f'M{f(x)} {f(y)}l{f(-r*0.7)} {f(r*2.2)}h{f(r*1.4)}Z', fill=BZ['rani'], stroke=ink, stroke_width=2.2, stroke_linejoin='round'))
    out.append(circle(x, y, r * 0.42, fill=BZ['marigold'], stroke=ink, stroke_width=2))
    return ''.join(out)

def swag(x1, x2, y, sag, r, R):
    out = []
    n = int((x2 - x1) / (r * 1.5))
    for i in range(n + 1):
        t = i / n
        x = x1 + (x2 - x1) * t
        yy = y + sag * 4 * t * (1 - t)
        col = BZ['saffron'] if i % 2 else BZ['marigold']
        out.append(bloom(x, yy, r, col, R))
    return ''.join(out)

def booti_pattern(W, H, col, step=90, op='.16'):
    out = []
    for j in range(int(H / step) + 2):
        for i in range(int(W / step) + 2):
            x = i * step + (step / 2 if j % 2 else 0); y = j * step
            d = ''
            for k in range(6):
                a = math.radians(k * 60)
                d += f'M{f(x)} {f(y)}m{f(9*math.cos(a)-4)} {f(9*math.sin(a))}a4 4 0 1 0 8 0a4 4 0 1 0 -8 0'
            out.append(d)
            out.append(f'M{f(x-2.5)} {f(y)}a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0')
    return path(''.join(out), fill=col, opacity=op)

def chai_kettle_bz(x, y, rot, s=1.0):
    k = (f'<g transform="translate({f(x)},{f(y)}) rotate({rot}) scale({f(s)})">'
         f'<path d="M-90 40C-110 -20 -70 -90 0 -90C70 -90 110 -20 90 40Z" fill="{BZ["marigold"]}" stroke="{INK}" stroke-width="6" stroke-linejoin="round"/>'
         f'<path d="M-60 -10C-50 -50 -20 -70 10 -70" fill="none" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round" opacity=".55"/>'
         f'<path d="M-92 40H92V54C92 64 -92 64 -92 54Z" fill="{BZ["saffron"]}" stroke="{INK}" stroke-width="6" stroke-linejoin="round"/>'
         f'<path d="M-40 -90C-36 -122 36 -122 40 -90Z" fill="{BZ["marigold"]}" stroke="{INK}" stroke-width="6" stroke-linejoin="round"/>'
         f'<circle cx="0" cy="-124" r="10" fill="{BZ["rani"]}" stroke="{INK}" stroke-width="5"/>'
         f'<path d="M-80 -50C-150 -80 -170 30 -96 20" fill="none" stroke="{INK}" stroke-width="16" stroke-linecap="round"/>'
         f'<path d="M-80 -50C-150 -80 -170 30 -96 20" fill="none" stroke="{BZ["peacock"]}" stroke-width="8" stroke-linecap="round"/>'
         f'<path d="M84 -6C130 -10 140 -60 186 -86L196 -72C160 -50 150 8 92 14Z" fill="{BZ["marigold"]}" stroke="{INK}" stroke-width="6" stroke-linejoin="round"/>'
         f'<path d="M-70 4H70" stroke="{INK}" stroke-width="4" stroke-dasharray="2 12" stroke-linecap="round"/>'
         '</g>')
    return k

def cutting_glass(x, y, s=1.0):
    """faceted 'cutting chai' tumbler, base centre at x,y"""
    w0, w1, h = 66 * s, 50 * s, 150 * s
    out = [ellipse(x + 8 * s, y + 6 * s, 72 * s, 12 * s, fill=INK, opacity='.18'),
           path(f'M{f(x-w0)} {f(y-h)}L{f(x-w1)} {f(y)}H{f(x+w1)}L{f(x+w0)} {f(y-h)}Z', fill='#E7F6F4', stroke=INK, stroke_width=6 * s, stroke_linejoin='round'),
           path(f'M{f(x-w0*0.94)} {f(y-h*0.82)}L{f(x-w1*0.96)} {f(y-4*s)}H{f(x+w1*0.96)}L{f(x+w0*0.94)} {f(y-h*0.82)}Z', fill='#C98A4B'),
           path(f'M{f(x-w0*0.94)} {f(y-h*0.82)}Q{f(x)} {f(y-h*0.9)} {f(x+w0*0.94)} {f(y-h*0.82)}Q{f(x)} {f(y-h*0.74)} {f(x-w0*0.94)} {f(y-h*0.82)}Z', fill='#F0D3A8')]
    for k in range(-2, 3):
        out.append(line(x + k * 22 * s, y - h * 0.75, x + k * 17 * s, y - 8 * s, stroke='#FFFFFF', stroke_width=3 * s, opacity='.45'))
    out.append(path(f'M{f(x-w0)} {f(y-h)}L{f(x-w1)} {f(y)}H{f(x+w1)}L{f(x+w0)} {f(y-h)}', fill='none', stroke=INK, stroke_width=6 * s, stroke_linejoin='round'))
    out.append(line(x - w0, y - h, x + w0, y - h, stroke=INK, stroke_width=6 * s, stroke_linecap='round'))
    return ''.join(out)

def build_marigold_chai():
    W, H = 1920, 1080
    R = rng(3)
    body = [rect(0, 0, W, H, fill=BZ['cream']), booti_pattern(W, H, BZ['saffron'], 96, '.14')]
    # soft sun-wash behind the pour
    defs = [f'<radialGradient id="mcw" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE7B8"/><stop offset="1" stop-color="#FFE7B8" stop-opacity="0"/></radialGradient>']
    body.append(ellipse(980, 560, 560, 420, fill='url(#mcw)'))
    # wainscot
    wy = 900
    n = 40; sw = W / n
    sc = ''.join(f'A{f(sw/2)} {f(sw/2)} 0 0 0 {f((i+1)*sw)} {f(wy)}' for i in range(n))
    body.append(path(f'M0 {wy}{sc}V{H}H0Z', fill=BZ['peacock'], stroke=INK, stroke_width=5))
    body.append(path(''.join(f'M{f(i*sw+sw/2-4)} {wy+30}a4 4 0 1 0 8 0a4 4 0 1 0 -8 0' for i in range(n)), fill=BZ['cream'], opacity='.8'))
    body.append(rect(0, wy + 70, W, 6, fill=INK, opacity='.25'))
    # garland strands: rhythm, catenary lengths framing the centre
    xs = [70 + i * 118 for i in range(16)]
    for x in xs:
        t = (x - 960) / 960
        L = 230 + 520 * (t * t) ** 0.8
        if abs(x - 960) < 330: L = 150 + abs(x - 960) * 0.25
        if x > 1240: L = 150 + (x - 1240) * 0.12
        body.append(strand(x, 40, 40 + L, 17, R))
    body.append(swag(0, W, 34, 0, 20, R))
    body.append(rect(0, 0, W, 22, fill=INK))
    # the pour: kettle high, long chai arc into the glass
    kx, ky = 760, 360
    stream = 'M898 200C980 228 1046 420 1080 560C1110 660 1124 740 1130 820'
    body.append(path(stream, fill='none', stroke=INK, stroke_width=26, stroke_linecap='round'))
    body.append(path(stream, fill='none', stroke='#C98A4B', stroke_width=16, stroke_linecap='round'))
    body.append(path(stream, fill='none', stroke='#F0D3A8', stroke_width=5, stroke_linecap='round', transform='translate(-4,0)', opacity='.9'))
    body.append(chai_kettle_bz(kx, ky, -28, 1.0))
    body.append(cutting_glass(1130, 1000, 1.05))
    for k, dx in enumerate((-30, 10, 46)):
        body.append(path(f'M{1130+dx} 820c-16 -26 16 -46 0 -74c-12 -22 8 -36 0 -56', fill='none', stroke=INK, stroke_width=5, stroke_linecap='round', opacity='.55'))
    # splash droplets
    for (dx, dy, r) in [(-40, 836, 7), (50, 830, 6), (-62, 812, 4), (70, 806, 4)]:
        body.append(circle(1130 + dx, dy, r, fill='#C98A4B', stroke=INK, stroke_width=3))
    # lettering
    body.append(txt('pour it from a height,', 'caveat', 74, 1290, 470, INK, wght=700))
    body.append(txt('drink it slowly.', 'caveat', 74, 1330, 548, BZ['rani'], wght=700))
    body.append(path('M1300 580c90 18 250 16 420 -8', fill='none', stroke=BZ['saffron'], stroke_width=7, stroke_linecap='round'))
    # small district tag
    tag = 'CHAI & COOLERS'
    tw = txtw(tag, 'bowlby', 30)
    body.append(path(rrect_d(1330 + 6, 618 + 6, tw + 60, 56, 28), fill=INK))
    body.append(path(rrect_d(1330, 618, tw + 60, 56, 28), fill=BZ['marigold'], stroke=INK, stroke_width=4))
    body.append(txt(tag, 'bowlby', 30, 1360, 658, INK))
    save('bz-marigold-chai.svg', doc(W, H, ''.join(body), ''.join(defs), title='Marigold & Chai — Bazaar garland wall'))


# ------------------------------------------------------------------ Royal: spice botanical frieze
def leaf_d(x, y, L, w, ang):
    a = math.radians(ang); ca, sa = math.cos(a), math.sin(a)
    def T(u, v): return f'{f(x + u*ca - v*sa)} {f(y + u*sa + v*ca)}'
    return (f'M{T(0,0)}C{T(L*0.3,-w)} {T(L*0.7,-w*0.9)} {T(L,0)}C{T(L*0.7,w*0.9)} {T(L*0.3,w)} {T(0,0)}Z'
            f'M{T(L*0.05,0)}L{T(L*0.92,0)}' + ''.join(f'M{T(L*t,0)}L{T(L*t+L*0.12,-w*0.55)}M{T(L*t,0)}L{T(L*t+L*0.12,w*0.55)}' for t in (0.25, 0.45, 0.65)))

def heart_leaf_d(x, y, s, ang):
    return (f'<path d="M0 0C-30 -10 -44 -46 -26 -66C-14 -78 0 -70 0 -58C0 -70 14 -78 26 -66C44 -46 30 -10 0 0Z'
            f'M0 -4V-58M0 -16C-14 -26 -22 -40 -20 -54M0 -16C14 -26 22 -40 20 -54" transform="translate({f(x)},{f(y)}) rotate({ang}) scale({f(s)})"/>')

def plant(kind, cx, base, R):
    G = []  # strokes
    if kind == 'chilli':
        G.append(f'<path d="M{cx} {base}C{cx-4} {base-120} {cx+10} {base-240} {cx} {base-380}M{cx+2} {base-200}C{cx+40} {base-250} {cx+70} {base-300} {cx+80} {base-360}M{cx} {base-140}C{cx-40} {base-190} {cx-70} {base-230} {cx-86} {base-300}"/>')
        for (x, y, L, a) in [(cx, base-380, 70, -60), (cx, base-300, 80, 200), (cx+60, base-310, 70, -30), (cx-60, base-240, 70, 210), (cx+30, base-230, 60, 20), (cx-20, base-100, 70, 200)]:
            G.append(f'<path d="{leaf_d(x, y, L, 18, a)}"/>')
        for (x, y) in [(cx+40, base-250), (cx-40, base-190), (cx+76, base-350), (cx-80, base-290)]:
            G.append(f'<path d="M{x} {y}c-4 10 -4 16 0 20c10 30 6 80 -10 110c-4 -40 -10 -80 -2 -112" class="ruby"/><path d="M{x-6} {y+8}l12 0"/>')
    elif kind == 'cardamom':
        for k, dx in enumerate((-30, 0, 34)):
            G.append(f'<path d="M{cx+dx} {base}C{cx+dx} {base-200} {cx+dx*1.4} {base-360} {cx+dx*2.2} {base-480}"/>')
            for j in range(4):
                y = base - 140 - j * 90 - k * 20
                G.append(f'<path d="{leaf_d(cx+dx*(1+j*0.3), y, 150, 22, (-150 if (j+k)%2 else -30) + j*6)}"/>')
        for k in range(5):
            x = cx - 90 + k * 40; y = base - 10 - (k % 2) * 16
            G.append(f'<path d="M{x} {y}c8 -14 22 -14 26 0c-4 14 -18 14 -26 0Z M{x+3} {y}h20"/>')
        G.append(f'<path d="M{cx-110} {base}C{cx-40} {base-20} {cx+40} {base-6} {cx+110} {base-14}"/>')
    elif kind == 'pepper':
        G.append(f'<path d="M{cx} {base}C{cx+30} {base-120} {cx-30} {base-260} {cx+10} {base-420}C{cx+20} {base-470} {cx} {base-500} {cx-10} {base-520}"/>')
        for j, (dy, side) in enumerate([(100, -1), (180, 1), (260, -1), (340, 1), (420, -1)]):
            G.append(heart_leaf_d(cx + side * 10, base - dy, 1.25, side * 70))
            sx = cx + side * 40; sy = base - dy + 10
            G.append(f'<path d="M{cx} {base-dy}C{sx} {sy-10} {sx} {sy+30} {sx+side*4} {sy+80}"/>')
            for i in range(7):
                G.append(f'<circle cx="{f(sx + side*4*i/7 + (4 if i%2 else -4))}" cy="{f(sy + 10 + i*10)}" r="5.5"/>')
    elif kind == 'saffron':
        for dx in (-40, -16, 12, 36, 52):
            G.append(f'<path d="M{cx} {base-30}C{cx+dx*0.5} {base-160} {cx+dx*1.5} {base-300} {cx+dx*2.4} {base-420}"/>')
        G.append(f'<path d="M{cx-34} {base-20}C{cx-40} {base+20} {cx+40} {base+20} {cx+34} {base-20}C{cx+20} {base-50} {cx-20} {base-50} {cx-34} {base-20}Z"/>')
        for (fx, fy, s) in [(cx-50, base-260, 1.0), (cx+44, base-330, 1.1)]:
            G.append(f'<path d="M{cx} {base-40}C{cx} {fy+100} {fx} {fy+80} {fx} {fy+40}"/>')
            for a in (-40, -15, 15, 40):
                G.append(f'<path d="M{fx} {fy+40}C{f(fx+a*0.6*s-14)} {fy+10} {f(fx+a*1.1*s-10)} {fy-50} {f(fx+a*0.9*s)} {fy-70}C{f(fx+a*1.1*s+10)} {fy-50} {f(fx+a*0.6*s+14)} {fy+10} {fx} {fy+40}"/>')
            for a in (-12, 0, 12):
                G.append(f'<path d="M{fx} {fy+20}C{fx+a} {fy-20} {fx+a*2} {fy-60} {fx+a*3} {fy-90}" class="ruby"/>')
    elif kind == 'cinnamon':
        G.append(f'<path d="M{cx-60} {base-80}C{cx-20} {base-200} {cx+30} {base-340} {cx+20} {base-500}M{cx+4} {base-300}C{cx+50} {base-330} {cx+80} {base-380} {cx+90} {base-430}"/>')
        for (x, y, a) in [(cx-30, base-170, 200), (cx-10, base-230, -20), (cx+10, base-330, 200), (cx+24, base-420, -40), (cx+60, base-370, -10), (cx+20, base-490, -80)]:
            G.append(f'<path d="{leaf_d(x, y, 100, 30, a)}"/>')
        for k in range(3):
            y = base - 20 - k * 22
            G.append(f'<rect x="{cx-80+k*14}" y="{y-12}" width="170" height="20" rx="10"/><path d="M{cx-74+k*14} {y-2}h150"/>')
    elif kind == 'curryleaf':
        G.append(f'<path d="M{cx} {base}C{cx-10} {base-160} {cx+10} {base-320} {cx} {base-470}"/>')
        for j, (dy, side) in enumerate([(120, -1), (210, 1), (300, -1), (380, 1)]):
            x0, y0 = cx, base - dy
            ex, ey = cx + side * 120, y0 - 70
            G.append(f'<path d="M{x0} {y0}Q{(x0+ex)/2} {y0-60} {ex} {ey}"/>')
            for i in range(1, 6):
                t = i / 6
                px = x0 + (ex - x0) * t; py = y0 + (ey - y0) * t - 30 * 4 * t * (1 - t)
                G.append(f'<path d="{leaf_d(px, py, 34, 10, -90 + side*20)}"/><path d="{leaf_d(px, py, 34, 10, 90 + side*20)}"/>')
        for i in range(6):
            G.append(f'<circle cx="{cx-20+i*8}" cy="{base-480-(i%2)*10}" r="6"/>')
    elif kind == 'staranise':
        G.append(f'<path d="M{cx-40} {base}C{cx-20} {base-140} {cx+20} {base-300} {cx} {base-460}M{cx-6} {base-280}C{cx-50} {base-310} {cx-70} {base-360} {cx-80} {base-400}"/>')
        for (x, y, a) in [(cx-20, base-160, -160), (cx, base-240, -20), (cx-10, base-360, -150), (cx+6, base-420, -50), (cx-70, base-380, -130)]:
            G.append(f'<path d="{leaf_d(x, y, 110, 26, a)}"/>')
        for (x, y, s) in [(cx+50, base-150, 1.0), (cx-70, base-60, 0.8)]:
            pts = ''.join(f'<path d="M{x} {y}C{f(x+s*16*math.cos(math.radians(k*45-20)))} {f(y+s*16*math.sin(math.radians(k*45-20)))} {f(x+s*44*math.cos(math.radians(k*45)))} {f(y+s*44*math.sin(math.radians(k*45)))} {f(x+s*44*math.cos(math.radians(k*45)))} {f(y+s*44*math.sin(math.radians(k*45)))}C{f(x+s*44*math.cos(math.radians(k*45)))} {f(y+s*44*math.sin(math.radians(k*45)))} {f(x+s*16*math.cos(math.radians(k*45+20)))} {f(y+s*16*math.sin(math.radians(k*45+20)))} {x} {y}Z"/>' for k in range(8))
            G.append(pts)
    elif kind == 'turmeric':
        for (a, L) in [(-100, 380), (-75, 420), (-120, 340), (-60, 300)]:
            G.append(f'<path d="{leaf_d(cx, base-40, L, 56, a)}"/>')
        G.append(f'<path d="M{cx-90} {base}C{cx-60} {base-30} {cx+60} {base-30} {cx+90} {base}C{cx+60} {base+16} {cx-60} {base+16} {cx-90} {base}Z'
                 f'M{cx-40} {base}c-10 22 -30 26 -40 20M{cx+30} {base}c10 22 34 24 46 16M{cx} {base+6}c0 20 -6 30 -14 34"/>')
    return f'<g fill="none" stroke="{GOLD}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + ''.join(G) + '</g>'

PLANTS = [('cardamom', 'Cardamom', 'Elettaria cardamomum'), ('pepper', 'Black pepper', 'Piper nigrum'), ('chilli', 'Chilli', 'Capsicum annuum'),
          ('saffron', 'Saffron', 'Crocus sativus'), ('cinnamon', 'Cinnamon', 'Cinnamomum verum'), ('curryleaf', 'Curry leaf', 'Murraya koenigii'),
          ('staranise', 'Star anise', 'Illicium verum'), ('turmeric', 'Turmeric', 'Curcuma longa')]

def frieze_body(x0, y0, W, H, R, ground='#0F4D3F'):
    out = [rect(x0, y0, W, H, fill=ground)]
    cw = W / len(PLANTS)
    out.append(f'<style>.ruby{{stroke:{RY["blush"]}}}</style>')
    for i, (k, name, latin) in enumerate(PLANTS):
        cx = x0 + cw * (i + 0.5); base = y0 + H - 190
        out.append(f'<g transform="translate({f(cx)},{f(base)}) scale({f(H/900)}) translate({f(-cx)},{f(-base)})">{plant(k, cx, base, R)}</g>')
        out.append(txt(name, 'fraunces', 34 * H / 900, cx, y0 + H - 100 * H / 900, GLT, anchor='middle', wght=600))
        out.append(txt(latin, 'fraunces-i', 24 * H / 900, cx, y0 + H - 62 * H / 900, GOLD, anchor='middle', wght=400))
        if i:
            xx = x0 + cw * i
            out.append(path(f'M{f(xx)} {f(y0+H*0.2)}V{f(y0+H*0.86)}', stroke=GOLD, stroke_width=1, opacity='.35'))
            out.append(path(f'M{f(xx)} {f(y0+H*0.17-10)}l8 10l-8 10l-8 -10z', fill=GOLD))
    for yy in (y0 + 24, y0 + H - 24):
        out.append(rect(x0, yy - 2, W, 3, fill=GOLD)); out.append(rect(x0, yy + (8 if yy < y0 + H / 2 else -10), W, 1.2, fill=GLT, opacity='.7'))
    out.append(beading(f'M{f(x0+10)} {f(y0+42)}H{f(x0+W-10)}', 18, 2.6, fill=GLT, opacity=.8))
    return ''.join(out)

def build_botanical():
    W, H = 3200, 900
    R = rng(9)
    save('ry-spice-botanical.svg', doc(W, H, frieze_body(0, 0, W, H, R), title='Spice Botanical — Royal fine-line frieze', px_w=2400, px_h=675))

if __name__ == '__main__':
    build_marigold_chai(); build_botanical()

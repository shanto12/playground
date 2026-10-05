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
        body.append(strand(x, 40, 40 + L, 17, R))
    body.append(swag(0, W, 34, 0, 20, R))
    body.append(rect(0, 0, W, 22, fill=INK))
    # the pour: kettle high, long chai arc into the glass
    kx, ky = 760, 360
    stream = 'M915 318C990 300 1040 420 1080 560C1110 660 1124 740 1130 820'
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

if __name__ == '__main__':
    build_marigold_chai()

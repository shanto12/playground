"""THE DISTRICT MAP — Bazaar signature mural, 16:9 and 9:16."""
import sys, math
from common import *
from mapkit import *

def zone_block(x, y, w, h, tint, r=46):
    return (path(rrect_d(x + 8, y + 8, w, h, r), fill=INK, opacity='.9') +
            path(rrect_d(x, y, w, h, r), fill=TINT[tint], stroke=INK, stroke_width=5))

def dots_texture(x, y, w, h, col, step=26, r=2.4, op='.35'):
    out = []
    for j in range(int(h / step) + 1):
        for i in range(int(w / step) + 1):
            out.append(f'M{f(x + i*step + (step/2 if j % 2 else 0))} {f(y + j*step)}m-{f(r)} 0a{f(r)} {f(r)} 0 1 0 {f(2*r)} 0a{f(r)} {f(r)} 0 1 0 -{f(2*r)} 0')
    return path(''.join(out), fill=col, opacity=op)

def render_map(L, W, H, fname, title):
    R = rng(11)
    defs = []
    body = [rect(0, 0, W, H, fill=BZ['cream'])]
    # paper block-print dots
    defs.append(f'<clipPath id="mapclip"><rect x="34" y="34" width="{W-68}" height="{H-68}" rx="26"/></clipPath>')
    inner = []
    inner.append(rect(0, 0, W, H, fill='#FFEFD0'))
    inner.append(dots_texture(0, 0, W, H, BZ['saffron'], step=34, r=2.2, op='.22'))
    # zone blocks
    for z in L['zones']:
        inner.append(zone_block(*z['rect'], z['tint']))
        inner.append(f'<g clip-path="none">{dots_texture(z["rect"][0] + 20, z["rect"][1] + 20, z["rect"][2] - 40, z["rect"][3] - 40, DEEP[z["tint"]], step=30, r=2.6, op=".25")}</g>')
    # lakes
    for lk in L.get('lakes', []):
        inner.append(path(lk['d'], fill='#FFC94D', stroke=INK, stroke_width=5))
        for k, rr_ in enumerate(lk['ripples']):
            inner.append(path(rr_, fill='none', stroke='#FFFFFF', stroke_width=4, stroke_linecap='round', opacity='.8'))
    # roads: all edges first, then fills, then dashes (clean junctions)
    roads = L['roads']
    for r_ in roads: inner.append(road_edge(r_['d'], r_['w']))
    for c in L.get('circles', []): inner.append(circle(c[0], c[1], c[2] + c[3] / 2 + 5, fill=INK))
    for r_ in roads: inner.append(road_fill(r_['d'], r_['w']))
    for c in L.get('circles', []):
        inner.append(circle(c[0], c[1], c[2] + c[3] / 2, fill='#FFFBF0'))
    for r_ in roads:
        if r_.get('dash', True): inner.append(road_dash(r_['d'], r_['w']))
    # plaza islands
    for c in L.get('circles', []):
        cx, cy, rr, rw, kind = c
        inner.append(circle(cx, cy, rr - rw / 2, fill=BZ['peacock'] if kind == 'plaza' else BZ['cilantro'], stroke=INK, stroke_width=5))
        # rangoli-like ring of petals (decorative, secular)
        n = 16
        for k in range(n):
            a = 2 * math.pi * k / n
            px, py = cx + (rr - rw / 2 - 16) * math.cos(a), cy + (rr - rw / 2 - 16) * math.sin(a)
            inner.append(circle(px, py, 6, fill=BZ['marigold'] if k % 2 else BZ['rani'], stroke=INK, stroke_width=2))
    # street names on paths
    for r_ in roads:
        if r_.get('name'):
            inner.append(street_name(r_['name'], r_.get('name_d', r_['d']), r_.get('fs', r_['w'] * 0.42), r_.get('align', 0.5)))
    # bunting under objects but over roads
    for b in L.get('bunting', []):
        inner.append(bunting(*b, s=1.15, R=R))
    # objects sorted by baseline y (buildings, trees, landmarks, people, vehicles)
    objs = []
    for bd in L.get('buildings', []):
        x, y, w, h, col = bd
        objs.append((y, building(x, y, w, h, col, R)))
    for t in L.get('trees', []):
        objs.append((t[1] + t[2], tree(t[0], t[1], t[2], R)))
    for lm in L.get('landmarks', []):
        k, cx, cy, sz = lm
        objs.append((cy + sz * 0.3, landmark(k, cx, cy, sz)))
    for pp in L.get('people', []):
        objs.append((pp[1], person(pp[0], pp[1], pp[2], R, kid=len(pp) > 3)))
    for rk in L.get('rickshaws', []):
        objs.append((rk[1], rickshaw(rk[0], rk[1], rk[2], flip=len(rk) > 3)))
    for ct in L.get('carts', []):
        objs.append((ct[1], cart(ct[0], ct[1], ct[2], R)))
    for st in L.get('extras', []):
        objs.append(st)
    objs.sort(key=lambda o: o[0])
    inner += [o[1] for o in objs]
    # plaza monument: district stamp
    if L.get('stamp'):
        sx, sy, ss = L['stamp']
        inner.append(ellipse(sx + 8, sy + ss * 0.5, ss * 0.42, ss * 0.1, fill=INK, opacity='.3'))
        inner.append(embed('logo/bazaar/stamp-district-seal.svg', sx - ss / 2, sy - ss / 2, ss, ss))
    # zone labels
    for z in L['zones']:
        if z.get('label'):
            lx, ly, rot = z['label']
            inner.append(plaque(z['name'], lx, ly, size=z.get('ls', 30), rot=rot, accent=DEEP[z['tint']], sub=z.get('sub')))
    # callouts (Caveat)
    for c in L.get('notes', []):
        inner.append(c)
    body.append(f'<g clip-path="url(#mapclip)">{"".join(inner)}</g>')
    # frame
    body.append(path(rrect_d(34, 34, W - 68, H - 68, 26), fill='none', stroke=INK, stroke_width=8))
    body.append(path(rrect_d(20, 20, W - 40, H - 40, 34), fill='none', stroke=BZ['rani'], stroke_width=6, stroke_dasharray='2 14', stroke_linecap='round'))
    # title cartouche
    body.append(L['title_svg'])
    body.append(L.get('compass_svg', ''))
    save(fname, doc(W, H, ''.join(body), ''.join(defs), title=title))

def title_block(x, y, w, big=64, sub=34, rot=-2, tagline=('eight neighbourhoods, one appetite.',)):
    h = big * 2.2 + sub * 1.25 * len(tagline) + 40
    out = [path(rrect_d(x + 10, y + 10, w, h, 22), fill=INK),
           path(rrect_d(x, y, w, h, 22), fill=BZ['marigold'], stroke=INK, stroke_width=6),
           path(rrect_d(x + 12, y + 12, w - 24, h - 24, 14), fill='none', stroke=INK, stroke_width=2.5, stroke_dasharray='10 8')]
    ew = big * 1.6
    out.append(embed('logo/bazaar/emblem.svg', x + 28, y + 28, ew))
    tx = x + 28 + ew + 24
    out.append(txt('THE DISTRICT', 'bowlby', big * 0.62, tx, y + 28 + big * 0.62, INK))
    out.append(txt('MAP', 'bowlby', big * 1.25, tx, y + 28 + big * 1.82, BZ['rani'], stroke=INK, stroke_width=3, paint_order='stroke'))
    yy = y + 28 + big * 1.82 + sub * 1.25
    for t in tagline:
        out.append(txt(t, 'caveat', sub, x + 30, yy, INK, wght=700)); yy += sub * 1.2
    out.append(txt('CURRY DISTRICT · LITTLE ELM, TX', 'dmsans', sub * 0.56, tx, y + 28 + big * 0.62 + sub * 0.7, INK, wght=700, tracking=0.08, opacity='0'))
    return f'<g transform="rotate({rot} {f(x + w/2)} {f(y + h/2)})">' + ''.join(out) + '</g>'

def festoon(x1, x2, y, n, sag, R, s=1.0):
    """row of sagging bunting swags along a block edge"""
    out = []
    step = (x2 - x1) / n
    for i in range(n):
        out.append(bunting(x1 + i * step, y, x1 + (i + 1) * step, y, sag, s, R, n=6))
    return ''.join(out)

def boat(x, y, s=1.0):
    return (ellipse(x, y + 10 * s, 34 * s, 7 * s, fill=INK, opacity='.2') +
            path(f'M{f(x-34*s)} {f(y-6*s)}H{f(x+34*s)}L{f(x+24*s)} {f(y+8*s)}H{f(x-24*s)}Z', fill=BZ['peacock'], stroke=INK, stroke_width=3 * s, stroke_linejoin='round') +
            line(x, y - 6 * s, x, y - 40 * s, stroke=INK, stroke_width=3 * s) +
            path(f'M{f(x+2*s)} {f(y-40*s)}L{f(x+26*s)} {f(y-14*s)}H{f(x+2*s)}Z', fill=BZ['rani'], stroke=INK, stroke_width=2.6 * s, stroke_linejoin='round') +
            circle(x - 14 * s, y - 14 * s, 6 * s, fill=SKIN[2], stroke=INK, stroke_width=2 * s))

def stall(x, y, s, col, R):
    """market stall with striped scalloped awning; (x,y) bottom-left"""
    w = 70 * s; h = 40 * s
    out = [rect(x + 5 * s, y - h - 26 * s + 5 * s, w, h + 26 * s, fill=INK, opacity='.9'),
           rect(x, y - h, w, h, fill='#FFF4DC', stroke=INK, stroke_width=3 * s)]
    for k in range(4):
        out.append(circle(x + 12 * s + k * 15 * s, y - h + 14 * s, 6 * s, fill=R.choice([BZ['marigold'], BZ['saffron'], '#E9C98F', BZ['chili']]), stroke=INK, stroke_width=1.8 * s))
    n = 5; sw = w / n
    d = f'M{f(x)} {f(y-h-26*s)}H{f(x+w)}V{f(y-h-4*s)}' + ''.join(f'A{f(sw/2)} {f(sw/2)} 0 0 1 {f(x + w - (i+1)*sw)} {f(y-h-4*s)}' for i in range(n)) + 'Z'
    out.append(path(d, fill=col, stroke=INK, stroke_width=3 * s, stroke_linejoin='round'))
    for i in range(0, n, 2):
        out.append(rect(x + i * sw, y - h - 26 * s, sw, 22 * s, fill='#FFFFFF', opacity='.85'))
    out.append(path(d, fill='none', stroke=INK, stroke_width=3 * s, stroke_linejoin='round'))
    return ''.join(out)

def note(text, x, y, size=34, col=INK, rot=-4, arrow=None):
    out = [txt(text, 'caveat', size, x, y, col, wght=700, stroke='#FFF4DC', stroke_width=8, stroke_linejoin='round', paint_order='stroke')]
    if arrow:
        out.append(path(arrow, fill='none', stroke=col, stroke_width=3.5, stroke_linecap='round', stroke_linejoin='round'))
    return f'<g transform="rotate({rot} {f(x)} {f(y)})">' + ''.join(out) + '</g>'

# ------------------------------------------------------------------ 16:9 layout (1920 x 1080)
def layout_169():
    W, H = 1920, 1080
    BB = 'M-40 650C300 668 620 610 960 560C1240 520 1360 500 1460 498C1640 494 1760 470 1960 468'
    L = dict(W=W, H=H)
    R = rng(5)
    L['zones'] = [
        dict(name='STARTERS SQUARE', tint='saffron', rect=(70, 268, 470, 320), label=(300, 300, -2)),
        dict(name='INDO-CHINESE ALLEY', tint='chili', rect=(640, 60, 440, 410), label=None),
        dict(name='BREAD BAZAAR', tint='marigold', rect=(1190, 60, 680, 360), label=(1660, 108, 2)),
        dict(name='TANDOOR QUARTER', tint='violet', rect=(70, 724, 430, 316), label=(285, 760, 2)),
        dict(name='CURRY QUARTER', tint='marigold', rect=(590, 706, 430, 334), label=(805, 740, -2)),
        dict(name='SWEET STREET', tint='rani', rect=(1080, 640, 400, 400), label=None),
        dict(name='CHAI & COOLERS', tint='peacock', rect=(1530, 560, 340, 480), label=(1700, 596, -2)),
    ]
    L['lakes'] = [dict(d='M1580 940C1580 900 1630 880 1690 886C1760 892 1830 910 1830 952C1830 994 1760 1012 1696 1008C1626 1004 1580 980 1580 940Z',
                       ripples=['M1610 930q20 -10 40 0', 'M1700 960q22 -10 44 0', 'M1740 905q16 -8 32 0'])]
    L['roads'] = [
        dict(d=BB, w=100, name='BIRYANI BOULEVARD', fs=42, align=0.2),
        dict(d='M1035 655C1110 760 1180 860 1330 930C1440 980 1560 1060 1700 1120', w=64, name='SWEET STREET', fs=30, align=0.36,
             name_d='M1035 655C1110 760 1180 860 1330 930C1440 980 1560 1060 1700 1120'),
        dict(d='M950 440C962 330 900 260 905 170C910 90 940 40 935 -20', w=52, name='INDO-CHINESE ALLEY', fs=23, align=0.5,
             name_d='M935 -20C940 40 910 90 905 170C900 260 962 330 950 440'),
        dict(d='M565 -20C580 120 560 260 575 620', w=44, name='GHEE GALI', fs=22, align=0.7, dash=False),
        dict(d='M545 630C560 760 540 900 555 1100', w=44, name='MASALA LANE', fs=22, align=0.5, dash=False),
        dict(d='M1135 -20C1150 120 1120 300 1150 520', w=44, name='TADKA TURN', fs=22, align=0.42, dash=False),
        dict(d='M1500 1100C1500 900 1500 700 1505 500', w=40, name='', dash=False),
    ]
    L['circles'] = [(960, 560, 140, 64, 'plaza'), (1460, 498, 104, 56, 'island')]
    L['stamp'] = (960, 552, 176)
    L['landmarks'] = [('samosa', 300, 450, 230), ('chilli', 760, 290, 230), ('naan', 1420, 250, 250), ('tandoor', 285, 900, 240),
                      ('curry', 805, 890, 240), ('jamun', 1345, 760, 200), ('chai', 1700, 735, 230), ('biryani', 1460, 480, 150)]
    B = []
    # Starters Square edge buildings
    B += [(92, 560, 70, 92, BZ['rani']), (460, 572, 66, 80, BZ['peacock'])]
    # Indo-Chinese alley shophouses
    B += [(660, 160, 62, 80, BZ['peacock']), (1000, 440, 60, 84, BZ['sky']), (1010, 250, 54, 70, BZ['saffron']), (680, 455, 56, 70, BZ['marigold'])]
    # Bread Bazaar stalls & houses
    B += [(1210, 400, 72, 100, BZ['saffron']), (1290, 400, 56, 74, BZ['peacock']), (1600, 400, 70, 98, BZ['rani']), (1680, 400, 84, 120, BZ['sky']), (1776, 400, 70, 90, BZ['cilantro'])]
    # Tandoor quarter
    B += [(92, 1030, 62, 84, BZ['saffron']), (430, 1030, 56, 76, BZ['rani'])]
    # Curry quarter
    B += [(606, 1030, 62, 90, BZ['peacock']), (950, 1030, 58, 84, BZ['rani'])]
    # Sweet street
    B += [(1100, 1030, 64, 86, BZ['marigold']), (1180, 1030, 52, 70, BZ['peacock']), (1400, 1030, 60, 80, BZ['sky'])]
    # Chai & coolers
    B += [(1546, 840, 56, 70, BZ['rani'])]
    L['buildings'] = B
    L['trees'] = [(200, 340, 22), (130, 420, 18), (520, 420, 20), (700, 90, 16), (1060, 150, 18), (1250, 140, 20), (1330, 140, 16),
                  (1840, 160, 18), (140, 840, 18), (480, 860, 20), (640, 800, 18), (990, 800, 20), (1440, 860, 22), (1110, 700, 18),
                  (1580, 700, 18), (1850, 690, 18), (1830, 820, 14), (1555, 1030, 16)]
    P = [(70, 612, 1.35), (680, 600, 1.35), (742, 690, 1.3, 1), (1180, 560, 1.35), (1300, 452, 1.3), (1640, 530, 1.35), (1800, 430, 1.3),
         (1880, 540, 1.3, 1), (848, 440, 1.25), (1012, 476, 1.25), (1085, 700, 1.25), (1195, 880, 1.25), (1160, 860, 1.2, 1),
         (1420, 990, 1.25), (1690, 1060, 1.2), (595, 900, 1.2), (520, 300, 1.2), (1240, 420, 1.2), (330, 1070, 1.2), (60, 990, 1.2),
         (1520, 790, 1.2), (1120, 300, 1.2)]
    L['people'] = P
    L['rickshaws'] = [(740, 625, 1.15), (1250, 515, 1.15, 1), (1760, 470, 1.1)]
    L['carts'] = [(150, 600, 1.05), (1610, 452, 1.0)]
    L['bunting'] = [(1200, 52, 1860, 52, 40)]
    L['extras'] = [(270, festoon(100, 520, 270, 3, 26, R)), (726, festoon(620, 1000, 708, 3, 24, R)), (562, festoon(1550, 1850, 562, 2, 22, R)),
                   (726, festoon(100, 480, 726, 3, 24, R)),
                   (996, boat(1700, 960, 1.1)), (240, stall(1215, 250, 1.0, BZ['rani'], R)), (330, stall(1215, 330, 1.0, BZ['peacock'], R)),
                   (240, stall(1290, 250, 1.0, BZ['saffron'], R))]
    L['title_svg'] = title_block(58, 50, 500, big=56, sub=34)
    L['compass_svg'] = ''
    L['notes'] = [note('you are here (hungry)', 610, 540, 38, INK, -3, arrow='M790 548q30 4 40 20m0 0l-2 -14m2 14l-14 -4'),
                  note('Lassi Lake', 1640, 1000, 30, INK, -3)]
    L['_compass'] = (1820, 140, 0)
    return L

if __name__ == '__main__':
    L = layout_169()
    render_map(L, L['W'], L['H'], 'bz-district-map-16x9.svg', 'The District Map — Bazaar mural, 16:9')

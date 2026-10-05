"""Pictorial-map building blocks for 'THE DISTRICT MAP' (Bazaar). Flat colour, thick ink outlines,
oblique (3/4) buildings, dish landmarks embedded from brand/illustrations/bazaar, Bowlby street names on paths."""
import math
from common import *

INK = BZ['ink']
TINT = dict(saffron='#FFCDA8', marigold='#FFE08F', rani='#F7B6D5', peacock='#A6E2DC', cilantro='#BFE3B0',
            violet='#D9CEFF', chili='#F7B0B6', cream='#FFE7B8')
DEEP = dict(saffron=BZ['saffron'], marigold=BZ['marigold'], rani=BZ['rani'], peacock=BZ['peacock'],
            cilantro=BZ['cilantro'], violet=BZ['sky'], chili=BZ['chili'], cream='#E9C98F')
SKIN = ['#8D5524', '#A0673C', '#C68642', '#7A4A2A', '#B5774A', '#5C3A21']
CLOTH = [BZ['rani'], BZ['saffron'], BZ['peacock'], BZ['marigold'], BZ['cilantro'], BZ['sky'], BZ['chili'], '#FFFFFF']

DISH = {
    'samosa': 'illustrations/bazaar/set1/samosa-chutney.svg',
    'tandoor': 'illustrations/bazaar/set1/tandoori-platter.svg',
    'curry': 'illustrations/bazaar/set1/butter-chicken.svg',
    'biryani': 'illustrations/bazaar/set1/biryani.svg',
    'chilli': 'illustrations/bazaar/set2/chilli-chicken.svg',
    'naan': 'illustrations/bazaar/set1/garlic-naan.svg',
    'jamun': 'illustrations/bazaar/set2/gulab-jamun.svg',
    'chai': 'illustrations/bazaar/set2/mango-lassi-chai.svg',
    'paneer': 'illustrations/bazaar/set1/paneer-tikka.svg',
    'chaat': 'illustrations/bazaar/set2/chaat.svg',
    'thali': 'illustrations/bazaar/set2/thali.svg',
    'dal': 'illustrations/bazaar/set2/dal-saag.svg',
}

def blob_d(x, y, w, h, r=40):
    return rrect_d(x, y, w, h, r)

def road(d, w, fill='#FFFBF0', edge=INK, dash=BZ['marigold'], ew=5):
    out = [path(d, fill='none', stroke=edge, stroke_width=w + ew * 2, stroke_linecap='round', stroke_linejoin='round'),
           path(d, fill='none', stroke=fill, stroke_width=w, stroke_linecap='round', stroke_linejoin='round')]
    if dash:
        out.append(path(d, fill='none', stroke=dash, stroke_width=max(3, w * 0.07), stroke_dasharray=f'{f(w*0.32)} {f(w*0.3)}', stroke_linecap='round'))
    return ''.join(out)

def road_edge(d, w, ew=5):
    return path(d, fill='none', stroke=INK, stroke_width=w + ew * 2, stroke_linecap='round', stroke_linejoin='round')
def road_fill(d, w, fill='#FFFBF0'):
    return path(d, fill='none', stroke=fill, stroke_width=w, stroke_linecap='round', stroke_linejoin='round')
def road_dash(d, w, dash=BZ['marigold']):
    return path(d, fill='none', stroke=dash, stroke_width=max(3, w * 0.07), stroke_dasharray=f'{f(w*0.32)} {f(w*0.3)}', stroke_linecap='round')

def street_name(text, d, size, align=0.5, color=INK, tracking=0.04):
    p = text_on_path(text, F('bowlby'), size, d, align=align, tracking=tracking)
    return path(p.d(), fill=color)

def building(x, y, w, h, col, R, roof=None, s=1.0):
    """oblique building: roof strip on top, facade below with arched windows; (x,y)=bottom-left"""
    rh = 16 * s
    top = y - h
    roofc = roof or '#FFF4DC'
    out = [rect(x + 6 * s, top - rh + 6 * s, w, h + rh, fill=INK, opacity='.9'),  # hard sticker shadow
           rect(x, top, w, h, fill=col, stroke=INK, stroke_width=3.2 * s, stroke_linejoin='round'),
           rect(x - 3 * s, top - rh, w + 6 * s, rh, fill=roofc, stroke=INK, stroke_width=3.2 * s, stroke_linejoin='round')]
    # scalloped parapet trim
    n = max(2, int(w / (14 * s)))
    sw = (w + 6 * s) / n
    sc = ''.join(f'A{f(sw/2)} {f(sw/2)} 0 0 0 {f(x - 3*s + (i+1)*sw)} {f(top)}' for i in range(n))
    out.append(path(f'M{f(x-3*s)} {f(top)}{sc}', fill=R.choice([BZ['rani'], BZ['marigold'], BZ['peacock'], BZ['saffron']]), stroke=INK, stroke_width=2.4 * s))
    # windows: arched, 1-2 rows
    cols = max(1, int(w / (22 * s)))
    rows = max(1, int((h - 10 * s) / (30 * s)))
    ww = 10 * s; wh = 16 * s
    gx = (w - cols * ww) / (cols + 1)
    for r_ in range(rows):
        wy = top + 14 * s + sw / 3 + r_ * 30 * s
        if wy + wh > y - 4 * s: break
        for c_ in range(cols):
            wx = x + gx + c_ * (ww + gx)
            lit = R.random() < 0.35
            out.append(path(f'M{f(wx)} {f(wy+wh)}V{f(wy+ww/2)}A{f(ww/2)} {f(ww/2)} 0 0 1 {f(wx+ww)} {f(wy+ww/2)}V{f(wy+wh)}Z',
                            fill=BZ['marigold'] if lit else INK, stroke=INK, stroke_width=1.6 * s))
    # rooftop water tank sometimes
    if R.random() < 0.4 and w > 40 * s:
        tx = x + w * R.uniform(0.25, 0.7)
        out.append(rect(tx, top - rh - 12 * s, 14 * s, 12 * s, rx=3 * s, fill=BZ['sky'], stroke=INK, stroke_width=2 * s))
    return ''.join(out)

def tree(x, y, r, R, col=None):
    col = col or R.choice([BZ['cilantro'], '#2E8B57', BZ['cilantro']])
    out = [ellipse(x + 4, y + r * 0.9, r * 0.8, r * 0.25, fill=INK, opacity='.25'),
           rect(x - 2.5, y, 5, r * 0.8, fill='#7A4A2A', stroke=INK, stroke_width=2),
           circle(x, y - r * 0.15, r, fill=col, stroke=INK, stroke_width=3),
           circle(x - r * 0.3, y - r * 0.45, r * 0.32, fill='#FFFFFF', opacity='.22')]
    if R.random() < 0.45:
        for k in range(3):
            a = R.random() * 6.28; rr = r * 0.55
            out.append(circle(x + rr * math.cos(a), y - r * 0.15 + rr * math.sin(a), r * 0.13, fill=BZ['marigold'], stroke=INK, stroke_width=1.4))
    return ''.join(out)

def person(x, y, s, R, kid=False):
    """tiny walking figure, (x,y) = feet"""
    h = (24 if kid else 34) * s
    skin = R.choice(SKIN); cl = R.choice(CLOTH); cl2 = R.choice([INK, '#3A2A6A', BZ['peacock'], '#FFFFFF'])
    hr = h * 0.17
    out = [ellipse(x, y + 1.5 * s, h * 0.28, h * 0.07, fill=INK, opacity='.22'),
           line(x - h * 0.08, y - h * 0.35, x - h * 0.12, y, stroke=INK, stroke_width=3.2 * s, stroke_linecap='round'),
           line(x + h * 0.08, y - h * 0.35, x + h * 0.14, y, stroke=INK, stroke_width=3.2 * s, stroke_linecap='round'),
           path(f'M{f(x-h*0.2)} {f(y-h*0.3)}L{f(x-h*0.16)} {f(y-h*0.74)}Q{f(x)} {f(y-h*0.82)} {f(x+h*0.16)} {f(y-h*0.74)}L{f(x+h*0.22)} {f(y-h*0.3)}Z',
                fill=cl, stroke=INK, stroke_width=2.2 * s, stroke_linejoin='round'),
           circle(x, y - h * 0.86, hr, fill=skin, stroke=INK, stroke_width=2 * s),
           path(f'M{f(x-hr)} {f(y-h*0.86)}A{f(hr)} {f(hr)} 0 0 1 {f(x+hr)} {f(y-h*0.86)}Q{f(x)} {f(y-h*0.96)} {f(x-hr)} {f(y-h*0.86)}Z', fill='#1A1030')]
    if R.random() < 0.3 and not kid:
        bx = x + h * 0.26
        out.append(rect(bx - 4 * s, y - h * 0.4, 8 * s, 9 * s, rx=1.5 * s, fill=R.choice([BZ['marigold'], BZ['rani'], '#FFFFFF']), stroke=INK, stroke_width=1.6 * s))
    if R.random() < 0.25:
        # dupatta / scarf flick
        out.append(path(f'M{f(x-h*0.16)} {f(y-h*0.72)}Q{f(x-h*0.4)} {f(y-h*0.6)} {f(x-h*0.32)} {f(y-h*0.4)}', fill='none', stroke=R.choice([BZ['marigold'], BZ['rani'], BZ['peacock']]), stroke_width=3 * s, stroke_linecap='round'))
    return ''.join(out)

def rickshaw(x, y, s, col=None, flip=False):
    """auto-rickshaw, side view, (x,y)=ground centre"""
    col = col or BZ['marigold']
    out = [ellipse(x, y + 2 * s, 30 * s, 5 * s, fill=INK, opacity='.25'),
           path(f'M{f(x-26*s)} {f(y-8*s)}V{f(y-34*s)}Q{f(x-24*s)} {f(y-46*s)} {f(x-8*s)} {f(y-46*s)}H{f(x+14*s)}Q{f(x+24*s)} {f(y-44*s)} {f(x+26*s)} {f(y-30*s)}L{f(x+30*s)} {f(y-8*s)}Z',
                fill=BZ['cilantro'], stroke=INK, stroke_width=2.6 * s),
           path(f'M{f(x-26*s)} {f(y-8*s)}V{f(y-24*s)}H{f(x+28*s)}L{f(x+30*s)} {f(y-8*s)}Z', fill=col, stroke=INK, stroke_width=2.6 * s),
           rect(x - 6 * s, y - 40 * s, 14 * s, 14 * s, fill='#CFF3F0', stroke=INK, stroke_width=2 * s),
           circle(x - 16 * s, y - 6 * s, 7 * s, fill=INK), circle(x - 16 * s, y - 6 * s, 3 * s, fill='#DDD'),
           circle(x + 22 * s, y - 6 * s, 7 * s, fill=INK), circle(x + 22 * s, y - 6 * s, 3 * s, fill='#DDD')]
    s_ = ''.join(out)
    if flip: return f'<g transform="translate({f(2*x)},0) scale(-1,1)">{s_}</g>'
    return s_

def cart(x, y, s, R):
    out = [ellipse(x, y + 2 * s, 32 * s, 5 * s, fill=INK, opacity='.25'),
           rect(x - 30 * s, y - 30 * s, 60 * s, 20 * s, rx=3 * s, fill=BZ['peacock'], stroke=INK, stroke_width=2.6 * s),
           line(x - 26 * s, y - 30 * s, x - 26 * s, y - 58 * s, stroke=INK, stroke_width=2.4 * s),
           line(x + 26 * s, y - 30 * s, x + 26 * s, y - 58 * s, stroke=INK, stroke_width=2.4 * s),
           path(f'M{f(x-36*s)} {f(y-56*s)}H{f(x+36*s)}L{f(x+30*s)} {f(y-68*s)}H{f(x-30*s)}Z', fill=BZ['rani'], stroke=INK, stroke_width=2.4 * s),
           circle(x - 16 * s, y - 6 * s, 8 * s, fill='#FFF4DC', stroke=INK, stroke_width=2.4 * s),
           circle(x + 16 * s, y - 6 * s, 8 * s, fill='#FFF4DC', stroke=INK, stroke_width=2.4 * s),
           ellipse(x - 8 * s, y - 34 * s, 9 * s, 5 * s, fill='#C77B30', stroke=INK, stroke_width=1.8 * s),
           ellipse(x + 10 * s, y - 34 * s, 9 * s, 5 * s, fill=BZ['saffron'], stroke=INK, stroke_width=1.8 * s)]
    for k in range(2):
        sx = x - 8 * s + k * 18 * s
        out.append(path(f'M{f(sx)} {f(y-42*s)}q-4 -6 0 -12q4 -6 0 -12', fill='none', stroke='#FFFFFF', stroke_width=2.4 * s, stroke_linecap='round', opacity='.9'))
    return ''.join(out)

def bunting(x1, y1, x2, y2, sag, s, R, n=None):
    """string with triangular flags between two points"""
    L = math.dist((x1, y1), (x2, y2))
    n = n or max(4, int(L / (26 * s)))
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2 + sag
    d = f'M{f(x1)} {f(y1)}Q{f(mx)} {f(my)} {f(x2)} {f(y2)}'
    out = [path(d, fill='none', stroke=INK, stroke_width=2.2 * s)]
    cols = [BZ['rani'], BZ['marigold'], BZ['peacock'], BZ['saffron'], BZ['cilantro'], '#FFFFFF']
    for i in range(1, n):
        t = i / n
        px = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * mx + t * t * x2
        py = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * my + t * t * y2
        fw = 9 * s; fh = 15 * s
        out.append(path(f'M{f(px-fw)} {f(py)}H{f(px+fw)}L{f(px)} {f(py+fh)}Z', fill=cols[i % len(cols)], stroke=INK, stroke_width=1.8 * s, stroke_linejoin='round'))
    return ''.join(out)

def plaque(text, x, y, size=30, rot=-2, fill='#FFFFFF', tcol=INK, accent=BZ['saffron'], sub=None, padx=None):
    w = txtw(text, 'bowlby', size)
    px = padx if padx is not None else size * 0.7
    pw = w + px * 2; ph = size * 1.55 + (size * 0.95 if sub else 0)
    out = [path(rrect_d(x - pw / 2 + 6, y - ph / 2 + 6, pw, ph, 12), fill=INK),
           path(rrect_d(x - pw / 2, y - ph / 2, pw, ph, 12), fill=fill, stroke=INK, stroke_width=4),
           rect(x - pw / 2 + 8, y - ph / 2 + 8, 10, ph - 16, rx=5, fill=accent),
           rect(x + pw / 2 - 18, y - ph / 2 + 8, 10, ph - 16, rx=5, fill=accent),
           txt(text, 'bowlby', size, x, y - ph / 2 + size * 1.2, tcol, anchor='middle')]
    if sub:
        out.append(txt(sub, 'caveat', size * 0.82, x, y - ph / 2 + size * 2.1, BZ['muted'], anchor='middle', wght=700))
    return f'<g transform="rotate({rot} {f(x)} {f(y)})">' + ''.join(out) + '</g>'

def landmark(key, cx, cy, size, plinth=BZ['cream']):
    """dish as a giant monument on a little round plinth"""
    out = [ellipse(cx + 8, cy + size * 0.36, size * 0.5, size * 0.13, fill=INK, opacity='.28'),
           ellipse(cx, cy + size * 0.3, size * 0.46, size * 0.12, fill=plinth, stroke=INK, stroke_width=4),
           embed(DISH[key], cx - size / 2, cy - size / 2, size, size)]
    return ''.join(out)

def compass(cx, cy, r):
    out = [circle(cx + 6, cy + 6, r, fill=INK), circle(cx, cy, r, fill='#FFFFFF', stroke=INK, stroke_width=4),
           circle(cx, cy, r * 0.8, fill='none', stroke=BZ['marigold'], stroke_width=6, stroke_dasharray='4 7')]
    # chilli needle pointing north
    out.append(path(f'M{f(cx)} {f(cy-r*0.72)}C{f(cx+r*0.2)} {f(cy-r*0.4)} {f(cx+r*0.18)} {f(cy+r*0.3)} {f(cx+r*0.04)} {f(cy+r*0.46)}'
                    f'C{f(cx-r*0.06)} {f(cy+r*0.56)} {f(cx-r*0.2)} {f(cy+r*0.4)} {f(cx-r*0.14)} {f(cy+r*0.1)}C{f(cx-r*0.1)} {f(cy-r*0.2)} {f(cx-r*0.06)} {f(cy-r*0.5)} {f(cx)} {f(cy-r*0.72)}Z',
                    fill=BZ['chili'], stroke=INK, stroke_width=3))
    out.append(path(f'M{f(cx+r*0.04)} {f(cy+r*0.46)}q{f(r*0.02)} {f(r*0.16)} {f(r*0.14)} {f(r*0.2)}', fill='none', stroke=BZ['cilantro'], stroke_width=5, stroke_linecap='round'))
    for lab, ang in (('N', -90), ('E', 0), ('S', 90), ('W', 180)):
        a = math.radians(ang)
        out.append(txt(lab, 'bowlby', r * 0.26, cx + r * 0.62 * math.cos(a) + (0 if lab in 'NS' else 0), cy + r * 0.62 * math.sin(a) + r * 0.1, INK, anchor='middle') if lab != 'N' else
                   txt(lab, 'bowlby', r * 0.3, cx, cy - r * 1.08, INK, anchor='middle'))
    return ''.join(out)

def lake(d, R, name=None, name_d=None):
    out = [path(d, fill=BZ['marigold'], stroke=INK, stroke_width=4),
           path(d, fill='#FFC94D', transform='translate(0,0) scale(1)', opacity='.6')]
    return ''.join(out)

def scallop_frame(W, H, m, col, r=14):
    """scalloped Bazaar border around the map"""
    out = []
    n = int((W - 2 * m) / (2 * r))
    rr = (W - 2 * m) / n / 2
    d = f'M{f(m)} {f(m)}'
    for i in range(n): d += f'a{f(rr)} {f(rr)} 0 0 1 {f(2*rr)} 0'
    n2 = int((H - 2 * m) / (2 * r)); rr2 = (H - 2 * m) / n2 / 2
    for i in range(n2): d += f'a{f(rr2)} {f(rr2)} 0 0 1 0 {f(2*rr2)}'
    for i in range(n): d += f'a{f(rr)} {f(rr)} 0 0 1 {f(-2*rr)} 0'
    for i in range(n2): d += f'a{f(rr2)} {f(rr2)} 0 0 1 0 {f(-2*rr2)}'
    return d + 'Z'

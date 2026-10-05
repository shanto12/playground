"""Shared SVG helpers, brand palette, asset embedding."""
import re, os, math, random, json
from typo import F, text_path, text_d, text_on_path, measure
from geo import Path, Poly

OUT = '/home/user/playground/hub/interiors/assets/murals/'
BRAND = '/home/user/playground/brand/'

BZ = dict(ink='#1D1147', cream='#FFF4DC', marigold='#FFB000', saffron='#FF6A13', rani='#E4147E',
          chili='#D62839', peacock='#00A8A0', cilantro='#3FA34D', sky='#7B5CFF', surface2='#FFE7B8', muted='#5B4F85')
RY = dict(ink='#160B26', plum='#4B1D52', emerald='#0F4D3F', peacock='#117C86', ruby='#A3173F',
          gold='#E9A63A', goldlt='#F7D98A', golddk='#B7791F', ivory='#FBF3E4', blush='#F4C9BB', surface2='#F3E4C8', muted='#6B5A73')

def f(v):
    s = f"{v:.2f}".rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s

def attrs(**kw):
    out = []
    for k, v in kw.items():
        if v is None: continue
        k = k.rstrip('_').replace('_', '-')
        if k == 'href': k = 'href'
        out.append(f'{k}="{v}"')
    return ' '.join(out)

def path(d, **kw): return f'<path d="{d}" {attrs(**kw)}/>'
def rect(x, y, w, h, **kw): return f'<rect x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}" {attrs(**kw)}/>'
def circle(cx, cy, r, **kw): return f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(r)}" {attrs(**kw)}/>'
def ellipse(cx, cy, rx, ry, **kw): return f'<ellipse cx="{f(cx)}" cy="{f(cy)}" rx="{f(rx)}" ry="{f(ry)}" {attrs(**kw)}/>'
def g(content, **kw):
    if isinstance(content, (list, tuple)): content = ''.join(content)
    return f'<g {attrs(**kw)}>{content}</g>'
def line(x1, y1, x2, y2, **kw): return f'<line x1="{f(x1)}" y1="{f(y1)}" x2="{f(x2)}" y2="{f(y2)}" {attrs(**kw)}/>'

def txt(text, key, size, x, y, fill, anchor='start', wght=None, tracking=0, skew=0, **kw):
    """outlined text as a path element"""
    p, w = text_path(text, F(key, wght), size, x, y, anchor, tracking, skew)
    return path(p.d(), fill=fill, **kw)

def txtw(text, key, size, wght=None, tracking=0):
    return measure(text, F(key, wght), size, tracking)

def txt_lines(lines, key, size, x, y, fill, lh=1.25, anchor='start', wght=None, tracking=0, **kw):
    out = []
    for i, ln in enumerate(lines):
        out.append(txt(ln, key, size, x, y + i * size * lh, fill, anchor, wght, tracking, **kw))
    return ''.join(out)

def wrap(text, key, size, maxw, wght=None, tracking=0):
    words = text.split(); lines = []; cur = ''
    for w_ in words:
        t = (cur + ' ' + w_).strip()
        if txtw(t, key, size, wght, tracking) <= maxw or not cur: cur = t
        else: lines.append(cur); cur = w_
    if cur: lines.append(cur)
    return lines

def doc(w, h, body, defs='', title='', desc='', px_w=None, px_h=None):
    pw = px_w or w; ph = px_h or h
    return (f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
            f'viewBox="0 0 {f(w)} {f(h)}" width="{f(pw)}" height="{f(ph)}" role="img" aria-labelledby="t">'
            f'<title id="t">{title}</title>' + (f'<desc>{desc}</desc>' if desc else '') +
            f'<defs>{defs}</defs>{body}</svg>')

def save(name, svg):
    with open(OUT + name, 'w') as fh: fh.write(svg)
    return OUT + name

# ---------- embedding sibling brand SVGs (read in place, ids prefixed) ----------
_emb_n = [0]
def embed(relpath, x, y, w, h=None, prefix=None, preserve='xMidYMid meet', extra=''):
    src = open(BRAND + relpath).read()
    vb = re.search(r'viewBox="([^"]+)"', src).group(1)
    vbn = [float(v) for v in vb.replace(',', ' ').split()]
    if h is None: h = w * vbn[3] / vbn[2]
    inner = re.sub(r'^.*?<svg[^>]*>', '', src, count=1, flags=re.S)
    inner = re.sub(r'</svg>\s*$', '', inner.strip())
    inner = re.sub(r'<title[^>]*>.*?</title>', '', inner, flags=re.S)
    inner = re.sub(r'<desc[^>]*>.*?</desc>', '', inner, flags=re.S)
    _emb_n[0] += 1
    p = prefix or f'e{_emb_n[0]}_'
    ids = set(re.findall(r'\bid="([^"]+)"', inner))
    for i in sorted(ids, key=len, reverse=True):
        inner = inner.replace(f'id="{i}"', f'id="{p}{i}"')
        inner = inner.replace(f'url(#{i})', f'url(#{p}{i})')
        inner = inner.replace(f'href="#{i}"', f'href="#{p}{i}"')
        inner = inner.replace(f"url('#{i}')", f"url(#{p}{i})")
        inner = inner.replace(f'aria-labelledby="{i}"', '')
    inner = re.sub(r'\s(role|aria-label|aria-labelledby)="[^"]*"', '', inner)
    return (f'<svg x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}" viewBox="{vb}" '
            f'preserveAspectRatio="{preserve}" overflow="visible" {extra}>{inner}</svg>')

def embed_size(relpath):
    src = open(BRAND + relpath).read()
    vb = re.search(r'viewBox="([^"]+)"', src).group(1)
    return [float(v) for v in vb.replace(',', ' ').split()]

# ---------- small geometry helpers ----------
def star_d(cx, cy, r1, r2, n=4, rot=-90):
    pts = []
    for i in range(n * 2):
        r = r1 if i % 2 == 0 else r2
        a = math.radians(rot + i * 180 / n)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return 'M' + 'L'.join(f'{f(x)} {f(y)}' for x, y in pts) + 'Z'

def sparkle_d(cx, cy, r):
    # four-point curved sparkle
    k = r * 0.18
    return (f'M{f(cx)} {f(cy-r)}Q{f(cx+k)} {f(cy-k)} {f(cx+r)} {f(cy)}Q{f(cx+k)} {f(cy+k)} {f(cx)} {f(cy+r)}'
            f'Q{f(cx-k)} {f(cy+k)} {f(cx-r)} {f(cy)}Q{f(cx-k)} {f(cy-k)} {f(cx)} {f(cy-r)}Z')

def rrect_d(x, y, w, h, r):
    r = min(r, w/2, h/2)
    return (f'M{f(x+r)} {f(y)}H{f(x+w-r)}A{f(r)} {f(r)} 0 0 1 {f(x+w)} {f(y+r)}V{f(y+h-r)}A{f(r)} {f(r)} 0 0 1 {f(x+w-r)} {f(y+h)}'
            f'H{f(x+r)}A{f(r)} {f(r)} 0 0 1 {f(x)} {f(y+h-r)}V{f(y+r)}A{f(r)} {f(r)} 0 0 1 {f(x+r)} {f(y)}Z')

def arch4_d(cx, base, w, h, spring=None, point=0.18):
    """four-centred / ogee-ish pointed arch outline (closed at base): width w, total height h above base"""
    hw = w / 2
    sp = spring if spring is not None else h - hw * (1.0 + point)  # height of springing line
    top = base - h; sy = base - sp
    return (f'M{f(cx-hw)} {f(base)}V{f(sy)}'
            f'C{f(cx-hw)} {f(sy - hw*0.62)} {f(cx - hw*0.42)} {f(top + hw*0.36)} {f(cx)} {f(top)}'
            f'C{f(cx + hw*0.42)} {f(top + hw*0.36)} {f(cx+hw)} {f(sy - hw*0.62)} {f(cx+hw)} {f(sy)}V{f(base)}Z')

def arch4_open(cx, base, w, h, point=0.18):
    hw = w / 2
    sp = h - hw * (1.0 + point)
    top = base - h; sy = base - sp
    return (f'M{f(cx-hw)} {f(base)}V{f(sy)}'
            f'C{f(cx-hw)} {f(sy - hw*0.62)} {f(cx - hw*0.42)} {f(top + hw*0.36)} {f(cx)} {f(top)}'
            f'C{f(cx + hw*0.42)} {f(top + hw*0.36)} {f(cx+hw)} {f(sy - hw*0.62)} {f(cx+hw)} {f(sy)}V{f(base)}')

def rng(seed): return random.Random(seed)

def noise_filter(fid, freq=0.9, opacity=0.08, octaves=2, seed=3, region=None):
    """grain overlay filter (apply to a rect)"""
    return (f'<filter id="{fid}" x="0" y="0" width="100%" height="100%">'
            f'<feTurbulence type="fractalNoise" baseFrequency="{freq}" numOctaves="{octaves}" seed="{seed}" stitchTiles="stitch"/>'
            f'<feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 {opacity*2} -{opacity*0.5}"/></filter>')

def manifest_item(**kw): return kw

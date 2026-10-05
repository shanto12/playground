"""THE GATEWAY — Royal signature mural (9:16 primary, 16:9 panorama)."""
import math
from common import *
from royalkit import *

def cloud_scroll(x, y, w, s=1.0, col=GLT):
    """Mughal-miniature style cloud band: chain of lobes with curled ends (fine gold line + soft fill)"""
    n = max(3, int(w / (46 * s)))
    lw = w / n
    d = f'M{f(x)} {f(y)}'
    for i in range(n):
        r = lw / 2 * (1.0 + 0.25 * math.sin(i * 1.7))
        d += f'A{f(lw/2)} {f(r)} 0 0 1 {f(x + (i+1)*lw)} {f(y)}'
    base = f'M{f(x + w)} {f(y)}C{f(x + w + 26*s)} {f(y + 4*s)} {f(x + w + 26*s)} {f(y + 26*s)} {f(x + w + 6*s)} {f(y + 22*s)}'
    tail = f'M{f(x)} {f(y)}C{f(x - 26*s)} {f(y + 4*s)} {f(x - 26*s)} {f(y + 26*s)} {f(x - 6*s)} {f(y + 22*s)}'
    under = f'M{f(x)} {f(y)}Q{f(x + w/2)} {f(y + 18*s)} {f(x + w)} {f(y)}'
    return (path(d + f'Q{f(x + w/2)} {f(y + 18*s)} {f(x)} {f(y)}Z', fill='#F7D98A', opacity='.16') +
            path(d, fill='none', stroke=col, stroke_width=2.2 * s, stroke_linecap='round') +
            path(base + tail + under, fill='none', stroke=col, stroke_width=2.2 * s, stroke_linecap='round'))

def sky_defs(p, x, y, w, h):
    return (f'<linearGradient id="{p}sky" x1="0" y1="{f(y)}" x2="0" y2="{f(y+h)}" gradientUnits="userSpaceOnUse">'
            f'<stop offset="0" stop-color="#1E0D33"/><stop offset=".22" stop-color="#4B1D52"/><stop offset=".45" stop-color="#8E1C48"/>'
            f'<stop offset=".62" stop-color="#C9423D"/><stop offset=".76" stop-color="#EE8A3C"/><stop offset=".86" stop-color="#F7C566"/><stop offset="1" stop-color="#FBE3A6"/></linearGradient>'
            f'<radialGradient id="{p}sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF6D8"/><stop offset=".6" stop-color="#F7D98A"/><stop offset="1" stop-color="#E9A63A"/></radialGradient>'
            f'<filter id="{p}glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter>'
            f'<filter id="{p}glow2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>'
            f'<filter id="{p}soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>'
            + brass_grad(p + 'brass') + copper_grad(p + 'copper') + foil_grad(p + 'foil')
            + f'<linearGradient id="{p}marble" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF3E4"/><stop offset="1" stop-color="#E8D5B5"/></linearGradient>')

def hills(x, y, w, p):
    out = []
    layers = [('#6B1E4F', 0, 60), ('#4B1D52', 30, 90), ('#2A1240', 70, 140)]
    for col, dy, amp in layers:
        d = f'M{f(x)} {f(y + dy)}'
        n = 6
        for i in range(n):
            x1 = x + w * (i + 0.5) / n; x2 = x + w * (i + 1) / n
            d += f'Q{f(x1)} {f(y + dy - amp * (0.4 + 0.6 * abs(math.sin(i * 2.3 + dy))))} {f(x2)} {f(y + dy)}'
        d += f'V{f(y + 600)}H{f(x)}Z'
        out.append(path(d, fill=col))
    return ''.join(out)

def spice_trail(p, pts, R, scale=1.0):
    out = []
    for i, (x, y, k, sc, rot) in enumerate(pts):
        fn = SPICES[k % len(SPICES)]
        out.append(f'<g transform="translate({f(x)},{f(y)}) rotate({f(rot)})">'
                   f'<circle r="{f(34*sc)}" fill="#F7D98A" opacity=".18" filter="url(#{p}glow2)"/>{fn(sc*scale)}</g>')
    return ''.join(out)

def ember_dots(R, x0, y0, x1, y1, n):
    return ''.join(circle(R.uniform(x0, x1), R.uniform(y0, y1), R.uniform(1.2, 3.2), fill=GLT, opacity=f(R.uniform(.35, .9))) for _ in range(n))

def gateway(p, cx, base, W0, H0, R, show_lantern=True, jali_h=260, vessels=True, scale=1.0, full_jali=False):
    """nested-arch gateway centred at cx, sitting on 'base'. returns (defs, body)"""
    defs = [sky_defs(p, cx - W0 / 2, base - H0, W0, H0)]
    body = []
    insets = [0, 44, 88, 132]
    fills = ['#4B1D52', '#0F4D3F', '#7A1237', '#2E1440']
    for k, (ins, col) in enumerate(zip(insets, fills)):
        d = mughal_arch(cx, base, W0 - 2 * ins * scale, H0 - ins * scale)
        body.append(path(d, fill=col))
        body.append(path(d, fill='none', stroke=GOLD, stroke_width=3 * scale))
        dd = mughal_arch(cx, base, W0 - 2 * ins * scale - 14 * scale, H0 - ins * scale - 9 * scale)
        body.append(path(dd, fill='none', stroke=GLT, stroke_width=1.2 * scale, opacity='.8'))
        if k in (0, 2):
            body.append(beading(mughal_arch_open(cx, base, W0 - 2 * ins * scale - 26 * scale, H0 - ins * scale - 16 * scale), 16 * scale, 2.6 * scale, fill=GLT, opacity=.9))
        if k == 1:
            # tiny lozenges along emerald band
            P = Poly(mughal_arch_open(cx, base, W0 - 2 * ins * scale - 22 * scale, H0 - ins * scale - 14 * scale))
            s_ = 0; dl = []
            while s_ < P.L:
                x, y, a = P.at(s_); q = 6 * scale
                dl.append(f'M{f(x)} {f(y-q)}L{f(x+q*0.7)} {f(y)}L{f(x)} {f(y+q)}L{f(x-q*0.7)} {f(y)}Z')
                s_ += 30 * scale
            body.append(path(''.join(dl), fill=GOLD, opacity='.9'))
    # inner opening: cusped arch with sunset
    iw = W0 - 2 * 176 * scale; ih = H0 - 176 * scale
    inner = cusped_arch(cx, base, iw, ih, n=11, depth=0.44)
    defs.append(f'<clipPath id="{p}in"><path d="{inner}"/></clipPath>')
    top = base - ih
    sky = [rect(cx - iw / 2, top, iw, ih, fill=f'url(#{p}sky)')]
    sun_y = top + ih * 0.50; sun_r = iw * 0.27
    sky.append(circle(cx, sun_y, sun_r * 1.9, fill='#F7C566', opacity='.45', filter=f'url(#{p}glow)'))
    sky.append(circle(cx, sun_y, sun_r, fill=f'url(#{p}sun)'))
    for k in range(3):
        yy = sun_y + sun_r * (0.12 + k * 0.15)
        sky.append(rect(cx - sun_r, yy, sun_r * 2, (4 + k * 2.5) * scale, fill='#F2A541', opacity='.7'))
    sky.append(cloud_scroll(cx - iw * 0.46, top + ih * 0.28, iw * 0.42, 1.0 * scale))
    sky.append(cloud_scroll(cx + iw * 0.06, top + ih * 0.36, iw * 0.38, 0.9 * scale))
    sky.append(cloud_scroll(cx - iw * 0.30, top + ih * 0.44, iw * 0.30, 0.8 * scale))
    hz = sun_y + sun_r * 0.55
    sky.append(rect(cx - iw / 2, hz, iw, ih, fill='#3A1745'))
    sky.append(rect(cx - iw / 2, hz, iw, 3 * scale, fill='#F7D98A', opacity='.9'))
    for k in range(14):
        yy = hz + 10 * scale + k * k * 2.6 * scale
        ww = sun_r * (1.5 - k * 0.07) * (0.7 + 0.3 * math.sin(k * 2.1))
        sky.append(rect(cx - ww / 2 + math.sin(k * 1.3) * 18 * scale, yy, ww, (3 + k * 0.5) * scale, rx=2 * scale, fill='#F7C566', opacity=f(0.75 - k * 0.04)))
    # stars at the top of the arch
    for _ in range(40):
        sx = R.uniform(cx - iw / 2, cx + iw / 2); sy = R.uniform(top, top + ih * 0.2)
        sky.append(circle(sx, sy, R.uniform(0.8, 2.2), fill='#FFF6D8', opacity=f(R.uniform(.4, .9))))
    body.append(f'<g clip-path="url(#{p}in)">{"".join(sky)}</g>')
    body.append(path(inner, fill='none', stroke=GOLD, stroke_width=4 * scale))
    body.append(path(inner, fill='none', stroke=GLT, stroke_width=1.4 * scale, transform=f'translate(0,{f(-7*scale)})', opacity='.7'))
    # jali screen across the lower part of the opening
    if full_jali: jali_h = (ih - 60 * scale) / scale
    jy = base - jali_h * scale - 70 * scale
    jd = rrect_d(cx - iw / 2, jy, iw, jali_h * scale, 0)
    defs.append(jali_mask(p + 'jm', cx - iw / 2, jy, iw, jali_h * scale, cell=46 * scale, hole=0.36, shape_d=jd))
    body.append(f'<g clip-path="url(#{p}in)"><g mask="url(#{p}jm)"><rect x="{f(cx-iw/2)}" y="{f(jy)}" width="{f(iw)}" height="{f(jali_h*scale)}" fill="#2A1240"/>'
                f'<rect x="{f(cx-iw/2)}" y="{f(jy)}" width="{f(iw)}" height="{f(jali_h*scale)}" fill="url(#{p}foil)" opacity=".22"/></g>'
                f'<rect x="{f(cx-iw/2)}" y="{f(jy)}" width="{f(iw)}" height="{f(6*scale)}" fill="url(#{p}foil)"/></g>')
    # ledge
    ly = base - 70 * scale
    body.append(rect(cx - W0 / 2 - 20 * scale, ly, W0 + 40 * scale, 34 * scale, fill=f'url(#{p}marble)'))
    body.append(rect(cx - W0 / 2 - 20 * scale, ly, W0 + 40 * scale, 4 * scale, fill=GOLD))
    body.append(rect(cx - W0 / 2 - 20 * scale, ly + 34 * scale, W0 + 40 * scale, 36 * scale, fill='#22102F'))
    body.append(rect(cx - W0 / 2 - 20 * scale, ly + 34 * scale, W0 + 40 * scale, 3 * scale, fill=GDK))
    # lantern from apex
    if show_lantern:
        defs.append(f'<filter id="{p}lg" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="24"/></filter>')
        body.append(line(cx, top + 8 * scale, cx, top + ih * 0.12, stroke=GOLD, stroke_width=2 * scale))
        body.append(f'<g transform="translate({f(cx)},{f(top + ih*0.12 + 40*scale)})">{lantern(p + "brass", p + "lg", 0.9 * scale)}</g>')
    # steam + spice trail rising from the handi toward the sun
    hx, hy = cx, ly
    steam = []
    if full_jali: steam = None
    for k, dx in enumerate((-40, 0, 40) if steam is not None else ()):
        x0 = hx + dx * scale
        steam.append(path(f'M{f(x0)} {f(hy - 200*scale)}C{f(x0 - 40*scale)} {f(hy - 280*scale)} {f(x0 + 40*scale)} {f(hy - 340*scale)} {f(x0)} {f(hy - 420*scale)}'
                          f'C{f(x0 - 30*scale)} {f(hy - 470*scale)} {f(x0 + 20*scale)} {f(hy - 510*scale)} {f(x0 + 10*scale)} {f(hy - 560*scale)}',
                          fill='none', stroke='#FFF6E8', stroke_width=f(10 * scale), stroke_linecap='round', opacity='.28', filter=f'url(#{p}soft)'))
    if steam: body.append(''.join(steam))
    if not full_jali:
        pts = []
        n = 15
        y0 = hy - 250 * scale; y1 = top + ih * 0.17
        for i in range(n):
            t = i / (n - 1)
            yy = y0 + (y1 - y0) * t
            xx = cx + math.sin(t * math.pi * 1.6 + 0.4) * iw * 0.22 - t * iw * 0.06 + R.uniform(-10, 10) * scale
            pts.append((xx, yy, i, (1.35 - 0.6 * t) * scale, R.uniform(-70, 70)))
        body.append(spice_trail(p, pts, R))
        body.append(ember_dots(R, cx - iw * 0.45, top + ih * 0.15, cx + iw * 0.45, hy - 200 * scale, int(70 * scale)))
    else:
        body.append(ember_dots(R, cx - iw * 0.4, top + ih * 0.2, cx + iw * 0.4, hy - 40 * scale, int(20 * scale)))
    # vessels on the ledge
    if vessels:
        V = [(cx - iw * 0.66, katori_stack, 0.85), (cx - iw * 0.40, kettle, 1.0), (cx + iw * 0.40, tiffin, 0.95), (cx + iw * 0.68, spice_box, 0.7), (cx, handi, 1.1)]
        for x, fn, sc in V:
            g_id = p + ('copper' if fn is handi else 'brass')
            body.append(f'<g transform="translate({f(x)},{f(ly + 8*scale)})">{fn(g_id, sc * scale)}</g>')
    return defs, body

def build_916():
    W, H = 1080, 1920
    R = rng(21); p = 'gw9_'
    defs = []; body = []
    defs.append(f'<linearGradient id="{p}wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1A0C2C"/><stop offset="1" stop-color="#2A1240"/></linearGradient>')
    body.append(rect(0, 0, W, H, fill=f'url(#{p}wall)'))
    # faint lattice on the wall
    lat = []
    for i in range(-20, 40):
        lat.append(f'M{i*60} 0L{i*60 + 1100} 1900M{i*60} 0L{i*60 - 1100} 1900')
    body.append(path(''.join(lat), stroke=GOLD, stroke_width=1, opacity='.07', fill='none'))
    d, b = gateway(p, 540, 1700, 960, 1560, R)
    defs += d; body += b
    # spandrel filigree
    for (x, y, fl) in [(70, 330, False), (1010, 330, True)]:
        body.append(scroll_vine(x, y, 1.15, flip=fl))
    # plinth band with tagline
    body.append(rect(0, 1770, W, 150, fill='#0F4D3F'))
    body.append(rect(0, 1770, W, 4, fill=GOLD)); body.append(rect(0, 1782, W, 1.5, fill=GLT, opacity='.7'))
    body.append(txt('Slow-simmered. Tandoor-fired. Made for sharing.', 'fraunces-i', 40, 540, 1856, GLT, anchor='middle', wght=400))
    for x in (60, 1020):
        body.append(path(f'M{x} 1832l12 16l-12 16l-12 -16z', fill=GOLD))
    save('ry-gateway-9x16.svg', doc(W, H, ''.join(body), ''.join(defs), title='The Gateway — Royal mural, 9:16'))

def build_169():
    W, H = 1920, 1080
    R = rng(31); p = 'gw16_'
    defs = []; body = []
    defs.append(f'<linearGradient id="{p}wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1A0C2C"/><stop offset="1" stop-color="#2A1240"/></linearGradient>')
    body.append(rect(0, 0, W, H, fill=f'url(#{p}wall)'))
    lat = []
    for i in range(-20, 60):
        lat.append(f'M{i*60} 0L{i*60 + 620} 1080M{i*60} 0L{i*60 - 620} 1080')
    body.append(path(''.join(lat), stroke=GOLD, stroke_width=1, opacity='.07', fill='none'))
    # flanking smaller gateways
    for k, cxx in enumerate((330, 1590)):
        d, b = gateway(f'{p}s{k}_', cxx, 960, 440, 700, rng(40 + k), show_lantern=False, jali_h=200, vessels=False, scale=0.62, full_jali=True)
        defs += d; body += b
    d, b = gateway(p + 'c_', 960, 960, 760, 940, R, scale=0.82, jali_h=230)
    defs += d; body += b
    for (x, y, fl) in [(560, 150, True), (1360, 150, False), (40, 120, False), (1880, 120, True)]:
        body.append(scroll_vine(x, y, 0.9, flip=fl))
    # flanking vessels on the side ledges
    for x, fn, sc in [(250, kettle, 0.8), (410, katori_stack, 0.7), (1510, tiffin, 0.8), (1680, spice_box, 0.6)]:
        body.append(f'<g transform="translate({f(x)},{f(960 - 70*0.62 + 6)})">{fn(p + "c_brass", sc)}</g>')
    body.append(rect(0, 980, W, 100, fill='#0F4D3F'))
    body.append(rect(0, 980, W, 4, fill=GOLD)); body.append(rect(0, 990, W, 1.5, fill=GLT, opacity='.7'))
    body.append(txt('Slow-simmered. Tandoor-fired. Made for sharing.', 'fraunces-i', 36, 960, 1044, GLT, anchor='middle', wght=400))
    save('ry-gateway-16x9.svg', doc(W, H, ''.join(body), ''.join(defs), title='The Gateway — Royal mural, 16:9'))

if __name__ == '__main__':
    build_916(); build_169()

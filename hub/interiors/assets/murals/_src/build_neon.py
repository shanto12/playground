"""Neon & light signs, both directions. Each scene: true-scale wall (brick or limewash plaster), tubes with
layered glow, wall light-spill (tinted lit copy of the wall through a blurred mask), backer, hardware,
dimension lines and a spec card. Also flicker-hint frame sheets."""
import sys, math, json
from common import *
from neon import *

W, H = 1200, 1500

# ------------------------------------------------------------------ helpers
def bbox_all(groups):
    xs0, ys0, xs1, ys1 = [], [], [], []
    for pcs, _ in groups:
        for p in pcs:
            b = p.bbox(); xs0.append(b[0]); ys0.append(b[1]); xs1.append(b[2]); ys1.append(b[3])
    return min(xs0), min(ys0), max(xs1), max(ys1)

def fit(groups, cx, cy, maxw, maxh):
    x0, y0, x1, y1 = bbox_all(groups)
    s = min(maxw / (x1 - x0), maxh / (y1 - y0))
    tx = cx - (x0 + x1) / 2 * s; ty = cy - (y0 + y1) / 2 * s
    out = [([p.transform(s, 0, 0, s, tx, ty) for p in pcs], col) for pcs, col in groups]
    return out, s

def bowlby_outline(text, size, x=0, y=0, anchor='start', tracking=0.0):
    p, w = text_path(text, F('bowlby'), size, x, y, anchor, tracking)
    return [Path([c]) for c in p.contours], w

def scallop_arch(cx, base, w, h, n=7, depth=0.55):
    """cusped (scalloped) round-headed arch: jambs + n inward scallops along a semicircular head"""
    hw = w / 2
    sy = base - (h - hw)
    pts = [(cx + hw * math.cos(math.pi + math.pi * i / n), sy + hw * math.sin(math.pi + math.pi * i / n)) for i in range(n + 1)]
    d = f'M{f(cx-hw)} {f(base)}V{f(sy)}'
    for i in range(n):
        (x1, y1), (x2, y2) = pts[i], pts[i + 1]
        ch = math.dist((x1, y1), (x2, y2))
        r = ch / 2 / depth
        d += f'A{f(r)} {f(r)} 0 0 0 {f(x2)} {f(y2)}'
    d += f'V{f(base)}'
    return d

def spec_card(lines, title, direction, y0=1148, x0=60, w=1080):
    """bottom spec card, outlined text, legible on a phone (title 46px / body 32px at 1200 wide)"""
    if direction == 'bazaar':
        tkey, twg, bkey, bw = 'bowlby', None, 'dmsans', 500
        acc = BZ['marigold']; fg = BZ['cream']; bg = '#140C33'
    else:
        tkey, twg, bkey, bw = 'fraunces', 600, 'hanken', 500
        acc = RY['gold']; fg = RY['ivory']; bg = '#12091F'
    h = 1500 - y0 - 44
    out = [path(rrect_d(x0, y0, w, h, 26), fill=bg, fill_opacity='.86', stroke=acc, stroke_opacity='.55', stroke_width=2)]
    out.append(txt(title, tkey, 44 if direction == 'bazaar' else 50, x0 + 40, y0 + 70, acc, wght=twg))
    yy = y0 + 128
    for ln in lines:
        out.append(txt(ln, bkey, 31, x0 + 40, yy, fg, wght=bw))
        yy += 45
    return ''.join(out)

def scene(sid, direction, groups, real_w_in, tube_mm=8, wall='brick', wall_base=None, mortar=None,
          sign_c=(600, 600), max_wh=(940, 760), title='', spec=None, lit=None, counter=None, extras_front='',
          card=True, ret_parts=False, size=(W, H), seed=7, annotate=True, wallgain=4.2, prefix=None):
    W_, H_ = size
    p = prefix or (sid.replace('-', '') + '_')
    groups, s = fit(groups, sign_c[0], sign_c[1], max_wh[0], max_wh[1])
    x0, y0, x1, y1 = bbox_all(groups)
    ppi = (x1 - x0) / real_w_in
    tw = tube_mm / 25.4 * ppi
    real_h_in = (y1 - y0) / ppi
    defs = [neon_filters(p, tw, W_, H_)]
    body = []
    # ---- wall
    if wall == 'brick':
        wallsvg = brick_wall(W_, H_, ppi, base=wall_base or '#251B50', mortar=mortar or '#130D2E', seed=seed, gid=p + 'wall')
    else:
        wallsvg = plaster_wall(W_, H_, wall_base or '#24112F', gid=p + 'wall', seed=seed)
    defs.append(wallsvg)
    body.append(f'<use href="#{p}wall"/>')
    # ---- light spill: one tinted lit wall copy per colour group, masked by blurred tube shapes
    cols = {}
    for i, (pcs, col) in enumerate(groups):
        lv = 1.0 if lit is None else lit[i]
        if lv <= 0.02: continue
        cols.setdefault(col, []).extend(pcs)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    ranked = sorted(cols.items(), key=lambda kv: -sum(pp.length() for pp in kv[1]))[:2]
    cols = dict(ranked)
    for k, (col, pcs) in enumerate(cols.items()):
        q = f'{p}c{k}'
        defs.append(neon_filters(q, tw, W_, H_))
        mean_lit = 1.0 if lit is None else max(l for (pc, c), l in zip(groups, lit) if c == col)
        defs.append(wall_light_mask(q, pcs, tw, W_, H_, cx, cy + tw * 4, (x1 - x0) * 0.75, (y1 - y0) * 0.95, strength=mean_lit / max(1, len(cols) ** 0.5)))
        defs.append(tint_filter(q + 'tint', TUBE[col], gain=wallgain))
        body.append(f'<g mask="url(#{q}lm)" style="mix-blend-mode:screen"><use href="#{p}wall" filter="url(#{q}tint)"/></g>')
    # ---- backer panel (contour-ish rounded rect) + standoffs
    pad = tw * 7
    bd = rrect_d(x0 - pad, y0 - pad, (x1 - x0) + 2 * pad, (y1 - y0) + 2 * pad, tw * 4)
    body.append(backer(bd, p))
    for (sx, sy) in [(x0 - pad + tw * 2.6, y0 - pad + tw * 2.6), (x1 + pad - tw * 2.6, y0 - pad + tw * 2.6),
                     (x0 - pad + tw * 2.6, y1 + pad - tw * 2.6), (x1 + pad - tw * 2.6, y1 + pad - tw * 2.6)]:
        body.append(standoff(sx, sy, r=max(5, tw * 0.9)))
    # power lead
    body.append(path(f'M{f(x1 + pad - tw*6)} {f(y1 + pad)}C{f(x1 + pad - tw*6)} {f(y1 + pad + 60)} {f(x1 + pad + 30)} {f(y1 + pad + 40)} {f(x1 + pad + 36)} {f(H_)}',
                     fill='none', stroke='#0A0614', stroke_width=max(3, tw * 0.5), stroke_opacity='.9'))
    # ---- tubes
    for i, (pcs, col) in enumerate(groups):
        lv = 1.0 if lit is None else lit[i]
        body.append(tube(pcs, TUBE[col], tw, p, lit=lv))
    # ---- counter with reflection
    if counter:
        body.append(counter(p, groups, tw, lit))
    body.append(extras_front)
    # vignette
    defs.append(f'<radialGradient id="{p}vig" cx=".5" cy=".42" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>')
    body.append(rect(0, 0, W_, H_, fill=f'url(#{p}vig)'))
    # ---- dimension annotations
    allp = [pp for pcs, _ in groups for pp in pcs]
    tl = tube_len_ft(allp, ppi)
    if annotate:
        ac = '#FFF4DC' if direction == 'bazaar' else '#FBF3E4'
        key = 'dmsans' if direction == 'bazaar' else 'hanken'
        body.append(g(dim_h(x0 - pad, x1 + pad, y0 - pad - 48, f'~{round((x1 - x0 + 2*pad)/ppi)} in', color=ac, key=key, size=28), opacity='.78'))
        vx = x0 - pad - 40
        if vx < 34: vx = x1 + pad + 40
        if vx > W_ - 34: vx = None
        if vx: body.append(g(dim_v(vx, y0 - pad, y1 + pad, f'~{round((y1 - y0 + 2*pad)/ppi)} in', color=ac, key=key, size=28), opacity='.78'))
    meta = dict(w_in=round((x1 - x0 + 2 * pad) / ppi), h_in=round((y1 - y0 + 2 * pad) / ppi), tube_ft=tl, ppi=ppi, tw=tw)
    if card and spec:
        body.append(spec_card(spec(meta), title, direction))
    if ret_parts:
        return defs, body, meta
    return doc(W_, H_, ''.join(body), ''.join(defs), title=title), meta

def budget(w_in):
    if w_in <= 30: return '$180–500'
    if w_in <= 48: return '$400–1,200'
    return '$900–3,000+'

def std_spec(colours, mm=8, extra=None):
    def fn(m):
        L = [f'Approx. {m["w_in"]} × {m["h_in"]} in on clear acrylic, contour-cut',
             f'{mm} mm LED neon flex · {colours}',
             f'Tube length ~{round(m["tube_ft"])} ft (approx., from artwork)',
             f'Budget ~{budget(m["w_in"])} · 2–4 wks (research, approx.)']
        if extra: L[1] = extra
        return L
    return fn

# ------------------------------------------------------------------ BAZAAR artwork
def art_bz_wordmark():
    curry, w = bowlby_outline('CURRY', 200, 0, 0, 'middle', tracking=0.02)
    # street-sign plate
    plate = Path.parse(rrect_d(-330, 50, 660, 150, 30))
    plate_in = Path.parse(rrect_d(-310, 68, 620, 114, 18))
    dist, _ = set_mono('DISTRICT', CAPS, 72, 0, 161, tracking=34, anchor='middle')
    spark = [Path.parse('M-420 -200l0 0'), ]
    s1 = Path.parse(sparkle_d(-470, -170, 34)); s2 = Path.parse(sparkle_d(470, -60, 26)); s3 = Path.parse(sparkle_d(430, -210, 16))
    return [(curry, 'marigold'), ([plate], 'aqua'), (dist, 'warm'), ([s1, s2, s3], 'rani')]

def art_bz_emblem():
    out = []
    # gate: outer round-headed arch + inner cusped arch
    outer = Path.parse('M-150 150V-40A150 150 0 0 1 150 -40V150')
    inner = Path.parse(scallop_arch(0, 150, 236, 300, n=7, depth=0.5))
    # sun: half ring + rays
    sun = Path.parse('M-92 40A92 92 0 0 1 92 40')
    rays = []
    for i in range(7):
        a = math.radians(180 + 22.5 + i * 22.5)
        rays.append(Path.parse(f'M{f(118*math.cos(a))} {f(40+118*math.sin(a))}L{f(138*math.cos(a))} {f(40+138*math.sin(a))}'))
    # steam
    steam = [Path.parse(f'M{x} 34C{x-14} 14 {x+14} -4 {x} -24C{x-12} -40 {x+8} -52 {x} -62') for x in (-34, 0, 34)]
    # bowl
    bowl = Path.parse('M-128 48H128C122 104 72 140 0 140C-72 140 -122 104 -128 48Z')
    foot = Path.parse('M-44 150H44')
    bunt = Path.parse('M-104 66L-86 90L-68 66L-50 90L-32 66L-14 90L4 66L22 90L40 66L58 90L76 66L94 90L104 74')
    return [([outer], 'saffron'), ([inner], 'marigold'), ([sun], 'marigold'), (steam, 'warm'), ([bowl, foot], 'rani'), ([bunt], 'aqua')]

def art_bz_chai():
    chai, cw = set_mono('Chai', SCRIPT, 150, 0, 0, tracking=10, slant=11)
    time, _ = set_mono('Time', SCRIPT, 150, 110, 330, tracking=10, slant=11)
    # cutting-chai glass (tapered, faceted) with liquid line + steam
    gx, gy = cw + 150, 0
    glass = Path.parse(f'M{gx-62} {gy-150}L{gx-46} {gy}H{gx+46}L{gx+62} {gy-150}')
    rim = Path.parse(f'M{gx-62} {gy-150}H{gx+62}')
    liquid = Path.parse(f'M{gx-57} {gy-112}C{gx-30} {gy-122} {gx+20} {gy-102} {gx+57} {gy-112}')
    facets = [Path.parse(f'M{gx+xx} {gy-92}L{gx+xx*0.86} {gy-18}') for xx in (-22, 0, 22)]
    steam = [Path.parse(f'M{gx+x} {gy-176}C{gx+x-16} {gy-200} {gx+x+16} {gy-222} {gx+x} {gy-248}C{gx+x-12} {gy-266} {gx+x+6} {gy-278} {gx+x} {gy-290}') for x in (-24, 22)]
    under = Path.parse('M120 390C300 420 520 404 700 372')
    return [(chai, 'marigold'), (time, 'marigold'), ([glass, rim], 'aqua'), ([liquid] + facets, 'saffron'), (steam, 'warm'), ([under], 'rani')]

def art_bz_naan():
    naan_t, w1 = bowlby_outline('NAAN', 170, 0, 0, 'start', tracking=0.03)
    stop_t, w2 = bowlby_outline('STOP', 170, 40, 190, 'start', tracking=0.03)
    naan_t = [p.rotate(-4, 0, 0) for p in naan_t]; stop_t = [p.rotate(-4, 0, 0) for p in stop_t]
    # naan: teardrop with bubbles, to the left, tilted
    tear = 'M0 -190C34 -140 112 -40 112 52C112 128 62 176 0 176C-62 176 -112 128 -112 52C-112 -40 -34 -140 0 -190Z'
    rot = lambda P: P.rotate(32, 0, 0).translate(-170, 30)
    nd = rot(Path.parse(tear))
    blobs = [(-30, -40, 15, 10), (34, 10, 20, 13), (-46, 70, 13, 9), (10, 110, 16, 11), (40, 82, 9, 7), (-10, -100, 9, 7)]
    bub = [rot(Path.parse(f'M{x+rx} {y}A{rx} {ry} 0 1 0 {x-rx} {y}A{rx} {ry} 0 1 0 {x+rx} {y}Z').rotate(25, x, y)) for (x, y, rx, ry) in blobs]
    arrow = Path.parse('M150 -230C250 -290 420 -280 520 -200')
    return [(naan_t, 'marigold'), (stop_t, 'rani'), ([nd], 'saffron'), (bub, 'saffron')]

def art_bz_order():
    t1, w = set_mono('ORDER HERE', CAPS, 120, 0, 0, tracking=34, anchor='middle')
    # bent arrow from right end down to the counter
    e = w / 2
    arr = Path.parse(f'M{f(e+40)} -60C{f(e+150)} -60 {f(e+190)} 40 {f(e+160)} 190')
    head = Path.parse(f'M{f(e+112)} 150L{f(e+160)} 196L{f(e+200)} 140')
    sm, _ = set_mono('fresh off the tandoor', SCRIPT, 0.01, 0, 0) if False else ([], 0)
    return [(t1, 'aqua'), ([arr, head], 'marigold')]

# ------------------------------------------------------------------ ROYAL artwork
def lozenge(cx, cy, r):
    return Path.parse(f'M{f(cx)} {f(cy-r)}L{f(cx+r*0.7)} {f(cy)}L{f(cx)} {f(cy+r)}L{f(cx-r*0.7)} {f(cy)}Z')

def art_ry_wordmark():
    p, w = text_path('Curry', F('fraunces', 700), 300, 0, 0, 'middle', tracking=0.0)
    curry = [Path([c]) for c in p.contours]
    dist, w2 = set_mono('DISTRICT', CAPS, 52, 0, 190, tracking=56, anchor='middle')
    lz = [lozenge(-w2 / 2 - 60, 164, 20), lozenge(w2 / 2 + 60, 164, 20)]
    rule = [Path.parse(f'M{f(-w2/2-160)} 164H{f(-w2/2-100)}'), Path.parse(f'M{f(w2/2+100)} 164H{f(w2/2+160)}')]
    return [(curry, 'gold'), (dist, 'warm'), (lz, 'ruby'), (rule, 'gold')]

def art_ry_emblem():
    outer = Path.parse(arch4_open(0, 200, 300, 470, point=0.22))
    inner = Path.parse(arch4_open(0, 200, 240, 400, point=0.22))
    # handi: rim, neck, round belly, foot
    handi = Path.parse('M-58 -10H58M-48 -10C-48 8 -40 14 -60 30C-100 62 -104 128 -64 160C-40 180 40 180 64 160C104 128 100 62 60 30C40 14 48 8 48 -10')
    band = Path.parse('M-92 92C-40 104 40 104 92 92')
    foot = Path.parse('M-40 176L-48 200H48L40 176')
    steam = [Path.parse(f'M{x} -26C{x-16} -50 {x+16} -72 {x} -98C{x-12} -116 {x+8} -128 {x} -140') for x in (-30, 0, 30)]
    apex = [lozenge(0, -232, 18)]
    plinth = Path.parse('M-190 200H190')
    return [([outer, plinth], 'gold'), ([inner], 'ruby'), ([handi, band, foot], 'gold'), (steam, 'warm'), (apex, 'ruby')]

def art_ry_chai():
    chai, w = set_mono('Chai Time', SCRIPT, 160, 0, 0, tracking=12, slant=9, anchor='middle')
    # brass chai kettle centred above the script: belly, lid + knob, side handle, swan spout, steam
    kx, ky = 0, -330
    sc = 1.0
    body = Path.parse(f'M{kx-96} {ky}C{kx-120} {ky-60} {kx-80} {ky-128} {kx} {ky-128}C{kx+80} {ky-128} {kx+120} {ky-60} {kx+96} {ky}Z')
    lid = Path.parse(f'M{kx-50} {ky-128}C{kx-44} {ky-160} {kx+44} {ky-160} {kx+50} {ky-128}')
    knob = Path.parse(f'M{kx} {ky-156}V{ky-176}')
    handle = Path.parse(f'M{kx-104} {ky-84}C{kx-170} {ky-96} {kx-176} {ky-20} {kx-108} {ky-24}')
    spout = Path.parse(f'M{kx+104} {ky-40}C{kx+150} {ky-44} {kx+150} {ky-96} {kx+196} {ky-126}')
    band = Path.parse(f'M{kx-104} {ky-42}C{kx-40} {ky-30} {kx+40} {ky-30} {kx+104} {ky-42}')
    steam = [Path.parse(f'M{kx+212} {ky-146}C{kx+196} {ky-170} {kx+226} {ky-192} {kx+210} {ky-220}C{kx+200} {ky-238} {kx+218} {ky-250} {kx+212} {ky-264}')]
    lz = [lozenge(-w / 2 - 50, -70, 16), lozenge(w / 2 + 40, -70, 16)]
    K = lambda P: P.transform(1.5, 0, 0, 1.5, -0.5 * kx, -0.5 * (ky - 40) - 60)
    body, lid, knob, handle, spout, band = [K(P) for P in (body, lid, knob, handle, spout, band)]
    steam = [K(P) for P in steam]
    return [(chai, 'gold'), ([body, lid, knob, handle, spout], 'gold'), ([band], 'ruby'), (steam, 'warm'), (lz, 'ruby')]

def art_ry_slow():
    t1, w1 = set_mono('Slow-', SCRIPT, 170, -40, 0, tracking=10, slant=9, anchor='end')
    t2, w2 = set_mono('simmered', SCRIPT, 170, -300, 300, tracking=10, slant=9, anchor='start')
    x2 = -300 + w2
    sw = Path.parse(f'M{f(-260)} 390C{f(-60)} 430 {f(x2-260)} 360 {f(x2+10)} 400')
    lz = [lozenge(x2 + 50, 404, 16)]
    # three steam ribbons rising over "Slow-"
    steam = [Path.parse(f'M{x} -250C{x-18} -280 {x+18} -306 {x} -336C{x-14} -356 {x+8} -370 {x} -384') for x in (60, 110, 160)]
    return [(t1 + t2, 'gold'), ([sw], 'ruby'), (lz, 'ruby')]

def art_ry_order():
    t, w = set_mono('Order here', SCRIPT, 170, 0, 0, tracking=12, slant=9, anchor='middle')
    arr = Path.parse(f'M{f(w/2+20)} -120C{f(w/2+150)} -110 {f(w/2+170)} 40 {f(w/2+90)} 150')
    head = Path.parse(f'M{f(w/2+70)} 96L{f(w/2+86)} 156L{f(w/2+140)} 128')
    lz = [lozenge(-w / 2 - 50, -50, 16)]
    return [(t, 'gold'), ([arr, head], 'ruby'), (lz, 'ruby')]

# ------------------------------------------------------------------ counters (with mirror reflection of the sign)
def counter_bz(p, groups, tw, lit):
    top = 1040
    out = []
    # counter front: teal cement tiles with ink grout
    out.append(rect(0, top, W, H - top, fill='#0E5E5A'))
    for i in range(0, W, 120):
        for j in range(top + 40, H, 120):
            out.append(path(f'M{i+60} {j}l60 60l-60 60l-60 -60z', fill='none', stroke='#0A3F3D', stroke_width=3))
            out.append(circle(i + 60, j + 60, 10, fill='#FFB000', fill_opacity='.35'))
    # top slab: polished terrazzo with reflection
    out.append(rect(0, top - 6, W, 46, fill='#EADBC0'))
    for k in range(160):
        rr = rng(k)
        out.append(circle(rr.random() * W, top + rr.random() * 38 - 4, 1.5 + rr.random() * 3, fill=['#FF6A13', '#1D1147', '#00A8A0', '#E4147E'][k % 4], fill_opacity='.55'))
    out.append(rect(0, top + 40, W, 8, fill='#000', fill_opacity='.35'))
    # glow pooling on the counter top
    for i, (pcs, col) in enumerate(groups):
        lv = 1.0 if lit is None else lit[i]
        out.append(ellipse(600, top + 16, 520, 26, fill=TUBE[col], fill_opacity=f(0.22 * lv), filter=f'url(#{p}b2)', style='mix-blend-mode:screen'))
    return ''.join(out)

def counter_ry(p, groups, tw, lit):
    top = 1040
    out = [rect(0, top, W, H - top, fill='#1A0E24')]
    # fluted panel front
    for i in range(0, W, 40):
        out.append(rect(i, top + 44, 24, H - top, fill='#2A1638'))
        out.append(rect(i + 2, top + 44, 6, H - top, fill='#3A2050', fill_opacity='.6'))
    out.append(f'<linearGradient id="{p}brass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B7791F"/><stop offset=".4" stop-color="#F7D98A"/><stop offset=".6" stop-color="#E9A63A"/><stop offset="1" stop-color="#B7791F"/></linearGradient>')
    out.append(rect(0, top - 6, W, 50, fill=f'url(#{p}brass)'))
    out.append(rect(0, top + 40, W, 8, fill='#000', fill_opacity='.4'))
    for i, (pcs, col) in enumerate(groups):
        lv = 1.0 if lit is None else lit[i]
        out.append(ellipse(600, top + 14, 520, 24, fill=TUBE[col], fill_opacity=f(0.25 * lv), filter=f'url(#{p}b2)', style='mix-blend-mode:screen'))
    return ''.join(out)

# ------------------------------------------------------------------ item table
BZWALL = dict(wall='brick', wall_base='#211848', mortar='#0E0924')
RYWALL = dict(wall='plaster', wall_base='#2B1236')
RYWALL_EM = dict(wall='plaster', wall_base='#0F3A31')

SIGNS = {
    'bz-neon-wordmark': dict(direction='bazaar', art=art_bz_wordmark, real=48, title='Wordmark neon · Bazaar',
                             spec=std_spec('marigold, aqua, warm white, rani'), **BZWALL),
    'bz-neon-emblem': dict(direction='bazaar', art=art_bz_emblem, real=30, title='Emblem neon · Bazaar', max_wh=(760, 720),
                           spec=std_spec('saffron, marigold, rani, aqua, warm white'), **BZWALL),
    'bz-neon-chai-time': dict(direction='bazaar', art=art_bz_chai, real=36, title='“Chai Time” neon · Bazaar',
                              spec=std_spec('marigold, aqua, saffron, rani, warm white'), **BZWALL),
    'bz-neon-naan-stop': dict(direction='bazaar', art=art_bz_naan, real=36, title='“Naan Stop” neon · Bazaar',
                              spec=std_spec('marigold, rani, saffron'), **BZWALL),
    'bz-neon-order-here': dict(direction='bazaar', art=art_bz_order, real=44, title='“Order here” · counter neon', sign_c=(600, 700), max_wh=(940, 520),
                               spec=std_spec('aqua + marigold'), counter=counter_bz, **BZWALL),
    'ry-neon-wordmark': dict(direction='royal', art=art_ry_wordmark, real=48, title='Wordmark neon · Royal', tube_mm=6,
                             spec=std_spec('gold, warm white, ruby', mm=6), **RYWALL),
    'ry-neon-emblem': dict(direction='royal', art=art_ry_emblem, real=30, title='Emblem neon · Royal', tube_mm=6, max_wh=(700, 760),
                           spec=std_spec('gold, ruby, warm white', mm=6), **RYWALL),
    'ry-neon-chai-time': dict(direction='royal', art=art_ry_chai, real=36, title='“Chai Time” neon · Royal', tube_mm=6,
                              spec=std_spec('gold, warm white, ruby', mm=6), **RYWALL_EM),
    'ry-neon-slow-simmered': dict(direction='royal', art=art_ry_slow, real=48, title='“Slow-simmered” script neon', tube_mm=6,
                                  spec=std_spec('gold + ruby', mm=6), **RYWALL_EM),
    'ry-neon-order-here': dict(direction='royal', art=art_ry_order, real=44, title='“Order here” · counter neon', tube_mm=6, sign_c=(600, 720), max_wh=(940, 480),
                               spec=std_spec('gold + ruby', mm=6), counter=counter_ry, **RYWALL),
}

def build_sign(sid):
    cfg = dict(SIGNS[sid]); art = cfg.pop('art'); real = cfg.pop('real')
    svg, meta = scene(sid, groups=art(), real_w_in=real, **cfg)
    save(sid + '.svg', svg)
    return meta

def build_flicker(sid, src, frames):
    cfg = dict(SIGNS[src]); art = cfg.pop('art'); real = cfg.pop('real'); direction = cfg['direction']
    cfg.pop('spec', None); cfg.pop('title', None); cfg.pop('counter', None)
    groups = art()
    n = len(groups)
    cw, ch = 560, 520
    defs = []; body = []
    bg = BZ['ink'] if direction == 'bazaar' else RY['ink']
    acc = BZ['marigold'] if direction == 'bazaar' else RY['gold']
    fg = BZ['cream'] if direction == 'bazaar' else RY['ivory']
    body.append(rect(0, 0, W, H, fill=bg))
    tkey, twg = ('bowlby', None) if direction == 'bazaar' else ('fraunces', 600)
    bkey = 'dmsans' if direction == 'bazaar' else 'hanken'
    body.append(txt('Flicker-hint frames', tkey, 50 if direction == 'bazaar' else 58, 60, 104, acc, wght=twg))
    body.append(txt('Power-on “strike” sequence for a reel or the opening shot', bkey, 30, 60, 152, fg, wght=500))
    for k, (label, lit) in enumerate(frames):
        cx = 40 + (k % 2) * (cw + 40); cy = 200 + (k // 2) * (ch + 110)
        kw = {k2: v for k2, v in cfg.items() if k2 in ('wall', 'wall_base', 'mortar', 'tube_mm')}
        d, b, meta = scene(f'{sid}{k}', direction, [(list(pcs), c) for pcs, c in groups], real, lit=lit, size=(cw, ch),
                           sign_c=(cw / 2, ch / 2), max_wh=(cw * 0.78, ch * 0.7), card=False, ret_parts=True, annotate=False,
                           prefix=f'{sid.replace("-", "")}{k}_', **kw)
        defs += d
        body.append(f'<svg x="{cx}" y="{cy}" width="{cw}" height="{ch}" viewBox="0 0 {cw} {ch}" overflow="hidden">{"".join(b)}</svg>')
        body.append(path(rrect_d(cx, cy, cw, ch, 18), fill='none', stroke=acc, stroke_opacity='.4', stroke_width=2))
        body.append(txt(label, bkey, 30, cx + 6, cy + ch + 50, fg, wght=600))
    body.append(txt('Tip: shoot at 1/50 s so the LED driver does not band; dim to ~70% for camera.', bkey, 27, 60, 1458, fg, wght=400, opacity='.8'))
    save(sid + '.svg', doc(W, H, ''.join(body), ''.join(defs), title='Flicker-hint frames'))

if __name__ == '__main__':
    which = sys.argv[1:] or list(SIGNS)
    metas = {}
    for sid in which:
        if sid in SIGNS:
            metas[sid] = build_sign(sid)
            print(sid, {k: round(v, 1) for k, v in metas[sid].items()})
    if 'flicker' in which or not sys.argv[1:]:
        # Bazaar: Chai Time strike; Royal: Slow-simmered strike
        bzf = [('0.00 s · off (tubes visible)', [0, 0, 0, 0, 0, 0]), ('0.12 s · strike — glass first', [0, 0, 1, 0.6, 0, 0]),
               ('0.30 s · “Chai” catches, “Time” flutters', [1, 0.35, 1, 1, 0.5, 0]), ('steady · full glow', [1, 1, 1, 1, 1, 1])]
        build_flicker('bz-neon-flicker', 'bz-neon-chai-time', bzf)
        ryf = [('0.00 s · off (tubes visible)', [0, 0, 0]), ('0.15 s · strike — swash first', [0, 1, 0.5]),
               ('0.35 s · script flutters on', [0.4, 1, 1]), ('steady · full glow', [1, 1, 1])]
        build_flicker('ry-neon-flicker', 'ry-neon-slow-simmered', ryf)

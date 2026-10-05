"""Vector prop + food textures (top views, mm) used inside the 3D mockups."""
import math, random
from lib import *
from faces import Face, full, bz_ground, ry_jali, ry_foil, rrect, bz_shadowed, ry_diamond

def lime_cut():
    d = 48; c = d / 2
    f = Face('prop-lime-cut', d, d, 'disc')
    f.add(f'<circle cx="{c}" cy="{c}" r="{c}" fill="#5E9A22"/>')
    f.add(f'<circle cx="{c}" cy="{c}" r="{c - 1.6}" fill="#E9F2C4"/>')
    f.d('<radialGradient id="lj" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#F1F7C8"/><stop offset=".7" stop-color="#C9DE6A"/><stop offset="1" stop-color="#A9C84A"/></radialGradient>')
    n = 9
    for i in range(n):
        a0 = 2 * math.pi * i / n + .05; a1 = 2 * math.pi * (i + 1) / n - .05
        r0, r1 = 2.2, c - 3.4
        p = (f'M{fmt(c + r0 * math.cos((a0 + a1) / 2))} {fmt(c + r0 * math.sin((a0 + a1) / 2))}'
             f'L{fmt(c + r1 * math.cos(a0))} {fmt(c + r1 * math.sin(a0))}'
             f'A{fmt(r1)} {fmt(r1)} 0 0 1 {fmt(c + r1 * math.cos(a1))} {fmt(c + r1 * math.sin(a1))}Z')
        f.add(f'<path d="{p}" fill="url(#lj)" stroke="#F4F8DA" stroke-width=".35" stroke-linejoin="round"/>')
        rnd = random.Random(i)
        for k in range(10):
            rr = rnd.uniform(4, c - 5); aa = rnd.uniform(a0 + .08, a1 - .08)
            f.add(f'<ellipse cx="{fmt(c + rr * math.cos(aa))}" cy="{fmt(c + rr * math.sin(aa))}" rx=".5" ry="1.6" transform="rotate({fmt(math.degrees(aa) + 90)} {fmt(c + rr * math.cos(aa))} {fmt(c + rr * math.sin(aa))})" fill="#fff" opacity=".35"/>')
    f.add(f'<circle cx="{c}" cy="{c}" r="1.8" fill="#F4F8DA"/>')
    f.add(f'<ellipse cx="{c - 6}" cy="{c - 7}" rx="9" ry="4" fill="#fff" opacity=".18" transform="rotate(-35 {c - 6} {c - 7})"/>')
    return f


def rice(w, h, seed=1, saffron=.28):
    f = Face(f'food-rice', w, h, 'rect')
    rnd = random.Random(seed)
    f.add(f'<rect width="{w}" height="{h}" fill="#EFE3C8"/>')
    for i in range(int(w * h / 5.5)):
        x, y = rnd.uniform(-2, w + 2), rnd.uniform(-2, h + 2)
        a = rnd.uniform(0, 180)
        r = rnd.random()
        col = '#FFFDF6' if r > saffron else ('#F5B437' if r > saffron * .45 else '#E8822A')
        f.add(f'<ellipse cx="{fmt(x)}" cy="{fmt(y)}" rx="3.1" ry=".85" transform="rotate({fmt(a)} {fmt(x)} {fmt(y)})" fill="{col}" stroke="#d8c7a2" stroke-width=".15"/>')
    for i in range(int(w * h / 260)):
        x, y = rnd.uniform(0, w), rnd.uniform(0, h); a = rnd.uniform(0, 360)
        f.add(f'<path d="M0 0C2 -2 5 -2 7 0C5 2 2 2 0 0Z" fill="#3B7D2C" transform="translate({fmt(x)} {fmt(y)}) rotate({fmt(a)})"/>')
    for i in range(int(w * h / 200)):
        x, y = rnd.uniform(0, w), rnd.uniform(0, h); a = rnd.uniform(0, 360)
        f.add(f'<path d="M0 0q2 -1.4 4 0q-2 1 -4 0Z" fill="#8A4A1C" transform="translate({fmt(x)} {fmt(y)}) rotate({fmt(a)})"/>')
    return f


def naan(w, h, seed=2):
    f = Face('food-naan', w, h, 'rect')
    rnd = random.Random(seed)
    f.d('<radialGradient id="ng" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#F3CF86"/><stop offset=".75" stop-color="#E2A85A"/><stop offset="1" stop-color="#C98A3E"/></radialGradient>')
    f.d('<filter id="nb" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation=".7"/></filter>')
    cx, cy = w / 2, h / 2
    p = (f'M{fmt(cx)} {fmt(h * .04)}C{fmt(w * .86)} {fmt(h * .06)} {fmt(w * .97)} {fmt(h * .42)} {fmt(w * .9)} {fmt(h * .7)}'
         f'C{fmt(w * .82)} {fmt(h * .98)} {fmt(w * .2)} {fmt(h * .99)} {fmt(w * .09)} {fmt(h * .72)}C{fmt(w * .01)} {fmt(h * .44)} {fmt(w * .16)} {fmt(h * .05)} {fmt(cx)} {fmt(h * .04)}Z')
    f.add(f'<path d="{p}" fill="url(#ng)"/>')
    f.d(f'<clipPath id="nc"><path d="{p}"/></clipPath>')
    g = []
    for i in range(70):
        x, y = rnd.uniform(w * .1, w * .9), rnd.uniform(h * .08, h * .92)
        r = rnd.uniform(1.2, 4.5)
        g.append(f'<ellipse cx="{fmt(x)}" cy="{fmt(y)}" rx="{fmt(r)}" ry="{fmt(r * rnd.uniform(.6, 1))}" fill="#7A3E12" opacity="{fmt(rnd.uniform(.35, .85))}" filter="url(#nb)"/>')
        if r > 3:
            g.append(f'<ellipse cx="{fmt(x - .6)}" cy="{fmt(y - .8)}" rx="{fmt(r * .45)}" ry="{fmt(r * .3)}" fill="#3E1B06" opacity=".6"/>')
    for i in range(40):
        x, y = rnd.uniform(w * .12, w * .88), rnd.uniform(h * .1, h * .9)
        g.append(f'<circle cx="{fmt(x)}" cy="{fmt(y)}" r=".7" fill="#3B7D2C"/>')
    for i in range(22):
        x, y = rnd.uniform(w * .12, w * .88), rnd.uniform(h * .1, h * .9)
        g.append(f'<ellipse cx="{fmt(x)}" cy="{fmt(y)}" rx="1.1" ry=".7" fill="#FFF3D6" opacity=".9"/>')
    g.append(f'<ellipse cx="{fmt(w * .4)}" cy="{fmt(h * .35)}" rx="{fmt(w * .25)}" ry="{fmt(h * .14)}" fill="#fff" opacity=".18" filter="url(#nb)"/>')
    f.add(f'<g clip-path="url(#nc)">{"".join(g)}</g>')
    return f


def cutlery_sleeve(dr):
    w, h = 58, 190
    f = Face(f'prop-cutlery-{dr}', w, h, 'rect')
    cx = w / 2
    if dr == 'bazaar':
        f.add(bz_ground(f, 26, ox=cx - 13))
        f.add(f'<rect x="-1" y="-1" width="{w + 2}" height="11" fill="{BZ["ink"]}"/>')
        f.add(f'<rect x="-1" y="{h - 10}" width="{w + 2}" height="11" fill="{BZ["ink"]}"/>')
        f.add(bz_shadowed(rrect(7, 38, w - 14, 116, 6), BZ['cream'], .8, 1.2))
        f.add(f'<g transform="translate({cx + 2.6} 96) rotate(-90)">{text("FORK IT OVER.", "bowlby", 7.4, 0, 0, "middle", BZ["ink"])}</g>')
        f.add(f'<g transform="translate({cx + 10} 96) rotate(-90)">{text("spoon, fork, napkin. appetite: yours.", "caveat", 4.6, 0, 0, "middle", BZ["rani"], maxw=104)}</g>')
        f.add(f'<g transform="translate({cx - 9} 96) rotate(-90)">{text("CURRY DISTRICT", "dm700", 2.6, 0, 0, "middle", BZ["ink"], .2)}</g>')
    else:
        foil = ry_foil(f)
        f.add(full(f, RY['ink']))
        f.add(ry_jali(f, -2, 22, 20, ox=cx - 10))
        f.add(ry_jali(f, h - 20, 22, 20, ox=cx - 10, oy=h - 20))
        f.add(f'<rect x="-1" y="20" width="{w + 2}" height="{h - 40}" fill="{RY["ink"]}"/>')
        f.add(f'<line x1="-1" y1="20.4" x2="{w + 1}" y2="20.4" stroke="{foil}" stroke-width=".4"/><line x1="-1" y1="{h - 20.4}" x2="{w + 1}" y2="{h - 20.4}" stroke="{foil}" stroke-width=".4"/>')
        ew = 22
        f.add(brand('logo/royal/emblem.svg', cx - ew / 2, 32, ew, ew / brand_aspect('logo/royal/emblem.svg')))
        f.add(f'<g transform="translate({cx + 2} 128) rotate(-90)">{text("With our compliments", "fri400", 6, 0, 0, "middle", foil)}</g>')
    return f


def all_props():
    out = [lime_cut(), rice(240, 170), naan(100, 150), cutlery_sleeve('bazaar'), cutlery_sleeve('royal')]
    return out

"""Framed prints (6 per direction), gallery-wall mockups, Instagram-corner selfie walls, production one-pager."""
import math
from common import *
from royalkit import *
from build_quiet import cutting_glass, strand, bloom, plant, booti_pattern
from mapkit import person
import build_neon as BN
INK = BZ['ink']
PW, PH = 600, 900

# ------------------------------------------------------------------ shared recipe icons
def recipe_icon(k, x, y, col, acc, sw=4):
    o = f'<g transform="translate({f(x)},{f(y)})" fill="none" stroke="{col}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">'
    if k == 0:   # layers in the pot
        o += f'<path d="M-40 -20H40V20C40 34 -40 34 -40 20Z"/><path d="M-36 -6H36M-38 8H38" stroke="{acc}"/><path d="M-46 -20H46"/>'
    elif k == 1:  # lid + dough rope
        o += f'<path d="M-40 6H40V24C40 36 -40 36 -40 24Z"/><path d="M-44 0C-30 -24 30 -24 44 0"/><path d="M0 -18v-8"/>'
        o += ''.join(f'<circle cx="{-42 + i*12}" cy="2" r="4.5" fill="{acc}" stroke="none"/>' for i in range(8))
    elif k == 2:  # low flame + weight
        o += f'<path d="M-40 -4H40V14C40 26 -40 26 -40 14Z"/><rect x="-18" y="-28" width="36" height="20" rx="4"/>'
        o += f'<path d="M-20 44C-26 34 -14 30 -16 22C-6 28 -6 36 -10 44M8 44C2 34 14 30 12 22C22 28 22 36 18 44" stroke="{acc}"/>'
    else:        # open: steam
        o += f'<path d="M-40 6H40V24C40 36 -40 36 -40 24Z"/><path d="M48 -10C30 -36 0 -40 -20 -26" stroke-dasharray="2 8"/>'
        o += f'<path d="M-14 -4c-8 -12 8 -18 0 -30M2 -4c-8 -12 8 -18 0 -30M18 -4c-8 -12 8 -18 0 -30" stroke="{acc}"/>'
    return o + '</g>'

STEPS = ['Layer par-cooked rice over the masala.', 'Seal the lid with a rope of soft dough.',
         'Low heat, a weight on top: it steams (dum).', 'Break the seal at the table. Breathe in.']

# ------------------------------------------------------------------ BAZAAR posters
def bz_frame_bg(col, dots=True):
    o = rect(0, 0, PW, PH, fill=col)
    if dots: o += booti_pattern(PW, PH, '#FFFFFF', 60, '.16')
    o += path(rrect_d(18, 18, PW - 36, PH - 36, 18), fill='none', stroke=INK, stroke_width=4, stroke_dasharray='10 8')
    return o

def pill(text, x, y, size, fill, tcol=INK):
    w = txtw(text, 'bowlby', size)
    return (path(rrect_d(x - w/2 - 24 + 5, y - size + 5, w + 48, size * 1.7, size * 0.85), fill=INK) +
            path(rrect_d(x - w/2 - 24, y - size, w + 48, size * 1.7, size * 0.85), fill=fill, stroke=INK, stroke_width=4) +
            txt(text, 'bowlby', size, x, y + size * 0.36, tcol, anchor='middle'))

def plate(text, x, y, size):
    w = txtw(text, 'bowlby', size)
    return (path(rrect_d(x - w/2 - 26 + 6, y - size + 6, w + 52, size * 1.9, 12), fill=INK) +
            path(rrect_d(x - w/2 - 26, y - size, w + 52, size * 1.9, 12), fill=BZ['peacock'], stroke=INK, stroke_width=5) +
            path(rrect_d(x - w/2 - 16, y - size + 9, w + 32, size * 1.9 - 18, 7), fill='none', stroke=BZ['cream'], stroke_width=3) +
            txt(text, 'bowlby', size, x, y + size * 0.46, BZ['cream'], anchor='middle'))

def cardamom_flat(x, y, s, rot):
    return (f'<g transform="translate({f(x)},{f(y)}) rotate({rot}) scale({f(s)})">'
            f'<path d="M0 -40C24 -28 26 22 0 44C-26 22 -24 -28 0 -40Z" fill="#8DBA4E" stroke="{INK}" stroke-width="5" stroke-linejoin="round"/>'
            f'<path d="M0 -34C8 -12 8 18 0 38M-10 -24C-4 -6 -4 14 -10 28M10 -24C4 -6 4 14 10 28" fill="none" stroke="#4E7A2A" stroke-width="3"/>'
            f'<path d="M0 -40l-3 -10" stroke="{INK}" stroke-width="5" stroke-linecap="round"/>'
            f'<path d="M-12 -18c4 -8 10 -10 14 -10" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity=".5" fill="none"/></g>')

def bz_posters():
    P = {}
    # 1 spice of the week
    o = bz_frame_bg(BZ['marigold'])
    o += pill('SPICE OF THE WEEK', 300, 96, 30, BZ['cream'])
    o += circle(300, 380, 190, fill=BZ['cream'], stroke=INK, stroke_width=5)
    o += cardamom_flat(250, 360, 2.6, -24) + cardamom_flat(370, 380, 2.3, 18) + cardamom_flat(300, 450, 1.7, 80)
    for (x, y) in [(200, 500), (220, 520), (400, 510), (420, 488)]: o += circle(x, y, 7, fill='#3A2A20', stroke=INK, stroke_width=2)
    o += txt('Cardamom', 'caveat', 118, 300, 690, INK, anchor='middle', wght=700)
    o += txt('Crack a pod. Smell your fingers.', 'dmsans', 27, 300, 752, INK, anchor='middle', wght=500)
    o += txt('That’s the whole poster.', 'dmsans', 27, 300, 790, INK, anchor='middle', wght=700)
    o += txt('CURRY DISTRICT', 'bowlby', 20, 300, 852, INK, anchor='middle')
    P['bz-print-spice'] = o
    # 2 chai wisdom
    o = bz_frame_bg(BZ['rani'])
    for i, (t, y) in enumerate([('Chai first.', 250), ('Decisions', 380), ('later.', 500)]):
        o += txt(t, 'caveat', 128, 300, y, BZ['cream'], anchor='middle', wght=700, stroke=INK, stroke_width=10, stroke_linejoin='round', paint_order='stroke')
    o += path('M150 540c90 20 210 20 300 -6', fill='none', stroke=BZ['marigold'], stroke_width=8, stroke_linecap='round')
    o += cutting_glass(300, 800, 1.0)
    for dx in (-24, 10, 40): o += path(f'M{300+dx} 630c-14 -22 14 -40 0 -64', fill='none', stroke=BZ['cream'], stroke_width=5, stroke_linecap='round', opacity='.8')
    o += txt('CHAI WISDOM · NO. 1', 'bowlby', 20, 300, 72, BZ['cream'], anchor='middle')
    P['bz-print-chai'] = o
    # 3/4 dish portraits
    for key, dish, bg, ray, name, cap in [('bz-print-biryani', 'illustrations/bazaar/set1/biryani.svg', BZ['saffron'], BZ['marigold'], 'BIRYANI BOULEVARD', 'layered, sealed, worth the wait'),
                                          ('bz-print-butter', 'illustrations/bazaar/set1/butter-chicken.svg', BZ['peacock'], '#25BDB3', 'CURRY QUARTER', 'butter chicken. extra naan.')]:
        o = rect(0, 0, PW, PH, fill=bg)
        rays = ''.join(f'M300 420L{f(300 + 900*math.cos(math.radians(a)))} {f(420 + 900*math.sin(math.radians(a)))}L{f(300 + 900*math.cos(math.radians(a+7.5)))} {f(420 + 900*math.sin(math.radians(a+7.5)))}Z' for a in range(0, 360, 15))
        o += f'<clipPath id="pc"><rect width="{PW}" height="{PH}"/></clipPath>' + f'<g clip-path="url(#pc)">' + path(rays, fill=ray, opacity='.8') + '</g>'
        o += path(rrect_d(18, 18, PW - 36, PH - 36, 18), fill='none', stroke=INK, stroke_width=4, stroke_dasharray='10 8')
        o += embed(dish, 50, 150, 500, 500)
        o += plate(name, 300, 735, 34)
        o += txt(cap, 'caveat', 40, 300, 835, INK, anchor='middle', wght=700)
        o += txt('DISH PORTRAIT', 'bowlby', 20, 300, 72, INK, anchor='middle')
        P[key] = o
    # 5 map mini
    o = rect(0, 0, PW, PH, fill=BZ['marigold'])
    o += embed(OUT + 'bz-district-map-9x16.svg', (PW - 506) / 2, 0, 506, 900)
    P['bz-print-map'] = o
    # 6 recipe card
    o = rect(0, 0, PW, PH, fill=BZ['cream'])
    for y in range(250, 860, 46): o += line(40, y, 560, y, stroke=BZ['peacock'], stroke_width=1.2, opacity='.35')
    o += rect(0, 0, PW, 26, fill=BZ['rani'])
    o += txt('RECIPE CARD · TECHNIQUE', 'dmsans', 20, 44, 72, BZ['rani'], wght=700, tracking=0.1)
    o += txt('HOW A DUM', 'bowlby', 50, 44, 136, INK) + txt('BIRYANI IS SEALED', 'bowlby', 38, 44, 186, BZ['saffron'], stroke=INK, stroke_width=2, paint_order='stroke')
    for i, st in enumerate(STEPS):
        y = 290 + i * 135
        o += circle(86, y, 54, fill=[BZ['marigold'], BZ['peacock'], BZ['saffron'], BZ['rani']][i], stroke=INK, stroke_width=4)
        o += recipe_icon(i, 86, y, INK, BZ['cream'], sw=4)
        o += txt(str(i + 1), 'bowlby', 26, 160, y - 14, BZ['rani'])
        for j, ln in enumerate(wrap(st, 'dmsans', 27, 370, 600)):
            o += txt(ln, 'dmsans', 27, 196, y - 12 + j * 34, INK, wght=600)
    o += txt('the classic technique in general — not a house recipe', 'caveat', 26, 300, 862, BZ['muted'], anchor='middle', wght=700)
    P['bz-print-recipe'] = o
    return P

# ------------------------------------------------------------------ ROYAL posters
def ry_frame(bg, line_col=GOLD):
    return (rect(0, 0, PW, PH, fill=bg) + path(rrect_d(22, 22, PW - 44, PH - 44, 4), fill='none', stroke=line_col, stroke_width=2) +
            path(rrect_d(32, 32, PW - 64, PH - 64, 2), fill='none', stroke=line_col, stroke_width=0.8, opacity='.7'))

def ry_posters():
    P = {}
    defs = foil_grad('ryf', 0, 0, 1, 1)
    # 1 spice of the week: saffron
    o = ry_frame(RY['ink'])
    o += f'<style>.ruby{{stroke:{RY["blush"]}}}</style>'
    o += txt('SPICE OF THE WEEK', 'hanken', 20, 300, 86, GOLD, anchor='middle', wght=700, tracking=0.24)
    o += f'<g transform="translate(300,560) scale(1.05) translate(-300,-560)">{plant("saffron", 300, 560, None)}</g>'
    o += txt('Saffron', 'fraunces', 76, 300, 700, GLT, anchor='middle', wght=600)
    o += txt('Crocus sativus', 'fraunces-i', 30, 300, 742, GOLD, anchor='middle', wght=400)
    o += txt('Three red threads to a flower,', 'hanken', 25, 300, 800, RY['ivory'], anchor='middle', wght=500)
    o += txt('picked by hand.', 'hanken', 25, 300, 834, RY['ivory'], anchor='middle', wght=500)
    P['ry-print-spice'] = o
    # 2 quote
    o = ry_frame(RY['plum'])
    o += path(mughal_arch(300, 800, 440, 680), fill='#3A1545', stroke=GOLD, stroke_width=2.4)
    o += path(mughal_arch(300, 800, 416, 664), fill='none', stroke=GLT, stroke_width=0.9, opacity='.8')
    for i, (t, y) in enumerate([('Good chai', 400), ('is never', 480), ('in a hurry.', 560)]):
        o += txt(t, 'fraunces-i', 64, 300, y, GLT, anchor='middle', wght=600)
    o += path('M300 620l10 14l-10 14l-10 -14z', fill=GOLD)
    o += txt('CHAI WISDOM', 'hanken', 20, 300, 720, GOLD, anchor='middle', wght=700, tracking=0.24)
    P['ry-print-chai'] = o
    # 3/4 dish portraits
    for key, dish, bg, name, zone in [('ry-print-butter', 'illustrations/royal/set1/butter-chicken.svg', RY['emerald'], 'Butter Chicken', 'Curry Quarter'),
                                      ('ry-print-biryani', 'illustrations/royal/set1/biryani.svg', RY['ruby'], 'Biryani', 'Biryani Boulevard')]:
        o = ry_frame(bg)
        o += path(mughal_arch(300, 640, 460, 560), fill=RY['ink'], stroke=GOLD, stroke_width=2.4)
        o += beading(mughal_arch_open(300, 640, 440, 548), 14, 2.2, fill=GLT, opacity=.85)
        o += embed(dish, 80, 230, 440, 440)
        o += txt(name, 'fraunces', 62, 300, 740, RY['ivory'], anchor='middle', wght=600)
        o += txt(zone, 'fraunces-i', 30, 300, 788, GLT, anchor='middle', wght=400)
        o += txt('DISH PORTRAIT', 'hanken', 18, 300, 80, GLT, anchor='middle', wght=700, tracking=0.24)
        P[key] = o
    # 5 fine-line map
    o = ry_frame(RY['ivory'], GDK)
    cx, cy = 300, 440
    o += txt('The District', 'fraunces', 58, 300, 120, RY['ink'], anchor='middle', wght=600)
    o += txt('eight quarters, one table', 'fraunces-i', 26, 300, 160, GDK, anchor='middle', wght=400)
    names = ['Starters Square', 'Tandoor Quarter', 'Curry Quarter', 'Biryani Boulevard', 'Indo-Chinese Alley', 'Bread Bazaar', 'Sweet Street', 'Chai & Coolers']
    o += circle(cx, cy, 52, fill='none', stroke=GDK, stroke_width=2) + circle(cx, cy, 64, fill='none', stroke=GDK, stroke_width=1)
    o += embed('logo/royal/colourways/emblem--ivory.svg', cx - 26, cy - 34, 52)
    o += circle(cx, cy, 200, fill='none', stroke=GDK, stroke_width=1.2, stroke_dasharray='3 6')
    for i, n in enumerate(names):
        a = math.radians(-90 + i * 45)
        o += line(cx + 64 * math.cos(a), cy + 64 * math.sin(a), cx + 214 * math.cos(a), cy + 214 * math.sin(a), stroke=GDK, stroke_width=1.6)
        bx, by = cx + 200 * math.cos(a), cy + 200 * math.sin(a)
        o += path(f'M{f(bx)} {f(by-8)}l6 8l-6 8l-6 -8z', fill=RY['ruby'])
        lx, ly = cx + 238 * math.cos(a), cy + 238 * math.sin(a)
        o += txt(str(i + 1), 'fraunces', 24, lx, ly + 9, RY['ink'], anchor='middle', wght=600)
        colx = 70 if i < 4 else 320; rowy = 744 + (i % 4) * 30
        o += txt(f'{i+1}  {n}', 'fraunces-i', 21, colx, rowy, RY['ink'], wght=600)
    o += txt('MAP NOT TO SCALE · APPETITE TO SCALE', 'hanken', 16, 300, 868, GDK, anchor='middle', wght=700, tracking=0.18)
    P['ry-print-map'] = o
    # 6 recipe card
    o = ry_frame(RY['ivory'], GDK)
    o += txt('THE TECHNIQUE', 'hanken', 18, 300, 86, GDK, anchor='middle', wght=700, tracking=0.24)
    o += txt('How a dum biryani', 'fraunces', 44, 300, 150, RY['ink'], anchor='middle', wght=600)
    o += txt('is sealed', 'fraunces-i', 44, 300, 200, RY['ruby'], anchor='middle', wght=600)
    for i, st in enumerate(STEPS):
        y = 300 + i * 132
        o += circle(100, y, 50, fill='none', stroke=GOLD, stroke_width=2)
        o += recipe_icon(i, 100, y, RY['ink'], RY['ruby'], sw=2.6)
        o += txt(['i', 'ii', 'iii', 'iv'][i], 'fraunces-i', 26, 172, y - 16, GDK, wght=600)
        for j, ln in enumerate(wrap(st, 'hanken', 25, 330, 500)):
            o += txt(ln, 'hanken', 25, 212, y - 14 + j * 32, RY['ink'], wght=500)
    o += txt('The classic technique in general, not a house recipe.', 'fraunces-i', 20, 300, 846, GDK, anchor='middle', wght=400)
    P['ry-print-recipe'] = o
    return P, defs

# ------------------------------------------------------------------ gallery walls
ORDER_BZ = ['bz-print-spice', 'bz-print-map', 'bz-print-chai', 'bz-print-biryani', 'bz-print-recipe', 'bz-print-butter']
ORDER_RY = ['ry-print-spice', 'ry-print-map', 'ry-print-chai', 'ry-print-butter', 'ry-print-recipe', 'ry-print-biryani']
SLOTS = [(360, 90, 220, 330), (670, 40, 260, 390), (1020, 90, 220, 330), (430, 490, 180, 270), (710, 490, 180, 270), (990, 490, 180, 270)]

def gallery(direction, order):
    W, H = 1600, 1000
    o = []; defs = []
    if direction == 'bazaar':
        o.append(rect(0, 0, W, H, fill=BZ['cream'])); o.append(booti_pattern(W, H, BZ['saffron'], 80, '.12'))
        wy = 800
        n = 34; sw = W / n
        sc = ''.join(f'A{f(sw/2)} {f(sw/2)} 0 0 0 {f((i+1)*sw)} {f(wy)}' for i in range(n))
        o.append(path(f'M0 {wy}{sc}V{H}H0Z', fill=BZ['peacock'], stroke=INK, stroke_width=5))
        o.append(rect(0, 930, W, 70, fill='#C77B30')); o.append(rect(0, 930, W, 5, fill=INK, opacity='.4'))
        cols = [BZ['rani'], BZ['peacock'], BZ['saffron'], BZ['marigold'], BZ['rani'], BZ['peacock']]
    else:
        defs.append(brass_grad('gbr') + foil_grad('gfoil'))
        o.append(rect(0, 0, W, H, fill='#3A1545'))
        lat = ''.join(f'M{i*50} 0L{i*50+800} 1000M{i*50} 0L{i*50-800} 1000' for i in range(-20, 50))
        o.append(path(lat, stroke=GOLD, stroke_width=1, opacity='.06', fill='none'))
        o.append(rect(0, 800, W, 200, fill=RY['emerald'])); o.append(rect(0, 800, W, 6, fill='url(#gfoil)'))
        for x in range(40, W, 160): o.append(path(rrect_d(x, 830, 120, 140, 6), fill='none', stroke=GOLD, stroke_width=1.2, opacity='.6'))
        o.append(rect(0, 950, W, 50, fill='#160B26'))
    for k, (key, (x, y, w, h)) in enumerate(zip(order, SLOTS)):
        if direction == 'bazaar':
            b = 16
            o.append(rect(x - b + 10, y - b + 10, w + 2*b, h + 2*b, fill=INK, opacity='.9'))
            o.append(rect(x - b, y - b, w + 2*b, h + 2*b, fill=cols[k], stroke=INK, stroke_width=4))
            o.append(embed(OUT + key + '.svg', x, y, w, h))
            o.append(rect(x, y, w, h, fill='none', stroke=INK, stroke_width=3))
        else:
            b = 14; m = 16
            o.append(ellipse(x + w/2, y - 30, w * 0.7, 60, fill='#F7D98A', opacity='.10'))
            o.append(rect(x - b - m + 6, y - b - m + 14, w + 2*(b+m), h + 2*(b+m), fill='#000', opacity='.35'))
            o.append(rect(x - b - m, y - b - m, w + 2*(b+m), h + 2*(b+m), fill='url(#gbr)'))
            o.append(rect(x - m, y - m, w + 2*m, h + 2*m, fill=RY['ivory']))
            o.append(embed(OUT + key + '.svg', x, y, w, h))
    # floor props
    if direction == 'bazaar':
        o.append(path(rrect_d(380 + 8, 760 + 8, 840, 46, 12), fill=INK))
        o.append(path(rrect_d(380, 760, 840, 46, 12), fill=BZ['rani'], stroke=INK, stroke_width=4))
        for x in (420, 1160): o.append(rect(x, 806, 24, 124, fill='#8B4A22', stroke=INK, stroke_width=4))
        o.append(rect(392, 806, 816, 24, fill='#C77B30', stroke=INK, stroke_width=4))
        o.append(path('M150 930L170 820H270L290 930Z', fill=BZ['saffron'], stroke=INK, stroke_width=4))
        for a in range(-60, 61, 30):
            o.append(path(f'M220 820C{220+a} 760 {220+a*1.6} 720 {220+a*2.2} 690', fill='none', stroke=BZ['cilantro'], stroke_width=14, stroke_linecap='round'))
            o.append(path(f'M220 820C{220+a} 760 {220+a*1.6} 720 {220+a*2.2} 690', fill='none', stroke=INK, stroke_width=3, opacity='.4'))
        o.append(txt('“Chai first. Decisions later.” — framed', 'caveat', 34, 1300, 710, INK, wght=700, opacity='0'))
    else:
        o.append(path('M300 800H1300V836H300Z', fill='url(#gbr)'))
        o.append(f'<g transform="translate(345,796)">{kettle("gbr", 0.62)}</g>')
        o.append(f'<g transform="translate(1260,796)">{katori_stack("gbr", 0.7)}</g>')
        o.append(path('M150 950L170 830H270L290 950Z', fill='url(#gbr)'))
        for a in range(-60, 61, 30):
            o.append(path(f'M220 830C{220+a} 770 {220+a*1.6} 730 {220+a*2.2} 700', fill='none', stroke='#1F7A5E', stroke_width=12, stroke_linecap='round'))
    title = 'Gallery wall · six framed prints'
    # caption chip
    if direction == 'bazaar':
        o.append(path(rrect_d(1260, 860, 300, 50, 25), fill=INK)); o.append(txt('6 PRINTS · A2 + A3', 'bowlby', 22, 1410, 893, BZ['cream'], anchor='middle'))
    else:
        o.append(path(rrect_d(1260, 870, 300, 50, 25), fill='#160B26', stroke=GOLD, stroke_width=1.5)); o.append(txt('Six prints · A2 + A3', 'fraunces-i', 26, 1410, 903, GLT, anchor='middle', wght=600))
    return doc(W, H, ''.join(o), ''.join(defs), title=title)

def poster_sheet(direction, order):
    W, H = 1600, 1200
    bg = BZ['ink'] if direction == 'bazaar' else RY['ink']
    o = [rect(0, 0, W, H, fill=bg)]
    for k, key in enumerate(order):
        x = 80 + (k % 3) * 500; y = 70 + (k // 3) * 560
        o.append(rect(x + 8, y + 10, 330, 495, fill='#000', opacity='.4'))
        o.append(embed(OUT + key + '.svg', x, y, 330, 495))
    lab = BZ['marigold'] if direction == 'bazaar' else GOLD
    for k, key in enumerate(order):
        x = 80 + (k % 3) * 500 + 345; y = 70 + (k // 3) * 560 + 30
    return doc(W, H, ''.join(o), title='Print set — six posters')

# ------------------------------------------------------------------ selfie walls (Instagram corner) 1080 x 1350
def selfie_bz():
    W, H = 1080, 1350
    R = rng(4)
    o = [rect(0, 0, W, H, fill=BZ['cream']), booti_pattern(W, H, BZ['saffron'], 80, '.14')]
    defs = []
    # painted arch
    ax, ab, aw, ah = 540, 1040, 640, 800
    ad = mughal_arch(ax, ab, aw + 70, ah + 50, point=0.12)
    o.append(path(ad, fill=BZ['rani'], stroke=INK, stroke_width=6, transform='translate(10,10)', opacity='1'))
    o.append(path(ad, fill=BZ['rani'], stroke=INK, stroke_width=6))
    o.append(path(mughal_arch(ax, ab, aw + 34, ah + 25, point=0.12), fill=BZ['marigold'], stroke=INK, stroke_width=4))
    inner = mughal_arch(ax, ab, aw, ah, point=0.12)
    # neon inside, on a dark indigo painted field
    grp = BN.art_bz_chai()
    d, b, meta = BN.scene('sbz', 'bazaar', grp, 36, wall='brick', wall_base='#211848', mortar='#0E0924', size=(aw, ah), sign_c=(aw/2, ah*0.42),
                          max_wh=(aw*0.78, ah*0.52), card=False, ret_parts=True, annotate=False, prefix='sbz_')
    defs += d
    defs.append(f'<clipPath id="sbzclip"><path d="{inner}" transform="translate({f(-(ax-aw/2))},{f(-(ab-ah))})"/></clipPath>')
    o.append(f'<svg x="{f(ax-aw/2)}" y="{f(ab-ah)}" width="{aw}" height="{ah}" viewBox="0 0 {aw} {ah}"><g clip-path="url(#sbzclip)">{"".join(b)}</g></svg>')
    o.append(path(inner, fill='none', stroke=INK, stroke_width=6))
    # garland strands framing the arch
    for x in (90, 170, 910, 990):
        o.append(strand(x, 0, 380 + (60 if x in (170, 910) else 0), 16, R))
    o.append(rect(0, 0, W, 14, fill=INK))
    # floor: cement tiles
    o.append(rect(0, 1040, W, 310, fill='#F3E3C3'))
    for i in range(0, W + 120, 120):
        for j in range(1040, H + 120, 120):
            o.append(path(f'M{i} {j}l60 60l-60 60l-60 -60z', fill=BZ['peacock'], opacity='.55'))
            o.append(circle(i, j + 60, 12, fill=BZ['marigold']))
    o.append(rect(0, 1040, W, 10, fill=INK, opacity='.6'))
    # floor sticker
    o.append(ellipse(540, 1200, 196, 46, fill=BZ['marigold'], stroke=INK, stroke_width=4))
    o.append(txt('STAND HERE · SAY “PANEER”', 'bowlby', 20, 540, 1208, INK, anchor='middle'))
    # moora stool (woven cane) + props
    sx, sy = 300, 1150
    o.append(ellipse(sx + 6, sy + 8, 96, 20, fill=INK, opacity='.25'))
    o.append(path(f'M{sx-80} {sy-130}C{sx-50} {sy-70} {sx-50} {sy-50} {sx-80} {sy}H{sx+80}C{sx+50} {sy-50} {sx+50} {sy-70} {sx+80} {sy-130}Z', fill='#D9A35A', stroke=INK, stroke_width=5))
    for k in range(-3, 4):
        o.append(line(sx + k * 20 - 10, sy - 120, sx + k * 20 + 10, sy - 10, stroke='#9A6A2C', stroke_width=3))
        o.append(line(sx + k * 20 + 10, sy - 120, sx + k * 20 - 10, sy - 10, stroke='#9A6A2C', stroke_width=3))
    o.append(ellipse(sx, sy - 132, 84, 22, fill=BZ['peacock'], stroke=INK, stroke_width=5))
    o.append(cutting_glass(sx + 20, sy - 136, 0.42))
    # crate with brass kettle
    cx = 790
    o.append(rect(cx - 90, 1040, 180, 120, fill='#C77B30', stroke=INK, stroke_width=5))
    o.append(line(cx - 90, 1080, cx + 90, 1080, stroke=INK, stroke_width=3)); o.append(line(cx - 90, 1120, cx + 90, 1120, stroke=INK, stroke_width=3))
    o.append(f'<g transform="translate({cx},{1040})"><path d="M-60 -6C-74 -50 -50 -96 0 -96C50 -96 74 -50 60 -6Z" fill="{BZ["marigold"]}" stroke="{INK}" stroke-width="5"/>'
             f'<path d="M58 -40C92 -44 92 -80 120 -104" fill="none" stroke="{INK}" stroke-width="12" stroke-linecap="round"/><path d="M58 -40C92 -44 92 -80 120 -104" fill="none" stroke="{BZ["marigold"]}" stroke-width="5" stroke-linecap="round"/>'
             f'<path d="M-30 -96C-28 -118 28 -118 30 -96Z" fill="{BZ["saffron"]}" stroke="{INK}" stroke-width="5"/></g>')
    # hashtag lockup: street-sign plate
    o.append(plate('#CURRYDISTRICT', 540, 78, 44))
    o.append(txt('tag the table, not the waiter', 'caveat', 34, 540, 166, INK, anchor='middle', wght=700, stroke=BZ['cream'], stroke_width=8, paint_order='stroke'))
    return doc(W, H, ''.join(o), ''.join(defs), title='Instagram corner — Bazaar')

def selfie_ry():
    W, H = 1080, 1350
    R = rng(6)
    defs = [brass_grad('srb'), copper_grad('src'), foil_grad('srf')]
    o = []
    defs.append(BN.plaster_wall(W, H, '#0F3A31', gid='srwall', seed=8))
    o.append('<use href="#srwall"/>')
    ax, ab, aw, ah = 540, 1040, 600, 760
    o.append(path(mughal_arch(ax, ab, aw + 110, ah + 70), fill='#123F35', stroke=GOLD, stroke_width=3))
    o.append(beading(mughal_arch_open(ax, ab, aw + 84, ah + 54), 16, 2.6, fill=GLT, opacity=.85))
    o.append(path(mughal_arch(ax, ab, aw + 50, ah + 30), fill='none', stroke=GOLD, stroke_width=2))
    inner = mughal_arch(ax, ab, aw, ah)
    grp = BN.art_ry_slow()
    d, b, meta = BN.scene('sry', 'royal', grp, 40, tube_mm=6, wall='plaster', wall_base='#2B1236', size=(aw, ah), sign_c=(aw/2, ah*0.40),
                          max_wh=(aw*0.74, ah*0.42), card=False, ret_parts=True, annotate=False, prefix='sry_')
    defs += d
    defs.append(f'<clipPath id="sryclip"><path d="{inner}" transform="translate({f(-(ax-aw/2))},{f(-(ab-ah))})"/></clipPath>')
    o.append(f'<svg x="{f(ax-aw/2)}" y="{f(ab-ah)}" width="{aw}" height="{ah}" viewBox="0 0 {aw} {ah}"><g clip-path="url(#sryclip)">{"".join(b)}</g></svg>')
    o.append(path(inner, fill='none', stroke=GOLD, stroke_width=4))
    # jali panels either side
    for k, jx in enumerate((40, 900)):
        defs.append(jali_mask(f'srj{k}', jx, 300, 140, 700, cell=40, hole=0.36))
        o.append(f'<rect x="{jx-6}" y="294" width="152" height="712" fill="#F7D98A" opacity=".18"/>')
        o.append(f'<g mask="url(#srj{k})"><rect x="{jx}" y="300" width="140" height="700" fill="url(#srb)"/></g>')
        o.append(rect(jx, 300, 140, 700, fill='none', stroke=GDK, stroke_width=3))
    # floor
    o.append(rect(0, 1040, W, 310, fill='#E9DCC4'))
    for i in range(0, W + 90, 90):
        for j in range(1040, H + 90, 90):
            o.append(path(f'M{i} {j}l45 45l-45 45l-45 -45z', fill='none', stroke=GDK, stroke_width=1.5, opacity='.6'))
            o.append(path(f'M{i} {j+33}l12 12l-12 12l-12 -12z', fill=RY['emerald'], opacity='.7'))
    o.append(rect(0, 1040, W, 8, fill='url(#srf)'))
    # ruby velvet pouf + brass vessels on plinth
    px, py = 330, 1190
    o.append(ellipse(px + 6, py + 10, 120, 24, fill='#000', opacity='.3'))
    o.append(path(f'M{px-110} {py-110}C{px-120} {py-40} {px-110} {py} {px} {py}C{px+110} {py} {px+120} {py-40} {px+110} {py-110}Z', fill=RY['ruby']))
    for k in range(-2, 3): o.append(path(f'M{px+k*44} {py-120}C{px+k*50} {py-60} {px+k*50} {py-30} {px+k*44} {py-4}', fill='none', stroke='#7A1030', stroke_width=4))
    o.append(ellipse(px, py - 112, 110, 28, fill='#C2264F'))
    o.append(rect(712, 1040, 216, 130, fill=RY['emerald'], stroke=GOLD, stroke_width=2)); o.append(rect(706, 1032, 228, 12, fill='url(#srb)'))
    o.append(f'<g transform="translate(790,1040)">{handi("src", 0.5)}</g>')
    o.append(f'<g transform="translate(880,1040)">{kettle("srb", 0.42)}</g>')
    # brass hashtag plaque
    pw = txtw('#CurryDistrict', 'fraunces', 50, 600) + 80
    o.append(rect(540 - pw/2 + 6, 70 + 8, pw, 84, rx=6, fill='#000', opacity='.35'))
    o.append(rect(540 - pw/2, 70, pw, 84, rx=6, fill='url(#srb)'))
    o.append(rect(540 - pw/2 + 8, 78, pw - 16, 68, rx=4, fill='none', stroke='#6E4510', stroke_width=1.5))
    o.append(txt('#CurryDistrict', 'fraunces', 50, 540, 130, '#3A2208', anchor='middle', wght=600))
    o.append(txt('Share the table, tag the moment', 'fraunces-i', 30, 540, 196, GLT, anchor='middle', wght=400))
    return doc(W, H, ''.join(o), ''.join(defs), title='Instagram corner — Royal')

# ------------------------------------------------------------------ production one-pager (both)
def production_notes():
    W, H = 1080, 1920
    o = [rect(0, 0, W, H, fill=BZ['cream'])]
    o.append(rect(0, 0, W, 210, fill=BZ['ink']))
    o.append(txt('Mural & sign production notes', 'bowlby', 46, 60, 110, BZ['marigold']))
    o.append(txt('All figures approx., from our Oct 2026 research brief — get real quotes.', 'dmsans', 27, 60, 160, BZ['cream'], wght=500))
    y = 280
    def h(t):
        nonlocal y
        o.append(txt(t, 'bowlby', 34, 60, y, BZ['rani'])); y += 54
    def p(t, size=29, col=INK, wg=500, ind=60):
        nonlocal y
        for ln in wrap(t, 'dmsans', size, W - ind - 60, wg):
            o.append(txt(ln, 'dmsans', size, ind, y, col, wght=wg)); y += size * 1.32
        y += 8
    h('1 · Three ways to make the hero wall')
    rows = [('Local-artist commission', 'Hand-painted from our vector file. DFW rates ~$12–30/sq ft; 150 sq ft ~ $1,800–4,500. Lead time ~2–4 wks. After-hours work adds ~50% labour; prep & sealant ~$100–1,000.'),
            ('Printed wallcovering', 'Type II commercial vinyl, Class A (ASTM E84). 150 sq ft ~ $800 (DIY peel-and-stick) to ~$4,500 (custom print + commercial installer). Lead time ~1–3 wks.'),
            ('Hybrid (our pick)', 'Print the map / gateway base, then a local artist hand-finishes gold lines, sparkles and a signature. Cost between the two (estimate, not quoted).')]
    for t, d in rows:
        o.append(path(rrect_d(60, y - 34, W - 120, 8, 4), fill=BZ['marigold']))
        y += 12
        p(t, 31, INK, 700)
        p(d, 27, BZ['muted'], 500)
    h('2 · Sizes we drew for')
    p('District Map: 16 × 9 ft (~144 sq ft) or 9 × 16 ft tall. Gateway: ~8 × 14 ft. Quiet murals / friezes: 2–3 ft bands, any length. Files are vector, text outlined, so they scale to the wall.', 27)
    h('3 · Neon & light')
    p('LED neon flex, 6–8 mm, on clear acrylic. 24–30 in ~ $180–500 · 36–48 in ~ $400–1,200 · 60 in+ ~ $900–3,000+. Lead time 2–4 wks (express ~10–14 business days). Tube lengths on each sheet are measured from the artwork, approx.', 27)
    p('Anything visible from outside or in the window: landlord approval first, and Little Elm may require a sign permit (214-975-0456).', 27, BZ['chili'], 600)
    h('4 · Prints & photo corner')
    p('Six posters per direction, A2/A3, in ready-made frames. Photo corner all-in ~ $400–6,000 (estimate) depending on mural vs. wallcovering and neon size.', 27)
    h('5 · Before ordering')
    p('Ask for Class A certificates for every wallcovering and fabric · confirm wall surface & prep · keep a labelled touch-up can · approve a printed colour strike-off against the brand hex values.', 27)
    o.append(rect(0, H - 90, W, 90, fill=BZ['ink']))
    o.append(txt('Independent design concept prepared as a proposal — not official Curry District material.', 'dmsans', 22, 540, H - 38, BZ['cream'], anchor='middle', wght=500))
    return doc(W, H, ''.join(o), title='Mural & sign production notes')

if __name__ == '__main__':
    P = bz_posters()
    for k, v in P.items(): save(k + '.svg', doc(PW, PH, v, title=k))
    P, defs = ry_posters()
    for k, v in P.items(): save(k + '.svg', doc(PW, PH, v, defs, title=k))
    save('bz-gallery-wall.svg', gallery('bazaar', ORDER_BZ))
    save('ry-gallery-wall.svg', gallery('royal', ORDER_RY))
    save('bz-print-set.svg', poster_sheet('bazaar', ORDER_BZ))
    save('ry-print-set.svg', poster_sheet('royal', ORDER_RY))
    save('bz-selfie-wall.svg', selfie_bz())
    save('ry-selfie-wall.svg', selfie_ry())
    save('production-notes.svg', production_notes())
    print('ok')

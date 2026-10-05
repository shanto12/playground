"""All mockup scenes. python3 scenes.py [dpr] → jobs.json"""
import json, math, sys
from shots import shot, OUT

BZ_ILL = '/home/user/playground/brand/illustrations/bazaar'
RY_ILL = '/home/user/playground/brand/illustrations/royal'


def cam(ty, dist, el, az=0):
    e, a = math.radians(el), math.radians(az)
    return [round(dist * math.cos(e) * math.sin(a), 1), round(ty + dist * math.sin(e), 1), round(dist * math.cos(e) * math.cos(a), 1)]


def _sub(a, b): return [a[i] - b[i] for i in range(3)]
def _dot(a, b): return sum(a[i] * b[i] for i in range(3))
def _cross(a, b): return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
def _norm(a):
    l = math.sqrt(_dot(a, a)); return [v / l for v in a]


def project(c, p, aspect=.8):
    eye = c['cam']; tgt = c.get('target', [0, 0, 0]); up = c.get('up', [0, 1, 0])
    f = _norm(_sub(tgt, eye)); r = _norm(_cross(f, up)); u = _cross(r, f)
    d = _sub(p, eye)
    x, y, z = _dot(d, r), _dot(d, u), _dot(d, f)
    t = math.tan(math.radians(c.get('fov', 22)) / 2)
    return x / (z * t * aspect), y / (z * t)


def floor_at(c, nx, ny, aspect=.8, y=0):
    """World point on plane y where screen NDC (nx, ny) looks (ny=-1 bottom)."""
    eye = c['cam']; tgt = c.get('target', [0, 0, 0]); up = c.get('up', [0, 1, 0])
    f = _norm(_sub(tgt, eye)); r = _norm(_cross(f, up)); u = _cross(r, f)
    t = math.tan(math.radians(c.get('fov', 22)) / 2)
    d = [f[i] + r[i] * nx * t * aspect + u[i] * ny * t for i in range(3)]
    k = (y - eye[1]) / d[1]
    return [round(eye[i] + d[i] * k, 1) for i in range(3)]


def P(c, nx, ny, **o):
    o['pos'] = floor_at(c, nx, ny); return o


def check(name, c):
    for o in c['objects']:
        if o['type'] in ('petals',):
            continue
        p = o.get('pos', [0, 0, 0])
        rr = o.get('r', 30) if o['type'] in ('marigold', 'lime') else 25
        for dx, dz in ((-rr, 0), (rr, 0), (0, rr), (0, -rr)):
            nx, ny = project(c, [p[0] + dx, p[1], p[2] + dz])
            if abs(nx) > .97 or abs(ny) > .97:
                print(f'  ! {name}: {o["type"]} at {p} partly out of frame ({nx:.2f},{ny:.2f})')
                break


def dark(hexc, f=.35):
    h = hexc.lstrip('#'); r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return '#%02x%02x%02x' % (int(r * f), int(g * f), int(b * f))


MARI = ['#FF7A00', '#FF8A00', '#F26500', '#FF9E00']
MARI_RED = ['#D84A00', '#E85D00', '#C63B00', '#F07000']

SURF = {
    ('bazaar', 'pail'): '#00A8A0', ('bazaar', 'clam'): '#E4147E', ('bazaar', 'tub'): '#FFB000',
    ('bazaar', 'handi'): '#FFE7B8', ('bazaar', 'tray'): '#7B5CFF',
    ('royal', 'pail'): '#F4C9BB', ('royal', 'clam'): '#117C86', ('royal', 'tub'): '#E9DCC6',
    ('royal', 'handi'): '#A3173F', ('royal', 'tray'): '#FBF3E4',
}
SHADOW_F = {'#FFE7B8': .55, '#FBF3E4': .5, '#E9DCC6': .5, '#F4C9BB': .45, '#FFB000': .42}


def base(dr, kind, surface=None):
    s = surface or SURF[(dr, kind)]
    return dict(surface=s, shadowColor=dark(s, SHADOW_F.get(s, .3)), sweep=dict(back=700, R=900),
                key=[-520, 860, 620], keyI=2.5, fillI=.75, envI=.6, bounce=dark(s, .8), shadowRadius=16)


def hero(dr, kind, dpr):
    c = base(dr, kind)
    objs = []
    fx = dict(vigo=.30, hlo=.30)
    royal = dr == 'royal'
    R = MARI_RED if royal else MARI
    if kind == 'pail':
        objs.append(dict(type='pail', dir=dr, rotY=-30))
        c.update(cam=cam(92, 820, 19), target=[0, 92, 0], fov=24)
        if royal:
            objs += [P(c, -.62, -.72, type='lime', r=22), P(c, .5, -.86, type='chili', rotY=200, len=74, r=5.5),
                     P(c, .72, -.62, type='chili', rotY=150, len=60, r=4.6, color='#2E7D32')]
        else:
            objs += [P(c, -.66, -.62, type='marigold', r=20, seed=1), P(c, -.38, -.88, type='marigold', r=16, seed=2),
                     P(c, .58, -.8, type='chili', rotY=205, len=72, r=5.5),
                     dict(type='petals', pos=floor_at(c, 0, -.62), r=150, n=14, sx=1.6, sz=.6, seed=3)]
    elif kind == 'clam':
        objs.append(dict(type='clam', dir=dr, rotY=-24))
        c.update(cam=cam(30, 980, 33), target=[0, 22, 0], fov=24)
        if royal:
            objs += [P(c, .66, -.7, type='lime', r=22), P(c, -.6, -.76, type='chili', rotY=-15, len=76, r=5.6)]
        else:
            objs += [P(c, .66, -.68, type='lime', r=22), P(c, -.55, -.8, type='chili', rotY=-12, len=78, r=6),
                     P(c, -.72, -.45, type='marigold', r=20, seed=4),
                     dict(type='petals', pos=floor_at(c, 0, -.7), r=200, n=14, sx=1.4, sz=.5, seed=8)]
    elif kind == 'tub':
        objs.append(dict(type='tub', dir=dr, rotY=-18))
        c.update(cam=cam(44, 600, 27), target=[0, 40, 0], fov=24)
        if royal:
            objs += [P(c, .6, -.72, type='chili', rotY=200, len=64, r=5), P(c, .74, -.5, type='chili', rotY=165, len=56, r=4.4, color='#2E7D32')]
        else:
            objs += [P(c, -.62, -.66, type='marigold', r=17, seed=5), P(c, .64, -.74, type='marigold', r=14, seed=6),
                     dict(type='petals', pos=floor_at(c, 0, -.66), r=120, n=12, sx=1.6, sz=.6, seed=2)]
    elif kind == 'handi':
        objs.append(dict(type='handi', dir=dr, rotY=-14))
        c.update(cam=cam(80, 880, 22), target=[0, 80, 0], fov=24)
        if royal:
            objs += [P(c, -.64, -.7, type='marigold', r=18, seed=6, colors=MARI_RED), P(c, .62, -.78, type='lime', r=21),
                     dict(type='petals', pos=floor_at(c, 0, -.72), r=170, n=12, sx=1.5, sz=.6, seed=4, colors=MARI_RED)]
        else:
            objs += [P(c, -.66, -.66, type='marigold', r=20, seed=7), P(c, .66, -.76, type='marigold', r=17, seed=8),
                     dict(type='petals', pos=floor_at(c, 0, -.7), r=170, n=14, sx=1.5, sz=.6, seed=9)]
    elif kind == 'tray':
        food = [dict(tex='food-naan', w=84, d=150, x=80, y=10, rough=.55), dict(tex='food-naan', w=80, d=146, x=82, y=13, z=4, rough=.55)]
        objs.append(dict(type='tray', dir=dr, rotY=-24, pull=88, food=food, pos=[-44, 0, 0]))
        c.update(cam=cam(26, 1300, 34), target=[0, 18, 10], fov=24)
        if royal:
            objs += [P(c, -.6, -.72, type='lime', r=22), P(c, .55, -.82, type='chili', rotY=190, len=74, r=5.5)]
        else:
            objs += [P(c, -.58, -.74, type='chili', rotY=-10, len=78, r=6), P(c, .62, -.72, type='lime', r=22),
                     dict(type='petals', pos=floor_at(c, 0, -.74), r=230, n=12, sx=1.5, sz=.5, seed=11)]
    c['objects'] = objs
    check(f'{kind}-{dr}', c)
    return shot(f'{kind}-{dr}-hero', c, dpr=dpr, fx=fx, out=f'{OUT}/{kind}-{dr}-hero.png')


def open_box(dr, dpr):
    c = base(dr, 'open', '#FF6A13' if dr == 'bazaar' else '#0F4D3F')
    c['surface'] = '#00A8A0' if dr == 'bazaar' else '#4B1D52'
    c['shadowColor'] = dark(c['surface'], .3); c['bounce'] = dark(c['surface'], .8)
    ill = BZ_ILL if dr == 'bazaar' else RY_ILL
    objs = [dict(type='clam', dir=dr, open=108, rotY=-8)]
    if dr == 'bazaar':
        objs += [dict(type='billboard', url=f'{ill}/set1/butter-chicken.svg', w=150, pos=[-44, -16, 14], lookCam=True),
                 dict(type='billboard', url=f'{ill}/set1/garlic-naan.svg', w=128, pos=[58, -10, -16], lookCam=True),
                 ]
        objs += [dict(type='marigold', pos=[-210, 0, 120], r=20, seed=12), dict(type='petals', pos=[0, 0, 80], r=280, n=24, seed=13),
                 dict(type='lime', pos=[200, 0, 140], r=21)]
    else:
        objs += [dict(type='billboard', url=f'{ill}/set1/butter-chicken.svg', w=150, pos=[-46, -14, 14], lookCam=True),
                 dict(type='billboard', url=f'{ill}/set1/tandoori-platter.svg', w=140, pos=[56, -16, -14], lookCam=True)]
        objs += [dict(type='lime', pos=[205, 0, 140], r=21), dict(type='marigold', pos=[-205, 0, 125], r=18, seed=14, colors=MARI_RED)]
    c.update(cam=cam(70, 1000, 30), target=[0, 70, -20], fov=24, objects=objs)
    return shot(f'openbox-{dr}', c, dpr=dpr, fx=dict(vigo=.32, hlo=.3), out=f'{OUT}/openbox-{dr}.png')


def flatlay(dr, dpr):
    royal = dr == 'royal'
    s = '#F4C9BB' if royal else '#00A8A0'
    c = dict(surface=s, shadowColor=dark(s, .4 if royal else .3), key=[-800, 1600, -650], keyI=2.5, fillI=.8, envI=.6, bounce=dark(s, .85),
             shadowRadius=16, shadowBox=560)
    R = MARI_RED if royal else MARI
    objs = [
        dict(type='tray', dir=dr, pull=58, rotY=4, pos=[-150, 0, -262], food=[dict(tex='food-naan', w=84, d=150, x=80, y=10)]),
        dict(type='tub', dir=dr, rotY=0, pos=[196, 0, -282]),
        dict(type='clam', dir=dr, rotY=-8, pos=[118, 0, -40]),
        dict(type='handi', dir=dr, rotY=0, pos=[-182, 0, -18]),
        dict(type='pail', dir=dr, rotY=16, pos=[-160, 0, 236], handleUp=False),
        dict(type='cutlery', dir=dr, rotY=-58, pos=[72, 0, 236]),
        dict(type='lime', pos=[236, 0, 190], r=22), dict(type='lime', pos=[-36, 0, 118], r=19),
        dict(type='chili', pos=[-18, 0, -150], rotY=70, len=76, r=5.5), dict(type='chili', pos=[248, 0, 318], rotY=-150, len=66, r=5, color='#2E7D32'),
        dict(type='marigold', pos=[260, 0, 90], r=20, seed=31, colors=R), dict(type='marigold', pos=[-30, 0, 340], r=17, seed=32, colors=R),
        dict(type='marigold', pos=[-270, 0, 128], r=17, seed=33, colors=R),
        dict(type='petals', pos=[0, 0, 40], r=340, n=40, seed=34, sx=.85, colors=R),
    ]
    c.update(cam=[0, 2160, 1], up=[0, 0, -1], target=[0, 0, 10], fov=22, objects=objs)
    return shot(f'flatlay-{dr}', c, dpr=dpr, fx=dict(vigo=.24, hlo=.22, hx='30%', hy='25%'), out=f'{OUT}/flatlay-{dr}.png')


if __name__ == '__main__':
    dpr = float(sys.argv[1]) if len(sys.argv) > 1 else 2
    jobs = []
    for dr in ('bazaar', 'royal'):
        for k in ('pail', 'clam', 'tub', 'handi', 'tray'):
            jobs.append(hero(dr, k, dpr))
        jobs.append(open_box(dr, dpr))
        jobs.append(flatlay(dr, dpr))
    if dpr < 2:
        for j in jobs:
            j['out'] = j['out'].replace(OUT + '/', OUT + '/_qa/lo-')
    json.dump(jobs, open('jobs.json', 'w'), indent=1)
    print(len(jobs), 'jobs')

"""Builds shot HTML pages (three.js scene configs) + jobs.json for render_many.js"""
import json, os, sys, math
from faces import D
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = '/home/user/playground/hub/packaging/assets/boxes'
os.makedirs(HERE + '/shots', exist_ok=True)

def dims_json():
    d = json.loads(json.dumps(D))
    return d

FX = '''<svg id="fx" width="{w}" height="{h}" viewBox="0 0 {w} {h}" aria-hidden="true">
<defs><filter id="n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
<radialGradient id="vg" cx="50%" cy="46%" r="75%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="{vig}" stop-opacity="{vigo}"/></radialGradient>
<radialGradient id="hl" cx="{hx}" cy="{hy}" r="60%"><stop offset="0" stop-color="#fff" stop-opacity="{hlo}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
<rect width="100%" height="100%" fill="url(#hl)" style="mix-blend-mode:soft-light"/>
<rect width="100%" height="100%" fill="url(#vg)" style="mix-blend-mode:multiply"/>
<rect width="100%" height="100%" filter="url(#n)" opacity="{grain}" style="mix-blend-mode:overlay"/>
{overlay}</svg>'''

def shot(name, cfg, w=800, h=1000, dpr=2, fx=None, overlay='', out=None):
    fx = fx or {}
    cfg = dict(cfg)
    cfg.update(w=w, h=h, dpr=dpr, tex=HERE + '/tex', dims=dims_json())
    html = f'''<!doctype html><html><head><meta charset="utf-8"><style>
html,body{{margin:0;width:{w}px;height:{h}px;overflow:hidden;background:{cfg['surface']}}}
#gl{{position:absolute;left:0;top:0;width:{w}px;height:{h}px}}#fx{{position:absolute;left:0;top:0;pointer-events:none}}
</style></head><body><canvas id="gl"></canvas>
{FX.format(w=w, h=h, vig=fx.get('vig', '#000'), vigo=fx.get('vigo', .28), hx=fx.get('hx', '35%'), hy=fx.get('hy', '20%'), hlo=fx.get('hlo', .35), grain=fx.get('grain', .10), overlay=overlay)}
<script type="module">import {{render}} from '{HERE}/engine.js'; render({json.dumps(cfg)}).catch(e=>{{console.error(e.stack||e);document.body.insertAdjacentHTML('beforeend','<i id=done></i>')}});</script></body></html>'''
    p = f'{HERE}/shots/{name}.html'
    open(p, 'w').write(html)
    return dict(html=p, out=out or f'{OUT}/_qa/{name}.png', w=w, h=h, dpr=dpr)

import subprocess, json, os, sys
from PIL import Image
D = '/home/user/playground/hub/interiors/assets/murals/'
SRC = D + '_src/'
if '--nobuild' not in sys.argv:
    for b in ['build_neon.py', 'build_map.py', 'build_gateway.py', 'build_quiet.py', 'build_prints.py']:
        subprocess.run(['python3', SRC + b], check=True, cwd=SRC)
P = []  # id, title, direction, w, h, scale, caption, tags
def add(i, t, d, w, h, cap, tags, sc=1): P.append(dict(id=i, title=t, direction=d, vw=w, vh=h, sc=sc, caption=cap, tags=tags))
add('bz-district-map-16x9', 'The District Map · mural 16:9', 'bazaar', 1920, 1080, 'All eight menu zones as a walkable bazaar map, so guests find their order on the wall before the menu.', ['mural', 'hero'])
add('bz-district-map-9x16', 'The District Map · tall wall 9:16', 'bazaar', 1080, 1920, 'The same map stacked for a tall wall or host-stand column; it reads top to bottom like a stroll.', ['mural', 'hero'])
add('ry-gateway-9x16', 'The Gateway · mural 9:16', 'royal', 1080, 1920, 'Nested gold-lined arches open onto a sunset as spices drift up from a copper handi: date-night drama with no clichés.', ['mural', 'hero'])
add('ry-gateway-16x9', 'The Gateway · panorama 16:9', 'royal', 1920, 1080, 'Wide version: backlit jali side arches flank the sunset gateway, with brass vessels on one long ledge.', ['mural', 'hero'])
add('bz-marigold-chai', 'Marigold & Chai · garland wall', 'bazaar', 1920, 1080, 'A quieter wall: one pulled-chai pour framed by marigold strands, made for the chai counter.', ['mural', 'quiet'])
add('ry-spice-botanical', 'Spice Botanical · fine-line frieze', 'royal', 2400, 675, 'Eight real spice plants in gold hairline with botanical names, a frieze band that adds calm luxury over banquettes.', ['mural', 'frieze', 'quiet'])
for d, pre, items in [('bazaar', 'bz', [('wordmark', 'Wordmark neon', 'Bowlby outline tubes plus the DISTRICT street-sign plate: the logo, translated faithfully into light.'),
                                       ('emblem', 'Emblem neon', 'Gate, sun-bowl, steam and bunting as single-line tubes, readable from across the room.'),
                                       ('chai-time', '“Chai Time” neon', 'Original hand-drawn monoline script with a cutting-chai glass, made for the chai counter.'),
                                       ('naan-stop', '“Naan Stop” neon', 'Loud Bazaar pun in chunky outline tubes with a blistered naan, an easy photo by the bread station.'),
                                       ('order-here', '“Order here” counter neon', 'Clear wayfinding: an aqua caps line and a bent arrow landing on the counter.'),
                                       ('flicker', 'Neon flicker-hint frames', 'Power-on strike sequence, from off to steady, ready for a reel opener.')]),
                      ('royal', 'ry', [('wordmark', 'Wordmark neon', 'Fraunces “Curry” in outline tubes over spaced DISTRICT: serif neon that matches the Royal logo.'),
                                       ('emblem', 'Emblem neon', 'Mughal arch, cusped inner arch, handi and three steam ribbons in gold and ruby light.'),
                                       ('chai-time', '“Chai Time” neon', 'Monoline script under a brass-kettle outline, in warm gold on emerald plaster.'),
                                       ('slow-simmered', '“Slow-simmered” script neon', 'The brand line as a hand-drawn gold script with a ruby swash, the calm sign for the dining room.'),
                                       ('order-here', '“Order here” counter neon', 'Elegant script and a ruby arrow over a brass-topped counter.'),
                                       ('flicker', 'Neon flicker-hint frames', 'Strike sequence for “Slow-simmered”, from off to steady glow.')])]:
    for k, t, cap in items:
        add(f'{pre}-neon-{k}', t, d, 1200, 1500, cap, ['neon', 'signage'])
add('bz-gallery-wall', 'Gallery wall · six prints', 'bazaar', 1600, 1000, 'Six framed prints in a salon hang over a bench, in loud frames with hard sticker shadows.', ['print', 'gallery-wall'])
add('bz-print-set', 'Print set · six posters', 'bazaar', 1600, 1200, 'Spice of the week, chai wisdom, two dish portraits, the map mini and a dum-sealing technique card.', ['print'])
add('ry-gallery-wall', 'Gallery wall · six prints', 'royal', 1600, 1000, 'Brass frames and ivory mats on plum above emerald panelling, like a private dining room.', ['print', 'gallery-wall'])
add('ry-print-set', 'Print set · six posters', 'royal', 1600, 1200, 'Saffron study, chai wisdom, arch-framed dish portraits, a fine-line district plan and a technique card.', ['print'])
for d, pre, names in [('bazaar', 'bz', [('spice', 'Spice of the week · Cardamom'), ('chai', 'Chai wisdom'), ('biryani', 'Dish portrait · Biryani'), ('butter', 'Dish portrait · Butter chicken'), ('map', 'District map mini'), ('recipe', 'How a dum biryani is sealed')]),
                      ('royal', 'ry', [('spice', 'Spice of the week · Saffron'), ('chai', 'Chai wisdom'), ('biryani', 'Dish portrait · Biryani'), ('butter', 'Dish portrait · Butter chicken'), ('map', 'The District · fine-line plan'), ('recipe', 'How a dum biryani is sealed')])]:
    for k, t in names:
        cap = {'spice': 'A rotating spice poster gives regulars something new to read each week.', 'chai': 'A non-religious chai quote, warm and shareable.',
               'biryani': 'Hero dish on its own, labelled with its menu district.', 'butter': 'The best-known dish, framed as a portrait.',
               'map': 'A print-size map so the district idea follows guests to the table.', 'recipe': 'Generic technique only (layer, seal, dum, open), with no house-recipe claims.'}[k]
        add(f'{pre}-print-{k}', t, d, 600, 900, cap, ['print', 'poster'], sc=1.5)
add('bz-selfie-wall', 'Instagram corner · #CurryDistrict', 'bazaar', 1080, 1350, 'A painted arch, a neon inside, a cane stool and a “say paneer” floor sticker: the photo nearly takes itself.', ['selfie-wall', 'neon'])
add('ry-selfie-wall', 'Instagram corner · #CurryDistrict', 'royal', 1080, 1350, 'An emerald arch alcove with gold beading, backlit brass jali, a ruby pouf and a brass hashtag plaque.', ['selfie-wall', 'neon'])
add('production-notes', 'Mural & sign production notes', 'both', 1080, 1920, 'Paint vs. print vs. hybrid, sizes, lead times and approx. costs from the research brief, all flagged approx.', ['production', 'notes'])
jobs = [{'svg': D + p['id'] + '.svg', 'png': D + p['id'] + '.png', 'w': p['vw'], 'h': p['vh'], 'scale': p['sc']} for p in P]
json.dump(jobs, open(SRC + 'jobs.json', 'w'))
if '--norender' not in sys.argv:
    subprocess.run(['node', SRC + 'render.js', SRC + 'jobs.json'], check=True)
items = []
for p in P:
    png = D + p['id'] + '.png'
    im = Image.open(png).convert('RGB')
    W, H = im.size
    tw = 480 if W >= H else 400
    th = round(H * tw / W)
    t = im.resize((tw, th), Image.LANCZOS)
    q = 84
    while True:
        t.save(D + p['id'] + '-thumb.jpg', quality=q, optimize=True, progressive=True)
        if os.path.getsize(D + p['id'] + '-thumb.jpg') <= 100_000 or q < 40: break
        q -= 6
    items.append(dict(id=p['id'], title=p['title'], direction=p['direction'], type='image', src=f'assets/murals/{p["id"]}.png',
                      thumb=f'assets/murals/{p["id"]}-thumb.jpg', w=W, h=H, caption=p['caption'], tags=p['tags'], download=f'assets/murals/{p["id"]}.svg'))
json.dump({'helper': 'murals', 'items': items}, open(D + 'manifest.json', 'w'), indent=1, ensure_ascii=False)
print(len(items), 'items; max thumb', max(os.path.getsize(D + i['id'] + '-thumb.jpg') for i in items), 'bytes')

import json, os
from PIL import Image
B = '/home/user/playground/hub/packaging/assets/boxes'
CAP = {
 'pail': ('Takeout pail 26 oz', 'pail', {'bazaar': 'Saffron booti wrap + chunky arch wordmark; spice dots on the flap tell the pass which order is whose.',
                                          'royal': 'One saffron-gold hit on midnight — a jali-banded pail that reads premium from delivery-bag distance.'}),
 'clam': ('Kraft clamshell 9×6 + belly band', 'box', {'bazaar': 'Stock kraft box, printed band does the branding — cheap to run, impossible to miss, stamp-sealed.',
                                                       'royal': 'Midnight board + emerald foil band: a one-colour sleeve that turns a stock clamshell into a gift.'}),
 'tub': ('Deli tub 16 oz + lid sleeve', 'tub', {'bazaar': 'Sleeve + lid label on a stock tub; dish write-in and spice dots make every curry identifiable at a glance.',
                                                 'royal': 'Emerald sleeve and foil lid medallion — the everyday curry tub dressed for date night.'}),
 'handi': ('Handi biryani box', 'handi', {'bazaar': 'The signature: a handi-shaped box with rim band, domed lid and steam-vent slots — biryani you can spot across a room.',
                                          'royal': 'Domed handi in midnight and gold, vents with foil steam curls — a family biryani that arrives like an occasion.'}),
 'tray': ('2-compartment drawer tray', 'tray', {'bazaar': 'Matchbox-style drawer: curry + rice one side, naan the other; pulling it open is the unboxing moment.',
                                                'royal': 'Sleeve-and-drawer combo in midnight and emerald — slide, lift, linger.'}),
}
DL = {'pail-wrap': ('Pail wrap dieline', 'pail'), 'clamshell-band': ('Clamshell belly-band dieline', 'box'), 'tub-lid-sleeve': ('Tub lid sleeve + label dieline', 'tub')}
items = []
def thumb(png):
    im = Image.open(png).convert('RGB')
    t = im.resize((800, round(800 * im.height / im.width)), Image.LANCZOS)
    out = png[:-4] + '-thumb.jpg'
    for q in (84, 78, 72, 66, 60, 54):
        t.save(out, 'JPEG', quality=q, optimize=True, progressive=True)
        if os.path.getsize(out) <= 120 * 1024: break
    return out
def opt_png(png):
    im = Image.open(png)
    if im.width > 1600:
        im = im.resize((1600, round(1600 * im.height / im.width)), Image.LANCZOS)
    im.convert('RGB').save(png, optimize=True)
def add(id_, title, dr, png, cap, tags, dl):
    p = f'{B}/{png}'
    if not os.path.exists(p): print('MISSING', png); return
    opt_png(p); t = thumb(p); im = Image.open(p)
    items.append(dict(id=id_, title=title, direction=dr, type='image', src=f'assets/boxes/{png}', thumb=f'assets/boxes/{os.path.basename(t)}',
                      w=im.width, h=im.height, caption=cap, tags=tags, download=f'assets/boxes/{dl}'))
for dr in ('bazaar', 'royal'):
    L = 'A · Bazaar' if dr == 'bazaar' else 'B · Royal'
    for k, (title, tag, caps) in CAP.items():
        dl = {'pail': f'dieline-pail-wrap-{dr}.svg', 'clam': f'dieline-clamshell-band-{dr}.svg', 'tub': f'dieline-tub-lid-sleeve-{dr}.svg',
              'handi': f'art/handi-{dr}-lid.svg', 'tray': f'art/tray-{dr}-lid.svg'}[k]
        add(f'{k}-{dr}-hero', f'{title} — {L}', dr, f'{k}-{dr}-hero.png', caps[dr], ['box', tag, 'mockup', dr], dl)
    add(f'flatlay-{dr}', f'Family flat-lay — {L}', dr, f'flatlay-{dr}.png',
        ('All five containers share one saffron + block-print system, so any single piece is recognisably Curry District.' if dr == 'bazaar'
         else 'Five containers, one colour discipline: midnight, emerald and a single gold foil — premium by restraint.'),
        ['box', 'family', 'flatlay', dr], f'art/clamshell-{dr}-lid.svg')
    add(f'openbox-{dr}', f'Open box reveal — {L}', dr, f'openbox-{dr}.png',
        ('Lift the lid: “You earned this naan.” — a hidden line built for the unboxing photo.' if dr == 'bazaar'
         else 'Lift the lid: “Slow-simmered. Tandoor-fired.” in quiet serif — the brand line at the moment of steam.'),
        ['box', 'open', 'mockup', dr], f'art/clamshell-{dr}-inside-lid.svg')
for dr in ('bazaar', 'royal'):
    L = 'A · Bazaar' if dr == 'bazaar' else 'B · Royal'
    for k, (title, tag) in DL.items():
        add(f'dieline-{k}-{dr}', f'{title} — {L}', dr, f'dieline-{k}-{dr}.png',
            'Dieline sheet: cut, dashed folds, 3 mm bleed, safe zone, indicative dimensions — confirm with supplier template.',
            ['dieline', tag, dr], f'dieline-{k}-{dr}.svg')
json.dump(dict(helper='boxes', items=items), open(f'{B}/manifest.json', 'w'), indent=1, ensure_ascii=False)
print(len(items), 'items')
for f in sorted(os.listdir(B)):
    if f.endswith(('.png', '.jpg')): print(f, os.path.getsize(f'{B}/{f}') // 1024, 'KB')

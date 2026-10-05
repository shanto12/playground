"""Thumbs (<=100 KB JPG) + manifest.json for the hub (paths relative to hub/social/)."""
import json, os
from PIL import Image

KIT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = 'assets/royal-kit/'
GBP_NOTE = ' Spec from playbook secondary sources (unverified); check the GBP dashboard.'
ITEMS = [
    # id, title, tags, caption
    ('post-hero-butter-chicken', 'Hero dish · Butter Chicken', ['post'], 'One focal point: the most-ordered dish glowing in a gold arch window on midnight.'),
    ('post-zone-biryani-boulevard', 'Zone feature · Biryani Boulevard', ['post'], 'The District street-sign plaque turns the menu into a map; real listed dishes, no prices.'),
    ('post-zone-tandoor-quarter', 'Zone feature · Tandoor Quarter', ['post'], 'Same plaque system on ruby, so every zone post is instantly part of one series.'),
    ('post-spice-meter', 'Spice meter', ['post'], 'Five gold-line chilies that grow and fill; honest copy that even Mild carries warmth.'),
    ('post-daily-special-template', 'Daily special · template', ['post'], 'Numbered dashed zones show staff exactly what to swap: date, art, name, line, tags.'),
    ('post-daily-special-example', 'Daily special · filled example', ['post'], 'The template filled with a listed vegetarian dish; ivory tile adds rhythm to the grid.'),
    ('post-ratings-card', 'Ratings card', ['post'], 'Only sourced public ratings, labelled "as listed publicly, Oct 2026"; no invented quotes.'),
    ('post-order-online-qr', 'Order online · sample QR', ['post'], 'Arch-framed QR lookalike (non-scannable SAMPLE) shows where the real ordering link goes.'),
    ('post-catering-celebrations', 'Catering & celebrations', ['post'], 'Peacock field and a wide arch say occasion; CTA is a conversation, not a deal.'),
    ('post-did-you-know-dum', 'Did you know · Dum', ['post'], 'Save-worthy culinary note: what "dum" means, told in one accurate, generic sentence.'),
    ('post-did-you-know-tandoor', 'Did you know · Tandoor', ['post'], 'Gold-line tandoor medallion plus a plain-English fact about how naan bakes.'),
    ('post-chefs-pick-template', "Chef's pick · template", ['post'], 'Seal-badged template with no invented chef; numbered zones for dish, line and tags.'),
    ('post-chefs-pick-example', "Chef's pick · filled example", ['post'], 'Chilli Chicken in a ruby window: Indo-Chinese Alley gets its own jewel moment.'),
    ('story-dinner-occasion', 'Story · Dinner, made an occasion', ['story'], 'The palace dining-room scene as a full-bleed story; copy and CTA sit inside safe zones.'),
    ('story-spice-poll', 'Story · Spice poll', ['story'], 'Three tappable-looking heat cards; invites replies (calendar day 3).'),
    ('story-garlic-naan-order', 'Story · Garlic naan order', ['story'], 'Big sensory headline plus an Order online pill placed above the reply bar.'),
    ('story-diwali-gathering', 'Story · Diwali gatherings', ['story'], 'Diyas, embers and a sweet finish; asks people to call about catering, no date or offer.'),
    ('story-safe-zone-guide', 'Story safe-zone guide', ['story'], 'All four stories with approximate app-overlay bands marked; verify in-app.'),
    ('highlight-menu', 'Highlight cover · Menu', ['highlight'], 'Gold-line icon on a jewel disc; the circle crop stays clear at highlight size.'),
    ('highlight-biryani', 'Highlight cover · Biryani', ['highlight'], 'Emerald disc, handi icon; reads at roughly 64 px.'),
    ('highlight-tandoor', 'Highlight cover · Tandoor', ['highlight'], 'Ruby disc, tandoor icon from the brand icon set.'),
    ('highlight-curry', 'Highlight cover · Curry', ['highlight'], 'Peacock disc, curry bowl icon.'),
    ('highlight-sweets', 'Highlight cover · Sweets', ['highlight'], 'Plum disc, gulab jamun icon.'),
    ('highlight-catering', 'Highlight cover · Catering', ['highlight'], 'Emerald disc, party-tray icon.'),
    ('highlight-order', 'Highlight cover · Order', ['highlight'], 'Ruby disc, shopping-bag icon.'),
    ('highlight-visit', 'Highlight cover · Visit', ['highlight'], 'Peacock disc, map-pin icon.'),
    ('highlight-covers-preview', 'Highlight row preview', ['highlight'], 'All eight covers as profile circles: four jewel tones repeating in rhythm.'),
    ('profile-avatar', 'Profile avatar', ['cover'], 'Built from the Royal logo; all art sits inside the circle crop.'),
    ('profile-avatar-sizes', 'Avatar at real sizes', ['cover'], 'Checks the avatar from 320 px down to 56 px in comments.'),
    ('facebook-cover', 'Facebook cover 1640×856', ['cover'], 'Hero dining room on the right, headline in the zone safe for both desktop and mobile crops.'),
    ('facebook-cover-crop-guide', 'Facebook cover · crop guide', ['cover'], 'Approximate desktop and mobile crops marked (unverified spec; check after upload).'),
    ('gbp-cover', 'GBP cover 1600×900 (16:9)', ['gbp', 'cover'], 'Centred arch triptych survives Google cropping; no text. Use until the real photo shoot.' + GBP_NOTE),
    ('gbp-logo', 'GBP logo 720×720', ['gbp'], 'Emblem only, so it stays legible in a tiny square or circle.' + GBP_NOTE),
    ('gbp-post-update', 'GBP post 1200×900 · Update', ['gbp', 'post'], 'A 4:3 update post with a short line and the dish centred.' + GBP_NOTE),
    ('gbp-post-order', 'GBP post 1200×900 · Order', ['gbp', 'post'], 'A 4:3 post pairing the Order online CTA with butter chicken.' + GBP_NOTE),
    ('gbp-tile-butter-chicken', 'GBP photo tile · Butter Chicken', ['gbp'], 'A 1:1 tile at 1600 px for posts and products. Google favours real photos in the gallery.' + GBP_NOTE),
    ('gbp-tile-biryani', 'GBP photo tile · Biryani', ['gbp'], 'A 1:1 biryani tile on emerald, subject centred for Google crops.' + GBP_NOTE),
    ('gbp-tile-garlic-naan', 'GBP photo tile · Garlic Naan', ['gbp'], 'A 1:1 naan tile on ruby; completes a three-colour set.' + GBP_NOTE),
    ('feed-grid-preview', 'Feed grid 3×4 preview', ['grid'], 'Twelve posts in a generic phone at 3:4 crops: a cohesive jewel-tone mosaic.'),
    ('feed-rhythm-board', 'Feed rhythm · 4-week plan', ['grid'], "The playbook's calendar mapped to kit assets day by day; unverified posts are held."),
    ('motion-steam-glints', 'Motion · Steam & glints', ['motion'], 'A 6-second loop: steam rises and gold glints flicker off the karahi.'),
    ('motion-foil-wordmark', 'Motion · Foil shimmer', ['motion'], 'A 6-second loop: a foil light sweep runs across the wordmark, with sparkles.'),
    ('motion-ember-arch', 'Motion · Embers past the arch', ['motion'], 'A 6-second loop: embers drift up past the arch from the tandoori platter.'),
]

def thumb(src, dst, w=480):
    im = Image.open(src).convert('RGB')
    h = round(im.height * w / im.width)
    im = im.resize((w, h), Image.LANCZOS)
    for q in (82, 76, 70, 62, 54, 46):
        im.save(dst, 'JPEG', quality=q, optimize=True, progressive=True)
        if os.path.getsize(dst) <= 100_000:
            return
    raise SystemExit('thumb too big ' + dst)

items = []
for id_, title, tags, cap in ITEMS:
    video = id_.startswith('motion')
    src = os.path.join(KIT, id_ + ('.mp4' if video else '.png'))
    still = os.path.join(KIT, id_ + ('.jpg' if video else '.png'))
    assert os.path.exists(src) and os.path.exists(still), id_
    w, h = Image.open(still).size
    thumb(still, os.path.join(KIT, id_ + '-thumb.jpg'))
    it = {'id': 'royal-' + id_, 'title': title, 'direction': 'royal', 'type': 'video' if video else 'image',
          'src': B + id_ + ('.mp4' if video else '.png'), 'thumb': B + id_ + '-thumb.jpg', 'w': w, 'h': h,
          'caption': cap, 'tags': tags, 'download': B + id_ + ('.mp4' if video else '.png')}
    if video:
        it['poster'] = B + id_ + '.jpg'
    items.append(it)
json.dump({'helper': 'royal-kit', 'items': items}, open(os.path.join(KIT, 'manifest.json'), 'w'), indent=1, ensure_ascii=False)
big = [(f, os.path.getsize(os.path.join(KIT, f))) for f in os.listdir(KIT) if f.endswith('-thumb.jpg') and os.path.getsize(os.path.join(KIT, f)) > 100_000]
print(len(items), 'items; oversize thumbs:', big)

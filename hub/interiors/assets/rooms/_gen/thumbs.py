# thumbs.py OUT id... → <id>-thumb.jpg (≤100 KB), and re-save PNGs optimised
import sys, os
from PIL import Image
out = sys.argv[1]
for i in sys.argv[2:]:
    p = os.path.join(out, i + '.png')
    if not os.path.exists(p):
        continue
    im = Image.open(p).convert('RGB')
    w, h = im.size
    tw = 720 if w >= h else 560
    th = round(h * tw / w)
    t = im.resize((tw, th), Image.LANCZOS)
    q = 82
    tp = os.path.join(out, i + '-thumb.jpg')
    while True:
        t.save(tp, 'JPEG', quality=q, optimize=True, progressive=True)
        if os.path.getsize(tp) <= 100_000 or q <= 40:
            break
        q -= 6
    Image.open(p).save(p, 'PNG', optimize=True)
    print('thumb', i, os.path.getsize(tp) // 1024, 'KB q', q, '| png', os.path.getsize(p) // 1024, 'KB')

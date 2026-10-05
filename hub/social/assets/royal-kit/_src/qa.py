"""Phone-size QA montage: python3 qa.py out.png file1.png file2.png ... [--w 390] [--cols 3]
Each image is resized to the given width (default 390 = iPhone CSS width) and tiled."""
import sys
from PIL import Image, ImageDraw

args = sys.argv[1:]
w = 390
cols = 3
if '--w' in args:
    i = args.index('--w'); w = int(args[i + 1]); del args[i:i + 2]
if '--cols' in args:
    i = args.index('--cols'); cols = int(args[i + 1]); del args[i:i + 2]
out, files = args[0], args[1:]
ims = []
for f in files:
    im = Image.open(f).convert('RGB')
    h = round(im.height * w / im.width)
    ims.append((f.split('/')[-1], im.resize((w, h), Image.LANCZOS)))
rows = [ims[i:i + cols] for i in range(0, len(ims), cols)]
H = sum(max(im.height for _, im in r) + 24 for r in rows)
sheet = Image.new('RGB', (cols * (w + 12) + 12, H + 12), (60, 60, 60))
d = ImageDraw.Draw(sheet)
y = 12
for r in rows:
    x = 12
    for name, im in r:
        sheet.paste(im, (x, y + 18))
        d.text((x, y + 2), name[:60], fill=(255, 255, 255))
        x += w + 12
    y += max(im.height for _, im in r) + 24
sheet.save(out)
print(out, sheet.size)

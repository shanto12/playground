# QA contact sheet: python3 sheet.py out.png width cols file1 file2 ...
import sys
from PIL import Image, ImageDraw
out, w, cols = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
files = sys.argv[4:]
ims = []
for f in files:
    im = Image.open(f).convert('RGB'); h = round(im.height * w / im.width)
    ims.append(im.resize((w, h), Image.LANCZOS))
rows = (len(ims) + cols - 1) // cols; g = 12
rh = [max(im.height for im in ims[r*cols:(r+1)*cols]) for r in range(rows)]
S = Image.new('RGB', (cols * w + (cols + 1) * g, sum(rh) + (rows + 1) * g), (128, 128, 128))
y = g
for r in range(rows):
    x = g
    for im in ims[r*cols:(r+1)*cols]:
        S.paste(im, (x, y)); x += w + g
    y += rh[r] + g
S.save(out)

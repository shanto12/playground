#!/usr/bin/env python3
"""Contact sheet for QA: sheet.py out.png cols width img1 img2 ... (labels = file names)"""
import sys
from PIL import Image, ImageDraw
out, cols, cw = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
ims = [Image.open(p).convert('RGB') for p in sys.argv[4:]]
ch = int(cw * ims[0].height / ims[0].width)
rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * (cw + 8) + 8, rows * (ch + 30) + 8), (40, 40, 40))
d = ImageDraw.Draw(S)
for i, (im, p) in enumerate(zip(ims, sys.argv[4:])):
    x, y = 8 + (i % cols) * (cw + 8), 8 + (i // cols) * (ch + 30)
    S.paste(im.resize((cw, ch), Image.LANCZOS), (x, y + 22))
    d.text((x, y + 4), p.split('/')[-1], fill=(255, 255, 255))
S.save(out)

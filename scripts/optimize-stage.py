#!/usr/bin/env python3
"""Shrink the STAGED hub copy: convert large PNGs to WebP and rewrite references.
Source files in the repo are never touched. Manifest `download` PNGs are converted too (the pitch hub is a presentation copy; full-res originals stay in the repo).
usage: optimize-stage.py /tmp/cd-dist/hub"""
import os, re, sys, subprocess, json, collections
root = sys.argv[1]; MIN = 250 * 1024
pngs = []; refs_dl = set(); text_files = []
for d, _, fs in os.walk(root):
    for f in fs:
        p = os.path.join(d, f)
        if f.lower().endswith('.png'): pngs.append(p)
        elif f.lower().endswith(('.html', '.json', '.css', '.js', '.webmanifest')): text_files.append(p)
for p in text_files:
    if p.endswith('.json'):
        try:
            for m in re.finditer(r'"download"\s*:\s*"([^"]+\.png)"', open(p, encoding='utf-8', errors='ignore').read()):
                refs_dl.add(os.path.basename(m.group(1)))
        except Exception: pass
cnt = collections.Counter(os.path.basename(p) for p in pngs)
conv = {}; saved = 0
for p in pngs:
    b = os.path.basename(p)
    if os.path.getsize(p) < MIN or '/downloads/' in p or '/qr/' in p: continue
    w = p[:-4] + '.webp'
    r = subprocess.run(['convert', p, '-quality', '86', '-define', 'webp:method=4', w], capture_output=True)
    if r.returncode or not os.path.exists(w): continue
    if os.path.getsize(w) < 0.75 * os.path.getsize(p):
        saved += os.path.getsize(p) - os.path.getsize(w); os.remove(p)
        key = (os.path.basename(os.path.dirname(p)) + '/' + b) if cnt[b] > 1 else b   # path-qualify colliding names
        conv[key] = key[:-4] + '.webp'
    else: os.remove(w)
if conv:
    pat = re.compile('|'.join(re.escape(k) for k in sorted(conv, key=len, reverse=True)))
    for p in text_files:
        s = open(p, encoding='utf-8', errors='ignore').read()
        n = pat.sub(lambda m: conv[m.group(0)], s)
        if n != s: open(p, 'w', encoding='utf-8').write(n)
print(f'converted {len(conv)} PNGs to WebP, saved {saved/1048576:.0f} MB')

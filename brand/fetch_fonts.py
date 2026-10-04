#!/usr/bin/env python3
"""Download latin-subset woff2 files for the brand fonts and emit brand/fonts/fonts.css with relative urls."""
import re, urllib.request, os, hashlib
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
OUT = os.path.join(os.path.dirname(__file__), "fonts")
FAMILIES = [
  "Bowlby+One",
  "DM+Sans:wght@400;500;700",
  "Caveat:wght@600;700",
  "Fraunces:ital,wght@0,400;0,600;0,800;1,400;1,600",
  "Hanken+Grotesk:wght@400;500;700",
]
url = "https://fonts.googleapis.com/css2?" + "&".join("family=" + f for f in FAMILIES) + "&display=swap"
css = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA})).read().decode()
blocks = re.findall(r"/\* ([\w-]+) \*/\s*(@font-face \{.*?\})", css, re.S)
out, seen = [], {}
for subset, block in blocks:
    if subset != "latin":
        continue
    m = re.search(r"url\((https://[^)]+\.woff2)\)", block)
    src = m.group(1)
    name = src.rsplit("/", 1)[-1]
    if name not in seen:
        data = urllib.request.urlopen(urllib.request.Request(src, headers={"User-Agent": UA})).read()
        open(os.path.join(OUT, name), "wb").write(data)
        seen[name] = len(data)
    out.append(block.replace(src, name))
open(os.path.join(OUT, "fonts.css"), "w").write("\n".join(out) + "\n")
print(len(out), "font-face rules,", len(seen), "files,", sum(seen.values()) // 1024, "KB")

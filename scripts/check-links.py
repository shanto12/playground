#!/usr/bin/env python3
"""Check local links/assets in the staged sites + manifest item paths.
usage: check-links.py /tmp/cd-dist"""
import os, re, sys, json, urllib.parse
root = sys.argv[1]; problems = []; checked = 0
ATTR = re.compile(r'''(href|src|poster|data-src|data-manifests|action)\s*=\s*["']([^"'#?][^"']*)''', re.I)
def exists(base_dir, ref, site_root):
    ref = urllib.parse.unquote(ref.split('#')[0].split('?')[0])
    if not ref or ref.startswith(('http:', 'https:', 'mailto:', 'tel:', 'data:', 'javascript:', '//', 'sms:', 'blob:')): return True
    p = os.path.join(site_root, ref.lstrip('/')) if ref.startswith('/') else os.path.normpath(os.path.join(base_dir, ref))
    if os.path.isdir(p): return os.path.exists(os.path.join(p, 'index.html'))
    return os.path.exists(p) or os.path.exists(p + '.html')
for site in sorted(os.listdir(root)):
    sroot = os.path.join(root, site)
    if not os.path.isdir(sroot): continue
    for d, _, fs in os.walk(sroot):
        for f in fs:
            p = os.path.join(d, f)
            if f.endswith('.html'):
                s = open(p, encoding='utf-8', errors='ignore').read()
                for m in ATTR.finditer(s):
                    for ref in (m.group(2).split(',') if m.group(1).lower()=='data-manifests' else [m.group(2)]):
                        ref = ref.strip(); checked += 1
                        if '{{' in ref or '${' in ref or ref.startswith('<'): continue
                        if re.fullmatch(r'[A-Za-z][A-Za-z0-9_-]*', ref) and not exists(d, ref, sroot): continue  # JS-filled config key (href="order")
                        if not exists(d, ref, sroot): problems.append((site, os.path.relpath(p, sroot), ref))
            elif f == 'manifest.json' and '/assets/' in p.replace('\\','/'):
                area = p[:p.replace('\\','/').index('/assets/')]
                try: items = json.load(open(p)).get('items', [])
                except Exception as e: problems.append((site, os.path.relpath(p, sroot), f'BAD JSON {e}')); continue
                for it in items:
                    for k in ('src', 'thumb', 'poster', 'download', 'href'):
                        v = it.get(k)
                        if v and not v.startswith(('http', '(')):
                            checked += 1
                            if not os.path.exists(os.path.join(area, v)): problems.append((site, os.path.relpath(p, sroot), f"{it.get('id')}:{k}={v}"))
print(f'checked {checked} references; {len(problems)} problems')
for pr in problems[:80]: print(' ', *pr)
if len(problems) > 80: print(f'  … and {len(problems)-80} more')
sys.exit(1 if problems else 0)

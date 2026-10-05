// Build thumbs (JPEG ≤100 KB) and manifest.json per the hub contract.
// Paths are relative to hub/social/ (the area folder).
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { KIT } = require('./lib');

const ORDER = ['post', 'motion', 'story', 'highlight', 'cover', 'gbp', 'grid'];
const all = [...require('./posts'), ...require('./motion'), ...require('./stories'), ...require('./profile'), ...require('./composites')];

const rel = f => 'assets/bazaar-kit/' + f;
const items = [];
for (const a of all) {
  const isVid = a.type === 'video';
  const src = isVid ? a.file + '.mp4' : a.file + '.png';
  if (!fs.existsSync(path.join(KIT, src))) throw new Error('missing ' + src);
  const thumbSrc = isVid ? a.file + '.jpg' : src;
  const thumb = a.file + '-thumb.jpg';
  execFileSync('python3', ['-c', `
import sys
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
W = 540 if im.height >= im.width else 720
import io
base = im
while True:
    im = base.resize((W, round(base.height * W / base.width)), Image.LANCZOS) if base.width > W else base
    for q in (84, 78, 72, 66):
        b = io.BytesIO(); im.save(b, 'JPEG', quality=q, optimize=True, progressive=True)
        if b.tell() <= 96_000: break
    if b.tell() <= 96_000: break
    W = int(W * 0.88)
open(out, 'wb').write(b.getvalue())
`, path.join(KIT, thumbSrc), path.join(KIT, thumb)]);
  const it = { id: 'bz-' + a.id, title: a.title, direction: 'bazaar', type: isVid ? 'video' : 'image', src: rel(src), thumb: rel(thumb) };
  if (isVid) it.poster = rel(a.file + '.jpg');
  Object.assign(it, { w: a.w, h: a.h, caption: a.caption, tags: (a.tags || []).filter(t => ORDER.includes(t)), download: rel(src) });
  items.push(it);
}
items.sort((x, y) => ORDER.indexOf(x.tags[0]) - ORDER.indexOf(y.tags[0]));
fs.writeFileSync(path.join(KIT, 'manifest.json'), JSON.stringify({ helper: 'bazaar-kit', items }, null, 2) + '\n');
console.log('manifest items:', items.length);

"""Curry District packaging — shared SVG helpers (fonts→outlines, brand asset inlining, patterns, motifs).
All geometry in millimetres. Output SVGs are self-contained (no external refs, no webfonts)."""
import re, math, functools, os
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

ROOT = '/home/user/playground'
BRAND = ROOT + '/brand'
FD = BRAND + '/fonts/'

FONT_FILES = {
    'bowlby': ('taiPGmVuC4y96PFeqp8sqomI_A.woff2', None),
    'dm400': ('rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K4.woff2', 400),
    'dm500': ('rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K4.woff2', 500),
    'dm700': ('rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K4.woff2', 700),
    'caveat': ('Wnz6HAc5bAfYB2Q7ZjYY.woff2', 700),
    'fr500': ('6NUu8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib14c7qv8.woff2', 500),
    'fr600': ('6NUu8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib14c7qv8.woff2', 600),
    'fr800': ('6NUu8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib14c7qv8.woff2', 800),
    'fri400': ('6NUs8FyLNQOQZAnv9ZwNjucMHVn85Ni7emAe9lKqZTnbB-gzTK0K1ChJdt9vIVYX9G37lvd9mv0iQg.woff2', 400),
    'fri500': ('6NUs8FyLNQOQZAnv9ZwNjucMHVn85Ni7emAe9lKqZTnbB-gzTK0K1ChJdt9vIVYX9G37lvd9mv0iQg.woff2', 500),
    'hk500': ('ieVn2YZDLWuGJpnzaiwFXS9tYtpd59A.woff2', 500),
    'hk600': ('ieVn2YZDLWuGJpnzaiwFXS9tYtpd59A.woff2', 600),
    'hk700': ('ieVn2YZDLWuGJpnzaiwFXS9tYtpd59A.woff2', 700),
}

# ── palettes ──────────────────────────────────────────────────────────
BZ = dict(ink='#1D1147', cream='#FFF4DC', marigold='#FFB000', saffron='#FF6A13', rani='#E4147E',
          chili='#D62839', peacock='#00A8A0', cilantro='#3FA34D', violet='#7B5CFF', kraft='#B9875A')
RY = dict(ink='#160B26', plum='#4B1D52', emerald='#0F4D3F', peacock='#117C86', ruby='#A3173F',
          gold='#E9A63A', goldlt='#F7D98A', golddk='#B7791F', ivory='#FBF3E4', blush='#F4C9BB', board='#1A1024')


@functools.lru_cache(None)
def font(key):
    fn, w = FONT_FILES[key]
    f = TTFont(FD + fn)
    if w is not None and 'fvar' in f:
        f = instancer.instantiateVariableFont(f, {'wght': w})
    gs = f.getGlyphSet()
    cmap = f.getBestCmap()
    hmtx = f['hmtx']
    upm = f['head'].unitsPerEm
    kern = {}
    # simple pair kerning from GPOS PairPos format1 (good enough for display lines)
    try:
        gpos = f['GPOS'].table
        for lk in gpos.LookupList.Lookup:
            if lk.LookupType != 2:
                continue
            for st in lk.SubTable:
                if getattr(st, 'Format', 0) == 1:
                    cov = st.Coverage.glyphs
                    for i, ps in enumerate(st.PairSet):
                        for pvr in ps.PairValueRecord:
                            v = pvr.Value1.XAdvance if pvr.Value1 is not None and hasattr(pvr.Value1, 'XAdvance') else 0
                            if v:
                                kern[(cov[i], pvr.SecondGlyph)] = v
                elif getattr(st, 'Format', 0) == 2:
                    cov = set(st.Coverage.glyphs)
                    cd1 = st.ClassDef1.classDefs if st.ClassDef1 else {}
                    cd2 = st.ClassDef2.classDefs if st.ClassDef2 else {}
                    st._cd = (cov, cd1, cd2)
                    kern.setdefault('_c2', []).append(st)
    except Exception:
        pass
    asc = f['hhea'].ascent
    return dict(gs=gs, cmap=cmap, hmtx=hmtx, upm=upm, kern=kern, asc=asc,
                cap=getattr(f['OS/2'], 'sCapHeight', int(asc * .7)))


def _kern(F, a, b):
    k = F['kern'].get((a, b), 0)
    if k:
        return k
    for st in F['kern'].get('_c2', []):
        cov, cd1, cd2 = st._cd
        if a in cov:
            c1 = cd1.get(a, 0); c2 = cd2.get(b, 0)
            try:
                v = st.Class1Record[c1].Class2Record[c2].Value1
                if v is not None and getattr(v, 'XAdvance', 0):
                    return v.XAdvance
            except Exception:
                pass
    return 0


def glyph_run(s, key, size, tracking=0.0):
    """Returns list of (glyphname, x_offset_mm, advance_mm) and total width (mm)."""
    F = font(key)
    sc = size / F['upm']
    x = 0.0
    out = []
    prev = None
    for ch in s:
        g = F['cmap'].get(ord(ch))
        if g is None:
            g = F['cmap'].get(ord('?'))
        if prev is not None:
            x += _kern(F, prev, g) * sc
        adv = F['hmtx'][g][0] * sc
        out.append((g, x, adv))
        x += adv + tracking * size
        prev = g
    width = x - (tracking * size if s else 0)
    return out, width


def glyph_path(key, g, size, dx, dy):
    F = font(key)
    sc = size / F['upm']
    pen = SVGPathPen(F['gs'], ntos=fmt)
    F['gs'][g].draw(TransformPen(pen, (sc, 0, 0, -sc, dx, dy)))
    return pen.getCommands()


def text_width(s, key, size, tracking=0.0):
    return glyph_run(s, key, size, tracking)[1]


def fmt(v):
    return ('%.2f' % v).rstrip('0').rstrip('.')


def text(s, key, size, x, y, anchor='start', fill='#000', tracking=0.0, maxw=None, attrs='', stroke=None, sw=0):
    """Outlined text as a single <path>. y = baseline. Returns svg string."""
    run, w = glyph_run(s, key, size, tracking)
    if maxw and w > maxw:
        f = maxw / w
        return text(s, key, size * f, x, y, anchor, fill, tracking, None, attrs, stroke, sw * f)
    x0 = x - (w / 2 if anchor == 'middle' else (w if anchor == 'end' else 0))
    parts = [glyph_path(key, g, size, x0 + ox, y) for g, ox, adv in run]
    st = ''
    if stroke:
        st = f' stroke="{stroke}" stroke-width="{fmt(sw)}" stroke-linejoin="round" paint-order="stroke"'
    return f'<path d="{"".join(p for p in parts if p)}" fill="{fill}"{st} {attrs}/>'


def text_size_for(s, key, maxw, size, tracking=0.0):
    w = text_width(s, key, size, tracking)
    return size if w <= maxw else size * maxw / w


def text_on_arc(s, key, size, cx, cy, r, mid_angle_deg, fill='#000', tracking=0.0, inside=False, attrs=''):
    """Glyph-by-glyph text along a circle. mid_angle 0 = up (12 o'clock), clockwise positive.
    Baseline sits on radius r. If inside=True text reads counter-clockwise along the bottom (upright at bottom)."""
    run, w = glyph_run(s, key, size, tracking)
    total_ang = w / r  # radians
    parts = []
    for g, ox, adv in run:
        d = glyph_path(key, g, size, -adv / 2, 0)
        if not d:
            continue
        cxg = ox + adv / 2
        if not inside:
            a = math.radians(mid_angle_deg) - total_ang / 2 + cxg / r
            gx = cx + r * math.sin(a); gy = cy - r * math.cos(a)
            rot = math.degrees(a)
        else:
            a = math.radians(mid_angle_deg) + total_ang / 2 - cxg / r
            gx = cx + r * math.sin(a); gy = cy - r * math.cos(a)
            rot = math.degrees(a) + 180
        parts.append(f'<path d="{d}" transform="translate({fmt(gx)} {fmt(gy)}) rotate({fmt(rot)})"/>')
    return f'<g fill="{fill}" {attrs}>{"".join(parts)}</g>'


# ── brand SVG inlining ────────────────────────────────────────────────
_cache = {}


def _read(path):
    if path not in _cache:
        _cache[path] = open(path, encoding='utf-8').read()
    return _cache[path]


def prefix_ids(svg, p):
    ids = set(re.findall(r'\bid="([^"]+)"', svg))
    if not ids:
        return svg
    svg = re.sub(r'\bid="([^"]+)"', lambda m: f'id="{p}{m.group(1)}"', svg)
    svg = re.sub(r'url\(#([^)]+)\)', lambda m: f'url(#{p}{m.group(1)})' if m.group(1) in ids else m.group(0), svg)
    svg = re.sub(r'(xlink:href|href)="#([^"]+)"', lambda m: f'{m.group(1)}="#{p}{m.group(2)}"' if m.group(2) in ids else m.group(0), svg)
    svg = re.sub(r'aria-labelledby="[^"]*"', '', svg)
    return svg


def parse_svg(path):
    s = _read(path)
    s = re.sub(r'<\?xml[^>]*\?>', '', s)
    s = re.sub(r'<!--.*?-->', '', s, flags=re.S)
    m = re.search(r'<svg\b([^>]*)>(.*)</svg>', s, re.S)
    attrs, inner = m.group(1), m.group(2)
    vb = re.search(r'viewBox="([^"]+)"', attrs).group(1)
    vb = [float(v) for v in re.split(r'[ ,]+', vb.strip())]
    inner = re.sub(r'<title[^>]*>.*?</title>', '', inner, flags=re.S)
    inner = re.sub(r'<desc[^>]*>.*?</desc>', '', inner, flags=re.S)
    return vb, inner


_uid = [0]


def uid(base='u'):
    _uid[0] += 1
    return f'{base}{_uid[0]}_'


def brand(rel, x, y, w, h, align='xMidYMid meet', recolor=None, extra=''):
    """Inline a brand SVG (path relative to brand/) into box x,y,w,h."""
    vb, inner = parse_svg(BRAND + '/' + rel)
    inner = prefix_ids(inner, uid('b'))
    if recolor:
        for a, b in recolor.items():
            inner = re.sub(re.escape(a), b, inner, flags=re.I)
    return (f'<svg x="{fmt(x)}" y="{fmt(y)}" width="{fmt(w)}" height="{fmt(h)}" viewBox="{" ".join(fmt(v) for v in vb)}" '
            f'preserveAspectRatio="{align}" overflow="visible" {extra}>{inner}</svg>')


def brand_aspect(rel):
    vb, _ = parse_svg(BRAND + '/' + rel)
    return vb[2] / vb[3]


def pattern_def(pid, rel, tile_mm, recolor=None, remove_bg=True, bg=None, x=0, y=0, rotate=0, opacity=1):
    """<pattern> from a brand pattern tile. recolor: dict hex→hex (or 'none')."""
    vb, inner = parse_svg(BRAND + '/' + rel)
    inner = prefix_ids(inner, uid('p'))
    if remove_bg:
        inner = re.sub(r'<rect (?:x="0" y="0" )?width="(240|320)" height="(240|320)" fill="#[0-9A-Fa-f]{6}"/>', '', inner, count=1)
    if recolor:
        def rc(m):
            c = m.group(0)
            return recolor.get(c.upper(), c)
        inner = re.sub(r'#[0-9A-Fa-f]{6}\b', rc, inner)
    bgr = f'<rect width="{fmt(tile_mm)}" height="{fmt(tile_mm)}" fill="{bg}"/>' if bg else ''
    tr = f' patternTransform="rotate({rotate})"' if rotate else ''
    op = f' opacity="{opacity}"' if opacity != 1 else ''
    return (f'<pattern id="{pid}" patternUnits="userSpaceOnUse" x="{fmt(x)}" y="{fmt(y)}" width="{fmt(tile_mm)}" height="{fmt(tile_mm)}"{tr}>{bgr}'
            f'<svg width="{fmt(tile_mm)}" height="{fmt(tile_mm)}" viewBox="{" ".join(fmt(v) for v in vb)}"{op}>{inner}</svg></pattern>')


# ── direction pattern presets ─────────────────────────────────────────
def bz_pattern(pid, tile=34, x=0, y=0, variant='saffron'):
    """Block-print booti on saffron: motifs re-inked cream / rani / ink / marigold."""
    if variant == 'saffron':
        rc = {'#FF6A13': BZ['cream'], '#FFF4DC': BZ['cream']}
        return pattern_def(pid, 'patterns/bazaar/03-block-print-booti-sunset.svg', tile, rc, True, BZ['saffron'], x, y)
    if variant == 'rani':
        rc = {'#E4147E': BZ['marigold'], '#FF6A13': BZ['cream']}
        return pattern_def(pid, 'patterns/bazaar/03-block-print-booti-sunset.svg', tile, rc, True, BZ['rani'], x, y)
    if variant == 'cream':
        return pattern_def(pid, 'patterns/bazaar/03-block-print-booti-sunset.svg', tile, None, False, None, x, y)
    raise ValueError(variant)


def ry_pattern(pid, tile=30, x=0, y=0, bg=None, which='01-jali-lattice', opacity=1):
    """One-colour saffron-gold foil jali on transparent (sits on midnight or emerald)."""
    rc = {'#A3173F': RY['gold'], '#2A1240': 'none', '#4B1D52': 'none', '#160B26': 'none', '#FBF3E4': RY['goldlt']}
    return pattern_def(pid, f'patterns/royal/{which}-midnight.svg', tile, rc, True, bg, x, y, opacity=opacity)


FOIL_DEF = ('<linearGradient id="{id}" x1="0" y1="0" x2="1" y2="1">'
            '<stop offset="0" stop-color="#B7791F"/><stop offset=".38" stop-color="#F7D98A"/>'
            '<stop offset=".58" stop-color="#E9A63A"/><stop offset="1" stop-color="#B7791F"/></linearGradient>')


# ── shapes & motifs ───────────────────────────────────────────────────
def arch_path(x, y, w, h, rise=None):
    """Mughal/bazaar gate arch: flat bottom, straight sides, ogee-ish pointed top."""
    rise = rise or w * 0.62
    cx = x + w / 2
    sy = y + rise  # where sides start
    return (f'M{fmt(x)} {fmt(y + h)}V{fmt(sy)}'
            f'C{fmt(x)} {fmt(y + rise * .45)} {fmt(cx - w * .30)} {fmt(y + rise * .28)} {fmt(cx - w * .08)} {fmt(y + rise * .12)}'
            f'Q{fmt(cx)} {fmt(y + rise * .05)} {fmt(cx)} {fmt(y)}'
            f'Q{fmt(cx)} {fmt(y + rise * .05)} {fmt(cx + w * .08)} {fmt(y + rise * .12)}'
            f'C{fmt(cx + w * .30)} {fmt(y + rise * .28)} {fmt(x + w)} {fmt(y + rise * .45)} {fmt(x + w)} {fmt(sy)}'
            f'V{fmt(y + h)}Z')


def round_arch_path(x, y, w, h):
    r = w / 2
    return f'M{fmt(x)} {fmt(y + h)}V{fmt(y + r)}A{fmt(r)} {fmt(r)} 0 0 1 {fmt(x + w)} {fmt(y + r)}V{fmt(y + h)}Z'


def scallops(x, y, w, r, fill, down=True, stroke=None, sw=0):
    """Row of semicircle scallops hanging from y (down) or rising from y (up)."""
    n = max(1, round(w / (2 * r)))
    r2 = w / n / 2
    d = f'M{fmt(x)} {fmt(y)}'
    for i in range(n):
        d += f'A{fmt(r2)} {fmt(r2)} 0 0 {0 if down else 1} {fmt(x + (i + 1) * 2 * r2)} {fmt(y)}'
    d += 'Z'
    st = f' stroke="{stroke}" stroke-width="{fmt(sw)}"' if stroke else ''
    return f'<path d="{d}" fill="{fill}"{st}/>'


def dot_row(x, y, w, r, gap, fill):
    n = max(1, int(w // gap))
    off = (w - (n - 1) * gap) / 2
    return ''.join(f'<circle cx="{fmt(x + off + i * gap)}" cy="{fmt(y)}" r="{fmt(r)}" fill="{fill}"/>' for i in range(n))


def chili(cx, cy, s, fill, stem='#3FA34D', stroke=None, sw=0, rot=-30):
    """Small chili glyph centred at cx,cy, length ~ s."""
    k = s / 20.0
    st = f' stroke="{stroke}" stroke-width="{fmt(sw)}" stroke-linejoin="round"' if stroke else ''
    return (f'<g transform="translate({fmt(cx)} {fmt(cy)}) rotate({rot}) scale({fmt(k)})">'
            f'<path d="M-8 -2C-4 -5 4 -4 8 -1C10 1 9 3 7 3C2 2 -3 4 -7 8C-9 9 -10 7 -10 5C-10 2 -10 0 -8 -2Z" fill="{fill}"{st}/>'
            f'<path d="M-8 -2C-9 -4 -10 -5 -12 -5" fill="none" stroke="{stem}" stroke-width="1.8" stroke-linecap="round"/>'
            f'<path d="M-9 -3.2C-8 -5 -6 -5.2 -4.8 -4" fill="{stem}"/></g>')


def steam(x, y, h, w, stroke, sw, outline=None, osw=0, flip=False):
    """One S-curl of steam rising from (x,y) upward by h."""
    s = -1 if flip else 1
    d = (f'M{fmt(x)} {fmt(y)}C{fmt(x + s * w)} {fmt(y - h * .22)} {fmt(x - s * w)} {fmt(y - h * .42)} {fmt(x)} {fmt(y - h * .6)}'
         f'C{fmt(x + s * w)} {fmt(y - h * .76)} {fmt(x + s * w * .2)} {fmt(y - h * .92)} {fmt(x - s * w * .25)} {fmt(y - h)}')
    o = ''
    if outline:
        o = f'<path d="{d}" fill="none" stroke="{outline}" stroke-width="{fmt(sw + 2 * osw)}" stroke-linecap="round"/>'
    return o + f'<path d="{d}" fill="none" stroke="{stroke}" stroke-width="{fmt(sw)}" stroke-linecap="round"/>'


def svg_doc(w, h, body, defs='', extra='', bg=None, title=None):
    t = f'<title>{title}</title>' if title else ''
    b = f'<rect width="{fmt(w)}" height="{fmt(h)}" fill="{bg}"/>' if bg else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
            f'width="{fmt(w)}mm" height="{fmt(h)}mm" viewBox="0 0 {fmt(w)} {fmt(h)}" {extra}>{t}'
            f'<defs>{defs}</defs>{b}{body}</svg>')

"""Text -> outlined vector paths using the self-hosted brand fonts (HarfBuzz shaping + fontTools outlines)."""
import io, math
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
from geo import Path, Poly

FD = '/home/user/playground/brand/fonts/'
FILES = {
    'bowlby': 'taiPGmVuC4y96PFeqp8sqomI_A.woff2',
    'caveat': 'Wnz6HAc5bAfYB2Q7ZjYY.woff2',
    'dmsans': 'rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K4.woff2',
    'fraunces': '6NUu8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib14c7qv8.woff2',
    'fraunces-i': '6NUs8FyLNQOQZAnv9ZwNjucMHVn85Ni7emAe9lKqZTnbB-gzTK0K1ChJdt9vIVYX9G37lvd9mv0iQg.woff2',
    'hanken': 'ieVn2YZDLWuGJpnzaiwFXS9tYtpd59A.woff2',
}

class _CubicPen(BasePen):
    def __init__(self, gs):
        super().__init__(gs); self.contours = []; self.cur = None
    def _moveTo(self, p):
        self.cur = {'pts': [p], 'closed': False}; self.contours.append(self.cur)
    def _lineTo(self, p):
        p0 = self.cur['pts'][-1]
        self.cur['pts'] += [(p0[0] + (p[0]-p0[0])/3, p0[1] + (p[1]-p0[1])/3), (p0[0] + 2*(p[0]-p0[0])/3, p0[1] + 2*(p[1]-p0[1])/3), p]
    def _curveToOne(self, a, b, c):
        self.cur['pts'] += [a, b, c]
    def _qCurveToOne(self, q, p):
        p0 = self.cur['pts'][-1]
        c1 = (p0[0] + 2/3*(q[0]-p0[0]), p0[1] + 2/3*(q[1]-p0[1]))
        c2 = (p[0] + 2/3*(q[0]-p[0]), p[1] + 2/3*(q[1]-p[1]))
        self.cur['pts'] += [c1, c2, p]
    def _closePath(self):
        p0 = self.cur['pts'][0]; pl = self.cur['pts'][-1]
        if abs(p0[0]-pl[0]) > 1e-6 or abs(p0[1]-pl[1]) > 1e-6: self._lineTo(p0)
        self.cur['closed'] = True
    def _endPath(self):
        pass

_cache = {}
class Font:
    def __init__(self, key, wght=None):
        self.key = key; self.wght = wght
        tt = TTFont(FD + FILES[key])
        self.upm = tt['head'].unitsPerEm
        loc = {'wght': wght} if (wght and 'fvar' in tt) else None
        self.gs = tt.getGlyphSet(location=loc) if loc else tt.getGlyphSet()
        tt2 = TTFont(FD + FILES[key]); tt2.flavor = None
        buf = io.BytesIO(); tt2.save(buf)
        face = hb.Face(buf.getvalue())
        self.hb = hb.Font(face)
        if loc: self.hb.set_variations(loc)
        self.order = tt.getGlyphOrder()
        os2 = tt['OS/2']
        self.cap = getattr(os2, 'sCapHeight', 0) or self.upm * 0.7
        self.xh = getattr(os2, 'sxHeight', 0) or self.upm * 0.5
        self.asc = tt['hhea'].ascent; self.desc = tt['hhea'].descent
        self._g = {}
    def glyph(self, name):
        if name not in self._g:
            pen = _CubicPen(self.gs)
            self.gs[name].draw(pen)
            self._g[name] = Path(pen.contours)
        return self._g[name]
    def shape(self, text, features=None):
        buf = hb.Buffer(); buf.add_str(text); buf.guess_segment_properties()
        hb.shape(self.hb, buf, features or {"kern": True, "liga": True})
        out = []
        for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
            out.append((self.order[info.codepoint], pos.x_advance, pos.x_offset, pos.y_offset))
        return out

def F(key, wght=None):
    k = (key, wght)
    if k not in _cache: _cache[k] = Font(key, wght)
    return _cache[k]

def measure(text, font, size, tracking=0):
    s = size / font.upm
    gl = font.shape(text)
    return sum(a for _, a, _, _ in gl) * s + tracking * size * max(0, len(gl) - 1)

def text_path(text, font, size, x=0, y=0, anchor='start', tracking=0, skew=0):
    """tracking in em; returns (Path, width). y = baseline."""
    s = size / font.upm
    gl = font.shape(text)
    w = sum(a for _, a, _, _ in gl) * s + tracking * size * max(0, len(gl) - 1)
    if anchor == 'middle': x0 = x - w / 2
    elif anchor == 'end': x0 = x - w
    else: x0 = x
    out = Path(); pen = x0
    k = math.tan(math.radians(skew))
    for name, adv, xo, yo in gl:
        g = font.glyph(name)
        if g.contours:
            # font units y-up -> svg y-down, with optional faux-italic skew
            out = out + g.transform(s, 0, -k*s, -s, pen + xo*s, y - yo*s)
        pen += adv * s + tracking * size
    return out, w

def text_d(*a, **k):
    p, w = text_path(*a, **k)
    return p.d()

def text_on_path(text, font, size, path_d, align=0.5, tracking=0, offset=None, flip=False):
    """Set text centred (align 0..1) along a path. offset: baseline shift (default centre caps on line)."""
    poly = Poly(path_d)
    s = size / font.upm
    gl = font.shape(text)
    adv = [a * s + tracking * size for _, a, _, _ in gl]
    w = sum(adv) - tracking * size
    start = poly.L * align - w / 2
    if offset is None: offset = font.cap * s / 2
    out = Path(); pen = start
    for (name, a, xo, yo), ad in zip(gl, adv):
        gw = a * s
        mid = pen + gw / 2
        x, y, ang = poly.at(mid)
        g = font.glyph(name)
        if g.contours:
            # glyph local: centre horizontally, baseline offset so text is centred on the line
            gp = g.transform(s, 0, 0, -s, -gw / 2, offset)
            if flip: gp = gp.rotate(180)
            gp = gp.rotate(math.degrees(ang)).translate(x, y)
            out = out + gp
        pen += ad
    return out

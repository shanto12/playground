"""Path geometry: parse SVG path data into cubic segments, transform, measure, sample.
Used for text-on-path, neon tube lengths and hand-drawn monoline lettering."""
import math, re

def _fmt(v):
    s = f"{v:.2f}".rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s

def arc_to_cubics(x1, y1, rx, ry, phi, fa, fs, x2, y2):
    # SVG arc -> list of cubic beziers (each as 4 points)
    if rx == 0 or ry == 0:
        return [((x1, y1), (x1, y1), (x2, y2), (x2, y2))]
    phi = math.radians(phi)
    cp, sp = math.cos(phi), math.sin(phi)
    dx, dy = (x1 - x2) / 2, (y1 - y2) / 2
    x1p = cp * dx + sp * dy
    y1p = -sp * dx + cp * dy
    rx, ry = abs(rx), abs(ry)
    lam = x1p**2 / rx**2 + y1p**2 / ry**2
    if lam > 1:
        s = math.sqrt(lam); rx *= s; ry *= s
    num = rx*rx*ry*ry - rx*rx*y1p*y1p - ry*ry*x1p*x1p
    den = rx*rx*y1p*y1p + ry*ry*x1p*x1p
    co = math.sqrt(max(0, num / den)) if den else 0
    if fa == fs: co = -co
    cxp = co * rx * y1p / ry
    cyp = -co * ry * x1p / rx
    cx = cp * cxp - sp * cyp + (x1 + x2) / 2
    cy = sp * cxp + cp * cyp + (y1 + y2) / 2
    def ang(ux, uy, vx, vy):
        a = math.atan2(ux*vy - uy*vx, ux*vx + uy*vy)
        return a
    t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry)
    dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry)
    if not fs and dt > 0: dt -= 2*math.pi
    elif fs and dt < 0: dt += 2*math.pi
    n = max(1, int(math.ceil(abs(dt) / (math.pi/2) - 1e-9)))
    d = dt / n
    out = []
    k = 4/3 * math.tan(d/4)
    for i in range(n):
        a1 = t1 + i*d; a2 = a1 + d
        c1, s1, c2, s2 = math.cos(a1), math.sin(a1), math.cos(a2), math.sin(a2)
        p0 = (c1, s1); p3 = (c2, s2)
        q1 = (c1 - k*s1, s1 + k*c1); q2 = (c2 + k*s2, s2 - k*c2)
        def tr(p):
            x, y = p[0]*rx, p[1]*ry
            return (cp*x - sp*y + cx, sp*x + cp*y + cy)
        out.append((tr(p0), tr(q1), tr(q2), tr(p3)))
    return out

_tok = re.compile(r'[MmLlHhVvCcSsQqTtAaZz]|-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?')

class Path:
    """contours: list of dicts {pts:[(x,y)...] as cubic chain p0,c1,c2,p1,c1,c2,p2..., closed:bool}"""
    def __init__(self, contours=None):
        self.contours = contours or []

    @staticmethod
    def parse(d):
        toks = _tok.findall(d)
        i = 0; cmd = None
        contours = []; cur = None
        x = y = 0; sx = sy = 0
        lastc = None; lastq = None
        def num():
            nonlocal i
            v = float(toks[i]); i += 1; return v
        def line_to(nx, ny):
            cur['pts'] += [(cur['pts'][-1]), (nx, ny), (nx, ny)]
            # make cubic: c1 = p0 + (p1-p0)/3 ...
            p0 = cur['pts'][-3]
            cur['pts'][-3] = (p0[0] + (nx - p0[0]) / 3, p0[1] + (ny - p0[1]) / 3)
            cur['pts'][-2] = (p0[0] + 2*(nx - p0[0]) / 3, p0[1] + 2*(ny - p0[1]) / 3)
        while i < len(toks):
            t = toks[i]
            if t.isalpha():
                cmd = t; i += 1
                if cmd in 'Zz':
                    if cur:
                        if (abs(x - sx) > 1e-6 or abs(y - sy) > 1e-6):
                            line_to(sx, sy)
                        cur['closed'] = True
                    x, y = sx, sy; lastc = lastq = None
                    cur = None
                    continue
            rel = cmd.islower(); C = cmd.upper()
            if C == 'M':
                nx, ny = num(), num()
                if rel: nx += x; ny += y
                cur = {'pts': [(nx, ny)], 'closed': False}; contours.append(cur)
                x, y = sx, sy = nx, ny
                cmd = 'l' if rel else 'L'; lastc = lastq = None
                continue
            if cur is None:
                cur = {'pts': [(x, y)], 'closed': False}; contours.append(cur)
            if C == 'L':
                nx, ny = num(), num()
                if rel: nx += x; ny += y
                line_to(nx, ny); x, y = nx, ny; lastc = lastq = None
            elif C == 'H':
                nx = num(); nx = nx + x if rel else nx
                line_to(nx, y); x = nx; lastc = lastq = None
            elif C == 'V':
                ny = num(); ny = ny + y if rel else ny
                line_to(x, ny); y = ny; lastc = lastq = None
            elif C == 'C':
                a = [num() for _ in range(6)]
                if rel: a = [a[k] + (x if k % 2 == 0 else y) for k in range(6)]
                cur['pts'] += [(a[0], a[1]), (a[2], a[3]), (a[4], a[5])]
                lastc = (a[2], a[3]); x, y = a[4], a[5]; lastq = None
            elif C == 'S':
                a = [num() for _ in range(4)]
                if rel: a = [a[k] + (x if k % 2 == 0 else y) for k in range(4)]
                c1 = (2*x - lastc[0], 2*y - lastc[1]) if lastc else (x, y)
                cur['pts'] += [c1, (a[0], a[1]), (a[2], a[3])]
                lastc = (a[0], a[1]); x, y = a[2], a[3]; lastq = None
            elif C in 'QT':
                if C == 'Q':
                    a = [num() for _ in range(4)]
                    if rel: a = [a[k] + (x if k % 2 == 0 else y) for k in range(4)]
                    q = (a[0], a[1]); nx, ny = a[2], a[3]
                else:
                    a = [num() for _ in range(2)]
                    if rel: a = [a[0] + x, a[1] + y]
                    q = (2*x - lastq[0], 2*y - lastq[1]) if lastq else (x, y)
                    nx, ny = a
                c1 = (x + 2/3*(q[0]-x), y + 2/3*(q[1]-y)); c2 = (nx + 2/3*(q[0]-nx), ny + 2/3*(q[1]-ny))
                cur['pts'] += [c1, c2, (nx, ny)]
                lastq = q; x, y = nx, ny; lastc = None
            elif C == 'A':
                rx, ry, ph, fa, fs, nx, ny = [num() for _ in range(7)]
                if rel: nx += x; ny += y
                for (p0, c1, c2, p3) in arc_to_cubics(x, y, rx, ry, ph, int(fa), int(fs), nx, ny):
                    cur['pts'] += [c1, c2, p3]
                x, y = nx, ny; lastc = lastq = None
            else:
                raise ValueError('bad cmd ' + str(cmd))
        return Path(contours)

    def copy(self):
        return Path([{'pts': list(c['pts']), 'closed': c['closed']} for c in self.contours])

    def transform(self, a, b, c, d, e, f):
        out = []
        for co in self.contours:
            out.append({'pts': [(a*x + c*y + e, b*x + d*y + f) for (x, y) in co['pts']], 'closed': co['closed']})
        return Path(out)

    def translate(self, tx, ty): return self.transform(1, 0, 0, 1, tx, ty)
    def scale(self, sx, sy=None):
        sy = sx if sy is None else sy
        return self.transform(sx, 0, 0, sy, 0, 0)
    def rotate(self, deg, cx=0, cy=0):
        r = math.radians(deg); co, si = math.cos(r), math.sin(r)
        return self.transform(co, si, -si, co, cx - co*cx + si*cy, cy - si*cx - co*cy)

    def __add__(self, other):
        return Path(self.contours + other.contours)

    def d(self):
        parts = []
        for co in self.contours:
            p = co['pts']
            parts.append('M' + _fmt(p[0][0]) + ' ' + _fmt(p[0][1]))
            segs = []
            for k in range(1, len(p), 3):
                c1, c2, e = p[k], p[k+1], p[k+2]
                p0 = p[k-1]
                # detect straight line
                if _colinear(p0, c1, c2, e):
                    segs.append('L' + _fmt(e[0]) + ' ' + _fmt(e[1]))
                else:
                    segs.append('C' + ' '.join(_fmt(v) for v in (c1[0], c1[1], c2[0], c2[1], e[0], e[1])))
            parts.append(''.join(segs))
            if co['closed']: parts.append('Z')
        return ''.join(parts)

    def bbox(self):
        xs = []; ys = []
        for co in self.contours:
            for pt in self.sample_contour(co, 8):
                xs.append(pt[0]); ys.append(pt[1])
        return (min(xs), min(ys), max(xs), max(ys))

    @staticmethod
    def sample_contour(co, n=12):
        p = co['pts']; out = [p[0]]
        for k in range(1, len(p), 3):
            p0, c1, c2, p3 = p[k-1], p[k], p[k+1], p[k+2]
            for j in range(1, n+1):
                t = j / n
                out.append(bez(p0, c1, c2, p3, t))
        return out

    def length(self):
        L = 0
        for co in self.contours:
            pts = self.sample_contour(co, 24)
            for k in range(1, len(pts)):
                L += math.dist(pts[k-1], pts[k])
        return L

    def polyline(self, step=2.0):
        """single-contour dense polyline with cumulative length (first contour)"""
        co = self.contours[0]
        pts = self.sample_contour(co, 60)
        cum = [0]
        for k in range(1, len(pts)):
            cum.append(cum[-1] + math.dist(pts[k-1], pts[k]))
        return pts, cum

def _colinear(p0, c1, c2, p3, tol=0.05):
    def dist(p, a, b):
        dx, dy = b[0]-a[0], b[1]-a[1]
        L = math.hypot(dx, dy)
        if L < 1e-9: return math.dist(p, a)
        return abs((p[0]-a[0])*dy - (p[1]-a[1])*dx) / L
    return dist(c1, p0, p3) < tol and dist(c2, p0, p3) < tol

def bez(p0, c1, c2, p3, t):
    mt = 1 - t
    return (mt**3*p0[0] + 3*mt*mt*t*c1[0] + 3*mt*t*t*c2[0] + t**3*p3[0],
            mt**3*p0[1] + 3*mt*mt*t*c1[1] + 3*mt*t*t*c2[1] + t**3*p3[1])

class Poly:
    """arc-length parametrised polyline for text-on-path"""
    def __init__(self, path):
        if isinstance(path, str): path = Path.parse(path)
        self.pts, self.cum = path.polyline()
        self.L = self.cum[-1]
    def at(self, s):
        s = max(0, min(self.L, s))
        lo, hi = 0, len(self.cum) - 1
        while hi - lo > 1:
            m = (lo + hi) // 2
            if self.cum[m] < s: lo = m
            else: hi = m
        a, b = self.pts[lo], self.pts[hi]
        seg = self.cum[hi] - self.cum[lo] or 1e-9
        t = (s - self.cum[lo]) / seg
        x = a[0] + (b[0]-a[0])*t; y = a[1] + (b[1]-a[1])*t
        # tangent from a wider window for smoothness
        s1, s2 = max(0, s - 6), min(self.L, s + 6)
        if s2 - s1 < 1e-6: ang = math.atan2(b[1]-a[1], b[0]-a[0])
        else:
            p1 = self._pt(s1); p2 = self._pt(s2)
            ang = math.atan2(p2[1]-p1[1], p2[0]-p1[0])
        return x, y, ang
    def _pt(self, s):
        lo, hi = 0, len(self.cum) - 1
        while hi - lo > 1:
            m = (lo + hi) // 2
            if self.cum[m] < s: lo = m
            else: hi = m
        a, b = self.pts[lo], self.pts[hi]
        seg = self.cum[hi] - self.cum[lo] or 1e-9
        t = (s - self.cum[lo]) / seg
        return a[0] + (b[0]-a[0])*t, a[1] + (b[1]-a[1])*t

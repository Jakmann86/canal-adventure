"""The weeping willow on the island at Little Venice, in high detail.

Run `python3 art-src/willow.py` from game/ to rebuild src/art/img/willow.png.

The tree is drawn in high detail (2 pixels per scene pixel, 272x252 a frame),
then shrunk to the game's chunky pixel size (one pixel per 2 scene pixels,
68x63 a frame), which keeps the shapes and colours of the detailed drawing.
A frame covers the scene from (236, 50) to (372, 176). The sheet is a 56-frame loop at
12 fps: the fronds sway, and once a loop a gust of wind passes through the
tree from left to right.
"""
import math, os, random
from PIL import Image

FW, FH = 272, 252          # frame size in image pixels
FRAMES, FPS = 56, 12
CX = 132                   # the trunk's centre
HERE = os.path.dirname(os.path.abspath(__file__))

# greens from deep shade to sunlit tips, in the game's palette family
GREENS = ['#0c3a1d', '#145a2c', '#196632', '#2e7b3f', '#3f9a48', '#4db956', '#72c75d', '#92d36c', '#b9e284', '#d6efa0']
BARK = {'dark': '#2c1a0f', 'base': '#53311c', 'mid': '#6b4428', 'light': '#8a6038', 'moss': '#4f7a34'}


def rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


class Frame:
    def __init__(self):
        self.p = {}

    def px(self, x, y, c):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < FW and 0 <= y < FH:
            self.p[(x, y)] = c

    def disc(self, x, y, r, c):
        ri = int(math.ceil(r))
        for dy in range(-ri, ri + 1):
            for dx in range(-ri, ri + 1):
                if dx * dx + dy * dy <= r * r + 0.3:
                    self.px(x + dx, y + dy, c)


def wind(t, x):
    """Sideways push at time t (0..1 over the loop) for a frond hanging at x.
    A gentle breeze, plus one gust that crosses the tree from left to right."""
    breeze = 1.3 * math.sin(2 * math.pi * (t + x * 0.004)) + 0.6 * math.sin(2 * math.pi * (3 * t + x * 0.011))
    g = math.sin(2 * math.pi * (t - 0.15 - x / 900))
    gust = max(0.0, g) ** 3 * 9
    return breeze + gust


# ── the tree's structure, chosen once so every frame is the same tree

rng = random.Random(11)


def dome(x):
    """Top edge of the crown."""
    return 18 + 74 * ((x - CX) / 120) ** 2


def make_cascades(n, layer):
    """Fronds hang in cascades from the ends of the twigs, with gaps between them."""
    out = []
    while n > 0:
        cx = CX + rng.uniform(-1, 1) * 116
        if layer == 'front' and abs(cx - CX) < 30:
            continue                                  # leave the trunk showing through the middle
        n -= 1
        cy = dome(cx) + rng.uniform(0, {'back': 14, 'mid': 30, 'front': 46}[layer])
        width = rng.uniform(8, 18)
        drop = (238 - cy) * rng.uniform(0.5, 0.97)    # a ragged hem: some cascades nearly touch the water
        shade = {'back': -3, 'mid': 0, 'front': 1}[layer] + rng.choice([-1, 0, 0, 1])
        ph, flex = rng.random(), rng.uniform(0.75, 1.25)
        for _ in range(rng.randint(8, 15)):
            off = rng.uniform(-0.5, 0.5)
            ax = cx + off * width
            out.append({
                'ax': ax, 'ay': cy + (off * 2) ** 2 * 5 + rng.uniform(0, 3), 'len': drop * rng.uniform(0.82, 1.04),
                'ph': ph, 'flex': flex * rng.uniform(0.9, 1.1),
                'out': (cx - CX) / 120 * rng.uniform(4, 9), 'curl': rng.uniform(-1, 1),
                'shade': shade - off * 3,             # each cascade is lit on its left edge
                'leaf': rng.random(), 'gap': rng.randint(2, 3),
            })
    return out


BACK, MID, FRONT = make_cascades(22, 'back'), make_cascades(24, 'mid'), make_cascades(13, 'front')

# trunk and branches: (x0, y0, x1, y1, width at start, width at end)
LIMBS = [
    (132, 246, 128, 196, 9, 7), (128, 196, 126, 150, 7, 6), (126, 150, 122, 118, 6, 4.5),
    (122, 118, 92, 74, 4.5, 2.5), (92, 74, 62, 66, 2.5, 1.2), (62, 66, 40, 80, 1.2, 0.8),
    (124, 132, 160, 92, 4, 2.5), (160, 92, 198, 66, 2.5, 1.3), (198, 66, 226, 70, 1.3, 0.8),
    (122, 118, 128, 70, 3.5, 2), (128, 70, 140, 34, 2, 1), (140, 34, 152, 26, 1, 0.7),
    (126, 150, 98, 128, 3, 1.6), (98, 128, 74, 120, 1.6, 0.8),
    (128, 170, 168, 150, 2.6, 1.4), (168, 150, 196, 140, 1.4, 0.7),
    (92, 74, 96, 42, 1.6, 0.8), (160, 92, 172, 52, 1.6, 0.8),
]


def draw_limbs(f):
    for x0, y0, x1, y1, w0, w1 in LIMBS:
        n = int(max(abs(x1 - x0), abs(y1 - y0)) * 2) + 1
        for k in range(n + 1):
            q = k / n
            x, y, r = x0 + (x1 - x0) * q, y0 + (y1 - y0) * q, w0 + (w1 - w0) * q
            f.disc(x, y, r, BARK['base'])
            f.disc(x - r * 0.45, y, max(0.6, r * 0.35), BARK['mid'])      # lit from the left
            f.px(x - r + 0.5, y, BARK['light'])
            f.px(x + r - 0.5, y, BARK['dark'])
    # bark: deep vertical fissures and moss on the trunk
    r2 = random.Random(5)
    for _ in range(70):
        y = r2.uniform(130, 244)
        x = 128 + (y - 130) * 0.035 + r2.uniform(-5, 5)
        for k in range(r2.randint(3, 8)):
            f.px(x + math.sin((y + k) * 0.4) * 0.6, y + k, BARK['dark'])
    for _ in range(40):
        y = r2.uniform(170, 246)
        f.px(126 + r2.uniform(-6, 2), y, BARK['moss'])
    # roots flaring into the island
    for dx, ln in [(-14, 12), (-9, 8), (10, 10), (15, 7)]:
        for k in range(ln):
            f.disc(132 + dx * k / ln, 240 + k * 0.5, 2.2 - k / ln * 1.6, BARK['base'])
    for x in range(118, 148):
        f.px(x, 247, BARK['dark'])


def draw_strand(f, s, t):
    w = wind(t, s['ax']) * s['flex']
    gap = s['gap']
    prev = None
    n = int(s['len'])
    for k in range(n):
        q = k / max(1, s['len'])
        # fronds arch out from the crown, then hang, swaying more towards the tip
        x = s['ax'] + s['out'] * (1 - math.exp(-k / 14)) + w * q ** 1.7 * (s['len'] / 60) + s['curl'] * math.sin(k * 0.07) * 1.2
        y = s['ay'] + k
        # light: brighter near the top of the crown and on the left, darker underneath
        light = s['shade'] + 5 - q * 3.2 - (x - CX) / 80 + (0.6 if s['leaf'] > 0.7 else 0)
        c = GREENS[max(0, min(len(GREENS) - 1, int(round(light))))]
        if prev is None or abs(x - prev) < 2:
            f.px(x, y, c)
        else:  # keep the stem continuous when it swings
            step = 1 if x > prev else -1
            for xx in range(int(round(prev)), int(round(x)) + step, step):
                f.px(xx, y, c)
        prev = x
        # little leaves along the stem, pointing down and out
        if k % gap == 0 and q > 0.04:
            side = 1 if (k // gap) % 2 else -1
            lc = GREENS[max(0, min(len(GREENS) - 1, int(round(light + (1 if side < 0 else -1) * 0.7))))]
            f.px(x + side, y + 1, lc)
            if q < 0.92:
                f.px(x + 2 * side, y + 2, lc)
                if s['leaf'] > 0.5:
                    f.px(x + 2 * side, y + 3, lc)
    # the frond's tip
    if prev is not None:
        f.px(prev, s['ay'] + n, GREENS[max(0, min(len(GREENS) - 1, int(round(s['shade'] + 2))))])


def draw_crown_tops(f, t):
    """Dense leafy mass along the top of the crown, catching the light."""
    r2 = random.Random(9)
    for _ in range(1400):
        x = CX + r2.uniform(-1, 1) * 116
        y = dome(x) + r2.uniform(-1, 1) * 2 + r2.random() ** 2 * 26
        x += wind(t, x) * 0.12
        light = 6.5 - (y - dome(x)) / 5 - (x - CX) / 70 + r2.uniform(-1, 1)
        c = GREENS[max(0, min(len(GREENS) - 1, int(round(light))))]
        f.px(x, y, c); f.px(x + 1, y + 1, c)


def frame(i):
    t = i / FRAMES
    f = Frame()
    for s in BACK:
        draw_strand(f, s, t)
    draw_limbs(f)
    draw_crown_tops(f, t)
    for s in MID:
        draw_strand(f, s, t)
    for s in FRONT:
        draw_strand(f, s, t)
    im = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
    for (x, y), c in f.p.items():
        im.putpixel((x, y), rgb(c) + (255,))
    return im


if __name__ == '__main__':
    sheet = Image.new('RGBA', (FW * FRAMES, FH), (0, 0, 0, 0))
    for i in range(FRAMES):
        sheet.paste(frame(i), (i * FW, 0))
    # The game uses the chunky version: one pixel per 2 scene pixels, like the cast.
    from chunky import reduce_sheet
    out = os.path.join(HERE, '..', 'src', 'art', 'img', 'willow.png')
    reduce_sheet(sheet, FW, FRAMES, 4).save(out, optimize=True)
    print('willow', FRAMES, 'frames,', os.path.getsize(out) // 1024, 'KB')

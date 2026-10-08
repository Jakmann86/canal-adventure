"""The Hackney Wick murals, in high detail.

Run `python3 art-src/graffiti.py` from game/ to rebuild src/art/img/wick-murals.png.

One still image, at 2 image pixels per scene pixel, covering the walls from
scene (0, 150) to (554, 226): the WICK piece, the Gob mural with its
paste-up posters, and Jasper's tag. Jasper's tag is a puzzle clue, so it must
always read clearly as x² + 3x = 28.
"""
import math, os, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont

RES = 2
OX, OY = 0, 150                     # the image's top-left corner in scene pixels
W, H = 554 * RES, 76 * RES
HERE = os.path.dirname(os.path.abspath(__file__))
FONT = '/usr/share/fonts/opentype/inter/Inter-Black.otf'

C = {
    'ink': '#201e1d', 'n100': '#f8f4f4', 'n200': '#eae7e7', 'n400': '#bab6b6',
    'yel': '#f5d240', 'yel3': '#fbe98a', 'yel7': '#ce9200', 'org': '#f68c36', 'org7': '#c8641c', 'a500': '#ff563c', 'a700': '#ae1800', 'a800': '#7c1405',
    'a400': '#ff9783', 'pink': '#f47db9', 'pink3': '#f9b0d6', 'pink7': '#c95590',
    'teal': '#2ac3bb', 'teal3': '#7fe0d8', 'teal7': '#00787d', 'teal9': '#00494d',
    'blu': '#3986e4', 'blu3': '#6aa9ef', 'blu8': '#1d4a93', 'pur': '#8e51c7', 'pur3': '#ad7ee0', 'pur8': '#54277c', 'pur9': '#3c1a5a',
    'grn': '#4db956', 'grn8': '#196632', 'lime': '#92d36c', 'stock': '#d2ba92',
}
img = np.zeros((H, W, 4), np.uint8)
rng = random.Random(7)


def rgba(c):
    c = C.get(c, c)
    return [int(c[i:i + 2], 16) for i in (1, 3, 5)] + [255]


def fill(mask, c):
    img[mask] = rgba(c)


def rect(x, y, w, h, c):
    x, y, w, h = int(round(x)), int(round(y)), int(round(w)), int(round(h))
    img[max(0, y):max(0, y + h), max(0, x):max(0, x + w)] = rgba(c)


def px(x, y, c):
    x, y = int(round(x)), int(round(y))
    if 0 <= x < W and 0 <= y < H:
        img[y, x] = rgba(c)


def disc_mask(cx, cy, r, ry=None):
    ry = ry or r
    yy, xx = np.mgrid[0:H, 0:W]
    return ((xx - cx) / r) ** 2 + ((yy - cy) / ry) ** 2 <= 1


def shift(m, dx, dy):
    out = np.zeros_like(m)
    ys, yd = (slice(0, H - dy), slice(dy, H)) if dy >= 0 else (slice(-dy, H), slice(0, H + dy))
    xs, xd = (slice(0, W - dx), slice(dx, W)) if dx >= 0 else (slice(-dx, W), slice(0, W + dx))
    out[yd, xd] = m[ys, xs]
    return out


def dilate(m, r):
    out = m.copy()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            if dx * dx + dy * dy <= r * r:
                out |= shift(m, dx, dy)
    return out


def text_mask(s, size, x, y, shear=0.0, wave=0.0):
    """Big letters as a mask: sheared for italic, optionally wavy."""
    font = ImageFont.truetype(FONT, size)
    l, t, r, b = font.getbbox(s)
    tw, th = r - l + 40, b - t + 20
    im = Image.new('L', (tw, th), 0)
    ImageDraw.Draw(im).text((20 - l, 10 - t), s, font=font, fill=255)
    a = np.array(im) > 127
    out = np.zeros((H, W), bool)
    for yy in range(th):
        for xx in range(tw):
            if a[yy, xx]:
                X = int(round(x + xx - 20 + (th - yy) * shear))
                Y = int(round(y + yy - 10 + wave * math.sin(xx / 16)))
                if 0 <= X < W and 0 <= Y < H:
                    out[Y, X] = True
    return out


def spray_texture(mask, base, light, dark, density=0.06):
    fill(mask, base)
    ys, xs = np.nonzero(mask)
    for i in range(len(xs)):
        r = rng.random()
        if r < density:
            img[ys[i], xs[i]] = rgba(light)
        elif r < density * 2:
            img[ys[i], xs[i]] = rgba(dark)


def overspray(cx, cy, r, c, width=4):
    """Soft speckled edge around a sprayed circle."""
    for _ in range(int(r * 14)):
        a = rng.uniform(0, 2 * math.pi)
        d = r + rng.random() ** 2 * width
        px(cx + math.cos(a) * d, cy + math.sin(a) * d, c)


def drip(x, y, length, c, w=2):
    for k in range(length):
        rect(x, y + k, w, 1, c)
    rect(x - 1 if w > 1 else x, y + length, w + (1 if w > 1 else 0), 2, c)


def piece(mask, fills, shadow, depth, outline=2, shine=True):
    """A spray-paint piece: block shadow, outline, banded fill, highlights."""
    ext = mask.copy()
    for d in range(1, depth + 1):
        ext |= shift(mask, d, d)
    edge = dilate(ext, outline)
    fill(edge, 'ink')
    for d in range(depth, 0, -1):
        fill(shift(mask, d, d) & ~mask, shadow[0] if d > depth // 2 else shadow[1])
    ys = np.nonzero(mask)[0]
    top, bot = ys.min(), ys.max()
    rows = np.arange(H)[:, None]
    q = (rows - top) / max(1, bot - top)
    n = len(fills)
    band = np.clip((q * n).astype(int), 0, n - 1)
    checker = (np.add.outer(np.arange(H), np.arange(W)) % 2 == 0)
    near = ((q * n) % 1 > 0.82) & checker            # dithered seam between bands
    band = np.where(near, np.clip(band + 1, 0, n - 1), band)
    for i, c in enumerate(fills):
        fill(mask & (band == i), c)
    if shine:
        fill(mask & ~shift(mask, 2, 2), C['n100'])                      # light on the top-left edges
        fill(mask & ~shift(mask, -2, -2) & ~(mask & ~shift(mask, 2, 2)), shadow[1])  # shade inside the bottom-right


def sparkle(x, y, c='n100', r=3):
    for k in range(-r, r + 1):
        px(x + k, y, c); px(x, y + k, c)
    px(x, y, c)


def scribble(x, y, n, c):
    """A quick throw-up tag: an illegible looping signature."""
    a = 0.0
    for k in range(n):
        a += rng.uniform(-0.9, 0.9)
        x += math.cos(a) * 1.2 + 0.6
        y += math.sin(a) * 1.4
        px(x, y, c); px(x + 1, y, c)


# ─────────────────────────── A. the WICK wall (scene x 0–200)
wall = np.zeros((H, W), bool)
for x in range(0, 400):
    wall[rng.randint(0, 3) + (1 if x % 7 == 0 else 0):, x] = True        # ragged top edge where the paint meets the brick
spray_texture(wall, 'pur', 'pur3', 'pur8', 0.035)
for x in range(0, 400, 9):
    if rng.random() < 0.5:
        drip(x + rng.randint(0, 6), 140 + rng.randint(-6, 4), rng.randint(4, 12), 'pur8', 1)

# target circles and stripes, from the old wall, sprayed
for r, c in [(44, 'teal'), (30, 'yel'), (15, 'pink')]:
    fill(disc_mask(72, 92, r), c); overspray(72, 92, r, c)
fill(disc_mask(72, 92, 5), 'n100')
for r, c in [(33, 'grn'), (18, 'org')]:
    fill(disc_mask(332, 128, r), c); overspray(332, 128, r, c)
for k, c in enumerate(['yel', 'pink', 'teal', 'org', 'grn', 'blu']):
    rect(240 + k * 12, 100, 6, 52, c)
    drip(241 + k * 12, 94 - rng.randint(0, 8), 6, c, 4)
for _ in range(6):
    scribble(rng.uniform(150, 215), rng.uniform(112, 140), 26, 'ink')
scribble(352, 70, 30, 'n100'); scribble(16, 140, 22, 'n100')

# the WICK piece
wick = text_mask('WICK', 74, 34, 10, shear=0.22, wave=3)
cloud = dilate(wick, 9)
for _ in range(60):                                                  # a lumpy backdrop
    ys, xs = np.nonzero(cloud)
    i = rng.randrange(len(xs))
    cloud |= disc_mask(xs[i], ys[i], rng.randint(4, 8))
fill(cloud & wall, 'teal'); fill(cloud & ~dilate(~cloud, 2) & ~shift(cloud, -3, -3) & wall, 'teal3')
fill(cloud & ~shift(cloud, 3, 3) & wall, 'teal3')
fill(cloud & ~shift(cloud, -3, -3) & wall, 'teal7')
piece(wick, ['yel3', 'yel', 'yel', 'org', 'org', 'a500'], ['teal9', 'teal7'], 7)
ys, xs = np.nonzero(wick)
for x in (60, 108, 150, 196, 240):                                   # drips off the letters
    col = ys[(xs >= x) & (xs < x + 2)]
    if len(col):
        drip(x, col.max() + 3, rng.randint(6, 16), 'org', 2)
for x, y in [(30, 14), (262, 20), (226, 84), (20, 66)]:
    sparkle(x, y)
for x, y in [(70, 24), (128, 22), (176, 26), (222, 30)]:              # glints on the letters
    for k in range(5):
        px(x + k, y + k, 'n100')

# ─────────────────────────── B. the Gob mural and paste-ups (scene x 206–366)
# An original character, painted straight onto the brick: a big pink grinning gob on
# legs, in white high-tops, with a spray can. Inside its mouth: a little canal and boat.
B0 = 412
yy, xx = np.mgrid[0:H, 0:W]


def rrect(x0, y0, x1, y1, r):
    """Rounded rectangle mask."""
    m = (xx >= x0) & (xx <= x1) & (yy >= y0) & (yy <= y1)
    for cx, cy in ((x0 + r, y0 + r), (x1 - r, y0 + r), (x0 + r, y1 - r), (x1 - r, y1 - r)):
        corner = ((xx < x0 + r) if cx == x0 + r else (xx > x1 - r)) & ((yy < y0 + r) if cy == y0 + r else (yy > y1 - r))
        m &= ~corner | (((xx - cx) ** 2 + (yy - cy) ** 2) <= r * r)
    return m


def limb(points, r):
    m = np.zeros((H, W), bool)
    for (x0, y0), (x1, y1) in zip(points, points[1:]):
        n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
        for k in range(n + 1):
            m |= disc_mask(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, r)
    return m


def inked(m, c, light=None, dark=None, w=2):
    """Fill with a cartoon outline, a lit top-left edge and a shaded bottom-right."""
    fill(dilate(m, w) & (yy >= 12), 'ink'); fill(m, c)
    if dark:
        fill(m & ~shift(m, -4, -3), dark)
    if light:
        fill(m & ~shift(m, 3, 3), light)


# a teal splash behind it
splash = np.zeros((H, W), bool)
srng = random.Random(3)
for _ in range(46):
    a, d = srng.uniform(0, 2 * math.pi), srng.random() ** 0.6
    splash |= disc_mask(486 + math.cos(a) * d * 62, 82 + math.sin(a) * d * 56, srng.uniform(8, 18))
splash &= (yy >= 14)
fill(splash, 'teal'); fill(splash & ~shift(splash, 3, 3), 'teal3'); fill(splash & ~shift(splash, -3, -3), 'teal7')
for _ in range(220):
    a, d = srng.uniform(0, 2 * math.pi), srng.uniform(58, 74)
    px(486 + math.cos(a) * d, 82 + math.sin(a) * d * 0.9, 'teal')
for x in (438, 452, 520, 536):
    drip(x, 128 + srng.randint(-6, 6), srng.randint(6, 14), 'teal', 2)

# legs and big white high-tops
inked(limb([(470, 108), (468, 128)], 5), 'pink', 'pink3', 'pink7')
inked(limb([(504, 108), (508, 128)], 5), 'pink', 'pink3', 'pink7')
for x0, x1 in ((448, 484), (494, 532)):
    shoe = rrect(x0, 124, x1, 146, 8) | rrect(x0 + 4, 120, x0 + 22, 134, 4)
    inked(shoe, 'n100', None, 'n400')
    rect(x0, 142, x1 - x0 + 1, 4, 'n400'); rect(x0, 145, x1 - x0 + 1, 1, 'ink')
    for k in range(3):
        rect(x0 + 7, 125 + k * 4, 12, 2, 'a500')                       # red laces
    rect(x0 + 22, 132, x1 - x0 - 26, 3, 'pink')                         # a pink stripe

# the gob itself
body = rrect(438, 22, 536, 114, 24)
inked(body, 'pink', 'pink3', 'pink7', 3)
for x in (452, 476, 498, 522):                                         # paint dripping off the bottom
    drip(x, 115, srng.randint(5, 12), 'pink', 3)
mouth = rrect(448, 38, 526, 102, 14)
fill(dilate(mouth, 2), 'ink'); fill(mouth, '#efe4c8')
# a little canal inside the mouth
rect(450, 76, 75, 24, 'teal'); 
for x in range(452, 524, 6):
    rect(x, 76 + (x // 6) % 2, 3, 1, 'n100')
boat = rrect(470, 70, 502, 76, 2)
fill(dilate(boat, 1), 'ink'); fill(boat, 'a500'); rect(476, 64, 18, 6, 'a500'); rect(476, 64, 18, 1, 'ink'); rect(480, 58, 2, 6, 'ink')
for k in range(3):
    px(482 + k, 54 - k * 2, 'n400')                                     # chimney smoke
# teeth, top and bottom
for i in range(5):
    x = 451 + i * 15
    for y0, y1 in ((40, 56), (86, 101)):
        tooth = rrect(x, y0, x + 13, y1, 4)
        fill(dilate(tooth, 1), 'ink'); fill(tooth, 'n100')
        fill(tooth & ~shift(tooth, 0, -3), 'n400')
# bulging eyes on top, glancing down at the real canal
for ex, ey in ((466, 20), (506, 17)):
    e = disc_mask(ex, ey, 10, 11)
    inked(e, 'n100', None, 'n400')
    fill(disc_mask(ex - 3, ey + 4, 4), 'ink'); fill(disc_mask(ex - 4, ey + 2, 1.5), 'n100')
# a long tongue lolling out of the corner
tongue = limb([(452, 96), (446, 108), (444, 120), (448, 128)], 5)
inked(tongue, 'a400', 'pink3', 'pink7')
drip(447, 132, 8, 'a400', 2)
# arms: one waving, one holding a spray can and spraying
inked(limb([(536, 70), (548, 58), (556, 42)], 4), 'pink', 'pink3', 'pink7')
glove = disc_mask(558, 36, 7)
inked(glove, 'n100', None, 'n400')
for k in range(3):
    rect(552 + k * 5, 27, 3, 6, 'n100'); rect(552 + k * 5, 26, 3, 1, 'ink')
inked(limb([(440, 74), (428, 88), (424, 100)], 4), 'pink', 'pink3', 'pink7')
can = rrect(414, 96, 428, 124, 3)
inked(can, 'a500', 'a400', 'a700')
rect(415, 104, 13, 5, 'yel'); rect(417, 91, 9, 5, 'n400'); rect(419, 88, 4, 3, 'ink')
fill(disc_mask(428, 100, 5), 'pink'); fill(disc_mask(428, 100, 5) & ~shift(disc_mask(428, 100, 5), 2, 2), 'pink3')
for _ in range(90):                                                     # the spray, misting up and left
    d = srng.random()
    a = srng.uniform(-0.5, 0.5) + math.pi * 1.25
    px(418 + math.cos(a) * d * 26, 88 + math.sin(a) * d * 26, 'pink' if srng.random() < 0.7 else 'pink3')
# a little stencil smiley signature
sig = disc_mask(548, 140, 6)
fill(dilate(sig, 1), 'ink'); fill(sig, 'n100'); px(546, 138, 'ink'); px(550, 138, 'ink'); rect(545, 142, 6, 1, 'ink')

# paste-up posters, tape and torn corners
posters = [
    ('yel', lambda x, y: (fill(disc_mask(x + 14, y + 14, 8), 'org'), [px(x + 14 + math.cos(a) * 12, y + 14 + math.sin(a) * 12, 'org') for a in np.linspace(0, 6.28, 16)])),
    ('teal', lambda x, y: (fill(disc_mask(x + 12, y + 14, 8, 5), 'org'), [px(x + 21 + k // 2, y + 14 + (k - 4) * 0.8, 'org') for k in range(9)], px(x + 8, y + 13, 'ink'))),
    ('pink3', lambda x, y: (fill(disc_mask(x + 10, y + 12, 5) | disc_mask(x + 18, y + 12, 5) | (disc_mask(x + 14, y + 14, 9) & (yy > y + 13) & (abs(xx - x - 14) < (y + 25 - yy))), 'a500'))),
    ('grn', lambda x, y: [rect(x + 14 - k // 2 + (6 if k > 12 else 0), y + 3 + k, 4, 1, 'yel') for k in range(24)]),
]
for k, (bgc, art) in enumerate(posters):
    x = 564 + k * 40
    rect(x - 1, 51, 30, 30, 'ink'); rect(x, 52, 28, 28, bgc); art(x, 52)
    rect(x - 2, 50, 7, 4, 'n200'); rect(x + 24, 50, 7, 4, 'n200')
    rect(x - 1, 91, 30, 50, 'ink'); rect(x, 92, 28, 48, ['org', 'pur', 'yel', 'grn'][k])
    for j in range(5):
        rect(x + 4, 98 + j * 7, 20 - (j * 5) % 9, 2, ['ink', 'n100'][j % 2] if k != 2 else 'ink')
    for j in range(6):                                              # torn bottom edge
        img[138:140 + (j * 7 + k) % 3, x + j * 5:x + j * 5 + 3] = 0
    sparkle(x + 22, 132, 'n100', 2)

# ─────────────────────────── C. Jasper's tag (scene x 376–554)
C0 = 752
tagwall = np.zeros((H, W), bool); tagwall[12:104, C0:C0 + 356] = True
spray_texture(tagwall, 'pur8', 'pur', 'pur9', 0.035)
for x in range(C0, C0 + 356, 8):                                    # drips down into the green
    if rng.random() < 0.6:
        drip(x + rng.randint(0, 4), 104, rng.randint(2, 18), 'pur8', 2)
# the sum, big and clear: x² + 3x = 28
# Sized to fit the wall with room for the shadows: x at full size, a small raised 2, then the rest.
size = 64
f_big, f_small = ImageFont.truetype(FONT, size), ImageFont.truetype(FONT, size // 2)
wx, w2, wr = (f.getlength(t) for f, t in ((f_big, 'x'), (f_small, '2'), (f_big, '+3x=28')))
gap = 6
x0 = C0 + (356 - (wx + gap + w2 + gap * 2 + wr) - 12) / 2
x_ = text_mask('x', size, x0, 26, shear=0.12)
two = text_mask('2', size // 2, x0 + wx + gap, 14, shear=0.12)
rest = text_mask('+3x=28', size, x0 + wx + gap + w2 + gap * 2, 26, shear=0.12)
piece(x_ | two, ['pink3', 'pink', 'pink', 'pink7'], ['blu8', 'blu'], 5)
piece(rest, ['yel3', 'yel', 'yel', 'org'], ['a700', 'org7'], 5)
for x, y in [(C0 + 8, 20), (C0 + 344, 22)]:
    sparkle(x, y)
# teal swoosh underneath, with an arrowhead
for k in range(300):
    x = 772 + k
    y = 94 - 6 * math.sin(k / 300 * math.pi) + (k / 300) * -4
    rect(int(x), int(y), 1, 3, 'teal'); px(x, y - 1, 'teal3'); px(x, y + 3, 'teal9')
for k in range(9):
    rect(1072 - k, 86 - k, 2, 1, 'teal'); rect(1072 - k, 86 + k * 0.4 + 3, 2, 1, 'teal')
# the daisy band along the bottom
band = np.zeros((H, W), bool); band[108:, C0:C0 + 356] = True
spray_texture(band, 'grn', 'lime', 'grn8', 0.05)
for x in range(C0, C0 + 356, 3):                                    # grass along the top edge
    hgt = rng.randint(2, 7)
    rect(x, 108 - hgt, 1, hgt, 'grn' if rng.random() < 0.6 else 'lime')
for i, x in enumerate(range(C0 + 8, C0 + 356, 28)):
    y = 124 + (i % 2) * 6
    rect(x, y, 2, 152 - y, 'grn8')
    for k in range(4):
        px(x - 2 - k, y + 12 - k // 2, 'grn8'); px(x + 3 + k, y + 16 - k // 2, 'grn8')
    for a in np.linspace(0, 2 * math.pi, 10, endpoint=False):
        fill(disc_mask(x + 1 + math.cos(a) * 6, y + math.sin(a) * 6, 3, 2.4), 'yel')
    fill(disc_mask(x + 1, y, 4), 'org'); fill(disc_mask(x, y - 1, 1.5), 'yel3')

out = os.path.join(HERE, '..', 'src', 'art', 'img', 'wick-murals.png')
Image.fromarray(img, 'RGBA').save(out, optimize=True)
print('wick-murals', W, 'x', H, os.path.getsize(out) // 1024, 'KB')

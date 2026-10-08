"""The Hackney Wick murals, in high detail.

Run `python3 art-src/graffiti.py` from game/ to rebuild src/art/img/wick-murals.png.

One still image, at 2 image pixels per scene pixel, covering the walls from
scene (0, 150) to (554, 226): the WICK piece, the face mural with its
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

# ─────────────────────────── B. the face mural and paste-ups (scene x 206–366)
B0 = 412
mural = np.zeros((H, W), bool); mural[36:, B0:B0 + 320] = True
yy, xx = np.mgrid[0:H, 0:W]
ang = np.arctan2(yy - 92, xx - 488)
fill(mural & ((ang * 8 / math.pi) % 2 < 1), 'blu'); fill(mural & ((ang * 8 / math.pi) % 2 >= 1), 'blu3')
for x in range(B0, B0 + 320, 3):                                     # darker paint pooled at the bottom
    if rng.random() < 0.7:
        rect(x, 152 - rng.randint(2, 16), 1, 16, 'blu8')
# wild yellow hair, flaming up off the top of the wall
hair = disc_mask(488, 66, 52, 40)
for k in range(13):
    a = math.pi * (1.05 + k / 12 * 0.9)
    tx, ty = 488 + math.cos(a) * 66, 70 + math.sin(a) * 50
    for j in range(24):
        q = j / 24
        cx, cy = 488 + (tx - 488) * q, 70 + (ty - 70) * q
        hair |= disc_mask(cx, cy, 9 * (1 - q) + 1.5)
hair &= yy >= 28
fill(dilate(hair, 2) & (yy >= 28), 'ink'); fill(hair, 'yel')
fill(hair & ~shift(hair, -3, 0), 'yel7'); fill(hair & ~shift(hair, 2, 2), 'yel3')
# the face
face = disc_mask(488, 96, 38, 46)
fill(dilate(face, 2), 'ink'); fill(face, 'pink')
fill(face & ~shift(face, -7, 0), 'pink7'); fill(face & ~shift(face, 3, 3), 'pink3')
for ex in (472, 504):                                                # big eyes, glancing down at the canal
    e = disc_mask(ex, 84, 10, 12)
    fill(dilate(e, 2), 'ink'); fill(e, 'n100')
    fill(disc_mask(ex - 3, 88, 5, 6), 'ink'); fill(disc_mask(ex - 5, 85, 1.6), 'n100')
    for k in range(-9, 10):                                          # brows
        px(ex + k, 66 - (9 - abs(k)) * 0.35, 'ink'); px(ex + k, 67 - (9 - abs(k)) * 0.35, 'ink')
for cx in (460, 516):
    fill(disc_mask(cx, 106, 7, 5), 'a400')
for k in range(6):
    px(487 + k * 0.3, 96 + k, 'pink7'); px(486, 102, 'pink7'); px(491, 103, 'pink7')
mouth = disc_mask(488, 110, 22, 16) & (yy >= 110)
fill(dilate(mouth, 2) & (yy >= 108), 'ink'); fill(mouth, 'a800')
fill(mouth & (yy < 116), 'n100'); fill(mouth & disc_mask(492, 124, 9, 5), 'a400')
for x in range(472, 506, 7):
    rect(x, 110, 1, 6, 'n400')
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
        rect(x + j * 5, 138, 3, 2 + (j * 7 + k) % 3, 'blu')
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

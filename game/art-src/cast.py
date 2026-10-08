"""The cast, Sam & Max style: big heads, big eyes, wide mouths, chunky hands and
feet, a bold dark outline. Hand-placed pixel art at the cast's chunky size (the
game draws each pixel as 2 scene pixels).

Run `python3 art-src/cast.py` from game/ to rebuild the sprite sheets in
src/art/img/ and the editable Piskel files in art-src/piskel/. Once you edit a
character in Piskel, treat its .piskel files as the master copy: running this
script again overwrites the PNGs.

Characters face right (the game mirrors them). Feet stand on the bottom row.
"""
import base64, io, json, math, os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
C = {
    'ink': '#201e1d', 'n100': '#f8f4f4', 'n200': '#eae7e7', 'n300': '#d7d3d3', 'n400': '#bab6b6', 'n500': '#9b9797', 'n600': '#7d7979',
    'n700': '#605d5d', 'n800': '#444141', 'n900': '#2d2b2b',
    'skin': '#ffd9c7', 'skin7': '#eeab92', 'nose': '#f2826f', 'a600': '#dd2b0f', 'a700': '#ae1800', 'a800': '#7c1405', 'a400': '#ff9783',
    'blu': '#3986e4', 'blu8': '#1d4a93', 'teal': '#2ac3bb', 'teal7': '#00787d', 'yel': '#f5d240', 'yel7': '#ce9200', 'org': '#f68c36', 'org7': '#c8641c',
    'pur': '#8e51c7', 'pur8': '#54277c', 'pink': '#f47db9',
    'wood7': '#7d4e2c', 'wood9': '#53311c', 'spruce': '#e2c48c', 'spruce7': '#c9a265', 'brass': '#ddb049', 'brass7': '#a67628',
}


class Pix:
    def __init__(self, w, h):
        self.w, self.h, self.p, self.oy = w, h, {}, 0

    def px(self, x, y, c):
        x, y = int(round(x)), int(round(y + self.oy))
        if 0 <= x < self.w and 0 <= y < self.h:
            self.p[(x, y)] = C.get(c, c)

    def rect(self, x, y, w, h, c):
        for j in range(int(h)):
            for i in range(int(w)):
                self.px(x + i, y + j, c)

    def ell(self, cx, cy, rx, ry, c):
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                if ((x - cx) / (rx + .35)) ** 2 + ((y - cy) / (ry + .35)) ** 2 <= 1:
                    self.px(x, y, c)

    def line(self, x0, y0, x1, y1, c, r=0):
        n = int(max(abs(x1 - x0), abs(y1 - y0))) + 1
        for k in range(n + 1):
            x, y = x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n
            if r:
                self.ell(x, y, r, r, c)
            else:
                self.px(x, y, c)

    def tri(self, a, b, tip, c):
        for k in range(12):
            q = k / 11
            self.line(a[0] + (tip[0] - a[0]) * q, a[1] + (tip[1] - a[1]) * q, b[0] + (tip[0] - b[0]) * q, b[1] + (tip[1] - b[1]) * q, c)

    def outline(self):
        out = dict(self.p)
        for y in range(self.h):
            for x in range(self.w):
                if (x, y) not in self.p and any((x + dx, y + dy) in self.p for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    out[(x, y)] = C['ink']
        self.p = out

    def image(self):
        im = Image.new('RGBA', (self.w, self.h), (0, 0, 0, 0))
        for (x, y), c in self.p.items():
            im.putpixel((x, y), tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) + (255,))
        return im


# ─────────────────────────── the hero

HERO_W, HERO_H, HERO_CX = 30, 50, 15


def hero(walk=None, breath=0, blink=False, mouth='smirk', tap=0, brows=0):
    p = Pix(HERO_W, HERO_H)
    if walk is None:
        sx, lift, bob = 0, (0, 0), breath
    else:  # contact, passing, contact, passing
        sx = [2, 0, -2, 0][walk]
        lift = [(0, 0), (0, 1), (0, 0), (1, 0)][walk]
        bob = walk % 2
    up = -bob
    # trainers and skinny jeans
    for k, fx in enumerate((6 - sx, 14 + sx)):
        ly = -lift[k] - (tap if k == 1 else 0)
        p.rect(fx, 46 + ly, 9, 3, 'n100'); p.rect(fx, 48 + ly, 9, 1, 'n400'); p.rect(fx + 2, 46 + ly, 3, 1, 'a600')
        p.rect(fx + 1, 34 + up, 4, 12 + ly - up, 'blu8'); p.rect(fx + 1, 34 + up, 1, 12 + ly - up, 'blu'); p.rect(fx + 1, 43 + ly, 4, 1, 'blu')
    p.oy = up
    # satchel behind
    p.rect(3, 27, 5, 8, 'teal7'); p.rect(3, 27, 5, 1, 'teal')
    # baggy hoodie
    p.ell(14, 29, 8, 7, 'a600'); p.rect(6, 25, 17, 10, 'a600'); p.rect(6, 25, 4, 10, 'a800')
    p.rect(11, 30, 9, 4, 'a700'); p.rect(13, 25, 1, 4, 'n100'); p.rect(17, 25, 1, 4, 'n100')
    p.line(19, 22, 9, 34, 'wood7')
    # arms swing as he walks; big hands
    p.line(7, 25, 4 + sx * 0.8, 33, 'a800', 1.4); p.ell(4 + sx * 0.8, 35, 2, 2, 'skin')
    p.line(22, 25, 24 - sx * 0.8, 32, 'a600', 1.4); p.ell(24.5 - sx * 0.8, 34, 2.2, 2.2, 'skin'); p.px(25 - sx * 0.8, 35, 'skin7')
    # big head
    p.rect(13, 20, 4, 3, 'skin7')
    p.ell(15, 13, 8.5, 8, 'skin'); p.ell(9, 15, 3, 5, 'skin7')
    p.rect(23, 13, 2, 2, 'skin'); p.px(24, 14, 'skin7')                    # a small button nose
    p.ell(9, 13, 1.5, 2, 'skin7')                                           # ear
    for ex in (15, 20):
        if blink:
            p.rect(ex - 1, 11, 3, 1, 'skin7')
        else:
            p.ell(ex, 11, 1.8, 2.4, 'n100'); p.rect(ex + 0.5, 10, 1, 2, 'ink')
    p.line(13, 7.5 - brows, 16, 8 - brows, 'ink'); p.line(19, 8 - brows, 22, 7.5 - brows, 'ink')
    if mouth == 'open':
        p.rect(17, 16, 5, 3, 'a800'); p.rect(18, 18, 3, 1, 'a400')
    elif mouth == 'shut':
        p.line(17, 17, 21, 17, 'a800')
    else:
        p.line(16, 17, 22, 17, 'a800'); p.px(22, 16, 'a800'); p.rect(17, 18, 4, 1, 'skin7')
    # spiky mop of hair
    p.ell(13, 7, 7.5, 3, 'ink'); p.rect(6, 7, 4, 8, 'ink')
    for tip, a, b in [((5, 1), (6, 8), (10, 6)), ((9, -2), (8, 6), (13, 5)), ((14, -3), (11, 5), (17, 5)),
                      ((19, -1), (15, 5), (21, 6)), ((24, 3), (19, 6), (23, 8)), ((2, 8), (6, 7), (7, 12))]:
        p.tri(a, b, tip, 'ink')
    for x in (16, 18, 20, 22):
        p.line(x, 6, x + 1, 9, 'ink')
    p.px(12, 2, 'n700'); p.px(15, 0, 'n700'); p.px(10, 5, 'n700')
    p.oy = 0
    p.outline()
    return p


def hero_idle():
    return [hero(breath=1 if (f // 4) % 2 else 0, blink=f == 13, tap=1 if 5 <= f <= 8 and f % 2 else 0) for f in range(16)]


def hero_walk():
    return [hero(walk=f) for f in range(4)]


def hero_talk():
    return [hero(mouth=m, brows=b) for m, b in [('open', 0), ('shut', 0), ('open', 1), ('smirk', 1)]]


# ─────────────────────────── Barnaby, sitting on his bench with his pipe

BARN_W, BARN_H, BARN_CX = 34, 46, 16


def barnaby(breath=0, blink=False, mouth='shut', smoke=0.0):
    p = Pix(BARN_W, BARN_H)
    p.rect(20, 41, 8, 4, 'ink'); p.rect(21, 41, 3, 1, 'n700'); p.rect(20, 35, 4, 7, 'n900')
    p.rect(12, 41, 7, 4, 'ink'); p.rect(13, 35, 4, 7, 'n900')
    p.rect(8, 31, 18, 6, 'n900')
    p.oy = -breath
    p.ell(14, 26, 10, 9, 'n800'); p.ell(18, 27, 6, 7, 'n700'); p.rect(14, 22, 1, 12, 'n900')
    for y in (24, 28, 32):
        p.px(16, y, 'brass')
    jaw = 1 if mouth == 'open' else 0
    p.ell(19, 22 + jaw, 7, 6, 'n100'); p.ell(17, 25 + jaw, 5, 4, 'n100'); p.ell(22, 26 + jaw, 3, 3, 'n200'); p.ell(15, 21, 3, 2, 'n200')
    p.ell(18, 14, 7, 6.5, 'skin'); p.ell(13, 15, 2, 4, 'skin7')
    p.ell(25, 16, 3, 2.6, 'nose'); p.px(24, 15, 'a400')
    p.ell(20, 11.5, 3.5, 1.2, 'n100'); p.ell(14.5, 12, 2.5, 1, 'n100')
    for ex in (19, 14):
        if blink:
            p.rect(ex, 15, 2, 1, 'skin7')
        else:
            p.rect(ex, 14, 2, 2, 'n100'); p.px(ex + 1, 14, 'ink'); p.px(ex + 1, 15, 'ink')
    if mouth == 'open':
        p.rect(18, 20, 5, 2, 'a800')
    p.ell(21, 19, 4, 1.6, 'n100'); p.ell(17, 19, 3, 1.4, 'n100')
    p.rect(25, 20 + jaw, 4, 1, 'wood9'); p.rect(28, 17 + jaw, 2, 3, 'wood9'); p.px(28, 17 + jaw, 'org' if smoke < .5 else 'a600')
    p.ell(17, 8, 8, 3, 'a700'); p.rect(10, 8, 15, 2, 'a800'); p.rect(20, 9, 7, 1, 'a800'); p.px(15, 6, 'brass'); p.rect(12, 6, 3, 1, 'a600')
    p.line(11, 22, 9, 30, 'n800', 1.6); p.ell(10, 32, 2.4, 2, 'skin')
    p.oy = 0
    p.outline()
    # pipe smoke, curling up (no outline)
    for k in range(3):
        q = (smoke + k / 3) % 1
        x, y, r = 29 + math.sin(q * 6 + k) * 1.2 + q * 2, 15 - breath - q * 14, 0.6 + q * 1.4
        if q < 0.9:
            p.ell(x, y, r, r, 'n200'); p.px(x - 0.5, y - 0.5, 'n100')
    return p


def barnaby_idle():
    return [barnaby(breath=1 if (f // 6) % 2 else 0, blink=f in (19, 20), smoke=f / 24) for f in range(24)]


def barnaby_talk():
    return [barnaby(mouth=m, smoke=f / 8) for f, m in enumerate(['open', 'shut', 'open', 'shut', 'open', 'open', 'shut', 'shut'])]


# ─────────────────────────── Roz, the Camden busker

ROZ_W, ROZ_H, ROZ_CX = 46, 58, 18


def roz_skirt(p, sway=0):
    p.rect(12, 55, 6, 2, 'wood9'); p.rect(19, 55, 6, 2, 'wood9'); p.rect(12, 54, 6, 1, 'skin'); p.rect(19, 54, 6, 1, 'skin')
    for y in range(36, 54):
        w = 7 + (y - 36) // 3
        s = sway if y > 47 else 0
        p.rect(18 - w + s, y, 2 * w + 1, 1, 'teal' if (y // 6) % 2 == 0 else 'org')
        p.rect(18 + w - 1 + s, y, 2, 1, 'teal7' if (y // 6) % 2 == 0 else 'org7')
    for x in range(11, 26, 3):
        p.px(x, 40, 'yel'); p.px(x + 1, 46, 'pink'); p.px(x + sway, 52, 'yel')


def roz_hair(p, front=False):
    blobs = ([(10, 10, 7), (26, 10, 7), (18, 5, 7), (7, 20, 5), (29, 20, 5), (12, 3, 4), (24, 3, 4)] if front else
             [(15, 9, 7), (22, 6, 7), (10, 15, 6), (28, 10, 6), (8, 22, 5), (30, 17, 5), (12, 4, 4), (20, 2, 4)])
    for cx, cy, r in blobs:
        p.ell(cx, cy, r, r, 'n400')
    for cx, cy, r in blobs[:4]:
        p.ell(cx - 1, cy - 1, r - 2, r - 2, 'n300')
    for x, y in ([(8, 5), (18, 0), (25, 5), (5, 14)] if front else [(11, 5), (19, 1), (25, 6), (7, 12)]):
        p.px(x, y, 'n100'); p.px(x + 1, y, 'n100')


def roz_side(breath=0, nod=0, strum=0, mouth='grin', blink=False, sway=0, notes=()):
    p = Pix(ROZ_W, ROZ_H)
    roz_skirt(p, sway)
    p.oy = -breath
    p.rect(12, 22, 13, 15, 'pur'); p.rect(21, 22, 4, 15, 'pur8'); p.rect(15, 22, 6, 13, 'yel'); p.rect(15, 22, 6, 1, 'yel7')
    for i, c in enumerate(['teal', 'brass', 'pink', 'brass', 'teal']):
        p.px(15 + i * 1.3, 25 + abs(i - 2) * 0.6, c)
    p.ell(17, 37, 7, 5, 'wood7'); p.ell(17, 36, 6, 4, 'spruce'); p.ell(19, 37, 3, 2, 'spruce7'); p.ell(18, 35, 1.4, 1.4, 'ink')
    p.line(23, 33, 38, 22, 'wood9', 0.8); p.rect(37, 19, 4, 4, 'wood9'); p.px(36, 19, 'n300'); p.px(41, 21, 'n300')
    p.line(12, 24, 13, 33 + strum, 'pur8', 1.3); p.ell(14, 35 + strum, 2, 2, 'skin')
    p.line(24, 24, 31, 27, 'pur', 1.3); p.ell(32, 26, 2, 2, 'skin')
    p.oy = -breath + nod
    roz_hair(p)
    p.ell(22, 15, 6, 7.5, 'skin'); p.ell(17.5, 16, 2, 5, 'skin7')
    p.line(27, 14, 30, 18, 'skin', 1); p.px(30, 18, 'skin7')
    for ex in (21, 26):
        p.ell(ex, 13, 2.2, 2.2, 'brass7'); p.ell(ex, 13, 1.3, 1.3, 'n100')
        p.px(ex + 0.5, 13, 'skin7' if blink else 'ink')
    p.px(23.5, 13, 'brass7')
    if mouth == 'sing':
        p.ell(25, 20, 2, 1.6, 'a800'); p.px(25, 21, 'a400')
    else:
        p.rect(22, 19, 6, 2, 'a800'); p.rect(22, 19, 6, 1, 'n100'); p.px(28, 18, 'a800')
    p.ell(19, 18, 1, 0.8, 'a400')
    p.px(17, 17, 'teal'); p.px(17, 18, 'teal')
    p.line(15, 8, 29, 7, 'pur'); p.ell(14, 9, 1.6, 1.6, 'pink'); p.px(14, 9, 'yel')
    p.oy = 0
    p.outline()
    for nx, ny in notes:
        p.rect(nx, ny, 1, 4, 'ink'); p.rect(nx - 1, ny + 3, 2, 2, 'ink'); p.px(nx + 1, ny, 'ink'); p.px(nx + 2, ny + 1, 'ink')
    return p


def roz_front(mouth='grin', blink=False, brows=0, gesture=False):
    p = Pix(ROZ_W, ROZ_H)
    roz_skirt(p)
    p.rect(11, 22, 15, 15, 'pur'); p.rect(22, 22, 4, 15, 'pur8'); p.rect(15, 22, 7, 13, 'yel'); p.rect(21, 22, 1, 13, 'yel7')
    for i, c in enumerate(['teal', 'brass', 'pink', 'brass', 'teal']):
        p.px(15.5 + i * 1.3, 25 + abs(i - 2) * 0.6, c)
    p.ell(13, 37, 7, 5, 'wood7'); p.ell(13, 36, 6, 4, 'spruce'); p.ell(15, 37, 3, 2, 'spruce7'); p.ell(14, 35, 1.4, 1.4, 'ink')
    p.line(19, 33, 32, 25, 'wood9', 0.8); p.rect(31, 22, 4, 4, 'wood9'); p.px(30, 22, 'n300'); p.px(35, 24, 'n300')
    p.line(11, 24, 10, 33, 'pur8', 1.3); p.ell(10, 35, 2, 2, 'skin')
    if gesture:
        p.line(25, 24, 31, 19, 'pur', 1.3); p.ell(32, 17, 2.2, 2.2, 'skin')
    else:
        p.line(25, 24, 27, 29, 'pur', 1.3); p.ell(28, 30, 2, 2, 'skin')
    roz_hair(p, front=True)
    p.ell(18, 15, 6, 7.5, 'skin'); p.ell(13.5, 17, 1.5, 4, 'skin7')
    for ex in (15, 21):
        p.ell(ex, 13, 2.2, 2.2, 'brass7'); p.ell(ex, 13, 1.3, 1.3, 'n100')
        p.px(ex, 13, 'skin7' if blink else 'ink')
    p.px(18, 13, 'brass7')
    p.line(14, 10 - brows, 16, 10 - brows, 'n500'); p.line(20, 10 - brows, 22, 10 - brows, 'n500')
    p.line(18, 14, 18, 17, 'skin7'); p.px(17, 17, 'skin7')                 # long nose
    if mouth == 'open':
        p.rect(15, 19, 7, 3, 'a800'); p.rect(15, 19, 7, 1, 'n100'); p.rect(16, 21, 5, 1, 'a400')
    elif mouth == 'shut':
        p.line(15, 20, 21, 20, 'a800')
    else:
        p.rect(15, 19, 7, 2, 'a800'); p.rect(15, 19, 7, 1, 'n100'); p.px(14, 18, 'a800'); p.px(22, 18, 'a800')
    p.ell(13.5, 18, 1, 0.8, 'a400'); p.ell(22.5, 18, 1, 0.8, 'a400')
    p.px(11, 17, 'teal'); p.px(11, 18, 'teal'); p.px(25, 17, 'teal'); p.px(25, 18, 'teal')
    p.line(11, 8, 25, 8, 'pur'); p.ell(26, 8, 1.6, 1.6, 'pink'); p.px(26, 8, 'yel')
    p.outline()
    return p


def roz_play():
    frames = []
    for f in range(24):
        notes = []
        for ph in (0, 12):
            q = ((f + ph) % 24) / 24
            if q < 0.75:
                notes.append((36 + round(q * 6), 14 - round(q * 13)))
        frames.append(roz_side(breath=1 if (f // 6) % 2 else 0, nod=1 if f % 4 == 2 else 0, strum=f % 2,
                               mouth='sing' if (f // 3) % 3 != 2 else 'grin', blink=f in (17, 18),
                               sway=[0, 1, 0, -1][(f // 3) % 4], notes=notes))
    return frames


def roz_listen():
    return [roz_front(mouth='grin' if f < 10 else 'shut', blink=f in (12, 13)) for f in range(16)]


def roz_talk():
    seq = [('open', 0, False), ('shut', 0, False), ('open', 1, False), ('shut', 1, True),
           ('open', 0, True), ('grin', 0, False), ('open', 0, False), ('shut', 0, False)]
    return [roz_front(mouth=m, brows=b, gesture=g) for m, b, g in seq]


# ─────────────────────────── output

def sheet(frames):
    w, h = frames[0].w, frames[0].h
    im = Image.new('RGBA', (w * len(frames), h), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        im.paste(f.image(), (i * w, 0))
    return im


def piskel(name, im, w, h, n, fps):
    buf = io.BytesIO(); im.save(buf, 'PNG')
    layer = {'name': name, 'opacity': 1, 'frameCount': n,
             'chunks': [{'layout': [[i] for i in range(n)], 'base64PNG': 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()}]}
    return {'modelVersion': 2, 'piskel': {'name': name, 'description': '', 'fps': fps, 'height': h, 'width': w,
            'layers': [json.dumps(layer)], 'hiddenFrames': []}}


SHEETS = {
    'hero-idle': hero_idle, 'hero-walk': hero_walk, 'hero-talk': hero_talk,
    'barnaby-idle': barnaby_idle, 'barnaby-talk': barnaby_talk,
    'roz-play': roz_play, 'roz-listen': roz_listen, 'roz-talk': roz_talk,
}

if __name__ == '__main__':
    img_dir = os.path.join(HERE, '..', 'src', 'art', 'img')
    pk_dir = os.path.join(HERE, 'piskel')
    os.makedirs(pk_dir, exist_ok=True)
    for name, make in SHEETS.items():
        frames = make()
        im = sheet(frames)
        im.save(os.path.join(img_dir, name + '.png'))
        with open(os.path.join(pk_dir, name + '.piskel'), 'w') as f:
            json.dump(piskel(name, im, frames[0].w, frames[0].h, len(frames), 8), f)
        print(f'{name}: {len(frames)} frames of {frames[0].w}x{frames[0].h}')

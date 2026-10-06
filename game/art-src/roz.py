"""Roz, the Camden busker, as hand-placed pixel art.

Run `python3 art-src/roz.py` from game/ to rebuild her sprite sheets in
src/art/img/ and the editable Piskel files next to this script. Once you edit
her in Piskel, treat the .piskel files as the master copy: running this
script again overwrites the PNGs.

Each frame is 36x60 pixels. The game draws her at 2x, the same pixel size as
the rest of the cast. She faces right (the game mirrors her), her feet stand
on the bottom row, and her body is centred on x = BODY_X.

- play:   side-on, strumming and singing (24 frames, 8 fps)
- listen: facing you in a conversation, waiting (16 frames)
- talk:   facing you, talking (8 frames)
"""
import base64, io, json, os
from PIL import Image

W, H = 36, 60
BODY_X = 14
HERE = os.path.dirname(os.path.abspath(__file__))

C = {  # the game's palette (src/art/kit.ts), plus a few in-between shades
    'ink': '#201e1d', 'n100': '#f8f4f4', 'n200': '#eae7e7', 'n300': '#d7d3d3', 'n400': '#bab6b6', 'n500': '#9b9797',
    'a400': '#ff9783', 'a700': '#ae1800', 'a800': '#7c1405',
    'skin': '#f6cdb8', 'skin7': '#dfa58d',
    'pur3': '#ad7ee0', 'pur': '#8e51c7', 'pur8': '#54277c', 'pink': '#f47db9', 'pink7': '#c95590',
    'teal': '#2ac3bb', 'teal7': '#00787d', 'yel': '#f5d240', 'yel7': '#ce9200', 'org': '#f68c36', 'org7': '#c8641c',
    'grn': '#4db956', 'wood': '#a87346', 'wood7': '#7d4e2c', 'wood9': '#53311c', 'spruce': '#e2c48c', 'spruce7': '#c9a265',
    'brass': '#ddb049', 'brass7': '#a67628',
}


class Pix:
    def __init__(self):
        self.p = {}
        self.oy = 0

    def px(self, x, y, c):
        x, y = round(x), round(y + self.oy)
        if 0 <= x < W and 0 <= y < H:
            self.p[(x, y)] = C.get(c, c)

    def rect(self, x, y, w, h, c):
        for j in range(h):
            for i in range(w):
                self.px(x + i, y + j, c)

    def ell(self, cx, cy, rx, ry, c):
        for dy in range(-ry, ry + 1):
            w = int(rx * (max(0, 1 - dy * dy / (ry * ry + 0.5))) ** 0.5)
            self.rect(cx - w, cy + dy, 2 * w + 1, 1, c)

    def line(self, x0, y0, x1, y1, c):
        n = max(abs(x1 - x0), abs(y1 - y0), 1)
        for k in range(n + 1):
            self.px(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, c)

    def mirror_px(self, x, y, c):
        """A pixel and its mirror image across the body's centre line."""
        self.px(x, y, c); self.px(2 * BODY_X - x, y, c)


# ── parts shared by both views

def skirt(p, sway=0):
    tiers = [(39, 44, 'teal', 'teal7', 6), (45, 50, 'org', 'org7', 7), (51, 56, 'pur', 'pur8', 8)]
    for t, (y0, y1, base, dark, half) in enumerate(tiers):
        s = sway if t == 2 else 0
        for y in range(y0, y1 + 1):
            w = half + (y - y0) // 3
            l = BODY_X - w + s
            p.rect(l, y, 2 * w + 1, 1, base)
            p.rect(l + 2 * w - 1, y, 2, 1, dark)
            if y == y1:
                p.rect(l, y, 2 * w + 1, 1, dark)
    for x in range(BODY_X - 5, BODY_X + 6, 3):
        p.px(x, 41, 'yel')
    for x in range(BODY_X - 7, BODY_X + 8, 2):
        p.px(x, 47 + (x % 2), 'yel')
    for x in range(BODY_X - 8 + sway, BODY_X + 9 + sway, 3):
        p.px(x, 53, 'pink')


def sandals(p, xs):
    for fx in xs:
        p.rect(fx, 57, 5, 1, 'skin'); p.rect(fx, 58, 5, 2, 'wood9'); p.px(fx + 1, 57, 'wood7')


# ── side-on, playing

def side(breath=0, nod=0, strum=0, mouth='shut', blink=False, sway=0, notes=()):
    p = Pix()
    up, hd = -breath, -breath + nod

    # big grey curls, behind
    p.oy = hd
    p.ell(10, 13, 6, 8, 'n400'); p.ell(9, 12, 5, 7, 'n300')
    p.ell(15, 7, 5, 3, 'n400'); p.ell(15, 6, 4, 2, 'n300')
    p.ell(9, 21, 4, 3, 'n400'); p.ell(8, 20, 3, 2, 'n300')
    for x, y in [(7, 8), (12, 5), (16, 4), (6, 14), (6, 19)]:
        p.px(x, y, 'n100')
    for x, y in [(11, 17), (9, 23), (12, 21), (7, 11)]:
        p.px(x, y, 'n500')

    # fretting arm, reaching for the neck
    p.oy = up
    p.line(18, 28, 22, 32, 'pur8'); p.line(18, 27, 22, 31, 'pur'); p.line(18, 26, 22, 30, 'pur')

    p.oy = 0
    skirt(p, sway)
    sandals(p, (8, 14))

    # purple coat over a yellow blouse
    p.oy = up
    for y in range(24, 47):
        if y < 39:
            l, r = (10, 18) if y == 24 else (9, 19) if y == 25 else (8, 20)
            p.rect(l, y, r - l + 1, 1, 'pur'); p.rect(r - 1, y, 2, 1, 'pur8'); p.px(l, y, 'pur3')
        else:  # the coat's front panels hang open over the skirt
            p.rect(7, y, 3, 1, 'pur'); p.px(9, y, 'pink'); p.rect(19, y, 3, 1, 'pur8'); p.px(19, y, 'pink')
    p.rect(12, 25, 4, 14, 'yel'); p.rect(15, 25, 1, 14, 'yel7')
    p.line(11, 25, 11, 38, 'pink'); p.line(16, 25, 16, 38, 'pink')
    # knitted scarf, one end hanging down
    p.rect(13, 21, 3, 3, 'skin7')
    for i, c in enumerate(['org', 'yel', 'teal', 'pink', 'org', 'yel']):
        p.px(11 + i, 23, c); p.px(11 + i, 24, c)
    for j, c in enumerate(['teal', 'pink', 'org', 'yel', 'teal', 'pink']):
        p.rect(10, 25 + j, 2, 1, c)

    # head, in profile
    p.oy = hd
    p.ell(16, 15, 4, 6, 'skin')
    p.px(21, 15, 'skin'); p.px(21, 16, 'skin7')            # nose
    p.rect(12, 17, 2, 4, 'skin7'); p.rect(14, 21, 3, 1, 'skin7')  # jaw
    p.rect(13, 14, 2, 3, 'skin7'); p.px(13, 18, 'teal')     # ear and earring
    p.px(19, 17, 'a400')                                     # rosy cheek
    for x, y in [(17, 13), (18, 13), (19, 13), (17, 14), (20, 14)]:
        p.px(x, y, 'brass7')                                 # round glasses
    p.px(15, 14, 'brass7'); p.px(16, 14, 'brass7')
    if blink:
        p.rect(18, 14, 2, 1, 'skin7')
    else:
        p.px(18, 14, 'n100'); p.px(19, 14, 'ink')
    p.px(18, 12, 'n500'); p.px(19, 12, 'n500')               # brow
    if mouth == 'sing':
        p.rect(19, 19, 2, 2, 'a800')
    elif mouth == 'smile':
        p.rect(19, 19, 2, 1, 'a700'); p.px(21, 18, 'a700')
    else:
        p.rect(19, 19, 2, 1, 'a700')
    # curls over the forehead, headband and daisy
    p.ell(17, 9, 3, 1, 'n300'); p.px(15, 8, 'n100'); p.px(19, 10, 'n400')
    p.line(12, 10, 20, 10, 'pur')
    for dx, dy in [(0, -1), (-1, 0), (1, 0), (0, 1)]:
        p.px(11 + dx, 10 + dy, 'pink')
    p.px(11, 10, 'yel')

    # the guitar
    p.oy = up
    p.ell(15, 41, 6, 5, 'wood7'); p.ell(15, 40, 5, 4, 'spruce'); p.rect(17, 42, 3, 2, 'spruce7')
    p.rect(16, 38, 2, 2, 'ink'); p.rect(11, 42, 3, 1, 'wood9')
    p.line(20, 39, 29, 31, 'wood9'); p.line(20, 38, 29, 30, 'wood7')
    p.rect(29, 28, 3, 3, 'wood9'); p.px(28, 28, 'n300'); p.px(32, 29, 'n300')
    p.line(13, 41, 20, 38, 'n200')

    # strumming arm, and both hands
    p.rect(8, 26, 3, 8, 'pur'); p.rect(10, 26, 1, 8, 'pur8')
    hy = 40 + strum
    p.line(10, 33, 12, hy, 'pur'); p.line(11, 33, 13, hy - 1, 'pur'); p.line(11, 34, 13, hy, 'pur8')
    p.px(13, hy + 1, 'brass'); p.rect(14, hy, 2, 2, 'skin')
    p.rect(22, 30, 3, 3, 'skin'); p.px(22, 32, 'skin7')

    # music notes drift up off the strings
    p.oy = 0
    for nx, ny in notes:
        p.rect(nx, ny, 1, 4, 'ink'); p.rect(nx - 1, ny + 3, 2, 2, 'ink'); p.px(nx + 1, ny, 'ink'); p.px(nx + 2, ny + 1, 'ink')
    return p


# ── facing you, in a conversation

def front(mouth='shut', blink=False, brows=False, gesture=False):
    p = Pix()
    # big grey curls, behind
    p.ell(BODY_X, 12, 9, 9, 'n400'); p.ell(BODY_X - 1, 11, 8, 8, 'n300')
    p.ell(BODY_X, 5, 6, 3, 'n300')
    for x in (6, 22):
        p.ell(x, 17, 3, 5, 'n400'); p.ell(x, 22, 3, 2, 'n400')
    p.ell(6, 16, 2, 4, 'n300')
    for x, y in [(8, 5), (12, 3), (17, 4), (5, 12), (4, 19)]:
        p.px(x, y, 'n100')
    for x, y in [(21, 12), (23, 19), (22, 23), (19, 6)]:
        p.px(x, y, 'n500')

    skirt(p)
    sandals(p, (BODY_X - 6, BODY_X + 2))

    # coat open over the blouse
    for y in range(24, 47):
        if y < 39:
            l, r = (9, 19) if y == 24 else (8, 20) if y == 25 else (7, 21)
            p.rect(l, y, r - l + 1, 1, 'pur'); p.rect(r - 1, y, 2, 1, 'pur8'); p.px(l, y, 'pur3')
        else:
            p.rect(6, y, 4, 1, 'pur'); p.px(9, y, 'pink'); p.rect(19, y, 4, 1, 'pur'); p.rect(21, y, 2, 1, 'pur8'); p.px(19, y, 'pink')
    p.rect(12, 25, 5, 14, 'yel'); p.rect(16, 25, 1, 14, 'yel7')
    p.line(11, 25, 11, 38, 'pink'); p.line(17, 25, 17, 38, 'pink')
    # scarf round the neck, an end hanging down the front
    p.rect(12, 21, 5, 3, 'skin7')
    for i, c in enumerate(['org', 'yel', 'teal', 'pink', 'org', 'yel', 'teal', 'pink', 'org']):
        p.px(10 + i, 23, c); p.px(10 + i, 24, c)
    for j, c in enumerate(['teal', 'pink', 'org', 'yel', 'teal', 'pink']):
        p.rect(15, 25 + j, 2, 1, c)
    for x, c in [(12, 'teal'), (13, 'brass'), (14, 'pink')]:
        p.px(x, 26, c)                                       # beads

    # face
    p.ell(BODY_X, 15, 4, 6, 'skin')
    p.rect(BODY_X - 4, 18, 1, 2, 'skin7'); p.rect(BODY_X + 4, 18, 1, 2, 'skin7'); p.rect(BODY_X - 2, 21, 5, 1, 'skin7')
    p.mirror_px(9, 14, 'skin7'); p.mirror_px(9, 15, 'skin7'); p.mirror_px(9, 18, 'teal')   # ears, earrings
    for x, y in [(11, 13), (12, 13), (13, 13), (11, 14), (13, 14)]:
        p.mirror_px(x, y, 'brass7')                          # glasses
    p.px(BODY_X, 14, 'brass7')
    p.mirror_px(12, 14, 'skin7' if blink else 'ink')
    by = 11 if brows else 12
    p.mirror_px(11, by, 'n500'); p.mirror_px(12, by, 'n500')
    p.px(BODY_X, 16, 'skin7'); p.px(BODY_X, 17, 'skin7')     # nose
    p.mirror_px(11, 17, 'a400')                              # cheeks
    if mouth == 'open':
        p.rect(BODY_X - 1, 19, 3, 2, 'a800'); p.px(BODY_X, 20, 'a700')
    elif mouth == 'smile':
        p.rect(BODY_X - 1, 19, 3, 1, 'a700'); p.mirror_px(12, 18, 'a700')
    else:
        p.rect(BODY_X - 1, 19, 3, 1, 'a700')
    # fringe curls, headband and daisy
    p.ell(BODY_X - 2, 9, 2, 1, 'n300'); p.ell(BODY_X + 2, 9, 2, 1, 'n300'); p.px(BODY_X, 9, 'n400')
    p.line(9, 10, 19, 10, 'pur')
    for dx, dy in [(0, -1), (-1, 0), (1, 0), (0, 1)]:
        p.px(20 + dx, 10 + dy, 'pink')
    p.px(20, 10, 'yel')

    # guitar held across her, resting
    p.ell(10, 42, 5, 4, 'wood7'); p.ell(10, 41, 4, 3, 'spruce'); p.rect(12, 42, 2, 2, 'spruce7')
    p.rect(10, 40, 2, 2, 'ink')
    p.line(14, 39, 23, 31, 'wood9'); p.line(14, 38, 23, 30, 'wood7')
    p.rect(23, 28, 3, 3, 'wood9'); p.px(22, 28, 'n300'); p.px(26, 29, 'n300')
    # arms: one hand on the guitar, the other on the neck or gesturing as she talks
    p.rect(6, 26, 2, 13, 'pur'); p.px(7, 39, 'brass'); p.rect(6, 40, 2, 2, 'skin')
    if gesture:
        p.rect(20, 26, 2, 6, 'pur8'); p.line(21, 31, 24, 26, 'pur'); p.rect(24, 24, 2, 2, 'skin')
    else:
        p.rect(20, 26, 2, 7, 'pur8'); p.rect(19, 33, 2, 2, 'skin')
    return p


# ── animations

def play_frames():
    frames = []
    for f in range(24):
        notes = []
        for ph in (0, 12):
            q = ((f + ph) % 24) / 24
            if q < 0.75:
                notes.append((25 + round(q * 7), 22 - round(q * 18)))
        frames.append(side(breath=1 if (f // 6) % 2 else 0, nod=1 if f % 4 == 2 else 0, strum=f % 2,
                           mouth='sing' if (f // 3) % 3 != 2 else 'smile', blink=f in (17, 18),
                           sway=[0, 1, 0, -1][(f // 3) % 4], notes=notes))
    return frames


def listen_frames():
    return [front(mouth='smile' if f < 10 else 'shut', blink=f in (12, 13)) for f in range(16)]


def talk_frames():
    seq = [('open', False, False), ('shut', False, False), ('open', True, False), ('shut', True, True),
           ('open', False, True), ('smile', False, False), ('open', False, False), ('shut', False, False)]
    return [front(mouth=m, brows=b, gesture=g) for m, b, g in seq]


def image(p):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for (x, y), c in p.p.items():
        im.putpixel((x, y), tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) + (255,))
    return im


def sheet(frames):
    im = Image.new('RGBA', (W * len(frames), H), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        im.paste(image(f), (i * W, 0))
    return im


def piskel(name, im, n, fps):
    """A .piskel file, so the sprite opens in piskelapp.com for hand editing."""
    buf = io.BytesIO(); im.save(buf, 'PNG')
    layer = {'name': 'Roz', 'opacity': 1, 'frameCount': n,
             'chunks': [{'layout': [[i] for i in range(n)], 'base64PNG': 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()}]}
    return {'modelVersion': 2, 'piskel': {'name': name, 'description': 'Roz, the Camden busker', 'fps': fps,
            'height': H, 'width': W, 'layers': [json.dumps(layer)], 'hiddenFrames': []}}


if __name__ == '__main__':
    out = os.path.join(HERE, '..', 'src', 'art', 'img')
    os.makedirs(out, exist_ok=True)
    for name, frames in (('roz-play', play_frames()), ('roz-listen', listen_frames()), ('roz-talk', talk_frames())):
        im = sheet(frames)
        im.save(os.path.join(out, name + '.png'))
        with open(os.path.join(HERE, name + '.piskel'), 'w') as f:
            json.dump(piskel(name, im, len(frames), 8), f)
        print(name, len(frames), 'frames')

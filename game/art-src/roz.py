"""Roz, the Camden busker, as hand-placed pixel art.

Run `python3 art-src/roz.py` from game/ to rebuild the sprite sheets in
src/art/img/ and the editable Piskel files next to this script.

The sprite faces right; the game mirrors it. Each frame is 72x120 pixels,
drawn at one game pixel per pixel (twice the detail of the code-drawn cast).
The feet stand on the bottom row, and the body is centred on x = BODY_X.
"""
import base64, io, json, math, os
from PIL import Image

W, H = 72, 120
BODY_X = 24  # where the game centres her
HERE = os.path.dirname(os.path.abspath(__file__))

C = {  # the game's palette (src/art/kit.ts), plus a few in-between shades
    'ink': '#201e1d', 'n100': '#f8f4f4', 'n200': '#eae7e7', 'n300': '#d7d3d3', 'n400': '#bab6b6', 'n500': '#9b9797', 'n600': '#7d7979',
    'a200': '#ffe0d9', 'a300': '#ffc4b8', 'a400': '#ff9783', 'a700': '#ae1800', 'a800': '#7c1405',
    'skin': '#f6cdb8', 'skin7': '#dfa58d', 'skin3': '#ffe6da',
    'pur3': '#ad7ee0', 'pur': '#8e51c7', 'pur8': '#54277c', 'pink': '#f47db9', 'pink7': '#c95590',
    'teal': '#2ac3bb', 'teal7': '#00787d', 'teal9': '#00585c', 'yel': '#f5d240', 'yel7': '#ce9200', 'org': '#f68c36', 'org7': '#c8641c',
    'grn': '#4db956', 'grn8': '#196632',
    'wood3': '#bf9667', 'wood': '#a87346', 'wood7': '#7d4e2c', 'wood9': '#53311c', 'spruce': '#e2c48c', 'spruce7': '#c9a265',
    'brass': '#ddb049', 'brass7': '#a67628',
}


def hexrgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


class Pix:
    def __init__(self):
        self.p = {}
        self.ox = self.oy = 0

    def px(self, x, y, c):
        x, y = round(x + self.ox), round(y + self.oy)
        if 0 <= x < W and 0 <= y < H:
            self.p[(x, y)] = C.get(c, c)

    def rect(self, x, y, w, h, c):
        for j in range(h):
            for i in range(w):
                self.px(x + i, y + j, c)

    def ell(self, cx, cy, rx, ry, c):
        for dy in range(-ry, ry + 1):
            w = math.floor(rx * math.sqrt(max(0, 1 - dy * dy / (ry * ry + 0.5))))
            self.rect(cx - w, cy + dy, 2 * w + 1, 1, c)

    def line(self, x0, y0, x1, y1, c, r=0):
        n = max(abs(x1 - x0), abs(y1 - y0), 1)
        for k in range(n + 1):
            x, y = x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n
            if r:
                self.ell(round(x), round(y), r, r, c)
            else:
                self.px(x, y, c)

    def at(self, ox, oy):
        self.ox, self.oy = ox, oy


def shade(h, f):
    r, g, b = hexrgb(h)
    return '#%02x%02x%02x' % (int(r * f), int(g * f), int(b * f))


def outline(p):
    """LucasArts-style selective outline: each edge takes a dark shade of the colour it borders."""
    out = dict(p.p)
    for y in range(H):
        for x in range(W):
            if (x, y) in p.p:
                continue
            for d in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                n = p.p.get((x + d[0], y + d[1]))
                if n:
                    out[(x, y)] = shade(n, 0.38)
                    break
    p.p = out


def roz(breath=0, nod=0, strum=0, mouth='shut', blink=False, sway=0, notes=()):
    p = Pix()
    up = -breath          # the upper body rises when she breathes in
    hd = up + nod         # the head also nods to the beat

    # ── big grey curls, behind everything
    p.at(0, hd)
    for cx, cy, r in [(15, 18, 7), (12, 27, 6), (11, 36, 6), (13, 44, 5), (18, 12, 6), (26, 10, 6), (33, 14, 5), (20, 40, 5), (36, 22, 4)]:
        p.ell(cx, cy, r, r, 'n400')
    for cx, cy, r in [(14, 17, 5), (11, 26, 4), (10, 35, 4), (18, 11, 4), (26, 9, 4), (32, 13, 3)]:
        p.ell(cx - 1, cy - 1, r, r, 'n300')
    for cx, cy in [(12, 14), (16, 8), (24, 6), (9, 23), (8, 32), (30, 10)]:
        p.rect(cx, cy, 2, 1, 'n100'); p.px(cx - 1, cy + 1, 'n200')
    for cx, cy in [(17, 22), (14, 31), (13, 40), (16, 46), (21, 44)]:
        p.rect(cx, cy, 2, 1, 'n500'); p.px(cx + 1, cy - 1, 'n500')

    # ── fretting arm (her left), reaching forward for the neck
    p.at(0, up)
    p.line(33, 54, 46, 62, 'pur8', 2)
    p.line(33, 53, 45, 60, 'pur', 1)

    # ── long tiered skirt
    p.at(0, 0)
    tiers = [(74, 86, 'teal', 'teal7', 9), (87, 99, 'org', 'org7', 11), (100, 113, 'pur', 'pur8', 13)]
    for t, (y0, y1, base, dark, half) in enumerate(tiers):
        for y in range(y0, y1 + 1):
            w = half + (y - y0) // 4
            s = sway if t == 2 else 0
            l = BODY_X - w + s
            p.rect(l, y, 2 * w + 1, 1, base)
            p.rect(l + 2 * w - 3, y, 4, 1, dark)          # shadow side
            p.px(l + 1, y, shade(C[base], 1.12) if base != 'org' else 'yel')
        p.rect(BODY_X - half - (y1 - y0) // 4 + (sway if t == 2 else 0), y1, 2 * (half + (y1 - y0) // 4) + 1, 1, dark)  # ruffle
    for x in range(BODY_X - 9, BODY_X + 10, 4):          # little flowers on the top tier
        p.px(x, 79, 'yel'); p.px(x + 2, 83, 'pink')
    for x in range(BODY_X - 12, BODY_X + 13, 3):         # stitched pattern on the middle tier
        p.px(x, 92 + (x % 2), 'yel'); p.px(x + 1, 96, 'a700')
    for x in range(BODY_X - 14 + sway, BODY_X + 14 + sway, 5):  # paisley dots on the hem
        p.rect(x, 105, 2, 2, 'pink'); p.px(x + 1, 109, 'yel')

    # ── sandals and toes peeking out
    for fx in (16, 26):
        p.rect(fx, 114, 8, 4, 'skin'); p.rect(fx, 117, 9, 2, 'wood9'); p.rect(fx + 1, 115, 6, 1, 'wood7')
        p.px(fx + 7, 116, 'skin7')

    # ── purple coat, open over a yellow blouse
    p.at(0, up)
    for y in range(48, 90):
        if y < 52:
            l, r = 15 + (52 - y) // 2, 33 - (52 - y) // 2
        elif y < 74:
            l, r = 14, 34
        else:
            l, r = 13 - (y - 74) // 5, 35 + (y - 74) // 5
        if y >= 74:   # below the waist only the coat's two front panels hang down
            p.rect(l, y, 6, 1, 'pur'); p.rect(r - 5, y, 6, 1, 'pur'); p.rect(r - 2, y, 3, 1, 'pur8'); p.px(l + 5, y, 'pink')
            p.px(r - 5, y, 'pink')
        else:
            p.rect(l, y, r - l + 1, 1, 'pur'); p.rect(r - 3, y, 4, 1, 'pur8'); p.rect(l, y, 2, 1, 'pur3')
    p.rect(20, 50, 9, 22, 'yel'); p.rect(26, 50, 3, 22, 'yel7')   # blouse
    p.line(19, 50, 19, 73, 'pink'); p.line(29, 50, 29, 73, 'pink')   # coat trim
    for y in range(53, 72, 4):
        p.px(23, y, 'org'); p.px(25, y + 2, 'org')

    # ── scarf: knitted stripes, one end hanging down
    for i, c in enumerate(['org', 'yel', 'teal', 'pink', 'org', 'yel']):
        p.rect(19 + i * 2 - 1, 46, 3, 3, c)
    for j, c in enumerate(['org', 'yel', 'teal', 'pink', 'org', 'yel', 'teal']):
        p.rect(17, 48 + j * 3, 4, 3, c)
    p.rect(17, 69, 4, 1, 'org7'); p.px(17, 70, 'org'); p.px(19, 70, 'org')
    # bead necklace
    for k, (x, y) in enumerate([(22, 51), (23, 52), (24, 53), (25, 53), (26, 53), (27, 52), (28, 51)]):
        p.px(x, y, ['teal', 'brass', 'pink', 'brass'][k % 4])

    # ── head
    p.at(0, hd)
    p.rect(22, 41, 7, 6, 'skin7'); p.rect(23, 41, 5, 5, 'skin')        # neck
    p.ell(27, 32, 8, 10, 'skin')
    p.rect(32, 29, 4, 9, 'skin'); p.rect(36, 32, 1, 4, 'skin'); p.px(37, 34, 'skin')  # nose
    p.px(36, 36, 'skin7')
    p.rect(20, 33, 3, 8, 'skin7'); p.rect(23, 40, 3, 2, 'skin7'); p.rect(26, 42, 6, 1, 'skin7')  # jaw shadow
    p.rect(28, 24, 6, 2, 'skin3'); p.rect(33, 30, 2, 1, 'skin3')     # light on forehead and nose
    p.rect(21, 30, 3, 6, 'skin7'); p.rect(21, 31, 2, 4, 'skin'); p.px(22, 33, 'skin7')  # ear
    p.rect(21, 36, 1, 2, 'brass'); p.rect(20, 38, 3, 2, 'teal'); p.px(21, 40, 'brass')  # earring
    p.rect(31, 36, 3, 2, 'a400'); p.px(32, 36, 'a300')                # rosy cheek
    p.line(23, 29, 26, 29, 'n600')                                    # wrinkles by the eye
    # round granny glasses
    for a in range(0, 360, 15):
        p.px(31.5 + 3.2 * math.cos(math.radians(a)), 31 + 3.2 * math.sin(math.radians(a)), 'brass7')
    p.line(24, 30, 28, 30, 'brass7')
    if blink:
        p.rect(30, 31, 4, 1, 'skin7'); p.rect(30, 32, 4, 1, 'n600')
    else:
        p.rect(30, 30, 4, 3, 'n100'); p.rect(32, 30, 2, 3, 'ink'); p.px(32, 30, 'n500')
    p.rect(29, 26, 5, 1, 'n500'); p.px(34, 27, 'n500')                # brow
    # mouth
    if mouth == 'shut':
        p.rect(31, 39, 4, 1, 'a700'); p.px(35, 38, 'a700')
    elif mouth == 'smile':
        p.rect(31, 39, 4, 1, 'a700'); p.px(30, 38, 'a700'); p.px(35, 38, 'a700'); p.rect(31, 40, 3, 1, 'skin7')
    elif mouth == 'open':
        p.rect(31, 38, 4, 3, 'a800'); p.rect(32, 40, 2, 1, 'a400'); p.rect(31, 38, 4, 1, 'n100')
    elif mouth == 'sing':
        p.rect(31, 38, 3, 3, 'a800'); p.px(32, 39, 'a700'); p.rect(31, 41, 3, 1, 'skin7')
    # curls framing the face
    for cx, cy, r in [(22, 22, 4), (28, 19, 4), (34, 21, 3), (18, 29, 3), (17, 37, 3), (19, 44, 3)]:
        p.ell(cx, cy, r, r, 'n400'); p.ell(cx - 1, cy - 1, r - 1, r - 1, 'n300')
    for cx, cy in [(20, 19), (26, 16), (32, 19), (16, 27), (15, 35)]:
        p.rect(cx, cy, 2, 1, 'n100')
    # headband and a big daisy tucked behind the ear
    p.line(19, 25, 37, 24, 'pur'); p.line(19, 26, 37, 25, 'pur8')
    for dx, dy in [(0, -3), (-3, 0), (3, 0), (0, 3), (-2, -2), (2, -2), (-2, 2), (2, 2)]:
        p.rect(16 + dx, 24 + dy, 2, 2, 'pink' if dx == 0 or dy == 0 else 'pink7')
    p.rect(16, 24, 2, 2, 'yel'); p.px(16, 24, 'n100')
    p.rect(18, 28, 2, 1, 'grn'); p.px(20, 29, 'grn8')

    # ── the guitar, slung across her
    p.at(0, up)
    p.ell(29, 79, 11, 9, 'wood7'); p.ell(38, 71, 8, 7, 'wood7')         # sides
    p.ell(29, 78, 10, 8, 'spruce'); p.ell(38, 70, 7, 6, 'spruce')       # top
    p.ell(33, 79, 5, 4, 'spruce7'); p.ell(39, 72, 3, 2, 'spruce7')      # shading
    p.ell(26, 74, 3, 2, shade(C['spruce'], 1.08))
    p.ell(34, 74, 3, 3, 'yel7'); p.ell(34, 74, 2, 2, 'ink')             # soundhole and rosette
    p.rect(24, 80, 6, 2, 'wood9')                                       # bridge
    p.line(41, 67, 61, 49, 'wood9', 1)                                  # neck
    p.line(41, 66, 60, 49, 'wood7')
    for k in range(3, 19, 3):
        p.px(41 + k * 20 / 18, 67 - k, 'n400')                          # frets
    p.rect(59, 44, 5, 6, 'wood9'); p.rect(60, 45, 3, 4, 'wood7')       # headstock
    for y in (45, 47, 49):
        p.px(58, y, 'n300'); p.px(64, y, 'n300')                        # tuning pegs
    p.line(27, 80, 59, 50, 'n200')                                      # strings

    # ── strumming arm (her right), sleeve over the guitar
    p.line(16, 52, 15, 64, 'pur8', 2); p.line(15, 52, 14, 63, 'pur', 1)
    hy = 73 + strum * 3
    p.line(15, 64, 25, hy - 1, 'pur8', 2); p.line(15, 63, 24, hy - 2, 'pur', 1)
    p.rect(23, hy - 3, 2, 4, 'brass'); p.px(24, hy - 2, 'teal')          # bangles
    p.rect(25, hy - 2, 4, 4, 'skin'); p.rect(25, hy + 1, 4, 1, 'skin7'); p.px(29, hy - 1, 'skin')

    # ── fretting hand round the neck
    p.rect(47, 57, 4, 4, 'skin'); p.rect(47, 60, 4, 1, 'skin7'); p.px(51, 57, 'skin'); p.rect(46, 59, 1, 3, 'brass')

    p.at(0, 0)
    outline(p)

    # music notes drift up from the strings (drawn after the outline)
    for (nx, ny) in notes:
        p.rect(nx, ny, 1, 6, 'ink'); p.rect(nx - 2, ny + 5, 3, 2, 'ink'); p.rect(nx - 1, ny + 4, 1, 1, 'ink')
        p.px(nx + 1, ny, 'ink'); p.px(nx + 2, ny + 1, 'ink'); p.px(nx + 2, ny + 2, 'ink')
    return p


def image(p):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for (x, y), c in p.p.items():
        im.putpixel((x, y), hexrgb(c) + (255,))
    return im


def play_frames():
    """Playing and singing: a 3-second loop at 8 fps."""
    frames = []
    for f in range(24):
        beat = f % 4
        notes = []
        for ph in (0, 12):
            q = ((f + ph) % 24) / 24
            if q < 0.75:
                notes.append((50 + round(q * 14), 40 - round(q * 34)))
        frames.append(roz(
            breath=1 if (f // 6) % 2 else 0,
            nod=1 if beat == 2 else 0,
            strum=f % 2,
            mouth='sing' if (f // 3) % 3 != 2 else 'smile',
            blink=f in (17, 18),
            sway=[0, 1, 0, -1][(f // 3) % 4],
            notes=notes,
        ))
    return frames


def talk_frames():
    """Talking: she stops strumming, and her mouth moves. 8 fps."""
    return [roz(breath=b, mouth=m, blink=(i == 6)) for i, (b, m) in enumerate(
        [(0, 'open'), (0, 'shut'), (0, 'open'), (1, 'smile'), (1, 'open'), (1, 'shut'), (0, 'open'), (0, 'shut')])]


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
    for name, frames in (('roz-play', play_frames()), ('roz-talk', talk_frames())):
        im = sheet(frames)
        im.save(os.path.join(out, name + '.png'))
        with open(os.path.join(HERE, name + '.piskel'), 'w') as f:
            json.dump(piskel(name, im, len(frames), 8), f)
        print(name, len(frames), 'frames')

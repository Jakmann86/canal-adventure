"""Shrink high-detail pixel art to the game's chunky pixel size.

Each block of k×k pixels becomes one pixel of its most common colour, so thin
lines and edges survive better than with ordinary resizing. Transparent
pixels only win a block when they fill most of it.
"""
from collections import Counter
from PIL import Image


def reduce(im, k):
    im = im.convert('RGBA')
    out = Image.new('RGBA', (im.width // k, im.height // k), (0, 0, 0, 0))
    src = im.load()
    for Y in range(out.height):
        for X in range(out.width):
            cs = Counter(src[X * k + i, Y * k + j] for i in range(k) for j in range(k))
            c, n = cs.most_common(1)[0]
            if c[3] == 0 and n < k * k * 0.75:
                c = next(cc for cc, _ in cs.most_common() if cc[3])
            out.putpixel((X, Y), c)
    return out


def reduce_sheet(sheet, fw, frames, k):
    """Shrink a one-row sprite sheet frame by frame, so frames never bleed together."""
    out = Image.new('RGBA', (fw // k * frames, sheet.height // k), (0, 0, 0, 0))
    for i in range(frames):
        out.paste(reduce(sheet.crop((i * fw, 0, (i + 1) * fw, sheet.height)), k), (i * fw // k, 0))
    return out

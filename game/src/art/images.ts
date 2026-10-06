// Characters drawn as pixel-art sprite sheets (made in Piskel or by a script in
// art-src/), instead of in code. Each sheet is one row of equal-sized frames.
import type { Pose, SpriteFn } from './sprites';

export interface Sheet { src: string; frames: number; fps: number }

export interface SheetSprite {
  /** Frame size in image pixels. */
  w: number;
  h: number;
  /** The x, in image pixels, that the game centres on the character's position. Feet sit on the bottom row. */
  cx: number;
  /** Screen pixels per image pixel: 2 matches the code-drawn cast, 1 is finer detail. */
  scale?: 1 | 2;
  anims: Record<string, Sheet>;
  /** Which animation to play for this pose. */
  pick: (p: Pose) => string;
  /** Drawn until the images have loaded (or if one fails to). */
  fallback: SpriteFn;
}

function load(src: string) {
  const img = new Image();
  img.src = src;
  return img;
}

export function sheetSprite(def: SheetSprite): SpriteFn {
  const imgs = Object.fromEntries(Object.entries(def.anims).map(([k, s]) => [k, load(s.src)]));
  return (g, x, b, p) => {
    const name = def.pick(p), sheet = def.anims[name], img = imgs[name];
    if (!sheet || !img?.complete || !img.naturalWidth) return def.fallback(g, x, b, p);
    const t = (p.t ?? 0) / 1000 + (p.ph ?? 0), f = Math.floor(t * sheet.fps) % sheet.frames;
    // The kit draws sprites at 2× scale, centred 7 units right of x.
    const k = (def.scale ?? 2) / 2;
    g.ctx.drawImage(img, f * def.w, 0, def.w, def.h, x + 7 - def.cx * k, b - def.h * k, def.w * k, def.h * k);
  };
}

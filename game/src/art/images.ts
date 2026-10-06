// Characters drawn as pixel-art sprite sheets (made in Piskel or by a script in
// art-src/), instead of in code. Each sheet is one row of equal-sized frames, drawn
// at one game pixel per image pixel: twice the detail of the code-drawn cast.
import type { Pose, SpriteFn } from './sprites';

export interface Sheet { src: string; frames: number; fps: number }

export interface SheetSprite {
  /** Frame size in image pixels. */
  w: number;
  h: number;
  /** The x, in image pixels, that the game centres on the character's position. Feet sit on the bottom row. */
  cx: number;
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
    // The kit draws sprites at 2× scale, centred 7 units right of x, so halve everything.
    g.ctx.drawImage(img, f * def.w, 0, def.w, def.h, x + 7 - def.cx / 2, b - def.h / 2, def.w / 2, def.h / 2);
  };
}

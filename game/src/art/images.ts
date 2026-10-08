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

let version = 0;
/** Goes up each time an image finishes loading, so backgrounds that paint images can be redrawn. */
export const artVersion = () => version;

export function load(src: string) {
  const img = new Image();
  img.onload = () => { version++; };
  img.src = src;
  return img;
}

/** A still image painted into a scene background at `res` image pixels per scene pixel.
 *  Returns false (so the caller can draw its code-drawn version) until the image has loaded. */
export function paint(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, res: number) {
  if (!loaded(img)) return false;
  ctx.drawImage(img, x, y, img.naturalWidth / res, img.naturalHeight / res);
  return true;
}

export const loaded = (img: HTMLImageElement) => img.complete && img.naturalWidth > 0;

/** An animated piece of scenery from a one-row sprite sheet, placed in scene coordinates.
 *  `res` is image pixels per scene pixel: 0.5 is the cast's chunky size, 2 twice the scenes' detail. */
export function drawSheet(ctx: CanvasRenderingContext2D, img: HTMLImageElement, fw: number, fh: number, frames: number, fps: number, t: number, x: number, y: number, res: number) {
  const f = Math.floor(t * fps) % frames;
  ctx.drawImage(img, f * fw, 0, fw, fh, x, y, fw / res, fh / res);
}

export function sheetSprite(def: SheetSprite): SpriteFn {
  const imgs = Object.fromEntries(Object.entries(def.anims).map(([k, s]) => [k, load(s.src)]));
  return (g, x, b, p) => {
    const name = def.pick(p), sheet = def.anims[name], img = imgs[name];
    if (!sheet || !img || !loaded(img)) return def.fallback(g, x, b, p);
    const t = (p.t ?? 0) / 1000 + (p.ph ?? 0), f = Math.floor(t * sheet.fps) % sheet.frames;
    // The kit draws sprites at 2× scale, centred 7 units right of x.
    const k = (def.scale ?? 2) / 2;
    g.ctx.drawImage(img, f * def.w, 0, def.w, def.h, x + 7 - def.cx * k, b - def.h * k, def.w * k, def.h * k);
  };
}

// Character sprites. Coordinates are in sprite units; the kit draws them at 2×.
// `x` is the sprite's left edge, `b` its baseline (feet).
import type { Kit } from './kit';
import { sheetSprite } from './images';
import rozPlay from './img/roz-play.png';
import rozTalk from './img/roz-talk.png';

export interface Pose { walk?: number; talk?: boolean; t?: number; phone?: boolean; ph?: number }

export type SpriteFn = (g: Kit, x: number, b: number, p: Pose) => void;

/** Seconds, offset per character so they don't all breathe in step. */
const secs = (p: Pose) => (p.t ?? 0) / 1000 + (p.ph ?? 0);
/** Talking mouths open and shut. */
const flap = (p: Pose) => !!p.talk && Math.floor(secs(p) * 8) % 2 === 0;

// The teenage hero: satchel, rolled-up jeans, trainers. Walk frames lift alternate legs;
// standing still they breathe, blink, tap a foot and glance over their shoulder.
export const teen: SpriteFn = (g, x, b, p) => {
  const { R, px } = g;
  const t = secs(p), f = p.walk ?? 0, l = f === 1 ? 1 : 0, r = f === 2 ? 1 : 0, sx = f === 1 ? -1 : f === 2 ? 1 : 0, sw = f ? 1 : 0;
  const idle = !f && !p.talk, ph = t % 9, br = !f && Math.sin(t * 2.2) > 0.5 ? 1 : 0, blink = (t % 3.7) < 0.14;
  const back = idle && ph > 5.2 && ph < 6.6, tap = idle && ph > 1.5 && ph < 3 && Math.floor(t * 6) % 2 ? 1 : 0, u = b - br;
  // satchel on the hip
  R(x - 4, u - 28 + sw, 4, 12, 'teal7'); R(x - 4, u - 28 + sw, 4, 1, 'teal'); R(x - 4, u - 21 + sw, 4, 1, 'teal'); px(x - 3, u - 23 + sw, 'brass');
  // jeans with turn-ups
  const L0 = x + 1 + sx, L1 = x + 7 - sx;
  R(L0, b - 14, 4, 12 - l, 'blu8'); R(L1, b - 14, 4, 12 - r, 'blu8'); R(L0, b - 14, 1, 12 - l, 'n900'); R(L1, b - 14, 1, 12 - r, 'n900');
  R(L0, b - 4 - l, 4, 1, 'blu'); R(L1, b - 4 - r, 4, 1, 'blu'); px(L0 + 2, b - 9, 'blu'); px(L1 + 2, b - 9, 'blu');
  // trainers; the front toe taps
  R(x + sx, b - 2 - l, 5, 2, 'n100'); R(x + sx, b - 1 - l, 5, 1, 'ink'); px(x + 2 + sx, b - 2 - l, 'a600');
  const F = x + 7 - sx;
  R(F, b - 2 - r, 2, 2, 'n100'); R(F, b - 1 - r, 2, 1, 'ink'); R(F + 2, b - 2 - r - tap, 3, 2, 'n100'); R(F + 2, b - 1 - r - tap, 3, 1, 'ink'); px(F + 2, b - 2 - r - tap, 'a600');
  // back arm, hoodie, front arm
  R(x - 2, u - 27 + sw, 2, 10, 'a800'); R(x - 2, u - 17 + sw, 2, 2, 'a300');
  R(x - 1, u - 30, 5, 4, 'a700'); px(x, u - 30, 'a600');
  R(x, u - 28, 12, 14 + br, 'a600'); R(x, u - 28, 3, 14 + br, 'a800'); R(x, b - 15, 12, 1, 'a700');
  R(x + 4, u - 21, 7, 1, 'a800'); R(x + 4, u - 20, 7, 3, 'a700');
  R(x + 6, u - 27, 1, 3, 'n100'); R(x + 9, u - 27, 1, 3, 'n100'); px(x + 6, u - 24, 'n300'); px(x + 9, u - 24, 'n300');
  R(x + 3, u - 28, 1, 7, 'teal7'); px(x + 3, u - 22, 'teal');
  R(x + 12, u - 27 - sw, 2, 10, 'a600'); R(x + 12, u - 27 - sw, 1, 10, 'a700'); R(x + 12, u - 18 - sw, 2, 1, 'a800'); R(x + 12, u - 17 - sw, 2, 2, 'a200');
  // head
  R(x + 3, u - 30, 8, 2, 'ink'); R(x + 2, u - 31, 2, 2, 'n800');
  R(x + 3, u - 38, 8, 8, 'a200'); R(x + 3, u - 38, 2, 8, 'a300'); px(x + 11, u - 34, 'a200'); R(x + 4, u - 35, 2, 2, 'a400');
  if (blink) R(x + 8, u - 35, 2, 1, 'a400'); else { px(x + 8, u - 35, back ? 'ink' : 'n100'); px(x + 9, u - 35, back ? 'n100' : 'ink'); }
  R(x + 8, u - 37, 3, 1, 'n800'); px(x + 10, u - 33, 'a300');
  if (flap(p)) R(x + 8, u - 32, 2, 2, 'a700'); else R(x + 8, u - 32, 2, 1, 'a400');
  R(x + 2, u - 41, 9, 4, 'ink'); R(x + 7, u - 38, 4, 1, 'ink'); R(x + 2, u - 38, 2, 5, 'ink'); px(x + 10, u - 42, 'ink'); px(x + 8, u - 42, 'ink');
  R(x + 4, u - 40, 4, 1, 'n800'); px(x + 6, u - 41, 'n700');
};

// Barnaby, the old boater on the bench at Little Venice, puffing on his pipe.
export const boater: SpriteFn = (g, x, b, p) => {
  const { R, px } = g;
  const t = secs(p), br = Math.sin(t * 1.6) > 0.5 ? 1 : 0, blink = (t % 4.9) < 0.15, u = b - br;
  R(x + 1, b - 2, 5, 2, 'ink'); R(x + 8, b - 2, 5, 2, 'ink');
  R(x + 2, b - 8, 3, 6, 'n900'); R(x + 9, b - 8, 3, 6, 'n900');
  R(x, b - 34, 14, 27, 'n800'); R(x + 11, b - 34, 3, 27, 'n900'); R(x + 6, b - 34, 1, 27, 'n900');
  R(x, b - 20, 14, 2, 'ink'); px(x + 4, b - 30, 'n300'); px(x + 4, b - 25, 'n300'); px(x + 4, b - 15, 'n300');
  R(x - 2, b - 33, 3, 14, 'n700'); R(x - 2, b - 19, 3, 2, 'a200');
  R(x + 1, b - 37, 12, 3, 'a600'); R(x + 1, b - 34, 3, 5, 'a600');
  R(x + 2, u - 44, 10, 7, 'a200'); R(x + 10, u - 44, 2, 7, 'a300'); px(x + 1, u - 41, 'a400');
  px(x + 4, u - 42, blink ? 'a400' : 'ink'); R(x + 3, u - 44, 3, 1, 'n100');
  R(x + 1, u - 39, 11, 4, 'n100'); R(x + 3, u - 35, 7, 1, 'n100'); R(x + 9, u - 39, 3, 4, 'n300');
  if (flap(p)) R(x + 3, u - 38, 4, 1, 'a800');
  R(x, u - 48, 14, 4, 'a700'); R(x + 2, u - 52, 10, 4, 'a700'); R(x + 2, u - 49, 10, 1, 'a800'); R(x + 5, u - 54, 4, 2, 'a700');
  // the pipe glows, and smoke curls up from it
  R(x - 2, u - 38, 4, 1, 'wood9'); R(x - 4, u - 40, 2, 3, 'wood9'); px(x - 4, u - 40, (t % 1.2) < .6 ? 'org' : 'a600');
  for (let k = 0; k < 3; k++) { const q = (t * 0.45 + k / 3) % 1, yy = u - 42 - q * 16, xx = x - 4 + Math.round(Math.sin(t * 1.5 + k * 2) * 1.5 - q * 3); R(xx, yy, q < .35 ? 1 : 2, q < .35 ? 1 : 2, q < .5 ? 'n200' : 'n300'); }
};

// Roz, the Camden busker: grey curls, granny glasses, purple coat, tiered skirt and
// guitar. She's a hand-placed pixel-art sprite sheet (art-src/roz.py); this code-drawn
// version stands in while the images load.
export const busker: SpriteFn = (g, x, b, p) => busker1x(g, x, b, p);
const buskerCode: SpriteFn = (g, x, b, p) => {
  const { R, px, E } = g;
  const t = secs(p), br = Math.sin(t * 2) > .5 ? 1 : 0, blink = (t % 4.1) < .14, strum = Math.floor(t * 7) % 2, nod = Math.sin(t * 3.2) > .7 ? 1 : 0;
  const sing = !p.talk && Math.floor(t * 2.3) % 3 !== 0, u = b - br, h = u + nod;
  R(x + 2, b - 2, 4, 2, 'ink'); R(x + 9, b - 2, 4, 2, 'ink');
  R(x + 1, b - 16, 13, 14, 'teal7'); for (let i = 0; i < 13; i += 3) R(x + 1 + i, b - 16, 1, 14, 'teal');
  R(x, u - 34, 15, 19 + br, 'pur'); R(x + 11, u - 34, 4, 19 + br, 'pur8'); R(x + 6, u - 33, 2, 16 + br, 'pink');
  // guitar across the body
  E(x + 6, u - 20, 5, 4, 'wood'); E(x + 6, u - 20, 2, 2, 'wood9'); R(x + 9, u - 28, 9, 2, 'wood9'); R(x + 17, u - 29, 3, 3, 'ink');
  R(x + 3, u - 23 + strum, 4, 3, 'a200'); R(x + 13, u - 29, 3, 3, 'a200');
  R(x + 4, h - 37, 7, 3, 'a200');
  R(x + 3, h - 45, 9, 8, 'a200'); R(x + 10, h - 45, 2, 8, 'a300');
  px(x + 8, h - 42, blink ? 'a400' : 'ink');
  if (flap(p) || sing) R(x + 7, h - 39, 3, 2, 'a800'); else R(x + 7, h - 39, 3, 1, 'a400');
  // big grey curls, with a flower tucked in
  for (const [dx, dy] of [[1, 48], [4, 50], [8, 50], [11, 48], [0, 44], [12, 44], [1, 40], [13, 40], [6, 51]] as [number, number][]) R(x + dx, h - dy, 4, 4, dx % 2 ? 'n400' : 'n300');
  px(x + 2, h - 46, 'n100'); px(x + 9, h - 49, 'n100');
  px(x + 3, h - 50, 'yel'); px(x + 2, h - 50, 'pink'); px(x + 4, h - 50, 'pink'); px(x + 3, h - 51, 'pink'); px(x + 3, h - 49, 'pink');
  R(x + 12, u - 38, 3, 2, 'org');
  if (!p.talk) for (let k = 0; k < 2; k++) {
    const q = (t * .45 + k / 2) % 1; if (q > .8) continue;
    const nx = x + 17 + Math.round(q * 8), ny = u - 40 - Math.round(q * 14);
    R(nx, ny, 1, 4, 'ink'); R(nx - 1, ny + 3, 2, 2, 'ink'); px(nx + 1, ny, 'ink');
  }
};

// Old Tam, the legger at Islington Tunnel: woolly hat, beard, waistcoat, huge boots.
export const legger: SpriteFn = (g, x, b, p) => {
  const { R, px } = g;
  const t = secs(p), br = Math.sin(t * 1.5) > .5 ? 1 : 0, blink = (t % 5.1) < .15, u = b - br;
  R(x - 1, b - 3, 7, 3, 'ink'); R(x + 8, b - 3, 7, 3, 'ink'); R(x, b - 5, 5, 2, 'n800'); R(x + 9, b - 5, 5, 2, 'n800');
  R(x + 1, b - 15, 4, 10, 'wood7'); R(x + 9, b - 15, 4, 10, 'wood7');
  R(x, u - 34, 14, 20 + br, 'n300'); R(x, u - 34, 4, 20 + br, 'wood9'); R(x + 10, u - 34, 4, 20 + br, 'wood9'); R(x, b - 16, 14, 2, 'ink');
  R(x - 2, u - 32, 3, 13, 'n300'); R(x - 2, u - 19, 3, 2, 'a200'); R(x + 13, u - 32, 3, 13, 'n300'); R(x + 13, u - 19, 3, 2, 'a200');
  R(x + 2, u - 44, 10, 8, 'a200'); R(x + 10, u - 44, 2, 8, 'a300');
  px(x + 8, u - 42, blink ? 'a400' : 'ink');
  // grey beard
  R(x + 2, u - 39, 11, 5, 'n200'); R(x + 4, u - 34, 7, 3, 'n200'); R(x + 3, u - 39, 2, 2, 'n400');
  if (flap(p)) R(x + 7, u - 38, 4, 1, 'a800');
  R(x + 1, u - 49, 12, 5, 'a600'); R(x + 1, u - 47, 12, 1, 'yel'); R(x + 5, u - 51, 4, 2, 'a700');
};

// Jasper, the Hackney Wick hipster, on a bench by his boat: quiff, beard, flowery
// shirt, rolled jeans. He vapes, sips his flat white and nods along to something.
export const hipster: SpriteFn = (g, x, b, p) => {
  const { R, px, E } = g;
  const t = secs(p), T = t % 11, br = Math.sin(t * 1.7) > .5 ? 1 : 0, u = b - br, busy = p.phone || p.talk;
  const vapeUp = !busy && T > 2 && T < 3.4, puff = !busy && T > 3.4 && T < 6.2 ? (T - 3.4) / 2.8 : -1, sip = !busy && T > 7 && T < 8.8;
  const nod = !busy && !sip && !vapeUp && Math.floor(t * 2.4) % 2 ? 1 : 0, h = u + nod;
  // bench and little table
  R(x - 3, b - 28, 2, 26, 'ink'); R(x - 3, b - 14, 13, 2, 'ink'); R(x - 2, b - 12, 1, 12, 'ink'); R(x + 8, b - 12, 1, 12, 'ink');
  R(x + 18, b - 18, 20, 2, 'wood9'); R(x + 18, b - 16, 20, 1, 'wood7'); R(x + 27, b - 16, 2, 15, 'ink'); R(x + 23, b - 1, 10, 1, 'ink');
  // legs crossed, jeans rolled
  R(x + 1, b - 18, 12, 4, 'blu8'); R(x + 1, b - 18, 12, 1, 'blu'); R(x + 10, b - 14, 4, 10, 'blu8'); R(x + 10, b - 5, 4, 1, 'blu'); R(x + 10, b - 4, 4, 2, 'a200'); R(x + 10, b - 2, 6, 2, 'wood9'); px(x + 15, b - 2, 'wood7');
  // back arm: the vape, raised or resting
  if (vapeUp) { R(x + 5, u - 30, 3, 6, 'teal7'); R(x + 7, h - 34, 2, 5, 'teal7'); R(x + 9, h - 35, 2, 2, 'a200'); R(x + 11, h - 35, 3, 1, 'n400'); px(x + 13, h - 35, 'teal'); }
  else { R(x + 3, u - 26, 3, 7, 'teal7'); R(x + 5, b - 21, 4, 2, 'teal7'); R(x + 9, b - 21, 2, 2, 'a200'); if (!busy) { R(x + 11, b - 21, 3, 1, 'n400'); px(x + 13, b - 21, 'teal'); } }
  // flowery shirt
  R(x + 1, u - 31, 10, 14, 'teal'); R(x + 1, u - 31, 2, 14, 'teal7');
  ([[3, -28], [7, -25], [2, -22], [8, -21], [5, -19], [9, -29]] as [number, number][]).forEach(([dx, dy]) => { px(x + dx, u + dy, 'pink'); px(x + dx + 1, u + dy, 'yel'); px(x + dx - 1, u + dy + 1, 'grn8'); });
  R(x + 6, u - 31, 3, 2, 'a200'); px(x + 7, u - 29, 'a200'); px(x + 5, u - 31, 'bg'); px(x + 9, u - 31, 'bg');
  // head: quiff and beard
  R(x + 5, h - 33, 3, 2, 'a200');
  R(x + 3, h - 41, 8, 8, 'a200'); R(x + 3, h - 41, 2, 8, 'a300'); px(x + 4, h - 37, 'a400');
  R(x + 3, h - 43, 8, 2, 'wood9'); R(x + 3, h - 46, 4, 3, 'wood9'); px(x + 4, h - 46, 'wood7'); R(x + 3, h - 41, 2, 3, 'wood9');
  R(x + 5, h - 36, 6, 3, 'wood7'); R(x + 6, h - 34, 5, 2, 'wood7'); R(x + 8, h - 36, 3, 1, 'wood9');
  if (flap(p)) R(x + 9, h - 35, 2, 1, 'a800'); else if (puff >= 0 && puff < .3) px(x + 10, h - 35, 'n200'); else px(x + 10, h - 35, 'a700');
  R(x + 7, h - 39, 5, 2, 'ink'); R(x + 4, h - 39, 3, 1, 'ink'); px(x + 8, h - 39, 'n500'); px(x + 11, h - 39, 'pur');
  // front arm: phone to the ear, coffee to the lips, or resting on the table
  if (p.phone) { R(x + 6, u - 29, 3, 6, 'teal'); R(x + 8, h - 33, 3, 6, 'teal'); R(x + 9, h - 38, 2, 5, 'a200'); R(x + 10, h - 41, 2, 7, 'ink'); }
  else if (sip) { R(x + 6, u - 29, 3, 6, 'teal'); R(x + 8, h - 33, 3, 9, 'teal'); R(x + 12, h - 40, 4, 7, 'n900'); R(x + 12, h - 40, 1, 3, 'stock'); px(x + 14, h - 37, 'a800'); R(x + 11, h - 36, 2, 3, 'a200'); }
  else { R(x + 6, u - 29, 3, 8, 'teal'); R(x + 8, u - 22, 12, 3, 'teal'); R(x + 19, u - 22, 2, 3, 'a200'); }
  if (!sip) { R(x + 21, b - 25, 4, 7, 'n900'); R(x + 21, b - 25, 4, 2, 'stock'); px(x + 22, b - 22, 'a800'); }
  if (!busy && T > 8.8 && T < 9.8) R(x + 8, h - 36, 3, 1, 'stock');
  if (puff >= 0 && puff < .85) { const r = 1 + puff * 5, cx = x + 14 + puff * 10, cy = h - 37 - puff * 9; E(cx, cy, r, r * .7, 'n200'); E(cx - r * .3, cy - r * .2, r * .7, r * .5, 'n100'); if (puff > .4) E(cx + r, cy - r, r * .5, r * .4, 'n200'); }
};

// Keith of Stonebridge: about 80, khaki work coat, safety specs, dyed brown hair, bad
// teeth. He taps a spanner against his leg while he thinks.
export const keith: SpriteFn = (g, x, b, p) => {
  const { R, px } = g;
  const t = secs(p), br = Math.sin(t * 1.9) > 0.55 ? 1 : 0, blink = (t % 4.3) < 0.14, ph = t % 8, tap = !p.talk && ph > 3 && ph < 4.6 ? (Math.floor(t * 5) % 2) * 2 : 0, u = b - br;
  R(x + 2, b - 10, 3, 8, 'n800'); R(x + 9, b - 10, 3, 8, 'n800'); px(x + 4, b - 9, 'n900');
  R(x + 1, b - 3, 5, 3, 'wood9'); R(x + 8, b - 3, 6, 3, 'wood9'); R(x + 1, b - 1, 5, 1, 'ink'); R(x + 8, b - 1, 6, 1, 'ink'); px(x + 3, b - 3, 'wood7'); px(x + 11, b - 3, 'wood7'); px(x + 13, b - 2, 'wood7');
  R(x - 2, u - 39, 3, 16, 'kha7'); R(x - 2, u - 23, 3, 2, 'a300');
  R(x, u - 40, 14, 30 + br, 'kha'); R(x - 1, b - 18, 16, 8, 'kha'); R(x, u - 40, 3, 30 + br, 'kha7'); R(x - 1, b - 18, 4, 8, 'kha7');
  R(x + 9, u - 38, 1, 28 + br, 'kha7'); R(x - 1, b - 11, 16, 1, 'kha7');
  R(x, u - 27, 14, 1, 'kha7'); px(x + 9, u - 27, 'brass7');
  [35, 31, 23, 19].forEach(d => px(x + 10, u - d, 'brass7'));
  // pocket with an oily rag
  R(x + 3, u - 24, 5, 6, 'kha7'); R(x + 4, u - 22, 3, 3, 'kha'); R(x + 3, u - 24, 5, 2, 'kha3');
  R(x + 4, u - 27, 2, 3, 'a600'); px(x + 5, u - 28, 'a500'); px(x + 4, u - 25, 'a700');
  R(x + 11, u - 37, 2, 3, 'kha7'); R(x + 1, u - 40, 5, 1, 'kha3'); px(x + 5, u - 40, 'brass7');
  R(x + 3, u - 43, 9, 3, 'kha3'); R(x + 3, u - 43, 2, 3, 'kha7');
  // spanner
  R(x + 13, u - 21 - tap, 1, 8, 'n300'); R(x + 12, u - 14 - tap, 3, 2, 'n300'); px(x + 13, u - 13 - tap, 'n600');
  R(x + 12, u - 39, 3, 15, 'kha'); R(x + 12, u - 39, 1, 15, 'kha7'); R(x + 12, u - 25, 3, 1, 'kha7'); R(x + 12, u - 24 - tap, 3, 3, 'a200');
  // head
  R(x + 4, u - 51, 8, 8, 'a200'); R(x + 4, u - 51, 2, 8, 'a300'); R(x + 12, u - 47, 1, 2, 'a200');
  if (flap(p)) { R(x + 8, u - 44, 4, 2, 'ink'); px(x + 9, u - 44, 'yel'); px(x + 11, u - 44, 'yel7'); } else R(x + 9, u - 44, 2, 1, 'a400');
  // suspiciously brown hair
  R(x + 4, u - 54, 8, 3, 'dye'); R(x + 5, u - 55, 6, 1, 'dye'); R(x + 3, u - 53, 3, 7, 'dye'); R(x + 10, u - 52, 2, 1, 'dye');
  R(x + 6, u - 54, 4, 1, 'dye3'); px(x + 8, u - 55, 'n300');
  R(x + 6, u - 51, 2, 3, 'n200'); px(x + 6, u - 52, 'n300'); px(x + 3, u - 47, 'n200'); px(x + 4, u - 46, 'n300');
  R(x + 5, u - 47, 2, 2, 'a300');
  // safety specs
  R(x + 5, u - 48, 3, 1, 'brass7'); R(x + 8, u - 49, 5, 1, 'brass7'); R(x + 8, u - 48, 4, 3, 'yel'); R(x + 9, u - 45, 2, 1, 'yel');
  px(x + 8, u - 48, 'bg'); if (blink) R(x + 9, u - 47, 2, 1, 'yel7'); else px(x + 10, u - 47, 'ink');
};

// The fierce swan guarding its nest at Cheshunt. It bobs, and hisses when it talks.
export const swan: SpriteFn = (g, x, b, p) => {
  const { R, px, E } = g;
  const t = secs(p), hiss = p.talk && Math.floor(t * 5) % 2, n = Math.sin(t * 1.3) > .4 ? 1 : 0;
  R(x + 6, b - 3, 2, 3, 'org'); R(x + 11, b - 3, 2, 3, 'org'); R(x + 5, b - 1, 4, 1, 'org'); R(x + 10, b - 1, 4, 1, 'org');
  E(x + 9, b - 9, 9, 6, 'n100'); R(x + 1, b - 14, 6, 5, 'n200');
  if (hiss) { E(x + 4, b - 18, 6, 4, 'n200'); E(x + 15, b - 18, 6, 4, 'n200'); }
  R(x + 15, b - 26 + n, 3, 15 - n, 'n100'); R(x + 16, b - 28 + n, 5, 3, 'n100'); R(x + 21, b - 27 + n, 3, 2, 'org'); px(x + 24, b - 26 + n, 'ink');
  px(x + 18, b - 28 + n, 'ink'); R(x + 20, b - 28 + n, 1, 3, 'ink');
  if (hiss) R(x + 22, b - 25 + n, 2, 1, 'a700');
};

const busker1x = sheetSprite({
  w: 72, h: 120, cx: 24,
  anims: { play: { src: rozPlay, frames: 24, fps: 8 }, talk: { src: rozTalk, frames: 8, fps: 8 } },
  pick: p => p.talk ? 'talk' : 'play',
  fallback: buskerCode,
});

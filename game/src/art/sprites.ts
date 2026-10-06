// Character sprites. Coordinates are in sprite units; the kit draws them at 2×.
// `x` is the sprite's left edge, `b` its baseline (feet).
import type { Kit } from './kit';

export interface Pose { walk?: number; talk?: boolean; t?: number; phone?: boolean }

export type SpriteFn = (g: Kit, x: number, b: number, p: Pose) => void;

// The teenage hero. Walk frames lift alternate legs.
export const teen: SpriteFn = (g, x, b, p) => {
  const { R, px } = g;
  const f = p.walk ?? 0, l = f === 1 ? 1 : 0, r = f === 2 ? 1 : 0, sx = f === 1 ? -1 : f === 2 ? 1 : 0;
  R(x + sx, b - 2 - l, 5, 2, 'n100'); R(x + sx, b - 1 - l, 5, 1, 'ink');
  R(x + 7 - sx, b - 2 - r, 5, 2, 'n100'); R(x + 7 - sx, b - 1 - r, 5, 1, 'ink');
  R(x + 1 + sx, b - 14, 4, 12 - l, 'n700'); R(x + 7 - sx, b - 14, 4, 12 - r, 'n700');
  R(x + 1 + sx, b - 14, 1, 12 - l, 'n800'); R(x + 7 - sx, b - 14, 1, 12 - r, 'n800');
  R(x - 1, b - 30, 5, 4, 'a700');
  R(x, b - 28, 12, 14, 'a600'); R(x, b - 28, 3, 14, 'a800'); R(x + 4, b - 20, 7, 3, 'a700'); px(x + 6, b - 26, 'n100'); px(x + 9, b - 26, 'n100');
  const sw = f ? 1 : 0;
  R(x - 2, b - 27 + sw, 2, 10, 'a800'); R(x + 12, b - 27 - sw + 1, 2, 10, 'a600'); R(x - 2, b - 17 + sw, 2, 2, 'a300'); R(x + 12, b - 16 - sw, 2, 2, 'a200');
  R(x + 3, b - 30, 8, 2, 'ink'); R(x + 2, b - 31, 2, 2, 'n800');
  R(x + 3, b - 38, 8, 8, 'a200'); R(x + 3, b - 38, 2, 8, 'a300'); px(x + 11, b - 34, 'a200');
  px(x + 8, b - 35, 'ink'); R(x + 8, b - 32, 2, p.talk ? 2 : 1, p.talk ? 'a700' : 'a400');
  R(x + 2, b - 41, 9, 4, 'ink'); R(x + 7, b - 38, 4, 1, 'ink'); R(x + 2, b - 38, 2, 5, 'ink'); px(x + 10, b - 42, 'ink');
};

// Barnaby, the old boater on the bench at Little Venice (from the design).
export const boater: SpriteFn = (g, x, b, p) => {
  const { R, px } = g;
  R(x + 1, b - 2, 5, 2, 'ink'); R(x + 8, b - 2, 5, 2, 'ink');
  R(x + 2, b - 8, 3, 6, 'n900'); R(x + 9, b - 8, 3, 6, 'n900');
  R(x, b - 34, 14, 27, 'n800'); R(x + 11, b - 34, 3, 27, 'n900'); R(x + 6, b - 34, 1, 27, 'n900');
  R(x, b - 20, 14, 2, 'ink'); px(x + 4, b - 30, 'n300'); px(x + 4, b - 25, 'n300'); px(x + 4, b - 15, 'n300');
  R(x - 2, b - 33, 3, 14, 'n700'); R(x - 2, b - 19, 3, 2, 'a200');
  R(x + 1, b - 37, 12, 3, 'a600'); R(x + 1, b - 34, 3, 5, 'a600');
  R(x + 2, b - 44, 10, 7, 'a200'); R(x + 10, b - 44, 2, 7, 'a300'); px(x + 1, b - 41, 'a400');
  px(x + 4, b - 42, 'ink'); R(x + 3, b - 44, 3, 1, 'n100');
  R(x + 1, b - 39, 11, 4, 'n100'); R(x + 3, b - 35, 7, 1, 'n100'); R(x + 9, b - 39, 3, 4, 'n300');
  if (p.talk) R(x + 3, b - 38, 4, 1, 'a800');
  R(x, b - 48, 14, 4, 'a700'); R(x + 2, b - 52, 10, 4, 'a700'); R(x + 2, b - 49, 10, 1, 'a800'); R(x + 5, b - 54, 4, 2, 'a700');
};

// Roz, the Camden busker: grey curls, purple coat, long skirt, guitar.
export const busker: SpriteFn = (g, x, b, p) => {
  const { R, px, E } = g;
  R(x + 2, b - 2, 4, 2, 'ink'); R(x + 9, b - 2, 4, 2, 'ink');
  R(x + 1, b - 16, 13, 14, 'teal7'); for (let i = 0; i < 13; i += 3) R(x + 1 + i, b - 16, 1, 14, 'teal');
  R(x, b - 34, 15, 19, 'pur'); R(x + 11, b - 34, 4, 19, 'pur8'); R(x + 6, b - 33, 2, 16, 'pink');
  // guitar across the body
  E(x + 6, b - 20, 5, 4, 'wood'); E(x + 6, b - 20, 2, 2, 'wood9'); R(x + 9, b - 28, 9, 2, 'wood9'); R(x + 17, b - 29, 3, 3, 'ink');
  const strum = p.talk && ((p.t ?? 0) / 160 | 0) % 2 ? 1 : 0;
  R(x + 3, b - 23 + strum, 4, 3, 'a200'); R(x + 13, b - 29, 3, 3, 'a200');
  R(x + 4, b - 37, 7, 3, 'a200');
  R(x + 3, b - 45, 9, 8, 'a200'); R(x + 10, b - 45, 2, 8, 'a300');
  px(x + 8, b - 42, 'ink'); R(x + 7, b - 39, 3, p.talk ? 2 : 1, p.talk ? 'a800' : 'a400');
  // big grey curls
  for (const [dx, dy] of [[1, 48], [4, 50], [8, 50], [11, 48], [0, 44], [12, 44], [1, 40], [13, 40], [6, 51]] as [number, number][]) R(x + dx, b - dy, 4, 4, dx % 2 ? 'n400' : 'n300');
  px(x + 2, b - 46, 'n100'); px(x + 9, b - 49, 'n100');
  R(x + 12, b - 38, 3, 2, 'org');
};

// Old Tam, the legger at Islington Tunnel: woolly hat, beard, waistcoat, huge boots.
export const legger: SpriteFn = (g, x, b, p) => {
  const { R, px } = g;
  R(x - 1, b - 3, 7, 3, 'ink'); R(x + 8, b - 3, 7, 3, 'ink'); R(x, b - 5, 5, 2, 'n800'); R(x + 9, b - 5, 5, 2, 'n800');
  R(x + 1, b - 15, 4, 10, 'wood7'); R(x + 9, b - 15, 4, 10, 'wood7');
  R(x, b - 34, 14, 20, 'n300'); R(x, b - 34, 4, 20, 'wood9'); R(x + 10, b - 34, 4, 20, 'wood9'); R(x, b - 16, 14, 2, 'ink');
  R(x - 2, b - 32, 3, 13, 'n300'); R(x - 2, b - 19, 3, 2, 'a200'); R(x + 13, b - 32, 3, 13, 'n300'); R(x + 13, b - 19, 3, 2, 'a200');
  R(x + 2, b - 44, 10, 8, 'a200'); R(x + 10, b - 44, 2, 8, 'a300');
  px(x + 8, b - 42, 'ink');
  // grey beard
  R(x + 2, b - 39, 11, 5, 'n200'); R(x + 4, b - 34, 7, 3, 'n200'); R(x + 3, b - 39, 2, 2, 'n400');
  if (p.talk) R(x + 7, b - 38, 4, 1, 'a800');
  R(x + 1, b - 49, 12, 5, 'a600'); R(x + 1, b - 47, 12, 1, 'yel'); R(x + 5, b - 51, 4, 2, 'a700');
};

// Jasper, the Hackney Wick hipster: beanie, beard, checked shirt, apron, phone.
export const hipster: SpriteFn = (g, x, b, p) => {
  const { R, px } = g;
  R(x + 1, b - 2, 5, 2, 'n100'); R(x + 8, b - 2, 5, 2, 'n100');
  R(x + 2, b - 16, 3, 14, 'blu8'); R(x + 9, b - 16, 3, 14, 'blu8'); R(x + 2, b - 5, 3, 2, 'n100'); R(x + 9, b - 5, 3, 2, 'n100');
  R(x, b - 34, 14, 19, 'teal7'); for (let j = 0; j < 19; j += 3) R(x, b - 34 + j, 14, 1, 'ink'); for (let i = 1; i < 14; i += 4) R(x + i, b - 34, 1, 19, 'teal');
  R(x + 3, b - 30, 9, 16, 'n800'); R(x + 5, b - 33, 1, 3, 'n800'); R(x + 9, b - 33, 1, 3, 'n800');
  R(x - 2, b - 32, 3, 12, 'teal7'); R(x - 2, b - 20, 3, 2, 'a200');
  if (p.phone) { R(x + 13, b - 32, 3, 8, 'teal7'); R(x + 13, b - 38, 3, 6, 'a200'); R(x + 12, b - 42, 2, 5, 'ink'); }
  else { R(x + 13, b - 32, 3, 12, 'teal7'); R(x + 13, b - 20, 3, 2, 'a200'); }
  R(x + 3, b - 44, 9, 9, 'a200'); R(x + 10, b - 44, 2, 9, 'a300');
  px(x + 8, b - 42, 'ink'); R(x + 6, b - 43, 4, 1, 'ink');
  R(x + 3, b - 39, 10, 5, 'wood7'); R(x + 5, b - 35, 6, 2, 'wood7'); R(x + 7, b - 38, 4, 1, p.talk ? 'a800' : 'wood9');
  R(x + 2, b - 50, 11, 7, 'org'); R(x + 2, b - 45, 11, 2, 'a700'); R(x + 6, b - 52, 4, 2, 'org');
};

// Keith of Stonebridge: about 80, blue overalls, dyed brown hair, bad teeth, oily rag.
export const keith: SpriteFn = (g, x, b, p) => {
  const { R, px } = g;
  R(x + 1, b - 2, 5, 2, 'ink'); R(x + 8, b - 2, 5, 2, 'ink');
  R(x + 1, b - 22, 5, 20, 'blu8'); R(x + 8, b - 22, 5, 20, 'blu8'); R(x + 6, b - 22, 2, 8, 'blu8');
  R(x, b - 34, 14, 14, 'blu8'); R(x + 3, b - 34, 8, 6, 'blu'); px(x + 4, b - 33, 'brass'); px(x + 9, b - 33, 'brass');
  R(x + 2, b - 12, 4, 3, 'ink'); R(x + 9, b - 26, 3, 2, 'ink');
  R(x - 2, b - 33, 3, 12, 'blu8'); R(x - 2, b - 21, 3, 2, 'a200'); R(x - 3, b - 19, 4, 5, 'a600');
  R(x + 13, b - 33, 3, 12, 'blu8'); R(x + 13, b - 21, 3, 2, 'a200');
  R(x + 2, b - 44, 10, 9, 'a200'); R(x + 10, b - 44, 2, 9, 'a300'); R(x + 2, b - 38, 2, 3, 'a300');
  px(x + 8, b - 42, 'ink'); R(x + 7, b - 44, 3, 1, 'n500');
  if (p.talk) { R(x + 6, b - 38, 5, 2, 'ink'); px(x + 7, b - 38, 'yel'); px(x + 9, b - 38, 'yel7'); }
  else { R(x + 6, b - 38, 5, 1, 'a700'); px(x + 8, b - 38, 'yel'); }
  // suspiciously brown hair
  R(x + 1, b - 48, 12, 5, 'wood7'); R(x + 1, b - 44, 2, 4, 'wood7'); R(x + 3, b - 49, 8, 1, 'wood'); px(x + 2, b - 44, 'n300');
};

// The fierce swan guarding its nest at Cheshunt.
export const swan: SpriteFn = (g, x, b, p) => {
  const { R, px, E } = g;
  const hiss = p.talk && ((p.t ?? 0) / 200 | 0) % 2;
  R(x + 6, b - 3, 2, 3, 'org'); R(x + 11, b - 3, 2, 3, 'org'); R(x + 5, b - 1, 4, 1, 'org'); R(x + 10, b - 1, 4, 1, 'org');
  E(x + 9, b - 9, 9, 6, 'n100'); R(x + 1, b - 14, 6, 5, 'n200');
  if (hiss) { E(x + 4, b - 18, 6, 4, 'n200'); E(x + 15, b - 18, 6, 4, 'n200'); }
  R(x + 15, b - 26, 3, 15, 'n100'); R(x + 16, b - 28, 5, 3, 'n100'); R(x + 21, b - 27, 3, 2, 'org'); px(x + 24, b - 26, 'ink');
  px(x + 18, b - 28, 'ink'); R(x + 20, b - 28, 1, 3, 'ink');
  if (hiss) R(x + 22, b - 25, 2, 1, 'a700');
};

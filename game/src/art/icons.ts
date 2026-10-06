// Inventory icons, drawn in a 36×26 box like the design's windlass/notebook icons.
import type { Kit } from './kit';

type Icon = (g: Kit) => void;

export const icons: Record<string, Icon> = {
  windlass(g) { const { R } = g; R(6, 4, 4, 16, 'ink'); R(7, 5, 2, 14, 'n500'); R(6, 18, 24, 4, 'ink'); R(7, 19, 22, 2, 'n500'); R(26, 12, 6, 10, 'ink'); R(27, 13, 4, 4, 'surf'); R(4, 2, 8, 4, 'n800'); R(5, 3, 6, 1, 'n400'); R(27, 11, 4, 1, 'n400'); },
  notebook(g) { const { R, px } = g; R(8, 2, 22, 22, 'ink'); R(9, 3, 20, 20, 'n100'); for (let i = 12; i < 29; i += 4) R(i, 3, 1, 20, 'n300'); for (let j = 6; j < 23; j += 4) R(9, j, 20, 1, 'n300'); for (let j = 4; j < 23; j += 3) R(6, j, 4, 1, 'n600'); for (let k = 0; k < 10; k++) px(12 + k * 1.5, 19 - k * 1.3, 'a600'); },
  key(g) { const { R, C, T } = g; R(14, 3, 20, 16, 'n100'); R(14, 3, 20, 1, 'n300'); T('DOT', 18, 7, 'a700'); R(16, 14, 14, 1, 'n400'); C(8, 16, 5, 'brass'); C(8, 16, 2, 'surf'); R(12, 15, 12, 3, 'brass'); R(20, 18, 2, 3, 'brass'); R(24, 18, 2, 4, 'brass'); },
  crusts(g) { const { R } = g; for (let i = 0; i < 3; i++) { R(6 + i * 9, 8 + (i % 2) * 4, 8, 12, 'wood'); R(7 + i * 9, 9 + (i % 2) * 4, 6, 10, 'stock'); } },
  toast(g) { const { R } = g; for (let i = 0; i < 3; i++) { R(6 + i * 9, 8 + (i % 2) * 4, 8, 12, 'wood9'); R(7 + i * 9, 9 + (i % 2) * 4, 6, 10, 'wood'); } },
  seededtoast(g) { const { R, px } = g; for (let i = 0; i < 3; i++) { R(6 + i * 9, 8 + (i % 2) * 4, 8, 12, 'wood9'); R(7 + i * 9, 9 + (i % 2) * 4, 6, 10, 'wood'); for (let k = 0; k < 4; k++) px(8 + i * 9 + (k % 2) * 3, 11 + (i % 2) * 4 + k * 2, 'stock'); } },
  seeds(g) { const { R, px } = g; R(10, 6, 16, 18, 'stock7'); R(12, 4, 12, 3, 'stock'); R(13, 12, 10, 6, 'bg'); for (let k = 0; k < 8; k++) px(14 + (k % 4) * 2, 13 + (k >> 2) * 2, 'wood7'); },
  paperbag(g) { const { R } = g; R(10, 5, 16, 19, 'stock7'); R(10, 5, 16, 3, 'stock'); R(12, 8, 1, 14, 'wood'); R(23, 8, 1, 14, 'wood'); },
  chalklabel(g) { const { R, T } = g; R(6, 7, 26, 13, 'wood7'); R(7, 8, 24, 11, 'ink'); T('POSH', 11, 11, 'n100'); R(4, 12, 3, 2, 'n500'); },
  labelledbag(g) { const { R, T } = g; R(10, 5, 16, 19, 'stock7'); R(10, 5, 16, 3, 'stock'); R(11, 11, 14, 8, 'ink'); T('POSH', 11, 13, 'n100'); },
  sourdough(g) { const { R, T, E } = g; R(4, 5, 16, 19, 'stock7'); R(5, 11, 14, 7, 'ink'); T('POSH', 5, 13, 'n100'); E(26, 15, 9, 7, 'wood7'); E(26, 14, 7, 5, 'wood'); R(21, 11, 2, 6, 'stock'); R(26, 10, 2, 6, 'stock'); R(30, 12, 2, 5, 'stock'); },
  powerpack(g) { const { R, T } = g; R(8, 5, 22, 18, 'ink'); R(9, 6, 20, 16, 'yel7'); R(11, 8, 16, 7, 'ink'); T('400W', 12, 9, 'yel'); R(13, 17, 3, 3, 'ink'); R(22, 17, 3, 3, 'ink'); R(30, 12, 4, 2, 'n500'); },
  metronome(g) { const { R, L } = g; for (let j = 0; j < 20; j++) { const w = 4 + j * 0.5; R(18 - w, 3 + j, w * 2, 1, j > 15 ? 'wood9' : 'wood'); } R(16, 6, 4, 10, 'stock'); L(18, 18, 24, 4, 'n800'); R(23, 6, 3, 2, 'brass'); },
  label(g) { const { R, T } = g; R(3, 7, 30, 13, 'n100'); R(3, 7, 30, 1, 'n300'); T('NOT TO', 6, 9, 'a700'); T('SCALE', 8, 14, 'a700'); R(30, 7, 3, 3, 'n400'); },
  stout(g) { const { R } = g; R(13, 3, 8, 5, 'ink'); R(11, 7, 12, 4, 'wood9'); R(9, 10, 16, 14, 'wood9'); R(10, 11, 14, 12, 'ink'); R(12, 14, 10, 6, 'stock'); R(13, 16, 8, 2, 'wood7'); },
  schooner(g) { const { R } = g; R(11, 3, 14, 2, 'sky3'); R(12, 5, 12, 15, 'sky3'); R(13, 5, 10, 15, 'bg'); for (let k = 0; k < 4; k++) R(13, 7 + k * 3, 3, 1, 'n500'); R(16, 20, 4, 3, 'sky3'); R(12, 22, 12, 2, 'sky3'); },
  tin(g) { const { R, T } = g; R(9, 5, 18, 19, 'n500'); R(9, 4, 18, 2, 'n400'); R(10, 9, 16, 9, 'stock'); T('2L', 14, 11, 'ink'); R(12, 2, 12, 1, 'n700'); R(11, 3, 1, 2, 'n700'); R(24, 3, 1, 2, 'n700'); },
  chart(g) { const { R } = g; R(5, 4, 26, 18, 'n100'); const cs = ['a600', 'yel', 'blu', 'pur', 'org', 'grn8', 'teal7', 'pink']; cs.forEach((c, i) => R(7 + (i % 4) * 6, 6 + (i >> 2) * 7, 5, 5, c)); R(6, 19, 24, 2, 'n300'); },
  jar(g) { const { R } = g; R(12, 3, 12, 4, 'a600'); R(11, 7, 14, 17, 'sky3'); R(12, 8, 12, 15, 'bg'); R(14, 10, 2, 9, 'n100'); },
  algae(g) { const { R, px } = g; R(12, 3, 12, 4, 'a600'); R(11, 7, 14, 17, 'sky3'); R(12, 10, 12, 13, 'alg8'); R(12, 10, 12, 2, 'lime'); for (let k = 0; k < 6; k++) px(13 + k * 2, 14 + (k % 3) * 3, 'alg'); },
  mushrooms(g) { const { R, E } = g; for (const [x, h] of [[9, 8], [17, 12], [25, 7]] as [number, number][]) { R(x, 24 - h, 2, h, 'n300'); E(x + 1, 24 - h, 5, 3, 'glow7'); E(x + 1, 23 - h, 3, 1, 'glow'); } },
  eggshell(g) { const { E, R } = g; E(12, 15, 7, 6, 'n100'); R(5, 11, 14, 4, 'surf'); E(25, 16, 6, 5, 'n200'); R(19, 11, 12, 5, 'surf'); E(25, 17, 4, 3, 'n100'); },
  paint(g) { const { R, T } = g; R(9, 5, 18, 19, 'n500'); R(9, 4, 18, 2, 'grn8'); R(10, 9, 16, 9, 'grn8'); T('GG', 14, 11, 'brass'); R(12, 2, 12, 1, 'n700'); },
  bucket(g) { const { R } = g; R(10, 8, 16, 15, 'n500'); R(9, 6, 18, 3, 'n600'); R(12, 3, 12, 1, 'n700'); },
};

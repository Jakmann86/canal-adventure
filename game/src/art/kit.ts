// Pixel-art drawing kit, ported from the Claude Design prototype (pixel-art.js).
// Every scene is drawn in a 640×288 logical space with these primitives.

export const PALETTE: Record<string, string> = {
  // Modernist design-system tokens
  ink: '#201e1d', bg: '#f3f2f2',
  n100: '#f8f4f4', n200: '#eae7e7', n300: '#d7d3d3', n400: '#bab6b6', n500: '#9b9797',
  n600: '#7d7979', n700: '#605d5d', n800: '#444141', n900: '#2d2b2b',
  a100: '#fff2ef', a200: '#ffe0d9', a300: '#ffc4b8', a400: '#ff9783', a500: '#ff563c',
  a600: '#dd2b0f', a700: '#ae1800', a800: '#7c1405', a900: '#4d170e',
  // Scene colours mixed in OKLCH to sit beside the red ramp
  surf: 'oklch(0.3 0.03 260)',
  yel: 'oklch(0.87 0.16 95)', yel7: 'oklch(0.7 0.15 80)', stock: 'oklch(0.8 0.06 80)', stock7: 'oklch(0.68 0.06 70)',
  teal: 'oklch(0.74 0.12 190)', teal7: 'oklch(0.52 0.09 200)', blu: 'oklch(0.62 0.16 255)', blu8: 'oklch(0.42 0.13 260)',
  pur: 'oklch(0.56 0.18 305)', pur8: 'oklch(0.38 0.14 305)', pink: 'oklch(0.74 0.16 350)', grn: 'oklch(0.7 0.17 145)', grn8: 'oklch(0.45 0.11 150)',
  org: 'oklch(0.74 0.16 55)', sky1: 'oklch(0.74 0.1 240)', sky2: 'oklch(0.81 0.08 235)', sky3: 'oklch(0.89 0.05 225)',
  wat: 'oklch(0.56 0.07 185)', wat8: 'oklch(0.44 0.06 190)', wat3: 'oklch(0.7 0.06 185)',
  wood: 'oklch(0.6 0.09 60)', wood3: 'oklch(0.7 0.08 70)', wood7: 'oklch(0.47 0.08 55)', wood9: 'oklch(0.35 0.06 50)',
  brass: 'oklch(0.78 0.13 85)', brass7: 'oklch(0.6 0.11 75)',
  kha: 'oklch(0.52 0.06 115)', kha7: 'oklch(0.4 0.05 115)', kha3: 'oklch(0.62 0.07 110)', dye: 'oklch(0.36 0.07 40)', dye3: 'oklch(0.5 0.1 45)',
  // Added for the game: glow, algae and lime
  glow: 'oklch(0.88 0.17 165)', glow7: 'oklch(0.66 0.14 170)', alg: 'oklch(0.62 0.13 135)', alg8: 'oklch(0.48 0.1 140)',
  lime: 'oklch(0.8 0.15 135)', leaf: 'oklch(0.52 0.12 148)',
};

const FONT: Record<string, string> = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100',
  G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
  M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', Q: '010101101110011', R: '110101110101101',
  S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111', '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001011001111',
  '4': '101101111001001', '5': '111100111001111', '6': '111100111101111', '7': '111001010010010', '8': '111101111101111', '9': '111101111001111',
  '=': '000111000111000', '?': '111001011000010', '.': '000000000000010', '/': '001001010100100', '-': '000000111000000', ' ': '000000000000000',
  '(': '010100100100010', ')': '010001001001010', '+': '000010111010000', '>': '100010001010100', ':': '000010000010000',
  '<': '001010100010001', ',': '000000000010100', "'": '010010000000000', '!': '010010010000010',
};

export interface DrawOpts { dither: boolean }

type C = string;
export interface Kit {
  ctx: CanvasRenderingContext2D;
  R(x: number, y: number, w: number, h: number, c: C): void;
  px(x: number, y: number, c: C): void;
  /** Dithered blend of two colours (or a hard split when dithering is off). */
  D(x: number, y: number, w: number, h: number, c1: C, c2: C): void;
  E(cx: number, cy: number, rx: number, ry: number, c: C): void;
  C(cx: number, cy: number, r: number, c: C): void;
  L(x0: number, y0: number, x1: number, y1: number, c: C): void;
  /** Text in the 3×5 pixel font. */
  T(s: string, x: number, y: number, c: C, k?: number): void;
  rnd(): number;
  bands(y0: number, cols: C[], h: number, w?: number): void;
  brick(x: number, y: number, w: number, h: number, base: C, mortar: C, alt?: C): void;
  sprite<A extends unknown[]>(fn: (g: Kit, x: number, b: number, ...a: A) => void, x: number, b: number, flip: boolean, ...a: A): void;
  /** Registers a layer redrawn every frame over the cached background; `t` is in seconds. */
  anim(f: (t: number) => void): void;
  anims: ((t: number) => void)[];
  /** Points the kit at another canvas (the live one, when running anims). */
  setCtx(c: CanvasRenderingContext2D): void;
  /** Draws `fn` moved down by `dy` pixels (boats bobbing). */
  shift(dy: number, fn: () => void): void;
  /** Glints that come and go on runs of colour `key` between rows y0 and y1 (water). */
  shimmer(y0: number, y1: number, key: C, cols: C[], n?: number): void;
}

export function kit(ctx: CanvasRenderingContext2D, opt: DrawOpts): Kit {
  let seed = 11; const base = ctx;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const col = (c: string) => PALETTE[c] || c;
  const R = (x: number, y: number, w: number, h: number, c: string) => {
    if (w <= 0 || h <= 0) return;
    ctx.fillStyle = col(c); ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };
  const px = (x: number, y: number, c: string) => R(x, y, 1, 1, c);
  const D = (x: number, y: number, w: number, h: number, c1: string, c2: string) => {
    x = Math.round(x); y = Math.round(y);
    if (!opt.dither) { R(x, y, w, Math.ceil(h / 2), c1); R(x, y + Math.ceil(h / 2), w, h - Math.ceil(h / 2), c2); return; }
    R(x, y, w, h, c1); ctx.fillStyle = col(c2);
    for (let j = 0; j < h; j++) for (let i = (x + y + j) % 2; i < w; i += 2) ctx.fillRect(x + i, y + j, 1, 1);
  };
  const E = (cx: number, cy: number, rx: number, ry: number, c: string) => {
    for (let dy = -ry; dy <= ry; dy++) {
      const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry + 0.5))));
      R(cx - w, cy + dy, 2 * w + 1, 1, c);
    }
  };
  const C = (cx: number, cy: number, r: number, c: string) => E(cx, cy, r, r, c);
  const L = (x0: number, y0: number, x1: number, y1: number, c: string) => {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let e = dx + dy;
    for (let n = 0; n < 4000; n++) {
      px(x0, y0, c); if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; }
    }
  };
  const T = (s: string, x: number, y: number, c: string, k = 1) => {
    [...s].forEach((ch, n) => {
      const g = FONT[ch] || FONT[' '];
      for (let i = 0; i < 15; i++) if (g[i] === '1') R(x + (n * 4 + (i % 3)) * k, y + ((i / 3) | 0) * k, k, k, c);
    });
  };
  const bands = (y0: number, cols: string[], h: number, w = 640) => cols.forEach((c, k) => {
    R(0, y0 + k * h, w, h, c); if (cols[k + 1]) D(0, y0 + k * h + h - 4, w, 4, c, cols[k + 1]);
  });
  const brick = (x: number, y: number, w: number, h: number, base: string, mortar: string, alt?: string) => {
    R(x, y, w, h, base);
    for (let k = 0; k * 4 < h; k++) {
      R(x, y + k * 4 + 3, w, 1, mortar);
      for (let j = (k % 2) * 4; j < w; j += 8) { R(x + j, y + k * 4, 1, 3, mortar); if (alt && rnd() > .82) R(x + j + 1, y + k * 4, 7, 3, alt); }
    }
  };
  // Characters are drawn at twice the background's pixel size, as in the design.
  const sprite = <A extends unknown[]>(fn: (g: Kit, x: number, b: number, ...a: A) => void, x: number, b: number, flip: boolean, ...a: A) => {
    ctx.save(); ctx.translate(Math.round(x), Math.round(b)); ctx.scale(flip ? -2 : 2, 2); fn(api, 0, 0, ...a); ctx.restore();
  };
  const anims: ((t: number) => void)[] = [], anim = (f: (t: number) => void) => { anims.push(f); };
  const setCtx = (c: CanvasRenderingContext2D) => { ctx = c; api.ctx = c; ctx.imageSmoothingEnabled = false; };
  const shift = (dy: number, fn: () => void) => { ctx.save(); ctx.translate(0, dy); fn(); ctx.restore(); };
  // Spots are picked once, from the finished background, so they only land on open water.
  const shimmer = (y0: number, y1: number, key: string, cols: string[], n = 36) => {
    let spots: [number, number, number, number, string][] | null = null;
    anim(t => {
      if (!spots) {
        spots = [];
        const W = base.canvas.width, d = base.getImageData(0, 0, W, base.canvas.height).data;
        const tc = document.createElement('canvas').getContext('2d')!; tc.fillStyle = col(key); tc.fillRect(0, 0, 1, 1);
        const [r0, g0, b0] = tc.getImageData(0, 0, 1, 1).data;
        const ok = (x: number, y: number) => { if (x < 0 || x >= W) return false; const i = (y * W + x) * 4; return Math.abs(d[i] - r0) + Math.abs(d[i + 1] - g0) + Math.abs(d[i + 2] - b0) < 18; };
        let sd = 97; const rr = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
        for (let i = 0; i < n * 10 && spots.length < n; i++) {
          const x = Math.floor(rr() * W), y = Math.floor(y0 + rr() * (y1 - y0)), w = 3 + Math.floor(rr() * 6);
          let good = true; for (let j = -3; j < w + 3 && good; j++) good = ok(x + j, y);
          if (good) spots.push([x, y, w, rr() * 6.28, cols[i % cols.length]]);
        }
      }
      spots.forEach(([x, y, w, ph, c]) => { const v = Math.sin(t * 1.1 + ph); if (v > 0) R(x + Math.round(Math.sin(t * 0.5 + ph) * 2), y, Math.max(1, Math.round(w * v)), 1, c); });
    });
  };
  const api: Kit = { ctx, R, px, D, E, C, L, T, rnd, bands, brick, sprite, anim, anims, setCtx, shift, shimmer };
  return api;
}

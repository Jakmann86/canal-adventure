// Scene backgrounds, ported from the Claude Design prototype. Characters are no
// longer baked in (they're drawn live by the engine), and the art reacts to game
// state through `v` (boat present, items taken, and so on).
import type { Kit } from './kit';

export type Vis = Record<string, boolean>;

export function narrowboat(g: Kit, x: number, y: number, len: number, name: string, dusk: boolean, bowLeft: boolean, painted = false) {
  const { R, px, D, T } = g;
  const hullY = y + 34, cab = painted ? 'grn8' : dusk ? 'a700' : 'a600';
  R(x, hullY, len, 22, 'ink'); R(x, hullY + 6, len, 3, painted ? 'brass' : cab); R(x, hullY, len, 2, 'n100');
  for (let j = 0; j < 22; j++) { const w = Math.round(18 - j * 0.75); if (bowLeft) R(x - w, hullY + j, w, 1, 'ink'); else R(x + len, hullY + j, w, 1, 'ink'); }
  if (bowLeft) R(x - 18, hullY, 18, 2, 'n100'); else R(x + len, hullY, 18, 2, 'n100');
  const cx = x + 22, cw = len - 44;
  R(cx - 4, y - 4, cw + 8, 4, 'n800'); R(cx, y, cw, 34, cab); R(cx, y, cw, 1, 'n100'); R(cx, y + 33, cw, 1, 'n100'); R(cx, y, 1, 34, 'n100'); R(cx + cw - 1, y, 1, 34, 'n100');
  if (painted) { R(cx + 2, y + 3, cw - 4, 1, 'brass'); R(cx + 2, y + 30, cw - 4, 1, 'brass'); }
  else { // flaking paint and rust: she needs a repaint
    for (let i = 0; i < 14; i++) { const fx = cx + 4 + ((i * 37) % (cw - 10)), fy = y + 3 + ((i * 13) % 28); R(fx, fy, 3 + (i % 3), 2, i % 2 ? 'n500' : 'a800'); }
  }
  const panelX = bowLeft ? cx + 10 : cx + cw - 70;
  R(panelX, y + 9, 60, 15, 'ink'); R(panelX + 1, y + 10, 58, 13, 'n800');
  T(name, panelX + 30 - (name.length * 4 - 1) / 2, y + 14, painted ? 'brass' : 'n100');
  const wStart = bowLeft ? cx + 82 : cx + 14;
  for (let i = 0; wStart + i * 30 + 16 < (bowLeft ? cx + cw - 8 : panelX - 8); i++) {
    const wx = wStart + i * 30; R(wx, y + 9, 16, 12, 'ink');
    if (dusk) { R(wx + 1, y + 10, 14, 10, 'a200'); D(wx + 1, y + 16, 14, 4, 'a200', 'a300'); } else { R(wx + 1, y + 10, 14, 10, 'n800'); px(wx + 3, y + 11, 'n300'); px(wx + 4, y + 12, 'n400'); }
  }
  for (let k = 0; k < 3; k++) { const dx = bowLeft ? cx + cw - 14 : cx + 6; R(dx + 3, y + 26, 2, 2, 'a300'); }
  const chim = bowLeft ? cx + cw - 30 : cx + 20;
  R(chim, y - 22, 6, 18, 'ink'); R(chim - 1, y - 16, 8, 2, 'n300');
  const stern = bowLeft ? x + len : x;
  R(stern + (bowLeft ? 2 : -10), hullY + 8, 8, 16, 'ink');
  g.L(stern, y - 2, stern + (bowLeft ? 14 : -14), y - 10, 'n800');
  R(cx + cw / 2 - 10, y - 10, 8, 6, 'n700'); R(cx + cw / 2 - 11, y - 14, 10, 4, 'n500');
}

const BOAT = 'HYPOTENUSE';

/** Birds that flap across the sky and wrap around: [x, y, speed, phase]. */
function flock(g: Kit, list: [number, number, number, number][], c: string) {
  g.anim(t => list.forEach(([x0, y0, sp, ph]) => {
    const x = Math.round((((x0 + t * sp) % 700) + 700) % 700 - 30), y = Math.round(y0 + Math.sin(t * .7 + ph) * 4), f = Math.floor(t * 4 + ph * 3) % 4, w = f === 0 ? -1 : f === 2 ? 1 : 0, P = g.px;
    P(x - 1, y, c); P(x, y, c); P(x + 1, y, c); P(x - 2, y + w, c); P(x + 2, y + w, c); P(x - 3, y + w * 2, c); P(x + 3, y + w * 2, c);
  }));
}

/** Our narrowboat, bobbing gently with smoke from the chimney. `extra` rides along with the boat; `clip` hides what's behind the lock walls. */
function floatBoat(g: Kit, x: number, y: number, len: number, dusk: boolean, bowLeft: boolean, painted: boolean, ph: number, extra?: (t: number) => void, clip?: [number, number, number, number]) {
  const chim = bowLeft ? x + len - 52 : x + 42;
  g.anim(t => {
    const b = Math.sin(t * .8 + ph) > .2 ? -1 : 0;
    if (clip) { g.ctx.save(); g.ctx.beginPath(); g.ctx.rect(...clip); g.ctx.clip(); }
    g.shift(b, () => { narrowboat(g, x, y, len, BOAT, dusk, bowLeft, painted); extra?.(t); });
    if (clip) g.ctx.restore();
    for (let k = 0; k < 4; k++) { const p = (t * .3 + k / 4 + ph) % 1, sx = chim + 2 + Math.round(p * 10 + Math.sin(t * 1.2 + k) * 1.5), sy = y + b - 24 - p * 30, z = p < .3 ? 2 : p < .7 ? 3 : 2; if (p < .9) g.R(sx, sy, z, z, p < .5 ? 'n200' : 'n300'); }
  });
}

export const scenes: Record<string, (g: Kit, v: Vis) => void> = {
  littlevenice(g, v) {
    const { R, px, D, E, C, L, T, rnd, bands } = g;
    bands(0, ['sky1', 'sky2', 'sky3'], 40);
    const cloud = (x: number, y: number, s: number) => { E(x, y, 36 * s, 7 * s, 'bg'); E(x + 18 * s, y - 6 * s, 18 * s, 7 * s, 'bg'); D(x - 30 * s, y + 4 * s, 60 * s, 3, 'bg', 'sky3'); };
    cloud(360, 22, 1); cloud(560, 40, .8); cloud(240, 60, .6);
    for (let x = 0; x < 640; x++) { const t = Math.round(104 + 6 * Math.sin(x * .09) + 4 * Math.sin(x * .27) + 3 * Math.sin(x * .7)); R(x, t, 1, 152 - t, 'grn8'); if ((x + t) % 3 === 0) px(x, t + 1, 'grn'); if (x % 5 === 0) px(x, t + 3, 'grn'); }
    const villa = (x: number, w: number, top: number) => {
      R(x, top, w, 152 - top, 'bg'); R(x + w - 5, top, 5, 152 - top, 'sky3'); R(x - 2, top - 5, w + 4, 5, 'n100'); R(x - 2, top, w + 4, 1, 'n300');
      ([[x + 10, 'a700'], [x + w - 22, 'stock7']] as [number, string][]).forEach(([cx, c]) => { R(cx, top - 16, 12, 11, c); R(cx + 2, top - 20, 3, 4, 'a600'); R(cx + 7, top - 20, 3, 4, 'a600'); });
      for (let wy = top + 10, row = 0; wy < 124; wy += 22, row++) for (let wx = x + 8; wx < x + w - 14; wx += 20) {
        const h = row === 1 ? 17 : 14;
        R(wx, wy, 10, h, 'ink'); R(wx + 1, wy + 1, 8, h - 2, 'blu8'); D(wx + 1, wy + 1, 8, 4, 'sky1', 'blu8'); R(wx + 1, wy + 7, 8, 1, 'bg'); R(wx - 1, wy + h, 12, 2, 'n100');
      }
      R(x + 2, top + 49, w - 4, 1, 'ink'); for (let i = x + 2; i < x + w - 2; i += 2) R(i, top + 49, 1, 6, 'ink'); R(x + 2, top + 54, w - 4, 1, 'ink');
      const dx = x + w / 2 - 9; R(dx - 4, 124, 26, 3, 'n100'); R(dx - 3, 127, 3, 25, 'n100'); R(dx + 18, 127, 3, 25, 'n100'); R(dx + 2, 130, 14, 22, 'ink'); R(dx + 3, 131, 12, 21, ['blu8', 'a700', 'grn8', 'pur8'][(x / 90 | 0) % 4]); px(dx + 13, 142, 'brass');
    };
    villa(0, 88, 60); villa(90, 84, 68); villa(468, 84, 64); villa(554, 86, 56);
    R(0, 150, 640, 102, 'wat'); D(0, 150, 640, 3, 'wat8', 'wat');
    ([[0, 88], [90, 84], [468, 84], [554, 86]] as [number, number][]).forEach(([x, w]) => { for (let y = 154; y < 190; y += 2) if (rnd() > .25) R(x + rnd() * 10, y, w - 20 + rnd() * 10, 1, 'wat3'); });
    for (let i = 0; i < 110; i++) R(rnd() * 640, 160 + rnd() * 90, 3 + rnd() * 9, 1, rnd() > .5 ? 'wat3' : 'wat8');
    E(304, 172, 74, 10, 'grn8'); E(304, 170, 70, 7, 'grn'); R(234, 176, 140, 3, 'stock7');
    for (let y = 182; y < 210; y += 2) if (rnd() > .3) R(260 + rnd() * 20, y, 70 + rnd() * 20, 1, 'grn8');
    R(298, 104, 8, 68, 'wood9'); L(300, 120, 280, 98, 'wood9'); L(304, 116, 330, 96, 'wood9');
    g.shimmer(156, 250, 'wat', ['wat3', 'bg']);
    // The willow sways, with the odd gust
    g.anim(t => {
      const gust = Math.pow(Math.max(0, Math.sin(t * 0.42)), 6), amp = 0.9 + 3.4 * gust, cx = Math.round(Math.sin(t * 1.3) * gust * 1.6);
      let sd = 7; const r = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
      E(304 + cx, 104, 58, 38, 'grn8'); E(298 + cx, 96, 48, 30, 'grn'); E(316 + cx, 92, 26, 18, 'lime');
      for (let i = 0; i < 120; i++) {
        const x = 248 + r() * 112, dx = x - 304, y0 = 104 + 38 * Math.sqrt(Math.max(0, 1 - (dx * dx) / 3364)) - 8 - r() * 14, len = 18 + r() * 40, w = Math.sin(t * 1.7 + i * 0.37) * amp + gust * 2;
        for (let y = y0; y < Math.min(170, y0 + len); y += 1) { const f = (y - y0) / len; if (r() > .25) px(x + cx * (1 - f) + Math.sin(y * .1) * 1.5 + w * f * f, y, r() > .5 ? 'grn' : 'grn8'); }
      }
    });
    R(372, 150, 14, 34, 'stock7'); R(468, 150, 14, 34, 'stock7');
    for (let x = 372; x < 482; x++) { const t = (x - 427) / 55, u = Math.round(178 - 26 * (1 - t * t)); R(x, 138, 1, 6, 'blu'); R(x, 144, 1, Math.max(0, u - 144), 'blu8'); px(x, u, 'bg'); R(x, u + 1, 1, 2, 'blu'); }
    for (let x = 376; x < 476; x += 8) { L(x, 144, x + 4, 152, 'blu'); L(x + 4, 152, x + 8, 144, 'blu'); }
    R(370, 128, 114, 2, 'blu'); for (let x = 372; x < 484; x += 4) R(x, 130, 1, 8, 'blu8'); R(370, 136, 114, 2, 'bg');
    for (let x = 380; x < 476; x += 3) { const t = (x - 427) / 55, u = Math.round(180 + 22 * (1 - t * t)); if (rnd() > .3) R(x, 182, 2, u - 182, 'blu8'); }
    R(14, 158, 160, 14, 'ink'); R(14, 162, 160, 3, 'a600'); for (let j = 0; j < 14; j++) R(174, 158 + j, 14 - j, 1, 'ink');
    R(28, 136, 132, 22, 'yel'); R(28, 136, 132, 2, 'a600'); for (let i = 0; i < 4; i++) { R(40 + i * 28, 142, 14, 10, 'ink'); R(41 + i * 28, 143, 12, 8, 'sky2'); }
    for (let x = 24; x < 164; x++) { const c = ((x - 24) >> 3) % 2 ? 'bg' : 'a600'; R(x, 128, 1, 7, c); if ((x - 24) % 8 === 4) R(x, 135, 1, 2, c); }
    R(128, 144, 26, 9, 'bg'); T('CAFE', 130, 146, 'a700');
    ([[50, 'pink'], [90, 'grn'], [120, 'org']] as [number, string][]).forEach(([x, c]) => { R(x, 124, 6, 4, 'org'); C(x + 3, 122, 3, c); });
    if (v.boat) floatBoat(g, 150, 196, 250, false, false, v.painted, .9, () => ([[200, 'pink'], [226, 'yel'], [252, 'grn']] as [number, string][]).forEach(([x, c]) => { R(x, 188, 10, 4, 'org'); C(x + 5, 186, 3, c); px(x + 5, 186, 'bg'); }));
    R(0, 252, 640, 36, 'n300'); R(0, 252, 640, 2, 'n500'); R(0, 254, 640, 1, 'ink');
    for (let y = 256, k = 0; y < 288; y += 6, k++) for (let x = (k % 2) * 6 - 6; x < 640; x += 12) { R(x + 1, y + 1, 10, 4, 'n200'); R(x + 1, y + 4, 10, 1, 'n400'); }
    R(20, 160, 4, 116, 'ink'); R(16, 272, 12, 6, 'ink'); R(14, 150, 16, 4, 'ink'); R(16, 154, 12, 12, 'ink'); R(18, 156, 8, 8, 'yel'); R(20, 144, 4, 6, 'ink');
    R(54, 212, 4, 64, 'ink'); R(30, 214, 52, 9, 'blu8'); for (let j = 0; j < 9; j++) R(82, 214 + j, 5 - Math.abs(j - 4), 1, 'blu8'); T('CAMDEN', 34, 216, 'bg');
    R(26, 226, 56, 9, 'blu8'); for (let j = 0; j < 9; j++) R(21 + Math.abs(j - 4), 226 + j, 5 - Math.abs(j - 4), 1, 'blu8'); T('PADDINGTON', 28, 228, 'bg');
    R(30, 238, 52, 9, 'ink'); T('LITTLE', 32, 240, 'yel'); T('VENICE', 57, 240, 'yel');
    const planter = (x: number) => { R(x, 266, 26, 14, 'blu8'); R(x, 266, 26, 2, 'blu'); for (let i = 0; i < 8; i++) { const fx = x + 2 + i * 3; L(fx, 266, fx + (rnd() - .5) * 4, 254 + rnd() * 6, 'grn8'); C(fx, 254 + rnd() * 4, 2, ['pink', 'yel', 'a500', 'pur'][i % 4]); } };
    planter(170); planter(372);
    // Route board (the design's Pythagoras board; the GDD keeps Little Venice maths-free)
    L(536, 284, 542, 246, 'ink'); L(612, 284, 606, 246, 'ink');
    R(526, 210, 96, 38, 'blu8'); R(528, 212, 92, 34, 'bg'); T('REGENTS CANAL', 532, 215, 'blu8'); T('CAMDEN  2.5KM', 532, 223, 'ink'); T('ANGEL   5KM', 532, 230, 'ink'); T('LIMEHOUSE 13', 532, 238, 'a700');
    // Barnaby's bench (back rail; the seat is drawn in front of him)
    R(446, 246, 64, 3, 'wood7'); R(446, 251, 64, 3, 'wood7'); R(448, 244, 3, 22, 'wood9'); R(505, 244, 3, 22, 'wood9');
    flock(g, [[420, 100, 9, 0], [432, 94, 9, 1.3], [210, 52, 6, 2.1]], 'ink');
    // A pair of ducks paddling about, dabbling now and then
    g.anim(t => ([[520, 182, 0, 'n400', 'grn8'], [546, 190, 2.4, 'wood7', 'wood7']] as [number, number, number, string, string][]).forEach(([x0, y, ph, bc, hc]) => {
      const x = Math.round(x0 + Math.sin(t * .18 + ph) * 18), d = Math.cos(t * .18 + ph) > 0 ? 1 : -1, dab = (t + ph * 3) % 9 < .7;
      R(x - d * 9 - (d < 0 ? 2 : 0), y + 2, 3, 1, 'wat3'); R(x - d * 13 - (d < 0 ? 1 : 0), y + 3, 2, 1, 'wat3'); E(x, y, 4, 2, bc);
      if (dab) R(x - d * 3, y - 4, 2, 3, bc);
      else { px(x - d * 5, y - 1, bc); R(x + d * 2 - (d < 0 ? 1 : 0), y - 5, 2, 3, hc); px(x + d * 4, y - 4, 'yel'); }
    }));
  },

  camden(g, v) {
    const { R, px, D, E, L, T, rnd, bands, brick } = g;
    bands(0, ['n300', 'n200', 'n100'], 44);
    const cloud = (x: number, y: number, s: number) => { E(x, y, 34 * s, 7 * s, 'n100'); E(x + 18 * s, y - 6 * s, 18 * s, 7 * s, 'n100'); D(x - 28 * s, y + 4 * s, 56 * s, 3, 'n100', 'n200'); };
    cloud(110, 26, 1); cloud(340, 50, .8); cloud(560, 18, 1);
    for (let x = 170; x < 470;) { const w = 18 + rnd() * 34, t = 92 + rnd() * 40; R(x, t, w, 200 - t, 'n300'); for (let wy = t + 8; wy < 190; wy += 12) for (let wx = x + 4; wx < x + w - 4; wx += 8) R(wx, wy, 3, 5, 'n400'); x += w; }
    for (let i = 0; i < 12; i++) { const x = 190 + rnd() * 260, y = 150 + rnd() * 20; E(x, y, 14 + rnd() * 10, 12, 'n400'); D(x - 12, y + 4, 24, 6, 'n400', 'n500'); }
    const win = (x: number, y: number, w: number, h: number) => { E(x + w / 2, y + w / 2, w / 2, w / 2, 'n100'); R(x - 1, y + w / 2, w + 2, h - w / 2 + 1, 'n100'); E(x + w / 2, y + w / 2 + 1, w / 2 - 1, w / 2 - 1, 'ink'); R(x, y + w / 2, w, h - w / 2, 'ink'); D(x + 1, y + h - 8, w - 2, 7, 'ink', 'n800'); R(x + w / 2, y + 2, 1, h - 2, 'n300'); R(x, y + h * 0.55, w, 1, 'n300'); R(x - 2, y + h, w + 4, 2, 'n300'); };
    brick(0, 46, 196, 160, 'a700', 'a800', 'a600'); R(0, 40, 196, 6, 'n800'); R(0, 46, 196, 2, 'n500');
    [30, 130].forEach(x => { brick(x, 22, 14, 18, 'a700', 'a800'); R(x - 1, 20, 16, 3, 'n800'); R(x + 2, 14, 4, 6, 'ink'); R(x + 8, 16, 4, 4, 'ink'); });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) win(14 + c * 36, 60 + r * 44, 16, 28);
    brick(446, 20, 194, 186, 'a700', 'a800', 'a600'); R(446, 16, 194, 6, 'n800');
    R(446, 36, 194, 22, 'ink'); T('CAMDEN LOCK', 470, 42, 'n100', 2);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) win(462 + c * 36, 70 + r * 42, 16, 26);
    // Gerald's window is open, with the curtain pulled back
    R(499, 82, 14, 14, 'a200'); R(499, 82, 4, 14, 'pur');
    brick(176, 124, 28, 80, 'a800', 'a900'); brick(436, 124, 28, 80, 'a800', 'a900'); R(174, 120, 32, 5, 'n300'); R(434, 120, 32, 5, 'n300');
    R(196, 122, 248, 8, 'ink'); R(196, 106, 248, 2, 'ink'); R(196, 116, 248, 1, 'ink');
    for (let x = 196; x <= 444; x += 12) { R(x, 106, 2, 16, 'ink'); if (x < 444) { L(x, 108, x + 12, 121, 'ink'); L(x + 12, 108, x, 121, 'ink'); } }
    for (let x = 204; x < 436; x++) { const u = Math.round(134 + 46 * Math.pow((x - 320) / 116, 2)); R(x, u, 1, 4, 'ink'); if (x % 8 === 0) R(x, 130, 1, u - 130, 'ink'); }
    for (let x = 204; x < 436; x += 16) { const u2 = Math.round(134 + 46 * Math.pow((x + 8 - 320) / 116, 2)); L(x, 130, x + 8, u2, 'n800'); }
    R(0, 192, 640, 6, 'n300'); for (let x = 0; x < 640; x += 22) R(x, 192, 1, 6, 'n500'); R(0, 198, 640, 30, 'n500');
    for (let i = 0; i < 60; i++) R(rnd() * 640, 200 + rnd() * 26, 4 + rnd() * 10, 1, rnd() > .5 ? 'n400' : 'n600');
    R(180, 168, 9, 70, 'n800'); R(180, 168, 9, 2, 'ink'); R(456, 168, 9, 70, 'n800'); R(456, 168, 9, 2, 'ink');
    g.shimmer(200, 228, 'n500', ['n300', 'n400']);
    if (v.boat) { const by = v.lockDown ? 184 : 172; D(214, by + 56, 248, 6, 'n500', 'n600'); floatBoat(g, 214, by, 230, false, false, v.painted, 0, undefined, [0, 0, 640, 234]); }
    R(0, 234, 640, 6, 'n300'); for (let x = 0; x < 640; x += 26) R(x, 234, 1, 6, 'n500'); R(0, 240, 640, 2, 'ink');
    R(0, 242, 640, 46, 'n500');
    for (let y = 242, k = 0; y < 288; y += 6, k++) for (let x = (k % 2) * 5 - 5; x < 640; x += 10) { R(x + 1, y + 1, 8, 4, 'n400'); R(x + 2, y + 1, 5, 1, 'n300'); }
    D(0, 242, 640, 4, 'n600', 'n500');
    // Lock board: the data for the drain puzzle
    L(290, 276, 300, 238, 'ink'); L(366, 276, 356, 238, 'ink');
    R(294, 236, 68, 36, 'n800'); R(296, 238, 64, 32, 'ink');
    T('CAMDEN LOCK', 300, 242, 'n100'); T('DROP 2.4M', 300, 250, 'n100'); T('CILL 1.2M', 300, 260, 'a300');
    R(410, 254, 10, 18, 'ink'); R(408, 250, 14, 5, 'ink'); R(410, 260, 10, 2, 'n100');
    const beam = (x0: number, y0: number, x1: number, y1: number) => { for (let t = 0; t < 6; t++) L(x0, y0 + t, x1, y1 + t, 'n100'); for (let t = 0; t < 6; t++) L(x1 + (x0 - x1) * 0.12, y1 + (y0 - y1) * 0.12 + t, x1, y1 + t, 'ink'); L(x0, y0 + 6, x1, y1 + 6, 'n400'); };
    beam(184, 214, 70, 262); beam(460, 214, 590, 262);
    R(66, 262, 4, 20, 'n800'); R(588, 262, 4, 20, 'n800');
    // Paddle gear on the left gate
    R(196, 222, 8, 12, 'ink'); R(194, 220, 12, 3, 'n700'); R(199, 216, 2, 4, 'n500');
    // Roz's amp, with the power pack plugged into the side
    R(598, 254, 30, 30, 'ink'); R(600, 256, 26, 18, 'n800'); for (let y = 258; y < 272; y += 3) R(602, y, 22, 1, 'n700');
    R(604, 276, 3, 3, 'yel'); R(610, 276, 3, 3, 'n500'); R(616, 276, 3, 3, 'n500');
    if (!v.packLent) { R(628, 262, 8, 20, 'yel7'); R(629, 263, 6, 4, 'ink'); }
    // Tips hat
    E(566, 282, 9, 3, 'ink'); E(566, 281, 6, 1, 'n800'); R(563, 280, 2, 1, 'brass');
    // Pigeons strutting and pecking on the towpath
    g.anim(t => ([[150, 282, 0], [178, 279, 3]] as [number, number, number][]).forEach(([x0, y, ph]) => {
      const q = (t + ph) * .3, T = (t + ph) % 6, x = Math.round(x0 + Math.sin(q) * 10), dir = Math.cos(q) > 0 ? 1 : -1, peck = T > 2 && T < 3.2 && Math.floor(t * 5) % 2;
      E(x, y - 3, 3, 2, 'n600'); px(x - dir * 4, y - 3, 'n800'); R(x - dir, y - 4, 2, 1, 'n400');
      const hx = x + dir * 3 - (dir < 0 ? 1 : 0), hy = peck ? y - 3 : y - 6;
      R(hx, hy, 2, 2, 'n700'); px(hx + (dir > 0 ? 2 : -1), hy + 1, 'n900'); px(x - 1, y - 1, 'a600'); px(x + 1, y - 1, 'a600');
    }));
  },

  islington(g, v) {
    const { R, px, D, C, L, T, rnd, bands, brick } = g;
    bands(0, ['a900', 'a800', 'a700', 'a600', 'a500', 'a400', 'a300'], 24);
    R(0, 168, 640, 50, 'a300');
    for (let i = 0; i < 60; i++) px(rnd() * 640, rnd() * 60, rnd() > .7 ? 'a300' : 'n100');
    C(500, 168, 36, 'a200'); C(500, 168, 28, 'a100');
    const holder = (cx: number, top: number, bot: number, r: number) => {
      const h = bot - top, tiers = [top, top + h / 3, top + 2 * h / 3, bot];
      for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8, x = cx + r * Math.cos(a); R(x - 1, top, Math.sin(a) > 0 ? 3 : 2, h, 'ink'); }
      tiers.forEach(y => { for (let a = 0; a < Math.PI * 2; a += 0.01) { px(cx + r * Math.cos(a), y + 7 * Math.sin(a), 'ink'); px(cx + r * Math.cos(a), y + 1 + 7 * Math.sin(a), 'ink'); } });
      for (let i = 0; i < 3; i++) for (let k = 0; k < 8; k++) {
        const a1 = k * Math.PI / 8, a2 = (k + 1) * Math.PI / 8, x1 = cx + r * Math.cos(a1), x2 = cx + r * Math.cos(a2);
        const y1 = tiers[i] + 7 * Math.sin(a1), y2 = tiers[i + 1] + 7 * Math.sin(a2), y3 = tiers[i] + 7 * Math.sin(a2), y4 = tiers[i + 1] + 7 * Math.sin(a1);
        L(x1, y1, x2, y2, 'ink'); L(x2, y3, x1, y4, 'ink');
      }
    };
    holder(560, 92, 200, 58); holder(410, 58, 200, 84);
    for (let x = 250; x < 640;) { const w = 20 + rnd() * 40, t = 160 + rnd() * 34; R(x, t, w, 230 - t, 'n900'); for (let wy = t + 5; wy < 222; wy += 7) for (let wx = x + 3; wx < x + w - 3; wx += 6) if (rnd() > .55) R(wx, wy, 2, 3, 'a300'); x += w + 2; }
    R(0, 218, 640, 44, 'n900'); D(0, 218, 640, 3, 'a800', 'n900');
    for (let y = 220; y < 260; y += 2) { const w = 50 - (y - 220) * 0.6 + rnd() * 10; R(500 - w / 2 + (rnd() - .5) * 12, y, w, 1, y < 236 ? 'a300' : 'a500'); }
    for (let i = 0; i < 40; i++) R(260 + rnd() * 380, 222 + rnd() * 38, 3 + rnd() * 8, 1, 'a800');
    brick(0, 40, 254, 222, 'a800', 'a900', 'a700'); R(0, 34, 258, 7, 'n500'); R(0, 34, 258, 1, 'n300');
    const cx = 128, sy = 176, r = 70;
    for (let y = sy - r; y < 262; y++) { const w = y < sy ? Math.sqrt(r * r - (sy - y) ** 2) : r; R(cx - w, y, 2 * w, 1, 'ink'); }
    for (let rr = r - 8; rr > 10; rr -= 14) for (let a = Math.PI; a <= 2 * Math.PI; a += 0.008) px(cx + rr * Math.cos(a), sy + rr * Math.sin(a) + (r - rr) * 0.6, 'n900');
    C(cx, 232, 3, 'a300'); px(cx, 232, 'a100');
    for (let a = Math.PI; a <= 2 * Math.PI + 0.001; a += 0.004) {
      const idx = Math.floor((a - Math.PI) / (Math.PI / 21)), key = idx === 10;
      for (let rr = r; rr < r + (key ? 14 : 10); rr++) px(cx + rr * Math.cos(a), sy + rr * Math.sin(a), key ? 'n200' : idx % 2 ? 'n400' : 'n300');
    }
    R(cx - r - 10, sy, 10, 86, 'n400'); R(cx + r, sy, 10, 86, 'n400'); for (let y = sy; y < 262; y += 10) { R(cx - r - 10, y, 10, 1, 'n600'); R(cx + r, y, 10, 1, 'n600'); }
    R(cx - 44, 70, 88, 26, 'ink'); R(cx - 42, 72, 84, 22, 'n800'); T('ISLINGTON', cx - 35, 76, 'n200', 1); T('TUNNEL', cx - 23, 84, 'n200', 1);
    T('R=?', 210, 120, 'n100', 2); L(208, 132, 236, 132, 'n100');
    const ivy = (x0: number, x1: number, n: number) => { for (let i = 0; i < n; i++) { const x = x0 + rnd() * (x1 - x0), len = 10 + rnd() * 70; for (let y = 40; y < 40 + len; y += 1) { const xx = x + Math.sin(y * 0.2 + i) * 2; if (rnd() > .35) px(xx, y, rnd() > .5 ? 'n900' : 'ink'); if (rnd() > .8) R(xx - 1, y, 3, 2, 'n900'); } } };
    ivy(0, 52, 26); ivy(204, 254, 22); ivy(60, 196, 8);
    for (let x = 70; x < 150; x++) { const s = (150 - x) * 0.22; for (let y = Math.round(224 - s); y <= 224 + s * 0.5; y++) if ((x + y) % 2 === 0 && y > 106) px(x, y, 'a300'); }
    g.shimmer(222, 258, 'n900', ['a500', 'a800']);
    if (v.boat) floatBoat(g, 168, 190, 236, true, true, v.painted, 1.1, t => {
      R(150, 220, 6, 6, 'ink'); R(151, 221, 4, 4, Math.floor(t * 7) % 9 === 0 ? 'a300' : 'a100');
      if (v.label) { R(300, 204, 40, 10, 'n100'); T('NOT TO', 302, 206, 'a700'); }
    });
    D(150, 246, 270, 6, 'n900', 'a900');
    R(0, 258, 640, 4, 'n500'); R(0, 262, 640, 26, 'n700');
    for (let y = 262, k = 0; y < 288; y += 6, k++) for (let x = (k % 2) * 5 - 5; x < 640; x += 10) { R(x + 1, y + 1, 8, 4, 'n600'); R(x + 2, y + 1, 5, 1, 'n500'); }
    for (let dy = -10; dy <= 10; dy++) for (let dx = -40; dx <= 40; dx++) if ((dx * dx) / 1600 + (dy * dy) / 100 < 1 && (dx + dy) % 2 === 0) px(302 + dx, 276 + dy, 'a800');
    const lamp = () => { R(300, 150, 4, 126, 'ink'); R(296, 274, 12, 4, 'ink'); R(294, 136, 16, 4, 'ink'); R(296, 140, 12, 12, 'ink'); R(298, 142, 8, 8, 'a100'); R(300, 132, 4, 4, 'ink'); };
    lamp();
    // The lamp stands in front of the boat, and flickers now and then
    g.anim(t => { if (v.boat) lamp(); if (Math.floor(t * 10) * 7 % 61 < 2) R(298, 142, 8, 8, 'a300'); });
    for (let dy = -22; dy <= 22; dy++) for (let dx = -22; dx <= 22; dx++) { const d = dx * dx + dy * dy; if (d < 484 && d > 80 && (dx + dy) % 2 === 0 && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) px(302 + dx, 146 + dy, 'a300'); }
    // A soggy exam paper, blown down from the school at Angel
    if (!v.paperTaken) { R(452, 268, 16, 11, 'n200'); R(452, 268, 16, 1, 'n100'); for (let y = 270; y < 278; y += 2) R(454, y, 10, 1, 'n500'); R(462, 272, 4, 4, 'a300'); }
    // Steps up to Angel (the towpath stops at the tunnel)
    for (let k = 0; k < 6; k++) R(176 + k * 4, 276 - k * 6, 18, 2, 'n400');
  },

  hackneywick(g, v) {
    const { R, px, D, E, C, L, T, rnd, bands, brick } = g;
    bands(0, ['sky1', 'sky2', 'sky3'], 44);
    const cloud = (x: number, y: number, s: number) => { E(x, y, 36 * s, 7 * s, 'bg'); E(x + 18 * s, y - 6 * s, 18 * s, 7 * s, 'bg'); D(x - 30 * s, y + 4 * s, 60 * s, 3, 'bg', 'sky3'); };
    cloud(110, 28, 1); cloud(470, 18, .8); cloud(600, 52, .7);
    for (let t = 0; t < 1; t += 0.0012) { const y = 140 - t * 104; [0, 2.1, 4.2].forEach((ph, k) => { const x = 300 + 15 * Math.sin(t * 9 + ph) * (0.6 + t * 0.5) + (k - 1) * 3; R(x, y, 2, 2, k === 1 ? 'a700' : 'a600'); }); }
    R(288, 30, 26, 8, 'ink'); R(286, 36, 30, 3, 'a700'); R(298, 24, 6, 6, 'a600');
    const yt = (xx: number) => Math.round(86 + 12 * ((xx - 465) / 135) ** 2);
    for (let x = 330; x < 600; x++) { const y = yt(x); R(x, y, 1, 14, 'bg'); px(x, y, 'n700'); px(x, y + 13, 'n700'); R(x, y + 14, 1, 150 - y - 14, x % 4 === 0 ? 'n300' : 'n200'); }
    for (let x = 330; x < 592; x += 8) { L(x, yt(x), x + 4, yt(x + 4) + 13, 'n600'); L(x + 4, yt(x + 4) + 13, x + 8, yt(x + 8), 'n600'); }
    for (let x = 340; x < 592; x += 18) R(x, yt(x) - 5, 1, 5, 'n700');
    brick(0, 118, 200, 110, 'stock', 'stock7', 'yel7'); R(0, 112, 200, 6, 'n800');
    brick(200, 128, 170, 100, 'a700', 'a800', 'a600');
    for (let k = 0; k < 168; k += 24) { for (let j = 0; j < 24; j++) { const h = Math.round(j * 14 / 24); R(200 + k + j, 128 - h, 1, h, 'blu8'); } R(200 + k + 23, 114, 1, 14, 'teal'); }
    brick(370, 150, 270, 78, 'stock', 'stock7', 'yel7'); R(370, 146, 270, 4, 'n800');
    for (let c = 0; c < 4; c++) { const x = 14 + c * 46; R(x, 124, 32, 22, 'ink'); R(x + 1, 125, 30, 20, 'blu8'); D(x + 1, 125, 30, 6, 'sky1', 'blu8'); for (let i = 8; i < 32; i += 8) R(x + i, 125, 1, 20, 'teal'); }
    for (let c = 0; c < 6; c++) { const x = 212 + c * 26; R(x, 140, 14, 16, 'ink'); R(x + 1, 141, 12, 14, c % 2 ? 'yel' : 'teal7'); R(x + 7, 141, 1, 14, 'ink'); }
    R(0, 150, 200, 76, 'pur'); D(0, 150, 200, 3, 'stock', 'pur');
    for (let i = 0; i < 14; i++) R(rnd() * 200, 226, 2, -(4 + rnd() * 10), 'pur');
    C(36, 196, 22, 'teal'); C(36, 196, 15, 'yel'); C(36, 196, 7, 'pink'); C(166, 214, 16, 'grn'); C(166, 214, 9, 'org');
    for (let k = 0; k < 6; k++) R(120 + k * 6, 200, 3, 26, ['yel', 'pink', 'teal', 'org', 'grn', 'blu'][k]);
    const piece = (s: string, x: number, y: number, k: number, fill: string, sh: string) => { T(s, x + 4, y + 4, sh, k); ([[-2, 0], [2, 0], [0, -2], [0, 2]] as [number, number][]).forEach(([dx, dy]) => T(s, x + dx, y + dy, 'ink', k)); T(s, x, y, fill, k); };
    piece('WICK', 30, 158, 5, 'yel', 'teal7'); for (let i = 0; i < 16; i++) px(32 + i * 5, 160, 'bg');
    R(206, 168, 160, 58, 'blu'); for (let x = 206; x < 366; x += 3) if (rnd() > .3) R(x, 226, 1, -(rnd() * 8), 'blu8');
    E(244, 196, 18, 22, 'pink'); R(234, 190, 6, 4, 'ink'); R(250, 190, 6, 4, 'ink'); R(236, 191, 2, 2, 'bg'); R(252, 191, 2, 2, 'bg'); R(238, 206, 14, 3, 'a700'); R(226, 172, 36, 6, 'yel'); R(230, 166, 28, 6, 'yel');
    for (let k = 0; k < 4; k++) { R(282 + k * 20, 176, 14, 14, ['grn', 'yel', 'teal', 'pink'][k]); R(282 + k * 20, 196, 14, 24, ['org', 'pur', 'yel', 'grn'][k]); }
    // Jasper's tag: x² + 3x = 28 (roots −7 and 4 open his padlock)
    R(376, 156, 178, 46, 'pur8'); for (let x = 376; x < 554; x += 4) if (rnd() > .4) R(x, 202, 1, rnd() * 10, 'pur8');
    piece('X', 386, 168, 5, 'pink', 'blu'); piece('2', 406, 162, 3, 'pink', 'blu'); piece('+3X=28', 420, 168, 5, 'yel', 'org');
    R(386, 191, 134, 2, 'teal');
    R(376, 204, 178, 22, 'grn'); for (let x = 380; x < 554; x += 14) { C(x, 214, 4, 'yel'); px(x, 214, 'org'); }
    R(556, 152, 84, 18, 'ink'); T('BAR', 566, 155, 'yel', 2); T('OPEN', 596, 159, 'pink');
    R(560, 172, 80, 54, 'teal7'); R(564, 176, 72, 30, 'ink'); for (let i = 0; i < 6; i++) { const x = 568 + i * 11; R(x, 194, 4, 12, ['yel', 'pink', 'grn', 'org', 'teal', 'bg'][i]); }
    // a stack of schooners on the bar counter
    if (!v.schoonerTaken) for (let i = 0; i < 4; i++) { R(620, 186 - i * 3, 8, 3, 'sky3'); R(621, 186 - i * 3, 6, 1, 'bg'); }
    const brella = (x: number, c1: string, c2: string) => { R(x, 210, 1, 16, 'ink'); for (let j = 0; j < 8; j++) { const w = j * 2 + 2; for (let i = -w; i <= w; i++) px(x + i, 202 + j, Math.floor((i + 40) / 4) % 2 ? c1 : c2); } };
    brella(470, 'org', 'bg'); brella(512, 'teal', 'yel'); brella(546, 'pink', 'bg');
    const person = (x: number, y: number, top: string, legs: string) => { R(x, y - 14, 4, 10, top); C(x + 2, y - 17, 2, 'a300'); px(x + 1, y - 19, 'ink'); px(x + 2, y - 19, 'ink'); R(x, y - 4, 1, 4, legs); R(x + 3, y - 4, 1, 4, legs); };
    person(460, 226, 'yel', 'blu8'); person(478, 226, 'grn', 'ink'); person(500, 226, 'pink', 'n700'); person(524, 226, 'teal', 'blu8'); person(536, 226, 'org', 'ink');
    const flag = ['a500', 'yel', 'teal', 'pink', 'grn', 'blu', 'org', 'pur'];
    ([[0, 200], [200, 420], [420, 640]] as [number, number][]).forEach(([a, b]) => { for (let x = a; x < b; x++) { const t = (x - a) / (b - a), y = Math.round(144 + 34 * t * (1 - t)); px(x, y, 'ink'); if ((x - a) % 9 === 3) { const c = flag[((x - a) / 9 | 0) % 8]; for (let j = 0; j < 5; j++) R(x - 2 + (j >> 1), y + 1 + j, 5 - j, 1, c); } } });
    R(0, 226, 640, 30, 'wat'); D(0, 226, 640, 3, 'wat8', 'wat');
    ([[30, 'yel'], [130, 'pur'], [236, 'blu'], [300, 'pink'], [420, 'pur8'], [600, 'teal7']] as [number, string][]).forEach(([x, c]) => { for (let y = 230; y < 254; y += 2) if (rnd() > .35) R(x + (rnd() - .5) * 20, y, 6 + rnd() * 18, 1, c); });
    for (let i = 0; i < 50; i++) R(rnd() * 640, 230 + rnd() * 24, 3 + rnd() * 6, 1, rnd() > .5 ? 'wat3' : 'wat8');
    // Jasper's boat, with the hydroponic tomatoes on the roof
    const hull = (x: number, len: number, cab: string, trim: string, roof: string) => { R(x, 226, len, 18, 'ink'); R(x, 231, len, 3, trim); R(x, 226, len, 2, 'bg'); for (let j = 0; j < 18; j++) R(x + len, 226 + j, 16 - j * .8, 1, 'ink'); R(x + 18, 198, len - 36, 28, cab); R(x + 18, 198, len - 36, 2, trim); R(x + 14, 194, len - 28, 4, roof); for (let i = 0; i < 4; i++) { R(x + 30 + i * 26, 206, 14, 10, 'ink'); R(x + 31 + i * 26, 207, 12, 8, 'sky2'); } };
    g.shimmer(230, 254, 'wat', ['wat3', 'bg']);
    g.anim(t => g.shift(Math.sin(t * .7 + 3) > .2 ? -1 : 0, () => {
      hull(440, 150, 'grn8', 'yel', 'n800');
      for (let k = 0; k < 9; k++) { const x = 462 + k * 12; R(x, 188, 6, 6, k % 2 ? 'a600' : 'org'); C(x + 3, 186, 3, ['pink', 'yel', 'grn', 'org'][k % 4]); px(x + 3, 186, 'bg'); px(x + 1, 184, 'a600'); }
      // the door and padlock
      R(570, 204, 12, 22, 'ink'); R(571, 205, 10, 21, 'grn8');
      if (v.padlockOpen) { R(566, 214, 4, 5, 'brass'); R(566, 211, 1, 3, 'n500'); } else { R(574, 214, 5, 5, 'brass'); R(575, 211, 3, 1, 'n500'); R(575, 212, 1, 2, 'n500'); R(577, 212, 1, 2, 'n500'); }
    }));
    if (v.boat) floatBoat(g, 24, 196, 240, false, false, v.painted, 1.7, () => { C(110, 186, 5, 'ink'); C(110, 186, 3, 'yel'); C(126, 186, 5, 'ink'); C(126, 186, 3, 'yel'); L(110, 186, 118, 179, 'teal7'); L(118, 179, 126, 186, 'teal7'); L(114, 179, 122, 179, 'teal7'); });
    R(0, 256, 640, 32, 'n300'); D(0, 256, 640, 2, 'n500', 'n300');
    for (let k = 0; k < 10; k++) { const x = rnd() * 640, y = 262 + rnd() * 22; L(x, y, x + 6 + rnd() * 10, y + (rnd() - .5) * 6, 'n400'); }
    for (let k = 0; k < 6; k++) { const x = 30 + rnd() * 580, y = 266 + rnd() * 16; C(x, y, 3, ['yel', 'pink', 'teal', 'grn'][k % 4]); }
    const planter = (x: number) => { R(x, 266, 26, 14, 'org'); R(x, 266, 26, 2, 'a700'); for (let i = 0; i < 8; i++) { const fx = x + 2 + i * 3; L(fx, 266, fx + (rnd() - .5) * 4, 252 + rnd() * 6, 'grn8'); C(fx, 252 + rnd() * 4, 2, ['pink', 'yel', 'a500', 'pur'][i % 4]); } };
    planter(250); planter(470);
    const post = (x: number) => { R(x, 248, 10, 24, 'ink'); R(x + 1, 254, 8, 9, 'yel'); };
    post(326); post(608);
    // Water point: the only tap on this stretch, and a bucket
    R(402, 252, 5, 24, 'n600'); R(400, 274, 9, 4, 'n800'); R(398, 250, 13, 4, 'n500'); R(409, 254, 6, 3, 'n500'); R(401, 246, 7, 3, 'a600');
    R(380, 266, 14, 12, 'n500'); R(381, 267, 12, 2, 'n300'); R(379, 264, 16, 2, 'n600');
    if (!v.hoseOff) { const hose = () => { L(415, 256, 434, 258, 'grn8'); L(434, 258, 444, 250, 'grn8'); L(444, 250, 452, 236, 'grn8'); L(452, 236, 460, 196, 'grn8'); L(416, 257, 434, 259, 'grn'); }; hose(); g.anim(hose); }
    else if (v.boat) { L(415, 256, 300, 252, 'blu8'); L(300, 252, 230, 230, 'blu8'); }
    else { E(424, 270, 6, 3, 'grn8'); }
    // Fingerpost to the River Lea
    R(300, 234, 3, 44, 'ink'); R(290, 236, 30, 9, 'blu8'); for (let j = 0; j < 9; j++) R(320, 236 + j, 5 - Math.abs(j - 4), 1, 'blu8'); T('LEA', 298, 238, 'bg');
  },

  stonebridge(g, v) {
    const { R, px, D, E, C, L, T, rnd, bands, brick } = g;
    bands(0, ['sky1', 'sky2', 'sky3'], 46);
    const cloud = (x: number, y: number, s: number) => { E(x, y, 40 * s, 8 * s, 'bg'); E(x + 20 * s, y - 7 * s, 20 * s, 8 * s, 'bg'); D(x - 34 * s, y + 5 * s, 68 * s, 3, 'bg', 'sky3'); };
    cloud(470, 24, 1); cloud(620, 54, .7); cloud(90, 100, .6);
    for (let x = 0; x < 640; x++) { const t = Math.round(118 + 3 * Math.sin(x * .02)); R(x, t, 1, 160 - t, 'grn8'); if ((x + t) % 2 === 0) px(x, t, 'grn'); }
    R(250, 100, 1, 20, 'n600'); L(246, 120, 250, 100, 'n600'); L(254, 120, 250, 100, 'n600'); R(244, 104, 13, 1, 'n600');
    for (let x = 0; x < 640;) { const w = 6 + rnd() * 14, h = 8 + rnd() * 16; E(x + w / 2, 122 - h / 2, w / 2 + 2, h / 2, rnd() > .5 ? 'grn8' : 'leaf'); x += w; }
    brick(0, 150, 140, 50, 'stock', 'stock7', 'yel7'); R(0, 146, 140, 5, 'n500'); R(0, 146, 140, 1, 'n300');
    // The lock, thick with algae bloom
    R(10, 160, 120, 40, 'alg8'); D(10, 160, 120, 3, 'wat8', 'alg8');
    for (let i = 0; i < 46; i++) R(12 + rnd() * 110, 164 + rnd() * 34, 4 + rnd() * 8, 1 + (rnd() * 2 | 0), rnd() > .4 ? 'alg' : 'lime');
    g.shimmer(162, 198, 'alg8', ['alg'], 8);
    // Our boat waiting in the lock, cut off by the lock walls
    if (v.boat) { g.ctx.save(); g.ctx.beginPath(); g.ctx.rect(10, 100, 120, 100); g.ctx.clip(); narrowboat(g, -112, 150, 232, BOAT, false, false, v.painted); g.ctx.restore(); }
    for (let x = 92; x < 118; x++) { R(x, 140, 1, 60, 'wood9'); if ((x - 92) % 8 === 0) R(x, 140, 1, 60, 'ink'); }
    [150, 166, 182].forEach(y => R(92, y, 26, 2, 'wood7')); R(90, 134, 30, 2, 'ink'); for (let x = 90; x <= 120; x += 6) R(x, 134, 1, 8, 'ink');
    for (let t = 0; t < 6; t++) L(118, 140 + t, 196, 128 + t, 'bg'); for (let t = 0; t < 6; t++) L(182, 130 + t, 196, 128 + t, 'ink'); L(118, 146, 196, 134, 'n400');
    R(400, 62, 240, 8, 'n500'); for (let x = 400; x < 640; x += 4) R(x, 62, 2, 8, 'n400'); R(396, 70, 244, 2, 'n700');
    R(400, 72, 240, 156, 'blu'); for (let x = 400; x < 640; x += 5) R(x, 72, 1, 156, 'blu8'); for (let i = 0; i < 26; i++) R(400 + rnd() * 236, 72 + rnd() * 150, 2 + rnd() * 4, 1 + rnd() * 6, 'org');
    R(410, 78, 220, 22, 'ink'); R(412, 80, 216, 18, 'yel'); T('STONEBRIDGE BOATYARD', 442, 84, 'ink', 2);
    R(420, 112, 132, 116, 'ink'); for (let x = 420; x < 552; x += 6) R(x, 108, 6, 4, (x / 6) % 2 ? 'yel' : 'ink');
    R(430, 122, 112, 46, 'n900'); for (let i = 0; i < 40; i++) px(432 + rnd() * 108, 124 + rnd() * 42, 'n800');
    L(440, 130, 452, 150, 'n500'); L(441, 130, 453, 150, 'n500'); C(440, 129, 3, 'n500'); C(440, 129, 1, 'n900');
    R(462, 130, 4, 20, 'a600'); R(458, 128, 12, 5, 'n400'); R(476, 128, 22, 10, 'n400'); for (let x = 476; x < 498; x += 2) px(x, 138, 'n400'); R(498, 129, 4, 8, 'wood');
    R(508, 128, 2, 22, 'n500'); C(509, 152, 4, 'n500'); R(518, 130, 3, 18, 'yel7'); R(516, 128, 7, 4, 'n500'); R(528, 126, 8, 24, 'org'); R(530, 124, 4, 2, 'ink');
    R(430, 176, 112, 6, 'wood7'); R(430, 176, 112, 1, 'wood3'); R(434, 182, 4, 46, 'wood9'); R(534, 182, 4, 46, 'wood9');
    R(446, 164, 22, 12, 'n700'); R(450, 160, 14, 4, 'n600'); R(484, 168, 30, 8, 'a600'); R(486, 166, 26, 2, 'a400');
    if (!v.jarTaken) { R(520, 164, 9, 12, 'sky3'); R(519, 162, 11, 3, 'a600'); R(522, 167, 2, 6, 'bg'); }
    R(490, 112, 1, 18, 'ink'); E(490, 132, 7, 3, 'ink'); E(490, 135, 4, 1, 'yel');
    for (let i = 0; i < 18; i++) { const a = rnd() * Math.PI, r = 4 + rnd() * 10; px(468 + Math.cos(a) * r, 164 - Math.sin(a) * r, rnd() > .5 ? 'yel' : 'bg'); }
    // Bursts of welding sparks from the workshop
    g.anim(t => { if (t % 4.5 < 1.6) { const f = Math.floor(t * 12); R(467, 163, 3, 3, f % 2 ? 'bg' : 'yel'); for (let i = 0; i < 10; i++) { const a = ((i * 73 + f * 31) % 100) / 100 * Math.PI, r = 3 + ((i * 17 + f * 7) % 9); px(468 + Math.cos(a) * r, 164 - Math.sin(a) * r + (r > 8 ? (r - 8) * 2 : 0), i % 3 ? 'yel' : 'bg'); } } });
    R(572, 120, 52, 34, 'ink'); R(574, 122, 48, 30, 'yel'); R(597, 122, 2, 30, 'ink'); R(574, 136, 48, 2, 'ink');
    ([[566, 'a600'], [590, 'blu8'], [614, 'grn8']] as [number, string][]).forEach(([x, c]) => { R(x, 196, 20, 30, c); R(x, 196, 20, 2, 'ink'); R(x, 206, 20, 1, 'ink'); R(x, 216, 20, 1, 'ink'); R(x + 3, 198, 6, 1, 'n300'); });
    R(0, 200, 640, 88, 'n300'); D(0, 200, 640, 3, 'n500', 'n300');
    for (let i = 0; i < 160; i++) px(rnd() * 640, 204 + rnd() * 84, rnd() > .5 ? 'n400' : 'n200');
    for (let k = 0; k < 12; k++) { let x = rnd() * 640, y = 206 + rnd() * 80; for (let s = 0; s < 16; s++) { px(x, y, 'n500'); x += 1; y += Math.round((rnd() - .5) * 2); } }
    E(320, 276, 40, 5, 'sky2'); E(320, 276, 34, 3, 'sky1'); R(302, 275, 20, 1, 'yel');
    [146, 384].forEach(x => { R(x, 72, 8, 156, 'yel'); for (let y = 72; y < 228; y += 10) L(x, y, x + 7, y + 7, 'yel7'); R(x - 4, 224, 16, 6, 'ink'); });
    R(140, 64, 256, 10, 'yel'); for (let x = 140; x < 392; x += 10) { L(x, 73, x + 6, 65, 'ink'); L(x + 1, 73, x + 7, 65, 'ink'); } R(140, 74, 256, 2, 'yel7');
    R(286, 76, 22, 10, 'ink'); R(288, 78, 18, 6, 'a600');
    for (let y = 86; y < 150; y += 3) { R(296, y, 2, 2, 'n600'); px(297, y + 2, 'n400'); }
    R(292, 150, 10, 4, 'a600'); L(297, 154, 297, 160, 'ink'); L(297, 160, 302, 164, 'ink'); L(302, 164, 302, 158, 'ink');
    L(297, 164, 230, 152, 'n700'); L(297, 164, 340, 152, 'n700');
    R(190, 156, 150, 30, 'teal7'); R(190, 156, 150, 2, 'teal'); R(186, 152, 158, 4, 'n800');
    for (let i = 0; i < 4; i++) { R(204 + i * 32, 164, 16, 12, 'ink'); R(205 + i * 32, 165, 14, 10, i === 2 ? 'n600' : 'sky2'); }
    for (let i = 0; i < 14; i++) R(190 + rnd() * 150, 158 + rnd() * 26, 2 + rnd() * 5, 1 + rnd() * 3, 'wood7');
    R(318, 136, 6, 16, 'ink');
    for (let j = 0; j < 30; j++) { const inset = Math.floor(j * j / 60); for (let x = 168 + inset; x < 360 - inset * 1.5; x++) { let c; if (x < 262) c = j < 3 ? 'bg' : 'ink'; else { const n = Math.sin(x * .07 + j * .2) * .8 + rnd() * 1.4; c = j < 3 ? 'n100' : n > 1.5 ? 'a700' : n > .7 ? 'wood7' : n > .1 ? 'org' : 'wood9'; } px(x, 186 + j, c); } }
    for (let j = 0; j < 20; j++) R(150 + j * .8, 186 + j, 18 - j * .8, 1, 'ink');
    for (let x = 262; x < 266; x++) for (let y = 186; y < 216; y++) if (rnd() > .5) px(x, y, 'ink');
    T('TANGENT', 196, 194, 'bg');
    [184, 250, 322].forEach(x => { for (let k = 0; k < 4; k++) R(x - (k % 2) * 2, 216 + k * 3, 22, 3, k % 2 ? 'wood7' : 'wood'); R(x - 2, 228, 26, 2, 'wood9'); });
    R(150, 220, 220, 3, 'wood3'); R(150, 223, 220, 1, 'wood9'); R(156, 223, 3, 7, 'wood9'); R(362, 223, 3, 7, 'wood9');
    const tin = (x: number, c: string, lab: string) => { R(x, 234, 14, 16, 'ink'); R(x + 1, 238, 12, 8, c); R(x, 233, 14, 1, 'n500'); T(lab, x + 6, 240, 'ink'); };
    tin(200, 'yel', 'B'); tin(218, 'org', 'B'); tin(380, 'bg', 'P'); R(236, 244, 20, 3, 'wood9'); R(236, 240, 5, 4, 'n700');
    C(132, 248, 14, 'brass7'); for (let k = 0; k < 3; k++) { const a = k * 2.094 + .4; E(132 + Math.cos(a) * 9, 248 + Math.sin(a) * 9, 7, 5, 'brass'); } C(132, 248, 4, 'brass7'); C(132, 248, 2, 'ink');
    for (let k = 0; k < 5; k++) R(400, 250 - k * 5, 60, 4, k % 2 ? 'wood7' : 'wood');
    // Keith's sign
    R(20, 232, 76, 44, 'wood9'); R(22, 234, 72, 40, 'n900'); L(30, 274, 24, 284, 'wood9'); L(86, 274, 92, 284, 'wood9');
    T('KEITHS YARD', 26, 238, 'n100'); T('REPAIRS', 26, 245, 'n100'); T('BLACKING', 26, 252, 'yel'); T('NO', 26, 261, 'pink'); T('GONGOOZLERS', 26, 267, 'pink');
  },

  cheshunt(g, v) {
    const { R, px, D, E, C, L, T, rnd, bands } = g;
    bands(0, ['ink', 'n900', 'n800'], 50);
    for (let i = 0; i < 160; i++) px(rnd() * 640, rnd() * 124, rnd() > .85 ? 'n100' : rnd() > .5 ? 'n400' : 'n600');
    for (let dy = -30; dy <= 30; dy++) for (let dx = -30; dx <= 30; dx++) { const d = dx * dx + dy * dy; if (d > 300 && d < 900 && (dx + dy) % 2 === 0) px(470 + dx, 46 + dy, 'n700'); }
    C(470, 46, 14, 'n100'); C(474, 42, 3, 'n200'); C(464, 51, 2, 'n200'); C(476, 53, 1, 'n300');
    for (let x = 0; x < 640; x++) { const t = Math.round(130 + 6 * Math.sin(x * .07) + 4 * Math.sin(x * .23) + 3 * Math.sin(x * .6)); R(x, t, 1, 152 - t, 'ink'); }
    const pylon = (x: number, top: number, bot: number) => {
      const h = bot - top - 18;
      for (let o = 0; o < 2; o++) { L(x - 16 + o, bot, x - 4 + o, top + 18, 'ink'); L(x + 16 - o, bot, x + 4 - o, top + 18, 'ink'); }
      for (let y = top + 18; y < bot - 2; y += 12) { const w1 = 4 + 12 * (y - top - 18) / h, w2 = 4 + 12 * Math.min(1, (y + 12 - top - 18) / h); R(x - w1, y, 2 * w1, 1, 'ink'); L(x - w1, y, x + w2, Math.min(bot, y + 12), 'ink'); L(x + w1, y, x - w2, Math.min(bot, y + 12), 'ink'); }
      L(x - 4, top + 18, x, top, 'ink'); L(x + 4, top + 18, x, top, 'ink'); R(x - 20, top + 12, 40, 3, 'ink'); R(x - 15, top + 24, 30, 3, 'ink');
      ([[-20, 15], [19, 15], [-15, 27], [14, 27]] as [number, number][]).forEach(([dx, dy]) => R(x + dx, top + dy, 1, 4, 'n500'));
    };
    pylon(150, 36, 152); pylon(400, 36, 152);
    const cable = (x1: number, y1: number, x2: number, y2: number, sag: number) => { for (let x = x1; x <= x2; x++) { if (x < 0 || x >= 640) continue; const t = (x - x1) / (x2 - x1); px(x, y1 + (y2 - y1) * t + sag * 4 * t * (1 - t), 'n500'); } };
    ([[-20, 55], [19, 55], [-15, 67], [14, 67]] as [number, number][]).forEach(([dx, y]) => { cable(150 + dx - 250, y, 150 + dx, y, 25); cable(150 + dx, y, 400 + dx, y, 25); cable(400 + dx, y, 650 + dx, y, 25); });
    R(0, 152, 640, 100, 'n900'); D(0, 152, 640, 8, 'ink', 'n900');
    for (let i = 0; i < 360; i++) px(rnd() * 640, 146 + rnd() * 14, 'n700');
    for (let i = 0; i < 90; i++) R(rnd() * 640, 160 + rnd() * 90, 3 + rnd() * 8, 1, 'n800');
    g.shimmer(162, 250, 'n900', ['n600', 'n700']);
    g.anim(t => { // twinkling stars, clear of the pylons and the moon
      let sd = 5; const r = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
      for (let i = 0; i < 26; i++) {
        const x = Math.floor(r() * 640), y = Math.floor(r() * 100), ph = r() * 6.28;
        if (Math.abs(x - 150) < 24 || Math.abs(x - 400) < 24 || (Math.abs(x - 470) < 34 && y < 82)) continue;
        const s = Math.sin(t * (1.5 + ph * .3) + ph);
        if (s > .6) { px(x, y, 'n100'); if (s > .95) { px(x - 1, y, 'n500'); px(x + 1, y, 'n500'); px(x, y - 1, 'n500'); px(x, y + 1, 'n500'); } }
      }
    });
    for (let y = 155; y < 250; y += 3) { if (rnd() < .3) continue; const w = 3 + (y - 155) * .14 + rnd() * 6; R(470 - w / 2 + (rnd() - .5) * 10, y, w, 1, y < 190 ? 'n200' : rnd() > .5 ? 'n400' : 'n600'); }
    const swanW = (x: number, y: number) => { D(x - 9, y + 4, 20, 3, 'n800', 'n900'); E(x, y, 9, 3, 'n300'); R(x - 7, y - 3, 9, 2, 'n200'); R(x + 6, y - 11, 2, 10, 'n300'); R(x + 6, y - 12, 5, 2, 'n300'); px(x + 11, y - 11, 'a600'); px(x + 8, y - 12, 'ink'); };
    g.anim(t => { swanW(330 + Math.round(Math.sin(t * 0.25) * 5), 206 + Math.round(Math.sin(t * 1.4) * .6)); if (v.swanGone) swanW(520 + Math.round(Math.sin(t * 0.25 + 1) * 5), 214 + Math.round(Math.sin(t * 1.4 + 2) * .6)); });
    if (v.boat) floatBoat(g, 70, 196, 220, true, false, v.painted, 2.2);
    R(0, 252, 640, 36, 'n900'); D(0, 252, 640, 3, 'ink', 'n900'); R(0, 264, 640, 16, 'n800');
    for (let i = 0; i < 260; i++) px(rnd() * 640, 264 + rnd() * 16, 'n700');
    for (let i = 0; i < 80; i++) R(rnd() * 640, 253 + rnd() * 9, 1, 3, 'n800');
    const reeds = (x0: number, x1: number) => { for (let i = 0; i < 24; i++) { const x = x0 + rnd() * (x1 - x0), h = 22 + rnd() * 32, tx = x + (rnd() - .5) * 8; L(x, 258, tx, 258 - h, 'ink'); if (rnd() > .45) R(tx - 1, 258 - h + 2, 3, 8, 'n800'); } };
    reeds(0, 56); reeds(318, 352); reeds(606, 640);
    R(430, 216, 4, 50, 'n800'); R(406, 220, 50, 9, 'n800'); R(456, 222, 3, 5, 'n800'); T('CHESHUNT', 414, 222, 'n300');
    // The swan's nest on the bank
    E(588, 262, 22, 6, 'wood9'); E(588, 260, 18, 4, 'wood7'); for (let i = 0; i < 20; i++) L(568 + rnd() * 40, 258 + rnd() * 8, 568 + rnd() * 40, 258 + rnd() * 8, 'wood');
    if (!v.eggTaken) { E(582, 257, 4, 3, 'n100'); E(594, 258, 3, 2, 'n200'); R(588, 256, 3, 2, 'n100'); }
    // Mushroom stems (the caps glow, drawn live)
    for (const [x, h] of MUSHROOMS) R(x, 262 - h, 2, h, 'n400');
  },

  limehouse(g, v) {
    const { R, px, D, E, L, T, rnd, bands } = g;
    bands(0, ['n400', 'n300', 'n200'], 52);
    const cloud = (x: number, y: number) => { E(x, y, 50, 9, 'n200'); E(x + 20, y - 6, 26, 8, 'n200'); D(x - 44, y + 5, 88, 4, 'n200', 'n400'); };
    cloud(90, 30); cloud(300, 18); cloud(600, 40); cloud(220, 76);
    const tower = (x: number, w: number, top: number, c: string, cw: string) => { R(x, top, w, 156 - top, c); for (let i = x + 3; i < x + w - 1; i += 4) R(i, top + 2, 1, 154 - top, cw); };
    tower(392, 20, 100, 'n400', 'n300'); tower(570, 30, 110, 'n400', 'n300'); tower(420, 24, 74, 'n500', 'n400'); tower(508, 28, 66, 'n500', 'n400'); tower(540, 22, 92, 'n500', 'n400');
    tower(470, 30, 44, 'n600', 'n500'); for (let j = 0; j < 14; j++) { const w = Math.round(j * 15 / 14); R(485 - w, 30 + j, 2 * w || 1, 1, 'n700'); } R(485, 26, 1, 4, 'n700'); px(485, 25, 'a500');
    for (let x = 0; x < 640;) { const w = 10 + rnd() * 24, t = 138 + rnd() * 10; if (x < 380 || x > 610) R(x, t, w, 156 - t, 'n400'); x += w; }
    R(0, 156, 640, 68, 'n500'); D(0, 156, 640, 3, 'n400', 'n500');
    for (let i = 0; i < 120; i++) R(rnd() * 640, 158 + rnd() * 36, 3 + rnd() * 7, 1, rnd() > .5 ? 'n400' : 'n600');
    R(314, 170, 6, 8, 'a600'); R(316, 165, 2, 5, 'ink'); R(313, 177, 8, 1, 'n600');
    const wall = (x: number, w: number) => { R(x, 150, w, 74, 'n400'); for (let y = 160, k = 0; y < 224; y += 10, k++) { R(x, y, w, 1, 'n500'); for (let i = x + (k % 2) * 10; i < x + w; i += 20) R(i, y - 9, 1, 9, 'n500'); } R(x - 2, 146, w + 4, 5, 'n300'); R(x - 2, 151, w + 4, 1, 'n600'); };
    wall(0, 190); wall(450, 190);
    const leaf = (x0: number, x1: number, dir: number) => {
      for (let x = x0; x < x1; x++) { const top = Math.round(150 + Math.abs((dir > 0 ? x - x0 : x1 - x)) * 0.06); R(x, top, 1, 226 - top, 'n800'); if ((x - x0) % 12 === 0) R(x, top, 1, 226 - top, 'n900'); }
      [170, 190, 210].forEach(y => R(x0, y, x1 - x0, 2, 'n700'));
      R(x0, 140, x1 - x0, 2, 'ink'); for (let x = x0; x <= x1; x += 10) R(x, 140, 1, 12, 'ink');
      R(dir > 0 ? x1 - 2 : x0, 150, 2, 76, 'ink');
    };
    if (v.gatesOpen) { leaf(190, 222, 1); leaf(418, 450, -1); } else { leaf(190, 298, 1); leaf(342, 450, -1); }
    R(148, 156, 14, 64, 'ink'); R(149, 157, 12, 62, 'n100'); for (let k = 0; k < 6; k++) { R(149, 160 + k * 10, 5, 1, 'ink'); T(String(6 - k), 156, 158 + k * 10, 'ink'); }
    R(0, 224, 640, 32, 'n500'); D(0, 224, 640, 3, 'n600', 'n500'); D(190, 227, 260, 4, 'n600', 'n500');
    for (let i = 0; i < 70; i++) R(rnd() * 640, 230 + rnd() * 24, 3 + rnd() * 8, 1, rnd() > .5 ? 'n400' : 'n600');
    g.shimmer(160, 254, 'n500', ['n300', 'n400']);
    if (v.boat) floatBoat(g, -10, 200, 200, false, false, v.painted, .6);
    R(0, 256, 640, 32, 'n300');
    for (let y = 258, k = 0; y < 288; y += 6, k++) for (let x = (k % 2) * 6 - 6; x < 640; x += 12) { R(x + 1, y + 1, 10, 4, 'n200'); R(x + 1, y + 4, 10, 1, 'n400'); }
    R(0, 256, 640, 2, 'n500'); R(0, 258, 640, 1, 'ink');
    R(422, 260, 24, 4, 'ink'); R(424, 264, 20, 14, 'ink'); R(426, 268, 16, 2, 'n600'); R(422, 277, 24, 4, 'ink');
    // Lock board and the radio to the gatekeeper's hut
    L(564, 284, 570, 246, 'ink'); L(632, 284, 626, 246, 'ink');
    R(556, 212, 84, 36, 'ink'); R(558, 214, 80, 32, 'n100'); T('LIMEHOUSE', 562, 218, 'ink'); T('LOCK - CALL', 562, 226, 'a700'); T('ON THE RADIO', 562, 236, 'ink');
    R(586, 186, 26, 24, 'ink'); R(588, 188, 22, 14, 'n800'); for (let y = 190; y < 200; y += 2) R(590, y, 12, 1, 'n600'); R(604, 191, 4, 4, 'a600'); R(605, 204, 3, 3, 'yel'); R(610, 172, 1, 14, 'ink');
    flock(g, [[120, 60, -7, 0], [134, 54, -7, 1], [360, 90, 5, 2]], 'ink');
  },

  cabin(g, v) {
    const { R, px, D, E, C, L, T, rnd } = g;
    R(0, 0, 640, 200, 'wood');
    for (let x = 0; x < 640; x += 10) { R(x, 0, 1, 200, 'wood7'); R(x + 1, 0, 1, 200, 'wood3'); }
    for (let i = 0; i < 220; i++) R(rnd() * 640, rnd() * 200, 1, 3 + rnd() * 8, 'wood7');
    for (let y = 0; y < 30; y++) { const c = y < 4 ? 'stock7' : y % 6 === 0 ? 'stock7' : 'stock'; R(0, y, 640, 1, c); }
    D(0, 26, 640, 4, 'stock', 'wood9'); R(0, 30, 640, 3, 'wood9');
    for (let x = 20; x < 640; x += 120) R(x, 0, 8, 30, 'wood9');
    R(0, 196, 640, 4, 'wood9');
    const win = (x: number, y: number, w: number, h: number, kind: number) => {
      R(x - 4, y - 4, w + 8, h + 8, 'brass7'); R(x - 3, y - 3, w + 6, h + 6, 'brass');
      R(x, y, w, h, 'sky2'); D(x, y, w, 6, 'sky1', 'sky2');
      if (kind === 0) { R(x, y + h - 22, w, 10, 'stock'); R(x + 6, y + h - 30, 18, 18, 'pur'); R(x + 10, y + h - 26, 8, 6, 'yel'); }
      if (kind === 1) { R(x, y + h - 26, w, 14, 'a700'); for (let i = 2; i < w; i += 8) R(x + i, y + h - 24, 4, 4, 'yel'); }
      if (kind === 2) { R(x, y + h - 24, w, 12, 'blu'); R(x + 8, y + h - 22, 10, 8, 'pink'); }
      R(x, y + h - 12, w, 12, 'wat'); for (let i = 0; i < 6; i++) R(x + rnd() * (w - 8), y + h - 10 + rnd() * 8, 6, 1, 'wat3');
      R(x + w / 2, y, 1, h, 'brass7');
      for (let j = 0; j < h + 10; j++) { const cw = Math.max(4, 12 - Math.abs(j - 8) * 0.25); for (let i = 0; i < cw; i++) { const c = ((i >> 1) + (j >> 1)) % 2 ? 'pink' : 'bg'; px(x - 8 + i, y - 6 + j, c); px(x + w + 8 - i, y - 6 + j, c); } }
      R(x - 12, y - 8, w + 24, 3, 'brass7');
    };
    win(176, 58, 56, 46, 0); win(330, 58, 56, 46, 1); win(560, 58, 56, 46, 2);
    for (let y = 88; y < 200; y += 8) for (let x = 20; x < 132; x += 8) { R(x, y, 7, 7, ((x + y) / 8) % 3 === 0 ? 'teal' : ((x + y) / 8) % 3 === 1 ? 'teal7' : 'bg'); }
    R(18, 86, 116, 2, 'wood9');
    R(62, 30, 12, 112, 'ink'); R(64, 30, 2, 112, 'n700'); R(60, 70, 16, 3, 'brass');
    R(40, 142, 56, 6, 'ink'); R(44, 148, 48, 54, 'ink'); R(46, 150, 3, 50, 'n800');
    R(52, 160, 32, 26, 'n900'); R(54, 162, 28, 22, 'a800');
    for (let i = 0; i < 40; i++) { const fx = 56 + rnd() * 24, fy = 184 - rnd() * 18; R(fx, fy, 2, 2 + rnd() * 4, rnd() > .5 ? 'org' : rnd() > .4 ? 'yel' : 'a500'); }
    R(54, 180, 28, 4, 'wood9'); R(56, 178, 6, 3, 'wood7'); R(70, 179, 8, 3, 'wood7');
    g.anim(t => { // the fire dances, and the embers glow
      const f = Math.floor(t * 10);
      for (let x = 54; x < 82; x += 2) {
        const n = Math.sin(x * 1.7 + f * .9) * .5 + Math.sin(x * .6 - f * 1.3) * .5, h = Math.round(12 + n * 6 + (x > 60 && x < 76 ? 4 : 0));
        for (let k = 0; k < h && 180 - k >= 162; k++) R(x, 180 - k, 2, 1, k < h * .35 ? 'yel' : k < h * .7 ? 'org' : 'a500');
        if ((x + f) % 3 === 0 && 178 - h - (f % 3) > 162) px(x + 1, 178 - h - (f % 3), 'yel');
      }
      R(54, 180, 28, 4, 'wood9'); R(56, 178, 6, 3, 'wood7'); R(70, 179, 8, 3, 'wood7'); px(58 + (f % 6) * 4, 181, 'org'); px(60 + ((f * 3) % 5) * 4, 182, 'yel');
    });
    R(52, 160, 32, 1, 'brass'); R(52, 185, 32, 1, 'brass'); R(44, 194, 48, 3, 'n800'); R(46, 202, 6, 4, 'ink'); R(84, 202, 6, 4, 'ink');
    R(36, 140, 64, 2, 'brass');
    E(80, 135, 9, 6, 'teal'); R(72, 136, 17, 4, 'teal'); R(87, 130, 6, 2, 'teal7'); R(76, 127, 8, 2, 'ink');
    g.anim(t => { for (let k = 0; k < 4; k++) { const p = (t * .5 + k / 4) % 1, z = p < .4 ? 1 : 2; if (p < .85) R(88 + Math.round(Math.sin(t * 2 + k * 1.7) * 1.5 + p * 4), 128 - p * 26, z, z, p < .5 ? 'n100' : 'n300'); } });
    R(100, 210, 30, 24, 'wood7'); for (let i = 0; i < 4; i++) E(108 + i * 5, 206 - (i % 2) * 4, 6, 3, i % 2 ? 'wood' : 'wood9');
    R(146, 118, 120, 4, 'wood9'); R(146, 82, 120, 3, 'wood9');
    const spines = ['a600', 'yel', 'teal7', 'pur', 'grn8', 'blu', 'org', 'pink', 'a800', 'blu8', 'yel7', 'teal'];
    let bx = 150; for (let i = 0; i < 16 && bx < 230; i++) { const w = 4 + (rnd() * 4 | 0), h = 22 + rnd() * 12; R(bx, 118 - h, w, h, spines[i % 12]); R(bx, 118 - h + 4, w, 1, 'brass'); bx += w + (i === 6 ? 6 : 0); }
    L(bx + 2, 117, bx + 12, 92, spines[3]); L(bx + 3, 117, bx + 13, 92, spines[3]);
    T('X+Y', 152, 94, 'bg');
    R(238, 104, 10, 14, 'org'); R(237, 102, 12, 3, 'a700'); for (let k = 0; k < 18; k++) { const vx = 243 + Math.sin(k * .7) * 8, vy = 104 + k * 3; R(vx, vy, 3, 2, k % 3 ? 'grn' : 'grn8'); }
    R(254, 108, 8, 10, 'sky3'); R(254, 106, 8, 2, 'brass7'); R(256, 110, 4, 6, 'yel');
    R(160, 70, 10, 12, 'bg'); R(176, 74, 8, 8, 'teal'); R(196, 72, 12, 10, 'yel'); R(222, 68, 14, 14, 'a600'); C(229, 75, 4, 'bg'); R(246, 72, 10, 10, 'grn8');
    const plate = (x: number, y: number, r: number, c: string) => { C(x, y, r, 'bg'); C(x, y, r - 2, c); C(x, y, r - 5, 'bg'); for (let a = 0; a < 6.28; a += .5) px(x + (r - 1) * Math.cos(a), y + (r - 1) * Math.sin(a), 'ink'); };
    plate(296, 54, 11, 'a500'); plate(300, 84, 9, 'teal'); plate(296, 110, 10, 'yel');
    // The brass chart plotter: the boat's graphing calculator (the design's route whiteboard)
    R(420, 44, 128, 92, 'brass7'); R(422, 46, 124, 88, 'brass'); R(428, 52, 112, 64, 'ink');
    if (v.charged) {
      R(430, 54, 108, 60, 'n900');
      for (let x = 430; x < 538; x += 9) R(x, 54, 1, 60, 'teal7'); for (let y = 54; y < 114; y += 10) R(430, y, 108, 1, 'teal7');
      if (v.plotted) for (let x = 430; x < 538; x++) px(x, 84 - 24 * Math.cos((x - 430) / 108 * 2 * Math.PI * 24 / 12.4 + Math.PI * 0.03), 'glow');
      else T('READY', 474, 81, 'glow');
      R(526, 122, 4, 4, 'grn');
    } else { D(430, 54, 108, 60, 'ink', 'n900'); R(526, 122, 4, 4, 'a800'); }
    T('PLOTTER', 440, 121, 'wood9'); C(434, 124, 3, 'n800'); C(514, 124, 3, 'n800');
    R(548, 140, 92, 4, 'wood9');
    const can = (x: number) => { R(x, 116, 24, 24, 'grn8'); R(x, 116, 24, 3, 'a600'); R(x, 136, 24, 4, 'a600'); R(x + 4, 110, 16, 6, 'grn8'); R(x + 6, 106, 12, 4, 'a600'); L(x + 24, 120, x + 32, 112, 'grn8'); L(x + 24, 121, x + 32, 113, 'grn8'); C(x + 12, 128, 6, 'yel'); C(x + 12, 128, 3, 'a500'); C(x + 6, 124, 2, 'pink'); C(x + 18, 132, 2, 'pink'); R(x + 1, 118, 22, 1, 'yel'); };
    can(556);
    R(596, 126, 14, 14, 'ink'); R(598, 128, 10, 10, 'brass'); R(612, 120, 10, 20, 'sky3'); R(612, 120, 10, 3, 'a600');
    R(440, 150, 200, 6, 'wood9'); R(440, 156, 200, 46, 'wood7'); for (let x = 470; x < 640; x += 42) { R(x, 160, 38, 38, 'wood'); R(x + 3, 163, 32, 32, 'wood3'); R(x + 30, 176, 3, 6, 'brass'); }
    R(444, 146, 50, 4, 'n400'); R(448, 144, 42, 3, 'n300'); R(476, 128, 3, 16, 'n400'); R(476, 128, 10, 3, 'n400');
    // Water tank plate under the sink
    R(443, 163, 26, 12, 'brass7'); R(444, 164, 24, 10, 'brass'); T('450L', 448, 167, 'wood9');
    ([[520, 'n700', 10], [540, 'a600', 12], [562, 'teal7', 9]] as [number, string, number][]).forEach(([x, c, r]) => { R(x + r - 1, 28, 2, 12, 'ink'); C(x + r, 40 + r, r, c); C(x + r - 2, 38 + r, r - 4, 'n600' === c ? c : 'bg'); C(x + r - 2, 38 + r, r - 5, c); });
    R(312, 34, 2, 14, 'brass7'); R(306, 48, 14, 4, 'brass'); R(308, 52, 10, 10, 'sky3'); R(311, 54, 4, 6, 'yel'); R(306, 62, 14, 3, 'brass');
    for (let dy = -16; dy <= 16; dy++) for (let dx = -16; dx <= 16; dx++) { const d = dx * dx + dy * dy; if (d < 256 && d > 60 && (dx + dy) % 2 === 0) px(313 + dx, 57 + dy, 'brass'); }
    R(0, 200, 640, 88, 'wood7');
    for (let y = 204; y < 288; y += 7) { R(0, y, 640, 1, 'wood9'); for (let x = ((y * 7) % 60); x < 640; x += 60) R(x, y - 6, 1, 6, 'wood9'); }
    for (let i = 0; i < 160; i++) R(rnd() * 640, 200 + rnd() * 88, 3 + rnd() * 6, 1, 'wood');
    const rug = ['a600', 'yel', 'teal7', 'pink', 'a600', 'grn8', 'org', 'blu8'];
    for (let k = 0; k < 8; k++) R(200, 252 + k * 4, 240, 4, rug[k]);
    for (let x = 200; x < 440; x += 6) { R(x + 1, 250, 2, 2, 'bg'); R(x + 1, 284, 2, 2, 'bg'); }
    for (let x = 204; x < 440; x += 12) for (let k = 0; k < 8; k++) px(x + (k % 2) * 6, 253 + k * 4, 'bg');
    R(136, 178, 104, 28, 'a600'); R(136, 178, 104, 3, 'a400'); R(136, 206, 104, 34, 'wood9'); for (let x = 140; x < 240; x += 24) { R(x, 182, 1, 22, 'a700'); }
    g.anim(t => { // the cat: breathing, tail swishing, now and then looking up
      const br = Math.sin(t * 1.4) > 0, look = (t % 13) > 10.4, tw = (t % 5.3) < .3, hy = look ? 167 : 172, hx = look ? 185 : 184;
      E(170, 176, 14, 6, 'ink'); if (br) R(160, 169, 20, 1, 'ink');
      for (let k = 0; k < 9; k++) R(157 - k, 179 + Math.round(Math.sin(k * .5 + t * 1.6) * k * .3) - (k > 6 ? 1 : 0), 2, 2, 'ink');
      C(hx, hy, 5, 'ink'); px(hx - 3, hy - 6, 'ink'); px(hx - 2, hy - 5, 'ink'); px(hx + (tw ? 4 : 3), hy - 6, 'ink'); px(hx + 2, hy - 5, 'ink');
      if (look) { px(hx - 2, hy, 'yel'); px(hx + 2, hy, 'yel'); px(hx, hy + 2, 'pink'); } else { R(hx - 2, hy, 2, 1, 'n500'); R(hx + 2, hy, 2, 1, 'n500'); }
    });
    R(250, 196, 150, 6, 'wood9'); R(254, 202, 6, 46, 'wood9'); R(390, 202, 6, 46, 'wood9');
    R(274, 188, 92, 9, 'stock'); R(274, 188, 92, 1, 'stock7'); L(278, 194, 312, 190, 'blu'); L(312, 190, 356, 192, 'blu'); C(330, 192, 2, 'a600');
    R(370, 186, 12, 10, 'bg'); R(382, 188, 3, 5, 'bg'); R(371, 187, 10, 3, 'wood9');
    R(262, 190, 4, 6, 'yel'); px(263, 189, 'org');
    // Battery bank under the table
    R(296, 222, 56, 26, 'ink'); R(298, 224, 52, 22, 'n800'); R(302, 218, 8, 4, 'a600'); R(338, 218, 8, 4, 'ink');
    T('12V', 304, 230, 'yel'); R(334, 230, 10, 5, 'n900'); R(335, 231, v.charged ? 8 : 2, 3, v.charged ? 'grn' : 'a600');
    // Stern hatch
    R(624, 36, 16, 164, 'wood9'); R(627, 40, 13, 156, 'n900'); R(629, 110, 3, 6, 'brass');
    for (let k = 0; k < 4; k++) R(604, 200 + k * 20, 36, 4, 'wood9');
  },
};

// Mushroom positions (x, stem height) at Cheshunt, shared with the glow effect.
export const MUSHROOMS: [number, number][] = [[232, 6], [238, 9], [245, 5], [251, 8], [258, 4], [264, 7], [272, 5], [280, 8]];

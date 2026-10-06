// Numbers behind the maths puzzles, kept in one place so the dialogue, the
// notebook and the checks can't drift apart.

export const CHARGE = { capacityWh: 1800, packW: 400, windowH: 5 }; // 1800 ÷ 400 = 4.5 h
export const LOCK = { cillM: 1.2, dropPerTicks: 0.1, ticks: 15, bpm: 60 }; // 0.1 m per 15 s → 1.2 m in 180 s
export const ARCH = { r: 2, halfWidth: 1, cabin: 1.76 }; // √(2² − 1²) = 1.73 m < 1.76 m
export const TAG = { code: '-74' }; // x² + 3x − 28 = 0 → x = −7, 4
export const TANK = { litres: 450, bucket: 10, ticks: 12, bpm: 60, mummyMins: 10 }; // 10 L / 12 s = 50 L/min → 9 min

export const PAINT = {
  tinMl: 2000,
  schoonerMl: 400,
  ingredients: [
    { id: 'stout', name: 'stout', color: [52, 30, 20] },
    { id: 'mushrooms', name: 'glowing mushrooms', color: [120, 240, 196] },
    { id: 'algae', name: 'algae water', color: [92, 140, 52] },
    { id: 'eggshell', name: 'crushed eggshell', color: [244, 240, 228] },
  ],
  // 4 : 3 : 2 : 1 of a 2 L tin is 800 : 600 : 400 : 200, but the mushrooms are double strength.
  target: { stout: 800, mushrooms: 300, algae: 400, eggshell: 200 } as Record<string, number>,
  supply: { stout: 1200, mushrooms: 600, algae: 800, eggshell: 400 } as Record<string, number>,
};

export function mixColor(tin: Record<string, number>): string | null {
  let tot = 0; const c = [0, 0, 0];
  for (const ing of PAINT.ingredients) {
    const ml = tin[ing.id] ?? 0;
    // mushrooms are double strength, so they count twice towards the colour
    const w = ml * (ing.id === 'mushrooms' ? 2 : 1);
    tot += w; ing.color.forEach((v, i) => c[i] += v * w);
  }
  if (!tot) return null;
  return `rgb(${c.map(v => Math.round(v / tot)).join(',')})`;
}

// Limehouse tides. Lows at 23:54 (last night) and 12:18; highs fall halfway between.
export const TIDE = { low1: -6, low2: 12 * 60 + 18, lowM: 0.8, highM: 6.6, sunrise: 7 * 60 + 12, sunset: 18 * 60 + 31, answer: '18:30' };

export const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;

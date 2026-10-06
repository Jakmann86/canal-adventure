import type { GameState, SceneId } from './types';

const KEY = 'regents-canal-problem/save/v1';

export function newState(scene: SceneId): GameState {
  return { scene, x: 106, flip: false, inv: ['windlass', 'notebook'], f: {}, n: {}, facts: [], boatAt: 'littlevenice', tin: {} };
}

export function save(s: GameState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private mode: play on without saving */ }
}

export function load(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as GameState;
    return s && s.scene && Array.isArray(s.inv) ? s : null;
  } catch { return null; }
}

export function clearSave() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

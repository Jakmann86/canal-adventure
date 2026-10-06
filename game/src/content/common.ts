import type { Script } from '../engine/script';
import type { GameState, Hotspot, Rect, Response, SceneId } from '../engine/types';

/** Hotspots that only exist while `cond` holds. */
export const when = (cond: unknown, ...hs: Hotspot[]): Hotspot[] => cond ? hs : [];

export const exit = (id: string, name: string, rect: Rect, to: SceneId, caption?: string, walkTo?: number): Hotspot =>
  ({ id, name, rect, isExit: true, walkTo, walk: s => s.go(to, caption) });

/** The Hypotenuse, wherever she's moored. */
export function boat(s: GameState, rect: Rect, use: Response, more: Partial<Hotspot> = {}): Hotspot {
  return {
    id: 'boat', name: 'the Hypotenuse', rect,
    look: s.f.painted
      ? 'The Hypotenuse, in fresh Gunnel Green. She’s never looked better.'
      : 'The Hypotenuse. Dot’s boat, and now mine. She needs paint, and an engine that doesn’t sound like a cutlery drawer falling downstairs.',
    ...more,
    verbs: {
      Open: async sc => { if (!sc.has('key')) return sc.me('It’s locked. Barnaby said he had the key.'); await sc.go('cabin'); },
      Close: 'She’s shut.',
      'Talk to': 'I pat the cabin side. “Good girl.” I’m turning into Barnaby.',
      Push: 'Twenty tonnes of narrowboat doesn’t notice.',
      'Pick up': 'Ha.',
      Use: use,
      ...more.verbs,
    },
  };
}

export type Option = [label: string, run: () => Promise<unknown> | unknown];

/** Run a dialogue menu until an option returns `true` (meaning "end the conversation"). */
export async function talk(s: Script, menu: () => (Option | false)[]) {
  for (;;) {
    const opts = menu().filter((o): o is Option => !!o);
    const i = await s.choose(opts.map(o => o[0]));
    await s.me(opts[i][0]);
    if (await opts[i][1]() === true) return;
  }
}

// The API that content scripts use: talk, walk, items, flags and puzzles.
import type { Game } from './game';
import type { AskOpts } from './panels';
import type { SceneId } from './types';

export class Script {
  constructor(private g: Game) {}

  get s() { return this.g.state; }

  /** One or more lines from a speaker, shown one after another. */
  async say(who: string, ...lines: string[]) { for (const l of lines) await this.g.say(who, l); }
  /** The player speaks. */
  me(...lines: string[]) { return this.say('player', ...lines); }

  walk(x: number) { return this.g.walkTo(x, true); }
  face(left: boolean) { this.g.player.flip = left; }
  wait(ms: number) { return new Promise<void>(r => setTimeout(r, ms)); }

  has(id: string) { return this.s.inv.includes(id); }
  give(id: string) { if (!this.has(id)) { this.s.inv.push(id); this.g.inventoryChanged(id); } }
  take(id: string) { const i = this.s.inv.indexOf(id); if (i >= 0) { this.s.inv.splice(i, 1); this.g.inventoryChanged(); } }
  swap(from: string, to: string) {
    const i = this.s.inv.indexOf(from);
    if (i >= 0) { this.s.inv[i] = to; this.g.inventoryChanged(to); } else this.give(to);
  }

  is(flag: string) { return !!this.s.f[flag]; }
  set(flag: string, v = true) { this.s.f[flag] = v; }
  num(k: string) { return this.s.n[k] ?? 0; }
  setNum(k: string, v: number) { this.s.n[k] = v; }

  /** Write a fact into the notebook. */
  note(...ids: string[]) { for (const id of ids) if (!this.s.facts.includes(id)) { this.s.facts.push(id); this.g.toast('Noted in your notebook'); } }
  knows(id: string) { return this.s.facts.includes(id); }

  ask(q: string, opts: AskOpts = {}) { return this.g.panels.ask(q, opts); }
  choose(options: string[]) { return this.g.choose(options); }

  /** Change scene with a fade. */
  go(to: SceneId, caption?: string) { return this.g.goTo(to, caption); }
  /** Move the boat (and the player with it). */
  async cruise(to: SceneId, caption: string) { this.s.boatAt = to; await this.g.goTo(to, caption, true); }
  /** Fade to black and back while something happens off-screen. */
  blackout(caption: string, during?: () => void) { return this.g.blackout(caption, during); }

  padlock() { return this.g.panels.padlock(); }
  plotter() { return this.g.panels.plotter(); }
  mixer() { return this.g.panels.mixer(); }
  notebook() { return this.g.panels.notebook(); }
  ending() { return this.g.ending(); }
}

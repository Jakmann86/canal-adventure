// The engine: one 640×400 LucasArts-style screen (a 640×288 scene, the sentence
// line, nine verbs and the inventory), laid out at 2× like the design.
import { kit, type DrawOpts, type Kit } from '../art/kit';
import { scenes as ART } from '../art/scenes';
import { icons } from '../art/icons';
import { teen } from '../art/sprites';
import { Panels } from './panels';
import { Script } from './script';
import { load, newState, save, clearSave } from './state';
import { VERBS, type Actor, type GameState, type Hotspot, type ItemDef, type Response, type SceneDef, type SceneId, type Speaker, type Verb } from './types';

export interface Content {
  scenes: Record<SceneId, SceneDef>;
  items: Record<string, ItemDef>;
  speakers: Record<string, Speaker>;
  facts: Record<string, string>;
  start: SceneId;
  intro?: (s: Script) => Promise<void>;
}

const W = 640, H = 288, SPEED = 72;
const DEFAULTS: Record<Verb, string> = {
  'Give': 'I’d rather hang on to it.',
  'Open': 'It doesn’t seem to open.',
  'Close': 'It doesn’t close.',
  'Pick up': 'I can’t pick that up.',
  'Look at': 'Nothing special about it.',
  'Talk to': 'I don’t think it wants to chat.',
  'Use': 'I can’t see how to use that.',
  'Push': 'It won’t budge.',
  'Pull': 'Pulling it does nothing useful.',
};
const NOPE = ['That doesn’t work.', 'I don’t think those go together.', 'No. Just no.', 'Nice idea. Doesn’t work.'];

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, parent?: HTMLElement) => {
  const e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e;
};

type Hover = { kind: 'hot'; h: Hotspot } | { kind: 'item'; id: string } | null;

export class Game {
  state: GameState = newState('littlevenice');
  script = new Script(this);
  panels: Panels;
  opts: DrawOpts & { hotspots: boolean } = { dither: true, hotspots: false };

  player = { x: 320, target: 320, flip: false, walkT: 0, resolve: null as null | ((ok: boolean) => void) };
  verb: Verb | null = null;
  obj: string | null = null;
  hover: Hover = null;
  busy = 0;
  private speech: { who: string; text: string; until: number; done: () => void } | null = null;
  private dialogue: ((i: number) => void) | null = null;
  private invPage = 0;
  private t = 0;
  private bgKey = '';
  private titleOn = true;
  private actionToken = 0;

  // DOM
  root!: HTMLElement;
  stage!: HTMLElement;
  sceneEl!: HTMLElement;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private bg = document.createElement('canvas');
  private bgKit: Kit | null = null;
  private speechEl!: HTMLElement;
  private sentenceEl!: HTMLElement;
  private verbBox!: HTMLElement;
  private invBox!: HTMLElement;
  private dlgBox!: HTMLElement;
  private bottom!: HTMLElement;
  private hotLayer!: HTMLElement;
  private toastEl!: HTMLElement;
  private fadeEl!: HTMLElement;
  private titleEl!: HTMLElement;
  private menuEl!: HTMLElement;
  private sentenceText = '';

  constructor(public content: Content) {
    this.panels = new Panels(this);
  }

  get scene() { return this.content.scenes[this.state.scene]; }

  // ───────────────────────────── setup

  mount(host: HTMLElement) {
    this.root = el('div', 'viewport', host);
    this.stage = el('div', 'stage', this.root);
    this.sceneEl = el('div', 'scene', this.stage);
    this.canvas = el('canvas', 'scene-canvas', this.sceneEl);
    this.canvas.width = W; this.canvas.height = H;
    this.ctx = this.canvas.getContext('2d')!; this.ctx.imageSmoothingEnabled = false;
    this.bg.width = W; this.bg.height = H;
    this.hotLayer = el('div', 'hot-layer', this.sceneEl);
    this.speechEl = el('div', 'speech', this.sceneEl);
    this.toastEl = el('div', 'toast', this.sceneEl);
    this.panels.mount(this.sceneEl);
    this.fadeEl = el('div', 'fade', this.sceneEl);
    this.titleEl = el('div', 'title', this.sceneEl);
    this.menuEl = el('div', 'menu hidden', this.sceneEl);

    this.sentenceEl = el('div', 'sentence', this.stage);
    this.bottom = el('div', 'bottom', this.stage);
    this.verbBox = el('div', 'verbs', this.bottom);
    this.invBox = el('div', 'inventory', this.bottom);
    this.dlgBox = el('div', 'dialogue hidden', this.stage);

    VERBS.forEach(v => {
      const b = el('button', 'verb', this.verbBox); b.textContent = v; b.dataset.verb = v;
      b.onclick = () => { if (this.busy || this.titleOn) return; this.verb = this.verb === v ? null : v; this.obj = null; this.renderVerbs(); };
    });

    this.canvas.addEventListener('mousemove', e => this.onMove(e));
    this.canvas.addEventListener('mouseleave', () => { if (this.hover?.kind === 'hot') this.hover = null; });
    this.canvas.addEventListener('click', e => this.onSceneClick(e, false));
    this.canvas.addEventListener('contextmenu', e => { e.preventDefault(); this.onSceneClick(e, true); });
    this.speechEl.addEventListener('click', () => this.skipSpeech());
    this.sceneEl.addEventListener('click', e => { if (e.target === this.sceneEl) this.skipSpeech(); });
    window.addEventListener('keydown', e => this.onKey(e));
    window.addEventListener('resize', () => this.fit());
    this.fit();
    this.showTitle();
    requestAnimationFrame(t => this.frame(t));
  }

  private fit() {
    const sw = 1284, sh = 806;
    const s = Math.min(window.innerWidth / sw, window.innerHeight / sh);
    this.stage.style.transform = `scale(${s})`;
    this.root.style.width = sw * s + 'px'; this.root.style.height = sh * s + 'px';
  }

  private showTitle() {
    this.titleOn = true;
    this.state = newState(this.content.start);
    this.player.x = this.player.target = 106;
    this.titleEl.classList.remove('hidden');
    this.bottom.classList.add('dim');
    const saved = load();
    this.titleEl.innerHTML = `
      <div class="title-card">
        <div class="title-kicker">A canal-boat maths adventure</div>
        <h1>The Regent’s Canal Problem</h1>
        <p>Your great-aunt Dot has left you a narrowboat at Little Venice, and a letter: get her to the Thames on the next spring tide.</p>
        <div class="title-menu"></div>
        <div class="title-help">Pick a verb, then click something. Right-click looks. Esc for the menu.</div>
      </div>`;
    const menu = this.titleEl.querySelector('.title-menu') as HTMLElement;
    const btn = (label: string, fn: () => void) => { const b = el('button', 'menu-btn', menu); b.textContent = label; b.onclick = fn; };
    if (saved) btn('Continue', () => this.begin(saved));
    btn('New game', () => { clearSave(); this.begin(null); });
  }

  private async begin(saved: GameState | null) {
    this.titleOn = false;
    this.titleEl.classList.add('hidden');
    this.bottom.classList.remove('dim');
    this.state = saved ?? newState(this.content.start);
    this.player.x = this.player.target = this.state.x; this.player.flip = this.state.flip;
    this.verb = null; this.obj = null; this.invPage = 0;
    this.renderVerbs(); this.renderInventory();
    if (!saved && this.content.intro) await this.run(this.content.intro);
    else await this.run(async () => { await this.scene.enter?.(this.script); });
  }

  // ───────────────────────────── loop & rendering

  private frame(ts: number) {
    const dt = Math.min(50, ts - this.t || 16); this.t = ts;
    this.updatePlayer(dt);
    this.render();
    this.updateSentence();
    this.positionSpeech();
    if (this.speech && performance.now() > this.speech.until) this.skipSpeech();
    requestAnimationFrame(t => this.frame(t));
  }

  private updatePlayer(dt: number) {
    const p = this.player;
    const d = p.target - p.x;
    if (Math.abs(d) < 0.5) {
      if (p.walkT) { p.walkT = 0; p.x = p.target; this.state.x = p.x; const r = p.resolve; p.resolve = null; r?.(true); }
      return;
    }
    p.flip = d < 0;
    p.walkT += dt;
    p.x += Math.sign(d) * Math.min(Math.abs(d), SPEED * dt / 1000);
  }

  private render() {
    const sc = this.scene, s = this.state;
    const vis = sc.vis?.(s) ?? {};
    const key = sc.art + JSON.stringify(vis) + this.opts.dither;
    if (key !== this.bgKey) {
      this.bgKey = key;
      const b = this.bg.getContext('2d')!; b.imageSmoothingEnabled = false;
      b.clearRect(0, 0, W, H);
      this.bgKit = kit(b, this.opts);
      ART[sc.art](this.bgKit, vis);
      this.renderHotspotOutlines();
    }
    const c = this.ctx;
    c.clearRect(0, 0, W, H);
    c.drawImage(this.bg, 0, 0);
    // The scene's living layers: water glints, bobbing boats, smoke, birds
    if (this.bgKit?.anims.length) { this.bgKit.setCtx(c); this.bgKit.anims.forEach(f => f(this.t / 1000)); }
    const g = kit(c, this.opts);
    sc.fx?.(g, s, this.t);
    const now = this.t;
    const list: { b: number; draw: () => void }[] = [];
    for (const a of this.actors()) {
      const talking = this.speech?.who === a.id;
      list.push({ b: a.b, draw: () => this.drawActor(g, a, { ...a.pose, talk: talking, t: now, ph: a.x * 0.091 }) });
    }
    const p = this.player, frame = p.walkT > 0 ? ((p.walkT / 140 | 0) % 2) + 1 : 0;
    list.push({ b: sc.baseline + 0.5, draw: () => this.drawActor(g, { id: 'player', sprite: teen, x: p.x, b: sc.baseline, flip: p.flip, w: 12 }, { walk: frame, talk: this.speech?.who === 'player', t: now }) });
    list.sort((a, b) => a.b - b.b).forEach(d => d.draw());
    sc.fg?.(g, s, this.t);
  }

  private drawActor(g: ReturnType<typeof kit>, a: Actor, pose: object) {
    const half = a.w ?? 14;
    g.sprite(a.sprite, a.flip ? a.x + half : a.x - half, a.b, !!a.flip, pose);
  }

  private actors() { return this.scene.actors?.(this.state) ?? []; }
  hotspots() { return this.scene.hotspots(this.state); }

  private renderHotspotOutlines() {
    this.hotLayer.innerHTML = '';
    if (!this.opts.hotspots) return;
    for (const h of this.hotspots()) {
      const d = el('div', 'hot-outline', this.hotLayer);
      Object.assign(d.style, { left: h.rect[0] * 2 + 'px', top: h.rect[1] * 2 + 'px', width: h.rect[2] * 2 + 'px', height: h.rect[3] * 2 + 'px' });
    }
  }

  // ───────────────────────────── sentence line

  private name(id: string) { return this.content.items[id]?.name ?? id; }

  private updateSentence() {
    let txt = '', hov = '';
    if (!this.titleOn && !this.dialogue && !this.busy) {
      const target = this.hover?.kind === 'hot' ? this.hover.h.name : this.hover?.kind === 'item' ? this.name(this.hover.id) : '';
      const isExit = this.hover?.kind === 'hot' && this.hover.h.isExit;
      if (this.obj) txt = `${this.verb} ${this.name(this.obj)} ${this.verb === 'Give' ? 'to' : 'with'}`;
      else txt = this.verb ?? (isExit ? 'Go to' : 'Walk to');
      hov = target;
    }
    const key = txt + '|' + hov;
    if (key === this.sentenceText) return;
    this.sentenceText = key;
    this.sentenceEl.innerHTML = '';
    el('span', '', this.sentenceEl).textContent = txt;
    el('span', 'sentence-obj', this.sentenceEl).textContent = hov;
    this.canvas.style.cursor = this.busy ? 'wait' : (this.hover?.kind === 'hot' && this.hover.h.isExit ? 'e-resize' : 'crosshair');
  }

  renderVerbs() {
    this.verbBox.querySelectorAll<HTMLButtonElement>('.verb').forEach(b => b.classList.toggle('on', b.dataset.verb === this.verb));
  }

  inventoryChanged(gained?: string) {
    if (gained) {
      const idx = this.state.inv.indexOf(gained);
      if (idx >= 0) this.invPage = Math.floor(idx / 8);
      this.toast(`You got: ${this.name(gained)}`);
    }
    const pages = Math.max(1, Math.ceil(this.state.inv.length / 8));
    this.invPage = Math.min(this.invPage, pages - 1);
    this.renderInventory();
  }

  renderInventory() {
    this.invBox.innerHTML = '';
    const grid = el('div', 'inv-grid', this.invBox);
    const items = this.state.inv.slice(this.invPage * 8, this.invPage * 8 + 8);
    for (let i = 0; i < 8; i++) {
      const slot = el('div', 'slot', grid);
      const id = items[i]; if (!id) continue;
      slot.classList.add('full');
      const cv = el('canvas', 'icon', slot); cv.width = 36; cv.height = 26;
      const c = cv.getContext('2d')!; c.imageSmoothingEnabled = false;
      icons[this.content.items[id]?.icon ?? id]?.(kit(c, this.opts));
      slot.onmouseenter = () => { this.hover = { kind: 'item', id }; };
      slot.onmouseleave = () => { if (this.hover?.kind === 'item') this.hover = null; };
      slot.onclick = () => this.onItemClick(id, false);
      slot.oncontextmenu = e => { e.preventDefault(); this.onItemClick(id, true); };
    }
    const nav = el('div', 'inv-nav', this.invBox);
    const pages = Math.ceil(this.state.inv.length / 8);
    const up = el('button', 'inv-arrow', nav); up.textContent = '▲'; up.disabled = this.invPage === 0;
    const dn = el('button', 'inv-arrow', nav); dn.textContent = '▼'; dn.disabled = this.invPage >= pages - 1;
    up.onclick = () => { this.invPage = Math.max(0, this.invPage - 1); this.renderInventory(); };
    dn.onclick = () => { this.invPage = Math.min(pages - 1, this.invPage + 1); this.renderInventory(); };
  }

  toast(msg: string) {
    const t = el('div', 'toast-msg', this.toastEl); t.textContent = msg;
    setTimeout(() => t.classList.add('out'), 1800);
    setTimeout(() => t.remove(), 2400);
  }

  // ───────────────────────────── input

  private toLogical(e: MouseEvent): [number, number] {
    const r = this.canvas.getBoundingClientRect();
    return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height];
  }

  private hitTest(x: number, y: number) {
    const hs = this.hotspots();
    for (let i = hs.length - 1; i >= 0; i--) {
      const [rx, ry, rw, rh] = hs[i].rect;
      if (x >= rx && x < rx + rw && y >= ry && y < ry + rh) return hs[i];
    }
    return null;
  }

  private onMove(e: MouseEvent) {
    if (this.titleOn) return;
    const [x, y] = this.toLogical(e);
    const h = this.hitTest(x, y);
    this.hover = h ? { kind: 'hot', h } : null;
  }

  private onKey(e: KeyboardEvent) {
    if (this.panels.open) { this.panels.key(e); return; }
    if (e.key === 'Escape') { if (!this.titleOn) this.toggleMenu(); return; }
    if (e.key === ' ' || e.key === '.') { this.skipSpeech(); e.preventDefault(); return; }
    if (this.dialogue && /^[1-9]$/.test(e.key)) { const b = this.dlgBox.querySelectorAll('button')[+e.key - 1] as HTMLButtonElement | undefined; b?.click(); }
  }

  private onSceneClick(e: MouseEvent, right: boolean) {
    if (this.titleOn || this.panels.open) return;
    if (this.speech) { this.skipSpeech(); return; }
    if (this.busy || this.dialogue) return;
    const [x, y] = this.toLogical(e);
    const h = this.hitTest(x, y);
    if (right) { if (h) this.interact(h, 'Look at', null); return; }
    if (!h) { this.verb = this.obj ? this.verb : null; this.obj = null; this.renderVerbs(); this.walkTo(x, false); return; }
    this.interact(h, this.verb, this.obj);
    this.verb = null; this.obj = null; this.renderVerbs();
  }

  private onItemClick(id: string, right: boolean) {
    if (this.titleOn || this.busy || this.dialogue || this.panels.open) return;
    const item = this.content.items[id];
    const v = right ? 'Look at' : this.verb ?? 'Look at';
    if (!right && this.obj) {
      const a = this.obj; this.verb = null; this.obj = null; this.renderVerbs();
      if (a === id) return;
      if (v === 'Give') { this.run(s => s.me('I can’t give things to myself.')); return; }
      const r = this.content.items[a]?.use?.[id] ?? item.use?.[a];
      this.run(s => this.respond(s, r, NOPE[(a.length + id.length) % NOPE.length]));
      return;
    }
    if (!right && (v === 'Use' || v === 'Give') && !(v === 'Use' && item.verbs?.Use)) {
      this.obj = id; return;
    }
    this.verb = null; this.renderVerbs();
    const r = v === 'Look at' ? item.verbs?.['Look at'] ?? item.look : item.verbs?.[v];
    this.run(s => this.respond(s, r, v === 'Pick up' ? 'I’ve already got it.' : DEFAULTS[v]));
  }

  private async interact(h: Hotspot, verb: Verb | null, obj: string | null) {
    const token = ++this.actionToken;
    const [rx, , rw] = h.rect;
    const [min, max] = this.scene.walk(this.state);
    const walkX = h.walkTo === null ? null : h.walkTo ?? Math.max(min, Math.min(max, rx + rw / 2));
    if (walkX !== null) {
      const ok = await this.walkTo(walkX, false);
      if (!ok || token !== this.actionToken) return;
    }
    const cx = rx + rw / 2;
    if (Math.abs(cx - this.player.x) > 4) this.player.flip = cx < this.player.x;
    let r: Response | undefined, fallback: string;
    if (!verb) { r = h.walk; fallback = ''; }
    else if (obj) {
      r = verb === 'Give' ? h.give?.[obj] : h.use?.[obj] ?? this.content.items[obj]?.use?.[h.id];
      fallback = verb === 'Give' ? `I don’t think the ${h.name} wants that.` : NOPE[(obj.length + h.id.length) % NOPE.length];
    } else if (verb === 'Give') { r = undefined; fallback = 'Give what? I should pick something from my pockets first.'; }
    else { r = verb === 'Look at' ? h.verbs?.['Look at'] ?? h.look : h.verbs?.[verb]; fallback = DEFAULTS[verb]; }
    if (!r && !fallback) return;
    await this.run(s => this.respond(s, r, fallback));
  }

  private async respond(s: Script, r: Response | undefined, fallback: string) {
    if (typeof r === 'string') await s.me(r);
    else if (r) await r(s);
    else if (fallback) await s.me(fallback);
  }

  /** Run a script with input locked. */
  async run(fn: (s: Script) => Promise<void> | void) {
    this.busy++;
    this.hover = null;
    try { await fn(this.script); }
    catch (err) { console.error(err); }
    finally {
      this.busy--;
      if (!this.busy) { this.state.x = this.player.x; this.state.flip = this.player.flip; save(this.state); this.renderHotspotOutlines(); }
    }
  }

  // ───────────────────────────── walking, talking, choosing

  walkTo(x: number, scripted: boolean): Promise<boolean> {
    const [min, max] = this.scene.walk(this.state);
    const p = this.player;
    if (!scripted) x = Math.max(min, Math.min(max, x));
    p.resolve?.(false);
    p.target = x;
    if (Math.abs(x - p.x) < 0.5) { p.resolve = null; return Promise.resolve(true); }
    return new Promise(res => { p.resolve = res; });
  }

  say(who: string, text: string): Promise<void> {
    return new Promise(done => {
      const ms = Math.max(1700, 1000 + text.length * 55);
      this.speech = { who, text, until: performance.now() + ms, done };
      const sp = this.content.speakers[who];
      this.speechEl.textContent = text;
      this.speechEl.style.color = sp?.color ?? 'var(--bg)';
      this.speechEl.classList.add('on');
      this.positionSpeech();
    });
  }

  private skipSpeech() {
    const sp = this.speech; if (!sp) return;
    this.speech = null;
    this.speechEl.classList.remove('on');
    sp.done();
  }

  private positionSpeech() {
    const sp = this.speech; if (!sp) return;
    let ax = 320, ay = 60;
    const sc = this.scene;
    if (sp.who === 'player') { ax = this.player.x; ay = sc.baseline - 90; }
    else {
      const a = this.actors().find(a => a.id === sp.who);
      if (a) { ax = a.x; ay = a.b - (a.h ?? 50) * 2 - 6; }
      else if (sc.voices?.[sp.who]) [ax, ay] = sc.voices[sp.who];
    }
    const e = this.speechEl, w = e.offsetWidth, h = e.offsetHeight;
    const left = Math.max(16, Math.min(1280 - 16 - w, ax * 2 - w / 2));
    const top = Math.max(12, ay * 2 - h);
    e.style.left = left + 'px'; e.style.top = top + 'px';
  }

  choose(options: string[]): Promise<number> {
    return new Promise(res => {
      this.dlgBox.innerHTML = '';
      this.dlgBox.classList.remove('hidden');
      this.bottom.classList.add('hidden');
      options.forEach((o, i) => {
        const b = el('button', 'dlg-opt', this.dlgBox); b.textContent = o;
        b.onclick = () => {
          this.dialogue = null;
          this.dlgBox.classList.add('hidden'); this.bottom.classList.remove('hidden');
          res(i);
        };
      });
      this.dialogue = res;
    });
  }

  // ───────────────────────────── scenes

  async goTo(to: SceneId, caption?: string, withBoat = false) {
    const from = this.state.scene;
    await this.fade(true, caption);
    if (caption) await new Promise(r => setTimeout(r, 1200 + caption.length * 25));
    this.state.scene = to;
    const [x, flip] = this.content.scenes[to].entry(withBoat ? null : from, this.state);
    this.player.resolve?.(false); this.player.resolve = null;
    this.player.x = this.player.target = x; this.player.flip = flip; this.player.walkT = 0;
    this.state.x = x; this.state.flip = flip;
    this.hover = null;
    save(this.state);
    await this.fade(false);
    await this.content.scenes[to].enter?.(this.script);
  }

  async blackout(caption: string, during?: () => void) {
    await this.fade(true, caption);
    during?.();
    await new Promise(r => setTimeout(r, 1400 + caption.length * 30));
    await this.fade(false);
  }

  private fade(out: boolean, caption?: string) {
    this.fadeEl.textContent = out ? caption ?? '' : '';
    this.fadeEl.classList.toggle('on', out);
    return new Promise(r => setTimeout(r, 450));
  }

  async ending() {
    clearSave();
    this.fadeEl.classList.add('on', 'end');
    this.fadeEl.innerHTML = `<div class="end-card"><div class="title-kicker">The Thames, at sunset</div><h1>The End</h1>
      <p>Seven obstacles, seven bits of maths, and not one of them handed to you on a chalkboard. Dot would be proud.</p>
      <button class="menu-btn">Back to the title</button></div>`;
    await new Promise<void>(r => (this.fadeEl.querySelector('button') as HTMLButtonElement).onclick = () => r());
    this.fadeEl.classList.remove('on', 'end'); this.fadeEl.innerHTML = '';
    this.showTitle();
  }

  // ───────────────────────────── menu

  private toggleMenu() {
    const m = this.menuEl;
    if (!m.classList.contains('hidden')) { m.classList.add('hidden'); return; }
    m.classList.remove('hidden');
    m.innerHTML = '<div class="menu-card"><h2>Paused</h2></div>';
    const card = m.firstElementChild as HTMLElement;
    const btn = (label: string, fn: () => void) => { const b = el('button', 'menu-btn', card); b.textContent = label; b.onclick = fn; };
    btn('Resume', () => m.classList.add('hidden'));
    btn('Notebook', () => { m.classList.add('hidden'); if (!this.busy) this.run(s => s.notebook()); });
    btn(`Dithering: ${this.opts.dither ? 'on' : 'off'}`, () => { this.opts.dither = !this.opts.dither; this.bgKey = ''; this.renderInventory(); this.toggleMenu(); this.toggleMenu(); });
    btn(`Show hotspots: ${this.opts.hotspots ? 'on' : 'off'}`, () => { this.opts.hotspots = !this.opts.hotspots; this.bgKey = ''; this.toggleMenu(); this.toggleMenu(); });
    btn('Quit to title', () => { m.classList.add('hidden'); if (!this.busy) this.showTitle(); });
    const note = el('div', 'menu-note', card); note.textContent = 'The game saves itself whenever you finish an action.';
  }
}

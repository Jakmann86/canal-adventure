// Overlays drawn over the scene: number prompts, the padlock, the chart plotter,
// the paint tin and the notebook. Each returns a promise that settles on close.
import { PAINT, TIDE, mixColor, near } from '../content/puzzles';
import type { Game } from './game';

export interface AskOpts {
  unit?: string;
  /** Ask for a time of day (hh:mm). Resolves to minutes after midnight. */
  time?: boolean;
  /** Notebook facts to show under the question, if the player has found them. */
  facts?: string[];
}

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, parent?: HTMLElement, text?: string) => {
  const e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); if (text !== undefined) e.textContent = text; return e;
};

const parseTime = (v: string): number | null => {
  const m = /^\s*(\d{1,2})\s*[:.h]\s*(\d{2})\s*$/.exec(v);
  if (!m) return null;
  const h = +m[1], min = +m[2];
  return h < 24 && min < 60 ? h * 60 + min : null;
};
const fmtTime = (m: number) => { m = ((Math.round(m) % 1440) + 1440) % 1440; return `${String(m / 60 | 0).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };

export class Panels {
  private host!: HTMLElement;
  private onKey: ((e: KeyboardEvent) => void) | null = null;
  open = false;

  constructor(private g: Game) {}

  mount(scene: HTMLElement) { this.host = el('div', 'panel-host hidden', scene); }

  key(e: KeyboardEvent) { this.onKey?.(e); }

  private frame(cls: string, title: string) {
    this.host.innerHTML = '';
    this.host.classList.remove('hidden');
    this.open = true;
    const box = el('div', 'panel ' + cls, this.host);
    el('div', 'panel-title', box, title);
    return box;
  }

  private close() {
    this.host.classList.add('hidden');
    this.host.innerHTML = '';
    this.open = false;
    this.onKey = null;
  }

  private factList(box: HTMLElement, ids: string[]) {
    const known = ids.filter(id => this.g.state.facts.includes(id));
    if (!known.length) return;
    const wrap = el('div', 'panel-facts', box);
    el('div', 'panel-facts-head', wrap, 'From your notebook');
    for (const id of known) el('div', 'panel-fact', wrap, this.g.content.facts[id]);
  }

  /** Ask for a number. Resolves to null if the player backs out. */
  ask(q: string, opts: AskOpts = {}): Promise<number | null> {
    return new Promise(res => {
      const box = this.frame('ask', 'Work it out');
      el('div', 'panel-q', box, q);
      this.factList(box, opts.facts ?? []);
      const row = el('div', 'panel-row', box);
      const input = el('input', 'panel-input', row); input.inputMode = opts.time ? 'text' : 'decimal'; input.autocomplete = 'off'; if (opts.time) input.placeholder = 'hh:mm';
      if (opts.unit) el('span', 'panel-unit', row, opts.unit);
      const btns = el('div', 'panel-btns', box);
      const ok = el('button', 'panel-btn', btns, 'That’s my answer'), cancel = el('button', 'panel-btn dim', btns, 'Not yet');
      const err = el('div', 'panel-err', box);
      const submit = () => {
        const v = opts.time ? parseTime(input.value) ?? NaN : parseFloat(input.value.replace(',', '.').replace(/[^\d.\-]/g, ''));
        if (Number.isNaN(v)) { err.textContent = opts.time ? 'Type a time, like 14:45.' : 'Type a number.'; return; }
        this.close(); res(v);
      };
      ok.onclick = submit;
      cancel.onclick = () => { this.close(); res(null); };
      this.onKey = e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { this.close(); res(null); } };
      setTimeout(() => input.focus(), 30);
    });
  }

  /** Jasper's three-dial padlock. Resolves to the code tried, or null. */
  padlock(): Promise<string | null> {
    return new Promise(res => {
      const box = this.frame('padlock', 'Jasper’s padlock');
      el('div', 'panel-q', box, 'Three dials. Each one turns through − and 0 to 9.');
      const chars = ['−', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
      const vals = [1, 1, 1];
      const dials = el('div', 'dials', box);
      vals.forEach((_, i) => {
        const d = el('div', 'dial', dials);
        const up = el('button', 'dial-btn', d, '▲'), face = el('div', 'dial-face', d, chars[vals[i]]), dn = el('button', 'dial-btn', d, '▼');
        up.onclick = () => { vals[i] = (vals[i] + chars.length - 1) % chars.length; face.textContent = chars[vals[i]]; };
        dn.onclick = () => { vals[i] = (vals[i] + 1) % chars.length; face.textContent = chars[vals[i]]; };
      });
      this.factList(box, ['tag', 'tagcode']);
      const btns = el('div', 'panel-btns', box);
      const ok = el('button', 'panel-btn', btns, 'Pull the shackle'), cancel = el('button', 'panel-btn dim', btns, 'Leave it');
      ok.onclick = () => { this.close(); res(vals.map(v => chars[v] === '−' ? '-' : chars[v]).join('')); };
      cancel.onclick = () => { this.close(); res(null); };
      this.onKey = e => { if (e.key === 'Escape') { this.close(); res(null); } };
    });
  }

  /** The boat's brass chart plotter. Resolves true once the readings plot correctly. */
  plotter(): Promise<boolean> {
    return new Promise(res => {
      const box = this.frame('plotter', 'Chart plotter: tide at Limehouse');
      const cv = el('canvas', 'plot-canvas', box); cv.width = 320; cv.height = 120;
      const readout = el('div', 'plot-readout', box, 'Enter the gatekeeper’s readings and press Plot.');
      const bottom = el('div', 'plot-bottom', box);
      const form = el('div', 'plot-form', bottom);
      const field = (label: string, ph: string) => { const w = el('label', 'plot-field', form); el('span', '', w, label); const i = el('input', 'panel-input small', w); i.placeholder = ph; i.autocomplete = 'off'; return i; };
      const fLow1 = field('Low water', 'hh:mm'), fLow2 = field('Next low', 'hh:mm'), fLowM = field('Low height (m)', '0.0'), fHighM = field('High height (m)', '0.0');
      this.factList(bottom, ['tide1', 'tide2', 'tide3']);
      const btns = el('div', 'panel-btns', box);
      const plot = el('button', 'panel-btn', btns, 'Plot'), done = el('button', 'panel-btn dim', btns, 'Switch off');
      let model: { low1: number; P: number; lo: number; hi: number } | null = null;
      let good = false;
      const c = cv.getContext('2d')!;
      const X = (m: number) => 20 + (m / 1440) * 290, Y = (h: number) => 104 - (h / 7.5) * 96;
      const level = (m: number) => { if (!model) return 0; const { low1, P, lo, hi } = model; return (lo + hi) / 2 - (hi - lo) / 2 * Math.cos(2 * Math.PI * (m - low1) / P); };
      const draw = (hover?: number) => {
        c.fillStyle = '#201e1d'; c.fillRect(0, 0, 320, 120);
        c.fillStyle = 'oklch(0.3 0.03 260)'; c.fillRect(X(0), 8, X(TIDE.sunrise) - X(0), 96); c.fillRect(X(TIDE.sunset), 8, X(1440) - X(TIDE.sunset), 96);
        c.fillStyle = 'oklch(0.52 0.09 200)';
        for (let h = 0; h <= 24; h += 3) c.fillRect(X(h * 60), 8, 1, 96);
        for (let m = 0; m <= 7; m++) c.fillRect(20, Y(m), 290, 1);
        c.fillStyle = 'oklch(0.74 0.12 190)'; c.font = '8px "Pixelify Sans", monospace';
        for (let h = 0; h <= 24; h += 6) c.fillText(String(h).padStart(2, '0'), X(h * 60) - 5, 116);
        for (let m = 0; m <= 6; m += 2) c.fillText(String(m), 6, Y(m) + 3);
        c.fillStyle = 'oklch(0.87 0.16 95)'; c.fillText('SUNRISE', X(TIDE.sunrise) + 2, 16); c.fillText('SUNSET', X(TIDE.sunset) - 30, 16);
        c.fillRect(X(TIDE.sunrise), 8, 1, 96); c.fillRect(X(TIDE.sunset), 8, 1, 96);
        if (model) {
          c.fillStyle = 'oklch(0.88 0.17 165)';
          for (let px = 0; px < 290; px++) { const m = px / 290 * 1440; c.fillRect(20 + px, Math.round(Y(level(m))), 1, 2); }
        }
        if (hover !== undefined) { c.fillStyle = '#f3f2f2'; c.fillRect(X(hover), 8, 1, 96); }
      };
      draw();
      cv.onmousemove = e => {
        const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * 320 / r.width;
        const m = Math.max(0, Math.min(1440, (x - 20) / 290 * 1440));
        draw(m);
        readout.textContent = model ? `${fmtTime(m)}  →  ${level(m).toFixed(1)} m` : `${fmtTime(m)}`;
      };
      plot.onclick = () => {
        const l1 = parseTime(fLow1.value), l2 = parseTime(fLow2.value), lo = parseFloat(fLowM.value.replace(',', '.')), hi = parseFloat(fHighM.value.replace(',', '.'));
        if (l1 === null || l2 === null) { readout.textContent = 'Times look like 06:30.'; return; }
        if (Number.isNaN(lo) || Number.isNaN(hi) || hi <= lo) { readout.textContent = 'Heights need numbers, and high above low.'; return; }
        // a "low" later than the next low must have been the night before
        const low1 = l1 > l2 ? l1 - 1440 : l1, P = l2 - low1;
        if (P < 60) { readout.textContent = 'Those lows are too close together.'; return; }
        model = { low1, P, lo, hi };
        good = near(low1, TIDE.low1, 3) && near(l2, TIDE.low2, 3) && near(lo, TIDE.lowM, 0.05) && near(hi, TIDE.highM, 0.05);
        readout.textContent = good ? 'Plotted. Move the pointer over the graph to read the tide.' : 'Plotted. Does that match what the gatekeeper said?';
        draw();
      };
      const finish = () => { this.close(); res(good); };
      done.onclick = finish;
      this.onKey = e => { if (e.key === 'Escape') finish(); if (e.key === 'Enter') plot.click(); };
    });
  }

  /** The paint tin. Resolves true if the player seals a correct mix. */
  mixer(): Promise<boolean> {
    return new Promise(res => {
      const s = this.g.state;
      const box = this.frame('mixer', 'Mixing Keith’s special paint');
      const body = el('div', 'mix-body', box);
      const left = el('div', 'mix-left', body);
      const tinCv = el('canvas', 'mix-tin', left); tinCv.width = 60; tinCv.height = 70;
      const swatch = el('div', 'mix-swatch', left);
      el('div', 'mix-swatch-chip', swatch).style.background = mixColor(PAINT.target)!;
      el('span', '', swatch, 'Gunnel Green, on Keith’s colour chart');
      const right = el('div', 'mix-right', body);
      const amount = { v: 400 };
      const msg = el('div', 'panel-err', box);
      const contents = el('div', 'mix-contents', box);
      const render = () => {
        right.innerHTML = '';
        const sel = el('div', 'mix-amount', right);
        el('span', '', sel, 'Fill the schooner to');
        for (const v of [100, 200, 300, 400]) {
          const b = el('button', 'mix-line' + (amount.v === v ? ' on' : ''), sel, `${v} ml`);
          b.onclick = () => { amount.v = v; render(); };
        }
        const have = PAINT.ingredients.filter(i => this.g.state.inv.includes(i.id));
        if (!have.length) el('div', 'mix-none', right, 'You haven’t got any ingredients yet.');
        for (const ing of have) {
          const row = el('div', 'mix-row', right);
          el('span', 'mix-chip', row).style.background = `rgb(${ing.color.join(',')})`;
          el('span', 'mix-name', row, `${ing.name}`);
          el('span', 'mix-left-ml', row, `${s.n[ing.id] ?? 0} ml left`);
          const pour = el('button', 'panel-btn small', row, 'Pour');
          pour.onclick = () => {
            const left = s.n[ing.id] ?? 0, inTin = Object.values(s.tin).reduce((a, b) => a + b, 0);
            const ml = Math.min(amount.v, left);
            if (inTin + ml > PAINT.tinMl) { msg.textContent = 'That would overflow the tin.'; return; }
            s.tin[ing.id] = (s.tin[ing.id] ?? 0) + ml;
            s.n[ing.id] = left - ml;
            msg.textContent = ml < amount.v ? `That was the last of the ${ing.name}.` : '';
            if (s.n[ing.id] <= 0) { s.inv = s.inv.flatMap(i => i !== ing.id ? [i] : ing.id === 'algae' ? ['jar'] : []); this.g.inventoryChanged(); }
            render();
          };
        }
        const total = Object.values(s.tin).reduce((a, b) => a + b, 0);
        contents.textContent = total ? 'In the tin: ' + PAINT.ingredients.filter(i => s.tin[i.id]).map(i => `${s.tin[i.id]} ml ${i.name}`).join(', ') : 'The tin is empty.';
        const tc = tinCv.getContext('2d')!;
        tc.fillStyle = '#201e1d'; tc.fillRect(0, 0, 60, 70);
        tc.fillStyle = '#9b9797'; tc.fillRect(6, 8, 48, 58);
        tc.fillStyle = '#444141'; tc.fillRect(9, 11, 42, 52);
        const col = mixColor(s.tin);
        if (col) { const h = Math.round(52 * total / PAINT.tinMl); tc.fillStyle = col; tc.fillRect(9, 63 - h, 42, h); }
        tc.fillStyle = '#605d5d'; tc.fillRect(14, 2, 32, 2);
      };
      render();
      const btns = el('div', 'panel-btns', box);
      const seal = el('button', 'panel-btn', btns, 'Seal the tin'), tip = el('button', 'panel-btn dim', btns, 'Pour it all away'), close = el('button', 'panel-btn dim', btns, 'Put it down');
      tip.onclick = () => { s.tin = {}; msg.textContent = 'Glug, glug. All gone. Hope you can find more.'; render(); };
      seal.onclick = () => {
        const t = PAINT.target, tin = s.tin;
        const ok = PAINT.ingredients.every(i => (tin[i.id] ?? 0) === t[i.id]);
        if (ok) { this.close(); res(true); return; }
        msg.textContent = this.hint(tin);
      };
      close.onclick = () => { this.close(); res(false); };
      this.onKey = e => { if (e.key === 'Escape') { this.close(); res(false); } };
    });
  }

  private hint(tin: Record<string, number>) {
    const t = PAINT.target, total = Object.values(tin).reduce((a, b) => a + b, 0);
    if (!total) return 'Sealing an empty tin. Keith will love that.';
    const missing = PAINT.ingredients.filter(i => !tin[i.id]);
    if (missing.length) return `Not right: the song has four lines, and there’s no ${missing[0].name} in it.`;
    if (tin.mushrooms === 600) return 'It glows like a fruit machine. Those mushrooms must be strong stuff.';
    if (tin.mushrooms > t.mushrooms) return 'Far too glowy.';
    if (tin.mushrooms < t.mushrooms) return 'Not glowy enough.';
    if (tin.stout > t.stout) return 'Too dark: more stout than the song asks for.';
    if (tin.stout < t.stout) return 'Too pale. It needs more of the dark stuff.';
    if (tin.algae !== t.algae) return tin.algae > t.algae ? 'Too swampy.' : 'Not green enough.';
    return tin.eggshell > t.eggshell ? 'Too chalky.' : 'It needs a bit more body: more eggshell.';
  }

  notebook(): Promise<void> {
    return new Promise(res => {
      const box = this.frame('notebook', 'Graph-paper notebook');
      const list = el('div', 'nb-list', box);
      const facts = this.g.state.facts;
      if (!facts.length) el('div', 'nb-fact', list, 'Empty, apart from a doodle of a duck.');
      for (const id of facts) el('div', 'nb-fact', list, this.g.content.facts[id]);
      const btns = el('div', 'panel-btns', box);
      const close = el('button', 'panel-btn', btns, 'Close');
      const done = () => { this.close(); res(); };
      close.onclick = done;
      this.onKey = e => { if (e.key === 'Escape' || e.key === 'Enter') done(); };
    });
  }
}

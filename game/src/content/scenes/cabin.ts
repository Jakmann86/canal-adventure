import type { Script } from '../../engine/script';
import type { Hotspot, SceneDef } from '../../engine/types';
import { CHARGE, near } from '../puzzles';

async function charge(s: Script) {
  if (s.is('charged')) return s.me('She’s charged already. The meter’s in the green.');
  await s.me('The label on the battery bank says 1800 Wh.'); s.note('battery');
  s.note('pack', 'packwindow');
  const h = await s.ask('How many hours do you leave Roz’s power pack charging the battery?', { unit: 'hours', facts: ['battery', 'pack', 'packwindow'] });
  if (h === null) return s.me('I’ll work it out first.');
  if (h > CHARGE.windowH) return s.me(`${h} hours? Roz needs it back in ${CHARGE.windowH}. She’d miss her set, and she would hunt me down.`);
  const full = CHARGE.capacityWh / CHARGE.packW;
  if (h < full - 0.05) return s.me(`After ${h} hours it would only be ${Math.round(h * CHARGE.packW / CHARGE.capacityWh * 100)}% charged. Not enough to turn the engine over.`);
  await s.blackout(`${near(h, full, 0.05) ? 'Four and a half' : h} hours later…`, () => s.set('charged'));
  if (!near(h, full, 0.05)) await s.me('It was full after four and a half hours. I could have given Roz a bit more slack.');
  await s.me('The meter’s in the green. The engine coughs, splutters and runs. Badly, but it runs.', 'And the chart plotter has lit up!');
}

async function plot(s: Script) {
  if (!s.is('charged')) return s.me('It’s dead. No power to the plotter until the battery’s charged.');
  if (!s.knows('tide1')) return s.me('It’s a graphing plotter for tides. I don’t have any tide readings to put in yet.');
  const ok = await s.plotter();
  if (ok && !s.is('plotted')) { s.set('plotted'); await s.me('Two high tides a day. Now, which one do I tell the gatekeeper?'); }
  else if (!ok) await s.me('Hmm. I should check those readings against what the gatekeeper said.');
}

export const cabin: SceneDef = {
  id: 'cabin', art: 'cabin', title: 'Inside the Hypotenuse',
  baseline: 284,
  walk: () => [120, 600],
  vis: s => ({ charged: !!s.f.charged, plotted: !!s.f.plotted }),
  entry: () => [588, true],
  enter: async s => { if (!s.is('sawCabin')) { s.set('sawCabin'); await s.me('Dot’s cabin. It smells of woodsmoke, books and cat.'); } },
  hotspots: (s): Hotspot[] => [
    { id: 'stove', name: 'wood-burning stove', rect: [40, 120, 60, 86], walkTo: 130, look: 'A little wood-burner, still warm. Dot never let it go out.',
      verbs: { Open: 'I peek in. Toasty. Perfect for, say, toast.', Use: 'Nice and warm. I could toast something on it.' },
      use: {
        crusts: async sc => { sc.swap('crusts', 'toast'); await sc.me('I toast Barnaby’s crusts on the stove. It smells like Sunday morning.'); },
        toast: 'Any more toasting and it’s charcoal.', seededtoast: 'It’s toasted enough.', sourdough: 'It’s perfect as it is.',
      } },
    { id: 'kettle', name: 'kettle', rect: [70, 118, 26, 22], walkTo: 130, look: 'The kettle. Tea is not one of the puzzles.', verbs: { Use: 'I make a cup of tea. Better. Much better.', 'Pick up': 'It’s hot, and it lives there.' } },
    { id: 'books', name: 'bookshelf', rect: [146, 66, 120, 56], look: 'Narrowboat Basics, Tides of the Thames, and X+Y, which seems to be a romance.', verbs: { 'Pick up': 'Dot’s books can stay where Dot put them.' } },
    { id: 'plates', name: 'ribbon plates', rect: [284, 42, 28, 80], look: 'Lace-edged ribbon plates. Every proper boat has some. Nobody knows why.' },
    { id: 'lamp', name: 'oil lamp', rect: [304, 32, 18, 34], look: 'A brass oil lamp. Dot clearly polished it every single day.' },
    { id: 'plotter', name: 'chart plotter', rect: [420, 44, 128, 92], walkTo: 484,
      look: s.f.charged ? 'The brass chart plotter, glowing away. Feed it numbers and it draws the graph.' : 'A brass chart plotter: a graph-drawing machine for tides. It’s dead. No power.',
      verbs: { Use: plot, 'Push': plot } },
    { id: 'can', name: 'Buckby can', rect: [554, 104, 34, 38], look: 'A painted Buckby water can: roses and castles. Purely decorative, Dot always said.' },
    { id: 'pans', name: 'hanging pans', rect: [518, 28, 70, 46], look: 'Copper pans. Shiny enough to check my hair in.' },
    { id: 'cat', name: 'sleeping cat', rect: [154, 164, 38, 18], look: 'Dot’s cat, Pi. He is irrational and never ends.', verbs: { 'Talk to': 'Prrrp?', 'Pick up': 'Pi opens one eye. I put him down again.', Push: 'Pi doesn’t move. Pi never moves.' } },
    { id: 'map', name: 'canal map', rect: [272, 184, 96, 14], look: 'Dot’s canal map. Little Venice, Camden, the Islington Tunnel, Hackney Wick. Up the River Lea to Stonebridge and Cheshunt, or down to Limehouse and the Thames.' },
    { id: 'mug', name: 'mug of tea', rect: [368, 184, 18, 14], look: 'A mug of tea. Cold. Dot’s, probably. I’ll leave it.' },
    { id: 'rug', name: 'rag rug', rect: [200, 248, 240, 38], walkTo: null, look: 'A rag rug in every colour Dot ever painted the boat.' },
    { id: 'battery', name: 'battery bank', rect: [296, 216, 56, 32], walkTo: 324,
      look: async sc => { await sc.me(sc.is('charged') ? 'The battery bank. 1800 Wh, and the meter’s in the green.' : 'The battery bank. The label says 1800 Wh. The meter says nothing at all.'); sc.note('battery'); },
      use: { powerpack: charge } },
    { id: 'tank', name: 'water tank plate', rect: [443, 162, 26, 14], look: async sc => { await sc.me(sc.is('tankFull') ? 'WATER TANK 450 L. Full, thanks to Jasper’s tap.' : 'A plate on the water tank: 450 L. The gauge underneath says empty.'); sc.note('tank'); } },
    { id: 'hatch', name: 'stern hatch', rect: [622, 36, 18, 250], isExit: true, walkTo: 600, look: 'The stern hatch, out to the towpath.', walk: sc => sc.go(sc.s.boatAt), verbs: { Open: sc => sc.go(sc.s.boatAt) } },
  ],
};

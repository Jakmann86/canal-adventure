import type { Script } from '../engine/script';
import type { ItemDef } from '../engine/types';
import { PAINT } from './puzzles';

async function mixPaint(s: Script) {
  if (!s.has('tin')) return s.me('I need something to mix it in.');
  if (!s.has('schooner')) return s.me('I need something to measure with. Pouring by eye is how you waste the good stuff.');
  const ok = await s.mixer();
  if (ok) {
    s.swap('tin', 'paint');
    s.s.tin = {};
    await s.me('Gunnel Green! It matches Keith’s chart exactly. It even glows a bit.');
  }
}

const mixWith = Object.fromEntries(['schooner', ...PAINT.ingredients.map(i => i.id)].map(id => [id, mixPaint]));

const notebook = (s: Script) => s.notebook();

export const items: Record<string, ItemDef> = {
  windlass: { id: 'windlass', name: 'windlass', look: 'A windlass: an L-shaped crank for winding lock paddles. Every boater’s best friend.' },
  notebook: {
    id: 'notebook', name: 'graph-paper notebook', look: notebook,
    verbs: { Use: notebook, Open: notebook, Close: 'It’s closed.' },
  },
  key: {
    id: 'key', name: 'key and letter',
    look: async s => {
      await s.me('Dot’s boat key, and her letter. It says:');
      await s.me('“Get her to the Thames on the next spring tide. Limehouse Lock, sunset. Don’t let anyone do the sums for you. Dot.”');
      s.note('letter');
    },
  },
  crusts: { id: 'crusts', name: 'bread crusts', look: 'Barnaby’s bread crusts. Stale enough to build a wall with.', use: { seeds: 'The seeds won’t stick to stale crusts. Toast them first?' } },
  toast: {
    id: 'toast', name: 'toasted crusts', look: 'Toasted crusts. Crunchy, at least.',
    use: { seeds: async s => { s.take('seeds'); s.swap('toast', 'seededtoast'); await s.me('I press the seeds into the warm toast. It’s nearly food.'); } },
  },
  seededtoast: { id: 'seededtoast', name: 'seeded toast', look: 'Toast with seeds pressed in. Rustic. Possibly artisan.' },
  seeds: { id: 'seeds', name: 'bag of seeds', look: 'A bag of “ancient grain” from Jasper’s boat. It looks a lot like birdseed.' },
  paperbag: {
    id: 'paperbag', name: 'paper bag', look: 'A brown paper bag. Plain. Honest. Not posh at all.',
    use: {
      chalklabel: async s => { s.take('chalklabel'); s.swap('paperbag', 'labelledbag'); await s.me('I clip the little chalk label onto the bag. Instantly gentrified.'); },
      seededtoast: 'A plain paper bag? Where’s the provenance? It needs a label.',
    },
  },
  chalklabel: { id: 'chalklabel', name: 'chalk label', look: 'A tiny chalkboard label that says POSH. Jasper puts them next to his bread.' },
  labelledbag: {
    id: 'labelledbag', name: 'labelled paper bag', look: 'A paper bag with a chalk label: POSH.',
    use: {
      seededtoast: async s => { s.take('seededtoast'); s.swap('labelledbag', 'sourdough'); await s.me('Toasted crusts, ancient grain, a paper bag and a chalk label. Behold: Heritage Grain Sourdough.'); },
      toast: 'It needs seeds first. Heritage grain, remember.',
      crusts: 'Stale crusts in a posh bag? Even Hackney wouldn’t fall for that.',
    },
  },
  sourdough: { id: 'sourdough', name: 'Heritage Grain Sourdough', look: '“Heritage Grain Sourdough.” Toast and birdseed in a bag. It would sell for nine quid round here.' },
  powerpack: { id: 'powerpack', name: 'power pack', look: async s => { await s.me('Roz’s power pack. The label says OUTPUT 400 W. She wants it back in five hours.'); s.note('pack', 'packwindow'); } },
  metronome: { id: 'metronome', name: 'metronome', look: 'Roz’s wind-up metronome, set to 60 ticks a minute. One tick a second.' },
  label: { id: 'label', name: '“NOT TO SCALE” label', look: 'A sticker from an exam paper: “Diagram NOT drawn to scale.”' },
  stout: { id: 'stout', name: 'growler of stout', look: 'A growler of Jasper’s bathtub stout. Darker than the Islington Tunnel.', use: mixWith },
  schooner: { id: 'schooner', name: 'schooner glass', look: async s => { await s.me('A schooner glass from Jasper’s bar. It holds 400 ml, with a line every 100 ml.'); s.note('schooner'); }, use: { tin: mixPaint } },
  tin: { id: 'tin', name: 'empty paint tin', look: 'Keith’s 2-litre paint tin. I mix the paint in here.', verbs: { Use: mixPaint, Open: mixPaint }, use: mixWith },
  chart: { id: 'chart', name: 'colour chart', look: 'Keith’s colour chart. One square is circled in biro: Gunnel Green. Dark, green and slightly glowing.' },
  jar: { id: 'jar', name: 'empty jam jar', look: 'An empty jam jar from Keith’s bench. Smells faintly of marmalade and diesel.' },
  algae: { id: 'algae', name: 'jar of algae water', look: 'Bright green algae water. It’s alive. Possibly thinking.', use: mixWith },
  mushrooms: { id: 'mushrooms', name: 'glowing mushrooms', look: 'Glowing mushrooms from Cheshunt. My pockets are lit up like a fruit machine.', use: mixWith },
  eggshell: { id: 'eggshell', name: 'swan eggshell', look: 'Crushed swan eggshell from the nest. “The cradle the swans left too soon.”', use: mixWith },
  paint: { id: 'paint', name: 'Keith’s special paint', look: 'Two litres of Gunnel Green. Still faintly warm, which is worrying.' },
};

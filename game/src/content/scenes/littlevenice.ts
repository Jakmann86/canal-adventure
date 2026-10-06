import { boater } from '../../art/sprites';
import type { Script } from '../../engine/script';
import type { SceneDef } from '../../engine/types';
import { boat, exit, talk, when } from '../common';

async function barnaby(s: Script) {
  await talk(s, () => [
    !s.is('gotKey') && ['Dot left me a boat?', async () => {
      await s.say('barnaby', 'The Hypotenuse. Best boat on the cut. Worst engine.', 'Here’s her key. And this letter. Dot made me promise to hand it over in person.');
      s.give('key'); s.set('gotKey');
      await s.me('“Get her to the Thames on the next spring tide. Limehouse Lock, sunset. Don’t let anyone do the sums for you. Dot.”');
      s.note('letter');
    }],
    ['Who are you?', () => s.say('barnaby', 'Barnaby. Forty years I worked this cut with your aunt Dot. She did the maths. I did the shouting.')],
    s.is('gotKey') && !s.is('gotCrusts') && ['Any advice?', async () => {
      await s.say('barnaby', 'Talk to people. Everyone on the cut knows one useful thing and fifty useless ones.', 'And take these crusts. I was saving them for the ducks, but the swans round here only eat posh bread.');
      s.give('crusts'); s.set('gotCrusts');
    }],
    s.is('gotKey') && !s.is('charged') && ['The boat won’t start.', () => s.say('barnaby', 'Battery’ll be flat as a pancake. Roz the busker, up at Camden Lock, has a power pack for her amp.', 'Ask nicely. And mind your ears.')],
    ['What’s a spring tide?', () => s.say('barnaby', 'The biggest tide of the month. It’s the only time a boat like yours can get out of Limehouse onto the river safely.', 'Miss it and you wait another fortnight.')],
    ['Bye, Barnaby.', async () => { await s.say('barnaby', 'Mind how you go.'); return true; }],
  ]);
}

export const littlevenice: SceneDef = {
  id: 'littlevenice', art: 'littlevenice', title: 'Little Venice',
  baseline: 284,
  walk: () => [20, 616],
  vis: s => ({ boat: s.boatAt === 'littlevenice', painted: !!s.f.painted }),
  entry: from => from === 'cabin' ? [280, false] : from === 'camden' ? [610, true] : [106, false],
  actors: () => [{ id: 'barnaby', sprite: boater, x: 478, b: 276, flip: true, h: 50 }],
  fg: g => { g.R(440, 262, 76, 4, 'wood'); g.R(440, 266, 76, 2, 'wood9'); g.R(446, 268, 3, 14, 'wood9'); g.R(507, 268, 3, 14, 'wood9'); },
  hotspots: s => [
    { id: 'villas', name: 'white stucco villas', rect: [0, 40, 176, 112], walkTo: null, look: 'White stucco villas. Each one costs more than the whole canal.' },
    { id: 'cafe', name: 'café boat', rect: [14, 120, 176, 54], look: 'A floating café. The sign says “Back in 5 mins”. The sign has cobwebs on it.', verbs: { 'Talk to': 'Hello? Nobody. Still five minutes, I suppose.' } },
    { id: 'willow', name: 'weeping willow', rect: [246, 64, 116, 112], walkTo: null, look: 'Browning’s Island, and a willow that has been weeping since about 1840.' },
    { id: 'bridge', name: 'blue iron bridge', rect: [368, 126, 118, 60], walkTo: null, look: 'A blue iron bridge. Somebody up there is watching boats and doing nothing. Barnaby would have a word for that.' },
    ...when(s.boatAt === 'littlevenice', boat(s, [150, 172, 268, 82], async sc => {
      if (!sc.is('charged')) return sc.me('I turn the key. Nothing. Not even a cough. The battery’s flat.');
      await sc.cruise('camden', 'The Hypotenuse chugs east, past the zoo’s aviary, towards Camden.');
    })),
    { id: 'fingerpost', name: 'fingerpost', rect: [26, 210, 64, 42], look: 'Camden one way, Paddington the other. Dot’s letter says Limehouse, so it’s east to Camden.' },
    { id: 'lamp', name: 'street lamp', rect: [12, 142, 20, 136], look: 'A Victorian street lamp, lit in broad daylight. Very Little Venice.' },
    { id: 'board', name: 'route board', rect: [524, 208, 100, 76], look: 'A route board for the Regent’s Canal: Camden, Angel, all the way down to Limehouse and the Thames. Thirteen kilometres.' },
    { id: 'bench', name: 'bench', rect: [440, 244, 78, 38], walkTo: 420, look: 'Barnaby’s bench. There’s a little plaque: “For Dot, who always knew the time of the tide.”' },
    { id: 'barnaby', name: 'Barnaby', rect: [462, 222, 34, 56], walkTo: 440, look: 'An old boater on a bench, in a cap that has seen things.', verbs: { 'Talk to': barnaby }, give: { crusts: 'He waves them away. “They’re yours now. Swans only eat posh bread anyway.”' } },
    exit('toCamden', 'the towpath to Camden', [626, 190, 14, 98], 'camden', 'Along the towpath, past London Zoo, to Camden Lock.', 616),
  ],
};

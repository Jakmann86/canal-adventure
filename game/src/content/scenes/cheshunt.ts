import { MUSHROOMS } from '../../art/scenes';
import { swan } from '../../art/sprites';
import type { Script } from '../../engine/script';
import type { SceneDef } from '../../engine/types';
import { exit, when } from '../common';
import { PAINT } from '../puzzles';

async function feedSwan(s: Script) {
  s.take('sourdough');
  await s.say('swan', '…');
  await s.me('The swan inspects the bag. It reads the label. It looks at me with new respect.');
  await s.blackout('The swan snatches the Heritage Grain Sourdough and paddles off to enjoy it in private.', () => s.set('swanGone'));
  await s.me('The nest is unguarded.');
}

const swanSnub = (line: string) => async (s: Script) => { await s.say('swan', 'HSSSSS!'); await s.me(line); };

export const cheshunt: SceneDef = {
  id: 'cheshunt', art: 'cheshunt', title: 'Cheshunt Lakes',
  baseline: 284,
  walk: s => [10, s.f.swanGone ? 600 : 470],
  vis: s => ({ boat: s.boatAt === 'cheshunt', swanGone: !!s.f.swanGone, eggTaken: !!s.f.eggTaken, painted: !!s.f.painted }),
  entry: () => [16, false],
  actors: s => s.f.swanGone ? [] : [{ id: 'swan', sprite: swan, x: 530, b: 268, flip: true, w: 12, h: 30 }],
  fx: (g, s, t) => {
    MUSHROOMS.forEach(([x, h], i) => {
      const pulse = (Math.sin(t / 600 + i * 1.3) + 1) / 2, y = 262 - h;
      for (let dy = -6; dy <= 6; dy++) for (let dx = -7; dx <= 8; dx++) if ((dx + dy + (t / 400 | 0)) % 3 === 0 && dx * dx + dy * dy * 2 < 30 + pulse * 30) g.px(x + dx, y + dy, 'glow7');
      g.E(x + 1, y, 4, 2, pulse > .5 ? 'glow' : 'glow7'); g.R(x - 1, y - 1, 4, 1, 'glow');
    });
  },
  enter: async s => { if (!s.is('sawCheshunt')) { s.set('sawCheshunt'); await s.me('So quiet. Just the pylons humming… and something glowing in the grass.'); } },
  hotspots: s => [
    { id: 'moon', name: 'moon', rect: [454, 30, 32, 32], walkTo: null, look: 'A full moon. Spring tides come with the full moon, Barnaby said.' },
    { id: 'pylon1', name: 'electricity pylon', rect: [130, 34, 40, 118], walkTo: null, look: 'A pylon, humming to itself in the dark.' },
    { id: 'pylon2', name: 'electricity pylon', rect: [380, 34, 40, 118], walkTo: null, look: 'Another pylon. The cables sag between them like a smile.' },
    { id: 'lake', name: 'lake', rect: [0, 152, 640, 96], walkTo: null, look: 'Cheshunt lakes. Old gravel pits, flooded, now full of birds. The dead boats of the old gravel works lie under the water somewhere.' },
    { id: 'reeds', name: 'reeds', rect: [318, 204, 36, 54], look: 'Reeds, whispering. I am not scared. I am not scared.' },
    { id: 'fingerpost', name: 'fingerpost', rect: [404, 214, 56, 52], look: 'CHESHUNT. And underneath, scratched in: “here be swans”.' },
    { id: 'mushrooms', name: 'glowing mushrooms', rect: [224, 244, 64, 20], walkTo: 256,
      look: 'Mushrooms that glow in the dark. “Three of the light where the dead boats grew.”',
      verbs: { 'Pick up': async sc => {
        if (sc.has('mushrooms')) return sc.me('I’ve got plenty. Leave some for the moths.');
        sc.give('mushrooms'); sc.setNum('mushrooms', PAINT.supply.mushrooms);
        await sc.me('I pick a handful. They glow in my hand. Spooky. Beautiful.');
      } } },
    ...when(!s.f.swanGone, { id: 'swan', name: 'fierce swan', rect: [500, 210, 56, 60], walkTo: 460,
      look: 'A swan, guarding its nest. Swans can break your arm, apparently. This one looks like it would enjoy it.',
      verbs: { 'Talk to': swanSnub('Fair enough.'), Push: swanSnub('No.'), 'Pick up': swanSnub('Absolutely not.') },
      give: {
        sourdough: feedSwan,
        crusts: swanSnub('It looks at the plain crusts with utter contempt.'),
        toast: swanSnub('Toast is just toast, apparently.'),
        seededtoast: swanSnub('It eyes the seeds, then the lack of packaging. No.'),
        labelledbag: swanSnub('An empty bag. Even I know that’s cheeky.'),
      } }),
    { id: 'nest', name: 'swan’s nest', rect: [564, 248, 48, 18], walkTo: 560, look: s.f.swanGone ? 'An old nest with broken eggshell in it. “The cradle the swans left too soon.”' : 'A nest on the bank. The swan is sitting between me and it.',
      verbs: { 'Pick up': async sc => {
        if (!sc.is('swanGone')) return swanSnub('Nope. Nope nope nope.')(sc);
        if (sc.has('eggshell')) return sc.me('I’ve got enough shell.');
        sc.set('eggTaken'); sc.give('eggshell'); sc.setNum('eggshell', PAINT.supply.eggshell);
        await sc.me('I gather up the broken eggshell. The cygnets hatched long ago.');
      } } },
    exit('toStonebridge', 'the towpath to Stonebridge', [0, 200, 10, 88], 'stonebridge', 'Back south down the Lea to Stonebridge.', 10),
  ],
};

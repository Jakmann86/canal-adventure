import { keith as keithSprite } from '../../art/sprites';
import type { Script } from '../../engine/script';
import type { SceneDef } from '../../engine/types';
import { boat, exit, talk, when } from '../common';
import { PAINT } from '../puzzles';

// Keith asks three questions. Proper boat words earn his respect.
const QUIZ: { q: string; opts: string[]; right: number }[] = [
  { q: 'So what’s wrong with her, then?', opts: ['The engine at the back makes a horrible clanking.', 'The stern gear knocks and the stern gland drips.', 'The pointy end is broken.'], right: 1 },
  { q: 'And where’s she now?', opts: ['Parked in the river bit.', 'In the canal car park.', 'Moored on the cut, below the lock.'], right: 2 },
  { q: 'Any damage to the hull?', opts: ['A scrape down the left-hand edgy bit.', 'Scuffed along the port gunwale.', 'There’s a dent in the front wall.'], right: 1 },
];

async function quiz(s: Script) {
  for (const { q, opts, right } of QUIZ) {
    await s.say('keith', q);
    const i = await s.choose(opts);
    await s.me(opts[i]);
    if (i !== right) {
      await s.say('keith', 'Gongoozler!', 'Come back when you can talk boat.');
      return false;
    }
  }
  await s.say('keith', 'Hm. Not a total gongoozler, then.');
  s.set('keithRespect');
  return true;
}

async function deal(s: Script) {
  await s.say('keith', 'I’ll sort her stern gear and give her a coat of paint. But I don’t want your money.', 'I want paint. My special paint, Gunnel Green. Can’t buy it no more.', 'Our Kayleigh mixes it, but she’s away on school camp. Here’s the tin and the colour chart. Two litres, mind.');
  s.give('tin'); s.give('chart'); s.set('gotTin'); s.note('tinsize');
  await s.say('keith', 'Recipe? Everybody on the cut knows the song. Ask a singer.');
}

async function keith(s: Script) {
  await talk(s, () => [
    !s.is('keithRespect') && ['Can you fix my boat?', async () => { if (await quiz(s)) await deal(s); else return true; }],
    s.is('keithRespect') && !s.is('gotTin') && ['About fixing my boat…', () => deal(s)],
    s.is('gotTin') && !s.is('painted') && ['About the paint…', () => s.say('keith', 'Four ingredients, measured proper. Kayleigh uses a glass.', 'Don’t guess. It’s all rare stuff, and I ain’t got all year.')],
    ['What’s a gongoozler?', () => s.say('keith', 'Someone who stands on a bridge watching boats and never does nothing.', 'Like you, till recently.')],
    ['Tell me about Singapore.', async () => {
      await s.say('keith', 'Stationed there in ’62. Hot? You could fry an egg on the gunwale.', 'We’d go out past Sembawang at night, and the sea glowed. Glowed! Same as them mushrooms up Cheshunt way.', 'Strong stuff, them mushrooms. Punch twice their weight. Our Kayleigh never measures ’em out like the rest.', 'Anyway, the food. Don’t get me started on the food…');
      s.note('double');
    }],
    ['Is that your natural hair colour?', () => s.say('keith', 'Course it is. Distinguished, this is.')],
    ['Bye, Keith.', async () => { await s.say('keith', 'Mind the gate.'); return true; }],
  ]);
}

async function givePaint(s: Script) {
  if (s.s.boatAt !== 'stonebridge') return s.say('keith', 'Lovely job. Now bring the boat up the Lea. I can’t fix her from here.');
  s.take('paint');
  await s.say('keith', 'That’s Gunnel Green all right. Kayleigh couldn’t have done better. Don’t tell her I said that.');
  await s.blackout('Keith works through the night. There is a lot of swearing, and some singing.', () => { s.set('engineFixed'); s.set('painted'); });
  await s.say('keith', 'Stern gear’s sorted, gland’s repacked, and she’s in Gunnel Green. Best-looking boat on the Lea.', 'Now clear off before I start charging.');
}

async function scoop(s: Script) {
  if (s.has('algae')) return s.me('I’ve got a jar already.');
  s.swap('jar', 'algae'); s.setNum('algae', PAINT.supply.algae);
  await s.me('I scoop up a jar of bright green lock water. “Two of the water where the green things bloom.”');
}

async function useBoat(s: Script) {
  const i = await s.choose(['Back down to Hackney Wick.', 'All the way down to Limehouse.', 'Stay here.']);
  if (i === 0) await s.cruise('hackneywick', 'Back down the River Lea to Hackney Wick.');
  if (i === 1) await s.cruise('limehouse', 'Down the River Lea and the Limehouse Cut to Limehouse Lock.');
}

export const stonebridge: SceneDef = {
  id: 'stonebridge', art: 'stonebridge', title: 'Stonebridge Lock',
  baseline: 284,
  walk: () => [12, 524],
  vis: s => ({ boat: s.boatAt === 'stonebridge', jarTaken: !!s.f.jarTaken, painted: !!s.f.painted }),
  entry: from => from === 'cheshunt' ? [520, true] : from === 'cabin' || from === null ? [150, false] : [16, false],
  actors: () => [{ id: 'keith', sprite: keithSprite, x: 556, b: 284, flip: true, h: 52 }],
  enter: async s => {
    if (!s.is('metKeith')) { s.set('metKeith'); await s.say('keith', 'Oi. You. Another one living on a boat ’cause London rent’s daft, are you?'); }
  },
  hotspots: s => [
    { id: 'crane', name: 'gantry crane', rect: [140, 60, 256, 18], walkTo: null, look: 'A yellow gantry crane for lifting boats out. It creaks when the wind blows.' },
    { id: 'tangent', name: 'narrowboat Tangent', rect: [150, 150, 214, 80], look: 'Keith’s own boat, the Tangent, up on blocks. Half blacked, half rust. A bit like Keith.' },
    { id: 'workshop', name: 'workshop', rect: [420, 108, 132, 70], walkTo: 480, look: 'Keith’s workshop: tools, sparks and a radio playing 1962.' },
    ...when(!s.f.jarTaken, { id: 'jar', name: 'jam jar', rect: [516, 160, 16, 18], walkTo: 510, look: 'An empty jam jar on the workbench.', verbs: { 'Pick up': async (sc: Script) => { sc.set('jarTaken'); sc.give('jar'); await sc.say('keith', 'Take it, I keep me bolts in a sock now.'); } } }),
    { id: 'tins', name: 'paint tins', rect: [198, 232, 200, 20], look: 'Blacking, primer, red oxide. None of it is Keith’s special paint.' },
    { id: 'prop', name: 'propeller', rect: [116, 232, 32, 32], look: 'A brass propeller with a chunk missing. It met a shopping trolley.' },
    { id: 'sign', name: 'Keith’s sign', rect: [18, 230, 80, 56], look: '“KEITH’S YARD. REPAIRS. BLACKING. NO GONGOOZLERS.” What is a gongoozler?' },
    { id: 'drums', name: 'oil drums', rect: [564, 194, 72, 34], walkTo: 524, look: 'Oil drums. One says DIESEL, one says TEA, one says DO NOT.' },
    { id: 'lock', name: 'Stonebridge Lock', rect: [0, 132, 140, 70], walkTo: 90, look: 'Stonebridge Lock. The water is thick with algae, bright green like pea soup.', use: { jar: scoop } },
    ...when(s.boatAt === 'stonebridge', boat(s, [10, 120, 120, 60], useBoat, { walkTo: 90, use: { jar: scoop } })),
    { id: 'keith', name: 'Keith', rect: [540, 224, 32, 60], walkTo: 524, look: 'Keith: about eighty, blue overalls, and hair a suspiciously young shade of brown.',
      verbs: { 'Talk to': keith }, give: { paint: givePaint, tin: 'He pushes it back. “Full, not empty. That’s the idea.”', chart: '“You keep that. It’s for matching.”' } },
    exit('toWick', 'the towpath to Hackney Wick', [0, 210, 10, 78], 'hackneywick', 'South down the River Lea towpath to Hackney Wick.', 12),
    exit('toCheshunt', 'the towpath to Cheshunt', [600, 236, 40, 52], 'cheshunt', 'North up the Lea, past the reservoirs. It gets dark early out here.', 524),
  ],
};

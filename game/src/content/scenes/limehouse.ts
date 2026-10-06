import type { Script } from '../../engine/script';
import type { SceneDef } from '../../engine/types';
import { boat, exit, when } from '../common';
import { TIDE, near } from '../puzzles';

const JOKES: [string, string][] = [
  ['Whenever the vibes are right.', 'The vibes. The VIBES. Get off my radio.'],
  ['Ride off into the sunset?', 'Ha! Not as daft as it sounds, that. But I want a TIME, not poetry.'],
  ['Er… teatime?', 'Teatime’s four o’clock. The Thames don’t care about your tea.'],
  ['I’ll get back to you.', 'Don’t take all day. Tide waits for no one. Except me.'],
];

async function departure(s: Script) {
  await s.say('gatekeeper', 'And when are you planning to go?');
  if (!s.knows('tide1')) {
    await s.say('gatekeeper', 'Tide times? I keep ’em on the back of me hand, see.', 'Low water last night, six minutes to midnight. Nought point eight on the gauge.', 'Next low, eighteen minutes past twelve today.', 'And springs top out at six point six. Same as when Victoria was on the throne.');
    s.note('tide1', 'tide2', 'tide3');
  }
  const opts = [...(s.is('plotted') ? ['I’ve worked out a time.'] : []), ...JOKES.map(j => j[0])];
  const i = await s.choose(opts);
  await s.me(opts[i]);
  if (!s.is('plotted') || i > 0) {
    await s.say('gatekeeper', JOKES[i - (s.is('plotted') ? 1 : 0)][1]);
    if (!s.is('plotted')) await s.me('I should get those readings onto Dot’s chart plotter.');
    return;
  }
  const t = await s.ask('What time do you ask to leave Limehouse Lock?', { time: true, facts: ['tide1', 'tide2', 'tide3', 'nodark', 'letter'] });
  if (t === null) return s.say('gatekeeper', 'Well? I’m not getting any younger. Well, I am, but slowly.');
  const hi1 = (TIDE.low1 + TIDE.low2) / 2, hi2 = hi1 + (TIDE.low2 - TIDE.low1);
  if (near(t, hi2, 10)) {
    await s.say('gatekeeper', 'Half past six. High water, with the sun going down behind you.', 'Clearance granted, Hypotenuse. Mind the Thames. She bites.');
    s.set('cleared');
    return;
  }
  if (near(t, hi1, 10)) { s.note('nodark'); return s.say('gatekeeper', 'In the early hours? In the dark? On the Thames? Not on my watch, sunshine.'); }
  if (near(t, TIDE.low2, 40) || near(t, TIDE.low1 + 1440, 40)) return s.say('gatekeeper', 'That’s LOW water. You’d be sat in the mud with the shopping trolleys.');
  await s.say('gatekeeper', 'At that time she’d be halfway up the gauge. I want you out at the top of the tide.');
}

async function radio(s: Script) {
  await s.me('Hello? Limehouse Lock?');
  await s.say('gatekeeper', 'Lime-house! Limehouse here. Who’s that? Speak up, I’m ninety-one.');
  if (s.s.boatAt !== 'limehouse') return s.say('gatekeeper', 'No boat? Then what are you calling me for? I’m watching the cricket.');
  await s.say('gatekeeper', 'Checklist. First, rev your engine. Let’s hear her.');
  if (!s.is('engineFixed')) {
    await s.say('gatekeeper', 'Sounds like a coffee grinder full of spanners.', 'And she needs paint. I’m not letting that on my river. Keith up at Stonebridge might sort her, if he’s still alive.');
    return;
  }
  await s.say('gatekeeper', 'Purring. And fresh paint, too. Lovely.', 'Water tank?');
  if (!s.is('tankFull')) return s.say('gatekeeper', 'Empty? On the Thames? You’ll be drinking the river. Fill up at the Wick. They’ve got a tap.');
  await s.say('gatekeeper', 'Full. Good.');
  await departure(s);
  if (s.is('cleared')) await finale(s);
}

async function finale(s: Script) {
  await s.blackout('Evening. The gates swing open, and the Hypotenuse slides out onto the Thames as the sun goes down.', () => s.set('gatesOpen'));
  await s.me('Dot’s letter has a second page. I hadn’t noticed it before.');
  await s.me('“If you’re reading this on the river, you did every sum yourself. She’s yours now. The Hypotenuse always finds the shortest way. Love, Dot.”');
  await s.ending();
}

export const limehouse: SceneDef = {
  id: 'limehouse', art: 'limehouse', title: 'Limehouse Lock',
  baseline: 284,
  walk: () => [10, 560],
  vis: s => ({ boat: s.boatAt === 'limehouse', painted: !!s.f.painted, gatesOpen: !!s.f.gatesOpen }),
  voices: { gatekeeper: [598, 168] },
  entry: from => from === 'hackneywick' ? [16, false] : [240, false],
  enter: async s => {
    if (s.s.boatAt === 'limehouse' && !s.is('sawThames')) { s.set('sawThames'); await s.me('The Thames! Just through those gates. I should call the lock on the radio.'); }
  },
  hotspots: s => [
    { id: 'wharf', name: 'Canary Wharf', rect: [388, 24, 214, 116], walkTo: null, look: 'Canary Wharf. Banks, mostly. Somebody up there is doing maths for money.' },
    { id: 'gates', name: 'lock gates', rect: [190, 138, 260, 88], look: 'Limehouse Lock. Through these gates, the Thames: wide, brown and in a hurry.', verbs: { Open: 'Only the gatekeeper opens these. I should call on the radio.', Push: 'They weigh more than the boat. The gatekeeper works them.' } },
    { id: 'gauge', name: 'tide gauge', rect: [146, 154, 18, 68], look: 'A tide gauge in metres. The Thames goes up and down by more than six of them, twice a day.' },
    { id: 'buoy', name: 'channel buoy', rect: [310, 162, 14, 18], walkTo: null, look: 'A red channel buoy, bobbing on the river.' },
    ...when(s.boatAt === 'limehouse', boat(s, [0, 176, 212, 82], async sc => {
      if (sc.is('cleared')) return finale(sc);
      await sc.me('Not without clearance. The gatekeeper runs this lock.');
    }, { walkTo: 120 })),
    { id: 'capstan', name: 'capstan', rect: [420, 258, 28, 24], look: 'A capstan for hauling ropes. It has nothing to do with maths, which is a relief.' },
    { id: 'radio', name: 'lock radio', rect: [584, 172, 30, 38], walkTo: 560, look: 'A weatherproof radio to the gatekeeper’s hut. Press to talk.', verbs: { 'Talk to': radio, Use: radio, Push: radio } },
    { id: 'board', name: 'lock board', rect: [554, 210, 86, 40], walkTo: 560, look: '“LIMEHOUSE LOCK. CALL ON THE RADIO.” Somebody has added in biro: “HE CAN HEAR YOU.”' },
    exit('toWick', 'the Limehouse Cut', [0, 260, 10, 28], 'hackneywick', 'North up the Limehouse Cut to Hackney Wick.', 10),
  ],
};

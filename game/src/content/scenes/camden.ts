import { busker } from '../../art/sprites';
import type { Script } from '../../engine/script';
import type { SceneDef } from '../../engine/types';
import { boat, exit, talk, when } from '../common';
import { LOCK, near } from '../puzzles';

async function song(s: Script) {
  await s.say('roz', '♪ Four of the darkness the hipsters brew, ♪', '♪ Three of the light where the dead boats grew, ♪', '♪ Two of the water where the green things bloom, ♪', '♪ One of the cradle the swans left too soon. ♪');
  await s.say('gerald', 'SHUT UP, ROZ!');
  await s.say('roz', 'It’s PUBLIC PROPERTY, Gerald!', 'Old boaters’ song, that. Dot taught it me. It’s a paint recipe, if you believe the old-timers.');
  s.note('song');
}

async function roz(s: Script) {
  await talk(s, () => [
    ['Who are you?', () => s.say('roz', 'Roz. Camden born, Camden bred, and Camden is where I’ll be buried, whatever the council says about Poplar.', 'Thirty years in the housing co-op, and now they want to “decant” us. I’m not a bottle of wine, love.')],
    ['Why aren’t you on the main strip?', () => s.say('roz', 'Got moved on, didn’t I. Too much “character” for the tourists.', 'So now Gerald gets me for free.')],
    !s.is('gotPack') && !s.is('charged') && ['Could I borrow your power pack?', async () => {
      await s.say('roz', 'For the boat, is it? Dot’s old boat?', 'You can have it until my seven o’clock set. That’s five hours from now. Not a minute more.', 'But first, sign my petition. Save the co-op.');
      const i = await s.choose(['Sign the petition.', 'Er, maybe later.']);
      if (i === 1) { await s.me('Er, maybe later.'); return s.say('roz', 'Then the pack stays here. Like me.'); }
      await s.me('I sign: “Hypotenuse, of no fixed abode.”');
      await s.say('roz', 'Lovely. Here. Five hours, mind. I’ll be at the lock.');
      s.give('powerpack'); s.set('gotPack'); s.note('pack', 'packwindow');
    }],
    ['Sing me something?', () => song(s)],
    !s.is('gotMetronome') && ['Any tips for the lock?', async () => {
      await s.say('roz', 'Never guess a lock. Time it.', 'Here, have my metronome. Sixty a minute. I keep time in my bones anyway.');
      s.give('metronome'); s.set('gotMetronome'); s.note('metronome');
    }],
    s.is('gotMetronome') && ['Know anything about locks?', () => s.say('roz', 'Paddles, gates, patience. In that order.', 'And mind the cill. That ledge under the top gate has eaten more sterns than Gerald’s had hot dinners.')],
    ['What’s Hackney Wick like?', () => s.say('roz', 'Lads in beanies brewing beer in the bath.', 'I was singing on this towpath before that lot moved into the PO boxes they call studio apartments.')],
    ['Bye, Roz.', async () => { await s.say('roz', 'Ta-ra, love.'); return true; }],
  ]);
}

async function workLock(s: Script) {
  if (s.s.boatAt !== 'camden') return s.me('No point working the lock without the boat in it.');
  if (s.is('lockDone')) return s.me('We’re through already. One lock down, plenty of maths to go.');
  if (!s.has('metronome')) return s.me('I could wind the paddles open, but I need some way to time it. Too long and the stern lands on the cill.');
  if (!s.knows('lockboard')) { await s.me('The board says the lock drops 2.4 m, and the cill is 1.2 m down.'); s.note('lockboard'); }
  if (!s.knows('lockrate')) {
    await s.me('I’ll crack a paddle open and time it with Roz’s metronome.');
    await s.blackout('Tick… tick… tick…');
    await s.me('Ten centimetres every fifteen ticks. Then I wind it shut again.');
    s.note('lockrate');
  }
  const v = await s.ask('The stern has to stop level with the cill, 1.2 m down. How many seconds do you leave the paddles open?', { unit: 'seconds', facts: ['lockboard', 'lockrate', 'metronome'] });
  if (v === null) return s.me('I’ll work it out first.');
  const right = LOCK.cillM / LOCK.dropPerTicks * LOCK.ticks * 60 / LOCK.bpm; // 180 s
  if (near(v, right, 1)) {
    await s.blackout('…one hundred and seventy-nine… one hundred and eighty. Paddles shut!', () => s.set('lockDown'));
    await s.me('Spot on the cill mark. I nudge her forward, then let the rest of the water out.');
    await s.say('roz', 'Textbook! Dot would’ve had you on the tiller years ago.');
    s.set('lockDone');
  } else if (v > right) {
    await s.blackout('CRUNCH.');
    await s.me('The stern caught the cill and the whole boat tipped forward! Refill it, refill it!');
    await s.say('roz', 'Ooh. Do it properly, love.');
  } else {
    await s.me(`After ${v} seconds the water’s only down ${Math.round(v / LOCK.ticks * LOCK.dropPerTicks * 100)} cm. The stern’s still over the cill. I refill it and think again.`);
  }
}

export const camden: SceneDef = {
  id: 'camden', art: 'camden', title: 'Camden Lock',
  baseline: 284,
  walk: () => [12, 546],
  vis: s => ({ boat: s.boatAt === 'camden', lockDown: !!s.f.lockDown, packLent: s.inv.includes('powerpack'), painted: !!s.f.painted }),
  voices: { gerald: [506, 70] },
  entry: from => from === 'islington' ? [540, true] : from === 'cabin' || from === null ? [470, true] : [20, false],
  actors: () => [{ id: 'roz', sprite: busker, x: 576, b: 284, flip: true, h: 56 }],
  enter: async s => {
    if (!s.is('metRoz')) {
      s.set('metRoz');
      await s.say('roz', '♪ Oh the cut runs east and the cut runs deep… ♪');
      await s.say('gerald', 'SHUT UP, ROZ!');
      await s.say('roz', 'It’s PUBLIC PROPERTY, Gerald!');
    }
    if (s.s.boatAt === 'camden' && s.has('powerpack')) {
      await s.say('roz', 'There she is! And just in time for my set. I’ll have my pack back, ta.');
      s.take('powerpack');
    }
  },
  hotspots: s => [
    { id: 'warehouse', name: 'Camden Lock warehouse', rect: [446, 16, 194, 60], walkTo: null, look: 'Old canal warehouses. Now they sell incense and phone cases.' },
    { id: 'gerald', name: 'Gerald’s window', rect: [494, 78, 22, 22], walkTo: null, look: 'An open window. Behind it, someone is sighing very loudly.',
      verbs: { 'Talk to': async sc => { await sc.me('Gerald?'); await sc.say('gerald', 'WHAT?'); await sc.me('…Nothing.'); } } },
    { id: 'bridge', name: 'roving bridge', rect: [196, 104, 248, 46], walkTo: null, look: 'An iron roving bridge. Horses used to cross here, back when boats were horse-drawn.' },
    ...when(s.boatAt === 'camden', boat(s, [196, 160, 270, 76], async sc => {
      if (!sc.is('lockDone')) return sc.me('We’re sitting in the lock. First I have to drain it, without the stern catching the cill.');
      await sc.cruise('islington', 'Down through the Camden locks and east along the cut, to the mouth of the Islington Tunnel.');
    }, { walkTo: 330 })),
    { id: 'paddle', name: 'paddle gear', rect: [186, 210, 28, 30], walkTo: 220, look: 'The paddle gear on the lock gate. Wind it open with a windlass to let water out.',
      use: { windlass: workLock, metronome: 'I need to open the paddles with the windlass first.' }, verbs: { Use: 'I need a windlass to wind it.', Open: 'I need a windlass to wind it.' } },
    { id: 'beamL', name: 'balance beam', rect: [60, 212, 126, 56], look: 'The balance beam for the gate. Lean on it to swing the gate open.', verbs: { Push: sc => sc.me(sc.is('lockDone') ? 'It’s open already.' : 'The water pressure holds it shut. Drain the lock first.') } },
    { id: 'beamR', name: 'balance beam', rect: [460, 212, 90, 50], look: 'The other balance beam, painted black and white like a humbug.', verbs: { Push: 'It won’t move while the lock’s full.' } },
    { id: 'board', name: 'lock board', rect: [290, 236, 76, 42], look: async sc => { await sc.me('CAMDEN LOCK. DROP 2.4 M. CILL 1.2 M.', 'The cill is the stone ledge under the top gate. Drain too far with the stern over it and… crunch.'); sc.note('lockboard'); } },
    { id: 'bollard', name: 'bollard', rect: [406, 248, 18, 26], look: 'A cast-iron bollard, polished by two hundred years of rope.' },
    { id: 'roz', name: 'Roz', rect: [556, 174, 40, 110], walkTo: 522, look: 'A busker with a guitar, magnificent grey hair and a petition on a clipboard.',
      verbs: { 'Talk to': roz }, give: { powerpack: async sc => { if (!sc.is('charged')) return sc.me('I still need it to charge the boat.'); await sc.say('roz', 'Bring it with the boat, love, I’ll be at the lock.'); } } },
    { id: 'amp', name: 'amp', rect: [596, 250, 42, 34], walkTo: 546, look: 'Roz’s amp. The power pack clips onto the side.', verbs: { 'Pick up': 'Roz would pick ME up and put me in the canal.' } },
    { id: 'hat', name: 'tips hat', rect: [554, 276, 24, 10], walkTo: 540, look: 'Roz’s tips hat. Two pound coins and a button.', verbs: { 'Pick up': 'Stealing from a busker? Not today, not ever.' } },
    exit('toLV', 'the towpath to Little Venice', [0, 190, 12, 98], 'littlevenice', 'Back west along the towpath to Little Venice.', 12),
    exit('toAngel', 'the towpath to Islington', [610, 120, 30, 120], 'islington', 'East along the towpath, past the locks, to Islington.', 546),
  ],
};

import { legger } from '../../art/sprites';
import type { Script } from '../../engine/script';
import type { SceneDef } from '../../engine/types';
import { boat, exit, talk, when } from '../common';
import { ARCH, near } from '../puzzles';

async function prove(s: Script) {
  await s.say('tam', 'Can’t leg what don’t fit.', 'Arch is a circle, two metre radius, centre bang on the waterline.', 'Your cabin’s two metre wide, and one seventy-six high at the edges. I measured her while you weren’t looking.');
  s.note('arch', 'cabin');
  await s.say('tam', 'Prove she fits and I’ll leg her.');
  const v = await s.ask('The cabin’s edge is 1 m out from the middle of the arch. How high is the arch above the water there?', { unit: 'm', facts: ['arch', 'cabin'] });
  if (v === null) return s.say('tam', 'Take your time. I’ve got all day. I’ve had all day since 1974.');
  const h = Math.sqrt(ARCH.r ** 2 - ARCH.halfWidth ** 2);
  if (near(v, h, 0.011)) {
    await s.me('√(2² − 1²) = √3, about 1.73 m. And the cabin is 1.76 m.', 'She’s… three centimetres too tall.');
    await s.say('tam', 'Told you. Rules is rules.');
    s.set('proved');
  } else {
    await s.say('tam', 'Nah. I done that sum in me head every day for fifty year, and that ain’t it.');
  }
}

async function tam(s: Script) {
  await talk(s, () => [
    !s.is('legged') && ['Can you leg us through the tunnel?', async () => {
      if (s.s.boatAt !== 'islington') return s.say('tam', 'Ain’t got a boat, have you? Can’t leg air.');
      if (!s.is('proved')) return prove(s);
      await s.say('tam', 'Three centimetres too tall. Can’t leg what don’t fit.');
      await s.me('Unless the measurements somehow… didn’t count?');
    }],
    ['What’s legging?', () => s.say('tam', 'You lie on your back on a plank and walk along the tunnel roof. Thirty-five minutes, end to end.', 'Best legs in London, me.')],
    ['Why so strict?', () => s.say('tam', 'Last bloke who didn’t fit took the roof off his boat. And a bit of the tunnel. Rules is rules.')],
    ['Did you write R=? on the wall?', () => s.say('tam', 'Might have. Keeps the young ’uns thinking.')],
    ['Bye.', async () => { await s.say('tam', 'Rules is rules.'); return true; }],
  ]);
}

async function stick(s: Script) {
  if (!s.is('proved')) return s.me('Tam hasn’t even measured her yet. Let’s see what he says first.');
  s.take('label');
  await s.me('I stick the label on the cabin side, where Tam can see it.');
  await s.say('tam', 'What’s that say? “Diagram… NOT drawn to scale.”', '…', 'Well. If she ain’t to scale, then them measurements don’t apply, do they?', 'Rules is rules. Hop on.');
  s.set('legged');
  await s.cruise('hackneywick', 'Tam lies on the cabin roof and walks the Hypotenuse through 886 metres of dark. Not a scrape. Then east along the cut to Hackney Wick.');
}

export const islington: SceneDef = {
  id: 'islington', art: 'islington', title: 'Islington Tunnel',
  baseline: 286,
  walk: () => [196, 620],
  vis: s => ({ boat: s.boatAt === 'islington', paperTaken: !!s.f.paperTaken, painted: !!s.f.painted }),
  entry: from => from === 'hackneywick' ? [200, false] : from === 'cabin' || from === null ? [360, false] : [612, true],
  actors: () => [{ id: 'tam', sprite: legger, x: 552, b: 286, flip: true, h: 52 }],
  enter: async s => { if (!s.is('metTam')) { s.set('metTam'); await s.say('tam', 'Oi. Nobody goes through my tunnel without old Tam.'); } },
  hotspots: s => [
    { id: 'gasholders', name: 'gasholders', rect: [320, 54, 300, 106], walkTo: null, look: 'The old King’s Cross gasholder frames, black against the sunset. They’re flats now, obviously.' },
    { id: 'tunnel', name: 'Islington Tunnel', rect: [58, 106, 108, 110], walkTo: 200, look: 'Islington Tunnel: 886 metres long, and no towpath. Boats used to be legged through, by people lying on their backs and walking along the roof.' },
    { id: 'plaque', name: 'plaque', rect: [84, 70, 88, 26], walkTo: null, look: 'ISLINGTON TUNNEL. Opened 1820. No towpath, so the horses went over the hill.' },
    { id: 'chalk', name: 'chalk mark', rect: [206, 116, 42, 20], walkTo: null, look: 'Someone has chalked R=? on the bricks.' },
    ...when(s.boatAt === 'islington', boat(s, [150, 166, 272, 86], async sc => {
      if (!sc.is('legged')) return sc.me('The only way on is through the tunnel, and there’s no room for a towpath. I need Tam.');
      await sc.cruise('hackneywick', 'Through the tunnel and east to Hackney Wick.');
    }, { walkTo: 330, use: { label: stick }, give: {} })),
    { id: 'lamp', name: 'lamp post', rect: [292, 130, 20, 146], look: 'A lamp post. It’s on, which is a first for this canal.' },
    ...when(!s.f.paperTaken, { id: 'paper', name: 'soggy exam paper', rect: [446, 262, 28, 20], walkTo: 446,
      look: 'A soggy maths exam paper, blown down from the school at Angel. Question 7 has a sticker: “Diagram NOT drawn to scale.”',
      verbs: { 'Pick up': async (sc: Script) => { sc.set('paperTaken'); sc.give('label'); await sc.me('I peel the “NOT drawn to scale” sticker off question 7. The rest is mush.'); } } }),
    { id: 'tam', name: 'Old Tam', rect: [538, 226, 32, 60], walkTo: 520, look: 'A legger: a salty old man in a woolly hat with legs like tree trunks.',
      verbs: { 'Talk to': tam }, give: { label: async sc => { await sc.say('tam', '“Not drawn to scale.” Hm.', 'Stick it on the boat if it’s the boat you’re on about.'); } } },
    exit('toAngel', 'the steps up to Angel', [172, 232, 30, 46], 'hackneywick', 'Up the steps, over the hill at Angel, and down the far side. A long walk along the cut to Hackney Wick.', 200),
    exit('toCamden', 'the towpath to Camden', [626, 200, 14, 88], 'camden', 'West along the towpath to Camden.', 620),
  ],
};

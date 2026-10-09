import { legger } from '../../art/sprites';
import type { Script } from '../../engine/script';
import type { SceneDef } from '../../engine/types';
import { boat, exit, talk, when } from '../common';
import { ARCH, near } from '../puzzles';

// Tam's chalk sketch of the problem: the arch's cross-section with the cabin
// under it. Labels appear once the player has found each measurement.
function sketch(s: Script) {
  return (c: CanvasRenderingContext2D) => {
    const water = 156, cx = 300, m = 56; // 56 px per metre
    c.fillStyle = '#2d2b2b'; c.fillRect(0, 0, 600, 210);
    c.lineWidth = 3; c.font = '20px "Canal Digits", "Pixelify Sans", monospace'; c.textAlign = 'center';
    // the hull, the water and the half-circle arch
    c.fillStyle = '#7c1405'; c.fillRect(cx - 1.15 * m, water, 2.3 * m, 0.35 * m);
    c.strokeStyle = '#f3f2f2';
    c.beginPath(); c.moveTo(cx - 3.4 * m, water); c.lineTo(cx + 3.4 * m, water); c.stroke();
    c.beginPath(); c.arc(cx, water, 2 * m, Math.PI, 2 * Math.PI); c.stroke();
    // the cabin, 2 m wide and 1.76 m tall, centred under the arch
    c.strokeStyle = '#ff9783'; c.strokeRect(cx - m, water - 1.76 * m, 2 * m, 1.76 * m);
    // the question: how high is the arch above the cabin's top corner?
    const corner = cx + m, archAt = water - Math.sqrt(3) * m;
    c.strokeStyle = 'oklch(0.87 0.16 95)'; c.setLineDash([5, 5]);
    c.beginPath(); c.moveTo(corner + 6, water); c.lineTo(corner + 6, archAt); c.stroke(); c.setLineDash([]);
    c.fillStyle = 'oklch(0.87 0.16 95)'; c.fillText('?', corner + 22, water - 0.85 * m);
    if (s.knows('cabin')) {
      c.fillStyle = '#ffc4b8';
      c.fillText('2 m', cx, water - 1.76 * m + 24);
      c.textAlign = 'right'; c.fillText('1.76 m', cx - m - 8, water - 0.8 * m);
    }
    c.textAlign = 'center'; c.fillStyle = '#f3f2f2'; c.strokeStyle = '#f3f2f2'; c.lineWidth = 2;
    if (s.knows('arch')) {
      c.beginPath(); c.moveTo(cx - 2 * m, water + 30); c.lineTo(cx + 2 * m, water + 30);
      c.moveTo(cx - 2 * m, water + 24); c.lineTo(cx - 2 * m, water + 36); c.moveTo(cx + 2 * m, water + 24); c.lineTo(cx + 2 * m, water + 36); c.stroke();
      c.fillText('4 m across', cx, water + 52);
    }
    c.textAlign = 'left'; c.fillStyle = '#9b9797'; c.font = '16px "Pixelify Sans", monospace';
    c.fillText('Tam’s sketch', 12, 22);
  };
}

async function prove(s: Script) {
  await s.say('tam', 'Can’t leg what don’t fit. Rules is rules.', 'And it ain’t your middle that’ll catch, see. It’s your corners. That’s where the arch comes down to meet you.');
  if (!s.knows('arch') || !s.knows('cabin')) {
    await s.say('tam', 'I chalked her up on the wall when you came in. Plaque’ll tell you about my arch.', 'Go and have a look. I ain’t going anywhere.');
    return;
  }
  await s.say('tam', 'Well? Do your sums.');
  const v = await s.ask('Do the cabin’s top corners clear the arch? Work out how high the arch is directly above a corner.', { unit: 'm', diagram: sketch(s) });
  if (v === null) return s.say('tam', 'Take your time. I’ve got all day. I’ve had all day since 1974.');
  const h = Math.sqrt(ARCH.r ** 2 - ARCH.halfWidth ** 2);
  if (near(v, h, 0.011)) {
    await s.me('A corner’s 1 m out from the middle, and the arch has a 2 m radius. √(2² − 1²) ≈ 1.73 m.', 'The cabin’s 1.76 m. She’s… three centimetres too tall.');
    await s.say('tam', 'Told you. Rules is rules.', 'Mind you, I only go by the numbers. Numbers on a boat, numbers in a drawing. All the same to me.');
    s.set('proved');
  } else if (near(v, Math.sqrt(4 ** 2 - 1), 0.02)) {
    await s.say('tam', 'Nearly four metres? That’s an arch twice the size of mine. Four’s all the way across, sunshine.');
  } else if (near(v, ARCH.r, 0.01)) {
    await s.say('tam', 'Two metres is the top of the arch, right in the middle. I said corners.');
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
    }],
    ['What’s legging?', () => s.say('tam', 'You lie on your back on a plank and walk along the tunnel roof. Thirty-five minutes, end to end.', 'Best legs in London, me.')],
    ['Why so strict?', () => s.say('tam', 'Last bloke who didn’t fit took the roof off his boat. And a bit of the tunnel. Rules is rules.')],
    ['Did you draw that on the wall?', () => s.say('tam', 'Might have. Keeps the young ’uns thinking.')],
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
    { id: 'plaque', name: 'plaque', rect: [84, 70, 88, 26], walkTo: null, look: async sc => {
      await sc.me('“ISLINGTON TUNNEL. Opened 1820. Semicircular arch, 4 m across at water level. No towpath: horses went over the hill.”'); sc.note('arch');
    } },
    { id: 'chalk', name: 'chalk sketch', rect: [206, 100, 52, 36], walkTo: null, look: async sc => {
      await sc.me('A chalk sketch of a half-circle with a box under it. The box is labelled 2 M WIDE, 1.76 M TALL. Next to it: R = ?'); sc.note('cabin');
    } },
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

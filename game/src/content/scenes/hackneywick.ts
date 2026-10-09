import { hipster } from '../../art/sprites';
import type { Script } from '../../engine/script';
import type { SceneDef } from '../../engine/types';
import { boat, exit, talk, when } from '../common';
import { PAINT, TAG, TANK, near } from '../puzzles';

// The first call is the credit-card gag. The second comes once the player has got
// Jasper talking: his mum says exactly where she is, and he isn't listening.
async function phoneCall(s: Script) {
  s.set('onCall');
  await s.say('jasper', 'Mummy, I’ve told you. The Velvet Cellar is a COCKTAIL bar.');
  await s.say('mummy', 'It sounds very dark, darling. And what is “Just Fans”?');
  await s.say('jasper', 'It’s a VENTILATION subscription, Mummy. For the hydroponics.');
  await s.say('mummy', 'Well. Don’t think I won’t come and see for myself one of these days.');
  await s.say('jasper', 'You won’t. Bye, Mummy.');
  s.set('onCall', false); s.set('overheard');
  await s.say('jasper', 'Sorry. Family. What do you want?');
}

async function secondCall(s: Script) {
  s.set('onCall');
  await s.say('jasper', 'Oh, for… Hi, Mummy.');
  await s.say('mummy', 'Darling, I’m on the Overground, I’ve just left Stratford. I thought I’d surprise you!');
  await s.say('jasper', 'Mm-hm. Lovely, Mummy.');
  await s.say('mummy', 'So I’ll hop off at Hackney Wick, it’s only the next stop. I want to see this famous boat.');
  await s.say('jasper', 'Mm. Yes. Love you. Bye.');
  s.set('onCall', false); s.set('secondCall');
  await s.say('jasper', 'She never stops talking. I genuinely stopped listening in 2019. Where were we?');
}

/** Once Jasper has bragged about his tag and chatted about two other things, his mum rings back. */
async function maybeCall(s: Script) {
  const chatty = s.is('askedTag') && ['askedTap', 'askedBoat', 'askedDrink'].filter(f => s.is(f)).length >= 2;
  if (chatty && !s.is('secondCall')) await secondCall(s);
}

async function jasper(s: Script) {
  if (!s.is('overheard')) await phoneCall(s);
  await talk(s, () => [
    ['Nice tag.', async () => {
      await s.say('jasper', 'It’s not a tag. It’s a statement.', 'Every piece I do is also my lock code. Solve the piece, you’re in. If you’re clever enough, which you’re not.', 'Small to big, obviously. And negative numbers are very underground right now.');
      s.note('tag', 'tagcode'); s.set('askedTag'); await maybeCall(s);
    }],
    !s.is('hoseOff') && ['Can I use the tap?', async () => { await s.say('jasper', 'The tap is feeding my heritage tomatoes. Obviously.', 'It’s the only tap for miles, so: no.'); s.set('askedTap'); await maybeCall(s); }],
    ['Can I get a drink?', async () => { await s.say('jasper', 'Grab a schooner off the bar. Four hundred mil, line every hundred. For flights.', 'Not that you’d appreciate a flight.'); s.note('schooner'); s.set('askedDrink'); await maybeCall(s); }],
    ['What’s on your boat?', async () => { await s.say('jasper', 'Stout. My stout. Brewed in a bathtub, aged in irony.', 'And it’s padlocked, so don’t get ideas.'); s.set('askedBoat'); await maybeCall(s); }],
    s.is('secondCall') && !s.is('jasperGone') && ['Were you listening to your mum just then?', async () => {
      await s.say('jasper', 'Never. It’s always the cellar, the fans, the card statement. Why?');
      const opts = ['She said she’s getting off at Hackney Wick. Now.', 'She said she’s at the garden centre.', 'No reason.'];
      const i = await s.choose(opts);
      await s.me(opts[i]);
      if (i === 1) return s.say('jasper', 'Good. She can stay there. Forever, ideally.');
      if (i === 2) return s.say('jasper', 'Then why ask? God.');
      await s.say('jasper', '…Hackney Wick? She said Hackney WICK?', 'If she sees the boat, it’s over. If she sees the card statement, it’s REALLY over.', 'I’ll head her off at the station. She never lasts more than ten minutes round here, the noise gives her a migraine.');
      await s.say('jasper', 'Don’t touch my tomatoes. And if it’s the stout you’re after, the code’s on the wall. You’ll never get it, genius.');
      s.note('mummy'); s.set('jasperGone');
      await s.blackout('Jasper sprints off towards Hackney Wick station.');
      return true;
    }],
    ['Bye.', async () => { await s.say('jasper', 'Ciao. Or whatever.'); return true; }],
  ]);
}

async function openBoat(s: Script) {
  if (!s.is('jasperGone')) return s.say('jasper', 'Er, that’s my boat?');
  if (!s.is('padlockOpen')) {
    const code = await s.padlock();
    if (code === null) return;
    if (code !== TAG.code) return s.me(code.replace('-', '−') + '. Click… nope. Still locked.');
    s.set('padlockOpen');
    await s.me('Minus seven, four. Click! The padlock opens.');
  }
  if (!s.is('lootedBoat')) {
    s.set('lootedBoat');
    await s.me('Inside: a bathtub, nine bags of “ancient grain”, a stack of paper bags and crates of stout.', 'Jasper did say help yourself.');
    s.give('stout'); s.setNum('stout', PAINT.supply.stout); s.give('seeds'); s.give('paperbag');
    return;
  }
  if (!s.has('stout')) { s.give('stout'); s.setNum('stout', PAINT.supply.stout); return s.me('There’s more stout in the crate. Plenty more.'); }
  await s.me('I’ve taken what I need. The rest is bathtub.');
}

async function timeBucket(s: Script) {
  if (!s.is('hoseOff')) return s.me('Jasper’s hose is hogging the tap.');
  await s.me('I fill the bucket and count the metronome’s ticks.');
  await s.blackout('Tick… tick… tick…');
  await s.me('Ten litres in twelve ticks.');
  s.note('flow');
}

async function fillTank(s: Script) {
  if (!s.is('hoseOff')) return s.is('jasperGone') ? s.me('Jasper’s hose is still plugged into the tap.') : s.say('jasper', 'Hands off the tap. Heritage tomatoes, remember?');
  if (s.s.boatAt !== 'hackneywick') return s.me('The boat’s not here. Nothing to fill.');
  if (s.is('tankFull')) return s.me('The tank’s full to the brim.');
  if (!s.knows('tank')) return s.me('How big is our tank, anyway? There’s a plate on it in the cabin.');
  if (!s.knows('flow')) return s.me('How fast does this tap run? I could time how long it takes to fill that bucket.');
  const v = await s.ask('The hose fills the boat’s tank. How many minutes do you run it?', { unit: 'minutes', facts: ['tank', 'flow', 'metronome', 'mummy'] });
  if (v === null) return;
  const need = TANK.litres / (TANK.bucket / TANK.ticks * 60); // 9 min
  if (v > TANK.mummyMins) return s.me(`${v} minutes? Jasper will be back in ${TANK.mummyMins}, and he’ll want his tap. Better work it out properly.`);
  if (v < need - 0.05) return s.me(`After ${v} minutes it would only be ${Math.round(v / need * 100)}% full.`);
  await s.blackout('The hose glugs away…', () => s.set('tankFull'));
  await s.me(near(v, need, 0.05) ? 'Nine minutes on the dot: full to the brim, and no sign of Jasper.' : 'It was full after nine minutes. Still no sign of Jasper.');
}

async function useBoat(s: Script) {
  const i = await s.choose(['Up the River Lea to Stonebridge.', 'Down to Limehouse and the Thames.', 'Stay here.']);
  if (i === 0) await s.cruise('stonebridge', 'North up the River Lea, under the motorways and past the marshes, to Stonebridge Lock.');
  if (i === 1) await s.cruise('limehouse', 'South down the Limehouse Cut, past the gasworks, to Limehouse Basin and the Thames.');
}

export const hackneywick: SceneDef = {
  id: 'hackneywick', art: 'hackneywick', title: 'Hackney Wick',
  baseline: 284,
  walk: () => [10, 630],
  vis: s => ({ boat: s.boatAt === 'hackneywick', hoseOff: !!s.f.hoseOff, padlockOpen: !!s.f.padlockOpen, schoonerTaken: !!s.f.schoonerTaken, painted: !!s.f.painted }),
  voices: { mummy: [508, 150] },
  entry: from => from === 'islington' ? [16, false] : from === 'limehouse' ? [624, true] : from === 'stonebridge' ? [300, false] : [300, false],
  actors: s => s.f.jasperGone ? [] : [{ id: 'jasper', sprite: hipster, x: 510, b: 284, flip: true, h: 52, pose: { phone: !!s.f.onCall } }],
  enter: async s => {
    if (!s.is('sawWick')) { s.set('sawWick'); await s.me('Hackney Wick! Every wall is a painting and every boat is a bar.'); }
  },
  hotspots: s => [
    { id: 'stadium', name: 'London Stadium', rect: [330, 72, 270, 72], walkTo: null, look: 'The Olympic Stadium. West Ham play there now. Every other Saturday it sounds like the sky is falling.' },
    { id: 'orbit', name: 'the Orbit', rect: [282, 22, 40, 120], walkTo: null, look: 'The ArcelorMittal Orbit: a big red tangle with a slide down the middle.' },
    { id: 'wick', name: 'WICK piece', rect: [26, 158, 74, 32], walkTo: null, look: 'A huge yellow WICK. Proper graffiti.' },
    { id: 'tag', name: 'Jasper’s tag', rect: [376, 156, 178, 46], walkTo: null, look: async sc => { await sc.me('A big pink tag: x² + 3x = 28.', 'Somebody really wanted that to look edgy.'); sc.note('tag'); } },
    { id: 'mural', name: 'mural', rect: [206, 166, 160, 60], walkTo: null, look: 'A pink face with yellow hair, beaming at the canal. It looks happier than anyone on the towpath.' },
    { id: 'bar', name: 'canalside bar', rect: [556, 152, 84, 50], walkTo: 600, look: 'Jasper’s bar. Everything comes in a schooner, and there’s a basket of very expensive bread.',
      verbs: { 'Pick up': async sc => {
        if (sc.is('chalkTaken')) return sc.me('I’ve already pinched a label. One crime per bar.');
        sc.set('chalkTaken'); sc.give('chalklabel');
        await sc.me('I take a tiny chalk label from the bread basket. It says POSH.');
      }, 'Talk to': 'The bar’s closed till the vibes are right, says a sign.' } },
    ...when(!s.f.schoonerTaken, { id: 'schooners', name: 'stack of schooners', rect: [614, 172, 20, 20], walkTo: 600, look: 'A stack of schooner glasses.',
      verbs: { 'Pick up': async (sc: Script) => { sc.set('schoonerTaken'); sc.give('schooner'); sc.note('schooner'); await sc.me('A schooner. Four hundred millilitres, with a line every hundred.'); } } }),
    { id: 'jboat', name: 'Jasper’s boat', rect: [440, 184, 168, 62], walkTo: 560, look: 'A green narrowboat with tomatoes growing out of the roof. The door has a padlock with three dials.',
      verbs: { Open: openBoat, Use: openBoat, 'Pick up': 'Of the tomatoes? Jasper would cry.' } },
    { id: 'padlock', name: 'padlock', rect: [566, 206, 20, 16], walkTo: 560, look: 'A three-dial padlock. Each dial turns through minus and 0 to 9.', verbs: { Open: openBoat, Use: openBoat, Pull: openBoat } },
    ...when(s.boatAt === 'hackneywick', boat(s, [24, 166, 286, 86], useBoat, { walkTo: 160 })),
    ...when(!s.f.hoseOff, { id: 'hose', name: 'Jasper’s hose', rect: [412, 236, 52, 24], walkTo: 424, look: 'A green hose from the tap to Jasper’s tomato rig on the roof.',
      verbs: { Pull: async (sc: Script) => {
        if (!sc.is('jasperGone')) return sc.say('jasper', 'Touch that hose and I’ll pour you into a schooner.');
        sc.set('hoseOff'); await sc.me('I unplug Jasper’s hose. Sorry, heritage tomatoes.');
      }, 'Pick up': 'It’s plugged into the tap.' } }),
    { id: 'tap', name: 'water tap', rect: [396, 242, 22, 36], walkTo: 410, look: 'A water point. The only tap on this stretch of the cut.', verbs: { Use: fillTank, Open: fillTank }, use: { metronome: timeBucket } },
    { id: 'bucket', name: 'bucket', rect: [376, 260, 20, 20], walkTo: 400, look: 'A ten-litre bucket, for filling boat tanks the slow way.', verbs: { Use: 'I could time how long the tap takes to fill it. I need something that keeps time.', 'Pick up': 'I’ll leave it by the tap.' }, use: { metronome: timeBucket } },
    { id: 'planters', name: 'planters', rect: [248, 248, 30, 34], look: 'Planters full of wildflowers, all labelled “rewilded”.' },
    ...when(!s.f.jasperGone, { id: 'jasper', name: 'Jasper', rect: [494, 226, 32, 58], walkTo: 440, look: 'A man with a quiff, a flowery shirt and a beard you could lose a schooner in, vaping over his flat white.', verbs: { 'Talk to': jasper } }),
    exit('toLea', 'the River Lea towpath', [284, 232, 42, 46], 'stonebridge', 'North up the River Lea towpath, past the marshes, to Stonebridge Lock.', 300),
    exit('toIslington', 'the towpath to Islington', [0, 200, 10, 88], 'islington', 'West along the cut to Islington.', 10),
    exit('toLimehouse', 'the Limehouse Cut', [630, 200, 10, 88], 'limehouse', 'South down the Limehouse Cut to Limehouse Lock.', 630),
  ],
};

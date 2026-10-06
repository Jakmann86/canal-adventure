import type { Content } from '../engine/game';
import { items } from './items';
import { cabin } from './scenes/cabin';
import { camden } from './scenes/camden';
import { cheshunt } from './scenes/cheshunt';
import { hackneywick } from './scenes/hackneywick';
import { islington } from './scenes/islington';
import { limehouse } from './scenes/limehouse';
import { littlevenice } from './scenes/littlevenice';
import { stonebridge } from './scenes/stonebridge';

// Speech colours. The player and Barnaby use the design's white and accent-300.
const speakers = {
  player: { name: 'You', color: '#f3f2f2' },
  barnaby: { name: 'Barnaby', color: '#ffc4b8' },
  roz: { name: 'Roz', color: 'oklch(0.8 0.13 330)' },
  gerald: { name: 'Gerald', color: 'oklch(0.8 0.14 60)' },
  tam: { name: 'Old Tam', color: 'oklch(0.87 0.16 95)' },
  jasper: { name: 'Jasper', color: 'oklch(0.82 0.1 190)' },
  mummy: { name: 'Mummy', color: 'oklch(0.82 0.1 300)' },
  keith: { name: 'Keith', color: 'oklch(0.8 0.1 250)' },
  gatekeeper: { name: 'The gatekeeper', color: 'oklch(0.85 0.14 145)' },
  swan: { name: 'The swan', color: '#f3f2f2' },
};

// Everything the player learns goes into the notebook. Puzzles show the relevant entries.
const facts: Record<string, string> = {
  letter: 'Dot’s letter: get the Hypotenuse out of Limehouse Lock onto the Thames on the next spring tide, at sunset.',
  battery: 'The boat’s battery bank holds 1800 Wh, and it’s flat.',
  pack: 'Roz’s power pack puts out 400 W.',
  packwindow: 'Roz needs the pack back for her set in 5 hours.',
  song: 'Roz’s paint song: “Four of the darkness the hipsters brew, / Three of the light where the dead boats grew, / Two of the water where the green things bloom, / One of the cradle the swans left too soon.”',
  metronome: 'Roz’s metronome ticks 60 times a minute: one tick a second.',
  lockboard: 'Camden Lock drops 2.4 m. The cill is 1.2 m down: the stern has to stop there before the boat moves forward.',
  lockrate: 'With a paddle open, Camden Lock falls 10 cm every 15 ticks of the metronome.',
  arch: 'Islington Tunnel: the arch is a circle of radius 2 m, centred on the waterline.',
  cabin: 'The Hypotenuse is 2 m wide, and her cabin is 1.76 m tall at the edges.',
  tag: 'Jasper’s tag on the wall: x² + 3x = 28.',
  tagcode: 'Jasper’s padlock code is his tag’s roots, lowest first. Minus signs count.',
  tank: 'The boat’s water tank holds 450 litres.',
  flow: 'The Hackney Wick tap fills a 10-litre bucket in 12 ticks of the metronome.',
  mummy: 'Jasper’s mum never stays more than 10 minutes. Then he’ll want his tap back.',
  schooner: 'A schooner glass holds 400 ml, with a line every 100 ml.',
  tinsize: 'Keith’s paint tin holds 2 litres.',
  double: 'The glowing mushrooms are double strength. Keith’s daughter always uses half.',
  tide1: 'Low water at Limehouse: 23:54 last night, 0.8 m on the gauge.',
  tide2: 'The next low water is at 12:18 today.',
  tide3: 'At high water, spring tides reach 6.6 m.',
  nodark: 'The gatekeeper won’t let anyone out onto the Thames in the dark.',
};

export const content: Content = {
  scenes: { littlevenice, cabin, camden, islington, hackneywick, stonebridge, cheshunt, limehouse },
  items, speakers, facts,
  start: 'littlevenice',
  intro: async s => {
    await s.say('barnaby', 'There you are! You’ll be Dot’s family. She said you’d come.');
    await s.me('I got a letter. And, apparently, a boat?');
    await s.say('barnaby', 'Come and have a word. I’ve got her keys here somewhere.');
  },
};

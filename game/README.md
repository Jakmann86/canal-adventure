# The Regent’s Canal Problem

A short pixel-art point-and-click maths adventure on London’s canals: get Great-aunt Dot’s narrowboat, the *Hypotenuse*, from Little Venice to the Thames on the spring tide. It takes about 15–20 minutes to play.

The game follows the **Canal Adventure game design document**. The art and interface come from the Claude Design handoff in `../project/Canal Adventure Scenes.dc.html`: the eight 640×288 scenes drawn in code, the LucasArts nine-verb grid, the sentence line and the inventory, in Pixelify Sans.

## Running it

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # type-checks, then builds a static site in dist/
```

There's no backend. Progress saves to `localStorage` after every action.

## How to play

Pick a verb and click something in the scene. **Use** and **Give** work with inventory items (“Use crusts with stove”). Clicking with no verb walks; clicking an exit leaves the scene. Right-click to look at things. Press **Esc** for the menu (notebook, dithering on/off, show hotspots). Press **Space** to skip a line of dialogue.

Everything you learn goes into the **graph-paper notebook**. When a puzzle asks for an answer, it shows the notebook entries that matter. Nothing gives you the question ready-made: you find the numbers by talking to people and looking at things.

## Route and puzzles

| Where | Who | Maths | Method from |
| --- | --- | --- | --- |
| Little Venice | Barnaby, on the bench | none (tutorial) | |
| Camden Lock | Roz the busker; Gerald, from his window | Rates: charge time = 1800 Wh ÷ 400 W, inside Roz’s 5-hour loan | Battery label, power pack label |
| Camden Lock | | Rates: 10 cm per 15 ticks, so stopping at the cill 1.2 m down takes 180 s | Roz’s metronome, lock board |
| Islington Tunnel | Old Tam the legger | Circles: the arch is 4 m across, so its radius is 2 m; above a cabin corner 1 m out it’s √(2² − 1²) ≈ 1.73 m < 1.76 m. A sketch of the arch and cabin comes with the question, and Tam has replies for common slips (span as radius, top of arch) | The tunnel plaque (span), Tam’s chalk sketch (cabin size), Tam (“it’s the corners that catch”) |
| Hackney Wick | Jasper the hipster (and Mummy, on the phone) | Quadratics: x² + 3x = 28 gives roots −7 and 4, so the padlock is `−74` | Jasper’s bragging (“solve the piece, you’re in; small to big”) |
| Hackney Wick | | Volume ÷ rate: 450 L at 50 L/min is 9 min, before Jasper is back in 10 | Tank plate, bucket and metronome, Mummy |
| Stonebridge | Keith | Ratio: 4 : 3 : 2 : 1 of a 2 L tin, with the mushrooms halved because they’re double strength: 800 / 300 / 400 / 200 ml | Roz’s song, Keith’s tin, his Singapore story, Jasper’s schooner |
| Cheshunt | The fierce swan | none (ingredient source) | |
| Limehouse | The gatekeeper, on the radio | Sinusoidal modelling: lows at 23:54 and 12:18 give high water at 06:06 (dark, refused) and 18:30 | His rambling, plotted on Dot’s chart plotter |

Item chains: crusts → toasted on the stove → seeds → paper bag with chalk label → *Heritage Grain Sourdough* (for the swan); the NOT TO SCALE sticker goes on the boat for Tam; paint tin + schooner + stout, mushrooms, algae water and eggshell → Gunnel Green (for Keith).

**Getting rid of Jasper** takes conversation. His first call is the credit-card gag. Once you’ve got him talking (the tag plus two other topics), Mummy rings again and says exactly where she is, while he isn’t listening. Tell him, and he runs for the station.

Wrong answers never end the game. Guessing in the paint tin wastes scarce ingredients, so you have to go back for more (Jasper’s crate, the mushrooms, the lock, the nest), which makes working it out the better move.

## Decisions on the GDD’s open questions

These are my calls. Each one is easy to change in `src/content/`.

- **The relative and the payoff:** Great-aunt Dot. On the Thames, a second page of her letter says you did every sum yourself.
- **What Roz wants for the power pack:** your signature on her housing co-op petition.
- **What Keith fixes:** the stern gear and stern gland, plus a repaint in his paint. That covers the gatekeeper’s “fixed and painted” check.
- **The algae-bloom stretch:** Stonebridge Lock. Keith’s jam jar scoops it up.
- **How the exam paper reaches the tunnel:** it blew down from the school at Angel.
- **Cheshunt:** only an ingredient source for now (mushrooms and the swan’s nest), as in the GDD. No puzzle yet.
- **Audience:** the Just Fans and heritage-tomato jokes stay in, kept mild. They’re in `scenes/hackneywick.ts` if they need to go.
- **Interaction style:** a mix. Most answers are typed into a “Work it out” prompt. The padlock (dials), the paint (pouring schooners) and the tide (the plotter graph) are hands-on.
- **Scenes:** the GDD’s seven locations map onto the design’s scenes: Camden Lock = Camden; Islington = the design’s Islington Tunnel/King’s Cross scene; plus the boat interior. The design’s puzzle boards were reworded to carry the GDD’s data (CILL 1.2M, Jasper’s tag, Keith’s sign, the lock radio). The design’s Pythagoras board at Little Venice became a route board, because the GDD keeps Little Venice maths-free.
- **Hackney Wick is visited twice:** on foot (any time after Camden) and by boat. Walking ahead is allowed, but the boat only moves past each obstacle once it’s solved. Going to Limehouse before visiting Keith fails the engine check.

## Code layout

```
src/
  art/        kit.ts (drawing primitives and palette), scenes.ts (backgrounds, ported from the design),
              sprites.ts (characters, drawn at 2×), icons.ts (inventory)
  engine/     game.ts (loop, rendering, input, verbs, speech, dialogue), script.ts (the API for content scripts),
              panels.ts (number prompt, padlock, plotter, paint tin, notebook), state.ts (save/load), types.ts
  content/    index.ts (speakers, notebook facts), items.ts, puzzles.ts (every puzzle number in one place),
              common.ts, scenes/*.ts (one file per location: hotspots, characters, dialogue, puzzles)
```

Scenes are plain data plus async scripts:

```ts
{ id: 'paddle', name: 'paddle gear', rect: [186, 210, 28, 30],
  look: 'The paddle gear…', use: { windlass: workLock } }
```

```ts
async function workLock(s: Script) {
  const v = await s.ask('How many seconds…?', { unit: 'seconds', facts: ['lockboard', 'lockrate'] });
  if (near(v, 180, 1)) { await s.blackout('…'); s.set('lockDone'); }
}
```

The screen is 640×400, laid out at 2× like the design (1280×576 scene, 44 px sentence line, 178 px verb and inventory panel) and scaled to fit the window. In dev builds the game object is available as `window.game`.

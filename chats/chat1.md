# Sierra-inspired math adventure

_Started 2026-10-05 10:57 UTC_

---

## User

I want to create the grpahics for a beaiful sierra online, lucasart inspired poitn and click maths mini adventure.

## Assistant



## User

Answered — audience: Teens (algebra, geometry); setting: Something else (say below); setting_other: On a canal boat, around the london canals; deliverable: 2–3 game scenes; playable: Static mockups; interface: LucasArts verb grid (Look, Pick up, Use…); pixel: 640×400 finer; art: Draw it all in code; variations: 2 scene options

## Assistant

_[tool: ask_user]_

_[tool: list_files]_

_[tool: grep]_

_[tool: read_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: dc_write]_

_[tool: show_html]_

_[tool: show_html]_

_[tool: multi_screenshot]_

_[tool: run_script]_

_[tool: multi_screenshot]_

_[tool: show_html]_

_[tool: multi_screenshot]_

_[tool: ready_for_verification]_

I've made two 640×400 pixel-art scenes for your canal adventure, side by side in one file:

- **1a Camden Lock, day:** red-brick warehouses, the iron footbridge, black-and-white lock-gate beams and the narrowboat *Hypotenuse*. A chalkboard sets the algebra puzzle (how long the lock takes to fill), and the old boater, Barnaby, reads it out.
- **1b Islington Tunnel, dusk:** the King's Cross gasholder frames against a red sunset, the brick tunnel arch with a lit headlamp, and the narrowboat *Sohcahtoa*. The geometry puzzle is whether the boat's cabin fits under the arch, and the teenage hero asks it.

Both have the LucasArts nine-verb grid, a sentence line and a four-item inventory (windlass, protractor, notebook, rope). Hovering over objects and clicking verbs updates the sentence line; there are no responses or game logic, since you asked for static mockups.

All the art is drawn in code using only the design system's ink, grey and red, so the brick and boats come out red and everything else is greyscale. The characters' pixels are twice the size of the background's, which is a little chunkier than the scenery.

There are two settings: turn the dithered colour transitions on or off, and outline the clickable areas.

## User

Ok great a night time scene at Cheshunt lakes, the gate the thames at limehouse. The graffiti coll bars at hackney wick perhaps with the west ham stadium in the background.

## Assistant

_[tool: run_script]_

_[tool: show_html]_

_[tool: multi_screenshot]_

_[tool: run_script]_

_[tool: show_html]_

_[tool: multi_screenshot]_

_[tool: ready_for_verification]_

I've added three new scenes as Turn 2, above the original two:

- **2a Cheshunt Lakes, night:** moon, electricity pylons with sagging cables, swans on the lake, reeds, the boat with lit windows and a CHESHUNT fingerpost. Barnaby asks how far a parabolic cable sags between the pylons.
- **2b Limehouse Lock, grey morning:** the lock gates sit half open with the Thames, a red buoy and the Canary Wharf towers beyond. There's a tide gauge and a capstan, and a board reading "H = 4+3SIN(T), GATES H>5" sets up a tide-window puzzle.
- **2c Hackney Wick, afternoon:** graffiti walls with a "WICK" piece and a sprayed x² = 5x − 6, a canalside bar with festoon lights and umbrellas, the stadium's roof truss and the red Orbit tower. Mooring posts numbered 2 and 3 match the equation's two answers.

Each scene has the same verb grid and inventory, with its own clickable objects that update the sentence line.

In 2b and 2c the white speech text with a dark outline sits on a pale sky, so it's harder to read there than in the night scenes.

## User

Ok I like some of these idea sespecially for the maths, but hackney wick needs to have more colour ro it, london is just damp and grey it can be bright an colouful especially at hackney wick.

## Assistant

Hackney Wick gets its own bright colours, mixed in OKLCH to sit alongside the red ramp. The interface stays Modernist.

_[tool: run_script]_

_[tool: show_html]_

_[tool: multi_screenshot]_

_[tool: ready_for_verification]_

Hackney Wick (2c) is now a bright summer afternoon. It has:
- a blue sky, yellow-brick buildings with blue windows and a teal-green canal
- murals in purple, pink, teal and yellow, plus a cartoon face
- the equation on a purple panel above a green strip with flowers
- multicoloured bunting, umbrellas and people outside the bar
- a green-and-yellow narrowboat moored with flower pots on its roof
- orange planters along the towpath

These colours go beyond your design system, which only has red and greys. I mixed them to match the brightness of its red shades so they sit together. They're used only in this scene: the menus and the other four scenes are unchanged.

You can now also hover over the mural, the moored boat and the planters.

## User

ok can you create inside the boat also

## Assistant

_[tool: run_script]_

_[tool: show_html]_

_[tool: multi_screenshot]_

Fixing the label wrap and the speech overlapping the bookshelf.

_[tool: run_script]_

_[tool: ready_for_verification]_

I've added the boat's interior as Turn 3 (3a), at the top of the page. It's a cut-away side view of the cabin:

- **Stove end:** a wood-burner with the fire going, a kettle on top, teal tiles behind and a log basket.
- **Shelves and walls:** colourful books and a trailing plant on the shelves, three painted plates and a brass oil lamp on the wall.
- **Windows:** three portholes with pink check curtains, looking out onto canal-side colour.
- **Seating:** a red bench with a black cat asleep on it, and the canal map and a mug of tea on the table.
- **Galley:** a sink, cupboards, hanging pans and a painted canal water can.
- **Floor:** wooden floorboards with a striped rag rug.

The maths puzzle is on a whiteboard showing a route from Limehouse to Islington to Camden (8 km, then 5 km). It notes "4 mph" and "lock 15 min", and asks for the total time. Barnaby reads it out.

Barnaby's speech sits near the bottom of the scene, so it may overlap the teen's legs. I moved it there after my last look and haven't re-checked it. You can hover over 13 objects in the cabin.

## User

Found issues — fixing…

## Assistant

_[tool: run_script]_

_[tool: ready_for_verification]_

I've moved Barnaby's speech in the cabin scene (3a) off the teen and the rug. It now sits higher up on the open wood wall, between the table and the whiteboard. I haven't looked at it myself yet; a final check is running.

## User

Ok I guess we want to start with little venice and also have a boat repair place like stonebridge lock.

## Assistant

_[tool: run_script]_

_[tool: show_html]_

_[tool: multi_screenshot]_

_[tool: grep]_

_[tool: run_script]_

_[tool: run_script]_

_[tool: run_script]_

_[tool: show_html]_

_[tool: multi_screenshot]_

_[tool: run_script]_

_[tool: ready_for_verification]_

I've added Turn 4 at the top of the page, with two new scenes:

- **4a Little Venice (opening scene):** white stucco villas, a weeping willow on the island, a blue iron bridge and a striped café boat. The *Hypotenuse* is moored at the front, with a fingerpost and street lamp on the towpath. Barnaby hands the boat over and sets the first puzzle: the pool is a right triangle, 30 by 40 metres, so how far is it straight across? (Pythagoras; the answer is 50.)
- **4b Stonebridge Lock boatyard:** a yellow gantry crane and a blue corrugated workshop with tools and welding sparks. The narrowboat *Tangent* is up on blocks with its hull half repainted black and half rusty, next to the lock, oil drums, a propeller and paint tins. A chalkboard sets the puzzle: both sides of an 18 × 0.7 m hull, with one tin covering 6 m². That's 25.2 m², or 4.2 tins, so the answer is 5 tins.

Both scenes use the brighter colours from Hackney Wick, and you can hover over 9–10 objects in each. I changed the rust pattern on the *Tangent*'s hull after my last look and haven't seen that version yet.

## User

I dont want the modernist writing it doesnt fir with the asthetic have it in the same style the speech and the buttons.

## Assistant

_[tool: run_script]_

_[tool: show_html]_

_[tool: multi_screenshot]_

_[tool: ready_for_verification]_

I've switched the speech, sentence line and verbs in all eight scenes to Pixelify Sans, a pixel font that matches the art. I also gave the verb panel a dark, classic LucasArts look:
- **Verbs:** teal, brightening on hover, with the selected verb in yellow.
- **Sentence line:** centred, with the hovered object name in yellow.
- **Inventory:** dark slate slots.

The section titles and puzzle notes above each scene still use the old font, since they're labels for this page rather than part of the game.

One thing to watch: the windlass icon is mostly black, so it's hard to see on the new dark inventory slots. I can lighten its outline if you'd like.


import type { Kit } from '../art/kit';
import type { Vis } from '../art/scenes';
import type { Pose, SpriteFn } from '../art/sprites';
import type { Script } from './script';

export const VERBS = ['Give', 'Open', 'Close', 'Pick up', 'Look at', 'Talk to', 'Use', 'Push', 'Pull'] as const;
export type Verb = typeof VERBS[number];

export type SceneId = 'littlevenice' | 'cabin' | 'camden' | 'islington' | 'hackneywick' | 'stonebridge' | 'cheshunt' | 'limehouse';

export type Handler = (s: Script) => Promise<void> | void;
/** A handler, or a line for the player to say. */
export type Response = Handler | string;

export type Rect = [x: number, y: number, w: number, h: number];

export interface Hotspot {
  id: string;
  name: string;
  rect: Rect;
  /** Where the player walks before interacting. `null` = don't walk. Default: centre of the rect. */
  walkTo?: number | null;
  /** Runs after the player walks here with no verb selected. Exits use this to change scene. */
  walk?: Response;
  /** Shown with an arrow cursor and "Go to" in the sentence line. */
  isExit?: boolean;
  look?: Response;
  verbs?: Partial<Record<Verb, Response>>;
  /** Responses to "Use <item> with this", keyed by item id. */
  use?: Record<string, Response>;
  /** Responses to "Give <item> to this", keyed by item id. */
  give?: Record<string, Response>;
}

export interface Actor {
  id: string;
  sprite: SpriteFn;
  /** Centre x and baseline, in scene pixels. */
  x: number;
  b: number;
  flip?: boolean;
  /** Sprite width in sprite units (drawn at 2×). */
  w?: number;
  /** Sprite height in sprite units, used to anchor speech. */
  h?: number;
  pose?: Pose;
}

export interface GameState {
  scene: SceneId;
  x: number;
  flip: boolean;
  inv: string[];
  f: Record<string, boolean>;
  n: Record<string, number>;
  facts: string[];
  boatAt: SceneId;
  tin: Record<string, number>;
}

export interface SceneDef {
  id: SceneId;
  art: string;
  title: string;
  baseline: number;
  walk: (s: GameState) => [min: number, max: number];
  vis?: (s: GameState) => Vis;
  hotspots: (s: GameState) => Hotspot[];
  actors?: (s: GameState) => Actor[];
  /** Speech anchors for off-screen or disembodied voices (top-centre of the text). */
  voices?: Record<string, [number, number]>;
  /** Animated layer under the actors. */
  fx?: (g: Kit, s: GameState, t: number) => void;
  /** Layer drawn in front of the actors. */
  fg?: (g: Kit, s: GameState, t: number) => void;
  /** Where the player appears, given the scene they came from. */
  entry: (from: SceneId | null, s: GameState) => [x: number, flip: boolean];
  /** Runs after every arrival. */
  enter?: Handler;
}

export interface ItemDef {
  id: string;
  name: string;
  icon?: string;
  look: Response;
  verbs?: Partial<Record<Verb, Response>>;
  /** "Use this with <other item>", keyed by the other item's id. Checked in both directions. */
  use?: Record<string, Response>;
}

export interface Speaker {
  name: string;
  color: string;
}

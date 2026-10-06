import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/600.css';
import './style.css';
import { content } from './content';
import { Game } from './engine/game';

const game = new Game(content);
game.mount(document.getElementById('app')!);

// Handy for debugging and automated play-tests.
if (import.meta.env.DEV) (window as unknown as { game: Game }).game = game;

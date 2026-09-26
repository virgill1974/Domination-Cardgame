import type { GameState } from './engine/state';

const KEY = 'domination-save';

export function saveGame(game: GameState | null) {
  try {
    if (game) localStorage.setItem(KEY, JSON.stringify(game));
    else localStorage.removeItem(KEY);
  } catch {
    // Speicher nicht verfügbar (z. B. privater Modus): Spiel läuft ohne Sicherung weiter
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    const game = raw ? (JSON.parse(raw) as GameState) : null;
    return game?.version === 1 ? game : null;
  } catch {
    return null;
  }
}

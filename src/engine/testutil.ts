import { CARDS, type Faction } from './data';
import { cardIdOfEan } from './cards';
import { newGame, type GameState, type Rng } from './state';
import { beginTurn } from './turn';

/** Würfel liefert nacheinander die angegebenen Augenzahlen. */
export function dice(...rolls: number[]): Rng {
  let i = 0;
  return () => {
    if (i >= rolls.length) throw new Error('Keine Würfel mehr');
    return (rolls[i++] - 1) / 6 + 0.01;
  };
}

export const noDice: Rng = () => {
  throw new Error('Unerwarteter Wurf');
};

/** Neues Spiel, erster Spieler ist am Zug (Runde 1, Startgebäude aktiv). */
export function started(seats: Faction[], vpLimit: number | null = 30): GameState {
  const s = newGame(seats, vpLimit);
  beginTurn(s, noDice);
  return s;
}

/** Legt eine Karte direkt ins Inventar, standardmäßig aktiviert und gezählt. */
export function give(s: GameState, faction: Faction, ean: number, active = true) {
  const p = s.players[faction];
  const id = cardIdOfEan(ean);
  const i = p.slots.indexOf(null);
  p.slots[i] = { ean, def: s.stats[id].def, remaining: active ? 0 : CARDS[id].rounds, active, attacked: false, counted: active };
  if (active && ean % 40 < 14) p.buildings++;
  else if (active && ean % 40 < 34) p.units++;
  return p.slots[i]!;
}

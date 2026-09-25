import { MEDAL_MIN_BUILDINGS, MEDAL_MIN_STARS, MEDAL_POINTS } from './data';
import type { GameEvent } from './events';
import { currentFaction, type GameState, type Player } from './state';

/** siegpunkte_berechnen */
export function victoryPoints(p: Player): number {
  return p.buildings + p.upgrades + p.stars + (p.bestBase ? MEDAL_POINTS : 0) + (p.bestArmy ? MEDAL_POINTS : 0);
}

/**
 * Hauptanzeige (Z. 1205–1317): läuft nach dem Zugstart und nach jeder Aktion.
 * Orden gehen an den aktuellen Spieler, wenn er alle drei anderen Fraktionen übertrifft.
 */
export function mainCheck(s: GameState): GameEvent[] {
  const events: GameEvent[] = [];
  if (s.winner !== null) return events;
  const f = currentFaction(s);
  const me = s.players[f];
  const others = s.players.filter((p) => p.faction !== f);

  if (others.every((o) => me.buildings > o.buildings) && me.buildings >= MEDAL_MIN_BUILDINGS && !me.bestBase) {
    others.forEach((o) => (o.bestBase = false));
    me.bestBase = true;
    events.push({ type: 'medal', medal: 'bestBase' });
  }
  if (others.every((o) => me.stars > o.stars) && me.stars >= MEDAL_MIN_STARS && !me.bestArmy) {
    others.forEach((o) => (o.bestArmy = false));
    me.bestArmy = true;
    events.push({ type: 'medal', medal: 'bestArmy' });
  }

  me.vp = victoryPoints(me);
  if (s.vpLimit !== null && me.vp >= s.vpLimit) {
    s.winner = f;
    s.winReason = 'points';
    events.push({ type: 'winner', faction: f, reason: 'points' });
  }
  return events;
}

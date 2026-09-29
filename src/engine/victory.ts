import { MEDAL_MIN_BUILDINGS, MEDAL_MIN_STARS, MEDAL_POINTS } from './data';
import type { GameEvent } from './events';
import type { Faction } from './data';
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
  // Wer die Siegpunkte zuerst erreicht, löst die letzte Runde aus; entschieden wird erst an ihrem Ende (finishFinalRound)
  if (s.vpLimit !== null && me.vp >= s.vpLimit && (s.finalRound ?? null) === null) {
    s.finalRound = f;
    events.push({ type: 'finalRound', faction: f, limit: s.vpLimit });
  }
  return events;
}

/**
 * Ende der letzten Runde (nach dem Zug des letzten Platzes): Es gewinnt, wer die meisten Siegpunkte hat.
 * Gleichstand: mehr Planeten, dann mehr Sterne, dann wer das Ziel zuerst erreicht hat.
 */
export function finishFinalRound(s: GameState): GameEvent[] {
  const first = s.finalRound ?? null;
  if (s.winner !== null || first === null || s.seat !== s.playerCount - 1) return [];
  const rank = (f: Faction) => {
    const p = s.players[f];
    p.vp = victoryPoints(p);
    return [p.vp, p.buildings, p.stars, f === first ? 1 : 0];
  };
  const better = (a: Faction, b: Faction) => {
    const ra = rank(a);
    const rb = rank(b);
    for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) return ra[i] > rb[i];
    return false;
  };
  const winner = s.seats.reduce((best, f) => (better(f, best) ? f : best), s.seats[0]);
  s.winner = winner;
  s.winReason = 'points';
  return [{ type: 'winner', faction: winner, reason: 'points' }];
}

/** Zug beenden. In der letzten Runde steht nach dem letzten Platz der Sieger fest. */
export function endTurn(s: GameState): GameEvent[] {
  s.turnActive = false;
  return finishFinalRound(s);
}

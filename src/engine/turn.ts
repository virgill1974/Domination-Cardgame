import {
  BASE_INCOME, SCARETECH, REACTOR_ENERGY, REACTOR_UPGRADE_BONUS, SPECIAL_MAX_BUILDINGS, SPECIAL_MAX_UNITS,
  SPECIAL_MIN_ROUND, SUPPLY_INCOME, UPG,
} from './data';
import { isReactor, isSupply, kindOfEan } from './cards';
import type { GameEvent } from './events';
import { currentPlayer, d6, hasCard, ownedSlots, slotCardId, type GameState, type Player, type Rng } from './state';
import { finishFinalRound, mainCheck } from './victory';

export const reactorEnergy = (p: Player) => REACTOR_ENERGY + (p.energyUpgrade ? REACTOR_UPGRADE_BONUS : 0);

export interface TurnStart {
  events: GameEvent[];
  /** Überlastung: Der Spieler setzt aus, der nächste ist sofort dran. */
  skipped: boolean;
}

/** einstiegspunkt (Z. 965–1197) + Hauptanzeige */
export function beginTurn(s: GameState, rng: Rng): TurnStart {
  s.seat = (s.seat + 1) % s.playerCount;
  if (s.seat === 0) s.round++;
  const p = currentPlayer(s);
  const events: GameEvent[] = [];

  const supply = ownedSlots(p).filter((slot) => slot.active && isSupply(slotCardId(slot))).length;
  p.credits += BASE_INCOME + supply * SUPPLY_INCOME;

  p.slots.forEach((slot) => slot && (slot.attacked = false));
  s.buys = 0;
  s.attacks = 0;
  s.repairs = 0;
  s.repairBonus = true;

  if (p.energy < 0 && p.faction !== SCARETECH) {
    p.energy += reactorEnergy(p);
    s.turnActive = false;
    // Setzt der letzte Platz der letzten Runde aus, ist die Runde damit zu Ende
    return { events: [{ type: 'overload' }, ...finishFinalRound(s)], skipped: true };
  }

  if (s.round >= SPECIAL_MIN_ROUND && (p.buildings <= SPECIAL_MAX_BUILDINGS || p.units <= SPECIAL_MAX_UNITS)) {
    if (d6(rng) >= 3) {
      const roll = d6(rng) as 1 | 2 | 3 | 4 | 5 | 6;
      events.push({ type: 'special', roll });
      if (roll === 1) p.credits += 1000;
      else if (roll === 2) p.credits += 1500;
      else if (roll === 3 || roll === 4) p.credits += 500;
      else if (roll === 5) ownedSlots(p).forEach((slot) => slot.remaining > 0 && (slot.remaining = 1));
      else ownedSlots(p).forEach((slot) => slot.def < s.stats[slotCardId(slot)].def && slot.def++);
    }
  }

  for (const slot of ownedSlots(p)) {
    if (slot.remaining === 0) continue;
    slot.remaining--;
    if (slot.remaining > 0) continue;
    events.push({ type: 'activated', ean: slot.ean });
    slot.active = true;
    // Korrektur 1: eine nachgeladene Superwaffe wird nicht erneut als Gebäude gezählt
    if (!slot.counted) {
      slot.counted = true;
      const kind = kindOfEan(slot.ean);
      if (kind === 'building') p.buildings++;
      if (kind === 'unit') p.units++;
    }
    if (isReactor(slotCardId(slot))) p.energy += reactorEnergy(p);
  }

  if (s.round === 1) p.energy = 1;

  // BIOTEC Zellregeneration: beschädigte aktive Einheiten +1 Defensive, gedeckelt
  if (hasCard(p, UPG.biotecRegeneration)) {
    const healed = ownedSlots(p).filter((slot) =>
      slot.active && kindOfEan(slot.ean) === 'unit' && slot.def < s.stats[slotCardId(slot)].def);
    healed.forEach((slot) => slot.def++);
    if (healed.length) events.push({ type: 'regeneration', count: healed.length });
  }

  // Korrektur 8: Hinweis auf den Spionagesatelliten (Auge des Raumes); BIOTEC Neuronetz analog
  if (hasCard(p, UPG.starwingSpySatellite)) events.push({ type: 'spySatellite' });
  if (hasCard(p, UPG.biotecNeuronet)) events.push({ type: 'neuronet' });

  s.turnActive = true;
  events.push(...mainCheck(s));
  return { events, skipped: false };
}

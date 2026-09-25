import { MAX_REPAIRS, REPAIR_PRICE } from './data';
import { cardIdOfEan, factionOfEan, isSuperweapon, kindOfEan } from './cards';
import type { ErrorCode } from './messages';
import { currentFaction, currentPlayer, findSlot, ownedSlots, type GameState, type Slot } from './state';

export const repairPrecheck = (s: GameState): ErrorCode | null => (s.repairs >= MAX_REPAIRS ? 'notPossible' : null);

export const ownCardScan = (s: GameState, ean: number): ErrorCode | null =>
  factionOfEan(ean) !== currentFaction(s) ? 'wrongCard' : null;

/** Eigene, gekaufte und aktivierte Karte (inaktive Superwaffe erlaubt), wie in Reparatur und Info. */
function usableSlot(s: GameState, ean: number): { error?: ErrorCode; slot?: Slot } {
  const p = currentPlayer(s);
  const i = findSlot(p, ean);
  if (i < 0) return { error: 'notOwned' };
  const slot = p.slots[i]!;
  if (!slot.active && !isSuperweapon(cardIdOfEan(ean))) return { error: 'notActive' };
  return { slot };
}

/** Alle Reparatur-Prüfungen in Originalreihenfolge, ohne den Zustand zu ändern. */
export function repairCheck(s: GameState, ean: number): ErrorCode | null {
  const pre = repairPrecheck(s) ?? ownCardScan(s, ean);
  if (pre) return pre;
  if (kindOfEan(ean) === 'upgrade') return 'nothingToRepair';
  const { error, slot } = usableSlot(s, ean);
  if (error) return error;
  if (slot!.def >= s.stats[cardIdOfEan(ean)].def) return 'nothingToRepair';
  if (currentPlayer(s).credits < REPAIR_PRICE) return 'noCredits';
  return null;
}

/** reparieren (Z. 2492–2583), nach Bestätigung mit OK */
export function repair(s: GameState, ean: number): { error?: ErrorCode; amount?: 1 | 2 } {
  const error = repairCheck(s, ean);
  if (error) return { error };
  const slot = usableSlot(s, ean).slot;
  const max = s.stats[cardIdOfEan(ean)].def;
  const p = currentPlayer(s);

  p.credits -= REPAIR_PRICE;
  s.repairs++;
  if (p.repairUpgrade && s.repairBonus) {
    slot!.def = Math.min(slot!.def + 2, max);
    s.repairBonus = false;
    return { amount: 2 };
  }
  slot!.def++;
  return { amount: 1 };
}

/** Info-Taste: Upgrades liefern im Original "Karte vorhanden!" */
export const infoScan = (s: GameState, ean: number): ErrorCode | null =>
  ownCardScan(s, ean) ?? (kindOfEan(ean) === 'upgrade' ? 'alreadyOwned' : null);

export interface CardInfo {
  def: number;
  maxDef: number;
  off: number;
  dmg: number;
  rounds: number;
}

/** defensive (Z. 2591–2664) */
export function info(s: GameState, ean: number): { error?: ErrorCode; info?: CardInfo } {
  const pre = infoScan(s, ean);
  if (pre) return { error: pre };
  const { error, slot } = usableSlot(s, ean);
  if (error) return { error };
  const st = s.stats[cardIdOfEan(ean)];
  return { info: { def: slot!.def, maxDef: st.def, off: st.off, dmg: st.dmg, rounds: st.rounds } };
}

export function inConstruction(s: GameState): Slot[] {
  return ownedSlots(currentPlayer(s)).filter((slot) => slot.remaining > 0);
}

import {
  ATTACK_PRICE, FLAK_DAMAGE, FLAK_OFFENSIVE, GBA, MAX_ATTACKS, STEALTH, SUPERWEAPON_RECHARGE,
} from './data';
import {
  cardIdOfEan, factionOfEan, isAircraft, isCenter, isFlak, isHeadquarters, isReactor, isSuperweapon, kindOfEan,
} from './cards';
import type { ErrorCode } from './messages';
import { currentFaction, currentPlayer, d6, findSlot, ownedSlots, slotCardId, type GameState, type Player, type Rng, type Slot } from './state';
import { reactorEnergy } from './turn';

export type CombatKind = 'unitVsUnit' | 'unitVsBuilding' | 'airVsBuilding' | 'stealthVsBuilding' | 'superweapon';

export interface CombatStep {
  by: 'attacker' | 'defender' | 'flak';
  /** null = Superwaffe, trifft immer */
  roll: number | null;
  offense: number;
  hit: boolean;
  damage: number;
  attackerDef: number;
  defenderDef: number;
}

export interface CombatResult {
  kind: CombatKind;
  attackerEan: number;
  defenderEan: number;
  free: boolean;
  flakCount: number;
  attackerDefBefore: number;
  defenderDefBefore: number;
  steps: CombatStep[];
  attackerStar: boolean;
  defenderStar: boolean;
  /** Karten mit Defensive 0 nach dem Kampf */
  destroyed: number[];
  /** Überlastung: Karte blieb trotz Defensive 0 liegen (karte_loeschen) */
  rescued: number[];
  headquarters: boolean;
}

export const attackPrecheck = (s: GameState): ErrorCode | null => (s.attacks >= MAX_ATTACKS ? 'notPossible' : null);

export function attackScanAttacker(s: GameState, ean: number): ErrorCode | null {
  if (factionOfEan(ean) !== currentFaction(s)) return 'wrongCard';
  if (!isSuperweapon(cardIdOfEan(ean)) && kindOfEan(ean) !== 'unit') return 'wrongCard';
  return null;
}

const hasActiveCenter = (p: Player) => ownedSlots(p).some((slot) => slot.active && isCenter(slotCardId(slot)));

/** Nach Bestätigung des Angreifers. free = Angriff kostenlos (Zentrum aktiviert). */
export function attackConfirmAttacker(s: GameState, ean: number): { error?: ErrorCode; free: boolean } {
  const p = currentPlayer(s);
  const i = findSlot(p, ean);
  const free = hasActiveCenter(p);
  if (i < 0) return { error: 'notOwned', free };
  const slot = p.slots[i]!;
  if (!slot.active) return { error: 'notActive', free };
  if (slot.attacked) return { error: 'notPossible', free };
  if (!free && p.credits < ATTACK_PRICE) return { error: 'noCredits', free };
  return { free };
}

export function attackScanDefender(s: GameState, ean: number): ErrorCode | null {
  if (factionOfEan(ean) === currentFaction(s)) return 'wrongCard';
  if (kindOfEan(ean) === 'upgrade') return 'wrongCard';
  return null;
}

export function attackConfirmDefender(s: GameState, ean: number): ErrorCode | null {
  const owner = s.players[factionOfEan(ean)];
  const i = findSlot(owner, ean);
  if (i < 0) return 'notOwned';
  if (!owner.slots[i]!.active && !isSuperweapon(cardIdOfEan(ean))) return 'notActive';
  return null;
}

/** kampf (Z. 1943–2483). Prüft alle Schritte erneut und führt den Kampf aus. */
export function attack(s: GameState, attackerEan: number, defenderEan: number, rng: Rng): { error?: ErrorCode; result?: CombatResult } {
  const error = attackPrecheck(s) ?? attackScanAttacker(s, attackerEan) ?? attackConfirmAttacker(s, attackerEan).error
    ?? attackScanDefender(s, defenderEan) ?? attackConfirmDefender(s, defenderEan);
  if (error) return { error };

  const me = currentPlayer(s);
  const owner = s.players[factionOfEan(defenderEan)];
  const attIndex = findSlot(me, attackerEan);
  const defIndex = findSlot(owner, defenderEan);
  const att = me.slots[attIndex]!;
  const def = owner.slots[defIndex]!;
  const attId = cardIdOfEan(attackerEan);
  const defId = cardIdOfEan(defenderEan);
  const attKind = kindOfEan(attackerEan);
  const defKind = kindOfEan(defenderEan);
  const free = hasActiveCenter(me);

  s.attacks++;
  att.attacked = true;
  if (!free) me.credits -= ATTACK_PRICE;

  const result: CombatResult = {
    kind: 'unitVsBuilding', attackerEan, defenderEan, free, flakCount: 0,
    attackerDefBefore: att.def, defenderDefBefore: def.def, steps: [],
    attackerStar: false, defenderStar: false, destroyed: [], rescued: [], headquarters: false,
  };

  const strike = (by: CombatStep['by'], offense: number, damage: number, target: Slot, always = false) => {
    const roll = always ? null : d6(rng);
    const hit = always || offense >= roll!;
    if (hit) target.def = Math.max(0, target.def - damage);
    result.steps.push({ by, roll, offense, hit, damage, attackerDef: att.def, defenderDef: def.def });
  };
  const attStats = s.stats[attId];
  const defStats = s.stats[defId];

  if (defKind === 'unit' && attKind === 'unit') {
    result.kind = 'unitVsUnit';
    do {
      strike('attacker', attStats.off, attStats.dmg, def);
      strike('defender', defStats.off, defStats.dmg, att);
    } while (att.def > 0 && def.def > 0);
  } else if (defKind === 'building' && isAircraft(attId)) {
    result.kind = 'airVsBuilding';
    // Korrektur 3: nur aktivierte Flugabwehr schießt
    const flak = ownedSlots(owner).filter((slot) => slot.active && isFlak(slotCardId(slot))).length;
    result.flakCount = flak;
    if (flak > 0) strike('flak', flak + FLAK_OFFENSIVE, flak + FLAK_DAMAGE, att);
    if (att.def > 0) strike('attacker', attStats.off, attStats.dmg, def);
  } else if (defKind === 'building' && attId === STEALTH) {
    result.kind = 'stealthVsBuilding';
    strike('attacker', attStats.off, attStats.dmg, def);
  } else if (isSuperweapon(attId)) {
    result.kind = 'superweapon';
    strike('attacker', attStats.off, attStats.dmg, def, true);
    att.remaining = SUPERWEAPON_RECHARGE;
    att.active = false;
  } else {
    strike('attacker', attStats.off, attStats.dmg, def);
    if (isFlak(defId)) strike('defender', defStats.off, defStats.dmg, att);
  }

  // kampfende: Sterne
  if (att.def > 0 && def.def === 0) {
    me.stars++;
    result.attackerStar = true;
  }
  if (att.def === 0 && def.def > 0 && (defKind === 'unit' || isFlak(defId))) {
    owner.stars++;
    result.defenderStar = true;
  }

  if (def.def === 0) {
    result.destroyed.push(defenderEan);
    if (removeCard(s, owner, defIndex) === 'rescued') result.rescued.push(defenderEan);
    if (isHeadquarters(defId)) {
      result.headquarters = true;
      s.winner = currentFaction(s);
      s.winReason = 'headquarters';
      return { result };
    }
  }
  if (att.def === 0) {
    result.destroyed.push(attackerEan);
    if (removeCard(s, me, attIndex) === 'rescued') result.rescued.push(attackerEan);
  }
  return { result };
}

/** karte_loeschen (Z. 2861–2908) */
function removeCard(s: GameState, owner: Player, index: number): 'deleted' | 'rescued' {
  const slot = owner.slots[index]!;
  const id = slotCardId(slot);
  const kind = kindOfEan(slot.ean);
  if (isReactor(id)) owner.energy -= reactorEnergy(owner);
  if (owner.energy < 0 && owner.faction !== GBA) {
    // Korrektur 5: volle Defensive der Karte statt pauschal 3
    slot.def = s.stats[id].def;
    return 'rescued';
  }
  owner.slots[index] = null;
  if (kind === 'building' && !isReactor(id)) owner.energy++;
  if (slot.counted && kind === 'building') owner.buildings--;
  if (slot.counted && kind === 'unit') owner.units--;
  return 'deleted';
}

import { CARDS, GBA, MAX_BUYS, NO_REQUIREMENT, REACTOR_UPGRADE_BONUS, UPG } from './data';
import { cardIdOfEan, factionOfEan, isReactor, kindOfEan } from './cards';
import type { GameEvent } from './events';
import type { ErrorCode } from './messages';
import { currentFaction, currentPlayer, findSlot, ownedSlots, slotCardId, type GameState, type Player } from './state';

export const buyPrecheck = (s: GameState): ErrorCode | null => (s.buys >= MAX_BUYS ? 'notPossible' : null);

export const buyScan = (s: GameState, ean: number): ErrorCode | null =>
  factionOfEan(ean) !== currentFaction(s) ? 'wrongCard' : null;

export interface BuyResult {
  error?: ErrorCode;
  events: GameEvent[];
}

const consumesEnergy = (ean: number) => kindOfEan(ean) === 'building' && !isReactor(cardIdOfEan(ean));

/** Alle Kauf-Prüfungen in Originalreihenfolge, ohne den Zustand zu ändern. */
export function buyCheck(s: GameState, ean: number): ErrorCode | null {
  const pre = buyPrecheck(s) ?? buyScan(s, ean);
  if (pre) return pre;
  const p = currentPlayer(s);
  const card = CARDS[cardIdOfEan(ean)];
  if (findSlot(p, ean) >= 0) return 'alreadyOwned';
  const unlocked = card.requires === NO_REQUIREMENT
    || ownedSlots(p).some((slot) => slot.active && slotCardId(slot) === card.requires);
  if (!unlocked) return 'locked';
  if (p.credits < card.price) return 'noCredits';
  // Korrektur 4: Energie <= 0 statt == 0
  if (p.faction !== GBA && consumesEnergy(ean) && p.energy <= 0) return 'noEnergy';
  // Korrektur 6: volles Inventar statt Speicherüberlauf
  if (!p.slots.includes(null)) return 'notPossible';
  return null;
}

/** kaufen (Z. 1498–1857), nach Bestätigung mit OK */
export function buy(s: GameState, ean: number): BuyResult {
  const error = buyCheck(s, ean);
  if (error) return { error, events: [] };

  const p = currentPlayer(s);
  const id = cardIdOfEan(ean);
  const card = CARDS[id];
  const free = p.slots.lastIndexOf(null);
  const upgrade = kindOfEan(ean) === 'upgrade';
  p.slots[free] = {
    ean, def: s.stats[id].def, remaining: s.stats[id].rounds, active: upgrade, attacked: false, counted: upgrade,
  };
  s.buys++;
  p.credits -= card.price;
  if (consumesEnergy(ean)) p.energy--;
  if (!upgrade) return { events: [] };
  p.upgrades++;
  return { events: applyUpgrade(s, p, id) };
}

function applyUpgrade(s: GameState, p: Player, id: number): GameEvent[] {
  const st = s.stats;
  const raiseDef = (cardId: number) => ownedSlots(p).forEach((slot) => slotCardId(slot) === cardId && slot.def++);
  // Korrektur 2: nur aktivierte Reaktoren bekommen den Bonus sofort
  const reactorBonus = (reactorId: number) =>
    ownedSlots(p).filter((slot) => slot.active && slotCardId(slot) === reactorId).length * REACTOR_UPGRADE_BONUS;

  switch (id) {
    case UPG.usaArmor:
      raiseDef(12); raiseDef(14);
      st[12].def = 4; st[14].def = 5;
      break;
    case UPG.usaControlRods:
      p.energyUpgrade = true;
      p.energy += reactorBonus(2);
      break;
    case UPG.usaLaser:
      st[15].off = 4; st[16].off = 4;
      break;
    case UPG.usaRocketPods:
      st[15].dmg = 2; st[16].dmg = 3;
      break;
    case UPG.usaTow:
      st[11].off = 3;
      break;
    case UPG.gbaToxin:
      st[58].dmg = 2; st[59].dmg = 3;
      break;
    case UPG.gbaSpecialAmmo:
      st[55].dmg = 2; st[57].dmg = 2;
      break;
    case UPG.gbaAutorepair:
      p.repairUpgrade = true;
      s.repairBonus = true;
      break;
    case UPG.gbaBuggyAmmo:
      st[60].dmg = 3;
      break;
    case UPG.gbaScorpionRocket:
      st[58].off = 3;
      break;
    case UPG.gbaCamouflage:
      return [{ type: 'camouflage' }];
    case UPG.chinaNuclearTank:
      st[34].dmg = 2;
      break;
    case UPG.chinaBlackNapalm:
      st[35].dmg = 2;
      break;
    case UPG.chinaOvercharge:
      p.energyUpgrade = true;
      p.energy += reactorBonus(25);
      break;
    case UPG.chinaUraniumShells:
      st[36].dmg = 3; st[38].dmg = 4;
      break;
    case UPG.chinaNationalism:
      st[32].off = 2; st[33].off = 3;
      break;
    case UPG.chinaMigArmor:
      raiseDef(39);
      st[39].def = 4;
      break;
  }
  return [];
}

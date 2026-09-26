import { CARDS, FACTIONS, NO_REQUIREMENT } from '../engine/data';
import { factionOfCardId, kindOfCardId, type CardKind } from '../engine/cards';

export const KIND_LABEL: Record<CardKind, string> = { building: 'Gebäude', unit: 'Einheit', upgrade: 'Upgrade' };
export const CLASS_LABEL = { foot: 'Fußeinheit', vehicle: 'Fahrzeug', air: 'Lufteinheit' } as const;

export const UPGRADE_EFFECTS: Record<number, string> = {
  17: 'Crusader & Paladin: Defensive +1',
  18: 'Jeder Fusionsreaktor versorgt 2 Gebäude mehr',
  19: 'Raptor & Stealth-Fighter: Offensive +1',
  20: 'Raptor & Stealth-Fighter: Schaden +1',
  21: 'Pro Runde eine verdeckte Gegnerkarte aufdecken',
  22: 'Panzerjeep: Offensive +1',
  40: 'Faust Maos: Schaden +1',
  41: 'Drachenpanzer: Schaden +1',
  42: 'Jeder Atomreaktor versorgt 2 Gebäude mehr',
  43: 'Infernal- & Nukleargeschütz: Schaden +1',
  44: 'Rotgardist & Panzerjäger: Offensive +1',
  45: 'Mig: Defensive +1',
  63: 'Scorpion & Marodeur: Schaden +1',
  64: 'Rebell & Kampfjeep: Schaden +1',
  65: 'Jede Reparatur: Defensive +2',
  66: 'Raketenbuggy: Schaden +1',
  67: 'Scorpion: Offensive +1',
  68: 'Einheiten dürfen verdeckt ausgespielt werden',
  86: 'Einheit 5 & Mutant: Offensive +1',
  87: 'Helicopter wird von Flugabwehr nicht erfasst',
  88: 'Jeder Plasmareaktor versorgt 2 Gebäude mehr',
  89: 'Agressor & Regenerat. Panzer: Defensive +1',
  90: 'Pro Runde 2 eigene Gebäude tauschen oder 1 Einheit umsetzen',
  91: 'Zu Zugbeginn: beschädigte Einheiten Defensive +1',
};

export const upgradeEffect = (id: number) => UPGRADE_EFFECTS[id] ?? 'Effekt noch nicht festgelegt';

export function typeLabel(id: number): string {
  const card = CARDS[id];
  return card.unitClass ? CLASS_LABEL[card.unitClass] : KIND_LABEL[kindOfCardId(id)];
}

export const requirementName = (id: number) =>
  CARDS[id].requires === NO_REQUIREMENT ? 'Start' : CARDS[CARDS[id].requires].name;

export const factionName = (id: number) => FACTIONS[factionOfCardId(id)];

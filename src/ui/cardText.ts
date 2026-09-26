import { CARDS, FACTIONS, NO_REQUIREMENT } from '../engine/data';
import { factionOfCardId, kindOfCardId, type CardKind } from '../engine/cards';

export const KIND_LABEL: Record<CardKind, string> = { building: 'Planet', unit: 'Einheit', upgrade: 'Upgrade' };
export const CLASS_LABEL = { foot: 'Aufklärer', vehicle: 'Kampfschiff', air: 'Hyperraumschiff' } as const;

export const UPGRADE_EFFECTS: Record<number, string> = {
  17: 'Pegasus & Poseidons Fluch: Defensive +1',
  18: 'Jeder Protonenmond versorgt 2 Planeten mehr',
  19: 'Zeus & Nostradamus: Offensive +1',
  20: 'Zeus & Nostradamus: Schaden +1',
  21: 'Pro Runde eine verdeckte Gegnerkarte aufdecken',
  22: 'Phoenix: Offensive +1',
  40: 'Sonnenfaust: Schaden +1',
  41: 'Glutdrache: Schaden +1',
  42: 'Jeder Elektronenmond versorgt 2 Planeten mehr',
  43: 'Inferno & Novakanone: Schaden +1',
  44: 'Lichtfunke & Strahlenjäger: Offensive +1',
  45: 'Lichtpfeil: Defensive +1',
  63: 'Sternenaxt & Damokles: Schaden +1',
  64: 'Shadow Arm & Schattenschleuder: Schaden +1',
  65: 'Jede Reparatur: Defensive +2',
  66: 'Rage: Schaden +1',
  67: 'Sternenaxt: Offensive +1',
  68: 'Einheiten dürfen verdeckt ausgespielt werden',
  86: 'Einheit 5 & Mutant: Offensive +1',
  87: 'Helicopter wird von Planetenabwehr nicht erfasst',
  88: 'Jeder Plasmareaktor versorgt 2 Planeten mehr',
  89: 'Agressor & Regenerat. Panzer: Defensive +1',
  90: 'Pro Runde 2 eigene Planeten tauschen oder 1 Einheit umsetzen',
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

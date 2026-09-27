import {
  CARDS, FACTIONS, HELICOPTER, NO_REQUIREMENT, REACTOR_ENERGY, SCARETECH, STARTING_EANS, STEALTH, SUPERWEAPON_RECHARGE, SUPPLY_INCOME, UPG,
} from '../engine/data';
import {
  factionOfCardId, factionOfEan, isCenter, isFlak, isHeadquarters, isReactor, isSuperweapon, isSupply, kindOfCardId, type CardKind,
} from '../engine/cards';

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

// Kategorie-Zeile wie auf Helges Karten („Kategorie: Produktion“), abgeleitet aus den Regel-Konstanten
const STRATEGY_PLANETS = [52, 54];
const SUPPLY_UPGRADES: number[] = [UPG.starwingControlRods, UPG.lightforceOvercharge, UPG.biotecPerpetuum];
const STRATEGY_UPGRADES: number[] = [UPG.starwingSpySatellite, UPG.scaretechAutorepair, UPG.scaretechCamouflage, UPG.biotecNeuronet];

export function categoryLabel(id: number): string {
  const kind = kindOfCardId(id);
  if (kind === 'unit') return typeLabel(id);
  if (kind === 'upgrade') {
    if (SUPPLY_UPGRADES.includes(id)) return 'Versorgung';
    return STRATEGY_UPGRADES.includes(id) ? 'Strategie' : 'Konflikt';
  }
  if (isHeadquarters(id)) return 'Basis';
  if (isReactor(id) || isSupply(id)) return 'Versorgung';
  if (isFlak(id)) return 'Verteidigung';
  if (isSuperweapon(id)) return 'Superwaffe';
  if (isCenter(id) || STRATEGY_PLANETS.includes(id)) return 'Strategie';
  return 'Produktion';
}

const heart = (galaxy: string) =>
  `Dies ist das Zentrum und gleichzeitig der wunde Punkt der ${galaxy}-Galaxie. Es sollte immer gut bewacht werden.`;

/** Beschreibungen der Planeten aus Unterlagen/Domination_Kartenliste.xls (BIOTEC hat noch keine). */
export const DESCRIPTIONS: Record<number, string> = {
  0: heart('Starwing'),
  1: 'Herstellungsort unbemannter Drohnen',
  2: 'Natürliche Energieressource der Galaxie',
  3: 'Wirtschaftszentrum zur finanziellen Versorgung',
  4: 'Elektromagnetisches Schutzfeld',
  5: 'Herstellungsstätte der Raumflotte',
  6: 'Herstellungsort der interstellaren Flotte',
  7: 'Planungs- und Forschungseinrichtung',
  8: 'Größte Offensivkraft der Starwing-Galaxie',
  23: heart('Lightforce'),
  24: 'Herstellungsort unbemannter Drohnen',
  25: 'Natürliche Energieressource der Galaxie',
  26: 'Kometen- und Sternenstaubring zur Verteidigung',
  27: 'Wirtschaftszentrum zur finanziellen Versorgung',
  28: 'Herstellungsstätte der Raumflotte',
  29: 'Herstellungsort der interstellaren Flotte',
  30: 'Planungs- und Forschungseinrichtung',
  31: 'Größte Offensivkraft der Lightforce-Galaxie',
  46: heart('Scaretech'),
  47: 'Herstellungsort unbemannter Aufklärer',
  48: 'Natürliche Materialressource der Galaxie',
  49: 'Metallischer Abwehrgürtel zur Verteidigung',
  50: 'Herstellungsort der Raumflotte',
  51: 'Planungs- und Forschungseinrichtung',
  52: 'Datenauswertungszentrale',
  53: 'Größte Offensivkraft der Scaretech-Galaxie',
  54: 'Künstliche Raumsprungzone für Drohnen',
};

/** Startkarte: wird in Runde 1 aktiviert (Zentralgestirn, erster Produktionsplanet, erste Energiequelle) */
export const isStartCard = (ean: number) => STARTING_EANS[factionOfEan(ean)].includes(ean);

/** Sonderfähigkeiten einzelner Karten (zusätzlich zu den Regeln aus rulesFor) */
export const ABILITIES: Record<number, string> = {
  [STEALTH]: 'Tarnmodus: Wird von der Planetenabwehr nicht erfasst.',
  [HELICOPTER]: 'Mit dem Upgrade Flüstern im Tarnmodus: Wird von der Planetenabwehr nicht erfasst.',
};

const WORMHOLE = 54;

/**
 * Sonderregeln, die auf die Karte gedruckt werden. Abgeleitet aus denselben Konstanten wie die Engine,
 * damit Karte und Spiel übereinstimmen (Werte aus data.ts, Regeln laut Kurzanleitung).
 */
export function rulesFor(id: number): string[] {
  const card = CARDS[id];
  const rules: string[] = [];
  if (kindOfCardId(id) === 'unit') {
    if (card.unitClass === 'air') rules.push('Überspringt beim Angriff eine Reihe.');
    if (card.def === 0) rules.push('Zerstört sich beim Angriff selbst und erhält keinen Stern.');
    if (factionOfCardId(id) === SCARETECH && card.unitClass === 'foot') rules.push('Mit dem Wurmloch: Überspringt beim Angriff Reihe 1.');
  } else if (kindOfCardId(id) === 'building') {
    if (isReactor(id)) rules.push(`Liefert ${REACTOR_ENERGY} Energie.`);
    if (isSupply(id)) rules.push(`+${SUPPLY_INCOME} Credits pro Runde.`);
    if (isFlak(id)) rules.push('Planetenabwehr: Schlägt zurück und beschießt angreifende Hyperraumschiffe.');
    if (isCenter(id)) rules.push('Angriffe kosten keine Credits.');
    if (isSuperweapon(id)) rules.push(`Superwaffe: Trifft immer, danach ${SUPERWEAPON_RECHARGE} Runden Nachladen.`);
    if (id === WORMHOLE) rules.push('Aufklärer überspringen beim Angriff Reihe 1.');
  }
  if (ABILITIES[id]) rules.push(ABILITIES[id]);
  return rules;
}

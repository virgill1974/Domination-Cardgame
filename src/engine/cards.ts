import {
  AIRCRAFT, BUILDING_CARDS, CARDS, CARDS_PER_FACTION, CARD_OF_EAN, CENTERS, FLAK, HEADQUARTERS,
  REACTORS, SUPERWEAPONS, SUPPLY, UNIT_CARDS, type CardType, type Faction,
} from './data';

export type CardKind = 'building' | 'unit' | 'upgrade';

/** spielernr_ermitteln */
export const factionOfEan = (ean: number): Faction => Math.floor(ean / CARDS_PER_FACTION) as Faction;

/** kartentyp_ermitteln */
export function kindOfEan(ean: number): CardKind {
  const r = ean % CARDS_PER_FACTION;
  if (r < BUILDING_CARDS) return 'building';
  if (r < BUILDING_CARDS + UNIT_CARDS) return 'unit';
  return 'upgrade';
}

export const cardIdOfEan = (ean: number): number => CARD_OF_EAN[ean];
export const cardOfEan = (ean: number): CardType => CARDS[CARD_OF_EAN[ean]];

export function kindOfCardId(id: number): CardKind {
  const r = id % 23;
  if (r < 9) return 'building';
  if (r < 17) return 'unit';
  return 'upgrade';
}

export const factionOfCardId = (id: number): Faction => Math.floor(id / 23) as Faction;

const has = (list: readonly number[], id: number) => list.includes(id);
export const isReactor = (id: number) => has(REACTORS, id);
export const isFlak = (id: number) => has(FLAK, id);
export const isAircraft = (id: number) => has(AIRCRAFT, id);
export const isHeadquarters = (id: number) => has(HEADQUARTERS, id);
export const isSupply = (id: number) => has(SUPPLY, id);
export const isSuperweapon = (id: number) => has(SUPERWEAPONS, id);
export const isCenter = (id: number) => has(CENTERS, id);

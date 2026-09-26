// Kartendaten und Konstanten 1:1 aus Altes Projekt/CnC_Microcontroller_code.txt

export const FACTIONS = ['USA', 'CHINA', 'GBA', 'BIOTEC'] as const;
export type Faction = 0 | 1 | 2 | 3;
export const USA: Faction = 0;
export const CHINA: Faction = 1;
export const GBA: Faction = 2;
export const BIOTEC: Faction = 3;
export const FACTION_COLORS = ['#1e90ff', '#dc143c', '#228b22', '#9932cc'] as const;

export const START_CREDITS = 1600;
export const BASE_INCOME = 400;
export const SUPPLY_INCOME = 400;
export const ATTACK_PRICE = 200;
export const REPAIR_PRICE = 200;
export const START_ENERGY = 0;
export const REACTOR_ENERGY = 3;
export const REACTOR_UPGRADE_BONUS = 2;
export const FLAK_OFFENSIVE = 1;
export const FLAK_DAMAGE = 0;
export const MAX_ATTACKS = 3;
export const MAX_BUYS = 3;
export const MAX_REPAIRS = 1;
export const MEDAL_MIN_BUILDINGS = 5;
export const MEDAL_MIN_STARS = 5;
export const SPECIAL_MAX_UNITS = 7;
export const SPECIAL_MAX_BUILDINGS = 7;
export const SPECIAL_MIN_ROUND = 5;
export const MEDAL_POINTS = 5;
export const MAX_SLOTS = 40;
export const SUPERWEAPON_RECHARGE = 3;
export const PHYSICAL_CARDS = 160;
export const CARDS_PER_FACTION = 40;
export const BUILDING_CARDS = 14;
export const UNIT_CARDS = 20;
export const NO_REQUIREMENT = 255;

export const REACTORS = [2, 25, 71] as const;
export const FLAK = [4, 26, 49, 72] as const;
export const AIRCRAFT = [15, 39, 85] as const;
export const STEALTH = 16;
export const HEADQUARTERS = [0, 23, 46, 69] as const;
export const SUPPLY = [3, 27, 48, 73] as const;
export const SUPERWEAPONS = [8, 31, 53, 77] as const;
export const CENTERS = [7, 30, 51, 76] as const;

export const UPG = {
  usaArmor: 17,
  usaControlRods: 18,
  usaLaser: 19,
  usaRocketPods: 20,
  usaSpySatellite: 21,
  usaTow: 22,
  chinaNuclearTank: 40,
  chinaBlackNapalm: 41,
  chinaOvercharge: 42,
  chinaUraniumShells: 43,
  chinaNationalism: 44,
  chinaMigArmor: 45,
  gbaToxin: 63,
  gbaSpecialAmmo: 64,
  gbaAutorepair: 65,
  gbaBuggyAmmo: 66,
  gbaScorpionRocket: 67,
  gbaCamouflage: 68,
  biotecMutagen: 86,
  biotecWhisper: 87,
  biotecPerpetuum: 88,
  biotecChitin: 89,
  biotecNeuronet: 90,
  biotecRegeneration: 91,
} as const;

export const HELICOPTER = 85;

export type UnitClass = 'foot' | 'vehicle' | 'air';

export interface CardType {
  id: number;
  name: string;
  price: number;
  rounds: number;
  def: number;
  off: number;
  dmg: number;
  requires: number;
  unitClass?: UnitClass;
}

type Row = [name: string, price: number, rounds: number, def: number, off: number, dmg: number, requires: number, unitClass?: UnitClass];

const ROWS: Row[] = [
  // USA
  ['Kommandozentrale', 2000, 1, 8, 0, 0, 255],
  ['Kaserne', 600, 1, 2, 0, 0, 0],
  ['Fusionsreaktor', 800, 1, 2, 0, 0, 0],
  ['Versorgungszentrum', 2000, 2, 4, 0, 0, 2],
  ['Patriot-Batterie', 1000, 1, 3, 3, 2, 2],
  ['Waffenfabrik', 2000, 2, 3, 0, 0, 3],
  ['Flugfeld', 1000, 3, 3, 0, 0, 3],
  ['Strategiezentrum', 2500, 3, 3, 0, 0, 5],
  ['Partikelkanone', 3500, 3, 4, 6, 4, 7],
  ['Ranger', 225, 1, 1, 1, 1, 1, 'foot'],
  ['Raketentrooper', 300, 1, 1, 2, 1, 1, 'foot'],
  ['Panzerjeep', 700, 2, 2, 2, 1, 5, 'vehicle'],
  ['Crusader', 900, 2, 3, 3, 1, 5, 'vehicle'],
  ['Tomahawk', 1100, 3, 2, 4, 2, 5, 'vehicle'],
  ['Paladin', 1200, 2, 4, 4, 3, 5, 'vehicle'],
  ['Raptor', 1200, 3, 3, 3, 1, 6, 'air'],
  ['Stealth-Fighter', 1400, 3, 3, 3, 2, 6, 'air'],
  ['Panzerung', 1000, 0, 0, 0, 0, 7],
  ['Kontrollstäbe', 800, 0, 0, 0, 0, 2],
  ['Laserzielerfassung', 1500, 0, 0, 0, 0, 6],
  ['Raketenmagazin', 1500, 0, 0, 0, 0, 6],
  ['Spionagesatellit', 500, 0, 0, 0, 0, 7],
  ['TOW-Rakete', 1200, 0, 0, 0, 0, 5],
  // China
  ['Kommandozentrale', 2000, 1, 8, 0, 0, 255],
  ['Kaserne', 500, 1, 2, 0, 0, 23],
  ['Atomreaktor', 1000, 1, 3, 0, 0, 23],
  ['Bunker', 700, 1, 3, 2, 2, 24],
  ['Versorgungszentrum', 1500, 2, 4, 0, 0, 25],
  ['Waffenfabrik', 2000, 2, 4, 0, 0, 27],
  ['Flugplatz', 1000, 3, 3, 0, 0, 27],
  ['Propagandazentrum', 2000, 3, 3, 0, 0, 28],
  ['Atomraketensilo', 3500, 3, 4, 6, 4, 30],
  ['Rotgardist', 200, 1, 1, 1, 1, 24, 'foot'],
  ['Panzerjäger', 300, 1, 1, 2, 1, 24, 'foot'],
  ['Faust Maos', 900, 2, 3, 3, 1, 28, 'vehicle'],
  ['Drachenpanzer', 800, 2, 2, 3, 1, 28, 'vehicle'],
  ['Infernalgeschütz', 1000, 3, 2, 4, 2, 28, 'vehicle'],
  ['Weltenherrscher', 1800, 3, 5, 5, 3, 28, 'vehicle'],
  ['Nukleargeschütz', 1600, 3, 2, 4, 3, 28, 'vehicle'],
  ['Mig', 1200, 3, 3, 3, 2, 29, 'air'],
  ['Nuklearpanzer', 1500, 0, 0, 0, 0, 30],
  ['Schwarzes Napalm', 2000, 0, 0, 0, 0, 24],
  ['Überlastung', 1000, 0, 0, 0, 0, 25],
  ['Uran-Rakete', 2000, 0, 0, 0, 0, 30],
  ['Nationalismus', 1000, 0, 0, 0, 0, 30],
  ['Mig-Panzerung', 500, 0, 0, 0, 0, 29],
  // GBA
  ['Kommandocenter', 2000, 1, 8, 0, 0, 255],
  ['Kaserne', 500, 1, 2, 0, 0, 46],
  ['Geheimlager', 1500, 3, 3, 0, 0, 46],
  ['Stinger-Stellung', 900, 1, 2, 2, 1, 47],
  ['Waffenhändler', 2500, 2, 3, 0, 0, 48],
  ['Palast', 2500, 3, 4, 0, 0, 50],
  ['Schwarzmarkt', 2500, 2, 3, 0, 0, 51],
  ['SCUD-Sturm', 3500, 3, 4, 6, 4, 51],
  ['Tunnelsystem', 1500, 3, 2, 0, 0, 47],
  ['Rebell', 150, 1, 1, 1, 1, 47, 'foot'],
  ['Terrorist', 250, 2, 0, 3, 2, 47, 'foot'],
  ['Kampfjeep', 500, 1, 2, 2, 1, 50, 'vehicle'],
  ['Scorpion', 600, 1, 3, 2, 1, 50, 'vehicle'],
  ['Marodeur', 900, 2, 4, 3, 2, 50, 'vehicle'],
  ['Raketenbuggy', 800, 2, 1, 3, 2, 50, 'vehicle'],
  ['Sprengstoff-LKW', 1000, 3, 0, 5, 5, 50, 'vehicle'],
  ['SCUD-Werfer', 1200, 3, 2, 4, 3, 50, 'vehicle'],
  ['Toxingranaten', 1000, 0, 0, 0, 0, 51],
  ['Spezialmunition', 1000, 0, 0, 0, 0, 50],
  ['Instandsetzung', 2000, 0, 0, 0, 0, 52],
  ['Buggy-Munition', 800, 0, 0, 0, 0, 50],
  ['Scorpion-Rakete', 1000, 0, 0, 0, 0, 52],
  ['Tarnung', 2000, 0, 0, 0, 0, 51],
  // BIOTEC
  ['Konzernführung', 2000, 1, 8, 0, 0, 255],
  ['Hive', 500, 1, 2, 0, 0, 69],
  ['Plasmareaktor', 1500, 3, 3, 0, 0, 69],
  ['Deflektor', 900, 1, 2, 2, 1, 70],
  ['Abt. Kapital', 2500, 2, 3, 0, 0, 70],
  ['Manufaktur', 2500, 3, 4, 0, 0, 73],
  ['Helipad', 2500, 2, 3, 0, 0, 73],
  ['Abt. Forschung', 3500, 3, 4, 6, 4, 74],
  ['Wumms', 1500, 3, 2, 0, 0, 76],
  ['Einheit 5', 150, 1, 1, 1, 1, 70, 'foot'],
  ['Mutant', 250, 1, 1, 1, 2, 70, 'foot'],
  ['Tyrant', 500, 2, 2, 3, 2, 70, 'foot'],
  ['Extend', 600, 2, 3, 3, 3, 70, 'foot'],
  ['Agressor Panzer', 900, 2, 4, 3, 2, 74, 'vehicle'],
  ['Artillerie Panzer', 800, 2, 1, 3, 2, 74, 'vehicle'],
  ['Regenerat. Panzer', 1000, 3, 3, 5, 5, 74, 'vehicle'],
  ['Helicopter', 1200, 3, 2, 4, 3, 75, 'air'],
  // BIOTEC-Upgrades: im Original ohne Wirkung ("Update 1–6"), Neuentwicklung nach dem Technologiebaum
  ['Mutagen', 1000, 0, 0, 0, 0, 70],
  ['Flüstern', 1200, 0, 0, 0, 0, 75],
  ['Perpetuum', 1000, 0, 0, 0, 0, 71],
  ['Chitinpanzer', 1500, 0, 0, 0, 0, 76],
  ['Neuronetz', 1000, 0, 0, 0, 0, 76],
  ['Zellregeneration', 2000, 0, 0, 0, 0, 76],
];

export const CARDS: readonly CardType[] = ROWS.map(([name, price, rounds, def, off, dmg, requires, unitClass], id) => ({
  id, name, price, rounds, def, off, dmg, requires, unitClass,
}));

// kartenzeiger[160]: physische Karte (EAN-Index) -> Kartentyp
export const CARD_OF_EAN: readonly number[] = [
  0, 1, 2, 2, 2, 3, 3, 4, 4, 4, 5, 6, 7, 8, 9, 9, 9, 10, 10, 10,
  11, 11, 11, 12, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 25, 25, 26, 26, 26, 27, 27, 28, 29, 30, 31, 32, 32, 32, 33, 33, 33,
  34, 34, 34, 35, 35, 35, 36, 36, 37, 37, 38, 38, 39, 39, 40, 41, 42, 43, 44, 45,
  46, 47, 47, 48, 48, 49, 49, 49, 50, 50, 51, 52, 53, 54, 55, 55, 55, 56, 56, 56,
  57, 57, 57, 58, 58, 58, 59, 59, 60, 60, 61, 61, 62, 62, 63, 64, 65, 66, 67, 68,
  69, 70, 71, 71, 71, 72, 72, 72, 73, 73, 74, 75, 76, 77, 78, 78, 79, 79, 80, 80,
  81, 81, 82, 82, 82, 83, 83, 83, 84, 84, 84, 85, 85, 85, 86, 87, 88, 89, 90, 91,
];

// Startausstattung (Z. 909–955): EAN-Nummern, die in Runde 1 aktiviert werden
export const STARTING_EANS: Record<Faction, readonly number[]> = {
  0: [0, 1, 2],
  1: [40, 41, 42],
  2: [80, 81],
  3: [120, 121, 122],
};

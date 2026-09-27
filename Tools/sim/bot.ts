// Strategie-Bot: bewertet Käufe, Angriffe und Reparaturen in Credits und handelt über die echten Engine-Funktionen.
// Er nutzt nur, was am Tisch sichtbar ist: Spielfeld, offene Karten, Upgrades, Münzen. Verdeckte Planeten kennt er nicht.
import {
  ATTACK_PRICE, BASE_INCOME, CARDS, HELICOPTER, MAX_ATTACKS, MAX_BUYS, MEDAL_MIN_STARS, MEDAL_POINTS, REPAIR_PRICE, SCARETECH,
  STEALTH, SUPPLY_INCOME, UPG, type Faction,
} from '../../src/engine/data';
import {
  cardIdOfEan, factionOfEan, isAircraft, isCenter, isFlak, isHeadquarters, isReactor, isSuperweapon, isSupply,
  kindOfCardId, kindOfEan,
} from '../../src/engine/cards';
import { repair, repairCheck } from '../../src/engine/actions';
import { buy, buyCheck } from '../../src/engine/buy';
import { attack, type CombatResult } from '../../src/engine/combat';
import {
  currentFaction, findSlot, hasCard, ownedSlots, slotCardId, type GameState, type Player, type Rng, type Slot,
} from '../../src/engine/state';
import { reactorEnergy } from '../../src/engine/turn';
import { mainCheck, victoryPoints } from '../../src/engine/victory';
import {
  WORMHOLE, frontUnits, legalTargets, onBoard, placePlanet, placeUnit, removeFromBoard, resolveTarget, reveal,
  roomForUnits, rowCount, swapPlanets, type Board, type PlanetRow, type Target,
} from './board';
import { hitChance, planetAttack, unitDuel, type Fighter, type Outcome } from './duel';
import type { BotParams } from './params';

export type Bot = BotParams | 'random';

export interface PlayerLog {
  /** [Runde, Kartentyp] je Kauf */
  buys: Array<[number, number]>;
  attacks: number;
  kills: number;
  losses: number;
  overloads: number;
  firstAttack: number | null;
}

export interface Ctx {
  s: GameState;
  /** Spielfeld je Fraktion */
  boards: Board[];
  /** Würfel der Engine (Kampf, Sonderaktion) */
  dice: Rng;
  /** Zufall am Tisch: welche verdeckte Karte getroffen wird, kleine Bewertungsunschärfe */
  rng: Rng;
  logs: PlayerLog[];
}

export const newLog = (): PlayerLog => ({ buys: [], attacks: 0, kills: 0, losses: 0, overloads: 0, firstAttack: null });

const VP_CREDITS = 700;
const WIN_VALUE = 1_000_000;
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/** Upgrade → Einheitentypen, deren Werte es verbessert (wie applyUpgrade in src/engine/buy.ts; per Test abgeglichen) */
export const UPGRADE_UNITS: Record<number, number[]> = {
  17: [12, 14], 19: [15, 16], 20: [15, 16], 22: [11],
  40: [34], 41: [35], 43: [36, 38], 44: [32, 33], 45: [39],
  63: [58, 59], 64: [55, 57], 66: [60], 67: [58],
  86: [78, 79], 89: [82, 84],
};
const ENERGY_UPGRADES: number[] = [UPG.starwingControlRods, UPG.lightforceOvercharge, UPG.biotecPerpetuum];

/** Kartentypen, die ein Kartentyp freischaltet */
const CHILDREN: number[][] = CARDS.map((c) => CARDS.filter((x) => x.requires === c.id).map((x) => x.id));

// ---------------------------------------------------------------- Hilfen

const slotOf = (s: GameState, ean: number): Slot | undefined => {
  const p = s.players[factionOfEan(ean)];
  const i = findSlot(p, ean);
  return i < 0 ? undefined : p.slots[i]!;
};
const fighter = (s: GameState, id: number, def = s.stats[id].def): Fighter => ({ def, off: s.stats[id].off, dmg: s.stats[id].dmg });
const opponents = (s: GameState): Faction[] => s.seats.filter((f) => f !== currentFaction(s));
const hasActive = (p: Player, id: number) => ownedSlots(p).some((slot) => slot.active && slotCardId(slot) === id);
const hasActiveCenter = (p: Player) => ownedSlots(p).some((slot) => slot.active && isCenter(slotCardId(slot)));
const activeFlak = (p: Player) => ownedSlots(p).filter((slot) => slot.active && isFlak(slotCardId(slot))).length;
const pendingUnits = (p: Player) =>
  ownedSlots(p).filter((sl) => sl.remaining > 0 && kindOfEan(sl.ean) === 'unit').map((sl) => sl.ean);
const unitIds = (f: Faction) => Array.from({ length: 8 }, (_, i) => f * 23 + 9 + i);
/** Scaretech mit Schwarzem Schleier spielt Einheiten verdeckt aus */
const playsHidden = (p: Player) => p.faction === SCARETECH && hasCard(p, UPG.scaretechCamouflage);
const isStealthy = (me: Player, attId: number) => attId === STEALTH || (attId === HELICOPTER && hasCard(me, UPG.biotecWhisper));

function horizon(s: GameState): number {
  if (s.vpLimit === null) return 12;
  const lead = Math.max(...s.seats.map((f) => victoryPoints(s.players[f])));
  return clamp((s.vpLimit - lead) / 1.2, 2, 12);
}

/** Wert eines eigenen Siegpunkts in Credits; kurz vor dem Ziel steigt er, bei „∞“ zählen Punkte nicht */
function vpWorth(s: GameState, me: Player, P: BotParams): number {
  if (s.vpLimit === null) return 0;
  const close = clamp((victoryPoints(me) - (s.vpLimit - 8)) / 8, 0, 1);
  return P.vp * VP_CREDITS * (1 + 2 * close);
}

/** Wie stark ein Gegner ins Visier genommen wird: den Führenden bremsen (leader → 1) oder den Schwächsten (→ 0) */
function leaderMult(s: GameState, opp: Faction, P: BotParams): number {
  const opps = opponents(s);
  const vp = (f: Faction) => victoryPoints(s.players[f]);
  const mean = opps.reduce<number>((n, f) => n + vp(f), 0) / opps.length;
  let m = 1 + ((P.leader - 0.5) * 2 * (vp(opp) - mean)) / 6;
  if (s.vpLimit !== null && s.vpLimit - vp(opp) <= 4) m += 1;
  return clamp(m, 0.3, 2.5);
}

/** Schutzbedürfnis eines Planeten: je höher, desto eher in die 3. Reihe */
function protectPriority(id: number): number {
  if (isHeadquarters(id)) return 100;
  if (isReactor(id)) return 60;
  if (isSupply(id)) return 50;
  if (isCenter(id)) return 45;
  if (isSuperweapon(id)) return 40;
  if (isFlak(id)) return 5;
  return 20 + CARDS[id].price / 200;
}

// ---------------------------------------------------------------- Legen

/** Mindestens 2 Planeten schirmen in Reihe 2 die 3. Reihe ab */
const SHIELD_PLANETS = 2;

export function planetRow(board: Board, id: number, P: BotParams): PlanetRow {
  if (isHeadquarters(id)) return P.hqBack >= 0.5 ? 3 : 2;
  if (P.reactorFront && isReactor(id)) return 2;
  // Energiequellen nie nach vorn: fällt eine, droht Überlastung (Aussetzen)
  if (isFlak(id) || (rowCount(board, 2) < SHIELD_PLANETS && protectPriority(id) < 60)) return 2;
  return protectPriority(id) >= 40 ? 3 : 2;
}

/** Aktivierte Karte auf das Spielfeld legen (eine nachgeladene Superwaffe liegt schon) */
export function placeActivated(ctx: Ctx, f: Faction, ean: number, P: BotParams) {
  const board = ctx.boards[f];
  if (onBoard(board, ean) || board.waiting.includes(ean)) return;
  if (kindOfEan(ean) === 'building') placePlanet(board, ean, planetRow(board, cardIdOfEan(ean), P));
  else if (!placeUnit(board, ean, playsHidden(ctx.s.players[f]))) board.waiting.push(ean);
}

/** Wartende Einheiten legen, sobald in Reihe 1 Platz ist */
export function placeWaiting(ctx: Ctx, f: Faction) {
  const board = ctx.boards[f];
  const waiting = board.waiting;
  board.waiting = [];
  for (const ean of waiting) if (!placeUnit(board, ean, playsHidden(ctx.s.players[f]))) board.waiting.push(ean);
}

/** Zugbeginn: Auge des Raumes deckt eine gegnerische Karte auf, Neuronetz tauscht zwei eigene verdeckte Planeten */
export function turnStartSpecials(ctx: Ctx, f: Faction, P: BotParams) {
  const { s, boards, rng } = ctx;
  const p = s.players[f];
  if (hasCard(p, UPG.starwingSpySatellite)) {
    const target = [...opponents(s)].sort((a, b) => leaderMult(s, b, P) - leaderMult(s, a, P))[0];
    const hidden = boards[target].planets.filter((sp) => !sp.revealed);
    if (hidden.length) hidden[Math.floor(rng() * hidden.length)].revealed = true;
  }
  if (hasCard(p, UPG.biotecNeuronet)) {
    const board = boards[f];
    const hidden = (row: PlanetRow) => board.planets.filter((sp) => sp.row === row && !sp.revealed);
    const prio = (ean: number) => protectPriority(cardIdOfEan(ean));
    const front = hidden(2).sort((a, b) => prio(b.ean) - prio(a.ean))[0];
    const back = hidden(3).sort((a, b) => prio(a.ean) - prio(b.ean))[0];
    if (front && back && prio(front.ean) > prio(back.ean) + 10) swapPlanets(board, front.ean, back.ean);
  }
}

// ---------------------------------------------------------------- Kaufen

class BuyPlanner {
  readonly me: Player;
  readonly board: Board;
  readonly H: number;
  readonly vpW: number;
  private refs: Fighter[] | null = null;
  private strengthCache = new Map<number, number>();

  constructor(readonly ctx: Ctx, readonly P: BotParams) {
    const f = currentFaction(ctx.s);
    this.me = ctx.s.players[f];
    this.board = ctx.boards[f];
    this.H = horizon(ctx.s);
    this.vpW = vpWorth(ctx.s, this.me, P);
  }

  /** Vergleichsgegner für die Kampfkraft: sichtbare gegnerische Einheiten, ergänzt um deren Kartenauswahl */
  private enemyRefs(): Fighter[] {
    if (this.refs) return this.refs;
    const { s, boards } = this.ctx;
    const refs: Fighter[] = [];
    for (const o of opponents(s)) {
      for (const ean of frontUnits(boards[o])) {
        const slot = slotOf(s, ean);
        if (slot) refs.push(fighter(s, cardIdOfEan(ean), slot.def));
      }
    }
    if (refs.length < 4) for (const o of opponents(s)) for (const id of unitIds(o)) refs.push(fighter(s, id));
    this.refs = refs;
    return refs;
  }

  /** Kampfkraft 0…1: Siegchance als Angreifer und als Verteidiger gegen die Vergleichsgegner */
  strength(id: number): number {
    const cached = this.strengthCache.get(id);
    if (cached !== undefined) return cached;
    const me = fighter(this.ctx.s, id);
    const refs = this.enemyRefs();
    let sum = 0;
    for (const r of refs) sum += 0.5 * (unitDuel(me, r).attWin + unitDuel(r, me).defWin);
    const v = sum / refs.length;
    this.strengthCache.set(id, v);
    return v;
  }

  private frontCount(): number {
    return frontUnits(this.board).length + this.board.waiting.length + pendingUnits(this.me).length;
  }

  private threat: number | null = null;

  /**
   * Bedrohung 0…2: stärkste gegnerische Streitmacht (offen liegende Einheiten plus Einheiten im Baustapel,
   * deren Rückseite man sieht) gegen die eigene, gemessen in Credits
   */
  threatFactor(): number {
    if (this.threat !== null) return this.threat;
    const { s, boards } = this.ctx;
    const worth = (eans: number[]) => eans.reduce((n, ean) => n + CARDS[cardIdOfEan(ean)].price, 0);
    const enemy = Math.max(...opponents(s).map((o) => worth(frontUnits(boards[o])) + pendingUnits(s.players[o]).length * 450));
    const mine = worth([...frontUnits(this.board), ...this.board.waiting, ...pendingUnits(this.me)]);
    this.threat = clamp((enemy - mine) / 1500, 0, 2);
    return this.threat;
  }

  private energyNeed(): boolean {
    const p = this.me;
    if (p.faction === SCARETECH) return false;
    const pendingReactors = ownedSlots(p).filter((sl) => sl.remaining > 0 && isReactor(slotCardId(sl))).length;
    return p.energy + pendingReactors * reactorEnergy(p) <= 1;
  }

  private owns(id: number): boolean {
    return ownedSlots(this.me).some((slot) => slotCardId(slot) === id);
  }

  /**
   * Was ein Planet freischaltet: Nettowert der neuen Karten (Wert minus Preis) unter der aktuellen Lage,
   * Einheiten doppelt, weil man sie mehrfach kaufen kann; eine Stufe tiefer mit Abschlag
   */
  private unlockValue(id: number, depth = 0): number {
    if (this.owns(id)) return 0;
    let v = 0;
    for (const c of CHILDREN[id]) {
      const net = (x: number) => Math.max(0, x - CARDS[c].price);
      const kind = kindOfCardId(c);
      if (kind === 'unit') v += 2 * net(this.unitValue(c));
      else if (kind === 'upgrade') v += 0.5 * net(this.upgradeValue(c));
      else v += 0.6 * net(this.buildingValue(c, false)) + (depth === 0 ? 0.3 * this.unlockValue(c, 1) : 0);
    }
    return v;
  }

  private unitValue(id: number): number {
    const P = this.P;
    const st = this.ctx.s.stats[id];
    const strength = this.strength(id);
    let v = P.military * 2000 * strength;
    // Angriffe auf Planeten (auch Einweg-Einheiten wie Erazor)
    v += (P.hqFocus * 400 * hitChance(st.off) * Math.min(st.dmg, 4)) / 4;
    if (isAircraft(id)) v += P.air * 600 + P.hqFocus * 300;
    if (st.def > 0) {
      // Verteidigungsbedarf: je kampfstärker die Einheit, desto mehr hilft sie
      const guard = 0.5 + strength;
      if (this.frontCount() < P.minFront) v += P.defense * 600 * guard;
      v += P.defense * 500 * this.threatFactor() * guard;
    }
    return v;
  }

  private buildingValue(id: number, withUnlocks = true): number {
    const P = this.P;
    const card = CARDS[id];
    let v = this.vpW;
    if (isSupply(id)) v += P.econ * 400 * Math.max(0, this.H - card.rounds);
    if (isReactor(id)) v += this.energyNeed() ? 1400 * Math.max(P.econ, P.tech) : 100;
    if (isFlak(id)) v += P.defense * 500;
    if (isCenter(id)) v += 200 * Math.min(3, frontUnits(this.board).length) * this.H * 0.4 * Math.max(0.5, P.military);
    if (isSuperweapon(id)) v += P.superweapon * 2500;
    if (id === WORMHOLE) v += P.hqFocus * 600;
    // Schutzplaneten in Reihe 2 halten die 3. Reihe (Zentralgestirn) verdeckt
    if (rowCount(this.board, 2) < SHIELD_PLANETS) v += P.defense * 400;
    if (withUnlocks) v += P.tech * this.unlockValue(id);
    if (this.me.faction !== SCARETECH && !isReactor(id)) v -= this.me.energy <= 1 ? 300 : 100;
    return v;
  }

  private upgradeValue(id: number): number {
    const P = this.P;
    const mine = [...frontUnits(this.board), ...this.board.waiting, ...pendingUnits(this.me)].map(cardIdOfEan);
    const affected = UPGRADE_UNITS[id];
    let effect = 200;
    if (affected) effect = 300 * mine.filter((u) => affected.includes(u)).length + 150;
    else if (ENERGY_UPGRADES.includes(id)) {
      const reactors = ownedSlots(this.me).filter((sl) => isReactor(slotCardId(sl))).length;
      effect = this.energyNeed() ? 500 * reactors : 50;
    } else if (id === UPG.scaretechAutorepair) effect = 350;
    else if (id === UPG.starwingSpySatellite) effect = 300 + P.hqFocus * 300;
    else if (id === UPG.scaretechCamouflage) effect = 60 * mine.length;
    else if (id === UPG.biotecWhisper) effect = 500 * mine.filter((u) => u === HELICOPTER).length;
    else if (id === UPG.biotecNeuronet) effect = 300;
    else if (id === UPG.biotecRegeneration) effect = 150 * mine.length;
    return this.vpW + P.upgrades * effect;
  }

  value(id: number): number {
    const kind = kindOfCardId(id);
    return kind === 'unit' ? this.unitValue(id) : kind === 'building' ? this.buildingValue(id) : this.upgradeValue(id);
  }
}

interface BuyOption {
  ean: number;
  price: number;
  score: number;
  affordable: boolean;
}

const income = (p: Player) =>
  BASE_INCOME + SUPPLY_INCOME * ownedSlots(p).filter((slot) => slot.active && isSupply(slotCardId(slot))).length;

function buyPhase(ctx: Ctx, P: BotParams) {
  const { s, rng } = ctx;
  const f = currentFaction(s);
  for (let n = 0; n < MAX_BUYS && s.winner === null; n++) {
    const plan = new BuyPlanner(ctx, P);
    const p = plan.me;
    const reserve = hasActiveCenter(p) ? P.reserve * 0.4 : P.reserve;
    const seen = new Set<number>();
    const options: BuyOption[] = [];
    for (let ean = f * 40; ean < f * 40 + 40; ean++) {
      const id = cardIdOfEan(ean);
      if (seen.has(id)) continue;
      const check = buyCheck(s, ean);
      if (check !== null && check !== 'noCredits') continue;
      // „zu teuer“ prüft die Engine vor der Energie: ein Sparziel muss auch Energie haben
      if (check === 'noCredits' && kindOfEan(ean) === 'building' && !isReactor(id) && p.faction !== SCARETECH && p.energy <= 0) continue;
      seen.add(id);
      if (kindOfEan(ean) === 'unit' && !roomForUnits(plan.board, [...pendingUnits(p), ean])) continue;
      const price = CARDS[id].price;
      const value = plan.value(id) * (0.95 + 0.1 * rng());
      const affordable = check === null && (p.credits - price >= reserve || value >= 2.5 * price);
      if (value > price) options.push({ ean, price, score: value - price, affordable });
    }
    const best = (list: BuyOption[]) => list.reduce<BuyOption | null>((b, o) => (!b || o.score > b.score ? o : b), null);
    let choice = best(options.filter((o) => o.affordable));
    // Sparen: Eine teure, deutlich bessere Karte, die in spätestens zwei Zügen bezahlbar ist, hat Vorrang
    const goal = best(options.filter((o) => !o.affordable && o.price - p.credits <= 2 * income(p)));
    if (goal && goal.score * P.patience > (choice?.score ?? 0)) {
      const spendable = p.credits + income(p) - goal.price;
      choice = best(options.filter((o) => o.affordable && o.price <= spendable));
    }
    if (!choice || buy(s, choice.ean).error) break;
    ctx.logs[f].buys.push([s.round, cardIdOfEan(choice.ean)]);
    mainCheck(s);
  }
}

// ---------------------------------------------------------------- Angreifen

interface AttackOption {
  attacker: number;
  opp: Faction;
  target: Target;
  ev: number;
}

/** Planet als Ziel: bekannte Karte (id) oder unbekannter verdeckter Planet (id null) */
interface PlanetInfo {
  id: number | null;
  fighter: Fighter;
  shootsBack: boolean;
}

// Unbekannter verdeckter Planet: meist ein gewöhnlicher, manchmal ein Abwehrplanet
const GENERIC_PLANET: PlanetInfo = { id: null, fighter: { def: 3, off: 0, dmg: 0 }, shootsBack: false };
const GENERIC_FLAK: PlanetInfo = { id: null, fighter: { def: 3, off: 2, dmg: 2 }, shootsBack: true };

class AttackPlanner {
  readonly f: Faction;
  readonly me: Player;
  readonly vpW: number;
  readonly H: number;
  readonly n: number;
  readonly cost: number;

  constructor(readonly ctx: Ctx, readonly P: BotParams) {
    this.f = currentFaction(ctx.s);
    this.me = ctx.s.players[this.f];
    this.vpW = vpWorth(ctx.s, this.me, P);
    this.H = horizon(ctx.s);
    this.n = ctx.s.playerCount;
    this.cost = hasActiveCenter(this.me) ? 0 : ATTACK_PRICE;
  }

  /** Eigene Karten, die angreifen dürfen: aktive Einheiten in Reihe 1 und die geladene Superwaffe */
  attackers(): number[] {
    const board = this.ctx.boards[this.f];
    const front = frontUnits(board);
    return ownedSlots(this.me)
      .filter((slot) => slot.active && !slot.attacked)
      .filter((slot) => (kindOfEan(slot.ean) === 'unit' && front.includes(slot.ean))
        || (isSuperweapon(slotCardId(slot)) && onBoard(board, slot.ean)))
      .map((slot) => slot.ean);
  }

  /** Wert des eigenen Angreifers, falls er fällt */
  private lossValue(ean: number): number {
    const id = cardIdOfEan(ean);
    if (isSuperweapon(id)) return 0;
    const front = frontUnits(this.ctx.boards[this.f]).length;
    return CARDS[id].price * 0.7 + (front <= this.P.minFront ? this.P.defense * 300 : 0);
  }

  private starMe(): number {
    const me = this.me;
    const others = this.ctx.s.players.filter((p) => p.faction !== me.faction);
    const medal = !me.bestArmy && me.stars + 1 >= MEDAL_MIN_STARS && others.every((o) => me.stars + 1 > o.stars);
    return this.vpW * (1 + (medal ? MEDAL_POINTS : 0));
  }

  private starOpp(opp: Faction): number {
    return (this.vpW / (this.n - 1)) * leaderMult(this.ctx.s, opp, this.P);
  }

  /** Erwartungswert eines Gefechtsausgangs */
  private combine(o: Outcome, kill: number, loss: number, starOpp: number, progress: number): number {
    const starMe = this.starMe();
    return o.attWin * (kill + starMe) + o.both * (kill - loss) + o.defWin * (-loss - starOpp) + progress;
  }

  private attackerFighter(attEan: number): Fighter {
    return fighter(this.ctx.s, cardIdOfEan(attEan), slotOf(this.ctx.s, attEan)!.def);
  }

  private evalUnit(attEan: number, opp: Faction, defId: number, defDef: number): number {
    const { s, boards } = this.ctx;
    const a = this.attackerFighter(attEan);
    const d = fighter(s, defId, defDef);
    const o = isSuperweapon(cardIdOfEan(attEan)) ? planetAttack(a, d, { always: true }) : unitDuel(a, d);
    const front = frontUnits(boards[opp]).length;
    // Belagerung: Jeder gefallene Verteidiger bringt die Planeten näher; bei „∞“ zählt nur das
    const siege = (this.P.hqFocus * (s.vpLimit === null ? 2400 : 900)) / Math.max(1, front);
    const kill = (CARDS[defId].price * 0.6 + siege) * leaderMult(s, opp, this.P);
    return this.combine(o, kill, this.lossValue(attEan), this.starOpp(opp), 30 * (defDef - o.defLeft));
  }

  private planetKill(opp: Faction, id: number | null, row: PlanetRow): { kill: number; perPoint: number } {
    const { s, boards } = this.ctx;
    const owner = s.players[opp];
    const lm = leaderMult(s, opp, this.P);
    if (id !== null && isHeadquarters(id)) return { kill: WIN_VALUE, perPoint: this.P.hqFocus * 700 * lm };
    if (id !== null && isReactor(id) && owner.faction !== SCARETECH && owner.energy - reactorEnergy(owner) < 0) {
      // Überlastung: Die Energiequelle bleibt liegen, der Besitzer setzt aber eine Runde aus
      return { kill: 1200 * lm, perPoint: 40 };
    }
    const price = id === null ? 1200 : CARDS[id].price;
    let kill = (this.vpW / (this.n - 1)) * lm + price * 0.25 * this.P.hqFocus;
    if (id !== null && isSupply(id)) kill += (400 * this.H * 0.4 * lm) / (this.n - 1);
    if (id !== null && isFlak(id)) kill += 300 * lm;
    if (id !== null && isCenter(id)) kill += 700 * lm;
    if (id !== null && isSuperweapon(id)) kill += 2000 * lm;
    // Belagerung: Die Planeten der 2. Reihe schirmen die 3. ab; bei „∞“ zählt nur der Weg zum Zentralgestirn
    if (row === 2) kill += ((this.P.hqFocus * (s.vpLimit === null ? 2400 : 700)) / Math.max(1, rowCount(boards[opp], 2))) * lm;
    return { kill, perPoint: 40 };
  }

  private evalPlanet(attEan: number, opp: Faction, planet: PlanetInfo, row: PlanetRow): number {
    const { s } = this.ctx;
    const attId = cardIdOfEan(attEan);
    const a = this.attackerFighter(attEan);
    const d = planet.fighter;
    let o: Outcome;
    if (isSuperweapon(attId)) o = planetAttack(a, d, { always: true });
    else if (isStealthy(this.me, attId)) o = planetAttack(a, d, {});
    else if (isAircraft(attId)) o = planetAttack(a, d, { flak: activeFlak(s.players[opp]) });
    else o = planetAttack(a, d, { shootsBack: planet.shootsBack });
    const { kill, perPoint } = this.planetKill(opp, planet.id, row);
    const destroyed = o.attWin + o.both;
    const progress = (1 - destroyed) * perPoint * Math.max(0, d.def - o.defLeft);
    const starOpp = planet.shootsBack ? this.starOpp(opp) : 0;
    return this.combine(o, kill, this.lossValue(attEan), starOpp, progress);
  }

  private known(ean: number): PlanetInfo {
    const { s } = this.ctx;
    const id = cardIdOfEan(ean);
    return { id, fighter: fighter(s, id, slotOf(s, ean)!.def), shootsBack: isFlak(id) };
  }

  evaluate(attEan: number, opp: Faction, t: Target): number {
    const { s, boards } = this.ctx;
    const board = boards[opp];
    let ev: number;
    switch (t.type) {
      case 'unit':
        ev = this.evalUnit(attEan, opp, cardIdOfEan(t.ean), slotOf(s, t.ean)!.def);
        break;
      case 'hiddenUnit': {
        const pool = unitIds(opp).filter((id) => s.stats[id].def > 0);
        ev = pool.reduce((n, id) => n + this.evalUnit(attEan, opp, id, s.stats[id].def), 0) / pool.length;
        break;
      }
      case 'planet': {
        const spot = board.planets.find((p) => p.ean === t.ean)!;
        ev = this.evalPlanet(attEan, opp, this.known(t.ean), spot.row);
        break;
      }
      case 'hiddenPlanet': {
        // Ohne Wissen über die Lage ist jeder verdeckte Planet mit gleicher Wahrscheinlichkeit das Zentralgestirn
        const hidden = board.planets.filter((p) => !p.revealed);
        const hq = hidden.find((p) => isHeadquarters(cardIdOfEan(p.ean)));
        const pHq = hq ? 1 / hidden.length : 0;
        const generic = 0.8 * this.evalPlanet(attEan, opp, GENERIC_PLANET, t.row)
          + 0.2 * this.evalPlanet(attEan, opp, GENERIC_FLAK, t.row);
        const hqId = opp * 23;
        const hqInfo: PlanetInfo = { id: hqId, fighter: fighter(s, hqId), shootsBack: false };
        ev = (hq ? pHq * this.evalPlanet(attEan, opp, hqInfo, t.row) : 0) + (1 - pHq) * generic + 100;
        break;
      }
    }
    return ev - this.cost;
  }

  options(): AttackOption[] {
    const { s, boards } = this.ctx;
    const wormhole = this.me.faction === SCARETECH && hasActive(this.me, WORMHOLE);
    const out: AttackOption[] = [];
    for (const attacker of this.attackers()) {
      for (const opp of opponents(s)) {
        for (const target of legalTargets(attacker, wormhole, boards[opp])) {
          out.push({ attacker, opp, target, ev: this.evaluate(attacker, opp, target) });
        }
      }
    }
    return out;
  }
}

/** Kampf ausführen und das Spielfeld nachziehen */
export function executeAttack(ctx: Ctx, attEan: number, opp: Faction, target: Target): CombatResult | null {
  const { s, boards, rng, dice } = ctx;
  const f = currentFaction(s);
  const defEan = resolveTarget(target, boards[opp], rng);
  const { error, result } = attack(s, attEan, defEan, dice);
  if (error || !result) return null;
  reveal(boards[opp], defEan);
  reveal(boards[f], attEan);
  for (const ean of result.destroyed) {
    if (!result.rescued.includes(ean)) removeFromBoard(boards[factionOfEan(ean)], ean);
  }
  const log = ctx.logs[f];
  log.attacks++;
  if (log.firstAttack === null) log.firstAttack = s.round;
  if (result.destroyed.includes(defEan) && !result.rescued.includes(defEan)) log.kills++;
  if (result.destroyed.includes(attEan) && !result.rescued.includes(attEan)) log.losses++;
  mainCheck(s);
  return result;
}

function attackPhase(ctx: Ctx, P: BotParams) {
  const { s } = ctx;
  while (s.winner === null && s.attacks < MAX_ATTACKS) {
    const me = s.players[currentFaction(s)];
    if (!hasActiveCenter(me) && me.credits < ATTACK_PRICE) break;
    let best: AttackOption | null = null;
    for (const o of new AttackPlanner(ctx, P).options()) if (!best || o.ev > best.ev) best = o;
    if (!best || best.ev + P.aggression <= 0) break;
    if (!executeAttack(ctx, best.attacker, best.opp, best.target)) break;
  }
}

// ---------------------------------------------------------------- Reparieren

function repairPhase(ctx: Ctx, P: BotParams) {
  const { s, boards } = ctx;
  const f = currentFaction(s);
  const me = s.players[f];
  if (me.credits - REPAIR_PRICE < P.reserve * 0.5) return;
  let best = -1;
  let bestScore = REPAIR_PRICE;
  for (const slot of ownedSlots(me)) {
    if (repairCheck(s, slot.ean) !== null) continue;
    const id = slotCardId(slot);
    const missing = 1 - slot.def / s.stats[id].def;
    let score: number;
    if (isHeadquarters(id)) {
      const revealed = boards[f].planets.some((p) => p.ean === slot.ean && p.revealed);
      score = 2000 * (revealed ? 1 : 0.3);
    } else if (kindOfEan(slot.ean) === 'unit') score = CARDS[id].price * 0.6 * missing;
    else score = 500 * missing;
    score *= P.repair;
    if (score > bestScore) {
      bestScore = score;
      best = slot.ean;
    }
  }
  if (best >= 0) repair(s, best);
}

// ---------------------------------------------------------------- Zug

export function playTurn(ctx: Ctx, P: BotParams) {
  attackPhase(ctx, P);
  if (ctx.s.winner !== null) return;
  repairPhase(ctx, P);
  buyPhase(ctx, P);
}

const RANDOM_PARAMS: BotParams = {
  econ: 1, military: 1, air: 1, vp: 1, tech: 1, upgrades: 1, superweapon: 1, defense: 1,
  minFront: 3, reserve: 0, patience: 0, aggression: 0, hqFocus: 1, leader: 0.5, repair: 1, hqBack: 1,
};
export const RANDOM_PLACEMENT = RANDOM_PARAMS;

/** Zufallsspieler als Untergrenze: kauft und greift wahllos an (nur erlaubte Züge) */
export function playRandomTurn(ctx: Ctx) {
  const { s, boards, rng } = ctx;
  const f = currentFaction(s);
  const me = s.players[f];
  const pick = <T>(list: T[]): T | undefined => list[Math.floor(rng() * list.length)];
  for (let n = 0; n < 6 && s.buys < MAX_BUYS && s.winner === null; n++) {
    const ean = f * 40 + Math.floor(rng() * 40);
    if (rng() < 0.3 || buyCheck(s, ean) !== null) continue;
    if (kindOfEan(ean) === 'unit' && !roomForUnits(boards[f], [...pendingUnits(me), ean])) continue;
    buy(s, ean);
    ctx.logs[f].buys.push([s.round, cardIdOfEan(ean)]);
    mainCheck(s);
  }
  const planner = new AttackPlanner(ctx, RANDOM_PARAMS);
  for (let n = 0; n < MAX_ATTACKS && s.winner === null; n++) {
    if (rng() < 0.5 || (!hasActiveCenter(me) && me.credits < ATTACK_PRICE)) continue;
    const attacker = pick(planner.attackers());
    const opp = pick(opponents(s));
    if (attacker === undefined || opp === undefined) break;
    const target = pick(legalTargets(attacker, false, boards[opp]));
    if (target) executeAttack(ctx, attacker, opp, target);
  }
}

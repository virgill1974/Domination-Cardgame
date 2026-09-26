import { describe, expect, it } from 'vitest';
import { BIOTEC, LIGHTFORCE, SCARETECH, STARWING } from './data';
import { newGame, currentFaction, findSlot } from './state';
import { beginTurn } from './turn';
import { buy, buyCheck, buyPrecheck } from './buy';
import { attack, attackConfirmAttacker } from './combat';
import { info, repair, repairCheck } from './actions';
import { mainCheck } from './victory';
import { dice, give, noDice, started } from './testutil';

describe('Spielstart und Zugbeginn', () => {
  it('startet mit 1600 Credits und inaktiven Startgebäuden', () => {
    const s = newGame([STARWING, LIGHTFORCE], 30);
    expect(s.players[STARWING].credits).toBe(1600);
    expect(s.players[STARWING].slots.slice(37).map((x) => x?.ean)).toEqual([0, 1, 2]);
    expect(s.players[SCARETECH].slots.slice(38).map((x) => x?.ean)).toEqual([80, 81]);
    expect(s.players[STARWING].slots[37]).toMatchObject({ active: false, remaining: 1 });
  });

  it('aktiviert im ersten Zug die Startgebäude, zahlt 400 und setzt die Energie auf 1', () => {
    const s = newGame([LIGHTFORCE, SCARETECH], 30);
    const { events, skipped } = beginTurn(s, noDice);
    expect(skipped).toBe(false);
    expect(currentFaction(s)).toBe(LIGHTFORCE);
    expect(s.round).toBe(1);
    expect(events.filter((e) => e.type === 'activated')).toHaveLength(3);
    expect(s.players[LIGHTFORCE]).toMatchObject({ credits: 2000, buildings: 3, energy: 1 });
    beginTurn(s, noDice);
    expect(s.players[SCARETECH]).toMatchObject({ buildings: 2, energy: 1 });
    beginTurn(s, noDice);
    expect(s.round).toBe(2);
  });

  it('zahlt 400 extra je aktiviertem Nachschublager', () => {
    const s = started([STARWING, LIGHTFORCE]);
    give(s, LIGHTFORCE, 48);
    give(s, LIGHTFORCE, 49, false);
    const before = s.players[LIGHTFORCE].credits;
    beginTurn(s, noDice);
    expect(s.players[LIGHTFORCE].credits).toBe(before + 400 + 400);
  });

  it('lässt bei Überlastung den Zug aussetzen und stellt die Reaktorenergie wieder her', () => {
    const s = started([STARWING, LIGHTFORCE]);
    s.players[LIGHTFORCE].energy = -1;
    const turn = beginTurn(s, noDice);
    expect(turn).toEqual({ events: [{ type: 'overload' }], skipped: true });
    expect(s.players[LIGHTFORCE].energy).toBe(2);
    expect(s.turnActive).toBe(false);
  });

  it('SCARETECH kennt keine Überlastung', () => {
    const s = started([STARWING, SCARETECH]);
    s.players[SCARETECH].energy = -3;
    expect(beginTurn(s, noDice).skipped).toBe(false);
  });

  it('löst ab Runde 5 Sonderaktionen aus (W6 >= 3, dann Aktion)', () => {
    const s = started([STARWING, LIGHTFORCE]);
    s.round = 5;
    s.seat = 1;
    const before = s.players[STARWING].credits;
    const { events } = beginTurn(s, dice(3, 1));
    expect(s.round).toBe(6);
    expect(events).toContainEqual({ type: 'special', roll: 1 });
    expect(s.players[STARWING].credits).toBe(before + 400 + 1000);
  });

  it('keine Sonderaktion bei W6 < 3', () => {
    const s = started([STARWING, LIGHTFORCE]);
    s.round = 5;
    s.seat = 1;
    expect(beginTurn(s, dice(2)).events.some((e) => e.type === 'special')).toBe(false);
  });

  it('Sonderaktion "Alles aktiviert" aktiviert Karten noch im selben Zug', () => {
    const s = started([STARWING, LIGHTFORCE]);
    s.round = 5;
    s.seat = 1;
    give(s, STARWING, 26, false);
    beginTurn(s, dice(4, 5));
    expect(s.players[STARWING].slots[findSlot(s.players[STARWING], 26)]).toMatchObject({ active: true, remaining: 0 });
  });

  it('Sonderaktion "Alles +1 repariert" repariert bis zum Maximalwert', () => {
    const s = started([STARWING, LIGHTFORCE]);
    s.round = 5;
    s.seat = 1;
    s.players[STARWING].slots[37]!.def = 5;
    s.players[STARWING].slots[38]!.def = 2;
    beginTurn(s, dice(6, 6));
    expect(s.players[STARWING].slots[37]!.def).toBe(6);
    expect(s.players[STARWING].slots[38]!.def).toBe(2);
  });
});

describe('Kaufen', () => {
  it('prüft Fraktion, Besitz, Freischaltung, Credits und Energie in Originalreihenfolge', () => {
    const s = started([STARWING, LIGHTFORCE]);
    expect(buy(s, 41).error).toBe('wrongCard');
    expect(buy(s, 1).error).toBe('alreadyOwned');
    expect(buy(s, 10).error).toBe('locked');
    s.players[STARWING].credits = 100;
    expect(buy(s, 14).error).toBe('noCredits');
    s.players[STARWING].credits = 5000;
    s.players[STARWING].energy = 0;
    expect(buy(s, 7).error).toBe('noEnergy');
  });

  it('Korrektur 4: sperrt Gebäudekauf auch bei negativer Energie', () => {
    const s = started([STARWING, LIGHTFORCE]);
    s.players[STARWING].energy = -1;
    expect(buy(s, 7).error).toBe('noEnergy');
  });

  it('SCARETECH braucht keine Energie', () => {
    const s = started([SCARETECH, LIGHTFORCE]);
    s.players[SCARETECH].energy = 0;
    expect(buy(s, 85).error).toBeUndefined();
  });

  it('bucht Credits und Energie ab und legt die Karte in Bau', () => {
    const s = started([STARWING, LIGHTFORCE]);
    expect(buy(s, 7)).toEqual({ events: [] });
    const p = s.players[STARWING];
    expect(p).toMatchObject({ credits: 1000, energy: 0 });
    expect(p.slots[findSlot(p, 7)]).toMatchObject({ remaining: 1, def: 3, active: false });
    expect(s.buys).toBe(1);
  });

  it('Reaktoren kosten keine Energie und liefern bei Aktivierung 3', () => {
    const s = started([STARWING, LIGHTFORCE]);
    buy(s, 3);
    expect(s.players[STARWING].energy).toBe(1);
    beginTurn(s, noDice);
    beginTurn(s, noDice);
    expect(s.players[STARWING].energy).toBe(4);
  });

  it('erlaubt höchstens 3 Käufe pro Zug', () => {
    const s = started([STARWING, LIGHTFORCE]);
    s.players[STARWING].credits = 10000;
    buy(s, 14);
    buy(s, 15);
    buy(s, 16);
    expect(buyPrecheck(s)).toBe('notPossible');
    expect(buy(s, 17).error).toBe('notPossible');
  });

  it('Korrektur 6: volles Inventar meldet "nicht mehr möglich"', () => {
    const s = started([STARWING, LIGHTFORCE]);
    const p = s.players[STARWING];
    p.slots = p.slots.map((slot) => slot ?? { ean: 9, def: 1, remaining: 0, active: true, attacked: false, counted: true });
    p.credits = 10000;
    expect(buy(s, 14).error).toBe('notPossible');
  });

  it('Upgrades wirken sofort und zählen als Siegpunkt', () => {
    const s = started([STARWING, LIGHTFORCE]);
    give(s, STARWING, 12);
    const crusader = give(s, STARWING, 23);
    crusader.def = 2;
    s.players[STARWING].credits = 5000;
    buy(s, 34);
    expect(crusader.def).toBe(3);
    expect(s.stats[12].def).toBe(4);
    expect(s.stats[14].def).toBe(5);
    expect(s.players[STARWING].upgrades).toBe(1);
    mainCheck(s);
    expect(s.players[STARWING].vp).toBe(5);
  });

  it('Korrektur 2: Energie-Upgrade zählt nur aktivierte Reaktoren', () => {
    const s = started([STARWING, LIGHTFORCE]);
    give(s, STARWING, 3, false);
    s.players[STARWING].credits = 5000;
    const energy = s.players[STARWING].energy;
    buy(s, 35);
    expect(s.players[STARWING].energy).toBe(energy + 2);
    beginTurn(s, noDice);
    beginTurn(s, noDice);
    expect(s.players[STARWING].energy).toBe(energy + 2 + 5);
  });

  it('Korrektur 9: Schwarzer Schleier (Tarnung) liefert einen Hinweis', () => {
    const s = started([SCARETECH, LIGHTFORCE]);
    give(s, SCARETECH, 90);
    s.players[SCARETECH].credits = 5000;
    expect(buy(s, 119).events).toEqual([{ type: 'camouflage' }]);
  });

  it('Korrektur 8: Auge des Raumes (Spionagesatellit) erinnert zu Zugbeginn', () => {
    const s = started([STARWING, LIGHTFORCE]);
    give(s, STARWING, 12);
    s.players[STARWING].credits = 5000;
    buy(s, 38);
    beginTurn(s, noDice);
    expect(beginTurn(s, noDice).events).toContainEqual({ type: 'spySatellite' });
  });

  it('Upgrade-Werte gelten nur für das laufende Spiel', () => {
    const s = started([STARWING, LIGHTFORCE]);
    give(s, STARWING, 12);
    s.players[STARWING].credits = 5000;
    buy(s, 34);
    expect(newGame([STARWING, LIGHTFORCE], 30).stats[12].def).toBe(3);
  });
});

describe('Kampf', () => {
  function duel(attackerEan: number, defenderEan: number) {
    const s = started([STARWING, LIGHTFORCE]);
    const att = give(s, STARWING, attackerEan);
    const def = give(s, LIGHTFORCE, defenderEan);
    return { s, att, def };
  }

  it('Angreifer muss eigene, aktivierte Einheit sein', () => {
    const s = started([STARWING, LIGHTFORCE]);
    expect(attack(s, 1, 41, noDice).error).toBe('wrongCard');
    expect(attack(s, 54, 41, noDice).error).toBe('wrongCard');
    expect(attack(s, 14, 41, noDice).error).toBe('notOwned');
    give(s, STARWING, 14, false);
    expect(attack(s, 14, 41, noDice).error).toBe('notActive');
  });

  it('Verteidiger muss gegnerisch, kein Upgrade und aktiviert sein', () => {
    const { s } = duel(14, 54);
    expect(attack(s, 14, 15, noDice).error).toBe('wrongCard');
    expect(attack(s, 14, 74, noDice).error).toBe('wrongCard');
    expect(attack(s, 14, 55, noDice).error).toBe('notOwned');
    give(s, LIGHTFORCE, 55, false);
    expect(attack(s, 14, 55, noDice).error).toBe('notActive');
  });

  it('kostet 200 Credits, mit aktivem Zentrum ist der Angriff kostenlos', () => {
    const { s } = duel(14, 48);
    const credits = s.players[STARWING].credits;
    attack(s, 14, 48, dice(6));
    expect(s.players[STARWING].credits).toBe(credits - 200);
    give(s, STARWING, 12);
    give(s, STARWING, 15);
    expect(attackConfirmAttacker(s, 15).free).toBe(true);
    attack(s, 15, 48, dice(6));
    expect(s.players[STARWING].credits).toBe(credits - 200);
  });

  it('jede Einheit greift einmal pro Zug an, maximal 3 Angriffe', () => {
    const { s } = duel(14, 48);
    s.players[STARWING].credits = 10000;
    attack(s, 14, 48, dice(6));
    expect(attack(s, 14, 48, noDice).error).toBe('notPossible');
    give(s, STARWING, 15);
    give(s, STARWING, 16);
    attack(s, 15, 48, dice(6));
    attack(s, 16, 48, dice(6));
    expect(attack(s, 16, 48, noDice).error).toBe('notPossible');
  });

  it('Einheit vs Einheit: Schlagabtausch, beide können fallen, dann kein Stern', () => {
    const { s } = duel(14, 54);
    const { result } = attack(s, 14, 54, dice(1, 1));
    expect(result).toMatchObject({ kind: 'unitVsUnit', attackerStar: false, defenderStar: false, destroyed: [54, 14] });
    expect(s.players[STARWING].units).toBe(0);
    expect(s.players[LIGHTFORCE].units).toBe(0);
  });

  it('Einheit vs Einheit: läuft bis einer fällt, Sieger bekommt Stern', () => {
    const { s } = duel(23, 63);
    const { result } = attack(s, 23, 63, dice(6, 6, 3, 6, 1, 6));
    expect(result!.steps).toHaveLength(6);
    expect(result).toMatchObject({ attackerStar: true, destroyed: [63] });
    expect(s.players[STARWING].stars).toBe(1);
  });

  it('Einheit vs Gebäude: ein Wurf, Flugabwehr schlägt zurück', () => {
    const { s, def } = duel(14, 45);
    const { result } = attack(s, 14, 45, dice(6, 1));
    expect(result).toMatchObject({ kind: 'unitVsBuilding', destroyed: [14], defenderStar: true });
    expect(def.def).toBe(3);
    expect(s.players[LIGHTFORCE].stars).toBe(1);
  });

  it('Einheit vs normales Gebäude: kein Gegenschlag, kein Stern für Gebäude', () => {
    const { s } = duel(14, 48);
    const { result } = attack(s, 14, 48, dice(1));
    expect(result!.steps).toHaveLength(1);
    expect(s.players[LIGHTFORCE].slots[findSlot(s.players[LIGHTFORCE], 48)]!.def).toBe(3);
  });

  it('Flugzeug vs Gebäude: Flugabwehr mit Off = n+1 und Schaden n (Korrektur 3: nur aktive)', () => {
    const { s, att } = duel(30, 48);
    give(s, LIGHTFORCE, 45);
    give(s, LIGHTFORCE, 46);
    give(s, LIGHTFORCE, 47, false);
    const { result } = attack(s, 30, 48, dice(3, 3));
    expect(result).toMatchObject({ kind: 'airVsBuilding', flakCount: 2 });
    expect(result!.steps[0]).toMatchObject({ by: 'flak', offense: 3, damage: 2, hit: true });
    expect(att.def).toBe(1);
    expect(s.players[LIGHTFORCE].slots[findSlot(s.players[LIGHTFORCE], 48)]!.def).toBe(3);
  });

  it('Flugzeug vs Gebäude: abgeschossenes Flugzeug greift nicht mehr an', () => {
    const { s } = duel(30, 48);
    give(s, LIGHTFORCE, 45);
    give(s, LIGHTFORCE, 46);
    s.players[STARWING].slots[findSlot(s.players[STARWING], 30)]!.def = 2;
    const { result } = attack(s, 30, 48, dice(1));
    expect(result!.steps).toHaveLength(1);
    expect(result!.destroyed).toEqual([30]);
    expect(result!.defenderStar).toBe(false);
  });

  it('Nostradamus (Stealth) ignoriert Flugabwehr', () => {
    const { s } = duel(32, 48);
    give(s, LIGHTFORCE, 45);
    const { result } = attack(s, 32, 48, dice(3));
    expect(result).toMatchObject({ kind: 'stealthVsBuilding', flakCount: 0 });
    expect(result!.steps).toHaveLength(1);
  });

  it('Flugzeug gegen Einheit ist ein normaler Einheitenkampf', () => {
    const { s } = duel(30, 54);
    expect(attack(s, 30, 54, dice(1, 6)).result!.kind).toBe('unitVsUnit');
  });

  it('Superwaffe trifft immer, lädt 3 Runden nach und zählt nur einmal (Korrektur 1)', () => {
    const { s, att } = duel(13, 48);
    const buildings = s.players[STARWING].buildings;
    const { result } = attack(s, 13, 48, noDice);
    expect(result).toMatchObject({ kind: 'superweapon', destroyed: [48], attackerStar: true });
    expect(result!.steps[0]).toMatchObject({ roll: null, hit: true, damage: 4 });
    expect(att).toMatchObject({ active: false, remaining: 3 });
    expect(attack(s, 13, 48, noDice).error).toBe('notActive');
    for (let i = 0; i < 6; i++) beginTurn(s, noDice);
    expect(att).toMatchObject({ active: true, remaining: 0 });
    expect(s.players[STARWING].buildings).toBe(buildings);
  });

  it('inaktive Superwaffe darf angegriffen werden', () => {
    const { s } = duel(14, 53);
    const silo = s.players[LIGHTFORCE].slots[findSlot(s.players[LIGHTFORCE], 53)]!;
    silo.active = false;
    silo.remaining = 2;
    expect(attack(s, 14, 53, dice(6)).error).toBeUndefined();
  });

  it('zerstörtes Zentralgestirn beendet das Spiel', () => {
    const s = started([STARWING, LIGHTFORCE]);
    give(s, STARWING, 13);
    const hq = s.players[LIGHTFORCE].slots[37]!;
    hq.active = true;
    hq.def = 3;
    const { result } = attack(s, 13, 40, noDice);
    expect(result!.headquarters).toBe(true);
    expect(s.winner).toBe(STARWING);
    expect(s.winReason).toBe('headquarters');
  });

  it('Photonenhagel (Def 0) zerstört sich nach dem Angriff selbst und bekommt keinen Stern', () => {
    const s = started([SCARETECH, LIGHTFORCE]);
    give(s, SCARETECH, 97);
    give(s, LIGHTFORCE, 48);
    const { result } = attack(s, 97, 48, dice(1));
    expect(result).toMatchObject({ destroyed: [97], attackerStar: false, defenderStar: false });
    expect(s.players[LIGHTFORCE].slots[findSlot(s.players[LIGHTFORCE], 48)]!.def).toBe(2);
    expect(s.players[SCARETECH].units).toBe(0);
  });

  it('Überlastung: zerstörter Reaktor bleibt mit voller Defensive liegen (Korrektur 5)', () => {
    const s = started([LIGHTFORCE, STARWING]);
    give(s, LIGHTFORCE, 54);
    const usa = s.players[STARWING];
    usa.energy = 1;
    const reactor = give(s, STARWING, 3);
    reactor.def = 1;
    const { result } = attack(s, 54, 3, dice(1));
    expect(result).toMatchObject({ destroyed: [3], rescued: [3], attackerStar: true });
    expect(reactor.def).toBe(2);
    expect(findSlot(usa, 3)).toBeGreaterThanOrEqual(0);
    expect(usa.energy).toBe(-2);
    expect(beginTurn(s, noDice).skipped).toBe(true);
    expect(usa.energy).toBe(1);
  });

  it('zerstörtes Gebäude gibt seine Energie zurück', () => {
    const { s } = duel(13, 48);
    s.players[LIGHTFORCE].energy = 0;
    s.players[LIGHTFORCE].slots[findSlot(s.players[LIGHTFORCE], 48)]!.def = 1;
    attack(s, 13, 48, noDice);
    expect(s.players[LIGHTFORCE].energy).toBe(1);
    expect(findSlot(s.players[LIGHTFORCE], 48)).toBe(-1);
  });
});

describe('BIOTEC-Upgrades (Neuentwicklung)', () => {
  const biotec = () => {
    const s = started([BIOTEC, STARWING]);
    s.players[BIOTEC].credits = 10000;
    return s;
  };

  it('Mutagen: Einheit 5 und Mutant Offensive +1, Voraussetzung Hive', () => {
    const s = biotec();
    expect(buy(s, 154).error).toBeUndefined();
    expect(s.stats[78].off).toBe(2);
    expect(s.stats[79].off).toBe(2);
  });

  it('Perpetuum: +2 Energie je aktivem Plasmareaktor, später +5 je Reaktor', () => {
    const s = biotec();
    give(s, BIOTEC, 123, false);
    const energy = s.players[BIOTEC].energy;
    buy(s, 156);
    expect(s.players[BIOTEC].energy).toBe(energy + 2);
    expect(s.players[BIOTEC].energyUpgrade).toBe(true);
  });

  it('Chitinpanzer: Agressor und Regenerat. Panzer Defensive +1, auch bereits gebaute', () => {
    const s = biotec();
    expect(buy(s, 157).error).toBe('locked');
    give(s, BIOTEC, 132);
    const agressor = give(s, BIOTEC, 142);
    const regen = give(s, BIOTEC, 148);
    regen.def = 2;
    buy(s, 157);
    expect(agressor.def).toBe(5);
    expect(regen.def).toBe(3);
    expect(s.stats[82].def).toBe(5);
    expect(s.stats[84].def).toBe(4);
  });

  it('Flüstern: Helicopter greift Gebäude an, ohne dass die Flugabwehr schießt', () => {
    const setup = () => {
      const s = biotec();
      give(s, BIOTEC, 151);
      give(s, STARWING, 5);
      give(s, STARWING, 7);
      return s;
    };
    const without = setup();
    expect(attack(without, 151, 5, dice(6, 6)).result).toMatchObject({ kind: 'airVsBuilding', flakCount: 1 });

    const withUpgrade = setup();
    give(withUpgrade, BIOTEC, 131);
    expect(buy(withUpgrade, 155).error).toBeUndefined();
    const { result } = attack(withUpgrade, 151, 5, dice(6));
    expect(result).toMatchObject({ kind: 'stealthVsBuilding', flakCount: 0 });
    expect(result!.steps).toHaveLength(1);
  });

  it('Zellregeneration: zu Zugbeginn beschädigte Einheiten +1, gedeckelt, keine Gebäude', () => {
    const s = biotec();
    give(s, BIOTEC, 132);
    buy(s, 159);
    const tyrant = give(s, BIOTEC, 138);
    tyrant.def = 1;
    const full = give(s, BIOTEC, 139);
    const hq = s.players[BIOTEC].slots[37]!;
    hq.def = 7;
    beginTurn(s, noDice);
    const { events } = beginTurn(s, noDice);
    expect(events).toContainEqual({ type: 'regeneration', count: 1 });
    expect(tyrant.def).toBe(2);
    expect(full.def).toBe(2);
    expect(hq.def).toBe(7);
  });

  it('Neuronetz: Hinweis nach dem Kauf und zu jedem Zugbeginn', () => {
    const s = biotec();
    give(s, BIOTEC, 132);
    expect(buy(s, 158).events).toEqual([{ type: 'neuronet' }]);
    beginTurn(s, noDice);
    expect(beginTurn(s, noDice).events).toContainEqual({ type: 'neuronet' });
  });
});

describe('Prüffunktionen für die Kartenauswahl', () => {
  it('buyCheck liefert für jede Karte denselben Fehler wie buy und ändert nichts', () => {
    const s = started([STARWING, LIGHTFORCE]);
    give(s, STARWING, 12);
    s.players[STARWING].energy = 0;
    for (let ean = 0; ean < 160; ean++) {
      const before = JSON.stringify(s);
      const check = buyCheck(s, ean);
      expect(JSON.stringify(s)).toBe(before);
      const copy = structuredClone(s);
      expect(buy(copy, ean).error ?? null, `Karte ${ean}`).toBe(check);
    }
  });

  it('repairCheck liefert denselben Fehler wie repair und ändert nichts', () => {
    const s = started([STARWING, LIGHTFORCE]);
    s.players[STARWING].slots[37]!.def = 5;
    give(s, STARWING, 14, false);
    for (const ean of [0, 1, 14, 34, 41, 99]) {
      const before = JSON.stringify(s);
      const check = repairCheck(s, ean);
      expect(JSON.stringify(s)).toBe(before);
      expect(repair(structuredClone(s), ean).error ?? null, `Karte ${ean}`).toBe(check);
    }
    expect(repairCheck(s, 0)).toBeNull();
  });
});

describe('Reparatur und Info', () => {
  it('repariert +1 für 200 Credits, einmal pro Zug', () => {
    const s = started([STARWING, LIGHTFORCE]);
    const hq = s.players[STARWING].slots[37]!;
    hq.def = 5;
    expect(repair(s, 0)).toEqual({ amount: 1 });
    expect(hq.def).toBe(6);
    expect(s.players[STARWING].credits).toBe(1800);
    expect(repair(s, 0).error).toBe('notPossible');
  });

  it('meldet "nichts zu reparieren" bei voller Defensive und bei Upgrades', () => {
    const s = started([STARWING, LIGHTFORCE]);
    expect(repair(s, 0).error).toBe('nothingToRepair');
    expect(repair(s, 34).error).toBe('nothingToRepair');
    expect(repair(s, 14).error).toBe('notOwned');
  });

  it('Instandsetzung repariert +2, gedeckelt auf den Maximalwert', () => {
    const s = started([SCARETECH, LIGHTFORCE]);
    give(s, SCARETECH, 91);
    s.players[SCARETECH].credits = 5000;
    buy(s, 116);
    const hq = s.players[SCARETECH].slots[38]!;
    hq.def = 7;
    expect(repair(s, 80)).toEqual({ amount: 2 });
    expect(hq.def).toBe(8);
  });

  it('Info zeigt aktuelle Defensive und Kartenwerte', () => {
    const s = started([STARWING, LIGHTFORCE]);
    const paladin = give(s, STARWING, 28);
    paladin.def = 2;
    expect(info(s, 28).info).toEqual({ def: 2, maxDef: 4, off: 4, dmg: 3, rounds: 2 });
    expect(info(s, 34).error).toBe('alreadyOwned');
    expect(info(s, 41).error).toBe('wrongCard');
  });
});

describe('Siegpunkte und Orden', () => {
  it('vergibt "Bester Stützpunkt" ab 5 Gebäuden, wenn alle anderen weniger haben', () => {
    const s = started([STARWING, LIGHTFORCE]);
    give(s, STARWING, 5);
    give(s, STARWING, 7);
    expect(mainCheck(s)).toEqual([{ type: 'medal', medal: 'bestBase' }]);
    expect(s.players[STARWING].vp).toBe(10);
    expect(mainCheck(s)).toEqual([]);
  });

  it('übergibt den Orden an einen Spieler, der mehr hat', () => {
    const s = started([STARWING, LIGHTFORCE]);
    s.players[STARWING].stars = 5;
    mainCheck(s);
    expect(s.players[STARWING].bestArmy).toBe(true);
    beginTurn(s, noDice);
    s.players[LIGHTFORCE].stars = 6;
    mainCheck(s);
    expect(s.players[LIGHTFORCE].bestArmy).toBe(true);
    expect(s.players[STARWING].bestArmy).toBe(false);
  });

  it('Gleichstand vergibt keinen Orden', () => {
    const s = started([STARWING, LIGHTFORCE, BIOTEC]);
    s.players[STARWING].stars = 5;
    s.players[BIOTEC].stars = 5;
    expect(mainCheck(s)).toEqual([]);
  });

  it('gewinnt bei Erreichen des Siegpunkt-Limits, ∞ gewinnt nie nach Punkten', () => {
    const s = started([STARWING, LIGHTFORCE]);
    s.players[STARWING].stars = 27;
    expect(mainCheck(s)).toContainEqual({ type: 'winner', faction: STARWING, reason: 'points' });
    const endless = started([STARWING, LIGHTFORCE], null);
    endless.players[STARWING].stars = 200;
    expect(mainCheck(endless).some((e) => e.type === 'winner')).toBe(false);
  });
});

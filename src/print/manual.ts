// Spielanleitung (Tools/manual.html → Unterlagen/Domination_Anleitung.pdf), Gliederung wie die alte
// „CnC_Anleitung V1.01.doc“, umgeschrieben auf App und Domination. Zahlen kommen aus den Kartendaten,
// Kartenabbildungen aus cardFace.ts (dieselben wie im Kartendrucker).
import '@fontsource/silkscreen/latin-400.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource-variable/space-grotesk';
import '../ui/cardFace.css';
import './manual.css';
import {
  ATTACK_PRICE, BASE_INCOME, CARDS, CARD_OF_EAN, FACTIONS, FACTION_COLORS, MAX_ATTACKS, MAX_BUYS, MAX_REPAIRS,
  MEDAL_MIN_BUILDINGS, MEDAL_MIN_STARS, MEDAL_POINTS, NO_REQUIREMENT, PHYSICAL_CARDS, REACTOR_ENERGY,
  REACTOR_UPGRADE_BONUS, REPAIR_PRICE, SPECIAL_MAX_BUILDINGS, SPECIAL_MAX_UNITS, SPECIAL_MIN_ROUND, START_CREDITS,
  SUPERWEAPON_RECHARGE, SUPPLY_INCOME, type Faction,
} from '../engine/data';
import { factionOfCardId, kindOfCardId } from '../engine/cards';
import { ERRORS, SPECIAL_TEXT } from '../engine/messages';
import { factionAsset } from '../ui/assets';
import { cardArtUrl } from '../ui/cardArt';
import { cardBackHtml, cardFaceHtml } from '../ui/cardFace';
import { DESCRIPTIONS, rulesFor } from '../ui/cardText';
import { jpegImages } from './jpeg';
import { markerSvg } from './markers';

const BASE = '../';
const F = [0, 1, 2, 3] as Faction[];
const esc = (text: string) => text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const copies = (id: number) => CARD_OF_EAN.filter((x) => x === id).length;
const count = (f: Faction, kind: string) =>
  CARDS.filter((c) => factionOfCardId(c.id) === f && kindOfCardId(c.id) === kind).reduce((n, c) => n + copies(c.id), 0);

const h2 = (num: string, title: string) => `<h2><span class="num">${num}</span>${title}</h2>`;
const h3 = (num: string, title: string) => `<h3><span class="num">${num}</span>${title}</h3>`;
const box = (html: string, cls = '') => `<div class="box ${cls}">${html}</div>`;

/** Karte mit nummerierten Markierungen (Koordinaten in Pixeln der 652×899-Vorlage) und Legende daneben */
function annotated(ean: number, marks: Array<[x: number, y: number, text: string]>) {
  const pins = marks.map(([x, y], i) =>
    `<b class="pin" style="left:${(x / 652) * 100}%;top:${(y / 899) * 100}%">${i + 1}</b>`).join('');
  const legend = marks.map(([, , text], i) => `<li><b class="pin static">${i + 1}</b><span>${text}</span></li>`).join('');
  return `<figure class="annotated">
  <div class="card-wrap">${cardFaceHtml(ean, { base: BASE, footer: 'barcode' })}${pins}</div>
  <ol class="legend">${legend}</ol>
</figure>`;
}

// ---------- Titelseite ----------
const cover = () => `<section class="cover">
  <img class="logo" src="${BASE}ui/logo.svg" alt="">
  <div class="kicker">Das Kartenspiel</div>
  <h1>Domination</h1>
  <div class="sub">Spielanleitung · Version 2.0</div>
  <div class="backs">${F.map((f) => `<figure><img src="${factionAsset(f, 'back.webp', BASE)}" alt=""><figcaption style="color:${FACTION_COLORS[f]}">${FACTIONS[f]}</figcaption></figure>`).join('')}</div>
  <div class="credits">© 2005 Jochen Feldkötter &amp; Raphael Ludwig · Kartendesign: Helge Vogt</div>
</section>`;

// ---------- Spielfeld-Grafik ----------
function board() {
  const art = (id: number) => `<img src="${cardArtUrl(id, `${BASE}cards/`)}" alt="">`;
  const units: string[] = [
    `<div class="stack three">${art(9)}${art(9)}${art(10)}</div><small>3 Aufklärer</small>`,
    `<div class="stack two">${art(11)}${art(12)}</div><small>2 Kampfschiffe</small>`,
    `<div class="stack two">${art(13)}${art(10)}</div><small>Kampfschiff + Aufklärer</small>`,
    `<div class="stack">${art(15)}</div><small>Hyperraumschiff allein</small>`,
    '', '', '',
  ];
  const back = `<div class="back">${cardBackHtml(2, { base: BASE })}</div>`;
  const row2 = [back, back, '', back, '', back, ''];
  const row3 = ['', back, back, back, '', '', back];
  const row = (label: string, cells: string[], cls: string) =>
    `<div class="label">${label}</div>${cells.map((c) => `<div class="cell ${cls}${c ? '' : ' empty'}">${c}</div>`).join('')}`;
  return `<figure class="board">
  <div class="grid">
    ${row('1. Reihe<br><small>Einheiten, offen</small>', units, 'units')}
    ${row('2. Reihe<br><small>Planeten, verdeckt</small>', row2, 'planets')}
    ${row('3. Reihe<br><small>Planeten, verdeckt</small>', row3, 'planets')}
  </div>
  <figcaption>Spielbereich eines Spielers · der Spieler sitzt unten</figcaption>
</figure>`;
}

// ---------- Kapitel ----------
const chapter1 = () => `
${h2('1', 'Spieleranzahl')}
<p>Domination ist ein rundenbasiertes Science-Fiction-Strategiespiel für <b>2–4 Spieler</b> ab 10 Jahren. Ein Handy oder Tablet mit der Domination-App übernimmt die Verwaltung: Es rechnet Credits, Energie und Siegpunkte, würfelt die Gefechte aus und wird von Zug zu Zug weitergereicht.</p>
${h3('1.1', 'Ziel des Spiels')}
<p>Gewinner ist, wer zuerst die eingestellte Anzahl an <b>Siegpunkten</b> sammelt oder das <b>Zentralgestirn</b> eines Gegenspielers zerstört.</p>
${h3('1.2', 'Inhalt')}
<ul>
  <li>${PHYSICAL_CARDS} Spielkarten in 4 Fraktionen:
    <table class="mini"><tr><th></th>${F.map((f) => `<th style="color:${FACTION_COLORS[f]}">${FACTIONS[f]}</th>`).join('')}</tr>
      <tr><td>Planeten</td>${F.map((f) => `<td>${count(f, 'building')}</td>`).join('')}</tr>
      <tr><td>Einheiten</td>${F.map((f) => `<td>${count(f, 'unit')}</td>`).join('')}</tr>
      <tr><td>Upgrades</td>${F.map((f) => `<td>${count(f, 'upgrade')}</td>`).join('')}</tr></table></li>
  <li>4 Technologiebäume (eigenes Blatt je Fraktion)</li>
  <li>2 Siegmarker-Münzen „Beste Streitmacht“ und „Bester Stützpunkt“ (im Kartendrucker unter „Siegmarker“)</li>
  <li>diese Spielanleitung</li>
  <li>außerdem nötig: ein Handy oder Tablet mit Kamera und der App <b>domination-cardgame.pages.dev</b></li>
</ul>
${h3('1.3', 'Der Spielablauf kurz beschrieben')}
<p>Jede Fraktion hat eigene Stärken und Schwächen. Die Spieler kaufen reihum Planeten, Einheiten und Upgrades, bauen damit ihren Stützpunkt aus und greifen die Gegner an. Die App liest die Karten über die Kamera ein, zeigt Kaufentscheidungen und Gefechte an und sagt jedem Spieler zu Beginn seines Zuges, welche fertig gebauten Karten er jetzt ausspielen muss.</p>`;

const chapter2 = () => `
${h2('2', 'Das Spielfeld')}
<p>Ein Spielbrett gibt es nicht, die Karten werden aber nach einem festen System ausgelegt: Der Spielbereich jedes Spielers besteht aus <b>3 Reihen mit je 7 Feldern</b>. In der vorderen Reihe (1. Reihe) liegen die Einheiten offen, in der 2. und 3. Reihe die Planeten verdeckt (siehe Abbildung).</p>
${h3('2.1', 'Spielvorbereitung')}
<p>Die Spieler wählen ihre Fraktion: Starwing, Lightforce, Scaretech oder Biotec. Jeder legt seine Karten nach Rückseite sortiert in drei verdeckten Stapeln neben sich: <b>Planeten, Einheiten und Upgrades</b>. Die Rückseite zeigt die Kartenart als großes Symbol. Dazu nimmt sich jeder den Technologiebaum seiner Fraktion.</p>
${h3('2.2', 'Spieleinstellungen in der App')}
<p>Auf dem Startbildschirm der App <b>Neues Spiel</b> wählen, dann:</p>
<ul>
  <li><b>Spieleranzahl</b> 2, 3 oder 4.</li>
  <li><b>Siegpunkte</b>: 30 (kurzes Spiel, ca. 45–60 Minuten), 40 (langes Spiel, ca. 60–90 Minuten) oder ∞ (nur die Zerstörung eines gegnerischen Zentralgestirns führt zum Sieg).</li>
  <li>Reihum hält jeder Spieler eine beliebige Karte seiner Fraktion vor die Kamera. So legt die App fest, wer welche Fraktion spielt und in welcher Reihenfolge gespielt wird.</li>
</ul>
${box('<b>Tipp:</b> Die App lässt sich über das Browsermenü „Zum Startbildschirm hinzufügen“ installieren und funktioniert dann auch ohne Internet. Der Spielstand wird nach jeder Aktion gespeichert.')}
${board()}`;

const chapter3 = () => `
${h2('3', 'Der Zug beginnt – was nun?')}
<p>Die App zeigt an, welcher Spieler an der Reihe ist. Er nimmt das Gerät und tippt auf <b>Zug starten</b>. Dann passiert automatisch:</p>
<ol>
  <li><b>Einkommen:</b> ${BASE_INCOME} Credits, dazu ${SUPPLY_INCOME} Credits für jeden aktiven Handelsplaneten.</li>
  <li><b>Überlastung:</b> Ist die Energie unter 0 gefallen, wird die zerstörte Energiequelle wieder aufgebaut und der Spieler setzt diese Runde aus.</li>
  <li><b>Sonderaktion:</b> Ab Runde ${SPECIAL_MIN_ROUND} gibt es für Spieler mit höchstens ${SPECIAL_MAX_BUILDINGS} Planeten oder ${SPECIAL_MAX_UNITS} Einheiten oft einen Bonus (siehe Anhang A).</li>
  <li><b>Aktivierung:</b> Die App meldet, welche gekauften Karten jetzt fertig sind. Sie müssen sofort ausgespielt werden.</li>
</ol>
${h3('3.1', 'Planeten aktivieren')}
<p>Aktivierte Planeten werden <b>verdeckt</b> in die 2. oder 3. Reihe gelegt, ein Planet pro Feld. Erst wenn ein Gegner ihn angreift, wird er aufgedeckt und bleibt danach offen liegen.</p>
<p>In der ersten Runde werden die <b>Startkarten</b> aktiviert: Zentralgestirn, der erste Produktionsplanet und die erste Energiequelle (Scaretech: Zentralgestirn und Telecluster). Startkarten erkennt man am goldenen Band „Startkarte“ über dem Bild.</p>
${h3('3.2', 'Einheiten aktivieren')}
<p>Aktivierte Einheiten werden <b>offen</b> auf ein beliebiges Feld der 1. Reihe gelegt, sofern Platz ist. Pro Feld gilt:</p>
<ul>
  <li>höchstens 3 Aufklärer,</li>
  <li>höchstens 2 Kampfschiffe,</li>
  <li>höchstens 1 Kampfschiff und 1 Aufklärer,</li>
  <li>Hyperraumschiffe liegen immer allein.</li>
</ul>
<p>Mit dem Scaretech-Upgrade <b>Schwarzer Schleier</b> dürfen Einheiten verdeckt ausgespielt werden; nach einem Angriff werden sie aufgedeckt.</p>`;

const chapter4to6 = () => `
${h2('4', 'Der Spielbildschirm')}
<p>Während des Zuges zeigt die App oben die Fraktion, die Runde, die <b>Credits</b>, die <b>Siegpunkte</b> und die <b>Energie</b>, darunter die Zähler für Käufe, Angriffe und Reparaturen dieses Zuges. Darunter liegen sechs Schaltflächen:</p>
<table class="plain">
  <tr><td><b>Kaufen</b></td><td>Planeten, Einheiten und Upgrades kaufen</td><td>Punkt 7</td></tr>
  <tr><td><b>Angriff</b></td><td>gegnerische Einheiten oder Planeten angreifen</td><td>Punkt 8</td></tr>
  <tr><td><b>Reparatur</b></td><td>eigene Einheit oder eigenen Planeten reparieren</td><td>Punkt 9</td></tr>
  <tr><td><b>Info</b></td><td>aktuelle Werte einer eigenen Karte ansehen</td><td>Punkt 6</td></tr>
  <tr><td><b>Inventar</b></td><td>Übersicht über den eigenen Stützpunkt</td><td>Punkt 5</td></tr>
  <tr><td><b>Zug beenden</b></td><td>den Zug abschließen und das Gerät weitergeben</td><td>Punkt 10</td></tr>
</table>
<p>Über das Menü ☰ lassen sich die Lautstärke von Effekten und Musik einstellen, der Startbildschirm aufrufen oder das Spiel abbrechen.</p>
${h2('5', 'Inventar')}
<p>Das Inventar zeigt die Anzahl der Siege, der aktiven Planeten, Einheiten und Upgrades, die Energie (nicht bei Scaretech) und die Siegpunkte. Darunter stehen die Karten, die gerade gebaut werden, mit der Anzahl der Runden bis zur Fertigstellung, und alle Karten im Spiel mit ihrer aktuellen Defensive. Auch die Marker „Bester Stützpunkt“ und „Beste Streitmacht“ werden hier angezeigt.</p>
${h2('6', 'Information')}
<p>Mit <b>Info</b> und einer eigenen, aktiven Karte vor der Kamera zeigt die App deren aktuelle Werte: Defensive (auch nach Schaden), Offensive, Schaden und Bauzeit. Upgrades verändern diese Werte, deshalb können sie von den gedruckten Werten abweichen.</p>`;

const chapter7 = () => `
${h2('7', 'Kaufen')}
<p>Pro Zug kann ein Spieler bis zu <b>${MAX_BUYS} Karten</b> kaufen. Dazu auf <b>Kaufen</b> tippen und den Barcode der Karte in den Rahmen der Kamera halten. Die App zeigt die Karte an; mit dem Kaufen-Knopf wird sie bezahlt. Welche Karten gekauft werden können, zeigt der Technologiebaum: Eine Karte ist erst <b>freigeschaltet</b>, wenn der Planet, der sie voraussetzt, aktiv ist. Kann eine Karte nicht gekauft werden, nennt die App den Grund (siehe Anhang B).</p>
<p>Gekaufte Planeten und Einheiten kommen verdeckt auf einen Baustapel. Nach der aufgedruckten Bauzeit werden sie zu Beginn eines Zuges aktiviert und ausgespielt (Punkt 3).</p>
${h3('7.1', 'Planeten kaufen')}
<p>Planeten erzeugen Credits und Energie, produzieren Einheiten, schalten Upgrades frei oder verteidigen den Stützpunkt. Außer bei Scaretech braucht jeder neue Planet <b>1 Energie</b>; jede Energiequelle liefert ${REACTOR_ENERGY} Energie (mit dem Energie-Upgrade der Fraktion ${REACTOR_ENERGY + REACTOR_UPGRADE_BONUS}). Ohne Energie können keine neuen Planeten gekauft werden. Eine Übersicht aller Planeten steht in Anhang E.</p>
${annotated(2, [
  [-16, 69, 'Piktogramm der Kartenart (hier: Planet)'],
  [668, 69, 'Name des Planeten'],
  [668, 150, 'Startkarte: wird in Runde 1 aktiviert'],
  [-16, 492, 'Preis in Credits'],
  [-16, 536, 'Bauzeit in Runden'],
  [-16, 580, 'Defensive'],
  [668, 520, 'Kategorie und Voraussetzung (welcher Planet ihn freischaltet)'],
  [668, 625, 'Beschreibung und Sonderregel'],
  [668, 800, 'Barcode für die Kamera'],
])}
${h3('7.2', 'Einheiten kaufen')}
<p>Einheiten verteidigen den Stützpunkt und greifen die Gegner an. Es gibt drei Klassen: <b>Aufklärer</b>, <b>Kampfschiffe</b> und <b>Hyperraumschiffe</b>. Hyperraumschiffe überspringen beim Angriff eine Reihe. Sonderregeln stehen fett auf der Karte.</p>
${annotated(32, [
  [-16, 69, 'Piktogramm der Kartenart (hier: Einheit)'],
  [-16, 492, 'Preis in Credits'],
  [-16, 536, 'Bauzeit in Runden'],
  [-16, 580, 'Defensive'],
  [-16, 623, 'Offensive: je höher, desto eher trifft die Einheit'],
  [-16, 666, 'Schaden: so viel Defensive zieht ein Treffer ab'],
  [668, 510, 'Kategorie (Einheitenklasse) und Voraussetzung'],
  [668, 610, 'Sonderregeln'],
])}
${h3('7.3', 'Upgrades kaufen')}
<p>Upgrades steigern einzelne Werte von Einheiten, verbessern die Energieversorgung oder haben Auswirkungen auf den Spielablauf. Sie wirken <b>sofort nach dem Kauf</b> und werden offen neben den Spielbereich gelegt. Jedes gekaufte Upgrade zählt einen Siegpunkt.</p>
${annotated(119, [
  [-16, 69, 'Piktogramm der Kartenart (hier: Upgrade)'],
  [-16, 485, 'Preis in Credits'],
  [668, 560, 'Kategorie und Voraussetzung'],
  [668, 640, 'Wirkung, die sofort nach dem Kauf eintritt'],
])}
<figure class="backs-row">
  ${[2, 32, 119].map((ean) => `<div class="back">${cardBackHtml(ean, { base: BASE })}</div>`).join('')}
  <figcaption>Rückseiten: Das große Abzeichen und die Ecksymbole zeigen die Kartenart, auch in der aufgefächerten Hand.</figcaption>
</figure>`;

const chapter8 = () => `
${h2('8', 'Gefecht')}
<p>Das Gefecht ist die einzige Möglichkeit, Einheiten und Planeten des Gegners zu zerstören. Ein Angriff kostet <b>${ATTACK_PRICE} Credits</b>; mit einem aktiven Strategieplaneten (Sternenparlament, Tribunal des Lichts, Dunkler Rat, Abt. Forschung) sind Angriffe kostenlos. Pro Zug sind bis zu <b>${MAX_ATTACKS} Angriffe</b> mit verschiedenen Einheiten möglich. Verteidigen kann sich ein Spieler so oft wie nötig.</p>
<p>Auf <b>Angriff</b> tippen, erst die eigene angreifende Karte scannen und bestätigen, dann das Ziel. Die App würfelt das Gefecht Schritt für Schritt aus. Gewürfelt wird mit einem W6: <b>Treffer, wenn Offensive ≥ Wurf</b>. Ein Treffer zieht den Schaden von der Defensive ab. Sinkt die Defensive auf 0, ist die Karte zerstört; sie kommt zurück auf ihren Stapel und kann neu gekauft werden.</p>
<p>Wer ein Gefecht überlebt und den Gegner zerstört, erhält einen <b>Stern</b> (einen Siegpunkt). Werden beide zerstört, gibt es keinen Stern.</p>
${h3('8.1', 'Einheit gegen Einheit')}
<p>Angreifer und Verteidiger schlagen abwechselnd zu, bis mindestens eine Einheit zerstört ist. Beide können fallen.</p>
${h3('8.2', 'Einheit gegen Planet')}
<p>Planeten in der 2. Reihe dürfen erst angegriffen werden, wenn in der 1. Reihe keine Einheiten mehr liegen, Planeten in der 3. Reihe erst, wenn auch die 2. Reihe leer ist. Der Angreifer schlägt einmal zu. Zurück schießt nur ein Planet mit Planetenabwehr. Hyperraumschiffe dürfen eine Reihe überspringen, Scaretech-Aufklärer mit dem Wurmloch die 1. Reihe.</p>
${h3('8.3', 'Hyperraumschiff gegen Planet')}
<p>Greift ein Hyperraumschiff einen Planeten an, feuert zuerst die gesamte gegnerische <b>Planetenabwehr</b> (Planetenschild, Schutzring, Raumbarriere, Deflektor): Offensive = Anzahl der aktiven Abwehrplaneten + 1, Schaden = ihre Anzahl. Übersteht das Schiff, greift es an. Nostradamus und der Biotec-Helicopter mit dem Upgrade Flüstern sind getarnt und werden von der Planetenabwehr nicht erfasst.</p>
${h3('8.4', 'Superwaffe')}
<p>Die Superwaffe (Ionenpulsar, Supernova, Schwarzes Loch, Wumms) kann jede gegnerische Karte direkt angreifen, egal in welcher Reihe, und <b>trifft immer</b>. Danach muss sie ${SUPERWEAPON_RECHARGE} Runden nachladen.</p>`;

const chapter9to12 = () => `
${h2('9', 'Reparatur')}
<p>Auf <b>Reparatur</b> tippen und die beschädigte eigene Karte scannen. Eine Reparatur kostet <b>${REPAIR_PRICE} Credits</b> und erhöht die Defensive um 1 (Scaretech mit dem Upgrade Rekonfiguration um 2), höchstens bis zum Ausgangswert. Pro Zug ist ${MAX_REPAIRS} Reparatur möglich.</p>
${h2('10', 'Zug beenden')}
<p>Mit <b>Zug beenden</b> ist der Zug vorbei. Das Gerät geht an den nächsten Spieler; die App zeigt dabei einen Übergabe-Bildschirm, damit niemand die Werte des Vorgängers sieht.</p>
${h2('11', 'Siegpunkte')}
<p>Jeder aktive Planet, jedes gekaufte Upgrade und jeder Stern ist einen Siegpunkt wert.</p>
<figure class="markers">
  <div>${markerSvg('army', '34mm')}${markerSvg('base', '34mm')}</div>
  <div>
    <ul>
      <li><b>Beste Streitmacht:</b> Wer mindestens ${MEDAL_MIN_STARS} Sterne und mehr als alle anderen besitzt, erhält die Münze und ${MEDAL_POINTS} Siegpunkte.</li>
      <li><b>Bester Stützpunkt:</b> Wer mindestens ${MEDAL_MIN_BUILDINGS} Planeten und mehr als alle anderen besitzt, erhält die Münze und ${MEDAL_POINTS} Siegpunkte.</li>
    </ul>
    <p>Eine Münze behält man, bis ein anderer Spieler mehr erreicht. Die App vergibt die Siegmarker automatisch und meldet es; die Münze wandert dann zum neuen Besitzer.</p>
  </div>
</figure>
${h2('12', 'Spielende')}
<p>Das Spiel endet, sobald ein Spieler ein gegnerisches <b>Zentralgestirn</b> zerstört oder als Erster die eingestellten Siegpunkte erreicht. Die App zeigt dann den Sieger an.</p>
${box(`<b>Startkapital:</b> Jeder Spieler beginnt mit ${START_CREDITS} Credits.`)}`;

// ---------- Anhang ----------
const SPECIAL_EXPLAIN: Record<string, string> = {
  '500 Credits extra': 'Der Spieler erhält 500 Credits zusätzlich.',
  '1000 Credits extra': 'Der Spieler erhält 1000 Credits zusätzlich.',
  '1500 Credits extra': 'Der Spieler erhält 1500 Credits zusätzlich.',
  'Alles aktiviert!': 'Alle gekauften Karten im Bau werden sofort aktiviert.',
  'Alles +1 repariert': 'Alle beschädigten Karten erhalten 1 Defensive zurück.',
};
const ERROR_EXPLAIN: Record<keyof typeof ERRORS, string> = {
  wrongCard: 'Die Karte gehört zu einer anderen Fraktion oder ist die falsche Kartenart.',
  notOwned: 'Die Karte kann nicht eingesetzt werden, weil sie noch nicht gekauft wurde.',
  noEnergy: 'Für diesen Planeten reicht die Energie nicht.',
  noCredits: 'Für diese Aktion fehlen Credits.',
  alreadyOwned: 'Die Karte ist bereits im Spiel.',
  nothingToRepair: 'Die Karte hat bereits ihre volle Defensive.',
  notPossible: 'Das Limit für Käufe, Angriffe oder Reparaturen in diesem Zug ist erreicht.',
  notActive: 'Die Karte ist noch im Bau.',
  locked: 'Der Planet, der diese Karte freischaltet, ist noch nicht aktiv (siehe Technologiebaum).',
};
const FACTION_NOTES: Record<Faction, string[]> = {
  0: ['– Einheiten und Planeten sind relativ teuer', '+ wirkungsvolle Hyperraumschiffe, die beim Angriff eine Reihe überspringen',
    '+ Nostradamus ist getarnt und wird von der Planetenabwehr nicht erfasst', '+ starke Planetenabwehr (Planetenschild)',
    '– die Planeten brauchen Energie aus Protonenmonden', '+ das Auge des Raumes deckt jede Runde eine gegnerische Karte auf'],
  1: ['+ ausgewogenes Preis-Leistungs-Verhältnis', '+ der Lichtpfeil überspringt beim Angriff eine Reihe',
    '+ die mächtigsten Kampfschiffe (Lichtkoloss, Inferno)', '– die Planeten brauchen Energie aus Elektronenmonden',
    '+ das Upgrade Nachtsicht stärkt die Aufklärer'],
  2: ['– Einheiten sind günstig, im Vergleich aber schwächer', '+ das Wurmloch lässt Aufklärer beim Angriff die 1. Reihe überspringen',
    '+ Erazor trifft fast immer und richtet viel Schaden an', '– Photonenhagel und Erazor zerstören sich beim Angriff selbst und erhalten keinen Stern',
    '+ keine Energie nötig', '+ der Schwarze Schleier erlaubt verdecktes Ausspielen von Einheiten',
    '+ Rekonfiguration: Reparaturen bringen 2 Defensive'],
  3: ['+ viele Panzertypen und organische Einheiten', '+ Energie aus Plasmareaktoren, mit Perpetuum verstärkt',
    '+ Flüstern tarnt den Helicopter vor der Planetenabwehr', '+ Zellregeneration heilt beschädigte Einheiten zu Beginn jedes Zuges',
    '+ Neuronetz: einmal pro Runde zwei eigene verdeckte Planeten tauschen oder eine Einheit umsetzen'],
};
const TIPS = [
  'In den ersten Runden die Energieversorgung sichern (außer Scaretech).',
  'Früh Handelsplaneten bauen, sie bringen jede Runde zusätzliche Credits.',
  'Sofort kleine Einheiten bauen, um die ersten Planeten zu schützen.',
  'Planeten nie ungeschützt lassen, es sei denn, es ist ein Abwehrplanet. Bluffen ist erwünscht.',
  'Sonderaktionen helfen nur schwächeren Spielern mit wenig Planeten oder Einheiten.',
  'Ob man angreift oder erst ausbaut, entscheidet jeder selbst.',
  'Als Angreifer in Lücken stoßen, die der Gegner gelassen hat.',
  'Planeten direkt mit Hyperraumschiffen oder über das Wurmloch angreifen.',
  'Hyperraumschiffe sind im Angriff stark, in der Verteidigung aber leichte Beute.',
  'Photonenhagel und Erazor sind auch nach einem erfolglosen Angriff zerstört, ohne Schleier sind sie leichte Beute.',
  'Eine aktive Superwaffe sofort einsetzen.',
  'Beschädigte Planeten reparieren, bevor der Gegner nachlegt.',
  'Zerstörte Planeten verlieren ihre Funktion, lassen sich aber neu kaufen.',
  'Wer eine gegnerische Energiequelle zerstört, kann den Gegner eine Runde aussetzen lassen.',
];

function planetTable(f: Faction) {
  const planets = CARDS.filter((c) => factionOfCardId(c.id) === f && kindOfCardId(c.id) === 'building');
  const unlocks = (id: number) => CARDS.filter((c) => c.requires === id && c.requires !== NO_REQUIREMENT).map((c) => c.name);
  const rows = planets.map((p) => {
    const desc = DESCRIPTIONS[p.id] ? DESCRIPTIONS[p.id].replace(/([^.!?])$/, '$1.') : '';
    const info = [desc, ...rulesFor(p.id)].filter(Boolean).join(' ');
    const u = unlocks(p.id);
    return `<tr><td><b>${esc(p.name)}</b></td><td>${p.price}</td><td>${esc(info)}</td><td>${u.length ? esc(u.join(', ')) : '–'}</td></tr>`;
  }).join('');
  return `<h4 style="--fc:${FACTION_COLORS[f]}">${FACTIONS[f]}</h4>
<table class="planets"><tr><th>Planet</th><th>Preis</th><th>Funktion</th><th>schaltet frei</th></tr>${rows}</table>`;
}

const appendix = () => `
<section class="appendix">
${h2('A', 'Sonderaktionen')}
<p>Ab Runde ${SPECIAL_MIN_ROUND} kann zu Beginn des Zuges eine Sonderaktion eintreten, wenn der Spieler höchstens ${SPECIAL_MAX_BUILDINGS} Planeten oder ${SPECIAL_MAX_UNITS} Einheiten besitzt:</p>
<table class="plain">${[...new Set(Object.values(SPECIAL_TEXT))].map((t) => `<tr><td><b>${t}</b></td><td>${SPECIAL_EXPLAIN[t] ?? ''}</td></tr>`).join('')}</table>
${h2('B', 'Meldungen')}
<table class="plain">${(Object.keys(ERRORS) as Array<keyof typeof ERRORS>).map((k) => `<tr><td><b>„${ERRORS[k]}“</b></td><td>${ERROR_EXPLAIN[k]}</td></tr>`).join('')}</table>
${h2('C', 'Vor- und Nachteile der Fraktionen')}
<div class="factions">${F.map((f) => `<div class="faction" style="--fc:${FACTION_COLORS[f]}">
  <img src="${factionAsset(f, 'back.webp', BASE)}" alt="">
  <div><h4>${FACTIONS[f]}</h4><ul class="pm">${FACTION_NOTES[f].map((n) => `<li class="${n.startsWith('+') ? 'plus' : 'minus'}">${esc(n.slice(2))}</li>`).join('')}</ul></div>
</div>`).join('')}</div>
${h2('D', 'Strategische Tipps')}
<ul class="tips">${TIPS.map((t) => `<li>${t}</li>`).join('')}</ul>
${h2('E', 'Planetenkarten')}
<p>Was jeder Planet leistet und welche Karten er freischaltet. Die vollständigen Abhängigkeiten zeigen die Technologiebäume.</p>
${F.map(planetTable).join('')}
</section>`;

const doc = document.getElementById('output')!;
const style = `--tex:url('${factionAsset(null, 'tile.webp', BASE)}');--plate:url('${factionAsset(null, 'plate.webp', BASE)}')`;
doc.innerHTML = `<article class="doc" style="${style}">${cover()}${chapter1()}${chapter2()}${chapter3()}${chapter4to6()}${chapter7()}${chapter8()}${chapter9to12()}${appendix()}</article>`;
jpegImages(doc, undefined, 500);
document.getElementById('print')!.addEventListener('click', () => window.print());

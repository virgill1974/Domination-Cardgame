import type { ComponentChildren } from 'preact';
import { FACTIONS, type Faction } from '../engine/data';
import { factionStyle } from './components';

// Werte nach dem Microcontroller-Code (maßgeblich), Texte nach Anleitung V1.01 und Anweisungssheet
const SECTIONS: Array<{ title: string; body: ComponentChildren }> = [
  {
    title: 'Ziel des Spiels',
    body: (
      <p>
        Gewonnen hat, wer zuerst die eingestellten <b>Siegpunkte</b> (30 oder 40) erreicht oder eine gegnerische
        <b> Zentralgestirn zerstört</b>. Bei „∞“ zählt nur die Zerstörung eines Zentralgestirns.
      </p>
    ),
  },
  {
    title: 'Vorbereitung',
    body: (
      <ul>
        <li>Jeder wählt eine Fraktion (Karte scannen oder antippen) und legt seine Karten in drei Stapeln bereit: Planeten, Einheiten, Upgrades.</li>
        <li>Jeder bekommt seinen Technologiebaum. Er zeigt, welcher Planet welche Karten freischaltet.</li>
        <li>Startkapital: 1600 Credits. In Runde 1 werden Zentralgestirn, der erste Produktionsplanet und die erste Energiequelle aktiviert, bei Scaretech nur Zentralgestirn und Telecluster.</li>
        <li>Das Handy wird reihum weitergereicht.</li>
      </ul>
    ),
  },
  {
    title: 'Das Spielfeld',
    body: (
      <ul>
        <li>Jeder Spieler hat 3 Reihen mit je 7 Feldern.</li>
        <li><b>Reihe 1</b>: Einheiten, offen ausgespielt.</li>
        <li><b>Reihe 2 und 3</b>: Planeten, verdeckt ausgespielt. Sie werden erst beim Angriff aufgedeckt und bleiben dann offen liegen.</li>
        <li>Stapeln: max. 3 Aufklärer, max. 2 Kampfschiffe oder 1 Kampfschiff + 1 Aufklärer pro Feld. Hyperraumschiffe liegen allein.</li>
        <li>Gekaufte Karten liegen bis zur Aktivierung verdeckt auf einem Baustapel.</li>
      </ul>
    ),
  },
  {
    title: 'Ablauf eines Zuges',
    body: (
      <ol>
        <li><b>Einkommen</b>: 400 Credits + 400 je Handelsplanet (Handelssystem, Handelssektor, Antimaterieminen, Abt. Kapital).</li>
        <li><b>Überlastung</b>: Ist die Energie unter 0, wird die Energiequelle wieder aufgebaut und du setzt aus.</li>
        <li><b>Sonderaktion</b>: Ab Runde 5, wenn du höchstens 7 Planeten oder 7 Einheiten hast, gibt es oft einen Bonus.</li>
        <li><b>Aktivierung</b>: Fertig gebaute Karten jetzt ausspielen.</li>
        <li><b>Aktionen</b>: Kaufen, Angreifen, Reparieren in beliebiger Reihenfolge.</li>
        <li><b>Zug beenden</b> und das Handy weitergeben.</li>
      </ol>
    ),
  },
  {
    title: 'Aktionen',
    body: (
      <ul>
        <li><b>Kaufen</b>: bis zu 3 Karten pro Zug. Die Karte muss freigeschaltet sein, und du brauchst genug Credits. Planeten kosten zusätzlich 1 Energie. Upgrades wirken sofort.</li>
        <li><b>Angriff</b>: bis zu 3 pro Zug, jede Einheit einmal. Kostet 200 Credits, mit aktivem Sternenparlament/Tribunal des Lichts/Dunklen Rat/Abt. Forschung kostenlos. Erst den Angreifer scannen, dann das Ziel.</li>
        <li><b>Reparatur</b>: 1× pro Zug für 200 Credits, +1 Defensive (Scaretech mit Rekonfiguration +2).</li>
        <li><b>Info</b>: aktuelle Werte einer eigenen Karte.</li>
        <li><b>Inventar</b>: Planeten, Einheiten, Upgrades, Siege, Energie und was gerade gebaut wird.</li>
      </ul>
    ),
  },
  {
    title: 'Kampf',
    body: (
      <>
        <p>Es wird mit einem W6 gewürfelt: <b>Treffer, wenn Offensive ≥ Wurf</b>. Ein Treffer zieht den Schaden von der Defensive ab. Bei 0 ist die Karte zerstört und geht zurück auf den Stapel.</p>
        <ul>
          <li><b>Einheit gegen Einheit</b>: Es wird abwechselnd gewürfelt, bis eine fällt. Beide können fallen.</li>
          <li><b>Einheit gegen Planet</b>: ein Angriff. Nur die Planetenabwehr schießt zurück.</li>
          <li><b>Hyperraumschiff gegen Planet</b>: Erst feuert die gegnerische Planetenabwehr (je mehr Abwehrplaneten, desto stärker), dann greift das Schiff an.</li>
          <li><b>Nostradamus</b>: ignoriert die Planetenabwehr.</li>
          <li><b>Superwaffe</b>: trifft immer jedes Ziel, danach 3 Runden Nachladen.</li>
        </ul>
        <p><b>Reihenfolge</b>: Reihe 2 ist erst angreifbar, wenn Reihe 1 leer ist, Reihe 3 erst, wenn Reihe 1 und 2 leer sind. Hyperraumschiffe überspringen eine Reihe. Mit dem Scaretech-Wurmloch überspringen Aufklärer Reihe 1.</p>
      </>
    ),
  },
  {
    title: 'Energie',
    body: (
      <ul>
        <li>Jede Energiequelle (Protonenmond, Elektronenmond, Plasmareaktor) liefert 3 Energie (mit Upgrade 5). Jeder andere Planet verbraucht 1.</li>
        <li>Ohne Energie keine neuen Planeten.</li>
        <li>Wird die Energiequelle zerstört und die Energie fällt unter 0, bleibt es liegen und wird wieder aufgebaut. Der Besitzer setzt eine Runde aus.</li>
        <li>Scaretech braucht keine Energie.</li>
      </ul>
    ),
  },
  {
    title: 'Siegpunkte & Orden',
    body: (
      <ul>
        <li>1 Punkt für jeden aktiven Planeten, jedes Upgrade und jeden gewonnenen Kampf (Stern).</li>
        <li><b>Bester Stützpunkt</b> (ab 5 Planeten, mehr als alle anderen): +5 Punkte.</li>
        <li><b>Beste Streitmacht</b> (ab 5 Siegen, mehr als alle anderen): +5 Punkte.</li>
        <li>Einen Orden behältst du, bis dich jemand übertrifft.</li>
      </ul>
    ),
  },
  {
    title: 'Fraktionen',
    body: (
      <div class="stack">
        {([
          [0, 'Teuer, aber starke Hyperraumschiffe. Nostradamus ignoriert die Planetenabwehr, das Planetenschild ist mächtig. Das Auge des Raumes deckt jede Runde eine gegnerische Karte auf.'],
          [1, 'Ausgewogene Preise, die mächtigsten Kampfschiffe (Lichtkoloss, Inferno). Der Lichtpfeil überspringt eine Reihe, Nachtsicht stärkt die Aufklärer.'],
          [2, 'Günstig, aber schwächer. Keine Energie nötig, das Wurmloch lässt Aufklärer Reihe 1 überspringen. Mit dem Schwarzen Schleier spielst du Einheiten verdeckt aus. Photonenhagel und Erazor zerstören sich beim Angriff selbst.'],
          [3, 'Bio-Konzern mit vielen Panzertypen. Mit Flüstern entgeht der Helicopter der Planetenabwehr, Zellregeneration heilt Einheiten jede Runde. Mit dem Neuronetz darfst du einmal pro Runde zwei eigene Planeten tauschen oder eine Einheit umsetzen.'],
        ] as Array<[Faction, string]>).map(([f, text]) => (
          <div key={f} class="faction-bar" style={{ ...factionStyle(f), paddingLeft: '10px' }}>
            <div class="faction-name">{FACTIONS[f]}</div>
            <div class="small">{text}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Meldungen',
    body: (
      <ul>
        <li><b>Falsche Karte!</b>: Karte einer anderen Fraktion oder die falsche Kartenart.</li>
        <li><b>Karte vorhanden!</b>: Diese Karte ist schon im Spiel.</li>
        <li><b>noch nicht gekauft!</b>: Die Karte gehört (noch) niemandem.</li>
        <li><b>noch nicht aktiviert</b>: Die Karte ist noch im Bau.</li>
        <li><b>nicht freigeschaltet</b>: Der nötige Planet fehlt (siehe Technologiebaum).</li>
        <li><b>nicht mehr möglich!</b>: Das Limit für diesen Zug ist erreicht.</li>
        <li><b>nicht genug Credits! / Energie!</b>: Es fehlen Mittel.</li>
        <li><b>nichts zu reparieren</b>: Die Karte hat volle Defensive.</li>
      </ul>
    ),
  },
];

export function Guide({ onClose }: { onClose: () => void }) {
  return (
    <div class="screen">
      <div class="row spread">
        <h2>Kurzanleitung</h2>
        <button class="btn primary" onClick={onClose}>Zurück</button>
      </div>
      <div class="stack guide">
        {SECTIONS.map((s, i) => (
          <details key={s.title} class="panel" open={i === 0}>
            <summary>{s.title}</summary>
            <div class="guide-body">{s.body}</div>
          </details>
        ))}
      </div>
    </div>
  );
}

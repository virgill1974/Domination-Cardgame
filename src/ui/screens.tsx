import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { CARDS, FACTIONS, SCARETECH, MAX_ATTACKS, MAX_BUYS, MAX_REPAIRS, type Faction } from '../engine/data';
import { cardIdOfEan, factionOfEan, kindOfEan } from '../engine/cards';
import { currentFaction, currentPlayer, ownedSlots, type GameState } from '../engine/state';
import { Scanner } from '../scanner/Scanner';
import { CardArt, DefBar, DefValue, Icon, factionBack, factionStyle } from './components';
import { play } from './sound';
import { VolumeButton } from './VolumeControl';

export type Action = 'buy' | 'attack' | 'repair' | 'info' | 'inventory' | 'end';

export function Home({ canResume, onNew, onResume, onGuide }: {
  canResume: boolean; onNew: () => void; onResume: () => void; onGuide: () => void;
}) {
  return (
    <div class="screen center">
      <div class="stack" style={{ gap: '4px', textAlign: 'center' }}>
        <img class="emblem" src="ui/logo.svg" alt="" />
        <div class="title">Das Kartenspiel</div>
        <h1 class="logo">Domination</h1>
        <div class="muted small">© 2005 Jochen Feldkötter &amp; Raphael Ludwig<br />Kartendesign: Helge Vogt</div>
      </div>
      <div class="stack" style={{ marginTop: '24px' }}>
        {canResume && <button class="btn primary block" onClick={onResume}>Spiel fortsetzen</button>}
        <button class={`btn block ${canResume ? '' : 'primary'}`} onClick={onNew}>Neues Spiel</button>
        <button class="btn block" onClick={onGuide}>Kurzanleitung</button>
        <a class="btn ghost block" href="Tools/generate_barcodes.html" style={{ textDecoration: 'none' }}>Kartendrucker</a>
        <VolumeButton />
      </div>
    </div>
  );
}

export function Setup({ onStart, onBack }: { onStart: (seats: Faction[], vpLimit: number | null) => void; onBack: () => void }) {
  const [count, setCount] = useState(2);
  const [limit, setLimit] = useState<number | null>(30);
  const [seats, setSeats] = useState<Faction[]>([]);
  const [scanning, setScanning] = useState(false);
  const [notice, setNotice] = useState('');

  const add = (f: Faction) => {
    setNotice(seats.includes(f) ? `${FACTIONS[f]} ist bereits vergeben.` : '');
    setSeats((prev) => (prev.includes(f) || prev.length >= count ? prev : [...prev, f]));
  };

  if (scanning) {
    return (
      <Scanner
        title={`Spieler ${seats.length + 1}`} hint="Beliebige Karte deiner Fraktion scannen"
        manualFactions={[0, 1, 2, 3]} onCancel={() => setScanning(false)}
        onCard={(ean) => { add(factionOfEan(ean)); setScanning(false); }}
      />
    );
  }

  const full = seats.length >= count;
  return (
    <div class="screen">
      <div class="row spread">
        <h2>Neues Spiel</h2>
        <button class="btn ghost" onClick={onBack}>Zurück</button>
      </div>
      <div class="panel stack">
        <div class="title">Spieleranzahl</div>
        <div class="seg">
          {[2, 3, 4].map((n) => (
            <button key={n} class={`btn ${count === n ? 'selected' : ''}`} onClick={() => { setCount(n); setSeats(seats.slice(0, n)); }}>{n}</button>
          ))}
        </div>
        <div class="title">Siegpunkte</div>
        <div class="seg">
          {[30, 40, null].map((v) => (
            <button key={String(v)} class={`btn ${limit === v ? 'selected' : ''}`} onClick={() => setLimit(v)}>{v ?? '∞'}</button>
          ))}
        </div>
        <div class="small muted">
          {limit === null ? 'Nur die Zerstörung eines gegnerischen Zentralgestirns führt zum Sieg.' : `${limit} Siegpunkte oder zerstörtes Zentralgestirn.`}
        </div>
      </div>
      <div class="panel stack">
        <div class="title">Fraktionen in Zugreihenfolge</div>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} class="row faction-bar" style={{ ...(seats[i] !== undefined ? factionStyle(seats[i]) : {}), paddingLeft: '10px' }}>
            <span class="grow">Spieler {i + 1}</span>
            {seats[i] !== undefined
              ? <span class="faction-name">{FACTIONS[seats[i]]}</span>
              : <span class="muted small">{i === seats.length ? 'ist dran' : 'offen'}</span>}
          </div>
        ))}
        {!full && (
          <>
            <button class="btn primary block" onClick={() => setScanning(true)}>Spieler {seats.length + 1}: Karte scannen</button>
            <div class="faction-pick">
              {([0, 1, 2, 3] as Faction[]).map((f) => (
                <button key={f} class="btn" style={factionStyle(f)} disabled={seats.includes(f)} onClick={() => add(f)}>
                  <img src={factionBack(f)} alt="" />
                  <span>{FACTIONS[f]}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {notice && <div class="small" style={{ color: 'var(--err)' }}>{notice}</div>}
        {seats.length > 0 && <button class="btn ghost" onClick={() => setSeats([])}>Auswahl zurücksetzen</button>}
      </div>
      <button class="btn primary block" style={{ marginTop: 'auto' }} disabled={!full} onClick={() => onStart(seats, limit)}>Spiel starten</button>
    </div>
  );
}

export function Handoff({ game, onStart, onMenu }: { game: GameState; onStart: () => void; onMenu: () => void }) {
  useEffect(() => play('turn'), [game.seat]);
  const seat = (game.seat + 1) % game.playerCount;
  const faction = game.seats[seat];
  const round = game.round + (seat === 0 ? 1 : 0);
  return (
    <div class="screen center" style={factionStyle(faction)}>
      <div class="panel stack handoff">
        <img class="back" src={factionBack(faction)} alt="" />
        <div class="title">Runde {round} · Spieler {seat + 1}</div>
        <h1 class="faction-name" style={{ fontSize: 'clamp(26px, 9vw, 40px)' }}>{FACTIONS[faction]}</h1>
        <div class="muted small">Gerät an diesen Spieler übergeben.</div>
      </div>
      <button class="btn primary block" style={{ marginTop: '20px' }} onClick={onStart}>Zug starten</button>
      <button class="btn ghost block" onClick={onMenu}>Menü</button>
    </div>
  );
}

export function Hud({ game, onAction, onMenu }: { game: GameState; onAction: (a: Action) => void; onMenu: () => void }) {
  const f = currentFaction(game);
  const p = currentPlayer(game);
  return (
    <div class="screen" style={factionStyle(f)}>
      <div class="panel hud-card">
        <div class="hud-top">
          <div>
            <div class="title">Runde {game.round} · Spieler {game.seat + 1}</div>
            <div class="faction-name" style={{ fontSize: '28px' }}>{FACTIONS[f]}</div>
          </div>
          <button class="btn ghost" onClick={onMenu} aria-label="Menü">☰</button>
        </div>
        <div class="stats">
          <div class="stat credits"><div class="v">{p.credits}</div><div class="k">Credits</div></div>
          <div class="stat"><div class="v">{p.vp}<span class="muted small">{game.vpLimit ? `/${game.vpLimit}` : ''}</span></div><div class="k">Siegpunkte</div></div>
          <div class="stat"><div class="v">{f === SCARETECH ? '–' : p.energy}</div><div class="k">Energie</div></div>
        </div>
        <div class="counters">
          <span>Käufe <b>{game.buys}/{MAX_BUYS}</b></span>
          <span>Angriffe <b>{game.attacks}/{MAX_ATTACKS}</b></span>
          <span>Reparatur <b>{game.repairs}/{MAX_REPAIRS}</b></span>
        </div>
      </div>
      <div class="actions">
        <button class="btn action" onClick={() => onAction('buy')}><Icon name="buy" />Kaufen</button>
        <button class="btn action attack" onClick={() => onAction('attack')}><Icon name="attack" />Angriff</button>
        <button class="btn action" onClick={() => onAction('repair')}><Icon name="repair" />Reparatur<small>200 Credits</small></button>
        <button class="btn action" onClick={() => onAction('info')}><Icon name="info" />Info</button>
        <button class="btn action" onClick={() => onAction('inventory')}><Icon name="inventory" />Inventar</button>
        <button class="btn action" onClick={() => onAction('end')}><Icon name="end" />Zug beenden</button>
      </div>
    </div>
  );
}

export function Inventory({ game, onClose }: { game: GameState; onClose: () => void }) {
  const f = currentFaction(game);
  const p = currentPlayer(game);
  const slots = ownedSlots(p);
  const building = slots.filter((s) => s.remaining > 0);
  const active = slots.filter((s) => s.remaining === 0 && kindOfEan(s.ean) !== 'upgrade')
    .sort((a, b) => a.ean - b.ean);
  const upgrades = slots.filter((s) => kindOfEan(s.ean) === 'upgrade');
  const row = (ean: number, extra: ComponentChildren) => (
    <div key={ean} class="list-item" style={factionStyle(f)}>
      <CardArt id={cardIdOfEan(ean)} class="art" />
      <div class="grow stack" style={{ gap: '4px' }}>
        <b>{CARDS[cardIdOfEan(ean)].name}</b>
        {extra}
      </div>
    </div>
  );
  return (
    <div class="screen" style={factionStyle(f)}>
      <div class="row spread">
        <div>
          <div class="title">Inventar · Runde {game.round}</div>
          <div class="faction-name" style={{ fontSize: '22px' }}>{FACTIONS[f]}</div>
        </div>
        <button class="btn primary" onClick={onClose}>Zurück</button>
      </div>
      <div class="row wrap">
        {p.bestBase && <span class="badge gold">Bester Stützpunkt</span>}
        {p.bestArmy && <span class="badge gold">Beste Streitmacht</span>}
      </div>
      <div class="stats">
        <div class="stat"><div class="v">{p.stars}</div><div class="k">Siege</div></div>
        <div class="stat"><div class="v">{p.buildings}</div><div class="k">Planeten</div></div>
        <div class="stat"><div class="v">{p.units}</div><div class="k">Einheiten</div></div>
        <div class="stat"><div class="v">{p.upgrades}</div><div class="k">Upgrades</div></div>
        <div class="stat"><div class="v">{f === SCARETECH ? '–' : p.energy}</div><div class="k">Energie</div></div>
        <div class="stat"><div class="v">{p.vp}</div><div class="k">Siegpunkte</div></div>
      </div>
      {building.length > 0 && (
        <div class="stack">
          <div class="title">Im Bau</div>
          <div class="list inventory">
            {building.map((s) => row(s.ean, <span class="small muted">in {s.remaining} Runde(n) fertig</span>))}
          </div>
        </div>
      )}
      <div class="stack">
        <div class="title">Im Spiel</div>
        <div class="list inventory">
          {active.map((s) => {
            const max = game.stats[cardIdOfEan(s.ean)].def;
            return row(s.ean, <><DefBar def={s.def} max={max} /><span class="small muted"><DefValue def={s.def} max={max}>{s.active ? '' : ' · lädt nach'}</DefValue></span></>);
          })}
        </div>
      </div>
      {upgrades.length > 0 && (
        <div class="stack">
          <div class="title">Upgrades</div>
          <div class="list inventory">{upgrades.map((s) => row(s.ean, null))}</div>
        </div>
      )}
    </div>
  );
}

export function Winner({ game, onNew }: { game: GameState; onNew: () => void }) {
  useEffect(() => play('victory'), []);
  const f = game.winner!;
  return (
    <div class="screen center" style={factionStyle(f)}>
      <div class="stack" style={{ textAlign: 'center', gap: '8px' }}>
        <div class="title">{game.winReason === 'headquarters' ? 'Zentralgestirn zerstört!' : 'Siegpunkte erreicht'}</div>
        <div>Gewinner</div>
        <h1 class="faction-name" style={{ fontSize: '48px' }}>{FACTIONS[f]}</h1>
        <div class="muted">{game.players[f].vp} Siegpunkte · Runde {game.round}</div>
      </div>
      <button class="btn primary block" style={{ marginTop: '32px' }} onClick={onNew}>Neues Spiel</button>
    </div>
  );
}

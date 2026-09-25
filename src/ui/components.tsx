import type { ComponentChildren } from 'preact';
import { CARDS, FACTION_COLORS, FACTIONS, type Faction } from '../engine/data';
import { cardIdOfEan, factionOfEan, kindOfEan } from '../engine/cards';
import { eanForIndex } from '../engine/ean';
import { cardArtUrl, placeholderDataUri } from './cardArt';
import { requirementName, typeLabel, upgradeEffect } from './cardText';
import type { SoundName } from './sound';

export const factionStyle = (f: Faction) => ({ '--fc': FACTION_COLORS[f] }) as Record<string, string>;

export function CardArt({ id, class: cls = 'art' }: { id: number; class?: string }) {
  return (
    <img
      class={cls}
      alt=""
      src={cardArtUrl(id)}
      onError={(e) => {
        const img = e.currentTarget;
        if (!img.src.startsWith('data:')) img.src = placeholderDataUri(id);
      }}
    />
  );
}

export function DefBar({ def, max }: { def: number; max: number }) {
  const pct = max > 0 ? Math.round((def / max) * 100) : 0;
  return <div class={`defbar ${pct <= 34 ? 'low' : ''}`}><i style={{ width: `${pct}%` }} /></div>;
}

export function KV({ items }: { items: Array<[string, string | number]> }) {
  return (
    <div class="kv">
      {items.map(([k, v]) => <div key={k}><div class="k">{k}</div><div class="v">{v}</div></div>)}
    </div>
  );
}

/** Kartenansicht mit Bild, Name und Grundwerten der physischen Karte (EAN-Index). */
export function CardView({ ean, compact, children, showStats = true }: {
  ean: number; compact?: boolean; children?: ComponentChildren; showStats?: boolean;
}) {
  const id = cardIdOfEan(ean);
  const card = CARDS[id];
  const kind = kindOfEan(ean);
  return (
    <div class={`card-view ${compact ? 'compact' : ''}`} style={factionStyle(factionOfEan(ean))}>
      <CardArt id={id} />
      <div class="stack grow" style={{ gap: '6px' }}>
        <div>
          <div class="card-sub">{FACTIONS[factionOfEan(ean)]} · {typeLabel(id)}</div>
          <div class="card-name">{card.name}</div>
          <div class="muted small">Karte {eanForIndex(ean)}</div>
        </div>
        {showStats && !compact && (kind === 'upgrade'
          ? <div class="panel small">{upgradeEffect(id)}<div class="muted">Preis {card.price} · Voraussetzung {requirementName(id)}</div></div>
          : <KV items={[['Preis', card.price], ['Runden', card.rounds], ['Def', card.def], ['Off', card.off], ['Schaden', card.dmg]]} />)}
        {children}
      </div>
    </div>
  );
}

export interface Msg {
  tone?: 'info' | 'error' | 'ok' | 'warn';
  sound?: SoundName;
  title: string;
  body?: ComponentChildren;
  cards?: number[];
}

export function MessageDialog({ msg, onClose }: { msg: Msg; onClose: () => void }) {
  return (
    <div class="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div class={`dialog ${msg.tone ?? 'info'}`} role="alertdialog">
        <h3>{msg.title}</h3>
        {msg.body && <div>{msg.body}</div>}
        {msg.cards && (
          <div class="list">
            {msg.cards.map((ean) => <CardView key={ean} ean={ean} compact />)}
          </div>
        )}
        <button class="btn primary block" onClick={onClose} autoFocus>OK</button>
      </div>
    </div>
  );
}

const PIPS: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };

export function Die({ value, rolling }: { value: number | null; rolling?: boolean }) {
  if (value === null) return <div class="die always">!</div>;
  return (
    <div class={`die ${rolling ? 'rolling' : ''}`} aria-label={`Würfel ${value}`}>
      {Array.from({ length: 9 }, (_, i) => (PIPS[value].includes(i) ? <i key={i} /> : <span key={i} />))}
    </div>
  );
}

const ICON_PATHS = {
  buy: 'M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 7H6M10 21h.01M18 21h.01',
  attack: 'M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2',
  repair: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01',
  inventory: 'M4 7h16M4 12h16M4 17h10',
  end: 'M5 12h14M13 6l6 6-6 6',
};

export function Icon({ name }: { name: keyof typeof ICON_PATHS }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICON_PATHS[name]} /></svg>;
}

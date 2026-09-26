import { CARDS } from '../engine/data';
import { cardIdOfEan, factionOfEan, kindOfEan } from '../engine/cards';
import { eanForIndex } from '../engine/ean';
import { ean8Svg } from '../print/barcodeSvg';
import { factionAsset, helgeIcon } from './assets';
import { cardArtUrl, placeholderDataUri } from './cardArt';
import { DESCRIPTIONS, KIND_LABEL, categoryLabel, isStartCard, requirementName, rulesFor, upgradeEffect } from './cardText';

export interface CardFaceOptions {
  /** Pfad-Präfix zu public/ (App: '', Kartendrucker unter Tools/: '../') */
  base?: string;
  /** 'barcode': Druckkarte mit EAN-8-Streifen; 'none': kürzere Karte für die App */
  footer?: 'barcode' | 'none';
}

const EMBLEM = { building: 'emblem-planet', unit: 'emblem-ship', upgrade: 'emblem-gear' } as const;

const esc = (text: string | number) =>
  String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

const rounds = (n: number) => `${n} ${n === 1 ? 'Runde' : 'Runden'}`;

/**
 * Karte im Layout von Helge Vogt: Rahmen der Fraktion, Emblem + Name, Bildfenster, Werte-Platte,
 * im Druck darunter der Barcode. Gemeinsam für App (CardView) und Kartendrucker. Maße in cardFace.css.
 */
export function cardFaceHtml(ean: number, { base = '', footer = 'none' }: CardFaceOptions = {}): string {
  const id = cardIdOfEan(ean);
  const card = CARDS[id];
  const kind = kindOfEan(ean);
  const faction = factionOfEan(ean);
  const icon = (name: string) => `<i class="cf-icon" style="--m:url('${helgeIcon(name, base)}')"></i>`;
  const stat = (name: string, value: string | number) => `<li>${icon(`icon-${name}`)}<b>${esc(value)}</b></li>`;
  const lines = [
    `<b>${esc(card.name)}</b>`,
    `Kategorie: ${esc(categoryLabel(id))}`,
    `Voraussetzung: ${esc(requirementName(id))}`,
  ].join('<br>');
  const extra = kind === 'upgrade' ? upgradeEffect(id) : DESCRIPTIONS[id];
  const rules = rulesFor(id).map((r) => `<p class="cf-rule">${esc(r)}</p>`).join('');

  const plate = kind === 'upgrade'
    ? `<div class="cf-cost">${icon('icon-cost')}<b>${card.price}</b></div>
       <div class="cf-text cf-upgrade-text">${lines}<p>${esc(extra ?? '')}</p></div>`
    : `<ul class="cf-stats${card.off ? '' : ' cf-three'}">${[
      stat('cost', card.price),
      stat('time', rounds(card.rounds)),
      stat('def', card.def || '–'),
      ...(card.off ? [stat('off', card.off), stat('dmg', card.dmg)] : []),
    ].join('')}</ul>
       <div class="cf-text">${lines}${extra ? `<p>${esc(extra)}</p>` : ''}${rules}</div>`;

  const code = eanForIndex(ean);
  const foot = footer === 'barcode'
    ? `<footer class="cf-foot">${ean8Svg(code, 0.4, 9.5)}</footer>`
    : '';
  const bg = factionAsset(faction, footer === 'barcode' ? 'card.webp' : 'card-short.webp', base);
  const fallback = placeholderDataUri(id).replace(/'/g, '%27');

  // Startkarten (in Runde 1 aktiv, z. B. die erste Energiequelle) tragen ein Band über dem Bildfenster
  const start = isStartCard(ean) ? '<div class="cf-start">Startkarte</div>' : '';

  return `<article class="cf cf-${kind} cf-${footer === 'barcode' ? 'print' : 'app'}" style="--cf-bg:url('${bg}')">
<div class="cf-oval">${icon(EMBLEM[kind])}</div>
<h3 class="cf-name">${esc(card.name)}</h3>
<div class="cf-win"><img alt="" src="${cardArtUrl(id, `${base}cards/`)}" onerror="this.onerror=null;this.src='${fallback}'">${start}</div>
<div class="cf-plate cf-plate-${kind === 'upgrade' ? 'upgrade' : 'stats'}">${plate}</div>
${foot}</article>`;
}

/**
 * Rückseite im Stil von Helge Vogt: Rahmentextur der Fraktion, Rückseiten-Motiv (Flügel, Blitzfaust,
 * Totenkopf, DNA-Helix) im Fasenrahmen. Der Kartentyp ist von hinten erkennbar: großes Abzeichen mit
 * Symbol und Schrift unten, dazu kleine Symbole oben links und (gedreht) unten rechts wie bei Spielkarten,
 * damit man den Typ auch in der aufgefächerten Hand sieht.
 */
export function cardBackHtml(ean: number, { base = '' }: Pick<CardFaceOptions, 'base'> = {}): string {
  const kind = kindOfEan(ean);
  const faction = factionOfEan(ean);
  const emblem = `<i class="cf-icon" style="--m:url('${helgeIcon(EMBLEM[kind], base)}')"></i>`;
  const tex = factionAsset(faction, 'tile.webp', base);
  const rim = factionAsset(faction, 'rim.webp', base);
  return `<article class="cb cb-${kind}" style="--cb-tex:url('${tex}');--cb-rim:url('${rim}')">
<div class="cb-win"><img alt="" src="${factionAsset(faction, 'back.webp', base)}"></div>
<div class="cb-corner cb-tl">${emblem}</div><div class="cb-corner cb-br">${emblem}</div>
<div class="cb-badge">${emblem}<span>${KIND_LABEL[kind]}</span></div>
</article>`;
}

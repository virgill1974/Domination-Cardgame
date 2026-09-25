import type { GameEvent } from '../engine/events';
import { ERRORS, SPECIAL_TEXT, type ErrorCode } from '../engine/messages';
import type { Msg } from './components';

export const errorMsg = (code: ErrorCode): Msg => ({ tone: 'error', sound: 'error', title: ERRORS[code] });

export function eventMessages(events: GameEvent[]): Msg[] {
  const msgs: Msg[] = [];
  const activated = events.flatMap((e) => (e.type === 'activated' ? [e.ean] : []));
  let activatedShown = false;
  for (const e of events) {
    switch (e.type) {
      case 'overload':
        msgs.push({
          tone: 'warn', sound: 'overload', title: 'Achtung: Überlastung',
          body: 'Zu wenig Energie. Das Kraftwerk wird wieder aufgebaut, du setzt diese Runde aus.',
        });
        break;
      case 'special':
        msgs.push({ tone: 'ok', sound: 'bonus', title: 'Sonderaktion', body: SPECIAL_TEXT[e.roll] });
        break;
      case 'activated':
        if (!activatedShown) {
          activatedShown = true;
          msgs.push({
            tone: 'ok', sound: 'activate', title: activated.length === 1 ? 'Aktiviert' : `${activated.length} Karten aktiviert`,
            body: 'Jetzt ausspielen: Gebäude verdeckt in Reihe 2 oder 3, Einheiten offen in Reihe 1.',
            cards: activated,
          });
        }
        break;
      case 'spySatellite':
        msgs.push({ sound: 'turn', title: 'Spionagesatellit', body: 'Du darfst in dieser Runde eine verdeckte Karte eines Gegners aufdecken.' });
        break;
      case 'camouflage':
        msgs.push({ sound: 'bonus', title: 'Tarnung', body: 'Deine Einheiten dürfen ab jetzt verdeckt ausgespielt werden. Nach einem Angriff werden sie aufgedeckt.' });
        break;
      case 'medal':
        msgs.push({
          tone: 'ok', sound: 'medal', title: 'Orden erhalten',
          body: `${e.medal === 'bestBase' ? 'Bester Stützpunkt' : 'Beste Streitmacht'} (+5 Siegpunkte). Nimm dir den Marker.`,
        });
        break;
      case 'winner':
        break;
    }
  }
  return msgs;
}

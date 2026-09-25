import { EAN8_MODULES, EAN8_QUIET_ZONE, ean8Bars } from '../engine/ean';

/** EAN-8 als Vektorgrafik: ganzzahliges Modulraster, zusammenhängende Balken, Ruhezone links/rechts. */
export function ean8Svg(code: string, moduleMm = 0.4, heightMm = 11): string {
  const modules = EAN8_MODULES + 2 * EAN8_QUIET_ZONE;
  const h = heightMm / moduleMm;
  const bars = ean8Bars(code)
    .map(([x, w]) => `<rect x="${x + EAN8_QUIET_ZONE}" width="${w}" height="${h}"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${modules * moduleMm}mm" height="${heightMm}mm" viewBox="0 0 ${modules} ${h}" shape-rendering="crispEdges"><rect width="${modules}" height="${h}" fill="#fff"/><g fill="#000">${bars}</g></svg>`;
}

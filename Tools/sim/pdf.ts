// PDF-Fassung des Balance-Berichts: Markdown → HTML im Stil der Spielanleitung, gedruckt mit Chrome (headless).
// Schriften und Logo werden eingebettet, damit die HTML-Datei für sich allein steht.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { FACTIONS, FACTION_COLORS } from '../../src/engine/data';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function inline(text: string): string {
  return esc(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\s][^*]*?)\*(?=[\s).,;:]|$)/g, '$1<em>$2</em>');
}

/** Fraktionsnamen in Tabellen bekommen ein Farbfeld wie auf den Karten */
function factionCell(html: string): string {
  const i = (FACTIONS as readonly string[]).indexOf(html.trim());
  return i < 0 ? html : `<span class="fname"><span class="fdot" style="background:${FACTION_COLORS[i]}"></span>${html}</span>`;
}

/** Wandelt das Markdown des Berichts (Überschriften, Absätze, Tabellen, Listen, Zitate, Code) in HTML. */
export function markdownToHtml(md: string, charts: Record<string, string>): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let i = 0;
  const cells = (line: string) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  while (i < lines.length) {
    const line = lines[i];
    const chart = /^@@CHART:(\w+)@@$/.exec(line.trim());
    if (chart) {
      out.push(charts[chart[1]] ?? '');
      i++;
    } else if (line.startsWith('```')) {
      const code: string[] = [];
      for (i++; i < lines.length && !lines[i].startsWith('```'); i++) code.push(esc(lines[i]));
      out.push(`<pre>${code.join('\n')}</pre>`);
      i++;
    } else if (/^#{1,3} /.test(line)) {
      const level = line.indexOf(' ');
      out.push(`<h${level}>${inline(line.slice(level + 1))}</h${level}>`);
      i++;
    } else if (line.startsWith('|')) {
      const head = cells(line);
      const rows: string[][] = [];
      for (i += 2; i < lines.length && lines[i].startsWith('|'); i++) rows.push(cells(lines[i]));
      const numeric = (c: string) => /^[\d−–-]/.test(c.replace(/\*/g, '')) && !/[a-zA-Z]{3}/.test(c);
      out.push('<table><thead><tr>' + head.map((h) => `<th>${factionCell(inline(h))}</th>`).join('') + '</tr></thead><tbody>'
        + rows.map((r) => '<tr>' + r.map((c, ci) => `<td${ci > 0 && numeric(c) ? ' class="num"' : ''}>${factionCell(inline(c))}</td>`).join('') + '</tr>').join('')
        + '</tbody></table>');
    } else if (/^\s*- /.test(line)) {
      const items: Array<{ depth: number; text: string }> = [];
      for (; i < lines.length && /^\s*- /.test(lines[i]); i++) {
        items.push({ depth: lines[i].search(/\S/) >= 2 ? 1 : 0, text: lines[i].replace(/^\s*- /, '') });
      }
      let html = '<ul>';
      let open = false;
      items.forEach((it, k) => {
        if (it.depth === 1 && !open) {
          html += '<ul>';
          open = true;
        } else if (it.depth === 0 && open) {
          html += '</ul></li>';
          open = false;
        } else if (k > 0 && it.depth === 0) html += '</li>';
        html += `<li>${inline(it.text)}`;
        if (it.depth === 1) html += '</li>';
      });
      html += open ? '</ul></li></ul>' : '</li></ul>';
      out.push(html);
    } else if (line.startsWith('> ')) {
      const quote: string[] = [];
      for (; i < lines.length && lines[i].startsWith('> '); i++) quote.push(inline(lines[i].slice(2)));
      out.push(`<blockquote>${quote.join('<br>')}</blockquote>`);
    } else if (line.trim() === '') {
      i++;
    } else {
      const para: string[] = [];
      for (; i < lines.length && lines[i].trim() !== '' && !/^(#|\||```|> |\s*- |@@CHART)/.test(lines[i]); i++) para.push(inline(lines[i]));
      out.push(`<p>${para.join(' ')}</p>`);
    }
  }
  return out.join('\n');
}

const dataUri = (file: string, type: string) => `data:${type};base64,${readFileSync(file).toString('base64')}`;

/** Vollständige HTML-Seite: Kopf mit Logo, Schriften eingebettet, A4-Druck */
export function reportPage(body: string, subtitle: string): string {
  const root = process.cwd();
  const font = (pkg: string, file: string) => dataUri(join(root, 'node_modules', pkg, 'files', file), 'font/woff2');
  const logo = readFileSync(join(root, 'public', 'ui', 'logo.svg'), 'utf8');
  return `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8"><title>Domination – Balance-Simulation</title>
<style>
@font-face { font-family: 'Silkscreen'; src: url(${font('@fontsource/silkscreen', 'silkscreen-latin-400-normal.woff2')}) format('woff2'); }
@font-face { font-family: 'Space Grotesk'; font-weight: 300 700; src: url(${font('@fontsource-variable/space-grotesk', 'space-grotesk-latin-wght-normal.woff2')}) format('woff2'); }
@font-face { font-family: 'JetBrains Mono'; src: url(${font('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff2')}) format('woff2'); }
@page { size: A4 portrait; margin: 15mm 14mm 16mm; }
* { box-sizing: border-box; }
body { margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 9.2pt; line-height: 1.45; color: #1b1f24;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; }
header { display: flex; align-items: center; gap: 6mm; padding: 6mm 7mm; margin-bottom: 5mm; border-radius: 1.5mm; color: #eef1f4;
  background: radial-gradient(120% 140% at 20% 20%, #4a5058, #22262b 70%); }
header svg { width: 24mm; height: 24mm; flex: 0 0 auto; }
header .kicker { font-family: 'Silkscreen', monospace; font-size: 9pt; letter-spacing: 0.8mm; opacity: 0.75; }
header h1 { margin: 1mm 0 1.5mm; font-family: 'Silkscreen', monospace; font-weight: 400; font-size: 24pt; letter-spacing: 0.6mm; line-height: 1.05;
  background: linear-gradient(120deg, #f4f6f9, #a3a9b6 55%, #6b7280); -webkit-background-clip: text; background-clip: text; color: transparent; }
header .sub { font-size: 9pt; opacity: 0.85; }
body > h1 { display: none; }
h2 { margin: 6mm 0 2.5mm; padding: 2mm 3.5mm; break-after: avoid; font-family: 'Silkscreen', monospace; font-weight: 400; font-size: 11.5pt;
  letter-spacing: 0.3mm; color: #f2f5f7; background: linear-gradient(90deg, #2b3036, #3d434b); border-left: 1.4mm solid #ffd24a; border-radius: 1mm; }
h3 { margin: 4mm 0 1.5mm; font-size: 10.5pt; break-after: avoid; }
p, ul { margin: 0 0 2.2mm; }
ul { padding-left: 5mm; }
li { margin-bottom: 0.7mm; }
li > ul { margin: 0.8mm 0 0; }
strong { font-weight: 700; }
code { font-family: 'JetBrains Mono', monospace; font-size: 7.6pt; background: #eceae4; padding: 0 0.8mm; border-radius: 0.6mm; word-break: break-all; }
pre { font-family: 'JetBrains Mono', monospace; font-size: 7.6pt; background: #eceae4; padding: 2.5mm 3mm; border-radius: 1mm; white-space: pre-wrap; break-inside: avoid; }
blockquote { margin: 0 0 3mm; padding: 2.5mm 3.5mm; border-left: 1mm solid #d9822b; background: #fbf1e6; border-radius: 1mm; }
table { width: 100%; border-collapse: collapse; margin: 1mm 0 3.5mm; font-size: 8.2pt; line-height: 1.3; }
thead { display: table-header-group; }
tr { break-inside: avoid; }
th { text-align: left; font-weight: 600; color: #f2f5f7; background: #2b3036; padding: 1.2mm 2mm; }
td { padding: 1mm 2mm; border-bottom: 0.2mm solid #d6d3cb; vertical-align: top; }
td.num { white-space: nowrap; }
tbody tr:nth-child(even) td { background: #f4f3ef; }
.fname { white-space: nowrap; }
.fdot { display: inline-block; width: 2.4mm; height: 2.4mm; margin-right: 1.4mm; border-radius: 0.5mm; box-shadow: 0 0 0 0.25mm #0006; vertical-align: -0.2mm; }
figure.chart { margin: 1mm 0 4mm; break-inside: avoid; }
figure.chart svg { width: 100%; height: auto; }
figure.chart figcaption { font-size: 7.8pt; color: #5a6068; }
</style></head>
<body>
<header>${logo}<div><div class="kicker">Domination · Das Kartenspiel</div><h1>Balance-Simulation</h1><div class="sub">${esc(subtitle)}</div></div></header>
${body}
</body></html>`;
}

/** Druckt eine HTML-Datei mit Chrome/Edge (headless) als PDF. Gibt false zurück, wenn kein Browser gefunden wurde. */
export function printPdf(htmlFile: string, pdfFile: string): boolean {
  const candidates = [
    process.env.CHROME,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe'),
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].filter((c): c is string => !!c && existsSync(c));
  if (!candidates.length) return false;
  execFileSync(candidates[0], [
    '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--virtual-time-budget=5000',
    `--print-to-pdf=${pdfFile}`, pathToFileURL(htmlFile).href,
  ], { stdio: 'ignore' });
  return existsSync(pdfFile);
}

export function writeHtml(file: string, html: string) {
  writeFileSync(file, html);
}

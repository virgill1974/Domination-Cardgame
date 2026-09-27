// Startet den Balance-Simulator: bündelt Tools/sim/*.ts mit rolldown (kommt mit Vite 8) und ruft den Runner auf.
// Aufruf: npm run sim -- <Befehl> [Optionen]   (Befehle siehe Tools/sim/run.ts)
import { build } from 'rolldown';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '.build');
await build({
  input: { run: join(here, 'run.ts'), worker: join(here, 'worker.ts') },
  platform: 'node',
  output: { dir: out, format: 'esm', entryFileNames: '[name].js' },
  logLevel: 'warn',
});
await import(pathToFileURL(join(out, 'run.js')).href);

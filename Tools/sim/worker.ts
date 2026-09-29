// Worker-Thread: spielt Pakete von Partien und schickt die Zusammenfassung zurück.
import { parentPort, workerData } from 'node:worker_threads';
import { playGame } from './game';
import { applyPatch, type Job } from './jobs';
import { addGame, emptyAgg } from './stats';

applyPatch(workerData?.patch);

parentPort!.on('message', (job: Job) => {
  const agg = emptyAgg();
  const t0 = performance.now();
  for (let i = 0; i < job.games; i++) {
    const r = playGame({
      seats: job.seats.map((faction, k) => ({ faction, bot: job.bots[k] })),
      vpLimit: job.vpLimit,
      seed: job.seed + i,
      rules: job.rules,
    });
    addGame(agg, r, job.details);
  }
  parentPort!.postMessage({ id: job.id, agg, ms: performance.now() - t0 });
});

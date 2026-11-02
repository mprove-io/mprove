import { type SpawnSyncReturns, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

let root: URL = new URL('../../', import.meta.url);

let viewer: URL = new URL('extra/s-viewer', root);

let command: string = process.argv[2];

if (command !== 'check') {
  throw new Error('Expected the S Viewer manifest command: check.');
}

let args: string[] = process.argv.slice(2);

if (existsSync(viewer)) {
  let cli: string = fileURLToPath(
    new URL('extra/s-viewer/scripts/manifest.mjs', root)
  );

  let output: SpawnSyncReturns<Buffer> = spawnSync(
    process.execPath,
    [cli, ...args],
    { cwd: root, stdio: 'inherit' }
  );

  if (output.error) {
    throw output.error;
  }

  process.exitCode = output.status ?? 1;
} else {
  console.warn(
    'Warning: extra/s-viewer is absent; skipping manifest validation.'
  );
}

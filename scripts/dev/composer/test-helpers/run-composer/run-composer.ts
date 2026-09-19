import { type SpawnSyncReturns, spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

export type RunComposerOutput = {
  status: number;
  stderr: string;
  stdout: string;
};

export function runComposer(item: {
  contentDirectory: string;
  manifestPath: string;
  outputPath: string;
}): RunComposerOutput {
  let result: SpawnSyncReturns<string> = spawnSync(
    process.execPath,
    [
      '--import=tsx',
      resolve('scripts/dev/composer/main.ts'),
      item.manifestPath,
      item.contentDirectory,
      item.outputPath
    ],
    {
      cwd: process.cwd(),
      encoding: 'utf8'
    }
  );

  let output: RunComposerOutput = {
    status: result.status ?? 1,
    stderr: result.stderr,
    stdout: result.stdout
  };

  return output;
}

import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

export type TemporaryDirectory = {
  cleanup: () => void;
  path: string;
};

export function createTemporaryDirectory(item: {
  testId: string;
}): TemporaryDirectory {
  let temporaryRoot: string = resolve(process.cwd(), 'tmp', 'composer');

  mkdirSync(temporaryRoot, { recursive: true });

  let path: string = mkdtempSync(resolve(temporaryRoot, `${item.testId}-`));

  let temporaryDirectory: TemporaryDirectory = {
    cleanup: (): void => rmSync(path, { force: true, recursive: true }),
    path: path
  };

  return temporaryDirectory;
}

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export function writeFiles(item: {
  files: Record<string, string>;
  rootDirectory: string;
}): void {
  let { files, rootDirectory } = item;

  Object.entries(files).forEach(([relativePath, content]) => {
    let filePath: string = resolve(rootDirectory, relativePath);

    mkdirSync(dirname(filePath), { recursive: true });

    writeFileSync(filePath, content, 'utf8');
  });
}

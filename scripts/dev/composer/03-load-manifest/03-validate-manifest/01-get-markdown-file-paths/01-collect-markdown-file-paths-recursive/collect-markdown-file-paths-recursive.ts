import { type Dirent, readdirSync } from 'node:fs';
import { posix, resolve } from 'node:path';

export function collectMarkdownFilePathsRecursive(item: {
  currentDirectory: string;
  relativeDirectory: string;
  scanState: { currentDirectory: string };
}): string[] {
  let { currentDirectory, relativeDirectory, scanState } = item;

  scanState.currentDirectory = currentDirectory;

  let entries: Dirent[] = readdirSync(currentDirectory, {
    withFileTypes: true
  });

  let markdownFilePaths: string[] = [];

  for (let i = 0; i < entries.length; i++) {
    let entry: Dirent = entries[i];

    let relativePath: string = relativeDirectory
      ? posix.join(relativeDirectory, entry.name)
      : entry.name;

    let absolutePath: string = resolve(currentDirectory, entry.name);

    let isDirectory: boolean = entry.isDirectory();

    if (isDirectory) {
      let childPaths: string[] = collectMarkdownFilePathsRecursive({
        currentDirectory: absolutePath,
        relativeDirectory: relativePath,
        scanState: scanState
      });

      markdownFilePaths.push(...childPaths);

      continue;
    }

    let isMarkdownFile: boolean =
      entry.isFile() && posix.extname(entry.name) === '.md';

    if (isMarkdownFile) {
      markdownFilePaths.push(relativePath);
    }
  }

  return markdownFilePaths;
}

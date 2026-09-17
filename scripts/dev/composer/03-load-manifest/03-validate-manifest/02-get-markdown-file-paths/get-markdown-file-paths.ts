import { type Dirent, readdirSync } from 'node:fs';
import { posix, resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import type { ScriptError } from '../../../types/errors/script-error';

function collectMarkdownFilePaths(item: {
  currentDirectory: string;
  relativeDirectory: string;
}): string[] {
  let { currentDirectory, relativeDirectory } = item;

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
      let childPaths: string[] = collectMarkdownFilePaths({
        currentDirectory: absolutePath,
        relativeDirectory: relativePath
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

export function getMarkdownFilePaths(item: {
  sourceDirectory: string;
}): Result.Result<string[], ScriptError> {
  let { sourceDirectory } = item;

  return Result.pipe(
    Result.succeed(sourceDirectory),
    Result.andThen(path =>
      Result.try({
        try: (): string[] =>
          collectMarkdownFilePaths({
            currentDirectory: path,
            relativeDirectory: ''
          }),
        catch: (error: unknown): ScriptError => ({
          code: 'SCRIPT_SOURCE_ERROR',
          message: `Unable to scan ${path}`,
          path: path,
          originalError: error
        })
      })
    )
  );
}

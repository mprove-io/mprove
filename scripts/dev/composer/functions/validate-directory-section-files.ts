import { type Dirent, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import type { ScriptError } from '../types/errors/script-error';

export function validateDirectorySectionFiles(item: {
  sourceDirectory: string;
}): Result.Result<void, ScriptError> {
  let { sourceDirectory } = item;

  return Result.pipe(
    Result.succeed(sourceDirectory),
    Result.andThen(path =>
      Result.try({
        try: (): string[] => {
          let pendingDirectoryPaths: string[] = [path];

          let missingSectionFilePaths: string[] = [];

          for (let i = 0; i < pendingDirectoryPaths.length; i++) {
            let directoryPath: string = pendingDirectoryPaths[i];

            let entries: Dirent[] = readdirSync(directoryPath, {
              withFileTypes: true
            });

            let fileNames: Set<string> = new Set<string>(
              entries.filter(entry => entry.isFile()).map(entry => entry.name)
            );

            let childDirectories: Dirent[] = entries.filter(entry =>
              entry.isDirectory()
            );

            childDirectories.forEach(entry => {
              let childDirectoryPath: string = resolve(
                directoryPath,
                entry.name
              );

              let sectionFileName: string = `${entry.name}.md`;

              let hasSectionFile: boolean = fileNames.has(sectionFileName);

              if (!hasSectionFile) {
                let sectionFilePath: string = resolve(
                  directoryPath,
                  sectionFileName
                );

                missingSectionFilePaths.push(sectionFilePath);
              }

              pendingDirectoryPaths.push(childDirectoryPath);
            });
          }

          return missingSectionFilePaths;
        },
        catch: (error: unknown): ScriptError => ({
          code: 'SCRIPT_SOURCE_ERROR',
          message: `Unable to scan ${path}`,
          path: path,
          originalError: error
        })
      })
    ),
    Result.andThen(missingSectionFilePaths => {
      let hasMissingSectionFile: boolean = missingSectionFilePaths.length > 0;

      return hasMissingSectionFile
        ? Result.fail({
            code: 'SCRIPT_SOURCE_ERROR',
            message: `Directory requires section file ${missingSectionFilePaths[0]}`,
            path: missingSectionFilePaths[0]
          })
        : Result.succeed();
    })
  );
}

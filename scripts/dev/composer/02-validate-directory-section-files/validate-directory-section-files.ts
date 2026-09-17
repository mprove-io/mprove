import { type Dirent, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import type { ComposerError } from '../types/errors/composer-error';

export function validateDirectorySectionFiles(item: {
  sourceDirectory: string;
}): Result.Result<void, ComposerError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('missingSectionFilePaths', v => {
      let scannedDirectoryPath: string = v.sourceDirectory;

      return Result.try({
        try: (): string[] => {
          let pendingDirectoryPaths: string[] = [v.sourceDirectory];

          let missingSectionFilePaths: string[] = [];

          for (let i = 0; i < pendingDirectoryPaths.length; i++) {
            let directoryPath: string = pendingDirectoryPaths[i];

            scannedDirectoryPath = directoryPath;

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
        catch: (error: unknown): ComposerError => ({
          code: 'COMPOSER_DIRECTORY_SECTION_SCAN_FAILED',
          message: `Unable to scan ${scannedDirectoryPath}`,
          path: scannedDirectoryPath,
          originalError: error
        })
      });
    }),
    Result.andThen(v => {
      let hasMissingSectionFile: boolean = v.missingSectionFilePaths.length > 0;

      return hasMissingSectionFile
        ? Result.fail({
            code: 'COMPOSER_DIRECTORY_SECTION_FILE_MISSING',
            message: `Directory requires section file ${v.missingSectionFilePaths[0]}`,
            path: v.missingSectionFilePaths[0]
          })
        : Result.succeed();
    })
  );
}

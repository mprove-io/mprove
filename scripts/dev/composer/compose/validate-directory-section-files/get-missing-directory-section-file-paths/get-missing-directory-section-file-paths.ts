import { type Dirent, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import type { ComposerDirectorySectionScanFailedError } from '../../../types/errors/composer-directory-section-scan-failed-error';
import type { GetMissingDirectorySectionFilePathsError } from '../../../types/function-errors/get-missing-directory-section-file-paths-error';

export function getMissingDirectorySectionFilePaths(item: {
  sourceDirectory: string;
}): Result.Result<string[], GetMissingDirectorySectionFilePathsError> {
  let { sourceDirectory } = item;

  let scannedDirectoryPath: string = sourceDirectory;

  let result: Result.Result<
    string[],
    GetMissingDirectorySectionFilePathsError
  > = Result.try({
    try: (): string[] => {
      let pendingDirectoryPaths: string[] = [sourceDirectory];

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
          let childDirectoryPath: string = resolve(directoryPath, entry.name);

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
    catch: (error: unknown): ComposerDirectorySectionScanFailedError => ({
      code: 'COMPOSER_DIRECTORY_SECTION_SCAN_FAILED',
      message: `Unable to scan ${scannedDirectoryPath}`,
      path: scannedDirectoryPath,
      originalError: error
    })
  });

  return result;
}

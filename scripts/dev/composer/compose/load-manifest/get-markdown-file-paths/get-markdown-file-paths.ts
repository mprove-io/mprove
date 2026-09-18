import { type Dirent, readdirSync } from 'node:fs';
import { posix, resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import type { ComposerMarkdownFileScanFailedError } from '../../../types/errors/composer-markdown-file-scan-failed-error';
import type { GetMarkdownFilePathsError } from '../../../types/function-errors/get-markdown-file-paths-error';

type PendingPath = {
  type: 'directory' | 'file';
  absolutePath: string;
  relativePath: string;
};

export function getMarkdownFilePaths(item: {
  sourceDirectory: string;
}): Result.Result<string[], GetMarkdownFilePathsError> {
  let { sourceDirectory } = item;

  let scannedDirectoryPath: string = sourceDirectory;

  let result: Result.Result<string[], GetMarkdownFilePathsError> = Result.try({
    try: (): string[] => {
      let pendingPaths: PendingPath[] = [
        {
          type: 'directory',
          absolutePath: sourceDirectory,
          relativePath: ''
        }
      ];

      let markdownFilePaths: string[] = [];

      while (pendingPaths.length > 0) {
        let pendingPath: PendingPath = pendingPaths.pop();

        if (pendingPath.type === 'file') {
          let isMarkdownFile: boolean =
            posix.extname(pendingPath.relativePath) === '.md';

          if (isMarkdownFile) {
            markdownFilePaths.push(pendingPath.relativePath);
          }

          continue;
        }

        scannedDirectoryPath = pendingPath.absolutePath;

        let entries: Dirent[] = readdirSync(pendingPath.absolutePath, {
          withFileTypes: true
        });

        for (let i = entries.length - 1; i >= 0; i--) {
          let entry: Dirent = entries[i];

          let isDirectory: boolean = entry.isDirectory();

          let isFile: boolean = entry.isFile();

          if (!isDirectory && !isFile) {
            continue;
          }

          let relativePath: string = pendingPath.relativePath
            ? posix.join(pendingPath.relativePath, entry.name)
            : entry.name;

          let childPath: PendingPath = {
            type: isDirectory ? 'directory' : 'file',
            absolutePath: resolve(pendingPath.absolutePath, entry.name),
            relativePath: relativePath
          };

          pendingPaths.push(childPath);
        }
      }

      return markdownFilePaths;
    },
    catch: (error: unknown): ComposerMarkdownFileScanFailedError => ({
      code: 'COMPOSER_MARKDOWN_FILE_SCAN_FAILED',
      message: `Unable to scan ${scannedDirectoryPath}`,
      path: scannedDirectoryPath,
      originalError: error
    })
  });

  return result;
}

import { type Dirent, readdirSync } from 'node:fs';
import { posix, resolve } from 'node:path';
import { Result } from '@praha/byethrow';
import type { DiscoverPathsPayload } from '../../../types/discover-paths-payload';
import type { ComposerMarkdownFileScanFailedError } from '../../../types/errors/composer-markdown-file-scan-failed-error';
import type { DiscoverPathsError } from '../../../types/function-errors/discover-paths-error';

type PendingPath = {
  type: 'directory' | 'file';
  absolutePath: string;
  relativePath: string;
};

export function discoverPaths(item: {
  contentDirectory: string;
}): Result.Result<DiscoverPathsPayload, DiscoverPathsError> {
  let { contentDirectory } = item;

  let scannedDirectoryPath: string = contentDirectory;

  let result: Result.Result<DiscoverPathsPayload, DiscoverPathsError> =
    Result.try({
      try: (): DiscoverPathsPayload => {
        let pendingPaths: PendingPath[] = [
          {
            type: 'directory',
            absolutePath: contentDirectory,
            relativePath: ''
          }
        ];

        let discoverPathsPayload: DiscoverPathsPayload = {
          directories: [],
          files: []
        };

        while (pendingPaths.length > 0) {
          let pendingPath: PendingPath = pendingPaths.pop();

          if (pendingPath.type === 'file') {
            if (posix.extname(pendingPath.relativePath) === '.md') {
              discoverPathsPayload.files.push(pendingPath.relativePath);
            }

            continue;
          }

          scannedDirectoryPath = pendingPath.absolutePath;

          if (pendingPath.relativePath) {
            discoverPathsPayload.directories.push(pendingPath.relativePath);
          }

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

        return discoverPathsPayload;
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

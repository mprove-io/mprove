import path from 'node:path';
import { Result } from '@praha/byethrow';
import fse from 'fs-extra';
import pIteration from 'p-iteration';
import type { DiskSyncFile } from '#common/zod/disk/disk-sync-file';
import type { DiskPathTraversalError } from '#common/zod/disk/errors/disk-path-traversal-error';
import type { FileIsSymlinkError } from '#common/zod/node-common/errors/file-is-symlink-error';
import type { ApplySyncPayloadError } from '#common/zod/node-common/function-errors/apply-sync-payload-error';
import { validatePathUnderDir } from './validate-path-under-dir';

const { forEachSeries } = pIteration;

export function applySyncPayload(item: {
  repoDir: string;
  changedFiles: DiskSyncFile[];
  deletedFiles: DiskSyncFile[];
}): Result.ResultAsync<void, ApplySyncPayloadError> {
  let { repoDir, changedFiles, deletedFiles } = item;

  return Result.try({
    try: async (): Promise<void> => {
      await forEachSeries(deletedFiles, async (deletedFile: DiskSyncFile) => {
        let filePath: string = Result.unwrap(
          validatePathUnderDir({
            fullPath: path.resolve(repoDir, deletedFile.path),
            allowedDir: repoDir,
            displayPath: deletedFile.path
          })
        );

        await fse.remove(filePath);
      });

      await forEachSeries(changedFiles, async (changedFile: DiskSyncFile) => {
        let filePath: string = Result.unwrap(
          validatePathUnderDir({
            fullPath: path.resolve(repoDir, changedFile.path),
            allowedDir: repoDir,
            displayPath: changedFile.path
          })
        );
        let stat: fse.Stats;

        try {
          stat = await fse.lstat(filePath);
        } catch (error: any) {
          if (error.code !== 'ENOENT') {
            throw error;
          }
        }

        if (stat?.isSymbolicLink() === true) {
          let error: FileIsSymlinkError = { code: 'FILE_IS_SYMLINK' };

          throw error;
        }

        if (stat?.isDirectory() === true) {
          await fse.remove(filePath);
        }

        let parentPath: string = filePath.split('/').slice(0, -1).join('/');

        await fse.ensureDir(parentPath);
        await fse.writeFile(filePath, changedFile.content ?? '');
      });
    },
    catch: (error: unknown): DiskPathTraversalError | FileIsSymlinkError => {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error.code === 'DISK_PATH_TRAVERSAL' ||
          error.code === 'FILE_IS_SYMLINK')
      ) {
        return error as DiskPathTraversalError | FileIsSymlinkError;
      }

      throw error;
    }
  });
}

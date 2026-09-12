import { Result } from '@praha/byethrow';
import { ServerError } from '#common/models/server-error';
import type { DiskSyncFile } from '#common/zod/disk/disk-sync-file';
import type { DiskPathTraversalError } from '#common/zod/disk/errors/disk-path-traversal-error';
import type { FileIsSymlinkError } from '#common/zod/disk/errors/file-is-symlink-error';
import { applySyncPayload } from '#node-common/functions/apply-sync-payload';

// Temporary bridge for anticipated errors thrown by a legacy helper.
export function applySyncPayloadWrapped(item: {
  repoDir: string;
  changedFiles: DiskSyncFile[];
  deletedFiles: DiskSyncFile[];
}): Result.ResultAsync<void, DiskPathTraversalError | FileIsSymlinkError> {
  let { repoDir, changedFiles, deletedFiles } = item;

  let result: Result.ResultAsync<
    void,
    DiskPathTraversalError | FileIsSymlinkError
  > = Result.try({
    try: (): Promise<void> => {
      let applied: Promise<void> = applySyncPayload({
        repoDir: repoDir,
        changedFiles: changedFiles,
        deletedFiles: deletedFiles
      });

      return applied;
    },
    catch: (error: unknown): DiskPathTraversalError | FileIsSymlinkError => {
      if (error instanceof ServerError) {
        if (error.message === 'DISK_PATH_TRAVERSAL') {
          return {
            code: 'DISK_PATH_TRAVERSAL',
            displayData: error.displayData
          };
        }

        if (error.message === 'FILE_IS_SYMLINK') {
          return { code: 'FILE_IS_SYMLINK' };
        }
      }

      throw error;
    }
  });

  return result;
}

import { Result } from '@praha/byethrow';
import type { StatusResult } from 'simple-git';
import { ServerError } from '#common/models/server-error';
import type { DiskSyncFile } from '#common/zod/disk/disk-sync-file';
import type { DiskPathTraversalError } from '#common/zod/disk/errors/disk-path-traversal-error';
import type { FileIsSymlinkError } from '#common/zod/disk/errors/file-is-symlink-error';
import type { FileSizeIsTooBigError } from '#common/zod/disk/errors/file-size-is-too-big-error';
import { getSyncAppliedChanges } from '#node-common/functions/get-sync-applied-changes';

// Temporary bridge for anticipated errors thrown by a legacy helper.
export function getSyncAppliedChangesWrapped(item: {
  repoDir: string;
  changedFiles: DiskSyncFile[];
  deletedFiles: DiskSyncFile[];
  statusResult: StatusResult;
}): Result.ResultAsync<
  string[],
  DiskPathTraversalError | FileIsSymlinkError | FileSizeIsTooBigError
> {
  let { repoDir, changedFiles, deletedFiles, statusResult } = item;

  let result: Result.ResultAsync<
    string[],
    DiskPathTraversalError | FileIsSymlinkError | FileSizeIsTooBigError
  > = Result.try({
    try: (): Promise<string[]> => {
      let appliedChanges: Promise<string[]> = getSyncAppliedChanges({
        repoDir: repoDir,
        changedFiles: changedFiles,
        deletedFiles: deletedFiles,
        statusResult: statusResult
      });

      return appliedChanges;
    },
    catch: (
      error: unknown
    ): DiskPathTraversalError | FileIsSymlinkError | FileSizeIsTooBigError => {
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

        if (error.message === 'FILE_SIZE_IS_TOO_BIG') {
          return { code: 'FILE_SIZE_IS_TOO_BIG' };
        }
      }

      throw error;
    }
  });

  return result;
}

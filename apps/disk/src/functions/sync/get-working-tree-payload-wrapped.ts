import { Result } from '@praha/byethrow';
import type { StatusResult } from 'simple-git';
import { ServerError } from '#common/models/server-error';
import type { DiskSyncFile } from '#common/zod/disk/disk-sync-file';
import type { FileIsSymlinkError } from '#common/zod/disk/errors/file-is-symlink-error';
import type { FileSizeIsTooBigError } from '#common/zod/disk/errors/file-size-is-too-big-error';
import { getWorkingTreePayload } from '#node-common/functions/get-sync-files';

type WorkingTreePayload = {
  changedFiles: DiskSyncFile[];
  deletedFiles: DiskSyncFile[];
};

// Temporary bridge for anticipated errors thrown by a legacy helper.
export function getWorkingTreePayloadWrapped(item: {
  statusResult: StatusResult;
  repoDir: string;
}): Result.ResultAsync<
  WorkingTreePayload,
  FileIsSymlinkError | FileSizeIsTooBigError
> {
  let { statusResult, repoDir } = item;

  let result: Result.ResultAsync<
    WorkingTreePayload,
    FileIsSymlinkError | FileSizeIsTooBigError
  > = Result.try({
    try: (): Promise<WorkingTreePayload> => {
      let payload: Promise<WorkingTreePayload> = getWorkingTreePayload({
        statusResult: statusResult,
        repoDir: repoDir
      });

      return payload;
    },
    catch: (error: unknown): FileIsSymlinkError | FileSizeIsTooBigError => {
      if (error instanceof ServerError) {
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

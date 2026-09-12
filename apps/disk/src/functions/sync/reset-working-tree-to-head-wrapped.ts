import { Result } from '@praha/byethrow';
import type { StatusResult } from 'simple-git';
import { ServerError } from '#common/models/server-error';
import type { DiskPathTraversalError } from '#common/zod/disk/errors/disk-path-traversal-error';
import { resetWorkingTreeToHead } from '#node-common/functions/reset-working-tree-to-head';

// Temporary bridge for an anticipated error thrown by a legacy helper.
export function resetWorkingTreeToHeadWrapped(item: {
  repoDir: string;
  statusResult?: StatusResult;
}): Result.ResultAsync<void, DiskPathTraversalError> {
  let { repoDir, statusResult } = item;

  let result: Result.ResultAsync<void, DiskPathTraversalError> = Result.try({
    try: (): Promise<void> => {
      let reset: Promise<void> = resetWorkingTreeToHead({
        repoDir: repoDir,
        statusResult: statusResult
      });

      return reset;
    },
    catch: (error: unknown): DiskPathTraversalError => {
      if (
        error instanceof ServerError &&
        error.message === 'DISK_PATH_TRAVERSAL'
      ) {
        return {
          code: 'DISK_PATH_TRAVERSAL',
          displayData: error.displayData
        };
      }

      throw error;
    }
  });

  return result;
}

import { Result } from '@praha/byethrow';
import { ServerError } from '#common/models/server-error';
import type { DiskPathTraversalError } from '#common/zod/disk/errors/disk-path-traversal-error';
import { validatePathUnderDir } from '#node-common/functions/validate-path-under-dir';

// Temporary bridge for anticipated errors thrown by legacy helpers.
export function validatePathUnderDirWrapped(item: {
  fullPath: string;
  allowedDir: string;
  displayPath?: string;
}): Result.Result<string, DiskPathTraversalError> {
  let { fullPath, allowedDir, displayPath } = item;

  let result: Result.Result<string, DiskPathTraversalError> = Result.try({
    try: (): string => {
      let resolvedPath: string = validatePathUnderDir({
        fullPath: fullPath,
        allowedDir: allowedDir,
        displayPath: displayPath
      });

      return resolvedPath;
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

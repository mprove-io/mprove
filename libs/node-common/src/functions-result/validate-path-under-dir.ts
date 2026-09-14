import path from 'node:path';
import { Result } from '@praha/byethrow';
import type { DiskPathTraversalError } from '#common/zod/disk/errors/disk-path-traversal-error';

export function validatePathUnderDir(item: {
  fullPath: string;
  allowedDir: string;
  displayPath?: string;
}): Result.Result<string, DiskPathTraversalError> {
  let { fullPath, allowedDir, displayPath } = item;

  let resolvedDir: string = path.resolve(allowedDir);
  let resolvedPath: string = path.resolve(fullPath);

  let isInsideDir: boolean =
    resolvedPath === resolvedDir ||
    resolvedPath.startsWith(`${resolvedDir}${path.sep}`);

  if (isInsideDir === false) {
    return Result.fail({
      code: 'DISK_PATH_TRAVERSAL',
      displayData:
        displayPath === undefined
          ? undefined
          : {
              path: displayPath
            }
    });
  }

  return Result.succeed(resolvedPath);
}

import { Result } from '@praha/byethrow';
import fse from 'fs-extra';
import type { DiskPathTraversalError } from '#common/zod/disk/errors/disk-path-traversal-error';
import { validatePathUnderDir } from './validate-path-under-dir';

export function removePathUnderDir(item: {
  fullPath: string;
  allowedDir: string;
  displayPath?: string;
}): Result.ResultAsync<void, DiskPathTraversalError> {
  let { fullPath, allowedDir, displayPath } = item;

  return Result.pipe(
    validatePathUnderDir({
      fullPath: fullPath,
      allowedDir: allowedDir,
      displayPath: displayPath
    }),
    Result.andThrough(async filePath => {
      await fse.remove(filePath);
      return Result.succeed();
    }),
    Result.map((): void => undefined)
  );
}

import { Result } from '@praha/byethrow';
import fse from 'fs-extra';
import type { RemovePathUnderDirError } from '#common/types/node-common/function-errors/remove-path-under-dir-error';
import type { ValidatePathUnderDirError } from '#common/types/node-common/function-errors/validate-path-under-dir-error';
import { validatePathUnderDir } from '#node-common/functions/validate-path-under-dir/validate-path-under-dir';

export async function removePathUnderDir(item: {
  fullPath: string;
  allowedDir: string;
  displayPath?: string;
}): Result.ResultAsync<void, RemovePathUnderDirError> {
  return Result.pipe(
    Result.succeed(item),
    Result.andThen(
      (v): Result.Result<string, ValidatePathUnderDirError> =>
        validatePathUnderDir({
          fullPath: v.fullPath,
          allowedDir: v.allowedDir,
          displayPath: v.displayPath
        })
    ),
    Result.andThrough(async v => {
      await fse.remove(v);
      return Result.succeed();
    }),
    Result.map((v): void => undefined)
  );
}

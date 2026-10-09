import { Result } from '@praha/byethrow';
import type { DiskProjectAlreadyExistError } from '#common/types/disk/errors/disk-project-already-exist-error';
import type { DiskCheckProjectDoesNotExistError } from '#common/types/disk/function-errors/disk-check-project-does-not-exist-error';
import { isPathExist } from '#disk/functions/disk/is-path-exist/is-path-exist';

export async function checkProjectDoesNotExist(item: {
  projectDir: string;
}): Result.ResultAsync<void, DiskCheckProjectDoesNotExistError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'isProjectExist',
      (v): Result.ResultAsync<boolean, never> =>
        isPathExist({ path: v.projectDir })
    ),
    Result.andThen(
      (v): Result.Result<void, DiskProjectAlreadyExistError> =>
        v.isProjectExist === true
          ? Result.fail({ code: 'DISK_PROJECT_ALREADY_EXIST' })
          : Result.succeed()
    )
  );
}

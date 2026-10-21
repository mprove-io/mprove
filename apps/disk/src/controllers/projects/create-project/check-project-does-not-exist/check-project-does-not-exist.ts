import { Result } from '@praha/byethrow';
import type { DiskCheckProjectDoesNotExistError } from '#common/types/disk/function-errors/disk-check-project-does-not-exist-error';
import { isPathExist } from '#disk/functions/disk/is-path-exist/is-path-exist';

export async function checkProjectDoesNotExist(item: {
  projectDir: string;
}): Result.ResultAsync<void, DiskCheckProjectDoesNotExistError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('isProjectExist', v => isPathExist({ path: v.projectDir })),
    Result.andThen(v =>
      v.isProjectExist === true
        ? Result.fail({ code: 'DISK_PROJECT_ALREADY_EXIST' })
        : Result.succeed()
    )
  );
}

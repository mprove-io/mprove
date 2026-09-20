import { Result } from '@praha/byethrow';
import type { DiskCheckProjectDoesNotExistError } from '#common/zod/disk/function-errors/disk-check-project-does-not-exist-error';
import { isPathExist } from '#disk/functions/disk/is-path-exist/is-path-exist';

export function checkProjectDoesNotExist(item: {
  projectDir: string;
}): Result.ResultAsync<void, DiskCheckProjectDoesNotExistError> {
  return Result.pipe(
    Result.succeed({ projectDir: item.projectDir }),
    Result.bind('isProjectExist', item =>
      isPathExist({ path: item.projectDir })
    ),
    Result.andThen(item =>
      item.isProjectExist === true
        ? Result.fail({ code: 'DISK_PROJECT_ALREADY_EXIST' })
        : Result.succeed()
    )
  );
}

import { Result } from '@praha/byethrow';
import type { DiskProjectAlreadyExistError } from '#common/zod/disk/errors/disk-project-already-exist-error';
import { isPathExist } from '#disk/functions/disk/is-path-exist';

export function checkProjectDoesNotExist(item: {
  projectDir: string;
}): Result.ResultAsync<void, DiskProjectAlreadyExistError> {
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

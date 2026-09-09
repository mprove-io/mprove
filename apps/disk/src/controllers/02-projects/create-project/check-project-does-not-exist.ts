import { Result } from '@praha/byethrow';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { DiskProjectAlreadyExistsError } from './errors/disk-project-already-exists-error';

export function checkProjectDoesNotExist(item: {
  projectDir: string;
}): Result.ResultAsync<void, DiskProjectAlreadyExistsError> {
  return Result.pipe(
    Result.succeed({ projectDir: item.projectDir }),
    Result.bind('isProjectExist', item =>
      isPathExist({ path: item.projectDir })
    ),
    Result.andThen(item =>
      item.isProjectExist === true
        ? Result.fail(new DiskProjectAlreadyExistsError())
        : Result.succeed()
    )
  );
}

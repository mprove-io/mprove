import { Result } from '@praha/byethrow';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { DiskProjectAlreadyExistsError } from '../errors/disk-project-already-exists-error';

export async function checkProjectDoesNotExist(item: {
  projectDir: string;
}): Result.ResultAsync<void, DiskProjectAlreadyExistsError> {
  let { projectDir } = item;

  let isProjectExist: boolean = await isPathExist(projectDir);

  if (isProjectExist === true) {
    return Result.fail(new DiskProjectAlreadyExistsError());
  } else {
    return Result.succeed();
  }
}

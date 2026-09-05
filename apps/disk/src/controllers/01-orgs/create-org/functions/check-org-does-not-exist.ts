import { Result } from '@praha/byethrow';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { DiskOrgAlreadyExistsError } from '../errors/disk-org-already-exists-error';

export async function checkOrgDoesNotExist(item: {
  orgDir: string;
}): Result.ResultAsync<void, DiskOrgAlreadyExistsError> {
  let { orgDir } = item;

  let isOrgExist: boolean = await isPathExist(orgDir);

  if (isOrgExist === true) {
    return Result.fail(new DiskOrgAlreadyExistsError());
  } else {
    return Result.succeed();
  }
}

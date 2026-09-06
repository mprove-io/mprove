import { Result } from '@praha/byethrow';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { DiskOrgAlreadyExistsError } from '../errors/disk-org-already-exists-error';

export function checkOrgDoesNotExist(item: {
  orgDir: string;
}): Result.ResultAsync<void, DiskOrgAlreadyExistsError> {
  let { orgDir } = item;

  return Result.pipe(
    Result.succeed({ orgDir: orgDir }),
    Result.bind('isOrgExist', item => isPathExist({ path: item.orgDir })),
    Result.andThen(item =>
      item.isOrgExist === true
        ? Result.fail(new DiskOrgAlreadyExistsError())
        : Result.succeed()
    )
  );
}

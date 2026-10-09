import { Result } from '@praha/byethrow';
import type { DiskOrgAlreadyExistError } from '#common/types/disk/errors/disk-org-already-exist-error';
import type { DiskCheckOrgDoesNotExistError } from '#common/types/disk/function-errors/disk-check-org-does-not-exist-error';
import { isPathExist } from '#disk/functions/disk/is-path-exist/is-path-exist';

export async function checkOrgDoesNotExist(item: {
  orgDir: string;
}): Result.ResultAsync<void, DiskCheckOrgDoesNotExistError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'isOrgExist',
      (v): Result.ResultAsync<boolean, never> => isPathExist({ path: v.orgDir })
    ),
    Result.andThen(
      (v): Result.Result<void, DiskOrgAlreadyExistError> =>
        v.isOrgExist === true
          ? Result.fail({ code: 'DISK_ORG_ALREADY_EXIST' })
          : Result.succeed()
    )
  );
}

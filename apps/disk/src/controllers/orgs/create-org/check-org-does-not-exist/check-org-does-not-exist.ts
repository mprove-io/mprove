import { Result } from '@praha/byethrow';
import type { DiskCheckOrgDoesNotExistError } from '#common/zod/disk/function-errors/disk-check-org-does-not-exist-error';
import { isPathExist } from '#disk/functions/disk/is-path-exist/is-path-exist';

export function checkOrgDoesNotExist(item: {
  orgDir: string;
}): Result.ResultAsync<void, DiskCheckOrgDoesNotExistError> {
  let { orgDir } = item;

  return Result.pipe(
    Result.succeed({ orgDir: orgDir }),
    Result.bind('isOrgExist', item => isPathExist({ path: item.orgDir })),
    Result.andThen(item =>
      item.isOrgExist === true
        ? Result.fail({ code: 'DISK_ORG_ALREADY_EXIST' })
        : Result.succeed()
    )
  );
}

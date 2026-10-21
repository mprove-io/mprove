import { Result } from '@praha/byethrow';
import type { DiskCheckOrgDoesNotExistError } from '#common/types/disk/function-errors/disk-check-org-does-not-exist-error';
import { isPathExist } from '#disk/functions/disk/is-path-exist/is-path-exist';

export async function checkOrgDoesNotExist(item: {
  orgDir: string;
}): Result.ResultAsync<void, DiskCheckOrgDoesNotExistError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('isOrgExist', v => isPathExist({ path: v.orgDir })),
    Result.andThen(v =>
      v.isOrgExist === true
        ? Result.fail({ code: 'DISK_ORG_ALREADY_EXIST' })
        : Result.succeed()
    )
  );
}

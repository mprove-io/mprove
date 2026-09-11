import { Result } from '@praha/byethrow';
import type { DiskOrgAlreadyExistError } from '#common/zod/disk/errors/disk-org-already-exist-error';
import { isPathExist } from '#disk/functions/disk/is-path-exist';

export function checkOrgDoesNotExist(item: {
  orgDir: string;
}): Result.ResultAsync<void, DiskOrgAlreadyExistError> {
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

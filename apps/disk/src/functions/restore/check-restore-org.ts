import { Result } from '@praha/byethrow';
import { ensureDir } from '#disk/functions/disk/ensure-dir';
import { isPathExist } from '#disk/functions/disk/is-path-exist';

export function checkRestoreOrg(item: {
  orgId: string;
  orgPath: string;
}): Result.ResultAsync<void, never> {
  let { orgId, orgPath } = item;

  let orgDir = `${orgPath}/${orgId}`;

  return Result.pipe(
    isPathExist({ path: orgDir }),
    Result.andThen(isOrgExist =>
      isOrgExist === false ? ensureDir({ dir: orgDir }) : Result.succeed()
    )
  );
}

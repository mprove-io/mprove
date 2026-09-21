import { Result } from '@praha/byethrow';
import { ensureDir } from '#disk/functions/disk/ensure-dir/ensure-dir';
import { isPathExist } from '#disk/functions/disk/is-path-exist/is-path-exist';

export function checkRestoreOrg(item: {
  orgId: string;
  orgPath: string;
}): Result.ResultAsync<void, never> {
  return Result.pipe(
    Result.succeed({
      ...item,
      orgDir: `${item.orgPath}/${item.orgId}`
    }),
    Result.bind(
      'isOrgExist',
      (v): Result.ResultAsync<boolean, never> => isPathExist({ path: v.orgDir })
    ),
    Result.andThen(
      async (v): Result.ResultAsync<void, never> =>
        v.isOrgExist === false ? ensureDir({ dir: v.orgDir }) : Result.succeed()
    )
  );
}

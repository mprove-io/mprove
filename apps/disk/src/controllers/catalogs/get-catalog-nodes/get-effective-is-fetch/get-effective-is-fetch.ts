import { Result } from '@praha/byethrow';
import type { DiskFileChange } from '#common/zod/disk/disk-file-change';
import type { DiskGetEffectiveIsFetchError } from '#common/zod/disk/function-errors/disk-get-effective-is-fetch-error';
import type { GetChangesToCommitError } from '#common/zod/node-common/function-errors/get-changes-to-commit-error';
import { getChangesToCommit } from '#node-common/functions/get-changes-to-commit/get-changes-to-commit';

export function getEffectiveIsFetch(item: {
  isFetch: boolean;
  repoDir: string;
}): Result.ResultMaybeAsync<boolean, DiskGetEffectiveIsFetchError> {
  if (item.isFetch === false) {
    return Result.succeed(false);
  }

  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'changesToCommit',
      (v): Result.ResultAsync<DiskFileChange[], GetChangesToCommitError> =>
        getChangesToCommit({
          repoDir: v.repoDir
        })
    ),
    Result.map((v): boolean => {
      let repoHasChanges: boolean = v.changesToCommit.length > 0;

      return repoHasChanges === true ? false : v.isFetch;
    })
  );
}

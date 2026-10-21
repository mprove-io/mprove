import { Result } from '@praha/byethrow';
import type { DiskGetEffectiveIsFetchError } from '#common/types/disk/function-errors/disk-get-effective-is-fetch-error';
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
    Result.bind('changesToCommit', v =>
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

import { Result } from '@praha/byethrow';
import type { FileIsSymlinkError } from '#common/zod/disk/errors/file-is-symlink-error';
import type { FileSizeIsTooBigError } from '#common/zod/disk/errors/file-size-is-too-big-error';
import { getChangesToCommit } from '#node-common/functions-result/get-changes-to-commit';

export function getEffectiveIsFetch(item: {
  isFetch: boolean;
  repoDir: string;
}): Result.ResultMaybeAsync<
  boolean,
  FileIsSymlinkError | FileSizeIsTooBigError
> {
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
    Result.map(v => {
      let repoHasChanges: boolean = v.changesToCommit.length > 0;

      return repoHasChanges === true ? false : v.isFetch;
    })
  );
}

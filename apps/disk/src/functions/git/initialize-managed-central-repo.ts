import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { BRANCH_MAIN } from '#common/constants/top';
import { createSimpleGit } from '#node-common/functions/create-simple-git';
import { ensureDir } from '../disk/ensure-dir';

export function initializeManagedCentralRepo(item: {
  centralDir: string;
}): Result.ResultAsync<void, never> {
  return Result.pipe(
    Result.succeed({ ...item }),
    Result.andThrough(v => ensureDir({ dir: v.centralDir })),
    Result.andThen(async v => {
      let centralGit: SimpleGit = createSimpleGit({ baseDir: v.centralDir });

      await centralGit.init(true);

      await centralGit.raw([
        'symbolic-ref',
        'HEAD',
        `refs/heads/${BRANCH_MAIN}`
      ]);

      return Result.succeed();
    })
  );
}

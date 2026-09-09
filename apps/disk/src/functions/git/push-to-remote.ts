import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';

import { addTraceSpan } from '#node-common/functions/add-trace-span';
import { DiskRepoStatusIsNotNeedPushError } from './errors/disk-repo-status-is-not-need-push-error';
import { getRepoStatus } from './get-repo-status';

export function pushToRemote(item: {
  projectId: string;
  projectDir: string;
  repoId: string;
  repoDir: string;
  branch: string;
  git: SimpleGit;
  isFetch: boolean;
}): Result.ResultAsync<void, DiskRepoStatusIsNotNeedPushError> {
  return addTraceSpan({
    spanName: 'disk.git.pushToRemote',
    fn: () =>
      Result.pipe(
        Result.succeed(item),
        Result.bind('diskItemStatus', item =>
          getRepoStatus({
            projectId: item.projectId,
            projectDir: item.projectDir,
            repoId: item.repoId,
            repoDir: item.repoDir,
            git: item.git,
            isFetch: item.isFetch,
            isCheckConflicts: false
          })
        ),
        Result.andThen(async item => {
          let { repoStatus } = item.diskItemStatus;

          if (repoStatus !== 'NeedPush') {
            return Result.fail(new DiskRepoStatusIsNotNeedPushError());
          }

          await item.git.push('origin', item.branch);

          return Result.succeed();
        })
      )
  });
}

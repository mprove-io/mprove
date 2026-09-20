import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import type { DiskPushToRemoteError } from '#common/zod/disk/function-errors/disk-push-to-remote-error';
import { getRepoStatus } from '#disk/functions/git/get-repo-status/get-repo-status';
import { addTraceSpan } from '#node-common/functions/add-trace-span';

export function pushToRemote(item: {
  projectId: string;
  projectDir: string;
  repoId: string;
  repoDir: string;
  branch: string;
  git: SimpleGit;
  isFetch: boolean;
}): Result.ResultAsync<void, DiskPushToRemoteError> {
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
            return Result.fail({ code: 'DISK_REPO_STATUS_IS_NOT_NEED_PUSH' });
          }

          await item.git.push('origin', item.branch);

          return Result.succeed();
        })
      )
  });
}

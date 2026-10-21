import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import type { DiskPushToRemoteError } from '#common/types/disk/function-errors/disk-push-to-remote-error';
import { getRepoStatus } from '#disk/functions/git/get-repo-status/get-repo-status';
import { addTraceSpan } from '#node-common/functions/add-trace-span/add-trace-span';

export async function pushToRemote(item: {
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
        Result.bind('diskItemStatus', v =>
          getRepoStatus({
            projectId: v.projectId,
            projectDir: v.projectDir,
            repoId: v.repoId,
            repoDir: v.repoDir,
            git: v.git,
            isFetch: v.isFetch,
            isCheckConflicts: false
          })
        ),
        Result.andThen(async v => {
          let { repoStatus } = v.diskItemStatus;

          if (repoStatus !== 'NeedPush') {
            return Result.fail({ code: 'DISK_REPO_STATUS_IS_NOT_NEED_PUSH' });
          }

          await v.git.push('origin', v.branch);

          return Result.succeed();
        })
      )
  });
}

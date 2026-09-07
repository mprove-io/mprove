import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';

import { RepoStatusEnum } from '#common/enums/repo-status.enum';
import { addTraceSpan } from '#node-common/functions/add-trace-span';
import { DiskRepoIsNotCleanForCheckoutBranchError } from './errors/disk-repo-is-not-clean-for-checkout-branch-error';
import { getRepoStatus } from './get-repo-status';

export function checkoutBranch(item: {
  projectId: string;
  projectDir: string;
  repoId: string;
  repoDir: string;
  branchName: string;
  git: SimpleGit;
  isFetch: boolean;
}): Result.ResultAsync<void, DiskRepoIsNotCleanForCheckoutBranchError> {
  return addTraceSpan({
    spanName: 'disk.git.checkoutBranch',
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
          let { repoStatus, currentBranch } = item.diskItemStatus;

          if (currentBranch === item.branchName) {
            return Result.succeed();
          }

          let okStatuses: RepoStatusEnum[] = [
            RepoStatusEnum.NeedPush,
            RepoStatusEnum.NeedPull,
            RepoStatusEnum.Ok
          ];

          if (okStatuses.indexOf(repoStatus) < 0) {
            return Result.fail(
              new DiskRepoIsNotCleanForCheckoutBranchError({
                displayData: {
                  currentBranch: currentBranch
                }
              })
            );
          }

          await item.git.checkout(item.branchName);

          return Result.succeed();
        })
      )
  });
}

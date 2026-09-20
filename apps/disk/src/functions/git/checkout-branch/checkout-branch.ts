import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import type { DiskCheckoutBranchError } from '#common/zod/disk/function-errors/disk-checkout-branch-error';
import type { RepoStatus } from '#common/zod/disk/repo-status';
import { getRepoStatus } from '#disk/functions/git/get-repo-status/get-repo-status';
import { addTraceSpan } from '#node-common/functions/add-trace-span';

export function checkoutBranch(item: {
  projectId: string;
  projectDir: string;
  repoId: string;
  repoDir: string;
  branchName: string;
  git: SimpleGit;
  isFetch: boolean;
}): Result.ResultAsync<void, DiskCheckoutBranchError> {
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

          let okStatuses: RepoStatus[] = ['NeedPush', 'NeedPull', 'Ok'];

          let isClean: boolean = okStatuses.includes(repoStatus);

          if (isClean === false) {
            return Result.fail({
              code: 'DISK_REPO_IS_NOT_CLEAN_FOR_CHECKOUT_BRANCH',
              displayData: { currentBranch: currentBranch }
            });
          }

          await item.git.checkout(item.branchName);

          return Result.succeed();
        })
      )
  });
}

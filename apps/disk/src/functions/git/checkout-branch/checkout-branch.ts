import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import type { DiskItemStatus } from '#common/zod/disk/disk-item-status';
import type { DiskRepoIsNotCleanForCheckoutBranchError } from '#common/zod/disk/errors/disk-repo-is-not-clean-for-checkout-branch-error';
import type { DiskCheckoutBranchError } from '#common/zod/disk/function-errors/disk-checkout-branch-error';
import type { DiskGetRepoStatusError } from '#common/zod/disk/function-errors/disk-get-repo-status-error';
import type { RepoStatus } from '#common/zod/disk/repo-status';
import { getRepoStatus } from '#disk/functions/git/get-repo-status/get-repo-status';
import { addTraceSpan } from '#node-common/functions/add-trace-span/add-trace-span';

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
        Result.bind(
          'diskItemStatus',
          (v): Result.ResultAsync<DiskItemStatus, DiskGetRepoStatusError> =>
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
        Result.andThen(
          async (
            v
          ): Result.ResultAsync<
            void,
            DiskRepoIsNotCleanForCheckoutBranchError
          > => {
            let { repoStatus, currentBranch } = v.diskItemStatus;

            if (currentBranch === v.branchName) {
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

            await v.git.checkout(v.branchName);

            return Result.succeed();
          }
        )
      )
  });
}

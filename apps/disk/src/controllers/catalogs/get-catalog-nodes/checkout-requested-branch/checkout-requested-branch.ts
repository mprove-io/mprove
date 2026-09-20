import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { isUndefined } from '#common/functions/is-undefined';
import type { DiskCheckoutRequestedBranchError } from '#common/zod/disk/function-errors/disk-checkout-requested-branch-error';
import { checkoutBranch } from '#disk/functions/git/checkout-branch/checkout-branch';
import { isLocalBranchExist } from '#disk/functions/git/is-local-branch-exist/is-local-branch-exist';

export function checkoutRequestedBranch(item: {
  branch?: string;
  projectId: string;
  projectDir: string;
  repoId: string;
  repoDir: string;
  git: SimpleGit;
  isFetch: boolean;
}): Result.ResultAsync<boolean, DiskCheckoutRequestedBranchError> {
  return Result.pipe(
    Result.succeed({ ...item }),
    Result.andThen(v => {
      if (isUndefined(v.branch)) {
        return Result.succeed(false);
      }

      return Result.pipe(
        isLocalBranchExist({
          repoDir: v.repoDir,
          localBranch: v.branch
        }),
        Result.andThen(isBranchExist => {
          if (isBranchExist === false) {
            return Result.fail({ code: 'DISK_BRANCH_IS_NOT_EXIST' });
          }

          return checkoutBranch({
            projectId: v.projectId,
            projectDir: v.projectDir,
            repoId: v.repoId,
            repoDir: v.repoDir,
            branchName: v.branch,
            git: v.git,
            isFetch: v.isFetch
          });
        }),
        Result.map(() => true)
      );
    })
  );
}

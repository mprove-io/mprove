import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { isUndefined } from '#common/functions/is-undefined';
import type { DiskBranchIsNotExistError } from '#common/zod/disk/errors/disk-branch-is-not-exist-error';
import type { DiskRepoIsNotCleanForCheckoutBranchError } from '#common/zod/disk/errors/disk-repo-is-not-clean-for-checkout-branch-error';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { isLocalBranchExist } from '#disk/functions/git/is-local-branch-exist';

export function checkoutRequestedBranch(item: {
  branch?: string;
  projectId: string;
  projectDir: string;
  repoId: string;
  repoDir: string;
  git: SimpleGit;
  isFetch: boolean;
}): Result.ResultAsync<
  boolean,
  DiskBranchIsNotExistError | DiskRepoIsNotCleanForCheckoutBranchError
> {
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

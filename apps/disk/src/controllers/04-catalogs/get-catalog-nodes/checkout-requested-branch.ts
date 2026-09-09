import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { isUndefined } from '#common/functions/is-undefined';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import type { DiskRepoIsNotCleanForCheckoutBranchError } from '#disk/functions/git/errors/disk-repo-is-not-clean-for-checkout-branch-error';
import { isLocalBranchExist } from '#disk/functions/git/is-local-branch-exist';
import { DiskBranchIsNotExistError } from './errors/disk-branch-is-not-exist-error';

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
            return Result.fail(new DiskBranchIsNotExistError());
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

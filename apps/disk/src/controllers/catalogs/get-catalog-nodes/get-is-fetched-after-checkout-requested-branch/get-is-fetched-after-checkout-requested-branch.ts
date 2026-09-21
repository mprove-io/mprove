import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import type { DiskCheckoutBranchError } from '#common/zod/disk/function-errors/disk-checkout-branch-error';
import type { DiskGetIsFetchedAfterCheckoutRequestedBranchError } from '#common/zod/disk/function-errors/disk-get-is-fetched-after-checkout-requested-branch-error';
import { checkoutBranch } from '#disk/functions/git/checkout-branch/checkout-branch';
import { isLocalBranchExist } from '#disk/functions/git/is-local-branch-exist/is-local-branch-exist';

export function getIsFetchedAfterCheckoutRequestedBranch(item: {
  branch: string;
  projectId: string;
  projectDir: string;
  repoId: string;
  repoDir: string;
  git: SimpleGit;
  isFetch: boolean;
}): Result.ResultAsync<
  boolean,
  DiskGetIsFetchedAfterCheckoutRequestedBranchError
> {
  return Result.pipe(
    Result.succeed(item),
    Result.andThrough(async v => {
      let isBranchExist: boolean = await Result.unwrap(
        isLocalBranchExist({
          repoDir: v.repoDir,
          localBranch: v.branch
        })
      );

      return isBranchExist === false
        ? Result.fail({ code: 'DISK_BRANCH_IS_NOT_EXIST' })
        : Result.succeed();
    }),
    Result.andThrough(
      (v): Result.ResultAsync<void, DiskCheckoutBranchError> =>
        checkoutBranch({
          projectId: v.projectId,
          projectDir: v.projectDir,
          repoId: v.repoId,
          repoDir: v.repoDir,
          branchName: v.branch,
          git: v.git,
          isFetch: v.isFetch
        })
    ),
    Result.map((v): boolean => v.isFetch)
  );
}

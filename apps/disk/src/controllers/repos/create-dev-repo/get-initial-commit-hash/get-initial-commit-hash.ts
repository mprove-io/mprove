import { Result } from '@praha/byethrow';
import type { LogResult, SimpleGit } from 'simple-git';
import type { DiskCheckoutBranchError } from '#common/zod/disk/function-errors/disk-checkout-branch-error';
import type { DiskGetInitialCommitHashError } from '#common/zod/disk/function-errors/disk-get-initial-commit-hash-error';
import { checkoutBranch } from '#disk/functions/git/checkout-branch/checkout-branch';

export async function getInitialCommitHash(item: {
  initialBranch?: string;
  sessionBranch?: string;
  projectId: string;
  projectDir: string;
  devRepoId: string;
  devRepoDir: string;
  devGit: SimpleGit;
}): Result.ResultAsync<string | undefined, DiskGetInitialCommitHashError> {
  if (!item.initialBranch) {
    return Result.succeed(undefined);
  }

  return Result.pipe(
    Result.succeed(item),
    Result.andThrough(
      (v): Result.ResultAsync<void, DiskCheckoutBranchError> =>
        checkoutBranch({
          projectId: v.projectId,
          projectDir: v.projectDir,
          repoId: v.devRepoId,
          repoDir: v.devRepoDir,
          branchName: v.initialBranch,
          git: v.devGit,
          isFetch: false
        })
    ),
    Result.andThen(async (v): Result.ResultAsync<string | undefined, never> => {
      let logResult: LogResult = await v.devGit.log({ n: 1 });

      let initialCommitHash: string | undefined =
        logResult.latest?.hash?.substring(0, 7);

      if (v.sessionBranch) {
        await v.devGit.checkout(['-b', v.sessionBranch]);
      }

      return Result.succeed(initialCommitHash);
    })
  );
}

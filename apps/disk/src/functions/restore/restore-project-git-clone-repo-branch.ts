import { Result } from '@praha/byethrow';
import type { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { isUndefined } from '#common/functions/is-undefined';
import type { DiskRepoIsNotCleanForCheckoutBranchError } from '#common/zod/disk/errors/disk-repo-is-not-clean-for-checkout-branch-error';
import type { ProjectLt } from '#common/zod/st-lt';
import { checkoutBranch } from '#disk/functions/git/checkout-branch';
import { createBranch } from '#disk/functions/git/create-branch';
import { createGit } from '#disk/functions/git/create-git';
import { isLocalBranchExist } from '#disk/functions/git/is-local-branch-exist';
import { isRemoteBranchExist } from '#disk/functions/git/is-remote-branch-exist';

export function restoreProjectGitCloneRepoBranch(item: {
  remoteType: ProjectRemoteTypeEnum.GitClone;
  projectId: string;
  projectDir: string;
  projectLt: ProjectLt;
  repoId: string;
  repoDir: string;
  branchId: string;
  keyDir: string;
}): Result.ResultAsync<string, DiskRepoIsNotCleanForCheckoutBranchError> {
  return Result.pipe(
    Result.succeed({ ...item }),
    Result.bind('isLocalBranchExist', v =>
      isLocalBranchExist({
        repoDir: v.repoDir,
        localBranch: v.branchId
      })
    ),
    Result.bind('repoGit', v =>
      v.isLocalBranchExist === true
        ? Result.succeed(undefined)
        : createGit({
            repoDir: v.repoDir,
            remoteType: v.remoteType,
            keyDir: v.keyDir,
            gitUrl: v.projectLt.gitUrl,
            privateKeyEncrypted: v.projectLt.privateKeyEncrypted,
            publicKey: v.projectLt.publicKey,
            passPhrase: v.projectLt.passPhrase
          })
    ),
    Result.andThrough(v =>
      isUndefined(v.repoGit)
        ? Result.succeed()
        : checkoutBranch({
            projectId: v.projectId,
            projectDir: v.projectDir,
            repoId: v.repoId,
            repoDir: v.repoDir,
            branchName: v.projectLt.defaultBranch,
            git: v.repoGit,
            isFetch: false
          })
    ),
    Result.bind('isRemoteBranchExist', v =>
      isUndefined(v.repoGit)
        ? Result.succeed(false)
        : isRemoteBranchExist({
            repoDir: v.repoDir,
            remoteBranch: v.branchId,
            git: v.repoGit,
            isFetch: true
          })
    ),
    Result.andThrough(v =>
      isUndefined(v.repoGit)
        ? Result.succeed()
        : createBranch({
            repoDir: v.repoDir,
            fromBranch:
              v.isRemoteBranchExist === true
                ? `origin/${v.branchId}`
                : `origin/${v.projectLt.defaultBranch}`,
            newBranch: v.branchId,
            git: v.repoGit
          })
    ),
    Result.andThen(v => Result.succeed(v.keyDir))
  );
}

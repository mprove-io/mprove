import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { PROD_REPO_ID } from '#common/constants/top';
import { deleteLocalBranch } from '#disk/functions/git/delete-local-branch';
import { deleteRemoteBranch } from '#disk/functions/git/delete-remote-branch';
import { isLocalBranchExist } from '#disk/functions/git/is-local-branch-exist';
import { isRemoteBranchExist } from '#disk/functions/git/is-remote-branch-exist';
import { DiskBranchIsNotExistError } from './errors/disk-branch-is-not-exist-error';

export function deleteBranchFromRepositories(item: {
  projectDir: string;
  repoId: string;
  repoDir: string;
  branch: string;
  git: SimpleGit;
}): Result.ResultAsync<void, DiskBranchIsNotExistError> {
  return Result.pipe(
    Result.succeed({ ...item }),
    Result.bind('isRemoteBranchExist', v =>
      v.repoId === PROD_REPO_ID
        ? isRemoteBranchExist({
            repoDir: v.repoDir,
            remoteBranch: v.branch,
            git: v.git,
            isFetch: true
          })
        : Result.succeed(false)
    ),
    Result.andThrough(v =>
      v.isRemoteBranchExist === true
        ? deleteRemoteBranch({
            projectDir: v.projectDir,
            branch: v.branch,
            git: v.git
          })
        : Result.succeed()
    ),
    Result.bind('isLocalBranchExist', v =>
      isLocalBranchExist({
        repoDir: v.repoDir,
        localBranch: v.branch
      })
    ),
    Result.andThen(v => {
      if (v.isLocalBranchExist === true) {
        return deleteLocalBranch({
          repoDir: v.repoDir,
          branch: v.branch
        });
      }

      return v.isRemoteBranchExist === true
        ? Result.succeed()
        : Result.fail(new DiskBranchIsNotExistError());
    })
  );
}

import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { RepoStatusEnum } from '#common/enums/repo-status.enum';
import type { DiskFileChange } from '#common/zod/disk/disk-file-change';
import type { DiskFileLine } from '#common/zod/disk/disk-file-line';
import type { DiskItemStatus } from '#common/zod/disk/disk-item-status';
import { isRemoteBranchExist } from './is-remote-branch-exist';

export function getRepoStatusWithoutStagedChanges(item: {
  currentBranchName: string;
  changesToCommit: DiskFileChange[];
  changesToPush: DiskFileChange[];
  conflicts: DiskFileLine[];
  repoDir: string;
  git: SimpleGit;
  isFetch: boolean;
}): Result.ResultAsync<DiskItemStatus, never> {
  return Result.pipe(
    Result.succeed({ ...item }),
    Result.bind('isBranchExistRemote', v =>
      isRemoteBranchExist({
        repoDir: v.repoDir,
        remoteBranch: v.currentBranchName,
        git: v.git,
        isFetch: v.isFetch
      })
    ),
    Result.andThen(async v => {
      // RETURN NeedPush
      if (v.isBranchExistRemote === false) {
        return Result.succeed({
          repoStatus: RepoStatusEnum.NeedPush,
          conflicts: v.conflicts,
          currentBranch: v.currentBranchName,
          changesToCommit: v.changesToCommit,
          changesToPush: v.changesToPush
        });
      }

      let localCommitId = await v.git.revparse([
        `refs/heads/${v.currentBranchName}`
      ]);

      localCommitId = localCommitId.trim();

      let remoteOriginCommitId = await v.git.revparse([
        `refs/remotes/origin/${v.currentBranchName}`
      ]);

      remoteOriginCommitId = remoteOriginCommitId.trim();

      let baseCommitResult = await v.git.raw([
        'merge-base',
        localCommitId,
        remoteOriginCommitId
      ]);

      let baseCommitId = baseCommitResult.trim();

      // RETURN Ok
      if (localCommitId === remoteOriginCommitId) {
        return Result.succeed({
          repoStatus: RepoStatusEnum.Ok,
          conflicts: v.conflicts,
          currentBranch: v.currentBranchName,
          changesToCommit: v.changesToCommit,
          changesToPush: v.changesToPush
        });
      }

      // RETURN NeedPull
      if (localCommitId === baseCommitId) {
        return Result.succeed({
          repoStatus: RepoStatusEnum.NeedPull,
          conflicts: v.conflicts,
          currentBranch: v.currentBranchName,
          changesToCommit: v.changesToCommit,
          changesToPush: v.changesToPush
        });
      }

      // RETURN NeedPush
      if (remoteOriginCommitId === baseCommitId) {
        return Result.succeed({
          repoStatus: RepoStatusEnum.NeedPush,
          conflicts: v.conflicts,
          currentBranch: v.currentBranchName,
          changesToCommit: v.changesToCommit,
          changesToPush: v.changesToPush
        });
      }

      // RETURN NeedPull because the branches diverged.
      return Result.succeed({
        repoStatus: RepoStatusEnum.NeedPull,
        conflicts: v.conflicts,
        currentBranch: v.currentBranchName,
        changesToCommit: v.changesToCommit,
        changesToPush: v.changesToPush
      });
    })
  );
}

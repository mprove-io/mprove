import { Result } from '@praha/byethrow';
import type { DiffResult, SimpleGit } from 'simple-git';
import { encodeFilePath } from '#common/functions/encode-file-path';
import type { DiskFileChange } from '#common/zod/disk/disk-file-change';
import type { DiskFileLine } from '#common/zod/disk/disk-file-line';
import type { DiskItemStatus } from '#common/zod/disk/disk-item-status';
import type { FileStatus } from '#common/zod/disk/file-status';
import type { RepoError } from '#common/zod/disk/repo-error';
import type { RepoStatus } from '#common/zod/disk/repo-status';
import { isRemoteBranchExist } from './is-remote-branch-exist';

export function getRepoStatusWithoutStagedChanges(item: {
  currentBranchName: string;
  changesToCommit: DiskFileChange[];
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
        return Result.succeed<DiskItemStatus>({
          repoStatus: 'NeedPush',
          conflicts: v.conflicts,
          currentBranch: v.currentBranchName,
          changesToCommit: v.changesToCommit,
          changesToPush: []
        });
      }

      let localCommitId: string = await v.git.revparse([
        `refs/heads/${v.currentBranchName}`
      ]);

      localCommitId = localCommitId.trim();

      let remoteOriginCommitId: string = await v.git.revparse([
        `refs/remotes/origin/${v.currentBranchName}`
      ]);

      remoteOriginCommitId = remoteOriginCommitId.trim();

      // RETURN Ok
      if (localCommitId === remoteOriginCommitId) {
        return Result.succeed<DiskItemStatus>({
          repoStatus: 'Ok',
          conflicts: v.conflicts,
          currentBranch: v.currentBranchName,
          changesToCommit: v.changesToCommit,
          changesToPush: []
        });
      }

      let baseCommitResult: string = await v.git.raw([
        'merge-base',
        localCommitId,
        remoteOriginCommitId
      ]);

      let baseCommitId: string = baseCommitResult.trim();

      // simple-git resolves merge-base exit 1 with empty stderr as ''.
      if (baseCommitId === '') {
        return Result.succeed<DiskItemStatus>({
          repoStatus: 'NeedPull',
          repoError: 'NoCommonAncestor',
          conflicts: v.conflicts,
          currentBranch: v.currentBranchName,
          changesToCommit: v.changesToCommit,
          changesToPush: []
        });
      }

      let repoStatus: RepoStatus =
        remoteOriginCommitId === baseCommitId ? 'NeedPush' : 'NeedPull';

      let changesToPush: DiskFileChange[] = [];

      let repoError: RepoError;

      if (v.changesToCommit.length === 0 && baseCommitId !== localCommitId) {
        let diffFiles: DiffResult['files'] = [];

        try {
          let diffSummary: DiffResult = await v.git.diffSummary([
            baseCommitId,
            localCommitId
          ]);

          diffFiles = diffSummary.files;
        } catch {
          repoError = 'ChangesToPushNotCalculated';
        }

        changesToPush = diffFiles.map(file => {
          let filePath: string = file.file;

          let filePathArray: string[] = filePath.split('/');

          let fileId: string = encodeFilePath({ filePath: filePath });

          let fileName: string = filePathArray.slice(-1)[0];

          let fileParentPath: string =
            filePathArray.length === 1
              ? ''
              : filePathArray.slice(0, -1).join('/');

          let status: FileStatus;

          if (
            (file as any).insertions > 0 &&
            (file as any).deletions === 0 &&
            (file as any).binary === false
          ) {
            status = 'New';
          } else if (
            (file as any).insertions === 0 &&
            (file as any).deletions > 0
          ) {
            status = 'Deleted';
          } else {
            status = 'Modified';
          }

          return {
            fileName: fileName,
            fileId: fileId,
            parentPath: fileParentPath,
            status: status
          };
        });
      }

      return Result.succeed({
        repoStatus: repoStatus,
        repoError: repoError,
        conflicts: v.conflicts,
        currentBranch: v.currentBranchName,
        changesToCommit: v.changesToCommit,
        changesToPush: changesToPush
      });
    })
  );
}

import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { FileStatusEnum } from '#common/enums/file-status.enum';
import { RepoStatusEnum } from '#common/enums/repo-status.enum';
import { encodeFilePath } from '#common/functions/encode-file-path';
import type { DiskFileChange } from '#common/zod/disk/disk-file-change';
import type { DiskItemStatus } from '#common/zod/disk/disk-item-status';
import { addTraceSpan } from '#node-common/functions/add-trace-span';
import { getChangesToCommit } from '#node-common/functions/get-changes-to-commit';
import { getRepoConflicts } from './get-repo-conflicts';
import { getRepoStatusWithoutStagedChanges } from './get-repo-status-without-staged-changes';

export function getRepoStatus(item: {
  projectId: string;
  repoId: string;
  projectDir: string;
  repoDir: string;
  git: SimpleGit;
  isFetch: boolean;
  isCheckConflicts: boolean;
  addContent?: boolean;
  expandRenamed?: boolean;
}): Result.ResultAsync<DiskItemStatus, never> {
  return addTraceSpan({
    spanName: 'disk.git.getRepoStatus',
    fn: async () => {
      // priorities order:
      // NeedSave (frontend only)
      // NeedStage (no need because auto add file after each save)
      // NeedCommit
      // NeedPull
      // NeedPush
      // Ok

      let git = item.git;

      let changesToCommit: DiskFileChange[] = await getChangesToCommit({
        repoDir: item.repoDir,
        addContent: item.addContent,
        expandRenamed: item.expandRenamed
      });

      let branchSummary = await git.branch();
      let currentBranchName = branchSummary.current;

      let logResult = await git.log(['-1']);
      let headCommitSha = logResult.latest?.hash;

      //

      let changesToPush: DiskFileChange[] = [];

      if (changesToCommit.length === 0) {
        let remoteBranches = await git.branch(['-r']);
        let remoteBranchExists = remoteBranches.all.includes(
          `origin/${currentBranchName}`
        );

        if (remoteBranchExists) {
          let remoteCommitSha = await git.revparse([
            `origin/${currentBranchName}`
          ]);

          try {
            let mergeBaseResult = await git.raw([
              'merge-base',
              headCommitSha,
              remoteCommitSha.trim()
            ]);
            let commonAncestorSha = mergeBaseResult.trim();

            if (commonAncestorSha !== headCommitSha) {
              let diffSummary = await git.diffSummary([
                commonAncestorSha,
                headCommitSha
              ]);

              changesToPush = diffSummary.files.map(file => {
                let filePath = file.file;
                let filePathArray = filePath.split('/');

                let fileId = encodeFilePath({ filePath: filePath });

                let fileName = filePathArray.slice(-1)[0];

                let fileParentPath =
                  filePathArray.length === 1
                    ? ''
                    : filePathArray.slice(0, -1).join('/');

                let status: FileStatusEnum;
                if (
                  (file as any).insertions > 0 &&
                  (file as any).deletions === 0 &&
                  (file as any).binary === false
                ) {
                  status = FileStatusEnum.New;
                } else if (
                  (file as any).insertions === 0 &&
                  (file as any).deletions > 0
                ) {
                  status = FileStatusEnum.Deleted;
                } else {
                  status = FileStatusEnum.Modified;
                }

                return {
                  fileName: fileName,
                  fileId: fileId,
                  parentPath: fileParentPath,
                  status: status
                };
              });
            }
          } catch (e) {
            // merge-base can fail if commits have no common ancestor
          }
        }
      }
      //

      // Use git diff --cached to detect ALL staged changes including deletions
      // (statusResult.staged doesn't reliably include staged deletions)
      let stagedDiff = await git.diffSummary(['--cached']);
      let stagedFilesCount = stagedDiff.files.length;

      return Result.pipe(
        Result.succeed({
          ...item,
          currentBranchName: currentBranchName,
          changesToCommit: changesToCommit,
          changesToPush: changesToPush,
          stagedFilesCount: stagedFilesCount
        }),
        Result.bind('conflicts', v =>
          getRepoConflicts({
            projectId: v.projectId,
            projectDir: v.projectDir,
            repoId: v.repoId,
            isCheckConflicts: v.isCheckConflicts
          })
        ),
        Result.andThen(v => {
          // RETURN NeedCommit
          if (v.stagedFilesCount > 0) {
            return Result.succeed({
              repoStatus: RepoStatusEnum.NeedCommit,
              conflicts: v.conflicts,
              currentBranch: v.currentBranchName,
              changesToCommit: v.changesToCommit,
              changesToPush: v.changesToPush
            });
          }

          return getRepoStatusWithoutStagedChanges({
            git: git,
            currentBranchName: v.currentBranchName,
            changesToCommit: v.changesToCommit,
            changesToPush: v.changesToPush,
            conflicts: v.conflicts,
            repoDir: v.repoDir,
            isFetch: v.isFetch
          });
        })
      );
    }
  });
}

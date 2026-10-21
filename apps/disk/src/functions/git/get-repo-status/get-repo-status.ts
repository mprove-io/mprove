import { Result } from '@praha/byethrow';
import type { BranchSummary, DiffResult, SimpleGit } from 'simple-git';
import type { DiskGetRepoStatusError } from '#common/types/disk/function-errors/disk-get-repo-status-error';
import type { DiskItemStatus } from '#common/types/disk/parts/repo/disk-item-status';
import { getRepoConflicts } from '#disk/functions/git/get-repo-status/get-repo-conflicts/get-repo-conflicts';
import { getRepoStatusWithoutStagedChanges } from '#disk/functions/git/get-repo-status/get-repo-status-without-staged-changes/get-repo-status-without-staged-changes';
import { addTraceSpan } from '#node-common/functions/add-trace-span/add-trace-span';
import { getChangesToCommit } from '#node-common/functions/get-changes-to-commit/get-changes-to-commit';

export async function getRepoStatus(item: {
  projectId: string;
  repoId: string;
  projectDir: string;
  repoDir: string;
  git: SimpleGit;
  isFetch: boolean;
  isCheckConflicts: boolean;
  addContent?: boolean;
  expandRenamed?: boolean;
}): Result.ResultAsync<DiskItemStatus, DiskGetRepoStatusError> {
  return addTraceSpan({
    spanName: 'disk.git.getRepoStatus',
    fn: () => {
      // priorities order:
      // NeedSave (frontend only)
      // NeedStage (no need because auto add file after each save)
      // NeedCommit
      // NeedPull
      // NeedPush
      // Ok

      return Result.pipe(
        Result.succeed(item),
        Result.bind('changesToCommit', v =>
          getChangesToCommit({
            repoDir: v.repoDir,
            addContent: v.addContent,
            expandRenamed: v.expandRenamed
          })
        ),
        Result.bind('currentBranchName', async v => {
          let branchSummary: BranchSummary = await v.git.branch();
          return Result.succeed(branchSummary.current);
        }),
        Result.bind('stagedFilesCount', async v => {
          // Use git diff --cached to detect ALL staged changes including deletions
          // (statusResult.staged doesn't reliably include staged deletions)
          let stagedDiff: DiffResult = await v.git.diffSummary(['--cached']);
          return Result.succeed(stagedDiff.files.length);
        }),
        Result.bind('conflicts', async v =>
          getRepoConflicts({
            projectId: v.projectId,
            projectDir: v.projectDir,
            repoId: v.repoId,
            isCheckConflicts: v.isCheckConflicts
          })
        ),
        Result.andThen(async v => {
          if (v.stagedFilesCount > 0) {
            let diskItemStatus: DiskItemStatus = {
              repoStatus: 'NeedCommit',
              conflicts: v.conflicts,
              currentBranch: v.currentBranchName,
              changesToCommit: v.changesToCommit,
              changesToPush: []
            };

            return Result.succeed(diskItemStatus);
          }

          return getRepoStatusWithoutStagedChanges({
            git: v.git,
            currentBranchName: v.currentBranchName,
            changesToCommit: v.changesToCommit,
            conflicts: v.conflicts,
            repoDir: v.repoDir,
            isFetch: v.isFetch
          });
        })
      );
    }
  });
}

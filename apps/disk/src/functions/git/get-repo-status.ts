import { Result } from '@praha/byethrow';
import type { BranchSummary, DiffResult, SimpleGit } from 'simple-git';
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

      let git: SimpleGit = item.git;

      let changesToCommit: DiskFileChange[] = await getChangesToCommit({
        repoDir: item.repoDir,
        addContent: item.addContent,
        expandRenamed: item.expandRenamed
      });

      let branchSummary: BranchSummary = await git.branch();

      let currentBranchName: string = branchSummary.current;

      // Use git diff --cached to detect ALL staged changes including deletions
      // (statusResult.staged doesn't reliably include staged deletions)
      let stagedDiff: DiffResult = await git.diffSummary(['--cached']);

      let stagedFilesCount: number = stagedDiff.files.length;

      return Result.pipe(
        Result.succeed({
          ...item,
          currentBranchName: currentBranchName,
          changesToCommit: changesToCommit,
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
            return Result.succeed<DiskItemStatus>({
              repoStatus: 'NeedCommit',
              conflicts: v.conflicts,
              currentBranch: v.currentBranchName,
              changesToCommit: v.changesToCommit,
              changesToPush: []
            });
          }

          return getRepoStatusWithoutStagedChanges({
            git: git,
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

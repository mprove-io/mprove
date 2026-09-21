import { Result } from '@praha/byethrow';
import type { BranchSummary, DiffResult, SimpleGit } from 'simple-git';
import type { DiskFileChange } from '#common/zod/disk/disk-file-change';
import type { DiskFileLine } from '#common/zod/disk/disk-file-line';
import type { DiskItemStatus } from '#common/zod/disk/disk-item-status';
import type { DiskGetRepoConflictsError } from '#common/zod/disk/function-errors/disk-get-repo-conflicts-error';
import type { DiskGetRepoStatusError } from '#common/zod/disk/function-errors/disk-get-repo-status-error';
import type { GetChangesToCommitError } from '#common/zod/node-common/function-errors/get-changes-to-commit-error';
import { getRepoConflicts } from '#disk/functions/git/get-repo-status/get-repo-conflicts/get-repo-conflicts';
import { getRepoStatusWithoutStagedChanges } from '#disk/functions/git/get-repo-status/get-repo-status-without-staged-changes/get-repo-status-without-staged-changes';
import { addTraceSpan } from '#node-common/functions/add-trace-span';
import { getChangesToCommit } from '#node-common/functions-result/get-changes-to-commit';

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
        Result.bind(
          'changesToCommit',
          (v): Result.ResultAsync<DiskFileChange[], GetChangesToCommitError> =>
            getChangesToCommit({
              repoDir: v.repoDir,
              addContent: v.addContent,
              expandRenamed: v.expandRenamed
            })
        ),
        Result.bind(
          'currentBranchName',
          async (v): Result.ResultAsync<string, never> => {
            let branchSummary: BranchSummary = await v.git.branch();
            return Result.succeed(branchSummary.current);
          }
        ),
        Result.bind(
          'stagedFilesCount',
          async (v): Result.ResultAsync<number, never> => {
            // Use git diff --cached to detect ALL staged changes including deletions
            // (statusResult.staged doesn't reliably include staged deletions)
            let stagedDiff: DiffResult = await v.git.diffSummary(['--cached']);
            return Result.succeed(stagedDiff.files.length);
          }
        ),
        Result.bind(
          'conflicts',
          async (
            v
          ): Result.ResultAsync<DiskFileLine[], DiskGetRepoConflictsError> =>
            getRepoConflicts({
              projectId: v.projectId,
              projectDir: v.projectDir,
              repoId: v.repoId,
              isCheckConflicts: v.isCheckConflicts
            })
        ),
        Result.andThen(async (v): Result.ResultAsync<DiskItemStatus, never> => {
          // RETURN NeedCommit
          if (v.stagedFilesCount > 0) {
            return Result.succeed({
              repoStatus: 'NeedCommit',
              conflicts: v.conflicts,
              currentBranch: v.currentBranchName,
              changesToCommit: v.changesToCommit,
              changesToPush: []
            });
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

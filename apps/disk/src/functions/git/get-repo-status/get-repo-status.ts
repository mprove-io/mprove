import { Result } from '@praha/byethrow';
import type { BranchSummary, DiffResult, SimpleGit } from 'simple-git';
import type { DiskItemStatus } from '#common/zod/disk/disk-item-status';
import type { FileIsSymlinkError } from '#common/zod/disk/errors/file-is-symlink-error';
import type { FileSizeIsTooBigError } from '#common/zod/disk/errors/file-size-is-too-big-error';
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
}): Result.ResultAsync<
  DiskItemStatus,
  FileIsSymlinkError | FileSizeIsTooBigError
> {
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

      let git: SimpleGit = item.git;

      return Result.pipe(
        Result.succeed(item),
        Result.bind('changesToCommit', v =>
          getChangesToCommit({
            repoDir: v.repoDir,
            addContent: v.addContent,
            expandRenamed: v.expandRenamed
          })
        ),
        Result.andThen(async v => {
          let branchSummary: BranchSummary = await git.branch();

          let currentBranchName: string = branchSummary.current;

          // Use git diff --cached to detect ALL staged changes including deletions
          // (statusResult.staged doesn't reliably include staged deletions)
          let stagedDiff: DiffResult = await git.diffSummary(['--cached']);

          let stagedFilesCount: number = stagedDiff.files.length;

          return Result.succeed({
            ...v,
            currentBranchName: currentBranchName,
            stagedFilesCount: stagedFilesCount
          });
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

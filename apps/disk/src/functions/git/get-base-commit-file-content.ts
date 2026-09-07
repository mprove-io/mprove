import { Result } from '@praha/byethrow';
import { addTraceSpan } from '#node-common/functions/add-trace-span';
import { createSimpleGit } from '#node-common/functions/create-simple-git';

export function getBaseCommitFileContent(item: {
  repoDir: string;
  filePathRelative: string;
}): Result.ResultAsync<string, never> {
  return addTraceSpan({
    spanName: 'disk.git.getBaseCommitFileContent',
    fn: async () => {
      let git = createSimpleGit({ baseDir: item.repoDir });

      let branchSummary = await git.branch();
      let currentBranchName = branchSummary.current;

      let remoteBranches = await git.branch(['-r']);
      let remoteBranchExists = remoteBranches.all.includes(
        `origin/${currentBranchName}`
      );

      if (!remoteBranchExists) {
        return Result.succeed('');
      }

      try {
        let mergeBaseResult = await git.raw([
          'merge-base',
          'HEAD',
          `origin/${currentBranchName}`
        ]);
        let baseCommitSha = mergeBaseResult.trim();

        let content = await git.show([
          `${baseCommitSha}:${item.filePathRelative}`
        ]);

        return Result.succeed(content);
      } catch (e: any) {
        if (
          e?.message?.includes('does not exist') ||
          e?.message?.includes('path') ||
          e?.message?.includes('exists on disk, but not in')
        ) {
          return Result.succeed('');
        }
        throw e;
      }
    }
  });
}

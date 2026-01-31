import { simpleGit } from 'simple-git';
import { addTraceSpan } from '#node-common/functions/add-trace-span';

export async function getBaseCommitFileContent(item: {
  repoDir: string;
  filePathRelative: string;
}): Promise<string> {
  return await addTraceSpan({
    spanName: 'disk.git.getBaseCommitFileContent',
    fn: async () => {
      let git = simpleGit({ baseDir: item.repoDir });

      let branchSummary = await git.branch();
      let currentBranchName = branchSummary.current;

      let remoteBranches = await git.branch(['-r']);
      let remoteBranchExists = remoteBranches.all.includes(
        `origin/${currentBranchName}`
      );

      if (!remoteBranchExists) {
        return '';
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
        return content;
      } catch (e: any) {
        if (
          e?.message?.includes('does not exist') ||
          e?.message?.includes('path') ||
          e?.message?.includes('exists on disk, but not in')
        ) {
          return '';
        }
        throw e;
      }
    }
  });
}

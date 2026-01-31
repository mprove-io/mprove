import { SimpleGit } from 'simple-git';
import { addTraceSpan } from '#node-common/functions/add-trace-span';

export async function isRemoteBranchExist(item: {
  repoDir: string;
  remoteBranch: string;
  git: SimpleGit;
  isFetch: boolean;
}): Promise<boolean> {
  let { remoteBranch, git, isFetch } = item;

  return await addTraceSpan({
    spanName: 'disk.git.isRemoteBranchExist',
    fn: async () => {
      if (isFetch === true) {
        await addTraceSpan({
          spanName: 'disk.git.isRemoteBranchExist.git.fetch',
          fn: () => git.fetch('origin', ['--prune'])
        });
      }

      let branchSummary = await git.branch(['-r']);

      return branchSummary.all.includes(`origin/${remoteBranch}`);
    }
  });
}

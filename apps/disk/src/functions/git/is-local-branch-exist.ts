import { addTraceSpan } from '#node-common/functions/add-trace-span';
import { createSimpleGit } from '#node-common/functions/create-simple-git';

export async function isLocalBranchExist(item: {
  repoDir: string;
  localBranch: string;
}): Promise<boolean> {
  return await addTraceSpan({
    spanName: 'disk.git.isLocalBranchExist',
    fn: async () => {
      let git = createSimpleGit({ baseDir: item.repoDir });

      let branchSummary = await git.branchLocal();

      return branchSummary.all.includes(item.localBranch);
    }
  });
}

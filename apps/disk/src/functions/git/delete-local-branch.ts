import { addTraceSpan } from '#node-common/functions/add-trace-span';
import { createSimpleGit } from '#node-common/functions/create-simple-git';

export async function deleteLocalBranch(item: {
  repoDir: string;
  branch: string;
}) {
  return await addTraceSpan({
    spanName: 'disk.git.deleteLocalBranch',
    fn: async () => {
      let git = createSimpleGit({ baseDir: item.repoDir });

      await git.deleteLocalBranch(item.branch, true);
    }
  });
}

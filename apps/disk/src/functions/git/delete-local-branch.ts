import { simpleGit } from 'simple-git';
import { addTraceSpan } from '#node-common/functions/add-trace-span';

export async function deleteLocalBranch(item: {
  repoDir: string;
  branch: string;
}) {
  return await addTraceSpan({
    spanName: 'disk.git.deleteLocalBranch',
    fn: async () => {
      let git = simpleGit({ baseDir: item.repoDir });

      await git.deleteLocalBranch(item.branch, true);
    }
  });
}

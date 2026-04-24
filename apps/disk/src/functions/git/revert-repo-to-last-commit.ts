import { addTraceSpan } from '#node-common/functions/add-trace-span';
import { createSimpleGit } from '#node-common/functions/create-simple-git';

export async function revertRepoToLastCommit(item: { repoDir: string }) {
  return await addTraceSpan({
    spanName: 'disk.git.revertRepoToLastCommit',
    fn: async () => {
      let git = createSimpleGit({ baseDir: item.repoDir });

      await git.reset(['--hard', 'HEAD']);
    }
  });
}

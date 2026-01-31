import { simpleGit } from 'simple-git';
import { addTraceSpan } from '#node-common/functions/add-trace-span';

export async function revertRepoToLastCommit(item: { repoDir: string }) {
  return await addTraceSpan({
    spanName: 'disk.git.revertRepoToLastCommit',
    fn: async () => {
      let git = simpleGit({ baseDir: item.repoDir });

      await git.reset(['--hard', 'HEAD']);
    }
  });
}

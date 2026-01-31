import { simpleGit } from 'simple-git';
import { addTraceSpan } from '#node-common/functions/add-trace-span';

export async function revertRepoToRemote(item: {
  repoDir: string;
  remoteBranch: string;
}) {
  return await addTraceSpan({
    spanName: 'disk.git.revertRepoToRemote',
    fn: async () => {
      let git = simpleGit({ baseDir: item.repoDir });

      await git.reset(['--hard', `origin/${item.remoteBranch}`]);
    }
  });
}

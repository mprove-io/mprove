import { SimpleGit } from 'simple-git';
import { addTraceSpan } from '#node-common/functions/add-trace-span';

export async function revertRepoToRemote(item: {
  repoDir: string;
  remoteBranch: string;
  git: SimpleGit;
}) {
  return await addTraceSpan({
    spanName: 'disk.git.revertRepoToRemote',
    fn: async () => {
      await item.git.reset(['--hard', `origin/${item.remoteBranch}`]);
    }
  });
}

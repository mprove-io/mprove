import { SimpleGit } from 'simple-git';
import { addTraceSpan } from '#node-common/functions/add-trace-span';

export async function createBranch(item: {
  repoDir: string;
  fromBranch: string;
  newBranch: string;
  git: SimpleGit;
}) {
  return await addTraceSpan({
    spanName: 'disk.git.createBranch',
    fn: async () => {
      let git = item.git;

      await addTraceSpan({
        spanName: 'disk.git.createBranch.git.fetch',
        fn: () => git.fetch('origin', ['--prune'])
      });

      await git.branch([item.newBranch, item.fromBranch]);
    }
  });
}

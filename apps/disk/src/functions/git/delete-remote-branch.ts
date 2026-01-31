import { SimpleGit } from 'simple-git';
import { addTraceSpan } from '#node-common/functions/add-trace-span';

export async function deleteRemoteBranch(item: {
  projectDir: string;
  branch: string;
  git: SimpleGit;
}) {
  return await addTraceSpan({
    spanName: 'disk.git.deleteRemoteBranch',
    fn: async () => {
      await item.git.push('origin', `:refs/heads/${item.branch}`);
    }
  });
}

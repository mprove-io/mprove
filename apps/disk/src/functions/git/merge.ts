import { SimpleGit } from 'simple-git';
import { addTraceSpan } from '#node-common/functions/add-trace-span';

export async function merge(item: {
  projectId: string;
  projectDir: string;
  repoId: string;
  repoDir: string;
  userAlias: string;
  branch: string;
  theirBranch: string;
  isTheirBranchRemote: boolean;
  git: SimpleGit;
}) {
  return await addTraceSpan({
    spanName: 'disk.git.merge',
    fn: async () => {
      let git = item.git;

      await addTraceSpan({
        spanName: 'disk.git.merge.git.fetch',
        fn: () => git.fetch('origin', ['--prune'])
      });

      let ourCommitId = await git.revparse([`refs/heads/${item.branch}`]);
      ourCommitId = ourCommitId.trim();

      let theirRef =
        item.isTheirBranchRemote === true
          ? `refs/remotes/${item.theirBranch}`
          : `refs/heads/${item.theirBranch}`;

      let theirCommitId = await git.revparse([theirRef]);
      theirCommitId = theirCommitId.trim();

      if (ourCommitId === theirCommitId) {
        return;
      }

      try {
        await git.merge([item.theirBranch, '--ff-only']);
        return;
      } catch {
        // Fast-forward not possible, continue with regular merge
      }

      // Force merge with commit
      let message = `Merged branch ${item.theirBranch} to ${item.branch}`;

      try {
        await git.merge([item.theirBranch, '-m', message]);
      } catch (e: any) {
        // If merge fails due to conflicts, stage all and commit
        let statusResult = await git.status();

        if (statusResult.conflicted.length > 0) {
          // Stage all files including conflicted ones
          await git.add('.');

          // Create merge commit with conflicts
          await git.commit(message, {
            '--author': `${item.userAlias} <${item.userAlias}@>`
          });

          // Reset to clean state
          await git.reset(['--hard', 'HEAD']);
        } else {
          throw e;
        }
      }
    }
  });
}

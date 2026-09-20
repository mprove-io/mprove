import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { addTraceSpan } from '#node-common/functions/add-trace-span';

export function merge(item: {
  projectId: string;
  projectDir: string;
  repoId: string;
  repoDir: string;
  userAlias: string;
  branch: string;
  theirBranch: string;
  isTheirBranchRemote: boolean;
  git: SimpleGit;
}): Result.ResultAsync<void, never> {
  return addTraceSpan({
    spanName: 'disk.git.merge',
    fn: async () => {
      let ourCommitId = await item.git.revparse([`refs/heads/${item.branch}`]);

      ourCommitId = ourCommitId.trim();

      let theirRef =
        item.isTheirBranchRemote === true
          ? `refs/remotes/${item.theirBranch}`
          : `refs/heads/${item.theirBranch}`;

      let theirCommitId = await item.git.revparse([theirRef]);
      theirCommitId = theirCommitId.trim();

      if (ourCommitId === theirCommitId) {
        return Result.succeed();
      }

      try {
        await item.git.merge([item.theirBranch, '--ff-only']);

        return Result.succeed();
      } catch {
        // Fast-forward not possible, continue with regular merge
      }

      // Force merge with commit
      let message = `Merged branch ${item.theirBranch} to ${item.branch}`;

      await item.git.addConfig('user.email', `${item.userAlias}@`);
      await item.git.addConfig('user.name', item.userAlias);

      try {
        await item.git.merge([item.theirBranch, '-m', message]);
      } catch (e: any) {
        // If merge fails due to conflicts, stage all and commit
        let statusResult = await item.git.status();

        if (statusResult.conflicted.length > 0) {
          // Stage all files including conflicted ones
          await item.git.add('.');

          // Create merge commit with conflicts
          await item.git.commit(message, {
            '--author': `${item.userAlias} <${item.userAlias}@>`
          });

          // Reset to clean state
          await item.git.reset(['--hard', 'HEAD']);
        } else {
          throw e;
        }
      }

      return Result.succeed();
    }
  });
}

import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { addTraceSpan } from '#node-common/functions/add-trace-span';

export function revertRepoToRemote(item: {
  repoDir: string;
  remoteBranch: string;
  git: SimpleGit;
}): Result.ResultAsync<void, never> {
  return addTraceSpan({
    spanName: 'disk.git.revertRepoToRemote',
    fn: async () => {
      await item.git.reset(['--hard', `origin/${item.remoteBranch}`]);

      return Result.succeed();
    }
  });
}

import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { addTraceSpan } from '#node-common/functions/add-trace-span';

export function createBranch(item: {
  repoDir: string;
  fromBranch: string;
  newBranch: string;
  git: SimpleGit;
}): Result.ResultAsync<void, never> {
  return addTraceSpan({
    spanName: 'disk.git.createBranch',
    fn: async () => {
      await item.git.branch([item.newBranch, item.fromBranch]);

      return Result.succeed();
    }
  });
}

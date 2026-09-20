import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { addTraceSpan } from '#node-common/functions/add-trace-span';

export function deleteRemoteBranch(item: {
  projectDir: string;
  branch: string;
  git: SimpleGit;
}): Result.ResultAsync<void, never> {
  return addTraceSpan({
    spanName: 'disk.git.deleteRemoteBranch',
    fn: async () => {
      await item.git.push('origin', `:refs/heads/${item.branch}`);

      return Result.succeed();
    }
  });
}

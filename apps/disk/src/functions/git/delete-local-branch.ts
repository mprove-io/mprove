import { Result } from '@praha/byethrow';
import { addTraceSpan } from '#node-common/functions/add-trace-span';
import { createSimpleGit } from '#node-common/functions/create-simple-git';

export function deleteLocalBranch(item: {
  repoDir: string;
  branch: string;
}): Result.ResultAsync<void, never> {
  return addTraceSpan({
    spanName: 'disk.git.deleteLocalBranch',
    fn: async () => {
      let git = createSimpleGit({ baseDir: item.repoDir });

      await git.deleteLocalBranch(item.branch, true);

      return Result.succeed();
    }
  });
}

import { Result } from '@praha/byethrow';
import { addTraceSpan } from '#node-common/functions/add-trace-span';
import { createSimpleGit } from '#node-common/functions/create-simple-git';

export function revertRepoToLastCommit(item: {
  repoDir: string;
}): Result.ResultAsync<void, never> {
  return addTraceSpan({
    spanName: 'disk.git.revertRepoToLastCommit',
    fn: async () => {
      let git = createSimpleGit({ baseDir: item.repoDir });

      await git.reset(['--hard', 'HEAD']);

      return Result.succeed();
    }
  });
}

import { Result } from '@praha/byethrow';
import { addTraceSpan } from '#node-common/functions/add-trace-span';
import { createSimpleGit } from '#node-common/functions/create-simple-git';

export function isLocalBranchExist(item: {
  repoDir: string;
  localBranch: string;
}): Result.ResultAsync<boolean, never> {
  return addTraceSpan({
    spanName: 'disk.git.isLocalBranchExist',
    fn: async () => {
      let git = createSimpleGit({ baseDir: item.repoDir });

      let branchSummary = await git.branchLocal();

      let isExist = branchSummary.all.includes(item.localBranch);

      return Result.succeed(isExist);
    }
  });
}

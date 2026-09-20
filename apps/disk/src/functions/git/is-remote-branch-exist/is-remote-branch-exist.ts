import { Result } from '@praha/byethrow';
import type { SimpleGit } from 'simple-git';
import { addTraceSpan } from '#node-common/functions/add-trace-span';

export function isRemoteBranchExist(item: {
  repoDir: string;
  remoteBranch: string;
  git: SimpleGit;
  isFetch: boolean;
}): Result.ResultAsync<boolean, never> {
  return addTraceSpan({
    spanName: 'disk.git.isRemoteBranchExist',
    fn: async () => {
      if (item.isFetch === true) {
        await addTraceSpan({
          spanName: 'disk.git.isRemoteBranchExist.git.fetch',
          fn: () => item.git.fetch('origin', ['--prune'])
        });
      }

      let branchSummary = await item.git.branch(['-r']);

      let isExist = branchSummary.all.includes(`origin/${item.remoteBranch}`);

      return Result.succeed(isExist);
    }
  });
}

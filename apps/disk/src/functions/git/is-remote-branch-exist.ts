import * as nodegit from '@figma/nodegit';
import { NODEGIT_REMOTE_BRANCH_NOT_FOUND } from '~common/constants/top';
import { addTraceSpan } from '~node-common/functions/add-trace-span';

export async function isRemoteBranchExist(item: {
  repoDir: string;
  remoteBranch: string;
  fetchOptions: nodegit.FetchOptions;
}): Promise<boolean> {
  return await addTraceSpan({
    spanName: 'disk.git.isRemoteBranchExist',
    fn: async () => {
      let gitRepo = <nodegit.Repository>(
        await nodegit.Repository.open(item.repoDir)
      );

      await addTraceSpan({
        spanName: 'disk.git.isRemoteBranchExist.gitRepo.fetch',
        fn: () => gitRepo.fetch('origin', item.fetchOptions)
      });

      let ref = await nodegit.Branch.lookup(
        gitRepo,
        `origin/${item.remoteBranch}`,
        nodegit.Branch.BRANCH.REMOTE
      ).catch(e => {
        if (e?.message?.includes(NODEGIT_REMOTE_BRANCH_NOT_FOUND)) {
          return false;
        } else {
          throw e;
        }
      });

      return !!ref;
    }
  });
}

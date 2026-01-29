import nodegit from 'nodegit';
import { NODEGIT_LOCAL_BRANCH_NOT_FOUND } from '#common/constants/top';
import { addTraceSpan } from '#node-common/functions/add-trace-span';

export async function isLocalBranchExist(item: {
  repoDir: string;
  localBranch: string;
}): Promise<boolean> {
  return await addTraceSpan({
    spanName: 'disk.git.isLocalBranchExist',
    fn: async () => {
      let gitRepo = <nodegit.Repository>(
        await nodegit.Repository.open(item.repoDir)
      );

      let ref = await nodegit.Branch.lookup(
        gitRepo,
        item.localBranch,
        nodegit.Branch.BRANCH.LOCAL
      ).catch(e => {
        if (e?.message?.includes(NODEGIT_LOCAL_BRANCH_NOT_FOUND)) {
          return false;
        } else {
          throw e;
        }
      });

      return !!ref;
    }
  });
}

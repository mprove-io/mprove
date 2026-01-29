import nodegit from 'nodegit';
import { NODEGIT_REMOTE_BRANCH_NOT_FOUND } from '#common/constants/top';
import { addTraceSpan } from '#node-common/functions/add-trace-span';

export async function isRemoteBranchExist(item: {
  repoDir: string;
  remoteBranch: string;
  fetchOptions: nodegit.FetchOptions;
  isFetch: boolean;
}): Promise<boolean> {
  let { repoDir, remoteBranch, fetchOptions, isFetch } = item;

  return await addTraceSpan({
    spanName: 'disk.git.isRemoteBranchExist',
    fn: async () => {
      let gitRepo = <nodegit.Repository>await nodegit.Repository.open(repoDir);

      if (isFetch === true) {
        await addTraceSpan({
          spanName: 'disk.git.isRemoteBranchExist.gitRepo.fetch',
          fn: () => gitRepo.fetch('origin', fetchOptions)
        });
      }

      let ref = await nodegit.Branch.lookup(
        gitRepo,
        `origin/${remoteBranch}`,
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

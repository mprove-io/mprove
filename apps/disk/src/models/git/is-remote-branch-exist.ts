import * as nodegit from '@figma/nodegit';
import { common } from '~disk/barrels/common';

export async function isRemoteBranchExist(item: {
  repoDir: string;
  remoteBranch: string;
  fetchOptions: nodegit.FetchOptions;
}): Promise<boolean> {
  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(item.repoDir);

  await gitRepo.fetch('origin', item.fetchOptions);

  let ref = await nodegit.Branch.lookup(
    gitRepo,
    `origin/${item.remoteBranch}`,
    nodegit.Branch.BRANCH.REMOTE
  ).catch(e => {
    if (e?.message?.includes(common.NODEGIT_REMOTE_BRANCH_NOT_FOUND)) {
      return false;
    } else {
      throw e;
    }
  });

  return !!ref;
}

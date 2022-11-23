import * as nodegit from 'nodegit';
import { common } from '~disk/barrels/common';

export async function isLocalBranchExist(item: {
  repoDir: string;
  localBranch: string;
}): Promise<boolean> {
  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(item.repoDir);

  let ref = await nodegit.Branch.lookup(
    gitRepo,
    item.localBranch,
    nodegit.Branch.BRANCH.LOCAL
  ).catch(e => {
    if (e?.message?.includes(common.NODEGIT_LOCAL_BRANCH_NOT_FOUND)) {
      return false;
    } else {
      throw e;
    }
  });

  return !!ref;
}

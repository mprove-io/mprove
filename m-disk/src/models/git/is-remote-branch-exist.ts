import * as nodegit from 'nodegit';

export async function isRemoteBranchExist(item: {
  repoDir: string;
  branch: string;
}): Promise<boolean> {
  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(item.repoDir);

  let ref = await nodegit.Branch.lookup(
    gitRepo,
    item.branch,
    nodegit.Branch.BRANCH.REMOTE
  ).catch(e => {
    if (e?.message?.includes('cannot locate remote-tracking branch')) {
      return false;
    } else {
      throw e;
    }
  });

  return !!ref;
}

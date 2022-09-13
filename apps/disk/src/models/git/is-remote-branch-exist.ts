import * as nodegit from 'nodegit';

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
    if (e?.message?.includes('cannot locate remote-tracking branch')) {
      return false;
    } else {
      throw e;
    }
  });

  return !!ref;
}

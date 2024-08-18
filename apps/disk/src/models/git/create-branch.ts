import * as nodegit from '@figma/nodegit';

export async function createBranch(item: {
  repoDir: string;
  fromBranch: string;
  newBranch: string;
  fetchOptions: nodegit.FetchOptions;
}) {
  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(item.repoDir);

  await gitRepo.fetch('origin', item.fetchOptions);

  let commit = <nodegit.Commit>await gitRepo.getBranchCommit(item.fromBranch);

  // do not overwrite existing branch
  let force = 0;

  await nodegit.Branch.create(gitRepo, item.newBranch, commit, force);
}

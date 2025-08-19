import * as nodegit from '@figma/nodegit';

export async function deleteLocalBranch(item: {
  repoDir: string;
  branch: string;
}) {
  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(item.repoDir);

  let branchRef = await nodegit.Branch.lookup(
    gitRepo,
    item.branch,
    nodegit.Branch.BRANCH.LOCAL
  );

  await nodegit.Branch.delete(branchRef); // await
}

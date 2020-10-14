import * as nodegit from 'nodegit';

export async function checkoutBranch(item: {
  repoDir: string;
  branchName: string;
}) {
  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(item.repoDir);

  let checkoutOptions = new nodegit.CheckoutOptions();

  await gitRepo.checkoutBranch(item.branchName, checkoutOptions);
}

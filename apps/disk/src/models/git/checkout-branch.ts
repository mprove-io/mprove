import * as nodegit from 'nodegit';
import { apiToDisk } from '~disk/barrels/api';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { getRepoStatus } from './get-repo-status';

export async function checkoutBranch(item: {
  projectId: string;
  projectDir: string;
  repoId: string;
  repoDir: string;
  branchName: string;
}) {
  let { repoStatus, currentBranch, conflicts } = <interfaces.ItemStatus>(
    await getRepoStatus({
      projectId: item.projectId,
      projectDir: item.projectDir,
      repoId: item.repoId,
      repoDir: item.repoDir
    })
  );

  if (currentBranch === item.branchName) {
    return;
  }

  let okStatuses = [
    apiToDisk.RepoStatusEnum.NeedPush,
    apiToDisk.RepoStatusEnum.NeedPull,
    apiToDisk.RepoStatusEnum.Ok
  ];

  if (okStatuses.indexOf(repoStatus) < 0) {
    throw new common.ServerError({
      message: apiToDisk.ErEnum.DISK_REPO_IS_NOT_CLEAN_FOR_CHECKOUT_BRANCH
    });
  }

  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(item.repoDir);

  let checkoutOptions = new nodegit.CheckoutOptions();

  await gitRepo.checkoutBranch(item.branchName, checkoutOptions);
}

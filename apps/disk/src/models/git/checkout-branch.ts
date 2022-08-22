import * as nodegit from 'nodegit';
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
    common.RepoStatusEnum.NeedPush,
    common.RepoStatusEnum.NeedPull,
    common.RepoStatusEnum.Ok
  ];

  if (okStatuses.indexOf(repoStatus) < 0) {
    throw new common.ServerError({
      message: common.ErEnum.DISK_REPO_IS_NOT_CLEAN_FOR_CHECKOUT_BRANCH,
      data: {
        currentBranch: currentBranch
      }
    });
  }

  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(item.repoDir);

  let checkoutOptions = new nodegit.CheckoutOptions();

  await gitRepo.checkoutBranch(item.branchName, checkoutOptions);
}

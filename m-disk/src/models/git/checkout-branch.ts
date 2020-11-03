import * as nodegit from 'nodegit';
import { api } from '../../barrels/api';
import { git } from '../../barrels/git';
import { interfaces } from '../../barrels/interfaces';

export async function checkoutBranch(item: {
  projectId: string;
  projectDir: string;
  repoId: string;
  repoDir: string;
  branchName: string;
}) {
  let { repoStatus, currentBranch, conflicts } = <interfaces.ItemStatus>(
    await git.getRepoStatus({
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
    api.RepoStatusEnum.NeedPush,
    api.RepoStatusEnum.NeedPull,
    api.RepoStatusEnum.Ok
  ];

  if (okStatuses.indexOf(repoStatus) < 0) {
    throw new api.ServerError({
      message: api.ErEnum.M_DISK_REPO_IS_NOT_CLEAN_FOR_CHECKOUT_BRANCH
    });
  }

  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(item.repoDir);

  let checkoutOptions = new nodegit.CheckoutOptions();

  await gitRepo.checkoutBranch(item.branchName, checkoutOptions);
}

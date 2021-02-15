import * as nodegit from 'nodegit';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { getRepoStatus } from './get-repo-status';
import { constantFetchOptions } from './_constant-fetch-options';

export async function pushToCentral(item: {
  projectId: string;
  projectDir: string;
  repoId: string;
  repoDir: string;
  branch: string;
}) {
  let { repoStatus, currentBranch, conflicts } = <interfaces.ItemStatus>(
    await getRepoStatus({
      projectId: item.projectId,
      projectDir: item.projectDir,
      repoId: item.repoId,
      repoDir: item.repoDir
    })
  );

  let okStatuses = [common.RepoStatusEnum.NeedPush];

  if (okStatuses.indexOf(repoStatus) < 0) {
    throw new common.ServerError({
      message: apiToDisk.ErEnum.DISK_REPO_STATUS_IS_NOT_NEED_PUSH
    });
  }

  let gitRepo = <nodegit.Repository>await nodegit.Repository.open(item.repoDir);

  let originRemote = <nodegit.Remote>await gitRepo.getRemote('origin');

  await originRemote.push(
    [`refs/heads/${item.branch}:refs/heads/${item.branch}`],
    constantFetchOptions
  );
}

import { api } from '../../barrels/api';
import { disk } from '../../barrels/disk';
import { git } from '../../barrels/git';
import { constants } from '../../barrels/constants';
import { interfaces } from '../../barrels/interfaces';
import { transformAndValidate } from 'class-transformer-validator';

export async function ToDiskMergeRepo(
  request: api.ToDiskMergeRepoRequest
): Promise<api.ToDiskMergeRepoResponse> {
  let requestValid = await transformAndValidate(
    api.ToDiskMergeRepoRequest,
    request
  );
  let { traceId } = requestValid.info;
  let {
    organizationId,
    projectId,
    repoId,
    branch,
    theirBranch,
    isTheirBranchRemote,
    userAlias
  } = requestValid.payload;

  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;
  let projectDir = `${orgDir}/${projectId}`;
  let repoDir = `${projectDir}/${repoId}`;

  let isOrgExist = await disk.isPathExist(orgDir);
  if (isOrgExist === false) {
    throw Error(api.ErEnum.M_DISK_ORGANIZATION_IS_NOT_EXIST);
  }

  let isProjectExist = await disk.isPathExist(projectDir);
  if (isProjectExist === false) {
    throw Error(api.ErEnum.M_DISK_PROJECT_IS_NOT_EXIST);
  }

  let isRepoExist = await disk.isPathExist(repoDir);
  if (isRepoExist === false) {
    throw Error(api.ErEnum.M_DISK_REPO_IS_NOT_EXIST);
  }

  let isBranchExist = await git.isLocalBranchExist({
    repoDir: repoDir,
    localBranch: branch
  });
  if (isBranchExist === false) {
    throw Error(api.ErEnum.M_DISK_BRANCH_IS_NOT_EXIST);
  }

  let isTheirBranchExist =
    isTheirBranchRemote === true
      ? await git.isRemoteBranchExist({
          repoDir: repoDir,
          remoteBranch: theirBranch
        })
      : await git.isLocalBranchExist({
          repoDir: repoDir,
          localBranch: theirBranch
        });
  if (isTheirBranchExist === false) {
    throw Error(api.ErEnum.M_DISK_THEIR_BRANCH_IS_NOT_EXIST);
  }

  await git.checkoutBranch({
    projectId: projectId,
    projectDir: projectDir,
    repoId: repoId,
    repoDir: repoDir,
    branchName: branch
  });

  //

  await git.merge({
    projectId: projectId,
    projectDir: projectDir,
    repoId: repoId,
    repoDir: repoDir,
    userAlias: userAlias,
    branch: branch,
    theirBranch:
      isTheirBranchRemote === true ? `origin/${theirBranch}` : theirBranch,
    isTheirBranchRemote: isTheirBranchRemote
  });

  let { repoStatus, currentBranch, conflicts } = <interfaces.ItemStatus>(
    await git.getRepoStatus({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir
    })
  );

  let response: api.ToDiskMergeRepoResponse = {
    info: {
      status: api.ToDiskResponseInfoStatusEnum.Ok,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: repoId,
      repoStatus: repoStatus,
      currentBranch: currentBranch,
      conflicts: conflicts
    }
  };

  return response;
}

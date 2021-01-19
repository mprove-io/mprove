import { api } from '../../barrels/api';
import { disk } from '../../barrels/disk';
import { git } from '../../barrels/git';
import { constants } from '../../barrels/constants';
import { interfaces } from '../../barrels/interfaces';

export async function ToDiskMergeRepo(item: {
  request: api.ToDiskMergeRepoRequest;
  orgPath: string;
}): Promise<api.ToDiskMergeRepoResponse> {
  let { request, orgPath } = item;

  let requestValid = await api.transformValid({
    classType: api.ToDiskMergeRepoRequest,
    object: request,
    errorMessage: api.ErEnum.M_DISK_WRONG_REQUEST_PARAMS
  });

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

  let orgDir = `${orgPath}/${organizationId}`;
  let projectDir = `${orgDir}/${projectId}`;
  let repoDir = `${projectDir}/${repoId}`;

  let isOrgExist = await disk.isPathExist(orgDir);
  if (isOrgExist === false) {
    throw new api.ServerError({
      message: api.ErEnum.M_DISK_ORGANIZATION_IS_NOT_EXIST
    });
  }

  let isProjectExist = await disk.isPathExist(projectDir);
  if (isProjectExist === false) {
    throw new api.ServerError({
      message: api.ErEnum.M_DISK_PROJECT_IS_NOT_EXIST
    });
  }

  let isRepoExist = await disk.isPathExist(repoDir);
  if (isRepoExist === false) {
    throw new api.ServerError({
      message: api.ErEnum.M_DISK_REPO_IS_NOT_EXIST
    });
  }

  let isBranchExist = await git.isLocalBranchExist({
    repoDir: repoDir,
    localBranch: branch
  });
  if (isBranchExist === false) {
    throw new api.ServerError({
      message: api.ErEnum.M_DISK_BRANCH_IS_NOT_EXIST
    });
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
    throw new api.ServerError({
      message: api.ErEnum.M_DISK_THEIR_BRANCH_IS_NOT_EXIST
    });
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
      status: api.ResponseInfoStatusEnum.Ok,
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

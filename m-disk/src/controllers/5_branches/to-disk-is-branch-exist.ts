import { api } from '../../barrels/api';
import { disk } from '../../barrels/disk';
import { constants } from '../../barrels/constants';
import { git } from '../../barrels/git';

export async function ToDiskIsBranchExist(item: {
  request: api.ToDiskIsBranchExistRequest;
  orgPath: string;
}): Promise<api.ToDiskIsBranchExistResponse> {
  let { request, orgPath } = item;

  let requestValid = await api.transformValid({
    classType: api.ToDiskIsBranchExistRequest,
    object: request,
    errorMessage: api.ErEnum.M_DISK_WRONG_REQUEST_PARAMS
  });

  let { traceId } = requestValid.info;
  let {
    organizationId,
    projectId,
    repoId,
    branch,
    isRemote
  } = requestValid.payload;

  let orgDir = `${orgPath}/${organizationId}`;
  let projectDir = `${orgDir}/${projectId}`;
  let repoDir = `${projectDir}/${repoId}`;

  //

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

  let isBranchExist =
    isRemote === true
      ? await git.isRemoteBranchExist({
          repoDir: repoDir,
          remoteBranch: branch
        })
      : await git.isLocalBranchExist({
          repoDir: repoDir,
          localBranch: branch
        });

  let response: api.ToDiskIsBranchExistResponse = {
    info: {
      status: api.ResponseInfoStatusEnum.Ok,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: repoId,
      branch: branch,
      isRemote: isRemote,
      isBranchExist: isBranchExist
    }
  };

  return response;
}

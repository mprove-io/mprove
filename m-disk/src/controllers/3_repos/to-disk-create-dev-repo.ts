import { api } from '../../barrels/api';
import { disk } from '../../barrels/disk';
import { git } from '../../barrels/git';
import { constants } from '../../barrels/constants';
import { interfaces } from '../../barrels/interfaces';

export async function ToDiskCreateDevRepo(item: {
  request: api.ToDiskCreateDevRepoRequest;
  orgPath: string;
}): Promise<api.ToDiskCreateDevRepoResponse> {
  let { request, orgPath } = item;

  let requestValid = await api.transformValid({
    classType: api.ToDiskCreateDevRepoRequest,
    object: request,
    errorMessage: api.ErEnum.M_DISK_WRONG_REQUEST_PARAMS
  });

  let { traceId } = requestValid.info;
  let { organizationId, projectId, devRepoId } = requestValid.payload;

  let orgDir = `${orgPath}/${organizationId}`;
  let projectDir = `${orgDir}/${projectId}`;
  let devRepoDir = `${projectDir}/${devRepoId}`;

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

  let isDevRepoExist = await disk.isPathExist(devRepoDir);
  if (isDevRepoExist === true) {
    throw new api.ServerError({
      message: api.ErEnum.M_DISK_REPO_ALREADY_EXIST
    });
  }

  //

  await git.cloneCentralToDev({
    organizationId: organizationId,
    projectId: projectId,
    devRepoId: devRepoId,
    orgPath: orgPath
  });

  let { repoStatus, currentBranch, conflicts } = <interfaces.ItemStatus>(
    await git.getRepoStatus({
      projectId: projectId,
      projectDir: projectDir,
      repoId: devRepoId,
      repoDir: devRepoDir
    })
  );

  let response: api.ToDiskCreateDevRepoResponse = {
    info: {
      status: api.ResponseInfoStatusEnum.Ok,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: devRepoId,
      repoStatus: repoStatus,
      currentBranch: currentBranch,
      conflicts: conflicts
    }
  };

  return response;
}

import { api } from '../../barrels/api';
import { disk } from '../../barrels/disk';
import { git } from '../../barrels/git';
import { constants } from '../../barrels/constants';

export async function ToDiskCreateProject(
  request: api.ToDiskCreateProjectRequest
): Promise<api.ToDiskCreateProjectResponse> {
  let requestValid = await api.transformValid({
    classType: api.ToDiskCreateProjectRequest,
    object: request,
    errorMessage: api.ErEnum.M_DISK_WRONG_REQUEST_PARAMS
  });

  let { traceId } = requestValid.info;
  let {
    organizationId,
    projectId,
    devRepoId,
    userAlias
  } = requestValid.payload;

  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;
  let projectDir = `${orgDir}/${projectId}`;

  //

  let isOrgExist = await disk.isPathExist(orgDir);
  if (isOrgExist === false) {
    throw new api.ServerError({
      message: api.ErEnum.M_DISK_ORGANIZATION_IS_NOT_EXIST
    });
  }

  let isProjectExist = await disk.isPathExist(projectDir);
  if (isProjectExist === true) {
    throw new api.ServerError({
      message: api.ErEnum.M_DISK_PROJECT_ALREADY_EXIST
    });
  }

  //

  await disk.ensureDir(projectDir);

  await git.prepareCentralAndProd({
    projectId: projectId,
    projectDir: projectDir,
    useData: false,
    userAlias: userAlias
  });

  await git.cloneCentralToDev({
    organizationId: organizationId,
    projectId: projectId,
    devRepoId: devRepoId
  });

  let response: api.ToDiskCreateProjectResponse = {
    info: {
      status: api.ResponseInfoStatusEnum.Ok,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId
    }
  };

  return response;
}

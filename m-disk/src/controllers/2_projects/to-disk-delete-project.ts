import { api } from '../../barrels/api';
import { disk } from '../../barrels/disk';
import { git } from '../../barrels/git';
import { constants } from '../../barrels/constants';

export async function ToDiskDeleteProject(item: {
  request: api.ToDiskDeleteProjectRequest;
  orgPath: string;
}): Promise<api.ToDiskDeleteProjectResponse> {
  let { request, orgPath } = item;

  let requestValid = await api.transformValid({
    classType: api.ToDiskDeleteProjectRequest,
    object: request,
    errorMessage: api.ErEnum.M_DISK_WRONG_REQUEST_PARAMS
  });

  let { traceId } = requestValid.info;
  let { organizationId, projectId } = requestValid.payload;

  let orgDir = `${orgPath}/${organizationId}`;
  let projectDir = `${orgDir}/${projectId}`;

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

  //

  await disk.removePath(projectDir);

  let response: api.ToDiskDeleteProjectResponse = {
    info: {
      status: api.ResponseInfoStatusEnum.Ok,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      deletedProjectId: projectId
    }
  };

  return response;
}

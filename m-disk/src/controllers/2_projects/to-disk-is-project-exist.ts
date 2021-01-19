import { api } from '../../barrels/api';
import { disk } from '../../barrels/disk';
import { constants } from '../../barrels/constants';

export async function ToDiskIsProjectExist(item: {
  request: api.ToDiskIsProjectExistRequest;
  orgPath: string;
}): Promise<api.ToDiskIsProjectExistResponse> {
  let { request, orgPath } = item;

  let requestValid = await api.transformValid({
    classType: api.ToDiskIsProjectExistRequest,
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

  let response: api.ToDiskIsProjectExistResponse = {
    info: {
      status: api.ResponseInfoStatusEnum.Ok,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      isProjectExist: isProjectExist
    }
  };

  return response;
}

import { api } from '../../barrels/api';
import { disk } from '../../barrels/disk';

export async function ToDiskIsOrganizationExist(item: {
  request: api.ToDiskIsOrganizationExistRequest;
  orgPath: string;
}): Promise<api.ToDiskIsOrganizationExistResponse> {
  let { request, orgPath } = item;

  let requestValid = await api.transformValid({
    classType: api.ToDiskIsOrganizationExistRequest,
    object: request,
    errorMessage: api.ErEnum.M_DISK_WRONG_REQUEST_PARAMS
  });

  let { traceId } = requestValid.info;
  let { organizationId } = requestValid.payload;

  let orgDir = `${orgPath}/${organizationId}`;

  //

  let isOrgExist = await disk.isPathExist(orgDir);

  let response: api.ToDiskIsOrganizationExistResponse = {
    info: {
      status: api.ResponseInfoStatusEnum.Ok,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      isOrganizationExist: isOrgExist
    }
  };

  return response;
}

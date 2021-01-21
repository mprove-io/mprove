import { api } from '../../barrels/api';
import { disk } from '../../barrels/disk';

export async function ToDiskDeleteOrganization(item: {
  request: api.ToDiskDeleteOrganizationRequest;
  orgPath: string;
}): Promise<api.ToDiskDeleteOrganizationResponse> {
  let { request, orgPath } = item;

  let requestValid = await api.transformValid({
    classType: api.ToDiskDeleteOrganizationRequest,
    object: request,
    errorMessage: api.ErEnum.M_DISK_WRONG_REQUEST_PARAMS
  });

  let { traceId } = requestValid.info;
  let { organizationId } = requestValid.payload;

  let orgDir = `${orgPath}/${organizationId}`;

  let isOrgExist = await disk.isPathExist(orgDir);

  if (isOrgExist === true) {
    await disk.removePath(orgDir);
  }

  let response: api.ToDiskDeleteOrganizationResponse = {
    info: {
      status: api.ResponseInfoStatusEnum.Ok,
      traceId: traceId
    },
    payload: {
      deletedOrganizationId: organizationId
    }
  };

  return response;
}

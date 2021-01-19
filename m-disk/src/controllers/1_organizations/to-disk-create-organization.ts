import { api } from '../../barrels/api';
import { disk } from '../../barrels/disk';

export async function ToDiskCreateOrganization(item: {
  request: api.ToDiskCreateOrganizationRequest;
  orgPath: string;
}): Promise<api.ToDiskCreateOrganizationResponse> {
  let { request, orgPath } = item;

  let requestValid = await api.transformValid({
    classType: api.ToDiskCreateOrganizationRequest,
    object: request,
    errorMessage: api.ErEnum.M_DISK_WRONG_REQUEST_PARAMS
  });

  let { traceId } = requestValid.info;
  let { organizationId } = requestValid.payload;

  let orgDir = `${orgPath}/${organizationId}`;

  let isOrgExist = await disk.isPathExist(orgDir);
  if (isOrgExist === true) {
    throw new api.ServerError({
      message: api.ErEnum.M_DISK_ORGANIZATION_ALREADY_EXIST
    });
  }

  await disk.ensureDir(orgDir);

  let response: api.ToDiskCreateOrganizationResponse = {
    info: {
      status: api.ResponseInfoStatusEnum.Ok,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId
    }
  };

  return response;
}

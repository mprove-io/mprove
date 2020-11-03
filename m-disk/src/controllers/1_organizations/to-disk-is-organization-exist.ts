import { api } from '../../barrels/api';
import { disk } from '../../barrels/disk';
import { constants } from '../../barrels/constants';

export async function ToDiskIsOrganizationExist(
  request: api.ToDiskIsOrganizationExistRequest
): Promise<api.ToDiskIsOrganizationExistResponse> {
  let requestValid = await api.transformValid({
    classType: api.ToDiskIsOrganizationExistRequest,
    object: request,
    errorMessage: api.ErEnum.M_DISK_WRONG_REQUEST_PARAMS
  });

  let { traceId } = requestValid.info;
  let { organizationId } = requestValid.payload;

  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;

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

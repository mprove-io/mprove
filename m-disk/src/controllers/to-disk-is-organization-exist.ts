import { api } from '../barrels/api';
import { disk } from '../barrels/disk';
import { constants } from '../barrels/constants';
import { transformAndValidate } from 'class-transformer-validator';

export async function ToDiskIsOrganizationExist(
  request: api.ToDiskIsOrganizationExistRequest
): Promise<api.ToDiskIsOrganizationExistResponse> {
  let requestValid = await transformAndValidate(
    api.ToDiskIsOrganizationExistRequest,
    request
  );
  let { traceId } = requestValid.info;
  let { organizationId } = requestValid.payload;

  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;

  //

  let isOrgExist = await disk.isPathExist(orgDir);

  let response: api.ToDiskIsOrganizationExistResponse = {
    info: {
      status: api.ToDiskResponseInfoStatusEnum.Ok,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      isOrganizationExist: isOrgExist
    }
  };

  return response;
}

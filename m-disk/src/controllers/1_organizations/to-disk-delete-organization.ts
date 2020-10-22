import { api } from '../../barrels/api';
import { disk } from '../../barrels/disk';
import { constants } from '../../barrels/constants';
import { transformAndValidate } from 'class-transformer-validator';

export async function ToDiskDeleteOrganization(
  request: api.ToDiskDeleteOrganizationRequest
): Promise<api.ToDiskDeleteOrganizationResponse> {
  let requestValid = await transformAndValidate(
    api.ToDiskDeleteOrganizationRequest,
    request
  );
  let { traceId } = requestValid.info;
  let { organizationId } = requestValid.payload;

  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;

  let isOrgExist = await disk.isPathExist(orgDir);
  if (isOrgExist === false) {
    throw Error(api.ErEnum.M_DISK_ORGANIZATION_IS_NOT_EXIST);
  }

  await disk.removePath(orgDir);

  let response: api.ToDiskDeleteOrganizationResponse = {
    info: {
      status: api.ToDiskResponseInfoStatusEnum.Ok,
      traceId: traceId
    },
    payload: {
      deletedOrganizationId: organizationId
    }
  };

  return response;
}

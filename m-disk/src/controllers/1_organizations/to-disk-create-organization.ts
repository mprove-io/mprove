import { api } from '../../barrels/api';
import { disk } from '../../barrels/disk';
import { constants } from '../../barrels/constants';
import { transformAndValidate } from 'class-transformer-validator';

export async function ToDiskCreateOrganization(
  request: api.ToDiskCreateOrganizationRequest
): Promise<api.ToDiskCreateOrganizationResponse> {
  let requestValid = await transformAndValidate(
    api.ToDiskCreateOrganizationRequest,
    request
  );
  let { traceId } = requestValid.info;
  let { organizationId } = requestValid.payload;

  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;

  let isOrgExist = await disk.isPathExist(orgDir);
  if (isOrgExist === true) {
    throw Error(api.ErEnum.M_DISK_ORGANIZATION_ALREADY_EXIST);
  }

  await disk.ensureDir(orgDir);

  let response: api.ToDiskCreateOrganizationResponse = {
    info: {
      status: api.ToDiskResponseInfoStatusEnum.Ok,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId
    }
  };

  return response;
}

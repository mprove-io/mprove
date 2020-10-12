import { api } from '../barrels/api';
import { disk } from '../barrels/disk';
import { constants } from '../barrels/constants';

export async function ToDiskCreateOrganization(
  request: api.ToDiskCreateOrganizationRequest
): Promise<api.ToDiskCreateOrganizationResponse> {
  let organizationId = request.payload.organizationId;

  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;

  let isOrgExist = await disk.isPathExist(orgDir);

  if (isOrgExist === true) {
    throw Error(api.ErEnum.M_DISK_ORGANIZATION_ALREADY_EXIST);
  }

  await disk.ensureDir(orgDir);

  return {
    info: {
      status: api.ToDiskResponseInfoStatusEnum.Ok
    },
    payload: {
      organizationId: organizationId
    }
  };
}

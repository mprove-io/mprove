import { api } from '../barrels/api';
import { disk } from '../barrels/disk';
import { constants } from '../barrels/constants';

export async function CreateOrganization(
  request: api.CreateOrganizationRequest
): Promise<api.CreateOrganizationResponse> {
  let organizationIdLowerCase = request.payload.organizationId.toLowerCase();

  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationIdLowerCase}`;

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
      organizationId: organizationIdLowerCase
    }
  };
}

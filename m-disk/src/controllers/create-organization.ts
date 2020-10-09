import { api } from '../barrels/api';
import { disk } from '../barrels/disk';
import { config } from '../barrels/config';

export async function CreateOrganization(
  request: api.CreateOrganizationRequest
): Promise<api.CreateOrganizationResponse> {
  let organizationId = request.payload.organizationId;

  let orgDir = `${config.ORGANIZATIONS_PATH}/${organizationId}`;

  let isOrgExist = await disk.isDirExist(orgDir);

  if (!!isOrgExist) {
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

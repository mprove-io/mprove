import { api } from '../../barrels/api';
import { disk } from '../../barrels/disk';

export async function ToDiskCreateOrganization(item: {
  request: any;
  orgPath: string;
}) {
  let { request, orgPath } = item;

  let requestValid = await api.transformValid({
    classType: api.ToDiskCreateOrganizationRequest,
    object: request,
    errorMessage: api.ErEnum.M_DISK_WRONG_REQUEST_PARAMS
  });

  let { organizationId } = requestValid.payload;

  let orgDir = `${orgPath}/${organizationId}`;

  let isOrgExist = await disk.isPathExist(orgDir);
  if (isOrgExist === true) {
    throw new api.ServerError({
      message: api.ErEnum.M_DISK_ORGANIZATION_ALREADY_EXIST
    });
  }

  await disk.ensureDir(orgDir);

  let payload: api.ToDiskCreateOrganizationResponsePayload = {
    organizationId: organizationId
  };

  return payload;
}

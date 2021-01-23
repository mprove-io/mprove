import { api } from '../../barrels/api';
import { disk } from '../../barrels/disk';

export async function ToDiskIsOrganizationExist(item: {
  request: any;
  orgPath: string;
}) {
  let { request, orgPath } = item;

  let requestValid = await api.transformValid({
    classType: api.ToDiskIsOrganizationExistRequest,
    object: request,
    errorMessage: api.ErEnum.M_DISK_WRONG_REQUEST_PARAMS
  });

  let { organizationId } = requestValid.payload;

  let orgDir = `${orgPath}/${organizationId}`;

  //

  let isOrgExist = await disk.isPathExist(orgDir);

  let payload: api.ToDiskIsOrganizationExistResponsePayload = {
    organizationId: organizationId,
    isOrganizationExist: isOrgExist
  };

  return payload;
}

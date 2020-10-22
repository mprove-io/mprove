import { api } from '../../barrels/api';
import { disk } from '../../barrels/disk';
import { constants } from '../../barrels/constants';
import { transformAndValidate } from 'class-transformer-validator';

export async function ToDiskIsProjectExist(
  request: api.ToDiskIsProjectExistRequest
): Promise<api.ToDiskIsProjectExistResponse> {
  let requestValid = await transformAndValidate(
    api.ToDiskIsProjectExistRequest,
    request
  );
  let { traceId } = requestValid.info;
  let { organizationId, projectId } = requestValid.payload;

  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;
  let projectDir = `${orgDir}/${projectId}`;

  //

  let isOrgExist = await disk.isPathExist(orgDir);
  if (isOrgExist === false) {
    throw Error(api.ErEnum.M_DISK_ORGANIZATION_IS_NOT_EXIST);
  }

  let isProjectExist = await disk.isPathExist(projectDir);

  let response: api.ToDiskIsProjectExistResponse = {
    info: {
      status: api.ToDiskResponseInfoStatusEnum.Ok,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      isProjectExist: isProjectExist
    }
  };

  return response;
}

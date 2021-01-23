import { api } from '../../barrels/api';
import { disk } from '../../barrels/disk';

export async function ToDiskDeleteProject(item: {
  request: any;
  orgPath: string;
}) {
  let { request, orgPath } = item;

  let requestValid = await api.transformValid({
    classType: api.ToDiskDeleteProjectRequest,
    object: request,
    errorMessage: api.ErEnum.M_DISK_WRONG_REQUEST_PARAMS
  });

  let { organizationId, projectId } = requestValid.payload;

  let orgDir = `${orgPath}/${organizationId}`;
  let projectDir = `${orgDir}/${projectId}`;

  //

  let isOrgExist = await disk.isPathExist(orgDir);
  if (isOrgExist === false) {
    throw new api.ServerError({
      message: api.ErEnum.M_DISK_ORGANIZATION_IS_NOT_EXIST
    });
  }

  let isProjectExist = await disk.isPathExist(projectDir);
  if (isProjectExist === false) {
    throw new api.ServerError({
      message: api.ErEnum.M_DISK_PROJECT_IS_NOT_EXIST
    });
  }

  //

  await disk.removePath(projectDir);

  let payload: api.ToDiskDeleteProjectResponsePayload = {
    organizationId: organizationId,
    deletedProjectId: projectId
  };

  return payload;
}

import { api } from '../../barrels/api';
import { disk } from '../../barrels/disk';

export async function ToDiskDeleteDevRepo(item: {
  request: any;
  orgPath: string;
}) {
  let { request, orgPath } = item;

  let requestValid = await api.transformValid({
    classType: api.ToDiskDeleteDevRepoRequest,
    object: request,
    errorMessage: api.ErEnum.M_DISK_WRONG_REQUEST_PARAMS
  });

  let { organizationId, projectId, devRepoId } = requestValid.payload;

  let orgDir = `${orgPath}/${organizationId}`;
  let projectDir = `${orgDir}/${projectId}`;
  let devRepoDir = `${projectDir}/${devRepoId}`;

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

  let isDevRepoExist = await disk.isPathExist(devRepoDir);
  if (isDevRepoExist === false) {
    throw new api.ServerError({
      message: api.ErEnum.M_DISK_REPO_IS_NOT_EXIST
    });
  }

  //

  await disk.removePath(devRepoDir);

  let payload: api.ToDiskDeleteDevRepoResponsePayload = {
    organizationId: organizationId,
    projectId: projectId,
    deletedRepoId: devRepoId
  };

  return payload;
}

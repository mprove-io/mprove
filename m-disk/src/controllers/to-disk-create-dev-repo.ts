import { api } from '../barrels/api';
import { disk } from '../barrels/disk';
import { git } from '../barrels/git';
import { constants } from '../barrels/constants';

export async function ToDiskCreateDevRepo(
  request: api.ToDiskCreateDevRepoRequest
): Promise<api.ToDiskCreateDevRepoResponse> {
  let traceId = request.info.traceId;

  let organizationId = request.payload.organizationId;
  let projectId = request.payload.projectId;
  let devRepoId = request.payload.devRepoId;

  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;
  let projectDir = `${orgDir}/${projectId}`;
  let devRepoDir = `${projectDir}/${devRepoId}`;

  let isOrgExist = await disk.isPathExist(orgDir);
  if (isOrgExist === false) {
    throw Error(api.ErEnum.M_DISK_ORGANIZATION_IS_NOT_EXIST);
  }

  let isProjectExist = await disk.isPathExist(projectDir);
  if (isProjectExist === false) {
    throw Error(api.ErEnum.M_DISK_PROJECT_IS_NOT_EXIST);
  }

  let isDevRepoExist = await disk.isPathExist(devRepoDir);
  if (isDevRepoExist === true) {
    throw Error(api.ErEnum.M_DISK_REPO_ALREADY_EXIST);
  }

  await git.cloneCentralToDev({
    organizationId: organizationId,
    projectId: projectId,
    devRepoId: devRepoId
  });

  return {
    info: {
      status: api.ToDiskResponseInfoStatusEnum.Ok,
      traceId: traceId
    }
  };
}

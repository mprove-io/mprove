import { api } from '../barrels/api';
import { disk } from '../barrels/disk';
import { git } from '../barrels/git';
import { constants } from '../barrels/constants';

export async function ToDiskCreateProject(
  request: api.ToDiskCreateProjectRequest
): Promise<api.ToDiskCreateProjectResponse> {
  let organizationId = request.payload.organizationId;
  let projectId = request.payload.projectId;
  let devRepoId = request.payload.devRepoId;

  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;

  let isOrgExist = await disk.isPathExist(orgDir);

  if (isOrgExist === false) {
    throw Error(api.ErEnum.M_DISK_ORGANIZATION_IS_NOT_EXIST);
  }

  let projectDir = `${orgDir}/${projectId}`;

  let isProjectExist = await disk.isPathExist(projectDir);

  if (isProjectExist === true) {
    throw Error(api.ErEnum.M_DISK_PROJECT_ALREADY_EXIST);
  }

  await disk.ensureDir(projectDir);

  await git.prepareCentralAndProd({
    projectId: projectId,
    projectDir: projectDir,
    useData: false
  });

  await git.cloneCentralToDev({
    organizationId: organizationId,
    projectId: projectId,
    devRepoId: devRepoId
  });

  return {
    info: {
      status: api.ToDiskResponseInfoStatusEnum.Ok
    },
    payload: {
      organizationId: request.payload.organizationId,
      projectId: request.payload.projectId,
      devRepoId: request.payload.devRepoId
    }
  };
}

import { api } from '../barrels/api';
import { disk } from '../barrels/disk';
import { git } from '../barrels/git';
import { constants } from '../barrels/constants';

export async function CreateProject(
  request: api.CreateProjectRequest
): Promise<api.CreateProjectResponse> {
  let organizationIdLowerCase = request.payload.organizationId.toLowerCase();
  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationIdLowerCase}`;

  let isOrgExist = await disk.isPathExist(orgDir);

  if (isOrgExist === false) {
    throw Error(api.ErEnum.M_DISK_ORGANIZATION_IS_NOT_EXIST);
  }

  let projectIdLowerCase = request.payload.projectId.toLowerCase();
  let projectDir = `${orgDir}/${projectIdLowerCase}`;

  let isProjectExist = await disk.isPathExist(projectDir);

  if (isProjectExist === true) {
    throw Error(api.ErEnum.M_DISK_PROJECT_ALREADY_EXIST);
  }

  await disk.ensureDir(projectDir);

  await git.prepareCentralAndProd({
    projectIdLowerCase: projectIdLowerCase,
    projectDir: projectDir,
    useData: false
  });

  return {
    info: {
      status: api.ToDiskResponseInfoStatusEnum.Ok
    },
    payload: {
      organizationId: request.payload.organizationId,
      projectId: request.payload.projectId,
      repoId: request.payload.repoId
    }
  };
}

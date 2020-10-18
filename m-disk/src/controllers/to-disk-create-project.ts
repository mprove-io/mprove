import { api } from '../barrels/api';
import { disk } from '../barrels/disk';
import { git } from '../barrels/git';
import { constants } from '../barrels/constants';
import { transformAndValidate } from 'class-transformer-validator';

export async function ToDiskCreateProject(
  request: api.ToDiskCreateProjectRequest
): Promise<api.ToDiskCreateProjectResponse> {
  let requestValid = await transformAndValidate(
    api.ToDiskCreateProjectRequest,
    request
  );
  let { traceId } = requestValid.info;
  let { organizationId, projectId, devRepoId } = requestValid.payload;

  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;
  let projectDir = `${orgDir}/${projectId}`;

  //

  let isOrgExist = await disk.isPathExist(orgDir);
  if (isOrgExist === false) {
    throw Error(api.ErEnum.M_DISK_ORGANIZATION_IS_NOT_EXIST);
  }

  let isProjectExist = await disk.isPathExist(projectDir);
  if (isProjectExist === true) {
    throw Error(api.ErEnum.M_DISK_PROJECT_ALREADY_EXIST);
  }

  //

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

  let response: api.ToDiskCreateProjectResponse = {
    info: {
      status: api.ToDiskResponseInfoStatusEnum.Ok,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId
    }
  };

  return response;
}

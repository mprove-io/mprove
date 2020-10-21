import { api } from '../barrels/api';
import { disk } from '../barrels/disk';
import { constants } from '../barrels/constants';
import { git } from '../barrels/git';
import { transformAndValidate } from 'class-transformer-validator';

export async function ToDiskIsBranchExist(
  request: api.ToDiskIsBranchExistRequest
): Promise<api.ToDiskIsBranchExistResponse> {
  let requestValid = await transformAndValidate(
    api.ToDiskIsBranchExistRequest,
    request
  );
  let { traceId } = requestValid.info;
  let { organizationId, projectId, repoId, branch } = requestValid.payload;

  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;
  let projectDir = `${orgDir}/${projectId}`;
  let repoDir = `${projectDir}/${repoId}`;

  //

  let isOrgExist = await disk.isPathExist(orgDir);
  if (isOrgExist === false) {
    throw Error(api.ErEnum.M_DISK_ORGANIZATION_IS_NOT_EXIST);
  }

  let isProjectExist = await disk.isPathExist(projectDir);
  if (isProjectExist === false) {
    throw Error(api.ErEnum.M_DISK_PROJECT_IS_NOT_EXIST);
  }

  let isRepoExist = await disk.isPathExist(repoDir);
  if (isRepoExist === false) {
    throw Error(api.ErEnum.M_DISK_REPO_IS_NOT_EXIST);
  }

  let isBranchExist = await git.isLocalBranchExist({
    repoDir: repoDir,
    branch: branch
  });

  let response: api.ToDiskIsBranchExistResponse = {
    info: {
      status: api.ToDiskResponseInfoStatusEnum.Ok,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: repoId,
      branch: branch,
      isBranchExist: isBranchExist
    }
  };

  return response;
}

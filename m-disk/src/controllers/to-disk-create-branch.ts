import { api } from '../barrels/api';
import { disk } from '../barrels/disk';
import { git } from '../barrels/git';
import { constants } from '../barrels/constants';

export async function ToDiskCreateBranch(
  request: api.ToDiskCreateBranchRequest
): Promise<api.ToDiskCreateBranchResponse> {
  let traceId = request.info.traceId;

  let organizationId = request.payload.organizationId;
  let projectId = request.payload.projectId;
  let repoId = request.payload.repoId;
  let fromBranch = request.payload.fromBranch;
  let newBranch = request.payload.newBranch;

  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;

  let isOrgExist = await disk.isPathExist(orgDir);
  if (isOrgExist === false) {
    throw Error(api.ErEnum.M_DISK_ORGANIZATION_IS_NOT_EXIST);
  }

  let projectDir = `${orgDir}/${projectId}`;

  let isProjectExist = await disk.isPathExist(projectDir);
  if (isProjectExist === false) {
    throw Error(api.ErEnum.M_DISK_PROJECT_IS_NOT_EXIST);
  }

  let repoDir = `${projectDir}/${repoId}`;

  let isRepoExist = await disk.isPathExist(repoDir);
  if (isRepoExist === false) {
    throw Error(api.ErEnum.M_DISK_REPO_IS_NOT_EXIST);
  }

  let isFromBranchExist = await git.isLocalBranchExist({
    repoDir: repoDir,
    branch: fromBranch
  });

  if (isFromBranchExist === false) {
    throw Error(api.ErEnum.M_DISK_BRANCH_IS_NOT_EXIST);
  }

  let isNewBranchExist = await git.isLocalBranchExist({
    repoDir: repoDir,
    branch: newBranch
  });

  if (isNewBranchExist === true) {
    throw Error(api.ErEnum.M_DISK_BRANCH_ALREADY_EXIST);
  }

  await git.createBranch({
    repoDir: repoDir,
    fromBranch: fromBranch,
    newBranch: newBranch
  });

  return {
    info: {
      status: api.ToDiskResponseInfoStatusEnum.Ok,
      traceId: traceId
    }
  };
}

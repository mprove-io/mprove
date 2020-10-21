import { api } from '../barrels/api';
import { disk } from '../barrels/disk';
import { git } from '../barrels/git';
import { constants } from '../barrels/constants';
import { interfaces } from '../barrels/interfaces';
import { transformAndValidate } from 'class-transformer-validator';

export async function ToDiskMoveNode(
  request: api.ToDiskMoveNodeRequest
): Promise<api.ToDiskMoveNodeResponse> {
  const requestValid = await transformAndValidate(
    api.ToDiskMoveNodeRequest,
    request
  );
  let { traceId } = requestValid.info;
  let {
    organizationId,
    projectId,
    repoId,
    branch,
    fromNodeId,
    toNodeId
  } = requestValid.payload;

  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;
  let projectDir = `${orgDir}/${projectId}`;
  let repoDir = `${projectDir}/${repoId}`;

  let fromPath = repoDir + '/' + fromNodeId.substring(projectId.length + 1);
  let toPath = repoDir + '/' + toNodeId.substring(projectId.length + 1);

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
  if (isBranchExist === false) {
    throw Error(api.ErEnum.M_DISK_BRANCH_IS_NOT_EXIST);
  }

  await git.checkoutBranch({
    repoDir: repoDir,
    branchName: branch
  });

  let isFromPathExist = await disk.isPathExist(fromPath);
  if (isFromPathExist === false) {
    throw Error(api.ErEnum.M_DISK_PATH_IS_NOT_EXIST);
  }

  let isToPathExist = await disk.isPathExist(toPath);
  if (isToPathExist === true) {
    throw Error(api.ErEnum.M_DISK_PATH_ALREADY_EXIST);
  }

  //

  await disk.movePath({
    sourcePath: fromPath,
    destinationPath: toPath
  });

  let { repoStatus, currentBranch, conflicts } = <interfaces.ItemStatus>(
    await git.getRepoStatus({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir
    })
  );

  let itemCatalog = <interfaces.ItemCatalog>(
    await disk.getRepoCatalogNodesAndFiles({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      readFiles: false
    })
  );

  let response: api.ToDiskMoveNodeResponse = {
    info: {
      status: api.ToDiskResponseInfoStatusEnum.Ok,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: repoId,
      repoStatus: repoStatus,
      currentBranch: currentBranch,
      conflicts: conflicts,
      nodes: itemCatalog.nodes
    }
  };

  return response;
}

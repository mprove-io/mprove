import { api } from '../barrels/api';
import { disk } from '../barrels/disk';
import { git } from '../barrels/git';
import { constants } from '../barrels/constants';
import { transformAndValidate } from 'class-transformer-validator';
import { helper } from '../barrels/helper';

export async function ToDiskRenameNode(
  request: api.ToDiskRenameNodeRequest
): Promise<api.ToDiskRenameNodeResponse> {
  const requestValid = await transformAndValidate(
    api.ToDiskRenameNodeRequest,
    request
  );
  let { traceId } = requestValid.info;
  let {
    organizationId,
    projectId,
    repoId,
    branch,
    nodeId,
    newName
  } = requestValid.payload;

  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;
  let projectDir = `${orgDir}/${projectId}`;
  let repoDir = `${projectDir}/${repoId}`;

  let oldPath = repoDir + '/' + nodeId.substring(projectId.length + 1);
  let sourceArray = oldPath.split('/');
  sourceArray.pop();
  let parentPath = sourceArray.join('/');
  let newPath = parentPath + '/' + newName;

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

  let isOldPathExist = await disk.isPathExist(oldPath);
  if (isOldPathExist === false) {
    throw Error(api.ErEnum.M_DISK_PATH_IS_NOT_EXIST);
  }

  //

  if (oldPath.toLowerCase() === newPath.toLowerCase()) {
    // abc -> Abc
    let randomSubPath = 'temp-' + helper.makeRandomIdLetters();
    let tempParentPath = parentPath + '/' + randomSubPath;
    let tempPath = tempParentPath + '/' + newName;

    await disk.movePath({
      sourcePath: oldPath,
      destinationPath: tempPath
    });
    await disk.movePath({
      sourcePath: tempPath,
      destinationPath: newPath
    });
    await disk.removePath(tempParentPath);
  } else {
    // abc -> qwe
    let isNewPathExist = await disk.isPathExist(newPath);
    if (isNewPathExist === true) {
      throw Error(api.ErEnum.M_DISK_PATH_ALREADY_EXIST);
    }
    await disk.renamePath({
      oldPath: oldPath,
      newPath: newPath
    });
  }

  let { repoStatus, currentBranch, conflicts } = <api.ItemStatus>(
    await git.getRepoStatus({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir
    })
  );

  let itemCatalog = <api.ItemCatalog>await disk.getRepoCatalogNodesAndFiles({
    projectId: projectId,
    projectDir: projectDir,
    repoId: repoId,
    readFiles: false
  });

  let response: api.ToDiskRenameNodeResponse = {
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

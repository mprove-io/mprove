import { api } from '../../barrels/api';
import { disk } from '../../barrels/disk';
import { git } from '../../barrels/git';
import { constants } from '../../barrels/constants';
import { interfaces } from '../../barrels/interfaces';

export async function ToDiskRenameCatalogNode(item: {
  request: any;
  orgPath: string;
}) {
  let { request, orgPath } = item;

  let requestValid = await api.transformValid({
    classType: api.ToDiskRenameCatalogNodeRequest,
    object: request,
    errorMessage: api.ErEnum.M_DISK_WRONG_REQUEST_PARAMS
  });

  let {
    organizationId,
    projectId,
    repoId,
    branch,
    nodeId,
    newName
  } = requestValid.payload;

  let orgDir = `${orgPath}/${organizationId}`;
  let projectDir = `${orgDir}/${projectId}`;
  let repoDir = `${projectDir}/${repoId}`;

  let oldPath = repoDir + '/' + nodeId.substring(projectId.length + 1);
  let sourceArray = oldPath.split('/');
  sourceArray.pop();
  let parentPath = sourceArray.join('/');
  let newPath = parentPath + '/' + newName;

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

  let isRepoExist = await disk.isPathExist(repoDir);
  if (isRepoExist === false) {
    throw new api.ServerError({
      message: api.ErEnum.M_DISK_REPO_IS_NOT_EXIST
    });
  }

  let isBranchExist = await git.isLocalBranchExist({
    repoDir: repoDir,
    localBranch: branch
  });
  if (isBranchExist === false) {
    throw new api.ServerError({
      message: api.ErEnum.M_DISK_BRANCH_IS_NOT_EXIST
    });
  }

  await git.checkoutBranch({
    projectId: projectId,
    projectDir: projectDir,
    repoId: repoId,
    repoDir: repoDir,
    branchName: branch
  });

  let isOldPathExist = await disk.isPathExist(oldPath);
  if (isOldPathExist === false) {
    throw new api.ServerError({
      message: api.ErEnum.M_DISK_OLD_PATH_IS_NOT_EXIST
    });
  }

  //
  let isNewPathExist = await disk.isPathExist(newPath);
  if (isNewPathExist === true) {
    throw new api.ServerError({
      message: api.ErEnum.M_DISK_NEW_PATH_ALREADY_EXIST
    });
  }
  await disk.renamePath({
    oldPath: oldPath,
    newPath: newPath
  });

  await git.addChangesToStage({ repoDir: repoDir });

  let { repoStatus, currentBranch, conflicts } = <interfaces.ItemStatus>(
    await git.getRepoStatus({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir
    })
  );

  let itemCatalog = <interfaces.ItemCatalog>await disk.getNodesAndFiles({
    projectId: projectId,
    projectDir: projectDir,
    repoId: repoId,
    readFiles: false
  });

  let payload: api.ToDiskRenameCatalogNodeResponsePayload = {
    organizationId: organizationId,
    projectId: projectId,
    repoId: repoId,
    repoStatus: repoStatus,
    currentBranch: currentBranch,
    conflicts: conflicts,
    nodes: itemCatalog.nodes
  };

  return payload;
}

import { api } from '../../barrels/api';
import { disk } from '../../barrels/disk';
import { git } from '../../barrels/git';
import { constants } from '../../barrels/constants';
import { interfaces } from '../../barrels/interfaces';
import { transformAndValidate } from 'class-transformer-validator';

export async function ToDiskCreateFolder(
  request: api.ToDiskCreateFolderRequest
): Promise<api.ToDiskCreateFolderResponse> {
  let requestValid = await transformAndValidate(
    api.ToDiskCreateFolderRequest,
    request
  );
  let { traceId } = requestValid.info;
  let {
    organizationId,
    projectId,
    repoId,
    branch,
    folderName,
    parentNodeId
  } = requestValid.payload;

  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;
  let projectDir = `${orgDir}/${projectId}`;
  let repoDir = `${projectDir}/${repoId}`;

  let parent = parentNodeId.substring(projectId.length + 1);
  parent = parent.length > 0 ? parent + '/' : parent;
  let parentPath = repoDir + '/' + parent;

  let folderAbsolutePath = parentPath + folderName;
  let gitKeepFileAbsolutePath = folderAbsolutePath + '/' + '.gitkeep';

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
  if (isBranchExist === false) {
    throw Error(api.ErEnum.M_DISK_BRANCH_IS_NOT_EXIST);
  }

  await git.checkoutBranch({
    projectId: projectId,
    projectDir: projectDir,
    repoId: repoId,
    repoDir: repoDir,
    branchName: branch
  });

  let isParentPathExist = await disk.isPathExist(parentPath);
  if (isParentPathExist === false) {
    throw Error(api.ErEnum.M_DISK_PARENT_PATH_IS_NOT_EXIST);
  }

  let isFolderExist = await disk.isPathExist(folderAbsolutePath);
  if (isFolderExist === true) {
    throw Error(api.ErEnum.M_DISK_FOLDER_ALREADY_EXIST);
  }

  //

  await disk.ensureFile(gitKeepFileAbsolutePath);

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

  let response: api.ToDiskCreateFolderResponse = {
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

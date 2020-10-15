import { api } from '../barrels/api';
import { disk } from '../barrels/disk';
import { git } from '../barrels/git';
import { constants } from '../barrels/constants';

export async function ToDiskCreateFolder(
  request: api.ToDiskCreateFolderRequest
): Promise<api.ToDiskCreateFolderResponse> {
  let traceId = request.info.traceId;

  let organizationId = request.payload.organizationId;
  let projectId = request.payload.projectId;
  let repoId = request.payload.repoId;
  let branch = request.payload.branch;
  let folderName = request.payload.folderName;
  let parentNodeId = request.payload.parentNodeId;

  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;
  let projectDir = `${orgDir}/${projectId}`;
  let repoDir = `${projectDir}/${repoId}`;

  let parent = parentNodeId.substring(projectId.length + 1);
  parent = parent.length > 0 ? parent + '/' : parent;
  let parentPath = repoDir + '/' + parent;

  let folderAbsolutePath = parentPath + folderName;
  let gitKeepFileAbsoluteId = folderAbsolutePath + '/' + '.gitkeep';

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

  await disk.ensureFile(gitKeepFileAbsoluteId);

  await git.addChangesToStage({ repoDir: repoDir });

  return {
    info: {
      status: api.ToDiskResponseInfoStatusEnum.Ok,
      traceId: traceId
    }
  };
}

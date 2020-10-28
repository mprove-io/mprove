import { api } from '../../barrels/api';
import { disk } from '../../barrels/disk';
import { git } from '../../barrels/git';
import { constants } from '../../barrels/constants';
import { interfaces } from '../../barrels/interfaces';
import { transformAndValidate } from 'class-transformer-validator';

export async function ToDiskDeleteFile(
  request: api.ToDiskDeleteFileRequest
): Promise<api.ToDiskDeleteFileResponse> {
  let requestValid = await transformAndValidate(
    api.ToDiskDeleteFileRequest,
    request
  );
  let { traceId } = requestValid.info;
  let {
    organizationId,
    projectId,
    repoId,
    branch,
    fileNodeId,
    userAlias
  } = requestValid.payload;

  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;
  let projectDir = `${orgDir}/${projectId}`;
  let repoDir = `${projectDir}/${repoId}`;

  let relativeFilePath = fileNodeId.substring(projectId.length + 1);
  let filePath = repoDir + '/' + relativeFilePath;

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
    localBranch: branch
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

  let isFileExist = await disk.isPathExist(filePath);
  if (isFileExist === false) {
    throw Error(api.ErEnum.M_DISK_FILE_IS_NOT_EXIST);
  }

  //

  await disk.removePath(filePath);

  await git.addChangesToStage({ repoDir: repoDir });

  if (repoId === api.PROD_REPO_ID) {
    await git.commit({
      repoDir: repoDir,
      userAlias: userAlias,
      commitMessage: `deleted ${relativeFilePath}`
    });

    await git.pushToCentral({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      branch: branch
    });
  }

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

  let response: api.ToDiskDeleteFileResponse = {
    info: {
      status: api.ToDiskResponseInfoStatusEnum.Ok,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: repoId,
      deletedFileNodeId: fileNodeId,
      repoStatus: repoStatus,
      currentBranch: currentBranch,
      conflicts: conflicts,
      nodes: itemCatalog.nodes
    }
  };

  return response;
}

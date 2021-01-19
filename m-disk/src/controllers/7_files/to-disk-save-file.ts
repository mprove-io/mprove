import { api } from '../../barrels/api';
import { disk } from '../../barrels/disk';
import { git } from '../../barrels/git';
import { constants } from '../../barrels/constants';
import { interfaces } from '../../barrels/interfaces';

export async function ToDiskSaveFile(item: {
  request: api.ToDiskSaveFileRequest;
  orgPath: string;
}): Promise<api.ToDiskSaveFileResponse> {
  let { request, orgPath } = item;

  let requestValid = await api.transformValid({
    classType: api.ToDiskSaveFileRequest,
    object: request,
    errorMessage: api.ErEnum.M_DISK_WRONG_REQUEST_PARAMS
  });

  let { traceId } = requestValid.info;
  let {
    organizationId,
    projectId,
    repoId,
    branch,
    fileNodeId,
    content,
    userAlias
  } = requestValid.payload;

  let orgDir = `${orgPath}/${organizationId}`;
  let projectDir = `${orgDir}/${projectId}`;
  let repoDir = `${projectDir}/${repoId}`;

  let relativeFilePath = fileNodeId.substring(projectId.length + 1);
  let filePath = repoDir + '/' + relativeFilePath;

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

  let isFileExist = await disk.isPathExist(filePath);
  if (isFileExist === false) {
    throw new api.ServerError({
      message: api.ErEnum.M_DISK_FILE_IS_NOT_EXIST
    });
  }

  //

  await disk.writeToFile({
    filePath: filePath,
    content: content
  });

  await git.addChangesToStage({ repoDir: repoDir });

  if (repoId === api.PROD_REPO_ID) {
    await git.commit({
      repoDir: repoDir,
      userAlias: userAlias,
      commitMessage: `created ${relativeFilePath}`
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

  let response: api.ToDiskSaveFileResponse = {
    info: {
      status: api.ResponseInfoStatusEnum.Ok,
      traceId: traceId
    },
    payload: {
      organizationId: organizationId,
      projectId: projectId,
      repoId: repoId,
      repoStatus: repoStatus,
      currentBranch: currentBranch,
      conflicts: conflicts
    }
  };

  return response;
}

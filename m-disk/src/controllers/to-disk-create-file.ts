import { api } from '../barrels/api';
import { disk } from '../barrels/disk';
import { git } from '../barrels/git';
import { constants } from '../barrels/constants';
import { MyRegex } from '../models/my-regex';
import { transformAndValidate } from 'class-transformer-validator';

export async function ToDiskCreateFile(
  request: api.ToDiskCreateFileRequest
): Promise<api.ToDiskCreateFileResponse> {
  let requestValid = await transformAndValidate(
    api.ToDiskCreateFileRequest,
    request
  );
  let { traceId } = requestValid.info;
  let {
    organizationId,
    projectId,
    repoId,
    branch,
    fileName,
    parentNodeId
  } = requestValid.payload;

  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;
  let projectDir = `${orgDir}/${projectId}`;
  let repoDir = `${projectDir}/${repoId}`;

  let parent = parentNodeId.substring(projectId.length + 1);
  parent = parent.length > 0 ? parent + '/' : parent;
  let parentPath = repoDir + '/' + parent;

  let fileAbsoluteId = parentPath + fileName;
  let content = getContentFromFileName({ fileName: fileName });

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

  let isFileExist = await disk.isPathExist(fileAbsoluteId);
  if (isFileExist === true) {
    throw Error(api.ErEnum.M_DISK_FILE_ALREADY_EXIST);
  }

  //

  await disk.writeToFile({
    fileAbsoluteId: fileAbsoluteId,
    content: content
  });

  await git.addChangesToStage({ repoDir: repoDir });

  let response = {
    info: {
      status: api.ToDiskResponseInfoStatusEnum.Ok,
      traceId: traceId
    }
  };

  return response;
}

function getContentFromFileName(item: { fileName: string }) {
  let content: string;

  let regPart = MyRegex.CAPTURE_FILE_NAME_BEFORE_EXT();
  let rPart = regPart.exec(item.fileName.toLowerCase());

  let part: any = rPart ? rPart[1] : undefined;

  let regExt = MyRegex.CAPTURE_EXT();
  let rExt = regExt.exec(item.fileName.toLowerCase());

  let ext: any = rExt ? rExt[1] : '';

  switch (ext) {
    case constants.EXT_MD:
      content = '';
      break;
    case constants.EXT_DASHBOARD:
      content = `dashboard: ${part}`;
      break;
    case constants.EXT_MODEL:
      content = `model: ${part}`;
      break;
    case constants.EXT_VIEW:
      content = `view: ${part}`;
      break;
    case constants.EXT_UDF:
      content = `udf: ${part}`;
      break;
    default:
      content = '';
  }

  return content;
}

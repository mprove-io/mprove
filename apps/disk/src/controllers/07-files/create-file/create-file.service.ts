import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { disk } from '~disk/barrels/disk';
import { git } from '~disk/barrels/git';
import { interfaces } from '~disk/barrels/interfaces';
import { makeFetchOptions } from '~disk/functions/make-fetch-options';

@Injectable()
export class CreateFileService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = common.transformValidSync({
      classType: apiToDisk.ToDiskCreateFileRequest,
      object: request,
      errorMessage: common.ErEnum.DISK_WRONG_REQUEST_PARAMS
    });

    let {
      orgId,
      projectId,
      repoId,
      branch,
      fileName,
      parentNodeId,
      userAlias,
      fileText,
      remoteType,
      gitUrl,
      privateKey,
      publicKey
    } = requestValid.payload;

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let repoDir = `${projectDir}/${repoId}`;

    let parent = parentNodeId.substring(projectId.length + 1);
    parent = parent.length > 0 ? parent + '/' : parent;
    let relativeFilePath = parent + '/' + fileName;

    let parentPath = repoDir + '/' + parent;
    let filePath = parentPath + fileName;
    let content = fileText || getContentFromFileName({ fileName: fileName });

    //

    let isOrgExist = await disk.isPathExist(orgDir);
    if (isOrgExist === false) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_ORG_IS_NOT_EXIST
      });
    }

    let isProjectExist = await disk.isPathExist(projectDir);
    if (isProjectExist === false) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_PROJECT_IS_NOT_EXIST
      });
    }

    let isRepoExist = await disk.isPathExist(repoDir);
    if (isRepoExist === false) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_REPO_IS_NOT_EXIST
      });
    }

    let isBranchExist = await git.isLocalBranchExist({
      repoDir: repoDir,
      localBranch: branch
    });
    if (isBranchExist === false) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_BRANCH_IS_NOT_EXIST
      });
    }

    let keyDir = `${orgDir}/_keys/${projectId}`;

    await disk.ensureDir(keyDir);

    let fetchOptions = makeFetchOptions({
      remoteType: remoteType,
      keyDir: keyDir,
      gitUrl: gitUrl,
      privateKey: privateKey,
      publicKey: publicKey
    });

    await git.checkoutBranch({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      branchName: branch,
      fetchOptions: fetchOptions
    });

    await disk.ensureDir(parentPath);

    let isFileExist = await disk.isPathExist(filePath);
    if (isFileExist === true) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_FILE_ALREADY_EXIST
      });
    }

    //

    await disk.writeToFile({
      filePath: filePath,
      content: content
    });

    await git.addChangesToStage({ repoDir: repoDir });

    if (repoId === common.PROD_REPO_ID) {
      await git.commit({
        repoDir: repoDir,
        userAlias: userAlias,
        commitMessage: `Created file ${relativeFilePath}`
      });

      await git.pushToRemote({
        projectId: projectId,
        projectDir: projectDir,
        repoId: repoId,
        repoDir: repoDir,
        branch: branch,
        fetchOptions: fetchOptions
      });
    }

    let { repoStatus, currentBranch, conflicts } = <interfaces.ItemStatus>(
      await git.getRepoStatus({
        projectId: projectId,
        projectDir: projectDir,
        repoId: repoId,
        repoDir: repoDir,
        fetchOptions: fetchOptions
      })
    );

    let itemCatalog = <interfaces.ItemCatalog>await disk.getNodesAndFiles({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      readFiles: common.isDefined(fileText) ? true : false
    });

    let payload: apiToDisk.ToDiskCreateFileResponsePayload = {
      repo: {
        orgId: orgId,
        projectId: projectId,
        repoId: repoId,
        repoStatus: repoStatus,
        currentBranchId: currentBranch,
        conflicts: conflicts,
        nodes: itemCatalog.nodes
      },
      files: itemCatalog.files,
      mproveDir: itemCatalog.mproveDir
    };

    return payload;
  }
}

function getContentFromFileName(item: { fileName: string }) {
  let content: string;

  let regPart = common.MyRegex.CAPTURE_FILE_NAME_BEFORE_EXT();
  let rPart = regPart.exec(item.fileName.toLowerCase());

  let part: any = rPart ? rPart[1] : undefined;

  let regExt = common.MyRegex.CAPTURE_EXT();
  let rExt = regExt.exec(item.fileName.toLowerCase());

  let ext: any = rExt ? rExt[1] : '';

  switch (ext) {
    case common.FileExtensionEnum.View:
      content = `view: ${part}`;
      break;
    case common.FileExtensionEnum.Model:
      content = `model: ${part}`;
      break;
    case common.FileExtensionEnum.Dashboard:
      content = `dashboard: ${part}`;
      break;
    case common.FileExtensionEnum.Viz:
      content = `viz: ${part}`;
      break;
    case common.FileExtensionEnum.Udf:
      content = `udf: ${part}`;
      break;
    case common.FileExtensionEnum.Md:
      content = '';
      break;
    case common.FileExtensionEnum.Yml:
      content = '';
      break;
    default:
      content = '';
  }

  return content;
}

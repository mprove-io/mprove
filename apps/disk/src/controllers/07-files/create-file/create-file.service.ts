import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MPROVE_CONFIG_FILENAME, PROD_REPO_ID } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { FileExtensionEnum } from '~common/enums/file-extension.enum';
import { DiskItemCatalog } from '~common/interfaces/disk/disk-item-catalog';
import { DiskItemStatus } from '~common/interfaces/disk/disk-item-status';
import {
  ToDiskCreateFileRequest,
  ToDiskCreateFileResponsePayload
} from '~common/interfaces/to-disk/07-files/to-disk-create-file';
import { MyRegex } from '~common/models/my-regex';
import { ServerError } from '~common/models/server-error';
import { DiskConfig } from '~disk/config/disk-config';
import { ensureDir } from '~disk/functions/disk/ensure-dir';
import { getNodesAndFiles } from '~disk/functions/disk/get-nodes-and-files';
import { isPathExist } from '~disk/functions/disk/is-path-exist';
import { writeToFile } from '~disk/functions/disk/write-to-file';
import { addChangesToStage } from '~disk/functions/git/add-changes-to-stage';
import { checkoutBranch } from '~disk/functions/git/checkout-branch';
import { commit } from '~disk/functions/git/commit';
import { getRepoStatus } from '~disk/functions/git/get-repo-status';
import { isLocalBranchExist } from '~disk/functions/git/is-local-branch-exist';
import { pushToRemote } from '~disk/functions/git/push-to-remote';
import { makeFetchOptions } from '~disk/functions/make-fetch-options';
import { transformValidSync } from '~node-common/functions/transform-valid-sync';

@Injectable()
export class CreateFileService {
  constructor(
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let orgPath = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = transformValidSync({
      classType: ToDiskCreateFileRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let {
      orgId,
      projectId,
      repoId,
      branch,
      fileName,
      fileText,
      // secondFileName,
      // secondFileText,
      parentNodeId,
      userAlias,
      remoteType,
      gitUrl,
      privateKey,
      publicKey
    } = requestValid.payload;

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let repoDir = `${projectDir}/${repoId}`;

    //

    let isOrgExist = await isPathExist(orgDir);
    if (isOrgExist === false) {
      throw new ServerError({
        message: ErEnum.DISK_ORG_IS_NOT_EXIST
      });
    }

    let isProjectExist = await isPathExist(projectDir);
    if (isProjectExist === false) {
      throw new ServerError({
        message: ErEnum.DISK_PROJECT_IS_NOT_EXIST
      });
    }

    let isRepoExist = await isPathExist(repoDir);
    if (isRepoExist === false) {
      throw new ServerError({
        message: ErEnum.DISK_REPO_IS_NOT_EXIST
      });
    }

    let isBranchExist = await isLocalBranchExist({
      repoDir: repoDir,
      localBranch: branch
    });
    if (isBranchExist === false) {
      throw new ServerError({
        message: ErEnum.DISK_BRANCH_IS_NOT_EXIST
      });
    }

    let keyDir = `${orgDir}/_keys/${projectId}`;

    await ensureDir(keyDir);

    let fetchOptions = makeFetchOptions({
      remoteType: remoteType,
      keyDir: keyDir,
      gitUrl: gitUrl,
      privateKey: privateKey,
      publicKey: publicKey
    });

    await checkoutBranch({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      branchName: branch,
      fetchOptions: fetchOptions,
      isFetch: false
    });

    let parent = parentNodeId.substring(projectId.length + 1);
    parent = parent.length > 0 ? parent + '/' : parent;
    let relativeFilePath = parent + '/' + fileName;

    let parentPath = repoDir + '/' + parent;
    let filePath = parentPath + fileName;
    let content = fileText || getContentFromFileName({ fileName: fileName });

    await ensureDir(parentPath);

    let isFileExist = await isPathExist(filePath);
    if (isFileExist === true) {
      throw new ServerError({
        message: ErEnum.DISK_FILE_ALREADY_EXIST
      });
    }

    await writeToFile({
      filePath: filePath,
      content: content
    });

    // if (isDefinedAndNotEmpty(secondFileName)) {
    //   let secondFilePath = parentPath + secondFileName;
    //   let secondContent =
    //     secondFileText || getContentFromFileName({ fileName: secondFileName });

    //   let isSecondFileExist = await isPathExist(secondFilePath);
    //   if (isSecondFileExist === true) {
    //     throw new ServerError({
    //       message: ErEnum.DISK_FILE_ALREADY_EXIST
    //     });
    //   }

    //   await writeToFile({
    //     filePath: secondFilePath,
    //     content: secondContent
    //   });
    // }

    await addChangesToStage({ repoDir: repoDir });

    if (repoId === PROD_REPO_ID) {
      await commit({
        repoDir: repoDir,
        userAlias: userAlias,
        commitMessage: `Created file ${relativeFilePath}`
      });

      await pushToRemote({
        projectId: projectId,
        projectDir: projectDir,
        repoId: repoId,
        repoDir: repoDir,
        branch: branch,
        fetchOptions: fetchOptions
      });
    }

    let {
      repoStatus,
      currentBranch,
      conflicts,
      changesToCommit,
      changesToPush
    } = <DiskItemStatus>await getRepoStatus({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      fetchOptions: fetchOptions,
      isFetch: true,
      isCheckConflicts: true
    });

    let itemCatalog = <DiskItemCatalog>await getNodesAndFiles({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      readFiles: true,
      isRootMproveDir: false
    });

    let payload: ToDiskCreateFileResponsePayload = {
      repo: {
        orgId: orgId,
        projectId: projectId,
        repoId: repoId,
        repoStatus: repoStatus,
        currentBranchId: currentBranch,
        conflicts: conflicts,
        nodes: itemCatalog.nodes,
        changesToCommit: changesToCommit,
        changesToPush: changesToPush
      },
      files: itemCatalog.files,
      mproveDir: itemCatalog.mproveDir
    };

    return payload;
  }
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
    case FileExtensionEnum.Store:
      content = `store: ${part}`;
      break;
    case FileExtensionEnum.Dashboard:
      content = `dashboard: ${part}`;
      break;
    case FileExtensionEnum.Chart:
      content = `chart: ${part}`;
      break;
    case FileExtensionEnum.Report:
      content = `report: ${part}`;
      break;
    case FileExtensionEnum.Yml:
      content =
        item.fileName === MPROVE_CONFIG_FILENAME ? 'mprove_dir: ./' : '';
      break;
    case FileExtensionEnum.Md:
      content = '';
      break;
    default:
      content = '';
  }

  return content;
}

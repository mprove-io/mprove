import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PROD_REPO_ID } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { DiskItemCatalog } from '~common/interfaces/disk/disk-item-catalog';
import { DiskItemStatus } from '~common/interfaces/disk/disk-item-status';
import {
  ToDiskSaveFileRequest,
  ToDiskSaveFileResponsePayload
} from '~common/interfaces/to-disk/07-files/to-disk-save-file';
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
export class SaveFileService {
  constructor(
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let requestValid = transformValidSync({
      classType: ToDiskSaveFileRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let {
      orgId,
      project,
      repoId,
      branch,
      fileNodeId,
      content,
      // secondFileNodeId,
      // secondFileContent,
      // isDeleteSecondFile,
      userAlias
    } = requestValid.payload;

    let { projectId, remoteType, gitUrl } = project;

    let orgPath = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let orgDir = `${orgPath}/${orgId}`;
    let keyDir = `${orgDir}/_keys/${projectId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let repoDir = `${projectDir}/${repoId}`;

    await ensureDir(keyDir);

    let fetchOptions = makeFetchOptions({
      remoteType: remoteType,
      keyDir: keyDir,
      gitUrl: gitUrl,
      privateKey: project.tab.privateKey,
      publicKey: project.tab.publicKey
    });

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

    await checkoutBranch({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      branchName: branch,
      fetchOptions: fetchOptions,
      isFetch: false
    });

    let relativeFilePath = fileNodeId.substring(projectId.length + 1);
    let filePath = repoDir + '/' + relativeFilePath;

    let isFileExist = await isPathExist(filePath);
    if (isFileExist === false) {
      throw new ServerError({
        message: ErEnum.DISK_FILE_IS_NOT_EXIST
      });
    }

    await writeToFile({
      filePath: filePath,
      content: content
    });

    // if (
    //   isDefined(secondFileNodeId) &&
    //   isDefinedAndNotEmpty(secondFileContent)
    // ) {
    //   let relativeSecondFilePath = secondFileNodeId.substring(
    //     projectId.length + 1
    //   );
    //   let secondFilePath = repoDir + '/' + relativeSecondFilePath;

    //   // malloy file may not exist when adding to a tile to dashboard

    //   // let isSecondFileExist = await isPathExist(secondFilePath);
    //   // if (isSecondFileExist === false) {
    //   //   throw new ServerError({
    //   //     message: ErEnum.DISK_FILE_IS_NOT_EXIST
    //   //   });
    //   // }

    //   await writeToFile({
    //     filePath: secondFilePath,
    //     content: secondFileContent
    //   });
    // }

    // if (isDefined(secondFileNodeId) && isDeleteSecondFile === true) {
    //   let secondRelativeFilePath = secondFileNodeId.substring(
    //     projectId.length + 1
    //   );
    //   let secondFilePath = repoDir + '/' + secondRelativeFilePath;

    //   await removePath(secondFilePath);
    // }

    await addChangesToStage({ repoDir: repoDir });

    if (repoId === PROD_REPO_ID) {
      await commit({
        repoDir: repoDir,
        userAlias: userAlias,
        commitMessage: `Modified file ${relativeFilePath}`
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

    let payload: ToDiskSaveFileResponsePayload = {
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

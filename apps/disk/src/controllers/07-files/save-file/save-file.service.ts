import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { disk } from '~disk/barrels/disk';
import { git } from '~disk/barrels/git';
import { interfaces } from '~disk/barrels/interfaces';

@Injectable()
export class SaveFileService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['mDataOrgPath']>(
      'mDataOrgPath'
    );

    let requestValid = await common.transformValid({
      classType: apiToDisk.ToDiskSaveFileRequest,
      object: request,
      errorMessage: apiToDisk.ErEnum.DISK_WRONG_REQUEST_PARAMS
    });

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
      throw new common.ServerError({
        message: apiToDisk.ErEnum.DISK_ORGANIZATION_IS_NOT_EXIST
      });
    }

    let isProjectExist = await disk.isPathExist(projectDir);
    if (isProjectExist === false) {
      throw new common.ServerError({
        message: apiToDisk.ErEnum.DISK_PROJECT_IS_NOT_EXIST
      });
    }

    let isRepoExist = await disk.isPathExist(repoDir);
    if (isRepoExist === false) {
      throw new common.ServerError({
        message: apiToDisk.ErEnum.DISK_REPO_IS_NOT_EXIST
      });
    }

    let isBranchExist = await git.isLocalBranchExist({
      repoDir: repoDir,
      localBranch: branch
    });
    if (isBranchExist === false) {
      throw new common.ServerError({
        message: apiToDisk.ErEnum.DISK_BRANCH_IS_NOT_EXIST
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
      throw new common.ServerError({
        message: apiToDisk.ErEnum.DISK_FILE_IS_NOT_EXIST
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

    let payload: apiToDisk.ToDiskSaveFileResponsePayload = {
      organizationId: organizationId,
      projectId: projectId,
      repoId: repoId,
      repoStatus: repoStatus,
      currentBranch: currentBranch,
      conflicts: conflicts
    };

    return payload;
  }
}
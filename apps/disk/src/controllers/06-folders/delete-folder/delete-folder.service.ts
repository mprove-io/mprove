import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { disk } from '~disk/barrels/disk';
import { git } from '~disk/barrels/git';
import { interfaces } from '~disk/barrels/interfaces';

@Injectable()
export class DeleteFolderService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['mDataOrgPath']>(
      'mDataOrgPath'
    );

    let requestValid = await common.transformValid({
      classType: apiToDisk.ToDiskDeleteFolderRequest,
      object: request,
      errorMessage: apiToDisk.ErEnum.DISK_WRONG_REQUEST_PARAMS
    });

    let { traceId } = requestValid.info;
    let {
      organizationId,
      projectId,
      repoId,
      branch,
      folderNodeId
    } = requestValid.payload;

    let orgDir = `${orgPath}/${organizationId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let repoDir = `${projectDir}/${repoId}`;

    let folderAbsolutePath =
      repoDir + '/' + folderNodeId.substring(projectId.length + 1);

    //

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

    let isFolderExist = await disk.isPathExist(folderAbsolutePath);
    if (isFolderExist === false) {
      throw new common.ServerError({
        message: apiToDisk.ErEnum.DISK_FOLDER_IS_NOT_EXIST
      });
    }

    //

    await disk.removePath(folderAbsolutePath);

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

    let payload: apiToDisk.ToDiskDeleteFolderResponsePayload = {
      organizationId: organizationId,
      projectId: projectId,
      repoId: repoId,
      deletedFolderNodeId: folderNodeId,
      repoStatus: repoStatus,
      currentBranch: currentBranch,
      conflicts: conflicts,
      nodes: itemCatalog.nodes
    };

    return payload;
  }
}

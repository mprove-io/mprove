import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { disk } from '~disk/barrels/disk';
import { git } from '~disk/barrels/git';
import { interfaces } from '~disk/barrels/interfaces';
import { makeFetchOptions } from '~disk/functions/make-fetch-options';

@Injectable()
export class CreateFolderService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = common.transformValidSync({
      classType: apiToDisk.ToDiskCreateFolderRequest,
      object: request,
      errorMessage: common.ErEnum.DISK_WRONG_REQUEST_PARAMS
    });

    let {
      orgId,
      projectId,
      repoId,
      branch,
      folderName,
      parentNodeId,
      remoteType,
      gitUrl,
      privateKey,
      publicKey
    } = requestValid.payload;

    let fetchOptions = makeFetchOptions({
      remoteType: remoteType,
      gitUrl: gitUrl,
      privateKey: privateKey,
      publicKey: publicKey
    });

    let orgDir = `${orgPath}/${orgId}`;
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

    await git.checkoutBranch({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      branchName: branch,
      fetchOptions: fetchOptions
    });

    let isParentPathExist = await disk.isPathExist(parentPath);
    if (isParentPathExist === false) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_PARENT_PATH_IS_NOT_EXIST
      });
    }

    let isFolderExist = await disk.isPathExist(folderAbsolutePath);
    if (isFolderExist === true) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_FOLDER_ALREADY_EXIST
      });
    }

    //

    await disk.ensureFile(gitKeepFileAbsolutePath);

    await git.addChangesToStage({ repoDir: repoDir });

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
      readFiles: false
    });

    let payload: apiToDisk.ToDiskCreateFolderResponsePayload = {
      repo: {
        orgId: orgId,
        projectId: projectId,
        repoId: repoId,
        repoStatus: repoStatus,
        currentBranchId: currentBranch,
        conflicts: conflicts,
        nodes: itemCatalog.nodes
      }
    };

    return payload;
  }
}

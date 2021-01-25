import { api } from '~/barrels/api';
import { disk } from '~/barrels/disk';
import { git } from '~/barrels/git';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '~/barrels/interfaces';

@Injectable()
export class CreateFolderService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['mDataOrgPath']>(
      'mDataOrgPath'
    );

    let requestValid = await api.transformValid({
      classType: api.ToDiskCreateFolderRequest,
      object: request,
      errorMessage: api.ErEnum.M_DISK_WRONG_REQUEST_PARAMS
    });

    let {
      organizationId,
      projectId,
      repoId,
      branch,
      folderName,
      parentNodeId
    } = requestValid.payload;

    let orgDir = `${orgPath}/${organizationId}`;
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

    let isParentPathExist = await disk.isPathExist(parentPath);
    if (isParentPathExist === false) {
      throw new api.ServerError({
        message: api.ErEnum.M_DISK_PARENT_PATH_IS_NOT_EXIST
      });
    }

    let isFolderExist = await disk.isPathExist(folderAbsolutePath);
    if (isFolderExist === true) {
      throw new api.ServerError({
        message: api.ErEnum.M_DISK_FOLDER_ALREADY_EXIST
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
        repoDir: repoDir
      })
    );

    let itemCatalog = <interfaces.ItemCatalog>await disk.getNodesAndFiles({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      readFiles: false
    });

    let payload: api.ToDiskCreateFolderResponsePayload = {
      organizationId: organizationId,
      projectId: projectId,
      repoId: repoId,
      repoStatus: repoStatus,
      currentBranch: currentBranch,
      conflicts: conflicts,
      nodes: itemCatalog.nodes
    };

    return payload;
  }
}

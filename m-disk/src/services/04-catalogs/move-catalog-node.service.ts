import { api } from '~/barrels/api';
import { disk } from '~/barrels/disk';
import { git } from '~/barrels/git';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '~/barrels/interfaces';

@Injectable()
export class MoveCatalogNodeService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['mDataOrgPath']>(
      'mDataOrgPath'
    );

    let requestValid = await api.transformValid({
      classType: api.ToDiskMoveCatalogNodeRequest,
      object: request,
      errorMessage: api.ErEnum.M_DISK_WRONG_REQUEST_PARAMS
    });

    let { traceId } = requestValid.info;
    let {
      organizationId,
      projectId,
      repoId,
      branch,
      fromNodeId,
      toNodeId
    } = requestValid.payload;

    let orgDir = `${orgPath}/${organizationId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let repoDir = `${projectDir}/${repoId}`;

    let fromPath = repoDir + '/' + fromNodeId.substring(projectId.length + 1);
    let toPath = repoDir + '/' + toNodeId.substring(projectId.length + 1);

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

    let isFromPathExist = await disk.isPathExist(fromPath);
    if (isFromPathExist === false) {
      throw new api.ServerError({
        message: api.ErEnum.M_DISK_FROM_PATH_IS_NOT_EXIST
      });
    }

    let isToPathExist = await disk.isPathExist(toPath);
    if (isToPathExist === true) {
      throw new api.ServerError({
        message: api.ErEnum.M_DISK_TO_PATH_ALREADY_EXIST
      });
    }

    //

    await disk.movePath({
      sourcePath: fromPath,
      destinationPath: toPath
    });

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

    let payload: api.ToDiskMoveCatalogNodeResponsePayload = {
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

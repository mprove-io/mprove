import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { disk } from '~disk/barrels/disk';
import { git } from '~disk/barrels/git';
import { interfaces } from '~disk/barrels/interfaces';

@Injectable()
export class CreateBranchService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = common.transformValidSync({
      classType: apiToDisk.ToDiskCreateBranchRequest,
      object: request,
      errorMessage: apiToDisk.ErEnum.DISK_WRONG_REQUEST_PARAMS
    });

    let { traceId } = requestValid.info;
    let {
      orgId,
      projectId,
      repoId,
      newBranch,
      fromBranch,
      isFromRemote
    } = requestValid.payload;

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let repoDir = `${projectDir}/${repoId}`;

    //

    let isOrgExist = await disk.isPathExist(orgDir);
    if (isOrgExist === false) {
      throw new common.ServerError({
        message: apiToDisk.ErEnum.DISK_ORG_IS_NOT_EXIST
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

    let isNewBranchExist = await git.isLocalBranchExist({
      repoDir: repoDir,
      localBranch: newBranch
    });
    if (isNewBranchExist === true) {
      throw new common.ServerError({
        message: apiToDisk.ErEnum.DISK_BRANCH_ALREADY_EXIST
      });
    }

    let isFromBranchExist =
      isFromRemote === true
        ? await git.isRemoteBranchExist({
            repoDir: repoDir,
            remoteBranch: fromBranch
          })
        : await git.isLocalBranchExist({
            repoDir: repoDir,
            localBranch: fromBranch
          });
    if (isFromBranchExist === false) {
      throw new common.ServerError({
        message: apiToDisk.ErEnum.DISK_BRANCH_IS_NOT_EXIST
      });
    }

    //

    await git.createBranch({
      repoDir: repoDir,
      fromBranch: isFromRemote === true ? `origin/${fromBranch}` : fromBranch,
      newBranch: newBranch
    });

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

    let payload: apiToDisk.ToDiskCreateBranchResponsePayload = {
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

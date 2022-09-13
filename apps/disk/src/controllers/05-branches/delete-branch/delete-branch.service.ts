import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { disk } from '~disk/barrels/disk';
import { git } from '~disk/barrels/git';
import { interfaces } from '~disk/barrels/interfaces';
import { makeFetchOptions } from '~disk/functions/make-fetch-options';

@Injectable()
export class DeleteBranchService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = common.transformValidSync({
      classType: apiToDisk.ToDiskDeleteBranchRequest,
      object: request,
      errorMessage: common.ErEnum.DISK_WRONG_REQUEST_PARAMS
    });

    let {
      orgId,
      projectId,
      repoId,
      branch,
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

    if (branch === common.BRANCH_MASTER) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_BRANCH_MASTER_CAN_NOT_BE_DELETED
      });
    }

    await git.checkoutBranch({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      branchName: common.BRANCH_MASTER,
      fetchOptions: fetchOptions
    });

    let errorIfNoLocalBranch = true;

    if (repoId === common.PROD_REPO_ID) {
      let isRemoteBranchExist = await git.isRemoteBranchExist({
        repoDir: repoDir,
        remoteBranch: branch,
        fetchOptions: fetchOptions
      });

      if (isRemoteBranchExist === true) {
        await git.deleteRemoteBranch({
          projectDir: projectDir,
          branch: branch,
          fetchOptions: fetchOptions
        });
        errorIfNoLocalBranch = false;
      }
    }

    let isLocalBranchExist = await git.isLocalBranchExist({
      repoDir: repoDir,
      localBranch: branch
    });

    if (isLocalBranchExist === true) {
      await git.deleteLocalBranch({
        repoDir: repoDir,
        branch: branch
      });
    } else if (errorIfNoLocalBranch === true) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_BRANCH_IS_NOT_EXIST
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
      readFiles: false
    });

    let payload: apiToDisk.ToDiskDeleteBranchResponsePayload = {
      repo: {
        orgId: orgId,
        projectId: projectId,
        repoId: repoId,
        repoStatus: repoStatus,
        currentBranchId: currentBranch,
        conflicts: conflicts,
        nodes: itemCatalog.nodes
      },
      deletedBranch: branch
    };

    return payload;
  }
}

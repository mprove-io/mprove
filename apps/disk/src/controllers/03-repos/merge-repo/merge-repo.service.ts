import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { disk } from '~disk/barrels/disk';
import { git } from '~disk/barrels/git';
import { interfaces } from '~disk/barrels/interfaces';

@Injectable()
export class MergeRepoService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['mDataOrgPath']>(
      'mDataOrgPath'
    );

    let requestValid = await common.transformValid({
      classType: apiToDisk.ToDiskMergeRepoRequest,
      object: request,
      errorMessage: apiToDisk.ErEnum.DISK_WRONG_REQUEST_PARAMS
    });

    let {
      organizationId,
      projectId,
      repoId,
      branch,
      theirBranch,
      isTheirBranchRemote,
      userAlias
    } = requestValid.payload;

    let orgDir = `${orgPath}/${organizationId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let repoDir = `${projectDir}/${repoId}`;

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

    let isTheirBranchExist =
      isTheirBranchRemote === true
        ? await git.isRemoteBranchExist({
            repoDir: repoDir,
            remoteBranch: theirBranch
          })
        : await git.isLocalBranchExist({
            repoDir: repoDir,
            localBranch: theirBranch
          });
    if (isTheirBranchExist === false) {
      throw new common.ServerError({
        message: apiToDisk.ErEnum.DISK_THEIR_BRANCH_IS_NOT_EXIST
      });
    }

    await git.checkoutBranch({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      branchName: branch
    });

    //

    await git.merge({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      userAlias: userAlias,
      branch: branch,
      theirBranch:
        isTheirBranchRemote === true ? `origin/${theirBranch}` : theirBranch,
      isTheirBranchRemote: isTheirBranchRemote
    });

    let { repoStatus, currentBranch, conflicts } = <interfaces.ItemStatus>(
      await git.getRepoStatus({
        projectId: projectId,
        projectDir: projectDir,
        repoId: repoId,
        repoDir: repoDir
      })
    );

    let payload: apiToDisk.ToDiskMergeRepoResponsePayload = {
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

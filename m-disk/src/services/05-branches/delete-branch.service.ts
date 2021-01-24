import { api } from '../../barrels/api';
import { disk } from '../../barrels/disk';
import { git } from '../../barrels/git';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '../../barrels/interfaces';

@Injectable()
export class DeleteBranchService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['mDataOrgPath']>(
      'mDataOrgPath'
    );

    let requestValid = await api.transformValid({
      classType: api.ToDiskDeleteBranchRequest,
      object: request,
      errorMessage: api.ErEnum.M_DISK_WRONG_REQUEST_PARAMS
    });

    let { organizationId, projectId, repoId, branch } = requestValid.payload;

    let orgDir = `${orgPath}/${organizationId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let repoDir = `${projectDir}/${repoId}`;

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

    if (branch === api.BRANCH_MASTER) {
      throw new api.ServerError({
        message: api.ErEnum.M_DISK_BRANCH_MASTER_CAN_NOT_BE_DELETED
      });
    }

    await git.checkoutBranch({
      projectId: projectId,
      projectDir: projectDir,
      repoId: repoId,
      repoDir: repoDir,
      branchName: api.BRANCH_MASTER
    });

    let errorIfNoLocalBranch = true;

    if (repoId === api.PROD_REPO_ID) {
      let isRemoteBranchExist = await git.isRemoteBranchExist({
        repoDir: repoDir,
        remoteBranch: branch
      });

      if (isRemoteBranchExist === true) {
        await git.deleteRemoteBranch({
          projectDir: projectDir,
          branch: branch
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
      throw new api.ServerError({
        message: api.ErEnum.M_DISK_BRANCH_IS_NOT_EXIST
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

    let payload: api.ToDiskDeleteBranchResponsePayload = {
      organizationId: organizationId,
      projectId: projectId,
      repoId: repoId,
      deletedBranch: branch,
      repoStatus: repoStatus,
      currentBranch: currentBranch,
      conflicts: conflicts
    };

    return payload;
  }
}

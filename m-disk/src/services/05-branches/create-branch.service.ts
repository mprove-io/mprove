import { api } from '~/barrels/api';
import { disk } from '~/barrels/disk';
import { git } from '~/barrels/git';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '~/barrels/interfaces';

@Injectable()
export class CreateBranchService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['mDataOrgPath']>(
      'mDataOrgPath'
    );

    let requestValid = await api.transformValid({
      classType: api.ToDiskCreateBranchRequest,
      object: request,
      errorMessage: api.ErEnum.M_DISK_WRONG_REQUEST_PARAMS
    });

    let { traceId } = requestValid.info;
    let {
      organizationId,
      projectId,
      repoId,
      newBranch,
      fromBranch,
      isFromRemote
    } = requestValid.payload;

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

    let isNewBranchExist = await git.isLocalBranchExist({
      repoDir: repoDir,
      localBranch: newBranch
    });
    if (isNewBranchExist === true) {
      throw new api.ServerError({
        message: api.ErEnum.M_DISK_BRANCH_ALREADY_EXIST
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
      throw new api.ServerError({
        message: api.ErEnum.M_DISK_BRANCH_IS_NOT_EXIST
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

    let payload: api.ToDiskCreateBranchResponsePayload = {
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

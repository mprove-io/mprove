import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { disk } from '~disk/barrels/disk';
import { git } from '~disk/barrels/git';
import { interfaces } from '~disk/barrels/interfaces';

@Injectable()
export class CreateDevRepoService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['mDataOrgPath']>(
      'mDataOrgPath'
    );

    let requestValid = await common.transformValid({
      classType: apiToDisk.ToDiskCreateDevRepoRequest,
      object: request,
      errorMessage: apiToDisk.ErEnum.DISK_WRONG_REQUEST_PARAMS
    });

    let { orgId, projectId, devRepoId } = requestValid.payload;

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let devRepoDir = `${projectDir}/${devRepoId}`;

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

    let isDevRepoExist = await disk.isPathExist(devRepoDir);
    if (isDevRepoExist === true) {
      throw new common.ServerError({
        message: apiToDisk.ErEnum.DISK_REPO_ALREADY_EXIST
      });
    }

    //

    await git.cloneCentralToDev({
      orgId: orgId,
      projectId: projectId,
      devRepoId: devRepoId,
      orgPath: orgPath
    });

    let { repoStatus, currentBranch, conflicts } = <interfaces.ItemStatus>(
      await git.getRepoStatus({
        projectId: projectId,
        projectDir: projectDir,
        repoId: devRepoId,
        repoDir: devRepoDir
      })
    );

    let payload: apiToDisk.ToDiskCreateDevRepoResponsePayload = {
      orgId: orgId,
      projectId: projectId,
      repoId: devRepoId,
      repoStatus: repoStatus,
      currentBranch: currentBranch,
      conflicts: conflicts
    };

    return payload;
  }
}

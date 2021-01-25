import { api } from '~/barrels/api';
import { disk } from '~/barrels/disk';
import { git } from '~/barrels/git';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { interfaces } from '~/barrels/interfaces';

@Injectable()
export class CreateDevRepoService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['mDataOrgPath']>(
      'mDataOrgPath'
    );

    let requestValid = await api.transformValid({
      classType: api.ToDiskCreateDevRepoRequest,
      object: request,
      errorMessage: api.ErEnum.M_DISK_WRONG_REQUEST_PARAMS
    });

    let { organizationId, projectId, devRepoId } = requestValid.payload;

    let orgDir = `${orgPath}/${organizationId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let devRepoDir = `${projectDir}/${devRepoId}`;

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

    let isDevRepoExist = await disk.isPathExist(devRepoDir);
    if (isDevRepoExist === true) {
      throw new api.ServerError({
        message: api.ErEnum.M_DISK_REPO_ALREADY_EXIST
      });
    }

    //

    await git.cloneCentralToDev({
      organizationId: organizationId,
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

    let payload: api.ToDiskCreateDevRepoResponsePayload = {
      organizationId: organizationId,
      projectId: projectId,
      repoId: devRepoId,
      repoStatus: repoStatus,
      currentBranch: currentBranch,
      conflicts: conflicts
    };

    return payload;
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~disk/barrels/api';
import { disk } from '~disk/barrels/disk';
import { interfaces } from '~disk/barrels/interfaces';

@Injectable()
export class DeleteDevRepoService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['mDataOrgPath']>(
      'mDataOrgPath'
    );

    let requestValid = await api.transformValid({
      classType: api.ToDiskDeleteDevRepoRequest,
      object: request,
      errorMessage: api.ErEnum.DISK_WRONG_REQUEST_PARAMS
    });

    let { organizationId, projectId, devRepoId } = requestValid.payload;

    let orgDir = `${orgPath}/${organizationId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let devRepoDir = `${projectDir}/${devRepoId}`;

    //

    let isOrgExist = await disk.isPathExist(orgDir);
    if (isOrgExist === false) {
      throw new api.ServerError({
        message: api.ErEnum.DISK_ORGANIZATION_IS_NOT_EXIST
      });
    }

    let isProjectExist = await disk.isPathExist(projectDir);
    if (isProjectExist === false) {
      throw new api.ServerError({
        message: api.ErEnum.DISK_PROJECT_IS_NOT_EXIST
      });
    }

    let isDevRepoExist = await disk.isPathExist(devRepoDir);
    if (isDevRepoExist === false) {
      throw new api.ServerError({
        message: api.ErEnum.DISK_REPO_IS_NOT_EXIST
      });
    }

    //

    await disk.removePath(devRepoDir);

    let payload: api.ToDiskDeleteDevRepoResponsePayload = {
      organizationId: organizationId,
      projectId: projectId,
      deletedRepoId: devRepoId
    };

    return payload;
  }
}

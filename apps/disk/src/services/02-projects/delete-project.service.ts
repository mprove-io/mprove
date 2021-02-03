import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~disk/barrels/api';
import { disk } from '~disk/barrels/disk';
import { interfaces } from '~disk/barrels/interfaces';

@Injectable()
export class DeleteProjectService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['mDataOrgPath']>(
      'mDataOrgPath'
    );

    let requestValid = await api.transformValid({
      classType: api.ToDiskDeleteProjectRequest,
      object: request,
      errorMessage: api.ErEnum.DISK_WRONG_REQUEST_PARAMS
    });

    let { organizationId, projectId } = requestValid.payload;

    let orgDir = `${orgPath}/${organizationId}`;
    let projectDir = `${orgDir}/${projectId}`;

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

    //

    await disk.removePath(projectDir);

    let payload: api.ToDiskDeleteProjectResponsePayload = {
      organizationId: organizationId,
      deletedProjectId: projectId
    };

    return payload;
  }
}

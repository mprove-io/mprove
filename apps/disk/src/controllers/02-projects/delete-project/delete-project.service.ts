import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErEnum } from '~common/enums/er.enum';
import { DiskConfig } from '~common/interfaces/disk/disk-config';
import {
  ToDiskDeleteProjectRequest,
  ToDiskDeleteProjectResponsePayload
} from '~common/interfaces/to-disk/02-projects/to-disk-delete-project';
import { ServerError } from '~common/models/server-error';
import { isPathExist } from '~disk/functions/disk/is-path-exist';
import { removePath } from '~disk/functions/disk/remove-path';
import { transformValidSync } from '~node-common/functions/transform-valid-sync';

@Injectable()
export class DeleteProjectService {
  constructor(
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let orgPath = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = transformValidSync({
      classType: ToDiskDeleteProjectRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let { orgId, projectId } = requestValid.payload;

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;

    //

    let isOrgExist = await isPathExist(orgDir);
    if (isOrgExist === false) {
      throw new ServerError({
        message: ErEnum.DISK_ORG_IS_NOT_EXIST
      });
    }

    let isProjectExist = await isPathExist(projectDir);
    if (isProjectExist === true) {
      await removePath(projectDir);
    }

    //

    let payload: ToDiskDeleteProjectResponsePayload = {
      orgId: orgId,
      deletedProjectId: projectId
    };

    return payload;
  }
}

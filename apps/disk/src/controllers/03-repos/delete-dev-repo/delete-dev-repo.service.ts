import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErEnum } from '~common/enums/er.enum';
import {
  ToDiskDeleteDevRepoRequest,
  ToDiskDeleteDevRepoResponsePayload
} from '~common/interfaces/to-disk/03-repos/to-disk-delete-dev-repo';
import { ServerError } from '~common/models/server-error';
import { DiskConfig } from '~disk/config/disk-config';
import { isPathExist } from '~disk/functions/disk/is-path-exist';
import { removePath } from '~disk/functions/disk/remove-path';
import { DiskTabService } from '~disk/services/disk-tab.service';
import { transformValidSync } from '~node-common/functions/transform-valid-sync';

@Injectable()
export class DeleteDevRepoService {
  constructor(
    private diskTabService: DiskTabService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let orgPath = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = transformValidSync({
      classType: ToDiskDeleteDevRepoRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let { orgId, projectId, devRepoId } = requestValid.payload;

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;
    let devRepoDir = `${projectDir}/${devRepoId}`;

    //

    let isOrgExist = await isPathExist(orgDir);
    if (isOrgExist === false) {
      throw new ServerError({
        message: ErEnum.DISK_ORG_IS_NOT_EXIST
      });
    }

    let isProjectExist = await isPathExist(projectDir);
    if (isProjectExist === false) {
      throw new ServerError({
        message: ErEnum.DISK_PROJECT_IS_NOT_EXIST
      });
    }

    let isDevRepoExist = await isPathExist(devRepoDir);
    if (isDevRepoExist === true) {
      await removePath(devRepoDir);
    }

    let payload: ToDiskDeleteDevRepoResponsePayload = {
      orgId: orgId,
      projectId: projectId,
      deletedRepoId: devRepoId
    };

    return payload;
  }
}

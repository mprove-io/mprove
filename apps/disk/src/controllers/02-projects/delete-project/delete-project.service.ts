import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErEnum } from '#common/enums/er.enum';
import type { ToDiskDeleteProjectResponsePayload } from '#common/zod/to-disk/02-projects/to-disk-delete-project';
import { zToDiskDeleteProjectRequest } from '#common/zod/to-disk/02-projects/to-disk-delete-project';
import { DiskConfig } from '#disk/config/disk-config';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { removePath } from '#disk/functions/disk/remove-path';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { RestoreService } from '#disk/services/restore.service';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';

@Injectable()
export class DeleteProjectService {
  constructor(
    private diskTabService: DiskTabService,
    private restoreService: RestoreService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let orgPath = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = zodParseOrThrow({
      schema: zToDiskDeleteProjectRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let { orgId, projectId } = requestValid.payload;

    let orgDir = `${orgPath}/${orgId}`;
    let projectDir = `${orgDir}/${projectId}`;

    //

    // let isOrgExist = await isPathExist(orgDir);
    // if (isOrgExist === false) {
    //   throw new ServerError({
    //     message: ErEnum.DISK_ORG_IS_NOT_EXIST
    //   });
    // }

    await this.restoreService.checkOrgProjectRepoBranch({
      remoteType: undefined, // undefined
      orgId: orgId,
      projectId: undefined, // undefined
      projectLt: undefined, // undefined
      repoId: undefined, // undefined
      branchId: undefined // undefined
    });

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

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErEnum } from '#common/enums/er.enum';
import type { ToDiskIsProjectExistResponsePayload } from '#common/zod/to-disk/02-projects/to-disk-is-project-exist';
import { zToDiskIsProjectExistRequest } from '#common/zod/to-disk/02-projects/to-disk-is-project-exist';
import { DiskConfig } from '#disk/config/disk-config';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { RestoreService } from '#disk/services/restore.service';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';

@Injectable()
export class IsProjectExistService {
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
      schema: zToDiskIsProjectExistRequest,
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

    let payload: ToDiskIsProjectExistResponsePayload = {
      orgId: orgId,
      projectId: projectId,
      isProjectExist: isProjectExist
    };

    return payload;
  }
}

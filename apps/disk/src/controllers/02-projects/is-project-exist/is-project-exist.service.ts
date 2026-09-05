import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { ErEnum } from '#common/enums/er.enum';
import { zToDiskIsProjectExistRequest } from '#common/zod/to-disk/02-projects/is-project-exist/is-project-exist-request';
import type { ToDiskIsProjectExistResponsePayload } from '#common/zod/to-disk/02-projects/is-project-exist/is-project-exist-response-payload';
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

  async process(request: any): Promise<ToDiskIsProjectExistResponsePayload> {
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

    let isProjectExistResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        projectId: projectId,
        projectDir: `${orgPath}/${orgId}/${projectId}`
      }),
      Result.andThrough(async item => {
        await this.restoreService.checkOrgProjectRepoBranch({
          remoteType: undefined,
          orgId: item.orgId,
          projectId: undefined,
          projectLt: undefined,
          repoId: undefined,
          branchId: undefined
        });
        return Result.succeed();
      }),
      Result.bind('isProjectExist', async item => {
        let isProjectExist: boolean = await isPathExist(item.projectDir);
        return Result.succeed(isProjectExist);
      }),
      Result.map(
        (item): ToDiskIsProjectExistResponsePayload => ({
          orgId: item.orgId,
          projectId: item.projectId,
          isProjectExist: item.isProjectExist
        })
      )
    );

    let payload = await Result.unwrap(isProjectExistResult);

    return payload;
  }
}

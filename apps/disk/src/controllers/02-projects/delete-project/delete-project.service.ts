import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { ErEnum } from '#common/enums/er.enum';
import { zToDiskDeleteProjectRequest } from '#common/zod/to-disk/02-projects/delete-project/delete-project-request';
import type { ToDiskDeleteProjectResponsePayload } from '#common/zod/to-disk/02-projects/delete-project/delete-project-response-payload';
import { DiskConfig } from '#disk/config/disk-config';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { removePath } from '#disk/functions/disk/remove-path';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { RestoreService } from '#disk/services/restore.service';
import { toServerError } from '#node-common/functions/to-server-error';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';

@Injectable()
export class DeleteProjectService {
  constructor(
    private diskTabService: DiskTabService,
    private restoreService: RestoreService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any): Promise<ToDiskDeleteProjectResponsePayload> {
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

    let deleteProjectResult = Result.pipe(
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
      Result.andThrough(async item => {
        let isProjectExist: boolean = await isPathExist(item.projectDir);
        if (isProjectExist === true) {
          await removePath(item.projectDir);
        }
        return Result.succeed();
      }),
      Result.map(
        (item): ToDiskDeleteProjectResponsePayload => ({
          orgId: item.orgId,
          deletedProjectId: item.projectId
        })
      ),
      Result.mapError(toServerError)
    );

    let payload = await Result.unwrap(deleteProjectResult);

    return payload;
  }
}

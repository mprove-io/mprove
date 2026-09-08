import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { ErEnum } from '#common/enums/er.enum';
import { zToDiskIsProjectExistRequest } from '#common/zod/to-disk/02-projects/is-project-exist/is-project-exist-request';
import type { ToDiskIsProjectExistResponsePayload } from '#common/zod/to-disk/02-projects/is-project-exist/is-project-exist-response-payload';
import type { DiskConfig } from '#disk/config/disk-config';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { checkRestoreOrg } from '#disk/functions/restore/check-restore-org';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { toServerError } from '#node-common/functions/to-server-error';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';

@Injectable()
export class IsProjectExistService {
  constructor(
    private diskTabService: DiskTabService,
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
      Result.andThrough(item =>
        checkRestoreOrg({
          orgId: item.orgId,
          orgPath: orgPath
        })
      ),
      Result.bind('isProjectExist', item =>
        isPathExist({ path: item.projectDir })
      ),
      Result.map(
        (item): ToDiskIsProjectExistResponsePayload => ({
          orgId: item.orgId,
          projectId: item.projectId,
          isProjectExist: item.isProjectExist
        })
      ),
      Result.mapError(toServerError)
    );

    let payload = await Result.unwrap(isProjectExistResult);

    return payload;
  }
}

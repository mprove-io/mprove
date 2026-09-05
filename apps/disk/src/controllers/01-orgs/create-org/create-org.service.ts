import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { ErEnum } from '#common/enums/er.enum';
import { zToDiskCreateOrgRequest } from '#common/zod/to-disk/01-orgs/create-org/create-org-request';
import type { ToDiskCreateOrgRequestPayload } from '#common/zod/to-disk/01-orgs/create-org/create-org-request-payload';
import type { ToDiskCreateOrgResponsePayload } from '#common/zod/to-disk/01-orgs/create-org/create-org-response-payload';
import { DiskConfig } from '#disk/config/disk-config';
import { ensureDir } from '#disk/functions/disk/ensure-dir';
import { toServerError } from '#node-common/functions/to-server-error';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';
import { checkOrgDoesNotExist } from './functions/check-org-does-not-exist';

@Injectable()
export class CreateOrgService {
  constructor(
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any): Promise<ToDiskCreateOrgResponsePayload> {
    let orgPath = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = zodParseOrThrow({
      schema: zToDiskCreateOrgRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let { orgId }: ToDiskCreateOrgRequestPayload = requestValid.payload;

    let createOrgResult = Result.pipe(
      Result.succeed({
        orgId: orgId,
        orgDir: `${orgPath}/${orgId}`
      }),
      Result.andThrough(item => checkOrgDoesNotExist({ orgDir: item.orgDir })),
      Result.andThrough(async item => {
        await ensureDir(item.orgDir);
        return Result.succeed();
      }),
      // Result.bind('createOrgResponsePayload', item =>
      //   Result.succeed(toCreateOrgResponsePayload({ orgId: item.orgId }))
      // ),
      Result.map(
        (item): ToDiskCreateOrgResponsePayload => ({ orgId: item.orgId })
      ),
      Result.mapError(error =>
        toServerError({
          message: error.message
        })
      )
    );

    let payload = await Result.unwrap(createOrgResult);

    return payload;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErEnum } from '#common/enums/er.enum';
import { ServerError } from '#common/models/server-error';
import type { ToDiskCreateOrgResponsePayload } from '#common/zod/to-disk/01-orgs/to-disk-create-org';
import { zToDiskCreateOrgRequest } from '#common/zod/to-disk/01-orgs/to-disk-create-org';
import { DiskConfig } from '#disk/config/disk-config';
import { ensureDir } from '#disk/functions/disk/ensure-dir';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';

@Injectable()
export class CreateOrgService {
  constructor(
    private diskTabService: DiskTabService,
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any) {
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

    let { orgId } = requestValid.payload;

    let orgDir = `${orgPath}/${orgId}`;

    let isOrgExist = await isPathExist(orgDir);
    if (isOrgExist === true) {
      throw new ServerError({
        message: ErEnum.DISK_ORG_ALREADY_EXIST
      });
    }

    await ensureDir(orgDir);

    let payload: ToDiskCreateOrgResponsePayload = {
      orgId: orgId
    };

    return payload;
  }
}

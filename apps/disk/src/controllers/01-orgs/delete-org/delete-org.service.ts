import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErEnum } from '#common/enums/er.enum';
import type { ToDiskDeleteOrgResponsePayload } from '#common/zod/to-disk/01-orgs/to-disk-delete-org';
import { zToDiskDeleteOrgRequest } from '#common/zod/to-disk/01-orgs/to-disk-delete-org';
import { DiskConfig } from '#disk/config/disk-config';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { removePath } from '#disk/functions/disk/remove-path';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { zodParseOrThrow } from '#node-common/functions/zod-parse-or-throw';

@Injectable()
export class DeleteOrgService {
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
      schema: zToDiskDeleteOrgRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let { orgId } = requestValid.payload;

    let orgDir = `${orgPath}/${orgId}`;

    let isOrgExist = await isPathExist(orgDir);

    if (isOrgExist === true) {
      await removePath(orgDir);
    }

    let payload: ToDiskDeleteOrgResponsePayload = {
      deletedOrgId: orgId
    };

    return payload;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErEnum } from '#common/enums/er.enum';
import {
  ToDiskCreateOrgRequest,
  ToDiskCreateOrgResponsePayload
} from '#common/interfaces/to-disk/01-orgs/to-disk-create-org';
import { ServerError } from '#common/models/server-error';
import { DiskConfig } from '#disk/config/disk-config';
import { ensureDir } from '#disk/functions/disk/ensure-dir';
import { isPathExist } from '#disk/functions/disk/is-path-exist';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { transformValidSync } from '#node-common/functions/transform-valid-sync';

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

    let requestValid = transformValidSync({
      classType: ToDiskCreateOrgRequest,
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

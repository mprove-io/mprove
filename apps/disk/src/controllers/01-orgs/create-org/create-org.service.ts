import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { nodeCommon } from '~disk/barrels/node-common';
import { Config } from '~disk/interfaces/config';
import { ensureDir } from '~disk/models/disk/ensure-dir';
import { isPathExist } from '~disk/models/disk/is-path-exist';

@Injectable()
export class CreateOrgService {
  constructor(
    private cs: ConfigService<Config>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let orgPath = this.cs.get<Config['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = nodeCommon.transformValidSync({
      classType: apiToDisk.ToDiskCreateOrgRequest,
      object: request,
      errorMessage: common.ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<Config['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let { orgId } = requestValid.payload;

    let orgDir = `${orgPath}/${orgId}`;

    let isOrgExist = await isPathExist(orgDir);
    if (isOrgExist === true) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_ORG_ALREADY_EXIST
      });
    }

    await ensureDir(orgDir);

    let payload: apiToDisk.ToDiskCreateOrgResponsePayload = {
      orgId: orgId
    };

    return payload;
  }
}

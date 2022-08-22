import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { disk } from '~disk/barrels/disk';
import { interfaces } from '~disk/barrels/interfaces';

@Injectable()
export class CreateOrgService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = common.transformValidSync({
      classType: apiToDisk.ToDiskCreateOrgRequest,
      object: request,
      errorMessage: common.ErEnum.DISK_WRONG_REQUEST_PARAMS
    });

    let { orgId } = requestValid.payload;

    let orgDir = `${orgPath}/${orgId}`;

    let isOrgExist = await disk.isPathExist(orgDir);
    if (isOrgExist === true) {
      throw new common.ServerError({
        message: common.ErEnum.DISK_ORG_ALREADY_EXIST
      });
    }

    await disk.ensureDir(orgDir);

    let payload: apiToDisk.ToDiskCreateOrgResponsePayload = {
      orgId: orgId
    };

    return payload;
  }
}

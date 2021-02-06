import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { disk } from '~disk/barrels/disk';
import { interfaces } from '~disk/barrels/interfaces';

@Injectable()
export class CreateOrganizationService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['mDataOrgPath']>(
      'mDataOrgPath'
    );

    let requestValid = await common.transformValid({
      classType: apiToDisk.ToDiskCreateOrganizationRequest,
      object: request,
      errorMessage: apiToDisk.ErEnum.DISK_WRONG_REQUEST_PARAMS
    });

    let { organizationId } = requestValid.payload;

    let orgDir = `${orgPath}/${organizationId}`;

    let isOrgExist = await disk.isPathExist(orgDir);
    if (isOrgExist === true) {
      throw new common.ServerError({
        message: apiToDisk.ErEnum.DISK_ORGANIZATION_ALREADY_EXIST
      });
    }

    await disk.ensureDir(orgDir);

    let payload: apiToDisk.ToDiskCreateOrganizationResponsePayload = {
      organizationId: organizationId
    };

    return payload;
  }
}

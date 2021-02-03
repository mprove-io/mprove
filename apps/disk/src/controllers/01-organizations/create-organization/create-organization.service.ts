import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~disk/barrels/api';
import { disk } from '~disk/barrels/disk';
import { interfaces } from '~disk/barrels/interfaces';

@Injectable()
export class CreateOrganizationService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['mDataOrgPath']>(
      'mDataOrgPath'
    );

    let requestValid = await api.transformValid({
      classType: api.ToDiskCreateOrganizationRequest,
      object: request,
      errorMessage: api.ErEnum.DISK_WRONG_REQUEST_PARAMS
    });

    let { organizationId } = requestValid.payload;

    let orgDir = `${orgPath}/${organizationId}`;

    let isOrgExist = await disk.isPathExist(orgDir);
    if (isOrgExist === true) {
      throw new api.ServerError({
        message: api.ErEnum.DISK_ORGANIZATION_ALREADY_EXIST
      });
    }

    await disk.ensureDir(orgDir);

    let payload: api.ToDiskCreateOrganizationResponsePayload = {
      organizationId: organizationId
    };

    return payload;
  }
}

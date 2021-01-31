import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { api } from '~/barrels/api';
import { disk } from '~/barrels/disk';
import { interfaces } from '~/barrels/interfaces';

@Injectable()
export class DeleteOrganizationService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['mDataOrgPath']>(
      'mDataOrgPath'
    );

    let requestValid = await api.transformValid({
      classType: api.ToDiskDeleteOrganizationRequest,
      object: request,
      errorMessage: api.ErEnum.M_DISK_WRONG_REQUEST_PARAMS
    });

    let { organizationId } = requestValid.payload;

    let orgDir = `${orgPath}/${organizationId}`;

    let isOrgExist = await disk.isPathExist(orgDir);

    if (isOrgExist === true) {
      await disk.removePath(orgDir);
    }

    let payload: api.ToDiskDeleteOrganizationResponsePayload = {
      deletedOrganizationId: organizationId
    };

    return payload;
  }
}

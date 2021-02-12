import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { disk } from '~disk/barrels/disk';
import { interfaces } from '~disk/barrels/interfaces';

@Injectable()
export class DeleteOrgService {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['mDataOrgPath']>(
      'mDataOrgPath'
    );

    let requestValid = await common.transformValid({
      classType: apiToDisk.ToDiskDeleteOrgRequest,
      object: request,
      errorMessage: apiToDisk.ErEnum.DISK_WRONG_REQUEST_PARAMS
    });

    let { orgId } = requestValid.payload;

    let orgDir = `${orgPath}/${orgId}`;

    let isOrgExist = await disk.isPathExist(orgDir);

    if (isOrgExist === true) {
      await disk.removePath(orgDir);
    }

    let payload: apiToDisk.ToDiskDeleteOrgResponsePayload = {
      deletedOrgId: orgId
    };

    return payload;
  }
}

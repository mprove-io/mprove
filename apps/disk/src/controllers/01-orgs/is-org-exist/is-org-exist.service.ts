import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { common } from '~disk/barrels/common';
import { disk } from '~disk/barrels/disk';
import { interfaces } from '~disk/barrels/interfaces';

@Injectable()
export class IsOrgExistService {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let orgPath = this.cs.get<interfaces.Config['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = common.transformValidSync({
      classType: apiToDisk.ToDiskIsOrgExistRequest,
      object: request,
      errorMessage: common.ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsStringify:
        this.cs.get<interfaces.Config['diskLogIsStringify']>(
          'diskLogIsStringify'
        ),
      logger: this.logger
    });

    let { orgId } = requestValid.payload;

    let orgDir = `${orgPath}/${orgId}`;

    //

    let isOrgExist = await disk.isPathExist(orgDir);

    let payload: apiToDisk.ToDiskIsOrgExistResponsePayload = {
      orgId: orgId,
      isOrgExist: isOrgExist
    };

    return payload;
  }
}

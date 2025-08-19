import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErEnum } from '~common/enums/er.enum';
import { DiskConfig } from '~common/interfaces/disk/disk-config';
import {
  ToDiskIsOrgExistRequest,
  ToDiskIsOrgExistResponsePayload
} from '~common/interfaces/to-disk/01-orgs/to-disk-is-org-exist';
import { isPathExist } from '~disk/functions/disk/is-path-exist';
import { transformValidSync } from '~node-common/functions/transform-valid-sync';

@Injectable()
export class IsOrgExistService {
  constructor(
    private cs: ConfigService<DiskConfig>,
    private logger: Logger
  ) {}

  async process(request: any) {
    let orgPath = this.cs.get<DiskConfig['diskOrganizationsPath']>(
      'diskOrganizationsPath'
    );

    let requestValid = transformValidSync({
      classType: ToDiskIsOrgExistRequest,
      object: request,
      errorMessage: ErEnum.DISK_WRONG_REQUEST_PARAMS,
      logIsJson: this.cs.get<DiskConfig['diskLogIsJson']>('diskLogIsJson'),
      logger: this.logger
    });

    let { orgId } = requestValid.payload;

    let orgDir = `${orgPath}/${orgId}`;

    //

    let isOrgExist = await isPathExist(orgDir);

    let payload: ToDiskIsOrgExistResponsePayload = {
      orgId: orgId,
      isOrgExist: isOrgExist
    };

    return payload;
  }
}

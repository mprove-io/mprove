import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { common } from '~api-to-backend/barrels/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { interfaces } from '~backend/barrels/interfaces';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { OrgsService } from '~backend/services/orgs.service';

@Controller()
export class SetOrgInfoController {
  constructor(
    private orgsService: OrgsService,
    private connection: Connection
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetOrgInfo)
  async setOrgInfo(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendSetOrgInfoRequest)
    reqValid: apiToBackend.ToBackendSetOrgInfoRequest
  ) {
    let { orgId, name, companySize, contactPhone } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    await this.orgsService.checkUserIsOrgOwner({
      org: org,
      userId: user.user_id
    });

    if (common.isDefined(name)) {
      org.name = name;
    }

    if (common.isDefined(companySize)) {
      org.company_size = companySize;
    }

    if (common.isDefined(contactPhone)) {
      org.contact_phone = contactPhone;
    }

    let records: interfaces.Records;
    await this.connection.transaction(async manager => {
      records = await db.modifyRecords({
        manager: manager,
        records: {
          orgs: [org]
        }
      });
    });

    let recordsOrg = records.orgs.find(x => x.org_id === orgId);

    let payload: apiToBackend.ToBackendSetOrgInfoResponsePayload = {
      org: wrapper.wrapToApiOrg(recordsOrg)
    };

    return payload;
  }
}

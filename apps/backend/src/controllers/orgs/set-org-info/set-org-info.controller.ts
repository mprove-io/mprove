import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { IsOrgOwnerService } from '~backend/services/is-org-owner.service';

@Controller()
export class SetOrgInfoController {
  constructor(
    private isOrgOwnerService: IsOrgOwnerService,
    private connection: Connection
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetOrgInfo)
  async setOrgInfo(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendSetOrgInfoRequest)
    reqValid: apiToBackend.ToBackendSetOrgInfoRequest
  ) {
    let { orgId, companySize, contactPhone } = reqValid.payload;

    let org = await this.isOrgOwnerService.getOrg({
      orgId: orgId,
      userId: user.user_id
    });

    org.company_size = companySize;
    org.contact_phone = contactPhone;

    await this.connection.transaction(async manager => {
      await db.modifyRecords({
        manager: manager,
        records: {
          orgs: [org]
        }
      });
    });

    let payload: apiToBackend.ToBackendSetOrgInfoResponsePayload = {
      org: wrapper.wrapToApiOrg(org)
    };

    return payload;
  }
}

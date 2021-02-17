import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';

@Controller()
export class SetOrgInfoController {
  constructor(
    private orgsRepository: repositories.OrgsRepository,
    private connection: Connection
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetOrgInfo)
  async setOrgInfo(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendSetOrgInfoRequest)
    reqValid: apiToBackend.ToBackendSetOrgInfoRequest
  ) {
    let { orgId, companySize, contactPhone } = reqValid.payload;

    let org = await this.orgsRepository.findOne({
      org_id: orgId
    });

    if (org.owner_id !== user.user_id) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_FORBIDDEN_ORG
      });
    }

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

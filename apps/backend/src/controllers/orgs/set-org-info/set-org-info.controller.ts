import { Controller, Post } from '@nestjs/common';
import { common } from '~api-to-backend/barrels/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { DbService } from '~backend/services/db.service';
import { OrgsService } from '~backend/services/orgs.service';

@Controller()
export class SetOrgInfoController {
  constructor(private orgsService: OrgsService, private dbService: DbService) {}

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
      if (name.toLowerCase() === common.FIRST_ORG_NAME.toLowerCase()) {
        throw new common.ServerError({
          message: common.ErEnum.BACKEND_RESTRICTED_ORGANIZATION_NAME
        });
      }

      org.name = name;
    }

    if (common.isDefined(companySize)) {
      org.company_size = companySize;
    }

    if (common.isDefined(contactPhone)) {
      org.contact_phone = contactPhone;
    }

    await this.dbService.writeRecords({
      modify: true,
      records: {
        orgs: [org]
      }
    });

    let payload: apiToBackend.ToBackendSetOrgInfoResponsePayload = {
      org: wrapper.wrapToApiOrg(org)
    };

    return payload;
  }
}

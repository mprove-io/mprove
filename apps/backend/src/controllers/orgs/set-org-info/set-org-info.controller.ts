import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { common } from '~api-to-backend/barrels/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { DbService } from '~backend/services/db.service';
import { OrgsService } from '~backend/services/orgs.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class SetOrgInfoController {
  constructor(private orgsService: OrgsService, private dbService: DbService) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetOrgInfo)
  async setOrgInfo(
    @AttachUser() user: schemaPostgres.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendSetOrgInfoRequest = request.body;

    let { orgId, name } = reqValid.payload;

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

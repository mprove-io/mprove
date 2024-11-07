import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { DbService } from '~backend/services/db.service';
import { OrgsService } from '~backend/services/orgs.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class SetOrgOwnerController {
  constructor(
    private orgsService: OrgsService,
    private usersRepository: repositories.UsersRepository,
    private dbService: DbService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetOrgOwner)
  async setOrgOwner(
    @AttachUser() user: schemaPostgres.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendSetOrgOwnerRequest = request.body;

    let { orgId, ownerEmail } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    await this.orgsService.checkUserIsOrgOwner({
      org: org,
      userId: user.user_id
    });

    let newOwner = await this.usersRepository.findOne({
      where: {
        email: ownerEmail,
        is_email_verified: common.BoolEnum.TRUE
      }
    });

    if (common.isUndefined(newOwner)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_NEW_OWNER_NOT_FOUND
      });
    }

    org.owner_id = newOwner.user_id;
    org.owner_email = newOwner.email;

    await this.dbService.writeRecords({
      modify: true,
      records: {
        orgs: [org]
      }
    });

    let payload: apiToBackend.ToBackendSetOrgOwnerResponsePayload = {
      org: wrapper.wrapToApiOrg(org)
    };

    return payload;
  }
}

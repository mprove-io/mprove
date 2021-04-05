import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { DbService } from '~backend/services/db.service';
import { OrgsService } from '~backend/services/orgs.service';

@Controller()
export class SetOrgOwnerController {
  constructor(
    private orgsService: OrgsService,
    private usersRepository: repositories.UsersRepository,
    private dbService: DbService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetOrgOwner)
  async setOrgOwner(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendSetOrgOwnerRequest)
    reqValid: apiToBackend.ToBackendSetOrgOwnerRequest
  ) {
    let { orgId, ownerEmail } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    await this.orgsService.checkUserIsOrgOwner({
      org: org,
      userId: user.user_id
    });

    let newOwner = await this.usersRepository.findOne({
      email: ownerEmail,
      status: common.UserStatusEnum.Active
    });

    if (common.isUndefined(newOwner)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_NEW_OWNER_NOT_FOUND
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
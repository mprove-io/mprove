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
export class SetOrgOwnerController {
  constructor(
    private orgsRepository: repositories.OrgsRepository,
    private usersRepository: repositories.UsersRepository,
    private connection: Connection
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetOrgOwner)
  async setOrgOwner(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendSetOrgOwnerRequest)
    reqValid: apiToBackend.ToBackendSetOrgOwnerRequest
  ) {
    let { orgId, ownerEmail } = reqValid.payload;

    let org = await this.orgsRepository.findOne({
      org_id: orgId
    });

    if (org.owner_id !== user.user_id) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_FORBIDDEN_ORG
      });
    }

    let newOwner = await this.usersRepository.findOne({
      email: ownerEmail,
      status: common.UserStatusEnum.Active
    });

    if (common.isUndefined(newOwner)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_NEW_OWNER_IS_NOT_FOUND
      });
    }

    org.owner_id = newOwner.user_id;
    org.owner_email = newOwner.email;

    await this.connection.transaction(async manager => {
      await db.modifyRecords({
        manager: manager,
        records: {
          orgs: [org]
        }
      });
    });

    let payload: apiToBackend.ToBackendSetOrgOwnerResponsePayload = {
      org: wrapper.wrapToApiOrg(org)
    };

    return payload;
  }
}

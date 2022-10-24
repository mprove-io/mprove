import { Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { interfaces } from '~backend/barrels/interfaces';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { DbService } from '~backend/services/db.service';
import { OrgsService } from '~backend/services/orgs.service';
import { RabbitService } from '~backend/services/rabbit.service';

@Controller()
export class CreateOrgController {
  constructor(
    private dbService: DbService,
    private rabbitService: RabbitService,
    private orgsRepository: repositories.OrgsRepository,
    private orgsService: OrgsService,
    private cs: ConfigService<interfaces.Config>
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateOrg)
  async createOrg(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateOrgRequest)
    reqValid: apiToBackend.ToBackendCreateOrgRequest
  ) {
    if (user.alias === common.RESTRICTED_USER_ALIAS) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_USER
      });
    }

    let allowUsersToCreateOrganizations = this.cs.get<
      interfaces.Config['allowUsersToCreateOrganizations']
    >('allowUsersToCreateOrganizations');

    let firstUserEmail = this.cs.get<interfaces.Config['firstUserEmail']>(
      'firstUserEmail'
    );

    if (
      allowUsersToCreateOrganizations !== common.BoolEnum.TRUE &&
      user.email !== firstUserEmail
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_CREATION_OF_ORGANIZATIONS_IS_FORBIDDEN
      });
    }

    let { name } = reqValid.payload;

    let org = await this.orgsRepository.findOne({ name: name });

    if (name.toLowerCase() === common.FIRST_ORG_NAME.toLowerCase()) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_ORGANIZATION_NAME
      });
    }

    if (common.isDefined(org)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_ORG_ALREADY_EXISTS
      });
    }

    let newOrg = await this.orgsService.addOrg({
      name: name,
      ownerId: user.user_id,
      ownerEmail: user.email,
      traceId: reqValid.info.traceId
    });

    let payload: apiToBackend.ToBackendCreateOrgResponsePayload = {
      org: wrapper.wrapToApiOrg(newOrg)
    };

    return payload;
  }
}

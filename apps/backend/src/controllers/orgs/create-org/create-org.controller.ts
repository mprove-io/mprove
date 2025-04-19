import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { orgsTable } from '~backend/drizzle/postgres/schema/orgs';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { OrgsService } from '~backend/services/orgs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class CreateOrgController {
  constructor(
    private orgsService: OrgsService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<interfaces.Config>,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateOrg)
  async createOrg(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendCreateOrgRequest = request.body;

    if (user.alias === common.RESTRICTED_USER_ALIAS) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_USER
      });
    }

    let allowUsersToCreateOrganizations = this.cs.get<
      interfaces.Config['allowUsersToCreateOrganizations']
    >('allowUsersToCreateOrganizations');

    let firstUserEmail =
      this.cs.get<interfaces.Config['firstUserEmail']>('firstUserEmail');

    if (
      allowUsersToCreateOrganizations !== common.BoolEnum.TRUE &&
      user.email !== firstUserEmail
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_CREATION_OF_ORGANIZATIONS_IS_FORBIDDEN
      });
    }

    let { name } = reqValid.payload;

    let org = await this.db.drizzle.query.orgsTable.findFirst({
      where: eq(orgsTable.name, name)
    });

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
      ownerId: user.userId,
      ownerEmail: user.email,
      traceId: reqValid.info.traceId
    });

    let payload: apiToBackend.ToBackendCreateOrgResponsePayload = {
      org: this.wrapToApiService.wrapToApiOrg(newOrg)
    };

    return payload;
  }
}

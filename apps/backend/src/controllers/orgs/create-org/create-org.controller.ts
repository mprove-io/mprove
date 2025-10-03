import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { orgsTable } from '~backend/drizzle/postgres/schema/orgs';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { OrgsService } from '~backend/services/orgs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { DEMO_ORG_NAME, RESTRICTED_USER_ALIAS } from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { BoolEnum } from '~common/enums/bool.enum';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import {
  ToBackendCreateOrgRequest,
  ToBackendCreateOrgResponsePayload
} from '~common/interfaces/to-backend/orgs/to-backend-create-org';
import { ServerError } from '~common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateOrgController {
  constructor(
    private orgsService: OrgsService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<BackendConfig>,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCreateOrg)
  async createOrg(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendCreateOrgRequest = request.body;

    if (user.alias === RESTRICTED_USER_ALIAS) {
      throw new ServerError({
        message: ErEnum.BACKEND_RESTRICTED_USER
      });
    }

    let allowUsersToCreateOrganizations = this.cs.get<
      BackendConfig['allowUsersToCreateOrganizations']
    >('allowUsersToCreateOrganizations');

    let mproveAdminEmail =
      this.cs.get<BackendConfig['mproveAdminEmail']>('mproveAdminEmail');

    if (
      allowUsersToCreateOrganizations !== BoolEnum.TRUE &&
      user.email !== mproveAdminEmail
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_CREATION_OF_ORGANIZATIONS_IS_FORBIDDEN
      });
    }

    let { name } = reqValid.payload;

    let org = await this.db.drizzle.query.orgsTable.findFirst({
      where: eq(orgsTable.name, name)
    });

    if (name.toLowerCase() === DEMO_ORG_NAME.toLowerCase()) {
      throw new ServerError({
        message: ErEnum.BACKEND_RESTRICTED_ORGANIZATION_NAME
      });
    }

    if (isDefined(org)) {
      throw new ServerError({
        message: ErEnum.BACKEND_ORG_ALREADY_EXISTS
      });
    }

    let newOrg = await this.orgsService.addOrg({
      name: name,
      ownerId: user.userId,
      ownerEmail: user.email,
      traceId: reqValid.info.traceId
    });

    let payload: ToBackendCreateOrgResponsePayload = {
      org: this.wrapToApiService.wrapToApiOrg(newOrg)
    };

    return payload;
  }
}

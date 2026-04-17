import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendCreateOrgRequestDto,
  ToBackendCreateOrgResponseDto
} from '#backend/controllers/orgs/create-org/create-org.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { DconfigsService } from '#backend/services/db/dconfigs.service';
import { OrgsService } from '#backend/services/db/orgs.service';
import { UsersService } from '#backend/services/db/users.service';
import { HashService } from '#backend/services/hash.service';
import { TabService } from '#backend/services/tab.service';
import { DEMO_ORG_NAME } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { ServerError } from '#common/models/server-error';
import type { ToBackendCreateOrgResponsePayload } from '#common/zod/to-backend/orgs/to-backend-create-org';

@ApiTags('Orgs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateOrgController {
  constructor(
    private tabService: TabService,
    private usersService: UsersService,
    private dconfigsService: DconfigsService,
    private hashService: HashService,
    private orgsService: OrgsService,
    private cs: ConfigService<BackendConfig>,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCreateOrg)
  @ApiOperation({
    summary: 'CreateOrg',
    description: 'Create a new organization owned by the current user'
  })
  @ApiOkResponse({
    type: ToBackendCreateOrgResponseDto
  })
  async createOrg(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCreateOrgRequestDto
  ) {
    this.usersService.checkUserIsNotRestricted({ user: user });

    let allowUsersToCreateOrganizations = this.cs.get<
      BackendConfig['allowUsersToCreateOrganizations']
    >('allowUsersToCreateOrganizations');

    let mproveAdminEmail =
      this.cs.get<BackendConfig['mproveAdminEmail']>('mproveAdminEmail');

    if (
      allowUsersToCreateOrganizations === false &&
      user.email !== mproveAdminEmail
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_CREATION_OF_ORGANIZATIONS_IS_FORBIDDEN
      });
    }

    let { name } = body.payload;

    let hashSecret = await this.dconfigsService.getDconfigHashSecret();

    let nameHash = this.hashService.makeHash({
      input: name,
      hashSecret: hashSecret
    });

    let org = await this.db.drizzle.query.orgsTable.findFirst({
      where: eq(orgsTable.nameHash, nameHash)
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
      traceId: body.info.traceId
    });

    let payload: ToBackendCreateOrgResponsePayload = {
      org: this.orgsService.tabToApi({ org: newOrg })
    };

    return payload;
  }
}

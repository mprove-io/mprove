import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendSetOrgOwnerRequestDto,
  ToBackendSetOrgOwnerResponseDto
} from '#backend/controllers/orgs/set-org-owner/set-org-owner.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { DconfigsService } from '#backend/services/db/dconfigs.service';
import { OrgsService } from '#backend/services/db/orgs.service';
import { HashService } from '#backend/services/hash.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';
import type { ToBackendSetOrgOwnerResponsePayload } from '#common/zod/to-backend/orgs/to-backend-set-org-owner';

@ApiTags('Orgs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SetOrgOwnerController {
  constructor(
    private tabService: TabService,
    private dconfigsService: DconfigsService,
    private hashService: HashService,
    private orgsService: OrgsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSetOrgOwner)
  @ApiOperation({
    summary: 'SetOrgOwner',
    description: 'Transfer organization ownership to another verified user'
  })
  @ApiOkResponse({
    type: ToBackendSetOrgOwnerResponseDto
  })
  async setOrgOwner(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendSetOrgOwnerRequestDto
  ) {
    let { orgId, ownerEmail } = body.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    await this.orgsService.checkUserIsOrgOwner({
      org: org,
      userId: user.userId
    });

    let hashSecret = await this.dconfigsService.getDconfigHashSecret();

    let ownerEmailHash = this.hashService.makeHash({
      input: ownerEmail,
      hashSecret: hashSecret
    });

    let newOwner = await this.db.drizzle.query.usersTable
      .findFirst({
        where: and(
          eq(usersTable.emailHash, ownerEmailHash),
          eq(usersTable.isEmailVerified, true)
        )
      })
      .then(x => this.tabService.userEntToTab(x));

    if (isUndefined(newOwner)) {
      throw new ServerError({
        message: ErEnum.BACKEND_NEW_OWNER_NOT_FOUND
      });
    }

    org.ownerId = newOwner.userId;
    org.ownerEmail = newOwner.email;

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                orgs: [org]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let payload: ToBackendSetOrgOwnerResponsePayload = {
      org: this.orgsService.tabToApi({ org: org })
    };

    return payload;
  }
}

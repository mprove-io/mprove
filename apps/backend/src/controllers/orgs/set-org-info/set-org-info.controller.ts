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
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendSetOrgInfoRequestDto,
  ToBackendSetOrgInfoResponseDto
} from '#backend/controllers/orgs/set-org-info/set-org-info.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { OrgsService } from '#backend/services/db/orgs.service';
import { TabService } from '#backend/services/tab.service';
import { DEMO_ORG_NAME } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { ServerError } from '#common/models/server-error';
import type { ToBackendSetOrgInfoResponsePayload } from '#common/zod/to-backend/orgs/to-backend-set-org-info';

@ApiTags('Orgs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SetOrgInfoController {
  constructor(
    private tabService: TabService,
    private orgsService: OrgsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSetOrgInfo)
  @ApiOperation({
    summary: 'SetOrgInfo',
    description: "Update an organization's name"
  })
  @ApiOkResponse({
    type: ToBackendSetOrgInfoResponseDto
  })
  async setOrgInfo(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendSetOrgInfoRequestDto
  ) {
    let { orgId, name } = body.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    await this.orgsService.checkUserIsOrgOwner({
      org: org,
      userId: user.userId
    });

    if (isDefined(name)) {
      if (name.toLowerCase() === DEMO_ORG_NAME.toLowerCase()) {
        throw new ServerError({
          message: ErEnum.BACKEND_RESTRICTED_ORGANIZATION_NAME
        });
      }

      org.name = name;
    }

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

    let payload: ToBackendSetOrgInfoResponsePayload = {
      org: this.orgsService.tabToApi({ org: org })
    };

    return payload;
  }
}

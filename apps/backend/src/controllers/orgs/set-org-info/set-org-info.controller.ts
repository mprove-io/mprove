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
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendSetOrgInfoRequestDto,
  ToBackendSetOrgInfoResponseDto
} from '#backend/controllers/orgs/set-org-info/set-org-info.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { OrgTab, UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { OrgsService } from '#backend/services/db/orgs/orgs.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { DEMO_ORG_NAME } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';

import { isDefined } from '#common/functions/is-defined/is-defined';
import type { GetOrgCheckExistsResultError } from '#common/types/backend/function-errors/get-org-check-exists-result-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSetOrgInfoOutput } from '#common/types/backend/routes/orgs/set-org-info/set-org-info-output';

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

  @Post('api/ToBackendSetOrgInfo' satisfies ToBackendRoute)
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
  ): Promise<BackendResultForOperation<'setOrgInfo'>> {
    return Result.pipe(
      Result.succeed({
        orgId: body.input.orgId,
        name: body.input.name,
        userId: user.userId,
        orgsService: this.orgsService,
        db: this.db,
        cs: this.cs,
        logger: this.logger
      }),
      Result.bind(
        'org',
        (v): Result.ResultAsync<OrgTab, GetOrgCheckExistsResultError> =>
          v.orgsService.getOrgCheckExistsResult({ orgId: v.orgId })
      ),
      Result.andThrough(v =>
        v.orgsService.checkUserIsOrgOwnerResult({
          org: v.org,
          userId: v.userId
        })
      ),
      Result.andThrough(v => {
        if (isDefined(v.name)) {
          if (v.name.toLowerCase() === DEMO_ORG_NAME.toLowerCase()) {
            return Result.fail({
              code: 'BACKEND_RESTRICTED_ORGANIZATION_NAME'
            });
          }

          v.org.name = v.name;
        }

        return Result.succeed();
      }),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await v.db.drizzle.transaction(
                  async tx =>
                    await v.db.packer.write({
                      tx: tx,
                      insertOrUpdate: { orgs: [v.org] }
                    })
                ),
              getRetryOption(v.cs, v.logger)
            );
          }
        })
      ),
      Result.map(
        (v): ToBackendSetOrgInfoOutput => ({
          org: v.orgsService.tabToApi({ org: v.org })
        })
      )
    );
  }
}

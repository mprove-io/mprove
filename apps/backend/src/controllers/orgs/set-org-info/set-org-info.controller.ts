import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  type ToBackendSetOrgInfoRequestDto,
  ToBackendSetOrgInfoResponseDto
} from '#backend/controllers/orgs/set-org-info/set-org-info.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import { checkUserIsOrgOwner } from '#backend/functions/db/orgs/check-user-is-org-owner/check-user-is-org-owner';
import { orgTabToApi } from '#backend/functions/db/orgs/org-tab-to-api/org-tab-to-api';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { DEMO_ORG_NAME } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSetOrgInfoOutput } from '#common/types/backend/routes/orgs/set-org-info/set-org-info-output';

@ApiTags('Orgs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SetOrgInfoController {
  constructor(private db: DbService) {}

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
        userId: user.userId
      }),
      Result.bind('org', v =>
        this.db.orgs.findFirstCheckExists({
          where: eq(orgsTable.orgId, v.orgId)
        })
      ),
      Result.andThrough(v =>
        checkUserIsOrgOwner({
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
        this.db.write({ insertOrUpdate: { orgs: [v.org] } })
      ),
      Result.map(
        (v): ToBackendSetOrgInfoOutput => ({
          org: orgTabToApi({
            org: v.org
          })
        })
      )
    );
  }
}

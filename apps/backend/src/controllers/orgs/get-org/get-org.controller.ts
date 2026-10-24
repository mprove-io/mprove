import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import {
  type ToBackendGetOrgRequestDto,
  ToBackendGetOrgResponseDto
} from '#backend/controllers/orgs/get-org/get-org.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { orgTabToApi } from '#backend/functions/db/orgs/org-tab-to-api/org-tab-to-api';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetOrgOutput } from '#common/types/backend/routes/orgs/get-org/get-org-output';

@ApiTags('Orgs')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetOrgController {
  constructor(private db: DbService) {}

  @Post('api/ToBackendGetOrg' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetOrg',
    description: 'Get an organization'
  })
  @ApiOkResponse({
    type: ToBackendGetOrgResponseDto
  })
  async getOrg(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetOrgRequestDto
  ): Promise<BackendResultForOperation<'getOrg'>> {
    return Result.pipe(
      Result.succeed({
        orgId: body.input.orgId,
        userId: user.userId
      }),
      Result.bind('org', v =>
        this.db.orgs.findFirstCheckExists({
          where: eq(orgsTable.orgId, v.orgId)
        })
      ),
      Result.bind('userMembers', async v =>
        v.org.ownerId === v.userId
          ? Result.succeed([])
          : this.db.members.findMany({
              where: eq(membersTable.memberId, v.userId)
            })
      ),
      Result.bind('projectIds', v =>
        Result.succeed(v.userMembers.map(userMember => userMember.projectId))
      ),
      Result.bind('isOrgAccessible', async v =>
        v.org.ownerId === v.userId
          ? Result.succeed(true)
          : v.projectIds.length === 0
            ? Result.succeed(false)
            : this.db.projects.isExist({
                where: and(
                  inArray(projectsTable.projectId, v.projectIds),
                  eq(projectsTable.orgId, v.orgId)
                )
              })
      ),
      Result.andThrough(v =>
        v.isOrgAccessible === false
          ? Result.fail({ code: 'BACKEND_FORBIDDEN_ORG' })
          : Result.succeed()
      ),
      Result.map(
        (v): ToBackendGetOrgOutput => ({
          org: orgTabToApi({
            org: v.org
          })
        })
      )
    );
  }
}

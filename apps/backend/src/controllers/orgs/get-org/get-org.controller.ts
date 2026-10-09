import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import {
  ToBackendGetOrgRequestDto,
  ToBackendGetOrgResponseDto
} from '#backend/controllers/orgs/get-org/get-org.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { OrgTab, UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import {
  type MemberEnt,
  membersTable
} from '#backend/drizzle/postgres/schema/members';
import {
  type ProjectEnt,
  projectsTable
} from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { OrgsService } from '#backend/services/db/orgs/orgs.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { GetOrgCheckExistsResultError } from '#common/types/backend/function-errors/get-org-check-exists-result-error';

import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetOrgOutput } from '#common/types/backend/routes/orgs/get-org/get-org-output';

@ApiTags('Orgs')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetOrgController {
  constructor(
    private tabService: TabService,
    private orgsService: OrgsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

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
      Result.bind(
        'org',
        (v): Result.ResultAsync<OrgTab, GetOrgCheckExistsResultError> =>
          this.orgsService.getOrgCheckExistsResult({ orgId: v.orgId })
      ),
      Result.andThrough(async v => {
        if (v.org.ownerId === v.userId) {
          return Result.succeed();
        }

        let userMemberEnts: MemberEnt[] =
          await this.db.drizzle.query.membersTable.findMany({
            where: eq(membersTable.memberId, v.userId)
          });

        let projectIds: string[] = userMemberEnts.map(
          userMemberEnt => userMemberEnt.projectId
        );

        let projectEnts: ProjectEnt[] =
          projectIds.length === 0
            ? []
            : await this.db.drizzle.query.projectsTable.findMany({
                where: and(
                  inArray(projectsTable.projectId, projectIds),
                  eq(projectsTable.orgId, v.orgId)
                )
              });

        return projectEnts.length === 0
          ? Result.fail({ code: 'BACKEND_FORBIDDEN_ORG' })
          : Result.succeed();
      }),
      Result.map(
        (v): ToBackendGetOrgOutput => ({
          org: this.orgsService.tabToApi({ org: v.org })
        })
      )
    );
  }
}

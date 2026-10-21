import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendGetDashboardRequestDto,
  ToBackendGetDashboardResponseDto
} from '#backend/controllers/dashboards/get-dashboard/get-dashboard.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { EnvTab, UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { QueryInfoDashboardService } from '#backend/services/query-info-dashboard/query-info-dashboard.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { GetEnvCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-env-check-exists-and-access-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';

@ApiTags('Dashboards')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetDashboardController {
  constructor(
    private sessionsService: SessionsService,
    private envsService: EnvsService,
    private queryInfoDashboardService: QueryInfoDashboardService,
    private db: DbService
  ) {}

  @Post('api/ToBackendGetDashboard' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetDashboard',
    description: 'Get a dashboard'
  })
  @ApiOkResponse({
    type: ToBackendGetDashboardResponseDto
  })
  async getDashboard(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetDashboardRequestDto
  ): Promise<BackendResultForOperation<'getDashboard'>> {
    return Result.pipe(
      Result.succeed({
        user: user,
        traceId: body.traceId,
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        dashboardId: body.input.dashboardId,
        timezone: body.input.timezone
      }),
      Result.andThrough(v =>
        this.sessionsService.checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.bind('project', v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.user.userId),
            eq(membersTable.projectId, v.projectId)
          )
        })
      ),
      Result.bind('branch', v =>
        this.db.branches.findFirstCheckExists({
          where: and(
            eq(branchesTable.projectId, v.projectId),
            eq(branchesTable.repoId, v.repoId),
            eq(branchesTable.branchId, v.branchId)
          )
        })
      ),
      Result.andThrough(async v => {
        let envAccessResult: Result.Result<
          EnvTab,
          GetEnvCheckExistsAndAccessError
        > = await this.envsService.getEnvCheckExistsAndAccess({
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        });

        if (Result.isFailure(envAccessResult)) {
          return envAccessResult;
        }

        return Result.succeed();
      }),
      Result.bind('bridge', v =>
        this.db.bridges.findFirstCheckExists({
          where: and(
            eq(bridgesTable.projectId, v.branch.projectId),
            eq(bridgesTable.repoId, v.branch.repoId),
            eq(bridgesTable.branchId, v.branch.branchId),
            eq(bridgesTable.envId, v.envId)
          )
        })
      ),
      Result.andThen(v =>
        this.queryInfoDashboardService.getDashboardData({
          traceId: v.traceId,
          user: v.user,
          userMember: v.userMember,
          project: v.project,
          bridge: v.bridge,
          projectId: v.projectId,
          repoId: v.repoId,
          envId: v.envId,
          dashboardId: v.dashboardId,
          timezone: v.timezone,
          skipUi: false
        })
      )
    );
  }
}

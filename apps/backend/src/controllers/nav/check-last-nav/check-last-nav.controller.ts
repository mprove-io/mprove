import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  type ToBackendCheckLastNavRequestDto,
  ToBackendCheckLastNavResponseDto
} from '#backend/controllers/nav/check-last-nav/check-last-nav.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { chartsTable } from '#backend/drizzle/postgres/tables/charts';
import { dashboardsTable } from '#backend/drizzle/postgres/tables/dashboards';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { modelsTable } from '#backend/drizzle/postgres/tables/models';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import { reportsTable } from '#backend/drizzle/postgres/tables/reports';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { checkRepoId } from '#backend/functions/check-repo-id/check-repo-id';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCheckLastNavOutput } from '#common/types/backend/routes/nav/check-last-nav/check-last-nav-output';

@ApiTags('Nav')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class CheckLastNavController {
  constructor(private db: DbService) {}

  @Post('api/ToBackendCheckLastNav' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CheckLastNav',
    description: 'Check if last navigated entities still exist'
  })
  @ApiOkResponse({
    type: ToBackendCheckLastNavResponseDto
  })
  async checkLastNav(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCheckLastNavRequestDto
  ): Promise<BackendResultForOperation<'checkLastNav'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        modelId: body.input.modelId,
        chartId: body.input.chartId,
        dashboardId: body.input.dashboardId,
        reportId: body.input.reportId,
        userId: user.userId
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.userId),
            eq(membersTable.projectId, v.projectId)
          )
        })
      ),
      Result.andThrough(v =>
        checkRepoId({
          repoId: v.repoId,
          userId: v.userId,
          projectId: v.projectId,
          allowProdRepo: true,
          db: this.db
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
      Result.andThrough(v =>
        getEnvCheckExistsAndAccess({
          db: this.db,
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
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
      Result.bind('isModelExist', async v =>
        isUndefined(v.modelId)
          ? Result.succeed(false)
          : this.db.models.isExist({
              where: and(
                eq(modelsTable.structId, v.bridge.structId),
                eq(modelsTable.modelId, v.modelId)
              )
            })
      ),
      Result.bind('isChartExist', async v =>
        isUndefined(v.chartId)
          ? Result.succeed(false)
          : this.db.charts.isExist({
              where: and(
                eq(chartsTable.structId, v.bridge.structId),
                eq(chartsTable.chartId, v.chartId)
              )
            })
      ),
      Result.bind('isDashboardExist', async v =>
        isUndefined(v.dashboardId)
          ? Result.succeed(false)
          : this.db.dashboards.isExist({
              where: and(
                eq(dashboardsTable.structId, v.bridge.structId),
                eq(dashboardsTable.dashboardId, v.dashboardId)
              )
            })
      ),
      Result.bind('isReportExist', async v =>
        isUndefined(v.reportId)
          ? Result.succeed(false)
          : this.db.reports.isExist({
              where: and(
                eq(reportsTable.structId, v.bridge.structId),
                eq(reportsTable.reportId, v.reportId)
              )
            })
      ),
      Result.map(
        (v): ToBackendCheckLastNavOutput => ({
          isModelExist: v.isModelExist,
          isChartExist: v.isChartExist,
          isDashboardExist: v.isDashboardExist,
          isReportExist: v.isReportExist
        })
      )
    );
  }
}

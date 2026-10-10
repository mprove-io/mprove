import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendCheckLastNavRequestDto,
  ToBackendCheckLastNavResponseDto
} from '#backend/controllers/nav/check-last-nav/check-last-nav.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BranchTab,
  BridgeTab,
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { chartsTable } from '#backend/drizzle/postgres/schema/charts';
import { dashboardsTable } from '#backend/drizzle/postgres/schema/dashboards';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { reportsTable } from '#backend/drizzle/postgres/schema/reports';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetBranchCheckExistsResultError } from '#common/types/backend/function-errors/get-branch-check-exists-result-error';
import type { GetBridgeCheckExistsResultError } from '#common/types/backend/function-errors/get-bridge-check-exists-result-error';
import type { GetMemberCheckExistsResultError } from '#common/types/backend/function-errors/get-member-check-exists-result-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCheckLastNavOutput } from '#common/types/backend/routes/nav/check-last-nav/check-last-nav-output';

@ApiTags('Nav')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class CheckLastNavController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private sessionsService: SessionsService,
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

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
        this.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsResultError> =>
          this.membersService.getMemberCheckExistsResult({
            projectId: v.projectId,
            memberId: v.userId
          })
      ),
      Result.andThrough(v =>
        this.sessionsService.checkRepoIdResult({
          repoId: v.repoId,
          userId: v.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.bind(
        'branch',
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsResultError> =>
          this.branchesService.getBranchCheckExistsResult({
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.branchId
          })
      ),
      Result.andThrough(v =>
        this.envsService.getEnvCheckExistsAndAccessResult({
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind(
        'bridge',
        (v): Result.ResultAsync<BridgeTab, GetBridgeCheckExistsResultError> =>
          this.bridgesService.getBridgeCheckExistsResult({
            projectId: v.branch.projectId,
            repoId: v.branch.repoId,
            branchId: v.branch.branchId,
            envId: v.envId
          })
      ),
      Result.bind(
        'modelExists',
        async (v): Result.ResultAsync<boolean, never> =>
          isUndefined(v.modelId)
            ? Result.succeed(false)
            : this.db.drizzle.query.modelsTable
                .findFirst({
                  where: and(
                    eq(modelsTable.structId, v.bridge.structId),
                    eq(modelsTable.modelId, v.modelId)
                  ),
                  columns: { modelId: true }
                })
                .then(modelEnt => Result.succeed(isDefined(modelEnt)))
      ),
      Result.bind(
        'chartExists',
        async (v): Result.ResultAsync<boolean, never> =>
          isUndefined(v.chartId)
            ? Result.succeed(false)
            : this.db.drizzle.query.chartsTable
                .findFirst({
                  where: and(
                    eq(chartsTable.structId, v.bridge.structId),
                    eq(chartsTable.chartId, v.chartId)
                  ),
                  columns: { chartId: true }
                })
                .then(chartEnt => Result.succeed(isDefined(chartEnt)))
      ),
      Result.bind(
        'dashboardExists',
        async (v): Result.ResultAsync<boolean, never> =>
          isUndefined(v.dashboardId)
            ? Result.succeed(false)
            : this.db.drizzle.query.dashboardsTable
                .findFirst({
                  where: and(
                    eq(dashboardsTable.structId, v.bridge.structId),
                    eq(dashboardsTable.dashboardId, v.dashboardId)
                  ),
                  columns: { dashboardId: true }
                })
                .then(dashboardEnt => Result.succeed(isDefined(dashboardEnt)))
      ),
      Result.bind(
        'reportExists',
        async (v): Result.ResultAsync<boolean, never> =>
          isUndefined(v.reportId)
            ? Result.succeed(false)
            : this.db.drizzle.query.reportsTable
                .findFirst({
                  where: and(
                    eq(reportsTable.structId, v.bridge.structId),
                    eq(reportsTable.reportId, v.reportId)
                  ),
                  columns: { reportId: true }
                })
                .then(reportEnt => Result.succeed(isDefined(reportEnt)))
      ),
      Result.map(
        (v): ToBackendCheckLastNavOutput => ({
          modelExists: v.modelExists,
          chartExists: v.chartExists,
          dashboardExists: v.dashboardExists,
          reportExists: v.reportExists
        })
      )
    );
  }
}

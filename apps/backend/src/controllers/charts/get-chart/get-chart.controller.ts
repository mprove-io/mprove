import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import {
  ToBackendGetChartRequestDto,
  ToBackendGetChartResponseDto
} from '#backend/controllers/charts/get-chart/get-chart.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  BranchTab,
  BridgeTab,
  EnvTab,
  MemberTab,
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { QueryInfoChartService } from '#backend/services/query-info-chart/query-info-chart.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { GetBranchCheckExistsError } from '#common/types/backend/function-errors/get-branch-check-exists-error';
import type { GetBridgeCheckExistsError } from '#common/types/backend/function-errors/get-bridge-check-exists-error';
import type { GetChartDataError } from '#common/types/backend/function-errors/get-chart-data-error';
import type { GetEnvCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-env-check-exists-and-access-error';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { GetProjectCheckExistsError } from '#common/types/backend/function-errors/get-project-check-exists-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetChartOutput } from '#common/types/backend/routes/charts/get-chart/get-chart-output';

@ApiTags('Charts')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetChartController {
  constructor(
    private membersService: MembersService,
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private queryInfoChartService: QueryInfoChartService
  ) {}

  @Post('api/ToBackendGetChart' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetChart',
    description: 'Get a chart'
  })
  @ApiOkResponse({
    type: ToBackendGetChartResponseDto
  })
  async getChart(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetChartRequestDto
  ): Promise<BackendResultForOperation<'getChart'>> {
    return Result.pipe(
      Result.succeed({
        user: user,
        traceId: body.traceId,
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        chartId: body.input.chartId,
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
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsError> =>
          this.projectsService.getProjectCheckExists({
            projectId: v.projectId
          })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsError> =>
          this.membersService.getMemberCheckExists({
            projectId: v.projectId,
            memberId: v.user.userId
          })
      ),
      Result.bind(
        'branch',
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsError> =>
          this.branchesService.getBranchCheckExists({
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.branchId
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
      Result.bind(
        'bridge',
        (v): Result.ResultAsync<BridgeTab, GetBridgeCheckExistsError> =>
          this.bridgesService.getBridgeCheckExists({
            projectId: v.branch.projectId,
            repoId: v.branch.repoId,
            branchId: v.branch.branchId,
            envId: v.envId
          })
      ),
      Result.andThen(
        (v): Result.ResultAsync<ToBackendGetChartOutput, GetChartDataError> =>
          this.queryInfoChartService.getChartData({
            traceId: v.traceId,
            user: v.user,
            userMember: v.userMember,
            project: v.project,
            projectId: v.projectId,
            envId: v.envId,
            structId: v.bridge.structId,
            chartId: v.chartId,
            timezone: v.timezone,
            skipUi: false
          })
      )
    );
  }
}

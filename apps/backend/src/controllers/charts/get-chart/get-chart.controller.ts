import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ToBackendGetChartRequestDto,
  ToBackendGetChartResponseDto
} from '#backend/controllers/charts/get-chart/get-chart.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { QueryInfoChartService } from '#backend/services/query-info-chart.service';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendGetChartResponsePayload } from '#common/zod/to-backend/charts/to-backend-get-chart';

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

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetChart)
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
  ) {
    let { traceId } = body.info;
    let { projectId, repoId, branchId, envId, chartId, timezone } =
      body.payload;

    let repoType = await this.sessionsService.checkRepoId({
      repoId: repoId,
      userId: user.userId,
      projectId: projectId,
      allowProdRepo: true
    });

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    let payload: ToBackendGetChartResponsePayload =
      await this.queryInfoChartService.getChartData({
        traceId: traceId,
        user: user,
        userMember: userMember,
        project: project,
        projectId: projectId,
        envId: envId,
        structId: bridge.structId,
        chartId: chartId,
        timezone: timezone,
        skipUi: false
      });

    return payload;
  }
}

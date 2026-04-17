import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { seconds, Throttle } from '@nestjs/throttler';
import {
  ToBackendGetReportRequestDto,
  ToBackendGetReportResponseDto
} from '#backend/controllers/reports/get-report/get-report.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { QueryInfoReportService } from '#backend/services/query-info-report.service';
import { THROTTLE_MULTIPLIER } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendGetReportResponsePayload } from '#common/zod/to-backend/reports/to-backend-get-report';

@ApiTags('Reports')
@UseGuards(ThrottlerUserIdGuard)
// reports.component.ts -> startCheckRunning()
@Throttle({
  '1s': {
    limit: 3 * THROTTLE_MULTIPLIER * 1.5
  },
  '5s': {
    limit: 5 * THROTTLE_MULTIPLIER * 1.5
  },
  '60s': {
    limit: (60 / 2) * THROTTLE_MULTIPLIER * 1.5
  },
  '600s': {
    limit: 10 * (60 / 2) * THROTTLE_MULTIPLIER * 1.5,
    blockDuration: seconds(12 * 60 * 60)
  }
})
@Controller()
export class GetReportController {
  constructor(
    private membersService: MembersService,
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private queryInfoReportService: QueryInfoReportService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetReport)
  @ApiOperation({
    summary: 'GetReport',
    description: 'Get a report'
  })
  @ApiOkResponse({
    type: ToBackendGetReportResponseDto
  })
  async getRep(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetReportRequestDto
  ) {
    let { traceId } = body.info;
    let {
      projectId,
      repoId,
      branchId,
      envId,
      reportId,
      timeRangeFractionBrick,
      timeSpec,
      timezone
    } = body.payload;

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

    let payload: ToBackendGetReportResponsePayload =
      await this.queryInfoReportService.getReportData({
        traceId: traceId,
        user: user,
        userMember: userMember,
        project: project,
        bridge: bridge,
        projectId: projectId,
        envId: envId,
        reportId: reportId,
        timezone: timezone,
        timeSpec: timeSpec,
        timeRangeFractionBrick: timeRangeFractionBrick,
        skipUi: false
      });

    return payload;
  }
}

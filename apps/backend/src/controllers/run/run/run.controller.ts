import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendRunRequestDto,
  ToBackendRunResponseDto
} from '#backend/controllers/run/run/run.dto';
import { RunService } from '#backend/controllers/run/run/run.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendRunResponsePayload } from '#common/zod/to-backend/run/to-backend-run';

@ApiTags('Run')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class RunController {
  constructor(private runService: RunService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendRun)
  @ApiOperation({
    summary: 'Run',
    description: 'Run dashboards, charts, and reports in batch'
  })
  @ApiOkResponse({
    type: ToBackendRunResponseDto
  })
  async run(@AttachUser() user: UserTab, @Body() body: ToBackendRunRequestDto) {
    let { traceId } = body.info;
    let {
      projectId,
      repoId,
      branchId,
      envId,
      concurrency,
      wait,
      sleep,
      dashboardIds,
      chartIds,
      noDashboards,
      noCharts,
      getDashboards,
      getCharts,
      reportIds,
      noReports,
      getReports
    } = body.payload;

    let payload: ToBackendRunResponsePayload = await this.runService.run({
      traceId: traceId,
      user: user,
      projectId: projectId,
      repoId: repoId,
      branchId: branchId,
      envId: envId,
      concurrency: concurrency,
      wait: wait,
      sleep: sleep,
      dashboardIds: dashboardIds,
      chartIds: chartIds,
      noDashboards: noDashboards,
      noCharts: noCharts,
      getDashboards: getDashboards,
      getCharts: getCharts,
      reportIds: reportIds,
      noReports: noReports,
      getReports: getReports
    });

    return payload;
  }
}

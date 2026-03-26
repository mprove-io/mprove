import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RunService } from '#backend/controllers/run/run/run.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type {
  ToBackendRunRequest,
  ToBackendRunResponsePayload
} from '#common/interfaces/to-backend/run/to-backend-run';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class RunController {
  constructor(private runService: RunService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendRun)
  async run(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendRunRequest = request.body;

    let { traceId } = reqValid.info;
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
      getCharts
    } = reqValid.payload;

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
      getCharts: getCharts
    });

    return payload;
  }
}

import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendGetStateRequestDto,
  ToBackendGetStateResponseDto
} from '#backend/controllers/state/get-state/get-state.dto';
import { GetStateService } from '#backend/controllers/state/get-state/get-state.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendGetStateResponsePayload } from '#common/zod/to-backend/state/to-backend-get-state';

@ApiTags('State')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetStateController {
  constructor(private getStateService: GetStateService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetState)
  @ApiOperation({
    summary: 'GetState',
    description:
      'Get project state for specified repository, branch and environment'
  })
  @ApiOkResponse({
    type: ToBackendGetStateResponseDto
  })
  async getState(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetStateRequestDto
  ) {
    let { traceId } = body.info;
    let {
      projectId,
      repoId,
      branchId,
      envId,
      isFetch,
      getErrors,
      getRepo,
      getRepoNodes,
      getModels,
      getDashboards,
      getCharts,
      getMetrics,
      getReports
    } = body.payload;

    let payload: ToBackendGetStateResponsePayload =
      await this.getStateService.getState({
        traceId: traceId,
        user: user,
        projectId: projectId,
        repoId: repoId,
        branchId: branchId,
        envId: envId,
        isFetch: isFetch,
        getErrors: getErrors,
        getRepo: getRepo,
        getRepoNodes: getRepoNodes,
        getModels: getModels,
        getDashboards: getDashboards,
        getCharts: getCharts,
        getMetrics: getMetrics,
        getReports: getReports
      });

    return payload;
  }
}

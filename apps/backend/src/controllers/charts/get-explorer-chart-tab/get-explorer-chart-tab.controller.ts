import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendGetExplorerChartTabRequestDto,
  ToBackendGetExplorerChartTabResponseDto
} from '#backend/controllers/charts/get-explorer-chart-tab/get-explorer-chart-tab.dto';
import { GetExplorerChartTabService } from '#backend/controllers/charts/get-explorer-chart-tab/get-explorer-chart-tab.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendGetExplorerChartTabRequestPayload } from '#common/zod/to-backend/charts/to-backend-get-explorer-chart-tab';

@ApiTags('Charts')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetExplorerChartTabController {
  constructor(private getExplorerChartTabService: GetExplorerChartTabService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetExplorerChartTab)
  @ApiOperation({
    summary: 'GetExplorerChartTab',
    description:
      'Rebuild explorer session chart (tab) against the current struct'
  })
  @ApiOkResponse({
    type: ToBackendGetExplorerChartTabResponseDto
  })
  async getExplorerChartTab(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetExplorerChartTabRequestDto
  ) {
    let { traceId } = body.info;

    let { sessionId, chartId }: ToBackendGetExplorerChartTabRequestPayload =
      body.payload;

    let payload = await this.getExplorerChartTabService.getExplorerChartTab({
      user: user,
      traceId: traceId,
      sessionId: sessionId,
      chartId: chartId
    });

    return payload;
  }
}

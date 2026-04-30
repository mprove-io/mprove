import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendOpenExplorerChartTabRequestDto,
  ToBackendOpenExplorerChartTabResponseDto
} from '#backend/controllers/explorer/open-explorer-chart-tab/open-explorer-chart-tab.dto';
import { OpenExplorerChartTabService } from '#backend/controllers/explorer/open-explorer-chart-tab/open-explorer-chart-tab.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToBackendOpenExplorerChartTabRequestPayload } from '#common/zod/to-backend/explorer/to-backend-open-explorer-chart-tab';

@ApiTags('Explorer')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class OpenExplorerChartTabController {
  constructor(
    private openExplorerChartTabService: OpenExplorerChartTabService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendOpenExplorerChartTab)
  @ApiOperation({
    summary: 'OpenExplorerChartTab',
    description:
      'Rebuild explorer session chart (tab) against the current struct'
  })
  @ApiOkResponse({
    type: ToBackendOpenExplorerChartTabResponseDto
  })
  async openExplorerChartTab(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendOpenExplorerChartTabRequestDto
  ) {
    let { traceId } = body.info;

    let { sessionId, chartId }: ToBackendOpenExplorerChartTabRequestPayload =
      body.payload;

    let payload = await this.openExplorerChartTabService.openExplorerChartTab({
      user: user,
      traceId: traceId,
      sessionId: sessionId,
      chartId: chartId
    });

    return payload;
  }
}

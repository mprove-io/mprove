import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendGetExplorerChartTabRequestDto,
  ToBackendGetExplorerChartTabResponseDto
} from '#backend/controllers/charts/get-explorer-chart-tab/get-explorer-chart-tab.dto';
import { GetExplorerChartTabService } from '#backend/controllers/charts/get-explorer-chart-tab/get-explorer-chart-tab.service';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetExplorerChartTabOutput } from '#common/types/backend/routes/charts/get-explorer-chart-tab/get-explorer-chart-tab-output';

@ApiTags('Charts')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetExplorerChartTabController {
  constructor(private getExplorerChartTabService: GetExplorerChartTabService) {}

  @Post('api/ToBackendGetExplorerChartTab' satisfies ToBackendRoute)
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
    let payload: ToBackendGetExplorerChartTabOutput =
      await this.getExplorerChartTabService.getExplorerChartTab({
        ...body.input,
        user: user,
        traceId: body.traceId
      });

    return payload;
  }
}

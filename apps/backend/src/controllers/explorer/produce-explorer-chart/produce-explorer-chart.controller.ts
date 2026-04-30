import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendProduceExplorerChartRequestDto,
  ToBackendProduceExplorerChartResponseDto
} from '#backend/controllers/explorer/produce-explorer-chart/produce-explorer-chart.dto';
import { ProduceExplorerChartService } from '#backend/controllers/explorer/produce-explorer-chart/produce-explorer-chart.service';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendProduceExplorerChartRequestPayload,
  ToBackendProduceExplorerChartResponsePayload
} from '#common/zod/to-backend/explorer/to-backend-produce-explorer-chart';

@ApiTags('Explorer')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class ProduceExplorerChartController {
  constructor(
    private produceExplorerChartService: ProduceExplorerChartService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendProduceExplorerChart)
  @ApiOperation({
    summary: 'ProduceExplorerChart',
    description: 'Producde explorer session chart from yaml'
  })
  @ApiOkResponse({
    type: ToBackendProduceExplorerChartResponseDto
  })
  async produceExplorerChart(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendProduceExplorerChartRequestDto
  ) {
    let { traceId } = body.info;
    let {
      sessionId,
      chartId,
      modelId,
      chartYaml,
      title
    }: ToBackendProduceExplorerChartRequestPayload = body.payload;

    let payload: ToBackendProduceExplorerChartResponsePayload =
      await this.produceExplorerChartService.produceExplorerChart({
        user: user,
        traceId: traceId,
        sessionId: sessionId,
        chartId: chartId,
        modelId: modelId,
        chartYaml: chartYaml,
        title: title
      });

    return payload;
  }
}

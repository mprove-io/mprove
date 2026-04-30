import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendProduceExplorerChartRequest,
  zToBackendProduceExplorerChartResponse
} from '#common/zod/to-backend/explorer/to-backend-produce-explorer-chart';

export class ToBackendProduceExplorerChartRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendProduceExplorerChartRequest })
) {}

export class ToBackendProduceExplorerChartResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendProduceExplorerChartResponse })
) {}

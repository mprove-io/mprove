import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetExplorerChartTabRequest,
  zToBackendGetExplorerChartTabResponse
} from '#common/zod/to-backend/charts/to-backend-get-explorer-chart-tab';

export class ToBackendGetExplorerChartTabRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetExplorerChartTabRequest })
) {}

export class ToBackendGetExplorerChartTabResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetExplorerChartTabResponse })
) {}

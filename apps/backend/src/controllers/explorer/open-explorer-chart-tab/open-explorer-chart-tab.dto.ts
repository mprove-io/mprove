import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendOpenExplorerChartTabRequest,
  zToBackendOpenExplorerChartTabResponse
} from '#common/zod/to-backend/explorer/to-backend-open-explorer-chart-tab';

export class ToBackendOpenExplorerChartTabRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendOpenExplorerChartTabRequest })
) {}

export class ToBackendOpenExplorerChartTabResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendOpenExplorerChartTabResponse })
) {}

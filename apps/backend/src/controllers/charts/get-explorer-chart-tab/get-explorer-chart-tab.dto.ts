import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetExplorerChartTabRequest } from '#common/zod/backend/routes/charts/get-explorer-chart-tab/get-explorer-chart-tab-request';
import { zToBackendGetExplorerChartTabResponse } from '#common/zod/backend/routes/charts/get-explorer-chart-tab/get-explorer-chart-tab-response';

export class ToBackendGetExplorerChartTabRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetExplorerChartTabRequest })
) {}

export class ToBackendGetExplorerChartTabResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetExplorerChartTabResponse })
) {}

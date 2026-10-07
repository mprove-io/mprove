import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetExplorerChartTabRequest } from '#common/types/backend/routes/charts/get-explorer-chart-tab/get-explorer-chart-tab-request';
import { zToBackendGetExplorerChartTabResponse } from '#common/types/backend/routes/charts/get-explorer-chart-tab/get-explorer-chart-tab-response';

export class ToBackendGetExplorerChartTabRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetExplorerChartTabRequest })
) {}

export class ToBackendGetExplorerChartTabResponseDto extends createBackendResponseDto(
  { schema: zToBackendGetExplorerChartTabResponse }
) {}

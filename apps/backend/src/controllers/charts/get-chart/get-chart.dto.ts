import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetChartRequest } from '#common/zod/backend/routes/charts/get-chart/get-chart-request';
import { zToBackendGetChartResponse } from '#common/zod/backend/routes/charts/get-chart/get-chart-response';

export class ToBackendGetChartRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetChartRequest })
) {}

export class ToBackendGetChartResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetChartResponse })
) {}

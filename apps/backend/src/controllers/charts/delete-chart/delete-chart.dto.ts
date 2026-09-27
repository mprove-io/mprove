import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteChartRequest } from '#common/zod/backend/routes/charts/delete-chart/delete-chart-request';
import { zToBackendDeleteChartResponse } from '#common/zod/backend/routes/charts/delete-chart/delete-chart-response';

export class ToBackendDeleteChartRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteChartRequest })
) {}

export class ToBackendDeleteChartResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteChartResponse })
) {}

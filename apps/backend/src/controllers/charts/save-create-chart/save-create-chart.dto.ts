import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSaveCreateChartRequest } from '#common/zod/backend/routes/charts/save-create-chart/save-create-chart-request';
import { zToBackendSaveCreateChartResponse } from '#common/zod/backend/routes/charts/save-create-chart/save-create-chart-response';

export class ToBackendSaveCreateChartRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveCreateChartRequest })
) {}

export class ToBackendSaveCreateChartResponseDto extends createBackendResponseDto(
  { schema: zToBackendSaveCreateChartResponse }
) {}

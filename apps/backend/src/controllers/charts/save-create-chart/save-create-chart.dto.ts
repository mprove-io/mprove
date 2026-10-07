import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendSaveCreateChartRequest } from '#common/types/backend/routes/charts/save-create-chart/save-create-chart-request';
import { zToBackendSaveCreateChartResponse } from '#common/types/backend/routes/charts/save-create-chart/save-create-chart-response';

export class ToBackendSaveCreateChartRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveCreateChartRequest })
) {}

export class ToBackendSaveCreateChartResponseDto extends createBackendResponseDto(
  { schema: zToBackendSaveCreateChartResponse }
) {}

import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteChartRequest } from '#common/types/backend/routes/charts/delete-chart/delete-chart-request';
import { zToBackendDeleteChartResponse } from '#common/types/backend/routes/charts/delete-chart/delete-chart-response';

export class ToBackendDeleteChartRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteChartRequest })
) {}

export class ToBackendDeleteChartResponseDto extends createBackendResponseDto({
  schema: zToBackendDeleteChartResponse
}) {}

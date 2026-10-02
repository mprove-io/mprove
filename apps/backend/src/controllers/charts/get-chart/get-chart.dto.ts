import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetChartRequest } from '#common/types/backend/routes/charts/get-chart/get-chart-request';
import { zToBackendGetChartResponse } from '#common/types/backend/routes/charts/get-chart/get-chart-response';

export class ToBackendGetChartRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetChartRequest })
) {}

export class ToBackendGetChartResponseDto extends createBackendResponseDto({
  schema: zToBackendGetChartResponse
}) {}

import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSaveModifyChartRequest } from '#common/types/backend/routes/charts/save-modify-chart/save-modify-chart-request';
import { zToBackendSaveModifyChartResponse } from '#common/types/backend/routes/charts/save-modify-chart/save-modify-chart-response';

export class ToBackendSaveModifyChartRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveModifyChartRequest })
) {}

export class ToBackendSaveModifyChartResponseDto extends createBackendResponseDto(
  { schema: zToBackendSaveModifyChartResponse }
) {}

import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateDraftChartRequest } from '#common/types/backend/routes/charts/create-draft-chart/create-draft-chart-request';
import { zToBackendCreateDraftChartResponse } from '#common/types/backend/routes/charts/create-draft-chart/create-draft-chart-response';

export class ToBackendCreateDraftChartRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateDraftChartRequest })
) {}

export class ToBackendCreateDraftChartResponseDto extends createBackendResponseDto(
  { schema: zToBackendCreateDraftChartResponse }
) {}

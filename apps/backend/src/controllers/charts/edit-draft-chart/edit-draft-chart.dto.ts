import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendEditDraftChartRequest } from '#common/types/backend/routes/charts/edit-draft-chart/edit-draft-chart-request';
import { zToBackendEditDraftChartResponse } from '#common/types/backend/routes/charts/edit-draft-chart/edit-draft-chart-response';

export class ToBackendEditDraftChartRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditDraftChartRequest })
) {}

export class ToBackendEditDraftChartResponseDto extends createBackendResponseDto(
  { schema: zToBackendEditDraftChartResponse }
) {}

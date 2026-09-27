import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateDraftChartRequest } from '#common/zod/backend/routes/charts/create-draft-chart/create-draft-chart-request';
import { zToBackendCreateDraftChartResponse } from '#common/zod/backend/routes/charts/create-draft-chart/create-draft-chart-response';

export class ToBackendCreateDraftChartRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateDraftChartRequest })
) {}

export class ToBackendCreateDraftChartResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateDraftChartResponse })
) {}

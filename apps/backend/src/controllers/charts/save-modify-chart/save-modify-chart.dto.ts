import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSaveModifyChartRequest } from '#common/zod/backend/routes/charts/save-modify-chart/save-modify-chart-request';
import { zToBackendSaveModifyChartResponse } from '#common/zod/backend/routes/charts/save-modify-chart/save-modify-chart-response';

export class ToBackendSaveModifyChartRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveModifyChartRequest })
) {}

export class ToBackendSaveModifyChartResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveModifyChartResponse })
) {}

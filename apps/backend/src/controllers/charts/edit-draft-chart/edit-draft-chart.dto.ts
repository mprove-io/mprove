import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendEditDraftChartRequest } from '#common/zod/backend/routes/charts/edit-draft-chart/edit-draft-chart-request';
import { zToBackendEditDraftChartResponse } from '#common/zod/backend/routes/charts/edit-draft-chart/edit-draft-chart-response';

export class ToBackendEditDraftChartRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditDraftChartRequest })
) {}

export class ToBackendEditDraftChartResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditDraftChartResponse })
) {}

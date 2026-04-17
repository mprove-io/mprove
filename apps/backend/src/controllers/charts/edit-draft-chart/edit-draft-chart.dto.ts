import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendEditDraftChartRequest,
  zToBackendEditDraftChartResponse
} from '#common/zod/to-backend/charts/to-backend-edit-draft-chart';

export class ToBackendEditDraftChartRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditDraftChartRequest })
) {}

export class ToBackendEditDraftChartResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditDraftChartResponse })
) {}

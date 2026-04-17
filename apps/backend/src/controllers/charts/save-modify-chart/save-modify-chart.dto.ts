import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendSaveModifyChartRequest,
  zToBackendSaveModifyChartResponse
} from '#common/zod/to-backend/charts/to-backend-save-modify-chart';

export class ToBackendSaveModifyChartRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveModifyChartRequest })
) {}

export class ToBackendSaveModifyChartResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveModifyChartResponse })
) {}

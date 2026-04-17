import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendSaveCreateChartRequest,
  zToBackendSaveCreateChartResponse
} from '#common/zod/to-backend/charts/to-backend-save-create-chart';

export class ToBackendSaveCreateChartRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveCreateChartRequest })
) {}

export class ToBackendSaveCreateChartResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveCreateChartResponse })
) {}

import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendDeleteChartRequest,
  zToBackendDeleteChartResponse
} from '#common/zod/to-backend/charts/to-backend-delete-chart';

export class ToBackendDeleteChartRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteChartRequest })
) {}

export class ToBackendDeleteChartResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteChartResponse })
) {}

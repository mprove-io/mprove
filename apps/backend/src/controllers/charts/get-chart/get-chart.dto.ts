import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetChartRequest,
  zToBackendGetChartResponse
} from '#common/zod/to-backend/charts/to-backend-get-chart';

export class ToBackendGetChartRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetChartRequest })
) {}

export class ToBackendGetChartResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetChartResponse })
) {}

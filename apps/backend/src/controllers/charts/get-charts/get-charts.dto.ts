import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetChartsRequest,
  zToBackendGetChartsResponse
} from '#common/zod/to-backend/charts/to-backend-get-charts';

export class ToBackendGetChartsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetChartsRequest })
) {}

export class ToBackendGetChartsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetChartsResponse })
) {}

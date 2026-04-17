import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGroupMetricByDimensionRequest,
  zToBackendGroupMetricByDimensionResponse
} from '#common/zod/to-backend/mconfigs/to-backend-group-metric-by-dimension';

export class ToBackendGroupMetricByDimensionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGroupMetricByDimensionRequest })
) {}

export class ToBackendGroupMetricByDimensionResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGroupMetricByDimensionResponse })
) {}

import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGroupMetricByDimensionRequest } from '#common/zod/backend/routes/mconfigs/group-metric-by-dimension/group-metric-by-dimension-request';
import { zToBackendGroupMetricByDimensionResponse } from '#common/zod/backend/routes/mconfigs/group-metric-by-dimension/group-metric-by-dimension-response';

export class ToBackendGroupMetricByDimensionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGroupMetricByDimensionRequest })
) {}

export class ToBackendGroupMetricByDimensionResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGroupMetricByDimensionResponse })
) {}

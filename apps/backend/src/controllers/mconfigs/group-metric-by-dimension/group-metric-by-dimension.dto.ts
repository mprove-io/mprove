import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGroupMetricByDimensionRequest } from '#common/types/backend/routes/mconfigs/group-metric-by-dimension/group-metric-by-dimension-request';
import { zToBackendGroupMetricByDimensionResponse } from '#common/types/backend/routes/mconfigs/group-metric-by-dimension/group-metric-by-dimension-response';

export class ToBackendGroupMetricByDimensionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGroupMetricByDimensionRequest })
) {}

export class ToBackendGroupMetricByDimensionResponseDto extends createBackendResponseDto(
  { schema: zToBackendGroupMetricByDimensionResponse }
) {}

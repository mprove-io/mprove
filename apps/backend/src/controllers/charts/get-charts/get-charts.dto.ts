import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetChartsRequest } from '#common/zod/backend/routes/charts/get-charts/get-charts-request';
import { zToBackendGetChartsResponse } from '#common/zod/backend/routes/charts/get-charts/get-charts-response';

export class ToBackendGetChartsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetChartsRequest })
) {}

export class ToBackendGetChartsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetChartsResponse })
) {}

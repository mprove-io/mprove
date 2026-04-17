import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetDashboardsRequest,
  zToBackendGetDashboardsResponse
} from '#common/zod/to-backend/dashboards/to-backend-get-dashboards';

export class ToBackendGetDashboardsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetDashboardsRequest })
) {}

export class ToBackendGetDashboardsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetDashboardsResponse })
) {}

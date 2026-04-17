import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetDashboardRequest,
  zToBackendGetDashboardResponse
} from '#common/zod/to-backend/dashboards/to-backend-get-dashboard';

export class ToBackendGetDashboardRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetDashboardRequest })
) {}

export class ToBackendGetDashboardResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetDashboardResponse })
) {}

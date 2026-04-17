import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendDeleteDashboardRequest,
  zToBackendDeleteDashboardResponse
} from '#common/zod/to-backend/dashboards/to-backend-delete-dashboard';

export class ToBackendDeleteDashboardRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteDashboardRequest })
) {}

export class ToBackendDeleteDashboardResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteDashboardResponse })
) {}

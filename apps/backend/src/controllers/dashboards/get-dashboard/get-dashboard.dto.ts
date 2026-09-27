import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetDashboardRequest } from '#common/zod/backend/routes/dashboards/get-dashboard/get-dashboard-request';
import { zToBackendGetDashboardResponse } from '#common/zod/backend/routes/dashboards/get-dashboard/get-dashboard-response';

export class ToBackendGetDashboardRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetDashboardRequest })
) {}

export class ToBackendGetDashboardResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetDashboardResponse })
) {}

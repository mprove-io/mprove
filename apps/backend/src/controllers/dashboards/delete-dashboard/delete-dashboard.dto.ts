import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteDashboardRequest } from '#common/zod/backend/routes/dashboards/delete-dashboard/delete-dashboard-request';
import { zToBackendDeleteDashboardResponse } from '#common/zod/backend/routes/dashboards/delete-dashboard/delete-dashboard-response';

export class ToBackendDeleteDashboardRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteDashboardRequest })
) {}

export class ToBackendDeleteDashboardResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteDashboardResponse })
) {}

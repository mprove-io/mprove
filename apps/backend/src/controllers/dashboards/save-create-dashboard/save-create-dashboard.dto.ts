import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSaveCreateDashboardRequest } from '#common/zod/backend/routes/dashboards/save-create-dashboard/save-create-dashboard-request';
import { zToBackendSaveCreateDashboardResponse } from '#common/zod/backend/routes/dashboards/save-create-dashboard/save-create-dashboard-response';

export class ToBackendSaveCreateDashboardRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveCreateDashboardRequest })
) {}

export class ToBackendSaveCreateDashboardResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveCreateDashboardResponse })
) {}

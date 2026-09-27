import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSaveModifyDashboardRequest } from '#common/zod/backend/routes/dashboards/save-modify-dashboard/save-modify-dashboard-request';
import { zToBackendSaveModifyDashboardResponse } from '#common/zod/backend/routes/dashboards/save-modify-dashboard/save-modify-dashboard-response';

export class ToBackendSaveModifyDashboardRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveModifyDashboardRequest })
) {}

export class ToBackendSaveModifyDashboardResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveModifyDashboardResponse })
) {}

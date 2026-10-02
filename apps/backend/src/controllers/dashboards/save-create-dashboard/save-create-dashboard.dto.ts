import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSaveCreateDashboardRequest } from '#common/types/backend/routes/dashboards/save-create-dashboard/save-create-dashboard-request';
import { zToBackendSaveCreateDashboardResponse } from '#common/types/backend/routes/dashboards/save-create-dashboard/save-create-dashboard-response';

export class ToBackendSaveCreateDashboardRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveCreateDashboardRequest })
) {}

export class ToBackendSaveCreateDashboardResponseDto extends createBackendResponseDto(
  { schema: zToBackendSaveCreateDashboardResponse }
) {}

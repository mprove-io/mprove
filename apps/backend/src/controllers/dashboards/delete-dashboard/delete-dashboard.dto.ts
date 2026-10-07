import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendDeleteDashboardRequest } from '#common/types/backend/routes/dashboards/delete-dashboard/delete-dashboard-request';
import { zToBackendDeleteDashboardResponse } from '#common/types/backend/routes/dashboards/delete-dashboard/delete-dashboard-response';

export class ToBackendDeleteDashboardRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteDashboardRequest })
) {}

export class ToBackendDeleteDashboardResponseDto extends createBackendResponseDto(
  { schema: zToBackendDeleteDashboardResponse }
) {}

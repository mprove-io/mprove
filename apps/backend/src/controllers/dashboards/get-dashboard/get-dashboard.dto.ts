import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetDashboardRequest } from '#common/zod/backend/routes/dashboards/get-dashboard/get-dashboard-request';
import { zToBackendGetDashboardResponse } from '#common/zod/backend/routes/dashboards/get-dashboard/get-dashboard-response';

export class ToBackendGetDashboardRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetDashboardRequest })
) {}

export class ToBackendGetDashboardResponseDto extends createBackendResponseDto({
  schema: zToBackendGetDashboardResponse
}) {}

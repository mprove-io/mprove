import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetDashboardsRequest } from '#common/types/backend/routes/dashboards/get-dashboards/get-dashboards-request';
import { zToBackendGetDashboardsResponse } from '#common/types/backend/routes/dashboards/get-dashboards/get-dashboards-response';

export class ToBackendGetDashboardsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetDashboardsRequest })
) {}

export class ToBackendGetDashboardsResponseDto extends createBackendResponseDto(
  { schema: zToBackendGetDashboardsResponse }
) {}

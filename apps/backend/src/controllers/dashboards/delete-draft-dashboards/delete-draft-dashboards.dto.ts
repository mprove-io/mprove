import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteDraftDashboardsRequest } from '#common/types/backend/routes/dashboards/delete-draft-dashboards/delete-draft-dashboards-request';
import { zToBackendDeleteDraftDashboardsResponse } from '#common/types/backend/routes/dashboards/delete-draft-dashboards/delete-draft-dashboards-response';

export class ToBackendDeleteDraftDashboardsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteDraftDashboardsRequest })
) {}

export class ToBackendDeleteDraftDashboardsResponseDto extends createBackendResponseDto(
  { schema: zToBackendDeleteDraftDashboardsResponse }
) {}

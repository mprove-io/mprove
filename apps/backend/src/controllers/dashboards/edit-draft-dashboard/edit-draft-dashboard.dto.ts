import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendEditDraftDashboardRequest } from '#common/types/backend/routes/dashboards/edit-draft-dashboard/edit-draft-dashboard-request';
import { zToBackendEditDraftDashboardResponse } from '#common/types/backend/routes/dashboards/edit-draft-dashboard/edit-draft-dashboard-response';

export class ToBackendEditDraftDashboardRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditDraftDashboardRequest })
) {}

export class ToBackendEditDraftDashboardResponseDto extends createBackendResponseDto(
  { schema: zToBackendEditDraftDashboardResponse }
) {}

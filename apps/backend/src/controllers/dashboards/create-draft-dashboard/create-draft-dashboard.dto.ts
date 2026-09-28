import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateDraftDashboardRequest } from '#common/zod/backend/routes/dashboards/create-draft-dashboard/create-draft-dashboard-request';
import { zToBackendCreateDraftDashboardResponse } from '#common/zod/backend/routes/dashboards/create-draft-dashboard/create-draft-dashboard-response';

export class ToBackendCreateDraftDashboardRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateDraftDashboardRequest })
) {}

export class ToBackendCreateDraftDashboardResponseDto extends createBackendResponseDto(
  { schema: zToBackendCreateDraftDashboardResponse }
) {}

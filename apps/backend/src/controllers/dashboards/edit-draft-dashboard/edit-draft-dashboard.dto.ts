import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendEditDraftDashboardRequest } from '#common/zod/backend/routes/dashboards/edit-draft-dashboard/edit-draft-dashboard-request';
import { zToBackendEditDraftDashboardResponse } from '#common/zod/backend/routes/dashboards/edit-draft-dashboard/edit-draft-dashboard-response';

export class ToBackendEditDraftDashboardRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditDraftDashboardRequest })
) {}

export class ToBackendEditDraftDashboardResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditDraftDashboardResponse })
) {}

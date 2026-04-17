import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendEditDraftDashboardRequest,
  zToBackendEditDraftDashboardResponse
} from '#common/zod/to-backend/dashboards/to-backend-edit-draft-dashboard';

export class ToBackendEditDraftDashboardRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditDraftDashboardRequest })
) {}

export class ToBackendEditDraftDashboardResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditDraftDashboardResponse })
) {}

import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendCreateDraftDashboardRequest,
  zToBackendCreateDraftDashboardResponse
} from '#common/zod/to-backend/dashboards/to-backend-create-draft-dashboard';

export class ToBackendCreateDraftDashboardRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateDraftDashboardRequest })
) {}

export class ToBackendCreateDraftDashboardResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateDraftDashboardResponse })
) {}

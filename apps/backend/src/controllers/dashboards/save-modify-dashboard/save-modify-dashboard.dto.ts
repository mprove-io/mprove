import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendSaveModifyDashboardRequest,
  zToBackendSaveModifyDashboardResponse
} from '#common/zod/to-backend/dashboards/to-backend-save-modify-dashboard';

export class ToBackendSaveModifyDashboardRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveModifyDashboardRequest })
) {}

export class ToBackendSaveModifyDashboardResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveModifyDashboardResponse })
) {}

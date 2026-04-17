import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendSaveCreateDashboardRequest,
  zToBackendSaveCreateDashboardResponse
} from '#common/zod/to-backend/dashboards/to-backend-save-create-dashboard';

export class ToBackendSaveCreateDashboardRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveCreateDashboardRequest })
) {}

export class ToBackendSaveCreateDashboardResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveCreateDashboardResponse })
) {}

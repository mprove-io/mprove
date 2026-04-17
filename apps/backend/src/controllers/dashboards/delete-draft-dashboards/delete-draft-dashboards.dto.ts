import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendDeleteDraftDashboardsRequest,
  zToBackendDeleteDraftDashboardsResponse
} from '#common/zod/to-backend/dashboards/to-backend-delete-draft-dashboards';

export class ToBackendDeleteDraftDashboardsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteDraftDashboardsRequest })
) {}

export class ToBackendDeleteDraftDashboardsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteDraftDashboardsResponse })
) {}

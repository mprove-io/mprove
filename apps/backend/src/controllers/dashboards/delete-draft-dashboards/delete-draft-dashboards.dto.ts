import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteDraftDashboardsRequest } from '#common/zod/backend/routes/dashboards/delete-draft-dashboards/delete-draft-dashboards-request';
import { zToBackendDeleteDraftDashboardsResponse } from '#common/zod/backend/routes/dashboards/delete-draft-dashboards/delete-draft-dashboards-response';

export class ToBackendDeleteDraftDashboardsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteDraftDashboardsRequest })
) {}

export class ToBackendDeleteDraftDashboardsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteDraftDashboardsResponse })
) {}

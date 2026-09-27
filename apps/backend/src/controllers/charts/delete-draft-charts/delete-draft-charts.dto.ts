import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteDraftChartsRequest } from '#common/zod/backend/routes/charts/delete-draft-charts/delete-draft-charts-request';
import { zToBackendDeleteDraftChartsResponse } from '#common/zod/backend/routes/charts/delete-draft-charts/delete-draft-charts-response';

export class ToBackendDeleteDraftChartsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteDraftChartsRequest })
) {}

export class ToBackendDeleteDraftChartsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteDraftChartsResponse })
) {}

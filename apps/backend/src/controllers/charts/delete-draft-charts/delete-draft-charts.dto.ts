import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendDeleteDraftChartsRequest } from '#common/types/backend/routes/charts/delete-draft-charts/delete-draft-charts-request';
import { zToBackendDeleteDraftChartsResponse } from '#common/types/backend/routes/charts/delete-draft-charts/delete-draft-charts-response';

export class ToBackendDeleteDraftChartsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteDraftChartsRequest })
) {}

export class ToBackendDeleteDraftChartsResponseDto extends createBackendResponseDto(
  { schema: zToBackendDeleteDraftChartsResponse }
) {}

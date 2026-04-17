import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendDeleteDraftChartsRequest,
  zToBackendDeleteDraftChartsResponse
} from '#common/zod/to-backend/charts/to-backend-delete-draft-charts';

export class ToBackendDeleteDraftChartsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteDraftChartsRequest })
) {}

export class ToBackendDeleteDraftChartsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteDraftChartsResponse })
) {}

import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendCreateDraftChartRequest,
  zToBackendCreateDraftChartResponse
} from '#common/zod/to-backend/charts/to-backend-create-draft-chart';

export class ToBackendCreateDraftChartRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateDraftChartRequest })
) {}

export class ToBackendCreateDraftChartResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateDraftChartResponse })
) {}

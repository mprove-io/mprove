import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetReportsRequest,
  zToBackendGetReportsResponse
} from '#common/zod/to-backend/reports/to-backend-get-reports';

export class ToBackendGetReportsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetReportsRequest })
) {}

export class ToBackendGetReportsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetReportsResponse })
) {}

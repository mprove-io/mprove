import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetReportsRequest } from '#common/zod/backend/routes/reports/get-reports/get-reports-request';
import { zToBackendGetReportsResponse } from '#common/zod/backend/routes/reports/get-reports/get-reports-response';

export class ToBackendGetReportsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetReportsRequest })
) {}

export class ToBackendGetReportsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetReportsResponse })
) {}

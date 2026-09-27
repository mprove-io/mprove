import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteReportRequest } from '#common/zod/backend/routes/reports/delete-report/delete-report-request';
import { zToBackendDeleteReportResponse } from '#common/zod/backend/routes/reports/delete-report/delete-report-response';

export class ToBackendDeleteReportRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteReportRequest })
) {}

export class ToBackendDeleteReportResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteReportResponse })
) {}

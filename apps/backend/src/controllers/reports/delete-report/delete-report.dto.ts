import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendDeleteReportRequest } from '#common/types/backend/routes/reports/delete-report/delete-report-request';
import { zToBackendDeleteReportResponse } from '#common/types/backend/routes/reports/delete-report/delete-report-response';

export class ToBackendDeleteReportRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteReportRequest })
) {}

export class ToBackendDeleteReportResponseDto extends createBackendResponseDto({
  schema: zToBackendDeleteReportResponse
}) {}

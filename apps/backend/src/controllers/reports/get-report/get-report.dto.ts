import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetReportRequest } from '#common/zod/backend/routes/reports/get-report/get-report-request';
import { zToBackendGetReportResponse } from '#common/zod/backend/routes/reports/get-report/get-report-response';

export class ToBackendGetReportRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetReportRequest })
) {}

export class ToBackendGetReportResponseDto extends createBackendResponseDto({
  schema: zToBackendGetReportResponse
}) {}

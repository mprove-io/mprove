import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetReportRequest } from '#common/types/backend/routes/reports/get-report/get-report-request';
import { zToBackendGetReportResponse } from '#common/types/backend/routes/reports/get-report/get-report-response';

export class ToBackendGetReportRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetReportRequest })
) {}

export class ToBackendGetReportResponseDto extends createBackendResponseDto({
  schema: zToBackendGetReportResponse
}) {}

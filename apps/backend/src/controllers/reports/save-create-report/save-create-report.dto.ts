import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendSaveCreateReportRequest } from '#common/types/backend/routes/reports/save-create-report/save-create-report-request';
import { zToBackendSaveCreateReportResponse } from '#common/types/backend/routes/reports/save-create-report/save-create-report-response';

export class ToBackendSaveCreateReportRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveCreateReportRequest })
) {}

export class ToBackendSaveCreateReportResponseDto extends createBackendResponseDto(
  { schema: zToBackendSaveCreateReportResponse }
) {}

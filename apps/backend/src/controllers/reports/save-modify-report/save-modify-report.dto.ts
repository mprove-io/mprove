import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendSaveModifyReportRequest } from '#common/types/backend/routes/reports/save-modify-report/save-modify-report-request';
import { zToBackendSaveModifyReportResponse } from '#common/types/backend/routes/reports/save-modify-report/save-modify-report-response';

export class ToBackendSaveModifyReportRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveModifyReportRequest })
) {}

export class ToBackendSaveModifyReportResponseDto extends createBackendResponseDto(
  { schema: zToBackendSaveModifyReportResponse }
) {}

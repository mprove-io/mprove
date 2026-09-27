import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSaveModifyReportRequest } from '#common/zod/backend/routes/reports/save-modify-report/save-modify-report-request';
import { zToBackendSaveModifyReportResponse } from '#common/zod/backend/routes/reports/save-modify-report/save-modify-report-response';

export class ToBackendSaveModifyReportRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveModifyReportRequest })
) {}

export class ToBackendSaveModifyReportResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveModifyReportResponse })
) {}

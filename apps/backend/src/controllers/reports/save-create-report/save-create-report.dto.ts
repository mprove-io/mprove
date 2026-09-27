import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSaveCreateReportRequest } from '#common/zod/backend/routes/reports/save-create-report/save-create-report-request';
import { zToBackendSaveCreateReportResponse } from '#common/zod/backend/routes/reports/save-create-report/save-create-report-response';

export class ToBackendSaveCreateReportRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveCreateReportRequest })
) {}

export class ToBackendSaveCreateReportResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveCreateReportResponse })
) {}

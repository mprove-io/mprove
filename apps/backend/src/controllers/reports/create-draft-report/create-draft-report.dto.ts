import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateDraftReportRequest } from '#common/zod/backend/routes/reports/create-draft-report/create-draft-report-request';
import { zToBackendCreateDraftReportResponse } from '#common/zod/backend/routes/reports/create-draft-report/create-draft-report-response';

export class ToBackendCreateDraftReportRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateDraftReportRequest })
) {}

export class ToBackendCreateDraftReportResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateDraftReportResponse })
) {}

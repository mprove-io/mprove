import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendEditDraftReportRequest } from '#common/zod/backend/routes/reports/edit-draft-report/edit-draft-report-request';
import { zToBackendEditDraftReportResponse } from '#common/zod/backend/routes/reports/edit-draft-report/edit-draft-report-response';

export class ToBackendEditDraftReportRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditDraftReportRequest })
) {}

export class ToBackendEditDraftReportResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditDraftReportResponse })
) {}

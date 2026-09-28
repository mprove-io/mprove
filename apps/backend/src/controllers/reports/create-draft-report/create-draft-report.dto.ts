import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateDraftReportRequest } from '#common/zod/backend/routes/reports/create-draft-report/create-draft-report-request';
import { zToBackendCreateDraftReportResponse } from '#common/zod/backend/routes/reports/create-draft-report/create-draft-report-response';

export class ToBackendCreateDraftReportRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateDraftReportRequest })
) {}

export class ToBackendCreateDraftReportResponseDto extends createBackendResponseDto(
  { schema: zToBackendCreateDraftReportResponse }
) {}

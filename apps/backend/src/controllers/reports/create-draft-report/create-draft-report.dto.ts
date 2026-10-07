import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendCreateDraftReportRequest } from '#common/types/backend/routes/reports/create-draft-report/create-draft-report-request';
import { zToBackendCreateDraftReportResponse } from '#common/types/backend/routes/reports/create-draft-report/create-draft-report-response';

export class ToBackendCreateDraftReportRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateDraftReportRequest })
) {}

export class ToBackendCreateDraftReportResponseDto extends createBackendResponseDto(
  { schema: zToBackendCreateDraftReportResponse }
) {}

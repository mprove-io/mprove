import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendCreateDraftReportRequest,
  zToBackendCreateDraftReportResponse
} from '#common/zod/to-backend/reports/to-backend-create-draft-report';

export class ToBackendCreateDraftReportRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateDraftReportRequest })
) {}

export class ToBackendCreateDraftReportResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateDraftReportResponse })
) {}

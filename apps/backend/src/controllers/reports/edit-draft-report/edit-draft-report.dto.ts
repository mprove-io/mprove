import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendEditDraftReportRequest,
  zToBackendEditDraftReportResponse
} from '#common/zod/to-backend/reports/to-backend-edit-draft-report';

export class ToBackendEditDraftReportRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditDraftReportRequest })
) {}

export class ToBackendEditDraftReportResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendEditDraftReportResponse })
) {}

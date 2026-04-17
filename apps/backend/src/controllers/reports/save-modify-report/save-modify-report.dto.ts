import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendSaveModifyReportRequest,
  zToBackendSaveModifyReportResponse
} from '#common/zod/to-backend/reports/to-backend-save-modify-report';

export class ToBackendSaveModifyReportRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveModifyReportRequest })
) {}

export class ToBackendSaveModifyReportResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveModifyReportResponse })
) {}

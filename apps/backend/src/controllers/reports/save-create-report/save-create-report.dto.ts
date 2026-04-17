import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendSaveCreateReportRequest,
  zToBackendSaveCreateReportResponse
} from '#common/zod/to-backend/reports/to-backend-save-create-report';

export class ToBackendSaveCreateReportRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveCreateReportRequest })
) {}

export class ToBackendSaveCreateReportResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveCreateReportResponse })
) {}

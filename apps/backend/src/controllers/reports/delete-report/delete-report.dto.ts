import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendDeleteReportRequest,
  zToBackendDeleteReportResponse
} from '#common/zod/to-backend/reports/to-backend-delete-report';

export class ToBackendDeleteReportRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteReportRequest })
) {}

export class ToBackendDeleteReportResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteReportResponse })
) {}

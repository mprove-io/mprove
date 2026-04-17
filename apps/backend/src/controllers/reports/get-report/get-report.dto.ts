import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetReportRequest,
  zToBackendGetReportResponse
} from '#common/zod/to-backend/reports/to-backend-get-report';

export class ToBackendGetReportRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetReportRequest })
) {}

export class ToBackendGetReportResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetReportResponse })
) {}

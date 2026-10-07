import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetReportsRequest } from '#common/types/backend/routes/reports/get-reports/get-reports-request';
import { zToBackendGetReportsResponse } from '#common/types/backend/routes/reports/get-reports/get-reports-response';

export class ToBackendGetReportsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetReportsRequest })
) {}

export class ToBackendGetReportsResponseDto extends createBackendResponseDto({
  schema: zToBackendGetReportsResponse
}) {}

import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendRunRequest } from '#common/zod/backend/routes/run/run/run-request';
import { zToBackendRunResponse } from '#common/zod/backend/routes/run/run/run-response';

export class ToBackendRunRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRunRequest })
) {}

export class ToBackendRunResponseDto extends createBackendResponseDto({
  schema: zToBackendRunResponse
}) {}

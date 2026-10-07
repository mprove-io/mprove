import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendRunRequest } from '#common/types/backend/routes/run/run/run-request';
import { zToBackendRunResponse } from '#common/types/backend/routes/run/run/run-response';

export class ToBackendRunRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRunRequest })
) {}

export class ToBackendRunResponseDto extends createBackendResponseDto({
  schema: zToBackendRunResponse
}) {}

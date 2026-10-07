import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetStateRequest } from '#common/types/backend/routes/state/get-state/get-state-request';
import { zToBackendGetStateResponse } from '#common/types/backend/routes/state/get-state/get-state-response';

export class ToBackendGetStateRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetStateRequest })
) {}

export class ToBackendGetStateResponseDto extends createBackendResponseDto({
  schema: zToBackendGetStateResponse
}) {}

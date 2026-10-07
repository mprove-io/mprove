import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetSessionRequest } from '#common/types/backend/routes/sessions/get-session/get-session-request';
import { zToBackendGetSessionResponse } from '#common/types/backend/routes/sessions/get-session/get-session-response';

export class ToBackendGetSessionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetSessionRequest })
) {}

export class ToBackendGetSessionResponseDto extends createBackendResponseDto({
  schema: zToBackendGetSessionResponse
}) {}

import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteSessionRequest } from '#common/zod/backend/routes/sessions/delete-session/delete-session-request';
import { zToBackendDeleteSessionResponse } from '#common/zod/backend/routes/sessions/delete-session/delete-session-response';

export class ToBackendDeleteSessionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteSessionRequest })
) {}

export class ToBackendDeleteSessionResponseDto extends createBackendResponseDto(
  { schema: zToBackendDeleteSessionResponse }
) {}

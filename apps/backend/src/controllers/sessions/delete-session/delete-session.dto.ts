import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendDeleteSessionRequest } from '#common/types/backend/routes/sessions/delete-session/delete-session-request';
import { zToBackendDeleteSessionResponse } from '#common/types/backend/routes/sessions/delete-session/delete-session-response';

export class ToBackendDeleteSessionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteSessionRequest })
) {}

export class ToBackendDeleteSessionResponseDto extends createBackendResponseDto(
  { schema: zToBackendDeleteSessionResponse }
) {}

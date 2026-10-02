import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendArchiveSessionRequest } from '#common/types/backend/routes/sessions/archive-session/archive-session-request';
import { zToBackendArchiveSessionResponse } from '#common/types/backend/routes/sessions/archive-session/archive-session-response';

export class ToBackendArchiveSessionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendArchiveSessionRequest })
) {}

export class ToBackendArchiveSessionResponseDto extends createBackendResponseDto(
  { schema: zToBackendArchiveSessionResponse }
) {}

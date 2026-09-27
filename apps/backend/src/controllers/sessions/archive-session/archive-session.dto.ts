import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendArchiveSessionRequest } from '#common/zod/backend/routes/sessions/archive-session/archive-session-request';
import { zToBackendArchiveSessionResponse } from '#common/zod/backend/routes/sessions/archive-session/archive-session-response';

export class ToBackendArchiveSessionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendArchiveSessionRequest })
) {}

export class ToBackendArchiveSessionResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendArchiveSessionResponse })
) {}

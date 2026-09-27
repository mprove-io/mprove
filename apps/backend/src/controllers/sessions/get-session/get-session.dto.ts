import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetSessionRequest } from '#common/zod/backend/routes/sessions/get-session/get-session-request';
import { zToBackendGetSessionResponse } from '#common/zod/backend/routes/sessions/get-session/get-session-response';

export class ToBackendGetSessionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetSessionRequest })
) {}

export class ToBackendGetSessionResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetSessionResponse })
) {}

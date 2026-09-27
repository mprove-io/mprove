import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteSessionRequest } from '#common/zod/backend/routes/sessions/delete-session/delete-session-request';
import { zToBackendDeleteSessionResponse } from '#common/zod/backend/routes/sessions/delete-session/delete-session-response';

export class ToBackendDeleteSessionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteSessionRequest })
) {}

export class ToBackendDeleteSessionResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteSessionResponse })
) {}

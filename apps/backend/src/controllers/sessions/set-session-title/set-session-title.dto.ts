import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSetSessionTitleRequest } from '#common/types/backend/routes/sessions/set-session-title/set-session-title-request';
import { zToBackendSetSessionTitleResponse } from '#common/types/backend/routes/sessions/set-session-title/set-session-title-response';

export class ToBackendSetSessionTitleRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetSessionTitleRequest })
) {}

export class ToBackendSetSessionTitleResponseDto extends createBackendResponseDto(
  { schema: zToBackendSetSessionTitleResponse }
) {}

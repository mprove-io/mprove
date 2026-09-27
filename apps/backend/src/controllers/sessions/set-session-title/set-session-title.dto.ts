import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSetSessionTitleRequest } from '#common/zod/backend/routes/sessions/set-session-title/set-session-title-request';
import { zToBackendSetSessionTitleResponse } from '#common/zod/backend/routes/sessions/set-session-title/set-session-title-response';

export class ToBackendSetSessionTitleRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetSessionTitleRequest })
) {}

export class ToBackendSetSessionTitleResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSetSessionTitleResponse })
) {}

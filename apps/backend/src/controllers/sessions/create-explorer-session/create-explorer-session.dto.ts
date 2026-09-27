import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateExplorerSessionRequest } from '#common/zod/backend/routes/sessions/create-explorer-session/create-explorer-session-request';
import { zToBackendCreateExplorerSessionResponse } from '#common/zod/backend/routes/sessions/create-explorer-session/create-explorer-session-response';

export class ToBackendCreateExplorerSessionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateExplorerSessionRequest })
) {}

export class ToBackendCreateExplorerSessionResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateExplorerSessionResponse })
) {}

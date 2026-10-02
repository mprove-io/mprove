import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateExplorerSessionRequest } from '#common/types/backend/routes/sessions/create-explorer-session/create-explorer-session-request';
import { zToBackendCreateExplorerSessionResponse } from '#common/types/backend/routes/sessions/create-explorer-session/create-explorer-session-response';

export class ToBackendCreateExplorerSessionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateExplorerSessionRequest })
) {}

export class ToBackendCreateExplorerSessionResponseDto extends createBackendResponseDto(
  { schema: zToBackendCreateExplorerSessionResponse }
) {}

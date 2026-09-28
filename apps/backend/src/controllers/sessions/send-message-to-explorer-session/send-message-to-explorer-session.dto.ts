import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSendMessageToExplorerSessionRequest } from '#common/zod/backend/routes/sessions/send-message-to-explorer-session/send-message-to-explorer-session-request';
import { zToBackendSendMessageToExplorerSessionResponse } from '#common/zod/backend/routes/sessions/send-message-to-explorer-session/send-message-to-explorer-session-response';

export class ToBackendSendMessageToExplorerSessionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSendMessageToExplorerSessionRequest })
) {}

export class ToBackendSendMessageToExplorerSessionResponseDto extends createBackendResponseDto(
  { schema: zToBackendSendMessageToExplorerSessionResponse }
) {}

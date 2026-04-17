import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendSendMessageToExplorerSessionRequest,
  zToBackendSendMessageToExplorerSessionResponse
} from '#common/zod/to-backend/sessions/to-backend-send-message-to-explorer-session';

export class ToBackendSendMessageToExplorerSessionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSendMessageToExplorerSessionRequest })
) {}

export class ToBackendSendMessageToExplorerSessionResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSendMessageToExplorerSessionResponse })
) {}

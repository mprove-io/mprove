import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendSendMessageToEditorSessionRequest,
  zToBackendSendMessageToEditorSessionResponse
} from '#common/zod/to-backend/sessions/to-backend-send-message-to-editor-session';

export class ToBackendSendMessageToEditorSessionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSendMessageToEditorSessionRequest })
) {}

export class ToBackendSendMessageToEditorSessionResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSendMessageToEditorSessionResponse })
) {}

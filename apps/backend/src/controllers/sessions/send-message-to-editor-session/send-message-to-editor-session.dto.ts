import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSendMessageToEditorSessionRequest } from '#common/zod/backend/routes/sessions/send-message-to-editor-session/send-message-to-editor-session-request';
import { zToBackendSendMessageToEditorSessionResponse } from '#common/zod/backend/routes/sessions/send-message-to-editor-session/send-message-to-editor-session-response';

export class ToBackendSendMessageToEditorSessionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSendMessageToEditorSessionRequest })
) {}

export class ToBackendSendMessageToEditorSessionResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSendMessageToEditorSessionResponse })
) {}

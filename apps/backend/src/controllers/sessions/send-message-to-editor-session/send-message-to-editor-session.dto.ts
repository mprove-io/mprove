import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSendMessageToEditorSessionRequest } from '#common/types/backend/routes/sessions/send-message-to-editor-session/send-message-to-editor-session-request';
import { zToBackendSendMessageToEditorSessionResponse } from '#common/types/backend/routes/sessions/send-message-to-editor-session/send-message-to-editor-session-response';

export class ToBackendSendMessageToEditorSessionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSendMessageToEditorSessionRequest })
) {}

export class ToBackendSendMessageToEditorSessionResponseDto extends createBackendResponseDto(
  { schema: zToBackendSendMessageToEditorSessionResponse }
) {}

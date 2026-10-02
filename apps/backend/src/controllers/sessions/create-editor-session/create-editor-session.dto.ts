import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateEditorSessionRequest } from '#common/types/backend/routes/sessions/create-editor-session/create-editor-session-request';
import { zToBackendCreateEditorSessionResponse } from '#common/types/backend/routes/sessions/create-editor-session/create-editor-session-response';

export class ToBackendCreateEditorSessionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateEditorSessionRequest })
) {}

export class ToBackendCreateEditorSessionResponseDto extends createBackendResponseDto(
  { schema: zToBackendCreateEditorSessionResponse }
) {}

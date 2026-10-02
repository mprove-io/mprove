import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendPauseEditorSessionRequest } from '#common/types/backend/routes/sessions/pause-editor-session/pause-editor-session-request';
import { zToBackendPauseEditorSessionResponse } from '#common/types/backend/routes/sessions/pause-editor-session/pause-editor-session-response';

export class ToBackendPauseEditorSessionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendPauseEditorSessionRequest })
) {}

export class ToBackendPauseEditorSessionResponseDto extends createBackendResponseDto(
  { schema: zToBackendPauseEditorSessionResponse }
) {}

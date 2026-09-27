import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendPauseEditorSessionRequest } from '#common/zod/backend/routes/sessions/pause-editor-session/pause-editor-session-request';
import { zToBackendPauseEditorSessionResponse } from '#common/zod/backend/routes/sessions/pause-editor-session/pause-editor-session-response';

export class ToBackendPauseEditorSessionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendPauseEditorSessionRequest })
) {}

export class ToBackendPauseEditorSessionResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendPauseEditorSessionResponse })
) {}

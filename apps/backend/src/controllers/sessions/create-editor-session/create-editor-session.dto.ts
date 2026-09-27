import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateEditorSessionRequest } from '#common/zod/backend/routes/sessions/create-editor-session/create-editor-session-request';
import { zToBackendCreateEditorSessionResponse } from '#common/zod/backend/routes/sessions/create-editor-session/create-editor-session-response';

export class ToBackendCreateEditorSessionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateEditorSessionRequest })
) {}

export class ToBackendCreateEditorSessionResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateEditorSessionResponse })
) {}

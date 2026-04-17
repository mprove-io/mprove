import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendPauseEditorSessionRequest,
  zToBackendPauseEditorSessionResponse
} from '#common/zod/to-backend/sessions/to-backend-pause-editor-session';

export class ToBackendPauseEditorSessionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendPauseEditorSessionRequest })
) {}

export class ToBackendPauseEditorSessionResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendPauseEditorSessionResponse })
) {}

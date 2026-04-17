import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendCreateEditorSessionRequest,
  zToBackendCreateEditorSessionResponse
} from '#common/zod/to-backend/sessions/to-backend-create-editor-session';

export class ToBackendCreateEditorSessionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateEditorSessionRequest })
) {}

export class ToBackendCreateEditorSessionResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateEditorSessionResponse })
) {}

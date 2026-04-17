import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendArchiveSessionRequest,
  zToBackendArchiveSessionResponse
} from '#common/zod/to-backend/sessions/to-backend-archive-session';

export class ToBackendArchiveSessionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendArchiveSessionRequest })
) {}

export class ToBackendArchiveSessionResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendArchiveSessionResponse })
) {}

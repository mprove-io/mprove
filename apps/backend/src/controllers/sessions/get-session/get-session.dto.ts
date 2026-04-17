import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetSessionRequest,
  zToBackendGetSessionResponse
} from '#common/zod/to-backend/sessions/to-backend-get-session';

export class ToBackendGetSessionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetSessionRequest })
) {}

export class ToBackendGetSessionResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetSessionResponse })
) {}

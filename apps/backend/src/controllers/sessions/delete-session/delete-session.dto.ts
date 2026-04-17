import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendDeleteSessionRequest,
  zToBackendDeleteSessionResponse
} from '#common/zod/to-backend/sessions/to-backend-delete-session';

export class ToBackendDeleteSessionRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteSessionRequest })
) {}

export class ToBackendDeleteSessionResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteSessionResponse })
) {}
